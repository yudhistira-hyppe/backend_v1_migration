import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { InterestCountDto } from './dto/create-interest_count.dto';
import { InterestCount, InterestCountDocument } from './schemas/interest_count.schema';

@Injectable()
export class InterestCountService {
    constructor(
        @InjectModel(InterestCount.name, 'SERVER_FULL')
        private readonly interestCountModel: Model<InterestCountDocument>,
    ) { }

    async create(
        InterestCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        const interestCountDto = await this.interestCountModel.create(
            InterestCountDto,
        );
        return interestCountDto;
    }

    async findAll(): Promise<InterestCount[]> {
        return this.interestCountModel.find().exec();
    }

    async findOneById(id: string): Promise<InterestCount> {
        return this.interestCountModel
            .findOne({ _id: new Types.ObjectId(id) })
            .exec();
    }

    async update(
        id: string,
        tagCountDto: InterestCountDto,
    ): Promise<InterestCount> {
        let data = await this.interestCountModel.findByIdAndUpdate(
            id,
            tagCountDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async searchDefaultPage(page: number, limits: number) {
        var pipeline = [];
        var pipelinetag = [];
        var pipelineinterest = [];

        pipelinetag.push({
            $project: {
                tag: "$_id",
                total: 1,
            }
        },
            {
                $sort: {
                    total: - 1
                }
            });

        if (page > 0) {
            pipelinetag.push({
                "$skip": limits * page
            });
        }

        if (limits > 0) {
            pipelinetag.push({
                "$limit": limits
            });

            pipelineinterest.push({
                "$limit": limits
            });
        }

        pipelinetag.push({
            $project: {
                total: "$total",
                nama: "$_id",
            }
        });

        pipelineinterest.push(
            {
                $sort: {
                    total: - 1
                }
            },
            {
                $lookup:
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
                }
            },
            {
                $project: {
                    interests: "$interestName",
                    interestName: "$interest.interestName",
                    langIso: "$interest.langIso",
                    icon: "$interest.icon",
                    createdAt: "$interest.createdAt",
                    updatedAt: "$interest.updatedAt",
                    interestNameId: "$interest.interestNameId",
                    thumbnail: "$interest.thumbnail",
                    total: "$total"
                }
            }
        );

        pipeline.push(
            {
                "$limit": 1
            },
            {
                $facet:
                {
                    tag:
                        [
                            {
                                $lookup: {
                                    from: "tag_count",
                                    pipeline: pipelinetag,
                                    as: "tag"
                                },
                            },
                        ],
                    interest: [
                        {
                            $lookup: {
                                from: "interest_count",
                                pipeline: pipelineinterest,
                                as: "interest"
                            }
                        }
                    ]
                }
            },
            {
                $unwind:
                {
                    path: "$tag"
                }
            },
            {
                $unwind:
                {
                    path: "$interest"
                }
            },
            {
                $project:
                {
                    tag: "$tag.tag",
                    interest: "$interest.interest"
                }
            }
        );


        // console.log(JSON.stringify(pipeline));
        var query = await this.interestCountModel.aggregate(pipeline);

        return query;
    }


    async detailinterestcontenNew(key: string, email: string, skip: number, limit: number, pict: any, vid: any, diary: any) {


        var pipeline = [];

        pipeline.push(
            {
                $match: {
                    "_id": new Types.ObjectId(key)
                }
            },
            {
                $lookup:
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
                }
            },
            {
                $lookup: {
                    from: "posts",
                    let: {
                        localID: "$listdata.postID"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [

                                    // {
                                    //     $text: {
                                    //         $search: key
                                    //     }
                                    // },
                                    {
                                        $expr: {
                                            $in: ['$postID', '$$localID']
                                        }
                                    },
                                    {
                                        "reportedStatus": {
                                            $ne: "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "reportedUser.email": {
                                            $not: {
                                                $regex: email
                                            }
                                        }
                                    },

                                ]
                            },

                        },
                        {
                            $project: {
                                "boosted":
                                {
                                    $cond: {
                                        if: {
                                            $gt: [{
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        $add: [new Date(), 25200000]
                                                    }
                                                }
                                            }, "$boosted.boostSession.timeEnd"]
                                        },
                                        then: [],
                                        else: '$boosted'
                                    }
                                },
                                "reportedStatus": 1,
                                "insight": {
                                    "shares": "$shares",
                                    "comments": "$comments",
                                    "views": "$views",
                                    "likes": "$likes",

                                },
                                "comments": "$comments",
                                "likes": "$likes",
                                "_id": 1,
                                "postID": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "email": 1,
                                "postType": 1,
                                "description": 1,
                                "active": 1,
                                "metadata": 1,
                                "location": 1,
                                "isOwned": 1,
                                "visibility": 1,
                                "isViewed": 1,
                                "allowComments": 1,
                                "saleAmount": 1,
                                "isLiked": 1,
                                // "scorePict": {
                                //     $meta: "textScore"
                                // }
                            }
                        }
                    ],
                    as: "posted"
                },

            },);

        if (pict === true && vid === false && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": { $arrayElemAt: ['$media.apsaraThumbId', 0] },

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }

        else if (pict === false && vid === true && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],

                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === false && vid === false && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],

                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],

                    },

                },
            );
        }
        else if (pict === true && vid === false && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": { $arrayElemAt: ['$media.apsaraThumbId', 0] },

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],

                    },

                },
            );
        }
        else if (pict === true && vid === true && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": { $arrayElemAt: ['$media.apsaraThumbId', 0] },

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === false && vid === true && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],

                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }
        else if (pict === true && vid === true && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": { $arrayElemAt: ['$media.apsaraThumbId', 0] },

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {
                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        }

                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: -1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: -1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },

                            ],
                    },

                },
            );
        }


        const query = await this.interestCountModel.aggregate(pipeline);
        return query;
    }

    async detailinterestcontenNew2(key: string, email: string, skip: number, limit: number, pict: any, vid: any, diary: any) {


        var pipeline = [];

        pipeline.push(
            {
                $match: {
                    "_id": new Types.ObjectId(key)
                }
            },
            {
                $lookup:
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
                }
            },
            {
                $lookup: {
                    from: "posts",
                    let: {
                        localID: "$listdata.postID"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [

                                    // {
                                    //     $text: {
                                    //         $search: key
                                    //     }
                                    // },
                                    {
                                        $expr: {
                                            $in: ['$postID', '$$localID']
                                        }
                                    },
                                    {
                                        "reportedStatus": {
                                            $ne: "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "reportedUser.email": {
                                            $not: {
                                                $regex: email
                                            }
                                        }
                                    },

                                ]
                            },

                        },
                        {
                            $project: {
                                "boosted":
                                {
                                    $cond: {
                                        if: {
                                            $gt: [{
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        $add: [new Date(), 25200000]
                                                    }
                                                }
                                            }, "$boosted.boostSession.timeEnd"]
                                        },
                                        then: [],
                                        else: '$boosted'
                                    }
                                },
                                "reportedStatus": 1,
                                "insight": {
                                    "shares": "$shares",
                                    "comments": "$comments",
                                    "views": "$views",
                                    "likes": "$likes",

                                },
                                "comments": "$comments",
                                "likes": "$likes",
                                "_id": 1,
                                "postID": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "email": 1,
                                "postType": 1,
                                "description": 1,
                                "active": 1,
                                "metadata": 1,
                                "location": 1,
                                "isOwned": 1,
                                "visibility": 1,
                                "isViewed": 1,
                                "allowComments": 1,
                                "saleAmount": 1,
                                "isLiked": 1,
                                // "scorePict": {
                                //     $meta: "textScore"
                                // }
                            }
                        }
                    ],
                    as: "posted"
                },

            },);

        if (pict === true && vid === false && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],

                    },

                },
            );
        }

        else if (pict === false && vid === true && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],

                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],
                    },

                },
            );
        }
        else if (pict === false && vid === false && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],

                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],

                    },

                },
            );
        }
        else if (pict === true && vid === false && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },


                            ],

                    },

                },
            );
        }
        else if (pict === true && vid === true && diary === false) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],
                    },

                },
            );
        }
        else if (pict === false && vid === true && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],

                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },


                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],

                    },

                },
            );
        }
        else if (pict === true && vid === true && diary === true) {
            pipeline.push(

                {
                    $facet:
                    {
                        "interest":
                            [
                                {
                                    $project: {
                                        tag: "$_id",
                                        interestNameId: "$interest.interestNameId",
                                        interestNameEn: "$interest.interestName",
                                        total: "$total",

                                    }
                                }
                            ],
                        //pict
                        "pict":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "pict"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediapicts",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/pict/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,
                                                    "uploadSource": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $arrayElemAt: ['$media.apsara', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],
                        "vid":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "vid"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediavideos",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },


                            ],
                        "diary":
                            [

                                {
                                    $project: {
                                        pict: "$posted"
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$pict"
                                    }
                                },
                                {
                                    $match: {
                                        "pict.postType": "diary"
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediadiaries",
                                        as: "media",
                                        let: {
                                            localID: '$pict.postID'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$postID', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "apsara": 1,
                                                    "apsaraId": 1,
                                                    "apsaraThumbId": 1,
                                                    "mediaEndpoint": {
                                                        "$concat": ["/stream/", "$postID"]
                                                    },
                                                    "mediaUri": 1,
                                                    "mediaThumbEndpoint": {
                                                        "$concat": ["/thumb/", "$postID"]
                                                    },
                                                    "mediaThumbUri": 1,
                                                    "mediaType": 1,

                                                }
                                            }
                                        ],

                                    },

                                },
                                {
                                    $project: {

                                        "scorePict": "$pict.scorePict",
                                        "boosted": "$pict.boosted",
                                        "reportedStatus": "$pict.reportedStatus",
                                        "_id": "$pict._id",
                                        "mediaThumbEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaThumbEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaEndpoint":
                                        {
                                            $arrayElemAt: ['$media.mediaEndpoint', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "mediaType":
                                        {
                                            $arrayElemAt: ['$media.mediaType', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "createdAt": "$pict.createdAt",
                                        "updatedAt": "$pict.updatedAt",
                                        "postID": "$pict.postID",
                                        "email": "$pict.email",
                                        "postType": "$pict.postType",
                                        "description": "$pict.description",
                                        "active": "$pict.active",
                                        "metadata": "$pict.metadata",
                                        "location": "$pict.location",
                                        "isOwned": "$pict.isOwned",
                                        "visibility": "$pict.visibility",
                                        "isViewed": "$pict.isViewed",
                                        "allowComments": "$pict.allowComments",
                                        "saleAmount": "$pict.saleAmount",
                                        "uploadSource": "$media.uploadSource",
                                        "monetize":
                                        {
                                            $cond: {
                                                if: {
                                                    $gte: ["$pict.saleAmount", 1]
                                                },
                                                then: true,
                                                else: "$taslimKONAG"
                                            }
                                        },
                                        "comments": "$pict.comments",
                                        "likes": "$pict.likes",
                                        "viewed": "$pict.insight.views",
                                        "insight":
                                        {
                                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                                        },
                                        "apsaraId":
                                        {
                                            $arrayElemAt: ['$media.apsaraId', {
                                                "$indexOfArray": [
                                                    "$media.postID",
                                                    "$pict.postID"
                                                ]
                                            }]
                                        },
                                        "isApsara":
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ['$media.apsara', {
                                                        "$indexOfArray": [
                                                            "$media.postID",
                                                            "$pict.postID"
                                                        ]
                                                    }]
                                                }, false]
                                        },
                                        "apsaraThumbId": {
                                            $arrayElemAt: ['$media.apsaraThumbId', 0]
                                        },
                                        "viewer": "$pict.viewer",
                                        "musicId": "$pict.musicId",
                                        "category": "$pict.category",
                                        "contentModeration": "$pict.contentModeration",
                                        "reportedUserCount": "$pict.reportedUserCount",
                                        "contentModerationResponse": "$pict.contentModerationResponse",
                                        "reportedUser": "$pict.reportedUser",
                                        "tags": "$pict.tags"
                                    }
                                },
                                {
                                    $sort: {
                                        isApsara: - 1,
                                        scorePict: - 1,
                                        comments: - 1,
                                        likes: - 1,
                                        createdAt: - 1
                                    }
                                },
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
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
                                                                        $eq: ['$email', '$$localID']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": email
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $expr: {
                                                                        $eq: ['$email', '$$user']
                                                                    }
                                                                },
                                                                {
                                                                    "friendlist.email": '$.email'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    friend:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $size: '$friendlist'
                                                                }, 0]
                                                            },
                                                            then: 1,
                                                            else: 0
                                                        }
                                                    },

                                                }
                                            },

                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "username",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {


                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userBasic",
                                        let: {
                                            localID: '$email'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$email', '$$localID']
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "fullName": 1,
                                                    "profilePict": 1,
                                                    "isCelebrity": 1,
                                                    "isIdVerified": 1,
                                                    "isPrivate": 1,
                                                    "isFollowPrivate": 1,
                                                    "isPostPrivate": 1,
                                                    "urluserBadge":
                                                    {
                                                        "$ifNull":
                                                            [
                                                                {
                                                                    "$filter":
                                                                    {
                                                                        input: "$userBadge",
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
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userBasic",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $set: {
                                        kosong: {
                                            $ifNull: ['$userBasic.profilePict.$id', "kancut"]
                                        }
                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediaprofilepicts",
                                        as: "avatar",
                                        let: {
                                            localID: '$kosong'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $eq: ['$mediaID', "$$localID"]
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
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "isLike",
                                        let: {
                                            picts: '$postID',

                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$postID', '$$picts']
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

                                                        },

                                                    ]
                                                },

                                            },
                                            {
                                                $set: {
                                                    kancut: {
                                                        $ifNull: ["email", "kosong"]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "email": 1,
                                                    "postID": 1,
                                                    isLiked:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$kancut", "kosong"]
                                                            },
                                                            then: false,
                                                            else: true
                                                        }
                                                    },

                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "contentevents",
                                        as: "following",
                                        let: {
                                            localID: '$email',
                                            user: email
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $and: [
                                                        {
                                                            $expr: {
                                                                $eq: ['$senderParty', '$$localID']
                                                            }
                                                        },
                                                        {
                                                            "email": email
                                                        },
                                                        {
                                                            "eventType": "FOLLOWING",

                                                        },
                                                        {
                                                            "event": "ACCEPT"
                                                        },
                                                        {
                                                            "active": true
                                                        },

                                                    ]
                                                }
                                            },
                                            {
                                                $project: {
                                                    following:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $gt: [{
                                                                    $strLenCP: "$email"
                                                                }, 0]
                                                            },
                                                            then: true,
                                                            else: false
                                                        }
                                                    },

                                                }
                                            }
                                        ]
                                    },

                                },
                                {
                                    "$lookup": {
                                        from: "interests_repo",
                                        as: "cats",
                                        let: {
                                            localID: '$category.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match: {

                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $in: ['$_id', {
                                                                    $ifNull: ['$$localID', []]
                                                                }]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    "interestName": 1,
                                                    "langIso": 1,
                                                    "icon": 1,
                                                    "createdAt": 1,
                                                    "updatedAt": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userbasics",
                                        as: "userInterest",
                                        let: {
                                            localID: email
                                        },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            {
                                                                $eq: ["$email", "$$localID"]
                                                            },

                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    userInterests: "$userInterests.$id",
                                                    email: 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "userauths",
                                        as: "userTag",
                                        let: {
                                            localID: '$tagPeople.$id'
                                        },
                                        pipeline: [
                                            {
                                                $match:
                                                {
                                                    $expr: {
                                                        $in: ['$_id', {
                                                            $ifNull: ['$$localID', []]
                                                        }]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {

                                                    "username": 1
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    "$lookup": {
                                        from: "mediamusic",
                                        as: "music",
                                        let: {
                                            localID: '$musicId'
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
                                                    "musicTitle": 1,
                                                    "artistName": 1,
                                                    "albumName": 1,
                                                    "apsaraMusic": 1,
                                                    "apsaraThumnail": 1,
                                                    "genre": "$genre.name",
                                                    "theme": "$theme.name",
                                                    "mood": "$mood.name",

                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$genre",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$theme",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: "$mood",
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            }
                                        ],

                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$media",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$username",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$music",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $unwind: {
                                        path: "$userInterest",
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: {

                                        "scorePict": 1,
                                        "boosted": 1,
                                        "reportedStatus": 1,
                                        "_id": 1,
                                        "mediaThumbEndpoint": 1,
                                        "mediaEndpoint": 1,
                                        "mediaType": 1,
                                        "createdAt": 1,
                                        "updatedAt": 1,
                                        "postID": 1,
                                        "email": 1,
                                        "postType": 1,
                                        "description": 1,
                                        "active": 1,
                                        "metadata": 1,
                                        "location": 1,
                                        "isOwned": 1,
                                        "visibility": 1,
                                        "isViewed": 1,
                                        "allowComments": 1,
                                        "saleAmount": 1,
                                        "uploadSource": 1,
                                        "monetize": 1,
                                        "comments": 1,
                                        "likes": 1,
                                        "viewed": 1,
                                        "insight": 1,
                                        "apsaraId": 1,
                                        "isApsara": 1,
                                        "apsaraThumbId": 1,
                                        "viewer": 1,
                                        "fullName": "$userBasic.fullName",
                                        "username": "$username.username",
                                        "avatar": 1,
                                        "urluserBadge":
                                        {
                                            "$ifNull":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$userBasic.urluserBadge", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        },
                                        isLiked: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$isLike.isLiked", 0]
                                            }, false]
                                        },
                                        "privacy": {
                                            "isCelebrity": "$userBasic.isCelebrity",
                                            "isIdVerified": "$userBasic.isIdVerified",
                                            "isPrivate": "$userBasic.isPrivate",
                                            "isFollowPrivate": "$userBasic.isFollowPrivate",
                                            "isPostPrivate": "$userBasic.isPostPrivate",

                                        },
                                        "verified": "$userBasic.isIdVerified",
                                        friend: {
                                            $ifNull: [{
                                                $arrayElemAt: ["$friend.friend", 0]
                                            }, 0]
                                        },
                                        "following": {
                                            $ifNull: [{
                                                $arrayElemAt: ["$following.following", 0]
                                            }, false]
                                        },
                                        "musicTitle": "$music.musicTitle",
                                        "artistName": "$music.artistName",
                                        "albumName": "$music.albumName",
                                        "apsaraMusic": "$music.apsaraMusic",
                                        "apsaraThumnail": "$music.apsaraThumnail",
                                        "genre": "$music.genre.name",
                                        "theme": "$music.theme.name",
                                        "mood": "$music.mood.name",
                                        "testDate": 1,
                                        "musicId": 1,
                                        "music": 1,
                                        "tagPeople": "$userTag",
                                        "cats": "$cats",
                                        "contentModeration": 1,
                                        "reportedUserCount": 1,
                                        "contentModerationResponse": 1,
                                        "reportedUser": 1,
                                        "tags": 1
                                    }
                                },



                            ],

                    },

                },
            );
        }


        const query = await this.interestCountModel.aggregate(pipeline);
        return query;
    }

    async indexinterestmigration(keys: string, email: string, skip: number, limit: number, listpict: boolean, listvid: boolean, listdiary: boolean) {
        var mongo = require('mongoose');
        var pipeline = [];
        var renderfacet = {};

        pipeline.push(
            {
                $match: {
                    "_id": new mongo.Types.ObjectId(keys)
                }
            },
            {
                $lookup:
                {
                    from: "interests_repo",
                    localField: "_id",
                    foreignField: "_id",
                    as: "interest"
                }
            },
            {
                $unwind: {
                    path: "$interest"
                }
            },
            {
                $lookup: {
                    from: "newPosts",
                    let: {
                        localID: "$listdata.postID"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $in: ['$postID', '$$localID']
                                        }
                                    },
                                    {
                                        "reportedStatus": {
                                            $ne: "OWNED"
                                        }
                                    },
                                    {
                                        "visibility": "PUBLIC"
                                    },
                                    {
                                        "active": true
                                    },
                                    {
                                        "reportedUser.email": {
                                            $not: {
                                                $regex: email
                                            }
                                        }
                                    },

                                ]
                            },

                        },
                        {
                            $project: {
                                "mediaSource": 1,
                                "boosted":
                                {
                                    $cond: {
                                        if: {
                                            $gt: [{
                                                "$dateToString": {
                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                    "date": {
                                                        $add: [new Date(), 25200000]
                                                    }
                                                }
                                            }, "$boosted.boostSession.timeEnd"]
                                        },
                                        then: [],
                                        else: '$boosted'
                                    }
                                },
                                "reportedStatus": 1,
                                "insight": {
                                    "shares": "$shares",
                                    "comments": "$comments",
                                    "views": "$views",
                                    "likes": "$likes",

                                },
                                "comments": "$comments",
                                "likes": "$likes",
                                "scorePict": 1,
                                "_id": 1,
                                "postID": 1,
                                "createdAt": 1,
                                "updatedAt": 1,
                                "email": 1,
                                "postType": 1,
                                "description": 1,
                                "active": 1,
                                "metadata": 1,
                                "location": 1,
                                "isOwned": 1,
                                "visibility": 1,
                                "isViewed": 1,
                                "allowComments": 1,
                                "saleAmount": 1,
                                "isLiked": 1,
                                urlLink: 1,
                                judulLink:1,

                            }
                        }
                    ],
                    as: "posted"
                },

            },
        );

        renderfacet['interest'] = [
            {
                $project: {
                    _id: 1,
                    tag: "$_id",
                    interestNameId: "$interest.interestNameId",
                    interestNameEn: "$interest.interestName",
                    total: "$total",
                }
            }
        ];

        if (listpict == true) {
            renderfacet['pict'] = [
                {
                    $project: {
                        pict: "$posted"
                    }
                },
                {
                    $unwind: {
                        path: "$pict"
                    }
                },
                {
                    $match: {
                        "pict.postType": "pict"
                    }
                },
                {
                    $set:
                    {
                        media:
                        {
                            isApsara: { $arrayElemAt: ['$pict.mediaSource.apsara', 0] },
                            apsaraId: { $arrayElemAt: ['$pict.mediaSource.apsaraId', 0] },
                            apsaraThumbId: { $arrayElemAt: ['$pict.mediaSource.apsaraThumbId', 0] },
                            mediaUri: { $arrayElemAt: ['$pict.mediaSource.mediaUri', 0] },
                            postID: "$pict.postID",
                            mediaEndpoint: {
                                '$concat': ['/pict/', '$pict.postID']
                            },
                            mediaThumbEndpoint: {
                                '$concat': ['/thumb/', '$pict.postID']
                            },
                            mediaThumbUri: { $arrayElemAt: ['$pict.mediaSource.mediaThumb', 0] },
                            mediaType: { $arrayElemAt: ['$pict.mediaSource.mediaType', 0] },
                            uploadSource: { $arrayElemAt: ['$pict.mediaSource.uploadSource', 0] },
                            mediaThumUri: { $arrayElemAt: ['$pict.mediaSource.mediaThumUri', 0] },
                        }
                    }
                },
                {
                    $project:
                    {
                        "scorePict": "$pict.scorePict",
                        "boosted": "$pict.boosted",
                        "reportedStatus": "$pict.reportedStatus",
                        "_id": "$pict._id",
                        "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                        "mediaEndpoint": "$media.mediaEndpoint",
                        "mediaType": "$media.mediaType",
                        "createdAt": "$pict.createdAt",
                        "updatedAt": "$pict.updatedAt",
                        "postID": "$pict.postID",
                        urlLink:  "$pict.urlLink",
                        judulLink: "$pict.judulLink",
                        "email": "$pict.postID",
                        "postType": "$pict.postType",
                        "description": "$pict.description",
                        "active": "$pict.active",
                        "metadata": "$pict.metadata",
                        "location": "$pict.location",
                        "isOwned": "$pict.isOwned",
                        "visibility": "$pict.visibility",
                        "isViewed": "$pict.isViewed",
                        "allowComments": "$pict.allowComments",
                        "saleAmount": "$pict.saleAmount",
                        "monetize":
                        {
                            $cond: {
                                if: {
                                    $gte: ["$pict.saleAmount", 1]
                                },
                                then: true,
                                else: "$taslimKONAG"
                            }
                        },
                        "comments": "$pict.comments",
                        "likes": "$pict.likes",
                        "insight":
                        {
                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                        },
                        "apsaraThumbId": "$media.apsaraThumbId",
                        "apsaraId": "$media.apsaraId",
                        "isApsara": "$media.isApsara",
                    }
                },
                {
                    $sort: {
                        isApsara: -1,
                        scorePict: - 1,
                        comments: - 1,
                        likes: - 1,
                        createdAt: -1
                    }
                },
                {
                    $skip: (skip * limit)
                },
                {
                    $limit: limit
                },
            ]
        }

        if (listvid == true) {
            renderfacet['video'] = [
                {
                    $project: {
                        pict: "$posted"
                    }
                },
                {
                    $unwind: {
                        path: "$pict"
                    }
                },
                {
                    $match: {
                        // "pict.postType": "vid"
                        "pict.postType": {
                            $in: ["vid", "diary"]
                        }
                    }
                },
                {
                    $set:
                    {
                        media:
                        {
                            isApsara: { $arrayElemAt: ['$pict.mediaSource.apsara', 0] },
                            apsaraId: { $arrayElemAt: ['$pict.mediaSource.apsaraId', 0] },
                            apsaraThumbId: { $arrayElemAt: ['$pict.mediaSource.apsaraThumbId', 0] },
                            mediaUri: { $arrayElemAt: ['$pict.mediaSource.mediaUri', 0] },
                            postID: "$pict.postID",
                            mediaEndpoint: {
                                '$concat': ['/stream/', '$pict.postID']
                            },
                            mediaThumbEndpoint: {
                                '$concat': ['/thumb/', '$pict.postID']
                            },
                            mediaThumbUri: { $arrayElemAt: ['$pict.mediaSource.mediaThumb', 0] },
                            mediaType: { $arrayElemAt: ['$pict.mediaSource.mediaType', 0] },
                            uploadSource: { $arrayElemAt: ['$pict.mediaSource.uploadSource', 0] },
                            mediaThumUri: { $arrayElemAt: ['$pict.mediaSource.mediaThumUri', 0] },
                        }
                    }
                },
                {
                    $project:
                    {
                        "scorePict": "$pict.scorePict",
                        "boosted": "$pict.boosted",
                        "reportedStatus": "$pict.reportedStatus",
                        "_id": "$pict._id",
                        "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                        "mediaEndpoint": "$media.mediaEndpoint",
                        "mediaType": "$media.mediaType",
                        "createdAt": "$pict.createdAt",
                        "updatedAt": "$pict.updatedAt",
                        "postID": "$pict.postID",
                        urlLink:  "$pict.urlLink",
                        judulLink: "$pict.judulLink",
                        "email": "$pict.postID",
                        "postType": "$pict.postType",
                        "description": "$pict.description",
                        "active": "$pict.active",
                        "metadata": "$pict.metadata",
                        "location": "$pict.location",
                        "isOwned": "$pict.isOwned",
                        "visibility": "$pict.visibility",
                        "isViewed": "$pict.isViewed",
                        "allowComments": "$pict.allowComments",
                        "saleAmount": "$pict.saleAmount",
                        "monetize":
                        {
                            $cond: {
                                if: {
                                    $gte: ["$pict.saleAmount", 1]
                                },
                                then: true,
                                else: "$taslimKONAG"
                            }
                        },
                        "comments": "$pict.comments",
                        "likes": "$pict.likes",
                        "insight":
                        {
                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                        },
                        "apsaraThumbId": "$media.apsaraThumbId",
                        "apsaraId": "$media.apsaraId",
                        "isApsara": "$media.isApsara",
                    }
                },
                {
                    $sort: {
                        isApsara: -1,
                        scorePict: - 1,
                        comments: - 1,
                        likes: - 1,
                        createdAt: -1
                    }
                },
                {
                    $skip: (skip * limit)
                },
                {
                    $limit: limit
                },
            ]
        }

        if (listdiary == true) {
            renderfacet['diary'] = [
                {
                    $project: {
                        pict: "$posted"
                    }
                },
                {
                    $unwind: {
                        path: "$pict"
                    }
                },
                {
                    $match: {
                        "pict.postType": "diary"
                    }
                },
                {
                    $set:
                    {
                        media:
                        {
                            isApsara: { $arrayElemAt: ['$pict.mediaSource.apsara', 0] },
                            apsaraId: { $arrayElemAt: ['$pict.mediaSource.apsaraId', 0] },
                            apsaraThumbId: { $arrayElemAt: ['$pict.mediaSource.apsaraThumbId', 0] },
                            mediaUri: { $arrayElemAt: ['$pict.mediaSource.mediaUri', 0] },
                            postID: "$pict.postID",
                            mediaEndpoint: {
                                '$concat': ['/stream/', '$pict.postID']
                            },
                            mediaThumbEndpoint: {
                                '$concat': ['/thumb/', '$pict.postID']
                            },
                            mediaThumbUri: { $arrayElemAt: ['$pict.mediaSource.mediaThumb', 0] },
                            mediaType: { $arrayElemAt: ['$pict.mediaSource.mediaType', 0] },
                            uploadSource: { $arrayElemAt: ['$pict.mediaSource.uploadSource', 0] },
                            mediaThumUri: { $arrayElemAt: ['$pict.mediaSource.mediaThumUri', 0] },
                        }
                    }
                },
                {
                    $project:
                    {
                        "scorePict": "$pict.scorePict",
                        "boosted": "$pict.boosted",
                        "reportedStatus": "$pict.reportedStatus",
                        "_id": "$pict._id",
                        "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                        "mediaEndpoint": "$media.mediaEndpoint",
                        "mediaType": "$media.mediaType",
                        "createdAt": "$pict.createdAt",
                        "updatedAt": "$pict.updatedAt",
                        "postID": "$pict.postID",
                        urlLink:  "$pict.urlLink",
                        judulLink: "$pict.judulLink",
                        "email": "$pict.postID",
                        "postType": "$pict.postType",
                        "description": "$pict.description",
                        "active": "$pict.active",
                        "metadata": "$pict.metadata",
                        "location": "$pict.location",
                        "isOwned": "$pict.isOwned",
                        "visibility": "$pict.visibility",
                        "isViewed": "$pict.isViewed",
                        "allowComments": "$pict.allowComments",
                        "saleAmount": "$pict.saleAmount",
                        "monetize":
                        {
                            $cond: {
                                if: {
                                    $gte: ["$pict.saleAmount", 1]
                                },
                                then: true,
                                else: "$taslimKONAG"
                            }
                        },
                        "comments": "$pict.comments",
                        "likes": "$pict.likes",
                        "insight":
                        {
                            $ifNull: ["$pict.insight", "$TaslimKAMPRET"]
                        },
                        "apsaraThumbId": "$media.apsaraThumbId",
                        "apsaraId": "$media.apsaraId",
                        "isApsara": "$media.isApsara",
                    }
                },
                {
                    $sort: {
                        isApsara: -1,
                        scorePict: - 1,
                        comments: - 1,
                        likes: - 1,
                        createdAt: -1
                    }
                },
                {
                    $skip: (skip * limit)
                },
                {
                    $limit: limit
                },
            ]
        }

        pipeline.push(
            {
                "$facet": renderfacet
            }
        );

        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth:null, showHidden:false }))

        var data = await this.interestCountModel.aggregate(pipeline);
        return data;
    }
}
