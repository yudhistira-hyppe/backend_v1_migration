import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Monetize, MonetizeDocument } from 'src/trans/monetization/schemas/monetization.schema';

@Injectable()
export class MonetizationService {
    constructor(
        @InjectModel(Monetize.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizeDocument>,
    ) { }

    async findOne(id: string): Promise<Monetize> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.monetData.findById(setid);
        return data;
    }
}
