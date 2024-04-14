import { Controller, HttpCode, HttpStatus, Post, UseGuards, Headers, Body, Get, Param, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Products } from './schema/products.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';

@Controller('api/transactions/v2/product')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() Products_: Products, @Headers() headers) {
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
        var code = await this.utilsService.validateParam("code", Products_.code, "string")
        if (code != "") {
            await this.errorHandler.generateBadRequestException(
                code,
            );
        } else {
            let Products_Code = new Products();
            Products_Code.code = Products_.code;
            Products_Code.isDelete = false;
            var dataCeck = await this.productsService.find(Products_Code);
            if (await this.utilsService.ceckData(dataCeck)) {
                return await this.errorHandler.generateBadRequestException(
                    "Transactions Product Code already exist",
                );
            }
        }

        //VALIDASI PARAM name
        var coa = await this.utilsService.validateParam("coa", Products_.name, "string")
        if (coa != "") {
            await this.errorHandler.generateBadRequestException(
                coa,
            );
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            Products_._id = new mongoose.Types.ObjectId();
            Products_.isDelete = false;
            Products_.createdAt = currentDate;
            Products_.updatedAt = currentDate;
            var data = await this.productsService.create(Products_);
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
    async update(@Body() Products_: Products, @Headers() headers) {
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
        let existingData = new Products();
        var ceck_id = await this.utilsService.validateParam("_id", Products_._id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        } else {
            existingData = await this.productsService.findOne(Products_._id.toString());
            if (!(await this.utilsService.ceckData(existingData))) {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Transactions Product not found",
                );
            }
        }

        //VALIDASI PARAM code
        if (Products_.code != undefined) {
            if (existingData.code != Products_.code) {
                let Products_Code = new Products();
                Products_Code.code = Products_.code;
                Products_Code.isDelete = false;
                var dataCeck = await this.productsService.find(Products_Code);
                if (await this.utilsService.ceckData(dataCeck)) {
                    return await this.errorHandler.generateBadRequestException(
                        "Transactions Product Code already exist",
                    );
                }
            }
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            Products_.updatedAt = currentDate;
            var data = await this.productsService.update(Products_._id.toString(), Products_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Transactions Product succesfully", data
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
            var data = await this.productsService.findOne(id);
            if (await this.utilsService.ceckData(data)) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Transactions Product succesfully", data
                );
            } else {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Transactions Product not found",
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
    async delete(@Body() Products_: Products, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", Products_._id.toString(), "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.productsService.delete(Products_._id.toString());
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Delete Transactions Product succesfully", data
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
            var data = await this.productsService.findCriteria(pageNumber, pageRow, search, user, sortBy, order);
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
