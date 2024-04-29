import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsBalanceds, TransactionsBalancedsDocument } from './schema/transactionsbalanceds.schema';

@Injectable()
export class TransactionsBalancedsService {
    constructor(
        @InjectModel(TransactionsBalanceds.name, 'SERVER_FULL')
        private readonly transactionsBalancedsModel: Model<TransactionsBalancedsDocument>,
    ) { }

    async create(TransactionsBalanceds_: TransactionsBalanceds): Promise<TransactionsBalanceds> {
        const _Balanceds_ = await this.transactionsBalancedsModel.create(TransactionsBalanceds_);
        return _Balanceds_;
    }

    async update(_id: string, TransactionsBalanceds_: TransactionsBalanceds) {
        let data = await this.transactionsBalancedsModel.findByIdAndUpdate(
            _id,
            TransactionsBalanceds_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsBalanceds> {
        return await this.transactionsBalancedsModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<TransactionsBalanceds[]> {
        return await this.transactionsBalancedsModel.find().exec();
    }

    async find(TransactionsBalanceds_: TransactionsBalanceds): Promise<TransactionsBalanceds[]> {
        return await this.transactionsBalancedsModel.find(TransactionsBalanceds_).exec();
    }

    async findByuser(idUser: string): Promise<TransactionsBalanceds> {
        return await this.transactionsBalancedsModel.findOne({ idUser: new mongoose.Types.ObjectId(idUser) }).limit(1).skip(0).sort({ createdAt:-1 }).exec();
    }

    async findsaldo(idUser: string) {
        const query = await this.transactionsBalancedsModel.aggregate([
            {
                $match: {
                    "idUser": new mongoose.Types.ObjectId(idUser)
                }
            },
            { $group: { _id: null, totalSaldo: { $sum: { $subtract: ["$debit", "$credit"] } }, totalDebit: { $sum: "$debit" }, totalCredit: { $sum: "$credit" } } },
        ]);
        return query;
    }
}
