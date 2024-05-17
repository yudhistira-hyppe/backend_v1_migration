import { Injectable, NotAcceptableException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateDisqusDto, DisqusResponseApps } from './dto/create-disqus.dto';
import { Disqus, DisqusDocument } from './schemas/disqus.schema';
import { UtilsService } from '../../utils/utils.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { DisquscontactsService } from '../disquscontacts/disquscontacts.service';
import { Disquscontacts } from '../disquscontacts/schemas/disquscontacts.schema';
import { AppGateway } from '../socket/socket.gateway';
import { ReactionsRepoService } from '../../infra/reactions_repo/reactions_repo.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RequestSoctDto } from '../mediastreaming/dto/mediastreaming.dto';

@Injectable()
export class DisqusService {

    private readonly logger = new Logger(DisqusService.name);

    constructor(
        @InjectModel(Disqus.name, 'SERVER_FULL')
        private readonly DisqusModel: Model<DisqusDocument>,
        private utilsService: UtilsService,
        private disquslogsService: DisquslogsService,
        private disqconService: DisquscontactsService,
        private userService: UserbasicsService,
        private reactionsRepoService: ReactionsRepoService,
        private gtw: AppGateway,
        private readonly logapiSS: LogapisService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) { }

    async create(CreateDisqusDto: CreateDisqusDto): Promise<Disqus> {
        const createDisqusDto = await this.DisqusModel.create(CreateDisqusDto);
        return createDisqusDto;
    }

    async findAll(): Promise<Disqus[]> {
        return this.DisqusModel.find().exec();
    }

    async findOne(email: string): Promise<Disqus> {
        return this.DisqusModel.findOne({ email: email }).exec();
    }

    async findById(id: string): Promise<Disqus> {
        return this.DisqusModel.findOne({ _id: id }).exec();
    }

    async sendDMNotif(room: string, payload: string) {
        return this.gtw.room(room, payload);
    }

    async getTest(email: string) {
        return await this.DisqusModel.aggregate([
            {
                $match:
                {
                    $or: [
                        {
                            $and: [
                                {
                                    "email": email
                                },
                                {
                                    "eventType": "DIRECT_MSG"
                                },
                                {
                                    "emailActive": true
                                },

                            ]
                        },
                        {
                            $and: [
                                {
                                    "mate": email
                                },
                                {
                                    "eventType": "DIRECT_MSG"
                                },
                                {
                                    "mateActive": true
                                },

                            ]
                        },

                    ]
                },

            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'userUserBasic',

                },

            },
            {
                $lookup: {
                    from: 'userauths',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'userUserAuth',

                },

            },
            {
                "$lookup": {
                    from: "mediaprofilepicts",
                    as: "avatar",
                    let: {
                        localID: '$userUserBasic.profilePict.$id'
                    },
                    pipeline: [
                        {
                            $match:
                            {


                                $expr: {
                                    $in: ['$mediaID', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "mediaBasePath": 1,
                                "mediaUri": 1,
                                "originalName": 1,
                                "fsSourceUri": 1,
                                "fsSourceName": 1,
                                "fsTargetUri": 1,
                                "mediaType": 1,
                                "mediaEndpoint": {
                                    "$concat": ["/profilepict/", "$mediaID"]
                                }
                            }
                        }
                    ],

                }
            },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'mate',
                    foreignField: 'email',
                    as: 'mateUserBasic',

                },

            },
            {
                $lookup: {
                    from: 'userauths',
                    localField: 'mate',
                    foreignField: 'email',
                    as: 'mateUserAuth',

                },

            },
            {
                "$lookup": {
                    from: "mediaprofilepicts",
                    as: "mateAvatar",
                    let: {
                        localID: '$mateUserBasic.profilePict.$id'
                    },
                    pipeline: [
                        {
                            $match:
                            {

                                $expr: {
                                    $in: ['$mediaID', '$$localID']
                                }
                            }
                        },
                        {
                            $project: {
                                "mediaBasePath": 1,
                                "mediaUri": 1,
                                "originalName": 1,
                                "fsSourceUri": 1,
                                "fsSourceName": 1,
                                "fsTargetUri": 1,
                                "mediaType": 1,
                                "mediaEndpoint": {
                                    "$concat": ["/profilepict/", "$mediaID"]
                                }
                            }
                        }
                    ],

                }
            },
            {
                "$lookup": {
                    from: "disquslogs",
                    as: "disqusLogs",
                    let: {
                        localID: '$disqusLogs.$id'
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
                                                    $in: ['$_id', '$$localID']
                                                }
                                            },

                                        ]
                                    },

                                ]
                            },

                        },
                        {
                            $match:
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $or: [
                                                    {
                                                        'senderActive': true
                                                    },
                                                    {
                                                        'senderActive': null
                                                    },

                                                ]
                                            },
                                            {
                                                'sender': 'daseho@getnada.com'
                                            }
                                        ]
                                    },
                                    {
                                        $and: [
                                            {
                                                $or: [
                                                    {
                                                        'receiverActive': true
                                                    },
                                                    {
                                                        'receiverActive': null
                                                    },

                                                ]
                                            },
                                            {
                                                'receiver': 'daseho@getnada.com'
                                            }
                                        ]
                                    },

                                ]
                            },

                        },
                        {
                            $sort: {
                                "createdAt": 1
                            }
                        },

                    ],

                },

            },
            {
                $lookup: {
                    from: 'reactions_repo',
                    as: 'emot',
                    let: {
                        localID: '$disqusLogs.reactionUri'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $or: [
                                    {
                                        $expr: {
                                            $in: ['$URL', '$$localID']
                                        }
                                    },

                                ]
                            }
                        },

                    ],

                },

            },
            {
                $unwind: {
                    path: "$userUserBasic",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$userUserAuth",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$mateUserBasic",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$mateUserAuth",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$avatar",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$mateAvatar",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "diss": 1,
                    "emailActive": 1,
                    "email":
                    {
                        $cond: {
                            if: {
                                $eq: ["$email", email]
                            },
                            then: "$email",
                            else: '$mate'
                        }
                    },
                    "username":
                    {
                        $cond: {
                            if: {
                                $eq: ["$email", email]
                            },
                            then: "$userUserAuth.username",
                            else: '$mateUserAuth.username'
                        }
                    },
                    "fullName":
                    {
                        $cond: {
                            if: {
                                $eq: ["$email", email]
                            },
                            then: "$userUserBasic.fullName",
                            else: '$mateUserBasic.fullName'
                        }
                    },
                    "avatar":
                    {
                        $cond: {
                            if: {
                                $eq: ["$email", email]
                            },
                            then: "$avatar",
                            else: '$mateAvatar'
                        }
                    },
                    "updatedAt": 1,
                    "lastestMessage": 1,
                    "disqusID": 1,
                    "room": 1,
                    "mateActive": 1,
                    "createdAt": 1,
                    "active": 1,
                    "eventType": 1,
                    "emot": 1, //}],
                    "disqusLog": "$disqusLogs",
                    "senderOrReceiverInfo":
                    {
                        "email":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$mate", email]
                                },
                                then: "$email",
                                else: '$mate'
                            }
                        },
                        "username":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$mate", email]
                                },
                                then: "$userUserAuth.username",
                                else: '$mateUserAuth.username'
                            }
                        },
                        "fullName":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$mate", email]
                                },
                                then: "$userUserBasic.fullName",
                                else: '$mateUserBasic.fullName'
                            }
                        },
                        "avatar":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$mate", email]
                                },
                                then: "$avatar",
                                else: '$mateAvatar'
                            }
                        },

                    },

                }
            },
            {
                $sort: {
                    "createdAt": - 1
                }
            },

        ])
    }

    async delete(id: string) {
        const deletedCat = await this.DisqusModel.findByIdAndRemove({
            _id: id,
        }).exec();
        return deletedCat;
    }

    async deletedicuss(email: string, link: string, request: any): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();

        const data_discus = await this.DisqusModel.findOne({ _id: request._id }).exec();
        let param_update = null;
        let data_update = null;
        if (await this.utilsService.ceckData(data_discus)) {
            if (data_discus.email != undefined) {
                if (data_discus.email == request.email) {
                    param_update = {
                        _id: request._id,
                        email: request.email
                    }
                    data_update = { $set: { "mateActive": false } }
                }
            }
            if (data_discus.mate != undefined) {
                if (data_discus.mate == request.email) {
                    param_update = {
                        _id: request._id,
                        mate: request.email
                    }
                    data_update = { $set: { "emailActive": false } }
                }
            }
            this.DisqusModel.updateOne(
                param_update,
                data_update,
                function (err, docs) {
                    if (err) {
                        //console.log(err);
                    } else {
                        //console.log(docs);
                    }
                });
            this.disquslogsService.updateBydiscusid(request._id, request.email);

            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request));
            this.logapiSS.create2(link, timestamps_start, timestamps_end, email, null, null, reqbody);

            return {
                response_code: 202,
                messages: {
                    info: ['Delete Disqus successful'],
                }
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request));
            this.logapiSS.create2(link, timestamps_start, timestamps_end, email, null, null, reqbody);

            throw new NotAcceptableException({
                response_code: 406,
                messages: {
                    info: ['Unabled to proceed, Disqus not found'],
                },
            });
        }
    }

    async discussLog(url: string, email: string, request: any): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();

        var deleteDiscussLog = await this.disquslogsService.deletedicusslog(request);
        if (deleteDiscussLog != undefined) {
            if (deleteDiscussLog.status != undefined) {
                if (deleteDiscussLog.status) {
                    var discustId = null;
                    if (deleteDiscussLog.discustId != undefined) {
                        discustId = deleteDiscussLog.discustId;
                    }
                    var getDiscussLog = await this.disquslogsService.finddiscussLogByDiscussID(discustId.toString());
                    if (await this.utilsService.ceckData(getDiscussLog)) {
                        var lastestMessage = "";
                        if (getDiscussLog[0].txtMessages != undefined) {
                            lastestMessage = getDiscussLog[0].txtMessages.toString();
                        } else {
                            var reactionUri = "";
                            if (getDiscussLog[0].reactionUri != undefined) {
                                reactionUri = getDiscussLog[0].reactionUri.toString();
                                var getReaction = await this.reactionsRepoService.findByUrl(reactionUri);
                                if (await this.utilsService.ceckData(getReaction)) {
                                    lastestMessage = getReaction.icon.toString();
                                }
                            }
                        }
                        this.DisqusModel.updateOne(
                            { _id: discustId.toString() },
                            { lastestMessage: lastestMessage },
                            function (err, docs) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(docs);
                                }
                            }
                        );
                    } else {
                        this.DisqusModel.updateOne(
                            { _id: discustId, },
                            {
                                emailActive: false,
                                mateActive: false,
                                lastestMessage: ""
                            },
                            function (err, docs) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(docs);
                                }
                            });
                    }
                }
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(url, timestamps_start, timestamps_end, email, null, null, request);
    }

    // async finddisqus() {
    //   const query = await this.DisqusModel.aggregate([

    //     {
    //       $lookup: {
    //         from: 'disqus',
    //         localField: 'disqus.$id',
    //         foreignField: '_id',
    //         as: 'roless',
    //       },
    //     }, {
    //       $out: {
    //         db: 'hyppe_trans_db',
    //         coll: 'disqus2'
    //       }
    //     },

    //   ]);
    //   return query;
    // }

    async getDiscus(postId: string, eventType: string, page: number, row: number): Promise<Disqus[]> {
        let skip = this.paging(page, row);
        return await this.DisqusModel.aggregate(
            [
                {
                    $match:
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        "postID": postId,

                                    },
                                    {
                                        "eventType": eventType,

                                    },
                                    {
                                        "active": true
                                    },

                                ]
                            },

                        ]
                    },

                },
                {
                    $lookup: {
                        from: 'userbasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'user',

                    },

                },
                {
                    "$addFields":
                    {
                        "tempbadgeowner":
                        {
                            "$ifNull":
                                [
                                    {
                                        "$filter":
                                        {
                                            input:
                                            {
                                                "$arrayElemAt":
                                                    [
                                                        "$user.userBadge", 0
                                                    ]
                                            },
                                            as: "listbadge",
                                            cond:
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$eq":
                                                                [
                                                                    "$$listbadge.isActive", true
                                                                ]
                                                        },
                                                        {
                                                            "$lte": [
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
                                                                "$$listbadge.endDatetime"
                                                            ]
                                                        }
                                                    ]
                                            }
                                        }
                                    },
                                    []
                                ]
                        },
                    }
                },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$postID'
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
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                },
                                                {
                                                    'active': true
                                                },
                                                {
                                                    sequenceNumber: 0
                                                }
                                            ]
                                        },

                                    ]
                                },

                            },
                            {
                                "$lookup": {
                                    from: "disquslogs",
                                    as: "detailDisquss",
                                    let: {
                                        localID: '$_id'
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
                                                                    $eq: ['$parentID', '$$localID']
                                                                }
                                                            },
                                                            {
                                                                'active': true
                                                            },
                                                            {
                                                                sequenceNumber: 1
                                                            }
                                                        ]
                                                    },

                                                ]
                                            },

                                        },
                                        {
                                            $sort: {
                                                "updateAt": 1
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'reactions_repo',
                                                as: 'detailEmot',
                                                let: {
                                                    localID: '$reactionUri'
                                                },
                                                pipeline: [
                                                    {
                                                        $match:
                                                        {
                                                            $or: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$URL', '$$localID']
                                                                    }
                                                                },

                                                            ]
                                                        }
                                                    },

                                                ],

                                            },

                                        },
                                        {
                                            $unwind: {
                                                path: "$detailEmot",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'userbasics',
                                                localField: 'sender',
                                                foreignField: 'email',
                                                as: 'detailUserBasic',

                                            },

                                        },
                                        {
                                            "$set":
                                            {
                                                "tempbadge":
                                                {
                                                    "$ifNull":
                                                        [
                                                            {
                                                                "$filter":
                                                                {
                                                                    input:
                                                                    {
                                                                        "$arrayElemAt":
                                                                            [
                                                                                "$detailUserBasic.userBadge", 0
                                                                            ]
                                                                    },
                                                                    as: "listbadge",
                                                                    cond:
                                                                    {
                                                                        "$and":
                                                                            [
                                                                                {
                                                                                    "$eq":
                                                                                        [
                                                                                            "$$listbadge.isActive", true
                                                                                        ]
                                                                                },
                                                                                {
                                                                                    "$lte": [
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
                                                                                        "$$listbadge.endDatetime"
                                                                                    ]
                                                                                }
                                                                            ]
                                                                    }
                                                                }
                                                            },
                                                            []
                                                        ]
                                                },
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: "$detailUserbasic",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'userauths',
                                                localField: 'sender',
                                                foreignField: 'email',
                                                as: 'detailUserAuth',

                                            },

                                        },
                                        {
                                            $unwind: {
                                                path: "$detailUserAuth",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            "$lookup": {
                                                from: "mediaprofilepicts",
                                                as: "detailAvatar",
                                                let: {
                                                    localID: '$detailUserBasic.profilePict.$id'
                                                },
                                                pipeline: [
                                                    {
                                                        $match:
                                                        {
                                                            $expr: {
                                                                $in: ['$mediaID', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            "mediaBasePath": 1,
                                                            "mediaUri": 1,
                                                            "originalName": 1,
                                                            "fsSourceUri": 1,
                                                            "fsSourceName": 1,
                                                            "fsTargetUri": 1,
                                                            "mediaType": 1,
                                                            "mediaEndpoint": {
                                                                "$concat": ["/profilepict/", "$mediaID"]
                                                            }
                                                        }
                                                    }
                                                ],

                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: "$detailAvatar",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $project: {
                                                "_id": "$_id",
                                                "sequenceNumber": "$sequenceNumber",
                                                "createdAt": "$createdAt",
                                                "txtMessages": "$txtMessages",
                                                "senderInfo": {
                                                    "fullName": {
                                                        $arrayElemAt: ["$detailUserBasic.fullName", 0]
                                                    },
                                                    "username": "$detailUserAuth.username",
                                                    "avatar": "$detailAvatar",
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$arrayElemAt":
                                                                        [
                                                                            "$tempbadge", 0
                                                                        ]
                                                                },
                                                                null
                                                            ]
                                                    },
                                                    "isIdVerified": {
                                                        $arrayElemAt: ["$detailUserBasic.isIdVerified", 0]
                                                    },

                                                },
                                                "receiver": "$receiver",
                                                "sender": "$sender",
                                                "lineID": "$_id",
                                                "active": "$active",
                                                "updatedAt": "$updatedAt",

                                            }
                                        },
                                        {
                                            $sort: {
                                                updatedAt: 1
                                            }
                                        }
                                    ],

                                },

                            },
                            {
                                $lookup: {
                                    from: 'reactions_repo',
                                    as: 'emot',
                                    let: {
                                        localID: '$reactionUri'
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                $or: [
                                                    {
                                                        $expr: {
                                                            $eq: ['$URL', '$$localID']
                                                        }
                                                    },

                                                ]
                                            }
                                        },

                                    ],

                                },

                            },
                            {
                                $unwind: {
                                    path: "$emot",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: 'userbasics',
                                    localField: 'sender',
                                    foreignField: 'email',
                                    as: 'userBasic',

                                },

                            },
                            {
                                $unwind: {
                                    path: "$userbasic",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: 'userauths',
                                    localField: 'sender',
                                    foreignField: 'email',
                                    as: 'userAuth',

                                },

                            },
                            {
                                $unwind: {
                                    path: "$userAuth",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                "$lookup": {
                                    from: "mediaprofilepicts",
                                    as: "avatar",
                                    let: {
                                        localID: '$userBasic.profilePict.$id'
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                $expr: {
                                                    $in: ['$mediaID', {
                                                        $ifNull: ['$$localID', []]
                                                    }]
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                "mediaBasePath": 1,
                                                "mediaUri": 1,
                                                "originalName": 1,
                                                "fsSourceUri": 1,
                                                "fsSourceName": 1,
                                                "fsTargetUri": 1,
                                                "mediaType": 1,
                                                "mediaEndpoint": {
                                                    "$concat": ["/profilepict/", "$mediaID"]
                                                }
                                            }
                                        }
                                    ],

                                }
                            },
                            {
                                $unwind: {
                                    path: "$avatar",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $sort: {
                                    updatedAt: - 1
                                }
                            },
                            {
                                $skip: skip
                            },
                            {
                                $limit: row
                            },
                            {
                                "$addFields":
                                {
                                    "tempbadge":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$filter":
                                                    {
                                                        input:
                                                        {
                                                            "$arrayElemAt":
                                                                [
                                                                    "$userBasic.userBadge", 0
                                                                ]
                                                        },
                                                        as: "listbadge",
                                                        cond:
                                                        {
                                                            "$and":
                                                                [
                                                                    {
                                                                        "$eq":
                                                                            [
                                                                                "$$listbadge.isActive", true
                                                                            ]
                                                                    },
                                                                    {
                                                                        "$lte": [
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
                                                                            "$$listbadge.endDatetime"
                                                                        ]
                                                                    }
                                                                ]
                                                        }
                                                    }
                                                },
                                                []
                                            ]
                                    },
                                }
                            },
                            {
                                $project: {
                                    disqusLogs: [{
                                        "_id": "$_id",
                                        "sequenceNumber": "$sequenceNumber",
                                        "createdAt": "$createdAt",
                                        "txtMessages": "$txtMessages",
                                        "senderInfo": {
                                            "fullName": {
                                                $arrayElemAt: ["$userBasic.fullName", 0]
                                            },
                                            "username": "$userAuth.username",
                                            "avatar": "$avatar",
                                            "isIdVerified": {
                                                $arrayElemAt: ["$userBasic.isIdVerified", 0]
                                            },
                                            "urluserBadge":
                                            {
                                                "$ifNull":
                                                    [
                                                        {
                                                            "$arrayElemAt":
                                                                [
                                                                    "$tempbadge", 0
                                                                ]
                                                        },
                                                        null
                                                    ]
                                            }

                                        },
                                        "receiver": "$receiver",
                                        "sender": "$sender",
                                        "lineID": "$_id",
                                        "active": "$active",
                                        "updatedAt": "$updatedAt",
                                        detailDisquss: "$detailDisquss",

                                    }]
                                }
                            }
                        ],

                    },

                },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "countLogs",
                        let: {
                            localID: '$postID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$postID', '$$localID']
                                            }
                                        },
                                        {
                                            "active": true,

                                        },
                                    ]
                                }
                            }
                        ]
                    },

                },
                {
                    $project: {
                        "_id": 1,
                        "isIdVerified": { $arrayElemAt: ["$user.isIdVerified", 0] },
                        "user": 1,
                        "disqusID": 1,
                        "postID": 1,
                        "email": 1,
                        "eventType": 1,
                        "active": 1,
                        "room": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "disqusLogs": "$disqusLogs.disqusLogs",
                        "comment": {
                            $size: "$countLogs"
                        },
                        "urluserBadge":
                        {
                            "$ifNull":
                                [
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$tempbadgeowner", 0
                                            ]
                                    },
                                    null
                                ]
                        }
                    }
                },

            ]
        )
    }

    async getDiscus2(postId: string, eventType: string, page: number, row: number): Promise<Disqus[]> {
        let skip = this.paging(page, row);
        return await this.DisqusModel.aggregate(
            [
                {
                    $match: 
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        "postID": postId,
                                        
                                    },
                                    {
                                        "eventType": eventType,
                                        
                                    },
                                    {
                                        "active": true
                                    },
                                    
                                ]
                            },
                            
                        ]
                    },
                    
                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'user',
                        
                    },
                    
                },
                {
                    "$addFields": 
                    {
                        "tempbadgeowner": 
                        {
                            "$ifNull": 
                            [
                                {
                                    "$filter": 
                                    {
                                        input: 
                                        {
                                            "$arrayElemAt": 
                                            [
                                                "$user.userBadge",
                                                0
                                            ]
                                        },
                                        as: "listbadge",
                                        cond: 
                                        {
                                            "$and": 
                                            [
                                                {
                                                    "$eq": 
                                                    [
                                                        "$$listbadge.isActive",
                                                        true
                                                    ]
                                                },
                                                {
                                                    "$lte": [
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
                                                        "$$listbadge.endDatetime"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },
                                []
                            ]
                        },
                        
                    }
                },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$postID'
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
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                },
                                                {
                                                    'active': true
                                                },
                                                {
                                                    sequenceNumber: 0
                                                }
                                            ]
                                        },
                                        
                                    ]
                                },
                                
                            },
                            {
                                "$lookup": {
                                    from: "disquslogs",
                                    as: "detailDisquss",
                                    let: {
                                        localID: '$_id'
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
                                                                    $eq: ['$parentID', '$$localID']
                                                                }
                                                            },
                                                            {
                                                                'active': true
                                                            },
                                                            {
                                                                sequenceNumber: 1
                                                            }
                                                        ]
                                                    },
                                                    
                                                ]
                                            },
                                            
                                        },
                                        {
                                            $sort: {
                                                "updateAt": 1
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'reactions_repo',
                                                as: 'detailEmot',
                                                let: {
                                                    localID: '$reactionUri'
                                                },
                                                pipeline: [
                                                    {
                                                        $match: 
                                                        {
                                                            $or: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$URL', '$$localID']
                                                                    }
                                                                },
                                                                
                                                            ]
                                                        }
                                                    },
                                                    
                                                ],
                                                
                                            },
                                            
                                        },
                                        {
                                            $unwind: {
                                                path: "$detailEmot",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'newUserBasics',
                                                localField: 'sender',
                                                foreignField: 'email',
                                                as: 'detailUserBasic',
                                                
                                            },
                                            
                                        },
                                        {
                                            "$set": 
                                            {
                                                "tempbadge": 
                                                {
                                                    "$ifNull": 
                                                    [
                                                        {
                                                            "$filter": 
                                                            {
                                                                input: 
                                                                {
                                                                    "$arrayElemAt": 
                                                                    [
                                                                        "$detailUserBasic.userBadge",
                                                                        0
                                                                    ]
                                                                },
                                                                as: "listbadge",
                                                                cond: 
                                                                {
                                                                    "$and": 
                                                                    [
                                                                        {
                                                                            "$eq": 
                                                                            [
                                                                                "$$listbadge.isActive",
                                                                                true
                                                                            ]
                                                                        },
                                                                        {
                                                                            "$lte": [
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
                                                                                "$$listbadge.endDatetime"
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            }
                                                        },
                                                        []
                                                    ]
                                                },
                                                
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: "$detailUserbasic",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                       //{
                                       //    $lookup: {
                                       //        from: 'userauths',
                                       //        localField: 'sender',
                                       //        foreignField: 'email',
                                       //        as: 'detailUserAuth',
                                       //        
                                       //    },
                                       //    
                                       //},
                                       //{
                                       //    $unwind: {
                                       //        path: "$detailUserAuth",
                                       //        preserveNullAndEmptyArrays: true
                                       //    }
                                       //},
                                        //{
                                        //    "$lookup": {
                                        //        from: "mediaprofilepicts",
                                        //        as: "detailAvatar",
                                        //        let: {
                                        //            localID: '$detailUserBasic.profilePict.$id'
                                        //        },
                                        //        pipeline: [
                                        //            {
                                        //                $match: 
                                        //                {
                                        //                    $expr: {
                                        //                        $in: ['$mediaID', {
                                        //                            $ifNull: ['$$localID', []]
                                        //                        }]
                                        //                    }
                                        //                }
                                        //            },
                                        //            {
                                        //                $project: {
                                        //                    "mediaBasePath": 1,
                                        //                    "mediaUri": 1,
                                        //                    "originalName": 1,
                                        //                    "fsSourceUri": 1,
                                        //                    "fsSourceName": 1,
                                        //                    "fsTargetUri": 1,
                                        //                    "mediaType": 1,
                                        //                    "mediaEndpoint": {
                                        //                        "$concat": ["/profilepict/", "$mediaID"]
                                        //                    }
                                        //                }
                                        //            }
                                        //        ],
                                        //        
                                        //    }
                                        //},
                                        //{
                                        //    $unwind: {
                                        //        path: "$detailAvatar",
                                        //        preserveNullAndEmptyArrays: true
                                        //    }
                                        //},
                                        {
                                            $project: {
                                                "_id": "$_id",
                                                "sequenceNumber": "$sequenceNumber",
                                                "createdAt": "$createdAt",
                                                "txtMessages": "$txtMessages",
                                                "senderInfo": {
                                                    "fullName": {
                                                        $arrayElemAt: ["$detailUserBasic.fullName", 0]
                                                    },
                                                    "username": {
                                                        $arrayElemAt: ["$detailUserBasic.username", 0]
                                                    },
                                                    "avatar":
                                                                                            {
                                                           "mediaBasePath":  {
                                                            $arrayElemAt: ["$detailUserBasic.mediaBasePath", 0]
                                                        },
                                                           "mediaUri":  {
                                                            $arrayElemAt: ["$detailUserBasic.mediaUri", 0]
                                                        },
                                                           "originalName":  {
                                                            $arrayElemAt: ["$detailUserBasic.originalName", 0]
                                                        },
                                                           "fsSourceUri":  {
                                                            $arrayElemAt: ["$detailUserBasic.fsSourceUri", 0]
                                                        },
                                                           "fsSourceName":  {
                                                            $arrayElemAt: ["$detailUserBasic.fsSourceName", 0]
                                                        },
                                                           "fsTargetUri":  {
                                                            $arrayElemAt: ["$detailUserBasic.fsTargetUri", 0]
                                                        },
                                                           "mediaType":  {
                                                            $arrayElemAt: ["$detailUserBasic.mediaType", 0]
                                                        },
                                                          "mediaEndpoint":  {
                                                            $arrayElemAt: ["$detailUserBasic.mediaEndpoint", 0]
                                                        },
                                                   },
                                                    "urluserBadge": 
                                                    {
                                                        "$ifNull": 
                                                        [
                                                            {
                                                                "$arrayElemAt": 
                                                                [
                                                                    "$tempbadge",
                                                                    0
                                                                ]
                                                            },
                                                            null
                                                        ]
                                                    },
                                                    "isIdVerified": {
                                                        $arrayElemAt: ["$detailUserBasic.isIdVerified", 0]
                                                    },
                                                    
                                                },
                                                "receiver": "$receiver",
                                                "sender": "$sender",
                                                "lineID": "$_id",
                                                "active": "$active",
                                                "updatedAt": "$updatedAt",
                                                
                                            }
                                        },
                                        {
                                            $sort: {
                                                updatedAt: 1
                                            }
                                        }
                                    ],
                                    
                                },
                                
                            },
                            {
                                $lookup: {
                                    from: 'reactions_repo',
                                    as: 'emot',
                                    let: {
                                        localID: '$reactionUri'
                                    },
                                    pipeline: [
                                        {
                                            $match: 
                                            {
                                                $or: [
                                                    {
                                                        $expr: {
                                                            $eq: ['$URL', '$$localID']
                                                        }
                                                    },
                                                    
                                                ]
                                            }
                                        },
                                        
                                    ],
                                    
                                },
                                
                            },
                            {
                                $unwind: {
                                    path: "$emot",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: 'newUserBasics',
                                    localField: 'sender',
                                    foreignField: 'email',
                                    as: 'userBasic',
                                    
                                },
                                
                            },
                            {
                                $unwind: {
                                    path: "$userbasic",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $unwind: {
                                    path: "$avatar",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $sort: {
                                    updatedAt: - 1
                                }
                            },
                            {
                                $skip: skip
                            },
                            {
                                $limit: row
                            },
                            {
                                "$addFields": 
                                {
                                    "tempbadge": 
                                    {
                                        "$ifNull": 
                                        [
                                            {
                                                "$filter": 
                                                {
                                                    input: 
                                                    {
                                                        "$arrayElemAt": 
                                                        [
                                                            "$userBasic.userBadge",
                                                            0
                                                        ]
                                                    },
                                                    as: "listbadge",
                                                    cond: 
                                                    {
                                                        "$and": 
                                                        [
                                                            {
                                                                "$eq": 
                                                                [
                                                                    "$$listbadge.isActive",
                                                                    true
                                                                ]
                                                            },
                                                            {
                                                                "$lte": [
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
                                                                    "$$listbadge.endDatetime"
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            []
                                        ]
                                    },
                                    
                                }
                            },
                            {
                                $project: {
                                    disqusLogs: [{
                                        "_id": "$_id",
                                        "sequenceNumber": "$sequenceNumber",
                                        "createdAt": "$createdAt",
                                        "txtMessages": "$txtMessages",
                                        "senderInfo": {
                                            "fullName": {
                                                $arrayElemAt: ["$userBasic.fullName", 0]
                                            },
                                            "username": {
                                                $arrayElemAt: ["$userBasic.username", 0]
                                            },
                                            "avatar": 
                                                                                            {
                                                           "mediaBasePath": {
                                                            $arrayElemAt: ["$userBasic.mediaBasePath", 0]
                                                        },
                                                           "mediaUri": {
                                                            $arrayElemAt: ["$userBasic.mediaUri", 0]
                                                        },
                                                           "originalName":{
                                                            $arrayElemAt: ["$userBasic.originalName", 0]
                                                        },
                                                           "fsSourceUri": {
                                                            $arrayElemAt: ["$userBasic.fsSourceUri", 0]
                                                        },
                                                           "fsSourceName":{
                                                            $arrayElemAt: ["$userBasic.fsSourceName", 0]
                                                        },
                                                           "fsTargetUri": {
                                                            $arrayElemAt: ["$userBasic.fsTargetUri", 0]
                                                        },
                                                           "mediaType": {
                                                            $arrayElemAt: ["$userBasic.mediaType", 0]
                                                        },
                                                          "mediaEndpoint":{
                                                            $arrayElemAt: ["$userBasic.mediaEndpoint", 0]
                                                        },
                                                   },
                                            "isIdVerified": {
                                                $arrayElemAt: ["$userBasic.isIdVerified", 0]
                                            },
                                            "urluserBadge": 
                                            {
                                                "$ifNull": 
                                                [
                                                    {
                                                        "$arrayElemAt": 
                                                        [
                                                            "$tempbadge",
                                                            0
                                                        ]
                                                    },
                                                    null
                                                ]
                                            }
                                        },
                                        "receiver": "$receiver",
                                        "sender": "$sender",
                                        "lineID": "$_id",
                                        "active": "$active",
                                        "updatedAt": "$updatedAt",
                                        detailDisquss: "$detailDisquss",
                                        
                                    }]
                                }
                            }
                        ],
                        
                    },
                    
                },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "countLogs",
                        let: {
                            localID: '$postID'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$postID', '$$localID']
                                            }
                                        },
                                        {
                                            "active": true,
                                            
                                        },
                                        
                                    ]
                                }
                            }
                        ]
                    },
                    
                },
                {
                    $project: {
                        "_id": 1,
                        "isIdVerified": {
                            $arrayElemAt: ["$user.isIdVerified", 0]
                        },
                        "user": 1,
                        "disqusID": 1,
                        "postID": 1,
                        "email": 1,
                        "eventType": 1,
                        "active": 1,
                        "room": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "disqusLogs": "$disqusLogs.disqusLogs",
                        "comment": {
                            $size: "$countLogs"
                        },
                        "urluserBadge": 
                        {
                            "$ifNull": 
                            [
                                {
                                    "$arrayElemAt": 
                                    [
                                        "$tempbadgeowner",
                                        0
                                    ]
                                },
                                null
                            ]
                        }
                    }
                },
            ]
        )
    }

    private paging(page: number, row: number) {
        if (page == 0 || page == 1) {
            return 0;
        }
        let num = ((page - 1) * row);
        return num;
    }

    async findDisqusByPost(postId: string, eventType: string): Promise<Disqus[]> {
        return await this.DisqusModel.find().where('postID', postId).where('eventType', eventType).exec();
    }

    async findDisqusByPost_(postId: string, eventType: string): Promise<Disqus> {
        //return await this.DisqusModel.findOne().where('email', email).where('postID', postId).where('eventType', eventType).exec();
        return await this.DisqusModel.findOne().where('postID', postId).where('eventType', eventType).where('active', true).exec();
    }

    async createDisqus(body: any, headers: any): Promise<DisqusResponseApps> {

        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var profile = await this.userService.findOne(auth.email);
        this.logger.log('createDisqus >>> profile: ' + profile);

        let res = new DisqusResponseApps();
        res.response_code = 202;

        let et = body.eventType;
        if (et != 'DIRECT_MSG' && et != 'COMMENT') {
            let inf = [];
            inf.push("Unable to proceed. Only accept DM and Comment");
            res.response_code = 204;
            return res;
        }

        let qr = body.isQuery;
        if (qr == true || qr == 'true') {
            let cts = this.queryDiscuss(body, profile);

            this.logger.log(JSON.stringify(cts));
        }
        return res;
    }

    async queryDiscuss(body: any, whoami: Userbasic) {
        let contact: Disquscontacts[] = [];
        if (body.receiverParty != undefined) {
            contact = await this.disqconService.findDisqusByEmail(body.email);
        } else {
            contact = await this.disqconService.findByEmailAndMate(body.email, body.receiverParty);
        }

        return contact;
    }

    async queryDiscussV2(email: string) {
        let query = await this.DisqusModel.aggregate(
            [
                {
                    $match:
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        "email": email
                                    },
                                    {
                                        "eventType": "DIRECT_MSG"
                                    },
                                    {
                                        "emailActive": true
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        "mate": email
                                    },
                                    {
                                        "eventType": "DIRECT_MSG"
                                    },
                                    {
                                        "mateActive": true
                                    },

                                ]
                            },

                        ]
                    },

                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',

                    },

                },
                // {
                //     $lookup: {
                //         from: 'userauths',
                //         localField: 'email',
                //         foreignField: 'email',
                //         as: 'userUserAuth',

                //     },

                // },
                // {
                //     "$lookup": {
                //         from: "mediaprofilepicts",
                //         as: "avatar",
                //         let: {
                //             localID: '$userUserBasic.profilePict.$id'
                //         },
                //         pipeline: [
                //             {
                //                 $match:
                //                 {


                //                     $expr: {
                //                         $in: ['$mediaID', '$$localID']
                //                     }
                //                 }
                //             },
                //             {
                //                 $project: {
                //                     "mediaBasePath": 1,
                //                     "mediaUri": 1,
                //                     "originalName": 1,
                //                     "fsSourceUri": 1,
                //                     "fsSourceName": 1,
                //                     "fsTargetUri": 1,
                //                     "mediaType": 1,
                //                     "mediaEndpoint": {
                //                         "$concat": ["/profilepict/", "$mediaID"]
                //                     }
                //                 }
                //             }
                //         ],

                //     }
                // },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',

                    },

                },
                // {
                //     $lookup: {
                //         from: 'userauths',
                //         localField: 'mate',
                //         foreignField: 'email',
                //         as: 'mateUserAuth',

                //     },

                // },
                // {
                //     "$lookup": {
                //         from: "mediaprofilepicts",
                //         as: "mateAvatar",
                //         let: {
                //             localID: '$mateUserBasic.profilePict.$id'
                //         },
                //         pipeline: [
                //             {
                //                 $match:
                //                 {

                //                     $expr: {
                //                         $in: ['$mediaID', '$$localID']
                //                     }
                //                 }
                //             },
                //             {
                //                 $project: {
                //                     "mediaBasePath": 1,
                //                     "mediaUri": 1,
                //                     "originalName": 1,
                //                     "fsSourceUri": 1,
                //                     "fsSourceName": 1,
                //                     "fsTargetUri": 1,
                //                     "mediaType": 1,
                //                     "mediaEndpoint": {
                //                         "$concat": ["/profilepict/", "$mediaID"]
                //                     }
                //                 }
                //             }
                //         ],

                //     }
                // },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
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
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },

                                            ]
                                        },

                                    ]
                                },

                            },
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $or: [
                                                        {
                                                            'senderActive': true
                                                        },
                                                        {
                                                            'senderActive': null
                                                        },

                                                    ]
                                                },
                                                {
                                                    'sender': email
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $or: [
                                                        {
                                                            'receiverActive': true
                                                        },
                                                        {
                                                            'receiverActive': null
                                                        },

                                                    ]
                                                },
                                                {
                                                    'receiver': email
                                                }
                                            ]
                                        },

                                    ]
                                },

                            },
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },

                        ],

                    },

                },
                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },

                                    ]
                                }
                            },

                        ],

                    },

                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // {
                //     $unwind: {
                //         path: "$userUserAuth",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // {
                //     $unwind: {
                //         path: "$mateUserAuth",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                // {
                //     $unwind: {
                //         path: "$avatar",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                // {
                //     $unwind: {
                //         path: "$mateAvatar",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                {
                    $project: {
                        "diss": 1,
                        "emailActive": 1,
                        "email":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else: '$mate'
                            }
                        },
                        "username":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserAuth.username",
                                else: '$mateUserAuth.username'
                            }
                        },
                        "fullName":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else: '$mateUserBasic.fullName'
                            }
                        },
                        urluserBadge:
                        {
                            "$ifNull":
                                [
                                    {
                                        "$filter":
                                        {
                                            input: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$email", email]
                                                    },
                                                    then: "$userUserBasic.userBadge",
                                                    else: '$mateUserBasic.userBadge'
                                                }
                                            },

                                            as: "listbadge",
                                            cond:
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$eq":
                                                                [
                                                                    "$$listbadge.isActive",
                                                                    true
                                                                ]
                                                        },
                                                        {
                                                            "$lte": [
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
                                                                "$$listbadge.endDatetime"
                                                            ]
                                                        }
                                                    ]
                                            }
                                        }
                                    },
                                    []
                                ]
                        },
                        "avatar":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$avatar",
                                else: '$mateAvatar'
                            }
                        },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1, //}],
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo":
                        {
                            "email":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else: '$mate'
                                }
                            },
                            "username":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserAuth.username",
                                    else: '$mateUserAuth.username'
                                }
                            },
                            "fullName":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else: '$mateUserBasic.fullName'
                                }
                            },
                            urluserBadge:
                            {
                                "$ifNull":
                                    [
                                        {
                                            "$filter":
                                            {
                                                input: {
                                                    $cond: {
                                                        if: {
                                                            $eq: ["$mate", email]
                                                        },
                                                        then: "$userUserBasic.userBadge",
                                                        else: '$mateUserBasic.userBadge'
                                                    }
                                                },

                                                as: "listbadge",
                                                cond:
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$listbadge.isActive",
                                                                        true
                                                                    ]
                                                            },
                                                            {
                                                                "$lte": [
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
                                                                    "$$listbadge.endDatetime"
                                                                ]
                                                            }
                                                        ]
                                                }
                                            }
                                        },
                                        []
                                    ]
                            },
                            "avatar":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$avatar",
                                    else: '$mateAvatar'
                                }
                            },

                        },

                    }
                },
                {
                    $sort: {
                        "updatedAt": - 1
                    }
                },

            ]

        ).exec();

        return query;
    }

    async queryDiscussV2ByDisqusIs(id: string, email: string) {
        let query = await this.DisqusModel.aggregate(

            [
                {
                    $match:
                    {
                        disqusID: id
                    },

                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',

                    },

                },
                // {
                //     $lookup: {
                //         from: 'userauths',
                //         localField: 'email',
                //         foreignField: 'email',
                //         as: 'userUserAuth',

                //     },

                // },
                // {
                //     "$lookup": {
                //         from: "mediaprofilepicts",
                //         as: "avatar",
                //         let: {
                //             localID: '$userUserBasic.profilePict.$id'
                //         },
                //         pipeline: [
                //             {
                //                 $match:
                //                 {


                //                     $expr: {
                //                         $in: ['$mediaID', '$$localID']
                //                     }
                //                 }
                //             },
                //             {
                //                 $project: {
                //                     "mediaBasePath": 1,
                //                     "mediaUri": 1,
                //                     "originalName": 1,
                //                     "fsSourceUri": 1,
                //                     "fsSourceName": 1,
                //                     "fsTargetUri": 1,
                //                     "mediaType": 1,
                //                     "mediaEndpoint": {
                //                         "$concat": ["/profilepict/", "$mediaID"]
                //                     }
                //                 }
                //             }
                //         ],

                //     }
                // },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',

                    },

                },
                // {
                //     $lookup: {
                //         from: 'userauths',
                //         localField: 'mate',
                //         foreignField: 'email',
                //         as: 'mateUserAuth',

                //     },

                // },
                // {
                //     "$lookup": {
                //         from: "mediaprofilepicts",
                //         as: "mateAvatar",
                //         let: {
                //             localID: '$mateUserBasic.profilePict.$id'
                //         },
                //         pipeline: [
                //             {
                //                 $match:
                //                 {

                //                     $expr: {
                //                         $in: ['$mediaID', '$$localID']
                //                     }
                //                 }
                //             },
                //             {
                //                 $project: {
                //                     "mediaBasePath": 1,
                //                     "mediaUri": 1,
                //                     "originalName": 1,
                //                     "fsSourceUri": 1,
                //                     "fsSourceName": 1,
                //                     "fsTargetUri": 1,
                //                     "mediaType": 1,
                //                     "mediaEndpoint": {
                //                         "$concat": ["/profilepict/", "$mediaID"]
                //                     }
                //                 }
                //             }
                //         ],

                //     }
                // },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
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
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "senderActive": {
                                                        $ne: false
                                                    }
                                                },
                                                {
                                                    "recieverActive": {
                                                        $ne: false
                                                    }
                                                }

                                            ]
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    "createdAt": 1,
                                    "reactionUri": 1,
                                    "txtMessages": 1,
                                    "receiver": 1,
                                    "postType": 1,
                                    "sender": 1,
                                    "lineID": 1,
                                    "active": 1,
                                    "disqusID": 1,
                                    "updatedAt": 1,
                                    "reaction_icon": "$emot.icon",
                                    "content": "$medias",
                                }
                            },
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },

                        ],

                    },

                },
                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },

                                    ]
                                }
                            },

                        ],

                    },

                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "emailActive": 1,
                        "email":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else: '$mate'
                            }
                        },
                        // "username":
                        // {
                        //     $cond: {
                        //         if: {
                        //             $eq: ["$email", email]
                        //         },
                        //         then: "$userUserAuth.username",
                        //         else: '$mateUserAuth.username'
                        //     }
                        // },
                        "fullName":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else: '$mateUserBasic.fullName'
                            }
                        },
                        urluserBadge:
                        {
                            "$ifNull":
                                [
                                    {
                                        "$filter":
                                        {
                                            input: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$email", email]
                                                    },
                                                    then: "$userUserBasic.userBadge",
                                                    else: '$mateUserBasic.userBadge'
                                                }
                                            },

                                            as: "listbadge",
                                            cond:
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$eq":
                                                                [
                                                                    "$$listbadge.isActive",
                                                                    true
                                                                ]
                                                        },
                                                        {
                                                            "$lte": [
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
                                                                "$$listbadge.endDatetime"
                                                            ]
                                                        }
                                                    ]
                                            }
                                        }
                                    },
                                    []
                                ]
                        },
                        // "avatar":
                        // {
                        //     $cond: {
                        //         if: {
                        //             $eq: ["$email", email]
                        //         },
                        //         then: "$avatar",
                        //         else: '$mateAvatar'
                        //     }
                        // },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1,
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo":
                        {
                            "email":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else: '$mate'
                                }
                            },
                            // "username":
                            // {
                            //     $cond: {
                            //         if: {
                            //             $eq: ["$mate", email]
                            //         },
                            //         then: "$userUserAuth.username",
                            //         else: '$mateUserAuth.username'
                            //     }
                            // },
                            "fullName":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else: '$mateUserBasic.fullName'
                                }
                            },
                            urluserBadge:
                            {
                                "$ifNull":
                                    [
                                        {
                                            "$filter":
                                            {
                                                input: {
                                                    $cond: {
                                                        if: {
                                                            $eq: ["$mate", email]
                                                        },
                                                        then: "$userUserBasic.userBadge",
                                                        else: '$mateUserBasic.userBadge'
                                                    }
                                                },

                                                as: "listbadge",
                                                cond:
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$listbadge.isActive",
                                                                        true
                                                                    ]
                                                            },
                                                            {
                                                                "$lte": [
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
                                                                    "$$listbadge.endDatetime"
                                                                ]
                                                            }
                                                        ]
                                                }
                                            }
                                        },
                                        []
                                    ]
                            },
                            // "avatar":
                            // {
                            //     $cond: {
                            //         if: {
                            //             $eq: ["$mate", email]
                            //         },
                            //         then: "$avatar",
                            //         else: '$mateAvatar'
                            //     }
                            // },

                        },

                    }
                },
                {
                    $sort: {
                        "createdAt": - 1
                    }
                },

            ]

        ).exec();

        return query;
    }

    async queryDiscussV2New(email: string) {
        let query = await this.DisqusModel.aggregate(
            [
                {
                    $match:
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        "email": email
                                    },
                                    {
                                        "eventType": "DIRECT_MSG"
                                    },
                                    {
                                        "emailActive": true
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        "mate": email
                                    },
                                    {
                                        "eventType": "DIRECT_MSG"
                                    },
                                    {
                                        "mateActive": true
                                    },

                                ]
                            },

                        ]
                    },

                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',
                        
                    },
                    
                },
                //                 {
                //                     $lookup: {
                //                         from: 'userauths',
                //                         localField: 'email',
                //                         foreignField: 'email',
                //                         as: 'userUserAuth',
                // 
                //                     },
                // 
                //                 },
                //                 {
                //                     "$lookup": {
                //                         from: "mediaprofilepicts",
                //                         as: "avatar",
                //                         let: {
                //                             localID: '$userUserBasic.profilePict.$id'
                //                         },
                //                         pipeline: [
                //                             {
                //                                 $match:
                //                                 {
                // 
                // 
                //                                     $expr: {
                //                                         $in: ['$mediaID', '$$localID']
                //                                     }
                //                                 }
                //                             },
                //                             {
                //                                 $project: {
                //                                     "mediaBasePath": 1,
                //                                     "mediaUri": 1,
                //                                     "originalName": 1,
                //                                     "fsSourceUri": 1,
                //                                     "fsSourceName": 1,
                //                                     "fsTargetUri": 1,
                //                                     "mediaType": 1,
                //                                     "mediaEndpoint": {
                //                                         "$concat": ["/profilepict/", "$mediaID"]
                //                                     }
                //                                 }
                //                             }
                //                         ],
                // 
                //                     }
                //                 },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',
                        
                    },
                    
                },
                //                 {
                //                     $lookup: {
                //                         from: 'userauths',
                //                         localField: 'mate',
                //                         foreignField: 'email',
                //                         as: 'mateUserAuth',
                // 
                //                     },
                // 
                //                 },
                //                 {
                //                     "$lookup": {
                //                         from: "mediaprofilepicts",
                //                         as: "mateAvatar",
                //                         let: {
                //                             localID: '$mateUserBasic.profilePict.$id'
                //                         },
                //                         pipeline: [
                //                             {
                //                                 $match:
                //                                 {
                // 
                //                                     $expr: {
                //                                         $in: ['$mediaID', '$$localID']
                //                                     }
                //                                 }
                //                             },
                //                             {
                //                                 $project: {
                //                                     "mediaBasePath": 1,
                //                                     "mediaUri": 1,
                //                                     "originalName": 1,
                //                                     "fsSourceUri": 1,
                //                                     "fsSourceName": 1,
                //                                     "fsTargetUri": 1,
                //                                     "mediaType": 1,
                //                                     "mediaEndpoint": {
                //                                         "$concat": ["/profilepict/", "$mediaID"]
                //                                     }
                //                                 }
                //                             }
                //                         ],
                // 
                //                     }
                //                 },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
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
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                
                                            ]
                                        },
                                        
                                    ]
                                },
                                
                            },
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $or: [
                                                        {
                                                            'senderActive': true
                                                        },
                                                        {
                                                            'senderActive': null
                                                        },
                                                        
                                                    ]
                                                },
                                                {
                                                    'sender': email
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $or: [
                                                        {
                                                            'receiverActive': true
                                                        },
                                                        {
                                                            'receiverActive': null
                                                        },
                                                        
                                                    ]
                                                },
                                                {
                                                    'receiver': email
                                                }
                                            ]
                                        },
                                        
                                    ]
                                },
                                
                            },
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },
                                        
                                    ]
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                //                 {
                //                     $unwind: {
                //                         path: "$userUserAuth",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                //                 {
                //                     $unwind: {
                //                         path: "$mateUserAuth",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                //                 {
                //                     $unwind: {
                //                         path: "$avatar",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                //                 {
                //                     $unwind: {
                //                         path: "$mateAvatar",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                {
                    $addFields: {
                        avatar: {
                            "mediaBasePath": '$userUserBasic.mediaBasePath',
                            "mediaUri": '$userUserBasic.mediaUri',
                            "originalName": '$userUserBasic.originalName',
                            "fsSourceUri": '$userUserBasic.fsSourceUri',
                            "fsSourceName": '$userUserBasic.fsSourceName',
                            "fsTargetUri": '$userUserBasic.fsTargetUri',
                            "mediaType": '$userUserBasic.mediaType',
                            "mediaEndpoint": '$userUserBasic.mediaEndpoint',
                            
                        },
                        mateAvatar: {
                            "mediaBasePath": '$mateUserBasic.mediaBasePath',
                            "mediaUri": '$mateUserBasic.mediaUri',
                            "originalName": '$mateUserBasic.originalName',
                            "fsSourceUri": '$mateUserBasic.fsSourceUri',
                            "fsSourceName": '$mateUserBasic.fsSourceName',
                            "fsTargetUri": '$mateUserBasic.fsTargetUri',
                            "mediaType": '$mateUserBasic.mediaType',
                            "mediaEndpoint": '$mateUserBasic.mediaEndpoint',
                            
                        }
                    }
                },
                {
                    $project: {
                        "diss": 1,
                        "emailActive": 1,
                        "email": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else : '$mate'
                            }
                        },
                        "username": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.username",
                                else : '$mateUserBasic.username'
                            }
                        },
                        "fullName": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else : '$mateUserBasic.fullName'
                            }
                        },
                        urluserBadge: 
                            {
                            "$ifNull": 
                            [
                                {
                                    "$filter": 
                                    {
                                        input: {
                                            $cond: {
                                                if : {
                                                    $eq: ["$email", email]
                                                },
                                                then: "$userUserBasic.userBadge",
                                                else : '$mateUserBasic.userBadge'
                                            }
                                        },
                                        as: "listbadge",
                                        cond: 
                                            {
                                            "$and": 
                                            [
                                                {
                                                    "$eq": 
                                                    [
                                                        "$$listbadge.isActive",
                                                        true
                                                    ]
                                                },
                                                {
                                                    "$lte": [
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
                                                        "$$listbadge.endDatetime"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },
                                []
                            ]
                        },
                        "avatar": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$avatar",
                                else : '$mateAvatar'
                            }
                        },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1, //}],
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo": 
                            {
                            "email": 
                            {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else : '$mate'
                                }
                            },
                            "username": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.username",
                                    else : '$mateUserBasic.username'
                                }
                            },
                            "fullName": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else : '$mateUserBasic.fullName'
                                }
                            },
                            urluserBadge: 
                                {
                                "$ifNull": 
                                [
                                    {
                                        "$filter": 
                                        {
                                            input: {
                                                $cond: {
                                                    if : {
                                                        $eq: ["$mate", email]
                                                    },
                                                    then: "$userUserBasic.userBadge",
                                                    else : '$mateUserBasic.userBadge'
                                                }
                                            },
                                            as: "listbadge",
                                            cond: 
                                                {
                                                "$and": 
                                                [
                                                    {
                                                        "$eq": 
                                                        [
                                                            "$$listbadge.isActive",
                                                            true
                                                        ]
                                                    },
                                                    {
                                                        "$lte": [
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
                                                            "$$listbadge.endDatetime"
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    []
                                ]
                            },
                            "avatar": 
                            {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$avatar",
                                    else : '$mateAvatar'
                                }
                            },
                            
                        },
                        
                    }
                },
                {
                    $sort: {
                        "updatedAt": - 1
                    }
                },
            ]

        ).exec();

        return query;
    }

    async queryDiscussV2ByDisqusIsNew(id: string, email: string) {
        let query = await this.DisqusModel.aggregate(

            [
                {
                    $match:
                    {
                        disqusID: id
                    },

                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',

                    },

                },
                //                {
                //                    $lookup: {
                //                        from: 'userauths',
                //                        localField: 'email',
                //                        foreignField: 'email',
                //                        as: 'userUserAuth',
                //
                //                    },
                //
                //                },
                {
                    "$lookup": {
                        from: "mediaprofilepicts",
                        as: "avatar",
                        let: {
                            localID: '$userUserBasic.profilePict.$id'
                        },
                        pipeline: [
                            {
                                $match:
                                {


                                    $expr: {
                                        $in: ['$mediaID', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": {
                                        "$concat": ["/profilepict/", "$mediaID"]
                                    }
                                }
                            }
                        ],

                    }
                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',

                    },

                },
                //                {
                //                    $lookup: {
                //                        from: 'userauths',
                //                        localField: 'mate',
                //                        foreignField: 'email',
                //                        as: 'mateUserAuth',
                //
                //                    },
                //
                //                },
                {
                    "$lookup": {
                        from: "mediaprofilepicts",
                        as: "mateAvatar",
                        let: {
                            localID: '$mateUserBasic.profilePict.$id'
                        },
                        pipeline: [
                            {
                                $match:
                                {

                                    $expr: {
                                        $in: ['$mediaID', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    "mediaBasePath": 1,
                                    "mediaUri": 1,
                                    "originalName": 1,
                                    "fsSourceUri": 1,
                                    "fsSourceName": 1,
                                    "fsTargetUri": 1,
                                    "mediaType": 1,
                                    "mediaEndpoint": {
                                        "$concat": ["/profilepict/", "$mediaID"]
                                    }
                                }
                            }
                        ],

                    }
                },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
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
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "senderActive": {
                                                        $ne: false
                                                    }
                                                },
                                                {
                                                    "recieverActive": {
                                                        $ne: false
                                                    }
                                                }

                                            ]
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    "createdAt": 1,
                                    "reactionUri": 1,
                                    "txtMessages": 1,
                                    "receiver": 1,
                                    "postType": 1,
                                    "sender": 1,
                                    "lineID": 1,
                                    "active": 1,
                                    "disqusID": 1,
                                    "updatedAt": 1,
                                    "reaction_icon": "$emot.icon",
                                    "content": "$medias",
                                }
                            },
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },

                        ],

                    },

                },
                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },

                                    ]
                                }
                            },

                        ],

                    },

                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                //                {
                //                    $unwind: {
                //                        path: "$userUserAuth",
                //                        preserveNullAndEmptyArrays: true
                //                    }
                //                },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                //                {
                //                    $unwind: {
                //                        path: "$mateUserAuth",
                //                        preserveNullAndEmptyArrays: true
                //                    }
                //                },
                {
                    $unwind: {
                        path: "$avatar",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$mateAvatar",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "emailActive": 1,
                        "email":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else: '$mate'
                            }
                        },
                        "username":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.username",
                                else: '$mateUserBasic.username'
                            }
                        },
                        "fullName":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else: '$mateUserBasic.fullName'
                            }
                        },
                        urluserBadge:
                        {
                            "$ifNull":
                                [
                                    {
                                        "$filter":
                                        {
                                            input: {
                                                $cond: {
                                                    if: {
                                                        $eq: ["$email", email]
                                                    },
                                                    then: "$userUserBasic.userBadge",
                                                    else: '$mateUserBasic.userBadge'
                                                }
                                            },

                                            as: "listbadge",
                                            cond:
                                            {
                                                "$and":
                                                    [
                                                        {
                                                            "$eq":
                                                                [
                                                                    "$$listbadge.isActive",
                                                                    true
                                                                ]
                                                        },
                                                        {
                                                            "$lte": [
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
                                                                "$$listbadge.endDatetime"
                                                            ]
                                                        }
                                                    ]
                                            }
                                        }
                                    },
                                    []
                                ]
                        },
                        "avatar":
                        {
                            $cond: {
                                if: {
                                    $eq: ["$email", email]
                                },
                                then: "$avatar",
                                else: '$mateAvatar'
                            }
                        },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1,
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo":
                        {
                            "email":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else: '$mate'
                                }
                            },
                            "username":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.username",
                                    else: '$mateUserBasic.username'
                                }
                            },
                            "fullName":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else: '$mateUserBasic.fullName'
                                }
                            },
                            urluserBadge:
                            {
                                "$ifNull":
                                    [
                                        {
                                            "$filter":
                                            {
                                                input: {
                                                    $cond: {
                                                        if: {
                                                            $eq: ["$mate", email]
                                                        },
                                                        then: "$userUserBasic.userBadge",
                                                        else: '$mateUserBasic.userBadge'
                                                    }
                                                },

                                                as: "listbadge",
                                                cond:
                                                {
                                                    "$and":
                                                        [
                                                            {
                                                                "$eq":
                                                                    [
                                                                        "$$listbadge.isActive",
                                                                        true
                                                                    ]
                                                            },
                                                            {
                                                                "$lte": [
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
                                                                    "$$listbadge.endDatetime"
                                                                ]
                                                            }
                                                        ]
                                                }
                                            }
                                        },
                                        []
                                    ]
                            },
                            "avatar":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$avatar",
                                    else: '$mateAvatar'
                                }
                            },

                        },

                    }
                },
                {
                    $sort: {
                        "createdAt": - 1
                    }
                }

            ]

        ).exec();

        return query;
    }

    async queryDiscussV2ByDisqusIsNewv2(id: string, email: string) {
        let query = await this.DisqusModel.aggregate(

            [
                {
                    $match:
                    {
                        disqusID: id
                    },

                },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'userUserBasic',
                        
                    },
                    
                },
                //                 {
                //                     $lookup: {
                //                         from: 'userauths',
                //                         localField: 'email',
                //                         foreignField: 'email',
                //                         as: 'userUserAuth',
                // 
                //                     },
                // 
                //                 },
                //                 {
                //                     "$lookup": {
                //                         from: "mediaprofilepicts",
                //                         as: "avatar",
                //                         let: {
                //                             localID: '$userUserBasic.profilePict.$id'
                //                         },
                //                         pipeline: [
                //                             {
                //                                 $match:
                //                                 {
                // 
                // 
                //                                     $expr: {
                //                                         $in: ['$mediaID', '$$localID']
                //                                     }
                //                                 }
                //                             },
                //                             {
                //                                 $project: {
                //                                     "mediaBasePath": 1,
                //                                     "mediaUri": 1,
                //                                     "originalName": 1,
                //                                     "fsSourceUri": 1,
                //                                     "fsSourceName": 1,
                //                                     "fsTargetUri": 1,
                //                                     "mediaType": 1,
                //                                     "mediaEndpoint": {
                //                                         "$concat": ["/profilepict/", "$mediaID"]
                //                                     }
                //                                 }
                //                             }
                //                         ],
                // 
                //                     }
                //                 },
                {
                    $lookup: {
                        from: 'newUserBasics',
                        localField: 'mate',
                        foreignField: 'email',
                        as: 'mateUserBasic',
                        
                    },
                    
                },
                //                 {
                //                     $lookup: {
                //                         from: 'userauths',
                //                         localField: 'mate',
                //                         foreignField: 'email',
                //                         as: 'mateUserAuth',
                // 
                //                     },
                // 
                //                 },
                //                 {
                //                     "$lookup": {
                //                         from: "mediaprofilepicts",
                //                         as: "mateAvatar",
                //                         let: {
                //                             localID: '$mateUserBasic.profilePict.$id'
                //                         },
                //                         pipeline: [
                //                             {
                //                                 $match:
                //                                 {
                // 
                //                                     $expr: {
                //                                         $in: ['$mediaID', '$$localID']
                //                                     }
                //                                 }
                //                             },
                //                             {
                //                                 $project: {
                //                                     "mediaBasePath": 1,
                //                                     "mediaUri": 1,
                //                                     "originalName": 1,
                //                                     "fsSourceUri": 1,
                //                                     "fsSourceName": 1,
                //                                     "fsTargetUri": 1,
                //                                     "mediaType": 1,
                //                                     "mediaEndpoint": {
                //                                         "$concat": ["/profilepict/", "$mediaID"]
                //                                     }
                //                                 }
                //                             }
                //                         ],
                // 
                //                     }
                //                 },
                {
                    "$lookup": {
                        from: "disquslogs",
                        as: "disqusLogs",
                        let: {
                            localID: '$disqusLogs.$id'
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
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "senderActive": {
                                                        $ne: false
                                                    }
                                                },
                                                {
                                                    "recieverActive": {
                                                        $ne: false
                                                    }
                                                }
                                            ]
                                        },
                                        
                                    ]
                                },
                                
                            },
                            {
                                $project: {
                                    "createdAt": 1,
                                    "reactionUri": 1,
                                    "txtMessages": 1,
                                    "receiver": 1,
                                    "postType": 1,
                                    "sender": 1,
                                    "lineID": 1,
                                    "active": 1,
                                    "disqusID": 1,
                                    "updatedAt": 1,
                                    "reaction_icon": "$emot.icon",
                                    "content": "$medias",
                                    
                                }
                            },
                            {
                                $sort: {
                                    "createdAt": 1
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $lookup: {
                        from: 'reactions_repo',
                        as: 'emot',
                        let: {
                            localID: '$disqusLogs.reactionUri'
                        },
                        pipeline: [
                            {
                                $match: 
                                {
                                    $or: [
                                        {
                                            $expr: {
                                                $in: ['$URL', '$$localID']
                                            }
                                        },
                                        
                                    ]
                                }
                            },
                            
                        ],
                        
                    },
                    
                },
                {
                    $unwind: {
                        path: "$userUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                //                 {
                //                     $unwind: {
                //                         path: "$userUserAuth",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                {
                    $unwind: {
                        path: "$mateUserBasic",
                        preserveNullAndEmptyArrays: true
                    }
                },
                //                 {
                //                     $unwind: {
                //                         path: "$mateUserAuth",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                //                 {
                //                     $unwind: {
                //                         path: "$avatar",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                //                 {
                //                     $unwind: {
                //                         path: "$mateAvatar",
                //                         preserveNullAndEmptyArrays: true
                //                     }
                //                 },
                {
                    $addFields: {
                        avatar: {
                            "mediaBasePath": '$userUserBasic.mediaBasePath',
                            "mediaUri": '$userUserBasic.mediaUri',
                            "originalName": '$userUserBasic.originalName',
                            "fsSourceUri": '$userUserBasic.fsSourceUri',
                            "fsSourceName": '$userUserBasic.fsSourceName',
                            "fsTargetUri": '$userUserBasic.fsTargetUri',
                            "mediaType": '$userUserBasic.mediaType',
                            "mediaEndpoint": '$userUserBasic.mediaEndpoint',
                            
                        },
                        mateAvatar: {
                            "mediaBasePath": '$mateUserBasic.mediaBasePath',
                            "mediaUri": '$mateUserBasic.mediaUri',
                            "originalName": '$mateUserBasic.originalName',
                            "fsSourceUri": '$mateUserBasic.fsSourceUri',
                            "fsSourceName": '$mateUserBasic.fsSourceName',
                            "fsTargetUri": '$mateUserBasic.fsTargetUri',
                            "mediaType": '$mateUserBasic.mediaType',
                            "mediaEndpoint": '$mateUserBasic.mediaEndpoint',
                            
                        }
                    }
                },
                {
                    $project: {
                        "emailActive": 1,
                        "email": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$email",
                                else : '$mate'
                            }
                        },
                        "username": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.username",
                                else : '$mateUserBasic.username'
                            }
                        },
                        "fullName": 
                            {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$userUserBasic.fullName",
                                else : '$mateUserBasic.fullName'
                            }
                        },
                        urluserBadge: 
                            {
                            "$ifNull": 
                            [
                                {
                                    "$filter": 
                                    {
                                        input: {
                                            $cond: {
                                                if : {
                                                    $eq: ["$email", email]
                                                },
                                                then: "$userUserBasic.userBadge",
                                                else : '$mateUserBasic.userBadge'
                                            }
                                        },
                                        as: "listbadge",
                                        cond: 
                                            {
                                            "$and": 
                                            [
                                                {
                                                    "$eq": 
                                                    [
                                                        "$$listbadge.isActive",
                                                        true
                                                    ]
                                                },
                                                {
                                                    "$lte": [
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
                                                        "$$listbadge.endDatetime"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },
                                []
                            ]
                        },
                        "avatar": 
                        {
                            $cond: {
                                if : {
                                    $eq: ["$email", email]
                                },
                                then: "$avatar",
                                else : '$mateAvatar'
                            }
                        },
                        "updatedAt": 1,
                        "lastestMessage": 1,
                        "disqusID": 1,
                        "room": 1,
                        "mateActive": 1,
                        "createdAt": 1,
                        "active": 1,
                        "eventType": 1,
                        "emot": 1,
                        "disqusLogs": "$disqusLogs",
                        "senderOrReceiverInfo": 
                            {
                            "email": 
                            {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$email",
                                    else : '$mate'
                                }
                            },
                            "username": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.username",
                                    else : '$mateUserBasic.username'
                                }
                            },
                            "fullName": 
                                {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$userUserBasic.fullName",
                                    else : '$mateUserBasic.fullName'
                                }
                            },
                            urluserBadge: 
                                {
                                "$ifNull": 
                                [
                                    {
                                        "$filter": 
                                        {
                                            input: {
                                                $cond: {
                                                    if : {
                                                        $eq: ["$mate", email]
                                                    },
                                                    then: "$userUserBasic.userBadge",
                                                    else : '$mateUserBasic.userBadge'
                                                }
                                            },
                                            as: "listbadge",
                                            cond: 
                                                {
                                                "$and": 
                                                [
                                                    {
                                                        "$eq": 
                                                        [
                                                            "$$listbadge.isActive",
                                                            true
                                                        ]
                                                    },
                                                    {
                                                        "$lte": [
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
                                                            "$$listbadge.endDatetime"
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    []
                                ]
                            },
                            "avatar": 
                            {
                                $cond: {
                                    if : {
                                        $eq: ["$mate", email]
                                    },
                                    then: "$avatar",
                                    else : '$mateAvatar'
                                }
                            },
                            
                        },
                        
                    }
                },
                {
                    $sort: {
                        "createdAt": - 1
                    }
                },

            ]

        ).exec();

        return query;
    }
    async noneActiveAllDiscus(postID: string, idtransaction: string) {
        var query = await this.DisqusModel.updateMany(
            { postID: postID },
            { active: false, idtransaction: idtransaction },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            }).clone().exec();
        return query;
    }

    async noneActiveAllDiscusNew(postID: string) {
        var query = await this.DisqusModel.updateMany(
            { postID: postID },
            { active: false },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            }).clone().exec();
        return query;
    }

    async socketRequest(RequestSoctDto_: RequestSoctDto) {
        let config = { headers: { "Content-Type": "application/json" } };
        const res = await this.httpService.post(this.configService.get("URL_CHALLENGE") + "api/send/socket/dm", RequestSoctDto_, config).toPromise();
        const data = res.data;
        return data;
    }
}
