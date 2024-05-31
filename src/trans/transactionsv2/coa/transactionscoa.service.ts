import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransactionsCoa, TransactionsCoaDocument } from './schema/transactionscoa.schema';

@Injectable()
export class TransactionsCoaService {
    constructor(
        @InjectModel(TransactionsCoa.name, 'SERVER_FULL')
        private readonly transactionsCoaModel: Model<TransactionsCoaDocument>,
    ) { }

    async create(TransactionsCoa_: TransactionsCoa): Promise<TransactionsCoa> {
        const _TransactionsCategorys_ = await this.transactionsCoaModel.create(TransactionsCoa_);
        return _TransactionsCategorys_;
    }

    async updateData(_TransactionsCoa_: TransactionsCoa, TransactionsCoa_: TransactionsCoa) {
        let data = await this.transactionsCoaModel.findOneAndUpdate(
            _TransactionsCoa_,
            TransactionsCoa_,
            { new: true });
        return data;
    }

    async update(_id: string, TransactionsCoa_: TransactionsCoa) {
        let data = await this.transactionsCoaModel.findByIdAndUpdate(
            _id,
            TransactionsCoa_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<TransactionsCoa> {
        return await this.transactionsCoaModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async filAll(): Promise<TransactionsCoa[]> {
        return await this.transactionsCoaModel.find().exec();
    }

    async find(TransactionsCoa_: TransactionsCoa): Promise<TransactionsCoa[]> {
        return await this.transactionsCoaModel.find(TransactionsCoa_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, user: string, sortBy: string, order: string): Promise<TransactionsCoa[]> {
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
        const query = await this.transactionsCoaModel.find(where_and).limit(perPage).skip(perPage * page).sort(sort);
        return query;
    }
}
