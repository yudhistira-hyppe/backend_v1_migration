import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Postchallenge, PostchallengeDocument } from './schemas/postchallenge.schema';

@Injectable()
export class PostchallengeService {

    constructor(
        @InjectModel(Postchallenge.name, 'SERVER_FULL')
        private readonly PostchallengeModel: Model<PostchallengeDocument>,
    ) { }

    async create(Postchallenge_: Postchallenge): Promise<Postchallenge> {
        const _Postchallenge_ = this.PostchallengeModel.create(Postchallenge_);
        return _Postchallenge_;
    }

    async findOne(id: string): Promise<Postchallenge> {
        return this.PostchallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }

    async findBypostID(postID: string): Promise<Postchallenge> {
        return this.PostchallengeModel.findOne({ postID: postID }).exec();
    }

    async find(): Promise<Postchallenge[]> {
        return this.PostchallengeModel.find().exec();
    }

    async update(id: string, Postchallenge_: Postchallenge): Promise<Postchallenge> {
        let data = await this.PostchallengeModel.findByIdAndUpdate(id, Postchallenge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updatebYpostID(postID: string, Postchallenge_: Postchallenge): Promise<Postchallenge> {
        let data = await this.PostchallengeModel.findByIdAndUpdate(postID, Postchallenge_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updatePostchallenge(id: string, score: number) {
        this.PostchallengeModel.updateOne(
            {

                _id: new Types.ObjectId(id),
            },
            { $inc: { score: score } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateUnchallnge(id: string, score: number) {
        this.PostchallengeModel.updateOne(
            {

                _id: new Types.ObjectId(id),
            },
            { $inc: { score: -score } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }
}