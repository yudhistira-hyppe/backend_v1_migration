import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newpost, NewpostDocument } from '..//../disqus/newpost/schemas/newpost.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../../utils/utils.service';
import { SeaweedfsService } from '../../../stream/seaweedfs/seaweedfs.service';
@Injectable()
export class NewpostService {
    private readonly logger = new Logger(NewpostService.name);
    constructor(
        @InjectModel(Newpost.name, 'SERVER_FULL')
        private readonly PostsModel: Model<NewpostDocument>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService,
        private readonly seaweedfsService: SeaweedfsService,
    ) { }
    async pict(media: string): Promise<any> {
        var data = await this.seaweedfsService.read(media.replace('/localrepo', ''));
        return data;
    }
    async findOnepostID2(postID: string): Promise<Newpost> {
        var CreatePostsDto_ = await this.PostsModel.findOne({ postID: postID }).exec();
        return CreatePostsDto_;
    }
    async findByPostId(postID: string): Promise<Newpost> {
        return this.PostsModel.findOne({ postID: postID }).exec();
    }
  
    async findid(id: string): Promise<Newpost> {
        return this.PostsModel.findOne({ _id: id }).exec();
    }

    async update(id: string, update: Newpost): Promise<Newpost> {
        let data = await this.PostsModel.findByIdAndUpdate(id, update, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updateCommentPlus(postID: string) {
        this.PostsModel.updateOne(
            {
                postID: postID,
            },
            { $inc: { comments: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }
    async getPostByDate(startdate: string) {
        var before = new Date(startdate).toISOString().split("T")[0];
        var input = new Date();
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];
        //kalo error, coba ganti jadi set dan jadi object
        var query = await this.PostsModel.aggregate([
            {
                "$match":
                {
                    createdAt:
                    {
                        "$gte": before,
                        "$lte": today
                    },
                }
            },
            {
                "$project":
                {
                    createdAt:
                    {
                        "$substr":
                            [
                                "$createdAt", 0, 10
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id:
                    {
                        "$dateFromString":
                        {
                            "format": "%Y-%m-%d",
                            "dateString": "$createdAt"

                        }
                    },
                    totalperhari:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    totalperhari: 1
                }
            },
            {
                "$unwind":
                {
                    path: "$_id"
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            },
            {
                "$group":
                {
                    _id: null,
                    total:
                    {
                        "$sum": "$totalperhari"
                    },
                    resultdata:
                    {
                        "$push":
                        {
                            _id:
                            {
                                "$substr":
                                    [
                                        {
                                            "$toString": "$_id"
                                        }, 0, 10
                                    ]
                            },
                            totaldata: "$totalperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }

    async analiticPost(startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            var dt = dateend.substring(0, 10);
        } catch (e) {
            dt = "";
        }
        var query = await this.PostsModel.aggregate(
            [
                {
                    "$match":
                    {
                        createdAt:
                        {
                            "$gte": startdate,
                            "$lte": dt
                        },
                        postType:
                        {
                            "$in": ["pict", "vid", "diary", "story"]
                        }
                    }
                },
                {
                    "$project":
                    {
                        createdAt:
                        {
                            "$substr":
                                [
                                    "$createdAt", 0, 10
                                ]
                        },
                        postType: 1
                    }
                },

                {
                    "$group":
                    {
                        _id: "$createdAt",
                        pict:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    "$eq": ["$postType", "pict"]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                        vid:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    // "$eq": ["$postType", "vid"]
                                                    "$or": [
                                                        {
                                                            "$eq": ["$postType", "vid"]
                                                        },
                                                        {
                                                            "$eq": ["$postType", "diary"]
                                                        }
                                                    ]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                        story:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    "$eq": ["$postType", "story"]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                        // diary:
                        // {
                        //     "$sum":
                        //     {
                        //         "$switch":
                        //         {
                        //             branches:
                        //                 [
                        //                     {
                        //                         "case":
                        //                         {
                        //                             "$eq": ["$postType", "diary"]
                        //                         },
                        //                         "then": 1
                        //                     }
                        //                 ],
                        //             "default": 0
                        //         }
                        //     }
                        // },
                    }
                },

                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        // diary: "$diary",
                        pict: "$pict",
                        vid: "$vid",
                        story: "$story"
                    }
                },

                {
                    "$sort":
                    {
                        date: 1
                    }
                }
            ]
        );
        return query;

    }

    async updatePostviewer(postid: string, email: string) {
        return await this.PostsModel.updateOne({ postID: postid }, { $push: { viewer: email } }).exec();
    }

    async updateView(email: string, email_target: string, postID: string) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        // var setinput = {};
        // setinput['$inc'] = {
        //     views: 1
        // };
        // var setCEViewer = getdata.userView;
        // setCEViewer.push(email_target);
        // setinput["$set"] = {
        //     "userView": setCEViewer
        // }
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            {
                "$inc":
                {
                    views:1
                },
                "$push":
                {
                    userView:email_target
                }
            },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateLike(email: string, email_target: string, postID: string) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        // var setinput = {};
        // setinput['$inc'] = {
        //     views: 1
        // };
        // var setCEViewer = getdata.userView;
        // setCEViewer.push(email_target);
        // setinput["$set"] = {
        //     "userView": setCEViewer
        // }
        
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            {
                "$inc":
                {
                    likes:1
                },
                "$push":
                {
                    userLike:email_target
                }
            },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateReaction(email: string, postID: string) {
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            { $inc: { reactions: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateUnLike(email: string, email_target: string, postID: string, array:any[]) {
        // var getdata = await this.PostsModel.findOne({ postID: postID }).exec();
        // var setinput = {};
        // setinput['$inc'] = {
        //     likes: -1
        // };
        // var setCELike = getdata.userLike;
        // var filterdata = setCELike.filter(emaildata => emaildata != email_target);
        // setinput["$set"] = {
        //     "userLike": filterdata
        // }

        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            {
                "$inc":
                {
                    likes: -1
                },
                "$set":
                {
                    userLike:array
                }
            },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async findOnepostID3(post: Newpost): Promise<Object> {


        const query = await this.PostsModel.aggregate([
            {
                $match: {
                    postID: post.postID
                }
            },

        ]);
        return query;
    }

    async getRecentStory3(email: string, page: number, limit: number) {
        var query = await this.PostsModel.aggregate([

            {
                "$set": {
                    "settimeStart":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), - 61200000] // 1 hari 61200000
                            }
                        }
                    },

                },

            },
            {
                "$set": {
                    "settimeEnd":
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                }
            },
            {
                "$match":
                {
                    $and: [

                        {
                            "$expr":
                            {
                                "$eq": ["$postType", "story"]
                            }
                        },
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
                            "email": {
                                $ne: email
                            }
                        },
                        {
                            "$expr":
                            {
                                "$gte": ["$createdAt", '$settimeStart']
                            },

                        },
                        {
                            "$expr":
                            {
                                "$lte": ["$createdAt", '$settimeEnd']
                            }
                        },
                        {
                            "$or": [
                                {
                                    "reportedUser": {
                                        "$elemMatch": {
                                            "email": email,
                                            "active": false,

                                        }
                                    }
                                },
                                {
                                    "reportedUser.email": {
                                        "$not": {
                                            "$regex": email
                                        }
                                    }
                                },

                            ]
                        },

                    ]
                },

            },
            {
                $sort: {
                    createdAt: 1
                }
            },
            // {
            //     $skip: (page * limit)
            // },
            // {
            //     $limit: limit
            // },
            {
                $lookup: {
                    from: 'newUserBasics',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'userBasic',

                },

            },
            {
                $lookup: {
                    from: 'mediamusic',
                    localField: 'musicId',
                    foreignField: '_id',
                    as: 'music',

                },

            },
            {
                $set: {
                    "urluserBadges":
                    {
                        "$filter":
                        {
                            input: { $arrayElemAt: ["$userBasic.userBadge", 0] },
                            as: "listuserbadge",
                            cond:
                            {
                                "$and":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    "$$listuserbadge.isActive",
                                                    true
                                                ]
                                        },
                                        {
                                            "$lte":
                                                [
                                                    {
                                                        "$dateToString": {
                                                            "format": "%Y-%m-%d %H:%M:%S",
                                                            "date": {
                                                                $add: [new Date(), 25200000]
                                                            }
                                                        }
                                                    },
                                                    "$$listuserbadge.endDatetime",

                                                ]
                                        }
                                    ]
                            },

                        }
                    }
                }
            },
            {
                "$lookup": {
                    from: "contentevents",
                    as: "isView",
                    let: {

                        storys: '$postID',

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
                                                    $eq: ['$postID', '$$storys']
                                                }
                                            },
                                            {
                                                "email": email,

                                            },
                                            {
                                                "eventType": "VIEW"
                                            }
                                        ]
                                    },

                                ]
                            }
                        },
                        {
                            $project: {
                                "email": 1,
                                "postID": 1,

                            }
                        }
                    ],

                }
            },
            {
                $project: {
                    "storyDate": 1,
                    "postID": 1,
                    "musicId": {
                        "$arrayElemAt": ['$music._id', 0]
                    },
                    "musicTitle": {
                        "$arrayElemAt": ['$music.musicTitle', 0]
                    },
                    "artistName":
                    {
                        "$arrayElemAt": ["$music.artistName", 0]
                    },
                    "albumName":
                    {
                        "$arrayElemAt": ["$music.albumName", 0]
                    },
                    "apsaraMusic":
                    {
                        "$arrayElemAt": ["$music.apsaraMusic", 0]
                    },
                    "apsaraThumnail":
                    {
                        "$arrayElemAt": ["$music.apsaraThumnail", 0]
                    },
                    "genre":
                    {
                        "$arrayElemAt": ["$music.genre.name", 0]
                    },
                    "theme":
                    {
                        "$arrayElemAt": ["$music.theme.name", 0]
                    },
                    "mood":
                    {
                        "$arrayElemAt": ["$music.mood.name", 0]
                    },
                    "testDate": 1,
                    "mediaType":
                    {
                        "$arrayElemAt": ["$mediaSource.mediaType", 0]
                    },
                    "stiker": 1,
                    "email": 1,
                    "postType": 1,
                    "description": 1,
                    "active": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "expiration": 1,
                    "visibility": 1,
                    "location": 1,
                    "allowComments": 1,
                    "isSafe": 1,
                    "isOwned": 1,
                    "saleLike": 1,
                    "saleView": 1,
                    "userProfile": 1,
                    "contentMedias": 1,
                    "tagDescription": 1,
                    "metadata": 1,
                    "contentModeration": 1,
                    "reportedStatus": 1,
                    "reportedUserCount": 1,
                    "contentModerationResponse": 1,
                    "reportedUser": 1,
                    "timeStart": 1,
                    "timeEnd": 1,
                    "apsara": {
                        "$arrayElemAt": ["$mediaSource.apsara", 0]
                    },
                    "apsaraId": {
                        "$arrayElemAt": ["$mediaSource.apsaraId", 0]
                    },
                    "apsaraThumbId": {
                        "$arrayElemAt": ["$mediaSource.apsaraThumbId", 0]
                    },
                    "insight":
                    {
                        "likes": "$likes",
                        "views": "$views",
                        "shares": "$shares",
                        "comments": "$comments",

                    }
                    ,
                    "fullName": {
                        "$arrayElemAt": ["$userBasic.fullName", 0]
                    },
                    "username": {
                        "$arrayElemAt": ["$userBasic.username", 0]
                    },
                    "avatar": {
                        "_id": {
                            "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
                        },
                        "mediaEndpoint": {
                            "$concat": ["/profilepict/", {
                                "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
                            }]
                        }
                    },
                    "urluserBadge":
                    {
                        "$ifNull":
                            [
                                "$urluserBadges",
                                null
                            ]
                    },
                    "statusCB": 1,
                    mediaEndpoint: {
                        "$concat": ["/pict/", "$postID"]
                    },
                    "privacy": {
                        "isCelebrity":
                        {
                            "$arrayElemAt": ["$userBasic.isCelebrity", 0]
                        },
                        "isIdVerified":
                        {
                            "$arrayElemAt": ["$userBasic.isIdVerified", 0]
                        },
                        "isPrivate":
                        {
                            "$arrayElemAt": ["$userBasic.isPrivate", 0]
                        }
                    },
                    isView: 1
                }
            },
            {
                "$group":
                {
                    _id: {
                        email: "$email",
                        username: "$username"
                    },
                    story:
                    {
                        "$push":
                        {
                            "mediaEndpoint": "$mediaEndpoint",
                            "postID": "$postID",
                            "stiker": "$stiker",
                            "musicTitle": "$musicTitle",
                            "artistName": "$artistName",
                            "albumName": "$albumName",
                            "apsaraMusic": "$apsaraMusic",
                            "apsaraThumnail": "$apsaraThumnail",
                            "genre": "$genre",
                            "theme": "$theme",
                            "mood": "$mood",
                            "mediaType": "$mediaType",
                            "email": "$email",
                            "postType": "$postType",
                            "description": "$description",
                            "active": "$active",
                            "createdAt": "$createdAt",
                            "updatedAt": "$updatedAt",
                            "expiration": "$expiration",
                            "visibility": "$visibility",
                            "location": "$location",
                            "allowComments": "$allowComments",
                            "isSafe": "$isSafe",
                            "isOwned": "$isOwned",
                            "metadata": "$metadata",
                            "contentModeration": "$contentModeration",
                            "reportedStatus": "$reportedStatus",
                            "reportedUserCount": "$reportedUserCount",
                            "contentModerationResponse": "$contentModerationResponse",
                            "reportedUser": "$reportedUser",
                            "apsara": "$apsara",
                            "apsaraId": "$apsaraId",
                            "apsaraThumbId": "$apsaraThumbId",
                            "insight": "$insight",
                            "fullName": "$fullName",
                            "username": "$username",
                            "music": {
                                "_id": "$musicId",
                                "musicTitle": "$musicTitle",
                                "artistName": "$artistName",
                                "albumName": "$albumName",
                                "apsaraMusic": "$apsaraMusic",
                                "apsaraThumnail": "$apsaraThumnail",

                            },
                            "avatar":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$avatar", {}]
                                    },
                                    then: null,
                                    else: "$avatar"
                                }
                            },
                            "urluserBadge": "$urluserBadge",
                            "statusCB": "$statusCB",
                            "privacy": "$privacy",
                            "isViewed":
                            {
                                $cond: {
                                    if: {
                                        $eq: ["$isView", []]
                                    },
                                    then: false,
                                    else: true
                                }
                            },

                        }
                    }
                }
            },
            {
                "$sort":
                {
                    'story.createdAt': -1
                }
            },
            {
                "$project":
                {
                    _id: 0,
                    email: "$_id.email",
                    username: "$_id.username",
                    story: 1
                }
            },
            {
                $skip: (page * limit)
            },
            {
                $limit: limit
            },
        ]);


        return query;
    }
    async findbyviewmail(email:string,postID:string): Promise<Newpost[]> {
        return this.PostsModel.find({ userView: { "$in" : [email]},"postID": postID, }).exec();
    }
    async findbylikemail(email:string,postID:string): Promise<Newpost[]> {
        return this.PostsModel.find({ userLike: { "$in" : [email]},"postID": postID, }).exec();
    }
}
