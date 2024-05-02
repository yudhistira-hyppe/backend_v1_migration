import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers, Get, Param, Req, Query } from '@nestjs/common';
import { TransactionsCategorysService } from './transactionscategorys.service';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TransactionsCategorys } from './schema/transactionscategorys.schema';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { TransactionsProductsService } from '../products/transactionsproducts.service';
import { TransactionsProducts } from '../products/schema/transactionsproducts.schema';

@Controller('api/transactions/v2/categorys')
export class TransactionsCategorysController {
    constructor(
        private readonly transactionsCategorysService: TransactionsCategorysService,
        private readonly transactionsProductsService: TransactionsProductsService, 
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler, 
    ) { }
    
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() TransactionsCategorys_: TransactionsCategorys, @Headers() headers) {
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
        var code = await this.utilsService.validateParam("code", TransactionsCategorys_.code, "string")
        if (code != "") {
            await this.errorHandler.generateBadRequestException(
                code,
            );
        } else {
            let TransactionsCategorys_Code = new TransactionsCategorys();
            TransactionsCategorys_Code.code = TransactionsCategorys_.code;
            TransactionsCategorys_Code.isDelete = false;
            var dataCeck = await this.transactionsCategorysService.find(TransactionsCategorys_Code);
            if (await this.utilsService.ceckData(dataCeck)) {
                return await this.errorHandler.generateBadRequestException(
                    "Transactions Categorys Code already exist",
                );
            }
        }

        //VALIDASI PARAM coa
        var coa = await this.utilsService.validateParam("coa", TransactionsCategorys_.coa, "string")
        if (coa != "") {
            await this.errorHandler.generateBadRequestException(
                coa,
            );
        } else {
            let TransactionsCategorys_Coa = new TransactionsCategorys();
            TransactionsCategorys_Coa.coa = TransactionsCategorys_.coa;
            TransactionsCategorys_Coa.isDelete = false;
            var dataCeck = await this.transactionsCategorysService.find(TransactionsCategorys_Coa);
            if (await this.utilsService.ceckData(dataCeck)) {
                return await this.errorHandler.generateBadRequestException(
                    "Transactions Categorys Coa already exist",
                );
            }
        }

        //VALIDASI PARAM user
        var user = await this.utilsService.validateParam("user", TransactionsCategorys_.user, "string")
        if (user != "") {
            await this.errorHandler.generateBadRequestException(
                user,
            );
        }

        //VALIDASI PARAM type
        if (TransactionsCategorys_.type!=undefined){
            if (TransactionsCategorys_.type.length>0){
                for (let g = 0; g < TransactionsCategorys_.type.length;g++){
                    let dataType = TransactionsCategorys_.type[g];
                    if (dataType.idProduct!=undefined){
                        TransactionsCategorys_.type[g].idProduct = new mongoose.Types.ObjectId(dataType.idProduct);
                    }
                }
            } else {
                TransactionsCategorys_.type = [];
            }
        }else{
            TransactionsCategorys_.type = [];
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            TransactionsCategorys_._id = new mongoose.Types.ObjectId();
            TransactionsCategorys_.isDelete = false;
            TransactionsCategorys_.createdAt = currentDate;
            TransactionsCategorys_.updatedAt = currentDate;
            var data = await this.transactionsCategorysService.create(TransactionsCategorys_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Transactions Categorys succesfully", data
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
    async update(@Body() TransactionsCategorys_: TransactionsCategorys, @Headers() headers) {
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
        let existingData = new TransactionsCategorys();
        var ceck_id = await this.utilsService.validateParam("_id", TransactionsCategorys_._id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        } else {
            existingData = await this.transactionsCategorysService.findOne(TransactionsCategorys_._id.toString());
            if (!(await this.utilsService.ceckData(existingData))) {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Transactions Categorys not found",
                );
            }
        }

        //VALIDASI PARAM code
        if (TransactionsCategorys_.code!=undefined) {
            if (existingData.code != TransactionsCategorys_.code) {
                let TransactionsCategorys_Code = new TransactionsCategorys();
                TransactionsCategorys_Code.code = TransactionsCategorys_.code;
                TransactionsCategorys_Code.isDelete = false;
                var dataCeck = await this.transactionsCategorysService.find(TransactionsCategorys_Code);
                if (await this.utilsService.ceckData(dataCeck)) {
                    return await this.errorHandler.generateBadRequestException(
                        "Transactions Categorys Code already exist",
                    );
                }
            }
        }
        
        //VALIDASI PARAM type
        if (TransactionsCategorys_.type != undefined) {
            if (TransactionsCategorys_.type.length > 0) {
                for (let g = 0; g < TransactionsCategorys_.type.length; g++) {
                    let dataType = TransactionsCategorys_.type[g];
                    if (dataType.idProduct != undefined) {
                        TransactionsCategorys_.type[g].idProduct = new mongoose.Types.ObjectId(dataType.idProduct);
                    }
                }
            } else {
                TransactionsCategorys_.type = [];
            }
        } else {
            TransactionsCategorys_.type = [];
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            TransactionsCategorys_.updatedAt = currentDate;
            var data = await this.transactionsCategorysService.update(TransactionsCategorys_._id.toString(), TransactionsCategorys_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Transactions Categorys succesfully", data
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
            var data = await this.transactionsCategorysService.findOne(id);
            if (await this.utilsService.ceckData(data)) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Transactions Categorys succesfully", data
                );
            } else {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Transactions Categorys not found",
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
    async delete(@Body() TransactionsCategorys_: TransactionsCategorys, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", TransactionsCategorys_._id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.transactionsCategorysService.delete(TransactionsCategorys_._id.toString());
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Delete Transactions Categorys succesfully", data
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
        @Query('user') user: string,
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
            var data = await this.transactionsCategorysService.findCriteriaAggregate(pageNumber, pageRow, search, user, sortBy, order);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "List Transactions Categorys succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }
}
