import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monetizenew2, Monetizenew2Document } from './schemas/Monetizenew.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';

import mongoose from 'mongoose';
import { OssService } from 'src/stream/oss/oss.service';
const sharp = require('sharp');

@Injectable()
export class Monetizenew2Service {
    constructor(
        @InjectModel(Monetizenew2.name, 'SERVER_FULL')
        private readonly monetData: Model<Monetizenew2Document>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService,

    ) { }

    async find(): Promise<Monetizenew2[]> {
        return this.monetData.find().exec();
    }

    async findOne(id: string): Promise<Monetizenew2> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.monetData.findById(setid);
        return data;
    }

    async updateStock(id: string,last_stock:number,used_stock:number): Promise<Object> {
        let data = await this.monetData.updateOne({ _id: new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    last_stock: last_stock,
                    used_stock: used_stock
                  
                }
            });
        return data;
    }
}