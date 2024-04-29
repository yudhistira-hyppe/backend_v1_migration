import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers, Get, Param, Req, Query } from '@nestjs/common';
import { TransactionsProductsService } from './transactionsproducts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransactionsProducts } from './schema/transactionsproducts.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { TransactionsCategorys } from '../categorys/schema/transactionscategorys.schema';
import { TransactionsCategorysService } from '../categorys/transactionscategorys.service';

@Controller('api/transactions/v2/product')
export class TransactionsProductsController {
    constructor(
        private readonly transactionsProductsService: TransactionsProductsService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler, 
        private readonly transactionsCategorysService: TransactionsCategorysService,
    ) { }



    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() TransactionsProducts_: TransactionsProducts, @Headers() headers) {
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

        //VALIDASI PARAM code
        var code = await this.utilsService.validateParam("code", TransactionsProducts_.code, "string")
        if (code != "") {
            await this.errorHandler.generateBadRequestException(
                code,
            );
        } else {
            let TransactionsProducts_Code = new TransactionsProducts();
            TransactionsProducts_Code.code = TransactionsProducts_.code;
            TransactionsProducts_Code.isDelete = false;
            var dataCeck = await this.transactionsProductsService.find(TransactionsProducts_Code);
            if (await this.utilsService.ceckData(dataCeck)) {
                return await this.errorHandler.generateBadRequestException(
                    "Transactions Product Code already exist",
                );
            }
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            TransactionsProducts_._id = new mongoose.Types.ObjectId();
            TransactionsProducts_.isDelete = false;
            TransactionsProducts_.createdAt = currentDate;
            TransactionsProducts_.updatedAt = currentDate;
            var data = await this.transactionsProductsService.create(TransactionsProducts_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Transactions Product succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() TransactionsProducts_: TransactionsProducts, @Headers() headers) {
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

        //VALIDASI PARAM _id
        let existingData = new TransactionsProducts();
        var ceck_id = await this.utilsService.validateParam("_id", TransactionsProducts_._id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        } else {
            existingData = await this.transactionsProductsService.findOne(TransactionsProducts_._id.toString());
            if (!(await this.utilsService.ceckData(existingData))) {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Transactions Products not found",
                );
            }
        }

        //VALIDASI PARAM code
        var code = await this.utilsService.validateParam("code", TransactionsProducts_.code, "string")
        if (code != "") {
            await this.errorHandler.generateBadRequestException(
                code,
            );
        } else {
            if (existingData.code != TransactionsProducts_.code) {
                let TransactionsProducts_Code = new TransactionsProducts();
                TransactionsProducts_Code.code = TransactionsProducts_.code;
                TransactionsProducts_Code.isDelete = false;
                var dataCeck = await this.transactionsProductsService.find(TransactionsProducts_Code);
                if (await this.utilsService.ceckData(dataCeck)) {
                    return await this.errorHandler.generateBadRequestException(
                        "Transactions Products Code already exist",
                    );
                }
            }
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            TransactionsProducts_.updatedAt = currentDate;
            var data = await this.transactionsProductsService.update(TransactionsProducts_._id.toString(), TransactionsProducts_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Transactions Products succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getOne(@Param('id') id: string, @Headers() headers, @Req() req) {
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

        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.transactionsProductsService.findOne(id);
            if (await this.utilsService.ceckData(data)) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Transactions Products succesfully", data
                );
            } else {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Transactions Products not found",
                );
            }
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() TransactionsProducts_: TransactionsProducts, @Headers() headers) {
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

        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", TransactionsProducts_._id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.transactionsProductsService.delete(TransactionsProducts_._id.toString());
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Delete Transactions Products succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.ACCEPTED)
    async getAll(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Query('sortBy') sortBy: string,
        @Query('order') order: string,
        @Headers() headers) {
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

        try {
            var data = await this.transactionsProductsService.findCriteria(pageNumber, pageRow, search, sortBy, order);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "List Transactions Products succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }
}
