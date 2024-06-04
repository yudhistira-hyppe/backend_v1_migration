import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Ads, AdsDocument } from "src/trans/adsv2/ads/schema/ads.schema";


@Injectable()
export class AdsService {
    private readonly logger = new Logger(AdsService.name);
    constructor(
        @InjectModel(Ads.name, 'SERVER_FULL')
        private readonly adsModel: Model<AdsDocument>,
    ) { }
    
    async findOne(id: string): Promise<Ads> {
        return await this.adsModel.findOne({ _id: Object(id) }).exec();
    }
}
