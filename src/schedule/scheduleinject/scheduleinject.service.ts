import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Scheduleinject, ScheduleinjectDocument } from './schemas/scheduleinject.schema';

@Injectable()
export class ScheduleinjectService {

    constructor(
        @InjectModel(Scheduleinject.name, 'SERVER_FULL_CRON')
        private readonly ScheduleinjectModel: Model<ScheduleinjectDocument>,
    ) { }

    async create(Scheduleinject_: Scheduleinject): Promise<Scheduleinject> {
        const _Scheduleinject_ = await this.ScheduleinjectModel.create(Scheduleinject_);
        return _Scheduleinject_;
    }

    async findOne(id: string): Promise<Scheduleinject> {
        return this.ScheduleinjectModel.findOne({ _id: new Types.ObjectId(id), active: true }).exec();
    }

    async find(): Promise<Scheduleinject[]> {
        return this.ScheduleinjectModel.find({ active: true }).exec();
    }
    async findBypostID(postID: string): Promise<Scheduleinject> {
        return this.ScheduleinjectModel.findOne({ postID: postID }).exec();
    }
    async findByType(type: string): Promise<Scheduleinject[]> {
        return this.ScheduleinjectModel.find({ type: type }).exec();
    }
    async update(id: string, Scheduleinject_: Scheduleinject): Promise<Scheduleinject> {
        let data = await this.ScheduleinjectModel.findByIdAndUpdate(id, Scheduleinject_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }


        return data;
    }

    async delete(id: string) {
        const data = await this.ScheduleinjectModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.ScheduleinjectModel.updateOne({ "_id": id },
            {
                $set: {
                    "active": false
                }
            });
        return data;
    }

    async listdetail() {
        var pipeline = [];

        pipeline.push(
            {
                $set: {
                    "timenow": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    "timenow2": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    },
                  
                }
            },
                    {
                $set: {
                   
                    "timenowmin": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25140000
                                ]
                            }
                        }
                    }
                }
            },
                {
                $set: {
                   
                    "timenowplus": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25260000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$time',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "postID": 1,
                    "time": 1,
                    "emailPost": 1,
                    "timenow": 1,
                    "timenow2": 1,
                    "timenowplus": 1,
                                "timenowmin": 1,
                    "datetime": {
                        $concat: ["$timenow", " ", "$time"]
                    }
                }
            },
                {
                    "$match": 
                    {
                        "$and": 
                        [
                            
                            {
                                $expr: 
                                {
                                    $gt: 
                                    [
                                        "$datetime",
                                        "$timenowmin"
                                        // start,
                                    ]
                                },
                                
                            },
                            {
                                $expr: 
                                {
                                    $lt: 
                                    [
                                        "$datetime",
                                         "$timenowplus"
                                        // dateend,
                                    ]
                                },
                                
                            },
                            
                        ]
                    }
                },
            {
                $lookup: 
                {
                    from: "postTask",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    "postID": 1,
                    "time": 1,
                    "emailPost": 1,
                    "timenow": 1,
                    "timenow2": 1,
                    "datetime": 1,
                                 "timenowplus": 1,
                                 "timenowmin": 1,
                    "viewCount": {
                        "$arrayElemAt": 
                        [
                            "$postdata.viewCount",
                            0
                        ]
                    },
                    "likeCount": {
                        "$arrayElemAt": 
                        [
                            "$postdata.likeCount",
                            0
                        ]
                    },
                    
                }
            },
        );


        var query = await this.ScheduleinjectModel.aggregate(pipeline);

        return query;
    }

    async listdetailold(start:string,dateend:string) {
        var pipeline = [];

        pipeline.push(
            {
                $set: {
                    "timenow": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $set: {
                    "timenow2": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25200000
                                ]
                            }
                        }
                    },
                  
                }
            },
                    {
                $set: {
                   
                    "timenowmin": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25140000
                                ]
                            }
                        }
                    }
                }
            },
                {
                $set: {
                   
                    "timenowplus": 
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                                $add: [
                                    new Date(),
                                    25260000
                                ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$time',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "postID": 1,
                    "time": 1,
                    "emailPost": 1,
                    "timenow": 1,
                    "timenow2": 1,
                    "timenowplus": 1,
                                "timenowmin": 1,
                    "datetime": {
                        $concat: ["$timenow", " ", "$time"]
                    }
                }
            },
                {
                    "$match": 
                    {
                        "$and": 
                        [
                            
                            {
                                $expr: 
                                {
                                    $gt: 
                                    [
                                        "$datetime",
                                       // "$timenowmin"
                                         start,
                                    ]
                                },
                                
                            },
                            {
                                $expr: 
                                {
                                    $lt: 
                                    [
                                        "$datetime",
                                        // "$timenowplus"
                                         dateend,
                                    ]
                                },
                                
                            },
                            
                        ]
                    }
                },
            {
                $lookup: 
                {
                    from: "postTask",
                    localField: "postID",
                    foreignField: "postID",
                    as: "postdata"
                }
            },
            {
                $project: {
                    "postID": 1,
                    "time": 1,
                    "emailPost": 1,
                    "timenow": 1,
                    "timenow2": 1,
                    "datetime": 1,
                                 "timenowplus": 1,
                                 "timenowmin": 1,
                    "viewCount": {
                        "$arrayElemAt": 
                        [
                            "$postdata.viewCount",
                            0
                        ]
                    },
                    "likeCount": {
                        "$arrayElemAt": 
                        [
                            "$postdata.likeCount",
                            0
                        ]
                    },
                    
                }
            },
        );


        var query = await this.ScheduleinjectModel.aggregate(pipeline);

        return query;
    }

}
