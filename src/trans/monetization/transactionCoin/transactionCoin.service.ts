import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { transactionCoin, transactionCoinDocument, transactionCoinSchema } from './schemas/transactionCoin.schema';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { MonetizationService } from '../monetization.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
const sharp = require('sharp');

@Injectable()
export class transactionCoinService {
    constructor(
        @InjectModel(transactionCoin.name, 'SERVER_FULL')
        private readonly trans: Model<transactionCoinDocument>,
        private readonly configService: ConfigService,
        private readonly utilsService: UtilsService,
        private readonly LogAPISS: LogapisService,
        private readonly monetService: MonetizationService,
        private readonly basic2SS: UserbasicnewService,
        private readonly errorHandler: ErrorHandler
    ) { }

    async find(): Promise<transactionCoin[]> {
        return this.trans.find().exec();
    }

    async findOne(id: string): Promise<transactionCoin> {
        var setid = new mongoose.Types.ObjectId(id);
        var data = await this.trans.findById(setid);
        return data;
    }

    async updateOne(id: string, data: transactionCoin) {
        var setid = new mongoose.Types.ObjectId(id);
        return this.trans.findByIdAndUpdate(setid, data, { new: true });
    }

    async createTransaction(header: any, body: any) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var url = header.host + "/api/transactioncoin/create";
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_body = JSON.parse(JSON.stringify(body));

        let id = new mongoose.Types.ObjectId();
        // if (!body.idUser || body.idUser == undefined) {
        //     var timestamps_end = await this.utilsService.getDateTimeString();
        //     this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
        //     return this.errorHandler.generateNotAcceptableException("idUser field is required");
        // }
        let userData = await this.basic2SS.findBymail(email);
        if (await this.utilsService.ceckData(userData)) {
            // if (userData.pin != undefined) {
            //     let decryptPin = await this.utilsService.decrypt(userData.pin.toString());
            //     if (body.pin != decryptPin) {
            //         var timestamps_end = await this.utilsService.getDateTimeString();
            //         this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            //         return this.errorHandler.generateNotAcceptableException(
            //             "Unable to proceed, PIN does not match",
            //         );
            //     }
            // } else {
            //     var timestamps_end = await this.utilsService.getDateTimeString();
            //     this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            //     return this.errorHandler.generateNotAcceptableException(
            //         "Unable to proceed, user has not created PIN",
            //     );
            // }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException(
                "Unable to proceed, user data not found",
            );
        }
        if (!body.idPackage || body.idPackage == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException("idPackage field is required");
        }
        let packageData = await this.monetService.findOne(body.idPackage);
        if (!(await this.utilsService.ceckData(packageData))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException(
                "Unable to proceed, package data not found",
            );
        }
        if (packageData.stock < body.quantity) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException("Quantity exceeds available stock");
        }
        if (!body.idTransaction || body.idTransaction == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException("idTransaction field is required");
        }
        await this.monetService.updateStock(body.idPackage, body.quantity, true);
        let now = await this.utilsService.getDateTimeString();
        let data = await this.trans.create({
            _id: id,
            idPackage: new mongoose.Types.ObjectId(body.idPackage),
            idTransaction: new mongoose.Types.ObjectId(body.idTransaction),
            idUser: userData._id,
            qty: body.quantity,
            status: "PENDING",
            createdAt: now,
            updatedAt: now
        });
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
        return {
            response_code: 202,
            data: data,
            message: {
                "info": ["The process was successful"],
            }
        }
    }

    async cancelTransaction(header: any, body: any) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var url = header.host + "/api/transactioncoin/cancel";
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_body = JSON.parse(JSON.stringify(body));

        if (!body.idTransactionCoin || body.idTransactionCoin == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException("idTransactionCoin field is required");
        }
        let trxData = await this.trans.findById(body.idTransactionCoin);
        if (!(await this.utilsService.ceckData(trxData))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
            return this.errorHandler.generateNotAcceptableException(
                "Unable to proceed, coin transaction data not found",
            );
        }
        await this.monetService.updateStock(trxData.idPackage.toString(), trxData.qty, false);
        let data = await this.trans.findByIdAndUpdate(body.idTransactionCoin, { status: "CANCEL", updatedAt: await this.utilsService.getDateTimeString() }, { new: true });
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_body);
        return {
            response_code: 202,
            data: data,
            message: {
                "info": ["The process was successful"],
            }
        }
    }
}
