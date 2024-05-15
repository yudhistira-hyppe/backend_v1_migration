import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateAccountbalancesDto, CreateAccountbalances } from './dto/create-accountbalances.dto';
import { Accountbalances, AccountbalancesDocument } from './schemas/accountbalances.schema';
import { PostContentService } from '../../content/posts/postcontent.service';
import mongoose from 'mongoose';

@Injectable()
export class AccountbalancesService {

    constructor(
        @InjectModel(Accountbalances.name, 'SERVER_FULL')
        private readonly accountbalancesModel: Model<AccountbalancesDocument>,
        private readonly postContentService: PostContentService,
    ) { }
    async findOne(iduser: Types.ObjectId): Promise<Accountbalances> {
        return this.accountbalancesModel.findOne({ $and: [{ "iduser": iduser }, { "type": "sell" }] }).sort({
            _id: -1
        }).limit(1).exec();
    }

    async findOneCoin(iduser: Types.ObjectId,idtrans:Types.ObjectId): Promise<Accountbalances> {
        return this.accountbalancesModel.findOne({ $and: [{ "iduser": iduser }, { "idtrans": idtrans }] }).sort({
            _id: -1
        }).limit(1).exec();
    }

    async findsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {
                    "iduser": iduser
                }
            },

            { $group: { _id: null, totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalpenarikan: { $sum: "$debet" } } },

        ]);
        return query;
    }

    async findsaldoall() {
        const query = await this.accountbalancesModel.aggregate([
            { $group: { _id: null, totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalpenarikan: { $sum: "$debet" } } },


        ]);
        return query;
    }

    async getReward(name: string, start_date: any, end_date: any, gender: any[], age: any[], areas: any[], similarity: any[], page: number, limit: number, sorting: boolean, idtransaction: string) {

        var paramaggregate = [];
        var $match = {};

        var andFilter = [];
        andFilter.push({
            type: "rewards"
        });

        if (idtransaction != undefined) {
            andFilter.push({
                idtrans: new mongoose.Types.ObjectId(idtransaction)
            })
        } else {
            andFilter.push({
                idtrans: { $ne: null }
            })
        }

        $match["$and"] = andFilter;
        // $match["type"] = "rewards";
        // $match["idtrans"] = { $ne: null };
        //------------FILTER DATE------------
        if (start_date != undefined && end_date != undefined) {
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date.setDate(end_date.getDate() + 1);
            console.log(start_date.toISOString());
            console.log(end_date.toISOString());
            $match["timestamp"] = {
                $gte: start_date.toISOString(),
                $lte: end_date.toISOString()
            };
        }
        //------------PUSH MATCH START------------
        paramaggregate.push({ $match });

        var andFilter = [];
        var $match = {};
        //------------FILTER NAME------------
        if (name != undefined) {
            // $match["username"] = {
            //     $regex: name,
            //     $options: "i"
            // };
            andFilter.push({
                username: {
                    $regex: name,
                    $options: "i"
                }
            });
        }
        //------------FILTER GENDER------------
        if (gender != undefined) {
            if (gender.length > 0) {
                var Array_Gender = [];
                if (gender.includes("MALE")) {
                    console.log("MALE TRUE", gender);
                    Array_Gender.push("Male", "Laki-laki", "MALE")
                }
                if (gender.includes("FEMALE")) {
                    console.log("FEMALE TRUE", gender);
                    Array_Gender.push(" Perempuan", "Perempuan", "PEREMPUAN", "FEMALE", " FEMALE")
                }
                if (gender.includes("OTHER")) {
                    console.log("OTHER TRUE", gender);
                    Array_Gender.push("Lainnya", null)
                }
                // $match["gender"] = {
                //     $in: Array_Gender
                // };
                andFilter.push({
                    gender: {
                        $in: Array_Gender
                    }
                });
            }
        }
        //------------FILTER GENDER------------
        if (age != undefined) {
            if (age.length > 0) {
                var ageFilter = [];
                if (age.includes("show_smaller_than_14")) {
                    ageFilter.push({
                        age: {
                            $gt: 0, $lt: 14
                        }
                    })
                    // $match["age"] = {
                    //     $gt: 0, $lt: 14
                    // }
                }
                if (age.includes("show_14_smaller_than_28")) {
                    ageFilter.push({
                        age: {
                            $gte: 14, $lte: 28
                        }
                    })
                    // $match["age"] = {
                    //     $gte: 14, $lte: 28
                    // }
                }
                if (age.includes("show_29_smaller_than_43")) {
                    ageFilter.push({
                        age: {
                            $gte: 29, $lte: 43
                        }
                    })
                    // $match["age"] = {
                    //     $gte: 29, $lte: 43
                    // }
                }
                if (age.includes("show_greater_than_43")) {
                    ageFilter.push({
                        age: {
                            $gt: 43
                        }
                    })
                    // $match["age"] = {
                    //     $gt: 43
                    // }
                }
                if (age.includes("other")) {
                    ageFilter.push({
                        age: 0
                    })
                    //$match["age"] = 0
                }
                //$match["$or"] = ageFilter;
                andFilter.push({
                    $or: ageFilter
                });
            }
        }
        //------------FILTER SIMILARITY------------
        if (similarity != undefined) {
            if (similarity.length > 0) {
                var similarityFilter = [];
                console.log(similarity);
                if (similarity.includes("show_smaller_than_25")) {
                    similarityFilter.push({
                        commonality: {
                            $lt: 25
                        }
                    })
                    // $match["age"] = {
                    //     $gt: 0, $lt: 14
                    // }
                }
                if (similarity.includes("show_25_smaller_than_50")) {
                    similarityFilter.push({
                        commonality: {
                            $gte: 25, $lt: 50
                        }
                    })
                    // $match["age"] = {
                    //     $gte: 14, $lte: 28
                    // }
                }
                if (similarity.includes("show_50_smaller_than_75")) {
                    similarityFilter.push({
                        commonality: {
                            $gte: 50, $lt: 75
                        }
                    })
                    // $match["age"] = {
                    //     $gte: 29, $lte: 43
                    // }
                }
                if (similarity.includes("show_75_smaller_than_100")) {
                    similarityFilter.push({
                        commonality: {
                            $gte: 75, $lte: 100
                        }
                    })
                    // $match["age"] = {
                    //     $gt: 43
                    // }
                }
                //$match["$or"] = similarityFilter;
                andFilter.push({
                    $or: similarityFilter
                });
            }
        }
        //------------FILTER AREA------------
        if (areas != undefined) {
            if (areas.length > 0) {
                var area = await Promise.all(areas.map(async (item, index) => {
                    return new mongoose.Types.ObjectId(item);
                }))
                //$match["lokasiId"] = { $in: area };
                andFilter.push({
                    lokasiId: { $in: area }
                });
            }
        }
        $match["$and"] = andFilter;
        //------------PUSH MATCH QUERY------------
        paramaggregate.push(
            {
                $lookup: {
                    from: 'newUserBasics',
                    as: 'userbasics_data',
                    let: {
                        local_id: "$iduser"
                    },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: {
                                    $eq: ['$_id', '$$local_id']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                email: 1,
                                fullName: 1, 
                                username: 1,
                                profileID: 1,
                                gender: 1,
                                age: {
                                    $cond: {
                                        if: {
                                            $and: ['$dob', {
                                                $ne: ["$dob", ""]
                                            }]
                                        },
                                        then: {
                                            $toInt: {
                                                $divide: [{
                                                    $subtract: [new Date(), {
                                                        $toDate: "$dob"
                                                    }]
                                                }, (365 * 24 * 60 * 60 * 1000)]
                                            }
                                        },
                                        else: 0
                                    }
                                },
                                userInterests_array: {
                                    $map: {
                                        input: {
                                            $map: {
                                                input: "$userInterests",
                                                in: {
                                                    $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                                },
                                            }
                                        },
                                        in: "$$this.v"
                                    }
                                },
                                states: 1,
                                userAuth: 1,
                                profilePict: 1
                            }
                        },
                        {
                            $lookup: {
                                from: "interests_repo",
                                localField: "userInterests_array",
                                foreignField: "_id",
                                as: "interests"
                            }
                        },
                        {
                            $lookup: {
                                from: 'areas',
                                as: 'areas',
                                let: {
                                    local_id: "$states.$id"
                                },
                                pipeline: [
                                    {
                                        $match:
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$local_id']
                                            }
                                        }
                                    },
                                ]
                            }
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'userads',
                    as: 'userads_data',
                    let: {
                        userID: "$iduser",
                        adsID: "$idtrans"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userID', '$$userID'] },
                                        { $eq: ['$adsID', '$$adsID'] },
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    timestamp: 1,
                    fullName: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.fullName"
                        }
                    },
                    email: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.email"
                        }
                    },
                    profileID: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.profileID"
                        }
                    },
                    profilePict: {
                        $concat: ["/profilepict/", {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                },
                                "in": "$$tmp.profilePict.$id"
                            }
                        }]
                    },
                    gender: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $or: [
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, "Male"]
                                            },
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, "Laki-laki"]
                                            },
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, "MALE"]
                                            }
                                        ]
                                    }, then: "Laki-laki"
                                },
                                {
                                    case: {
                                        $or: [
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, " Perempuan"]
                                            },
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, "Perempuan"]
                                            },
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, "PEREMPUAN"]
                                            },
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, "FEMALE"]
                                            },
                                            {
                                                $eq: [{
                                                    "$let": {
                                                        "vars": {
                                                            "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                        },
                                                        "in": "$$tmp.gender"
                                                    }
                                                }, " FEMALE"]
                                            }
                                        ]
                                    }, then: "Perempuan"
                                }
                            ],
                            "default": "Lainnya"
                        }
                    },
                    ageQualication: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $lt: [{
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                },
                                                "in": "$$tmp.age"
                                            }
                                        }, 14]
                                    },
                                    then: "< 14 Tahun"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: [{
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                    },
                                                    "in": "$$tmp.age"
                                                }
                                            }, 14]
                                        }, {
                                            $lte: [{
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                    },
                                                    "in": "$$tmp.age"
                                                }
                                            }, 28]
                                        }]
                                    },
                                    then: "14 - 28 Tahun"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: [{
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                    },
                                                    "in": "$$tmp.age"
                                                }
                                            }, 29]
                                        }, {
                                            $lte: [{
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                    },
                                                    "in": "$$tmp.age"
                                                }
                                            }, 43]
                                        }]
                                    },
                                    then: "29 - 43 Tahun"
                                },
                                {
                                    case: {
                                        $gt: [{
                                            "$let": {
                                                "vars": {
                                                    "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                                },
                                                "in": "$$tmp.age"
                                            }
                                        }, 43]
                                    },
                                    then: "> 43 Tahun"
                                },
                            ],
                            "default": "Other"
                        }
                    },
                    age: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.age"
                        }
                    },
                    username: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.username"
                        }
                    },
                    lokasiId: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.states.$id"
                        }
                    },
                    lokasi: {
                        $let: {
                            "vars": {
                                areas: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.areas"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$areas.stateName"
                        }
                    },
                    interest: {
                        $map: {
                            input: {
                                $map: {
                                    input: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                                            },
                                            "in": "$$tmp.interests"
                                        }
                                    },
                                    in: {
                                        $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
                                    },
                                }
                            },
                            in: "$$this.v"
                        }
                    },
                    useradsId: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                            },
                            "in": "$$tmp._id"
                        }
                    },
                    commonality: {
                        $cond: {
                            if: {
                                $and: [{
                                    "$let": {
                                        "vars": {
                                            "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                        },
                                        "in": "$$tmp.scoreTotal"
                                    }
                                }, {
                                    $ne: [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.scoreTotal"
                                        }
                                    }, ""]
                                }]
                            },
                            then: {
                                "$let": {
                                    "vars": {
                                        "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                    },
                                    "in": "$$tmp.scoreTotal"
                                }
                            },
                            else: 0
                        }
                    },
                }
            },);
        //------------PUSH MATCH END------------
        if (andFilter.length > 0) {
            paramaggregate.push({ $match });
        }
        //------------SORTIR------------
        if (sorting) {
            paramaggregate.push({
                "$sort": {
                    timestamp: -1
                }
            });
        } else {
            paramaggregate.push({
                "$sort": {
                    timestamp: 1
                }
            })
        }
        //------------PAGE------------
        if (page > 0) {
            paramaggregate.push({
                "$skip": (limit * page)
            });
        }
        //------------LIMIT------------
        if (limit > 0) {
            paramaggregate.push({
                "$limit": limit
            });
        }
        console.log(JSON.stringify(paramaggregate));
        const query = await this.accountbalancesModel.aggregate(paramaggregate);
        // const query = await this.accountbalancesModel.aggregate([
        //     {
        //         $match: {
        //             type: "rewards", 
        //             idtrans: { $ne: null },
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'userbasics',
        //             as: 'userbasics_data',
        //             let: {
        //                 local_id: "$iduser"
        //             },
        //             pipeline: [
        //                 {
        //                     $match:
        //                     {
        //                         $expr: {
        //                             $eq: ['$_id', '$$local_id']
        //                         }
        //                     }
        //                 },
        //                 {
        //                     $project: {
        //                         _id: 1,
        //                         email: 1,
        //                         fullName: 1, 
        //                         profileID: 1, 
        //                         gender: 1,
        //                         age: {
        //                             $cond: {
        //                                 if: {
        //                                     $and: ['$dob', {
        //                                         $ne: ["$dob", ""]
        //                                     }]
        //                                 },
        //                                 then: {
        //                                     $toInt: {
        //                                         $divide: [{
        //                                             $subtract: [new Date(), {
        //                                                 $toDate: "$dob"
        //                                             }]
        //                                         }, (365 * 24 * 60 * 60 * 1000)]
        //                                     }
        //                                 },
        //                                 else: 0
        //                             }
        //                         },
        //                         userInterests_array: {
        //                             $map: {
        //                                 input: {
        //                                     $map: {
        //                                         input: "$userInterests",
        //                                         in: {
        //                                             $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
        //                                         },
        //                                     }
        //                                 },
        //                                 in: "$$this.v"
        //                             }
        //                         },
        //                         states: 1,
        //                         userAuth: 1,
        //                     }
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: "interests_repo",
        //                         localField: "userInterests_array",
        //                         foreignField: "_id",
        //                         as: "interests"
        //                     }
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: 'areas',
        //                         as: 'areas',
        //                         let: {
        //                             local_id: "$states.$id"
        //                         },
        //                         pipeline: [
        //                             {
        //                                 $match:
        //                                 {
        //                                     $expr: {
        //                                         $eq: ['$_id', '$$local_id']
        //                                     }
        //                                 }
        //                             },
        //                         ]
        //                     }
        //                 },
        //                 {
        //                     $lookup: {
        //                         from: 'userauths',
        //                         as: 'userauths',
        //                         let: {
        //                             local_id: "$userAuth.$id"
        //                         },
        //                         pipeline: [
        //                             {
        //                                 $match: {
        //                                     $expr: {
        //                                         $and: [
        //                                             { $eq: ['$_id', '$$local_id'] },
        //                                         ]
        //                                     }
        //                                 }
        //                             },
        //                         ]
        //                     }
        //                 }
        //             ],
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: 'userads',
        //             as: 'userads_data',
        //             let: {
        //                 userID: "$iduser",
        //                 adsID: "$idtrans"
        //             },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ['$userID', '$$userID'] },
        //                                 { $eq: ['$adsID', '$$adsID'] },
        //                             ]
        //                         }
        //                     }
        //                 },
        //             ]
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             timestamp: 1,
        //             fullName: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                     },
        //                     "in": "$$tmp.fullName"
        //                 }
        //             },
        //             email: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                     },
        //                     "in": "$$tmp.email"
        //                 }
        //             },
        //             profileID: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                     },
        //                     "in": "$$tmp.profileID"
        //                 }
        //             }, 
        //             gender: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                     },
        //                     "in": "$$tmp.gender"
        //                 }
        //             },
        //             ageQualication: {
        //                 $switch: {
        //                     branches: [
        //                         {
        //                             case: {
        //                                 $lt: [{
        //                                     "$let": {
        //                                         "vars": {
        //                                             "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                         },
        //                                         "in": "$$tmp.age"
        //                                     }
        //                                 }, 8]
        //                             },
        //                             then: "< 8"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: [{
        //                                         "$let": {
        //                                             "vars": {
        //                                                 "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                             },
        //                                             "in": "$$tmp.age"
        //                                         }
        //                                     }, 8]
        //                                 }, {
        //                                     $lte: [{
        //                                         "$let": {
        //                                             "vars": {
        //                                                 "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                             },
        //                                             "in": "$$tmp.age"
        //                                         }
        //                                     }, 23]
        //                                 }]
        //                             },
        //                             then: "8 - 23"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: [{
        //                                         "$let": {
        //                                             "vars": {
        //                                                 "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                             },
        //                                             "in": "$$tmp.age"
        //                                         }
        //                                     }, 24]
        //                                 }, {
        //                                     $lte: [{
        //                                         "$let": {
        //                                             "vars": {
        //                                                 "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                             },
        //                                             "in": "$$tmp.age"
        //                                         }
        //                                     }, 39]
        //                                 }]
        //                             },
        //                             then: "24 - 39 Tahun"
        //                         },
        //                         {
        //                             case: {
        //                                 $and: [{
        //                                     $gte: [{
        //                                         "$let": {
        //                                             "vars": {
        //                                                 "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                             },
        //                                             "in": "$$tmp.age"
        //                                         }
        //                                     }, 1]
        //                                 }, {
        //                                     $lt: [{
        //                                         "$let": {
        //                                             "vars": {
        //                                                 "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                             },
        //                                             "in": "$$tmp.age"
        //                                         }
        //                                     }, 14]
        //                                 }]
        //                             },
        //                             then: "< 14 Tahun"
        //                         }
        //                     ],
        //                     "default": "Other"
        //                 }
        //             },
        //             age: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                     },
        //                     "in": "$$tmp.age"
        //                 }
        //             },
        //             username: {
        //                 $let: {
        //                     "vars": {
        //                         userauths: {
        //                             "$arrayElemAt":[{
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.userauths"
        //                                 }
        //                             },0]
        //                         }
        //                     },
        //                     "in": "$$userauths.username"
        //                 }
        //             },
        //             lokasiId: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                     },
        //                     "in": "$$tmp.states.$id"
        //                 }
        //             },
        //             lokasi: {
        //                 $let: {
        //                     "vars": {
        //                         areas: {
        //                             "$arrayElemAt": [{
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.areas"
        //                                 }
        //                             }, 0]
        //                         }
        //                     },
        //                     "in": "$$areas.stateName"
        //                 }
        //             },
        //             interest: {
        //                 $map: {
        //                     input: {
        //                         $map: {
        //                             input: {
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.interests"
        //                                 }
        //                             },
        //                             in: {
        //                                 $arrayElemAt: [{ $objectToArray: "$$this" }, 1]
        //                             },
        //                         }
        //                     },
        //                     in: "$$this.v"
        //                 }
        //             },
        //             useradsId: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$userads_data", 0] },
        //                     },
        //                     "in": "$$tmp._id"
        //                 }
        //             },
        //             commonality: {
        //                 $cond: {
        //                     if: {
        //                         $and: [{
        //                             "$let": {
        //                                 "vars": {
        //                                     "tmp": { "$arrayElemAt": ["$userads_data", 0] },
        //                                 },
        //                                 "in": "$$tmp.commonality"
        //                             }
        //                         }, {
        //                             $ne: [{
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$userads_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.commonality"
        //                                 }
        //                             }, ""]
        //                         }]
        //                     }, 
        //                     then: {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$userads_data", 0] },
        //                             },
        //                             "in": "$$tmp.commonality"
        //                         }
        //                     }, 
        //                     else: 0 }
        //             },
        //         }
        //     },
        //     {
        //         $match: {
        //             username: {
        //                 $regex: name,
        //                 $options: "i"
        //             }
        //         }
        //     },
        // ]);
        return query;
    }

    async findwalletpenarikan(iduser: object, datestart: string, dateend: string) {

        var currentdate = new Date(new Date(dateend).setDate(new Date(dateend).getDate() + 1));

        var enddate = currentdate.toISOString();
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser, "timestamp": { $gte: datestart, $lte: enddate }, "type": "withdraw"
                }
            },
            {
                $group: {
                    _id: null,
                    totalpenarikan: {
                        $sum: "$debet"
                    }
                }
            },


        ]);
        return query;
    }

    async findwallettotalsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser
                }
            },
            {
                $group: {
                    _id: null,
                    totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } },
                }
            },


        ]);
        return query;
    }

    async findwallethistory(iduser: object, datestart: string, dateend: string, skip: number, limit: number) {

        var currentdate = new Date(new Date(dateend).setDate(new Date(dateend).getDate() + 1));

        var enddate = currentdate.toISOString();
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser, "timestamp": { $gte: datestart, $lte: enddate }
                }
            },
            {
                $project: {
                    iduser: "$iduser",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    amount:
                    {
                        $cond: { if: { $eq: ["$debet", 0] }, then: "$kredit", else: "$debet" }
                    },
                    status:
                    {
                        $cond: { if: { $or: [{ $eq: ["$type", "withdraw"] }, { $eq: ["$type", "inquiry"] }, { $eq: ["$type", "disbursement"] }, { $eq: ["$type", "PPH"] }] }, then: "SENT", else: "RECEIVE" }
                    },



                }

            }, { $skip: skip }, { $limit: limit }

        ]);
        return query;
    }

    async create(CreateAccountbalancesDto: CreateAccountbalancesDto): Promise<Accountbalances> {
        let data = await this.accountbalancesModel.create(CreateAccountbalancesDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async create_new(CreateAccountbalances: CreateAccountbalances): Promise<Accountbalances> {
        let data = await this.accountbalancesModel.create(CreateAccountbalances);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async createdata(datas: {
        iduser: { oid: String; },
        debet: number,
        kredit: number,
        type: string,
        timestamp: string,
        description: string

    }): Promise<Accountbalances> {


        let data = await this.accountbalancesModel.create(datas);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async createdatav2(datas: {
        iduser: ObjectId,
        debet: number,
        kredit: number,
        type: string,
        timestamp: string,
        description: string

    }): Promise<Accountbalances> {


        let data = await this.accountbalancesModel.create(datas);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async findhistorySell(iduser: ObjectId, skip: number, limit: number) {
        const query = await this.accountbalancesModel.aggregate([
            {
                $lookup: {
                    from: "transactions",
                    localField: "iduser",
                    foreignField: "idusersell",
                    as: "field"
                }
            }, {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            }, {
                $match: {
                    "field.status": "success",
                    iduser: iduser
                }
            }, {
                $sort: {
                    timestamp: 1
                }
            }, {
                $lookup: {
                    from: "userbasics",
                    localField: "iduser",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $lookup: {
                    from: "posts2",
                    localField: "field.postid",
                    foreignField: "postID",
                    as: "post_data"
                }
            }, {
                $lookup: {
                    from: "mediapicts2",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediaPict_data"
                }
            }, {
                $lookup: {
                    from: "mediadiaries2",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediadiaries_data"
                }
            }, {
                $lookup: {
                    from: "mediavideos2",
                    localField: "post_data.contentMedias.$id",
                    foreignField: "_id",
                    as: "mediavideos_data"
                }
            }, {
                $project: {
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$field._id",
                    noinvoice: "$field.noinvoice",
                    nova: "$field.nova",
                    expiredtimeva: "$field.expiredtimeva",
                    salelike: "$field.salelike",
                    saleview: "$field.saleview",
                    bank: "$field.bank",
                    totalamount: "$field.totalamount",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },
                    postdata: {
                        $arrayElemAt: [
                            "$post_data",
                            0
                        ]
                    },
                    mediapict: {
                        $arrayElemAt: [
                            "$mediaPict_data",
                            0
                        ]
                    },
                    mediadiaries: {
                        $arrayElemAt: [
                            "$mediadiaries_data",
                            0
                        ]
                    },
                    mediavideos: {
                        $arrayElemAt: [
                            "$mediavideos_data",
                            0
                        ]
                    }
                }
            }, {
                $project: {
                    contentMedias: "$postdata.contentMedias",
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    postID: "$postdata.postID",
                    postType: "$postdata.postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapict.mediaBasePath",
                    mediadiariPath: "$mediadiaries.mediaBasePath",
                    mediavideoPath: "$mediavideos.mediaBasePath"
                }
            }, {
                $project: {
                    refs: {
                        $arrayElemAt: [
                            "$contentMedias",
                            0
                        ]
                    },
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapictPath",
                    mediadiariPath: "$mediadiariPath",
                    mediavideoPath: "$mediavideoPath"
                }
            }, {
                $project: {
                    refs: "$refs.$ref",
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapictPath",
                    mediadiariPath: "$mediadiariPath",
                    mediavideoPath: "$mediavideoPath"
                }
            }, {
                $project: {
                    refs: "$refs",
                    iduser: "$iduser",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",
                    fullName: "$fullName",
                    email: "$email",
                    postID: "$postID",
                    postType: "$postType",
                    mediapict: "$mediapict",
                    mediadiaries: "$mediadiaries",
                    mediavideos: "$mediavideos",
                    mediapictPath: "$mediapictPath",
                    mediadiariPath: "$mediadiariPath",
                    mediavideoPath: "$mediavideoPath"
                }
            }, {
                $addFields: {
                    concatmediapict: "/pict",
                    "media_pict": {
                        $replaceOne: {
                            input: "$mediapict.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },
                    concatmediadiari: "/stream",
                    concatthumbdiari: "/thumb",
                    "media_diari": "$mediadiaries.mediaUri",
                    concatmediavideo: "/stream",
                    concatthumbvideo: "/thumb",
                    "media_video": "$mediavideos.mediaUri"
                }
            }, {
                $project: {

                    iduser: "$iduser",
                    fullName: "$fullName",
                    email: "$email",
                    debet: "$debet",
                    kredit: "$kredit",
                    type: "$type",
                    timestamp: "$timestamp",
                    description: "$description",
                    idTransaction: "$idTransaction",
                    noinvoice: "$noinvoice",
                    nova: "$nova",
                    expiredtimeva: "$expiredtimeva",
                    salelike: "$salelike",
                    saleview: "$saleview",
                    bank: "$bank",
                    totalamount: "$totalamount",

                    postID: "$postID",
                    postType: "$postType",
                    mediaBasePath: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.mediaBasePath"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaBasePath"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaBasePath"
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaUri: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.mediaUri"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaUri"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaUri"
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaType: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediapict.mediaType"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaType"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaType"
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaThumbEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaThumb"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatthumbdiari",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatthumbvideo",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaEndpoint: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatmediapict",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatmediadiari",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: {
                                        $concat: [
                                            "$concatmediavideo",
                                            "/",
                                            "$postID"
                                        ]
                                    }
                                }
                            ],
                            default: ""
                        }
                    },
                    mediaThumbUri: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediapicts"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaThumb"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediadiaries"
                                        ]
                                    },
                                    then: "$mediadiaries.mediaThumb"
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$refs",
                                            "mediavideos"
                                        ]
                                    },
                                    then: "$mediavideos.mediaThumb"
                                }
                            ],
                            default: ""
                        }
                    },
                }
            }, {
                $skip: skip
            }, {
                $limit: limit
            }
        ]);
        return query;
    }

    async findreward(iduser: ObjectId, startdate: string, enddate: string, skip: number, limit: number) {

        var pipeline = [];
        if (startdate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

        }
        if (enddate !== undefined) {
            pipeline.push({
                $match: {
                    timestamp: { "$lte": enddate }
                }
            });
        }
        pipeline.push({ $match: { iduser: iduser } });
        pipeline.push({ $match: { type: "rewards" } });
        if (skip > 0) {
            pipeline.push({
                "$skip": skip
            });
        }
        if (limit > 0) {
            pipeline.push({
                "$limit": limit
            });
        }
        pipeline.push({ $sort: { timestamp: -1 } });
        // console.log(pipeline);
        let query = await this.accountbalancesModel.aggregate(pipeline);
        return query;



    }
    async findrewardcount(iduser: ObjectId, startdate: string, enddate: string) {
        if (startdate !== undefined && enddate !== undefined) {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
            let query = await this.accountbalancesModel.aggregate([

                {
                    $match: {
                        iduser: iduser, type: "rewards", timestamp: { "$gte": startdate, "$lte": dateend }
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;

        } else {
            let query = await this.accountbalancesModel.aggregate([

                {
                    $match: {
                        iduser: iduser, type: "rewards"
                    }
                },
                { $sort: { timestamp: -1 }, },

            ]);
            return query;
        }


    }

    async detailrewards(id: ObjectId) {
        let query = await this.accountbalancesModel.aggregate([

            {
                $match: {
                    _id: id
                }
            },
            {
                "$lookup": {
                    "from": "ads",
                    "as": "adsdata",
                    "let": {
                        "localID": "$idtrans",

                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$_id",
                                        "$$localID"
                                    ]
                                }
                            }
                        },
                        {
                            "$lookup": {
                                "from": "adstypes",
                                "as": "typesdata",
                                "let": {
                                    "localID": "$typeAdsID"
                                },
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$eq": [
                                                    "$_id",
                                                    "$$localID"
                                                ]
                                            }
                                        }
                                    },

                                ],

                            }
                        }
                    ],

                }
            },
            {
                $unwind: {
                    path: "$adsdata",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    kredit: 1,
                    idtrans: 1,
                    adsId: '$adsdata._id',
                    skipTime: '$adsdata.skipTime',
                    type: '$adsdata.type',
                    idApsara: '$adsdata.idApsara',
                    duration: '$adsdata.duration',
                    description: '$adsdata.description',
                    timestamp: 1,
                    datatype: {
                        $arrayElemAt: ['$adsdata.typesdata', 0]
                    },
                    "mediaBasePath": '$adsdata.mediaBasePath',
                    "mediaUri": '$adsdata.mediaUri',
                    "mediaThumBasePath": '$adsdata.mediaThumBasePath',
                    "mediaThumUri": '$adsdata.mediaThumUri'
                }
            },
            {
                $project: {
                    adsId: 1,
                    kredit: 1,
                    idtrans: 1,
                    skipTime: 1,
                    type: 1,
                    idApsara: 1,
                    duration: 1,
                    description: 1,
                    timestamp: 1,
                    from: '$datatype.nameType',
                    status: "Recieved Successfully",
                    mediaBasePath: 1,
                    "mediaUri": 1,
                    "mediaThumBasePath": 1,
                    "mediaThumUri": 1
                }
            }


        ]);


        var dataquery = null;
        dataquery = query;
        var datanew = null;
        var data = [];
        let pict: String[] = [];
        var objk = {};
        var type = null;
        var idapsara = null;
        var apsara = null;
        var idapsaradefine = null;
        var apsaradefine = null;
        var skipTime = null;
        for (var i = 0; i < dataquery.length; i++) {
            try {
                idapsara = dataquery[i].idApsara;
            } catch (e) {
                idapsara = "";
            }

            try {
                skipTime = dataquery[i].skipTime;
            } catch (e) {
                skipTime = null;
            }

            if (skipTime == null && skipTime == undefined) {
                skipTime = 0;
            }

            if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
                idapsaradefine = "";
            } else {
                idapsaradefine = idapsara;
            }
            var type = dataquery[i].type;
            pict = [idapsara];

            if (idapsara === "") {

            } else {
                if (type === "Image") {

                    idapsaradefine = "konak";
                    datanew = {
                        "ImageInfo": [{
                            URL: dataquery[i].mediaThumUri
                        }]
                    }
                }
                else if (type === "Video") {
                    try {
                        datanew = await this.postContentService.getVideoApsara(pict);
                    } catch (e) {
                        datanew = [];
                    }

                }

                objk = {
                    "_id": dataquery[i]._id,
                    "kredit": dataquery[i].kredit,
                    "timestamp": dataquery[i].timestamp,
                    "type": dataquery[i].type,
                    "duration": dataquery[i].duration,
                    "description": dataquery[i].description,
                    "from": dataquery[i].from,
                    "status": dataquery[i].status,
                    "apsaraId": idapsaradefine,
                    "skipTime": skipTime,
                    "media": datanew

                };

                data.push(objk);
            }
        }


        return data;
    }

    async getIncomeByDate(startdate: string) {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(startdate).toISOString().split("T")[0];
        var input = new Date();
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];
        //kalo error, coba ganti jadi set dan jadi object
        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today
                    },
                    iduser: iddata
                }
            },
            {
                "$project":
                {
                    timestamp:
                    {
                        "$substr":
                            [
                                "$timestamp", 0, 10
                            ]
                    },
                    kredit: 1
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
                            "dateString": "$timestamp"
                        }
                    },
                    totalperhari:
                    {
                        "$sum": 1
                    },
                    totalpendapatanperhari:
                    {
                        "$sum": "$kredit"
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    totalperhari: 1,
                    totalpendapatanperhari: 1,
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
                        "$sum": "$totalpendapatanperhari"
                    },
                    totaldata:
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
                            totaldata: "$totalperhari",
                            totalpendapatanperhari: "$totalpendapatanperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }

    async getTotalPendapatan(start: string, end: string) {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(start).toISOString().split("T")[0];
        var input = new Date(end);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];

        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    iduser:
                    {
                        "$eq": iddata
                    },
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today,
                    },
                    "$or":
                        [
                            {
                                description:
                                {
                                    "$regex": "sell voucher",
                                    "$options": "i"
                                },
                            },
                            {
                                description:
                                {
                                    "$regex": "Admin Charge",
                                    "$options": "i"
                                },
                            },
                            {
                                description:
                                {
                                    "$regex": "sell boost",
                                    "$options": "i"
                                },
                            },
                        ]
                },
            },
            {
                "$group":
                {
                    _id: null,
                    total:
                    {
                        "$sum": "$kredit"
                    }
                }
            }
        ]);

        return query;
    }

    async getTotalPendapatanVoucher(start: string, end: string) {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(start).toISOString().split("T")[0];
        var input = new Date(end);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];

        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    iduser:
                    {
                        "$eq": iddata
                    },
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today,
                    },
                    description:
                    {
                        "$regex": "sell voucher",
                        "$options": "i"
                    },
                },
            },
            {
                "$project":
                {
                    createdAt:
                    {
                        "$substr":
                            [
                                "$timestamp", 0, 10
                            ]
                    },
                    kredit: 1
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
                    },
                    totalpendapatanperhari:
                    {
                        "$sum": "$kredit"
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    totalperhari: 1,
                    totalpendapatanperhari: 1,
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
                        "$sum": "$totalpendapatanperhari"
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
                            totaldata: "$totalperhari",
                            totalpendapatanperhari: "$totalpendapatanperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }

    async getTotalPendapatanJualBeli(start: string, end: string) {
        const mongoose = require('mongoose');
        var iddata = mongoose.Types.ObjectId("62144381602c354635ed786a");
        var before = new Date(start).toISOString().split("T")[0];
        var input = new Date(end);
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];

        var query = await this.accountbalancesModel.aggregate([
            {
                "$match":
                {
                    timestamp:
                    {
                        "$gte": before,
                        "$lte": today
                    },
                    iduser: iddata,
                    type: "sell"
                }
            },
            {
                "$project":
                {
                    createdAt:
                    {
                        "$substr":
                            [
                                "$timestamp", 0, 10
                            ]
                    },
                    kredit: 1
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
                    },
                    totalpendapatanperhari:
                    {
                        "$sum": "$kredit"
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    totalperhari: 1,
                    totalpendapatanperhari: 1,
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
                        "$sum": "$totalpendapatanperhari"
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
                            totaldata: "$totalperhari",
                            totalpendapatanperhari: "$totalpendapatanperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }
}
