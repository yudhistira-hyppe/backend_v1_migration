import { Body, Controller, HttpCode, Headers, Get, Param, HttpStatus, Post, UseGuards, Logger, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AdsDto } from './dto/ads.dto';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { AdsService } from './ads.service';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { AdsTypeService } from '../adstype/adstype.service';
import { AdsBalaceCreditDto } from '../adsbalacecredit/dto/adsbalacecredit.dto';
import { AdsType } from '../adstype/schemas/adstype.schema';
import { AdssettingService } from '../adssetting/adssetting.service';
import { Mutex, MutexInterface } from 'async-mutex';
import { UserAdsService } from '../../userads/userads.service'
import { CreateUserAdsDto } from '../../../trans/userads/dto/create-userads.dto';
import { MediaprofilepictsService } from '../../../content/mediaprofilepicts/mediaprofilepicts.service';
import { AdsplacesService } from '../../../trans/adsplaces/adsplaces.service';
import { AdstypesService } from '../../../trans/adstypes/adstypes.service';
import { PostContentService } from '../../../content/posts/postcontent.service';

@Controller('api/adsv2/ads')
export class AdsController {
    private readonly logger = new Logger(AdsController.name);
    private locks: Map<string, MutexInterface>;

    constructor(
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly adssettingService: AdssettingService, 
        private readonly adsTypeService: AdsTypeService,
        private readonly configService: ConfigService, 
        private readonly userAdsService: UserAdsService,
        private readonly postContentService: PostContentService, 
        private adstypesService: AdstypesService,
        private adsplacesService: AdsplacesService,
        private mediaprofilepictsService: MediaprofilepictsService,
        private readonly adsService: AdsService) {
        this.locks = new Map();
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsDto_: AdsDto, @Headers() headers) {
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

        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");

        //VALIDASI PARAM userId
        const ubasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(ubasic))) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, user not found',
            );
        } else {
            AdsDto_.userID = new mongoose.Types.ObjectId(ubasic._id.toString());
        }

        //VALIDASI PARAM adsObjectivitasId
        var ceck_adsObjectivitasId = await this.utilsService.validateParam("adsObjectivitasId", AdsDto_.adsObjectivitasId, "string")
        if (ceck_adsObjectivitasId != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_adsObjectivitasId,
            );
        }else{
            AdsDto_.adsObjectivitasId = new mongoose.Types.ObjectId(AdsDto_.adsObjectivitasId.toString());
        }

        //VALIDASI PARAM typeAdsID
        var ceck_typeAdsID = await this.utilsService.validateParam("typeAdsID", AdsDto_.typeAdsID, "string")
        if (ceck_typeAdsID != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_typeAdsID,
            );
        } 

        //VALIDASI PARAM typeAdsID
        var getAdsType: AdsType;
        if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_CONTENT")) {
            var _id_InContentAds = this.configService.get("ID_ADS_IN_CONTENT");
            getAdsType = await this.adsTypeService.findOne(_id_InContentAds);
        } else if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_BETWEEN")) {
            var _id_InBetweenAds = this.configService.get("ID_ADS_IN_CONTENT");
            getAdsType = await this.adsTypeService.findOne(_id_InBetweenAds);
        } else if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_POPUP")) {
            var _id_PopUpAds = this.configService.get("ID_ADS_IN_CONTENT");
            getAdsType = await this.adsTypeService.findOne(_id_PopUpAds);
        } else {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param typeAdsID not found',
            );
        }
        AdsDto_.typeAdsID = new mongoose.Types.ObjectId(AdsDto_.typeAdsID.toString());

        //VALIDASI PARAM name
        var ceck_name = await this.utilsService.validateParam("name", AdsDto_.name, "string")
        if (ceck_name != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_name,
            );
        }else{
            if (AdsDto_.name.length > Number(getAdsType.titleMax)) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, name max length ' + getAdsType.titleMax.toString(),
                );
           } 
        }

        //VALIDASI PARAM dayAds
        if (AdsDto_.dayAds == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        }else{
            if (
                AdsDto_.dayAds.sunday == undefined || 
                AdsDto_.dayAds.monday == undefined ||
                AdsDto_.dayAds.tuesday == undefined ||
                AdsDto_.dayAds.wednesday == undefined ||
                AdsDto_.dayAds.thursday == undefined ||
                AdsDto_.dayAds.friday == undefined ||
                AdsDto_.dayAds.saturday == undefined
            ) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, param typeAdsID is required',
                );
            }
        }

        //VALIDASI PARAM timeAds
        if (AdsDto_.timeAds == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        } else {
            if (
                AdsDto_.timeAds.time_4_8 == undefined ||
                AdsDto_.timeAds.time_8_12 == undefined ||
                AdsDto_.timeAds.time_12_16 == undefined ||
                AdsDto_.timeAds.time_16_20 == undefined ||
                AdsDto_.timeAds.time_20_24 == undefined ||
                AdsDto_.timeAds.time_24_4 == undefined 
            ) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param timeAds is required',
                );
            }
        }

        //VALIDASI PARAM skipTime
        var ceck_skipTime = await this.utilsService.validateParam("skipTime", AdsDto_.skipTime, "number")
        if (ceck_skipTime != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_skipTime,
            );
        }else{
            if (!((Number(getAdsType.skipMax) >= Number(AdsDto_.skipTime)) && (Number(AdsDto_.skipTime) >= Number(getAdsType.skipMin)))) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, skipTime required ' + getAdsType.skipMax.toString() + ' > skipTime >' + getAdsType.skipMin.toString(),
                );
            }
        }

        //VALIDASI PARAM placingID
        var ceck_placingID = await this.utilsService.validateParam("placingID", AdsDto_.placingID, "string")
        if (ceck_placingID != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_placingID,
            );
        }else{
            AdsDto_.placingID = new mongoose.Types.ObjectId(AdsDto_.placingID.toString());
        }

        //VALIDASI PARAM liveAt
        var ceck_liveAt = await this.utilsService.validateParam("liveAt", AdsDto_.liveAt, "string")
        if (ceck_liveAt != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_liveAt,
            );
        }

        //VALIDASI PARAM liveEnd
        var ceck_liveEnd = await this.utilsService.validateParam("liveEnd", AdsDto_.liveEnd, "string")
        if (ceck_liveEnd != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_liveEnd,
            );
        }

        const liveAt_ = new Date(AdsDto_.liveAt);
        const liveEnd_ = new Date(AdsDto_.liveEnd);
        const oneDay = 1000 * 60 * 60 * 24;
        const diff = liveEnd_.getTime() - liveAt_.getTime(); 
        const dayCount = Math.round(diff / oneDay);

        //VALIDASI PARAM Duration Day 
        var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
        var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
        var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
        var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));
    
        if (!((Number(getSetting_AdsDurationMax.value) >= Number(dayCount)) && (Number(dayCount) >= Number(getSetting_AdsDurationMin.value)))){
            return await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, duration day tayang required ' + getSetting_AdsDurationMax.value.toString() + ' > Day Duration : ' + Number(dayCount) + ' > ' + getSetting_AdsDurationMin.value.toString(),
            );
        }

        //VALIDASI PARAM tayang
        var ceck_tayang = await this.utilsService.validateParam("tayang", AdsDto_.tayang, "number")
        if (ceck_tayang != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_tayang,
            );
        } else {
            if (!((Number(getSetting_AdsPlanMax.value) >= Number(AdsDto_.tayang)) && (Number(AdsDto_.tayang) >= Number(getSetting_AdsPlanMin.value)))) {
                return await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, plan tayang required ' + getSetting_AdsPlanMax.value.toString() + ' > tayang > ' + getSetting_AdsPlanMin.value.toString(),
                );
            } 
        }

        //VALIDASI PARAM credit
        var ceck_credit = await this.utilsService.validateParam("credit", AdsDto_.credit, "number")
        if (ceck_credit != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_credit,
            );
        }else{
            const minPembelianCredit = (getAdsType.CPV * AdsDto_.tayang) + (getAdsType.CPA * AdsDto_.tayang);
            if (minPembelianCredit != AdsDto_.credit) {
                AdsDto_.status = "DRAFT";
            }else{
                if (AdsDto_.status == undefined) {
                    AdsDto_.status = "UNDER_REVIEW";
                }
            }
        }

        //VALIDASI PARAM demografisID
        var Array_Demografis = [];
        if (AdsDto_.demografisID == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param demografisID is required',
            );
        }else{
            for (var i = 0; i < AdsDto_.demografisID.length; i++) {
                let demografisID_Object = AdsDto_.demografisID[i];
                let demografisID_Object_Dbref = { "$ref": "areas", "$id": new mongoose.Types.ObjectId(demografisID_Object), "$db": "ProdAll" }
                Array_Demografis.push(demografisID_Object_Dbref);
            }
            AdsDto_.demografisID = Array_Demografis;
        }

        //VALIDASI PARAM interestID
        var Array_Interest = [];
        if (AdsDto_.interestID == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param interestID is required',
            );
        } else {
            for (var i = 0; i < AdsDto_.interestID.length; i++) {
                let interestID_Object = AdsDto_.interestID[i];
                let interestID_Object_Dbref = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(interestID_Object), "$db": "ProdAll" }
                Array_Interest.push(interestID_Object_Dbref);
            }
            AdsDto_.interestID = Array_Interest;
        } 

        //VALIDASI PARAM audiensFrekuensi
        var ceck_audiensFrekuensi = await this.utilsService.validateParam("audiensFrekuensi", AdsDto_.audiensFrekuensi, "number")
        if (ceck_audiensFrekuensi != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_audiensFrekuensi,
            );
        }else{
            if (AdsDto_.audiensFrekuensi > 1) {
                AdsDto_.liveTypeAds = true;
            } else {
                AdsDto_.liveTypeAds = false;
            }
        }

        //VALIDASI PARAM gender
        if (AdsDto_.gender == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param gender is required',
            );
        } else {
            if (AdsDto_.gender.length == 0) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param gender is required',
                ); 
            }
        }

        //VALIDASI PARAM age
        if (AdsDto_.age == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        } else {
            if (
                AdsDto_.age.age_smaller_than_14 == undefined ||
                AdsDto_.age.age_14_smaller_than_28 == undefined ||
                AdsDto_.age.age_29_smaller_than_43 == undefined ||
                AdsDto_.age.age_greater_than_44 == undefined ||
                AdsDto_.age.age_other == undefined
            ) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param age is required',
                );
            }
        } 

        //VALIDASI PARAM ctaButton
        var ceck_ctaButton = await this.utilsService.validateParam("ctaButton", AdsDto_.ctaButton, "number")
        if (ceck_ctaButton != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_ctaButton,
            );
        }

        //VALIDASI PARAM idApsara
        var ceck_idApsara = await this.utilsService.validateParam("idApsara", AdsDto_.idApsara, "string")
        if (ceck_idApsara != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_idApsara,
            );
        }

        //VALIDASI PARAM urlLink
        var ceck_urlLink = await this.utilsService.validateParam("urlLink", AdsDto_.urlLink, "string")
        if (ceck_urlLink != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_urlLink,
            );
        } 

        //--------------------GENERATE CAMPAIG ID--------------------
        const coutAds = await this.adsService.count();
        const generateCampaignID = await this.utilsService.generateCampaignID(coutAds+1, AdsDto_.typeAdsID.toString());
        AdsDto_.campaignId = generateCampaignID;

        try {
            const currentDate = await this.utilsService.getDateTimeISOString();
            AdsDto_.createdAt = currentDate;
            AdsDto_.updatedAt = currentDate;
            AdsDto_.timestamp = currentDate;
            AdsDto_.totalCredit = AdsDto_.credit;
            AdsDto_.totalUsedCredit = AdsDto_.credit;
            AdsDto_.objectifitas = "Lalu Lintas";
            AdsDto_.creditFree = 0;
            AdsDto_.creditValue = 0; 
            AdsDto_.usedCredit = 0; 
            AdsDto_.startAge = 0; 
            AdsDto_.usedCreditFree = 0;
            AdsDto_.endAge = 0;
            AdsDto_.totalView = 0; 
            AdsDto_.isActive = false;
            console.log(AdsDto_);
            let data = await this.adsService.create(AdsDto_);
            if (AdsDto_.status == "UNDER_REVIEW"){
                //--------------------INSERT BALANCE DEBET--------------------
                const AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
                AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId;
                AdsBalaceCreditDto_.iduser = AdsDto_.userID;
                AdsBalaceCreditDto_.debet = AdsDto_.credit; 
                AdsBalaceCreditDto_.kredit = 0;
                AdsBalaceCreditDto_.type = "USE";
                AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
                AdsBalaceCreditDto_.description = "USE ADS CREATE";
                AdsBalaceCreditDto_.idtrans = data._id;  
                await this.adsService.insertBalaceDebit(AdsBalaceCreditDto_); 
            }

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Ads Type succesfully with status " + AdsDto_.status, data
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
    async update(@Body() AdsDto_: AdsDto, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", AdsDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }
        //VALIDASI PARAM status
        var ceck_status = await this.utilsService.validateParam("status", AdsDto_.status, "string")
        if (ceck_status != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_status,
            );
        }
        //--------------------GET ADS--------------------
        const ads = await this.adsService.findOne(AdsDto_._id.toString());
        if (!(await this.utilsService.ceckData(ads))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ads not found',
            );
        }

        if (AdsDto_.status == "UNDER_REVIEW" || AdsDto_.status == "IN_ACTIVE"){
            const AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
            AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId;
            AdsBalaceCreditDto_.iduser = AdsDto_.userID;
            AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
            AdsBalaceCreditDto_.idtrans = ads._id;
            if (ads.status != "ACTIVE") {
                if ((ads.status == "DRAFT") && (AdsDto_.status == "UNDER_REVIEW")) {
                    //--------------------INSERT BALANCE DEBET--------------------
                    AdsBalaceCreditDto_.iduser = ads.userID;
                    AdsBalaceCreditDto_.debet = AdsDto_.credit;
                    AdsBalaceCreditDto_.kredit = 0;
                    AdsBalaceCreditDto_.type = "USE";
                    AdsBalaceCreditDto_.description = "ADS CREATION";
                }
                if ((ads.status == "UNDER_REVIEW") && (AdsDto_.status == "IN_ACTIVE")) {
                    //--------------------INSERT BALANCE KREDIT--------------------
                    AdsBalaceCreditDto_.iduser = ads.userID;
                    AdsBalaceCreditDto_.debet = 0;
                    AdsBalaceCreditDto_.kredit = ads.credit;
                    AdsBalaceCreditDto_.type = "REFUND";
                    AdsBalaceCreditDto_.description = "ADS REJECTED";
                }
                await this.adsService.insertBalaceDebit(AdsBalaceCreditDto_);
            }
        } else {
            //VALIDASI PARAM userId
            const ubasic = await this.userbasicsService.findOne(headers['x-auth-user']);
            if (!(await this.utilsService.ceckData(ubasic))) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, user not found',
                );
            } else {
                AdsDto_.userIDAssesment = new mongoose.Types.ObjectId(ubasic._id.toString());
            }
            AdsDto_.isActive = true;
        }

        try {
            var data = await this.adsService.update(AdsDto_._id.toString(), AdsDto_);
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
            var data = await this.adsService.findOne(id);
            var AdsDto_ = new AdsDto();
            AdsDto_._id = data._id; 
            AdsDto_.name = data.name;
            AdsDto_.typeAdsID = new mongoose.Types.ObjectId(data.typeAdsID.toString());
            AdsDto_.dayAds = data.dayAds;
            AdsDto_.timeAds = data.timeAds;
            AdsDto_.skipTime = data.skipTime;
            AdsDto_.liveAt = data.liveAt;
            AdsDto_.liveEnd = data.liveEnd;
            AdsDto_.liveEnd = data.liveEnd; 
            AdsDto_.tayang = data.tayang;
            AdsDto_.credit = data.credit;
            AdsDto_.placingID = new mongoose.Types.ObjectId(data.placingID.toString());
            AdsDto_.demografisID = await Promise.all(data.demografisID.map(async (item, index) => {
                console.log(JSON.parse(JSON.stringify(item)).$id)
                return JSON.parse(JSON.stringify(item)).$id;
            }));
            AdsDto_.interestID = await Promise.all(data.interestID.map(async (item, index) => {
                console.log(JSON.parse(JSON.stringify(item)).$id)
                return JSON.parse(JSON.stringify(item)).$id;
            }));
            AdsDto_.audiensFrekuensi = data.audiensFrekuensi;
            AdsDto_.gender = data.gender;
            AdsDto_.age = data.age;
            AdsDto_.type = data.type;
            AdsDto_.urlLink = data.urlLink;
            AdsDto_.ctaButton = data.ctaButton;
            AdsDto_.description = data.description;
            AdsDto_.duration = data.duration;
            AdsDto_.idApsara = data.idApsara;
            AdsDto_.sizeFile = data.sizeFile;

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads succesfully", AdsDto_
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/dashboard')
    @HttpCode(HttpStatus.ACCEPTED)
    async dashboard(@Body() body: any,@Headers() headers) {
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

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
        }

        try {
            const ads_dashboard = await this.adsService.dashboard(start_date, end_date);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Dashboard succesfully", ads_dashboard,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/dashboard')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDashboard(@Body() body: any, @Headers() headers) {
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

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
        }

        try {
            let ads_campaign_dashboard = await this.adsService.campaignDashboard(start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_dashboard)){
                if (ads_campaign_dashboard.length>0){
                    ads_campaign_dashboard = ads_campaign_dashboard[0];
                }
            }
            for (var d = start_date; d <= end_date; d.setDate(d.getDate() + 1)) {
                var DateFormat = await this.utilsService.consvertDateTimeString(new Date(d));
                const isFoundreach = ads_campaign_dashboard.reach.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundreach){
                    ads_campaign_dashboard.reach.push({
                        "_id": DateFormat,
                        "reachView": 0
                    })
                }
                const isFoundimpresi = ads_campaign_dashboard.impresi.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundimpresi) {
                    ads_campaign_dashboard.impresi.push({
                        "_id": DateFormat,
                        "impresiView": 0
                    })
                }
                const isFoundCTA = ads_campaign_dashboard.CTA.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundCTA) {
                    ads_campaign_dashboard.CTA.push({
                        "_id": DateFormat,
                        "CTACount": 0
                    })
                }
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Dashboard succesfully", ads_campaign_dashboard,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/all')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetailAll(@Body() body: any, @Headers() headers) {
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

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, ads not found',
            );
        } 

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
        }

        try {
            let ads_campaign_detail = await this.adsService.campaignDetailAll(body.adsId.toString(), start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_detail)) {
                if (ads_campaign_detail.length > 0) {
                    ads_campaign_detail = ads_campaign_detail[0];
                }
            }

            if (ads_campaign_detail.summary.CTR==null){
                ads_campaign_detail.summary.CTR="0%"
            }
            for (var d = start_date; d <= end_date; d.setDate(d.getDate() + 1)) {
                var DateFormat = await this.utilsService.consvertDateTimeString(new Date(d));
                const isFoundreach = ads_campaign_detail.summary.reach.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundreach) {
                    ads_campaign_detail.summary.reach.push({
                        "_id": DateFormat,
                        "reachView": 0
                    })
                }
                const isFoundimpresi = ads_campaign_detail.summary.impresi.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundimpresi) {
                    ads_campaign_detail.summary.impresi.push({
                        "_id": DateFormat,
                        "impresiView": 0
                    })
                }
                const isFoundCTA = ads_campaign_detail.summary.CTA.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundCTA) {
                    ads_campaign_detail.summary.CTA.push({
                        "_id": DateFormat,
                        "CTACount": 0
                    })
                }
            }

            var listdata = [];
            if (ads_campaign_detail.adsDetail.idApsara!=undefined){
                listdata.push(ads_campaign_detail.adsDetail.idApsara);
            }
            if (listdata.length>0){
                var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
                if (apsaravideodata.VideoList.length > 0) {
                    if (apsaravideodata.VideoList[0] != undefined) {
                        ads_campaign_detail.adsDetail.media = apsaravideodata.VideoList[0];
                    }
                }
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetail1(@Body() body: any, @Headers() headers) {
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

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, ads not found',
            );
        }

        try {
            let ads_campaign_detail = await this.adsService.campaignDetail(body.adsId.toString());
            if (await this.utilsService.ceckData(ads_campaign_detail)) {
                if (ads_campaign_detail.length > 0) {
                    ads_campaign_detail = ads_campaign_detail[0];
                }
            }

            var listdata = [];
            if (ads_campaign_detail.idApsara != undefined) {
                listdata.push(ads_campaign_detail.idApsara);
            }
            if (listdata.length > 0) {
                var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
                if (apsaravideodata.VideoList.length > 0) {
                    if (apsaravideodata.VideoList[0] != undefined) {
                        ads_campaign_detail.media = apsaravideodata.VideoList[0];
                    }
                }
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @Post('/campaign/detail/summary/')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async campaignDetail2(@Body() body: any, @Headers() headers) {
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

    //     //VALIDASI PARAM adsId
    //     if (body.adsId == undefined) {
    //         await this.errorHandler.generateBadRequestException(
    //             'Unabled to proceed, param adsId is required',
    //         );
    //     }

    //     const dataAds = await this.adsService.findOne(body.adsId);
    //     if (!(await this.utilsService.ceckData(dataAds))) {
    //         await this.errorHandler.generateBadRequestException(
    //             'Unabled to proceed, ads not found',
    //         );
    //     }

    //     //----------------START DATE----------------
    //     var start_date = null;
    //     if (body.start_date != undefined) {
    //         start_date = new Date(body.start_date);
    //     }

    //     //----------------END DATE----------------
    //     var end_date = null;
    //     if (body.end_date != undefined) {
    //         end_date = new Date(body.end_date);
    //     }

    //     try {
    //         let ads_campaign_detail = await this.adsService.campaignDetailSummary(body.adsId.toString(), start_date, end_date);
    //         if (await this.utilsService.ceckData(ads_campaign_detail)) {
    //             if (ads_campaign_detail.length > 0) {
    //                 ads_campaign_detail = ads_campaign_detail[0];
    //             }
    //         }
    //         return await this.errorHandler.generateAcceptResponseCodeWithData(
    //             "Get Ads Campaign Detail succesfully", ads_campaign_detail,
    //         );
    //     }
    //     catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Post('/list')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsList(@Body() body: any, @Headers() headers) {
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

        var array_type_ads = []
        if (body.type_ads != undefined) {
            if (body.type_ads.length > 0) {
                for (var i = 0; i < body.type_ads.length; i++) {
                    let type_ads_ = body.type_ads[i];
                    let type_ads_Object_Id = new mongoose.Types.ObjectId(type_ads_);
                    array_type_ads.push(type_ads_Object_Id);
                }
            }
        }
        body.type_ads = array_type_ads;

        try {
            const ads_dashboard = await this.adsService.list(body.name_ads, body.start_date, body.end_date, body.type_ads, body.plan_ads, body.status_list, body.page, body.limit, body.sorting);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads List succesfully", ads_dashboard, ads_dashboard.length, body.page
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/list/reward')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsListReward(@Body() body: any, @Headers() headers) {
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

        var array_type_ads = []
        if (body.type_ads != undefined) {
            if (body.type_ads.length > 0) {
                for (var i = 0; i < body.type_ads.length; i++) {
                    let type_ads_ = body.type_ads[i];
                    let type_ads_Object_Id = new mongoose.Types.ObjectId(type_ads_);
                    array_type_ads.push(type_ads_Object_Id);
                }
            }
        }
        body.type_ads = array_type_ads;

        try {
            const ads_dashboard = await this.adsService.list_reward(body.name, body.startdate, body.enddate, body.gender, body.age, body.areas, body.page, body.limit, body.sorting); 

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads List succesfully", ads_dashboard, ads_dashboard.length, body.page
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/get/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAds(@Param('id') id: string, @Headers() headers) {
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

        //Validasi Param Id
        if (id == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param id is required',
            );
        }

        //Validasi User
        const data_userbasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        var current_date = await this.utilsService.getDateTimeString();
        var genIdUserAds = new mongoose.Types.ObjectId();

        var req = {
            email: headers['x-auth-user'],
            id: data_userbasic._id.toString(),
            idAdsType: id,
        }
        const data_ads = await this.adsService.getAdsUser(headers['x-auth-user'], data_userbasic._id.toString(), id);
        if (await this.utilsService.ceckData(data_ads)) {
            var ceckData = await this.userAdsService.findAdsIDUserID(data_userbasic._id.toString(), data_ads[0]._id.toString());
            if (!(await this.utilsService.ceckData(ceckData))) {
                var CreateUserAdsDto_ = new CreateUserAdsDto();
                CreateUserAdsDto_._id = genIdUserAds;
                CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(data_ads[0].adsId);
                CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(data_userbasic._id.toString());
                CreateUserAdsDto_.priority = data_ads[0].priority;
                CreateUserAdsDto_.priorityNumber = data_ads[0].priorityNumber;
                if (data_ads[0].description != undefined) {
                    CreateUserAdsDto_.description = data_ads[0].description;
                }
                CreateUserAdsDto_.createdAt = current_date;
                CreateUserAdsDto_.statusClick = false;
                CreateUserAdsDto_.statusView = false;
                CreateUserAdsDto_.viewed = 0;
                CreateUserAdsDto_.liveAt = data_ads[0].liveAt;
                CreateUserAdsDto_.liveTypeuserads = data_ads[0].liveTypeAds;
                CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_ads[0].typeAdsID);
                CreateUserAdsDto_.nameType = data_ads[0].adsType;
                CreateUserAdsDto_.isActive = true;
                this.userAdsService.create(CreateUserAdsDto_);
            }
            var get_profilePict = null;
            const data_userbasic_ads = await this.userbasicsService.findbyid(data_ads[0].userID.toString());
            if (data_userbasic_ads.profilePict != undefined) {
                if (data_userbasic_ads.profilePict != null) {
                    var mediaprofilepicts_json = JSON.parse(JSON.stringify(data_userbasic_ads.profilePict));
                    get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
                }
            }
            var data_response = {};
            data_response['adsId'] = data_ads[0]._id.toString();
            data_response['adsUrlLink'] = data_ads[0].urlLink;
            data_response['adsDescription'] = data_ads[0].description;
            if (await this.utilsService.ceckData(ceckData)) {
                data_response['useradsId'] = ceckData._id.toString();
            } else {
                data_response['useradsId'] = genIdUserAds.toString();
            }
            data_response['idUser'] = data_userbasic_ads._id.toString();
            data_response['fullName'] = data_userbasic_ads.fullName;
            data_response['email'] = data_userbasic_ads.email;

            if (await this.utilsService.ceckData(get_profilePict)) {
                data_response['avartar'] = {
                    mediaBasePath: (get_profilePict.mediaBasePath != undefined) ? get_profilePict.mediaBasePath : null,
                    mediaUri: (get_profilePict.mediaUri != undefined) ? get_profilePict.mediaUri : null,
                    mediaType: (get_profilePict.mediaType != undefined) ? get_profilePict.mediaType : null,
                    mediaEndpoint: (get_profilePict.mediaID != undefined) ? '/profilepict/' + get_profilePict.mediaID : null,
                }
            }

            data_response['placingID'] = data_ads[0].placingID.toString();
            var dataPlace = await this.adsplacesService.findOne(data_ads[0].placingID.toString());
            if (await this.utilsService.ceckData(dataPlace)) {
                data_response['adsPlace'] = dataPlace.namePlace;
            }
            console.log("skipTime", data_ads[0].skipTime);
            data_response['adsType'] = (await this.adstypesService.findOne(data_ads[0].typeAdsID.toString())).nameType;
            data_response['adsSkip'] = (data_ads[0].skipTime != undefined) ? data_ads[0].skipTime : (await this.adstypesService.findOne(data_ads[0].typeAdsID.toString())).AdsSkip;
            data_response['mediaType'] = data_ads[0].type;
            data_response['videoId'] = data_ads[0].idApsara;
            data_response['duration'] = data_ads[0].duration;
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, The process successfuly : " + JSON.stringify(data_response));

            return {
                "response_code": 202,
                "data": data_response,
                "messages": {
                    "info": [
                        "The process successfuly"
                    ]
                }
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found'
            );
        }  
    }
}