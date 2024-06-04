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

    async detailOneV2(id: string): Promise<Monetize> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.monetData.aggregate([
            {
                "$match":
                {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                "$lookup":
                {
                    from: "newUserBasics",
                    as: "user_data",
                    let:
                    {
                        local_id: '$audiens_user'
                    },
                    pipeline:
                        [
                            {
                                "$match":
                                {
                                    "$expr":
                                    {
                                        "$in":
                                            [
                                                "$_id", "$$local_id"
                                            ]
                                    }
                                }
                            },
                            {
                                "$set":
                                {
                                    "setlistBadge":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$filter":
                                                    {
                                                        input: "$userBadge",
                                                        as: "listbadge",
                                                        cond:
                                                        {
                                                            "$and":
                                                                [
                                                                    {
                                                                        "$eq":
                                                                            [
                                                                                "$$listbadge.isActive", true
                                                                            ]
                                                                    },
                                                                    {
                                                                        "$lte": [
                                                                            {
                                                                                "$dateToString": {
                                                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                                                    "date": {
                                                                                        "$add": [
                                                                                            new Date(),
                                                                                            25200000
                                                                                        ]
                                                                                    }
                                                                                }
                                                                            },
                                                                            "$$listbadge.endDatetime"
                                                                        ]
                                                                    }
                                                                ]
                                                        }
                                                    }
                                                },
                                                []
                                            ]
                                    },
                                }
                            },
                            {
                                "$project":
                                {
                                    "username": 1,
                                    "fullName": 1,
                                    "_id": 1,
                                    "avatar": {
                                        "mediaBasePath":
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaBasePath",
                                                    null
                                                ]
                                        },
                                        "mediaUri":
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaUri",
                                                    null
                                                ]
                                        },
                                        "mediaType":
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaType",
                                                    null
                                                ]
                                        },
                                        "mediaEndpoint":
                                        {
                                            "$ifNull":
                                                [
                                                    "$mediaEndpoint",
                                                    null
                                                ]
                                        },
                                    },
                                    "email": 1,
                                    "urluserBadge":
                                    {
                                        "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                        [
                                                            "$setlistBadge.urluserBadge", 0
                                                        ]
                                                },
                                                null
                                            ]
                                    }
                                }
                            }
                        ]
                }
            },
            {
                "$set":
                {
                    "audiens_user": "$user_data"
                }
            }
        ]);
        return data[0];
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

        if(skip != null && limit != null)
        {
            pipeline.push(
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            )
        }

        // var util = require('util');
        // console.log(util.inspect(pipeline, { depth: null, showHidden: false }));

        var data = await this.monetData.aggregate(pipeline);
        return data;
    }

    async dashboard(start:string, end:string)
    {   
        var currentdate = new Date(new Date(end).setDate(new Date(end).getDate() + 1));
      
        var dateend = currentdate.toISOString().split("T")[0];

        var data = await this.monetData.aggregate([
            {
                "$match":
                {
                    "type":"DISCOUNT",
                    "active":true,
                }
            },
            {
                "$facet":
                {
                    "total":
                    [
                        {
                            "$match":
                            {
                                "createdAt":
                                {
                                    "$gte":start,
                                    "$lt":dateend
                                }
                            }   
                        },
                        {
                            "$group":
                            {
                                "_id":null,
                                "total":
                                {
                                    "$sum":"$stock"
                                }
                            }
                        },
                    ],
                    "popular":
                    [
                        {
                            "$lookup":
                            {
                                "from":"transactionsDiscounts",
                                "let":
                                {
                                    "fk_id":"$_id"
                                },
                                "as":"detail_trans",
                                "pipeline":
                                [
                                    {
                                        "$match":
                                        {
                                            "$and":
                                            [
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                        [
                                                            "$idDiscount", "$$fk_id"
                                                        ]
                                                    }
                                                },
                                                {
                                                    "createdAt":
                                                    {
                                                        "$gte":start,
                                                        "$lt":dateend
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "$group":
                                        {
                                            "_id":null,
                                            "total":
                                            {
                                                "$sum":1
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$set":
                            {
                                "gettotal":
                                {
                                    "$arrayElemAt":
                                    [
                                        "$detail_trans.total", 0
                                    ]
                                }
                            }
                        },
                        {
                            "$sort":
                            {
                                "gettotal":-1
                            }
                        },
                        {
                            "$limit":5
                        },
                        {
                            "$project":
                            {
                                _id:1,
                                code_package:1,
                                package_id:1,
                                name:1,
                                total:
                                {
                                    "$ifNull":
                                    [
                                        "$gettotal",
                                        0
                                    ]
                                },
                            }
                        }
                    ],
                    "chart_public":
                    [
                        {
                            "$match":
                            {
                                "audiens":"PUBLIC"
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from":"transactionsDiscounts",
                                "let":
                                {
                                    "fk_id":"$_id",
                                    "created_id":
                                    {
                                        "$substr":
                                        [
                                            "$createdAt", 0, 10
                                        ]
                                    }
                                },
                                "as":"detail_trans",
                                "pipeline":
                                [
                                    {
                                        "$match":
                                        {
                                            "$and":
                                            [
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                        [
                                                            "$idDiscount", "$$fk_id"
                                                        ]
                                                    }
                                                },
                                                {
                                                    "$expr":
                                                    {
                                                        "$gte":
                                                        [
                                                            "$transactionDate", "$$created_id"
                                                        ]
                                                    }
                                                },
                                                {
                                                    "transactionDate":
                                                    {
                                                        "$lt":dateend
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            "tanggal":
                                            {
                                                "$substr":
                                                [
                                                    "$transactionDate",
                                                    0,
                                                    10
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        "$group":
                                        {
                                            "_id":"$tanggal",
                                            "total":
                                            {
                                                "$sum":1
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind":
                            {
                                path:"$detail_trans"
                            }
                        },
                        {
                            "$group":
                            {
                                "_id":"$detail_trans._id",
                                "total":
                                {
                                    "$sum":"$detail_trans.total"
                                }
                            }
                        },
                        {
                            "$sort":
                            {
                                "_id":1
                            }
                        }
                    ],
                    "chart_special":
                    [
                        {
                            "$match":
                            {
                                "audiens":"SPECIAL"
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from":"transactionsDiscounts",
                                "let":
                                {
                                    "fk_id":"$_id",
                                    "created_id":
                                    {
                                        "$substr":
                                        [
                                            "$createdAt", 0, 10
                                        ]
                                    },
                                },
                                "as":"detail_trans",
                                "pipeline":
                                [
                                    {
                                        "$match":
                                        {
                                            "$and":
                                            [
                                                {
                                                    "$expr":
                                                    {
                                                        "$eq":
                                                        [
                                                            "$idDiscount", "$$fk_id"
                                                        ]
                                                    }
                                                },
                                                {
                                                    "$expr":
                                                    {
                                                        "$gte":
                                                        [
                                                            "$transactionDate", "$$created_id"
                                                        ]
                                                    }
                                                },
                                                {
                                                    "transactionDate":
                                                    {
                                                        "$lt":dateend
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "$project":
                                        {
                                            "tanggal":
                                            {
                                                "$substr":
                                                [
                                                    "$transactionDate",
                                                    0,
                                                    10
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        "$group":
                                        {
                                            "_id":"$tanggal",
                                            "total":
                                            {
                                                "$sum":1
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$unwind":
                            {
                                path:"$detail_trans"
                            }
                        },
                        {
                            "$group":
                            {
                                "_id":"$detail_trans._id",
                                "total":
                                {
                                    "$sum":"$detail_trans.total"
                                }
                            }
                        },
                        {
                            "$sort":
                            {
                                "_id":1
                            }
                        }
                    ],
                    "total_stock_first_public":
                    [
                        {
                            "$match":
                            {
                                "audiens":"PUBLIC"
                            }
                        },
                        {
                            "$project":
                            {
                                "tanggal":
                                {
                                    "$substr":
                                    [
                                        "$createdAt",
                                        0,
                                        10
                                    ]
                                },
                                "total":"$stock"
                            }
                        },
                        {
                            "$group":
                            {
                                "_id":"$tanggal",
                                "total":
                                {
                                    "$sum":"$total"
                                }
                            }
                        }
                    ],
                    "total_stock_first_special":
                    [
                        {
                            "$match":
                            {
                                "audiens":"SPECIAL"
                            }
                        },
                        {
                            "$project":
                            {
                                "tanggal":
                                {
                                    "$substr":
                                    [
                                        "$createdAt",
                                        0,
                                        10
                                    ]
                                },
                                "total":"$stock"
                            }
                        },
                        {
                            "$group":
                            {
                                "_id":"$tanggal",
                                "total":
                                {
                                    "$sum":"$total"
                                }
                            }
                        }
                    ]
                }
            },
            {
                "$addFields":
                {
                    "list_used_chart_public_before_filter":
                    {
                        "$filter":
                        {
                            "input":"$chart_public",
                            "as":"getData",
                            "cond":
                            {
                                "$lt":
                                [
                                    "$$getData._id",
                                    start
                                ]
                            }
                        }
                    },
                    "list_used_chart_special_before_filter":
                    {
                        "$filter":
                        {
                            "input":"$chart_special",
                            "as":"getData",
                            "cond":
                            {
                                "$lt":
                                [
                                    "$$getData._id",
                                    start
                                ]
                            }
                        }
                    },
                    "list_available_chart_public_before_filter":
                    {
                        "$filter":
                        {
                            "input":"$total_stock_first_public",
                            "as":"getData",
                            "cond":
                            {
                                "$lt":
                                [
                                    "$$getData._id",
                                    start
                                ]
                            }
                        }
                    },
                    "list_available_chart_special_before_filter":
                    {
                        "$filter":
                        {
                            "input":"$total_stock_first_special",
                            "as":"getData",
                            "cond":
                            {
                                "$lt":
                                [
                                    "$$getData._id",
                                    start
                                ]
                            }
                        }
                    },
                    "list_used_chart_public":
                    {
                        "$filter":
                        {
                            "input":"$chart_public",
                            "as":"getData",
                            "cond":
                            {
                                "$and":
                                [
                                    {
                                        "$gte":
                                        [
                                            "$$getData._id",
                                            start
                                        ]
                                    },
                                    {
                                        "$lt":
                                        [
                                            "$$getData._id",
                                            dateend
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    "list_used_chart_special":
                    {
                        "$filter":
                        {
                            "input":"$chart_special",
                            "as":"getData",
                            "cond":
                            {
                                "$and":
                                [
                                    {
                                        "$gte":
                                        [
                                            "$$getData._id",
                                            start
                                        ]
                                    },
                                    {
                                        "$lt":
                                        [
                                            "$$getData._id",
                                            dateend
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                },
            },
            {
                "$project":
                {
                    "total_created":
                    {
                        "$arrayElemAt":
                        [
                            "$total.total", 0
                        ]   
                    },
                    "popular_discount":"$popular",
                    list_used_chart_public:1,
                    list_used_chart_special:1,
                    "total_stock_temp_public":
                    {
                        "$filter":
                        {
                            "input":"$total_stock_first_public",
                            "as":"getData",
                            "cond":
                            {
                                "$and":
                                [
                                    {
                                        "$gte":
                                        [
                                            "$$getData._id",
                                            start
                                        ]
                                    },
                                    {
                                        "$lt":
                                        [
                                            "$$getData._id",
                                            dateend
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    "total_stock_temp_special":
                    {
                        "$filter":
                        {
                            "input":"$total_stock_first_special",
                            "as":"getData",
                            "cond":
                            {
                                "$and":
                                [
                                    {
                                        "$gte":
                                        [
                                            "$$getData._id",
                                            start
                                        ]
                                    },
                                    {
                                        "$lt":
                                        [
                                            "$$getData._id",
                                            dateend
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    "total_available_public_before":
                    {
                        "$subtract":
                        [
                            {
                                "$sum":
                                [
                                    "$list_available_chart_public_before_filter.total",
                                ]
                            },
                            {
                                "$cond":
                                {
                                    "if":
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$size":"$list_used_chart_public_before_filter"
                                            },
                                            0
                                        ]
                                    },
                                    "then":0,
                                    "else":
                                    {
                                        "$sum":
                                        [
                                            "$list_used_chart_public_before_filter.total"
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    "total_available_special_before":
                    {
                        "$subtract":
                        [
                            {
                                "$sum":
                                [
                                    "$list_available_chart_special_before_filter.total",
                                ]
                            },
                            {
                                "$cond":
                                {
                                    "if":
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$size":"$list_used_chart_special_before_filter"
                                            },
                                            0
                                        ]
                                    },
                                    "then":0,
                                    "else":
                                    {
                                        "$sum":
                                        [
                                            "$list_used_chart_special_before_filter.total"
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    "total_used_discount_public":
                    {
                        "$sum":
                        [
                            "$list_used_chart_public.total"
                        ]
                    },
                    "total_used_discount_special":
                    {
                        "$sum":
                        [
                            "$list_used_chart_special.total"
                        ]
                    },
                }
            }
        ]);  
        
        //untuk nyari chart penggunaan diskon public
        var startdate = new Date(start);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var used_public  = [];
        //kalo lama, berarti error disini!!
        while (tempdate != dateend) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            // console.log(tempdate);

            let obj = data[0].list_used_chart_public.find(objs => objs._id === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                obj =
                {
                    _id: tempdate,
                    total: 0
                }
            }

            used_public.push(obj);
        }

        //untuk nyari chart penggunaan diskon special
        var startdate = new Date(start);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var used_special  = [];
        //kalo lama, berarti error disini!!
        while (tempdate != dateend) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            //console.log(tempdate);

            let obj = data[0].list_used_chart_special.find(objs => objs._id === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                obj =
                {
                    _id: tempdate,
                    total: 0
                }
            }

            used_special.push(obj);
        }

        //untuk nyari chart kosong diskon public
        var startdate = new Date(start);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var available_public  = [];
        var total_discount_public = parseInt(data[0].total_available_public_before);
        //kalo lama, berarti error disini!!
        while (tempdate != dateend) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            //console.log(tempdate);

            let obj = data[0].total_stock_temp_public.find(objs => objs._id === tempdate);
            let checkexist = used_public.find(objs => objs._id === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                total_discount_public = total_discount_public - checkexist.total;
                obj =
                {
                    _id: tempdate,
                    total: total_discount_public
                }
            }
            else
            {
                total_discount_public = total_discount_public + obj.total - checkexist.total;
                obj.total = total_discount_public;
            }

            available_public.push(obj);
        }

        //untuk nyari chart kosong diskon special
        var startdate = new Date(start);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var available_special  = [];
        var total_discount_special = parseInt(data[0].total_available_special_before);
        //kalo lama, berarti error disini!!
        while (tempdate != dateend) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            //console.log(tempdate);

            let obj = data[0].total_stock_temp_special.find(objs => objs._id === tempdate);
            let checkexist = used_special.find(objs => objs._id === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                total_discount_special = total_discount_special - checkexist.total;
                obj =
                {
                    _id: tempdate,
                    total: total_discount_special
                }
            }
            else
            {
                total_discount_special = total_discount_special + obj.total - checkexist.total;
                obj.total = total_discount_special;
            }

            available_special.push(obj);
        }

        var result = 
        {
            total_created:data[0].total_created,
            popular_discount:data[0].popular_discount,
            list_used_chart_public:used_public,
            list_used_chart_special:used_special,
            list_available_chart_public:available_public,
            list_available_chart_special:available_special,
            total_available_discount_public:total_discount_public,
            total_available_discount_special:total_discount_special,
            total_used_discount_public:data[0].total_used_discount_public,
            total_used_discount_special:data[0].total_used_discount_special,
        };

        return result;
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

    async listDiscount(userid: string, page: number, limit: number, productid: any[], transaction_amount: number) {
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
            description: 1,
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

        insertproject['is_blur'] = {
            "$cond":
            {
                if:
                {
                    "$gt": [transaction_amount, "$min_use_disc"]
                },
                then: false,
                else: true
            }
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

    async discount_usage_general(target:string, username:string, transaction_id:string, startdate:string, enddate:string, status:string, page:number, limit:number)
    {
        var pipeline = [];
        var facet = {};

        pipeline.push(
            {
                "$match":
                {
                    "_id": new mongoose.Types.ObjectId(target)
                }
            },
        );

        facet['detail'] = [
            {
                "$lookup":
                {
                    "from":"transactionsDiscounts",
                    "as": "trans_data_2",
                    "let": 
                    { 
                        "disc_id": '$_id'
                    },
                    "pipeline":
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$$disc_id", "$idDiscount"
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            {
                "$project":
                {
                    "tipe":"$audiens",
                    "total":
                    {
                        "$size":"$trans_data_2"
                    }
                }
            }
        ];

        var facetAggregate = [];
        facetAggregate.push(
            {
                "$lookup":
                {
                    "from":"transactionsDiscounts",
                    "as": "trans_data",
                    "let": 
                    { 
                        "idDiscount": '$_id'
                    },
                    "pipeline":
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$$idDiscount","$idDiscount"
                                    ]
                                }
                            }
                        },
                        {
                            "$lookup":
                            {
                                from:"transactionsV2",
                                localField:"idTransaction",
                                foreignField:"_id",
                                as:"trans_detail"
                            }
                        },
                        {
                            "$project":
                            {
                                _id:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail._id", 0
                                    ]
                                },
                                idUser:1,
                                idTransaction:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.idTransaction", 0
                                    ]
                                },
                                coin:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.coin", 0
                                    ]
                                },
                                price:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.price", 0
                                    ]
                                },
                                totalCoin:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.totalCoin", 0
                                    ]
                                },
                                totalPrice:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.totalPrice", 0
                                    ]
                                },
                                createdAt:1
                            }
                        }
                    ]
                }
            },
            {
                "$set":
                {
                    "getuserID":
                    {
                        "$arrayElemAt":
                        [
                            "$trans_data.idUser", 0
                        ]
                    }
                }
            },
            {
                "$lookup":
                {
                    from:"newUserBasics",
                    localField:"getuserID",
                    foreignField:"_id",
                    as:"list_user"
                }
            },
            {
                "$project":
                {
                    "username":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$list_user.username", 0
                                ]
                            },
                            null
                        ]
                    },
                    "fullName":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$list_user.fullName", 0
                                ]
                            },
                            null
                        ]
                    },
                    "email":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$list_user.email", 0
                                ]
                            },
                            null
                        ]
                    },
                    "avatar":
                    {
                        "mediaBasePath":
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$list_user.mediaBasePath", 0
                                    ]
                                },
                                null
                            ]
                        },
                        "mediaEndpoint":
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$list_user.mediaEndpoint", 0
                                    ]
                                },
                                null
                            ]
                        },
                        "mediaType":
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$list_user.mediaType", 0
                                    ]
                                },
                                null
                            ]
                        },
                        "mediaUri":
                        {
                            "$ifNull":
                            [
                                {
                                    "$arrayElemAt":
                                    [
                                        "$list_user.mediaUri", 0
                                    ]
                                },
                                null
                            ]
                        },
                    },
                    "transaction_date":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$trans_data.createdAt", 0
                                ]
                            },
                            null //atau bisa juga diganti jadi tanggal now
                        ]
                    },
                    "transaction_ID":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$trans_data.idTransaction", 0
                                ]
                            },
                            "KOSONG" //atau bisa juga diganti jadi tanggal now
                        ]
                    },
                    "used_discount":
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                [
                                    "$trans_data",
                                    []
                                ]
                            },
                            then:false,
                            else:true
                        }
                    },
                    total:
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                [
                                    "$satuan_diskon", "COIN"
                                ]
                            },
                            then:
                            {
                                "$arrayElemAt":
                                [
                                    "$trans_data.totalCoin", 0
                                ]
                            },
                            else:
                            {
                                "$arrayElemAt":
                                [
                                    "$trans_data.totalPrice", 0
                                ]
                            }
                        }
                    }
                }
            }
        );
        
        var match = [];
        if(username != null)
        {
            match.push(
                {
                    "$or":
                    [
                        {
                            "username":
                            {
                                "$regex":username,
                                "$options":"i"
                            }
                        },
                        {
                            "email":
                            {
                                "$regex":username,
                                "$options":"i"
                            }
                        },
                    ]
                }
            );
        }

        if(transaction_id != null)
        {
            match.push(
                {
                    "transaction_ID":
                    {
                        "$regex":transaction_id,
                        "$options":"i"
                    }
                }
            );
        }

        if(status != null)
        {
            if(status.toString() == "true")
            {
                match.push(
                    {
                        "used_discount":true
                    }
                ); 
            }
            else
            {
                match.push(
                    {
                        "used_discount":false
                    }
                );
            }
        }

        if(startdate != null && enddate != null)
        {
            var before = new Date(startdate).toISOString().split("T")[0];
            var input = new Date(enddate);
            input.setDate(input.getDate() + 1);
            var after = new Date(input).toISOString().split("T")[0];
            
            match.push(
                {
                    "transaction_date":
                    {
                        "$gte": before,
                        "$lt": after
                    },
                }
            );
        }

        if(match.length != 0)
        {
            facetAggregate.push(
                {
                    "$match":
                    {
                        "$and":match
                    }
                }
            );    
        }

        if(page != null && limit != null)
        {
            facetAggregate.push(
                {
                    "$skip":page * limit
                },
                {
                    "$limit":limit
                }
            )
        }

        facet['list'] = facetAggregate;
        pipeline.push(
            {
                "$facet":facet
            }
        );

        // var util = require('util');
        // util.inspect(pipeline, { showHidden:false, depth:null });

        var data = await this.monetData.aggregate(pipeline);
        return data;
    }

    async discount_usage_special(target:string, username:string, transaction_id:string, startdate:string, enddate:string, status:string, page:number, limit:number)
    {
        var pipeline = [];
        var facet = {};

        pipeline.push(
            {
                "$match":
                {
                    "_id": new mongoose.Types.ObjectId(target)
                }
            },
        );

        facet['detail'] = [
            {
                "$lookup":
                {
                    "from":"transactionsDiscounts",
                    "as": "trans_data_2",
                    "let": 
                    { 
                        "disc_id": '$_id'
                    },
                    "pipeline":
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$$disc_id", "$idDiscount"
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            {
                "$project":
                {
                    "tipe":"$audiens",
                    "total":
                    {
                        "$size":"$trans_data_2"
                    }
                }
            }
        ];

        var facetAggregate = [];
        facetAggregate.push(
            {
                "$lookup":
                {
                    "from":"newUserBasics",
                    "as": "user_data",
                    "let": 
                    { 
                        local_id: '$audiens_user' 
                    },
                    "pipeline": 
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$in":
                                    [
                                        "$_id", "$$local_id"
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            {
                "$set":
                {
                    "list_user":"$user_data"
                }
            },
            {
                "$unwind":
                {
                    "path":"$list_user",
                    "preserveNullAndEmptyArrays":true
                }
            },
            {
                "$lookup":
                {
                    "from":"transactionsDiscounts",
                    "as": "trans_data",
                    "let": 
                    { 
                        "idUser": '$list_user._id',
                        "idDiscount": '$_id'
                    },
                    "pipeline":
                    [
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$$idUser","$idUser"
                                            ]
                                        }
                                    },
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$$idDiscount","$idDiscount"
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$lookup":
                            {
                                from:"transactionsV2",
                                localField:"idTransaction",
                                foreignField:"_id",
                                as:"trans_detail"
                            }
                        },
                        {
                            "$project":
                            {
                                _id:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail._id", 0
                                    ]
                                },
                                idTransaction:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.idTransaction", 0
                                    ]
                                },
                                coin:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.coin", 0
                                    ]
                                },
                                price:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.price", 0
                                    ]
                                },
                                totalCoin:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.totalCoin", 0
                                    ]
                                },
                                totalPrice:
                                {
                                    "$arrayElemAt":
                                    [
                                        "$trans_detail.totalPrice", 0
                                    ]
                                },
                                createdAt:1
                            }
                        }
                    ]
                }
            },
            {
                "$project":
                {
                    "username":"$list_user.username",
                    "fullName":"$list_user.fullName",
                    "email":"$list_user.email",
                    "avatar":
                    {
                        "mediaBasePath":
                        {
                            "$ifNull":
                            [
                                "$list_user.mediaBasePath",
                                null
                            ]
                        },
                        "mediaEndpoint":
                        {
                            "$ifNull":
                            [
                                "$list_user.mediaEndpoint",
                                null
                            ]
                        },
                        "mediaType":
                        {
                            "$ifNull":
                            [
                                "$list_user.mediaType",
                                null
                            ]
                        },
                        "mediaUri":
                        {
                            "$ifNull":
                            [
                                "$list_user.mediaUri",
                                null
                            ]
                        },
                    },
                    "transaction_date":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$trans_data.createdAt", 0
                                ]
                            },
                            "$createdAt" //atau bisa juga diganti jadi tanggal now
                        ]
                    },
                    "transaction_ID":
                    {
                        "$ifNull":
                        [
                            {
                                "$arrayElemAt":
                                [
                                    "$trans_data.idTransaction", 0
                                ]
                            },
                            "KOSONG" //atau bisa juga diganti jadi tanggal now
                        ]
                    },
                    "used_discount":
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                [
                                    "$trans_data",
                                    []
                                ]
                            },
                            then:false,
                            else:true
                        }
                    },
                    total:
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
                                            "$satuan_diskon", "COIN"
                                        ]
                                    },
                                    then:
                                    {
                                        "$arrayElemAt":
                                        [
                                            "$trans_data.totalCoin", 0
                                        ]
                                    },
                                    else:
                                    {
                                        "$arrayElemAt":
                                        [
                                            "$trans_data.totalPrice", 0
                                        ]
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            }
        );
        
        var match = [];
        if(status != null)
        {
            if(status.toString() == "true")
            {
                match.push(
                    {
                        "used_discount":true
                    }
                ); 
            }
            else
            {
                match.push(
                    {
                        "used_discount":false
                    }
                );
            }
        }

        if(username != null)
        {
            match.push(
                {
                    "$or":
                    [
                        {
                            "username":
                            {
                                "$regex":username,
                                "$options":"i"
                            }
                        },
                        {
                            "email":
                            {
                                "$regex":username,
                                "$options":"i"
                            }
                        },
                    ]
                }
            );
        }

        if(transaction_id != null)
        {
            match.push(
                {
                    "transaction_ID":
                    {
                        "$regex":transaction_id,
                        "$options":"i"
                    }
                }
            );
        }

        if(startdate != null && enddate != null)
        {
            var before = new Date(startdate).toISOString().split("T")[0];
            var input = new Date(enddate);
            input.setDate(input.getDate() + 1);
            var after = new Date(input).toISOString().split("T")[0];
            
            match.push(
                {
                    "transaction_date":
                    {
                        "$gte": before,
                        "$lt": after
                    },
                }
            );
        }

        if(match.length != 0)
        {
            facetAggregate.push(
                {
                    "$match":
                    {
                        "$and":match
                    }
                }
            );    
        }

        if(page != null && limit != null)
        {
            facetAggregate.push(
                {
                    "$skip":page * limit
                },
                {
                    "$limit":limit
                }
            )
        }

        facet['list'] = facetAggregate;
        pipeline.push(
            {
                "$facet":facet
            }
        );

        // var util = require('util');
        // console.log(util.inspect(pipeline, { showHidden:false, depth:null }));

        var data = await this.monetData.aggregate(pipeline);
        return data;
    }
}
