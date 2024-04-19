import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Historyuser, HistoryuserDocument } from './schemas/historyuser.schema';

@Injectable()
export class HistoryuserService {

    constructor(
        @InjectModel(Historyuser.name, 'SERVER_FULL_CRON')
        private readonly HistoryuserModel: Model<HistoryuserDocument>,
    ) { }

    async create(Historyuser_: Historyuser): Promise<Historyuser> {
        const _Historyuser_ = await this.HistoryuserModel.create(Historyuser_);
        return _Historyuser_;
    }

    async findOne(id: string): Promise<Historyuser> {
        return this.HistoryuserModel.findOne({ _id: new Types.ObjectId(id), active: true }).exec();
    }

    async findBymailPostId(postID: string,email:string,event:string): Promise<Historyuser> {
        return this.HistoryuserModel.findOne({ postID:postID,email:email,event:event }).exec();
    }
    async findByview(postID: string,event:string): Promise<Historyuser[]> {
        return this.HistoryuserModel.find({ postID:postID,event:event }).exec();
    }
    async findBymailView(postID: string,email:string,event:string): Promise<Historyuser> {
        return this.HistoryuserModel.findOne({ postID:postID,email:email,event:event }).exec();
    }

    async findFcm(): Promise<Historyuser[]> {
        return this.HistoryuserModel.find({ event:"LIKE",sendFcm:false }).sort({createdAt:1}).exec();
    }

    async findFcmview(postID:string): Promise<Historyuser[]> {
        return this.HistoryuserModel.find({ event:"VIEW",postID:postID,sendFcm:false }).sort({createdAt:1}).limit(1).exec();
    }
    async find(): Promise<Historyuser[]> {
        return this.HistoryuserModel.find({ active: true }).exec();
    }

    async update(id: string, Historyuser_: Historyuser): Promise<Historyuser> {
        let data = await this.HistoryuserModel.findByIdAndUpdate(id, Historyuser_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }


        return data;
    }

    async delete(id: string) {
        const data = await this.HistoryuserModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateFcm(id: string,createdAt:string): Promise<Object> {
        let data = await this.HistoryuserModel.updateOne({ "_id": id },
            {
                $set: {
                   sendFcm:true,
                   updatedAt:createdAt
                }
            });
        return data;
    }

    async updateFcmview(postID: string,createdAt:string,email:string): Promise<Object> {
        let data = await this.HistoryuserModel.updateOne({ postID: postID,email:email ,event:"VIEW"},
            {
                $set: {
                   sendFcm:true,
                   updatedAt:createdAt
                }
            });
        return data;
    }

    async updateFcmlike(postID: string,createdAt:string,email:string): Promise<Object> {
        let data = await this.HistoryuserModel.updateOne({ postID: postID,email:email ,event:"LIKE"},
            {
                $set: {
                   sendFcm:true,
                   updatedAt:createdAt
                }
            });
        return data;
    }
}
