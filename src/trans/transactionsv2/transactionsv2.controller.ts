
import { TransactionsV2Service } from './transactionsv2.service';
import { LogapisService } from '../logapis/logapis.service';


import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, BadRequestException, HttpStatus, Put, Headers, Req, NotAcceptableException, HttpCode } from '@nestjs/common';

import { transactionsV2 } from '../../trans/transactionsv2/schema/transactionsv2.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
//import { SettingsService } from '../settings/settings.service';
// import { MethodepaymentsService } from '../methodepayments/methodepayments.service';
// import { BanksService } from '../banks/banks.service';
// import { AccountbalancesService } from '../accountbalances/accountbalances.service';
// import { UserbankaccountsService } from '../userbankaccounts/userbankaccounts.service';
// import { OyPgService } from '../../paymentgateway/oypg/oypg.service';
// import { InsightsService } from '../../content/insights/insights.service';
// import { WithdrawsService } from '../withdraws/withdraws.service';
// import mongoose, { Types } from 'mongoose';
// import { GetusercontentsService } from '../getusercontents/getusercontents.service';
// import { UservouchersService } from '../uservouchers/uservouchers.service';
// import { VouchersService } from '../vouchers/vouchers.service';
// import { post } from 'jquery';
// import { UtilsService } from '../../utils/utils.service';
// import { ErrorHandler } from '../../utils/error.handler';
// import { PostContentService } from '../../content/posts/postcontent.service';
// import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
// import { MediastoriesService } from '../../content/mediastories/mediastories.service';
// import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
// import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
// import { CreateUserplaylistDto } from '../userplaylist/dto/create-userplaylist.dto';
// import { LanguagesService } from '../../infra/languages/languages.service';
// import { ignoreElements } from 'rxjs';
// import { AdsService } from '../ads/ads.service';
// import { BoostsessionService } from '../../content/boostsession/boostsession.service';
// import { BoostintervalService } from '../../content/boostinterval/boostinterval.service';
// import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';
// import { CreatePostsDto } from 'src/content/posts/dto/create-posts.dto';
// import { Accountbalances } from '../accountbalances/schemas/accountbalances.schema';
// import { Templates } from 'src/infra/templates/schemas/templates.schema';
// import { Console } from 'console';
// import { AdsBalaceCreditDto } from '../adsv2/adsbalacecredit/dto/adsbalacecredit.dto';
// import { AdsBalaceCreditService } from '../adsv2/adsbalacecredit/adsbalacecredit.service';
// import { VoucherpromoService } from '../adsv2/voucherpromo/voucherpromo.service';

// import { AdsPriceCreditsService } from '../adsv2/adspricecredits/adspricecredits.service';
// import { AdsPriceCredits } from '../adsv2/adspricecredits/schema/adspricecredits.schema';
// import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
// import { NewPostService } from 'src/content/new_post/new_post.service';
// import { CreateNewPostDTO } from 'src/content/new_post/dto/create-newPost.dto';
// import { NewPostContentService } from 'src/content/new_post/new_postcontent.service';


@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(private readonly transactionsV2Service: TransactionsV2Service, private readonly logapiSS: LogapisService,
       // private readonly utilsService: UtilsService,
        // private readonly errorHandler: ErrorHandler,
        // private readonly basic2SS: UserbasicnewService,
        // private readonly settingsService: SettingsService,
        // private readonly methodepaymentsService: MethodepaymentsService,
        // private readonly banksService: BanksService,
        // private readonly posts2SS: NewPostService,
        // private readonly oyPgService: OyPgService,
        // private readonly postsContent2SS: NewPostContentService,
        
        ) { }

        // @UseGuards(JwtAuthGuard)
        // @Post('api/transactions/v2')
        // async create2(@Res() res, @Headers('x-auth-token') auth: string, @Headers('x-auth-user') email: string, @Body() transactionsV2_: transactionsV2, @Request() request) {
        //     var timestamps_start = await this.utilsService.getDateTimeString();
        //     var fullurl = request.get("Host") + request.originalUrl;
    
        //     const messages = {
        //         "info": ["The create successful"],
        //     };
    
        //     const messagesEror = {
        //         "info": ["Todo is not found!"],
        //     };
        //     var postid = null;
        //     var amount = 0;
        //     var salelike = null;
        //     var saleview = null;
        //     var bankcode = null;
        //     var paymentmethod = null;
        //     var type = null;
        //     var detail = null;
        //     var arrayPostId = [];
        //     var postidTR = null;
        //     var qty = null;
    
    
        //     var titleinsukses = "Selamat";
        //     var titleensukses = "Congratulations";
        //     var bodyinsukses = "Silahkan selesaikan pembayaran Anda Klik Di Sini untuk Melihat";
        //     var bodyensukses = "Please complete your payment Click Here to View";
        //     var eventType = "TRANSACTION";
        //     var event = "TRANSACTION";
    
        //     var request_json = JSON.parse(JSON.stringify(request.body));
        //     if (request_json["postid"] !== undefined) {
        //         postid = request_json["postid"];
        //     } else {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Unabled to proceed");
        //     }
    
        //     if (request_json["amount"] !== undefined) {
        //         amount = request_json["amount"];
        //     } else {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Unabled to proceed");
        //     }
    
        //     //var splitPostid = postid.split(',');
        //     var lenghtpostid = postid.length;
    
        //     salelike = request_json["salelike"];
        //     saleview = request_json["saleview"];
        //     if (request_json["paymentmethod"] !== undefined) {
        //         paymentmethod = request_json["paymentmethod"];
        //     } else {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Unabled to proceed");
        //     }
    
        //     if (request_json["bankcode"] !== undefined) {
        //         bankcode = request_json["bankcode"];
        //     } else {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Unabled to proceed");
        //     }
    
        //     if (request_json["type"] !== undefined) {
        //         type = request_json["type"];
        //     } else {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Unabled to proceed");
        //     }
    
    
        //     detail = request_json["detail"];
        //     var token = auth;
        //     var reptoken = token.replace("Bearer ", "");
        //     var x = await this.parseJwt(reptoken);
        //     var datatrpending = null;
        //     const mongoose = require('mongoose');
        //     var ObjectId = require('mongodb').ObjectId;
    
        //     var totalamount = 0;
        //     var email = email;
    
        //     var datatransaction = await this.transactionsV2Service.findAll();
        //     var leng = datatransaction.length + 1;
    
        //     var curdate = new Date(Date.now());
        //     var beforedate = curdate.toISOString();
    
        //     var substrtahun = beforedate.substring(0, 4);
        //     var numtahun = parseInt(substrtahun);
    
        //     var substrbulan = beforedate.substring(7, 5);
        //     var numbulan = parseInt(substrbulan);
        //     var substrtanggal = beforedate.substring(10, 8);
        //     var numtanggal = parseInt(substrtanggal);
    
        //     var rotahun = this.romawi(numtahun);
        //     var robulan = this.romawi(numbulan);
        //     var rotanggal = this.romawi(numtanggal);
        //     var no = "INV/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;
    
        //     var ubasic = await this.basic2SS.findBymail(email);
    
        //     var iduser = ubasic._id;
    
        //     var userbuyer = mongoose.Types.ObjectId(iduser);
    
        //     var namapembeli = ubasic.fullName;
        //     var dataconten = null;
        //     var saleAmount = 0;
        //     var dt = new Date(Date.now());
        //     dt.setHours(dt.getHours() + 7); // timestamp
        //     dt = new Date(dt);
    
        //     var datapost = null;
        //     var emailseller = null;
        //     var ubasicseller = null;
        //     var iduserseller = null;
        //     var namapenjual = null;
        //     var arraypostids = [];
        //     var arraymount = [];
        //     var arrayDetail = [];
        //     var datavoucher = null;
        //     var datasettingppn = null;
        //     var datamradmin = null;
        //     var databankvacharge = null;
        //     var datasettingexpiredva = null;
        //     var transactionVoucher = null;
        //     var datamradmin = null;
        //     var expiredvanew = null;
        //     var databankvacharge = null;
        //     var datawayting = null;
        //     var statuswait = null;
        //     var postType = null;
        //     var idppn = "62bbbe43a7520000050077a3";
        //     //  var idmdradmin = "62bd413ff37a00001a004369";
        //     var idbankvacharge = "62bd40e0f37a00001a004366";
        //     var idexpiredva = "62bbbe8ea7520000050077a4";
        //     var datenow = new Date(Date.now());
    
        //     try {
  
        //         databankvacharge = await this.settingsService.findOne(idbankvacharge);

        //         var valuevacharge = databankvacharge._doc.value;
        //         totalamount = amount;
    
    
    
        //     } catch (e) {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Setting value not found..!");
        //     }
    
        //     var idmethode = null;
        //     var idbank = null;
        //     var datamethode = null;
        //     var namamethode = "";
        //     try {
        //         datamethode = await this.methodepaymentsService.findmethodename(paymentmethod);
        //         namamethode = datamethode._doc.methodename;
        //         idmethode = datamethode._doc._id;
    
        //     } catch (e) {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Methode payment not found...!");
        //     }
    
        //     var databank = null;
        //     var namabank = "";
        //     try {
        //         databank = await this.banksService.findbankcode(bankcode);
        //         namabank = databank._doc.bankname;
        //         idbank = databank._doc._id;
    
        //     } catch (e) {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Banks not found...!");
        //     }
    
    
        //     try {
        //         // datasettingppn = await this.settingsService.findOne(idppn);
        //         // datamradmin = await this.settingsService.findOne(idmdradmin);
        //         databankvacharge = await this.settingsService.findOne(idbankvacharge);
        //         datasettingexpiredva = await this.settingsService.findOne(idexpiredva);
        //         // var valueppn = datasettingppn._doc.value;
        //         var valuevacharge = databankvacharge._doc.value;
        //         // var valuemradmin = datamradmin._doc.value;
        //         var valueexpiredva = datasettingexpiredva._doc.value;
    
        //     } catch (e) {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Setting value not found..!");
        //     }
    
        //     var userbuy = iduser;
        //     var name = ubasic.fullName;
        //     var emailbuy = ubasic.email;
        //     var stringId = (await this.generateNumber()).toString();
        //     var expiredtimeva = null;
        //     try {
    
        //         datawayting = await this.transactionsV2Service.findExpired(userbuyer);
        //         statuswait = datawayting.status;
        //         let expiredtimeva = datawayting.expiredtimeva;
        //         expiredvanew = new Date(expiredtimeva);
        //         expiredvanew.setHours(expiredvanew.getHours() - 7);
    
        //     } catch (e) {
        //         datawayting = null;
        //         expiredva = null;
        //         statuswait = null;
        //     }
    
        //     if (statuswait === "WAITING_PAYMENT" && datenow > expiredvanew) {
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //         throw new BadRequestException("Tidak dapat melanjutkan. Selesaikan pembayaran transaksi anda dahulu !");
        //     }
        //     else {
    
        //         if (type === "CONTENT") {
                   
    
        //                 let cekstatusva = await this.oyPgService.staticVaInfo(datatrpending.idva);
        //                 var expiredva = cekstatusva.trx_expiration_time;
        //                 var dex = new Date(expiredva);
        //                 dex.setHours(dex.getHours() + 7); // timestamp
        //                 dex = new Date(dex);
    
        //                 if (cekstatusva.va_status === "WAITING_PAYMENT") {
        //                     var timestamps_end = await this.utilsService.getDateTimeString();
        //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //                     throw new BadRequestException("Tidak dapat melanjutkan. Konten ini sedang dalam proses pembelian");
        //                 }
        //                 else if (cekstatusva.va_status === "STATIC_TRX_EXPIRED" || cekstatusva.va_status === "EXPIRED") {
    
        //                     var idtransaction = datatrpending._id;
    
        //                     var datava = {
        //                         "partner_user_id": userbuy.toString() + stringId,
        //                         "amount": totalamount,
        //                         "bank_code": bankcode,
        //                         "is_open": false,
        //                         "is_single_use": true,
        //                         "is_lifetime": false,
        //                         "username_display": email,
        //                         "email": email,
        //                         "trx_expiration_time": valueexpiredva,
        //                     }
    
        //                     try {
        //                         var datareqva = await this.oyPgService.generateStaticVa(datava);
        //                         var idva = datareqva.id;
        //                         var statuscodeva = datareqva.status.code;
        //                         var statusmessage = datareqva.status.message;
        //                         var nova = datareqva.va_number;
        //                         var expiredva = datareqva.trx_expiration_time;
        //                         var d1 = new Date(expiredva);
        //                         d1.setHours(d1.getHours() + 7); // timestamp
        //                         d1 = new Date(d1);
    
    
        //                     } catch (e) {
        //                         var timestamps_end = await this.utilsService.getDateTimeString();
        //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //                         throw new BadRequestException("Not process..!");
    
        //                     }
    
        //                     if (statuscodeva == "000") {
    
        //                         try {
    
        //                             let cekstatusva = await this.oyPgService.staticVaInfo(idva);
    
        //                             transactionsV2_.noInvoice = no;
        //                             transactionsV2_.createdAt =  dt.toISOString();
        //                             transactionsV2_.updatedAt =  dt.toISOString();
        //                             transactionsV2_.category=new mongoose.Types.ObjectId(transactionsV2_.category.toString())
        //                             let datatr = await this.transactionsV2Service.createNew(transactionsV2_);
    
        //                             //this.notifbuy(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, postIds, no);
        //                             await this.transactionsV2Service.updatestatuscancel(idtransaction);
    
    
        //                             var data = {
        //                                 "_id": datatr._id,
        //                                 "noinvoice": datatr.noInvoice,
        //                                 "type": datatr.type,
        //                                 "coin": Number(datatr.coin),
        //                                 category: datatr.category,
        //                                 totalCoin: Number(datatr.totalCoin),
        //                                 status: datatr.status,
        //                                 detail:datatr.detail,
        //                                 remark: datatr.remark,  
                                      
        //                             };
    
    
        //                         } catch (e) {
        //                             var timestamps_end = await this.utilsService.getDateTimeString();
        //                             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //                             return res.status(HttpStatus.BAD_REQUEST).json({
    
        //                                 "message": messagesEror + " " + e.toString()
        //                             });
        //                         }
    
        //                         var timestamps_end = await this.utilsService.getDateTimeString();
        //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    
        //                         return res.status(HttpStatus.OK).json({
        //                             response_code: 202,
        //                             "data": data,
        //                             "message": messages
        //                         });
        //                         // setTimeout(res, 3000);
        //                     }
                          
    
        //                 }
    
    
    
                   
    
        //         }
             
        //     }
    
        // }
        // async notifbuy(emailbuy: string, titleinsukses: string, titleensukses: string, bodyinsukses: string, bodyensukses: string, eventType: string, event: string, postIds: string, no: string) {
        //     await this.utilsService.sendFcm(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, postIds, "TRANSACTION", no, "TRANSACTION");
        // }
    async parseJwt(token) {

        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };
    async romawi(num: number) {
        if (typeof num !== 'number')
            return false;

        var roman = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
        };
        var str = '';

        for (var i of Object.keys(roman)) {
            var q = Math.floor(num / roman[i]);
            num -= q * roman[i];
            str += i.repeat(q);
        }

        return str;
    }
    async generateNumber() {
        const getRandomId = (min = 0, max = 500000) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            return num.toString().padStart(6, "0")
        };
        return getRandomId();
    }
}
