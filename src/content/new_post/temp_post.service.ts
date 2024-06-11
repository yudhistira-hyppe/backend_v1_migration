import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { tempposts, temppostsDocument } from './schemas/tempPost.schema';
import { PostContentService } from '../posts/postcontent.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateNewPostDTO, PostResponseApps, PostData, Avatar, Metadata, TagPeople, Cat, Privacy, GetcontenteventsDto, CreatePostResponse, Messages } from './dto/create-newPost.dto';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { GetusercontentsService } from 'src/trans/getusercontents/getusercontents.service';
import { PostchallengeService } from 'src/trans/postchallenge/postchallenge.service';
import { UserchallengesService } from 'src/trans/userchallenges/userchallenges.service';
import { Userchallenges } from 'src/trans/userchallenges/schemas/userchallenges.schema';
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { pipeline } from 'stream';
import { CreateUserplaylistDto } from 'src/trans/userplaylist/dto/create-userplaylist.dto';
import { NewPostService } from './new_post.service';
import { MediastreamingAgoraService } from '../mediastreaming/mediastreamingagora.service';

@Injectable()
export class TempPOSTService {
    private readonly logger = new Logger(TempPOSTService.name);

    constructor(
        @InjectModel(tempposts.name, 'SERVER_FULL')
        private readonly loaddata: Model<temppostsDocument>,
        private readonly postContentService: PostContentService,
        private readonly newPostService: NewPostService,
        private readonly utilService: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly errorHandler: ErrorHandler,
        private readonly basic2SS: UserbasicnewService,
        private readonly contentEventService: ContenteventsService,
        private readonly musicSS: MediamusicService,
        private readonly loadApsara: GetusercontentsService,
        private readonly postchallengeService: PostchallengeService,
        private readonly userchallengesService: UserchallengesService,
        private readonly utilsService: UtilsService,
        private readonly disquslogsService: DisquslogsService,
        private readonly disqusService: DisqusService,
        private readonly mediastreamingAgoraService: MediastreamingAgoraService,
    ) { }

    async create(CreatePostsDto: tempposts): Promise<tempposts> {
        const createPostsDto = await this.loaddata.create(CreatePostsDto);
        return createPostsDto;
    }

    async duplicatedata(CreatePostsDto: tempposts, id: string, target: string) {
        let result = null;
        if (target == 'create') {
            var mongo = require('mongoose');
            var getpost = await this.newPostService.findOne(CreatePostsDto.postID.toString());
            console.log(getpost);
            var getcreator = await this.basic2SS.findBymail(getpost.email.toString());
            var insertdata = new tempposts;
            insertdata = JSON.parse(JSON.stringify(getpost));
            insertdata.tag2 = [];
            var urlLink = null;
            var judulLink = null;

            try {
                urlLink = getpost.urlLink;
                insertdata.urlLink = getpost.urlLink;
            } catch (e) {
                insertdata.urlLink = null;
            }
            try {
                judulLink = getpost.judulLink;
                insertdata.judulLink = getpost.judulLink;
            } catch (e) {
                insertdata.judulLink = null;
            }
            insertdata.userProfile = { "$ref": "userbasics", "$id": new mongoose.Types.ObjectId(getcreator._id.toString()), "$db": "hyppe_trans_db" };
            if (getpost.musicId != null && getpost.musicId != undefined) {
                insertdata.musicId = new mongo.Types.ObjectId(getpost.musicId.toString());
            }
            if (getpost.category.length != 0) {
                insertdata.category = getpost.category;
            }

            if (CreatePostsDto.tagPeople != null && CreatePostsDto.tagPeople != undefined) {
                if (CreatePostsDto.tagPeople.length != 0) {
                    var getlistuser = CreatePostsDto.tagPeople;
                    var dummyuser = [];
                    var dummytag2 = [];

                    for (var i = 0; i < getlistuser.length; i++) {
                        dummyuser.push(getlistuser[i].username);
                        dummytag2.push(
                            {
                                username: getlistuser[i].username
                            }
                        );
                    }

                    insertdata.tagPeople = dummyuser;
                    insertdata.tag2 = dummytag2;
                }
            }

            insertdata.contentModeration = getpost.contentModeration;
            insertdata.contentModerationDate = getpost.contentModerationDate;
            insertdata.contentModerationResponse = getpost.contentModerationResponse;
            insertdata.moderationReason = getpost.moderationReason;
            insertdata.reportedStatus = getpost.reportedStatus;

            // console.log(CreatePostsDto);
            result = await this.loaddata.create(insertdata);
        }
        else {
            let result = await this.loaddata.findByIdAndUpdate(id, CreatePostsDto, { new: true });

            if (!result) {
                throw new Error('Data is not found!');
            }
        }
    }

    async findByPostId(postID: string): Promise<tempposts> {
        return this.loaddata.findOne({ postID: postID }).exec();
    }

    async updateByPostId(body: any, headers: any, data_userbasics: Userbasicnew) {
        let findData = await this.findByPostId(body.postID);
        if (findData) {
            let result = await this.updatePost(body, headers, data_userbasics);
            return result;
        } else {
            let res = new CreatePostResponse();
            res.response_code = 204;
            let msg = new Messages();
            msg.info = ["Post ID not found in tempPosts, skipping update"];
            res.messages = msg;
            res.data = {};
            return res;
        }
    }

    async updateByPostIdv2(
        postID: string,
        CreateNewPostDTO: tempposts,
    ): Promise<Object> {
        return await this.loaddata.updateOne(
            { postID: postID },
            CreateNewPostDTO
        );
    }

    async updatePost(body: any, headers: any, data_userbasics: Userbasicnew): Promise<CreatePostResponse> {
        this.logger.log('updateTempPost >>> start: ' + JSON.stringify(body));
        var res = new CreatePostResponse();
        res.response_code = 204;

        // var token = headers['x-auth-token'];
        // var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        // var profile = await this.basic2SS.findBymail(auth.email);
        // if (profile == undefined) {
        //   let msg = new Messages();
        //   msg.info = ["Email unknown"];
        //   res.messages = msg;
        //   return res;
        // }

        // let opost = await this.findByPostId(body.postID);

        if (body.certified && body.certified == "true") {
            if (data_userbasics.isIdVerified != true) {
                let msg = new Messages();
                msg.info = ["The user ID has not been verified"];
                res.messages = msg;
                return res;
            }
        }



        let post = await this.buildUpdatePost(body, headers);
        let apost = await this.loaddata.create(post);

        // if (body.certified && body.certified == true) {
        //   console.log("post cert: " + opost.certified);
        //   if (opost.certified == undefined || opost.certified == false) {
        //     console.log(body.certified)
        //     console.log("---------------------------------------------------XXX 3---------------------------------------------------")
        //     this.generateCertificate(String(post.postID), 'id', apost, data_userbasics);
        //   }
        // }

        // let cm = post.contentMedias[0];

        // let updatePl = new CreateUserplaylistDto();
        // updatePl.userPostId = Object(data_userbasics._id.toString());
        // updatePl.mediaId = Object(cm.oid);
        // updatePl.postType = apost.postType;
        //this.postService.updateGenerateUserPlaylist_(updatePl);

        res.response_code = 202;
        let msg = new Messages();
        msg.info = ["The process was successful"];
        res.messages = msg;
        var pd = new PostData();
        pd.postID = String(apost.postID);
        pd.email = String(apost.email);

        return res;
    }

    private async buildUpdatePost(body: any, headers: any) {
        this.logger.log('buildPost >>> start');
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var profile = await this.basic2SS.findBymail(auth.email);
        this.logger.log('buildPost >>> profile: ' + profile.email);

        let post = await this.findByPostId(body.postID);
        post.updatedAt = await this.utilService.getDateTimeString();
        // let isShared = null;

        if (body.description != undefined) {
            post.description = body.description;
        }

        if (body.isShared != undefined) {
            post.isShared = body.isShared;
        } else {
            post.isShared = true;
        }

        if (body.tags != undefined && (String(body.tags).length > 0)) {
            var obj = body.tags;
            //var tgs = obj.split(",");
            post.tags = obj;
        }



        if (body.visibility != undefined) {
            post.visibility = body.visibility;
        } else {
            post.visibility = 'PUBLIC';
        }

        if (body.location != undefined) {
            post.location = body.location;
        }

        if (body.lat != undefined) {
            post.lat = body.lat;
        }

        if (body.lon != undefined) {
            post.lon = body.lon;
        }

        if (body.saleAmount != undefined) {
            post.saleAmount = body.saleAmount;
        } else {
            post.saleAmount = null;
        }

        if (body.saleLike != undefined) {
            post.saleLike = body.saleLike;
        } else {
            post.saleLike = false;
        }

        if (body.saleView != undefined) {
            post.saleView = body.saleView;
        } else {
            post.saleView = false;
        }

        if (body.allowComments != undefined) {
            post.allowComments = body.allowComments;
        } else {
            post.allowComments = true;
        }

        if (body.isSafe != undefined) {
            post.isSafe = body.isSafe;
        } else {
            post.isSafe = false;
        }

        if (body.isOwned != undefined) {
            post.isOwned = body.isOwned;
        } else {
            post.isOwned = false;
        }

        if (body.active != undefined) {
            post.active = body.active;
        }


        if (body.cats != undefined && body.cats.length > 1) {
            var obj = body.cats;
            var cats = obj.split(",");

            var pcats = [];
            for (var i = 0; i < cats.length; i++) {
                var tmp = cats[i];
                // var cat = await this.interestService.findByName(tmp);
                if (tmp != undefined) {
                    var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(tmp), "$db": "hyppe_infra_db" };
                    pcats.push(objintr);
                }
            }
            post.category = pcats;
        }

        // if (body.tagPeople != undefined && body.tagPeople.length > 1) {
        //   var obj = body.tagPeople;
        //   var cats = obj.split(",");
        //   var pcats = [];
        //   for (var i = 0; i < cats.length; i++) {
        //     var tmp = cats[i];
        //     var tp = await this.userAuthService.findOneUsername(tmp);
        //     if (await this.utilService.ceckData(tp)) {
        //       if (tp != undefined) {
        //         var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
        //         pcats.push(objintr);
        //       }
        //     }
        //   }
        //   post.tagPeople = pcats;
        // }

        if (body.tagPeople != undefined && body.tagPeople.length > 1) {
            var obj = body.tagPeople;
            var cats = obj.split(",");
            var pcats = [];
            var ptag2 = [];
            for (var i = 0; i < cats.length; i++) {
                var tmp = cats[i];
                var tp = await this.basic2SS.findOneUsername(tmp);
                if (await this.utilService.ceckData(tp)) {
                    if (tp.username != undefined) {
                        // var objintr_ = new mongoose.Types.ObjectId(tp._id);
                        let em = String(tp.username);
                        let bodyi = em + ' Menandai kamu di ';
                        let bodye = em + ' Tagged you in ';
                        if (post.postType == 'pict') {
                            bodyi = bodyi + ' HyppePic';
                            bodye = bodye + ' HyppePic';
                        } else if (post.postType == 'vid') {
                            bodyi = bodyi + ' HyppeVideo';
                            bodye = bodye + ' HyppeVideo';
                        } else if (post.postType == 'diary') {
                            bodyi = bodyi + ' HyppeDiary';
                            bodye = bodye + ' HyppeDiary';
                        } else if (post.postType == 'story') {
                            bodyi = bodyi + ' HyppeStory';
                            bodye = bodye + ' HyppeStory';
                        }
                        console.log(tp.email.toString());
                        console.log(body.postID);
                        console.log(post.postType.toString());
                        // this.utilService.sendFcmV2(tp.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID, post.postType.toString());
                        pcats.push(tp.username);
                        ptag2.push(
                            {
                                _id: tp._id,
                                username: tp.username
                            }
                        );
                    }
                }
            }
            post.tagPeople = pcats;
            post.tag2 = ptag2;
        }

        // if (body.tagDescription != undefined && body.tagDescription.length > 0) {
        //   var obj = body.tagDescription;
        //   var cats = obj.split(",");
        //   var pcats = [];
        //   for (var i = 0; i < cats.length; i++) {
        //     var tmp = cats[i];
        //     var tp = await this.userAuthService.findOneUsername(tmp);
        //     if (await this.utilService.ceckData(tp)) {
        //       if (tp != undefined) {
        //         var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
        //         pcats.push(objintrx);
        //       }
        //     }
        //   }
        //   post.tagDescription = pcats;
        // }

        if (body.tagDescription != undefined && body.tagDescription.length > 0) {
            var obj = body.tagDescription;
            var cats = obj.split(",");
            var pcats = [];
            for (var i = 0; i < cats.length; i++) {
                var tmp = cats[i];
                var tp = await this.basic2SS.findOneUsername(tmp);
                if (await this.utilService.ceckData(tp)) {
                    if (tp != undefined || tp != null) {
                        var objintrx = new mongoose.Types.ObjectId(tp._id);
                        let em = String(tp.username);
                        let bodyi = em + ' Menandai kamu di ';
                        let bodye = em + ' Tagged you in ';
                        if (post.postType == 'pict') {
                            bodyi = bodyi + ' HyppePic';
                            bodye = bodye + ' HyppePic';
                        } else if (post.postType == 'vid') {
                            bodyi = bodyi + ' HyppeVideo';
                            bodye = bodye + ' HyppeVideo';
                        } else if (post.postType == 'diary') {
                            bodyi = bodyi + ' HyppeDiary';
                            bodye = bodye + ' HyppeDiary';
                        } else if (post.postType == 'story') {
                            bodyi = bodyi + ' HyppeStory';
                            bodye = bodye + ' HyppeStory';
                        }
                        console.log(tp.email.toString());
                        console.log(body.postID);
                        console.log(post.postType.toString());
                        // this.utilService.sendFcmV2(tp.email.toString(), auth.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID, post.postType.toString())
                        pcats.push(objintrx);
                    }
                }
            }
            post.tagDescription = pcats;
        }

        if (body.certified != undefined) {
            post.certified = <boolean>body.certified;
        } else {
            post.certified = false;
        }

        return post;
    }

    async landingPagebaru(email: string, type: string, skip: number, limit: number) {
        const dataStream = await this.mediastreamingAgoraService.getChannelList();
        let statusSream = false;
        if (dataStream != null) {
            let dataChannel = dataStream.data.channels;
            if (dataChannel.length > 0) {
                statusSream = true;
            }
        }
        var pipeline = [];

        pipeline.push(
            {
                '$set': {
                    statusSream: statusSream
                }
            },
            {
                '$set': {
                    timeStart: {
                        '$concat': [
                            {
                                '$dateToString': {
                                    format: '%Y-%m-%d',
                                    date: new Date()
                                }
                            },
                            ' ',
                            {
                                '$arrayElemAt': ['$boosted.boostSession.timeStart', 0]
                            }
                        ]
                    }
                }
            },
            {
                '$set': {
                    timeEnd: {
                        '$concat': [
                            {
                                '$dateToString': {
                                    format: '%Y-%m-%d',
                                    date: new Date()
                                }
                            },
                            ' ',
                            {
                                '$arrayElemAt': ['$boosted.boostSession.timeEnd', 0]
                            }
                        ]
                    }
                }
            },
            {
                '$set': {
                    testDate: {
                        '$dateToString': {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: {
                                '$add': [new Date(), 25200000]
                            }
                        }
                    }
                }
            },
        );

        if (type == "pict") {
            pipeline.push(
                {
                    '$match': {
                        '$or': [
                            {
                                '$and': [
                                    {
                                        '$expr': {
                                            '$gte': ['$createdAt', '2022-01-09 00:57:28']
                                        }
                                    },
                                    {
                                        reportedStatus: {
                                            '$ne': 'OWNED'
                                        }
                                    },
                                    {
                                        visibility: 'PUBLIC'
                                    },
                                    {
                                        active: true
                                    },
                                    {
                                        postType: "pict"
                                    },
                                    {
                                        '$expr': {
                                            '$lte': [
                                                {
                                                    '$arrayElemAt': ['$boosted.boostSession.start', 0]
                                                },
                                                '$testDate'
                                            ]
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$gt': [
                                                {
                                                    '$arrayElemAt': ['$boosted.boostSession.end', 0]
                                                },
                                                '$testDate'
                                            ]
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$lte': ['$timeStart', '$testDate']
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$gt': ['$timeEnd', '$testDate']
                                        }
                                    },
                                    {
                                        timeStart: {
                                            '$ne': null
                                        }
                                    },
                                    {
                                        timeEnd: {
                                            '$ne': null
                                        }
                                    },
                                    {
                                        '$or': [
                                            {
                                                reportedUser: {
                                                    '$elemMatch': {
                                                        email: email,
                                                        active: false
                                                    }
                                                }
                                            },
                                            {
                                                'reportedUser.email': {
                                                    '$not': {
                                                        '$regex': email
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        '$or': [
                                            {
                                                'boosted.boostViewer': {
                                                    '$elemMatch': {
                                                        email: email,
                                                        isLast: true,
                                                        timeEnd: {
                                                            '$lte': {
                                                                '$add': [new Date(), 25200000]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                '$and': [
                                                    {
                                                        'boosted.boostViewer.email': {
                                                            '$ne': email
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                '$and': [
                                    {
                                        reportedStatus: {
                                            '$ne': 'OWNED'
                                        }
                                    },
                                    {
                                        visibility: 'PUBLIC'
                                    },
                                    {
                                        active: true
                                    },
                                    {
                                        postType: "pict"
                                    },
                                    {
                                        timeStart: null
                                    },
                                    {
                                        '$or': [
                                            {
                                                reportedUser: {
                                                    '$elemMatch': {
                                                        email: email,
                                                        active: false
                                                    }
                                                }
                                            },
                                            {
                                                'reportedUser.email': {
                                                    '$not': {
                                                        '$regex': email
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
            );
        }
        else if (type == "vid") {
            pipeline.push(
                {
                    '$match': {
                        '$or': [
                            {
                                '$and': [
                                    {
                                        '$expr': {
                                            '$gte': ['$createdAt', '2022-01-09 00:57:28']
                                        }
                                    },
                                    {
                                        reportedStatus: {
                                            '$ne': 'OWNED'
                                        }
                                    },
                                    {
                                        visibility: 'PUBLIC'
                                    },
                                    {
                                        active: true
                                    },
                                    {
                                        postType: {
                                            '$in': ['vid', 'diary']
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$lte': [
                                                {
                                                    '$arrayElemAt': ['$boosted.boostSession.start', 0]
                                                },
                                                '$testDate'
                                            ]
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$gt': [
                                                {
                                                    '$arrayElemAt': ['$boosted.boostSession.end', 0]
                                                },
                                                '$testDate'
                                            ]
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$lte': ['$timeStart', '$testDate']
                                        }
                                    },
                                    {
                                        '$expr': {
                                            '$gt': ['$timeEnd', '$testDate']
                                        }
                                    },
                                    {
                                        timeStart: {
                                            '$ne': null
                                        }
                                    },
                                    {
                                        timeEnd: {
                                            '$ne': null
                                        }
                                    },
                                    {
                                        '$or': [
                                            {
                                                reportedUser: {
                                                    '$elemMatch': {
                                                        email: email,
                                                        active: false
                                                    }
                                                }
                                            },
                                            {
                                                'reportedUser.email': {
                                                    '$not': {
                                                        '$regex': email
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        '$or': [
                                            {
                                                'boosted.boostViewer': {
                                                    '$elemMatch': {
                                                        email: email,
                                                        isLast: true,
                                                        timeEnd: {
                                                            '$lte': {
                                                                '$add': [new Date(), 25200000]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                '$and': [
                                                    {
                                                        'boosted.boostViewer.email': {
                                                            '$ne': email
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                '$and': [
                                    {
                                        reportedStatus: {
                                            '$ne': 'OWNED'
                                        }
                                    },
                                    {
                                        visibility: 'PUBLIC'
                                    },
                                    {
                                        active: true
                                    },
                                    {
                                        postType: {
                                            '$in': ['vid', 'diary']
                                        }
                                    },
                                    {
                                        timeStart: null
                                    },
                                    {
                                        '$or': [
                                            {
                                                reportedUser: {
                                                    '$elemMatch': {
                                                        email: email,
                                                        active: false
                                                    }
                                                }
                                            },
                                            {
                                                'reportedUser.email': {
                                                    '$not': {
                                                        '$regex': email
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
            );
        }

        pipeline.push(
            {
                '$set': {
                    selfContents: {
                        '$cond': {
                            if: {
                                '$and': [
                                    {
                                        '$eq': ['$email', email]
                                    },
                                    {
                                        '$gt': [
                                            '$createdAt',
                                            {
                                                '$dateToString': {
                                                    format: '%Y-%m-%d %H:%M:%S',
                                                    date: {
                                                        '$add': [new Date(), - 30600000]
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            {
                '$set': {
                    kancuts: {
                        '$concatArrays': ['$viewer', [email]]
                    }
                }
            },
            {
                '$set': {
                    tagPeople: "$tag2"
                }
            },
            {
                '$set': {
                    mailViewer: {
                        '$filter': {
                            input: '$kancuts',
                            cond: {
                                '$eq': ['$$this', email]
                            }
                        }
                    }
                }
            },
            {
                '$set': {
                    dodolCount: {
                        '$filter': {
                            input: '$kancuts',
                            cond: {
                                '$eq': ['$$this', email]
                            }
                        }
                    }
                }
            },
            {
                '$set': {
                    viewerCounts: {
                        '$cond': {
                            if: {
                                '$isArray': '$dodolCount'
                            },
                            then: {
                                '$size': '$dodolCount'
                            },
                            else: 1
                        }
                    }
                }
            },
            {
                '$sort': {
                    viewerCounts: 1,
                    selfContents: - 1,
                    isBoost: - 1,
                    createdAt: - 1
                }
            },
            {
                '$skip': (limit * skip)
            },
            {
                '$limit': limit
            },
            {
                '$lookup': {
                    from: 'disquslogs',
                    let: {
                        localID: '$postID'
                    },
                    as: 'comment',
                    pipeline: [
                        {
                            '$match': {
                                '$and': [
                                    {
                                        '$expr': {
                                            '$eq': ['$postID', '$$localID']
                                        }
                                    },
                                    {
                                        active: {
                                            '$ne': false
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newUserBasics',
                                as: 'userComment',
                                let: {
                                    localID: '$sender'
                                },
                                pipeline: [
                                    {
                                        '$match': {
                                            '$expr': {
                                                '$eq': ['$email', '$$localID']
                                            }
                                        }
                                    },
                                    {
                                        '$project': {
                                            username: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind': {
                                path: '$userComment'
                            }
                        },
                        {
                            '$sort': {
                                createdAt: - 1
                            }
                        }
                    ]
                }
            },
            {
                '$lookup': {
                    from: 'friend_list',
                    as: 'friend',
                    let: {
                        localID: '$email',
                        user: email
                    },
                    pipeline: [
                        {
                            '$match': {
                                '$or': [
                                    {
                                        '$and': [
                                            {
                                                '$expr': {
                                                    '$eq': ['$email', '$$localID']
                                                }
                                            },
                                            {
                                                'friendlist.email': email
                                            }
                                        ]
                                    },
                                    {
                                        '$and': [
                                            {
                                                email: email
                                            },
                                            {
                                                '$expr': {
                                                    '$eq': ['$friendlist.email', '$$localID']
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            '$project': {
                                email: 1,
                                friend: {
                                    '$cond': {
                                        if: {
                                            '$gt': [{
                                                '$size': '$friendlist'
                                            }, 0]
                                        },
                                        then: 1,
                                        else: 0
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            {
                '$lookup': {
                    from: 'newUserBasics',
                    as: 'userBasic',
                    let: {
                        localID: '$email'
                    },
                    pipeline: [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': ['$email', '$$localID']
                                }
                            }
                        }
                    ]
                }
            },
            {
                '$lookup': {
                    from: 'newUserBasics',
                    as: 'userInt',
                    let: {
                        localID: email,
                        int: '$category'
                    },
                    pipeline: [
                        {
                            '$match': {
                                '$and': [
                                    {
                                        '$expr': {
                                            '$eq': ['$email', '$$localID']
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$project': {
                                userInterests: '$userInterests.$id'
                            }
                        }
                    ]
                }
            },
            {
                '$set': {
                    categoryInt: '$category.$id'
                }
            },
            {
                '$set': {
                    intScore: {
                        '$filter': {
                            input: {
                                '$arrayElemAt': ['$userInt.userInterests', 0]
                            },
                            as: 'nonok',
                            cond: {
                                '$in': ['$$nonok', '$categoryInt']
                            }
                        }
                    }
                }
            },
            {
                '$lookup': {
                    from: 'mediamusic',
                    as: 'music',
                    let: {
                        localID: '$musicId'
                    },
                    pipeline: [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            '$project': {
                                _id: 1,
                                musicTitle: 1,
                                artistName: 1,
                                albumName: 1,
                                apsaraMusic: 1,
                                apsaraThumnail: 1,
                                genre: '$genre.name',
                                theme: '$theme.name',
                                mood: '$mood.name'
                            }
                        },
                        {
                            '$unwind': {
                                path: '$genre',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            '$unwind': {
                                path: '$theme',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            '$unwind': {
                                path: '$mood',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ]
                }
            },
            //{
            //  '$lookup': {
            //    from: 'newUserBasics',
            //    as: 'userTag',
            //    let: { localID: { '$ifNull': [ '$tagPeople', [] ] } },
            //    pipeline: [
            //      {
            //        '$match': {
            //          '$or': [
            //            { '$expr': { '$in': [ '$_id', '$$localID' ] } },
            //            { '$expr': { '$in': [ '$_idAuth', '$$localID.$id' ] } }
            //          ]
            //        }
            //      },
            //      { '$project': { _id: 1, username: 1 } }
            //    ]
            //  }
            //},
            {
                '$lookup': {
                    from: 'settings',
                    as: 'setting',
                    pipeline: [
                        {
                            '$match': {
                                '$or': [
                                    {
                                        _id: new ObjectId("62bbdb4ba7520000050077a7")
                                    },
                                    {
                                        _id: new ObjectId("64d06e5c451e0000bd006c62")
                                    },
                                    {
                                        _id: new ObjectId("645da79c295b0000520048c2")
                                    },
                                    {
                                        _id: new ObjectId("64e5a637227b0000d00057b8")
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                '$set': {
                    tutor: {
                        '$ifNull': [{
                            '$arrayElemAt': ['$userBasic.tutor', 0]
                        }, []]
                    }
                }
            },
            {
                "$lookup": {
                    from: "mediastreaming",
                    as: "stream",
                    let: {
                        localID: true
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$status', '$$localID']
                                }
                            }
                        },
                        {
                            $limit: 1,
                        },
                        {
                            $project: {
                                status: 1,
                            }
                        },

                    ]
                }
            },
            {
                '$project': {
                    _id: 1,
                    mediaSource: 1, 
                    streamer: "$statusSream",
                    // streamer: {
                    //     $cond: {
                    //         if: {
                    //             $eq: [{ $ifNull: ["$stream", []] }, []]
                    //         },
                    //         then: false,
                    //         else: true
                    //     }
                    // },
                    version: {
                        '$arrayElemAt': ['$setting.value', 0]
                    },
                    versionIos: {
                        '$arrayElemAt': ['$setting.value', 1]
                    },
                    limitLandingpage: {
                        '$arrayElemAt': ['$setting.value', 2]
                    },
                    postID: 1,
                    musicTitle: {
                        '$arrayElemAt': ['$music.musicTitle', 0]
                    },
                    artistName: {
                        '$arrayElemAt': ['$music.artistName', 0]
                    },
                    albumName: {
                        '$arrayElemAt': ['$music.albumName', 0]
                    },
                    apsaraMusic: {
                        '$arrayElemAt': ['$music.apsaraMusic', 0]
                    },
                    apsaraThumnail: {
                        '$arrayElemAt': ['$music.apsaraThumnail', 0]
                    },
                    genre: {
                        '$arrayElemAt': ['$music.genre', 0]
                    },
                    theme: {
                        '$arrayElemAt': ['$music.theme', 0]
                    },
                    mood: {
                        '$arrayElemAt': ['$music.mood', 0]
                    },
                    tagPeople: '$tagPeople',
                    mediaType: 1,
                    urlLink: 1,
                    judulLink: 1,
                    postType: 1,
                    description: 1,
                    active: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    expiration: 1,
                    visibility: 1,
                    location: 1,
                    tags: 1,
                    allowComments: 1,
                    isSafe: 1,
                    isOwned: 1,
                    certified: 1,
                    // saleAmount: 1,
                    saleAmount: 
                    {
                        "$cond":
                        {
                            "if":
                            {
                                "$lt":
                                [
                                    "$updatedAt", '2024-05-27'
                                ]
                            },
                            "then":
                            {
                                "$toInt":
                                {
                                    "$divide":
                                    [
                                        "$saleAmount", 100
                                    ]
                                }
                            },
                            "else":"$saleAmount"
                        }
                    },
                    saleLike: 1,
                    saleView: 1,
                    isShared: 1,
                    likes: 1,
                    views: 1,
                    shares: 1,
                    userView: 1,
                    userLike: 1,
                    stiker: 1,
                    uploadSource: {
                        '$arrayElemAt': ['$uploadSource.uploadSource', 0]
                    },
                    comments: {
                        '$cond': {
                            if: {
                                '$eq': ['$comment', []]
                            },
                            then: 0,
                            else: {
                                '$size': '$comment'
                            }
                        }
                    },
                    email: 1,
                    viewer: 1,
                    viewerCount: 1,
                    oldDate: '$oldDate',
                    selfContent: 1,
                    official: {
                        '$cond': {
                            if: {
                                '$eq': ['$email', 'hyppers@hyppe.id']
                            },
                            then: 1,
                            else: 0
                        }
                    },
                    music: {
                        '$arrayElemAt': ['$music', 0]
                    },
                    isLike: {
                        '$cond': {
                            if: {
                                '$eq': ['$userLike', 'hyppers@hyppe.id']
                            },
                            then: true,
                            else: false
                        }
                    },
                    comment: '$comment',
                    interest: '$categoryInt',
                    friends: {
                        '$arrayElemAt': ['$friend.friend', 0]
                    },
                    following: {
                        '$cond': {
                            if: {
                                '$eq': ['$userBasic.follower', []]
                            },
                            then: false,
                            else: {
                                '$cond': {
                                    if: {
                                        '$in': [
                                            email,
                                            {
                                                '$arrayElemAt': ['$userBasic.follower', 0]
                                            }
                                        ]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    insight: {
                        likes: '$likes',
                        views: {
                            '$ifNull': [{
                                '$size': '$userView'
                            }, 0]
                        },
                        shares: '$shares',
                        comments: '$comments'
                    },
                    userProfile: '$userProfile',
                    contentMedias: '$contentMedias',
                    cats: '$categories',
                    tagDescription: '$tagDescription',
                    metadata: '$metadata',
                    boostDate: '$boostDate',
                    end: '$boosted.boostSession.end',
                    start: '$boosted.boostSession.start',
                    isBoost: '$isBoost',
                    boostViewer: '$boostViewer',
                    boostCount: '$boostCount',
                    boosted: {
                        '$cond': {
                            if: {
                                '$gt': [
                                    {
                                        '$dateToString': {
                                            format: '%Y-%m-%d %H:%M:%S',
                                            date: {
                                                '$add': [new Date(), 25200000]
                                            }
                                        }
                                    },
                                    '$boosted.boostSession.end'
                                ]
                            },
                            then: '$ilang',
                            else: '$boosted'
                        }
                    },
                    contentModeration: '$contentModeration',
                    reportedStatus: '$reportedStatus',
                    reportedUserCount: '$reportedUserCount',
                    contentModerationResponse: '$contentModerationResponse',
                    reportedUser: '$reportedUser',
                    timeStart: '$timeStart',
                    timeEnd: '$timeEnd',
                    apsaraId: {
                        '$arrayElemAt': ['$mediaSource.apsaraId', 0]
                    },
                    isApsara: {
                        '$arrayElemAt': ['$mediaSource.apsara', 0]
                    },
                    apsaraThumbId: {
                        '$arrayElemAt': ['$mediaSource.apsaraThumbId', 0]
                    },
                    mediaEndpoint: {
                        '$ifNull': [
                            {
                                '$arrayElemAt': ['$mediaSource.mediaEndpoint', 0]
                            },
                            {
                                '$cond': {
                                    if: {
                                        '$eq': ['$postType', 'pict']
                                    },
                                    then: {
                                        '$concat': ['/pict/', '$postID']
                                    },
                                    else: {
                                        '$concat': ['/stream/', '$postID']
                                    }
                                }
                            }
                        ]
                    },
                    mediaUri: {
                        '$arrayElemAt': ['$mediaSource.mediaUri', 0]
                    },
                    mediaThumbEndpoint: {
                        '$ifNull': [
                            {
                                '$arrayElemAt': ['$mediaSource.mediaThumbEndpoint', 0]
                            },
                            {
                                '$cond': {
                                    if: {
                                        '$eq': ['$postType', 'pict']
                                    },
                                    then: {
                                        '$concat': ['/pict/', '$postID']
                                    },
                                    else: {
                                        '$concat': ['/thumb/', '$postID']
                                    }
                                }
                            }
                        ]
                    },
                    mediaThumbUri: {
                        '$arrayElemAt': ['$mediaSource.mediaThumbUri', 0]
                    },
                    fullName: {
                        '$arrayElemAt': ['$userBasic.fullName', 0]
                    },
                    username: {
                        '$arrayElemAt': ['$userBasic.username', 0]
                    },
                    "GiftActivation":{
                        $arrayElemAt: ["$userBasic.GiftActivation", 0]
                      },
                    avatar: {
                        mediaBasePath: {
                            '$arrayElemAt': ['$userBasic.mediaBasePath', 0]
                        },
                        mediaUri: {
                            '$arrayElemAt': ['$userBasic.mediaUri', 0]
                        },
                        originalName: {
                            '$arrayElemAt': ['$userBasic.originalName', 0]
                        },
                        fsSourceUri: {
                            '$arrayElemAt': ['$userBasic.fsSourceUri', 0]
                        },
                        fsSourceName: {
                            '$arrayElemAt': ['$userBasic.fsSourceName', 0]
                        },
                        fsTargetUri: {
                            '$arrayElemAt': ['$userBasic.fsTargetUri', 0]
                        },
                        mediaType: {
                            '$arrayElemAt': ['$userBasic.mediaType', 0]
                        },
                        mediaEndpoint: {
                            '$arrayElemAt': ['$userBasic.mediaEndpoint', 0]
                        }
                    },
                    privacy: {
                        isCelebrity: {
                            '$arrayElemAt': ['$userBasic.isCelebrity', 0]
                        },
                        isIdVerified: {
                            '$arrayElemAt': ['$userBasic.isIdVerified', 0]
                        },
                        isPrivate: {
                            '$arrayElemAt': ['$userBasic.isPrivate', 0]
                        },
                        isFollowPrivate: {
                            '$arrayElemAt': ['$userBasic.isFollowPrivate', 0]
                        },
                        isPostPrivate: {
                            '$arrayElemAt': ['$userBasic.isPostPrivate', 0]
                        }
                    },
                    verified: {
                        '$arrayElemAt': ['$userBasic.fullName', 0]
                    },
                    urluserBadge: {
                        '$ifNull': [
                            {
                                '$filter': {
                                    input: {
                                        '$arrayElemAt': ['$userBasic.userBadge', 0]
                                    },
                                    as: 'listbadge',
                                    cond: {
                                        '$and': [
                                            {
                                                '$eq': ['$$listbadge.isActive', true]
                                            },
                                            {
                                                '$lte': [
                                                    {
                                                        '$dateToString': {
                                                            format: '%Y-%m-%d %H:%M:%S',
                                                            date: {
                                                                '$add': [new Date(), 25200000]
                                                            }
                                                        }
                                                    },
                                                    '$$listbadge.endDatetime'
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            null
                        ]
                    },
                    mailViewer: '$mailViewer',
                    userInterested: {
                        '$arrayElemAt': ['$userInt.userInterests', 0]
                    },
                    tutorial: {
                        '$map': {
                            input: {
                                '$range': [0, {
                                    '$size': '$tutor'
                                }]
                            },
                            as: 'idx',
                            in: {
                                '$mergeObjects': [
                                    {
                                        '$arrayElemAt': ['$tutor', '$$idx']
                                    },
                                    {
                                        '$arrayElemAt': [
                                            {
                                                '$arrayElemAt': ['$setting.value', 3]
                                            },
                                            '$$idx'
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    intScore: {
                        '$size': '$intScore'
                    },
                    isLiked: {
                        '$ifNull': ['$isLike', false]
                    }
                }
            },
            {
                '$sort': {
                    official: - 1,
                    selfContent: - 1,
                    isBoost: - 1,
                    createdAt: - 1,
                    likes: - 1,
                    comments: - 1,
                    views: - 1,
                    intScore: - 1,
                    friend: - 1,
                    following: - 1,
                    verified: - 1
                }
            }
        );

        // var util = require('util');
        // console.log(util.inspect(pipeline, { showHidden:false, depth:null }));

        var data = await this.loaddata.aggregate(pipeline);
        return data;
    }

    async detailinterestmigration4(keys: string, email: string, skip: number, limit: number, listpict: boolean, listvid: boolean, listdiary: boolean) {
        var mongo = require('mongoose');
        var renderfacet = {};

        if (listpict == true) {
            renderfacet['pict'] = [
                {
                    "$match": {
                        "category.$id": new mongo.Types.ObjectId(keys)
                    }
                },

                {
                    "$sort": {
                        "createdAt": -1
                    }
                },
                {
                    "$unwind": {
                        "path": "$boosted",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$boosted.boostSession",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "timeStart": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " ",
                                "$boosted.boostSession.timeStart"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "timeEnd": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " ",
                                "$boosted.boostSession.timeEnd"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "lastTime": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " 08:00:00"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "timeEnd": {
                            "$cond": {
                                "if": {
                                    "$lt": [
                                        "$timeEnd",
                                        "$lastTime"
                                    ]
                                },
                                "then": {
                                    "$concat": [
                                        {
                                            "$dateToString": {
                                                "format": "%Y-%m-%d",
                                                "date": {
                                                    "$dateAdd": {
                                                        "startDate": new Date(),
                                                        "unit": "day",
                                                        "amount": 1
                                                    }
                                                }
                                            }
                                        },
                                        " ",
                                        "$boosted.boostSession.timeEnd"
                                    ]
                                },
                                "else": "$timeEnd"
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "testDate": {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    "$add": [
                                        new Date(),
                                        25200000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "oldDate": {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    "$add": [
                                        new Date(),
                                        -30600000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "selfContents": {
                            "$cond": {
                                "if": {
                                    "$and": [
                                        {
                                            "$eq": [
                                                "$email",
                                                email
                                            ]
                                        },
                                        {
                                            "$gt": [
                                                "$createdAt",
                                                "$oldDate"
                                            ]
                                        }
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "kancuts": {
                            "$concatArrays": [
                                "$viewer",
                                [
                                    email
                                ]
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "mailViewer": {
                            "$filter": {
                                "input": "$kancuts",
                                "cond": {
                                    "$eq": [
                                        "$$this",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "dodolCount": {
                            "$filter": {
                                "input": "$kancuts",
                                "cond": {
                                    "$eq": [
                                        "$$this",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "viewerCounts": {
                            "$cond": {
                                "if": {
                                    "$isArray": "$dodolCount"
                                },
                                "then": {
                                    "$size": "$dodolCount"
                                },
                                //{
                                //		$subtract: [
                                //				{
                                //						$size: "$dodolCount"
                                //				},
                                //				1
                                //		]
                                //},
                                "else": 1
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {
                                "$and": [
                                    {
                                        "reportedStatus": {
                                            "$ne": "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "postType": "pict"
                                    },
                                    {
                                        "$expr": {
                                            "$lte": [
                                                "$boosted.boostSession.start",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$gt": [
                                                "$boosted.boostSession.end",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$lte": [
                                                "$timeStart",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$gt": [
                                                "$timeEnd",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "timeStart": {
                                            "$ne": null
                                        }
                                    },
                                    {
                                        "timeEnd": {
                                            "$ne": null
                                        }
                                    },
                                    {
                                        "$or": [
                                            {
                                                "reportedUser": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "active": false
                                                    }
                                                }
                                            },
                                            {
                                                "reportedUser.email": {
                                                    "$not": {
                                                        "$regex": email
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$or": [
                                            {
                                                "boosted.boostViewer": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "isLast": true,
                                                        "timeEnd": {
                                                            "$lte": {
                                                                "$add": [
                                                                    new Date(),
                                                                    25200000
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "$and": [
                                                    {
                                                        "boosted.boostViewer.email": {
                                                            "$ne": email
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "$and": [
                                    {
                                        "reportedStatus": {
                                            "$ne": "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "postType": "pict"
                                    },
                                    {
                                        "timeStart": null
                                    },
                                    {
                                        "$or": [
                                            {
                                                "reportedUser": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "active": false
                                                    }
                                                }
                                            },
                                            {
                                                "reportedUser.email": {
                                                    "$not": {
                                                        "$regex": email
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "$skip": (skip * limit)
                },
                {
                    "$limit": limit
                },
                {
                    "$group": {
                        "_id": "$postType",
                        "postID": {
                            "$push": "$postID"
                        },
                        "all": {
                            "$push": "$$ROOT"
                        },
                        "email": {
                            "$push": "$email"
                        },
                        "categories": {
                            "$push": "$category.$id"
                        },
                        "tagPeople": {
                            "$push": "$tagPeople.$id"
                        },
                        "mailViewer": {
                            "$push": "$mailViewer"
                        },
                        "musicId": {
                            "$push": "$musicId"
                        },
                        "oldDate": {
                            "$push": "$oldDate"
                        },
                        "testDate": {
                            "$push": "$testDate"
                        },
                        "selfContents": {
                            "$push": "$selfContents"
                        },
                        "userProfile": {
                            "$push": "$userProfile"
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "disquslogs",
                        "let": {
                            "localID": "$postID"
                        },
                        "as": "comment",
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "active": {
                                                "$ne": false
                                            }
                                        }
                                        // {
                                        //   "sequenceNumber": 0
                                        // },
                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "newUserBasics",
                                    "as": "userComment",
                                    "let": {
                                        "localID": "$sender"
                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [
                                                        "$email",
                                                        "$$localID"
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            "$project": {
                                                "username": 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$userComment"
                                }
                            },
                            {
                                "$sort": {
                                    "createdAt": -1
                                }
                            },
                            // {
                            //   $limit: 2
                            // },
                            {
                                "$group": {
                                    "_id": "$postID",
                                    "komentar": {
                                        "$push": "$$ROOT"
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        from: "friend_list",
                        as: "friend",
                        let: {
                            localID: '$email',
                            user: email
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$email', '$$localID']
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $in: ['$$user', '$friendlist']
                                                    }
                                                },
                                            ]
                                        },

                                    ]
                                }
                            },
                            {
                                $project: {
                                    email: 1,
                                    friend: 1,
                                }
                            },

                        ]
                    },

                },
                {
                    "$lookup": {
                        "from": "contentevents",
                        "as": "following",
                        "let": {
                            "localID": "$email",
                            "user": email
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$senderParty",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "email": email
                                        },
                                        {
                                            "eventType": "FOLLOWING"
                                        },
                                        {
                                            "event": "ACCEPT"
                                        },
                                        {
                                            "active": true
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "senderParty": 1,
                                    "following": {
                                        "$cond": {
                                            "if": {
                                                "$gt": [
                                                    {
                                                        "$strLenCP": "$email"
                                                    },
                                                    0
                                                ]
                                            },
                                            "then": true,
                                            "else": false
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "tempPosts",
                        "as": "media",
                        "let": {
                            "localID": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$postID",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "isApsara":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsara", 0
                                                        ]
                                                },
                                                false
                                            ]
                                    },
                                    "apsaraId":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsaraId", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "apsaraThumbId":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsaraThumbId", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaUri", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "postID": 1,
                                    mediaSource: 1,
                                    urlLink: 1,
                                    judulLink: 1,
                                    "mediaEndpoint": {
                                        "$concat": [
                                            "/pict/",
                                            "$postID"
                                        ]
                                    },
                                    "mediaThumbEndpoint":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumbEndpoint", 0
                                                        ]
                                                },
                                                {
                                                    "$concat": [
                                                        "/thumb/",
                                                        "$postID"
                                                    ]
                                                }
                                            ]
                                    },
                                    "mediaThumbUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumb", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaType":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaType", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "uploadSource":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.uploadSource", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaThumUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumbUri", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    }
                                }
                            }
                        ]
                        //
                    }
                    //
                },
                {
                    "$addFields": {
                        "category": {
                            "$reduce": {
                                "input": "$categories",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": [
                                        "$$this",
                                        "$$value"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "interests_repo",
                        "as": "cats",
                        "let": {
                            "localID": "$category"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {
                                                "$in": [
                                                    "$_id",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "interestName": 1,
                                    "langIso": 1,
                                    "icon": 1,
                                    "createdAt": 1,
                                    "updatedAt": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "userInterest",
                        "let": {
                            "localID": email
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {
                                                "$eq": [
                                                    "$email",
                                                    "$$localID"
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "userInterests": "$userInterests.$id",
                                    "email": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "userTag",
                        "let": {
                            "localID": "$tagPeople"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$or": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$_id",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$_idAuth",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID.$id",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "username": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "username",
                        "let": {
                            "localID": "$email"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$email",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "email": 1,
                                    "username": 1,
                                    "fullName": 1,
                                    "profilePict": 1,
                                    "isCelebrity": 1,
                                    "isIdVerified": 1,
                                    "isPrivate": 1,
                                    "isFollowPrivate": 1,
                                    "isPostPrivate": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$set": {
                        "userBasic": "$username"
                    }
                },
                {
                    "$lookup": {
                        "from": "mediamusic",
                        "as": "music",
                        "let": {
                            "localID": "$musicId"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$_id",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "theme",
                                    "localField": "theme",
                                    "foreignField": "_id",
                                    "as": "theme_data"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "genre",
                                    "localField": "genre",
                                    "foreignField": "_id",
                                    "as": "genre_data"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "mood",
                                    "localField": "mood",
                                    "foreignField": "_id",
                                    "as": "mood_data"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$genre_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$theme_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$mood_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$project": {
                                    "musicTitle": 1,
                                    "artistName": 1,
                                    "albumName": 1,
                                    "apsaraMusic": 1,
                                    "apsaraThumnail": 1,
                                    "genre": "$genre_data.name",
                                    "theme": "$theme_data.name",
                                    "mood": "$mood_data.name"
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "contentevents",
                        "as": "isLike",
                        "let": {
                            "picts": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$picts"
                                                ]
                                            }
                                        },
                                        {
                                            "eventType": "LIKE"
                                        },
                                        {
                                            "event": "DONE"
                                        },
                                        {
                                            "active": true
                                        },
                                        {
                                            "email": email
                                        }
                                    ]
                                }
                            },
                            {
                                "$set": {
                                    "kancut": {
                                        "$ifNull": [
                                            "email",
                                            "kosong"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "email": 1,
                                    "postID": 1,
                                    "isLiked": {
                                        "$cond": {
                                            "if": {
                                                "$eq": [
                                                    "$kancut",
                                                    "kosong"
                                                ]
                                            },
                                            "then": false,
                                            "else": true
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "disquslogs",
                        "as": "countLogs",
                        "let": {
                            "localID": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "active": true
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$unwind": {
                        "path": "$postID"
                    }
                },
                {
                    "$unwind": {
                        "path": "$userInterest",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "index": {
                            "$indexOfArray": [
                                "$all.postID",
                                "$postID"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "indexComment": {
                            "$indexOfArray": [
                                "$comment._id",
                                {
                                    "$arrayElemAt": [
                                        "$all.postID",
                                        "$index"
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "ded": {
                            "$cond": {
                                "if": {
                                    "$gte": [
                                        "$indexComment",
                                        0
                                    ]
                                },
                                "then": {
                                    "$arrayElemAt": [
                                        "$comment.komentar",
                                        "$indexComment"
                                    ]
                                },
                                "else": []
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "user": {
                            "$filter": {
                                "input": "$userBasic",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "uName": {
                            "$filter": {
                                "input": "$username",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "followings": {
                            "$filter": {
                                "input": "$following",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.senderParty",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "friendster": {
                            "$filter": {
                                "input": "$friend",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "mediaPost": {
                            "$filter": {
                                "input": "$media",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.postID",
                                        {
                                            "$arrayElemAt": [
                                                "$all.postID",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": {
                        "path": "$user",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$uName",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$mediaPost",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "kosong": {
                            "$ifNull": [
                                "$user.email",
                                "kancut"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "cekMusic": {
                            "$arrayElemAt": [
                                "$all",
                                "$index"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "musicOk": {
                            "$ifNull": [
                                "$cekMusic.musicId",
                                "kampret"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "musicNih": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        "$musicOk",
                                        "kampret"
                                    ]
                                },
                                "then": "$ilang",
                                "else": {
                                    "$filter": {
                                        "input": "$music",
                                        "as": "song",
                                        "cond": {
                                            "$eq": [
                                                "$$song._id",
                                                "$cekMusic.musicId"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": {
                        "path": "$musicNih",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "avatar",
                        "let": {
                            "localID": "$kosong"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            "$email",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$unwind": {
                        "path": "$avatar",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "liked": {
                            "$filter": {
                                "input": "$isLike",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.postID",
                                        {
                                            "$arrayElemAt": [
                                                "$all.postID",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$project": {
                        "test1": {
                            "$arrayElemAt": [
                                "$mailViewer",
                                "$index"
                            ]
                        },
                        "test2": {
                            "$arrayElemAt": [
                                "$all.kancuts",
                                "$index"
                            ]
                        },
                        "_id": {
                            "$arrayElemAt": [
                                "$all.postID",
                                "$index"
                            ]
                        },
                        "musicTitle": "$musicNih.musicTitle",
                        "postID": 1,
                        mediaSource: {
                            "$arrayElemAt": [
                                "$all.mediaSource",
                                "$index"
                            ]
                        },
                        "urlLink": {
                            "$arrayElemAt": [
                                "$all.urlLink",
                                "$index"
                            ]
                        },
                        "judulLink": {
                            "$arrayElemAt": [
                                "$all.judulLink",
                                "$index"
                            ]
                        },
                        "artistName": "$musicNih.artistName",
                        "albumName": "$musicNih.albumName",
                        "apsaraMusic": "$musicNih.apsaraMusic",
                        "apsaraThumnail": "$musicNih.apsaraThumnail",
                        "genre": "$musicNih.genre",
                        "theme": "$musicNih.theme",
                        "mood": "$musicNih.mood",
                        "testDate": {
                            "$arrayElemAt": [
                                "$testDate",
                                0
                            ]
                        },
                        "tagPeople": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.tagPeople",
                                                "$index"
                                            ]
                                        },
                                        []
                                    ]
                                },
                                "then": [],
                                "else": {
                                    "$arrayElemAt": [
                                        "$userTag.username",
                                        "$index"
                                    ]
                                }
                            }
                        },
                        "mediaType": {
                            "$arrayElemAt": [
                                "$media.mediaType",
                                "$index"
                            ]
                        },
                        "postType": {
                            "$arrayElemAt": [
                                "$all.postType",
                                "$index"
                            ]
                        },
                        "description": {
                            "$arrayElemAt": [
                                "$all.description",
                                "$index"
                            ]
                        },
                        "active": {
                            "$arrayElemAt": [
                                "$all.active",
                                "$index"
                            ]
                        },
                        "createdAt": {
                            "$arrayElemAt": [
                                "$all.createdAt",
                                "$index"
                            ]
                        },
                        "updatedAt": {
                            "$arrayElemAt": [
                                "$all.updatedAt",
                                "$index"
                            ]
                        },
                        "expiration": {
                            "$arrayElemAt": [
                                "$all.expiration",
                                "$index"
                            ]
                        },
                        "visibility": {
                            "$arrayElemAt": [
                                "$all.visibility",
                                "$index"
                            ]
                        },
                        "location": {
                            "$arrayElemAt": [
                                "$all.location",
                                "$index"
                            ]
                        },
                        "tags": {
                            "$arrayElemAt": [
                                "$all.tags",
                                "$index"
                            ]
                        },
                        "allowComments": {
                            "$arrayElemAt": [
                                "$all.allowComments",
                                "$index"
                            ]
                        },
                        "isSafe": {
                            "$arrayElemAt": [
                                "$all.isSafe",
                                "$index"
                            ]
                        },
                        "isOwned": {
                            "$arrayElemAt": [
                                "$all.isOwned",
                                "$index"
                            ]
                        },
                        "certified": {
                            "$arrayElemAt": [
                                "$all.certified",
                                "$index"
                            ]
                        },
                        "saleAmount": {
                            "$arrayElemAt": [
                                "$all.saleAmount",
                                "$index"
                            ]
                        },
                        "saleLike": {
                            "$arrayElemAt": [
                                "$all.saleLike",
                                "$index"
                            ]
                        },
                        "saleView": {
                            "$arrayElemAt": [
                                "$all.saleView",
                                "$index"
                            ]
                        },
                        "isShared": {
                            "$arrayElemAt": [
                                "$all.isShared",
                                "$index"
                            ]
                        },
                        "likes": {
                            "$arrayElemAt": [
                                "$all.likes",
                                "$index"
                            ]
                        },
                        "views": {
                            "$arrayElemAt": [
                                "$all.views",
                                "$index"
                            ]
                        },
                        "shares": {
                            "$arrayElemAt": [
                                "$all.shares",
                                "$index"
                            ]
                        },
                        "uploadSource": {
                            "$arrayElemAt": [
                                "$media.uploadSource",
                                "$index"
                            ]
                        },
                        "comments": {
                            "$size": "$ded"
                        },
                        "email": {
                            "$arrayElemAt": [
                                "$all.email",
                                "$index"
                            ]
                        },
                        "viewer": {
                            "$arrayElemAt": [
                                "$all.viewer",
                                "$index"
                            ]
                        },
                        "viewerCount": {
                            "$size": {
                                "$arrayElemAt": [
                                    "$all.mailViewer",
                                    "$index"
                                ]
                            }
                        },
                        "oldDate": {
                            "$arrayElemAt": [
                                "$oldDate",
                                0
                            ]
                        },
                        "selfContents": {
                            "$arrayElemAt": [
                                "$selfContents",
                                "$index"
                            ]
                        },
                        "selfContent": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        },
                                        email
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        },
                        "official": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        },
                                        "hyppers@hyppe.id"
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        },
                        "musik": "$musicNih",
                        "isLike": {
                            "$arrayElemAt": [
                                "$liked.isLiked",
                                0
                            ]
                        },
                        "comment": "$ded",
                        "interest": {
                            "$filter": {
                                "input": "$category",
                                "as": "stud",
                                "cond": {
                                    "$in": [
                                        "$$stud",
                                        {
                                            "$ifNull": [
                                                "$userInterest.userInterests",
                                                []
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "friends": {
                            "$arrayElemAt": [
                                "$friendster.friend",
                                0
                            ]
                        },
                        "following": {
                            "$arrayElemAt": [
                                "$followings.following",
                                0
                            ]
                        },
                        "insight": {
                            "likes": {
                                "$arrayElemAt": [
                                    "$all.likes",
                                    "$index"
                                ]
                            },
                            "views": {
                                "$arrayElemAt": [
                                    "$all.views",
                                    "$index"
                                ]
                            },
                            "shares": {
                                "$arrayElemAt": [
                                    "$all.shares",
                                    "$index"
                                ]
                            },
                            "comments": {
                                "$arrayElemAt": [
                                    "$all.comments",
                                    "$index"
                                ]
                            }
                        },
                        "userProfile": {
                            "$arrayElemAt": [
                                "$all.userProfile",
                                "$index"
                            ]
                        },
                        "contentMedias": {
                            "$arrayElemAt": [
                                "$all.contentMedias",
                                "$index"
                            ]
                        },
                        "cats": {
                            "$filter": {
                                "input": "$cats",
                                "as": "nonok",
                                "cond": {
                                    "$in": [
                                        "$$nonok._id",
                                        {
                                            "$ifNull": [
                                                {
                                                    "$arrayElemAt": [
                                                        "$categories",
                                                        "$index"
                                                    ]
                                                },
                                                []
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "tagDescription": {
                            "$arrayElemAt": [
                                "$all.tagDescription",
                                "$index"
                            ]
                        },
                        "metadata": {
                            "$arrayElemAt": [
                                "$all.metadata",
                                "$index"
                            ]
                        },
                        "boostDate": {
                            "$arrayElemAt": [
                                "$all.boostDate",
                                "$index"
                            ]
                        },
                        "end": {
                            "$arrayElemAt": [
                                "$all.boosted.boostSession.end",
                                "$index"
                            ]
                        },
                        "start": {
                            "$arrayElemAt": [
                                "$all.boosted.boostSession.start",
                                "$index"
                            ]
                        },
                        "isBoost": {
                            "$ifNull": [
                                {
                                    "$arrayElemAt": [
                                        "$all.isBoost",
                                        "$index"
                                    ]
                                },
                                ,
                                0
                            ]
                        },
                        "boostViewer": {
                            "$arrayElemAt": [
                                "$all.boostViewer",
                                "$index"
                            ]
                        },
                        "boostCount": {
                            "$arrayElemAt": [
                                "$all.boostCount",
                                "$index"
                            ]
                        },
                        "boosted": [
                            {
                                "$cond": {
                                    "if": {
                                        "$gt": [
                                            {
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        "$add": [
                                                            new Date(),
                                                            25200000
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                "$arrayElemAt": [
                                                    "$all.boosted.boostSession.end",
                                                    "$index"
                                                ]
                                            }
                                        ]
                                    },
                                    "then": "$ilang",
                                    "else": {
                                        "$arrayElemAt": [
                                            "$all.boosted",
                                            "$index"
                                        ]
                                    }
                                }
                            }
                        ],
                        "contentModeration": {
                            "$arrayElemAt": [
                                "$all.contentModeration",
                                "$index"
                            ]
                        },
                        "reportedStatus": {
                            "$arrayElemAt": [
                                "$all.reportedStatus",
                                "$index"
                            ]
                        },
                        "reportedUserCount": {
                            "$arrayElemAt": [
                                "$all.reportedUserCount",
                                "$index"
                            ]
                        },
                        "contentModerationResponse": {
                            "$arrayElemAt": [
                                "$all.contentModerationResponse",
                                "$index"
                            ]
                        },
                        "reportedUser": {
                            "$arrayElemAt": [
                                "$all.reportedUser",
                                "$index"
                            ]
                        },
                        "timeStart": {
                            "$arrayElemAt": [
                                "$all.timeStart",
                                "$index"
                            ]
                        },
                        "timeEnd": {
                            "$arrayElemAt": [
                                "$all.timeEnd",
                                "$index"
                            ]
                        },
                        "apsaraId": "$mediaPost.apsaraId",
                        "isApsara": "$mediaPost.isApsara",
                        "apsaraThumbId": "$mediaPost.apsaraThumbId",
                        "mediaEndpoint": "$mediaPost.mediaEndpoint",
                        "mediaUri": "$mediaPost.mediaUri",
                        "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
                        "mediaThumbUri": "$mediaPost.mediaThumbUri",
                        "fullName": "$user.fullName",
                        "username": "$uName.username",
                        "avatar": "$avatar",
                        "privacy": {
                            "isCelebrity": "$user.isCelebrity",
                            "isIdVerified": "$user.isIdVerified",
                            "isPrivate": "$user.isPrivate",
                            "isFollowPrivate": "$user.isFollowPrivate",
                            "isPostPrivate": "$user.isPostPrivate"
                        },
                        "verified": "$user.fullName",
                        "mailViewer": {
                            "$arrayElemAt": [
                                "$all.mailViewer",
                                "$index"
                            ]
                        },
                        "userInterested": "$userInterest.userInterests"
                    }
                },
                {
                    $lookup: {
                        from: "settings",
                        as: "setting",
                        pipeline: [
                            {
                                $match: {
                                    $or: [
                                        {
                                            "_id": new mongo.Types.ObjectId("62bbdb4ba7520000050077a7")
                                        },
                                        {
                                            "_id": new mongo.Types.ObjectId("64d06e5c451e0000bd006c62")
                                        }
                                    ]
                                }
                            },

                        ]
                    }
                },
                {
                    $project: {
                        mailViewer: 1,
                        viewerCount: 1,
                        viewer: 1,
                        version: {
                            $arrayElemAt: ["$setting.value", 0]
                        },
                        limitLandingpage: {
                            $arrayElemAt: ["$setting.value", 1]
                        },
                        oldDate: 1,
                        selfContents: 1,
                        official: 1,
                        selfContent: 1,
                        music: "$musik",
                        isLiked: {
                            $ifNull: ["$isLike", false]
                        },
                        comment:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$comment", [
                                        null
                                    ]]
                                },
                                then: [],
                                else: "$comment"
                            }
                        },
                        intScore:
                        {
                            $cond: {
                                if: {
                                    $isArray: "$interest"
                                },
                                then:
                                {
                                    $size: "$interest"
                                },
                                else: 0
                            }
                        },
                        "verified": 1,
                        "friend": 1,
                        "following": 1,
                        "musicTitle": 1,
                        "postID": 1,
                        mediaSource:1,
                        urlLink: 1,
                        judulLink: 1,
                        "artistName": 1,
                        "albumName": 1,
                        "apsaraMusic": 1,
                        "apsaraThumnail": 1,
                        "genre": 1,
                        "theme": 1,
                        "mood": 1,
                        "testDate": 1,
                        "musicId": 1,
                        "tagPeople": 1,
                        "mediaType": 1,
                        "email": 1,
                        "postType": 1,
                        "description": 1,
                        "active": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "expiration": 1,
                        "visibility": 1,
                        "location": 1,
                        "tags": 1,
                        "allowComments": 1,
                        "isSafe": 1,
                        "isOwned": 1,
                        "certified": 1,
                        "saleAmount": 1,
                        "saleLike": 1,
                        "saleView": 1,
                        "isShared": 1,
                        "likes": 1,
                        "views": 1,
                        "shares": 1,
                        "comments": 1,
                        "insight": 1,
                        "userProfile": 1,
                        "contentMedias": 1,
                        "cats": "$cats",
                        "tagDescription": 1,
                        "metadata": 1,
                        "boostDate": 1,
                        "end": 1,
                        "start": 1,
                        "isBoost": 1,
                        "boostViewer": 1,
                        "boostCount": 1,
                        "uploadSource": 1,
                        "boosted":
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: "$boosted.boostSession"
                                    }, 0]
                                },
                                else: [],
                                then: '$boosted'
                            }
                        },
                        "contentModeration": 1,
                        "reportedStatus": 1,
                        "reportedUserCount": 1,
                        "contentModerationResponse": 1,
                        "reportedUser": 1,
                        "timeStart": 1,
                        "timeEnd": 1,
                        "isApsara": 1,
                        "apsaraId": 1,
                        "apsaraThumbId": 1,
                        "mediaEndpoint": 1,
                        "mediaUri": 1,
                        "mediaThumbEndpoint": 1,
                        "mediaThumbUri": 1,
                        "fullName": 1,
                        "username": 1,
                        "avatar": 1,
                        "statusCB": 1,
                        "privacy": 1,
                        "mediaThumUri": 1,
                        category: 1,
                        userInterested: 1
                    },

                },
            ];
        }

        if (listvid == true) {
            renderfacet['video'] = [
                {
                    "$match": {
                        "category.$id": new mongo.Types.ObjectId(keys)
                    }
                },

                {
                    "$sort": {
                        "createdAt": -1
                    }
                },
                {
                    "$unwind": {
                        "path": "$boosted",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$boosted.boostSession",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "timeStart": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " ",
                                "$boosted.boostSession.timeStart"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "timeEnd": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " ",
                                "$boosted.boostSession.timeEnd"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "lastTime": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " 08:00:00"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "timeEnd": {
                            "$cond": {
                                "if": {
                                    "$lt": [
                                        "$timeEnd",
                                        "$lastTime"
                                    ]
                                },
                                "then": {
                                    "$concat": [
                                        {
                                            "$dateToString": {
                                                "format": "%Y-%m-%d",
                                                "date": {
                                                    "$dateAdd": {
                                                        "startDate": new Date(),
                                                        "unit": "day",
                                                        "amount": 1
                                                    }
                                                }
                                            }
                                        },
                                        " ",
                                        "$boosted.boostSession.timeEnd"
                                    ]
                                },
                                "else": "$timeEnd"
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "testDate": {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    "$add": [
                                        new Date(),
                                        25200000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "oldDate": {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    "$add": [
                                        new Date(),
                                        -30600000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "selfContents": {
                            "$cond": {
                                "if": {
                                    "$and": [
                                        {
                                            "$eq": [
                                                "$email",
                                                email
                                            ]
                                        },
                                        {
                                            "$gt": [
                                                "$createdAt",
                                                "$oldDate"
                                            ]
                                        }
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "kancuts": {
                            "$concatArrays": [
                                "$viewer",
                                [
                                    email
                                ]
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "mailViewer": {
                            "$filter": {
                                "input": "$kancuts",
                                "cond": {
                                    "$eq": [
                                        "$$this",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "dodolCount": {
                            "$filter": {
                                "input": "$kancuts",
                                "cond": {
                                    "$eq": [
                                        "$$this",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "viewerCounts": {
                            "$cond": {
                                "if": {
                                    "$isArray": "$dodolCount"
                                },
                                "then": {
                                    "$size": "$dodolCount"
                                },
                                //{
                                //		$subtract: [
                                //				{
                                //						$size: "$dodolCount"
                                //				},
                                //				1
                                //		]
                                //},
                                "else": 1
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {
                                "$and": [
                                    {
                                        "reportedStatus": {
                                            "$ne": "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        // "postType": "vid"
                                        "postType": {
                                            $in: ["vid", "diary"]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$lte": [
                                                "$boosted.boostSession.start",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$gt": [
                                                "$boosted.boostSession.end",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$lte": [
                                                "$timeStart",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$gt": [
                                                "$timeEnd",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "timeStart": {
                                            "$ne": null
                                        }
                                    },
                                    {
                                        "timeEnd": {
                                            "$ne": null
                                        }
                                    },
                                    {
                                        "$or": [
                                            {
                                                "reportedUser": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "active": false
                                                    }
                                                }
                                            },
                                            {
                                                "reportedUser.email": {
                                                    "$not": {
                                                        "$regex": email
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$or": [
                                            {
                                                "boosted.boostViewer": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "isLast": true,
                                                        "timeEnd": {
                                                            "$lte": {
                                                                "$add": [
                                                                    new Date(),
                                                                    25200000
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "$and": [
                                                    {
                                                        "boosted.boostViewer.email": {
                                                            "$ne": email
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "$and": [
                                    {
                                        "reportedStatus": {
                                            "$ne": "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        // "postType": "vid"
                                        "postType": {
                                            $in: ["vid", "diary"]
                                        }
                                    },
                                    {
                                        "timeStart": null
                                    },
                                    {
                                        "$or": [
                                            {
                                                "reportedUser": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "active": false
                                                    }
                                                }
                                            },
                                            {
                                                "reportedUser.email": {
                                                    "$not": {
                                                        "$regex": email
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "$skip": (skip * limit)
                },
                {
                    "$limit": limit
                },
                {
                    "$group": {
                        "_id": "$postType",
                        "postID": {
                            "$push": "$postID"
                        },
                        "all": {
                            "$push": "$$ROOT"
                        },
                        "email": {
                            "$push": "$email"
                        },
                        "categories": {
                            "$push": "$category.$id"
                        },
                        "tagPeople": {
                            "$push": "$tagPeople.$id"
                        },
                        "mailViewer": {
                            "$push": "$mailViewer"
                        },
                        "musicId": {
                            "$push": "$musicId"
                        },
                        "oldDate": {
                            "$push": "$oldDate"
                        },
                        "testDate": {
                            "$push": "$testDate"
                        },
                        "selfContents": {
                            "$push": "$selfContents"
                        },
                        "userProfile": {
                            "$push": "$userProfile"
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "disquslogs",
                        "let": {
                            "localID": "$postID"
                        },
                        "as": "comment",
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "active": {
                                                "$ne": false
                                            }
                                        }
                                        // {
                                        //   "sequenceNumber": 0
                                        // },
                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "newUserBasics",
                                    "as": "userComment",
                                    "let": {
                                        "localID": "$sender"
                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [
                                                        "$email",
                                                        "$$localID"
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            "$project": {
                                                "username": 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$userComment"
                                }
                            },
                            {
                                "$sort": {
                                    "createdAt": -1
                                }
                            },
                            // {
                            //   $limit: 2
                            // },
                            {
                                "$group": {
                                    "_id": "$postID",
                                    "komentar": {
                                        "$push": "$$ROOT"
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        from: "friend_list",
                        as: "friend",
                        let: {
                            localID: '$email',
                            user: email
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$email', '$$localID']
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $in: ['$$user', '$friendlist']
                                                    }
                                                },
                                            ]
                                        },

                                    ]
                                }
                            },
                            {
                                $project: {
                                    email: 1,
                                    friend: 1,
                                }
                            },

                        ]
                    },

                },
                {
                    "$lookup": {
                        "from": "contentevents",
                        "as": "following",
                        "let": {
                            "localID": "$email",
                            "user": email
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$senderParty",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "email": email
                                        },
                                        {
                                            "eventType": "FOLLOWING"
                                        },
                                        {
                                            "event": "ACCEPT"
                                        },
                                        {
                                            "active": true
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "senderParty": 1,
                                    "following": {
                                        "$cond": {
                                            "if": {
                                                "$gt": [
                                                    {
                                                        "$strLenCP": "$email"
                                                    },
                                                    0
                                                ]
                                            },
                                            "then": true,
                                            "else": false
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "tempPosts",
                        "as": "media",
                        "let": {
                            "localID": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$postID",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "isApsara":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsara", 0
                                                        ]
                                                },
                                                false
                                            ]
                                    },
                                    "apsaraId":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsaraId", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "apsaraThumbId":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsaraThumbId", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaUri", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "postID": 1,
                                    mediaSource:1,
                                    "urlLink": 1,
                                    "judulLink": 1,
                                    "mediaEndpoint": {
                                        "$concat": [
                                            "/stream/",
                                            "$postID"
                                        ]
                                    },
                                    "mediaThumbEndpoint":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumbEndpoint", 0
                                                        ]
                                                },
                                                {
                                                    "$concat": [
                                                        "/thumb/",
                                                        "$postID"
                                                    ]
                                                }
                                            ]
                                    },
                                    "mediaThumbUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumb", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaType":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaType", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "uploadSource":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.uploadSource", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaThumUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumbUri", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    }
                                }
                            }
                        ]
                        //
                    }
                    //
                },
                {
                    "$addFields": {
                        "category": {
                            "$reduce": {
                                "input": "$categories",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": [
                                        "$$this",
                                        "$$value"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "interests_repo",
                        "as": "cats",
                        "let": {
                            "localID": "$category"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {
                                                "$in": [
                                                    "$_id",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "interestName": 1,
                                    "langIso": 1,
                                    "icon": 1,
                                    "createdAt": 1,
                                    "updatedAt": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "userInterest",
                        "let": {
                            "localID": email
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {
                                                "$eq": [
                                                    "$email",
                                                    "$$localID"
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "userInterests": "$userInterests.$id",
                                    "email": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "userTag",
                        "let": {
                            "localID": "$tagPeople"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$or": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$_id",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$_idAuth",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID.$id",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "username": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "username",
                        "let": {
                            "localID": "$email"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$email",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "email": 1,
                                    "username": 1,
                                    "fullName": 1,
                                    "profilePict": 1,
                                    "isCelebrity": 1,
                                    "isIdVerified": 1,
                                    "isPrivate": 1,
                                    "isFollowPrivate": 1,
                                    "isPostPrivate": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$set": {
                        "userBasic": "$username"
                    }
                },
                {
                    "$lookup": {
                        "from": "mediamusic",
                        "as": "music",
                        "let": {
                            "localID": "$musicId"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$_id",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "theme",
                                    "localField": "theme",
                                    "foreignField": "_id",
                                    "as": "theme_data"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "genre",
                                    "localField": "genre",
                                    "foreignField": "_id",
                                    "as": "genre_data"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "mood",
                                    "localField": "mood",
                                    "foreignField": "_id",
                                    "as": "mood_data"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$genre_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$theme_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$mood_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$project": {
                                    "musicTitle": 1,
                                    "artistName": 1,
                                    "albumName": 1,
                                    "apsaraMusic": 1,
                                    "apsaraThumnail": 1,
                                    "genre": "$genre_data.name",
                                    "theme": "$theme_data.name",
                                    "mood": "$mood_data.name"
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "contentevents",
                        "as": "isLike",
                        "let": {
                            "picts": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$picts"
                                                ]
                                            }
                                        },
                                        {
                                            "eventType": "LIKE"
                                        },
                                        {
                                            "event": "DONE"
                                        },
                                        {
                                            "active": true
                                        },
                                        {
                                            "email": email
                                        }
                                    ]
                                }
                            },
                            {
                                "$set": {
                                    "kancut": {
                                        "$ifNull": [
                                            "email",
                                            "kosong"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "email": 1,
                                    "postID": 1,
                                    "isLiked": {
                                        "$cond": {
                                            "if": {
                                                "$eq": [
                                                    "$kancut",
                                                    "kosong"
                                                ]
                                            },
                                            "then": false,
                                            "else": true
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "disquslogs",
                        "as": "countLogs",
                        "let": {
                            "localID": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "active": true
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$unwind": {
                        "path": "$postID"
                    }
                },
                {
                    "$unwind": {
                        "path": "$userInterest",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "index": {
                            "$indexOfArray": [
                                "$all.postID",
                                "$postID"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "indexComment": {
                            "$indexOfArray": [
                                "$comment._id",
                                {
                                    "$arrayElemAt": [
                                        "$all.postID",
                                        "$index"
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "ded": {
                            "$cond": {
                                "if": {
                                    "$gte": [
                                        "$indexComment",
                                        0
                                    ]
                                },
                                "then": {
                                    "$arrayElemAt": [
                                        "$comment.komentar",
                                        "$indexComment"
                                    ]
                                },
                                "else": []
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "user": {
                            "$filter": {
                                "input": "$userBasic",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "uName": {
                            "$filter": {
                                "input": "$username",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "followings": {
                            "$filter": {
                                "input": "$following",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.senderParty",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "friendster": {
                            "$filter": {
                                "input": "$friend",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "mediaPost": {
                            "$filter": {
                                "input": "$media",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.postID",
                                        {
                                            "$arrayElemAt": [
                                                "$all.postID",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": {
                        "path": "$user",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$uName",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$mediaPost",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "kosong": {
                            "$ifNull": [
                                "$user.email",
                                "kancut"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "cekMusic": {
                            "$arrayElemAt": [
                                "$all",
                                "$index"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "musicOk": {
                            "$ifNull": [
                                "$cekMusic.musicId",
                                "kampret"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "musicNih": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        "$musicOk",
                                        "kampret"
                                    ]
                                },
                                "then": "$ilang",
                                "else": {
                                    "$filter": {
                                        "input": "$music",
                                        "as": "song",
                                        "cond": {
                                            "$eq": [
                                                "$$song._id",
                                                "$cekMusic.musicId"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": {
                        "path": "$musicNih",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "avatar",
                        "let": {
                            "localID": "$kosong"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            "$email",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$unwind": {
                        "path": "$avatar",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "liked": {
                            "$filter": {
                                "input": "$isLike",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.postID",
                                        {
                                            "$arrayElemAt": [
                                                "$all.postID",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$project": {
                        "test1": {
                            "$arrayElemAt": [
                                "$mailViewer",
                                "$index"
                            ]
                        },
                        "test2": {
                            "$arrayElemAt": [
                                "$all.kancuts",
                                "$index"
                            ]
                        },
                        "_id": {
                            "$arrayElemAt": [
                                "$all.postID",
                                "$index"
                            ]
                        },
                        "musicTitle": "$musicNih.musicTitle",
                        "postID": 1,
                        "urlLink": {
                            "$arrayElemAt": [
                                "$all.urlLink",
                                "$index"
                            ]
                        },
                        mediaSource:{
                            "$arrayElemAt": [
                                "$all.mediaSource",
                                "$index"
                            ]
                        },
                        "judulLink": {
                            "$arrayElemAt": [
                                "$all.judulLink",
                                "$index"
                            ]
                        },
                        "artistName": "$musicNih.artistName",
                        "albumName": "$musicNih.albumName",
                        "apsaraMusic": "$musicNih.apsaraMusic",
                        "apsaraThumnail": "$musicNih.apsaraThumnail",
                        "genre": "$musicNih.genre",
                        "theme": "$musicNih.theme",
                        "mood": "$musicNih.mood",
                        "testDate": {
                            "$arrayElemAt": [
                                "$testDate",
                                0
                            ]
                        },
                        "tagPeople": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.tagPeople",
                                                "$index"
                                            ]
                                        },
                                        []
                                    ]
                                },
                                "then": [],
                                "else": {
                                    "$arrayElemAt": [
                                        "$userTag.username",
                                        "$index"
                                    ]
                                }
                            }
                        },
                        "mediaType": "$mediapost.mediaType",
                        // "mediaType": {
                        //   "$arrayElemAt": [
                        //     "$mediapost.mediaType",
                        //     "$index"
                        //   ]
                        // },
                        "postType": {
                            "$arrayElemAt": [
                                "$all.postType",
                                "$index"
                            ]
                        },
                        "description": {
                            "$arrayElemAt": [
                                "$all.description",
                                "$index"
                            ]
                        },
                        "active": {
                            "$arrayElemAt": [
                                "$all.active",
                                "$index"
                            ]
                        },
                        "createdAt": {
                            "$arrayElemAt": [
                                "$all.createdAt",
                                "$index"
                            ]
                        },
                        "updatedAt": {
                            "$arrayElemAt": [
                                "$all.updatedAt",
                                "$index"
                            ]
                        },
                        "expiration": {
                            "$arrayElemAt": [
                                "$all.expiration",
                                "$index"
                            ]
                        },
                        "visibility": {
                            "$arrayElemAt": [
                                "$all.visibility",
                                "$index"
                            ]
                        },
                        "location": {
                            "$arrayElemAt": [
                                "$all.location",
                                "$index"
                            ]
                        },
                        "tags": {
                            "$arrayElemAt": [
                                "$all.tags",
                                "$index"
                            ]
                        },
                        "allowComments": {
                            "$arrayElemAt": [
                                "$all.allowComments",
                                "$index"
                            ]
                        },
                        "isSafe": {
                            "$arrayElemAt": [
                                "$all.isSafe",
                                "$index"
                            ]
                        },
                        "isOwned": {
                            "$arrayElemAt": [
                                "$all.isOwned",
                                "$index"
                            ]
                        },
                        "certified": {
                            "$arrayElemAt": [
                                "$all.certified",
                                "$index"
                            ]
                        },
                        "saleAmount": {
                            "$arrayElemAt": [
                                "$all.saleAmount",
                                "$index"
                            ]
                        },
                        "saleLike": {
                            "$arrayElemAt": [
                                "$all.saleLike",
                                "$index"
                            ]
                        },
                        "saleView": {
                            "$arrayElemAt": [
                                "$all.saleView",
                                "$index"
                            ]
                        },
                        "isShared": {
                            "$arrayElemAt": [
                                "$all.isShared",
                                "$index"
                            ]
                        },
                        "likes": {
                            "$arrayElemAt": [
                                "$all.likes",
                                "$index"
                            ]
                        },
                        "views": {
                            "$arrayElemAt": [
                                "$all.views",
                                "$index"
                            ]
                        },
                        "shares": {
                            "$arrayElemAt": [
                                "$all.shares",
                                "$index"
                            ]
                        },
                        "uploadSource": {
                            "$arrayElemAt": [
                                "$media.uploadSource",
                                "$index"
                            ]
                        },
                        "comments": {
                            "$size": "$ded"
                        },
                        "email": {
                            "$arrayElemAt": [
                                "$all.email",
                                "$index"
                            ]
                        },
                        "viewer": {
                            "$arrayElemAt": [
                                "$all.viewer",
                                "$index"
                            ]
                        },
                        "viewerCount": {
                            "$size": {
                                "$arrayElemAt": [
                                    "$all.mailViewer",
                                    "$index"
                                ]
                            }
                        },
                        "oldDate": {
                            "$arrayElemAt": [
                                "$oldDate",
                                0
                            ]
                        },
                        "selfContents": {
                            "$arrayElemAt": [
                                "$selfContents",
                                "$index"
                            ]
                        },
                        "selfContent": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        },
                                        email
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        },
                        "official": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        },
                                        "hyppers@hyppe.id"
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        },
                        "musik": "$musicNih",
                        "isLike": {
                            "$arrayElemAt": [
                                "$liked.isLiked",
                                0
                            ]
                        },
                        "comment": "$ded",
                        "interest": {
                            "$filter": {
                                "input": "$category",
                                "as": "stud",
                                "cond": {
                                    "$in": [
                                        "$$stud",
                                        {
                                            "$ifNull": [
                                                "$userInterest.userInterests",
                                                []
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "friends": {
                            "$arrayElemAt": [
                                "$friendster.friend",
                                0
                            ]
                        },
                        "following": {
                            "$arrayElemAt": [
                                "$followings.following",
                                0
                            ]
                        },
                        "insight": {
                            "likes": {
                                "$arrayElemAt": [
                                    "$all.likes",
                                    "$index"
                                ]
                            },
                            "views": {
                                "$arrayElemAt": [
                                    "$all.views",
                                    "$index"
                                ]
                            },
                            "shares": {
                                "$arrayElemAt": [
                                    "$all.shares",
                                    "$index"
                                ]
                            },
                            "comments": {
                                "$arrayElemAt": [
                                    "$all.comments",
                                    "$index"
                                ]
                            }
                        },
                        "userProfile": {
                            "$arrayElemAt": [
                                "$all.userProfile",
                                "$index"
                            ]
                        },
                        "contentMedias": {
                            "$arrayElemAt": [
                                "$all.contentMedias",
                                "$index"
                            ]
                        },
                        "cats": {
                            "$filter": {
                                "input": "$cats",
                                "as": "nonok",
                                "cond": {
                                    "$in": [
                                        "$$nonok._id",
                                        {
                                            "$ifNull": [
                                                {
                                                    "$arrayElemAt": [
                                                        "$categories",
                                                        "$index"
                                                    ]
                                                },
                                                []
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "tagDescription": {
                            "$arrayElemAt": [
                                "$all.tagDescription",
                                "$index"
                            ]
                        },
                        "metadata": {
                            "$arrayElemAt": [
                                "$all.metadata",
                                "$index"
                            ]
                        },
                        "boostDate": {
                            "$arrayElemAt": [
                                "$all.boostDate",
                                "$index"
                            ]
                        },
                        "end": {
                            "$arrayElemAt": [
                                "$all.boosted.boostSession.end",
                                "$index"
                            ]
                        },
                        "start": {
                            "$arrayElemAt": [
                                "$all.boosted.boostSession.start",
                                "$index"
                            ]
                        },
                        "isBoost": {
                            "$ifNull": [
                                {
                                    "$arrayElemAt": [
                                        "$all.isBoost",
                                        "$index"
                                    ]
                                },
                                ,
                                0
                            ]
                        },
                        "boostViewer": {
                            "$arrayElemAt": [
                                "$all.boostViewer",
                                "$index"
                            ]
                        },
                        "boostCount": {
                            "$arrayElemAt": [
                                "$all.boostCount",
                                "$index"
                            ]
                        },
                        "boosted": [
                            {
                                "$cond": {
                                    "if": {
                                        "$gt": [
                                            {
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        "$add": [
                                                            new Date(),
                                                            25200000
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                "$arrayElemAt": [
                                                    "$all.boosted.boostSession.end",
                                                    "$index"
                                                ]
                                            }
                                        ]
                                    },
                                    "then": "$ilang",
                                    "else": {
                                        "$arrayElemAt": [
                                            "$all.boosted",
                                            "$index"
                                        ]
                                    }
                                }
                            }
                        ],
                        "contentModeration": {
                            "$arrayElemAt": [
                                "$all.contentModeration",
                                "$index"
                            ]
                        },
                        "reportedStatus": {
                            "$arrayElemAt": [
                                "$all.reportedStatus",
                                "$index"
                            ]
                        },
                        "reportedUserCount": {
                            "$arrayElemAt": [
                                "$all.reportedUserCount",
                                "$index"
                            ]
                        },
                        "contentModerationResponse": {
                            "$arrayElemAt": [
                                "$all.contentModerationResponse",
                                "$index"
                            ]
                        },
                        "reportedUser": {
                            "$arrayElemAt": [
                                "$all.reportedUser",
                                "$index"
                            ]
                        },
                        "timeStart": {
                            "$arrayElemAt": [
                                "$all.timeStart",
                                "$index"
                            ]
                        },
                        "timeEnd": {
                            "$arrayElemAt": [
                                "$all.timeEnd",
                                "$index"
                            ]
                        },
                        "apsaraId": "$mediaPost.apsaraId",
                        "isApsara": "$mediaPost.isApsara",
                        "apsaraThumbId": "$mediaPost.apsaraThumbId",
                        "mediaEndpoint": "$mediaPost.mediaEndpoint",
                        "mediaUri": "$mediaPost.mediaUri",
                        "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
                        "mediaThumbUri": "$mediaPost.mediaThumbUri",
                        "fullName": "$user.fullName",
                        "username": "$uName.username",
                        "avatar": "$avatar",
                        "privacy": {
                            "isCelebrity": "$user.isCelebrity",
                            "isIdVerified": "$user.isIdVerified",
                            "isPrivate": "$user.isPrivate",
                            "isFollowPrivate": "$user.isFollowPrivate",
                            "isPostPrivate": "$user.isPostPrivate"
                        },
                        "verified": "$user.fullName",
                        "mailViewer": {
                            "$arrayElemAt": [
                                "$all.mailViewer",
                                "$index"
                            ]
                        },
                        "userInterested": "$userInterest.userInterests"
                    }
                },
                {
                    $lookup: {
                        from: "settings",
                        as: "setting",
                        pipeline: [
                            {
                                $match: {
                                    $or: [
                                        {
                                            "_id": new mongo.Types.ObjectId("62bbdb4ba7520000050077a7")
                                        },
                                        {
                                            "_id": new mongo.Types.ObjectId("64d06e5c451e0000bd006c62")
                                        }
                                    ]
                                }
                            },

                        ]
                    }
                },
                {
                    $project: {
                        mailViewer: 1,
                        viewerCount: 1,
                        viewer: 1,
                        version: {
                            $arrayElemAt: ["$setting.value", 0]
                        },
                        limitLandingpage: {
                            $arrayElemAt: ["$setting.value", 1]
                        },
                        oldDate: 1,
                        selfContents: 1,
                        official: 1,
                        selfContent: 1,
                        music: "$musik",
                        isLiked: {
                            $ifNull: ["$isLike", false]
                        },
                        comment:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$comment", [
                                        null
                                    ]]
                                },
                                then: [],
                                else: "$comment"
                            }
                        },
                        intScore:
                        {
                            $cond: {
                                if: {
                                    $isArray: "$interest"
                                },
                                then:
                                {
                                    $size: "$interest"
                                },
                                else: 0
                            }
                        },
                        "verified": 1,
                        "friend": 1,
                        "following": 1,
                        "musicTitle": 1,
                        "postID": 1,
                        mediaSource:1,
                        "urlLink": 1,
                        "judulLink": 1,
                        "artistName": 1,
                        "albumName": 1,
                        "apsaraMusic": 1,
                        "apsaraThumnail": 1,
                        "genre": 1,
                        "theme": 1,
                        "mood": 1,
                        "testDate": 1,
                        "musicId": 1,
                        "tagPeople": 1,
                        "mediaType": 1,
                        "email": 1,
                        "postType": 1,
                        "description": 1,
                        "active": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "expiration": 1,
                        "visibility": 1,
                        "location": 1,
                        "tags": 1,
                        "allowComments": 1,
                        "isSafe": 1,
                        "isOwned": 1,
                        "certified": 1,
                        "saleAmount": 1,
                        "saleLike": 1,
                        "saleView": 1,
                        "isShared": 1,
                        "likes": 1,
                        "views": 1,
                        "shares": 1,
                        "comments": 1,
                        "insight": 1,
                        "userProfile": 1,
                        "contentMedias": 1,
                        "cats": "$cats",
                        "tagDescription": 1,
                        "metadata": 1,
                        "boostDate": 1,
                        "end": 1,
                        "start": 1,
                        "isBoost": 1,
                        "boostViewer": 1,
                        "boostCount": 1,
                        "uploadSource": 1,
                        "boosted":
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: "$boosted.boostSession"
                                    }, 0]
                                },
                                else: [],
                                then: '$boosted'
                            }
                        },
                        "contentModeration": 1,
                        "reportedStatus": 1,
                        "reportedUserCount": 1,
                        "contentModerationResponse": 1,
                        "reportedUser": 1,
                        "timeStart": 1,
                        "timeEnd": 1,
                        "isApsara": 1,
                        "apsaraId": 1,
                        "apsaraThumbId": 1,
                        "mediaEndpoint": 1,
                        "mediaUri": 1,
                        "mediaThumbEndpoint": 1,
                        "mediaThumbUri": 1,
                        "fullName": 1,
                        "username": 1,
                        "avatar": 1,
                        "statusCB": 1,
                        "privacy": 1,
                        "mediaThumUri": 1,
                        category: 1,
                        userInterested: 1
                    },

                },
            ];
        }

        if (listdiary == true) {
            renderfacet['diary'] = [
                {
                    "$match": {
                        "category.$id": new mongo.Types.ObjectId(keys)
                    }
                },

                {
                    "$sort": {
                        "createdAt": -1
                    }
                },
                {
                    "$unwind": {
                        "path": "$boosted",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$boosted.boostSession",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "timeStart": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " ",
                                "$boosted.boostSession.timeStart"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "timeEnd": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " ",
                                "$boosted.boostSession.timeEnd"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "lastTime": {
                            "$concat": [
                                {
                                    "$dateToString": {
                                        "format": "%Y-%m-%d",
                                        "date": new Date()
                                    }
                                },
                                " 08:00:00"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "timeEnd": {
                            "$cond": {
                                "if": {
                                    "$lt": [
                                        "$timeEnd",
                                        "$lastTime"
                                    ]
                                },
                                "then": {
                                    "$concat": [
                                        {
                                            "$dateToString": {
                                                "format": "%Y-%m-%d",
                                                "date": {
                                                    "$dateAdd": {
                                                        "startDate": new Date(),
                                                        "unit": "day",
                                                        "amount": 1
                                                    }
                                                }
                                            }
                                        },
                                        " ",
                                        "$boosted.boostSession.timeEnd"
                                    ]
                                },
                                "else": "$timeEnd"
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "testDate": {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    "$add": [
                                        new Date(),
                                        25200000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "oldDate": {
                            "$dateToString": {
                                "format": "%Y-%m-%d %H:%M:%S",
                                "date": {
                                    "$add": [
                                        new Date(),
                                        -30600000
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "selfContents": {
                            "$cond": {
                                "if": {
                                    "$and": [
                                        {
                                            "$eq": [
                                                "$email",
                                                email
                                            ]
                                        },
                                        {
                                            "$gt": [
                                                "$createdAt",
                                                "$oldDate"
                                            ]
                                        }
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "kancuts": {
                            "$concatArrays": [
                                "$viewer",
                                [
                                    email
                                ]
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "mailViewer": {
                            "$filter": {
                                "input": "$kancuts",
                                "cond": {
                                    "$eq": [
                                        "$$this",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "dodolCount": {
                            "$filter": {
                                "input": "$kancuts",
                                "cond": {
                                    "$eq": [
                                        "$$this",
                                        email
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "viewerCounts": {
                            "$cond": {
                                "if": {
                                    "$isArray": "$dodolCount"
                                },
                                "then": {
                                    "$size": "$dodolCount"
                                },
                                //{
                                //		$subtract: [
                                //				{
                                //						$size: "$dodolCount"
                                //				},
                                //				1
                                //		]
                                //},
                                "else": 1
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {
                                "$and": [
                                    {
                                        "reportedStatus": {
                                            "$ne": "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "postType": "diary"
                                    },
                                    {
                                        "$expr": {
                                            "$lte": [
                                                "$boosted.boostSession.start",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$gt": [
                                                "$boosted.boostSession.end",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$lte": [
                                                "$timeStart",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr": {
                                            "$gt": [
                                                "$timeEnd",
                                                "$testDate"
                                            ]
                                        }
                                    },
                                    {
                                        "timeStart": {
                                            "$ne": null
                                        }
                                    },
                                    {
                                        "timeEnd": {
                                            "$ne": null
                                        }
                                    },
                                    {
                                        "$or": [
                                            {
                                                "reportedUser": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "active": false
                                                    }
                                                }
                                            },
                                            {
                                                "reportedUser.email": {
                                                    "$not": {
                                                        "$regex": email
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$or": [
                                            {
                                                "boosted.boostViewer": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "isLast": true,
                                                        "timeEnd": {
                                                            "$lte": {
                                                                "$add": [
                                                                    new Date(),
                                                                    25200000
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "$and": [
                                                    {
                                                        "boosted.boostViewer.email": {
                                                            "$ne": email
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "$and": [
                                    {
                                        "reportedStatus": {
                                            "$ne": "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "postType": "diary"
                                    },
                                    {
                                        "timeStart": null
                                    },
                                    {
                                        "$or": [
                                            {
                                                "reportedUser": {
                                                    "$elemMatch": {
                                                        "email": email,
                                                        "active": false
                                                    }
                                                }
                                            },
                                            {
                                                "reportedUser.email": {
                                                    "$not": {
                                                        "$regex": email
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "$skip": (skip * limit)
                },
                {
                    "$limit": limit
                },
                {
                    "$group": {
                        "_id": "$postType",
                        "postID": {
                            "$push": "$postID"
                        },
                        "all": {
                            "$push": "$$ROOT"
                        },
                        "email": {
                            "$push": "$email"
                        },
                        "categories": {
                            "$push": "$category.$id"
                        },
                        "tagPeople": {
                            "$push": "$tagPeople.$id"
                        },
                        "mailViewer": {
                            "$push": "$mailViewer"
                        },
                        "musicId": {
                            "$push": "$musicId"
                        },
                        "oldDate": {
                            "$push": "$oldDate"
                        },
                        "testDate": {
                            "$push": "$testDate"
                        },
                        "selfContents": {
                            "$push": "$selfContents"
                        },
                        "userProfile": {
                            "$push": "$userProfile"
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "disquslogs",
                        "let": {
                            "localID": "$postID"
                        },
                        "as": "comment",
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "active": {
                                                "$ne": false
                                            }
                                        }
                                        // {
                                        //   "sequenceNumber": 0
                                        // },
                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "newUserBasics",
                                    "as": "userComment",
                                    "let": {
                                        "localID": "$sender"
                                    },
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [
                                                        "$email",
                                                        "$$localID"
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            "$project": {
                                                "username": 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$userComment"
                                }
                            },
                            {
                                "$sort": {
                                    "createdAt": -1
                                }
                            },
                            // {
                            //   $limit: 2
                            // },
                            {
                                "$group": {
                                    "_id": "$postID",
                                    "komentar": {
                                        "$push": "$$ROOT"
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        from: "friend_list",
                        as: "friend",
                        let: {
                            localID: '$email',
                            user: email
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$email', '$$localID']
                                                    }
                                                },
                                                {
                                                    $expr: {
                                                        $in: ['$$user', '$friendlist']
                                                    }
                                                },
                                            ]
                                        },

                                    ]
                                }
                            },
                            {
                                $project: {
                                    email: 1,
                                    friend: 1,
                                }
                            },

                        ]
                    },

                },
                {
                    "$lookup": {
                        "from": "contentevents",
                        "as": "following",
                        "let": {
                            "localID": "$email",
                            "user": email
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$senderParty",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "email": email
                                        },
                                        {
                                            "eventType": "FOLLOWING"
                                        },
                                        {
                                            "event": "ACCEPT"
                                        },
                                        {
                                            "active": true
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "senderParty": 1,
                                    "following": {
                                        "$cond": {
                                            "if": {
                                                "$gt": [
                                                    {
                                                        "$strLenCP": "$email"
                                                    },
                                                    0
                                                ]
                                            },
                                            "then": true,
                                            "else": false
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "tempPosts",
                        "as": "media",
                        "let": {
                            "localID": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$postID",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "isApsara":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsara", 0
                                                        ]
                                                },
                                                false
                                            ]
                                    },
                                    "apsaraId":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsaraId", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "apsaraThumbId":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.apsaraThumbId", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaUri", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "postID": 1,
                                    mediaSource:1,
                                    "urlLink": 1,
                                    "judulLink": 1,
                                    "mediaEndpoint": {
                                        "$concat": [
                                            "/stream/",
                                            "$postID"
                                        ]
                                    },
                                    "mediaThumbEndpoint":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumbEndpoint", 0
                                                        ]
                                                },
                                                {
                                                    "$concat": [
                                                        "/thumb/",
                                                        "$postID"
                                                    ]
                                                }
                                            ]
                                    },
                                    "mediaThumbUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumb", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaType":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaType", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "uploadSource":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.uploadSource", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    "mediaThumUri":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$mediaSource.mediaThumbUri", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    }
                                }
                            }
                        ]
                        //
                    }
                    //
                },
                {
                    "$addFields": {
                        "category": {
                            "$reduce": {
                                "input": "$categories",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": [
                                        "$$this",
                                        "$$value"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "interests_repo",
                        "as": "cats",
                        "let": {
                            "localID": "$category"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {
                                                "$in": [
                                                    "$_id",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "interestName": 1,
                                    "langIso": 1,
                                    "icon": 1,
                                    "createdAt": 1,
                                    "updatedAt": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "userInterest",
                        "let": {
                            "localID": email
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$and": [
                                            {
                                                "$eq": [
                                                    "$email",
                                                    "$$localID"
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "userInterests": "$userInterests.$id",
                                    "email": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "userTag",
                        "let": {
                            "localID": "$tagPeople"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$or": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$_id",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$_idAuth",
                                                    {
                                                        "$ifNull": [
                                                            "$$localID.$id",
                                                            []
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$project": {
                                    "username": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "username",
                        "let": {
                            "localID": "$email"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$email",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "email": 1,
                                    "username": 1,
                                    "fullName": 1,
                                    "profilePict": 1,
                                    "isCelebrity": 1,
                                    "isIdVerified": 1,
                                    "isPrivate": 1,
                                    "isFollowPrivate": 1,
                                    "isPostPrivate": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$set": {
                        "userBasic": "$username"
                    }
                },
                {
                    "$lookup": {
                        "from": "mediamusic",
                        "as": "music",
                        "let": {
                            "localID": "$musicId"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$in": [
                                            "$_id",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "theme",
                                    "localField": "theme",
                                    "foreignField": "_id",
                                    "as": "theme_data"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "genre",
                                    "localField": "genre",
                                    "foreignField": "_id",
                                    "as": "genre_data"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "mood",
                                    "localField": "mood",
                                    "foreignField": "_id",
                                    "as": "mood_data"
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$genre_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$theme_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$mood_data",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$project": {
                                    "musicTitle": 1,
                                    "artistName": 1,
                                    "albumName": 1,
                                    "apsaraMusic": 1,
                                    "apsaraThumnail": 1,
                                    "genre": "$genre_data.name",
                                    "theme": "$theme_data.name",
                                    "mood": "$mood_data.name"
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "contentevents",
                        "as": "isLike",
                        "let": {
                            "picts": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$picts"
                                                ]
                                            }
                                        },
                                        {
                                            "eventType": "LIKE"
                                        },
                                        {
                                            "event": "DONE"
                                        },
                                        {
                                            "active": true
                                        },
                                        {
                                            "email": email
                                        }
                                    ]
                                }
                            },
                            {
                                "$set": {
                                    "kancut": {
                                        "$ifNull": [
                                            "email",
                                            "kosong"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "email": 1,
                                    "postID": 1,
                                    "isLiked": {
                                        "$cond": {
                                            "if": {
                                                "$eq": [
                                                    "$kancut",
                                                    "kosong"
                                                ]
                                            },
                                            "then": false,
                                            "else": true
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "disquslogs",
                        "as": "countLogs",
                        "let": {
                            "localID": "$postID"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$in": [
                                                    "$postID",
                                                    "$$localID"
                                                ]
                                            }
                                        },
                                        {
                                            "active": true
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "$unwind": {
                        "path": "$postID"
                    }
                },
                {
                    "$unwind": {
                        "path": "$userInterest",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "index": {
                            "$indexOfArray": [
                                "$all.postID",
                                "$postID"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "indexComment": {
                            "$indexOfArray": [
                                "$comment._id",
                                {
                                    "$arrayElemAt": [
                                        "$all.postID",
                                        "$index"
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "ded": {
                            "$cond": {
                                "if": {
                                    "$gte": [
                                        "$indexComment",
                                        0
                                    ]
                                },
                                "then": {
                                    "$arrayElemAt": [
                                        "$comment.komentar",
                                        "$indexComment"
                                    ]
                                },
                                "else": []
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "user": {
                            "$filter": {
                                "input": "$userBasic",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "uName": {
                            "$filter": {
                                "input": "$username",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "followings": {
                            "$filter": {
                                "input": "$following",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.senderParty",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "friendster": {
                            "$filter": {
                                "input": "$friend",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.email",
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$set": {
                        "mediaPost": {
                            "$filter": {
                                "input": "$media",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.postID",
                                        {
                                            "$arrayElemAt": [
                                                "$all.postID",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": {
                        "path": "$user",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$uName",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$unwind": {
                        "path": "$mediaPost",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "kosong": {
                            "$ifNull": [
                                "$user.email",
                                "kancut"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "cekMusic": {
                            "$arrayElemAt": [
                                "$all",
                                "$index"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "musicOk": {
                            "$ifNull": [
                                "$cekMusic.musicId",
                                "kampret"
                            ]
                        }
                    }
                },
                {
                    "$set": {
                        "musicNih": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        "$musicOk",
                                        "kampret"
                                    ]
                                },
                                "then": "$ilang",
                                "else": {
                                    "$filter": {
                                        "input": "$music",
                                        "as": "song",
                                        "cond": {
                                            "$eq": [
                                                "$$song._id",
                                                "$cekMusic.musicId"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": {
                        "path": "$musicNih",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        "from": "newUserBasics",
                        "as": "avatar",
                        "let": {
                            "localID": "$kosong"
                        },
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            "$email",
                                            "$$localID"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$unwind": {
                        "path": "$avatar",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$set": {
                        "liked": {
                            "$filter": {
                                "input": "$isLike",
                                "as": "nonok",
                                "cond": {
                                    "$eq": [
                                        "$$nonok.postID",
                                        {
                                            "$arrayElemAt": [
                                                "$all.postID",
                                                "$index"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$project": {
                        "test1": {
                            "$arrayElemAt": [
                                "$mailViewer",
                                "$index"
                            ]
                        },
                        "test2": {
                            "$arrayElemAt": [
                                "$all.kancuts",
                                "$index"
                            ]
                        },
                        "_id": {
                            "$arrayElemAt": [
                                "$all.postID",
                                "$index"
                            ]
                        },
                        "musicTitle": "$musicNih.musicTitle",
                        "postID": 1,
                        mediaSource:{
                            "$arrayElemAt": [
                                "$all.mediaSource",
                                "$index"
                            ]
                        },
                        "urlLink": {
                            "$arrayElemAt": [
                                "$all.urlLink",
                                "$index"
                            ]
                        },
                        "judulLink": {
                            "$arrayElemAt": [
                                "$all.judulLink",
                                "$index"
                            ]
                        },
                        "artistName": "$musicNih.artistName",
                        "albumName": "$musicNih.albumName",
                        "apsaraMusic": "$musicNih.apsaraMusic",
                        "apsaraThumnail": "$musicNih.apsaraThumnail",
                        "genre": "$musicNih.genre",
                        "theme": "$musicNih.theme",
                        "mood": "$musicNih.mood",
                        "testDate": {
                            "$arrayElemAt": [
                                "$testDate",
                                0
                            ]
                        },
                        "tagPeople": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.tagPeople",
                                                "$index"
                                            ]
                                        },
                                        []
                                    ]
                                },
                                "then": [],
                                "else": {
                                    "$arrayElemAt": [
                                        "$userTag.username",
                                        "$index"
                                    ]
                                }
                            }
                        },
                        "mediaType": {
                            "$arrayElemAt": [
                                "$media.mediaType",
                                "$index"
                            ]
                        },
                        "postType": {
                            "$arrayElemAt": [
                                "$all.postType",
                                "$index"
                            ]
                        },
                        "description": {
                            "$arrayElemAt": [
                                "$all.description",
                                "$index"
                            ]
                        },
                        "active": {
                            "$arrayElemAt": [
                                "$all.active",
                                "$index"
                            ]
                        },
                        "createdAt": {
                            "$arrayElemAt": [
                                "$all.createdAt",
                                "$index"
                            ]
                        },
                        "updatedAt": {
                            "$arrayElemAt": [
                                "$all.updatedAt",
                                "$index"
                            ]
                        },
                        "expiration": {
                            "$arrayElemAt": [
                                "$all.expiration",
                                "$index"
                            ]
                        },
                        "visibility": {
                            "$arrayElemAt": [
                                "$all.visibility",
                                "$index"
                            ]
                        },
                        "location": {
                            "$arrayElemAt": [
                                "$all.location",
                                "$index"
                            ]
                        },
                        "tags": {
                            "$arrayElemAt": [
                                "$all.tags",
                                "$index"
                            ]
                        },
                        "allowComments": {
                            "$arrayElemAt": [
                                "$all.allowComments",
                                "$index"
                            ]
                        },
                        "isSafe": {
                            "$arrayElemAt": [
                                "$all.isSafe",
                                "$index"
                            ]
                        },
                        "isOwned": {
                            "$arrayElemAt": [
                                "$all.isOwned",
                                "$index"
                            ]
                        },
                        "certified": {
                            "$arrayElemAt": [
                                "$all.certified",
                                "$index"
                            ]
                        },
                        "saleAmount": {
                            "$arrayElemAt": [
                                "$all.saleAmount",
                                "$index"
                            ]
                        },
                        "saleLike": {
                            "$arrayElemAt": [
                                "$all.saleLike",
                                "$index"
                            ]
                        },
                        "saleView": {
                            "$arrayElemAt": [
                                "$all.saleView",
                                "$index"
                            ]
                        },
                        "isShared": {
                            "$arrayElemAt": [
                                "$all.isShared",
                                "$index"
                            ]
                        },
                        "likes": {
                            "$arrayElemAt": [
                                "$all.likes",
                                "$index"
                            ]
                        },
                        "views": {
                            "$arrayElemAt": [
                                "$all.views",
                                "$index"
                            ]
                        },
                        "shares": {
                            "$arrayElemAt": [
                                "$all.shares",
                                "$index"
                            ]
                        },
                        "uploadSource": {
                            "$arrayElemAt": [
                                "$media.uploadSource",
                                "$index"
                            ]
                        },
                        "comments": {
                            "$size": "$ded"
                        },
                        "email": {
                            "$arrayElemAt": [
                                "$all.email",
                                "$index"
                            ]
                        },
                        "viewer": {
                            "$arrayElemAt": [
                                "$all.viewer",
                                "$index"
                            ]
                        },
                        "viewerCount": {
                            "$size": {
                                "$arrayElemAt": [
                                    "$all.mailViewer",
                                    "$index"
                                ]
                            }
                        },
                        "oldDate": {
                            "$arrayElemAt": [
                                "$oldDate",
                                0
                            ]
                        },
                        "selfContents": {
                            "$arrayElemAt": [
                                "$selfContents",
                                "$index"
                            ]
                        },
                        "selfContent": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        },
                                        email
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        },
                        "official": {
                            "$cond": {
                                "if": {
                                    "$eq": [
                                        {
                                            "$arrayElemAt": [
                                                "$all.email",
                                                "$index"
                                            ]
                                        },
                                        "hyppers@hyppe.id"
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        },
                        "musik": "$musicNih",
                        "isLike": {
                            "$arrayElemAt": [
                                "$liked.isLiked",
                                0
                            ]
                        },
                        "comment": "$ded",
                        "interest": {
                            "$filter": {
                                "input": "$category",
                                "as": "stud",
                                "cond": {
                                    "$in": [
                                        "$$stud",
                                        {
                                            "$ifNull": [
                                                "$userInterest.userInterests",
                                                []
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "friends": {
                            "$arrayElemAt": [
                                "$friendster.friend",
                                0
                            ]
                        },
                        "following": {
                            "$arrayElemAt": [
                                "$followings.following",
                                0
                            ]
                        },
                        "insight": {
                            "likes": {
                                "$arrayElemAt": [
                                    "$all.likes",
                                    "$index"
                                ]
                            },
                            "views": {
                                "$arrayElemAt": [
                                    "$all.views",
                                    "$index"
                                ]
                            },
                            "shares": {
                                "$arrayElemAt": [
                                    "$all.shares",
                                    "$index"
                                ]
                            },
                            "comments": {
                                "$arrayElemAt": [
                                    "$all.comments",
                                    "$index"
                                ]
                            }
                        },
                        "userProfile": {
                            "$arrayElemAt": [
                                "$all.userProfile",
                                "$index"
                            ]
                        },
                        "contentMedias": {
                            "$arrayElemAt": [
                                "$all.contentMedias",
                                "$index"
                            ]
                        },
                        "cats": {
                            "$filter": {
                                "input": "$cats",
                                "as": "nonok",
                                "cond": {
                                    "$in": [
                                        "$$nonok._id",
                                        {
                                            "$ifNull": [
                                                {
                                                    "$arrayElemAt": [
                                                        "$categories",
                                                        "$index"
                                                    ]
                                                },
                                                []
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "tagDescription": {
                            "$arrayElemAt": [
                                "$all.tagDescription",
                                "$index"
                            ]
                        },
                        "metadata": {
                            "$arrayElemAt": [
                                "$all.metadata",
                                "$index"
                            ]
                        },
                        "boostDate": {
                            "$arrayElemAt": [
                                "$all.boostDate",
                                "$index"
                            ]
                        },
                        "end": {
                            "$arrayElemAt": [
                                "$all.boosted.boostSession.end",
                                "$index"
                            ]
                        },
                        "start": {
                            "$arrayElemAt": [
                                "$all.boosted.boostSession.start",
                                "$index"
                            ]
                        },
                        "isBoost": {
                            "$ifNull": [
                                {
                                    "$arrayElemAt": [
                                        "$all.isBoost",
                                        "$index"
                                    ]
                                },
                                ,
                                0
                            ]
                        },
                        "boostViewer": {
                            "$arrayElemAt": [
                                "$all.boostViewer",
                                "$index"
                            ]
                        },
                        "boostCount": {
                            "$arrayElemAt": [
                                "$all.boostCount",
                                "$index"
                            ]
                        },
                        "boosted": [
                            {
                                "$cond": {
                                    "if": {
                                        "$gt": [
                                            {
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        "$add": [
                                                            new Date(),
                                                            25200000
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                "$arrayElemAt": [
                                                    "$all.boosted.boostSession.end",
                                                    "$index"
                                                ]
                                            }
                                        ]
                                    },
                                    "then": "$ilang",
                                    "else": {
                                        "$arrayElemAt": [
                                            "$all.boosted",
                                            "$index"
                                        ]
                                    }
                                }
                            }
                        ],
                        "contentModeration": {
                            "$arrayElemAt": [
                                "$all.contentModeration",
                                "$index"
                            ]
                        },
                        "reportedStatus": {
                            "$arrayElemAt": [
                                "$all.reportedStatus",
                                "$index"
                            ]
                        },
                        "reportedUserCount": {
                            "$arrayElemAt": [
                                "$all.reportedUserCount",
                                "$index"
                            ]
                        },
                        "contentModerationResponse": {
                            "$arrayElemAt": [
                                "$all.contentModerationResponse",
                                "$index"
                            ]
                        },
                        "reportedUser": {
                            "$arrayElemAt": [
                                "$all.reportedUser",
                                "$index"
                            ]
                        },
                        "timeStart": {
                            "$arrayElemAt": [
                                "$all.timeStart",
                                "$index"
                            ]
                        },
                        "timeEnd": {
                            "$arrayElemAt": [
                                "$all.timeEnd",
                                "$index"
                            ]
                        },
                        "apsaraId": "$mediaPost.apsaraId",
                        "isApsara": "$mediaPost.isApsara",
                        "apsaraThumbId": "$mediaPost.apsaraThumbId",
                        "mediaEndpoint": "$mediaPost.mediaEndpoint",
                        "mediaUri": "$mediaPost.mediaUri",
                        "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
                        "mediaThumbUri": "$mediaPost.mediaThumbUri",
                        "fullName": "$user.fullName",
                        "username": "$uName.username",
                        "avatar": "$avatar",
                        "privacy": {
                            "isCelebrity": "$user.isCelebrity",
                            "isIdVerified": "$user.isIdVerified",
                            "isPrivate": "$user.isPrivate",
                            "isFollowPrivate": "$user.isFollowPrivate",
                            "isPostPrivate": "$user.isPostPrivate"
                        },
                        "verified": "$user.fullName",
                        "mailViewer": {
                            "$arrayElemAt": [
                                "$all.mailViewer",
                                "$index"
                            ]
                        },
                        "userInterested": "$userInterest.userInterests"
                    }
                },
                {
                    $lookup: {
                        from: "settings",
                        as: "setting",
                        pipeline: [
                            {
                                $match: {
                                    $or: [
                                        {
                                            "_id": new mongo.Types.ObjectId("62bbdb4ba7520000050077a7")
                                        },
                                        {
                                            "_id": new mongo.Types.ObjectId("64d06e5c451e0000bd006c62")
                                        }
                                    ]
                                }
                            },

                        ]
                    }
                },
                {
                    $project: {
                        mailViewer: 1,
                        viewerCount: 1,
                        viewer: 1,
                        version: {
                            $arrayElemAt: ["$setting.value", 0]
                        },
                        limitLandingpage: {
                            $arrayElemAt: ["$setting.value", 1]
                        },
                        oldDate: 1,
                        selfContents: 1,
                        official: 1,
                        selfContent: 1,
                        music: "$musik",
                        isLiked: {
                            $ifNull: ["$isLike", false]
                        },
                        comment:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$comment", [
                                        null
                                    ]]
                                },
                                then: [],
                                else: "$comment"
                            }
                        },
                        intScore:
                        {
                            $cond: {
                                if: {
                                    $isArray: "$interest"
                                },
                                then:
                                {
                                    $size: "$interest"
                                },
                                else: 0
                            }
                        },
                        "verified": 1,
                        "friend": 1,
                        "following": 1,
                        "musicTitle": 1,
                        "postID": 1,
                        mediaSource:1,
                        "artistName": 1,
                        "albumName": 1,
                        "apsaraMusic": 1,
                        "apsaraThumnail": 1,
                        "genre": 1,
                        "theme": 1,
                        "mood": 1,
                        "testDate": 1,
                        "musicId": 1,
                        "tagPeople": 1,
                        "mediaType": 1,
                        "email": 1,
                        "postType": 1,
                        "urlLink": 1,
                        "judulLink": 1,
                        "description": 1,
                        "active": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "expiration": 1,
                        "visibility": 1,
                        "location": 1,
                        "tags": 1,
                        "allowComments": 1,
                        "isSafe": 1,
                        "isOwned": 1,
                        "certified": 1,
                        "saleAmount": 1,
                        "saleLike": 1,
                        "saleView": 1,
                        "isShared": 1,
                        "likes": 1,
                        "views": 1,
                        "shares": 1,
                        "comments": 1,
                        "insight": 1,
                        "userProfile": 1,
                        "contentMedias": 1,
                        "cats": "$cats",
                        "tagDescription": 1,
                        "metadata": 1,
                        "boostDate": 1,
                        "end": 1,
                        "start": 1,
                        "isBoost": 1,
                        "boostViewer": 1,
                        "boostCount": 1,
                        "uploadSource": 1,
                        "boosted":
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: "$boosted.boostSession"
                                    }, 0]
                                },
                                else: [],
                                then: '$boosted'
                            }
                        },
                        "contentModeration": 1,
                        "reportedStatus": 1,
                        "reportedUserCount": 1,
                        "contentModerationResponse": 1,
                        "reportedUser": 1,
                        "timeStart": 1,
                        "timeEnd": 1,
                        "isApsara": 1,
                        "apsaraId": 1,
                        "apsaraThumbId": 1,
                        "mediaEndpoint": 1,
                        "mediaUri": 1,
                        "mediaThumbEndpoint": 1,
                        "mediaThumbUri": 1,
                        "fullName": 1,
                        "username": 1,
                        "avatar": 1,
                        "statusCB": 1,
                        "privacy": 1,
                        "mediaThumUri": 1,
                        category: 1,
                        userInterested: 1
                    },

                },
            ];
        }

        renderfacet['interest'] = [
            {
                "$lookup": {
                    from: "interests_repo",
                    as: "interest",
                    let: {
                        localID: new mongo.Types.ObjectId(keys)
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$_id', '$$localID']
                                }
                            }
                        },
                        {
                            "$lookup": {
                                from: "interest_count",
                                as: "count",
                                let: {
                                    localID: new mongo.Types.ObjectId(keys)
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$localID']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            total: 1,

                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$count",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ]
                }
            },
            {
                $limit: 1,

            },
            {
                $project: {
                    _id:
                    {
                        $arrayElemAt: ["$interest._id", 0]
                    },
                    tag:
                    {
                        $arrayElemAt: ["$interest._id", 0]
                    },
                    interestNameId:
                    {
                        $arrayElemAt: ["$interest.interestNameId", 0]
                    },
                    interestNameEn:
                    {
                        $arrayElemAt: ["$interest.interestName", 0]
                    },
                    total:
                    {
                        $arrayElemAt: ["$interest.count.total", 0]
                    },

                }
            },

        ];

        // var util = require('util');
        // console.log(util.inspect(renderfacet, { showHidden:false, depth:null }));

        var data = await this.loaddata.aggregate([
            {
                "$facet": renderfacet
            }
        ]);

        return data;
    }
}