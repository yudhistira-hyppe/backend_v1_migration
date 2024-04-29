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
}
