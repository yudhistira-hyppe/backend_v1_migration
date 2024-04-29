import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Balanceds, BalancedsDocument } from './schema/balanceds.schema';

@Injectable()
export class BalancedsService {
    constructor(
        @InjectModel(Balanceds.name, 'SERVER_FULL')
        private readonly balancedsCoaModel: Model<BalancedsDocument>,
    ) { }

    async create(Balanceds_: Balanceds): Promise<Balanceds> {
        const _Balanceds_ = await this.balancedsCoaModel.create(Balanceds_);
        return _Balanceds_;
    }

    async update(_id: string, Balanceds_: Balanceds) {
        let data = await this.balancedsCoaModel.findByIdAndUpdate(
            _id,
            Balanceds_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<Balanceds> {
        return await this.balancedsCoaModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<Balanceds[]> {
        return await this.balancedsCoaModel.find().exec();
    }

    async find(TransactionsCoa_: Balanceds): Promise<Balanceds[]> {
        return await this.balancedsCoaModel.find(TransactionsCoa_).exec();
    }

    async findByuser(idUser: string): Promise<Balanceds> {
        return await this.balancedsCoaModel.findOne({ idUser: new mongoose.Types.ObjectId(idUser) }).limit(1).skip(0).sort({ createdAt:-1 }).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, user: string, sortBy: string, order: string): Promise<Balanceds[]> {
        const perPage = pageRow;
        const page = Math.max(0, pageNumber);
        let where_and = {
            $and: []
        };
        let where_or = {
            $or: []
        };
        let where_isDelete = {
            isDelete: false
        };
        if (user != undefined) {
            let where_user = {};
            where_user['user'] = user;
            where_and.$and.push(where_user);
        }
        if (search != undefined) {
            let where_code = {};
            let where_coa = {};
            where_code['code'] = { $regex: search, $options: "i" };
            where_or.$or.push(where_code);
            where_coa['coa'] = { $regex: search, $options: "i" };
            where_or.$or.push(where_coa);
        }

        where_and.$and.push(where_isDelete);
        if (where_or.$or.length > 0) {
            where_and.$and.push(where_or);
        }
        let sort = {};
        if (sortBy != undefined) {
            if (order != undefined) {
                if (order == "ASC") {
                    sort[sortBy] = 1;
                }
                else if (order == "DESC") {
                    sort[sortBy] = -1;
                } else {
                    sort[sortBy] = -1;
                }
            } else {
                sort[sortBy] = -1;
            }
        } else {
            if (order != undefined) {
                if (order == "ASC") {
                    sort['name'] = 1;
                }
                else if (order == "DESC") {
                    sort['name'] = -1;
                } else {
                    sort['name'] = -1;
                }
            } else {
                sort['name'] = -1;
            }
        }
        console.log(JSON.stringify(where_and));
        const query = await this.balancedsCoaModel.find(where_and).limit(perPage).skip(perPage * page).sort(sort);
        return query;
    }
}
