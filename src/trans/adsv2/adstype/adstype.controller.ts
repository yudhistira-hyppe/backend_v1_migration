import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Res, Request, HttpStatus, Put, BadRequestException, HttpCode, Query } from '@nestjs/common';
import { AdsTypeService } from './adstype.service';
import { AdsTypeDto } from './dto/adstype.dto';
import { AdsType } from './schemas/adstype.schema';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';

@Controller('api/adsv2/adstypes')
export class AdsTypesController {
    constructor(
        private readonly adstypeService: AdsTypeService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) { }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsTypeDto_: AdsTypeDto, @Headers() headers): Promise<any> {
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
        //VALIDASI PARAM nameType
        var cecknameType = await this.utilsService.validateParam("nameType", AdsTypeDto_.nameType, "string")
        if (cecknameType != "") {
            await this.errorHandler.generateBadRequestException(
                cecknameType,
            );
        }
        //VALIDASI PARAM valueCreditView
        var ceckvalueCreditView = await this.utilsService.validateParam("CPV", AdsTypeDto_.CPV, "number")
        if (ceckvalueCreditView != "") {
            await this.errorHandler.generateBadRequestException(
                ceckvalueCreditView,
            );
        }
        //VALIDASI PARAM valueCreditClick
        var ceckvalueCreditClick = await this.utilsService.validateParam("CPA", AdsTypeDto_.CPA, "number")
        if (ceckvalueCreditClick != "") {
            await this.errorHandler.generateBadRequestException(
                ceckvalueCreditClick,
            );
        }
        //VALIDASI PARAM rewards
        var ceckrewards = await this.utilsService.validateParam("rewards", AdsTypeDto_.rewards, "number")
        if (ceckrewards != "") {
            await this.errorHandler.generateBadRequestException(
                ceckrewards,
            );
        }
        //VALIDASI PARAM durationMax
        var ceckdurationMax = await this.utilsService.validateParam("durationMax", AdsTypeDto_.durationMax, "number")
        if (ceckdurationMax != "") {
            await this.errorHandler.generateBadRequestException(
                ceckdurationMax,
            );
        }
        //VALIDASI PARAM durationMin
        var ceckdurationMin = await this.utilsService.validateParam("durationMin", AdsTypeDto_.durationMin, "number")
        if (ceckdurationMin != "") {
            await this.errorHandler.generateBadRequestException(
                ceckdurationMin,
            );
        }
        //VALIDASI PARAM skipMax
        var ceckskipMax = await this.utilsService.validateParam("skipMax", AdsTypeDto_.skipMax, "number")
        if (ceckskipMax != "") {
            await this.errorHandler.generateBadRequestException(
                ceckskipMax,
            );
        }
        //VALIDASI PARAM skipMin
        var ceckskipMin = await this.utilsService.validateParam("skipMin", AdsTypeDto_.skipMin, "number")
        if (ceckskipMin != "") {
            await this.errorHandler.generateBadRequestException(
                ceckskipMin,
            );
        }

        try {
            let data = await this.adstypeService.create(AdsTypeDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Ads Type succesfully", data
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
    async update(@Body() AdsTypeDto_: AdsTypeDto, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", AdsTypeDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }
        //VALIDASI PARAM nameType
        var cecknameType = await this.utilsService.validateParam("nameType", AdsTypeDto_.nameType, "string")
        if (cecknameType != "") {
            await this.errorHandler.generateBadRequestException(
                cecknameType,
            );
        }
        //VALIDASI PARAM valueCreditView
        var ceckvalueCreditView = await this.utilsService.validateParam("CPV", AdsTypeDto_.CPV, "number")
        if (ceckvalueCreditView != "") {
            await this.errorHandler.generateBadRequestException(
                ceckvalueCreditView,
            );
        }
        //VALIDASI PARAM valueCreditClick
        var ceckvalueCreditClick = await this.utilsService.validateParam("CPV", AdsTypeDto_.CPA, "number")
        if (ceckvalueCreditClick != "") {
            await this.errorHandler.generateBadRequestException(
                ceckvalueCreditClick,
            );
        }
        //VALIDASI PARAM rewards
        var ceckrewards = await this.utilsService.validateParam("rewards", AdsTypeDto_.rewards, "number")
        if (ceckrewards != "") {
            await this.errorHandler.generateBadRequestException(
                ceckrewards,
            );
        }
        //VALIDASI PARAM durationMax
        var ceckdurationMax = await this.utilsService.validateParam("durationMax", AdsTypeDto_.durationMax, "number")
        if (ceckdurationMax != "") {
            await this.errorHandler.generateBadRequestException(
                ceckdurationMax,
            );
        }
        //VALIDASI PARAM durationMin
        var ceckdurationMin = await this.utilsService.validateParam("durationMin", AdsTypeDto_.durationMin, "number")
        if (ceckdurationMin != "") {
            await this.errorHandler.generateBadRequestException(
                ceckdurationMin,
            );
        }
        //VALIDASI PARAM skipMax
        var ceckskipMax = await this.utilsService.validateParam("skipMax", AdsTypeDto_.skipMax, "number")
        if (ceckskipMax != "") {
            await this.errorHandler.generateBadRequestException(
                ceckskipMax,
            );
        }
        //VALIDASI PARAM akipMin
        var ceckskipMin = await this.utilsService.validateParam("skipMin", AdsTypeDto_.skipMin, "number")
        if (ceckskipMin != "") {
            await this.errorHandler.generateBadRequestException(
                ceckskipMin,
            );
        }

        try {
            var data = await this.adstypeService.update(AdsTypeDto_._id.toString(), AdsTypeDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Ads Type succesfully", data
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
    async getOne(@Param('id') id: string, @Headers() headers): Promise<any> {
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
        var ceck_id = await this.utilsService.validateParam("_id", id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.adstypeService.findOne(id);
            if (await this.utilsService.ceckData(data)) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Ads Type succesfully", data
                );
            } else {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Ads Type not found",
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
    async delete(@Body() AdsTypeDto_: AdsTypeDto, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", AdsTypeDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.adstypeService.delete(AdsTypeDto_._id.toString());
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Delete Ads Type succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.ACCEPTED)
    async getAll(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string, @Headers() headers) {
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

        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const data_all = await this.adstypeService.filAll();
        const data = await this.adstypeService.findCriteria(pageNumber_, pageRow_, search_);
        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Get Ads Type succesfully", data, data_all.length, pageNumber
        );
    }
}