import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsCoinSettings, TransactionsCoinSettingsDocument } from './schema/transactionscoinsettings.schema';

@Injectable()
export class TransactionsCoinSettingsService {
    constructor(
        @InjectModel(TransactionsCoinSettings.name, 'SERVER_FULL')
        private readonly transactionsCoinSettingsModel: Model<TransactionsCoinSettingsDocument>,
    ) { }

    async create(TransactionsCoinSettings_: TransactionsCoinSettings): Promise<TransactionsCoinSettings> {
        await this.updateStatus();
        const _Balanceds_ = await this.transactionsCoinSettingsModel.create(TransactionsCoinSettings_);
        return _Balanceds_;
    }

    async update(_id: string, TransactionsCoinSettings_: TransactionsCoinSettings) {
        let data = await this.transactionsCoinSettingsModel.findByIdAndUpdate(
            _id,
            TransactionsCoinSettings_,
            { new: true });
        return data;
    }

    async updateStatus() {
        let data = await this.transactionsCoinSettingsModel.updateMany({ status: true },
            { $set: { status: false } }, { new: true });
        return data;
    }

    async findStatusActive(): Promise<TransactionsCoinSettings> {
        return this.transactionsCoinSettingsModel.findOne({ status: true }).exec();
    }

    async findOne(id: string): Promise<TransactionsCoinSettings> {
        return await this.transactionsCoinSettingsModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<TransactionsCoinSettings[]> {
        return await this.transactionsCoinSettingsModel.find().exec();
    }

    async find(TransactionsCoinSettings_: TransactionsCoinSettings): Promise<TransactionsCoinSettings[]> {
        return await this.transactionsCoinSettingsModel.find(TransactionsCoinSettings_).exec();
    }

    async findByuser(idUser: string): Promise<TransactionsCoinSettings> {
        return await this.transactionsCoinSettingsModel.findOne({ idUser: new mongoose.Types.ObjectId(idUser) }).limit(1).skip(0).sort({ createdAt:-1 }).exec();
    }
}
