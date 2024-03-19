import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { transactionCoin, transactionCoinDocument, transactionCoinSchema } from './schemas/transactionCoin.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import mongoose from 'mongoose';
const sharp = require('sharp');

@Injectable()
export class transactionCoinService {
    constructor(
        @InjectModel(transactionCoin.name, 'SERVER_FULL')
        private readonly trans: Model<transactionCoinDocument>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService,
        private readonly LogAPISS: LogapisService,
    ) { }

    async find(): Promise<transactionCoin[]> {
        return this.trans.find().exec();
    }

    async findOne(id: string): Promise<transactionCoin> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.trans.findById(setid);
        return data;
    }

    async updateOne(id: string, data: transactionCoin) {
        var setid = new mongoose.Types.ObjectId(id);
        return this.trans.findByIdAndUpdate(setid, data, { new: true });
    }
}
