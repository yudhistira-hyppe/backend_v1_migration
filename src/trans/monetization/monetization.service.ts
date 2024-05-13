import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monetize, MonetizeDocument } from './schemas/monetization.schema';
import { ConfigService } from '@nestjs/config';
import { OssContentPictService } from 'src/content/posts/osscontentpict.service';
import { PostContentService } from 'src/content/posts/postcontent.service';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { LogapisService } from '../logapis/logapis.service';
import { TransactionsProductsService } from '../transactionsv2/products/transactionsproducts.service';
import mongoose from 'mongoose';
import { OssService } from 'src/stream/oss/oss.service';
const sharp = require('sharp');

@Injectable()
export class MonetizationService {
    constructor(
        @InjectModel(Monetize.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizeDocument>,
        private readonly configService: ConfigService,
        private readonly ossContentPictService: OssContentPictService,
        private readonly postContentService: PostContentService,
        private readonly utilsService: UtilsService,
        private readonly UserbasicnewService: UserbasicnewService,
        private readonly transProdService: TransactionsProductsService,
        private readonly LogAPISS: LogapisService,
        private readonly ossservices: OssService
    ) { }

    async find(): Promise<Monetize[]> {
        return this.monetData.find().exec();
    }

    async findOne(id: string): Promise<Monetize> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.monetData.findById(setid);
        return data;
    }

    async detailOne(id: string): Promise<Monetize> {
        var mongo = require('mongoose');
        var data = await this.monetData.aggregate([
            {
                "$match":
                {
                    _id: new mongo.Types.ObjectId(id)
                }
            },
            {
                "$project":
                {
                    name: 1,
                    price: 1,
                    amount: 1,
                    stock: 1,
                    thumbnail: 1,
                    used_stock: 1,
                    last_stock: 1,
                    audiens:
                    {
                        "$ifNull":
                            [
                                {
                                    "$cond":
                                    {
                                        if:
                                        {
                                            "$eq":
                                                [
                                                    "$type", "CREDIT"
                                                ]
                                        },
                                        then:
                                        {
                                            "$cond":
                                            {
                                                if:
                                                {
                                                    "$eq":
                                                        [
                                                            "$audiens", "EXCLUSIVE"
                                                        ]
                                                },
                                                then: "Ekslusif",
                                                else: "Publik"
                                            }
                                        },
                                        else: "$$REMOVE"
                                    }
                                },
                                "$$REMOVE"
                            ]
                    },
                    total_transaction:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "CREDIT"
                                    ]
                            },
                            then:
                            {
                                "$toInt": 69
                            },
                            else: "$$REMOVE"
                        }
                    },
                }
            }
        ]);
        return data[0];
    }

    async updateOne(id: string, data: Monetize) {
        var setid = new mongoose.Types.ObjectId(id);
        return this.monetData.findByIdAndUpdate(setid, data, { new: true });
    }

    async createCoin(request: any, file?: Express.Multer.File): Promise<Monetize> {
        let id = new mongoose.Types.ObjectId();
        let url_filename = "";
        let now = await this.utilsService.getDateTimeString();

        if (request.isUploadIcon == 'true' || request.isUploadIcon == true) {
            let image_information = await sharp(file.buffer).metadata();
            let extension = image_information.format;

            let filename = id + "." + extension;
            let path_file = "images/coin/" + id + "/" + filename;

            let file_upload = await this.postContentService.generate_upload_noresize(file, extension);
            let upload_file_upload = await this.uploadOss(file_upload, path_file);

            if (upload_file_upload != undefined) {
                if (upload_file_upload.res != undefined) {
                    if (upload_file_upload.res.statusCode != undefined) {
                        if (upload_file_upload.res.statusCode == 200) {
                            url_filename = upload_file_upload.res.requestUrls[0];
                        }
                    }
                }
            }
        }
        else {
            url_filename = 'http://be-staging.oss-ap-southeast-5.aliyuncs.com/images/coin/default.jpg';
        }

        let createCoinDto = {
            _id: id,
            name: request.name,
            package_id: await this.generatePackage("COIN"),
            price: Number(request.price),
            amount: Number(request.amount),
            stock: Number(request.stock),
            thumbnail: url_filename,
            createdAt: now,
            updatedAt: now,
            type: request.type,
            used_stock: 0,
            last_stock: Number(request.stock),
            active: true,
            status: false
        }
        return this.monetData.create(createCoinDto);
    }

    async createCredit(header: any, inputdata: any) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var url = header.host + "/api/monetization/create";
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_body = JSON.parse(JSON.stringify(inputdata));

        if (request_body.audiens == "EXCLUSIVE" && (request_body.audiens_user == null || request_body.audiens_user == undefined)) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);

            throw new BadRequestException("Target user field must required");
        }

        var mongo = require('mongoose');
        var insertdata = new Monetize();
        insertdata._id = new mongo.Types.ObjectId();
        insertdata.name = request_body.name;
        insertdata.package_id = await this.generatePackage("CREDIT");
        insertdata.description = request_body.description;
        insertdata.audiens = request_body.audiens;
        insertdata.createdAt = await this.utilsService.getDateTimeString();
        insertdata.updatedAt = await this.utilsService.getDateTimeString();
        insertdata.active = true;
        insertdata.status = false;
        insertdata.price = Number(request_body.price);
        insertdata.stock = Number(request_body.stock);
        insertdata.amount = Number(request_body.amount);
        insertdata.last_stock = Number(request_body.stock);
        insertdata.used_stock = 0;
        insertdata.type = 'CREDIT';
        insertdata.redirectUrl = request_body.redirectUrl;

        if (request_body.audiens == "EXCLUSIVE") {
            this.insertmultipleTarget(insertdata, request_body.audiens_user);
        }

        await this.monetData.create(insertdata);

        return insertdata;
    }

    async createGift(header: any, thumb: Express.Multer.File, animate: Express.Multer.File, request: any) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var url = header.host + "/api/monetization/create";
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_body = JSON.parse(JSON.stringify(request));

        if (thumb == null || thumb == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);

            throw new BadRequestException("gift thumbnail field must required");
        }

        if (request_body.tipegift == "DELUXE" && (animate == null || animate == undefined)) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);

            throw new BadRequestException("gift animation field must required");
        }

        var mongo = require('mongoose');
        var insertdata = new Monetize();
        insertdata._id = new mongo.Types.ObjectId();
        var tempid = insertdata._id;
        insertdata.name = request_body.name;
        insertdata.package_id = await this.generatePackage("GIFT");
        insertdata.createdAt = await this.utilsService.getDateTimeString();
        insertdata.updatedAt = await this.utilsService.getDateTimeString();
        insertdata.active = true;
        insertdata.status = false;
        insertdata.price = Number(request_body.price);
        insertdata.stock = Number(request_body.stock);
        insertdata.last_stock = Number(request_body.stock);
        insertdata.typeGift = request_body.tipegift;
        insertdata.used_stock = 0;
        insertdata.type = 'GIFT';

        //upload thumbnail
        var insertfile = thumb;
        var path = "images/gift/" + tempid + "_thumbnail" + "." + insertfile.originalname.split(".")[1];
        var result = await this.ossservices.uploadFile(insertfile, path);
        insertdata.thumbnail = result.url;

        if (request_body.tipegift == "DELUXE" && animate != null && animate != undefined) {
            //upload animation
            var insertfile = animate;
            var path = "images/gift/" + tempid + "_3d" + "." + insertfile.originalname.split(".")[1];
            var result = await this.ossservices.uploadFile(insertfile, path);
            insertdata.animation = result.url;
        }

        await this.monetData.create(insertdata);

        return insertdata;
    }

    async createDiscount(header: any, thumb: Express.Multer.File, request: any) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var url = header.host + "/api/monetization/create";
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_body = JSON.parse(JSON.stringify(request));

        if (thumb == null || thumb == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);

            throw new BadRequestException("discount thumbnail field must required");
        }

        if (request_body.audiens == "SPECIAL" && (request_body.audiens_user == null || request_body.audiens_user == undefined)) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);

            throw new BadRequestException("Target user field must required");
        }

        var getpackagename = await this.generatePackage("DISCOUNT");

        var getdata = await this.transProdService.findOne(request_body.productID);

        var insertdata = new Monetize();
        insertdata._id = new mongoose.Types.ObjectId();
        var tempid = insertdata._id;
        insertdata.package_id = getpackagename.replace("XX", getdata.code);
        insertdata.name = request_body.name;
        insertdata.code_package = request_body.code_package;
        insertdata.audiens = request_body.audiens;
        insertdata.description = request_body.description;
        insertdata.createdAt = await this.utilsService.getDateTimeString();
        insertdata.updatedAt = await this.utilsService.getDateTimeString();
        insertdata.startCouponDate = request_body.startCouponDate + " " + request_body.startCouponTime;
        insertdata.endCouponDate = request_body.endCouponDate + " " + request_body.endCouponTime;
        insertdata.active = true;
        insertdata.status = false;
        insertdata.nominal_discount = (request_body.nominal_discount != null && request_body.nominal_discount != undefined ? Number(request_body.nominal_discount) : 0);
        insertdata.min_use_disc = (request_body.min_use_disc != null && request_body.min_use_disc != undefined ? Number(request_body.min_use_disc) : 0);
        insertdata.stock = (request_body.stock != null && request_body.stock != undefined ? Number(request_body.stock) : null);
        insertdata.last_stock = (request_body.stock != null && request_body.stock != undefined ? Number(request_body.stock) : null);
        insertdata.satuan_diskon = request_body.satuan_diskon;
        insertdata.used_stock = 0;
        insertdata.type = 'DISCOUNT';
        insertdata.productID = getdata._id;
        insertdata.productCode = getdata.code;

        //upload thumbnail
        var insertfile = thumb;
        var path = "images/gift/" + tempid + "_thumbnail" + "." + insertfile.originalname.split(".")[1];
        var result = await this.ossservices.uploadFile(insertfile, path);
        insertdata.thumbnail = result.url;

        if (request_body.audiens == "SPECIAL") {
            this.insertmultipleTarget(insertdata, request_body.audiens_user);
        }

        // console.log(insertdata);

        await this.monetData.create(insertdata);

        return insertdata;
    }

    async insertmultipleTarget(setdata: any, setaudiens: string) {
        var mongo = require('mongoose');
        var insertaudiens = [];
        if (setaudiens == 'ALL') {
            var totaldata = await this.UserbasicnewService.getcount();
            var setpagination = parseInt(totaldata[0].totalpost) / 200;
            var ceksisa = (parseInt(totaldata[0].totalpost) % 200);
            if (ceksisa > 0 && ceksisa < 5) {
                setpagination = setpagination + 1;
            }

            for (var looppagination = 0; looppagination < setpagination; looppagination++) {
                var getalluserbasic = await this.UserbasicnewService.getuser(looppagination, 200);

                for (var loopuser = 0; loopuser < getalluserbasic.length; loopuser++) {
                    insertaudiens.push(getalluserbasic[loopuser]._id);
                }
            }
        }
        else {
            var target_user = setaudiens.split(",");
            for (var loopP = 0; loopP < target_user.length; loopP++) {
                var setpartisipan = new mongo.Types.ObjectId(target_user[loopP]);
                insertaudiens.push(setpartisipan);
            }
        }

        setdata.audiens_user = insertaudiens;
        await this.monetData.findByIdAndUpdate(setdata._id.toString(), setdata);
    }


    async uploadOss(buffer: Buffer, path: string) {
        var result = await this.ossContentPictService.uploadFileBuffer(buffer, path);
        return result;
    }

    async listAllCoin(skip: number, limit: number, descending: boolean, type?: string, name?: string, dateFrom?: string, dateTo?: string, stockFrom?: number, stockTo?: number, status?: boolean, audiens_type?: string, tipegift?: string, jenisProduk?: any[]) {

        let order = descending ? -1 : 1;
        let matchAnd = [];
        let pipeline = [];
        // pipeline.push({
        //     "$match": {
        //         "type": type
        //     }
        // });
        matchAnd.push({
            "type": type
        })
        // pipeline.push({
        //     "$match": {
        //         "active": true
        //     }
        // });
        matchAnd.push({
            "active": true
        })
        pipeline.push({
            "$sort":
            {
                'createdAt': order
            }
        });
        if (name && name !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "name": new RegExp(name, "i")
            //     }
            // })
            matchAnd.push({
                "name": new RegExp(name, "i")
            })
        }
        if (dateFrom && dateFrom !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "createdAt": {
            //             $gte: dateFrom + " 00:00:00"
            //         }
            //     }
            // })
            matchAnd.push({
                "createdAt": {
                    $gte: dateFrom + " 00:00:00"
                }
            })
        }
        if (dateTo && dateTo !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "createdAt": {
            //             $lte: dateTo + " 23:59:59"
            //         }
            //     }
            // })
            matchAnd.push({
                "createdAt": {
                    $lte: dateTo + " 23:59:59"
                }
            })
        }
        if (stockFrom && stockFrom !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "stock": {
            //             $gte: stockFrom
            //         }
            //     }
            // })
            matchAnd.push({
                "stock": {
                    $gte: stockFrom
                }
            })
        }
        if (stockTo && stockTo !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "stock": {
            //             $lte: stockTo
            //         }
            //     }
            // })
            matchAnd.push({
                "stock": {
                    $lte: stockTo
                }
            })
        }
        if (status !== null && status !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "status": status
            //     }
            // })
            matchAnd.push({
                "status": status
            })
        }
        if (audiens_type && audiens_type !== undefined) {
            // pipeline.push({
            //     "$match": {
            //         "audiens": audiens_type
            //     }
            // })
            matchAnd.push({
                "audiens": audiens_type
            })
        }
        if (type == "GIFT" && tipegift && tipegift !== undefined) {
            matchAnd.push({
                "typeGift": tipegift
            });
        }
        if (jenisProduk && jenisProduk !== undefined) {
            var setarray = [];
            for (var i = 0; i < jenisProduk.length; i++) {
                setarray.push(new mongoose.Types.ObjectId(jenisProduk[i]));
            }
            matchAnd.push({
                "productID": {
                    "$in": setarray
                }
            });
        }
        pipeline.push({
            "$match": {
                $and: matchAnd
            }
        })
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }

        pipeline.push(
            {
                "$lookup":
                {
                    from: "transactionsProducts",
                    localField: "productID",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    type: 1,
                    name: 1,
                    code_package:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$code_package",
                            else: "$$REMOVE"
                        }
                    },
                    package_id: 1,
                    price:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$ne":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$price",
                            else: "$$REMOVE"
                        }
                    },
                    amount: 1,
                    stock: "$last_stock",
                    thumbnail: 1,
                    audiens:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$or":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    "$type", "CREDIT"
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    "$type", "DISCOUNT"
                                                ]
                                        }
                                    ]
                            },
                            then: "$audiens",
                            else: "$$REMOVE"
                        }
                    },
                    audiens_user:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$or":
                                    [
                                        {
                                            "$eq":
                                                [
                                                    "$type", "CREDIT"
                                                ]
                                        },
                                        {
                                            "$eq":
                                                [
                                                    "$type", "DISCOUNT"
                                                ]
                                        }
                                    ]
                            },
                            then: "$audiens_user",
                            else: "$$REMOVE"
                        }
                    },
                    typeGift:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "GIFT"
                                    ]
                            },
                            then: "$typeGift",
                            else: "$$REMOVE"
                        }
                    },
                    animation:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "GIFT"
                                    ]
                            },
                            then: "$animation",
                            else: "$$REMOVE"
                        }
                    },
                    satuan_diskon:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$satuan_diskon",
                            else: "$$REMOVE"
                        }
                    },
                    nominal_discount:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$nominal_discount",
                            else: "$$REMOVE"
                        }
                    },
                    min_use_disc:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$min_use_disc",
                            else: "$$REMOVE"
                        }
                    },
                    productID:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$productID",
                            else: "$$REMOVE"
                        }
                    },
                    productCode:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$productCode",
                            else: "$$REMOVE"
                        }
                    },
                    productName:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$productData", []
                                    ]
                            },
                            then: "$$REMOVE",
                            else:
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                            [
                                                "$type", "DISCOUNT"
                                            ]
                                    },
                                    then:
                                    {
                                        "$arrayElemAt":
                                            [
                                                "$productData.name", 0
                                            ]
                                    },
                                    else: "$$REMOVE"
                                }
                            }
                        }
                    },
                    startCouponDate:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$startCouponDate",
                            else: "$$REMOVE"
                        }
                    },
                    endCouponDate:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                    [
                                        "$type", "DISCOUNT"
                                    ]
                            },
                            then: "$endCouponDate",
                            else: "$$REMOVE"
                        }
                    },
                    available:
                    {
                        "$ifNull":
                            [
                                {
                                    "$cond":
                                    {
                                        if:
                                        {
                                            "$eq":
                                                [
                                                    "$last_stock",
                                                    0
                                                ]
                                        },
                                        then: false,
                                        else: true
                                    }
                                },
                                false
                            ]
                    },
                    createdAt: 1,
                    updatedAt: 1,
                    used_stock: 1,
                    last_stock: 1,
                    active: 1,
                    status: 1,
                }
            }
        );

        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth:null, showHidden:false }));

        var data = await this.monetData.aggregate(pipeline);
        return data;
    }

    async listActiveItems(skip: number, limit: number, type: string, typeGift?: string) {
        let pipeline = [];
        switch (type) {
            case "COIN":
                pipeline.push(
                    {
                        $match: {
                            type: type,
                            active: true,
                            status: true
                        }
                    },
                    {
                        $sort: {
                            amount: 1
                        }
                    }
                );
                break;
            case "GIFT":
                pipeline.push(
                    {
                        $match: {
                            type: type,
                            typeGift: typeGift,
                            active: true,
                            status: true
                        }
                    },
                    {
                        $sort: {
                            price: 1
                        }
                    }
                );
                break;
            default:
                pipeline.push(
                    {
                        $match: {
                            type: type,
                            active: true,
                            status: true
                        }
                    },
                    {
                        $sort: {
                            amount: 1
                        }
                    }
                );
        }
        pipeline.push(
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        )

        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth: null, showHidden: false }));

        var data = await this.monetData.aggregate(pipeline);
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

    async deactivate(id: string) {
        return this.monetData.findByIdAndUpdate(id, { status: false, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
    }

    async activate(id: string) {
        return this.monetData.findByIdAndUpdate(id, { status: true, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
    }

    async delete(id: string) {
        return this.monetData.findByIdAndUpdate(id, { active: false, updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
    }

    async generatePackage(tipe: string) {
        var gettime = await this.utilsService.getDateTimeString();
        var getyear = gettime.split(" ")[0].split("-")[0];
        var gettipe = '';
        var listpaket = [
            {
                tipe: "COIN",
                kode: "04"
            },
            {
                tipe: "CREDIT",
                kode: "05"
            },
            {
                tipe: "GIFT",
                kode: "06"
            },
            {
                tipe: "DISCOUNT",
                kode: "XX"
            },
        ];

        for (var i = 0; i < listpaket.length; i++) {
            var getdata = listpaket[i];
            if (getdata.tipe == tipe) {
                gettipe = getdata.kode;
            }
        }

        var getexist = await this.monetData.findOne(
            {
                type: tipe,
                package_id:
                {
                    "$regex": getyear,
                    "$options": "i"
                }
            }
        ).sort({ "createdAt": -1 });

        var result = '';
        if (getexist == null || getexist == undefined) {
            result = getyear + "-" + gettipe + "-001";
        }
        else {
            var pecahdata = getexist.package_id.split("-")[2];
            var tambah1 = parseInt(pecahdata) + 1;
            if (tambah1 < 10) {
                result = getyear + "-" + gettipe + "-00" + tambah1.toString();
            }
            else if (tambah1 < 100 && tambah1 >= 10) {
                result = getyear + "-" + gettipe + "-0" + tambah1.toString();
            }
            else {
                result = getyear + "-" + gettipe + "-" + tambah1.toString();
            }
        }

        return result;
    }

    async listDiscount(userid: string, page: number, limit: number, productid: any[]) {
        var date = (await this.utilsService.getDateTimeString()).split(" ")[0];
        var pipeline = [];
        pipeline.push(
            {
                "$match":
                {
                    "$or":
                        [
                            {
                                "$and":
                                    [
                                        {
                                            "type": "DISCOUNT"
                                        },
                                        {
                                            "audiens": "PUBLIC"
                                        },
                                        {
                                            "active": true
                                        },
                                        {
                                            "status": true
                                        },
                                        //hanya menampilkan diskon yang saat ini sedang aktif dan belum expired
                                        // {
                                        //     "startCouponDate":
                                        //     {
                                        //         "$gte":date
                                        //     }
                                        // },
                                    ]
                            },
                            {
                                "$and":
                                    [
                                        {
                                            "type": "DISCOUNT"
                                        },
                                        {
                                            "audiens": "SPECIAL"
                                        },
                                        {
                                            "active": true
                                        },
                                        {
                                            "status": true
                                        },
                                        //hanya menampilkan diskon yang saat ini sedang aktif dan belum expired
                                        // {
                                        //     "startCouponDate":
                                        //     {
                                        //         "$gte":date
                                        //     }
                                        // },
                                        {
                                            "audiens_user":
                                            {
                                                "$in": [new mongoose.Types.ObjectId(userid)]
                                            }
                                        }
                                    ]
                            },
                        ]
                }
            },
            {
                "$lookup":
                {
                    from: "transactionsProducts",
                    localField: "productID",
                    foreignField: "_id",
                    as: "productData"
                }
            },
        );

        var insertsort = {};
        var insertset = null;
        var insertproject = {
            _id: 1,
            type: 1,
            name: 1,
            code_package: 1,
            package_id: 1,
            amount: 1,
            stock: "$last_stock",
            thumbnail: 1,
            audiens: 1,
            audiens_user: 1,
            satuan_diskon: 1,
            nominal_discount: 1,
            min_use_disc: 1,
            productID: 1,
            productCode: 1,
            productName:
            {
                "$arrayElemAt":
                    [
                        "$productData.name", 0
                    ]
            },
            startCouponDate: 1,
            endCouponDate: 1,
            available:
            {
                "$ifNull":
                    [
                        {
                            "$cond":
                            {
                                if:
                                {
                                    "$eq":
                                        [
                                            "$last_stock",
                                            0
                                        ]
                                },
                                then: false,
                                else: true
                            }
                        },
                        false
                    ]
            },
            createdAt: 1,
            updatedAt: 1,
            used_stock: 1,
            last_stock: 1,
            active: 1,
            status: 1,
        };

        insertproject['available_to_choose'] = {
            "$toBool": 'true'
        };

        if (productid != null && productid != undefined) {
            var convertproduct = [];
            for (var i = 0; i < productid.length; i++) {
                convertproduct.push(new mongoose.Types.ObjectId(productid[i]));
            }

            insertset = {
                'checkdipilih':
                {
                    "$ifNull":
                        [
                            {
                                "$filter":
                                {
                                    input: convertproduct,
                                    as: "filter",
                                    cond:
                                    {
                                        "$eq":
                                            [
                                                "$$filter",
                                                "$productID"
                                            ]
                                    }
                                }
                            },
                            []
                        ]
                }
            };

            insertsort['available_to_choose'] = -1;

            insertproject['available_to_choose'] = {
                "$cond":
                {
                    if:
                    {
                        "$eq":
                            [
                                {
                                    "$size": "$checkdipilih"
                                },
                                0
                            ]
                    },
                    then: false,
                    else: true
                }
            };
        }

        insertsort['productCode'] = 1;
        insertsort['endCouponDate'] = 1;

        if (insertset != null) {
            pipeline.push(
                {
                    "$set": insertset
                }
            );
        }

        pipeline.push(
            {
                "$project": insertproject
            },
            {
                "$sort": insertsort
            }
        );

        if (page != null && limit != null) {
            pipeline.push(
                {
                    $skip: page * limit
                },
                {
                    $limit: limit
                }
            )
        }

        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth:null, showHidden:false }));
        var data = await this.monetData.aggregate(pipeline);

        return data;
    }
}
