import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monetizenew, MonetizenewDocument } from './schemas/monetizenew.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';

import mongoose from 'mongoose';
import { OssService } from 'src/stream/oss/oss.service';
const sharp = require('sharp');

@Injectable()
export class MonetizenewService {
    constructor(
        @InjectModel(Monetizenew.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizenewDocument>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService,

    ) { }

    async find(): Promise<Monetizenew[]> {
        return this.monetData.find().exec();
    }

    async findOne(id: string): Promise<Monetizenew> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.monetData.findById(setid);
        return data;
    }
}