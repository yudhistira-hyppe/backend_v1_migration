import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers, Get, Param, Req, Query } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { TransactionsCoaService } from './transactionscoa.service';
import { TransactionsCoa } from './schema/transactionscoa.schema';

@Controller('api/transactions/v2/coa')
export class TransactionsCoaController {
    constructor(
        private readonly transactionsCoaService: TransactionsCoaService, 
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
    ) { }
    
    // @UseGuards(JwtAuthGuard)
    // @Post('/create')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async create(@Body() TransactionsCoa_: TransactionsCoa, @Headers() headers) {
    //     //VALIDASI User
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }
    //     const userLogin = await this.utilsService.getUserBasic(headers['x-auth-user']);

    //     //VALIDASI PARAM coa
    //     if (TransactionsCoa_.subCoa == undefined) {
    //         await this.errorHandler.generateBadRequestException(
    //             "Unabled to proceed param coa is required",
    //         );
    //     }

    //     //VALIDASI PARAM subCoa
    //     if (TransactionsCoa_.subCoa == undefined) {
    //         await this.errorHandler.generateBadRequestException(
    //             "Unabled to proceed param subCoa is required",
    //         );
    //     } else {
    //         if (TransactionsCoa_.subCoa.length == 0) {
    //             await this.errorHandler.generateBadRequestException(
    //                 "Unabled to proceed param subCoa is required",
    //             );
    //         }
    //     }

    //     const currentDate = await this.utilsService.getDateTimeString();
    //     for (let k = 0; k < TransactionsCoa_.subCoa.length;k++){
    //         let subCoa = TransactionsCoa_.subCoa[k];
    //         if (subCoa.Detail!=undefined){
    //             for (let j = 0; j < subCoa.Detail.length; j++) {
    //                 TransactionsCoa_.subCoa[k].Detail[j].createdAt = currentDate;
    //                 TransactionsCoa_.subCoa[k].Detail[j].updatedAt = currentDate;
    //                 TransactionsCoa_.subCoa[k].Detail[j].updatedBy = new mongoose.Types.ObjectId(userLogin._id.toString());
    //             }
    //         }
    //     }

    //     try {
    //         TransactionsCoa_._id = new mongoose.Types.ObjectId();
    //         TransactionsCoa_.isDelete = false;
    //         TransactionsCoa_.createdAt = currentDate;
    //         TransactionsCoa_.updatedAt = currentDate;
    //         var data = await this.transactionsCoaService.create(TransactionsCoa_);
    //         return await this.errorHandler.generateAcceptResponseCodeWithData(
    //             "Create Transactions Coa succesfully", data
    //         );
    //     } catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    // }

    // @UseGuards(JwtAuthGuard)
    // @Post('/update')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async update(@Body() TransactionsCoa_: TransactionsCoa, @Headers() headers) {
    //     //VALIDASI User
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }
    //     const userLogin = await this.utilsService.getUserBasic(headers['x-auth-user']);

    //     //VALIDASI PARAM _id
    //     let existingData = new TransactionsCoa();
    //     var ceck_id = await this.utilsService.validateParam("_id", TransactionsCoa_._id.toString(), "string")
    //     if (ceck_id != "") {
    //         await this.errorHandler.generateBadRequestException(
    //             ceck_id,
    //         );
    //     } else {
    //         existingData = await this.transactionsCoaService.findOne(TransactionsCoa_._id.toString());
    //         if (!(await this.utilsService.ceckData(existingData))) {
    //             return await this.errorHandler.generateAcceptResponseCode(
    //                 "Get Transactions Coa not found",
    //             );
    //         }
    //     }

    //     //VALIDASI PARAM coa
    //     if (TransactionsCoa_.subCoa == undefined) {
    //         await this.errorHandler.generateBadRequestException(
    //             "Unabled to proceed param coa is required",
    //         );
    //     }

    //     //VALIDASI PARAM subCoa
    //     if (TransactionsCoa_.subCoa == undefined) {
    //         await this.errorHandler.generateBadRequestException(
    //             "Unabled to proceed param subCoa is required",
    //         );
    //     } else {
    //         if (TransactionsCoa_.subCoa.length == 0) {
    //             await this.errorHandler.generateBadRequestException(
    //                 "Unabled to proceed param subCoa is required",
    //             );
    //         }
    //     }

    //     const currentDate = await this.utilsService.getDateTimeString();
    //     for (let k = 0; k < TransactionsCoa_.subCoa.length; k++) {
    //         let subCoa = TransactionsCoa_.subCoa[k];
    //         if (subCoa.Detail != undefined) {
    //             for (let j = 0; j < subCoa.Detail.length; j++) {
    //                 if (existingData.subCoa[k]!=undefined){
    //                     if (existingData.subCoa[k].Detail[j] != undefined) {
    //                         if (existingData.subCoa[k].Detail[j].createdAt != undefined) {
    //                             TransactionsCoa_.subCoa[k].Detail[j].createdAt = existingData.subCoa[k].Detail[j].createdAt;
    //                         } else {
    //                             TransactionsCoa_.subCoa[k].Detail[j].createdAt = currentDate;
    //                         }
    //                     } else {
    //                         TransactionsCoa_.subCoa[k].Detail[j].createdAt = currentDate;
    //                     }
    //                 } else {
    //                     TransactionsCoa_.subCoa[k].Detail[j].createdAt = currentDate;
    //                 }
    //                 TransactionsCoa_.subCoa[k].Detail[j].updatedAt = currentDate;
    //                 TransactionsCoa_.subCoa[k].Detail[j].updatedBy = new mongoose.Types.ObjectId(userLogin._id.toString());
    //             }
    //         }
    //     }

    //     try {
    //         const currentDate = await this.utilsService.getDateTimeString();
    //         TransactionsCoa_.updatedAt = currentDate;
    //         var data = await this.transactionsCoaService.update(TransactionsCoa_._id.toString(), TransactionsCoa_);
    //         return await this.errorHandler.generateAcceptResponseCodeWithData(
    //             "Update Transactions Coa succesfully", data
    //         );
    //     } catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    // }

    // @UseGuards(JwtAuthGuard)
    // @Get('/:id')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async getOne(@Param('id') id: string, @Headers() headers, @Req() req) {
    //     //VALIDASI User
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }

    //     //VALIDASI PARAM _id
    //     var ceck_id = await this.utilsService.validateParam("_id", id.toString(), "string")
    //     if (ceck_id != "") {
    //         await this.errorHandler.generateBadRequestException(
    //             ceck_id,
    //         );
    //     }

    //     try {
    //         var data = await this.transactionsCoaService.findOne(id);
    //         if (await this.utilsService.ceckData(data)) {
    //             return await this.errorHandler.generateAcceptResponseCodeWithData(
    //                 "Get Transactions Coa succesfully", data
    //             );
    //         } else {
    //             return await this.errorHandler.generateAcceptResponseCode(
    //                 "Get Transactions Coa not found",
    //             );
    //         }
    //     } catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    // }

    // @UseGuards(JwtAuthGuard)
    // @Post('/delete')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async delete(@Body() TransactionsCoa_: TransactionsCoa, @Headers() headers) {
    //     //VALIDASI User
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }

    //     //VALIDASI PARAM _id
    //     var ceck_id = await this.utilsService.validateParam("_id", TransactionsCoa_._id.toString(), "string")
    //     if (ceck_id != "") {
    //         await this.errorHandler.generateBadRequestException(
    //             ceck_id,
    //         );
    //     }

    //     try {
    //         var data = await this.transactionsCoaService.delete(TransactionsCoa_._id.toString());
    //         return await this.errorHandler.generateAcceptResponseCodeWithData(
    //             "Delete Transactions Coa succesfully", data
    //         );
    //     } catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    //     return Response;
    // }

    // @UseGuards(JwtAuthGuard)
    // @Get()
    // @HttpCode(HttpStatus.ACCEPTED)
    // async getAll(
    //     @Query('pageNumber') pageNumber: number,
    //     @Query('pageRow') pageRow: number,
    //     @Query('search') search: string,
    //     @Query('user') user: string,
    //     @Query('sortBy') sortBy: string,
    //     @Query('order') order: string,
    //     @Headers() headers) {
    //     //VALIDASI User
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }

    //     try {
    //         var data = await this.transactionsCoaService.findCriteria(pageNumber, pageRow, search, user, sortBy, order);
    //         return await this.errorHandler.generateAcceptResponseCodeWithData(
    //             "List Transactions Coa succesfully", data
    //         );
    //     } catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    // }
}
