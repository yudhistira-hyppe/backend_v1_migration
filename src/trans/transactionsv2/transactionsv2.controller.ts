
import { TransactionsV2Service } from './transactionsv2.service';
import { Controller, HttpCode, HttpStatus, Post, Req, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/transactionsV2')
export class TransactionsV2Controller {
    constructor(
        private readonly transactionsV2Service: TransactionsV2Service,
        private readonly utilsService: UtilsService,
        private readonly logapiSS: LogapisService
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
        var enddate = null; const messages = {
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
        return {
            response_code: 202,
            data,
            messages
        }

    }
}
