import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AdsBalaceCredit, AdsBalaceCreditDocument } from "./schema/adsbalacecredit.schema";
import mongoose, { Model } from "mongoose";
import { AdsBalaceCreditDto } from "./dto/adsbalacecredit.dto";

@Injectable()
export class AdsBalaceCreditService {

    constructor(
        @InjectModel(AdsBalaceCredit.name, 'SERVER_FULL')
        private readonly adsbalaceCreditModel: Model<AdsBalaceCreditDocument>,
    ) { }

    async create(AdsBalaceCreditDto_: AdsBalaceCreditDto): Promise<AdsBalaceCredit> {
        const _AdsBalaceCreditDto_ = await this.adsbalaceCreditModel.create(AdsBalaceCreditDto_);
        return _AdsBalaceCreditDto_;
    }

    async update(_id: string, AdsBalaceCreditDto_: AdsBalaceCreditDto) {
        const _AdsBalaceCreditDto_ = this.adsbalaceCreditModel.updateOne(
            { _id: Object(_id) },
            AdsBalaceCreditDto_,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
    }

    async delete(id: string) {
        this.adsbalaceCreditModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<AdsBalaceCredit[]> {
        return await this.adsbalaceCreditModel.find().exec();
    }

    async find(AdsPurposesDto_: AdsBalaceCreditDto): Promise<AdsBalaceCredit[]> {
        return await this.adsbalaceCreditModel.find(AdsPurposesDto_).exec();
    }

    async findOne(id: string): Promise<AdsBalaceCredit> {
        return await this.adsbalaceCreditModel.findOne({ _id: Object(id) }).exec();
    }

    async findByUser(iduser: string): Promise<AdsBalaceCredit[]> {
        return await this.adsbalaceCreditModel.find({ iduser: Object(iduser) }).exec();
    }

    async findsaldoKredit(iduser: object) {
        const query = await this.adsbalaceCreditModel.aggregate([
            {
                $match: {
                    "iduser": iduser
                }
            },
            { $group: { _id: null, saldoKredit: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalUseKredit: { $sum: "$debet" }, totalBuyKredit: { $sum: "$kredit" } } },
            {
                $project:{
                    _id:0,
                    saldoKredit: 1,
                    totalUseKredit: 1,
                    totalBuyKredit: 1
                }
            }
        ]);
        return query;
    }

    async findsaldoKreditBackup(iduser: object) {
        const query = await this.adsbalaceCreditModel.aggregate([
            {
                $match: {
                    "iduser": iduser
                }
            },
            { $group: { _id: null, saldoKredit: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalUseKredit: { $sum: "$kredit" }, totalBuyKredit: { $sum: "$debet" } } },
            {
                $project: {
                    _id: 0,
                    saldoKredit: 1,
                    totalUseKredit: 1,
                    totalBuyKredit: 1
                }
            }
        ]);
        return query;
    }

    async findByUserDetail(iduser: string): Promise<AdsBalaceCredit[]> {
        let query = await this.adsbalaceCreditModel.aggregate([
            {
                $match: {
                    iduser: iduser
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }

        ]);
        return query;
    }

    async findCriteria(pageNumber: number, pageRow: number): Promise<AdsBalaceCredit[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        const query = await this.adsbalaceCreditModel.find().limit(perPage).skip(perPage * page).sort({ createdAt: 'desc' });
        return query;
    }

    async list(page: number, limit: number, descending: boolean, startdate: string, enddate: string, idUser: string, remark: any[],type:string) {
        var pipeline = [];
        var order = null;
        var dateendSurvey = null;
        var currentdate = null;
        var dateend = null;
 
        try {
            currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }

     

        if (descending === true) {
            order = -1;
        } else {
            order = 1;
        }
        pipeline.push(
            {
                $match: {
                    $and: [
                        {
                            $expr: {
                                $eq: ['$iduser',new mongoose.Types.ObjectId(idUser)]
                            }
                        }
                    ]
                },
                
            },
            {
                $sort: {
                    timestamp: 1
                }
            },
            {
                "$lookup": {
                    from: "transactionsV2",
                    as: "trans",
                    let: {
                        localID: '$idtrans'
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
                                        "status": "SUCCESS",
                                        
                                    },
                                    
                                ]
                            },
                            
                        },
                        {
                            $project: {
                                detail: 1,
                                paket: {
                                    $toObjectId: {
                                        $arrayElemAt: ['$detail.paketID', 0]
                                    }
                                },
                                ads: {
                                    $toObjectId: {
                                        $arrayElemAt: ['$detail.adsID', 0]
                                    }
                                },
                                
                            }
                        },
                        {
                            "$lookup": {
                                from: "monetize",
                                as: "packet",
                                let: {
                                    localID: '$paket'//{$arrayElemAt:[ '$trans.detail.paketID',0]}
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
                                                
                                            ]
                                        },
                                        
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            
                                        }
                                    },
                                    
                                ],
                                
                            }
                        },
                        {
                            "$lookup": {
                                from: "ads",
                                as: "iklan",
                                let: {
                                    localID: '$ads'//{$arrayElemAt:[ '$trans.detail.paketID',0]}
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
                                                
                                            ]
                                        },
                                        
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            
                                        }
                                    },
                                    
                                ],
                                
                            }
                        },
                        //{
                        //    $unwind: {
                        //        path: '$ads'
                        //    }
                        //}
                        {
                            $set: {
                                names: {
                                    $concatArrays: ['$iklan', '$packet']
                                }
                            }
                        },
                        {
                            $unwind: {
                                path: '$names'
                            }
                        },
                        
                    ],
                    
                }
            },
            {
                $unwind: {
                    path: '$trans'
                }
            },
            {
                $project: {
                    timestamp: 1,
                    type: 1,
                    name: '$trans.names.name',
                    credit: {
                        $cond: {
                            if : {
                                $eq: ["$type", "USE"]
                            },
                            then: 
                            {
                                $concat: ['-', {
                                    $toString: {
                                        $arrayElemAt: ['$trans.detail.credit', 0]
                                    }
                                }]
                            },
                            else : 
                                {
                                $concat: ['+', {
                                    $toString: {
                                        $arrayElemAt: ['$trans.detail.credit', 0]
                                    }
                                }]
                            },
                            
                        }
                    },
                    remark: {
                        $switch: 
                        {
                            branches: [
                                {
                                    case: {
                                        $eq: ['$type', 'TOPUP']
                                    },
                                    then: "Credit Ditambahkan"
                                },
                                {
                                    case: {
                                        $eq: ['$type', 'USE']
                                    },
                                    then: "Credit Digunakan"
                                },
                                {
                                    case: {
                                        $eq: ['$type', 'REFUND']
                                    },
                                    then: "Credit Dikembalikan"
                                },
                                {
                                    case: {
                                        $eq: ['$type', 'REJECT']
                                    },
                                    then: "Credit Dikembalikan"
                                },
                                
                            ],
                            default: "Credit Ditambahkan"
                        }
                    }
                }
            }

        );

     
        if (type && type !== undefined) {

            pipeline.push({
                $match: {
                    type: type

                }
            },);

        }
      
        if (remark && remark !== undefined) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            remark: {
                                $in: remark
                            }
                        },

                    ]
                }
            },);
        }
        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { timestamp: { "$lte": dateend } } });
        }
       
        pipeline.push({
            $sort: {
                _id: order,
                timestamp: order
            },

        },);
        if (page > 0) {
            pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        var query = await this.adsbalaceCreditModel.aggregate(pipeline);

        return query;
    }
}