import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsProducts, TransactionsProductsDocument } from './schema/transactionsproducts.schema';

@Injectable()
export class TransactionsProductsService {
    constructor(
        @InjectModel(TransactionsProducts.name, 'SERVER_FULL')
        private readonly transactionsProductsModel: Model<TransactionsProductsDocument>,
    ) { }

    async create(TransactionsProducts_: TransactionsProducts): Promise<TransactionsProducts> {
        const _TransactionsProducts_ = await this.transactionsProductsModel.create(TransactionsProducts_);
        return _TransactionsProducts_;
    }

    async update(_id: string, TransactionsProducts_: TransactionsProducts) {
        let data = await this.transactionsProductsModel.findByIdAndUpdate(
            _id,
           TransactionsProducts_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsProducts> {
        return await this.transactionsProductsModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async findOneByCode(code: string): Promise<TransactionsProducts> {
        return await this.transactionsProductsModel.findOne({ code: code, isDelete: false }).exec();
    }

    async delete(id: string) {
        let TransactionsProducts_ = new TransactionsProducts();
        TransactionsProducts_.isDelete = true;
        let data = await this.transactionsProductsModel.findByIdAndUpdate(
            id,
            TransactionsProducts_,
            { new: true });
        return data;
    }

    async filAll(): Promise<TransactionsProducts[]> {
        return await this.transactionsProductsModel.find().exec();
    }

    async find(TransactionsProducts_: TransactionsProducts): Promise<TransactionsProducts[]> {
        return await this.transactionsProductsModel.find(TransactionsProducts_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, sortBy: string, order: string): Promise<TransactionsProducts[]> {
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
        if (search != undefined) {
            let where_code = {};
            let where_name = {};
            where_code['code'] = { $regex: search, $options: "i" };
            where_or.$or.push(where_code);
            where_name['name'] = { $regex: search, $options: "i" };
            where_or.$or.push(where_name);
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
        const query = await this.transactionsProductsModel.find(where_and).limit(perPage).skip(perPage * page).sort(sort);
        return query;
    }
}
