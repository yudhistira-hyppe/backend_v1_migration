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

 

}
