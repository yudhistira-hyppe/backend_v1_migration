import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsCoaTable, TransactionsCoaTableDocument } from './schema/transactionscoatable.schema';

@Injectable()
export class TransactionsCoaTableService {
    constructor(
        @InjectModel(TransactionsCoaTable.name, 'SERVER_FULL')
        private readonly transactionsCoaTableModel: Model<TransactionsCoaTableDocument>,
    ) { }

    async create(TransactionsCoaTable_: TransactionsCoaTable): Promise<TransactionsCoaTable> {
        const _TransactionsCoaTable_ = await this.transactionsCoaTableModel.create(TransactionsCoaTable_);
        return _TransactionsCoaTable_;
    }

    async updateData(_TransactionsCoa_: TransactionsCoaTable, TransactionsCoa_: TransactionsCoaTable) {
        let data = await this.transactionsCoaTableModel.findOneAndUpdate(
            _TransactionsCoa_,
            TransactionsCoa_,
            { new: true });
        return data;
    }

    async update(_id: string, TransactionsCoaTable_: TransactionsCoaTable) {
        let data = await this.transactionsCoaTableModel.findByIdAndUpdate(
            _id,
            TransactionsCoaTable_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsCoaTable> {
        return await this.transactionsCoaTableModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<TransactionsCoaTable[]> {
        return await this.transactionsCoaTableModel.find().exec();
    }

    async find(TransactionsCoaTable_: TransactionsCoaTable): Promise<TransactionsCoaTable[]> {
        return await this.transactionsCoaTableModel.find(TransactionsCoaTable_).exec();
    }
}
