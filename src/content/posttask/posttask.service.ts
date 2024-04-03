import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Posttask, PosttaskDocument } from './schemas/posttask.schema';

@Injectable()
export class PosttaskService {

    constructor(
        @InjectModel(Posttask.name, 'SERVER_FULL_CRON')
        private readonly PosttaskModel: Model<PosttaskDocument>,
      
    ) { }

    async create(Posttask_: Posttask): Promise<Posttask> {
        const _Posttask_ = await this.PosttaskModel.create(Posttask_);
        return _Posttask_;
    }

    async findOne(id: string): Promise<Posttask> {
        return this.PosttaskModel.findOne({ _id: new Types.ObjectId(id), active: true }).exec();
    }
    async findBypostID(postID: string): Promise<Posttask> {
        return this.PosttaskModel.findOne({ postID: postID }).exec();
    }

    async find(): Promise<Posttask[]> {
        return this.PosttaskModel.find({ active: true }).exec();
    }

    async update(id: string, Posttask_: Posttask): Promise<Posttask> {
        let data = await this.PosttaskModel.findByIdAndUpdate(id, Posttask_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }


        return data;
    }

   
}
