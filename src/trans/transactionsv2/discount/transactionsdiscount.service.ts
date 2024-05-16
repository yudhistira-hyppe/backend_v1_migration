import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsDiscounts, TransactionsDiscountsDocument } from './schema/transactionsdiscount.schema';

@Injectable()
export class TransactionsDiscountsService {
    constructor(
        @InjectModel(TransactionsDiscounts.name, 'SERVER_FULL')
        private readonly transactionsDiscountsModel: Model<TransactionsDiscountsDocument>,
    ) { }

    async create(TransactionsDiscounts_: TransactionsDiscounts): Promise<TransactionsDiscounts> {
        const _TransactionsDiscounts_ = await this.transactionsDiscountsModel.create(TransactionsDiscounts_);
        return _TransactionsDiscounts_;
    }

    async update(_id: string, TransactionsDiscounts_: TransactionsDiscounts) {
        let data = await this.transactionsDiscountsModel.findByIdAndUpdate(
            _id,
            TransactionsDiscounts_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsDiscounts> {
        return await this.transactionsDiscountsModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<TransactionsDiscounts[]> {
        return await this.transactionsDiscountsModel.find().exec();
    }

    async find(TransactionsDiscounts_: TransactionsDiscounts): Promise<TransactionsDiscounts[]> {
        return await this.transactionsDiscountsModel.find(TransactionsDiscounts_).exec();
    }

    async findByuser(idUser: string): Promise<TransactionsDiscounts> {
        return await this.transactionsDiscountsModel.findOne({ idUser: new mongoose.Types.ObjectId(idUser) }).limit(1).skip(0).sort({ createdAt:-1 }).exec();
    }
}
