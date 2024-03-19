import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionsCategorys, TransactionsCategorysDocument } from './schema/transactionscategorys.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class TransactionsCategorysService {
    constructor(
        @InjectModel(TransactionsCategorys.name, 'SERVER_FULL')
        private readonly transactionsCategorysModel: Model<TransactionsCategorysDocument>,
    ) { }

    async create(TransactionsCategorys_: TransactionsCategorys): Promise<TransactionsCategorys> {
        const _TransactionsCategorys_ = await this.transactionsCategorysModel.create(TransactionsCategorys_);
        return _TransactionsCategorys_;
    }

    async update(_id: string, TransactionsCategorys_: TransactionsCategorys) {
        let data = await this.transactionsCategorysModel.findByIdAndUpdate(
            _id,
            TransactionsCategorys_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsCategorys> {
        return await this.transactionsCategorysModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete:false }).exec();
    }

    async delete(id: string) {
        let TransactionsCategorys_ = new TransactionsCategorys();
        TransactionsCategorys_.isDelete = true;
        let data = await this.transactionsCategorysModel.findByIdAndUpdate(
            id,
            TransactionsCategorys_,
            { new: true });
        return data;
    }

    async filAll(): Promise<TransactionsCategorys[]> {
        return await this.transactionsCategorysModel.find().exec();
    }

    async find(TransactionsCategorys_: TransactionsCategorys): Promise<TransactionsCategorys[]> {
        return await this.transactionsCategorysModel.find(TransactionsCategorys_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, user: string, sortBy: string, order: string): Promise<TransactionsCategorys[]> {
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
        const query = await this.transactionsCategorysModel.find(where_and).limit(perPage).skip(perPage * page).sort(sort);
        return query;
    }
}
