import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AdsBalaceCredit, AdsBalaceCreditDocument } from "./schema/adsbalacecredit.schema";
import { Model } from "mongoose";
import { AdsBalaceCreditDto } from "./dto/adsbalacecredit.dto";

@Injectable()
export class AdsBalaceCreditService {

    constructor(
        @InjectModel(AdsBalaceCredit.name, 'SERVER_FULL')
        private readonly adsbalaceCreditModel: Model<AdsBalaceCreditDocument>,
    ) { }

    async create(AdsBalaceCreditDto_: AdsBalaceCreditDto): Promise<AdsBalaceCredit> {
        const _AdsBalaceCreditDto_ = await this.adsbalaceCreditModel.create(AdsBalaceCreditDto_);
        return _AdsBalaceCreditDto_;
    }

    async update(_id: string, AdsBalaceCreditDto_: AdsBalaceCreditDto) {
        const _AdsBalaceCreditDto_ = this.adsbalaceCreditModel.updateOne(
            { _id: Object(_id) },
            AdsBalaceCreditDto_,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
    }

    async delete(id: string) {
        this.adsbalaceCreditModel.deleteOne({ _id: Object(id) }).exec();
    }

    async filAll(): Promise<AdsBalaceCredit[]> {
        return await this.adsbalaceCreditModel.find().exec();
    }

    async find(AdsPurposesDto_: AdsBalaceCreditDto): Promise<AdsBalaceCredit[]> {
        return await this.adsbalaceCreditModel.find(AdsPurposesDto_).exec();
    }

    async findOne(id: string): Promise<AdsBalaceCredit> {
        return await this.adsbalaceCreditModel.findOne({ _id: Object(id) }).exec();
    }

    async findByUser(iduser: string): Promise<AdsBalaceCredit[]> {
        return await this.adsbalaceCreditModel.find({ iduser: Object(iduser) }).exec();
    }

    async findsaldoKredit(iduser: object) {
        const query = await this.adsbalaceCreditModel.aggregate([
            {
                $match: {
                    "iduser": iduser
                }
            },
            { $group: { _id: null, saldoKredit: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalUseKredit: { $sum: "$debet" }, totalBuyKredit: { $sum: "$kredit" } } },
            {
                $project:{
                    _id:0,
                    saldoKredit: 1,
                    totalUseKredit: 1,
                    totalBuyKredit: 1
                }
            }
        ]);
        return query;
    }

    async findsaldoKreditBackup(iduser: object) {
        const query = await this.adsbalaceCreditModel.aggregate([
            {
                $match: {
                    "iduser": iduser
                }
            },
            { $group: { _id: null, saldoKredit: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalUseKredit: { $sum: "$kredit" }, totalBuyKredit: { $sum: "$debet" } } },
            {
                $project: {
                    _id: 0,
                    saldoKredit: 1,
                    totalUseKredit: 1,
                    totalBuyKredit: 1
                }
            }
        ]);
        return query;
    }

    async findByUserDetail(iduser: string): Promise<AdsBalaceCredit[]> {
        let query = await this.adsbalaceCreditModel.aggregate([
            {
                $match: {
                    iduser: iduser
                }
            },
            {
                $lookup: {
                    from: "newUserBasics",
                    localField: "iduserbuyer",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }

        ]);
        return query;
    }

    async findCriteria(pageNumber: number, pageRow: number): Promise<AdsBalaceCredit[]> {
        var perPage = pageRow, page = Math.max(0, pageNumber);
        const query = await this.adsbalaceCreditModel.find().limit(perPage).skip(perPage * page).sort({ createdAt: 'desc' });
        return query;
    }
}