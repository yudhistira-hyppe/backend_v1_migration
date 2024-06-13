import { Controller, Post, Req, UseGuards, Headers, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { TransactionsCreditsService } from './transactionscredits.service';

@Controller('api/transactions/v2/credit')
export class TransactionsCreditsController {
    constructor(
        private readonly utilsService: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly error: ErrorHandler,
        private readonly transCredit: TransactionsCreditsService,
    ) { }

    @Post('/listing_detail/:id')
    @UseGuards(JwtAuthGuard)
    async listing_detail_credit(@Param('id') id:string, @Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var request_json = JSON.parse(JSON.stringify(request.body));

        var setid = id;
        var page = null;
        var limit = null;
        var order = null;
        var startdate = null;
        var enddate = null;
        var checkdiscount = null;
        var transactionid = null;
        var name = null;

        if(request_json.page == null || request_json.page == undefined) 
        {
            await this.error.generateBadRequestException("page field is required");
        }

        if(request_json.limit == null || request_json.limit == undefined) 
        {
            await this.error.generateBadRequestException("limit field is required");
        }

        if(request_json.descending == null || request_json.descending == undefined) 
        {
            await this.error.generateBadRequestException("descending field is required");
        }

        page = request_json.page;
        limit = request_json.limit;
        order = request_json.descending;

        if(request_json.startdate != null && request_json.startdate != undefined && request_json.enddate != null && request_json.enddate != undefined)
        {
            startdate = request_json.startdate;
            enddate = request_json.enddate;
        }

        if(request_json.checkdiscount != null && request_json.checkdiscount != undefined)
        {
            checkdiscount = request_json.checkdiscount;    
        }

        if(request_json.transactionname != null && request_json.transactionname != undefined)
        {
            transactionid = request_json.transactionname;    
        }

        if(request_json.name != null && request_json.name != undefined)
        {
            name = request_json.name;    
        }

        var data = await this.transCredit.listingDetail(setid, name, transactionid, checkdiscount, startdate, enddate, order, page, limit);
        const messages = {
            "info": ["The process was successful"],
        };

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
        return {
            response_code: 202,
            data,
            messages
        }
    }
}
