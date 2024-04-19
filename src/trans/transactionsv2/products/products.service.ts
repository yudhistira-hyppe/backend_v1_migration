import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Products, ProductsDocument } from './schema/products.schema';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Products.name, 'SERVER_FULL')
        private readonly productsModel: Model<ProductsDocument>,
    ) { }

    async create(Products_: Products): Promise<Products> {
        const _Products_ = await this.productsModel.create(Products_);
        return _Products_;
    }

    async update(_id: string, Products_: Products) {
        let data = await this.productsModel.findByIdAndUpdate(
            _id,
            Products_,
            { new: true });
        return data;
    }

    async findOne(id: string): Promise<Products> {
        return await this.productsModel.findOne({ _id: new mongoose.Types.ObjectId(id), isDelete: false }).exec();
    }

    async findOneByCode(code: string): Promise<Products> {
        return await this.productsModel.findOne({ code: code, isDelete: false }).exec();
    }

    async findOneBySubCoaName(name: string): Promise<Products> {
        return await this.productsModel.findOne({ "subCoa.name": name, isDelete: false }).exec();
    }

    async delete(id: string) {
        let Products_ = new Products();
        Products_.isDelete = true;
        let data = await this.productsModel.findByIdAndUpdate(
            id,
            Products_,
            { new: true });
        return data;
    }

    async filAll(): Promise<Products[]> {
        return await this.productsModel.find().exec();
    }

    async find(Products_: Products): Promise<Products[]> {
        return await this.productsModel.find(Products_).exec();
    }

    async findCriteria(pageNumber: number, pageRow: number, search: string, user: string, sortBy: string, order: string): Promise<Products[]> {
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
        const query = await this.productsModel.find(where_and).limit(perPage).skip(perPage * page).sort(sort);
        return query;
    }
}
