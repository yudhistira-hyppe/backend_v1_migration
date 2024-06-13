import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsCredits, TransactionsCreditsDocument } from './schema/transactionscredits.schema';

@Injectable()
export class TransactionsCreditsService {
    constructor(
        @InjectModel(TransactionsCredits.name, 'SERVER_FULL')
        private readonly transactionsCreditsModel: Model<TransactionsCreditsDocument>,
    ) { }

    async create(TransactionsCredits_: TransactionsCredits): Promise<TransactionsCredits> {
        const _TransactionsCredits_ = await this.transactionsCreditsModel.create(TransactionsCredits_);
        return _TransactionsCredits_;
    }

    async update(_id: string, TransactionsCredits_: TransactionsCredits) {
        let data = await this.transactionsCreditsModel.findByIdAndUpdate(
            _id,
            TransactionsCredits_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsCredits> {
        return await this.transactionsCreditsModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<TransactionsCredits[]> {
        return await this.transactionsCreditsModel.find().exec();
    }

    async find(TransactionsCredits_: TransactionsCredits): Promise<TransactionsCredits[]> {
        return await this.transactionsCreditsModel.find(TransactionsCredits_).exec();
    }

    async findByuser(idUser: string): Promise<TransactionsCredits> {
        return await this.transactionsCreditsModel.findOne({ idUser: new mongoose.Types.ObjectId(idUser) }).limit(1).skip(0).sort({ createdAt:-1 }).exec();
    }

    async listingDetail(idtraget:string, name:string, transaction:string, checkdiscount:boolean, startdate:string, enddate:string, order:boolean, page:number, limit:number)
    {
        var pipeline = [];

        pipeline.push(
            {
                "$match":
                {
                    "detail.paketID": idtraget
                }
            },
            {
                "$lookup":
                {
                    from:"monetize",
                    let:
                    {
                        listVoucher:"$voucherDiskon"
                    },
                    as:"datadiskon",
                    pipeline:
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$in":
                                    [
                                        "$_id",
                                        "$$listVoucher"
                                    ]
                                }
                            }
                        },
                        {
                            "$project":
                            {
                                _id:1,
                                name:1
                            }
                        }
                    ]
                }
            },
            {
                "$lookup":
                {
                    from:"newUserBasics",
                    localField:"idUser",
                    foreignField:"_id",
                    as:"datauser"
                }
            },
            {
                "$lookup":
                {
                    from:"transactionsV2",
                    localField:"noInvoice",
                    foreignField:"noInvoice",
                    as:"datatransaksi"
                }
            },
            {
                "$project":
                {
                    _id:
                    {
                        "$arrayElemAt":
                        [
                            "$datatransaksi._id", 0
                        ]
                    },
                    createdAt:1,
                    updatedAt:1,
                    idTransaction:
                    {
                        "$arrayElemAt":
                        [
                            "$datatransaksi.idTransaction", 0
                        ]
                    },
                    noInvoice:
                    {
                        "$arrayElemAt":
                        [
                            "$datatransaksi.noInvoice", 0
                        ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                        [
                            "$datauser.username", 0
                        ]
                    },
                    fullName:
                    {
                        "$arrayElemAt":
                        [
                            "$datauser.fullName", 0
                        ]
                    },
                    email:
                    {
                        "$arrayElemAt":
                        [
                            "$datauser.email", 0
                        ]
                    },
                    avatar: 
                    {
                        mediaBasePath: 
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$datauser.mediaBasePath", 0
                                    ]
                                },
                                null
                            ]
                        },
                        mediaUri: 
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$datauser.mediaUri", 0
                                    ]
                                },
                                null
                            ]
                        },
                        mediaType: 
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$datauser.mediaType", 0
                                    ]
                                },
                                null
                            ]
                        },
                        mediaEndpoint: 
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$datauser.mediaEndpoint", 0
                                    ]
                                },
                                null
                            ]
                        }
                    },
                    using_discount:
                    {
                        "$cond":
                        {
                            "if":
                            {
                                "$ne":
                                [
                                    {
                                        "$size":"$voucherDiskon"
                                    },
                                    0
                                ]
                            },
                            "then":true,
                            "else":false
                        }
                    },
                    totalCredit:
                    {
                        "$arrayElemAt":
                        [
                            "$detail.amount", 0
                        ]
                    },
                    totalDiscount:
                    {
                        "$arrayElemAt":
                        [
                            "$detail.discountCoin", 0
                        ]
                    },
                    total:
                    {
                        "$arrayElemAt":
                        [
                            "$detail.totalAmount", 0
                        ]
                    },
                }
            }
        );

        var matchand = [];
        if(name != null)
        {
            matchand.push(
                {
                    "$or":
                    [
                        {
                            "username":
                            {
                                "$regex":name,
                                "$options":"i"
                            }
                        },
                        {
                            "fullName":
                            {
                                "$regex":name,
                                "$options":"i"
                            }
                        },
                        {
                            "email":
                            {
                                "$regex":name,
                                "$options":"i"
                            }
                        },
                    ]
                }
            );    
        }

        if(transaction != null)
        {
            matchand.push(
                {
                    "noInvoice":
                    {
                        "$regex":transaction,
                        "$options":"i"
                    }
                }
            );
        }

        if(checkdiscount != null)
        {
            matchand.push(
                {
                    "using_discount":checkdiscount
                }
            )    
        }

        if(startdate != null && enddate != null)
        {
            try {
                var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
                var dateend = currentdate.toISOString().split("T")[0];
            } catch (e) {
                dateend = enddate.substring(0,10);
            }

            matchand.push(
                {
                    "createdAt":
                    {
                        "$gte":startdate,
                        "$gt":dateend
                    }
                }
            );
        }

        if(matchand.length != 0)
        {
            pipeline.push(
                {
                    "$match":
                    {
                        "$and":matchand
                    }
                }
            );    
        }

        pipeline.push(
            {
                "$sort":
                {
                    "createdAt":(order == true ? -1 : 1)
                }
            },
            {
                "$skip":page
            },
            {
                "$limit":limit
            }
        );

        var data = await this.transactionsCreditsModel.aggregate(pipeline);
        return data;
    }
}
