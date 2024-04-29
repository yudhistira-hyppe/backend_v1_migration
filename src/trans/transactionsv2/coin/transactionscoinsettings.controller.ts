import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers } from '@nestjs/common';
import { ErrorHandler } from 'src/utils/error.handler';
import { UtilsService } from 'src/utils/utils.service';
import { TransactionsCoinSettingsService } from './transactionscoinsettings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransactionsCoinSettings } from './schema/transactionscoinsettings.schema';
import mongoose from 'mongoose';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';

@Controller('api/transactions/v2/setting/coin/')
export class TransactionsCoinSettingsController {
    constructor(
        private readonly transactionsCoinSettingsService: TransactionsCoinSettingsService,
        private readonly utilsService: UtilsService,
        private readonly basic2SS: UserbasicnewService,
        private readonly errorHandler: ErrorHandler, 
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() TransactionsCoinSettings_: TransactionsCoinSettings, @Headers() headers) {
        //VALIDASI User
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        const ubasic = await this.basic2SS.findBymail(headers['x-auth-user']);

        //VALIDASI PARAM price
        var price = await this.utilsService.validateParam("code", TransactionsCoinSettings_.price, "number")
        if (price != "") {
            await this.errorHandler.generateBadRequestException(
                price,
            );
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            TransactionsCoinSettings_._id = new mongoose.Types.ObjectId();
            TransactionsCoinSettings_.idUser = new mongoose.Types.ObjectId(ubasic._id.toString());
            TransactionsCoinSettings_.createdAt = currentDate;
            TransactionsCoinSettings_.updatedAt = currentDate;
            TransactionsCoinSettings_.status = true;
            await this.transactionsCoinSettingsService.create(TransactionsCoinSettings_);
            return await this.errorHandler.generateAcceptResponseCode(
                "Create Transactions Setting Coin succesfully"
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }
}
