import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationsRead, NotificationsReadDocument } from './schema/notifications_read.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationReadService {
    constructor(
        @InjectModel(NotificationsRead.name, 'SERVER_FULL')
        private readonly NotificationsReadModel: Model<NotificationsReadDocument>,
    ) { }

    async getNotification2(email: string, eventType: string, skip: number, limit: number,) {
        var pipeline = [];
        if (eventType && eventType !== undefined && eventType !== null && eventType !== "GENERAL") {
            pipeline.push(
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
            );
        }
        else if (eventType && eventType !== undefined && eventType !== null && eventType === "GENERAL") {
            pipeline.push(
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
                                        "eventType": { $in: ['VERIFICATIONID', 'SUPPORTFILE', 'TRANSACTION', 'POST', 'ADS VIEW', 'BOOST_CONTENT', 'BOOST_BUY', 'CONTENT', 'ADS CLICK', 'BANK', 'CONTENTMOD', 'KYC', 'GENERAL', 'COMMENT', 'LIKE'] },

                                    },
                                    {
                                        "active": true
                                    },

                                ]
                            },

                        ]
                    },

                },
            );
        }
        else {
            pipeline.push(
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
                                        "active": true
                                    },

                                ]
                            },

                        ]
                    },

                },
            );
        }

        pipeline.push(

            {
                $lookup: {
                    from: 'posts',
                    localField: 'postID',
                    foreignField: 'postID',
                    as: 'post',

                },

            },
            {
                $unwind: {
                    path: "$post",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'mediapicts',
                    localField: 'postID',
                    foreignField: 'postID',
                    as: 'pict',

                },

            },
            {
                $lookup: {
                    from: 'mediavideos',
                    localField: 'postID',
                    foreignField: 'postID',
                    as: 'vid',

                },

            },
            {
                $lookup: {
                    from: 'mediadiaries',
                    localField: 'postID',
                    foreignField: 'postID',
                    as: 'diary',

                },

            },
            {
                $lookup: {
                    from: 'mediastories',
                    localField: 'postID',
                    foreignField: 'postID',
                    as: 'story',

                },

            },
            {
                $lookup: {
                    from: 'templates',
                    localField: 'templateID',
                    foreignField: '_id',
                    as: 'template_data',

                },

            },
            {
                $unwind: {
                    path: "$post",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$pict",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$vid",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$diary",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$story",
                    preserveNullAndEmptyArrays: true
                }
            },
            // {
            //   $lookup: {
            //     from: 'userauths',
            //     localField: 'senderOrReceiverInfo.username',
            //     foreignField: 'username',
            //     as: 'userNameSender',

            //   },

            // },
            // {
            //   $unwind: {
            //     path: "$userNameSender",
            //     preserveNullAndEmptyArrays: true
            //   }
            // },
            {
                $lookup: {
                    from: 'userbasics',
                    localField: 'mate',
                    foreignField: 'email',
                    as: 'userSender',

                },

            },
            {
                $unwind: {
                    path: "$userSender",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    createdAt: - 1
                }
            },
            {
                $skip: (skip * limit)
            },
            {
                $limit: limit
            },
            {
                $project: {
                    active: 1,
                    body: 1,
                    bodyId: 1,
                    contentEventID: 1,
                    createdAt: 1,
                    email: 1,
                    event: 1,
                    eventType: 1,
                    flowIsDone: 1,
                    mate: 1,
                    postType: "$post.postType",
                    mediaTypeStory: '$story.mediaType',
                    notificationID: 1,
                    actionButtons: 1,
                    postID: 1,
                    titleEN: {
                        "$arrayElemAt": ["$template_data.subject", 0]
                    },
                    senderOrReceiverInfo:
                    {
                        fullName: "$senderOrReceiverInfo.fullName",
                        username: "$senderOrReceiverInfo.username",
                        avatar: {
                            mediaEndpoint: { $concat: ["/profilepict/", '$userSender.profilePict.$id'] }
                        }
                    },
                    urluserBadge:
                    {
                        "$ifNull":
                            [
                                {
                                    "$filter":
                                    {
                                        input: "$userSender.userBadge",
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
                    title: 1,
                    updatedAt: 1,

                    content: {
                        uploadSource: "$pict.uploadSource",
                        apsaraId:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: "$pict.apsaraId",
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: "$vid.apsaraId",
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: "$diary.apsaraId",
                                                else: '$story.apsaraId'
                                            }
                                        },

                                    }
                                },

                            }
                        },
                        apsaraThumbId:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: "$pict.apsaraThumbId",
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: "$vid.apsaraThumbId",
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: "$diary.apsaraThumbId",
                                                else: '$story.apsaraThumbId'
                                            }
                                        },

                                    }
                                },

                            }
                        },
                        isApsara:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: "$pict.apsara",
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: "$vid.apsara",
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: "$diary.apsara",
                                                else: '$story.apsara'
                                            }
                                        },

                                    }
                                },

                            }
                        },
                        mediaEndpoint: //"/pict/fbbac412 - 2a03 - 989a - 8855 - fe949890e9f9",
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: {
                                    $concat: ["/thumb/", "$postID",]
                                },
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: {
                                            $concat: ["/thumb/", "$postID",]
                                        },
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: {
                                                    $concat: ["/thumb/", "$postID",]
                                                },
                                                else: {


                                                    $cond: {
                                                        if: {
                                                            $eq: ['$story.mediaType', 'video']
                                                        },
                                                        then: {
                                                            $concat: ["/thumb/", "$postID",]
                                                        },
                                                        else: {
                                                            $concat: ["/pict/", "$postID",]
                                                        }
                                                    },

                                                }
                                            },

                                        }
                                    }
                                },

                            }
                        },
                        mediaThumName:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: "$pict.mediaThumName",
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: "$vid.mediaThumName",
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: "$diary.mediaThumName",
                                                else: '$story.mediaThumName'
                                            }
                                        },

                                    }
                                },

                            }
                        },
                        mediaThumBasePath:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: "$pict.mediaThumBasePath",
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: "$vid.mediaThumBasePath",
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: "$diary.mediaThumBasePath",
                                                else: '$story.mediaThumBasePath'
                                            }
                                        },

                                    }
                                },

                            }
                        },
                        mediaThumUri:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: "$pict.mediaThumUri",
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: "$vid.mediaThumUri",
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: "$diary.mediaThumUri",
                                                else: '$story.mediaThumUri'
                                            }
                                        },

                                    }
                                },

                            }
                        },


                    }
                }
            },
            {
                $set: {
                    tester: {
                        $ifNull: ['$content.isApsara', "dodol"]
                    }
                }
            },
            {
                $project: {
                    active: 1,
                    body: 1,
                    bodyId: 1,
                    contentEventID: 1,
                    createdAt: 1,
                    email: 1,
                    event: 1,
                    eventType: 1,
                    flowIsDone: 1,
                    mate: 1,
                    postType: 1,
                    mediaTypeStory: 1,
                    notificationID: 1,
                    actionButtons: 1,
                    postID: 1,
                    senderOrReceiverInfo: 1,
                    title: 1,
                    titleEN: 1,
                    updatedAt: 1,
                    urluserBadge:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt": ["$urluserBadge", 0]
                                },
                                null
                            ]
                    },
                    content:
                    {
                        $cond: {
                            if: {
                                $eq: ["$tester", "dodol"],
                            },
                            then: "$kancutTaslim",
                            else: "$content"
                        }
                    },
                }
            }
        );
        console.log(JSON.stringify(pipeline));
        var query = await this.NotificationsReadModel.aggregate(pipeline);
        return query;
    }

    async getNotification2V2(email: string, eventType: string, skip: number, limit: number,) {
        var pipeline = [];
        if (eventType && eventType !== undefined && eventType !== null && eventType !== "GENERAL") {
            pipeline.push(
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
            );
        }
        else if (eventType && eventType !== undefined && eventType !== null && eventType === "GENERAL") {
            pipeline.push(
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
                                        "eventType": { $in: ['VERIFICATIONID', 'SUPPORTFILE', 'TRANSACTION', 'POST', 'ADS VIEW', 'BOOST_CONTENT', 'BOOST_BUY', 'CONTENT', 'ADS CLICK', 'BANK', 'CONTENTMOD', 'KYC', 'GENERAL', 'COMMENT', 'LIKE'] },

                                    },
                                    {
                                        "active": true
                                    },

                                ]
                            },

                        ]
                    },

                },
            );
        }
        else {
            pipeline.push(
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
                                        "active": true
                                    },

                                ]
                            },

                        ]
                    },

                },
            );
        }
        pipeline.push(
            {
                $sort: {
                    createdAt: - 1
                }
            },
            {
                $skip: (skip * limit)
            },
            {
                $limit: limit
            },
        );

        pipeline.push(
            {
                $lookup: {
                    from: 'tempPosts',
                    // from: 'newPosts',
                    as: 'post',
                    let: {
                        localID: '$postID'
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$postID', '$$localID']
                                }
                            }
                        }
                    ]
                },
            },
            {
                $unwind: {
                    path: "$post",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'newUserBasics',
                    localField: 'mate',
                    foreignField: 'email',
                    as: 'userSender',

                },

            },
            {
                $unwind: {
                    path: "$userSender",
                    preserveNullAndEmptyArrays: true
                }
            },
            // {
            //     $sort: {
            //         createdAt: - 1
            //     }
            // },
            // {
            //     $skip: (skip * limit)
            // },
            // {
            //     $limit: limit
            // },
            {
                $project: {
                    active: 1,
                    body: 1,
                    bodyId: 1,
                    contentEventID: 1,
                    createdAt: 1,
                    email: 1,
                    event: 1,
                    eventType: 1,
                    flowIsDone: 1,
                    mate: 1,
                    postType: "$post.postType",
                    mediaTypeStory: {
                        "$arrayElemAt": ["$post.mediaSource.mediaType", 0]
                    },
                    notificationID: 1,
                    actionButtons: 1,
                    postID: 1,
                    titleEN: {
                        "$arrayElemAt": ["$template_data.subject", 0]
                    },
                    senderOrReceiverInfo:
                    {
                        fullName: "$senderOrReceiverInfo.fullName",
                        username: "$senderOrReceiverInfo.username",
                        avatar: {
                            mediaEndpoint: { $concat: ["/profilepict/", '$userSender.profilePict.$id'] }
                        }
                    },
                    urluserBadge:
                    {
                        "$ifNull":
                            [
                                {
                                    "$filter":
                                    {
                                        input: "$userSender.userBadge",
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
                    title: 1,
                    updatedAt: 1,
                    content: {
                        uploadSource: {
                            "$arrayElemAt": ["$post.mediaSource.uploadSource", 0]
                        },
                        apsaraId: {
                            "$arrayElemAt": ["$post.mediaSource.apsaraId", 0]
                        },
                        isApsara: {
                            "$arrayElemAt": ["$post.mediaSource.apsara", 0]
                        },
                        mediaType: {
                            "$arrayElemAt": ["$post.mediaSource.mediaType", 0]
                        },
                        mediaEndpoint:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$post.postType', 'pict']
                                },
                                then: {
                                    $concat: ["/thumb/", "$postID",]
                                },
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$post.postType', 'vid']
                                        },
                                        then: {
                                            $concat: ["/thumb/", "$postID",]
                                        },
                                        else:
                                        {
                                            $cond: {
                                                if: {
                                                    $eq: ['$post.postType', 'diary']
                                                },
                                                then: {
                                                    $concat: ["/thumb/", "$postID",]
                                                },
                                                else: {


                                                    $cond: {
                                                        if: {
                                                            $eq: [{
                                                                "$arrayElemAt": ["$post.mediaSource.mediaType", 0]
                                                            }, 'video']
                                                        },
                                                        then: {
                                                            $concat: ["/thumb/", "$postID",]
                                                        },
                                                        else: {
                                                            $concat: ["/pict/", "$postID",]
                                                        }
                                                    },

                                                }
                                            },

                                        }
                                    }
                                },

                            }
                        },
                        "mediaThumbEndpoint":
                        {
                            "$ifNull":
                                [
                                    {
                                        "$arrayElemAt": ["$post.mediaSource.mediaThumbEndpoint", 0]
                                    },
                                    {
                                        "$concat":
                                            [
                                                "/thumb/",
                                                "$postID"
                                            ]
                                    }
                                ]
                        },
                    },
                    // boosted: "$post.boosted",
                    // boostCount: "$post.boostCount",
                    // isBoost: "$post.isBoost",
                }
            },
            {
                $set: {
                    tester: {
                        $ifNull: ['$content.isApsara', "dodol"]
                    }
                }
            },
            {
                '$lookup': {
                    from: 'newPosts',
                    as: 'posted',
                    let: {
                        localID: {
                            '$cond': {
                                if : {
                                    '$eq': ['$tester', 'dodol']
                                },
                                else : '$kancutTaslim',
                                then: '$postID'
                            }
                        }
                    },
                    pipeline: [
                            {
                                $match: {
                                        $and:
                                        [
                                            {
                                                    '$expr': 
                                                    {
                                                            '$eq': ['$postID', '$$localID']
                                                    }
                                            },
                                            
                                ]
                            }
                        },
                        {
                            $project: {
                                postType:1,
                                dedy:"keren",
                                uploadSource: {
                                    '$arrayElemAt': ['$mediaSource.uploadSource', 0]
                                },
                                apsaraId: {
                                    '$arrayElemAt': ['$mediaSource.apsaraId', 0]
                                },
                                isApsara: {
                                    '$arrayElemAt': ['$mediaSource.apsara', 0]
                                },
                                mediaType: {
                                    '$arrayElemAt': ['$mediaSource.mediaType', 0]
                                },
                                mediaEndpoint: {
                                    '$cond': {
                                        if : {
                                            '$eq': ['$post.postType', 'pict']
                                        },
                                        then: {
                                            '$concat': ['/thumb/', '$postID']
                                        },
                                        else : {
                                            '$cond': {
                                                if : {
                                                    '$eq': ['$postType', 'vid']
                                                },
                                                then: {
                                                    '$concat': ['/thumb/', '$postID']
                                                },
                                                else : {
                                                    '$cond': {
                                                        if : {
                                                            '$eq': ['$postType', 'diary']
                                                        },
                                                        then: {
                                                            '$concat': ['/thumb/', '$postID']
                                                        },
                                                        else : {
                                                            '$cond': {
                                                                if : {
                                                                    '$eq': [
                                                                        {
                                                                            '$arrayElemAt': ['$mediaSource.mediaType', 0]
                                                                        },
                                                                        'video'
                                                                    ]
                                                                },
                                                                then: {
                                                                    '$concat': ['/thumb/', '$postID']
                                                                },
                                                                else : {
                                                                    '$concat': ['/pict/', '$postID']
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                mediaThumbEndpoint: {
                                    '$ifNull': [
                                        {
                                            '$arrayElemAt': ['$mediaSource.mediaThumbEndpoint', 0]
                                        },
                                        {
                                            '$concat': ['/thumb/', '$postID']
                                        }
                                    ]
                                }
                            }
                        },
                        
                    ],
                    
                }
            },
            {
                '$project': {
                    active: 1,
                    body: 1,
                    bodyId: 1,
                    contentEventID: 1,
                    createdAt: 1,
                    email: 1,
                    event: 1,
                    eventType: 1,
                    flowIsDone: 1,
                    mate: 1,
                    postType: 
                    {
                        "$ifNull":
                        [
                            "$postType",
                            {
                                "$arrayElemAt":
                                [
                                    "$posted.postType", 0
                                ]
                            }
                        ]
                    },
                    notificationID: 1,
                    actionButtons: 1,
                    postID: 1,
                    senderOrReceiverInfo: 1,
                    title: 1,
                    updatedAt: 1,
                    urluserBadge: {
                        '$ifNull': [{
                            '$arrayElemAt': ['$urluserBadge', 0]
                        }, null]
                    },
                    content: {
                        '$cond': {
                            if : {
                                '$eq': ['$tester', 'dodol']
                            },
                            then: {
                                uploadSource: {
                                    '$arrayElemAt': ['$posted.uploadSource', 0]
                                },
                                apsaraId: {
                                    '$arrayElemAt': ['$posted.apsaraId', 0]
                                },
                                isApsara: {
                                    '$arrayElemAt': ['$posted.apsara', 0]
                                },
                                mediaType: {
                                    '$arrayElemAt': ['$posted.mediaType', 0]
                                },
                                mediaEndpoint: {
                                    '$arrayElemAt': ['$posted.mediaEndpoint', 0]
                                },
                                mediaThumbEndpoint: {
                                    '$arrayElemAt': ['$posted.mediaThumbEndpoint', 0]
                                },
                            },
                            else : '$content'
                        }
                    },
                    //posted: {$arrayElemAt:["$posted",0]}
                }
            },
        );
        // console.log(JSON.stringify(pipeline));
        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth:null, showHidden:false }));
        var query = await this.NotificationsReadModel.aggregate(pipeline);
        return query;
    }
}
