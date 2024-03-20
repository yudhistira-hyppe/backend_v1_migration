
import { TransactionsV2Service } from './transactionsv2.service';
import { LogapisService } from '../logapis/logapis.service';


import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, BadRequestException, HttpStatus, Put, Headers, Req, NotAcceptableException, HttpCode } from '@nestjs/common';

import { transactionsV2 } from '../../trans/transactionsv2/schema/transactionsv2.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { SettingsService } from '../settings/settings.service';
import { MethodepaymentsService } from '../methodepayments/methodepayments.service';
import { BanksService } from '../banks/banks.service';
import { AccountbalancesService } from '../accountbalances/accountbalances.service';
import { UserbankaccountsService } from '../userbankaccounts/userbankaccounts.service';
import { OyPgService } from '../../paymentgateway/oypg/oypg.service';
import { InsightsService } from '../../content/insights/insights.service';
import { WithdrawsService } from '../withdraws/withdraws.service';
import mongoose, { Types } from 'mongoose';
import { GetusercontentsService } from '../getusercontents/getusercontents.service';
import { UservouchersService } from '../uservouchers/uservouchers.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { post } from 'jquery';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { PostContentService } from '../../content/posts/postcontent.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { MediastoriesService } from '../../content/mediastories/mediastories.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { CreateUserplaylistDto } from '../userplaylist/dto/create-userplaylist.dto';
import { LanguagesService } from '../../infra/languages/languages.service';
import { ignoreElements } from 'rxjs';
import { AdsService } from '../ads/ads.service';
import { BoostsessionService } from '../../content/boostsession/boostsession.service';
import { BoostintervalService } from '../../content/boostinterval/boostinterval.service';
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';
import { CreatePostsDto } from 'src/content/posts/dto/create-posts.dto';
import { Accountbalances } from '../accountbalances/schemas/accountbalances.schema';
import { Templates } from 'src/infra/templates/schemas/templates.schema';
import { Console } from 'console';
import { AdsBalaceCreditDto } from '../adsv2/adsbalacecredit/dto/adsbalacecredit.dto';
import { AdsBalaceCreditService } from '../adsv2/adsbalacecredit/adsbalacecredit.service';
import { VoucherpromoService } from '../adsv2/voucherpromo/voucherpromo.service';

import { AdsPriceCreditsService } from '../adsv2/adspricecredits/adspricecredits.service';
import { AdsPriceCredits } from '../adsv2/adspricecredits/schema/adspricecredits.schema';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { NewPostService } from 'src/content/new_post/new_post.service';
import { CreateNewPostDTO } from 'src/content/new_post/dto/create-newPost.dto';
import { NewPostContentService } from 'src/content/new_post/new_postcontent.service';

@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(private readonly transactionsV2Service: TransactionsV2Service, private readonly logapiSS: LogapisService) { }

    // @UseGuards(JwtAuthGuard)
    // @Post('api/transactions')
    // async create(@Res() res, @Headers('x-auth-token') auth: string, @Headers('x-auth-user') email: string, @Body() CreateTransactionsDto: CreateTransactionsDto, @Request() request) {
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

    //     var datatransaction = await this.transactionsService.findAll();
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

    //     var ubasic = await this.userbasicsService.findOne(email);

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
    //         //  datasettingppn = await this.settingsService.findOne(idppn);
    //         //  datamradmin = await this.settingsService.findOne(idmdradmin);
    //         databankvacharge = await this.settingsService.findOne(idbankvacharge);

    //         //var valueppn = datasettingppn._doc.value;
    //         // var nominalppn = amount * valueppn / 100;
    //         var valuevacharge = databankvacharge._doc.value;
    //         // var valuemradmin = datamradmin._doc.value;
    //         // var nominalmradmin = amount * valuemradmin / 100;

    //         //var prosentase = valueppn + valuemradmin;
    //         // var calculate = amount * prosentase / 100;
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

    //         datawayting = await this.transactionsService.findExpired(userbuyer);
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
    //             try {
    //                 datapost = await this.postsService.findid(postid[0].id);

    //                 emailseller = datapost._doc.email;

    //                 ubasicseller = await this.userbasicsService.findOne(emailseller);
    //                 iduserseller = ubasicseller._id;
    //                 namapenjual = ubasicseller.fullName;

    //             } catch (e) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException("User not found..!");
    //             }

    //             try {

    //                 dataconten = await this.getusercontentsService.findcontenbuy(postid[0].id);
    //                 saleAmount = dataconten[0].saleAmount;
    //                 postType = dataconten[0].postType;
    //             } catch (e) {
    //                 dataconten = null;
    //                 saleAmount = 0;
    //                 postType = "";
    //             }



    //             try {

    //                 datatrpending = await this.transactionsService.findpostidpending(postid[0].id);


    //             } catch (e) {
    //                 datatrpending = null;

    //             }


    //             var postIds = postid[0].id;

    //             //  var objid = mongoose.Types.ObjectId(postIds);
    //             var qty = postid[0].qty;
    //             var totalAmount = postid[0].totalAmount;
    //             var arraydetailobj = { "id": postIds, "qty": qty, "totalAmount": totalAmount };
    //             arrayDetail.push(arraydetailobj);

    //             postidTR = postIds;
    //             arraypostids.push(postid[0].id);


    //             if (datatrpending !== null) {

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


    //                     // var datenow = new Date(Date.now());
    //                     // var expiredvas = dex;
    //                     // var dateVa = new Date(expiredvas);
    //                     // dateVa.setHours(dateVa.getHours() - 7); // timestamp


    //                     var idtransaction = datatrpending._id;

    //                     // if (datenow > dateVa) {

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

    //                             CreateTransactionsDto.iduserbuyer = iduser;
    //                             CreateTransactionsDto.idusersell = iduserseller;
    //                             CreateTransactionsDto.timestamp = dt.toISOString();
    //                             CreateTransactionsDto.updatedAt = dt.toISOString();
    //                             CreateTransactionsDto.noinvoice = no;
    //                             CreateTransactionsDto.amount = saleAmount;
    //                             CreateTransactionsDto.status = cekstatusva.va_status;
    //                             CreateTransactionsDto.bank = idbank;
    //                             CreateTransactionsDto.idva = idva;
    //                             CreateTransactionsDto.nova = nova;
    //                             CreateTransactionsDto.accountbalance = null;
    //                             CreateTransactionsDto.paymentmethod = idmethode;
    //                             // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                             CreateTransactionsDto.ppn = null;
    //                             CreateTransactionsDto.totalamount = totalamount;
    //                             CreateTransactionsDto.description = "buy " + type + " pending";
    //                             CreateTransactionsDto.payload = null;
    //                             CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                             CreateTransactionsDto.detail = arrayDetail;
    //                             CreateTransactionsDto.postid = postidTR;
    //                             CreateTransactionsDto.response = datareqva;
    //                             let datatr = await this.transactionsService.create(CreateTransactionsDto);

    //                             this.notifbuy(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, postIds, no);
    //                             await this.transactionsService.updatestatuscancel(idtransaction);


    //                             var data = {
    //                                 "noinvoice": datatr.noinvoice,
    //                                 "postid": postidTR,
    //                                 "idusersell": datatr.idusersell,
    //                                 "NamaPenjual": namapenjual,
    //                                 "iduserbuyer": datatr.iduserbuyer,
    //                                 "NamaPembeli": namapembeli,
    //                                 "amount": datatr.amount,
    //                                 "paymentmethod": namamethode,
    //                                 "status": datatr.status,
    //                                 "description": datatr.description,
    //                                 "idva": datatr.idva,
    //                                 "nova": datatr.nova,
    //                                 "expiredtimeva": datatr.expiredtimeva,
    //                                 "salelike": datatr.saleview,
    //                                 "saleview": datatr.salelike,
    //                                 "bank": namabank,
    //                                 // "ppn": valueppn + " %",
    //                                 // "nominalppn": nominalppn,
    //                                 "bankvacharge": valuevacharge,
    //                                 // "mdradmin": valuemradmin + " %",
    //                                 // "nominalmdradmin": nominalmradmin,
    //                                 "detail": arrayDetail,
    //                                 "totalamount": datatr.totalamount,
    //                                 "accountbalance": datatr.accountbalance,
    //                                 "timestamp": datatr.timestamp,
    //                                 "_id": datatr._id
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
    //                     else {
    //                         // throw new BadRequestException("Request is Rejected (API Key is not Valid)");

    //                         CreateTransactionsDto.iduserbuyer = iduser;
    //                         CreateTransactionsDto.idusersell = iduserseller;
    //                         CreateTransactionsDto.timestamp = dt.toISOString();
    //                         CreateTransactionsDto.updatedAt = dt.toISOString();
    //                         CreateTransactionsDto.noinvoice = no;
    //                         CreateTransactionsDto.amount = saleAmount;
    //                         CreateTransactionsDto.status = statusmessage;
    //                         CreateTransactionsDto.bank = idbank;
    //                         CreateTransactionsDto.idva = idva;
    //                         CreateTransactionsDto.nova = nova;
    //                         CreateTransactionsDto.accountbalance = null;
    //                         CreateTransactionsDto.paymentmethod = idmethode;
    //                         // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                         CreateTransactionsDto.ppn = null;
    //                         CreateTransactionsDto.totalamount = totalamount;
    //                         CreateTransactionsDto.description = statusmessage;
    //                         CreateTransactionsDto.payload = null;
    //                         CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                         CreateTransactionsDto.detail = arrayDetail;
    //                         CreateTransactionsDto.postid = postidTR;
    //                         CreateTransactionsDto.response = datareqva;
    //                         let datatr = await this.transactionsService.create(CreateTransactionsDto);

    //                         var timestamps_end = await this.utilsService.getDateTimeString();
    //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                         return res.status(HttpStatus.BAD_REQUEST).json({
    //                             response_code: statuscodeva,
    //                             message: statusmessage
    //                         });

    //                     }

    //                 }



    //             }
    //             else {

    //                 var datava = {
    //                     "partner_user_id": userbuy.toString() + stringId,
    //                     "amount": totalamount,
    //                     "bank_code": bankcode,
    //                     "is_open": false,
    //                     "is_single_use": true,
    //                     "is_lifetime": false,
    //                     "username_display": email,
    //                     "email": email,
    //                     "trx_expiration_time": valueexpiredva,
    //                 }

    //                 try {
    //                     var datareqva = await this.oyPgService.generateStaticVa(datava);
    //                     var idva = datareqva.id;
    //                     var statuscodeva = datareqva.status.code;
    //                     var statusmessage = datareqva.status.message;
    //                     var nova = datareqva.va_number;
    //                     var expiredva = datareqva.trx_expiration_time;
    //                     var d1 = new Date(expiredva);
    //                     d1.setHours(d1.getHours() + 7); // timestamp
    //                     d1 = new Date(d1);


    //                 } catch (e) {
    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     throw new BadRequestException("Not process..!");

    //                 }

    //                 if (statuscodeva == "000") {


    //                     try {

    //                         let cekstatusva = await this.oyPgService.staticVaInfo(idva);

    //                         CreateTransactionsDto.iduserbuyer = iduser;
    //                         CreateTransactionsDto.idusersell = iduserseller;
    //                         CreateTransactionsDto.timestamp = dt.toISOString();
    //                         CreateTransactionsDto.updatedAt = dt.toISOString();
    //                         CreateTransactionsDto.noinvoice = no;
    //                         CreateTransactionsDto.amount = saleAmount;
    //                         CreateTransactionsDto.status = cekstatusva.va_status;
    //                         CreateTransactionsDto.bank = idbank;
    //                         CreateTransactionsDto.idva = idva;
    //                         CreateTransactionsDto.nova = nova;
    //                         CreateTransactionsDto.accountbalance = null;
    //                         CreateTransactionsDto.paymentmethod = idmethode;
    //                         // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                         CreateTransactionsDto.ppn = null;
    //                         CreateTransactionsDto.totalamount = totalamount;
    //                         CreateTransactionsDto.description = "buy " + type + " pending";
    //                         CreateTransactionsDto.payload = null;
    //                         CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                         CreateTransactionsDto.detail = arrayDetail;
    //                         CreateTransactionsDto.postid = postidTR;
    //                         CreateTransactionsDto.response = datareqva;
    //                         let datatr = await this.transactionsService.create(CreateTransactionsDto);
    //                         this.notifbuy2(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, postidTR, no);

    //                         var data = {
    //                             "noinvoice": datatr.noinvoice,
    //                             "postid": postidTR,
    //                             "idusersell": datatr.idusersell,
    //                             "NamaPenjual": namapenjual,
    //                             "iduserbuyer": datatr.iduserbuyer,
    //                             "NamaPembeli": namapembeli,
    //                             "amount": datatr.amount,
    //                             "paymentmethod": namamethode,
    //                             "status": datatr.status,
    //                             "description": datatr.description,
    //                             "idva": datatr.idva,
    //                             "nova": datatr.nova,
    //                             "expiredtimeva": datatr.expiredtimeva,
    //                             "salelike": datatr.saleview,
    //                             "saleview": datatr.salelike,
    //                             "bank": namabank,
    //                             // "ppn": valueppn + " %",
    //                             // "nominalppn": nominalppn,
    //                             "bankvacharge": valuevacharge,
    //                             // "mdradmin": valuemradmin + " %",
    //                             // "nominalmdradmin": nominalmradmin,
    //                             "detail": arrayDetail,
    //                             "totalamount": datatr.totalamount,
    //                             "accountbalance": datatr.accountbalance,
    //                             "timestamp": datatr.timestamp,
    //                             "_id": datatr._id
    //                         };
    //                     } catch (e) {
    //                         var timestamps_end = await this.utilsService.getDateTimeString();
    //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                         return res.status(HttpStatus.BAD_REQUEST).json({

    //                             "message": messagesEror + " " + e.toString()
    //                         });
    //                     }

    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     return res.status(HttpStatus.OK).json({
    //                         response_code: 202,
    //                         "data": data,
    //                         "message": messages
    //                     });
    //                     // setTimeout(res, 3000);
    //                 }
    //                 else {
    //                     //throw new BadRequestException("Request is Rejected (API Key is not Valid)");
    //                     CreateTransactionsDto.iduserbuyer = iduser;
    //                     CreateTransactionsDto.idusersell = iduserseller;
    //                     CreateTransactionsDto.timestamp = dt.toISOString();
    //                     CreateTransactionsDto.updatedAt = dt.toISOString();
    //                     CreateTransactionsDto.noinvoice = no;
    //                     CreateTransactionsDto.amount = saleAmount;
    //                     CreateTransactionsDto.status = statusmessage;
    //                     CreateTransactionsDto.bank = idbank;
    //                     CreateTransactionsDto.idva = idva;
    //                     CreateTransactionsDto.nova = nova;
    //                     CreateTransactionsDto.accountbalance = null;
    //                     CreateTransactionsDto.paymentmethod = idmethode;
    //                     // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                     CreateTransactionsDto.ppn = null;
    //                     CreateTransactionsDto.totalamount = totalamount;
    //                     CreateTransactionsDto.description = statusmessage;
    //                     CreateTransactionsDto.payload = null;
    //                     CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                     CreateTransactionsDto.detail = arrayDetail;
    //                     CreateTransactionsDto.postid = postidTR;
    //                     CreateTransactionsDto.response = datareqva;
    //                     let datatr = await this.transactionsService.create(CreateTransactionsDto);

    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     return res.status(HttpStatus.BAD_REQUEST).json({
    //                         response_code: statuscodeva,
    //                         message: statusmessage
    //                     });
    //                 }

    //             }

    //         }
    //         else if (type === "VOUCHER") {

    //             var postidTRvoucer = null;
    //             var arraymountvc = [];
    //             var arraypostidsvc = [];
    //             var arrayDetailvc = [];
    //             try {


    //                 emailseller = "tjikaljedy@hyppe.id";
    //                 ubasicseller = await this.basic2SS.findBymail(emailseller);
    //                 iduserseller = ubasicseller._id;
    //                 namapenjual = ubasicseller.fullName;


    //             } catch (e) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException("User not found..!");
    //             }
    //             try {

    //                 datatrpending = await this.transactionsService.findpostidpendingVoucer();

    //             } catch (e) {
    //                 datatrpending = null;

    //             }

    //             try {

    //                 var sum = 0;
    //                 for (var i = 0; i < lenghtpostid; i++) {
    //                     var postIds = postid[i].id;

    //                     var objid = mongoose.Types.ObjectId(postIds);
    //                     var qty = postid[i].qty;


    //                     var totalAmount = postid[i].totalAmount;
    //                     dataconten = await this.vouchersService.findOne(postIds);
    //                     var qtyvoucher = dataconten.qty;
    //                     // var tusedvoucher = dataconten.totalUsed;
    //                     // var codeVoucher = dataconten.codeVoucher;
    //                     // var pendingUsed = dataconten.pendingUsed;
    //                     // var totalUsePending = tusedvoucher + pendingUsed;

    //                     if (qty > qtyvoucher) {
    //                         var timestamps_end = await this.utilsService.getDateTimeString();
    //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                         return res.status(HttpStatus.BAD_REQUEST).json({
    //                             "message": "Maaf quantity Voucher melebihi quota.."
    //                         });
    //                         process.exit(0);
    //                     }
    //                     // else if (totalUsePending === qtyvoucher) {
    //                     //     res.status(HttpStatus.BAD_REQUEST).json({
    //                     //         "message": "Maaf Voucher " + codeVoucher + " quota sudah habis.."
    //                     //     });
    //                     //     process.exit(0);
    //                     // } 

    //                     else {
    //                         var amountobj = dataconten.amount * qty;
    //                         arraymountvc.push(amountobj);
    //                         arraypostidsvc.push(postIds);

    //                         var arraydetailobj = { "id": objid, "qty": qty, "totalAmount": totalAmount };
    //                         arrayDetailvc.push(arraydetailobj);
    //                     }
    //                 }

    //                 for (var i = 0; i < arraymountvc.length; i++) {
    //                     sum += arraymountvc[i];
    //                 }

    //                 saleAmount = sum;
    //             } catch (e) {
    //                 dataconten = null;
    //                 saleAmount = 0;
    //             }

    //             postidTRvoucer = arraypostidsvc.toString();
    //             console.log(postidTRvoucer)

    //             if (datatrpending !== null) {

    //                 let cekstatusva = await this.oyPgService.staticVaInfo(datatrpending.idva);
    //                 var expiredva = cekstatusva.trx_expiration_time;
    //                 var dex = new Date(expiredva);
    //                 dex.setHours(dex.getHours() + 7); // timestamp
    //                 dex = new Date(dex);

    //                 // if (cekstatusva.va_status === "WAITING_PAYMENT") {
    //                 //     throw new BadRequestException("Tidak dapat melanjutkan. Voucher ini sedang dalam proses pembelian");
    //                 // }
    //                 //else if (cekstatusva.va_status === "STATIC_TRX_EXPIRED" || cekstatusva.va_status === "EXPIRED") {
    //                 var idtransaction = datatrpending._id;
    //                 var datava = {
    //                     "partner_user_id": userbuy.toString() + stringId,
    //                     "amount": totalamount,
    //                     "bank_code": bankcode,
    //                     "is_open": false,
    //                     "is_single_use": true,
    //                     "is_lifetime": false,
    //                     "username_display": email,
    //                     "email": email,
    //                     "trx_expiration_time": valueexpiredva,
    //                 }

    //                 try {
    //                     var datareqva = await this.oyPgService.generateStaticVa(datava);
    //                     var idva = datareqva.id;
    //                     var statuscodeva = datareqva.status.code;
    //                     var statusmessage = datareqva.status.message;
    //                     var nova = datareqva.va_number;
    //                     var expiredva = datareqva.trx_expiration_time;
    //                     var d1 = new Date(expiredva);
    //                     d1.setHours(d1.getHours() + 7); // timestamp
    //                     d1 = new Date(d1);


    //                 } catch (e) {
    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     throw new BadRequestException("Not process..!");

    //                 }

    //                 if (statuscodeva == "000") {

    //                     try {

    //                         let cekstatusva = await this.oyPgService.staticVaInfo(idva);

    //                         CreateTransactionsDto.iduserbuyer = iduser;
    //                         CreateTransactionsDto.idusersell = iduserseller;
    //                         CreateTransactionsDto.timestamp = dt.toISOString();
    //                         CreateTransactionsDto.updatedAt = dt.toISOString();
    //                         CreateTransactionsDto.noinvoice = no;
    //                         CreateTransactionsDto.amount = saleAmount;
    //                         CreateTransactionsDto.status = cekstatusva.va_status;
    //                         CreateTransactionsDto.bank = idbank;
    //                         CreateTransactionsDto.idva = idva;
    //                         CreateTransactionsDto.nova = nova;
    //                         CreateTransactionsDto.accountbalance = null;
    //                         CreateTransactionsDto.paymentmethod = idmethode;
    //                         // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                         CreateTransactionsDto.ppn = null;
    //                         CreateTransactionsDto.totalamount = totalamount;
    //                         CreateTransactionsDto.description = "buy " + type + " pending";
    //                         CreateTransactionsDto.payload = null;
    //                         CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                         CreateTransactionsDto.detail = arrayDetailvc;
    //                         CreateTransactionsDto.postid = postidTRvoucer.toString();
    //                         CreateTransactionsDto.response = datareqva;

    //                         //VOUCHER PROMO
    //                         if (CreateTransactionsDto.voucherpromo != undefined) {
    //                             if (CreateTransactionsDto.voucherpromo.length > 0) {
    //                                 var valueAllPromo = 0;
    //                                 var dataVoucherPromo = [];
    //                                 for (var i = 0; 1 < CreateTransactionsDto.voucherpromo.length; i++) {
    //                                     var voucherPending = 0;
    //                                     var dataVoucher = await this.voucherpromoService.findOneActive(CreateTransactionsDto.voucherpromo[i]);
    //                                     if (dataVoucher.quantity != undefined) {
    //                                         if (dataVoucher.quantity > 0) {
    //                                             var ceckPromoUsedPending = await this.transactionsService.findCodePromoUsedPending(CreateTransactionsDto.voucherpromo[i]);
    //                                             if (await this.utilsService.ceckData(ceckPromoUsedPending)) {
    //                                                 voucherPending += ceckPromoUsedPending.length;
    //                                             }
    //                                             if ((dataVoucher.quantity - voucherPending) > 0) {
    //                                                 if (await this.utilsService.ceckData(dataVoucher)) {
    //                                                     if (dataVoucher.value != undefined) {
    //                                                         valueAllPromo += Number(dataVoucher.value);
    //                                                         dataVoucherPromo.push(dataVoucher);
    //                                                     }
    //                                                 }
    //                                             }

    //                                         }
    //                                     }
    //                                 }
    //                                 CreateTransactionsDto.datavoucherpromo = dataVoucherPromo;
    //                                 CreateTransactionsDto.totalamount = (totalamount - valueAllPromo);
    //                             }
    //                         }

    //                         let datatr = await this.transactionsService.create(CreateTransactionsDto);
    //                         this.notifbuyvoucher(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, no);
    //                         //var lengArrDetail = arrayDetailvc.length;

    //                         // for (var i = 0; i < lengArrDetail; i++) {
    //                         //     let qtyDetail = arrayDetailvc[i].qty;
    //                         //     let idvoucher = arrayDetailvc[i].id.toString();
    //                         //     let idvcr = mongoose.Types.ObjectId(idvoucher);
    //                         //     datavoucher = await this.vouchersService.findOne(idvoucher);
    //                         //     let pendingUsed = datavoucher.pendingUsed;
    //                         //     let totalPending = pendingUsed + qtyDetail;
    //                         //     await this.vouchersService.updatesPendingUsed(idvcr, totalPending);
    //                         // }

    //                         await this.transactionsService.updatestatuscancel(idtransaction);
    //                         //  transactionVoucher = await this.transactionsService.findid(idtransaction.toString());


    //                         // var detailTr = transactionVoucher.detail;
    //                         // for (var a = 0; a < detailTr.length; a++) {
    //                         //     var qtyDetail2 = detailTr[a].qty;
    //                         //     var idvoucher2 = detailTr[a].id.toString();
    //                         //     var idvcr2 = detailTr[a].id;
    //                         //     datavoucher = await this.vouchersService.findOne(idvoucher2);
    //                         //     var pendingUsed2 = datavoucher.pendingUsed;
    //                         //     var totalPending2 = pendingUsed2 - qtyDetail2;
    //                         //     await this.vouchersService.updatesPendingUsed(idvcr2, totalPending2);
    //                         // }

    //                         var data = {
    //                             "noinvoice": datatr.noinvoice,
    //                             "postid": postidTRvoucer.toString(),
    //                             "idusersell": datatr.idusersell,
    //                             "NamaPenjual": namapenjual,
    //                             "iduserbuyer": datatr.iduserbuyer,
    //                             "NamaPembeli": namapembeli,
    //                             "amount": datatr.amount,
    //                             "paymentmethod": namamethode,
    //                             "status": datatr.status,
    //                             "description": datatr.description,
    //                             "idva": datatr.idva,
    //                             "nova": datatr.nova,
    //                             "expiredtimeva": datatr.expiredtimeva,
    //                             "salelike": datatr.saleview,
    //                             "saleview": datatr.salelike,
    //                             "bank": namabank,
    //                             // "ppn": valueppn + " %",
    //                             // "nominalppn": nominalppn,
    //                             "bankvacharge": valuevacharge,
    //                             // "mdradmin": valuemradmin + " %",
    //                             // "nominalmdradmin": nominalmradmin,
    //                             "detail": arrayDetailvc,
    //                             "totalamount": datatr.totalamount,
    //                             "accountbalance": datatr.accountbalance,
    //                             "timestamp": datatr.timestamp,
    //                             "_id": datatr._id
    //                         };


    //                     } catch (e) {
    //                         var timestamps_end = await this.utilsService.getDateTimeString();
    //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                         return res.status(HttpStatus.BAD_REQUEST).json({

    //                             "message": messagesEror + " " + e.toString()
    //                         });
    //                     }

    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     return res.status(HttpStatus.OK).json({
    //                         response_code: 202,
    //                         "data": data,
    //                         "message": messages
    //                     });
    //                     // setTimeout(res, 3000);
    //                 }
    //                 else {
    //                     // throw new BadRequestException("Request is Rejected (API Key is not Valid)");

    //                     CreateTransactionsDto.iduserbuyer = iduser;
    //                     CreateTransactionsDto.idusersell = iduserseller;
    //                     CreateTransactionsDto.timestamp = dt.toISOString();
    //                     CreateTransactionsDto.updatedAt = dt.toISOString();
    //                     CreateTransactionsDto.noinvoice = no;
    //                     CreateTransactionsDto.amount = saleAmount;
    //                     CreateTransactionsDto.status = statusmessage;
    //                     CreateTransactionsDto.bank = idbank;
    //                     CreateTransactionsDto.idva = idva;
    //                     CreateTransactionsDto.nova = nova;
    //                     CreateTransactionsDto.accountbalance = null;
    //                     CreateTransactionsDto.paymentmethod = idmethode;
    //                     // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                     CreateTransactionsDto.ppn = null;
    //                     CreateTransactionsDto.totalamount = totalamount;
    //                     CreateTransactionsDto.description = statusmessage;
    //                     CreateTransactionsDto.payload = null;
    //                     CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                     CreateTransactionsDto.detail = arrayDetailvc;
    //                     CreateTransactionsDto.postid = postidTRvoucer.toString();
    //                     CreateTransactionsDto.response = datareqva;
    //                     let datatr = await this.transactionsService.create(CreateTransactionsDto);

    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     return res.status(HttpStatus.BAD_REQUEST).json({
    //                         response_code: statuscodeva,
    //                         message: statusmessage
    //                     });
    //                 }


    //             }
    //             else {

    //                 var datava = {
    //                     "partner_user_id": userbuy.toString() + stringId,
    //                     "amount": totalamount,
    //                     "bank_code": bankcode,
    //                     "is_open": false,
    //                     "is_single_use": true,
    //                     "is_lifetime": false,
    //                     "username_display": email,
    //                     "email": email,
    //                     "trx_expiration_time": valueexpiredva,
    //                 }

    //                 try {
    //                     var datareqva = await this.oyPgService.generateStaticVa(datava);
    //                     var idva = datareqva.id;
    //                     var statuscodeva = datareqva.status.code;
    //                     var statusmessage = datareqva.status.message;
    //                     var nova = datareqva.va_number;
    //                     var expiredva = datareqva.trx_expiration_time;
    //                     var d1 = new Date(expiredva);
    //                     d1.setHours(d1.getHours() + 7); // timestamp
    //                     d1 = new Date(d1);


    //                 } catch (e) {
    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     throw new BadRequestException("Not process..!");

    //                 }

    //                 if (statuscodeva == "000") {


    //                     try {

    //                         let cekstatusva = await this.oyPgService.staticVaInfo(idva);

    //                         CreateTransactionsDto.iduserbuyer = iduser;
    //                         CreateTransactionsDto.idusersell = iduserseller;
    //                         CreateTransactionsDto.timestamp = dt.toISOString();
    //                         CreateTransactionsDto.updatedAt = dt.toISOString();
    //                         CreateTransactionsDto.noinvoice = no;
    //                         CreateTransactionsDto.amount = saleAmount;
    //                         CreateTransactionsDto.status = cekstatusva.va_status;
    //                         CreateTransactionsDto.bank = idbank;
    //                         CreateTransactionsDto.idva = idva;
    //                         CreateTransactionsDto.nova = nova;
    //                         CreateTransactionsDto.accountbalance = null;
    //                         CreateTransactionsDto.paymentmethod = idmethode;
    //                         // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                         CreateTransactionsDto.ppn = null;
    //                         CreateTransactionsDto.totalamount = totalamount;
    //                         CreateTransactionsDto.description = "buy " + type + " pending";
    //                         CreateTransactionsDto.payload = null;
    //                         CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                         CreateTransactionsDto.detail = arrayDetailvc;
    //                         CreateTransactionsDto.postid = postidTRvoucer;
    //                         CreateTransactionsDto.response = datareqva;
    //                         let datatr = await this.transactionsService.create(CreateTransactionsDto);
    //                         this.notifbuyvoucher(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, no);
    //                         // var lengArrDetail = arrayDetailvc.length;

    //                         // for (var i = 0; i < lengArrDetail; i++) {
    //                         //     let qtyDetail = arrayDetailvc[i].qty;
    //                         //     let idvoucher = arrayDetailvc[i].id.toString();
    //                         //     let idvcr2 = arrayDetailvc[i].id;
    //                         //     datavoucher = await this.vouchersService.findOne(idvoucher);
    //                         //     let pendingUsed = datavoucher.pendingUsed;
    //                         //     let totalPending = pendingUsed + qtyDetail;
    //                         //     await this.vouchersService.updatesPendingUsed(idvcr2, totalPending);
    //                         // }

    //                         var data = {
    //                             "noinvoice": datatr.noinvoice,
    //                             "postid": postidTRvoucer,
    //                             "idusersell": datatr.idusersell,
    //                             "NamaPenjual": namapenjual,
    //                             "iduserbuyer": datatr.iduserbuyer,
    //                             "NamaPembeli": namapembeli,
    //                             "amount": datatr.amount,
    //                             "paymentmethod": namamethode,
    //                             "status": datatr.status,
    //                             "description": datatr.description,
    //                             "idva": datatr.idva,
    //                             "nova": datatr.nova,
    //                             "expiredtimeva": datatr.expiredtimeva,
    //                             "salelike": datatr.saleview,
    //                             "saleview": datatr.salelike,
    //                             "bank": namabank,
    //                             // "ppn": valueppn + " %",
    //                             // "nominalppn": nominalppn,
    //                             "bankvacharge": valuevacharge,
    //                             // "mdradmin": valuemradmin + " %",
    //                             // "nominalmdradmin": nominalmradmin,
    //                             "detail": arrayDetailvc,
    //                             "totalamount": datatr.totalamount,
    //                             "accountbalance": datatr.accountbalance,
    //                             "timestamp": datatr.timestamp,
    //                             "_id": datatr._id
    //                         };

    //                     } catch (e) {
    //                         var timestamps_end = await this.utilsService.getDateTimeString();
    //                         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                         return res.status(HttpStatus.BAD_REQUEST).json({

    //                             "message": messagesEror + " " + e.toString()
    //                         });
    //                     }

    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     return res.status(HttpStatus.OK).json({
    //                         response_code: 202,
    //                         "data": data,
    //                         "message": messages
    //                     });
    //                     //  setTimeout(res, 3000);
    //                 }
    //                 else {
    //                     //throw new BadRequestException("Request is Rejected (API Key is not Valid)");

    //                     CreateTransactionsDto.iduserbuyer = iduser;
    //                     CreateTransactionsDto.idusersell = iduserseller;
    //                     CreateTransactionsDto.timestamp = dt.toISOString();
    //                     CreateTransactionsDto.updatedAt = dt.toISOString();
    //                     CreateTransactionsDto.noinvoice = no;
    //                     CreateTransactionsDto.amount = saleAmount;
    //                     CreateTransactionsDto.status = statusmessage;
    //                     CreateTransactionsDto.bank = idbank;
    //                     CreateTransactionsDto.idva = idva;
    //                     CreateTransactionsDto.nova = nova;
    //                     CreateTransactionsDto.accountbalance = null;
    //                     CreateTransactionsDto.paymentmethod = idmethode;
    //                     // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
    //                     CreateTransactionsDto.ppn = null;
    //                     CreateTransactionsDto.totalamount = totalamount;
    //                     CreateTransactionsDto.description = statusmessage;
    //                     CreateTransactionsDto.payload = null;
    //                     CreateTransactionsDto.expiredtimeva = d1.toISOString();
    //                     CreateTransactionsDto.detail = arrayDetailvc;
    //                     CreateTransactionsDto.postid = postidTRvoucer;
    //                     CreateTransactionsDto.response = datareqva;
    //                     let datatr = await this.transactionsService.create(CreateTransactionsDto);

    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                     return res.status(HttpStatus.BAD_REQUEST).json({
    //                         response_code: statuscodeva,
    //                         message: statusmessage
    //                     });
    //                 }

    //             }

    //         }
    //     }

    // }
}
