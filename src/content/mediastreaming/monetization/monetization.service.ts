import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Monetize, MonetizeDocument } from 'src/trans/monetization/schemas/monetization.schema';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class MonetizationService {
    constructor(
        @InjectModel(Monetize.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizeDocument>,
        private readonly utilsService: UtilsService,
    ) { }

    async findOne(id: string): Promise<Monetize> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.monetData.findById(setid);
        return data;
    }

    async updateStock(id: string, quantity: number, reduce: boolean) {
        let packageData = await this.monetData.findById(id);
        let currentStock = packageData.last_stock;
        let usedStock = packageData.used_stock;
        if (reduce) {
            return this.monetData.findByIdAndUpdate(id, { last_stock: currentStock - quantity, used_stock: usedStock + quantity, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
        } else {
            return this.monetData.findByIdAndUpdate(id, { last_stock: currentStock + quantity, used_stock: usedStock - quantity, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
        }
    }
}
