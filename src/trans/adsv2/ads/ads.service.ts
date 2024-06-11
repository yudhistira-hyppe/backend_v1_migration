import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ads, AdsDocument } from './schema/ads.schema';
import mongoose, { Model, Types } from 'mongoose';
import { AdsDto } from './dto/ads.dto';
import { AdsBalaceCreditDto } from '../adsbalacecredit/dto/adsbalacecredit.dto';
import { AdsBalaceCreditService } from '../adsbalacecredit/adsbalacecredit.service';
import { AdsBalaceCredit } from '../adsbalacecredit/schema/adsbalacecredit.schema';
import { ConfigService } from '@nestjs/config';
import { PostContentService } from '../../../content/posts/postcontent.service';
import { AccountbalancesService } from '../../../trans/accountbalances/accountbalances.service';
import { UserAdsService } from '../../../trans/userads/userads.service';
import { OssContentPictService } from '../../../content/posts/osscontentpict.service';
import { UtilsService } from 'src/utils/utils.service';
import { TransactionsV2Service } from 'src/trans/transactionsv2/transactionsv2.service';

@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);
    constructor(
        @InjectModel(Ads.name, 'SERVER_FULL')
        private readonly adsModel: Model<AdsDocument>,
        private readonly configService: ConfigService,
        private readonly postContentService: PostContentService,
        private readonly adsBalaceCreditService: AdsBalaceCreditService,
        private readonly AccountbalancesService: AccountbalancesService,
        private readonly userAdsService: UserAdsService,
        private readonly utilsService: UtilsService,
        private readonly ossContentPictService: OssContentPictService,
        private readonly transactionsV2Service: TransactionsV2Service,
    ) { }

    async create(AdsDto_: AdsDto): Promise<Ads> {
        console.log(AdsDto_);
        const _AdsDto_ = await this.adsModel.create(AdsDto_);
        return _AdsDto_;
    }

    async update(_id: string, AdsDto_: AdsDto) {
        let data = await this.adsModel.findByIdAndUpdate(
            _id,
            AdsDto_,
            { new: true });
        return data;
    }

    async updateData(_id: string, AdsDto_: any) {
        let data = await this.adsModel.findByIdAndUpdate(
            _id,
            AdsDto_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<Ads> {
        return await this.adsModel.findOne({ _id: Object(id) }).exec();
    }

    async findOneActive(id: string): Promise<Ads> {
        return this.adsModel.findOne({ _id: id, isActive: true }).exec();
    }

    async count(): Promise<number> {
        const _AdsDto_ = await this.adsModel.find({ status: { $in: ["UNDER_REVIEW", "ACTIVE"] } }).exec();
        //const _AdsDto_ = await this.adsModel.countDocuments();
        return _AdsDto_.length;
    }

    async insertBalaceDebit(adsBalaceCreditDto: AdsBalaceCreditDto): Promise<AdsBalaceCredit> {
        const _AdsDto_ = await this.adsBalaceCreditService.create(adsBalaceCreditDto);
        return _AdsDto_;
    }

    async dashboard(start_date: any, end_date: any): Promise<any> {
        var paramaggregate = [];
        if (start_date != null && end_date != null) {
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date.setDate(end_date.getDate() + 1);
            const ObjectMatch = {
                $match: {
                    adsObjectivitasId: { $ne: null },
                    timestamp: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    },
                }
            };
            paramaggregate.push(ObjectMatch)
        } else {
            const ObjectMatch = {
                $match: {
                    adsObjectivitasId: { $ne: null },
                }
            };
            paramaggregate.push(ObjectMatch)
        }
        paramaggregate.push({
            $lookup: {
                from: "newUserBasics",
                localField: "userID",
                foreignField: "_id",
                as: "userbasics_data"
            }
        },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "adstypes_data"
                }
            },
            {
                $lookup: {
                    from: "adsobjectivitas",
                    localField: "adsObjectivitasId",
                    foreignField: "_id",
                    as: "adsobjectivitas_data"
                }
            },
            {
                $lookup: {
                    from: "adspricecredits",
                    localField: "idAdspricecredits",
                    foreignField: "_id",
                    as: "adspricecredits_data"
                }
            },
            {
                $project: {
                    _id: 1,
                    creditPrice: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adspricecredits_data", 0] },
                            },
                            "in": "$$tmp.creditPrice"
                        }
                    },
                    name: 1,
                    userID: 1,
                    status: 1,
                    fullName: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.fullName"
                        }
                    },
                    typeAdsID: 1,
                    nameType: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                            },
                            "in": "$$tmp.nameType"
                        }
                    },
                    adsObjectivitasId: 1,
                    name_id: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_id"
                        }
                    },
                    name_en: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_en"
                        }
                    },
                    tayangQualication: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $lt: ["$tayang", 50]
                                    },
                                    then: "<50"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$tayang", 50]
                                        }, {
                                            $lte: ["$tayang", 99]
                                        }]
                                    },
                                    then: "50 - 99"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$tayang", 100]
                                        }, {
                                            $lte: ["$tayang", 500]
                                        }]
                                    },
                                    then: "100 - 500"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gt: ["$tayang", 500]
                                        }]
                                    },
                                    then: ">500"
                                },
                            ],
                            "default": "Other"
                        }
                    },
                    credit: 1
                }
            },
            {
                $facet:
                {
                    user: [
                        {
                            $group: {
                                _id: "$userID",
                                email: { $first: '$email' },
                                fullName: { $first: '$fullName' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    iklan: [
                        {
                            $group: {
                                _id: "$_id",
                                name: { $first: '$name' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    typeAdsID: [
                        {
                            $match: {
                                status: "ACTIVE",
                            }
                        },
                        {
                            $group: {
                                _id: "$typeAdsID",
                                nameType: { $first: '$nameType' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    status: [
                        {
                            $group: {
                                _id: "$status",
                                status: { $first: '$status' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    adsObjectivitasId: [
                        {
                            $match: {
                                status: "ACTIVE",
                            }
                        },
                        {
                            $group: {
                                _id: "$adsObjectivitasId",
                                name_id: { $first: '$name_id' },
                                name_en: { $first: '$name_en' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    tayangQualication: [
                        {
                            $match: {
                                status: "ACTIVE",
                            }
                        },
                        {
                            $group: {
                                _id: "$tayangQualication",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalCredit: [
                        {
                            $group: {
                                _id: null,
                                sum_val: { $sum: "$credit" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    creditPrice: [
                        {
                            $group: {
                                _id: "$creditPrice",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                }
            },
            {
                $project: {
                    totalAds: { $size: "$iklan" },
                    totalAdvertisers: { $size: "$user" },
                    statusAds: "$status",
                    totalIncome: {
                        $multiply: [{
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$totalCredit", 0] },
                                },
                                "in": "$$tmp.sum_val"
                            }
                        }, {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$creditPrice", 0] },
                                },
                                "in": "$$tmp._id"
                            }
                        }]
                    },
                    adsType: "$typeAdsID",
                    totCredit: 1,
                    adsObjectivitas: "$adsObjectivitasId",
                    adsPlanShows: "$tayangQualication",
                }
            },
            {
                "$addFields": {
                    "adsType": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsType" }] },
                            "in": {
                                "_id": {
                                    "$arrayElemAt": ["$adsType._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsType.count", "$$this"]
                                },
                                "nameType": {
                                    "$arrayElemAt": ["$adsType.nameType", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsType.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsType.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "adsObjectivitas": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsObjectivitas" }] },
                            "in": {
                                "_id": {
                                    "$arrayElemAt": ["$adsObjectivitas._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                },
                                "name_id": {
                                    "$arrayElemAt": ["$adsObjectivitas.name_id", "$$this"]
                                },
                                "name_en": {
                                    "$arrayElemAt": ["$adsObjectivitas.name_en", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "adsPlanShows": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsPlanShows" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$adsPlanShows._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "statusAds": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$statusAds" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$statusAds._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$statusAds.count", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$statusAds.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$statusAds.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    }
                }
            },
        );
        console.log(paramaggregate)
        let query = await this.adsModel.aggregate(paramaggregate);
        return query;

    }

    async campaignDashboard(userId: string, start_date: any, end_date: any): Promise<any> {
        return await this.userAdsService.campaignDashboard(userId, start_date, end_date);
    }

    async dashboard2(start_date: any, end_date: any): Promise<any> {
        return await this.userAdsService.Dashboard(start_date, end_date);
    }

    async Dashboard(start_date: any, end_date: any) {
        var pipelineMatch = [];
        if (start_date != null && end_date != null) {
            var andExpr = [];
            andExpr.push({ $gte: ["$timestamp", start_date.toISOString()] });
            andExpr.push({ $lte: ["$timestamp", end_date.toISOString()] });
            pipelineMatch.push({
                $match:
                {
                    $expr: {
                        $and: andExpr
                    }
                },
            })
        }
        pipelineMatch.push(
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "adstypes_data"
                }
            },
            {
                $lookup: {
                    from: "adsobjectivitas",
                    localField: "adsObjectivitasId",
                    foreignField: "_id",
                    as: "adsobjectivitas_data"
                }
            },
            {
                $lookup: {
                    from: "adspricecredits",
                    localField: "idAdspricecredits",
                    foreignField: "_id",
                    as: "adspricecredits_data"
                }
            },
            {
                $project: {
                    _id: 1,
                    creditPrice: "$adspricecredits",
                    creditPrice_backup: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adspricecredits_data", 0] },
                            },
                            "in": "$$tmp.creditPrice"
                        }
                    },
                    name: 1,
                    userID: 1,
                    status: 1,
                    fullName: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userbasics_data", 0] },
                            },
                            "in": "$$tmp.fullName"
                        }
                    },
                    typeAdsID: 1,
                    nameType: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                            },
                            "in": "$$tmp.nameType"
                        }
                    },
                    adsObjectivitasId: 1,
                    name_id: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_id"
                        }
                    },
                    name_en: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_en"
                        }
                    },
                    tayangQualication: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $lt: ["$tayang", 50]
                                    },
                                    then: "<50"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$tayang", 50]
                                        }, {
                                            $lte: ["$tayang", 99]
                                        }]
                                    },
                                    then: "50 - 99"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gte: ["$tayang", 100]
                                        }, {
                                            $lte: ["$tayang", 500]
                                        }]
                                    },
                                    then: "100 - 500"
                                },
                                {
                                    case: {
                                        $and: [{
                                            $gt: ["$tayang", 500]
                                        }]
                                    },
                                    then: ">500"
                                },
                            ],
                            "default": "Other"
                        }
                    },
                    credit: 1
                }
            },
            {
                $facet:
                {
                    user: [
                        {
                            $group: {
                                _id: "$userID",
                                email: { $first: '$email' },
                                fullName: { $first: '$fullName' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    iklan: [
                        {
                            $group: {
                                _id: "$_id",
                                name: { $first: '$name' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    typeAdsID: [
                        {
                            $match: {
                                status: "ACTIVE",
                            }
                        },
                        {
                            $group: {
                                _id: "$typeAdsID",
                                nameType: { $first: '$nameType' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    status: [
                        {
                            $group: {
                                _id: "$status",
                                status: { $first: '$status' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    adsObjectivitasId: [
                        {
                            $match: {
                                status: "ACTIVE",
                            }
                        },
                        {
                            $group: {
                                _id: "$adsObjectivitasId",
                                name_id: { $first: '$name_id' },
                                name_en: { $first: '$name_en' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    tayangQualication: [
                        {
                            $match: {
                                status: "ACTIVE",
                            }
                        },
                        {
                            $group: {
                                _id: "$tayangQualication",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalCredit: [
                        {
                            $group: {
                                _id: null,
                                sum_val: { $sum: "$credit" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    creditPrice: [
                        {
                            $group: {
                                _id: "$creditPrice",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                }
            },
            {
                $project: {
                    totalAds: { $size: "$iklan" },
                    totalAdvertisers: { $size: "$user" },
                    statusAds: "$status",
                    creditPrice: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$creditPrice", 0] },
                            },
                            "in": "$$tmp._id"
                        }
                    },
                    totalIncome: {
                        $multiply: [{
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$totalCredit", 0] },
                                },
                                "in": "$$tmp.sum_val"
                            }
                        }, {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$creditPrice", 0] },
                                },
                                "in": "$$tmp._id"
                            }
                        }]
                    },
                    adsType: "$typeAdsID",
                    totCredit: 1,
                    adsObjectivitas: "$adsObjectivitasId",
                    adsPlanShows: "$tayangQualication",
                }
            },
            {
                "$addFields": {
                    "adsType": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsType" }] },
                            "in": {
                                "_id": {
                                    "$arrayElemAt": ["$adsType._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsType.count", "$$this"]
                                },
                                "nameType": {
                                    "$arrayElemAt": ["$adsType.nameType", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsType.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsType.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "adsObjectivitas": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsObjectivitas" }] },
                            "in": {
                                "_id": {
                                    "$arrayElemAt": ["$adsObjectivitas._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                },
                                "name_id": {
                                    "$arrayElemAt": ["$adsObjectivitas.name_id", "$$this"]
                                },
                                "name_en": {
                                    "$arrayElemAt": ["$adsObjectivitas.name_en", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsObjectivitas.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "adsPlanShows": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$adsPlanShows" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$adsPlanShows._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$adsPlanShows.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    },
                    "statusAds": {
                        "$map": {
                            "input": { "$range": [0, { "$size": "$statusAds" }] },
                            "in": {
                                "name": {
                                    "$arrayElemAt": ["$statusAds._id", "$$this"]
                                },
                                "count": {
                                    "$arrayElemAt": ["$statusAds.count", "$$this"]
                                },
                                "persentase": {
                                    "$multiply": [{
                                        "$divide": [{
                                            "$arrayElemAt": ["$statusAds.count", "$$this"]
                                        }, "$totalAds"]
                                    }, 100]
                                },
                                "persentaseText": {
                                    "$concat": [{
                                        "$toString": {
                                            "$multiply": [{
                                                "$divide": [{
                                                    "$arrayElemAt": ["$statusAds.count", "$$this"]
                                                }, "$totalAds"]
                                            }, 100]
                                        }
                                    }, "", "%"]
                                }
                            }
                        }
                    }
                }
            },
        );

        //------------FACET VIEWED------------
        var viewedFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        viewedFacet.push({
            $unwind:
            {
                path: "$updateAt",
                includeArrayIndex: 'updateAt_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            viewedFacet.push({
                $match: {
                    updateAt: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewedFacet.push({
            $group: {
                _id: "$userID",
                userIDCount: { "$sum": 1 }
            }
        },
            {
                $group: {
                    _id: null,
                    reach: { "$sum": 1 },
                    impresi: { "$sum": "$userIDCount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    reach: 1,
                    impresi: 1
                }
            });

        //------------FACET CTA COUNT------------
        var CTACountFacet = [];
        if (start_date != undefined && end_date != undefined) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        CTACountFacet.push({
            $unwind:
            {
                path: "$clickTime",
                includeArrayIndex: 'clickTime_index',
            }
        });
        if (start_date != undefined && end_date != undefined) {
            CTACountFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        CTACountFacet.push({
            $project: {
                clickTime: {
                    $substr:
                        [
                            "$clickTime", 0, 10
                        ]
                }
            }
        },
            {
                $group:
                {
                    _id: "$clickTime",
                    CTACount:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                $group:
                {
                    _id: null,
                    CTACount:
                    {
                        "$sum": "$CTACount"
                    }
                }
            });

        //------------FACET VIEWTIME------------
        var viewTimeFacet = [];
        if (start_date != undefined && end_date != undefined) {
            viewTimeFacet.push({
                $match: {
                    updateAt: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        viewTimeFacet.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$_id",
                                                "$$type_fk"
                                            ]
                                    }
                                },
                            },
                            {
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPV: 1,
                                    CPV_adstypes: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPV"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$updateAt",
                    includeArrayIndex: 'updateAt_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            viewTimeFacet.push({
                $match: {
                    updateAt: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        viewTimeFacet.push(
            {
                $project: {
                    CPV: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPV"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPV" }
                }
            });

        //------------FACET CLICKTIME------------
        var clickTimeFacet = [];
        if (start_date != undefined && end_date != undefined) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$_id",
                                                "$$type_fk"
                                            ]
                                    }
                                },
                            },
                            {
                                $lookup: {
                                    from: "adstypes",
                                    localField: "typeAdsID",
                                    foreignField: "_id",
                                    as: "adstypes_data"
                                }
                            },
                            {
                                $project:
                                {
                                    CPA: 1,
                                    CPA_adstypes: {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                            },
                                            "in": "$$tmp.CPA"
                                        }
                                    },
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            clickTimeFacet.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        clickTimeFacet.push(
            {
                $project: {
                    CPA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                            },
                            "in": "$$tmp.CPA"
                        }
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    row: { $sum: 1 },
                    count: { $sum: "$CPA" }
                }
            });

        //------------FACET CLICKTIME------------
        var priceTot = [];
        if (start_date != undefined && end_date != undefined) {
            priceTot.push({
                $match: {
                    clickTime: {
                        $elemMatch: {
                            $gte: start_date.toISOString(),
                            $lte: end_date.toISOString()
                        }
                    }
                }
            });
        }
        priceTot.push(
            {
                $lookup:
                {
                    from: "ads",
                    as: "adsTable",
                    let:
                    {
                        type_fk: "$adsID"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$_id",
                                                "$$type_fk"
                                            ]
                                    }
                                },
                            },
                            {
                                $project:
                                {
                                    adspricecredits: 1,
                                    CPA: 1,
                                    CPV: 1,
                                    totalClick: 1,
                                    totalView: 1,
                                }
                            }
                        ]
                }
            },
            {
                $unwind:
                {
                    path: "$clickTime",
                    includeArrayIndex: 'clickTime_index',
                }
            });
        if (start_date != undefined && end_date != undefined) {
            priceTot.push({
                $match: {
                    clickTime: {
                        $gte: start_date.toISOString(),
                        $lte: end_date.toISOString()
                    }
                }
            });
        }
        priceTot.push(
            {
                $project: {
                    total: {
                        $sum: [
                            {
                                $multiply: [
                                    {
                                        $multiply: [
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.CPV"
                                                }
                                            },
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.totalView"
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                            },
                                            "in": "$$tmp.adspricecredits"
                                        }
                                    }
                                ]
                            },
                            {
                                $multiply: [
                                    {
                                        $multiply: [
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.CPA"
                                                }
                                            },
                                            {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                                    },
                                                    "in": "$$tmp.totalClick"
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$adsTable", 0] },
                                            },
                                            "in": "$$tmp.adspricecredits"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: "$total" }
                }
            }
        );

        // //------------FACET CLICK PRICE COUNT------------
        // var priceClickFacet = [];
        // if (start_date != undefined && end_date != undefined) {
        //     priceClickFacet.push({
        //         $match: {
        //             clickTime: {
        //                 $elemMatch: {
        //                     $gte: start_date.toISOString(),
        //                     $lte: end_date.toISOString()
        //                 }
        //             }
        //         }
        //     });
        // }
        // priceClickFacet.push(
        //     {
        //         $lookup:
        //         {
        //             from: "ads",
        //             as: "adsTable",
        //             let:
        //             {
        //                 type_fk: "$adsID"
        //             },
        //             pipeline:
        //                 [
        //                     {
        //                         $match:
        //                         {
        //                             $expr:
        //                             {
        //                                 $eq:
        //                                     [
        //                                         "$_id",
        //                                         "$$type_fk"
        //                                     ]
        //                             }
        //                         },
        //                     },
        //                     {
        //                         $lookup: {
        //                             from: "adstypes",
        //                             localField: "typeAdsID",
        //                             foreignField: "_id",
        //                             as: "adstypes_data"
        //                         }
        //                     },
        //                     {
        //                         $project:
        //                         {
        //                             adspricecredits: 1,
        //                             CPA: 1,
        //                             CPA_adstypes: {
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.CPA"
        //                                 }
        //                             },
        //                         }
        //                     }
        //                 ]
        //         }
        //     },
        //     {
        //         $unwind:
        //         {
        //             path: "$clickTime",
        //             includeArrayIndex: 'clickTime_index',
        //         }
        //     });
        // if (start_date != undefined && end_date != undefined) {
        //     priceClickFacet.push({
        //         $match: {
        //             clickTime: {
        //                 $gte: start_date.toISOString(),
        //                 $lte: end_date.toISOString()
        //             }
        //         }
        //     });
        // }
        // priceClickFacet.push(
        //     {
        //         $project: {
        //             adspricecredits: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.adspricecredits"
        //                 }
        //             },
        //             CPA: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.CPA"
        //                 }
        //             },
        //             tot: {
        //                 $multiply: [
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.adspricecredits"
        //                         }
        //                     },
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.CPA"
        //                         }
        //                     }
        //                 ]
        //             },
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             count: { $sum: "$tot" }
        //         }
        //     }
        // );

        // //------------FACET VIEW PRICE COUNT------------
        // var priceViewFacet = [];
        // if (start_date != undefined && end_date != undefined) {
        //     priceViewFacet.push({
        //         $match: {
        //             updateAt: {
        //                 $elemMatch: {
        //                     $gte: start_date.toISOString(),
        //                     $lte: end_date.toISOString()
        //                 }
        //             }
        //         }
        //     });
        // }
        // priceViewFacet.push(
        //     {
        //         $lookup:
        //         {
        //             from: "ads",
        //             as: "adsTable",
        //             let:
        //             {
        //                 type_fk: "$adsID"
        //             },
        //             pipeline:
        //                 [
        //                     {
        //                         $match:
        //                         {
        //                             $expr:
        //                             {
        //                                 $eq:
        //                                     [
        //                                         "$_id",
        //                                         "$$type_fk"
        //                                     ]
        //                             }
        //                         },
        //                     },
        //                     {
        //                         $lookup: {
        //                             from: "adstypes",
        //                             localField: "typeAdsID",
        //                             foreignField: "_id",
        //                             as: "adstypes_data"
        //                         }
        //                     },
        //                     {
        //                         $project:
        //                         {
        //                             adspricecredits: 1,
        //                             CPV: 1,
        //                             CPV_adstypes: {
        //                                 "$let": {
        //                                     "vars": {
        //                                         "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
        //                                     },
        //                                     "in": "$$tmp.CPV"
        //                                 }
        //                             },
        //                         }
        //                     }
        //                 ]
        //         }
        //     },
        //     {
        //         $unwind:
        //         {
        //             path: "$updateAt",
        //             includeArrayIndex: 'updateAt_index',
        //         }
        //     });
        // if (start_date != undefined && end_date != undefined) {
        //     priceViewFacet.push({
        //         $match: {
        //             updateAt: {
        //                 $gte: start_date.toISOString(),
        //                 $lte: end_date.toISOString()
        //             }
        //         }
        //     });
        // }
        // priceViewFacet.push(
        //     {
        //         $project: {
        //             adspricecredits: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.adspricecredits"
        //                 }
        //             },
        //             CPV: {
        //                 "$let": {
        //                     "vars": {
        //                         "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                     },
        //                     "in": "$$tmp.CPV"
        //                 }
        //             },
        //             tot: {
        //                 $multiply: [
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.adspricecredits"
        //                         }
        //                     },
        //                     {
        //                         "$let": {
        //                             "vars": {
        //                                 "tmp": { "$arrayElemAt": ["$adsTable", 0] },
        //                             },
        //                             "in": "$$tmp.CPV"
        //                         }
        //                     }
        //                 ]
        //             },
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             count: { $sum: "$tot" }
        //         }
        //     }
        //     );

        var aggregateData = [];
        aggregateData.push(
            {
                $addFields: {
                    dateStart: start_date,
                    dateEnd: end_date
                }
            },
            {
                $match:
                {
                    adsObjectivitasId: { $ne: null }
                },
            },
            {
                $lookup:
                {
                    from: "ads",
                    as: "ads_data",
                    pipeline: pipelineMatch
                }
            },);

        aggregateData.push(
            {
                $facet:
                {
                    viewed: viewedFacet,
                    CTACount: CTACountFacet,
                    viewTime: viewTimeFacet,
                    clickTime: clickTimeFacet,
                    priceTot: priceTot,
                    // priceViewFacet: priceViewFacet,
                    // priceClickFacet: priceClickFacet,
                    ads: [
                        {
                            $group: {
                                _id: "$ads_data",
                                count: { $sum: 1 }
                            }
                        },
                    ],
                }
            },
            {
                $project: {
                    saldoKredit: {
                        $sum: [
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$viewTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            },
                            {
                                $convert: {
                                    input: { "$arrayElemAt": ['$clickTime.count', 0] },
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        ]
                    },
                    Totalimpresi: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$viewed", 0] },
                            },
                            "in": "$$tmp.impresi"
                        }
                    },
                    TotalCTA: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$CTACount", 0] },
                            },
                            "in": "$$tmp.CTACount"
                        }
                    },
                    CTA: 1,
                    totalAds: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.totalAds"
                        }
                    },
                    totalAdvertisers: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.totalAdvertisers"
                        }
                    },
                    statusAds: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.statusAds"
                        }
                    },
                    creditPrice: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.creditPrice"
                        }
                    },
                    adsType: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.adsType"
                        }
                    },
                    adsObjectivitas: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.adsObjectivitas"
                        }
                    },
                    adsPlanShows: {
                        $let: {
                            "vars": {
                                ads: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$ads", 0] },
                                            },
                                            "in": "$$tmp._id"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$ads.adsPlanShows"
                        }
                    },
                    // totalIncome: {
                    //     $multiply: [{
                    //         $sum: [
                    //             {
                    //                 $convert: {
                    //                     input: { "$arrayElemAt": ['$viewTime.count', 0] },
                    //                     to: "int",
                    //                     onError: 0,
                    //                     onNull: 0
                    //                 }
                    //             },
                    //             {
                    //                 $convert: {
                    //                     input: { "$arrayElemAt": ['$clickTime.count', 0] },
                    //                     to: "int",
                    //                     onError: 0,
                    //                     onNull: 0
                    //                 }
                    //             }
                    //         ]
                    //     }, 
                    //     {
                    //         "$let": {
                    //             "vars": {
                    //                 ads: {
                    //                     "$arrayElemAt": [{
                    //                         "$let": {
                    //                             "vars": {
                    //                                 "tmp": { "$arrayElemAt": ["$ads", 0] },
                    //                             },
                    //                             "in": "$$tmp._id"
                    //                         }
                    //                     }, 0]
                    //                 }
                    //             },
                    //             "in": "$$ads.creditPrice"
                    //         }
                    //     },]
                    // },
                    // totalIncome:{
                    //     $sum: [
                    //         {
                    //             $convert: {
                    //                 input: { "$arrayElemAt": ['$priceViewFacet.count', 0] },
                    //                 to: "int",
                    //                 onError: 0,
                    //                 onNull: 0
                    //             }
                    //         },
                    //         {
                    //             $convert: {
                    //                 input: { "$arrayElemAt": ['$priceClickFacet.count', 0] },
                    //                 to: "int",
                    //                 onError: 0,
                    //                 onNull: 0
                    //             }
                    //         }
                    //     ]
                    // }
                    // priceViewFacet: 1,
                    // priceClickFacet:1
                    totalIncome: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$priceTot", 0] },
                            },
                            "in": "$$tmp.count"
                        }
                    },
                }
            }
        );

        console.log(JSON.stringify(aggregateData));
        let query = await this.adsModel.aggregate(aggregateData);
        return query;
    }

    async campaignDetail(adsId: string): Promise<any> {
        const query = await this.adsModel.aggregate([
            {
                $match:
                {
                    _id: new mongoose.Types.ObjectId(adsId)
                },
            },
            {
                $lookup: {
                    from: "adstypes",
                    localField: "typeAdsID",
                    foreignField: "_id",
                    as: "adstypes_data"
                }
            },
            {
                $lookup: {
                    from: "adsobjectivitas",
                    localField: "adsObjectivitasId",
                    foreignField: "_id",
                    as: "adsobjectivitas_data"
                }
            },
            {
                $project: {
                    _id: 1,
                    campaignId: 1,
                    name: 1,
                    description: 1,
                    typeAdsID: 1,
                    typeAdsIDName: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                            },
                            "in": "$$tmp.nameType"
                        }
                    },
                    liveAt: 1,
                    liveEnd: 1,
                    urlLink: 1,
                    tayang: 1,
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'DRAFT'] },
                                    then: 'DRAFT',
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                    then: 'IN_ACTIVE',
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                    then: 'ACTIVE',
                                },
                                {
                                    case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                    then: 'UNDER_REVIEW',
                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    remark: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'DRAFT'] },
                                    then: "Kredit tidak mencukupi",
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                    then: {
                                        $ifNull:
                                            [
                                                "$remark",
                                                "Iklan sudah selesai"
                                            ]
                                        // $cond:
                                        // {
                                        //     if:
                                        //     {
                                        //         "$eq": ["$description", 'ADS REJECTED']
                                        //     },
                                        //     then: 'Iklan ditolak, kredit dikembalikan ke saldo Anda',
                                        //     else: 'Iklan sudah selesai'
                                        // }
                                    },
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                    then: {
                                        $cond:
                                        {
                                            if: {
                                                $lte: [{
                                                    $toDate: "$liveAt"
                                                }, new Date()]
                                            },
                                            then: 'Iklan sedang tayang',
                                            else: 'Sedang menunggu penayangan'
                                        }
                                    },
                                },
                                {
                                    case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                    then: 'Sedang ditinjau oleh Hyppe',
                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    dayAds: 1,
                    credit: 1,
                    audiensFrekuensi: 1,
                    objectivitasId: 1,
                    objectivitasIdNameId: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_id"
                        }
                    },
                    objectivitasIdNameEn: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                            },
                            "in": "$$tmp.name_en"
                        }
                    },
                    idApsara: 1,
                    idApsaraPortrait: 1,
                    idApsaraLandscape: 1,
                    adsIdNumber: 1,
                    mediaUri: 1,
                    mediaPortraitUri: 1,
                    mediaLandscapeUri: 1
                }
            }
        ]);
        return query;
    }

    async campaignDetailSummary(adsId: string, start_date: any, end_date: any): Promise<any> {
        return await this.userAdsService.campaignDetailSummary(adsId, start_date, end_date);
    }

    // async campaignDetailAll_(adsId: string, start_date: any, end_date: any): Promise<any> {
    //     return await this.userAdsService.campaignDetail(adsId,start_date, end_date);
    // }

    async campaignDetailAll(adsId: string, start_date: any, end_date: any): Promise<any> {
        var query = await this.adsModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(adsId)
                }
            },
            {
                "$lookup": {
                    "from": "adstypes",
                    "localField": "typeAdsID",
                    "foreignField": "_id",
                    "as": "adstypes_data"
                }
            },
            {
                "$lookup": {
                    "from": "adsobjectivitas",
                    "localField": "adsObjectivitasId",
                    "foreignField": "_id",
                    "as": "adsobjectivitas_data"
                }
            },
            {
                $lookup:
                {
                    from: "userads",
                    as: "userads",
                    let:
                    {
                        type_fk: "$_id"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$adsID",
                                                "$$type_fk"
                                            ]
                                    }
                                },
                            },
                            {
                                "$facet": {
                                    "viewed": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "userIDCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "reach": {
                                                "$sum": 1
                                            },
                                            "impresi": {
                                                "$sum": "$userIDCount"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 0,
                                            "reach": 1,
                                            "impresi": 1
                                        }
                                    }],
                                    "reach": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "userID": 1,
                                            "viewTime": {
                                                "$substr": ["$updateAt", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": {
                                                "viewTime": "$viewTime",
                                                "userID": "$userID"
                                            },
                                            "userIDCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$_id.viewTime",
                                            "viewTime": {
                                                "$push": {
                                                    "userID": "$_id.userID",
                                                    "count": "$userIDCount"
                                                }
                                            },
                                            "count": {
                                                "$sum": "$userIDCount"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": "$_id",
                                            "reachView": {
                                                "$size": "$viewTime"
                                            }
                                        }
                                    }],
                                    "impresi": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "viewTime": {
                                                "$substr": ["$updateAt", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$viewTime",
                                            "impresiView": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "CTA": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "clickTime": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$clickTime",
                                            "includeArrayIndex": "clickTime_index"
                                        }
                                    }, {
                                        "$match": {
                                            "clickTime": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "clickTime": {
                                                "$substr": ["$clickTime", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$clickTime",
                                            "CTACount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "CTACount": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "clickTime": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$clickTime",
                                            "includeArrayIndex": "clickTime_index"
                                        }
                                    }, {
                                        "$match": {
                                            "clickTime": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "clickTime": {
                                                "$substr": ["$clickTime", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$clickTime",
                                            "CTACount": {
                                                "$sum": 1
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "CTACount": {
                                                "$sum": "$CTACount"
                                            }
                                        }
                                    }],
                                    "viewTime": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "ads",
                                            "as": "adsTable",
                                            "let": {
                                                "type_fk": "$adsID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$type_fk"]
                                                    }
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "adstypes",
                                                    "localField": "typeAdsID",
                                                    "foreignField": "_id",
                                                    "as": "adstypes_data"
                                                }
                                            }, {
                                                "$project": {
                                                    "CPV": 1,
                                                    "CPV_adstypes": {
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": {
                                                                    "$arrayElemAt": ["$adstypes_data", 0]
                                                                }
                                                            },
                                                            "in": "$$tmp.CPV"
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "CPV": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$adsTable", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.CPV"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "row": {
                                                "$sum": 1
                                            },
                                            "count": {
                                                "$sum": "$CPV"
                                            }
                                        }
                                    }],
                                    "clickTime": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "clickTime": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "ads",
                                            "as": "adsTable",
                                            "let": {
                                                "type_fk": "$adsID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$type_fk"]
                                                    }
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "adstypes",
                                                    "localField": "typeAdsID",
                                                    "foreignField": "_id",
                                                    "as": "adstypes_data"
                                                }
                                            }, {
                                                "$project": {
                                                    "CPA": 1,
                                                    "CPA_adstypes": {
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": {
                                                                    "$arrayElemAt": ["$adstypes_data", 0]
                                                                }
                                                            },
                                                            "in": "$$tmp.CPA"
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$clickTime",
                                            "includeArrayIndex": "clickTime_index"
                                        }
                                    }, {
                                        "$match": {
                                            "clickTime": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "CPA": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$adsTable", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.CPA"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "row": {
                                                "$sum": 1
                                            },
                                            "count": {
                                                "$sum": "$CPA"
                                            }
                                        }
                                    }],
                                    "userAdsAge": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$ageQualication",
                                            "ageCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAdsGender": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$gender",
                                            "genderCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAdsArea": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$areas",
                                            "areasCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAdsInterest": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$unwind": "$interest"
                                    }, {
                                        "$group": {
                                            "_id": "$interest",
                                            "interestCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAds": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "adsViewCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }]
                                }
                            },
                            {
                                "$project": {
                                    "adsDetail": {
                                        "$arrayElemAt": ["$adsDetail", 0]
                                    },
                                    "summary": {
                                        "Totalimpresi": {
                                            "$let": {
                                                "vars": {
                                                    "tmp": {
                                                        "$arrayElemAt": ["$viewed", 0]
                                                    }
                                                },
                                                "in": "$$tmp.impresi"
                                            }
                                        },
                                        "Totalreach": {
                                            "$let": {
                                                "vars": {
                                                    "tmp": {
                                                        "$arrayElemAt": ["$viewed", 0]
                                                    }
                                                },
                                                "in": "$$tmp.reach"
                                            }
                                        },
                                        "TotalCTA": {
                                            "$let": {
                                                "vars": {
                                                    "tmp": {
                                                        "$arrayElemAt": ["$CTACount", 0]
                                                    }
                                                },
                                                "in": "$$tmp.CTACount"
                                            }
                                        },
                                        "CTR": {
                                            "$concat": [{
                                                "$toString": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$CTACount", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.CTACount"
                                                            }
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$viewed", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.impresi"
                                                            }
                                                        }]
                                                    }, 100]
                                                }
                                            }, "", "%"]
                                        },
                                        "impresi": "$impresi",
                                        "reach": "$reach",
                                        "CTA": "$CTA"
                                    },
                                    "saldoKredit": {
                                        "$sum": [{
                                            "$convert": {
                                                "input": {
                                                    "$arrayElemAt": ["$viewTime.count", 0]
                                                },
                                                "to": "int",
                                                "onError": 0,
                                                "onNull": 0
                                            }
                                        }, {
                                            "$convert": {
                                                "input": {
                                                    "$arrayElemAt": ["$clickTime.count", 0]
                                                },
                                                "to": "int",
                                                "onError": 0,
                                                "onNull": 0
                                            }
                                        }]
                                    },
                                    "userAds": {
                                        "$let": {
                                            "vars": {
                                                "tmp": {
                                                    "$arrayElemAt": ["$userAds", 0]
                                                }
                                            },
                                            "in": "$$tmp.adsViewCount"
                                        }
                                    },
                                    "userAdsAge": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsAge"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    "$arrayElemAt": ["$userAdsAge._id", "$$this"]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    },
                                    "userAdsGender": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsGender"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    $ifNull: [
                                                        { "$arrayElemAt": ["$userAdsGender._id", "$$this"] },
                                                        "Lainnya"
                                                    ]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    },
                                    "userAdsArea": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsArea"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    $ifNull: [
                                                        { "$arrayElemAt": ["$userAdsArea._id", "$$this"] },
                                                        "Lainnya"
                                                    ]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    },
                                    "userAdsInterest": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsInterest"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    "$arrayElemAt": ["$userAdsInterest._id", "$$this"]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                }
            },
            {
                $project: {
                    _id: 0,
                    adsDetail: {
                        _id: "$_id",
                        name: "$name",
                        campaignId: "$campaignId",
                        description: "$description",
                        typeAdsID: "$typeAdsID",
                        typeAdsIDName: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                },
                                "in": "$$tmp.nameType"
                            }
                        },
                        liveAt: "$liveAt",
                        liveEnd: "$liveEnd",
                        urlLink: "$liveAt",
                        tayang: "$tayang",
                        status: {
                            $switch: {
                                branches: [
                                    {
                                        case: { $eq: ['$status', 'DRAFT'] },
                                        then: 'DRAFT',
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                        then: 'IN_ACTIVE',
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                        then: 'ACTIVE',
                                    },
                                    {
                                        case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                        then: 'UNDER_REVIEW',
                                    },

                                ],
                                default: "OTHER",

                            },

                        },
                        remark: {
                            $switch: {
                                branches: [
                                    {
                                        case: { $eq: ['$status', 'DRAFT'] },
                                        then: "Kredit tidak mencukupi",
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                        then: {
                                            $ifNull:
                                                [
                                                    "$remark",
                                                    "Iklan sudah selesai"
                                                ]
                                            // $cond:
                                            // {
                                            //     if:
                                            //     {
                                            //         "$eq": ["$description", 'ADS REJECTED']
                                            //     },
                                            //     then: 'Iklan ditolak, kredit dikembalikan ke saldo Anda',
                                            //     else: 'Iklan sudah selesai'
                                            // }
                                        },
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                        then: {
                                            $cond:
                                            {
                                                if: {
                                                    $lte: [{
                                                        $toDate: "$liveAt"
                                                    }, "$date_now"]
                                                },
                                                then: 'Iklan sedang tayang',
                                                else: 'Sedang menunggu penayangan'
                                            }
                                        },
                                    },
                                    {
                                        case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                        then: 'Sedang ditinjau oleh Hyppe',
                                    },

                                ],
                                default: "OTHER",

                            },

                        },
                        dayAds: "$dayAds",
                        credit: "$credit",
                        audiensFrekuensi: "$audiensFrekuensi",
                        adsObjectivitasId: "$adsObjectivitasId",
                        objectivitasIdNameId: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                                },
                                "in": "$$tmp.name_id"
                            }
                        },
                        objectivitasIdNameEn: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                                },
                                "in": "$$tmp.name_en"
                            }
                        },
                        idApsara: "$idApsara",
                    },
                    summary: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.summary"
                        }
                    },
                    saldoKredit: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.saldoKredit"
                        }
                    },
                    userAdsAge: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsAge"
                        }
                    },
                    userAdsGender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsGender"
                        }
                    },
                    userAdsArea: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsArea"
                        }
                    },
                    userAdsInterest: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsInterest"
                        }
                    }
                }
            }
        ]);
        return query;
    }

    async campaignDetailAll2(adsId: string, start_date: any, end_date: any): Promise<any> {
        var query = await this.adsModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(adsId)
                }
            },
            {
                "$lookup": {
                    "from": "adstypes",
                    "localField": "typeAdsID",
                    "foreignField": "_id",
                    "as": "adstypes_data"
                }
            },
            {
                "$lookup": {
                    "from": "adsobjectivitas",
                    "localField": "adsObjectivitasId",
                    "foreignField": "_id",
                    "as": "adsobjectivitas_data"
                }
            },
            {
                $lookup:
                {
                    from: "userads",
                    as: "userads",
                    let:
                    {
                        type_fk: "$_id"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$adsID",
                                                "$$type_fk"
                                            ]
                                    }
                                },
                            },
                            {
                                "$facet": {
                                    "viewed": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "userIDCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "reach": {
                                                "$sum": 1
                                            },
                                            "impresi": {
                                                "$sum": "$userIDCount"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 0,
                                            "reach": 1,
                                            "impresi": 1
                                        }
                                    }],
                                    "reach": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "userID": 1,
                                            "viewTime": {
                                                "$substr": ["$updateAt", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": {
                                                "viewTime": "$viewTime",
                                                "userID": "$userID"
                                            },
                                            "userIDCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$_id.viewTime",
                                            "viewTime": {
                                                "$push": {
                                                    "userID": "$_id.userID",
                                                    "count": "$userIDCount"
                                                }
                                            },
                                            "count": {
                                                "$sum": "$userIDCount"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": "$_id",
                                            "reachView": {
                                                "$size": "$viewTime"
                                            }
                                        }
                                    }],
                                    "impresi": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "viewTime": {
                                                "$substr": ["$updateAt", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$viewTime",
                                            "impresiView": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "CTA": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "clickTime": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$clickTime",
                                            "includeArrayIndex": "clickTime_index"
                                        }
                                    }, {
                                        "$match": {
                                            "clickTime": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "clickTime": {
                                                "$substr": ["$clickTime", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$clickTime",
                                            "CTACount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "CTACount": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "clickTime": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$clickTime",
                                            "includeArrayIndex": "clickTime_index"
                                        }
                                    }, {
                                        "$match": {
                                            "clickTime": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "clickTime": {
                                                "$substr": ["$clickTime", 0, 10]
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$clickTime",
                                            "CTACount": {
                                                "$sum": 1
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "CTACount": {
                                                "$sum": "$CTACount"
                                            }
                                        }
                                    }],
                                    "viewTime": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "ads",
                                            "as": "adsTable",
                                            "let": {
                                                "type_fk": "$adsID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$type_fk"]
                                                    }
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "adstypes",
                                                    "localField": "typeAdsID",
                                                    "foreignField": "_id",
                                                    "as": "adstypes_data"
                                                }
                                            }, {
                                                "$project": {
                                                    "CPV": 1,
                                                    "CPV_adstypes": {
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": {
                                                                    "$arrayElemAt": ["$adstypes_data", 0]
                                                                }
                                                            },
                                                            "in": "$$tmp.CPV"
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "CPV": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$adsTable", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.CPV"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "row": {
                                                "$sum": 1
                                            },
                                            "count": {
                                                "$sum": "$CPV"
                                            }
                                        }
                                    }],
                                    "clickTime": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "clickTime": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "ads",
                                            "as": "adsTable",
                                            "let": {
                                                "type_fk": "$adsID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$type_fk"]
                                                    }
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "adstypes",
                                                    "localField": "typeAdsID",
                                                    "foreignField": "_id",
                                                    "as": "adstypes_data"
                                                }
                                            }, {
                                                "$project": {
                                                    "CPA": 1,
                                                    "CPA_adstypes": {
                                                        "$let": {
                                                            "vars": {
                                                                "tmp": {
                                                                    "$arrayElemAt": ["$adstypes_data", 0]
                                                                }
                                                            },
                                                            "in": "$$tmp.CPA"
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$clickTime",
                                            "includeArrayIndex": "clickTime_index"
                                        }
                                    }, {
                                        "$match": {
                                            "clickTime": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "CPA": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$adsTable", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.CPA"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "row": {
                                                "$sum": 1
                                            },
                                            "count": {
                                                "$sum": "$CPA"
                                            }
                                        }
                                    }],
                                    "userAdsAge": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$ageQualication",
                                            "ageCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAdsGender": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$gender",
                                            "genderCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAdsArea": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$areas",
                                            "areasCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAdsInterest": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$unwind": "$interest"
                                    }, {
                                        "$group": {
                                            "_id": "$interest",
                                            "interestCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }],
                                    "userAds": [{
                                        "$match": {
                                            "$and": [{
                                                "adsID": new mongoose.Types.ObjectId(adsId)
                                            }, {
                                                "updateAt": {
                                                    "$elemMatch": {
                                                        $gte: await this.utilsService.formatDateString(start_date),
                                                        $lte: await this.utilsService.formatDateString(end_date)
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        "$lookup": {
                                            "from": "newUserBasics",
                                            "as": "userbasics_data",
                                            "let": {
                                                "local_id": "$userID"
                                            },
                                            "pipeline": [{
                                                "$match": {
                                                    "$expr": {
                                                        "$eq": ["$_id", "$$local_id"]
                                                    }
                                                }
                                            }, {
                                                "$project": {
                                                    "_id": 1,
                                                    "email": 1,
                                                    "fullName": 1,
                                                    "gender": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", "Male"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Laki-laki"]
                                                                    }, {
                                                                        "$eq": ["$gender", "MALE"]
                                                                    }]
                                                                },
                                                                "then": "Laki-laki"
                                                            }, {
                                                                "case": {
                                                                    "$or": [{
                                                                        "$eq": ["$gender", " Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "Perempuan"]
                                                                    }, {
                                                                        "$eq": ["$gender", "PEREMPUAN"]
                                                                    }, {
                                                                        "$eq": ["$gender", "FEMALE"]
                                                                    }, {
                                                                        "$eq": ["$gender", " FEMALE"]
                                                                    }]
                                                                },
                                                                "then": "Perempuan"
                                                            }],
                                                            "default": "Lainnya"
                                                        }
                                                    },
                                                    "age": {
                                                        "$cond": {
                                                            "if": {
                                                                "$and": ["$dob", {
                                                                    "$ne": ["$dob", ""]
                                                                }]
                                                            },
                                                            "then": {
                                                                "$toInt": {
                                                                    "$divide": [{
                                                                        "$subtract": [new Date(), {
                                                                            "$toDate": "$dob"
                                                                        }]
                                                                    }, 31536000000]
                                                                }
                                                            },
                                                            "else": 0
                                                        }
                                                    },
                                                    "ageQualication": {
                                                        "$switch": {
                                                            "branches": [{
                                                                "case": {
                                                                    "$lt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 14]
                                                                },
                                                                "then": "< 14 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 14]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 28]
                                                                    }]
                                                                },
                                                                "then": "14 - 28 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$and": [{
                                                                        "$gte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 29]
                                                                    }, {
                                                                        "$lte": [{
                                                                            "$cond": {
                                                                                "if": {
                                                                                    "$and": ["$dob", {
                                                                                        "$ne": ["$dob", ""]
                                                                                    }]
                                                                                },
                                                                                "then": {
                                                                                    "$toInt": {
                                                                                        "$divide": [{
                                                                                            "$subtract": [new Date(), {
                                                                                                "$toDate": "$dob"
                                                                                            }]
                                                                                        }, 31536000000]
                                                                                    }
                                                                                },
                                                                                "else": 0
                                                                            }
                                                                        }, 43]
                                                                    }]
                                                                },
                                                                "then": "29 - 43 Tahun"
                                                            }, {
                                                                "case": {
                                                                    "$gt": [{
                                                                        "$cond": {
                                                                            "if": {
                                                                                "$and": ["$dob", {
                                                                                    "$ne": ["$dob", ""]
                                                                                }]
                                                                            },
                                                                            "then": {
                                                                                "$toInt": {
                                                                                    "$divide": [{
                                                                                        "$subtract": [new Date(), {
                                                                                            "$toDate": "$dob"
                                                                                        }]
                                                                                    }, 31536000000]
                                                                                }
                                                                            },
                                                                            "else": 0
                                                                        }
                                                                    }, 43]
                                                                },
                                                                "then": "> 43 Tahun"
                                                            }],
                                                            "default": "Other"
                                                        }
                                                    },
                                                    "userInterests_array": {
                                                        "$map": {
                                                            "input": {
                                                                "$map": {
                                                                    "input": "$userInterests",
                                                                    "in": {
                                                                        "$arrayElemAt": [{
                                                                            "$objectToArray": "$$this"
                                                                        }, 1]
                                                                    }
                                                                }
                                                            },
                                                            "in": "$$this.v"
                                                        }
                                                    },
                                                    "states": 1
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "interests_repo",
                                                    "localField": "userInterests_array",
                                                    "foreignField": "_id",
                                                    "as": "interests"
                                                }
                                            }, {
                                                "$lookup": {
                                                    "from": "areas",
                                                    "as": "areas",
                                                    "let": {
                                                        "local_id": "$states.$id"
                                                    },
                                                    "pipeline": [{
                                                        "$match": {
                                                            "$expr": {
                                                                "$eq": ["$_id", "$$local_id"]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }, {
                                        "$unwind": {
                                            "path": "$updateAt",
                                            "includeArrayIndex": "updateAt_index"
                                        }
                                    }, {
                                        "$match": {
                                            "updateAt": {
                                                $gte: await this.utilsService.formatDateString(start_date),
                                                $lte: await this.utilsService.formatDateString(end_date)
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": "$userID",
                                            "user": {
                                                "$first": "$$ROOT"
                                            }
                                        }
                                    }, {
                                        "$project": {
                                            "_id": 1,
                                            "gender": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.gender"
                                                }
                                            },
                                            "ageQualication": {
                                                "$let": {
                                                    "vars": {
                                                        "tmp": {
                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                        }
                                                    },
                                                    "in": "$$tmp.ageQualication"
                                                }
                                            },
                                            "interest": {
                                                "$map": {
                                                    "input": {
                                                        "$map": {
                                                            "input": {
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.interests"
                                                                }
                                                            },
                                                            "in": {
                                                                "$arrayElemAt": [{
                                                                    "$objectToArray": "$$this"
                                                                }, 1]
                                                            }
                                                        }
                                                    },
                                                    "in": "$$this.v"
                                                }
                                            },
                                            "areas": {
                                                "$let": {
                                                    "vars": {
                                                        "temp": {
                                                            "$arrayElemAt": [{
                                                                "$let": {
                                                                    "vars": {
                                                                        "tmp": {
                                                                            "$arrayElemAt": ["$user.userbasics_data", 0]
                                                                        }
                                                                    },
                                                                    "in": "$$tmp.areas"
                                                                }
                                                            }, 0]
                                                        }
                                                    },
                                                    "in": "$$temp.stateName"
                                                }
                                            }
                                        }
                                    }, {
                                        "$group": {
                                            "_id": null,
                                            "adsViewCount": {
                                                "$sum": 1
                                            }
                                        }
                                    }]
                                }
                            },
                            {
                                "$project": {
                                    "adsDetail": {
                                        "$arrayElemAt": ["$adsDetail", 0]
                                    },
                                    "summary": {
                                        "Totalimpresi": {
                                            "$let": {
                                                "vars": {
                                                    "tmp": {
                                                        "$arrayElemAt": ["$viewed", 0]
                                                    }
                                                },
                                                "in": "$$tmp.impresi"
                                            }
                                        },
                                        "Totalreach": {
                                            "$let": {
                                                "vars": {
                                                    "tmp": {
                                                        "$arrayElemAt": ["$viewed", 0]
                                                    }
                                                },
                                                "in": "$$tmp.reach"
                                            }
                                        },
                                        "TotalCTA": {
                                            "$let": {
                                                "vars": {
                                                    "tmp": {
                                                        "$arrayElemAt": ["$CTACount", 0]
                                                    }
                                                },
                                                "in": "$$tmp.CTACount"
                                            }
                                        },
                                        "CTR": {
                                            "$concat": [{
                                                "$toString": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$CTACount", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.CTACount"
                                                            }
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$viewed", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.impresi"
                                                            }
                                                        }]
                                                    }, 100]
                                                }
                                            }, "", "%"]
                                        },
                                        "impresi": "$impresi",
                                        "reach": "$reach",
                                        "CTA": "$CTA"
                                    },
                                    "saldoKredit": {
                                        "$sum": [{
                                            "$convert": {
                                                "input": {
                                                    "$arrayElemAt": ["$viewTime.count", 0]
                                                },
                                                "to": "int",
                                                "onError": 0,
                                                "onNull": 0
                                            }
                                        }, {
                                            "$convert": {
                                                "input": {
                                                    "$arrayElemAt": ["$clickTime.count", 0]
                                                },
                                                "to": "int",
                                                "onError": 0,
                                                "onNull": 0
                                            }
                                        }]
                                    },
                                    "userAds": {
                                        "$let": {
                                            "vars": {
                                                "tmp": {
                                                    "$arrayElemAt": ["$userAds", 0]
                                                }
                                            },
                                            "in": "$$tmp.adsViewCount"
                                        }
                                    },
                                    "userAdsAge": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsAge"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    $ifNull: [
                                                        { "$arrayElemAt": ["$userAdsAge._id", "$$this"] },
                                                        "Lainnya"
                                                    ]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsAge.ageCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    },
                                    "userAdsGender": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsGender"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    $ifNull: [
                                                        { "$arrayElemAt": ["$userAdsGender._id", "$$this"] },
                                                        "Lainnya"
                                                    ]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsGender.genderCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    },
                                    "userAdsArea": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsArea"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    $ifNull: [
                                                        { "$arrayElemAt": ["$userAdsArea._id", "$$this"] },
                                                        "Lainnya"
                                                    ]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsArea.areasCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    },
                                    "userAdsInterest": {
                                        "$map": {
                                            "input": {
                                                "$range": [0, {
                                                    "$size": "$userAdsInterest"
                                                }]
                                            },
                                            "in": {
                                                "name": {
                                                    "$arrayElemAt": ["$userAdsInterest._id", "$$this"]
                                                },
                                                "count": {
                                                    "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                },
                                                "persentase": {
                                                    "$multiply": [{
                                                        "$divide": [{
                                                            "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                        }, {
                                                            "$let": {
                                                                "vars": {
                                                                    "tmp": {
                                                                        "$arrayElemAt": ["$userAds", 0]
                                                                    }
                                                                },
                                                                "in": "$$tmp.adsViewCount"
                                                            }
                                                        }]
                                                    }, 100]
                                                },
                                                "persentaseText": {
                                                    "$concat": [{
                                                        "$toString": {
                                                            "$multiply": [{
                                                                "$divide": [{
                                                                    "$arrayElemAt": ["$userAdsInterest.interestCount", "$$this"]
                                                                }, {
                                                                    "$let": {
                                                                        "vars": {
                                                                            "tmp": {
                                                                                "$arrayElemAt": ["$userAds", 0]
                                                                            }
                                                                        },
                                                                        "in": "$$tmp.adsViewCount"
                                                                    }
                                                                }]
                                                            }, 100]
                                                        }
                                                    }, "", "%"]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                }
            },
            {
                $project: {
                    _id: 0,
                    adsDetail: {
                        _id: "$_id",
                        name: "$name",
                        campaignId: "$campaignId",
                        description: "$description",
                        typeAdsID: "$typeAdsID",
                        typeAdsIDName: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$adstypes_data", 0] },
                                },
                                "in": "$$tmp.nameType"
                            }
                        },
                        liveAt: "$liveAt",
                        liveEnd: "$liveEnd",
                        urlLink: "$liveAt",
                        tayang: "$tayang",
                        status: {
                            $switch: {
                                branches: [
                                    {
                                        case: { $eq: ['$status', 'DRAFT'] },
                                        then: 'DRAFT',
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                        then: 'IN_ACTIVE',
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                        then: 'ACTIVE',
                                    },
                                    {
                                        case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                        then: 'UNDER_REVIEW',
                                    },

                                ],
                                default: "OTHER",

                            },

                        },
                        remark: {
                            $switch: {
                                branches: [
                                    {
                                        case: { $eq: ['$status', 'DRAFT'] },
                                        then: "Kredit tidak mencukupi",
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                        then: {
                                            $ifNull:
                                                [
                                                    "$remark",
                                                    "Iklan sudah selesai"
                                                ]
                                            // $cond:
                                            // {
                                            //     if:
                                            //     {
                                            //         "$eq": ["$description", 'ADS REJECTED']
                                            //     },
                                            //     then: 'Iklan ditolak, kredit dikembalikan ke saldo Anda',
                                            //     else: 'Iklan sudah selesai'
                                            // }
                                        },
                                    },
                                    {
                                        case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                        then: {
                                            $cond:
                                            {
                                                if: {
                                                    $lte: [{
                                                        $toDate: "$liveAt"
                                                    }, "$date_now"]
                                                },
                                                then: 'Iklan sedang tayang',
                                                else: 'Sedang menunggu penayangan'
                                            }
                                        },
                                    },
                                    {
                                        case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                        then: 'Sedang ditinjau oleh Hyppe',
                                    },

                                ],
                                default: "OTHER",

                            },

                        },
                        dayAds: "$dayAds",
                        credit: "$credit",
                        audiensFrekuensi: "$audiensFrekuensi",
                        adsObjectivitasId: "$adsObjectivitasId",
                        objectivitasIdNameId: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                                },
                                "in": "$$tmp.name_id"
                            }
                        },
                        objectivitasIdNameEn: {
                            "$let": {
                                "vars": {
                                    "tmp": { "$arrayElemAt": ["$adsobjectivitas_data", 0] },
                                },
                                "in": "$$tmp.name_en"
                            }
                        },
                        idApsara: "$idApsara",
                    },
                    summary: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.summary"
                        }
                    },
                    saldoKredit: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.saldoKredit"
                        }
                    },
                    userAdsAge: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsAge"
                        }
                    },
                    userAdsGender: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsGender"
                        }
                    },
                    userAdsArea: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsArea"
                        }
                    },
                    userAdsInterest: {
                        "$let": {
                            "vars": {
                                "tmp": { "$arrayElemAt": ["$userads", 0] },
                            },
                            "in": "$$tmp.userAdsInterest"
                        }
                    }
                }
            }
        ]);
        return query;
    }

    async getAdsSatus(userId: string, start_date: any, end_date: any) {
        var $match = {};
        if (userId != undefined) {
            $match['userID'] = new mongoose.Types.ObjectId(userId);
        }
        $match['adsObjectivitasId'] = { $ne: null };
        $match['timestamp'] = {
            $gte: await this.utilsService.formatDateString(start_date),
            $lte: await this.utilsService.formatDateString(end_date)
        };
        var query = await this.adsModel.aggregate(
            [{
                $match
            }, {
                "$project": {
                    "status": {
                        "$switch": {
                            "branches": [{
                                "case": {
                                    "$eq": ["$status", "DRAFT"]
                                },
                                "then": "DRAFT"
                            }, {
                                "case": {
                                    "$or": [{
                                        "$eq": ["$status", "FINISH"]
                                    }, {
                                        "$eq": ["$status", "IN_ACTIVE"]
                                    }, {
                                        "$eq": ["$status", "REPORTED"]
                                    }]
                                },
                                "then": "IN_ACTIVE"
                            }, {
                                "case": {
                                    "$or": [{
                                        "$eq": ["$status", "APPROVE"]
                                    }, {
                                        "$eq": ["$status", "ACTIVE"]
                                    }]
                                },
                                "then": "ACTIVE"
                            }, {
                                "case": {
                                    "$eq": ["$status", "UNDER_REVIEW"]
                                },
                                "then": "UNDER_REVIEW"
                            }],
                            "default": "OTHER"
                        }
                    }
                }
            }, {
                "$facet": {
                    "status": [{
                        "$group": {
                            "_id": "$status",
                            "status": {
                                "$first": "$status"
                            },
                            "count": {
                                "$sum": 1
                            }
                        }
                    }]
                }
            }]
        );
        return query;
    }

    async list(userID: string, name_ads: string, start_date: any, end_date: any, type_ads: any[], plan_ads: any[], status_list: any[], page: number, limit: number, sorting: boolean) {
        var paramaggregate = [];
        var $match = {};
        var andFilter = [];
        paramaggregate.push({ $addFields: { date_now: new Date() } });
        //$match["adsObjectivitasId"] = { $ne: null };
        if (userID != undefined) {
            andFilter.push({
                userID: new mongoose.Types.ObjectId(userID)
            });
        }

        andFilter.push({
            adsObjectivitasId: { $ne: null }
        });
        //------------FILTER DATE START END------------
        if (start_date != undefined && end_date != undefined) {
            // $match["liveAt"] = {
            //     $gte: start_date.toISOString(),
            //     $lte: end_date.toISOString()
            // };
            andFilter.push({
                liveAt: {
                    $gte: start_date.toISOString(),
                    $lte: end_date.toISOString()
                }
            });
        }
        //------------FILTER NAME------------
        if (name_ads != undefined) {
            // $match["name"] = {
            //     $regex: name_ads,
            //     $options: "i"
            // };
            andFilter.push({
                name: {
                    $regex: name_ads,
                    $options: "i"
                }
            });
        }
        //------------FILTER TYPE ADS------------
        if (type_ads != undefined) {
            if (type_ads.length > 0) {
                //$match["typeAdsID"] = { $in: type_ads };
                andFilter.push({
                    typeAdsID: { $in: type_ads }
                });
            }
        }
        //------------FILTER TAYANG------------
        if (plan_ads != undefined) {
            if (plan_ads.length > 0) {
                var plan_adsFilter = [];
                if (plan_ads.includes("show_smaller_than_50")) {
                    // $match["tayang"] = {
                    //     $lt: 50
                    // }
                    plan_adsFilter.push({
                        tayang: {
                            $lt: 50
                        }
                    })
                }
                if (plan_ads.includes("show_50_smaller_than_90")) {
                    // $match["tayang"] = {
                    //     $gte: 50, $lte: 99
                    // }
                    plan_adsFilter.push({
                        tayang: {
                            $gte: 50, $lte: 99
                        }
                    })
                }
                if (plan_ads.includes("show_100_smaller_than_500")) {
                    // $match["tayang"] = {
                    //     $gte: 100, $lte: 500
                    // }
                    plan_adsFilter.push({
                        tayang: {
                            $gte: 100, $lte: 500
                        }
                    })
                }
                if (plan_ads.includes("show_greater_than_500")) {
                    // $match["tayang"] = {
                    //     $gt: 500
                    // }
                    plan_adsFilter.push({
                        tayang: {
                            $gt: 500
                        }
                    })
                }
                andFilter.push({
                    $or: plan_adsFilter
                });
            }
        }
        //------------FILTER STATUS------------
        if (status_list != undefined) {
            // if (status_list.length > 0) {
            //     $match["status"] = { $in: status_list };
            // }
            andFilter.push({
                status: { $in: status_list }
            });
        }
        $match["$and"] = andFilter;
        if (andFilter.length > 0) {
            paramaggregate.push({ $match });
        }
        //console.log($match);
        //------------PUSH MATCH------------
        paramaggregate.push({ $match });
        //------------FACET VIEWED------------
        var viewedFacet = [];
        // if (start_date != undefined && end_date != undefined) {
        //     viewedFacet.push({
        //         $match: {
        //             updateAt: {
        //                 $elemMatch: {
        //                     $gte: start_date.toISOString(),
        //                     $lte: end_date.toISOString()
        //                 }
        //             }
        //         }
        //     });
        // }
        viewedFacet.push({
            $unwind:
            {
                path: "$updateAt",
                includeArrayIndex: 'updateAt_index',
            }
        });
        // if (start_date != undefined && end_date != undefined) {
        //     viewedFacet.push({
        //         $match: {
        //             updateAt: {
        //                 $gte: start_date.toISOString(),
        //                 $lte: end_date.toISOString()
        //             }
        //         }
        //     });
        // }
        viewedFacet.push({
            $group: {
                _id: "$userID",
                userIDCount: { "$sum": 1 }
            }
        },
            {
                $group: {
                    _id: null,
                    reach: { "$sum": 1 },
                    impresi: { "$sum": "$userIDCount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    reach: 1,
                    impresi: 1
                }
            });
        //------------FACET CTA------------
        var CTACountFacet = [];
        // if (start_date != undefined && end_date != undefined) {
        //     CTACountFacet.push({
        //         $match: {
        //             clickTime: {
        //                 $elemMatch: {
        //                     $gte: start_date.toISOString(),
        //                     $lte: end_date.toISOString()
        //                 }
        //             }
        //         }
        //     });
        // }
        CTACountFacet.push({
            $unwind:
            {
                path: "$clickTime",
                includeArrayIndex: 'clickTime_index',
            }
        });
        // if (start_date != undefined && end_date != undefined) {
        //     CTACountFacet.push({
        //         $match: {
        //             clickTime: {
        //                 $gte: start_date.toISOString(),
        //                 $lte: end_date.toISOString()
        //             }
        //         }
        //     });
        // }
        CTACountFacet.push({
            $project: {
                clickTime: {
                    $substr:
                        [
                            "$clickTime", 0, 10
                        ]
                }
            }
        },
            {
                $group:
                {
                    _id: "$clickTime",
                    CTACount:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                $group:
                {
                    _id: null,
                    CTACount:
                    {
                        "$sum": "$CTACount"
                    }
                }
            });
        //------------PUSH QUERY------------
        paramaggregate.push(
            {
                $lookup:
                {
                    from: "adstypes",
                    as: "type_data",
                    let:
                    {
                        "type_fk": "$typeAdsID"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $eq:
                                            [
                                                "$_id",
                                                "$$type_fk"
                                            ]
                                    }
                                },
                            },
                            {
                                $project:
                                {
                                    nameType: 1,
                                    creditValue: 1,
                                }
                            }
                        ]
                }
            },
            {
                $lookup:
                {
                    from: "userads",
                    as: "userads_data",
                    let:
                    {
                        "type_fk": "$_id"
                    },
                    pipeline:
                        [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr:
                                            {
                                                $eq:
                                                    [
                                                        "$adsID",
                                                        "$$type_fk"
                                                    ]
                                            }
                                        },
                                    ]
                                },
                            },
                            {
                                $facet: {
                                    viewed: viewedFacet,
                                    CTACount: CTACountFacet,
                                }
                            },
                        ]
                }
            },
            {
                $project:
                {
                    _id: 1,
                    campaignId: 1,
                    name: 1,
                    liveAt: 1,
                    liveEnd: 1,
                    userID: 1,
                    typesID: 1,
                    adstypes:
                    {
                        "$arrayElemAt":
                            [
                                "$type_data.nameType", 0
                            ]
                    },
                    tayang: 1,
                    totalCredit: 1,
                    // dateNow_1: "$date_now",
                    // dateNow_2: {
                    //                                 $toDate: "$liveAt"
                    //                             },
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'DRAFT'] },
                                    then: 'DRAFT',
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                    then: 'IN_ACTIVE',
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                    then: 'ACTIVE',
                                },
                                {
                                    case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                    then: 'UNDER_REVIEW',
                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    remark: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'DRAFT'] },
                                    then: "Kredit tidak mencukupi",
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'FINISH'] }, { $eq: ['$status', 'IN_ACTIVE'] }, { $eq: ['$status', 'REPORTED'] }] },
                                    then: {
                                        $ifNull:
                                            [
                                                "$remark",
                                                "Iklan sudah selesai"
                                            ]
                                        // $cond:
                                        // {  
                                        //     if:
                                        //     {
                                        //         "$eq": ["$description", 'ADS REJECTED']
                                        //     },
                                        //     then: 'Iklan ditolak, kredit dikembalikan ke saldo Anda',
                                        //     else: 'Iklan sudah selesai'
                                        // }
                                    },
                                },
                                {
                                    case: { $or: [{ $eq: ['$status', 'APPROVE'] }, { $eq: ['$status', 'ACTIVE'] }] },
                                    then: {
                                        $cond:
                                        {
                                            if: {
                                                $lte: [{
                                                    $toDate: "$liveAt"
                                                }, "$date_now"]
                                            },
                                            then: 'Iklan sedang tayang',
                                            else: 'Sedang menunggu penayangan'
                                        }
                                    },
                                },
                                {
                                    case: { $eq: ['$status', 'UNDER_REVIEW'] },
                                    then: 'Sedang ditinjau oleh Hyppe',
                                },

                            ],
                            default: "OTHER",

                        },

                    },
                    CTA: {
                        $let: {
                            "vars": {
                                userads_data: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.CTACount"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userads_data.CTACount"
                        }
                    },
                    impresi: {
                        $let: {
                            "vars": {
                                userads_data: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.viewed"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userads_data.impresi"
                        }
                    },
                    reach: {
                        $let: {
                            "vars": {
                                userads_data: {
                                    "$arrayElemAt": [{
                                        "$let": {
                                            "vars": {
                                                "tmp": { "$arrayElemAt": ["$userads_data", 0] },
                                            },
                                            "in": "$$tmp.viewed"
                                        }
                                    }, 0]
                                }
                            },
                            "in": "$$userads_data.reach"
                        }
                    },
                    // placingID: 1, 
                    // timestamp: 1,
                    // creditFree: 1,
                    // totalUsedCredit: 1,
                    // usedCreditFree: 1,
                    // usedCredit: 1,
                    idApsara: 1,
                    // totalView:
                    // {
                    //     "$ifNull":
                    //     [
                    //         "$totalView",
                    //         0
                    //     ]
                    // },
                    // isActive: 1,
                    apsara: {
                        "$cond":
                        {
                            if:
                            {
                                "$eq": ["$idApsara", null]
                            },
                            then: false,
                            else: true
                        }
                    },
                    // type: 1,
                    // tempreportedUserCount:
                    // {
                    //     "$ifNull":
                    //     [
                    //         "$reportedUserCount",
                    //         0
                    //     ]
                    // },
                    // sumtotalusedCredit:
                    // {
                    //     "$multiply":
                    //     [
                    //         {
                    //             "$ifNull":
                    //                 [
                    //                     "$totalView",
                    //                     0
                    //                 ]
                    //         },
                    //         {
                    //             "$arrayElemAt":
                    //                 [
                    //                     "$type_data.creditValue", 0
                    //                 ]
                    //         }
                    //     ]
                    // }
                    timestamp: 1,
                    adsIdNumber: 1
                }
            }
        );
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
        var query = await this.adsModel.aggregate(paramaggregate);

        var listdata = [];
        var tempresult = null;
        var tempdata = null;
        for (var i = 0; i < query.length; i++) {
            tempdata = query[i];
            if (tempdata.apsara == true) {
                listdata.push(tempdata.idApsara);
            }
            else {
                listdata.push(undefined);
            }
        }

        var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaraimagedata.ImageInfo;
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < tempresult.length; j++) {
                if (tempresult[j].ImageId == query[i].idApsara) {
                    query[i].media =
                    {
                        "ImageInfo": [tempresult[j]]
                    }
                }
                else if (query[i].apsara == false && (query[i].type == "image" || query[i].type == "images")) {
                    query[i].media =
                    {
                        "ImageInfo": []
                    }
                }
            }
        }

        var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
        // console.log(apsaravideodata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaravideodata.VideoList;
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < tempresult.length; j++) {
                if (tempresult[j].VideoId == query[i].idApsara) {
                    query[i].media =
                    {
                        "VideoList": [tempresult[j]]
                    }
                }
                else if (query[i].apsara == false && query[i].type == "video") {
                    query[i].media =
                    {
                        "VideoList": []
                    }
                }
            }
        }

        return query;
    }

    async list_reward(name: string, start_date: any, end_date: any, gender: any[], age: any[], areas: any[], similarity: any[], page: number, limit: number, sorting: boolean, idtransaction: string) {
        similarity
        const getReward = await this.AccountbalancesService.getReward(name, start_date, end_date, gender, age, areas, similarity, page, limit, sorting, idtransaction);
        return getReward;
    }



    async getAdsUser(email: string, idUser: string, idTypeAds: string): Promise<any> {
        console.log(email);
        console.log(idUser);
        console.log(idTypeAds);
        var query = await this.adsModel.aggregate(
            [
                {
                    $set:
                    {
                        email: email
                    }
                },
                {
                    $set:
                    {
                        idUser: new mongoose.Types.ObjectId(idUser)
                    }
                },
                {
                    $set:
                    {
                        tay:
                        {
                            $ifNull: ['$tayang', 0]
                        }
                    }
                },
                {
                    $set: {
                        "testDate":
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
                    $set: {
                        "sekarang":
                        {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": {
                                    $add: [new Date(), 25200000]
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        "tayangStart": {
                            $concat: [
                                "$liveAt",
                                " 00:00:00"
                            ]
                        }
                    }
                },
                {
                    $set: {
                        "tayangEnd": {

                            $concat: [
                                "$liveEnd",
                                " 23:59:59"
                            ]
                        }
                    }
                },
                {
                    $set: {
                        hariCount: {
                            $isoDayOfWeek: {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                },
                {
                    $set: {
                        hari:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 1]
                                        },
                                        then: "$dayAds.monday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 2]
                                        },
                                        then: "$dayAds.tuesday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 3]
                                        },
                                        then: "$dayAds.wednesday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 4]
                                        },
                                        then: "$dayAds.thursday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 5]
                                        },
                                        then: "$dayAds.friday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 6]
                                        },
                                        then: "$dayAds.saturday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 7]
                                        },
                                        then: "$dayAds.sunday"
                                    },

                                ],
                                default: "error hari"
                            }
                        },

                    }
                },
                {
                    $set: {
                        waktu:
                        {
                            $switch: {
                                branches:
                                    [
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_24_4", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 00:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 04:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ],

                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_4_8", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 04:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 08:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_8_12", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 08:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 12:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_12_16", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 12:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 16:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_16_20", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 16:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 20:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_20_24", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 20:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 24:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },

                                    ],
                                default: false
                            }
                        },

                    }
                },
                {
                    $set:
                    {
                        co: ["MALE", " MALE", "Laki-laki", "Pria"]
                    },

                },
                {
                    $set:
                    {
                        ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                    }
                },
                {
                    $set:
                    {
                        all: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria", "Other"]
                    }
                },
                {
                    $set:
                    {
                        ceOther: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "Other"]
                    }
                },
                {
                    $set:
                    {
                        coOther: ["MALE", " MALE", "Laki-laki", "Pria", "Other"]
                    }
                },
                {
                    $set:
                    {
                        ceCo: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria"]
                    }
                },
                {
                    $set:
                    {
                        other: ["Other"]
                    }
                },
                {
                    $set: {
                        totKelamin: {
                            $size: "$gender"
                        }
                    }
                },
                {
                    $set: {
                        tempValue: 0
                    }
                },
                {
                    $set: {
                        tempValues: {
                            $add: ["$tempValue", 20]
                        }
                    }
                },
                {
                    $set: {
                        totAge1:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_smaller_than_14", true]
                                },
                                then: {
                                    $add: ["$tempValue", 1]
                                },
                                else: "$tempValue"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge2:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_14_smaller_than_28", true]
                                },
                                then: {
                                    $add: ["$totAge1", 1]
                                },
                                else: "$totAge1"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge3:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_29_smaller_than_43", true]
                                },
                                then: {
                                    $add: ["$totAge2", 1]
                                },
                                else: "$totAge2"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge4:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_greater_than_44", true]
                                },
                                then: {
                                    $add: ["$totAge3", 1]
                                },
                                else: "$totAge3"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_other", true]
                                },
                                then: {
                                    $add: ["$totAge4", 1]
                                },
                                else: "$totAge4"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totInterest: {
                            $size: "$interestID"
                        }
                    }
                },
                {
                    $set: {
                        totLocation: {
                            $size: "$demografisID"
                        }
                    }
                },
                {
                    $set: {
                        kelamin:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$gender", ["P"]]
                                        },
                                        then: "$ce"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L"]]
                                        },
                                        then: "$co"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O"]]
                                        },
                                        then: "$other"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P", "L"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O", "L"]]
                                        },
                                        then: "$all"
                                    },

                                ],
                                default: "kancut"
                            }
                        }
                    }
                },
                {
                    $match:
                    {
                        $and: [
                            {
                                "status": "ACTIVE"
                            },
                            {
                                "reportedUser":
                                {
                                    $ne: "$email"
                                }
                            },
                            {
                                "userID":
                                {
                                    $ne: new mongoose.Types.ObjectId(idUser)
                                }
                            },
                            {
                                $expr: {
                                    $lt: ["$tayangStart", "$testDate"]
                                }
                            },
                            {
                                $expr: {
                                    $gte: ["$tayangEnd", "$testDate"]
                                }
                            },
                            {
                                typeAdsID: new mongoose.Types.ObjectId(idTypeAds),

                            }
                        ]
                    },

                },
                {
                    "$lookup": {
                        from: "newUserBasics",
                        as: "userBasic",
                        let: {
                            localID: new mongoose.Types.ObjectId(idUser)
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
                                    from: "accountbalances",
                                    as: "balances",
                                    let: {
                                        localID: new mongoose.Types.ObjectId(idUser)
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                $expr: {
                                                    $eq: ['$iduser', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $facet: {
                                                kredit: [{
                                                    $group: {
                                                        _id: "$iduser",
                                                        tot: {
                                                            $sum: "$kredit",

                                                        },

                                                    }
                                                }],
                                                debet: [{
                                                    $group: {
                                                        _id: "$iduser",
                                                        tot: {
                                                            $sum: "$debet",

                                                        },

                                                    }
                                                }],

                                            }
                                        },
                                        {
                                            $project: {
                                                debet:
                                                {
                                                    $arrayElemAt: ["$debet.tot", 0]
                                                },
                                                kredit:
                                                {
                                                    $arrayElemAt: ["$kredit.tot", 0]
                                                },
                                                total:
                                                {
                                                    $subtract: [
                                                        {
                                                            $arrayElemAt: ["$kredit.tot", 0]
                                                        },
                                                        {
                                                            $arrayElemAt: ["$debet.tot", 0]
                                                        },

                                                    ]
                                                },

                                            }
                                        }
                                    ],

                                }
                            },
                            {
                                $project: {
                                    balances: {
                                        $arrayElemAt: ["$balances", 0]
                                    },
                                    debet: {
                                        $arrayElemAt: ["$balances.debet", 0]
                                    },
                                    kredit: {
                                        $arrayElemAt: ["$balances.kredit", 0]
                                    },
                                    total: {
                                        $arrayElemAt: ["$balances.total", 0]
                                    },
                                    "email": 1,

                                    "userInterests": 1,
                                    "states": ["$states"],
                                    "gender": ["$gender"],
                                    "age":
                                    {
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

                                }
                            }
                        ],

                    }
                },
                {
                    "$lookup": {
                        from: "newUserBasics",
                        as: "userBasicAds",
                        let: {
                            localID: '$userID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    // $expr: {
                                    //     $eq: ['$_id', '$$localID']
                                    // }
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$localID']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $ne: ['$guestMode', true]
                                            }
                                        }
                                    ]
                                }
                            },
                            // {
                            //     "$lookup":
                            //     {
                            //         from: "userauths",
                            //         let:
                            //         {
                            //             basic_fk: "$email"
                            //         },
                            //         as: 'userauth_data',
                            //         pipeline:
                            //             [
                            //                 {
                            //                     "$match":
                            //                     {
                            //                         "$and":
                            //                             [
                            //                                 {
                            //                                     "$expr":
                            //                                     {
                            //                                         "$eq":
                            //                                             [
                            //                                                 "$email",
                            //                                                 "$$basic_fk"
                            //                                             ]
                            //                                     },

                            //                                 },

                            //                             ]
                            //                     }
                            //                 },

                            //             ]
                            //     }
                            // },
                            {
                                $project: {

                                    "email": 1,
                                    "userName": "$username",
                                    // "userName":
                                    // {
                                    //     "$arrayElemAt":
                                    //         [
                                    //             "$userauth_data.username",
                                    //             0
                                    //         ]
                                    // },
                                    avatar:
                                    {
                                        mediaEndpoint: "$mediaEndpoint"
                                    },
                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$userBasic",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $unwind: {
                        path: "$userBasicAds",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsAge",
                        let: {
                            ket: 'similarity',
                            type: 'AdsAge'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsAge",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsInterest",
                        let: {
                            ket: 'similarity',
                            type: 'AdsInterest'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsInterest",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsLocation",
                        let: {
                            ket: 'similarity',
                            type: 'AdsLocation'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsLocation",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsGender",
                        let: {
                            ket: 'similarity',
                            type: 'AdsGender'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', 'similarity']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', 'AdsGender']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsGender"
                    }
                },
                {
                    $set: {
                        kelaminku:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$kelamin", "$userBasic.gender"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$kelamin", "$userBasic.gender"]
                                    }
                                },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $set: {
                        umur:
                        {
                            $cond: {
                                if: {
                                    $and: [
                                        {
                                            $gte: ["$userBasic.age", "$ads.ageStart"]
                                        },
                                        {
                                            $lte: ["$userBasic.age", "$ads.ageEnd"]
                                        }
                                    ]
                                },
                                then: 1,
                                else: 0,

                            }
                        },

                    }
                },
                {
                    $set: {
                        demografis:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$demografisID.$id", "$userBasic.states.$id"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$demografisID.$id", "$userBasic.states.$id"]
                                    }
                                },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $set: {
                        userMinat:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$userBasic.userInterests', []]
                                },
                                then: "LAINNYA",
                                else: "$userBasic.userInterests"
                            }
                        },

                    }
                },
                {
                    $set: {
                        minat:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$interestID.$id", "$userBasic.userInterests.$id"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$interestID.$id", "$userBasic.userInterests.$id"]
                                    }
                                },
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $in: ['$userMinat', "$interestID"]
                                        },
                                        then: 1,
                                        else: 0
                                    }
                                },

                            }
                        },

                    }
                },
                {
                    $set: {
                        scoreUmur: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsAge.value",
                                        {
                                            $divide: ["$umur", "$totAge"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set:
                    {
                        scoreKelamin: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsGender.value",
                                        {
                                            $divide: ["$kelaminku", "$totKelamin"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreMinat: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsInterest.value",
                                        {
                                            $divide: ["$minat", "$totInterest"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreGeografis: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsLocation.value",
                                        {
                                            $divide: ["$demografis", "$totLocation"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreTotal:
                        {
                            $add: ["$scoreUmur", "$scoreKelamin", "$scoreMinat", "$scoreGeografis"]
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "userads",
                        as: "adsUser",
                        let: {
                            idAds: "$_id",
                            localID: new mongoose.Types.ObjectId(idUser),
                            frekwensi: "$audiensFrekuensi"
                        },
                        pipeline: [
                            {
                                $set: {
                                    viewed: {
                                        $ifNull: ["$viewed", 0]
                                    }
                                }
                            },
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$userID', '$$localID']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$adsID', '$$idAds']
                                            }
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    adsID: "$adsID",
                                    dodol: {
                                        $toString: "$adsID"
                                    },
                                    userID: 1,
                                    viewed: "$viewed",
                                    isActive: 1,

                                }
                            },

                        ],

                    }
                },
                {
                    $addFields: {
                        isValid:
                        {
                            $and: [
                                {
                                    $in: [
                                        "$_id",
                                        "$adsUser.adsID"
                                    ]
                                },

                            ]
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "adsobjectivitas",
                        as: "objectivitas",
                        let: {
                            idObj: "$adsObjectivitasId",

                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$idObj']
                                            }
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    priority: 1,
                                    name_id: 1,
                                    name_en: 1,
                                    percentageMin: 1,

                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$objectivitas",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $set: {
                        sorts:
                        {
                            $cond: {
                                if: {
                                    $gte: ['$scoreTotal', "$objectivitas.percentageMin"]
                                },
                                then: true,
                                else: false
                            }
                        },

                    }
                },
                {
                    $set: {
                        priority: "$objectivitas.priority"
                    }
                },
                {
                    $set: {
                        priorityViewed: "$adsUser.viewed"
                    }
                },
                {
                    $sort: {
                        isValid: 1,
                        priorityViewed: 1,
                        sorts: - 1,
                        priority: 1,
                        scoreTotal: - 1
                    }
                },
                {
                    $limit: 13
                },
                {
                    $set: {
                        validasi: {
                            $ifNull: [{
                                $arrayElemAt: ["$adsUser.isActive", 0]
                            }, true]
                        }
                    }
                },
                {
                    $set: {
                        balancesReplace: { $ifNull: ["$userBasic.balances.total", 0] }
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                    },
                                    {
                                        $expr: {
                                            $lt: ["$balancesReplace", 49000
                                            ]
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": {
                                            $ne: new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', false]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": {
                                            $ne: new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', false]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                    },
                                    {
                                        $expr: {
                                            $lt: ["$balancesReplace", 49000
                                            ]
                                        }
                                    },

                                ]
                            },
                        ]
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "cta",
                        let: {
                            localID: 'CTAButton',
                            indexs: "$ctaButton"
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr: {
                                        $eq: ['$jenis', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    jenis: 1,
                                    value: 1,

                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$cta",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "adstypes",
                        as: "types",
                        let: {
                            localID: '$typeAdsID'
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
                                    "nameType": 1,

                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$types",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalView: 1,
                        CPV: 1,
                        audiensFrekuensi: 1,
                        balances: "$userBasic.balances",
                        totalSaldo: "$balancesReplace",
                        username: "$userBasicAds.userName",
                        avatar: "$userBasicAds.avatar",
                        email: "$userBasicAds.email",
                        ctaNames: {
                            $arrayElemAt: ["$cta.value", "$ctaButton"]
                        },
                        test: 1,
                        sekarang: 1,
                        ctaButton: 1,
                        viewed: {
                            $arrayElemAt: ["$adsUser.viewed", 0]
                        },
                        //tester:"$adsUser",
                        isAdsActive: {
                            $arrayElemAt: ["$adsUser.isActive", 0]
                        },
                        placingID: 1,
                        placingName: 1,
                        timestamps: 1,
                        adsId: 1,
                        userID: 1,
                        liveAt: 1,
                        liveTypeuserads: 1,
                        nameType: "$types.nameType",
                        createdAt: 1,
                        kelaminku: 1,
                        minat: 1,
                        demografis: 1,
                        umur: 1,
                        testDate: 1,
                        skipTime: { $ifNull: ["$skipTime", 0] },
                        tayang: 1,
                        tayangStart: 1,
                        tayangEnd: 1,
                        adsUserId: 1,
                        adsUser: 1,
                        liveTypeAds: 1,
                        typeAdsID: 1,
                        description: 1,
                        type: 1,
                        idApsara: 1,
                        duration: 1,
                        urlLink: 1,
                        priority: 1,
                        scoreUmur: 1,
                        scoreKelamin: 1,
                        scoreMinat: 1,
                        scoreGeografis: 1,
                        scoreTotal: 1,
                        isValid: 1,
                        objectivitasId: "$objectivitas.name_id",
                        objectivitasEn: "$objectivitas.name_en",
                        mediaBasePath: 1,
                        mediaUri: 1,
                        mediaThumBasePath: 1,
                        mediaThumUri: 1,
                        mediaPortraitBasePath: 1,
                        mediaPortraitUri: 1,
                        mediaPortraitThumBasePath: 1,
                        mediaPortraitThumUri: 1,
                        widthPortrait: 1,
                        heightPortrait: 1,
                        mediaLandscapeBasePath: 1,
                        mediaLandscapeUri: 1,
                        mediaLandscapeThumBasePath: 1,
                        mediaLandscapeThumUri: 1,
                        heightLandscape: 1,
                        widthLandscape: 1,
                        idApsaraPortrait: 1,
                        idApsaraLandscape: 1,
                    }
                },
            ]
        );
        return query;
    }

    async getAdsUser3(email: string, idUser: string, idTypeAds: string): Promise<any> {
        console.log(email);
        console.log(idUser);
        console.log(idTypeAds);
        var query = await this.adsModel.aggregate(
            [
                {
                    $set:
                    {
                        email: email
                    }
                },
                {
                    $set:
                    {
                        idUser: new mongoose.Types.ObjectId(idUser)
                    }
                },
                {
                    $set:
                    {
                        tay:
                        {
                            $ifNull: ['$tayang', 0]
                        }
                    }
                },
                {
                    $set: {
                        "testDate":
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
                    $set: {
                        "sekarang":
                        {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": {
                                    $add: [new Date(), 25200000]
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        "tayangStart": {
                            $concat: [
                                "$liveAt",
                                " 00:00:00"
                            ]
                        }
                    }
                },
                {
                    $set: {
                        "tayangEnd": {

                            $concat: [
                                "$liveEnd",
                                " 23:59:59"
                            ]
                        }
                    }
                },
                {
                    $set: {
                        hariCount: {
                            $isoDayOfWeek: {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                },
                {
                    $set: {
                        hari:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 1]
                                        },
                                        then: "$dayAds.monday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 2]
                                        },
                                        then: "$dayAds.tuesday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 3]
                                        },
                                        then: "$dayAds.wednesday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 4]
                                        },
                                        then: "$dayAds.thursday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 5]
                                        },
                                        then: "$dayAds.friday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 6]
                                        },
                                        then: "$dayAds.saturday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 7]
                                        },
                                        then: "$dayAds.sunday"
                                    },

                                ],
                                default: "error hari"
                            }
                        },

                    }
                },
                {
                    $set: {
                        waktu:
                        {
                            $switch: {
                                branches:
                                    [
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_24_4", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 00:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 04:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ],

                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_4_8", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 04:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 08:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_8_12", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 08:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 12:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_12_16", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 12:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 16:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_16_20", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 16:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 20:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_20_24", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 20:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 24:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },

                                    ],
                                default: false
                            }
                        },

                    }
                },
                {
                    $set:
                    {
                        co: ["MALE", " MALE", "Laki-laki", "Pria"]
                    },

                },
                {
                    $set:
                    {
                        ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                    }
                },
                {
                    $set:
                    {
                        all: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria", "Other"]
                    }
                },
                {
                    $set:
                    {
                        ceOther: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "Other"]
                    }
                },
                {
                    $set:
                    {
                        coOther: ["MALE", " MALE", "Laki-laki", "Pria", "Other"]
                    }
                },
                {
                    $set:
                    {
                        ceCo: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria"]
                    }
                },
                {
                    $set:
                    {
                        other: ["Other"]
                    }
                },
                {
                    $set: {
                        totKelamin: {
                            $size: "$gender"
                        }
                    }
                },
                {
                    $set: {
                        tempValue: 0
                    }
                },
                {
                    $set: {
                        tempValues: {
                            $add: ["$tempValue", 20]
                        }
                    }
                },
                {
                    $set: {
                        totAge1:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_smaller_than_14", true]
                                },
                                then: {
                                    $add: ["$tempValue", 1]
                                },
                                else: "$tempValue"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge2:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_14_smaller_than_28", true]
                                },
                                then: {
                                    $add: ["$totAge1", 1]
                                },
                                else: "$totAge1"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge3:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_29_smaller_than_43", true]
                                },
                                then: {
                                    $add: ["$totAge2", 1]
                                },
                                else: "$totAge2"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge4:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_greater_than_44", true]
                                },
                                then: {
                                    $add: ["$totAge3", 1]
                                },
                                else: "$totAge3"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_other", true]
                                },
                                then: {
                                    $add: ["$totAge4", 1]
                                },
                                else: "$totAge4"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totInterest: {
                            $size: "$interestID"
                        }
                    }
                },
                {
                    $set: {
                        totLocation: {
                            $size: "$demografisID"
                        }
                    }
                },
                {
                    $set: {
                        kelamin:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$gender", ["P"]]
                                        },
                                        then: "$ce"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L"]]
                                        },
                                        then: "$co"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O"]]
                                        },
                                        then: "$other"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P", "L"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O", "L"]]
                                        },
                                        then: "$all"
                                    },

                                ],
                                default: "kancut"
                            }
                        }
                    }
                },
                {
                    $match:
                    {
                        $and: [
                            {
                                "status": "ACTIVE"
                            },
                            {
                                "reportedUser":
                                {
                                    $ne: "$email"
                                }
                            },
                            {
                                "userID":
                                {
                                    $ne: new mongoose.Types.ObjectId(idUser)
                                }
                            },
                            {
                                $expr: {
                                    $lt: ["$tayangStart", "$testDate"]
                                }
                            },
                            {
                                $expr: {
                                    $gte: ["$tayangEnd", "$testDate"]
                                }
                            },
                            {
                                typeAdsID: new mongoose.Types.ObjectId(idTypeAds),

                            }
                        ]
                    },

                },
                {
                    "$lookup": {
                        from: "newUserBasics",
                        as: "userBasic",
                        let: {
                            localID: new mongoose.Types.ObjectId(idUser)
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
                                    from: "accountbalances",
                                    as: "balances",
                                    let: {
                                        localID: new mongoose.Types.ObjectId(idUser)
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                $expr: {
                                                    $eq: ['$iduser', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $facet: {
                                                kredit: [{
                                                    $group: {
                                                        _id: "$iduser",
                                                        tot: {
                                                            $sum: "$kredit",

                                                        },

                                                    }
                                                }],
                                                debet: [{
                                                    $group: {
                                                        _id: "$iduser",
                                                        tot: {
                                                            $sum: "$debet",

                                                        },

                                                    }
                                                }],

                                            }
                                        },
                                        {
                                            $project: {
                                                debet:
                                                {
                                                    $arrayElemAt: ["$debet.tot", 0]
                                                },
                                                kredit:
                                                {
                                                    $arrayElemAt: ["$kredit.tot", 0]
                                                },
                                                total:
                                                {
                                                    $subtract: [
                                                        {
                                                            $arrayElemAt: ["$kredit.tot", 0]
                                                        },
                                                        {
                                                            $arrayElemAt: ["$debet.tot", 0]
                                                        },

                                                    ]
                                                },

                                            }
                                        }
                                    ],

                                }
                            },
                            {
                                $project: {
                                    balances: {
                                        $arrayElemAt: ["$balances", 0]
                                    },
                                    debet: {
                                        $arrayElemAt: ["$balances.debet", 0]
                                    },
                                    kredit: {
                                        $arrayElemAt: ["$balances.kredit", 0]
                                    },
                                    total: {
                                        $arrayElemAt: ["$balances.total", 0]
                                    },
                                    "email": 1,

                                    "userInterests": 1,
                                    "states": ["$states"],
                                    "gender": ["$gender"],
                                    "age":
                                    {
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

                                }
                            }
                        ],

                    }
                },
                {
                    "$lookup": {
                        from: "newUserBasics",
                        as: "userBasicAds",
                        let: {
                            localID: '$userID'
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
                            // {
                            //     "$lookup":
                            //     {
                            //         from: "userauths",
                            //         let:
                            //         {
                            //             basic_fk: "$email"
                            //         },
                            //         as: 'userauth_data',
                            //         pipeline:
                            //             [
                            //                 {
                            //                     "$match":
                            //                     {
                            //                         "$and":
                            //                             [
                            //                                 {
                            //                                     "$expr":
                            //                                     {
                            //                                         "$eq":
                            //                                             [
                            //                                                 "$email",
                            //                                                 "$$basic_fk"
                            //                                             ]
                            //                                     },

                            //                                 },

                            //                             ]
                            //                     }
                            //                 },

                            //             ]
                            //     }
                            // },
                            {
                                $project: {

                                    "email": 1,
                                    "userName": 1,
                                    // "userName":
                                    // {
                                    //     "$arrayElemAt":
                                    //         [
                                    //             "$userauth_data.username",
                                    //             0
                                    //         ]
                                    // },
                                    avatar:
                                    {
                                        mediaEndpoint: "$mediaEndpoint"
                                    }
                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$userBasic",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $unwind: {
                        path: "$userBasicAds",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsAge",
                        let: {
                            ket: 'similarity',
                            type: 'AdsAge'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsAge",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsInterest",
                        let: {
                            ket: 'similarity',
                            type: 'AdsInterest'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsInterest",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsLocation",
                        let: {
                            ket: 'similarity',
                            type: 'AdsLocation'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsLocation",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsGender",
                        let: {
                            ket: 'similarity',
                            type: 'AdsGender'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', 'similarity']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', 'AdsGender']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsGender"
                    }
                },
                {
                    $set: {
                        kelaminku:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$kelamin", "$userBasic.gender"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$kelamin", "$userBasic.gender"]
                                    }
                                },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $set: {
                        umur:
                        {
                            $cond: {
                                if: {
                                    $and: [
                                        {
                                            $gte: ["$userBasic.age", "$ads.ageStart"]
                                        },
                                        {
                                            $lte: ["$userBasic.age", "$ads.ageEnd"]
                                        }
                                    ]
                                },
                                then: 1,
                                else: 0,

                            }
                        },

                    }
                },
                {
                    $set: {
                        demografis:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$demografisID.$id", "$userBasic.states.$id"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$demografisID.$id", "$userBasic.states.$id"]
                                    }
                                },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $set: {
                        userMinat:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$userBasic.userInterests', []]
                                },
                                then: "LAINNYA",
                                else: "$userBasic.userInterests"
                            }
                        },

                    }
                },
                {
                    $set: {
                        minat:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$interestID.$id", "$userBasic.userInterests.$id"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$interestID.$id", "$userBasic.userInterests.$id"]
                                    }
                                },
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $in: ['$userMinat', "$interestID"]
                                        },
                                        then: 1,
                                        else: 0
                                    }
                                },

                            }
                        },

                    }
                },
                {
                    $set: {
                        scoreUmur: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsAge.value",
                                        {
                                            $divide: ["$umur", "$totAge"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set:
                    {
                        scoreKelamin: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsGender.value",
                                        {
                                            $divide: ["$kelaminku", "$totKelamin"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreMinat: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsInterest.value",
                                        {
                                            $divide: ["$minat", "$totInterest"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreGeografis: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsLocation.value",
                                        {
                                            $divide: ["$demografis", "$totLocation"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreTotal:
                        {
                            $add: ["$scoreUmur", "$scoreKelamin", "$scoreMinat", "$scoreGeografis"]
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "userads",
                        as: "adsUser",
                        let: {
                            idAds: "$_id",
                            localID: new mongoose.Types.ObjectId(idUser),
                            frekwensi: "$audiensFrekuensi"
                        },
                        pipeline: [
                            {
                                $set: {
                                    viewed: {
                                        $ifNull: ["$viewed", 0]
                                    }
                                }
                            },
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$userID', '$$localID']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$adsID', '$$idAds']
                                            }
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    adsID: "$adsID",
                                    dodol: {
                                        $toString: "$adsID"
                                    },
                                    userID: 1,
                                    viewed: "$viewed",
                                    isActive: 1,

                                }
                            },

                        ],

                    }
                },
                {
                    $addFields: {
                        isValid:
                        {
                            $and: [
                                {
                                    $in: [
                                        "$_id",
                                        "$adsUser.adsID"
                                    ]
                                },

                            ]
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "adsobjectivitas",
                        as: "objectivitas",
                        let: {
                            idObj: "$adsObjectivitasId",

                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$idObj']
                                            }
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    priority: 1,
                                    name_id: 1,
                                    name_en: 1,
                                    percentageMin: 1,

                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$objectivitas",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $set: {
                        sorts:
                        {
                            $cond: {
                                if: {
                                    $gte: ['$scoreTotal', "$objectivitas.percentageMin"]
                                },
                                then: true,
                                else: false
                            }
                        },

                    }
                },
                {
                    $set: {
                        priority: "$objectivitas.priority"
                    }
                },
                {
                    $set: {
                        priorityViewed: "$adsUser.viewed"
                    }
                },
                {
                    $sort: {
                        isValid: 1,
                        priorityViewed: 1,
                        sorts: - 1,
                        priority: 1,
                        scoreTotal: - 1
                    }
                },
                {
                    $limit: 13
                },
                {
                    $set: {
                        validasi: {
                            $ifNull: [{
                                $arrayElemAt: ["$adsUser.isActive", 0]
                            }, true]
                        }
                    }
                },
                {
                    $set: {
                        balancesReplace: { $ifNull: ["$userBasic.balances.total", 0] }
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                    },
                                    {
                                        $expr: {
                                            $lt: ["$balancesReplace", 49000
                                            ]
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": {
                                            $ne: new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', false]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": {
                                            $ne: new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', false]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                    },
                                    {
                                        $expr: {
                                            $lt: ["$balancesReplace", 49000
                                            ]
                                        }
                                    },

                                ]
                            },
                        ]
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "cta",
                        let: {
                            localID: 'CTAButton',
                            indexs: "$ctaButton"
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr: {
                                        $eq: ['$jenis', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    jenis: 1,
                                    value: 1,

                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$cta",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "adstypes",
                        as: "types",
                        let: {
                            localID: '$typeAdsID'
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
                                    "nameType": 1,

                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$types",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalView: 1,
                        CPV: 1,
                        audiensFrekuensi: 1,
                        balances: "$userBasic.balances",
                        totalSaldo: "$balancesReplace",
                        username: "$userBasicAds.userName",
                        avatar: "$userBasicAds.avatar",
                        email: "$userBasicAds.email",
                        ctaNames: {
                            $arrayElemAt: ["$cta.value", "$ctaButton"]
                        },
                        test: 1,
                        sekarang: 1,
                        ctaButton: 1,
                        viewed: {
                            $arrayElemAt: ["$adsUser.viewed", 0]
                        },
                        //tester:"$adsUser",
                        isAdsActive: {
                            $arrayElemAt: ["$adsUser.isActive", 0]
                        },
                        placingID: 1,
                        placingName: 1,
                        timestamps: 1,
                        adsId: 1,
                        userID: 1,
                        liveAt: 1,
                        liveTypeuserads: 1,
                        nameType: "$types.nameType",
                        createdAt: 1,
                        kelaminku: 1,
                        minat: 1,
                        demografis: 1,
                        umur: 1,
                        testDate: 1,
                        skipTime: { $ifNull: ["$skipTime", 0] },
                        tayang: 1,
                        tayangStart: 1,
                        tayangEnd: 1,
                        adsUserId: 1,
                        adsUser: 1,
                        liveTypeAds: 1,
                        typeAdsID: 1,
                        description: 1,
                        type: 1,
                        idApsara: 1,
                        duration: 1,
                        urlLink: 1,
                        priority: 1,
                        scoreUmur: 1,
                        scoreKelamin: 1,
                        scoreMinat: 1,
                        scoreGeografis: 1,
                        scoreTotal: 1,
                        isValid: 1,
                        objectivitasId: "$objectivitas.name_id",
                        objectivitasEn: "$objectivitas.name_en",
                        mediaBasePath: 1,
                        mediaUri: 1,
                        mediaThumBasePath: 1,
                        mediaThumUri: 1,

                    }
                },

            ]
        );
        return query;
    }

    async getAdsUser2(email: string, idUser: string, idTypeAds: string): Promise<any> {
        var query = await this.adsModel.aggregate(
            [
                {
                    $set:
                    {
                        email: email
                    }
                },
                {
                    $set:
                    {
                        idUser: new mongoose.Types.ObjectId(idUser)
                    }
                },
                {
                    $set:
                    {
                        tay:
                        {
                            $ifNull: ['$tayang', 0]
                        }
                    }
                },
                {
                    $set: {
                        "testDate":
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
                    $set: {
                        "sekarang":
                        {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": {
                                    $add: [new Date(), 25200000]
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        "tayangStart": {
                            $concat: [
                                "$liveAt",
                                " 00:00:00"
                            ]
                        }
                    }
                },
                {
                    $set: {
                        "tayangEnd": {

                            $concat: [
                                "$liveEnd",
                                " 23:59:59"
                            ]
                        }
                    }
                },
                {
                    $set: {
                        hariCount: {
                            $isoDayOfWeek: {
                                $add: [new Date(), 25200000]
                            }
                        }
                    }
                },
                {
                    $set: {
                        hari:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 1]
                                        },
                                        then: "$dayAds.monday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 2]
                                        },
                                        then: "$dayAds.tuesday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 3]
                                        },
                                        then: "$dayAds.wednesday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 4]
                                        },
                                        then: "$dayAds.thursday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 5]
                                        },
                                        then: "$dayAds.friday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 6]
                                        },
                                        then: "$dayAds.saturday"
                                    },
                                    {
                                        case: {
                                            $eq: [{
                                                $isoDayOfWeek: {
                                                    $add: [new Date(), 25200000]
                                                }
                                            }, 7]
                                        },
                                        then: "$dayAds.sunday"
                                    },

                                ],
                                default: "error hari"
                            }
                        },

                    }
                },
                {
                    $set: {
                        waktu:
                        {
                            $switch: {
                                branches:
                                    [
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_24_4", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 00:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 04:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ],

                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_4_8", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 04:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 08:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_8_12", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 08:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 12:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_12_16", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 12:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 16:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_16_20", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 16:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 20:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },
                                        {
                                            case:
                                            {
                                                $and:
                                                    [
                                                        {
                                                            $eq: ["$timeAds.time_20_24", true]
                                                        },
                                                        {
                                                            $gte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 20:00:00"
                                                                ]
                                                            }]
                                                        },
                                                        {
                                                            $lte: ["$testDate", {
                                                                $concat: [
                                                                    "$sekarang",
                                                                    " 24:00:00"
                                                                ]
                                                            }]
                                                        },

                                                    ]
                                            },
                                            then: true
                                        },

                                    ],
                                default: false
                            }
                        },

                    }
                },
                {
                    $set:
                    {
                        co: ["MALE", " MALE", "Laki-laki", "Pria"]
                    },

                },
                {
                    $set:
                    {
                        ce: ["FEMALE", " FEMALE", "Perempuan", "Wanita"]
                    }
                },
                {
                    $set:
                    {
                        all: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria", "Other"]
                    }
                },
                {
                    $set:
                    {
                        ceOther: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "Other"]
                    }
                },
                {
                    $set:
                    {
                        coOther: ["MALE", " MALE", "Laki-laki", "Pria", "Other"]
                    }
                },
                {
                    $set:
                    {
                        ceCo: ["FEMALE", " FEMALE", "Perempuan", "Wanita", "MALE", " MALE", "Laki-laki", "Pria"]
                    }
                },
                {
                    $set:
                    {
                        other: ["Other"]
                    }
                },
                {
                    $set: {
                        totKelamin: {
                            $size: "$gender"
                        }
                    }
                },
                {
                    $set: {
                        tempValue: 0
                    }
                },
                {
                    $set: {
                        tempValues: {
                            $add: ["$tempValue", 20]
                        }
                    }
                },
                {
                    $set: {
                        totAge1:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_smaller_than_14", true]
                                },
                                then: {
                                    $add: ["$tempValue", 1]
                                },
                                else: "$tempValue"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge2:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_14_smaller_than_28", true]
                                },
                                then: {
                                    $add: ["$totAge1", 1]
                                },
                                else: "$totAge1"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge3:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_29_smaller_than_43", true]
                                },
                                then: {
                                    $add: ["$totAge2", 1]
                                },
                                else: "$totAge2"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge4:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_greater_than_44", true]
                                },
                                then: {
                                    $add: ["$totAge3", 1]
                                },
                                else: "$totAge3"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totAge:
                        {
                            $cond: {
                                if: {
                                    $eq: ["$age.age_other", true]
                                },
                                then: {
                                    $add: ["$totAge4", 1]
                                },
                                else: "$totAge4"
                            }
                        },

                    }
                },
                {
                    $set: {
                        totInterest: {
                            $size: "$interestID"
                        }
                    }
                },
                {
                    $set: {
                        totLocation: {
                            $size: "$demografisID"
                        }
                    }
                },
                {
                    $set: {
                        kelamin:
                        {
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$gender", ["P"]]
                                        },
                                        then: "$ce"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L"]]
                                        },
                                        then: "$co"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O"]]
                                        },
                                        then: "$other"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L"]]
                                        },
                                        then: "$ceCo"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O"]]
                                        },
                                        then: "$coOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P"]]
                                        },
                                        then: "$ceOther"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "P", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["L", "O", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "P", "L"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["O", "L", "P"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "L", "O"]]
                                        },
                                        then: "$all"
                                    },
                                    {
                                        case: {
                                            $eq: ["$gender", ["P", "O", "L"]]
                                        },
                                        then: "$all"
                                    },

                                ],
                                default: "kancut"
                            }
                        }
                    }
                },
                {
                    $match:
                    {
                        $and: [
                            {
                                "status": "ACTIVE"
                            },
                            {
                                "reportedUser":
                                {
                                    $ne: "$email"
                                }
                            },
                            {
                                "userID":
                                {
                                    $ne: new mongoose.Types.ObjectId(idUser)
                                }
                            },
                            {
                                $expr: {
                                    $lt: ["$tayangStart", "$testDate"]
                                }
                            },
                            {
                                $expr: {
                                    $gte: ["$tayangEnd", "$testDate"]
                                }
                            },
                            {
                                typeAdsID: new mongoose.Types.ObjectId(idTypeAds),

                            }
                        ]
                    },

                },
                {
                    "$lookup": {
                        from: "newUserBasics",
                        as: "userBasic",
                        let: {
                            localID: new mongoose.Types.ObjectId(idUser)
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$localID']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $ne: ['$guestMode', true]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    from: "accountbalances",
                                    as: "balances",
                                    let: {
                                        localID: new mongoose.Types.ObjectId(idUser)
                                    },
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                $expr: {
                                                    $eq: ['$iduser', '$$localID']
                                                }
                                            }
                                        },
                                        {
                                            $facet: {
                                                kredit: [{
                                                    $group: {
                                                        _id: "$iduser",
                                                        tot: {
                                                            $sum: "$kredit",

                                                        },

                                                    }
                                                }],
                                                debet: [{
                                                    $group: {
                                                        _id: "$iduser",
                                                        tot: {
                                                            $sum: "$debet",

                                                        },

                                                    }
                                                }],

                                            }
                                        },
                                        {
                                            $project: {
                                                debet:
                                                {
                                                    $arrayElemAt: ["$debet.tot", 0]
                                                },
                                                kredit:
                                                {
                                                    $arrayElemAt: ["$kredit.tot", 0]
                                                },
                                                total:
                                                {
                                                    $subtract: [
                                                        {
                                                            $arrayElemAt: ["$kredit.tot", 0]
                                                        },
                                                        {
                                                            $arrayElemAt: ["$debet.tot", 0]
                                                        },

                                                    ]
                                                },

                                            }
                                        }
                                    ],

                                }
                            },
                            {
                                $project: {
                                    balances: {
                                        $arrayElemAt: ["$balances", 0]
                                    },
                                    debet: {
                                        $arrayElemAt: ["$balances.debet", 0]
                                    },
                                    kredit: {
                                        $arrayElemAt: ["$balances.kredit", 0]
                                    },
                                    total: {
                                        $arrayElemAt: ["$balances.total", 0]
                                    },
                                    "email": 1,

                                    "userInterests": 1,
                                    "states": ["$states"],
                                    "gender": ["$gender"],
                                    "age":
                                    {
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

                                }
                            }
                        ],

                    }
                },
                {
                    "$lookup": {
                        from: "newUserBasics",
                        as: "userBasicAds",
                        let: {
                            localID: '$userID'
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr: {
                                        $eq: ['$_id', '$$localID']
                                    }
                                    // $and: [
                                    //     {
                                    //         $expr: {
                                    //             $eq: ['$_id', '$$localID']
                                    //         }
                                    //     },
                                    //     {
                                    //         $expr: {
                                    //             $ne: ['$guestMode', true]
                                    //         }
                                    //     }
                                    // ]
                                }
                            },
                            {
                                $project: {

                                    "email": 1,
                                    "userName": "$username",
                                    avatar:
                                    {
                                        mediaEndpoint: "$mediaEndpoint"
                                    },
                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$userBasic",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $unwind: {
                        path: "$userBasicAds",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsAge",
                        let: {
                            ket: 'similarity',
                            type: 'AdsAge'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsAge",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsInterest",
                        let: {
                            ket: 'similarity',
                            type: 'AdsInterest'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsInterest",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsLocation",
                        let: {
                            ket: 'similarity',
                            type: 'AdsLocation'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', '$$ket']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', '$$type']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsLocation",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "adsGender",
                        let: {
                            ket: 'similarity',
                            type: 'AdsGender'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$remark', 'similarity']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$jenis', 'AdsGender']
                                            }
                                        }
                                    ]
                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$adsGender"
                    }
                },
                {
                    $set: {
                        kelaminku:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$kelamin", "$userBasic.gender"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$kelamin", "$userBasic.gender"]
                                    }
                                },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $set: {
                        umur:
                        {
                            $cond: {
                                if: {
                                    $and: [
                                        {
                                            $gte: ["$userBasic.age", "$ads.ageStart"]
                                        },
                                        {
                                            $lte: ["$userBasic.age", "$ads.ageEnd"]
                                        }
                                    ]
                                },
                                then: 1,
                                else: 0,

                            }
                        },

                    }
                },
                {
                    $set: {
                        demografis:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$demografisID.$id", "$userBasic.states.$id"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$demografisID.$id", "$userBasic.states.$id"]
                                    }
                                },
                                else: 0
                            }
                        },

                    }
                },
                {
                    $set: {
                        userMinat:
                        {
                            $cond: {
                                if: {
                                    $eq: ['$userBasic.userInterests', []]
                                },
                                then: "LAINNYA",
                                else: "$userBasic.userInterests"
                            }
                        },

                    }
                },
                {
                    $set: {
                        minat:
                        {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: ["$interestID.$id", "$userBasic.userInterests.$id"]
                                        }
                                    }, 0]
                                },
                                then: {
                                    $size: {
                                        $setIntersection: ["$interestID.$id", "$userBasic.userInterests.$id"]
                                    }
                                },
                                else:
                                {
                                    $cond: {
                                        if: {
                                            $in: ['$userMinat', "$interestID"]
                                        },
                                        then: 1,
                                        else: 0
                                    }
                                },

                            }
                        },

                    }
                },
                {
                    $set: {
                        scoreUmur: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsAge.value",
                                        {
                                            $divide: ["$umur", "$totAge"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set:
                    {
                        scoreKelamin: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsGender.value",
                                        {
                                            $divide: ["$kelaminku", "$totKelamin"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreMinat: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsInterest.value",
                                        {
                                            $divide: ["$minat", "$totInterest"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreGeografis: {
                            $round: [
                                {
                                    $multiply: [
                                        "$adsLocation.value",
                                        {
                                            $divide: ["$demografis", "$totLocation"]
                                        }
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $set: {
                        scoreTotal:
                        {
                            $add: ["$scoreUmur", "$scoreKelamin", "$scoreMinat", "$scoreGeografis"]
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "userads",
                        as: "adsUser",
                        let: {
                            idAds: "$_id",
                            localID: new mongoose.Types.ObjectId(idUser),
                            frekwensi: "$audiensFrekuensi"
                        },
                        pipeline: [
                            {
                                $set: {
                                    viewed: {
                                        $ifNull: ["$viewed", 0]
                                    }
                                }
                            },
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$userID', '$$localID']
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ['$adsID', '$$idAds']
                                            }
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    adsID: "$adsID",
                                    dodol: {
                                        $toString: "$adsID"
                                    },
                                    userID: 1,
                                    viewed: "$viewed",
                                    isActive: 1,

                                }
                            },

                        ],

                    }
                },
                {
                    $addFields: {
                        isValid:
                        {
                            $and: [
                                {
                                    $in: [
                                        "$_id",
                                        "$adsUser.adsID"
                                    ]
                                },

                            ]
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "adsobjectivitas",
                        as: "objectivitas",
                        let: {
                            idObj: "$adsObjectivitasId",

                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $and: [
                                        {
                                            $expr: {
                                                $eq: ['$_id', '$$idObj']
                                            }
                                        },

                                    ]
                                },

                            },
                            {
                                $project: {
                                    priority: 1,
                                    name_id: 1,
                                    name_en: 1,
                                    percentageMin: 1,

                                }
                            },

                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$objectivitas",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $set: {
                        sorts:
                        {
                            $cond: {
                                if: {
                                    $gte: ['$scoreTotal', "$objectivitas.percentageMin"]
                                },
                                then: true,
                                else: false
                            }
                        },

                    }
                },
                {
                    $set: {
                        priority: "$objectivitas.priority"
                    }
                },
                {
                    $set: {
                        priorityViewed: "$adsUser.viewed"
                    }
                },
                {
                    $sort: {
                        isValid: 1,
                        priorityViewed: 1,
                        sorts: - 1,
                        priority: 1,
                        scoreTotal: - 1
                    }
                },
                {
                    $limit: 13
                },
                {
                    $set: {
                        validasi: {
                            $ifNull: [{
                                $arrayElemAt: ["$adsUser.isActive", 0]
                            }, true]
                        }
                    }
                },
                {
                    $set: {
                        balancesReplace: { $ifNull: ["$userBasic.balances.total", 0] }
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                    },
                                    {
                                        $expr: {
                                            $lt: ["$balancesReplace", 49000
                                            ]
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": {
                                            $ne: new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', false]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": {
                                            $ne: new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                        }
                                    },

                                ]
                            },
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$isValid', false]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$validasi", true]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ['$sorts', true]
                                        }
                                    },
                                    {
                                        "userID": new mongoose.Types.ObjectId("6214438e602c354635ed7876")
                                    },
                                    {
                                        $expr: {
                                            $lt: ["$balancesReplace", 49000
                                            ]
                                        }
                                    },

                                ]
                            },
                        ]
                    }
                },
                {
                    "$lookup": {
                        from: "settings",
                        as: "cta",
                        let: {
                            localID: 'CTAButton',
                            indexs: "$ctaButton"
                        },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr: {
                                        $eq: ['$jenis', '$$localID']
                                    }
                                }
                            },
                            {
                                $project: {
                                    jenis: 1,
                                    value: 1,

                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$cta",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "adstypes",
                        as: "types",
                        let: {
                            localID: '$typeAdsID'
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
                                    "nameType": 1,

                                }
                            }
                        ],

                    }
                },
                {
                    $unwind: {
                        path: "$types",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalView: 1,
                        CPV: 1,
                        audiensFrekuensi: 1,
                        balances: "$userBasic.balances",
                        totalSaldo: "$balancesReplace",
                        username: "$userBasicAds.userName",
                        avatar: "$userBasicAds.avatar",
                        email: "$userBasicAds.email",
                        ctaNames: {
                            $arrayElemAt: ["$cta.value", "$ctaButton"]
                        },
                        test: 1,
                        sekarang: 1,
                        ctaButton: 1,
                        viewed: {
                            $arrayElemAt: ["$adsUser.viewed", 0]
                        },
                        //tester:"$adsUser",
                        isAdsActive: {
                            $arrayElemAt: ["$adsUser.isActive", 0]
                        },
                        placingID: 1,
                        placingName: 1,
                        timestamps: 1,
                        adsId: 1,
                        userID: 1,
                        liveAt: 1,
                        liveTypeuserads: 1,
                        nameType: "$types.nameType",
                        createdAt: 1,
                        kelaminku: 1,
                        minat: 1,
                        demografis: 1,
                        umur: 1,
                        testDate: 1,
                        skipTime: { $ifNull: ["$skipTime", 0] },
                        tayang: 1,
                        tayangStart: 1,
                        tayangEnd: 1,
                        adsUserId: 1,
                        adsUser: 1,
                        liveTypeAds: 1,
                        typeAdsID: 1,
                        description: 1,
                        type: 1,
                        idApsara: 1,
                        duration: 1,
                        urlLink: 1,
                        priority: 1,
                        scoreUmur: 1,
                        scoreKelamin: 1,
                        scoreMinat: 1,
                        scoreGeografis: 1,
                        scoreTotal: 1,
                        isValid: 1,
                        width: 1,
                        height: 1,
                        objectivitasId: "$objectivitas.name_id",
                        objectivitasEn: "$objectivitas.name_en",
                        mediaBasePath: 1,
                        mediaUri: 1,
                        mediaThumBasePath: 1,
                        mediaThumUri: 1,
                        mediaPortraitBasePath: 1,
                        mediaPortraitUri: 1,
                        mediaPortraitThumBasePath: 1,
                        mediaPortraitThumUri: 1,
                        widthPortrait: 1,
                        heightPortrait: 1,
                        mediaLandscapeBasePath: 1,
                        mediaLandscapeUri: 1,
                        mediaLandscapeThumBasePath: 1,
                        mediaLandscapeThumUri: 1,
                        heightLandscape: 1,
                        widthLandscape: 1,
                        idApsaraPortrait: 1,
                        idApsaraLandscape: 1,
                    }
                },

            ]
        );
        return query;
    }

    async uploadOss(buffer: Buffer, path: string) {
        var result = await this.ossContentPictService.uploadFileBuffer(buffer, path);
        return result;
    }

    async ceckAdsActive() {
        const CurrentDate = await this.utilsService.getDateString();
        const ads = await this.adsModel.find({ liveEnd: { $lte: CurrentDate }, status: "ACTIVE" });
        if (await this.utilsService.ceckData(ads)) {
            if (ads.length > 0) {
                for (let t = 0; t < ads.length; t++) {
                    let totalCredit = ads[t].totalCredit;
                    let totalUseCredit = ads[t].usedCredit;
                    let sisaCredit = totalCredit - totalUseCredit;
                    const status = "IN_ACTIVE";
                    let AdsDto_ = new AdsDto();
                    AdsDto_.status = status;
                    AdsDto_.isActive = false;
                    await this.update(ads[t]._id, AdsDto_);
                    if (sisaCredit > 0) {
                        await this.transactionsV2Service.updateTransaction(ads[t].idTransactionCreate, "FAILED", [{ "adsID": ads[t]._id, "credit": sisaCredit }]);
                    }
                    
                    // let AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
                    // AdsBalaceCreditDto_.idtrans = ads[t]._id;
                    // AdsBalaceCreditDto_.iduser = ads[t].userID;
                    // AdsBalaceCreditDto_.type = "REFUND";
                    // AdsBalaceCreditDto_.description = "ADS REFUND REMAINING CREDIT"
                    // AdsBalaceCreditDto_.idAdspricecredits = ads[t].idAdspricecredits;
                    // const cecBalanceCredit = await this.adsBalaceCreditService.find(AdsBalaceCreditDto_);
                    // if (!(await this.utilsService.ceckData(cecBalanceCredit))) {
                    //     let _AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
                    //     _AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId();
                    //     _AdsBalaceCreditDto_.iduser = ads[t].userID;
                    //     _AdsBalaceCreditDto_.debet = 0;
                    //     _AdsBalaceCreditDto_.kredit = sisaCredit;
                    //     _AdsBalaceCreditDto_.type = "REFUND";
                    //     _AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
                    //     _AdsBalaceCreditDto_.description = "ADS REFUND REMAINING CREDIT";
                    //     _AdsBalaceCreditDto_.idtrans = ads[t]._id;
                    //     _AdsBalaceCreditDto_.idAdspricecredits = ads[t].idAdspricecredits;
                    //     await this.insertBalaceDebit(_AdsBalaceCreditDto_);
                    // }
                }
            }
        }
    }

    async updateActive(id: Types.ObjectId, updatedAt: string, remark: string) {
        let data = await this.adsModel.updateMany({ "_id": id },

            { $set: { "isActive": false, "updatedAt": updatedAt, "reportedUserHandle.$[].remark": remark, "reportedUserHandle.$[].status": "DELETE", "reportedUserHandle.$[].updatedAt": updatedAt } });
        return data;
    }

    async updateActiveEmpty(id: Types.ObjectId, updatedAt: string, reportedUserHandle: any[]) {
        let data = await this.adsModel.updateMany({ "_id": id },

            { $set: { "isActive": false, "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
        return data;
    }
}
