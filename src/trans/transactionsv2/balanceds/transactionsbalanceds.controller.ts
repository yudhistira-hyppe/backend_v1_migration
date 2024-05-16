import { Controller, Get, Post, Headers, Request, UseGuards, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { TransactionsBalancedsService } from './transactionsbalanceds.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { NewPostService } from 'src/content/new_post/new_post.service';

@Controller('api/transactions/v2/balanceds')
export class TransactionsBalancedsController {
    constructor(
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly logAPISS: LogapisService,
        private readonly basic2SS : UserbasicnewService,
        private readonly transBalance: TransactionsBalancedsService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('/preview')
    @HttpCode(HttpStatus.ACCEPTED)
    async cekSaldo(@Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/transactions/v2/balanceds/self';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var setemail = auth.email;
        
        var getdetail = await this.basic2SS.findbyemail(setemail);
        var totalsaldo = await this.transBalance.findsaldo(getdetail._id.toString());

        return {
            response_code:202,
            balance:totalsaldo[0].totalSaldo
        }
    }
}
