import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Userbasicnew, UserbasicnewDocument } from './schemas/userbasicnew.schema';
import { LogapisService } from '../logapis/logapis.service';
import { CreateuserbasicnewDto } from './dto/Createuserbasicnew-dto';
import { log } from 'console';

@Injectable()
export class UserbasicnewService {
    constructor(
        @InjectModel(Userbasicnew.name, 'SERVER_FULL')
        private readonly UserbasicnewModel: Model<UserbasicnewDocument>,
        private readonly logapiSS: LogapisService
    ) { }

    async create(Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        const _Userbasicnew_ = await this.UserbasicnewModel.create(Userbasicnew_);
        return _Userbasicnew_;
    }
    async findOne(id: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async updateUserAssets(email: string, assets: mongoose.Types.ObjectId[]) {
        return this.UserbasicnewModel.updateOne(
            { email: email },
            { $push: { userAssets: { $each: assets } } })
    }
    async updateUserBadge(id: string, userBadge: any[]): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "userBadge": userBadge } });
        return data;
    }
    async findBymail(email: string): Promise<Userbasicnew> {
        return await this.UserbasicnewModel.findOne({ email: email }).exec();
    }

    async findByIdavatar(idavatar: string): Promise<Userbasicnew> {
        return await this.UserbasicnewModel.findOne({ _idAvatar: idavatar }).exec();
    }
    async find(): Promise<Userbasicnew[]> {
        return this.UserbasicnewModel.find().exec();
    }
    async findByUsername(Username: String): Promise<Userbasicnew> {
        return await this.UserbasicnewModel.findOne({ username: Username }).exec();
    }
    async findbyemail(email: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ email: email }).exec();
    }

    async findbyemailLogin(email: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ emailLogin: email }).exec();
    }

    async findOneUsername(username: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ username: username }).exec();
    }

    async findone_(email: string) {
        var query = await this.UserbasicnewModel.aggregate([

            {
                $match: {
                    email: email
                }
            },
            {
                $project: {

                    "profileID": 1,
                    "email": 1,
                    "fullName": 1,
                    "gender": 1,
                    "status": 1,
                    "event": 1,
                    "isComplete": 1,
                    "isCelebrity": 1,
                    "isIdVerified": 1,
                    "isPrivate": 1,
                    "isFollowPrivate": 1,
                    "isPostPrivate": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "insight": 1,
                    "userInterests": 1,
                    "userAuth": 1,
                    "languages": 1,
                    "_class": 1,
                    "statusKyc": 1,
                    "reportedUser": 1,
                    "reportedUserHandle": 1,
                    "listAddKyc": 1,
                    "userAssets": 1,
                    "__v": 1,
                    "profilePict": 1,
                    "bio": 1,
                    "dob": 1,
                    "mobileNumber": 1,
                    "timeEmailSend": 1,
                    "regSrc": 1,
                    "icon": 1,
                    "userBadge": 1,
                    "countries": 1,
                    "states": 1,
                    "cities": 1,
                    "idProofNumber": 1,
                    "idProofStatus": 1,
                    "pin": 1,
                    "tutor": 1,
                    "otppinVerified": 1,
                    "creator": 1,
                    urluserBadge:
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
                                    },
                                },
                                []
                            ]
                    },
                }
            },
            {
                $project: {

                    "profileID": 1,
                    "email": 1,
                    "fullName": 1,
                    "gender": 1,
                    "status": 1,
                    "event": 1,
                    "isComplete": 1,
                    "isCelebrity": 1,
                    "isIdVerified": 1,
                    "isPrivate": 1,
                    "isFollowPrivate": 1,
                    "isPostPrivate": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "insight": 1,
                    "userInterests": 1,
                    "userAuth": 1,
                    "languages": 1,
                    "_class": 1,
                    "statusKyc": 1,
                    "reportedUser": 1,
                    "reportedUserHandle": 1,
                    "listAddKyc": 1,
                    "userAssets": 1,
                    "__v": 1,
                    "profilePict": 1,
                    "bio": 1,
                    "dob": 1,
                    "mobileNumber": 1,
                    "timeEmailSend": 1,
                    "regSrc": 1,
                    "icon": 1,
                    "userBadge": 1,
                    "countries": 1,
                    "states": 1,
                    "cities": 1,
                    "idProofNumber": 1,
                    "idProofStatus": 1,
                    "pin": 1,
                    "otppinVerified": 1,
                    "tutor": 1,
                    "creator": 1,
                    urluserBadge:
                    {
                        "$ifNull": [
                            {
                                "$arrayElemAt":
                                    [
                                        "$urluserBadge", 0
                                    ]
                            },
                            null
                        ]
                    },
                }
            }
        ]);
        return query[0];
    }

    async findbyboth(email: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne(
            {
                "$or":
                    [
                        {
                            "email": email
                        },
                        {
                            "emailLogin": email
                        }
                    ]
            }
        ).exec();
    }

    async findbyidboth(id: string): Promise<Userbasicnew> {
        var mongo = require('mongoose');
        return this.UserbasicnewModel.findOne(
            {
                "$or":
                    [
                        {
                            "_id": new mongo.Types.ObjectId(id)
                        },
                        {
                            "_idAuth": new mongo.Types.ObjectId(id)
                        }
                    ]
            }
        ).exec();
    }

    async findGuestUser(): Promise<Userbasicnew[]> {
        return this.UserbasicnewModel.find({ guestMode: true }).exec();
    }

    async findbyusername(username: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ username: username }).exec();
    }

    async findbyidauth(id: string): Promise<Userbasicnew> {
        var mongo = require('mongoose');
        return this.UserbasicnewModel.findOne({ _idAuth: new mongo.Types.ObjectId(id) }).exec();
    }
    async updatebyEmail(email: String, data: Object) {
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            data,
            function (err, docs) {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log(docs);
                }
            },
        );
    }

    async updateData(email: string, createUserbasicDto: CreateuserbasicnewDto): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ email: email },
            createUserbasicDto,
            function (err, docs) {
                if (err) {
                    console.log("Updated Error : ", err)
                } else {
                    console.log("Updated Docs : ", docs);
                }
            }).clone().exec();
        return data;
    }

    async finddetail(email: string) {
        var result = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    email: email
                }
            },
            {
                "$addFields":
                {
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
                                    },
                                },
                                []
                            ]
                    },
                }
            },
            {
                "$project":
                {
                    "_id": 1,
                    "profileID": 1,
                    "email": 1,
                    "emailLogin": 1,
                    "fullName": 1,
                    "dob": 1,
                    "gender":
                    {
                        "$ifNull":
                            [
                                "$gender",
                                "Other"
                            ]
                    },
                    "status": 1,
                    "event": 1,
                    "isComplete": 1,
                    "isCelebrity": 1,
                    "isIdVerified": 1,
                    "isPrivate": 1,
                    "isFollowPrivate": 1,
                    "isPostPrivate": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "insight": 1,
                    "userInterests": 1,
                    "languages": 1,
                    "_class": 1,
                    "statusKyc": 1,
                    "reportedUser": 1,
                    "reportedUserHandle": 1,
                    "listAddKyc": 1,
                    "userAssets": 1,
                    "__v": 1,
                    "profilePict": 1,
                    "bio": 1,
                    "mobileNumber": 1,
                    "timeEmailSend": 1,
                    "icon": 1,
                    "userBadge": 1,
                    "countries": 1,
                    "states": 1,
                    "cities": 1,
                    "idProofNumber": 1,
                    "idProofStatus": 1,
                    "pin": 1,
                    "otppinVerified": 1,
                    "tutor": 1,
                    urluserBadge:
                    {
                        "$ifNull": [
                            {
                                "$arrayElemAt":
                                    [
                                        "$urluserBadge", 0
                                    ]
                            },
                            null
                        ]
                    },
                    "username": 1,
                    "languagesLangIso": 1,
                    "countriesName": 1,
                    "citiesName": 1,
                    "statesName": 1,
                    "mediaBasePath": 1,
                    "mediaUri": 1,
                    "avatar":
                    {
                        "mediaBasePath": "$mediaBasePath",
                        "mediaEndpoint": "$mediaEndpoint",
                        "mediaType": "$mediaType",
                        "mediaUri": "$mediaUri"
                    },
                    "mediaType": 1,
                    "mediaEndpoint": 1,
                    "oneTimePassword": 1,
                    "otpToken": 1,
                    "isEmailVerified": 1,
                    "authUsers": 1,
                    "roles": 1,
                    "otpNextAttemptAllow": 1,
                    "follower": 1,
                    "following": 1,
                    "userEvent": 1,
                    "languagesLang": 1,
                    "password": 1,
                    "userID": 1,
                    "isExpiryPass": 1,
                    "otpRequestTime": 1,
                    "otpAttempt": 1,
                    "location": 1,
                    "isEnabled": 1,
                    "isAccountNonExpired": 1,
                    "isAccountNonLocked": 1,
                    "isCredentialsNonExpired": 1,
                    "_idAvatar": 1,
                    "originalName": 1,
                    "fsSourceUri": 1,
                    "fsSourceName": 1,
                    "fsTargetUri": 1,
                    "kyc": 1,
                    "creator": 1
                }
            }
        ]);

        return result[0];
    }

    async finddetail2(email: string) {
        var result = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    emailLogin: email
                }
            },
            {
                "$addFields":
                {
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
                                    },
                                },
                                []
                            ]
                    },
                }
            },
            {
                "$project":
                {
                    "_id": 1,
                    "profileID": 1,
                    "email": 1,
                    "emailLogin": 1,
                    "fullName": 1,
                    "dob": 1,
                    "gender":
                    {
                        "$ifNull":
                            [
                                "$gender",
                                "Other"
                            ]
                    },
                    "status": 1,
                    "event": 1,
                    "isComplete": 1,
                    "isCelebrity": 1,
                    "isIdVerified": 1,
                    "isPrivate": 1,
                    "isFollowPrivate": 1,
                    "isPostPrivate": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "insight": 1,
                    "userInterests": 1,
                    "languages": 1,
                    "_class": 1,
                    "statusKyc": 1,
                    "reportedUser": 1,
                    "reportedUserHandle": 1,
                    "listAddKyc": 1,
                    "userAssets": 1,
                    "__v": 1,
                    "profilePict": 1,
                    "bio": 1,
                    "mobileNumber": 1,
                    "timeEmailSend": 1,
                    "icon": 1,
                    "userBadge": 1,
                    "countries": 1,
                    "states": 1,
                    "cities": 1,
                    "idProofNumber": 1,
                    "idProofStatus": 1,
                    "pin": 1,
                    "otppinVerified": 1,
                    "tutor": 1,
                    urluserBadge:
                    {
                        "$ifNull": [
                            {
                                "$arrayElemAt":
                                    [
                                        "$urluserBadge", 0
                                    ]
                            },
                            null
                        ]
                    },
                    "username": 1,
                    "languagesLangIso": 1,
                    "countriesName": 1,
                    "citiesName": 1,
                    "statesName": 1,
                    "mediaBasePath": 1,
                    "mediaUri": 1,
                    "mediaType": 1,
                    "mediaEndpoint": 1,
                    "oneTimePassword": 1,
                    "otpToken": 1,
                    "isEmailVerified": 1,
                    "authUsers": 1,
                    "roles": 1,
                    "otpNextAttemptAllow": 1,
                    "follower": 1,
                    "following": 1,
                    "userEvent": 1,
                    "languagesLang": 1,
                    "password": 1,
                    "userID": 1,
                    "isExpiryPass": 1,
                    "otpRequestTime": 1,
                    "otpAttempt": 1,
                    "location": 1,
                    "isEnabled": 1,
                    "isAccountNonExpired": 1,
                    "isAccountNonLocked": 1,
                    "isCredentialsNonExpired": 1,
                    "_idAvatar": 1,
                    "originalName": 1,
                    "fsSourceUri": 1,
                    "fsSourceName": 1,
                    "fsTargetUri": 1,
                    "kyc": 1
                }
            }
        ]);

        return result[0];
    }

    async detailDenganlookupLain(target: string, tipe: string) {
        var pipeline = [];
        if (tipe == 'id') {
            var mongo = require('mongoose');
            pipeline.push(
                {
                    "$match":
                    {
                        _id: new mongo.Types.ObjectId(target)
                    }
                }
            );
        }
        else {
            pipeline.push(
                {
                    "$match":
                    {
                        email: target
                    }
                }
            );
        }

        pipeline.push(
            {
                $lookup:
                {
                    from: 'insights',
                    localField: 'insight.$id',
                    foreignField: '_id',
                    as: 'insight_data',
                },
            },
            {
                $lookup:
                {
                    from: 'referral',
                    localField: 'email',
                    foreignField: 'parent',
                    as: 'total_referral',
                },
            },
            {
                $lookup:
                {
                    from: 'referral',
                    let:
                    {
                        "fk_id": "$email"
                    },
                    as: "invitation",
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                            [
                                                "$children",
                                                "$$fk_id"
                                            ]
                                    }
                                }
                            },
                            {
                                "$sort":
                                {
                                    createdAt: 1
                                }
                            },
                            {
                                "$limit": 1
                            },
                            {
                                $lookup:
                                {
                                    from: 'newUserBasics',
                                    localField: 'parent',
                                    foreignField: 'email',
                                    as: 'detail_user',
                                },
                            },
                            {
                                "$unwind":
                                {
                                    path: "$detail_user"
                                }
                            },
                            {
                                "$project":
                                {
                                    _id: "$detail_user._id",
                                    fullName: "$detail_user.fullName",
                                    email: "$detail_user.email",
                                    username: "$detail_user.username",
                                }
                            }
                        ]
                }
            },
            {
                $lookup:
                {
                    from: 'userbankaccounts',
                    let:
                    {
                        "id": "$_id"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $eq: ["$userId", "$$id"]
                                }
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "banks",
                                localField: "idBank",
                                foreignField: "_id",
                                as: "bankName",
                            }
                        },
                        {
                            "$project":
                            {
                                userId: 1,
                                noRek: 1,
                                nama: 1,
                                statusInquiry: 1,
                                active: 1,
                                bankId:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName._id", 0
                                        ]
                                },
                                bankcode:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.bankcode", 0
                                        ]
                                },
                                bankname:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.bankname", 0
                                        ]
                                },
                                urlEbanking:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.urlEbanking", 0
                                        ]
                                },
                                bankIcon:
                                {
                                    "$arrayElemAt":
                                        [
                                            "$bankName.bankIcon", 0
                                        ]
                                },
                            }
                        }
                    ],
                    as: 'userbankaccounts_data'
                }
            },
            {
                "$facet":
                {
                    "detail":
                        [
                            {
                                "$project":
                                {
                                    _id: 1,
                                    email: 1,
                                    areas: "$statesName",
                                    country: "$countriesName",
                                    city: "$citiesName",
                                    gender: {
                                        $switch: {
                                            branches: [
                                                {
                                                    case: { $eq: ["$gender", "Laki-laki"] },
                                                    then: "MALE"
                                                },
                                                {
                                                    case: { $eq: ["$gender", "Pria"] },
                                                    then: "MALE"
                                                },
                                                {
                                                    case: { $eq: ["$gender", "Female"] },
                                                    then: "FEMALE"
                                                },
                                                {
                                                    case: { $eq: ["$gender", "Wanita"] },
                                                    then: "FEMALE"
                                                },
                                                {
                                                    case: { $eq: ["$gender", "Perempuan"] },
                                                    then: "FEMALE"
                                                },
                                                {
                                                    case: { $eq: ["$gender", "MALE"] },
                                                    then: "MALE"
                                                },
                                                {
                                                    case: { $eq: ["$gender", "FEMALE"] },
                                                    then: "FEMALE"
                                                },
                                            ],
                                            "default": "OTHER"
                                        }
                                    },
                                    createdAt: 1,
                                    idProofNumber: 1,
                                    mobileNumber: 1,
                                    roles: 1,
                                    fullName: 1,
                                    bio: 1,
                                    referralCount:
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$size": "$total_referral"
                                                }, 0
                                            ]
                                    },
                                    loginSrc:
                                    {
                                        "$ifNull":
                                            [
                                                "$loginSrc",
                                                "-"
                                            ]
                                    },
                                    invitation:
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$invitation", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                    avatar:
                                    {
                                        mediaBasePath:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaBasePath",
                                                    null
                                                ]
                                        },
                                        mediaUri:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaUri",
                                                    null
                                                ]
                                        },
                                        mediaType:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaType",
                                                    null
                                                ]
                                        },
                                        mediaEndpoint:
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaEndpoint",
                                                    null
                                                ]
                                        },
                                    },
                                    isIdVerified: 1,
                                    isEmailVerified: 1,
                                    idProofStatus: 1,
                                    insight:
                                    {
                                        shares:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.shares", 0
                                                ]
                                        },
                                        followers:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.followers", 0
                                                ]
                                        },
                                        comments:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.comments", 0
                                                ]
                                        },
                                        followings:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.followings", 0
                                                ]
                                        },
                                        reactions:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.reactions", 0
                                                ]
                                        },
                                        posts:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.posts", 0
                                                ]
                                        },
                                        views:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.views", 0
                                                ]
                                        },
                                        likes:
                                        {
                                            "$arrayElemAt":
                                                [
                                                    "$insight_data.likes", 0
                                                ]
                                        },
                                        friend:
                                        {
                                            "$size": "$friend"
                                        }
                                    },
                                    langIso: "$languagesLangIso",
                                    interest: "$interests_repo_data",
                                    dob: 1,
                                    event: 1,
                                    username: 1,
                                    isComplete: 1,
                                    status: 1,
                                    statusUser:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq": ["$isIdVerified", true]
                                            },
                                            then: "PREMIUM",
                                            else: "BASIC"
                                        }
                                    },
                                    loginSource:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$eq":
                                                    [
                                                        "$password", "$2a$10$GTQLm6mRlZVoBhR8LSm8T.CDI3TG6CViPdiTAt2tfRY3dNwOk7s1G"
                                                    ]
                                            },
                                            then: "socmed",
                                            else: "manual"

                                        }
                                    },
                                    databank: "$userbankaccounts_data",
                                    mediaId: "$proofPict.$id"
                                }
                            }
                        ],
                    "interests":
                        [
                            {
                                "$lookup":
                                {
                                    from: 'interests',
                                    localField: 'userInterests.$id',
                                    foreignField: '_id',
                                    as: 'interest_data',
                                },
                            },
                            {
                                "$unwind":
                                {
                                    path: "$interest_data",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                "$project":
                                {
                                    _id: 0,
                                    interestName: "$interest_data.interestName",
                                    icon: "$interest_data.icon",
                                    createdAt: "$interest_data.createdAt",
                                    updatedAt: "$interest_data.updatedAt",
                                    _class: "$interest_data._class",
                                }
                            }
                        ],
                    "dokumen":
                        [
                            {
                                "$unwind":
                                {
                                    path: "$kyc",
                                    // preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                "$match":
                                {
                                    "kyc":
                                    {
                                        "$ne": {}
                                    }
                                }
                            },
                            {
                                "$set":
                                {
                                    "proofPict2":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    $toString: "$_id"
                                                },
                                                ""
                                            ]
                                    }
                                }
                            },
                            {
                                "$project":
                                {
                                    valid: "$kyc.valid",
                                    idcardnumber: "$kyc.idcardnumber",
                                    postType: "$kyc.postType",
                                    proofpictUploadSource: "$kyc.proofpictUploadSource",
                                    nama: "$kyc.nama",
                                    tempatLahir: "$kyc.tempatLahir",
                                    // jenisKelamin: "$kyc.jenisKelamin",
                                    jenisKelamin: {
                                        $switch: {
                                            branches: [
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", 'FEMALE']
                                                    },
                                                    then: 'FEMALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", ' FEMALE']
                                                    },
                                                    then: 'FEMALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", 'Perempuan']
                                                    },
                                                    then: 'FEMALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", 'Wanita']
                                                    },
                                                    then: 'FEMALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", 'MALE']
                                                    },
                                                    then: 'MALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", ' MALE']
                                                    },
                                                    then: 'MALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", 'Laki-laki']
                                                    },
                                                    then: 'MALE',

                                                },
                                                {
                                                    case: {
                                                        $eq: ["$kyc.jenisKelamin", 'Pria']
                                                    },
                                                    then: 'MALE',

                                                },

                                            ],
                                            default: "OTHER",

                                        },
                                    },
                                    alamat: "$kyc.alamat",
                                    agama: "$kyc.agama",
                                    statusPerkawinan: "$kyc.statusPerkawinan",
                                    pekerjaan: "$kyc.pekerjaan",
                                    kewarganegaraan: "$kyc.kewarganegaraan",
                                    dokumen:
                                        [
                                            {
                                                mediaproofpicts:
                                                {
                                                    mediaId: "$proofPict2",
                                                    mediaBasePath: "$kyc.mediaBasePath",
                                                    mediaUri: "$kyc.mediaUri",
                                                    postType: "$kyc.mediaType",
                                                    mediaEndpoint:
                                                    {
                                                        "$concat":
                                                            [
                                                                "proofpict",
                                                                "/",
                                                                "$proofPict2"
                                                            ]
                                                    }
                                                },
                                                mediaSelfiepicts:
                                                {
                                                    mediaId: "$proofPict2",
                                                    mediaBasePath: "$kyc.mediaSelfieBasePath",
                                                    mediaUri: "$kyc.mediaSelfieUri",
                                                    postType: "$kyc.mediaSelfieType",
                                                    mediaEndpoint:
                                                    {
                                                        "$concat":
                                                            [
                                                                "selfiepict",
                                                                "/",
                                                                "$proofPict2"
                                                            ]
                                                    }
                                                },
                                                mediaSupportfile:
                                                {
                                                    mediaEndpoint:
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $or: [{
                                                                    $eq: ['$kyc.SupportfsSourceUri', null]
                                                                }, {
                                                                    $eq: ['$kyc.SupportfsSourceUri', ""]
                                                                }, {
                                                                    $eq: ['$kyc.SupportfsSourceUri', []]
                                                                }, {
                                                                    $eq: ['$kyc.SupportfsSourceUri', {}]
                                                                }]
                                                            },
                                                            then: [],
                                                            else: '$kyc.SupportfsSourceUri'
                                                        },
                                                    }
                                                }
                                            }
                                        ]
                                }
                            }
                        ]
                }
            },
            {
                "$project":
                {
                    _id:
                    {
                        "$arrayElemAt":
                            [
                                "$detail._id", 0
                            ]
                    },
                    email:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.email", 0
                            ]
                    },
                    fullName:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.fullName", 0
                            ]
                    },
                    dob:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.dob", 0
                            ]
                    },
                    mobileNumber:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.mobileNumber", 0
                            ]
                    },
                    status:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.status", 0
                            ]
                    },
                    event:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.event", 0
                            ]
                    },
                    idProofNumber:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.idProofNumber", 0
                            ]
                    },
                    idProofStatus:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.idProofStatus", 0
                            ]
                    },
                    isComplete:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.isComplete", 0
                            ]
                    },
                    isIdVerified:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.isIdVerified", 0
                            ]
                    },
                    createdAt:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.createdAt", 0
                            ]
                    },
                    bio:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.bio", 0
                            ]
                    },
                    insight:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.insight", 0
                            ]
                    },
                    gender:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.gender", 0
                            ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.username", 0
                            ]
                    },
                    isEmailVerified:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.isEmailVerified", 0
                            ]
                    },
                    roles:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.roles", 0
                            ]
                    },
                    areas:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.areas", 0
                            ]
                    },
                    country:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.country", 0
                            ]
                    },
                    city:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.city", 0
                            ]
                    },
                    avatar:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.avatar", 0
                            ]
                    },
                    langIso:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.langIso", 0
                            ]
                    },
                    loginSrc:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.loginSrc", 0
                            ]
                    },
                    invitationDetail:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.invitation", 0
                            ]
                    },
                    statusUser:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.statusUser", 0
                            ]
                    },
                    databank:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.databank", 0
                            ]
                    },
                    mediaId:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.mediaId", 0
                            ]
                    },
                    referralCount:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.referralCount", 0
                            ]
                    },
                    loginSource:
                    {
                        "$arrayElemAt":
                            [
                                "$detail.loginSource", 0
                            ]
                    },
                    interest:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$and":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$size": "$interests"
                                                    },
                                                    0
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$detail._id", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        }
                                    ]
                            },
                            then: "$$REMOVE",
                            else: "$interests"
                        }
                    },
                    dokumen:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$and":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$size": "$dokumen"
                                                    },
                                                    0
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    {
                                                        "$arrayElemAt":
                                                            [
                                                                "$detail._id", 0
                                                            ]
                                                    },
                                                    null
                                                ]
                                        }
                                    ]
                            },
                            then: "$$REMOVE",
                            else:
                            {
                                "$arrayElemAt":
                                    [
                                        "$dokumen", 0
                                    ]
                            }
                        }
                    },
                }
            }
        );

        // console.log(JSON.stringify(pipeline));

        var data = await this.UserbasicnewModel.aggregate(pipeline);

        return data;
    }

    async update(id: string, Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        let data = await this.UserbasicnewModel.findByIdAndUpdate(id, Userbasicnew_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updatebyEmailV2(email: string, dto: Userbasicnew) {
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            dto,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        ).clone().exec();
    }

    async updatebyemail(email: string, Userbasicnew_: Userbasicnew) {
        let data = await this.UserbasicnewModel.updateOne(
            {
                email: email
            },
            Userbasicnew_,
            { new: true }
        );

        if (!data) {
            throw new Error('Data is not found!');
        }

        return data;
    }

    async updatebyEmailAuth(email: String, data: Object) {
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            data,
            function (err, docs) {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log(docs);
                }
            },
        );
    }
    async updateStatusemail(email: string, timeEmailSend: string): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "email": email },
            {
                $set: {
                    timeEmailSend: timeEmailSend
                }
            },
        );
        return data;
    }

    async findOneupdatebyEmail(email: String) {
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            { $inc: { otpAttempt: 1 } },
            function (err, docs) {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log(docs);
                }
            },
        );
    }

    async delete(id: string) {
        const data = await this.UserbasicnewModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

    async updateLanguage(email: string, CreateUserbasicnewDto_: Userbasicnew) {
        console.log(CreateUserbasicnewDto_);
        this.UserbasicnewModel.updateOne(
            {
                email: email,
            },
            {
                $set: CreateUserbasicnewDto_
            },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        ).clone().exec();
    }

    async getUserActiveByDate(startdate: string) {
        var convertstart = startdate.split(" ")[0];
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var convertend = DateTime.substring(0, DateTime.lastIndexOf('.')).split(" ")[0];

        //kalo error, coba ganti jadi set dan jadi object
        var query = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    createdAt:
                    {
                        "$gte": convertstart,
                        "$lte": convertend
                    },
                    isEnabled: true
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

    async regexfindUser(target: string, page: number, limit: number) {
        var query = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    "username":
                    {
                        "$regex": target,
                        "$options": "i"
                    },
                    "guestMode": {
                        $ne: true
                    }

                }
            },
            {
                "$project":
                {
                    idUserAuth: "$_id",
                    email: 1,
                    profilpictId: "$profilePict.$id",
                    fullName: 1,
                    username: 1,
                    avatar:
                    {
                        mediaBasePath: "$mediaBasePath",
                        mediaUri: "$mediaUri",
                        mediaType: "$mediaType",
                        mediaEndpoint: "$mediaEndpoint"
                    }
                }
            },
            {
                "$sort":
                {
                    fullName: 1
                }
            },
            {
                "$skip": page * limit
            },
            {
                "$limit": limit
            }
        ]);

        return query;
    }

    async getUserHyppe3(search: string, startdate: string, enddate: string, jabatan: any[], divisi: any[], status: boolean, skip: number, limit: number, ascending: boolean) {
        var pipeline = [];
        pipeline.push(
            { '$match': { email: /@hyppe.id/i } },
            {
                '$lookup': {
                    from: 'group',
                    let: { userName: '$_id' },
                    pipeline: [
                        {
                            '$match': { '$expr': { '$in': ['$$userName', '$userbasics'] } }
                        }
                    ],
                    as: 'group_userbasics'
                }
            },
            {
                '$project': {
                    idUserAuth: "$id",
                    group_userbasics: {
                        '$ifNull': [{ '$arrayElemAt': ['$group_userbasics', 0] }, null]
                    },
                    fullName: '$fullName',
                    username: '$username',
                    email: '$email',
                    isIdVerified: '$isIdVerified',
                    createdAt: "$createdAt",
                    roles: { '$ifNull': ['$roles', []] },
                    avatar: {
                        mediaBasePath: { '$ifNull': ['$mediaBasePath', null] },
                        mediaUri: { '$ifNull': ['$mediaUri', null] },
                        mediaType: { '$ifNull': ['$mediaType', null] },
                        mediaEndpoint: { '$ifNull': ['$mediaEndpoint', null] }
                    }
                }
            },
            {
                '$lookup': {
                    from: 'division',
                    localField: 'group_userbasics.divisionId',
                    foreignField: '_id',
                    as: 'division_data'
                }
            },
            {
                '$project': {
                    idUserAuth: "$idUserAuth",
                    group_userbasics: '$group_userbasics',
                    fullName: '$fullName',
                    username: '$username',
                    email: '$email',
                    isIdVerified: { '$in': ['ROLE_ADMIN', '$roles'] },
                    avatar: '$avatar',
                    createdAt: "$createdAt",
                }
            },
            {
                '$lookup': {
                    from: 'division',
                    localField: 'group_userbasics.divisionId',
                    foreignField: '_id',
                    as: 'division_data'
                }
            },
            {
                '$project': {
                    namadivisi: { '$arrayElemAt': ['$division_data.nameDivision', 0] },
                    group: '$group_userbasics.nameGroup',
                    groupId: '$group_userbasics._id',
                    fullName: '$fullName',
                    username: '$username',
                    email: '$email',
                    status: "$isIdVerified",
                    avatar: '$avatar',
                    createdAt: "$createdAt"
                }
            },
        );

        var firstmatch = [];
        if (search != null) {
            firstmatch.push({
                "$or":
                    [
                        {
                            "username":
                            {
                                $regex: search,
                                $options: 'i'
                            }
                        },
                        {
                            "email":
                            {
                                $regex: search,
                                $options: 'i'
                            }
                        },
                    ]
            });
        }

        if (startdate != null && enddate != null) {
            var convertstart = startdate.split(" ")[0];
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
            var convertend = currentdate.toISOString().split("T")[0];

            firstmatch.push({
                "$expr":
                {
                    "$and":
                        [
                            {
                                "$gte":
                                    [
                                        "$createdAt", convertstart
                                    ],
                            },
                            {
                                "$lt":
                                    [
                                        "$createdAt", convertend
                                    ]
                            }
                        ]
                }
            });
        }

        if (jabatan != null) {
            firstmatch.push({
                "group":
                {
                    "$in": jabatan
                }
            });
        }

        if (divisi != null) {
            firstmatch.push({
                "namadivisi":
                {
                    "$in": divisi
                }
            });
        }

        if (status != null) {
            firstmatch.push({
                "status": status
            });
        }

        if (firstmatch.length != 0) {
            pipeline.push({
                "$match":
                {
                    "$and": firstmatch
                }
            });
        }

        if (ascending != null) {
            var konvertsort = null;
            if (ascending == true) {
                konvertsort = 1;
            }
            else {
                konvertsort = -1;
            }
            pipeline.push({
                "$sort":
                {
                    "createdAt": konvertsort
                }
            });
        }

        if (skip != null && skip > 0) {
            pipeline.push({
                "$skip": (skip * limit)
            });
        }

        if (limit != null && limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }

        // var consol = require('util');
        // console.log(consol.inspect(pipeline, { showHidden: false, depth: null, colors: true }))

        var data = await this.UserbasicnewModel.aggregate(pipeline);

        return data;
    }

    async listkycsummary2(startdate: string, enddate: string, jenisquery: string, keys: string, status: any[], descending: boolean, page: number, limit: number) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        var pipeline = [];
        var firstmatch = [];
        var order = null;

        firstmatch.push(
            {
                "kyc.valid":
                {
                    "$exists": true
                }
            },
            {
                "kyc.status":
                {
                    "$ne": null
                }
            },
            {
                "kyc.status":
                {
                    "$ne": ""
                }
            }
        );

        if (startdate != null && startdate != undefined) {
            startdate += " 00:00:00"
            firstmatch.push(
                {
                    "kyc.createdAt":
                    {
                        "$gte": startdate
                    }
                }
            );
        }

        if (enddate != null && enddate != undefined) {
            enddate += " 23:59:59"
            firstmatch.push(
                {
                    "kyc.createdAt":
                    {
                        "$lte": enddate
                    }
                }
            );
        }

        pipeline.push(
            {
                "$unwind":
                {
                    path: "$kyc"
                }
            },
            {
                "$match":
                {
                    "$and": firstmatch
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    kyc: 1,
                    email: 1,
                    username: 1,
                    userId: "$_id",
                    jumlahPermohonan: '1',
                    tahapan: "KTP",
                    avatar:
                    {
                        mediaBasePath:
                        {
                            "$ifNull":
                                [
                                    "$mediaBasePath",
                                    null
                                ]
                        },
                        mediaUri:
                        {
                            "$ifNull":
                                [
                                    "$mediaUri",
                                    null
                                ]
                        },
                        mediaType:
                        {
                            "$ifNull":
                                [
                                    "$mediaType",
                                    null
                                ]
                        },
                        mediaEndpoint:
                        {
                            "$ifNull":
                                [
                                    "$mediaEndpoint",
                                    null
                                ]
                        },
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    // kyc:1,
                    email: 1,
                    username: 1,
                    userId: 1,
                    jumlahPermohonan: 1,
                    tahapan: 1,
                    avatar: 1,
                    // kycHandle:
                    // {
                    //     "$ifNull":
                    //     [
                    //         "$kyc.kycHandle",
                    //         []       
                    //     ]
                    // },
                    idcardnumber: "$kyc.idcardnumber",
                    status:
                    {
                        '$switch': {
                            branches: [
                                {
                                    case: { '$eq': ['$kyc.status', 'IN_PROGGRESS'] },
                                    then: 'BARU'
                                },
                                {
                                    case: { '$eq': ['$kyc.status', 'FAILED'] },
                                    then: 'DITOLAK'
                                },
                                {
                                    case: { '$eq': ['$kyc.status', 'FINISH'] },
                                    then: 'BYSYSTEM'
                                },
                                {
                                    case: { '$eq': ['$kyc.status', 'DISETUJUI'] },
                                    then: 'DISETUJUI'
                                }
                            ],
                            default: ''
                        }
                    },
                    createdAt: "$kyc.createdAt",
                }
            }
        );

        if (jenisquery == 'summary') {
            pipeline.push(
                {
                    "$group":
                    {
                        _id: "$status",
                        myCount:
                        {
                            "$sum": 1
                        }
                    }
                }
            );
        }
        else {
            if (keys != null && keys != undefined) {
                pipeline.push({
                    $match: {

                        username: {
                            $regex: keys, $options: 'i'
                        },
                    }
                });
            }

            if (status != null && status !== undefined) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    status: {
                                        $in: status
                                    }
                                },

                            ]
                        }
                    }
                );
            }

            if (descending === true) {
                order = -1;
            } else {
                order = 1;
            }

            pipeline.push(
                {
                    $sort: {
                        createdAt: order
                    },
                }
            );

            if (page > 0) {
                pipeline.push({ $skip: (page * limit) });
            }

            if (limit > 0) {
                pipeline.push({ $limit: limit });
            }
        }

        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }

    async detailkyc(id: string) {
        var mongo = require('mongoose');
        var result = await this.UserbasicnewModel.aggregate([
            {
                $unwind: "$kyc"
            },
            {
                $match: {
                    $and: [
                        {

                            "kyc.status": {
                                $ne: null
                            }
                        },
                        {

                            "kyc.status": {
                                $ne: ""
                            }
                        },

                    ],
                    _id: mongo.Types.ObjectId(id)
                }
            },
            {
                $project: {
                    email: '$email',
                    insight_id: '$insight.$id',
                    isIdVerified: '$isIdVerified',
                    countries: "$countriesName",
                    area: "$statesName",
                    cities: "$citiesName",
                    fsSourceUri: "$kyc.fsSourceUri",
                    mediaUri: "$kyc.mediaUri",
                    SelfiefsSourceUri: "$kyc.SelfiefsSourceUri",
                    mediaSelfieUri: "$kyc.mediaSelfieUri",
                    SupportfsSourceUri: "$kyc.SupportfsSourceUri",
                    mediaSupportUri: "$kyc.mediaSupportUri",
                    fullName: 1,
                    username: 1,
                    userAuth_id: '$_id',
                    createdAt: "$kyc.createdAt",
                    status: "$kyc.status",
                    idcardnumber: "$kyc.idcardnumber",
                    tglLahir: {
                        "$cond":
                        {
                            if:
                            {
                                "$or":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    "$kyc.tglLahir", null
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    "$kyc.tglLahir", ""
                                                ]
                                        }
                                    ]
                            },
                            then: "$dob",
                            else: "$kyc.tglLahir"
                        }
                    },
                    nama: "$kyc.nama",
                    tempatLahir: "$kyc.tempatLahir",
                    // jenisKelamin: "$kyc.jenisKelamin",
                    jenisKelamin: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", 'FEMALE']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", ' FEMALE']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", 'Perempuan']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", 'Wanita']
                                    },
                                    then: 'FEMALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", 'MALE']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", ' MALE']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", 'Laki-laki']
                                    },
                                    then: 'MALE',

                                },
                                {
                                    case: {
                                        $eq: ["$kyc.jenisKelamin", 'Pria']
                                    },
                                    then: 'MALE',

                                },

                            ],
                            default: "OTHER",

                        },
                    },
                    alamat: "$kyc.alamat",
                    agama: "$kyc.agama",
                    statusPerkawinan: "$kyc.statusPerkawinan",
                    pekerjaan: "$kyc.pekerjaan",
                    kewarganegaraan: "$kyc.kewarganegaraan",
                    mobileNumber: 1,
                    avatar:
                    {
                        mediaBasePath:
                        {
                            "$ifNull":
                                [
                                    "$mediaBasePath", null
                                ]
                        },
                        mediaUri:
                        {
                            "$ifNull":
                                [
                                    "$mediaUri", null
                                ]
                        },
                        mediaEndpoint:
                        {
                            "$ifNull":
                                [
                                    "$mediaEndpoint", null
                                ]
                        },
                        mediaType:
                        {
                            "$ifNull":
                                [
                                    "$mediaType", null
                                ]
                        }
                    },
                    friend: 1,
                }
            },
            {
                $lookup: {
                    from: 'insights',
                    localField: 'insight_id',
                    foreignField: '_id',
                    as: 'insight_data',
                },
            },
            {
                $addFields: {

                    insights: { $arrayElemAt: ['$insight_data', 0] },
                },

            },
            {
                $project: {
                    email: 1,
                    insights: 1,
                    isIdVerified: 1,
                    username: 1,
                    fullName: 1,
                    countries: 1,
                    area: 1,
                    cities: 1,
                    createdAt: 1,
                    // profilpict: {
                    //   $arrayElemAt: ['$profilePict_data', 0]
                    // },
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "IN_PROGGRESS"
                                        ]
                                    },
                                    then: "BARU"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "FAILED"
                                        ]
                                    },
                                    then: "DITOLAK"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "FINISH"
                                        ]
                                    },
                                    then: "BYSYSTEM"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "DISETUJUI"
                                        ]
                                    },
                                    then: "DISETUJUI"
                                },
                            ],
                            default: ""
                        }
                    },
                    tglLahir: 1,
                    idcardnumber: 1,
                    jumlahPermohonan: "1",
                    tahapan: "KTP",
                    nama: 1,
                    tempatLahir: 1,
                    jenisKelamin: 1,
                    alamat: 1,
                    agama: 1,
                    statusPerkawinan: 1,
                    pekerjaan: 1,
                    kewarganegaraan: 1,
                    fsSourceUri: 1,
                    mediaUri: 1,
                    SelfiefsSourceUri: 1,
                    mediaSelfieUri: 1,
                    SupportfsSourceUri: 1,
                    mediaSupportUri: 1,
                    mobileNumber: 1,
                    avatar: 1,
                    friend: 1,
                    statusUser: {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$isIdVerified", null]
                                }, {
                                    $eq: ["$isIdVerified", ""]
                                }, {
                                    $eq: ["$isIdVerified", []]
                                }, {
                                    $eq: ["$isIdVerified", false]
                                }]
                            },
                            then: "BASIC",
                            else: "PREMIUM"
                        },

                    },

                }
            },
            {
                $project: {
                    email: 1,
                    isIdVerified: 1,
                    username: 1,
                    fullName: 1,
                    friend: 1,
                    createdAt: 1,
                    status: 1,
                    idcardnumber: 1,
                    jumlahPermohonan: "1",
                    tahapan: "KTP",
                    avatar: 1,
                    nama: 1,
                    tglLahir: 1,
                    tempatLahir: 1,
                    jenisKelamin: 1,
                    alamat: 1,
                    agama: 1,
                    statusPerkawinan: 1,
                    pekerjaan: 1,
                    kewarganegaraan: 1,
                    statusUser: 1,
                    insight: {

                        followers: '$insights.followers',

                        followings: '$insights.followings'
                    },
                    fsSourceUri: 1,
                    SelfiefsSourceUri: 1,
                    SupportfsSourceUri: 1,
                    mediaSelfieUri: 1,
                    mediaUri: 1,
                    mediaSupportUri: 1,
                    mobileNumber: 1,
                    countries: 1,
                    area: 1,
                    cities: 1,
                }
            },
        ]);
        return result;
    }

    async transaksiHistoryBisnis(email: string, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any, page: number, skip: number, descending: boolean) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        var order = null;

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }

        var pipeline = [];

        pipeline.push(
            {
                "$match":
                {
                    email: email
                }
            },
            {
                '$project':
                {
                    _id: 1,
                    userName: '$username',
                    fullName: 1,
                    email: 1
                }
            },
            {
                "$facet":
                {
                    balances: [
                        {
                            '$lookup': {
                                from: 'accountbalances',
                                as: 'balance',
                                let: { localID: '$_id' },
                                pipeline: [
                                    {
                                        '$match':
                                        {
                                            '$and':
                                                [
                                                    {
                                                        '$expr':
                                                        {
                                                            '$eq':
                                                                [
                                                                    '$iduser', '$$localID'
                                                                ]
                                                        }
                                                    },
                                                    {
                                                        type: 'rewards'
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        '$project':
                                        {
                                            jenis: 'Rewards',
                                            type: 'Rewards',
                                            timestamp: 1,
                                            description: 1,
                                            noinvoice: 1,
                                            nova: 1,
                                            expiredtimeva: 1,
                                            bank: 1,
                                            amount: '$kredit',
                                            totalamount: '$kredit',
                                            status: 'Success',
                                            postid: 1,
                                            iduserbuyer: 1,
                                            idusersell: 1,
                                            debetKredit: '+',
                                            fullName: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind':
                            {
                                path: '$balance',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    tariks: [
                        {
                            '$lookup': {
                                from: 'withdraws',
                                as: 'tarik',
                                let: { localID: '$_id' },
                                pipeline: [
                                    {
                                        '$match':
                                        {
                                            '$and':
                                                [
                                                    {
                                                        '$expr':
                                                        {
                                                            '$eq':
                                                                [
                                                                    '$idUser', '$$localID'
                                                                ]
                                                        }
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        '$project':
                                        {
                                            jenis: 'Withdraws',
                                            type: 'Withdraws',
                                            timestamp: 1,
                                            description: 1,
                                            noinvoice: 1,
                                            nova: 1,
                                            expiredtimeva: 1,
                                            bank: 1,
                                            amount: 1,
                                            totalamount: 1,
                                            status: 1,
                                            postid: 1,
                                            iduserbuyer: 1,
                                            idusersell: 1,
                                            debetKredit: '-',
                                            fullName: '$fullName'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind':
                            {
                                path: '$tarik',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    transactions: [
                        {
                            '$lookup':
                            {
                                from: 'transactions',
                                as: 'buy-sell',
                                let: { localID: '$_id' },
                                pipeline: [
                                    {
                                        '$match':
                                        {
                                            '$or':
                                                [
                                                    {
                                                        '$expr': { '$eq': ['$iduserbuyer', '$$localID'] }
                                                    },
                                                    {
                                                        '$expr': { '$eq': ['$idusersell', '$$localID'] }
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        '$project':
                                        {
                                            jenis: '$type',
                                            type:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$eq':
                                                            [
                                                                '$iduserbuyer', '$$localID'
                                                            ]
                                                    },
                                                    then: 'Buy',
                                                    else: 'Sell'
                                                }
                                            },
                                            timestamp: 1,
                                            timeStart:
                                            {
                                                '$dateToString':
                                                {
                                                    format: '%Y-%m-%dT%H:%M:%S',
                                                    date: {
                                                        '$add': [new Date(), 25200000]
                                                    }
                                                }
                                            },
                                            status:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$and':
                                                            [
                                                                {
                                                                    '$lt': [
                                                                        '$expiredtimeva',
                                                                        {
                                                                            '$dateToString': {
                                                                                format: '%Y-%m-%dT%H:%M:%S',
                                                                                date: {
                                                                                    '$add': [
                                                                                        new Date(),
                                                                                        25200000
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                { '$eq': ['$status', 'WAITING_PAYMENT'] }
                                                            ]
                                                    },
                                                    then: 'Cancel',
                                                    else: '$status'
                                                }
                                            },
                                            description:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$and':
                                                            [
                                                                {
                                                                    '$lt': [
                                                                        '$expiredtimeva',
                                                                        {
                                                                            '$dateToString': {
                                                                                format: '%Y-%m-%dT%H:%M:%S',
                                                                                date: {
                                                                                    '$add': [
                                                                                        new Date(),
                                                                                        25200000
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                { '$eq': ['$status', 'WAITING_PAYMENT'] }
                                                            ]
                                                    },
                                                    then: '$VA expired time',
                                                    else: 'description'
                                                }
                                            },
                                            noinvoice: 1,
                                            nova: 1,
                                            expiredtimeva: 1,
                                            bank: 1,
                                            amount: 1,
                                            totalamount: 1,
                                            postid: 1,
                                            iduserbuyer: 1,
                                            idusersell: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newPosts',
                                as: 'post',
                                let: { localID: '$buy-sell.postid' },
                                pipeline: [
                                    {
                                        '$match': { '$expr': { '$in': ['$postID', '$$localID'] } }
                                    },
                                    {
                                        '$project': {
                                            postID: 1,
                                            description: 1,
                                            postType: 1,
                                            certified: 1,
                                            mediaSource:
                                            {
                                                "$arrayElemAt":
                                                    [
                                                        "$mediaSource", 0
                                                    ]
                                            }
                                        }
                                    },
                                    {
                                        "$addFields":
                                        {
                                            "cleanUri":
                                            {
                                                $replaceOne:
                                                {
                                                    input: "$mediaSource.mediaUri",
                                                    find: "_0001.jpeg",
                                                    replacement: ""
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            postID: 1,
                                            description: 1,
                                            postType: 1,
                                            certified: 1,
                                            mediaBasePath:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaBasePath",
                                                        null
                                                    ]
                                            },
                                            mediaUri:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaUri",
                                                        null
                                                    ]
                                            },
                                            mediaType:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaType",
                                                        null
                                                    ]
                                            },
                                            mediaThumbEndpoint:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaThumbEndpoint",
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/thumb/",
                                                                    "$cleanUri"
                                                                ]
                                                        }
                                                    ]
                                            },
                                            mediaEndpoint:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaEndpoint",
                                                        {
                                                            "$cond":
                                                            {
                                                                if:
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$postType", "pict"
                                                                        ]
                                                                },
                                                                then:
                                                                {
                                                                    "$concat":
                                                                        [
                                                                            "/pict/",
                                                                            "$cleanUri"
                                                                        ]
                                                                },
                                                                else:
                                                                {
                                                                    "$concat":
                                                                        [
                                                                            "/stream/",
                                                                            "$cleanUri"
                                                                        ]
                                                                }
                                                            }
                                                        }
                                                    ]
                                            },
                                            mediaThumbUri:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaThumbUri",
                                                        null
                                                    ]
                                            },
                                            apsara:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsara",
                                                        false
                                                    ]
                                            },
                                            apsaraId:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsaraId",
                                                        null
                                                    ]
                                            },
                                            apsaraThumbId:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsaraThumbId",
                                                        null
                                                    ]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newUserBasics',
                                as: 'penjual',
                                let: { localID: '$buy-sell.idusersell' },
                                pipeline: [
                                    {
                                        '$match': {
                                            '$and': [
                                                { '$expr': { '$in': ['$_id', '$$localID'] } },
                                                { email: { '$ne': email } }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newUserBasics',
                                as: 'pembeli',
                                let: { localID: '$buy-sell.iduserbuyer' },
                                pipeline: [
                                    {
                                        '$match': {
                                            '$and': [
                                                { '$expr': { '$in': ['$_id', '$$localID'] } },
                                                { email: { '$ne': email } }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind':
                            {
                                path: '$buy-sell',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            '$project':
                            {
                                transaction:
                                    [
                                        {
                                            _id: '$buy-sell._id',
                                            timestart: '$buy-sell.timeStart',
                                            iduser: '$_id',
                                            type: '$buy-sell.type',
                                            jenis: '$buy-sell.jenis',
                                            timestamp: '$buy-sell.timestamp',
                                            description: '$buy-sell.description',
                                            noinvoice: '$buy-sell.noinvoice',
                                            nova: '$buy-sell.nova',
                                            expiredtimeva: '$buy-sell.expiredtimeva',
                                            bank: '$buy-sell.bank',
                                            amount: '$buy-sell.amount',
                                            totalamount:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$eq':
                                                            [
                                                                '$buy-sell.type', 'Sell'
                                                            ]
                                                    },
                                                    then: '$buy-sell.amount',
                                                    else: '$buy-sell.totalamount'
                                                }
                                            },
                                            status: '$buy-sell.status',
                                            email: '$email',
                                            fullName: '$fullName',
                                            username: '$fullName',
                                            penjual:
                                            {
                                                '$cond':
                                                {
                                                    if: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$penjual.fullName',
                                                            {
                                                                '$indexOfArray': ['$penjual._id', '$buy-sell.idusersell']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            emailpenjual: {
                                                '$cond':
                                                {
                                                    if: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$penjual.email',
                                                            {
                                                                '$indexOfArray': ['$penjual._id', '$buy-sell.idusersell']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            userNamePenjual: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                    then: '$dodol',
                                                    else:
                                                    {
                                                        '$arrayElemAt': [
                                                            '$penjual.username',
                                                            {
                                                                '$indexOfArray': [
                                                                    '$penjual.email',
                                                                    {
                                                                        '$arrayElemAt': [
                                                                            '$penjual.email',
                                                                            {
                                                                                '$indexOfArray': [
                                                                                    '$penjual._id',
                                                                                    '$buy-sell.idusersell'
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            pembeli: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$pembeli.fullName',
                                                            {
                                                                '$indexOfArray': ['$pembeli._id', '$buy-sell.iduserbuyer']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            emailpembeli: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$pembeli.email',
                                                            {
                                                                '$indexOfArray': ['$pembeli._id', '$buy-sell.iduserbuyer']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            userNamePembeli: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$pembeli.username',
                                                            {
                                                                '$indexOfArray': [
                                                                    '$pembeli.email',
                                                                    {
                                                                        '$arrayElemAt': [
                                                                            '$pembeli.email',
                                                                            {
                                                                                '$indexOfArray': [
                                                                                    '$pembeli._id',
                                                                                    '$buy-sell.iduserbuyer'
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            postID: '$buy-sell.postid',
                                            postType: {
                                                '$arrayElemAt': [
                                                    '$post.postType',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            certified: {
                                                '$arrayElemAt': [
                                                    '$post.certified',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            descriptionContent: {
                                                '$arrayElemAt': [
                                                    '$post.description',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            title: {
                                                '$arrayElemAt': [
                                                    '$post.title',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            mediaType: {
                                                '$arrayElemAt': [
                                                    '$post.postType',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            mediaEndpoint:
                                            {
                                                '$arrayElemAt':
                                                    [
                                                        '$post.mediaEndpoint',
                                                        {
                                                            '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                        }
                                                    ]
                                            },
                                            apsaraId:
                                            {
                                                '$arrayElemAt':
                                                    [
                                                        '$post.apsaraId',
                                                        {
                                                            '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                        }
                                                    ]
                                            },
                                            apsara:
                                            {
                                                '$arrayElemAt':
                                                    [
                                                        '$post.apsara',
                                                        {
                                                            '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                        }
                                                    ]
                                            },
                                            debetKredit: {
                                                '$switch': {
                                                    branches: [
                                                        {
                                                            case: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                            then: null
                                                        },
                                                        {
                                                            case: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                            then: '+'
                                                        }
                                                    ],
                                                    default: '$kampret'
                                                }
                                            }
                                        }
                                    ]
                            }
                        },
                        {
                            '$unwind': { path: '$transaction', preserveNullAndEmptyArrays: true }
                        }
                    ]
                }
            },
            {
                '$project': {
                    tester: {
                        '$concatArrays': [
                            '$balances.balance',
                            '$tariks.tarik',
                            '$transactions.transaction'
                        ]
                    }
                }
            },
            { '$unwind': { path: '$tester' } },
            {
                '$project': {
                    _id: '$tester._id',
                    iduser: {
                        '$cond': {
                            if: { '$gt': ['$tester.amount', 0] },
                            then: '$tester.iduser',
                            else: '$kodok'
                        }
                    },
                    type: '$tester.type',
                    jenis: '$tester.jenis',
                    timestamp: '$tester.timestamp',
                    description: '$tester.description',
                    noinvoice: '$tester.noinvoice',
                    nova: '$tester.nova',
                    expiredtimeva: '$tester.expiredtimeva',
                    bank: '$tester.bank',
                    amount: '$tester.amount',
                    totalamount: '$tester.totalamount',
                    status: '$tester.status',
                    fullName: '$tester.fullName',
                    email: {
                        '$cond': {
                            if: { '$gt': ['$tester.amount', 0] },
                            then: '$tester.email',
                            else: '$kodok'
                        }
                    },
                    penjual: '$tester.penjual',
                    emailpenjual: '$tester.emailpenjual',
                    userNamePenjual: '$tester.userNamePenjual',
                    pembeli: '$tester.pembeli',
                    emailpembeli: '$tester.emailpembeli',
                    userNamePembeli: '$tester.userNamePembeli',
                    postID: '$tester.postID',
                    postType: '$tester.postType',
                    descriptionContent: '$tester.descriptionContent',
                    title: '$tester.title',
                    mediaType: '$tester.mediaType',
                    mediaEndpoint: '$tester.mediaEndpoint',
                    mediaThumbEndpoint: '$tester.mediaThumbEndpoint',
                    apsaraThumbId: '$tester.apsaraThumbId',
                    apsaraId: '$tester.apsaraId',
                    apsara: '$tester.apsara',
                    debetKredit: '$tester.debetKredit',
                    timestart: '$tester.timestart',
                    iconVoucher: '$tester.iconVoucher'
                }
            },
            {
                '$addFields': { certi: { '$cmp': ['$certified', 0] } }
            },
            {
                '$project': {
                    _id: 1,
                    iduser: 1,
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    certified: {
                        '$cond': {
                            if: {
                                '$or': [{ '$eq': ['$certi', -1] }, { '$eq': ['$certi', 0] }]
                            },
                            then: false,
                            else: '$certified'
                        }
                    },
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    fullName: 1,
                    email: 1,
                    postID: 1,
                    postType: 1,
                    descriptionContent: 1,
                    title: 1
                }
            },
            {
                '$project': {
                    _id: 1,
                    iduser: 1,
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    email: 1,
                    postID: 1,
                    postType: 1,
                    descriptionContent: 1,
                    title: 1
                }
            },
        );

        var matchexpr = [];
        if (sell == true) {
            matchexpr.push(
                {
                    type: "Sell"
                }
            );
        }

        if (buy == true) {
            matchexpr.push(
                {
                    type: "Buy"
                }
            );
        }

        if (withdrawal == true) {
            matchexpr.push(
                {
                    type: "Withdraws"
                }
            );
        }

        if (rewards == true) {
            matchexpr.push(
                {
                    type: "Rewards"
                }
            );
        }

        if (boost == true) {
            matchexpr.push(
                {
                    "type": "Buy",
                    "jenis": "BOOST_CONTENT"
                },
                {
                    "type": "Buy",
                    "jenis": "BOOST_CONTENT+OWNERSHIP"
                }
            );
        }

        if (matchexpr.length != 0) {
            pipeline.push(
                {
                    "$match":
                    {
                        "$or": matchexpr
                    }
                }
            );
        }

        if (startdate && startdate !== undefined) {

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }

        pipeline.push(
            {
                $sort: {
                    timestamp: order
                },

            },
        );

        if (page > 0) {
            pipeline.push({ $skip: (page * skip) });
        }
        if (skip > 0) {
            pipeline.push({ $limit: skip });
        }

        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }

    async transaksiHistoryBisnisCount(email: string, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

        var pipeline = [];

        pipeline.push(
            {
                "$match":
                {
                    email: email
                }
            },
            {
                '$project':
                {
                    _id: 1,
                    userName: '$username',
                    fullName: 1,
                    email: 1
                }
            },
            {
                "$facet":
                {
                    balances: [
                        {
                            '$lookup': {
                                from: 'accountbalances',
                                as: 'balance',
                                let: { localID: '$_id' },
                                pipeline: [
                                    {
                                        '$match':
                                        {
                                            '$and':
                                                [
                                                    {
                                                        '$expr':
                                                        {
                                                            '$eq':
                                                                [
                                                                    '$iduser', '$$localID'
                                                                ]
                                                        }
                                                    },
                                                    {
                                                        type: 'rewards'
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        '$project':
                                        {
                                            jenis: 'Rewards',
                                            type: 'Rewards',
                                            timestamp: 1,
                                            description: 1,
                                            noinvoice: 1,
                                            nova: 1,
                                            expiredtimeva: 1,
                                            bank: 1,
                                            amount: '$kredit',
                                            totalamount: '$kredit',
                                            status: 'Success',
                                            postid: 1,
                                            iduserbuyer: 1,
                                            idusersell: 1,
                                            debetKredit: '+',
                                            fullName: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind':
                            {
                                path: '$balance',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    tariks: [
                        {
                            '$lookup': {
                                from: 'withdraws',
                                as: 'tarik',
                                let: { localID: '$_id' },
                                pipeline: [
                                    {
                                        '$match':
                                        {
                                            '$and':
                                                [
                                                    {
                                                        '$expr':
                                                        {
                                                            '$eq':
                                                                [
                                                                    '$idUser', '$$localID'
                                                                ]
                                                        }
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        '$project':
                                        {
                                            jenis: 'Withdraws',
                                            type: 'Withdraws',
                                            timestamp: 1,
                                            description: 1,
                                            noinvoice: 1,
                                            nova: 1,
                                            expiredtimeva: 1,
                                            bank: 1,
                                            amount: 1,
                                            totalamount: 1,
                                            status: 'Success',
                                            postid: 1,
                                            iduserbuyer: 1,
                                            idusersell: 1,
                                            debetKredit: '-',
                                            fullName: '$fullName'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind':
                            {
                                path: '$tarik',
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    transactions: [
                        {
                            '$lookup':
                            {
                                from: 'transactions',
                                as: 'buy-sell',
                                let: { localID: '$_id' },
                                pipeline: [
                                    {
                                        '$match':
                                        {
                                            '$or':
                                                [
                                                    {
                                                        '$expr': { '$eq': ['$iduserbuyer', '$$localID'] }
                                                    },
                                                    {
                                                        '$expr': { '$eq': ['$idusersell', '$$localID'] }
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        '$project':
                                        {
                                            jenis: '$type',
                                            type:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$eq':
                                                            [
                                                                '$iduserbuyer', '$$localID'
                                                            ]
                                                    },
                                                    then: 'Buy',
                                                    else: 'Sell'
                                                }
                                            },
                                            timestamp: 1,
                                            timeStart:
                                            {
                                                '$dateToString':
                                                {
                                                    format: '%Y-%m-%dT%H:%M:%S',
                                                    date: {
                                                        '$add': [new Date(), 25200000]
                                                    }
                                                }
                                            },
                                            status:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$and':
                                                            [
                                                                {
                                                                    '$lt': [
                                                                        '$expiredtimeva',
                                                                        {
                                                                            '$dateToString': {
                                                                                format: '%Y-%m-%dT%H:%M:%S',
                                                                                date: {
                                                                                    '$add': [
                                                                                        new Date(),
                                                                                        25200000
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                { '$eq': ['$status', 'WAITING_PAYMENT'] }
                                                            ]
                                                    },
                                                    then: 'Cancel',
                                                    else: '$status'
                                                }
                                            },
                                            description:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$and':
                                                            [
                                                                {
                                                                    '$lt': [
                                                                        '$expiredtimeva',
                                                                        {
                                                                            '$dateToString': {
                                                                                format: '%Y-%m-%dT%H:%M:%S',
                                                                                date: {
                                                                                    '$add': [
                                                                                        new Date(),
                                                                                        25200000
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                { '$eq': ['$status', 'WAITING_PAYMENT'] }
                                                            ]
                                                    },
                                                    then: '$VA expired time',
                                                    else: 'description'
                                                }
                                            },
                                            noinvoice: 1,
                                            nova: 1,
                                            expiredtimeva: 1,
                                            bank: 1,
                                            amount: 1,
                                            totalamount: 1,
                                            postid: 1,
                                            iduserbuyer: 1,
                                            idusersell: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newPosts',
                                as: 'post',
                                let: { localID: '$buy-sell.postid' },
                                pipeline: [
                                    {
                                        '$match': { '$expr': { '$in': ['$postID', '$$localID'] } }
                                    },
                                    {
                                        '$project': {
                                            postID: 1,
                                            description: 1,
                                            postType: 1,
                                            certified: 1,
                                            mediaSource:
                                            {
                                                "$arrayElemAt":
                                                    [
                                                        "$mediaSource", 0
                                                    ]
                                            }
                                        }
                                    },
                                    {
                                        "$addFields":
                                        {
                                            "cleanUri":
                                            {
                                                $replaceOne:
                                                {
                                                    input: "$mediaSource.mediaUri",
                                                    find: "_0001.jpeg",
                                                    replacement: ""
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            postID: 1,
                                            description: 1,
                                            postType: 1,
                                            certified: 1,
                                            mediaBasePath:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaBasePath",
                                                        null
                                                    ]
                                            },
                                            mediaUri:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaUri",
                                                        null
                                                    ]
                                            },
                                            mediaType:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaType",
                                                        null
                                                    ]
                                            },
                                            mediaThumbEndpoint:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaThumbEndpoint",
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/thumb/",
                                                                    "$cleanUri"
                                                                ]
                                                        }
                                                    ]
                                            },
                                            mediaEndpoint:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaEndpoint",
                                                        {
                                                            "$cond":
                                                            {
                                                                if:
                                                                {
                                                                    "$eq":
                                                                        [
                                                                            "$postType", "pict"
                                                                        ]
                                                                },
                                                                then:
                                                                {
                                                                    "$concat":
                                                                        [
                                                                            "/pict/",
                                                                            "$cleanUri"
                                                                        ]
                                                                },
                                                                else:
                                                                {
                                                                    "$concat":
                                                                        [
                                                                            "/stream/",
                                                                            "$cleanUri"
                                                                        ]
                                                                }
                                                            }
                                                        }
                                                    ]
                                            },
                                            mediaThumbUri:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaThumbUri",
                                                        null
                                                    ]
                                            },
                                            apsara:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsara",
                                                        false
                                                    ]
                                            },
                                            apsaraId:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsaraId",
                                                        null
                                                    ]
                                            },
                                            apsaraThumbId:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsaraThumbId",
                                                        null
                                                    ]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newUserBasics',
                                as: 'penjual',
                                let: { localID: '$buy-sell.idusersell' },
                                pipeline: [
                                    {
                                        '$match': {
                                            '$and': [
                                                { '$expr': { '$in': ['$_id', '$$localID'] } },
                                                { email: { '$ne': email } }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$lookup': {
                                from: 'newUserBasics',
                                as: 'pembeli',
                                let: { localID: '$buy-sell.iduserbuyer' },
                                pipeline: [
                                    {
                                        '$match': {
                                            '$and': [
                                                { '$expr': { '$in': ['$_id', '$$localID'] } },
                                                { email: { '$ne': email } }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            '$unwind':
                            {
                                path: '$buy-sell',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            '$project':
                            {
                                transaction:
                                    [
                                        {
                                            _id: '$buy-sell._id',
                                            timestart: '$buy-sell.timeStart',
                                            iduser: '$_id',
                                            type: '$buy-sell.type',
                                            jenis: '$buy-sell.jenis',
                                            timestamp: '$buy-sell.timestamp',
                                            description: '$buy-sell.description',
                                            noinvoice: '$buy-sell.noinvoice',
                                            nova: '$buy-sell.nova',
                                            expiredtimeva: '$buy-sell.expiredtimeva',
                                            bank: '$buy-sell.bank',
                                            amount: '$buy-sell.amount',
                                            totalamount:
                                            {
                                                '$cond':
                                                {
                                                    if:
                                                    {
                                                        '$eq':
                                                            [
                                                                '$buy-sell.type', 'Sell'
                                                            ]
                                                    },
                                                    then: '$buy-sell.amount',
                                                    else: '$buy-sell.totalamount'
                                                }
                                            },
                                            status: '$buy-sell.status',
                                            email: '$email',
                                            fullName: '$fullName',
                                            username: '$fullName',
                                            penjual:
                                            {
                                                '$cond':
                                                {
                                                    if: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$penjual.fullName',
                                                            {
                                                                '$indexOfArray': ['$penjual._id', '$buy-sell.idusersell']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            emailpenjual: {
                                                '$cond':
                                                {
                                                    if: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$penjual.email',
                                                            {
                                                                '$indexOfArray': ['$penjual._id', '$buy-sell.idusersell']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            userNamePenjual: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                    then: '$dodol',
                                                    else:
                                                    {
                                                        '$arrayElemAt': [
                                                            '$penjual.username',
                                                            {
                                                                '$indexOfArray': [
                                                                    '$penjual.email',
                                                                    {
                                                                        '$arrayElemAt': [
                                                                            '$penjual.email',
                                                                            {
                                                                                '$indexOfArray': [
                                                                                    '$penjual._id',
                                                                                    '$buy-sell.idusersell'
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            pembeli: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$pembeli.fullName',
                                                            {
                                                                '$indexOfArray': ['$pembeli._id', '$buy-sell.iduserbuyer']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            emailpembeli: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$pembeli.email',
                                                            {
                                                                '$indexOfArray': ['$pembeli._id', '$buy-sell.iduserbuyer']
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            userNamePembeli: {
                                                '$cond': {
                                                    if: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                    then: '$dodol',
                                                    else: {
                                                        '$arrayElemAt': [
                                                            '$pembeli.username',
                                                            {
                                                                '$indexOfArray': [
                                                                    '$pembeli.email',
                                                                    {
                                                                        '$arrayElemAt': [
                                                                            '$pembeli.email',
                                                                            {
                                                                                '$indexOfArray': [
                                                                                    '$pembeli._id',
                                                                                    '$buy-sell.iduserbuyer'
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            postID: '$buy-sell.postid',
                                            postType: {
                                                '$arrayElemAt': [
                                                    '$post.postType',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            certified: {
                                                '$arrayElemAt': [
                                                    '$post.certified',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            descriptionContent: {
                                                '$arrayElemAt': [
                                                    '$post.description',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            title: {
                                                '$arrayElemAt': [
                                                    '$post.title',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            mediaType: {
                                                '$arrayElemAt': [
                                                    '$post.postType',
                                                    {
                                                        '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                    }
                                                ]
                                            },
                                            mediaEndpoint:
                                            {
                                                '$arrayElemAt':
                                                    [
                                                        '$post.mediaEndpoint',
                                                        {
                                                            '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                        }
                                                    ]
                                            },
                                            apsaraId:
                                            {
                                                '$arrayElemAt':
                                                    [
                                                        '$post.apsaraId',
                                                        {
                                                            '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                        }
                                                    ]
                                            },
                                            apsara:
                                            {
                                                '$arrayElemAt':
                                                    [
                                                        '$post.apsara',
                                                        {
                                                            '$indexOfArray': ['$post.postID', '$buy-sell.postid']
                                                        }
                                                    ]
                                            },
                                            debetKredit: {
                                                '$switch': {
                                                    branches: [
                                                        {
                                                            case: { '$eq': ['$buy-sell.type', 'Buy'] },
                                                            then: null
                                                        },
                                                        {
                                                            case: { '$eq': ['$buy-sell.type', 'Sell'] },
                                                            then: '+'
                                                        }
                                                    ],
                                                    default: '$kampret'
                                                }
                                            }
                                        }
                                    ]
                            }
                        },
                        {
                            '$unwind': { path: '$transaction', preserveNullAndEmptyArrays: true }
                        }
                    ]
                }
            },
            {
                '$project': {
                    tester: {
                        '$concatArrays': [
                            '$balances.balance',
                            '$tariks.tarik',
                            '$transactions.transaction'
                        ]
                    }
                }
            },
            { '$unwind': { path: '$tester' } },
            {
                '$project': {
                    _id: '$tester._id',
                    iduser: {
                        '$cond': {
                            if: { '$gt': ['$tester.amount', 0] },
                            then: '$tester.iduser',
                            else: '$kodok'
                        }
                    },
                    type: '$tester.type',
                    jenis: '$tester.jenis',
                    timestamp: '$tester.timestamp',
                    description: '$tester.description',
                    noinvoice: '$tester.noinvoice',
                    nova: '$tester.nova',
                    expiredtimeva: '$tester.expiredtimeva',
                    bank: '$tester.bank',
                    amount: '$tester.amount',
                    totalamount: '$tester.totalamount',
                    status: '$tester.status',
                    fullName: '$tester.fullName',
                    email: {
                        '$cond': {
                            if: { '$gt': ['$tester.amount', 0] },
                            then: '$tester.email',
                            else: '$kodok'
                        }
                    },
                    penjual: '$tester.penjual',
                    emailpenjual: '$tester.emailpenjual',
                    userNamePenjual: '$tester.userNamePenjual',
                    pembeli: '$tester.pembeli',
                    emailpembeli: '$tester.emailpembeli',
                    userNamePembeli: '$tester.userNamePembeli',
                    postID: '$tester.postID',
                    postType: '$tester.postType',
                    descriptionContent: '$tester.descriptionContent',
                    title: '$tester.title',
                    mediaType: '$tester.mediaType',
                    mediaEndpoint: '$tester.mediaEndpoint',
                    mediaThumbEndpoint: '$tester.mediaThumbEndpoint',
                    apsaraThumbId: '$tester.apsaraThumbId',
                    apsaraId: '$tester.apsaraId',
                    apsara: '$tester.apsara',
                    debetKredit: '$tester.debetKredit',
                    timestart: '$tester.timestart',
                    iconVoucher: '$tester.iconVoucher'
                }
            },
            {
                '$addFields': { certi: { '$cmp': ['$certified', 0] } }
            },
            {
                '$project': {
                    _id: 1,
                    iduser: 1,
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    certified: {
                        '$cond': {
                            if: {
                                '$or': [{ '$eq': ['$certi', -1] }, { '$eq': ['$certi', 0] }]
                            },
                            then: false,
                            else: '$certified'
                        }
                    },
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    fullName: 1,
                    email: 1,
                    postID: 1,
                    postType: 1,
                    descriptionContent: 1,
                    title: 1
                }
            },
            {
                '$project': {
                    _id: 1,
                    iduser: 1,
                    type: 1,
                    jenis: 1,
                    timestamp: 1,
                    description: 1,
                    noinvoice: 1,
                    nova: 1,
                    expiredtimeva: 1,
                    bank: 1,
                    amount: 1,
                    totalamount: 1,
                    status: 1,
                    email: 1,
                    postID: 1,
                    postType: 1,
                    descriptionContent: 1,
                    title: 1
                }
            },
        );

        var matchexpr = [];
        if (sell == true) {
            matchexpr.push(
                {
                    type: "Sell"
                }
            );
        }

        if (buy == true) {
            matchexpr.push(
                {
                    type: "Buy"
                }
            );
        }

        if (withdrawal == true) {
            matchexpr.push(
                {
                    type: "Withdraws"
                }
            );
        }

        if (rewards == true) {
            matchexpr.push(
                {
                    type: "Rewards"
                }
            );
        }

        if (boost == true) {
            matchexpr.push(
                {
                    "type": "Buy",
                    "jenis": "BOOST_CONTENT"
                },
                {
                    "type": "Buy",
                    "jenis": "BOOST_CONTENT+OWNERSHIP"
                }
            );
        }

        if (matchexpr.length != 0) {
            pipeline.push(
                {
                    "$match":
                    {
                        "$or": matchexpr
                    }
                }
            );
        }

        if (startdate && startdate !== undefined) {

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }

        pipeline.push({
            $group: {
                _id: null,
                totalpost: {
                    $sum: 1
                }
            }
        });

        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }

    async transaksiHistory(email: string, skip: number, limit: number, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any, voucher: any) {

        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var pipeline = [];

        pipeline.push(
            {
                $match:
                {
                    "email": email,

                }
            },
            {
                "$project":
                {
                    _id: 1,
                    userName: "$username",
                    fullName: 1,
                    email: 1
                }
            },
            {
                "$facet":
                {
                    "balances": [
                        {
                            "$lookup": {
                                from: "accountbalances",
                                as: "balance",
                                let: {
                                    localID: "$_id"
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and:
                                                [
                                                    {
                                                        $expr: {
                                                            $eq: ['$iduser', '$$localID']
                                                        }
                                                    },
                                                    {
                                                        "type": "rewards"
                                                    },

                                                ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "Rewards",
                                            "type": "Rewards",
                                            "timestamp": 1,
                                            "description": 1,
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": "$kredit",
                                            "totalamount": "$kredit",
                                            "status": "Success",
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,
                                            "debetKredit": "+",
                                        }
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$balance",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                    ],
                    "tariks": [
                        {
                            "$lookup": {
                                from: "withdraws",
                                as: "tarik",
                                let: {
                                    localID: "$_id"
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and:
                                                [
                                                    {
                                                        $expr: {
                                                            $eq: ['$idUser', '$$localID']
                                                        }
                                                    },

                                                ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "Withdraws",
                                            "type": "Withdraws",
                                            "timestamp": 1,
                                            "description": 1,
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": 1,
                                            "totalamount": 1,
                                            "status": 1,
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,
                                            "debetKredit": "-",

                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "Withdraws",
                                            "type": "Withdraws",
                                            "timestamp": 1,
                                            "description": 1,
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": 1,
                                            "totalamount": 1,
                                            "status":
                                            {
                                                $cond: {
                                                    if: {
                                                        $or: [
                                                            {
                                                                $eq: ["$status", "Request is In progress"]
                                                            },
                                                            {
                                                                $eq: ["$status", "Success"]
                                                            },

                                                        ],

                                                    },
                                                    then: "Success",
                                                    else: "Failed"
                                                }
                                            },
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,
                                            "debetKredit": "-",

                                        }
                                    },

                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: "$tarik",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                    ],
                    "transactions": [
                        {
                            "$lookup": {
                                from: "transactions",
                                as: "buy-sell",
                                let: {
                                    localID: '$_id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $or:
                                                [
                                                    {
                                                        $expr: {
                                                            $eq: ['$iduserbuyer', '$$localID']
                                                        }
                                                    },
                                                    {
                                                        $expr: {
                                                            $eq: ['$idusersell', '$$localID']
                                                        }
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "$type",
                                            "type":
                                            {
                                                $cond: {
                                                    if: {
                                                        $eq: ['$iduserbuyer', '$$localID']
                                                    },
                                                    then: "Buy",
                                                    else: 'Sell'
                                                }
                                            },
                                            "timestamp": 1,
                                            "timeStart":
                                            {
                                                "$dateToString": {
                                                    "format": "%Y-%m-%dT%H:%M:%S",
                                                    "date": {
                                                        $add: [new Date(), 25200000]
                                                    }
                                                }
                                            },
                                            "status":
                                            {
                                                $cond: {
                                                    if:
                                                    {
                                                        $and: [
                                                            {
                                                                $lt: ['$expiredtimeva', {
                                                                    "$dateToString": {
                                                                        "format": "%Y-%m-%dT%H:%M:%S",
                                                                        "date": {
                                                                            $add: [new Date(), 25200000]
                                                                        }
                                                                    }
                                                                },]
                                                            },
                                                            {
                                                                $eq: ['$status', 'WAITING_PAYMENT']
                                                            }
                                                        ]
                                                    },
                                                    then: "Cancel",
                                                    else: '$status'
                                                }
                                            },
                                            "description":
                                            {
                                                $cond: {
                                                    if:
                                                    {
                                                        $and: [
                                                            {
                                                                $lt: ['$expiredtimeva', {
                                                                    "$dateToString": {
                                                                        "format": "%Y-%m-%dT%H:%M:%S",
                                                                        "date": {
                                                                            $add: [new Date(), 25200000]
                                                                        }
                                                                    }
                                                                },]
                                                            },
                                                            {
                                                                $eq: ['$status', 'WAITING_PAYMENT']
                                                            }
                                                        ]
                                                    },
                                                    then: "$VA expired time",
                                                    else: 'description'
                                                }
                                            },
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": 1,
                                            "totalamount": 1,
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,

                                        }
                                    },
                                    // {
                                    //     $sort: {
                                    //         "timestamp": - 1,
                                    //         
                                    //     }
                                    // },
                                ],

                            },

                        },
                        {
                            '$lookup': {
                                from: 'newPosts',
                                as: 'post',
                                let: { localID: '$buy-sell.postid' },
                                pipeline: [
                                    {
                                        '$match': { '$expr': { '$in': ['$postID', '$$localID'] } }
                                    },
                                    {
                                        '$project': {
                                            postID: 1,
                                            description: 1,
                                            postType: 1,
                                            certified: 1,
                                            mediaSource:
                                            {
                                                "$arrayElemAt":
                                                    [
                                                        "$mediaSource", 0
                                                    ]
                                            }
                                        }
                                    },
                                    {
                                        "$addFields":
                                        {
                                            "cleanUri":
                                            {
                                                $replaceOne:
                                                {
                                                    input: "$mediaSource.mediaUri",
                                                    find: "_0001.jpeg",
                                                    replacement: ""
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            postID: 1,
                                            description: 1,
                                            postType: 1,
                                            certified: 1,
                                            mediaBasePath:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaBasePath",
                                                        null
                                                    ]
                                            },
                                            mediaUri:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaUri",
                                                        null
                                                    ]
                                            },
                                            mediaType:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaType",
                                                        null
                                                    ]
                                            },
                                            mediaThumbEndpoint:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaThumbEndpoint",
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/thumb/",
                                                                    "$postID"
                                                                ]
                                                        }
                                                    ]
                                            },
                                            mediaEndpoint:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaEndpoint",
                                                        {
                                                            "$concat":
                                                                [
                                                                    "/stream/",
                                                                    "$postID"
                                                                ]
                                                        }
                                                    ]
                                            },
                                            mediaThumbUri:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.mediaThumbUri",
                                                        null
                                                    ]
                                            },
                                            apsara:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsara",
                                                        false
                                                    ]
                                            },
                                            apsaraId:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsaraId",
                                                        null
                                                    ]
                                            },
                                            apsaraThumbId:
                                            {
                                                "$ifNull":
                                                    [
                                                        "$mediaSource.apsaraThumbId",
                                                        null
                                                    ]
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: 'newUserBasics',
                                as: 'penjual',
                                let: {
                                    localID: '$buy-sell.idusersell'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "email":
                                                    {
                                                        $ne: email

                                                    }
                                                }
                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'newUserBasics',
                                as: 'pembeli',
                                let: {
                                    localID: '$buy-sell.iduserbuyer'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "email":
                                                    {
                                                        $ne: email

                                                    }
                                                }
                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $unwind: {
                                path: "$buy-sell",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: "settings",
                                as: "setting",
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            "_id": new Types.ObjectId("648ae670766c00007d004a82")
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            $project: {
                                "transaction": [{
                                    //"video": 1,
                                    "_id": "$buy-sell._id",
                                    "timestart": "$buy-sell.timeStart",
                                    //"did": "$buy-sell.postid",
                                    "iduser": "$_id",
                                    "type": "$buy-sell.type",
                                    "jenis": "$buy-sell.jenis",
                                    "timestamp": "$buy-sell.timestamp",
                                    "description": "$buy-sell.description",
                                    "noinvoice": "$buy-sell.noinvoice",
                                    "nova": "$buy-sell.nova",
                                    "expiredtimeva": "$buy-sell.expiredtimeva",
                                    "bank": "$buy-sell.bank",
                                    "amount": "$buy-sell.amount",
                                    "iconVoucher": { $arrayElemAt: ['$setting.value', 0] },
                                    "totalamount":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$buy-sell.amount",
                                            else: '$buy-sell.totalamount'
                                        }
                                    },
                                    "status": "$buy-sell.status",
                                    "email": "$email",
                                    "fullName": "$fullname",
                                    "userame": "$fullname",
                                    "penjual":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$penjual.fullName', {
                                                    "$indexOfArray": [
                                                        "$penjual._id",
                                                        "$buy-sell.idusersell"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "emailpenjual":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$penjual.email', {
                                                    "$indexOfArray": [
                                                        "$penjual._id",
                                                        "$buy-sell.idusersell"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "userNamePenjual":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$penjual.username', {
                                                    "$indexOfArray": [
                                                        "$penjual.email",
                                                        {
                                                            $arrayElemAt: ['$penjual.email', {
                                                                "$indexOfArray": [
                                                                    "$penjual._id",
                                                                    "$buy-sell.idusersell"
                                                                ]
                                                            }]
                                                        }
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "pembeli":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Buy"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$pembeli.fullName', {
                                                    "$indexOfArray": [
                                                        "$pembeli._id",
                                                        "$buy-sell.iduserbuyer"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "emailpembeli":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Buy"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$pembeli.email', {
                                                    "$indexOfArray": [
                                                        "$pembeli._id",
                                                        "$buy-sell.iduserbuyer"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "userNamePembeli":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Buy"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$pembeli.username', {
                                                    "$indexOfArray": [
                                                        "$pembeli.email",
                                                        {
                                                            $arrayElemAt: ['$pembeli.email', {
                                                                "$indexOfArray": [
                                                                    "$pembeli._id",
                                                                    "$buy-sell.iduserbuyer"
                                                                ]
                                                            }]
                                                        }
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "postID": "$buy-sell.postid",
                                    "postType":
                                    {
                                        $arrayElemAt: ['$post.postType', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "descriptionContent":
                                    {
                                        $arrayElemAt: ['$post.description', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "title":
                                    {
                                        $arrayElemAt: ['$post.title', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "mediaType":
                                    {
                                        $arrayElemAt: ['$post.postType', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "mediaEndpoint":
                                    {
                                        $arrayElemAt: ['$post.mediaEndpoint', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "apsaraId":
                                    {
                                        $arrayElemAt: ['$post.apsaraId', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "apsara":
                                    {
                                        $arrayElemAt: ['$post.apsara', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "debetKredit":
                                    {
                                        $switch: {
                                            branches: [
                                                {
                                                    case: {
                                                        $eq: ["$buy-sell.type", "Buy"]
                                                    },
                                                    then: null
                                                },
                                                {
                                                    case: {
                                                        $eq: ["$buy-sell.type", "Sell"]
                                                    },
                                                    then: "+"
                                                },

                                            ],
                                            "default": "$kampret"
                                        }
                                    },
                                    "mediaThumbEndpoint":
                                    {
                                        $arrayElemAt: ['$post.mediaThumbEndpoint', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "apsaraThumbId":
                                    {
                                        $arrayElemAt: ['$post.apsaraThumbId', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                }]
                            }
                        },
                        {
                            $unwind: {
                                path: "$transaction",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                    ],
                }
            },
            {
                $project: {
                    "tester":
                    {
                        $concatArrays: [
                            '$balances.balance',
                            '$tariks.tarik',
                            '$transactions.transaction'
                        ],

                    },

                }
            },
            {
                $unwind: {
                    path: "$tester",

                }
            },
            {
                $project: {
                    "_id": '$tester._id',
                    "iduser":
                    {
                        $cond: {
                            if: {
                                $gt: ['$tester.amount', 0]
                            },
                            then: '$tester.iduser',
                            else: "$kodok"
                        }
                    },
                    "type": '$tester.type',
                    "jenis": '$tester.jenis',
                    "timestamp": '$tester.timestamp',
                    "description": '$tester.description',
                    "noinvoice": '$tester.noinvoice',
                    "nova": '$tester.nova',
                    "expiredtimeva": '$tester.expiredtimeva',
                    "bank": '$tester.bank',
                    "amount": '$tester.amount',
                    "totalamount": '$tester.totalamount',
                    "status": '$tester.status',
                    "fullName": '$tester.fullName',
                    "email":
                    {
                        $cond: {
                            if: {
                                $gt: ['$tester.amount', 0]
                            },
                            then: '$tester.email',
                            else: "$kodok"
                        }
                    },
                    "penjual": '$tester.penjual',
                    "emailpenjual": '$tester.emailpenjual',
                    "userNamePenjual": '$tester.userNamePenjual',
                    "pembeli": '$tester.pembeli',
                    "emailpembeli": '$tester.emailpembeli',
                    "userNamePembeli": '$tester.userNamePembeli',
                    "postID": '$tester.postID',
                    "postType": '$tester.postType',
                    "descriptionContent": '$tester.descriptionContent',
                    "title": '$tester.title',
                    "mediaType": '$tester.mediaType',
                    "mediaEndpoint": '$tester.mediaEndpoint',
                    "mediaThumbEndpoint": '$tester.mediaThumbEndpoint',
                    "apsaraThumbId": '$tester.apsaraThumbId',
                    "apsaraId": '$tester.apsaraId',
                    "apsara": '$tester.apsara',
                    "debetKredit": '$tester.debetKredit',
                    "timestart": "$tester.timestart",
                    "iconVoucher": "$tester.iconVoucher",
                }
            },
        );

        var matchexpr = [];
        if (sell === true) {
            matchexpr.push({ "type": "Sell", "jenis": "CONTENT" });
        }

        if (buy === true) {
            matchexpr.push({ "type": "Buy", "jenis": "CONTENT" });
        }

        if (withdrawal === true) {
            matchexpr.push({ "type": "Withdraws" });
        }

        if (rewards === true) {
            matchexpr.push({ "type": "Rewards" });
        }

        if (boost === true) {
            matchexpr.push({ "type": "Buy", "jenis": "BOOST_CONTENT" });
        }

        if (voucher === true) {
            matchexpr.push({ "jenis": "VOUCHER" });
        }

        if (matchexpr.length != 0) {
            pipeline.push(
                {
                    "$match":
                    {
                        "$or": matchexpr
                    }
                }
            );
        }

        if (startdate && startdate !== undefined) {

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }

        pipeline.push({
            $sort: {
                "timestamp": - 1,

            }
        },
            {
                $skip: skip
            },
            {
                $limit: limit
            },);

        // var setutil = require('util');
        // console.log(setutil.inspect(pipeline, { showHidden:false, depth:null }));

        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }
    async transaksiHistoryv2(email: string, skip: number, limit: number, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any, voucher: any) {

        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var pipeline = [];

        pipeline.push(
            {
                $match:
                {
                    "email": email
                }
            },
            {
                $project: {
                    "_id": 1,
                    "userName": '$username',
                    "fullName": 1,
                    "email": 1,

                }
            },
            {
                $facet:
                {

                    "balances": [
                        {
                            "$lookup": {
                                from: "accountbalances",
                                as: "balance",
                                let: {
                                    localID: "$_id"
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and:
                                                [
                                                    {
                                                        $expr: {
                                                            $eq: ['$iduser', '$$localID']
                                                        }
                                                    },
                                                    {
                                                        "type": "rewards"
                                                    },

                                                ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "Rewards",
                                            "type": "Rewards",
                                            "timestamp": 1,
                                            "description": 1,
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": "$kredit",
                                            "totalamount": "$kredit",
                                            "status": "Success",
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,
                                            "debetKredit": "+",
                                            "fullName": "$fullName",

                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $unwind: {
                                path: "$balance",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                    ],
                    "tariks": [
                        {
                            "$lookup": {
                                from: "withdraws",
                                as: "tarik",
                                let: {
                                    localID: "$_id"
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and:
                                                [
                                                    {
                                                        $expr: {
                                                            $eq: ['$idUser', '$$localID']
                                                        }
                                                    },

                                                ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "Withdraws",
                                            "type": "Withdraws",
                                            "timestamp": 1,
                                            "description": 1,
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": 1,
                                            "totalamount": 1,
                                            "status": "Success",
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,
                                            "debetKredit": "-",
                                            "fullName": "$fullName",

                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $unwind: {
                                path: "$tarik",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                    ],
                    "transactions": [
                        {
                            "$lookup": {
                                from: "transactions",
                                as: "buy-sell",
                                let: {
                                    localID: '$_id'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $or:
                                                [
                                                    {
                                                        $expr: {
                                                            $eq: ['$iduserbuyer', '$$localID']
                                                        }
                                                    },
                                                    {
                                                        $expr: {
                                                            $eq: ['$idusersell', '$$localID']
                                                        }
                                                    }
                                                ]
                                        }
                                    },
                                    {
                                        $project: {
                                            "jenis": "$type",
                                            "type":
                                            {
                                                $cond: {
                                                    if: {
                                                        $eq: ['$iduserbuyer', '$$localID']
                                                    },
                                                    then: "Buy",
                                                    else: 'Sell'
                                                }
                                            },
                                            "timestamp": 1,
                                            "timeStart":
                                            {
                                                "$dateToString": {
                                                    "format": "%Y-%m-%dT%H:%M:%S",
                                                    "date": {
                                                        $add: [new Date(), 25200000]
                                                    }
                                                }
                                            },
                                            "status":
                                            {
                                                $cond: {
                                                    if:
                                                    {
                                                        $and: [
                                                            {
                                                                $lt: ['$expiredtimeva', {
                                                                    "$dateToString": {
                                                                        "format": "%Y-%m-%dT%H:%M:%S",
                                                                        "date": {
                                                                            $add: [new Date(), 25200000]
                                                                        }
                                                                    }
                                                                },]
                                                            },
                                                            {
                                                                $eq: ['$status', 'WAITING_PAYMENT']
                                                            }
                                                        ]
                                                    },
                                                    then: "Cancel",
                                                    else: '$status'
                                                }
                                            },
                                            "description":
                                            {
                                                $cond: {
                                                    if:
                                                    {
                                                        $and: [
                                                            {
                                                                $lt: ['$expiredtimeva', {
                                                                    "$dateToString": {
                                                                        "format": "%Y-%m-%dT%H:%M:%S",
                                                                        "date": {
                                                                            $add: [new Date(), 25200000]
                                                                        }
                                                                    }
                                                                },]
                                                            },
                                                            {
                                                                $eq: ['$status', 'WAITING_PAYMENT']
                                                            }
                                                        ]
                                                    },
                                                    then: "$VA expired time",
                                                    else: 'description'
                                                }
                                            },
                                            "noinvoice": 1,
                                            "nova": 1,
                                            "expiredtimeva": 1,
                                            "bank": 1,
                                            "amount": 1,
                                            "totalamount": 1,
                                            "postid": 1,
                                            "iduserbuyer": 1,
                                            "idusersell": 1,
                                            "fullName": "$fullName",

                                        }
                                    },
                                    // {
                                    //     $sort: {
                                    //         "timestamp": - 1,
                                    //         
                                    //     }
                                    // },
                                ],

                            },

                        },
                        {
                            "$lookup": {
                                from: "newPosts",
                                as: "post",
                                let: {
                                    localID: '$buy-sell.postid'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {


                                            $expr: {
                                                $in: ['$postID', '$$localID']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            "postID": 1,
                                            "description": 1,
                                            "postType": 1,
                                            "certified": 1,
                                            "apsara": {
                                                $ifNull: [{ $arrayElemAt: ["$mediaSource.apsara", 0] }, false]
                                            },
                                            "apsaraId": {
                                                $ifNull: [{ $arrayElemAt: ["$mediaSource.apsaraId", 0] }, false]
                                            },
                                            "apsaraThumbId":
                                            {
                                                "$concat": ["/thumb/", "$postID"]
                                            },
                                            "mediaEndpoint": {
                                                "$concat": ["/stream/", "$postID"]
                                            },
                                            "mediaUri": { $arrayElemAt: ["$mediaSource.mediaUri", 0] },
                                            "mediaThumbEndpoint": { $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0] },
                                            "mediaThumbUri": { $arrayElemAt: ["$mediaSource.mediaThumbUri", 0] },
                                            "mediaType": { $arrayElemAt: ["$mediaSource.mediaType", 0] },

                                        }
                                    }
                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'newUserBasics',
                                as: 'penjual',
                                let: {
                                    localID: '$buy-sell.idusersell'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "email":
                                                    {
                                                        $ne: email
                                                    }
                                                }
                                            ]
                                        }
                                    },

                                ],

                            },

                        },
                        {
                            $lookup: {
                                from: 'newUserBasics',
                                as: 'pembeli',
                                let: {
                                    localID: '$buy-sell.iduserbuyer'
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $and: [
                                                {
                                                    $expr: {
                                                        $in: ['$_id', '$$localID']
                                                    }
                                                },
                                                {
                                                    "email":
                                                    {
                                                        $ne: email
                                                    }
                                                }
                                            ]
                                        }
                                    },

                                ],

                            },

                        },

                        {
                            $set: {
                                penjualAuth: "$penjual.username"
                            }
                        },
                        {
                            $set: {
                                pembeliAuth: "$penjual.username"
                            }
                        },
                        {
                            $unwind: {
                                path: "$buy-sell",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: "settings",
                                as: "setting",
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            "_id": new Types.ObjectId("648ae670766c00007d004a82")
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            $project: {
                                "transaction": [{
                                    "_id": "$buy-sell._id",
                                    "timestart": "$buy-sell.timeStart",
                                    "iduser": "$_id",
                                    "type": "$buy-sell.type",
                                    "jenis": "$buy-sell.jenis",
                                    "timestamp": "$buy-sell.timestamp",
                                    "description": "$buy-sell.description",
                                    "noinvoice": "$buy-sell.noinvoice",
                                    "nova": "$buy-sell.nova",
                                    "expiredtimeva": "$buy-sell.expiredtimeva",
                                    "bank": "$buy-sell.bank",
                                    "amount": "$buy-sell.amount",
                                    "totalamount":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$buy-sell.amount",
                                            else: '$buy-sell.totalamount'
                                        }
                                    },
                                    "status": "$buy-sell.status",
                                    "email": "$email",
                                    "fullName": "$fullName",
                                    "username": "$fullName",
                                    "iconVoucher": { $arrayElemAt: ['$setting.value', 0] },
                                    "penjual":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$penjual.fullName', {
                                                    "$indexOfArray": [
                                                        "$penjual._id",
                                                        "$buy-sell.idusersell"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "emailpenjual":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$penjual.email', {
                                                    "$indexOfArray": [
                                                        "$penjual._id",
                                                        "$buy-sell.idusersell"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "userNamePenjual":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Sell"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$penjualAuth.username', {
                                                    "$indexOfArray": [
                                                        "$penjualAuth.email",
                                                        {
                                                            $arrayElemAt: ['$penjual.email', {
                                                                "$indexOfArray": [
                                                                    "$penjual._id",
                                                                    "$buy-sell.idusersell"
                                                                ]
                                                            }]
                                                        }
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "pembeli":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Buy"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$pembeli.fullName', {
                                                    "$indexOfArray": [
                                                        "$pembeli._id",
                                                        "$buy-sell.iduserbuyer"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "emailpembeli":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Buy"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$pembeli.email', {
                                                    "$indexOfArray": [
                                                        "$pembeli._id",
                                                        "$buy-sell.iduserbuyer"
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "userNamePembeli":
                                    {
                                        $cond: {
                                            if: {
                                                $eq: ["$buy-sell.type", "Buy"]
                                            },
                                            then: "$dodol",
                                            else: {
                                                $arrayElemAt: ['$pembeliAuth.username', {
                                                    "$indexOfArray": [
                                                        "$pembeliAuth.email",
                                                        {
                                                            $arrayElemAt: ['$pembeli.email', {
                                                                "$indexOfArray": [
                                                                    "$pembeli._id",
                                                                    "$buy-sell.iduserbuyer"
                                                                ]
                                                            }]
                                                        }
                                                    ]
                                                }]
                                            }
                                        }
                                    },
                                    "postID": "$buy-sell.postid",
                                    "postType":
                                    {
                                        $arrayElemAt: ['$post.postType', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "certified":
                                    {
                                        $arrayElemAt: ['$post.certified', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "descriptionContent":
                                    {
                                        $arrayElemAt: ['$post.description', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "title":
                                    {
                                        $arrayElemAt: ['$post.title', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "mediaType":
                                    {
                                        $arrayElemAt: ['$post.mediaType', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "mediaEndpoint":
                                    {
                                        $arrayElemAt: ['$post.mediaEndpoint', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "apsaraId":
                                    {
                                        $arrayElemAt: ['$post.apsaraId', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "apsara":
                                    {
                                        $arrayElemAt: ['$post.apsara', {
                                            "$indexOfArray": [
                                                "$post.postID",
                                                "$buy-sell.postid"
                                            ]
                                        }]
                                    },
                                    "debetKredit":
                                    {
                                        $switch: {
                                            branches: [
                                                {
                                                    case: {
                                                        $eq: ["$buy-sell.type", "Buy"]
                                                    },
                                                    then: null
                                                },
                                                {
                                                    case: {
                                                        $eq: ["$buy-sell.type", "Sell"]
                                                    },
                                                    then: "+"
                                                },

                                            ],
                                            "default": "$kampret"
                                        }
                                    },

                                }]
                            }
                        },
                        {
                            $unwind: {
                                path: "$transaction",
                                preserveNullAndEmptyArrays: true
                            }
                        },

                    ],

                }
            },
            {
                $project: {
                    "dodol": {
                        $arrayElemAt: ["$balances.fullName", 0]
                    },
                    "tester":
                    {
                        $concatArrays: [
                            '$balances.balance',
                            '$tariks.tarik',
                            '$transactions.transaction'
                        ],

                    },

                }
            },
            {
                $unwind: {
                    path: "$tester",

                }
            },
            {
                $project: {
                    "dodol": 1,
                    "_id": '$tester._id',
                    "iduser":
                    {
                        $cond: {
                            if: {
                                $gt: ['$tester.amount', 0]
                            },
                            then: '$tester.iduser',
                            else: "$kodok"
                        }
                    },
                    "type": '$tester.type',
                    "jenis": '$tester.jenis',
                    "timestamp": '$tester.timestamp',
                    "description": '$tester.description',
                    "certified": '$tester.certified',
                    "noinvoice": '$tester.noinvoice',
                    "nova": '$tester.nova',
                    "expiredtimeva": '$tester.expiredtimeva',
                    "bank": '$tester.bank',
                    "amount": '$tester.amount',
                    "totalamount": '$tester.totalamount',
                    "status": '$tester.status',
                    "fullName": '$tester.fullName',
                    "iconVoucher": '$tester.iconVoucher',
                    "email":
                    {
                        $cond: {
                            if: {
                                $gt: ['$tester.amount', 0]
                            },
                            then: '$tester.email',
                            else: "$kodok"
                        }
                    },
                    "penjual": '$tester.penjual',
                    "emailpenjual": '$tester.emailpenjual',
                    "userNamePenjual": '$tester.userNamePenjual',
                    "pembeli": '$tester.pembeli',
                    "emailpembeli": '$tester.emailpembeli',
                    "userNamePembeli": '$tester.userNamePembeli',
                    "postID": '$tester.postID',
                    "postType": '$tester.postType',
                    "descriptionContent": '$tester.descriptionContent',
                    "title": '$tester.title',
                    "mediaType": '$tester.mediaType',
                    mediaEndpoint: {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$tester.postType", "pict"
                                    ]
                            },
                            then:
                            {
                                "$concat":
                                    [
                                        "/pict/",
                                        "$tester.postID"
                                    ]
                            },
                            else:
                            {
                                "$concat":
                                    [
                                        "/stream/",
                                        "$tester.postID"
                                    ]
                            }
                        }
                    },
                    "apsaraId": '$tester.apsaraId',
                    "apsara": '$tester.apsara',

                }
            },
            {
                $addFields: {


                    certi: {
                        $cmp: ["$certified", 0]
                    },

                }
            },
            {
                $project: {
                    "dodol": 1,
                    "_id": 1,
                    "iduser": 1,
                    "type": 1,
                    "jenis": 1,
                    "timestamp": 1,
                    "description": 1,
                    "certified":
                    {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$certi", - 1]
                                }, {
                                    $eq: ["$certi", 0]
                                }]
                            },
                            then: false,
                            else: "$certified"
                        }
                    },
                    "noinvoice": 1,
                    "nova": 1,
                    "expiredtimeva": 1,
                    "bank": 1,
                    "amount": 1,
                    "totalamount": 1,
                    "status": 1,
                    "fullName": "$fullName",
                    "email": 1,
                    "postID": 1,
                    "postType": 1,
                    "descriptionContent": 1,
                    "title": 1,
                    "mediaType": 1,
                    "mediaEndpoint": 1,
                    "apsaraId": 1,
                    "apsara": 1,
                    iconVoucher: 1

                }
            },
            {
                $project: {
                    "_id": 1,
                    "mediaType": 1,
                    "mediaEndpoint": 1,
                    "apsaraId": 1,
                    "apsara": 1,
                    "iduser": 1,
                    "type": 1,
                    "jenis": 1,
                    "timestamp": 1,
                    "description": 1,
                    "noinvoice": 1,
                    "nova": 1,
                    "expiredtimeva": 1,
                    "bank": 1,
                    "amount": 1,
                    "totalamount": 1,
                    "status": 1,
                    "fullName":
                    {
                        $ifNull: ["$fullName", "$dodol"]
                    },
                    "email": 1,
                    "postID": 1,
                    "postType": 1,
                    "descriptionContent": 1,
                    "title": 1,
                    iconVoucher: 1,
                    "kepemilikan":
                    {
                        $cond: {
                            if: {
                                $or: [{
                                    $eq: ["$certified", false]
                                }, {
                                    $eq: ["$certified", ""]
                                }]
                            },
                            then: "TIDAK",
                            else: "YA"
                        }
                    },

                }
            },

        );

        var matchexpr = [];
        if (sell === true) {
            matchexpr.push({ "type": "Sell", "jenis": "CONTENT" });
        }

        if (buy === true) {
            matchexpr.push({ "type": "Buy", "jenis": "CONTENT" });
        }

        if (withdrawal === true) {
            matchexpr.push({ "type": "Withdraws" });
        }

        if (rewards === true) {
            matchexpr.push({ "type": "Rewards" });
        }

        if (boost === true) {
            matchexpr.push({ "type": "Buy", "jenis": "BOOST_CONTENT" });
        }

        if (voucher === true) {
            matchexpr.push({ "jenis": "VOUCHER" });
        }

        if (matchexpr.length != 0) {
            pipeline.push(
                {
                    "$match":
                    {
                        "$or": matchexpr
                    }
                }
            );
        }

        if (startdate && startdate !== undefined) {

            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

        }

        pipeline.push({
            $sort: {
                "timestamp": - 1,

            }
        },
            {
                $skip: skip
            },
            {
                $limit: limit
            },);

        // var setutil = require('util');
        // console.log(setutil.inspect(pipeline, { showHidden:false, depth:null }));

        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }
    async updateStatusKyc(email: string, status: Boolean, statusKyc: string, startdate: string, urllink: string): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "email": email },
            {
                $set: {
                    "isIdVerified": status,
                    "statusKyc": statusKyc
                }
            },
        );

        var timestamps_end = new Date();
        timestamps_end.setHours(timestamps_end.getHours() + 7);
        var pecahdata = timestamps_end.toISOString().split("T");
        var finalend = pecahdata[0] + " " + pecahdata[1].split(".")[0];
        this.logapiSS.create2(urllink, startdate, finalend, email, null, null, null);

        return data;
    }

    async updateStatusKycName(nama: string, gender: string, email: string, status: Boolean, statusKyc: string, dob: string, datakyc: any[]): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "email": email },
            {
                $set: {
                    "isIdVerified": status,
                    "statusKyc": statusKyc,
                    "fullName": nama,
                    "gender": gender,
                    "dob": dob,
                    "kyc": datakyc
                }
            },
        );
        return data;
    }

    async updateStatusKycFailed(email: string, status: Boolean, statusKyc: string, datakyc: any[]): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "email": email },
            {
                $set: {
                    "isIdVerified": status,
                    "statusKyc": statusKyc,
                    "kyc": datakyc
                }
            },
        );
        return data;
    }

    async updateIdVerifiedUser(id: ObjectId, isIdVerified: boolean, statusKyc: string): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "_id": id },
            {
                $set: {
                    "isIdVerified": isIdVerified,
                    "statusKyc": statusKyc
                }
            });

        return data;
    }

    async updateNoneActive(email: string): Promise<Object> {
        let data = await this.UserbasicnewModel.updateOne({ "email": email },
            {
                $set: {
                    "email": email + "_noneactive",
                }
            });

        return data;
    }

    async userNew(startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            var dt = dateend.substring(0, 10);
        } catch (e) {
            dt = "";
        }
        var query = await this.UserbasicnewModel.aggregate([
            {
                $match: {

                    createdAt: {
                        $gte: startdate,
                        $lte: dt

                    }
                }
            },
            {
                $group: {

                    _id: {
                        tgl: {
                            $substrCP: ['$createdAt', 0, 10]
                        },

                    },
                    count: {
                        $sum: 1
                    },

                },

            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.tgl',
                    count: 1
                }
            },

            {
                $sort: { date: 1 }
            }

        ]);
        return query;

    }

    async demografis(startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            var dt = dateend.substring(0, 10);
        } catch (e) {
            dt = "";
        }
        var query = await this.UserbasicnewModel.aggregate([

            {
                $match: {

                    createdAt: {
                        $gte: startdate,
                        $lte: dt

                    }
                }
            },
            {
                $project: {
                    createdAt: 1,
                    email: 1,
                    states: 1,
                    gender: {
                        "$ifNull":
                            [
                                "$gender",
                                "Other"
                            ]
                    },
                    statesName:
                    {
                        "$ifNull":
                            [
                                "$statesName",
                                "OTHER"
                            ]
                    }
                }
            },
            {
                $facet: {
                    "gender": [
                        {
                            $group: {

                                _id: '$gender',
                                count: {
                                    $sum: 1
                                },

                            },

                        },
                        {
                            $project: {
                                _id: 0,
                                gender: '$_id',
                                count: 1,

                            }
                        },

                    ],
                    "wilayah": [
                        {
                            $group: {

                                _id: '$statesName',
                                count: {
                                    $sum: 1
                                },

                            },

                        },
                        {
                            $project: {
                                _id: 0,
                                stateName: '$_id',
                                count: 1,

                            }
                        },

                    ]
                }
            }
        ]);
        return query;
    }

    async findInbyid(userid: any[]) {
        var result = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    "_id":
                    {
                        "$in": userid
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    email: 1,
                    username: 1,
                    fullName: 1,
                    mediaBasePath: 1,
                    mediaUri: 1,
                    mediaType: 1,
                    mediaEndpoint: 1,
                    urluserBadge:
                    {
                        "$ifNull":
                            [
                                {
                                    "$filter":
                                    {
                                        input: "$userBadge",
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
                                },
                                []
                            ]
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    email: 1,
                    username: 1,
                    fullName: 1,
                    mediaBasePath: 1,
                    mediaUri: 1,
                    mediaType: 1,
                    mediaEndpoint: 1,
                    urluserBadge:
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$urluserBadge", 0
                                        ]
                                },

                                null
                            ]
                    }
                }
            }
        ]);

        return result;
    }

    async getcount() {
        var query = await this.UserbasicnewModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalpost: {
                        $sum: 1
                    }
                }
            }
        ]);
        return query;
    }

    async getuser(page: number, limit: number) {
        var pipeline = [];

        pipeline.push(
            { $skip: page * limit },
            { $limit: limit },
        );
        var query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;
    }

    /*
        TAMBAHIN GET USER TARGET DATA!!
    */

    async updatefollowSystem(email_target: string, email_source: string, type: string) {
        var getdata = await this.UserbasicnewModel.findOne({ email: email_source });
        var listpertemanan = null;

        if (getdata != null) {
            try {
                listpertemanan = (type == "FOLLOWING" ? getdata.following : getdata.follower);
                if (listpertemanan == null) {
                    listpertemanan = [];
                }
            }
            catch (e) {
                listpertemanan = [];
            }
            listpertemanan.push(email_target);

            var update = new CreateuserbasicnewDto();
            if (type == "FOLLOWING") {
                update.following = listpertemanan;
            }
            else {
                update.follower = listpertemanan;
            }
            var result = await this.UserbasicnewModel.findByIdAndUpdate(getdata._id.toString(), update, { new: true });
            if (!result) {
                throw new Error('Data is not found!');
            }
        }

        return true;
    }

    async updateunfollowSystem(email_target: string, email_source: string, type: string) {
        var getdata = await this.UserbasicnewModel.findOne({ email: email_source });
        var listpertemanan = null;

        if (getdata != null) {
            try {
                listpertemanan = (type == "FOLLOWING" ? getdata.following : getdata.follower);
                if (listpertemanan == null) {
                    listpertemanan = [];
                }
            }
            catch (e) {
                listpertemanan = [];
            }
            var filterpertemanan = listpertemanan.filter(emaildata => emaildata != email_target);

            var update = new CreateuserbasicnewDto();
            if (type == "FOLLOWING") {
                update.following = filterpertemanan;
            }
            else {
                update.follower = filterpertemanan;
            }
            var result = await this.UserbasicnewModel.findByIdAndUpdate(getdata._id.toString(), update, { new: true });
            if (!result) {
                throw new Error('Data is not found!');
            }
        }

        return true;
    }

    async updateReferralSystem(email_target: any, email_source: string) {
        var getdata = await this.UserbasicnewModel.findOne({ email: email_source });
        var listreferrral = null;

        if (getdata != null) {
            try {
                listreferrral = getdata.referral;
                if(listreferrral == null)
                {
                    listreferrral = [];
                }
            }
            catch (e) {
                listreferrral = [];
            }
            var filterpertemanan = listreferrral.filter(emaildata => emaildata.email == email_target.email);
            if(filterpertemanan.length == 0)
            {
                listreferrral.push(email_target)
            }

            var update = new CreateuserbasicnewDto();
            update.referral = listreferrral;
            var result = await this.UserbasicnewModel.findByIdAndUpdate(getdata._id.toString(), update, { new: true });
            if (!result) {
                throw new Error('Data is not found!');
            }
        }

        return true;
    }

    async addFriendList(email_target: Userbasicnew, email_source: Userbasicnew) {
        var convertdata = JSON.parse(JSON.stringify(email_source));
        var listarray = null;
        try {
            //bermasalah disini
            if (convertdata.friend != null && convertdata.friend != undefined && convertdata.friend.length != 0) {
                listarray = convertdata.friend;
            }
            else {
                listarray = [];
            }
        }
        catch (e) {
            listarray = [];
        }

        var checkfriendexist = true;
        if (listarray.length == 0) {
            checkfriendexist = false;
            listarray = [email_target.email];
        }
        else {
            var checkdata = listarray.find(getdata => getdata === email_target.email);
            if (checkdata == undefined) {
                checkfriendexist = false;
                listarray.push(email_target.email);
            }
            else {
                checkfriendexist = true;
            }
        }

        if (checkfriendexist == false) {
            var mongo = require('mongoose');
            try {
                await this.UserbasicnewModel.updateOne(
                    {
                        "_id": new mongo.Types.ObjectId(email_source._id.toString())
                    },
                    {
                        "$set":
                        {
                            "friend": listarray
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
            catch (e) {
                console.log(e);
            }
        }
    }

    async deleteFriendList(email_target: Userbasicnew, email_source: Userbasicnew) {
        var convertdata = JSON.parse(JSON.stringify(email_source));
        // var getdata = await this.UserbasicnewModel.findOne({ email:email_source }).exec();
        if (convertdata.friend == null || convertdata.friend == undefined) {
            return false;
        }
        else {
            var updatedata = new Userbasicnew();
            var listfriend = convertdata.friend;
            updatedata.friend = listfriend.filter((email) => email != email_target.email.toString());
            var mongodb = require('mongoose');

            await this.UserbasicnewModel.updateOne(
                {
                    "_id": new mongodb.Types.ObjectId(convertdata._id.toString())
                },
                {
                    "$set": updatedata
                }
            );

            return true;
        }
    }

    async countuserchart() {
        var getmaledata = await this.UserbasicnewModel.find({
            $or: [
                { gender: "MALE" },
                { gender: " MALE" },
                { gender: "Male" },
                { gender: "LAKI-LAKI" },
                { gender: "Laki-laki" },
                { gender: "Pria" },
            ]
        }).count();

        var getfemaledata = await this.UserbasicnewModel.find({
            $or: [
                { gender: "FEMALE" },
                { gender: " FEMALE" },
                { gender: "Female" },
                { gender: "Perempuan" },
                { gender: " Perempuan" },
                { gender: "PEREMPUAN" },
                { gender: "Wanita" },
            ]
        }).count();

        var getotherdata = await this.UserbasicnewModel.find({
            $or: [
                { gender: "" },
                { gender: null }
            ]
        }).count();

        var totaldata = await this.UserbasicnewModel.aggregate([
            { $count: "myCount" }
        ]);

        var data = [
            {
                gender:
                    [
                        {
                            "_id": "MALE",
                            "count": getmaledata,
                        },
                        {
                            "_id": "FEMALE",
                            "count": getfemaledata,
                        },
                        {
                            "_id": "OTHER",
                            "count": getotherdata,
                        },
                    ],
                userActive: totaldata[0].myCount
            }
        ];

        return data;
    }

    async filterguest(username: string, lokasi: [], startdate: string, enddate: string, startlogin: string, endlogin: string, page: number, limit: number, descending: any, os: [], viewsgte: number, viewslte: number, likesgte: number, likeslte: number, sharesgte: number, shareslte: number) {

        var arrlokasi = [];
        var idlokasi = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var lenglokasi = null;
        var order = null;

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }
        try {
            lenglokasi = lokasi.length;
        } catch (e) {
            lenglokasi = 0;
        }
        if (lenglokasi > 0) {

            for (let i = 0; i < lenglokasi; i++) {
                let idkat = lokasi[i];
                idlokasi = mongoose.Types.ObjectId(idkat);
                arrlokasi.push(idlokasi);
            }
        }

        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var dt = dateend.substring(0, 10);
        try {
            var currentdatelogin = new Date(new Date(endlogin).setDate(new Date(endlogin).getDate() + 1));

            var dateendlogin = currentdatelogin.toISOString();
        } catch (e) {
            dateendlogin = "";
        }
        var dtlogin = dateendlogin.substring(0, 10);
        var pipeline = [];

        pipeline.push(

            {
                $match: {
                    'guestMode': true
                }
            },
            {
                $lookup: {
                    from: 'contentevents',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'eventData',
                    pipeline: [
                        {
                            $group: {
                                _id: "$email",
                                shares: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: ["$eventType", "SHARE"],

                                            },
                                            1,
                                            0,

                                        ],

                                    },

                                },
                                views: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: ["$eventType", "VIEW"],

                                            },
                                            1,
                                            0,

                                        ],

                                    },

                                },
                                likes: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: ["$eventType", "LIKE"],

                                            },
                                            1,
                                            0,

                                        ],

                                    },

                                },

                            },

                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$eventData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'activityevents',
                    localField: '_id',
                    foreignField: 'userbasic',
                    as: 'activityData',
                    pipeline: [
                        {
                            $match: {
                                'event': 'LOGIN_GUEST'
                            }
                        },
                        {
                            $sort: {
                                'createdAt': -1
                            }
                        },
                        {
                            $limit: 1
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$activityData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'createdAt': 1,
                    'username': 1,
                    'os': '$regSrc',
                    'areasId': '$states.$id',
                    'views': {
                        '$ifNull': ["$eventData.views", 0]
                    },
                    'likes': {
                        '$ifNull': ["$eventData.likes", 0]
                    },
                    'shares': {
                        '$ifNull': ["$eventData.shares", 0]
                    },
                    'lastlogin': '$activityData.createdAt'
                }
            },
            {
                $sort: {
                    lastlogin: order
                }
            },
        );

        if (username && username !== undefined) {

            pipeline.push({
                $match: {
                    username: {
                        $regex: username,
                        $options: 'i'
                    },

                }
            },);

        }

        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { createdAt: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { createdAt: { $lte: dt } } });
        }

        if (viewsgte && viewsgte !== undefined) {
            pipeline.push({ $match: { views: { $gte: viewsgte } } });
        }
        if (viewslte && viewslte !== undefined) {
            pipeline.push({ $match: { views: { $lte: viewslte } } });
        }
        if (likesgte && likesgte !== undefined) {
            pipeline.push({ $match: { likes: { $gte: likesgte } } });
        }
        if (likeslte && likeslte !== undefined) {
            pipeline.push({ $match: { likes: { $lte: likeslte } } });
        }
        if (sharesgte && sharesgte !== undefined) {
            pipeline.push({ $match: { shares: { $gte: sharesgte } } });
        }
        if (shareslte && shareslte !== undefined) {
            pipeline.push({ $match: { shares: { $lte: shareslte } } });
        }

        if (lokasi && lokasi !== undefined) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            areasId: {
                                $in: arrlokasi
                            }
                        },

                    ]
                }
            },);
        }

        if (os && os !== undefined) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            os: {
                                $in: os
                            }
                        },

                    ]
                }
            },);
        }

        if (startlogin && startlogin !== undefined) {
            pipeline.push({ $match: { lastlogin: { $gte: startlogin } } });
        }
        if (endlogin && endlogin !== undefined) {
            pipeline.push({ $match: { lastlogin: { $lte: dtlogin } } });
        }

        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        let query = await this.UserbasicnewModel.aggregate(pipeline);

        return query;

    }

    async listfilterInteractive(email: string, data: any[], eventType: string, isDetail: boolean) {
        var pipeline = [];
        var eventTitle = eventType;
        var CEmatch = [];
        CEmatch.push(
            {
                "$expr":
                {
                    "$eq":
                        [
                            "$email", email
                        ]
                }
            },
            {
                "$expr":
                {
                    "$eq":
                        [
                            "$event", "ACCEPT"
                        ]
                }
            }
        );

        if (eventType == "FOLLOWING" || eventType == "VIEW") {
            CEmatch.push(
                {
                    "$expr":
                    {
                        "$eq":
                            [
                                "$senderParty", "$$user"
                            ]
                    }
                },
            );
        }
        else {
            CEmatch.push(
                {
                    "$expr":
                    {
                        "$eq":
                            [
                                "$receiverParty", "$$user"
                            ]
                    }
                }
            );
        }

        if (eventType == "UNFOLLOW") {
            eventTitle = "FOLLOWER";
            CEmatch.push(
                {
                    "$expr":
                    {
                        "$eq":
                            [
                                "$active", false
                            ]
                    }
                }
            );
        }
        else {
            CEmatch.push(
                {
                    "$expr":
                    {
                        "$eq":
                            [
                                "$active", true
                            ]
                    }
                }
            );
        }

        pipeline.push(
            {
                "$match":
                {
                    "email": email
                }
            },
            {
                "$lookup":
                {
                    from: "insights",
                    localField: "email",
                    foreignField: "email",
                    as: "insight_data"
                }
            },
            {
                "$lookup":
                {
                    from: "newUserBasics",
                    let:
                    {
                        "listemail": data
                    },
                    as: "people_basic_data",
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$in":
                                            [
                                                "$email", "$$listemail"
                                            ]
                                    }
                                }
                            },
                            {
                                "$lookup":
                                {
                                    from: "contentevents",
                                    as: "content_data",
                                    let:
                                    {
                                        "user": "$email"
                                    },
                                    pipeline:
                                        [
                                            {
                                                "$match":
                                                {
                                                    "$and": CEmatch
                                                }
                                            },
                                            {
                                                "$limit": 1
                                            }
                                        ]
                                }
                            },
                            {
                                "$project":
                                {
                                    "_id": 1,
                                    "username": 1,
                                    "fullName": 1,
                                    "email": 1,
                                    "avatar":
                                    {
                                        "mediaBasePath": "$mediaBasePath",
                                        "mediaUri": "$mediaUri",
                                        "mediaEndpoint": "$mediaEndpoint",
                                        "mediaType": "$mediaType",
                                    },
                                    "flowIsDone":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$content_data.flowIsDone", 0
                                                        ]
                                                },
                                                true
                                            ]
                                    },
                                    "createdAt":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$content_data.createdAt", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
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
                                    "eventType":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$content_data.eventType", 0
                                                        ]
                                                },
                                                eventTitle
                                            ]
                                    },
                                    "event":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$content_data.event", 0
                                                        ]
                                                },
                                                "ACCEPT"
                                            ]
                                    },
                                }
                            },
                            {
                                "$project":
                                {
                                    "_id": 1,
                                    "username": 1,
                                    "fullName": 1,
                                    "email": 1,
                                    "avatar": 1,
                                    "flowIsDone": 1,
                                    "createdAt": 1,
                                    "eventType": 1,
                                    "event": 1,
                                    "urluserBadge":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$urluserBadge", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    },
                                }
                            },
                        ]
                }
            },
            {
                "$unwind":
                {
                    path: "$people_basic_data"
                }
            },
            {
                "$set":
                {
                    "setURLbadge":
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
                    }
                }
            },
            {
                "$project":
                {
                    "_id": 0,
                    "createdAt": "$people_basic_data.createdAt",
                    "flowIsDone": "$people_basic_data.flowIsDone",
                    "eventType": "$people_basic_data.eventType",
                    "event": "$people_basic_data.event",
                    "email": 1,
                    "username": 1,
                    "fullName": 1,
                    "avatar":
                    {
                        "mediaBasePath": "$mediaBasePath",
                        "mediaUri": "$mediaUri",
                        "mediaEndpoint": "$mediaEndpoint",
                        "mediaType": "$mediaType",
                    },
                    "profileInsight":
                    {
                        "$ifNull":
                            [
                                {
                                    "follower":
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$insight_data.followers", 0
                                            ]
                                    },
                                    "following":
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$insight_data.followings", 0
                                            ]
                                    }
                                },
                                {}
                            ]
                    },
                    "urluserBadge":
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$setURLbadge", 0
                                        ]
                                },
                                null
                            ]
                    },
                    "senderOrReceiverInfo":
                    {
                        "fullName": "$people_basic_data.fullName",
                        "avatar": "$people_basic_data.avatar",
                        "urluserBadge": "$people_basic_data.urluserBadge",
                        "email": "$people_basic_data.email",
                        "username": "$people_basic_data.username",
                    }
                }
            },
            {
                "$project":
                {
                    "_id": 0,
                    "createdAt": ((isDetail == true || isDetail.toString() == 'true') ? 1 : "$$REMOVE"),
                    "username": ((isDetail == true || isDetail.toString() == 'true') ? 1 : "$$REMOVE"),
                    "fullName": ((isDetail == true || isDetail.toString() == 'true') ? 1 : "$$REMOVE"),
                    "profileInsight": ((isDetail == true || isDetail.toString() == 'true') ? 1 : "$$REMOVE"),
                    "senderOrReceiverInfo": ((isDetail == true || isDetail.toString() == 'true') ? 1 : "$$REMOVE"),
                    "email": 1,
                    "eventType": 1,
                    "flowIsDone": 1,
                    "event": 1,
                    "avatar": 1,
                    "urluserBadge":
                    {
                        "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                        [
                                            "$urluserBadge", 0
                                        ]
                                },
                                null
                            ]
                    }
                }
            }
        );

        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth:null, showHidden:false }));
        var result = await this.UserbasicnewModel.aggregate(pipeline);
        return result;
    }

    async findTopFive(param): Promise<any> {
        var aggregate = [];
        if (param == "INTEREST") {
            aggregate.push(
                {
                    $unwind: {
                        path: "$userInterests",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$userInterests",
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $project: {
                        _id: 0,
                        interest: {
                            $cond: {
                                if: {
                                    $eq: ["$_id", null]
                                },
                                then: "Lainnya",
                                else: "$_id.$id"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "interests_repo",
                        as: "interests",
                        let: {
                            localID: '$interest'
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
                        ]
                    }
                },
                {
                    $project: {
                        _id: "$interest",
                        interestName:
                        {
                            $cond: {
                                if: {
                                    $gt: [{ $size: "$interests" }, 0]
                                },
                                then: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$interests", 0] },
                                        },
                                        "in": "$$tmp.interestName"
                                    }
                                },
                                else: "Other",
                            }
                        },
                        interestNameId:
                        {
                            $cond: {
                                if: {
                                    $gt: [{ $size: "$interests" }, 0]
                                },
                                then: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$interests", 0] },
                                        },
                                        "in": "$$tmp.interestNameId"
                                    }
                                },
                                else: "Lainnya",
                            }
                        },
                    }
                },);
        } else if (param == "LOCATION") {
            aggregate.push(
                {
                    $unwind: {
                        path: "$states",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$states",
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $project: {
                        _id: 0,
                        location: {
                            $cond: {
                                if: {
                                    $eq: ["$_id", null]
                                },
                                then: "Lainnya",
                                else: "$_id.$id"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "areas",
                        as: "areas",
                        let: {
                            localID: '$location'
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
                        ]
                    }
                },
                {
                    $project: {
                        _id: "$location",
                        stateName:
                        {
                            $cond: {
                                if: {
                                    $gt: [{ $size: "$areas" }, 0]
                                },
                                then: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$areas", 0] },
                                        },
                                        "in": "$$tmp.stateName"
                                    }
                                },
                                else: "Other",
                            }
                        },
                        stateID:
                        {
                            $cond: {
                                if: {
                                    $gt: [{ $size: "$areas" }, 0]
                                },
                                then: {
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$areas", 0] },
                                        },
                                        "in": "$$tmp.stateID"
                                    }
                                },
                                else: "Lainnya",
                            }
                        },
                    }
                },
            );
        }
        const query = await this.UserbasicnewModel.aggregate(aggregate);
        return query;
    }

    async getUser(userid: string) {
        let paramaggregate = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userid),

                }
            },
            {
                $project: {
                    fullName: 1,
                    email: 1,
                    username: 1,
                    avatar: {
                        "mediaBasePath": "$mediaBasePath",
                        "mediaUri": "$mediaUri",
                        "mediaType": "$mediaType",
                        "mediaEndpoint": "$mediaEndpoint"
                    }
                }
            },
        ];
        const data = await this.UserbasicnewModel.aggregate(paramaggregate);
        return data;
    }

    async updateTutor(email: string, key: string, value: boolean) {
        var tutor = [
            {
                key: "protection",
                status: false
            },
            {
                key: "sell",
                status: false
            },
            {
                key: "interest",
                status: false
            },
            {
                key: "ownership",
                status: false
            },
            {
                key: "boost",
                status: false
            },
            {
                key: "transaction",
                status: false
            },
            {
                key: "idRefferal",
                status: false
            },
            {
                key: "shareRefferal",
                status: false
            },
            {
                key: "codeRefferal",
                status: false
            }
        ];
        let getUser = await this.findBymail(email);
        console.log(getUser.tutor)
        if (getUser.tutor.length > 0) {
            this.UserbasicnewModel.updateOne({ 'tutor.key': key, email: email }, {
                '$set': {
                    'tutor.$.status': value
                }
            },
                function (err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(docs);
                    }
                },
            ).clone().exec();
        } else {
            let objIndex = tutor.findIndex(obj => obj.key == key);
            tutor[objIndex].status = value;
            await this.UserbasicnewModel.updateOne({ "_id": new Types.ObjectId(getUser._id.toString()) },
                { $set: { "tutor": tutor } }).clone().exec();
        }
    }

    async gettotalyopmail(skip: number, limit: number) {
        var pipeline = [];

        // pipeline.push(
        //     {
        //         "$match":
        //         {
        //             "email":
        //             {
        //                 "$regex": "yopmail.com",
        //                 "$options": "i"
        //             }
        //         }
        //     }
        // );

        if (skip != null && skip != undefined && skip > 0) {
            pipeline.push(
                {
                    "$skip": skip * limit
                }
            );
        }

        if (limit != null && limit != undefined && limit > 0) {
            pipeline.push(
                {
                    "$limit": limit
                }
            );
        }

        pipeline.push(
            {
                "$project":
                {
                    email: 1,
                    fullName: 1,
                    languages:
                    {
                        "$ifNull":
                            [
                                "$languagesLangIso",
                                "id"
                            ]
                    },
                    username: 1,
                    akunmati:
                    {
                        "$regexMatch":
                        {
                            input: "$email",
                            regex: "noneactive",
                            options: "i"
                        }
                    }
                }
            }
        );

        // console.log(JSON.stringify(pipeline));
        var result = await this.UserbasicnewModel.aggregate(pipeline);

        return result;
    }

    async getDuplicateIdCardNumber(idcardnumber: string, email: string) {
        var result = await this.UserbasicnewModel.findOne({
            kyc: {
                $elemMatch: {
                    "idcardnumber": idcardnumber
                }
            },
            email: {
                $not: {
                    $regex: email
                }
            }
        })
        if (result && result != null) return true;
        else return false;
    }
}
