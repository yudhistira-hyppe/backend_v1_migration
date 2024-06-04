
import { TransactionsV2Service } from './transactionsv2.service';
import { TransactionsProductsService } from './products/transactionsproducts.service';
import { Controller, HttpCode, HttpStatus, Post, Req, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
// import { MonetizationService } from '../monetization/monetization.service';
// import { BoostintervalService } from 'src/content/boostinterval/boostinterval.service';
// import { BoostsessionService } from 'src/content/boostsession/boostsession.service';
// import { NewPostService } from 'src/content/new_post/new_post.service';
// import { CreateNewPostDTO } from 'src/content/new_post/dto/create-newPost.dto';
// import mongoose, { Types } from 'mongoose';
// import { TemplatesRepo } from 'src/infra/templates_repo/schemas/templatesrepo.schema';

@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(
        private readonly transactionsV2Service: TransactionsV2Service,
        private readonly transactionsProductsService: TransactionsProductsService,
        private readonly utilsService: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly basic2SS: UserbasicnewService,
        // private readonly monetizationService: MonetizationService,
        // private readonly boostIntervalService: BoostintervalService,
        // private readonly boostSessionService: BoostsessionService
        // private readonly posts2SS: NewPostService
    ) { }

    @Post('/insert')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Req() request: any) {
        const data = await this.transactionsV2Service.insertTransaction(
            request.body.platform,
            request.body.transactionProductCode,
            request.body.category,
            request.body.coin,
            request.body.discountCoin,
            request.body.price,
            request.body.discountPrice,
            request.body.idUserBuy,
            request.body.idUserSell,
            request.body.idVoucher,
            request.body.detail,
            request.body.status);
        return data;
    }

    @Post('/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Req() request: any) {
        const data = await this.transactionsV2Service.updateTransaction(
            request.body.dTrans,
            request.body.status,
            request.body.data,);
        return data;
    }

    @Post('/coinhistory')
    @UseGuards(JwtAuthGuard)
    async listCoinHistory(@Req() request: any, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/transactionsv2/coinhistory';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = 0;
        var limit = 0;
        var descending = null;
        var types = [];
        var startdate = null;
        var enddate = null;
        const messages = {
            "info": ["The process was successful"],
        };
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("page must be defined");
        }
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("limit must be defined");
        }
        descending = request_json["descending"];
        if (request_json["descending"] !== undefined) {
            descending = request_json["descending"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("descending must be defined");
        }
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        types = request_json["type"]
        if (types && types.length > 0) {
            for (let type of types) {
                switch (type) {
                    case 'buy':
                        types[types.indexOf(type)] = 'PBC';
                        break;
                    case 'use':
                        types[types.indexOf(type)] = 'PGC';
                        break;
                    case 'trade':
                        types[types.indexOf(type)] = 'PUC';
                        break;
                    default:
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
                        throw new BadRequestException("Each type must be 'buy', 'use', or 'trade'");
                }
            }
        }

        let data = await this.transactionsV2Service.getCoinHistory(email, page, limit, descending, startdate, enddate, types);
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
        return {
            response_code: 202,
            data,
            messages
        }

    }

    // @Post('/boostpostdetail')
    // @UseGuards(JwtAuthGuard)
    // async boostPostPaymentDetail(@Req() request: any, @Headers() headers) {
    //     var timestamps_start = await this.utilsService.getDateTimeString();
    //     var fullurl = headers.host + '/api/transactionsv2/boostpostdetail';
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;
    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     const messages = {
    //         "info": ["The process was successful"],
    //     };
    //     try {
    //         let priceData = await this.transactionsProductsService.findOneByCode("BP");
    //         let price = priceData.price;
    //         var interval;
    //         var session;
    //         if (request_json.type == "automatic") {
    //             //CHECK INTERVAL
    //             interval = await this.boostIntervalService.findByType("automatic");
    //             if (!(await this.utilsService.ceckData(interval))) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException(
    //                     'Unable to proceed: interval not found',
    //                 );
    //             }

    //             //CHECK SESSION
    //             session = await this.boostSessionService.findByType("automatic");
    //             if (!(await this.utilsService.ceckData(session))) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException(
    //                     'Unable to proceed: session not found',
    //                 );
    //             }
    //         } else if (request_json.type == "manual") {
    //             //CHECK PARAM INTERVAL, SESSION
    //             if (request_json.interval == undefined) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException(
    //                     'Unable to proceed: interval is required',
    //                 );
    //             }
    //             if (request_json.session.toLowerCase() == undefined) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException(
    //                     'Unable to proceed: session is required',
    //                 );
    //             }

    //             //CHECK INTERVAL
    //             interval = await this.boostIntervalService.findById(request_json.interval);
    //             if (!(await this.utilsService.ceckData(interval))) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException(
    //                     'Unable to proceed: interval not found',
    //                 );
    //             }

    //             //CHECK SESSION
    //             session = await this.boostSessionService.findById(request_json.session);
    //             if (!(await this.utilsService.ceckData(session))) {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //                 throw new BadRequestException(
    //                     'Unable to proceed: session not found',
    //                 );
    //             }
    //         } else {
    //             var timestamps_end = await this.utilsService.getDateTimeString();
    //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //             throw new BadRequestException("Unable to proceed: type must be 'automatic' or 'manual'");
    //         }
    //         let data = {
    //             posttype: request_json.posttype,
    //             startdate: request_json.startdate,
    //             price: price,
    //             discount: request_json.discount ? request_json.discount : 0,
    //             total: price - (request_json.discount ? request_json.discount : 0),
    //             session: session,
    //             interval: interval
    //         }
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         return {
    //             response_code: 202,
    //             data,
    //             messages
    //         }
    //     } catch (e) {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         throw new BadRequestException("Process error: " + e);
    //     }
    // }

    // @Post('/insertcointransaction')
    // @UseGuards(JwtAuthGuard)
    // async insertCoinTransaction(@Req() request: any, @Headers() headers) {
    //     var timestamps_start = await this.utilsService.getDateTimeString();
    //     var fullurl = headers.host + '/api/transactionsv2/insertcointransaction';
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;
    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     const messages = {
    //         "info": ["The process was successful"],
    //     };
    //     var ubasic = await this.basic2SS.findOneBymail(email);
    //     if (request_json.pin && request_json.pin != "") {
    //         if (await this.utilsService.ceckData(ubasic)) {
    //             if (ubasic.pin && ubasic.pin != "") {
    //                 let pinDecrypt = await this.utilsService.decrypt(ubasic.pin.toString());
    //                 if (pinDecrypt != request_json.pin) {
    //                     var timestamps_end = await this.utilsService.getDateTimeString();
    //                     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //                     throw new BadRequestException("Unable to proceed: PIN mismatch");
    //                 }
    //             } else {
    //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //                 throw new BadRequestException("Unable to proceed: Please create a PIN first");
    //             }
    //         } else {
    //             var timestamps_end = await this.utilsService.getDateTimeString();
    //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //             throw new BadRequestException("Unable to proceed: User data not found");
    //         }
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         throw new BadRequestException("Unable to proceed: Missing param: pin");
    //     }
    //     try {
    //         var data;
    //         data = await this.transactionsV2Service.insertTransaction(
    //             request_json.platform,
    //             request_json.transactionProductCode,
    //             request_json.category ? request_json.category : undefined,
    //             request_json.coin,
    //             request_json.discountCoin ? request_json.discountCoin : 0,
    //             request_json.price,
    //             request_json.discountPrice,
    //             request_json.idUserBuy,
    //             request_json.idUserSell ? request_json.idUserSell : undefined,
    //             request_json.idVoucher ? request_json.idVoucher : undefined,
    //             request_json.detail,
    //             request_json.status);
    //         // if (request_json.idVoucher && request_json.idVoucher.length > 0) {
    //         //     for (let i = 0; i < request_json.idVoucher.length; i++) {
    //         //         this.monetizationService.updateStock(request_json.idVoucher[i], 1, true);
    //         //     }
    //         // }
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         return {
    //             response_code: 202,
    //             data,
    //             messages
    //         }
    //     } catch (e) {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         throw new BadRequestException("Process error: " + e);
    //     }
    // }

    // @Post('/createboostpost')
    // @UseGuards(JwtAuthGuard)
    // async createBoostPostTransaction(@Req() request: any, @Headers() headers) {
    //     var timestamps_start = await this.utilsService.getDateTimeString();
    //     var fullurl = headers.host + '/api/transactionsv2/createboostpost';
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;
    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     const messages = {
    //         "info": ["The process was successful"],
    //     };
    //     var ubasic = await this.basic2SS.findOneBymail(email);
    //     var buyerubasic = await this.basic2SS.findOne(request_json.idUserBuy);
    //     var emailbuyer = buyerubasic.email;
    //     // if (request_json.pin && request_json.pin != "") {
    //     //     if (await this.utilsService.ceckData(ubasic)) {
    //     //         if (ubasic.pin && ubasic.pin != "") {
    //     //             let pinDecrypt = await this.utilsService.decrypt(ubasic.pin.toString());
    //     //             if (pinDecrypt != request_json.pin) {
    //     //                 var timestamps_end = await this.utilsService.getDateTimeString();
    //     //                 this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //     //                 throw new BadRequestException("Unable to proceed: PIN mismatch");
    //     //             }
    //     //         } else {
    //     //             var timestamps_end = await this.utilsService.getDateTimeString();
    //     //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //     //             throw new BadRequestException("Unable to proceed: Please create a PIN first");
    //     //         }
    //     //     } else {
    //     //         var timestamps_end = await this.utilsService.getDateTimeString();
    //     //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //     //         throw new BadRequestException("Unable to proceed: User data not found");
    //     //     }
    //     // } else {
    //     //     var timestamps_end = await this.utilsService.getDateTimeString();
    //     //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //     //     throw new BadRequestException("Unable to proceed: Missing param: pin");
    //     // }
    //     try {
    //         var data;
    //         data = await this.transactionsV2Service.insertTransaction(
    //             request_json.platform,
    //             request_json.transactionProductCode,
    //             request_json.category ? request_json.category : undefined,
    //             request_json.coin,
    //             request_json.discountCoin ? request_json.discountCoin : 0,
    //             request_json.price,
    //             request_json.discountPrice,
    //             request_json.idUserBuy,
    //             request_json.idUserSell ? request_json.idUserSell : undefined,
    //             request_json.idVoucher ? request_json.idVoucher : undefined,
    //             request_json.detail,
    //             request_json.status);
    //         data.transactionType = "BOOST POST";
    //         data.transactionUnit = "COIN";
    //         // this.editPostBoost(request_json.detail[0].postID, request_json.detail);
    //         // this.sendCommentFCM("BOOST_SUCCES", request_json.detail[0].postID, emailbuyer.toString(), data.data[0].idTransaction);
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         return {
    //             response_code: 202,
    //             data,
    //             messages
    //         }
    //     } catch (e) {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    //         throw new BadRequestException("Process error: " + e);
    //     }
    // }

    // async editPostBoost(postid: string, detail: any[]) {
    //     // var databoost = null;
    //     // if (detail != undefined) {
    //     //     if (detail.length > 0) {
    //     //         databoost = detail.filter((item, index) => {
    //     //             return (item.description == "BOOST");
    //     //         });
    //     //     }
    //     // }

    //     var GetMaxBoost = await this.utilsService.getSetting_("636212526f07000023005ce3");
    //     let ContInterval = Number(detail[0].interval.value.toString()) * Number(GetMaxBoost.toString());
    //     // let ContInterval = Number(databoost[0].interval.value.toString()) * Number(GetMaxBoost.toString());

    //     var boost = [];
    //     var dateStartString = (detail[0].dateStart.toString() + "T" + detail[0].session.start.toString() + ".000Z")
    //     // var dateStartString = (databoost[0].dateStart.toString() + "T" + databoost[0].session.start.toString() + ".000Z")
    //     // var dateStartDate = new Date(dateStartString)
    //     // var dateStartAdd = new Date(dateStartDate.getTime() + ContInterval * 60000)
    //     // var dateStartGetTime = dateStartAdd.toISOString().split('T')[1].split(".")[0]

    //     // console.log("date String", dateStartString);
    //     // console.log("date Date", new Date(dateStartString));
    //     // console.log("date Add", dateStartAdd);
    //     // console.log("date GetTime", dateStartGetTime);

    //     var dataBoost = {
    //         type: detail[0].type.toString(),
    //         // type: databoost[0].type.toString(),
    //         boostDate: new Date(detail[0].dateStart.toString()),
    //         // boostDate: new Date(databoost[0].dateStart.toString()),
    //         boostInterval: {
    //             id: new mongoose.Types.ObjectId(detail[0].interval._id.toString()),
    //             // id: new mongoose.Types.ObjectId(databoost[0].interval._id.toString()),
    //             value: detail[0].interval.value.toString(),
    //             // value: databoost[0].interval.value.toString(),
    //             remark: detail[0].interval.remark.toString(),
    //             // remark: databoost[0].interval.remark.toString(),
    //         },
    //         boostSession: {
    //             id: new mongoose.Types.ObjectId(detail[0].session._id.toString()),
    //             // id: new mongoose.Types.ObjectId(databoost[0].session._id.toString()),
    //             //start: new Date((detail[0].dateStart.toString() + "T" + detail[0].session.start.toString() + ".000Z")),
    //             //end: new Date((detail[0].datedateEnd.toString() + "T" + detail[0].session.end.toString() + ".000Z")),

    //             start: (detail[0].dateStart.toString() + " " + detail[0].session.start.toString()),
    //             // start: (databoost[0].dateStart.toString() + " " + databoost[0].session.start.toString()),
    //             end: (detail[0].datedateEnd.toString() + " " + detail[0].session.end.toString()),
    //             // end: (databoost[0].datedateEnd.toString() + " " + dateStartGetTime),
    //             timeStart: detail[0].session.start,
    //             // timeStart: databoost[0].session.start,
    //             timeEnd: detail[0].session.end,
    //             name: detail[0].session.name,
    //             // name: databoost[0].session.name,
    //         },
    //         boostViewer: [],
    //     }
    //     boost.push(dataBoost);
    //     var CreateNewPostDTO_ = new CreateNewPostDTO();
    //     CreateNewPostDTO_.boostCount = 0;
    //     CreateNewPostDTO_.isBoost = 5;
    //     CreateNewPostDTO_.boosted = boost;
    //     await this.posts2SS.updateByPostId(postid, CreateNewPostDTO_)
    // }

    // async sendCommentFCM(type: string, postID: string, receiverParty: string, idtransaction?: string) {
    //     var Templates_ = new TemplatesRepo();
    //     Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

    //     var email = receiverParty;
    //     var titlein = Templates_.subject.toString();
    //     var titleen = Templates_.subject.toString();
    //     var bodyin = "";
    //     var bodyen = "";

    //     var email_post = "";
    //     var posts = await this.posts2SS.findid(postID);
    //     var bodyin_get = Templates_.body_detail_id.toString();
    //     var bodyen_get = Templates_.body_detail.toString();
    //     var post_type = "";
    //     if (await this.utilsService.ceckData(posts)) {
    //         post_type = posts.postType.toString();
    //         email_post = posts.email.toString();
    //     }
    //     var new_bodyin_get = bodyin_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));
    //     var new_bodyen_get = bodyen_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));

    //     var bodyin = new_bodyin_get;
    //     var bodyen = new_bodyen_get;

    //     var eventType = "TRANSACTION";
    //     var event = type;

    //     await this.utilsService.sendFcmV2(email, email, eventType, event, type, postID, post_type, idtransaction)
    //     //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
    // }
}
