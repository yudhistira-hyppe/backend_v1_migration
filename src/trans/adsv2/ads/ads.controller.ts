import { Body, Controller, HttpCode, Headers, Get, Param, HttpStatus, Post, UseGuards, Logger, Query, UseInterceptors, UploadedFile, Res, Request, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AdsAction, AdsDto } from './dto/ads.dto';
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
import { FileInterceptor, AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { OssContentPictService } from '../../../content/posts/osscontentpict.service';
import { AdsLogsDto } from '../adslog/dto/adslog.dto';
import { AdslogsService } from '../adslog/adslog.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { request } from 'http';
import { AccountbalancesService } from '../../../trans/accountbalances/accountbalances.service';
import { CreateAccountbalancesDto } from '../../../trans/accountbalances/dto/create-accountbalances.dto';
import { AdsBalaceCreditService } from '../adsbalacecredit/adsbalacecredit.service';
import { AdsPriceCreditsService } from '../adspricecredits/adspricecredits.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { UservouchersService } from 'src/trans/uservouchers/uservouchers.service';
import { CreateUservouchersDto } from 'src/trans/uservouchers/dto/create-uservouchers.dto';
import { AdsRewardsService } from '../adsrewards/adsrewards.service';
import { TransactionsV2Service } from 'src/trans/transactionsv2/transactionsv2.service';
const sharp = require('sharp');

@Controller('api/adsv2/ads')
export class AdsController {
    private readonly logger = new Logger(AdsController.name);
    private locks: Map<string, MutexInterface>;

    constructor(
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        //private readonly userbasicsService: UserbasicsService,
        private readonly adssettingService: AdssettingService,
        private readonly adsTypeService: AdsTypeService,
        private readonly configService: ConfigService,
        private readonly userAdsService: UserAdsService,
        private readonly postContentService: PostContentService,
        private adsplacesService: AdsplacesService,
        private mediaprofilepictsService: MediaprofilepictsService,
        private readonly ossContentPictService: OssContentPictService,
        private readonly adslogsService: AdslogsService,
        private accountbalancesService: AccountbalancesService,
        private readonly logapiSS: LogapisService,
        private readonly basic2SS: UserbasicnewService,
        private adsBalaceCreditService: AdsBalaceCreditService,
        private readonly adsPriceCreditsService: AdsPriceCreditsService,
        private readonly uservouchersService: UservouchersService,
        private readonly adsRewardsService: AdsRewardsService, 
        private readonly transactionsV2Service: TransactionsV2Service,
        private readonly adsService: AdsService) {
        this.locks = new Map();
    }

    @UseGuards(JwtAuthGuard)
    @Post('/image/upload')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseInterceptors(FileInterceptor('imageAds'))
    async imageAdsUpload(@UploadedFile() file: Express.Multer.File, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/adsv2/ads/image/upload';

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        if (file != undefined) {
            var SIZE_IMAGE_RESIZE = this.configService.get("SIZE_IMAGE_RESIZE");

            var image_information = await sharp(file.buffer).metadata();
            console.log("IMAGE INFORMATION", image_information);

            var image_height = image_information.height;
            var image_width = image_information.width;
            var image_size = image_information.size;
            var image_format = image_information.format;
            var image_orientation = image_information.orientation;
            console.log(image_information);

            //Get Image Mode
            var image_mode = await this.utilsService.getImageMode(image_width, image_height);
            console.log("IMAGE MODE", image_mode);

            //Get Ceck Mode
            var New_height = 0;
            var New_width = 0;
            if (image_mode == "LANDSCAPE") {
                if (image_width > SIZE_IMAGE_RESIZE) {
                    New_height = await this.utilsService.getHeight(image_width, image_height, SIZE_IMAGE_RESIZE);
                    New_width = SIZE_IMAGE_RESIZE;
                } else {
                    New_height = image_height;
                    New_width = image_width;
                }
            } else if (image_mode == "POTRET") {
                if (image_height > SIZE_IMAGE_RESIZE) {
                    New_width = await this.utilsService.getWidth(image_width, image_height, SIZE_IMAGE_RESIZE);
                    New_height = SIZE_IMAGE_RESIZE;
                } else {
                    New_height = image_height;
                    New_width = image_width;
                }
            }

            var id = new mongoose.Types.ObjectId();
            var extension = "jpg";

            var filename = id + "." + extension;
            var filename_thum = id + "_thum." + extension;
            var filename_original = id + "_original." + extension;

            var path_file = "ads/" + id + "/" + filename;
            var path_file_thumb = "ads/" + id + "/" + filename_thum;
            var path_file_original = "ads/" + id + "/" + filename_original;

            var file_upload = await this.postContentService.generate_upload(file, "jpg");
            var file_thumnail = await this.postContentService.generate_thumnail(file, "jpg");

            var upload_file_upload = await this.adsService.uploadOss(file_upload, path_file);
            var upload_file_thumnail = await this.adsService.uploadOss(file_thumnail, path_file_thumb);
            this.adsService.uploadOss(file_thumnail, path_file_original);

            var url_filename = "";
            var url_filename_thum = "";

            if (upload_file_upload != undefined) {
                if (upload_file_upload.res != undefined) {
                    if (upload_file_upload.res.statusCode != undefined) {
                        if (upload_file_upload.res.statusCode == 200) {
                            url_filename = upload_file_upload.res.requestUrls[0];
                        }
                    }
                }
            }

            if (upload_file_thumnail != undefined) {
                if (upload_file_thumnail.res != undefined) {
                    if (upload_file_thumnail.res.statusCode != undefined) {
                        if (upload_file_thumnail.res.statusCode == 200) {
                            url_filename_thum = upload_file_thumnail.res.requestUrls[0];
                        }
                    }
                }
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "succesfully ", {
                mediaBasePath: path_file,
                mediaUri: url_filename,
                mediaThumBasePath: path_file_thumb,
                mediaThumUri: url_filename_thum,
                height: Number(New_height),
                width: Number(New_width)
            }
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/image/upload/v2')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseInterceptors(AnyFilesInterceptor())
    async imageAdsUploadV2(@UploadedFiles() files: Array<Express.Multer.File>, @Headers() headers, @Body() body) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/adsv2/ads/image/upload/v2';
        var bodydata = body.imageAds

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, email header and token do not match',
            );
        }

        var return_data = {
            mediaBasePath: null,
            mediaUri: null,
            mediaThumBasePath: null,
            mediaThumUri: null,
            height: null,
            width: null,
            mediaPortraitBasePath: null,
            mediaPortraitUri: null,
            mediaPortraitThumBasePath: null,
            mediaPortraitThumUri: null,
            heightPortrait: null,
            widthPortrait: null,
            mediaLandscapeBasePath: null,
            mediaLandscapeUri: null,
            mediaLandscapeThumBasePath: null,
            mediaLandscapeThumUri: null,
            heightLandscape: null,
            widthLandscape: null
        }

        var id = new mongoose.Types.ObjectId();
        var extension = "jpg";

        if (files != undefined && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                var image_information = await sharp(files[i].buffer).metadata();
                console.log("IMAGE INFORMATION", image_information);

                var image_height = image_information.height;
                var image_width = image_information.width;
                var image_size = image_information.size;
                var image_format = image_information.format;
                var image_orientation = image_information.orientation;
                console.log(image_information);

                if (bodydata[i].type == "DEFAULT") {
                    var filename = id + "." + extension;
                    var filename_thum = id + "_thum." + extension;
                    var filename_original = id + "_original." + extension;

                    var path_file = "ads/" + id + "/" + filename;
                    var path_file_thumb = "ads/" + id + "/" + filename_thum;
                    var path_file_original = "ads/" + id + "/" + filename_original;

                    var file_upload = await this.postContentService.generate_upload_noresize(files[i], "jpg");
                    var file_thumnail = await this.postContentService.generate_thumnail(files[i], "jpg");

                    var upload_file_upload = await this.adsService.uploadOss(file_upload, path_file);
                    var upload_file_thumnail = await this.adsService.uploadOss(file_thumnail, path_file_thumb);
                    this.adsService.uploadOss(file_thumnail, path_file_original);

                    var url_filename = "";
                    var url_filename_thum = "";

                    if (upload_file_upload != undefined) {
                        if (upload_file_upload.res != undefined) {
                            if (upload_file_upload.res.statusCode != undefined) {
                                if (upload_file_upload.res.statusCode == 200) {
                                    url_filename = upload_file_upload.res.requestUrls[0];
                                }
                            }
                        }
                    }

                    if (upload_file_thumnail != undefined) {
                        if (upload_file_thumnail.res != undefined) {
                            if (upload_file_thumnail.res.statusCode != undefined) {
                                if (upload_file_thumnail.res.statusCode == 200) {
                                    url_filename_thum = upload_file_thumnail.res.requestUrls[0];
                                }
                            }
                        }
                    }

                    return_data = {
                        ...return_data,
                        mediaBasePath: path_file,
                        mediaUri: url_filename,
                        mediaThumBasePath: path_file_thumb,
                        mediaThumUri: url_filename_thum,
                        height: image_height,
                        width: image_width
                    }
                } else if (bodydata[i].type == "PORTRAIT") {
                    var filename = id + "_portrait." + extension;
                    var filename_thum = id + "_portrait_thum." + extension;
                    var filename_original = id + "_portrait_original." + extension;

                    var path_file = "ads/" + id + "/" + filename;
                    var path_file_thumb = "ads/" + id + "/" + filename_thum;
                    var path_file_original = "ads/" + id + "/" + filename_original;

                    var file_upload = await this.postContentService.generate_upload_noresize(files[i], "jpg");
                    var file_thumnail = await this.postContentService.generate_thumnail(files[i], "jpg");

                    var upload_file_upload = await this.adsService.uploadOss(file_upload, path_file);
                    var upload_file_thumnail = await this.adsService.uploadOss(file_thumnail, path_file_thumb);
                    this.adsService.uploadOss(file_thumnail, path_file_original);

                    var url_filename = "";
                    var url_filename_thum = "";

                    if (upload_file_upload != undefined) {
                        if (upload_file_upload.res != undefined) {
                            if (upload_file_upload.res.statusCode != undefined) {
                                if (upload_file_upload.res.statusCode == 200) {
                                    url_filename = upload_file_upload.res.requestUrls[0];
                                }
                            }
                        }
                    }

                    if (upload_file_thumnail != undefined) {
                        if (upload_file_thumnail.res != undefined) {
                            if (upload_file_thumnail.res.statusCode != undefined) {
                                if (upload_file_thumnail.res.statusCode == 200) {
                                    url_filename_thum = upload_file_thumnail.res.requestUrls[0];
                                }
                            }
                        }
                    }

                    return_data = {
                        ...return_data,
                        mediaPortraitBasePath: path_file,
                        mediaPortraitUri: url_filename,
                        mediaPortraitThumBasePath: path_file_thumb,
                        mediaPortraitThumUri: url_filename_thum,
                        heightPortrait: image_height,
                        widthPortrait: image_width
                    }
                } else if (bodydata[i].type == "LANDSCAPE") {
                    var filename = id + "_landscape." + extension;
                    var filename_thum = id + "_landscape_thum." + extension;
                    var filename_original = id + "_landscape_original." + extension;

                    var path_file = "ads/" + id + "/" + filename;
                    var path_file_thumb = "ads/" + id + "/" + filename_thum;
                    var path_file_original = "ads/" + id + "/" + filename_original;

                    var file_upload = await this.postContentService.generate_upload_noresize(files[i], "jpg");
                    var file_thumnail = await this.postContentService.generate_thumnail(files[i], "jpg");

                    var upload_file_upload = await this.adsService.uploadOss(file_upload, path_file);
                    var upload_file_thumnail = await this.adsService.uploadOss(file_thumnail, path_file_thumb);
                    this.adsService.uploadOss(file_thumnail, path_file_original);

                    var url_filename = "";
                    var url_filename_thum = "";

                    if (upload_file_upload != undefined) {
                        if (upload_file_upload.res != undefined) {
                            if (upload_file_upload.res.statusCode != undefined) {
                                if (upload_file_upload.res.statusCode == 200) {
                                    url_filename = upload_file_upload.res.requestUrls[0];
                                }
                            }
                        }
                    }

                    if (upload_file_thumnail != undefined) {
                        if (upload_file_thumnail.res != undefined) {
                            if (upload_file_thumnail.res.statusCode != undefined) {
                                if (upload_file_thumnail.res.statusCode == 200) {
                                    url_filename_thum = upload_file_thumnail.res.requestUrls[0];
                                }
                            }
                        }
                    }

                    return_data = {
                        ...return_data,
                        mediaLandscapeBasePath: path_file,
                        mediaLandscapeUri: url_filename,
                        mediaLandscapeThumBasePath: path_file_thumb,
                        mediaLandscapeThumUri: url_filename_thum,
                        heightLandscape: image_height,
                        widthLandscape: image_width
                    }
                }
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Succesfully uploaded", return_data
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsDto_: AdsDto, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(AdsDto_));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");

        //VALIDASI PARAM userId
        const ubasic = await this.basic2SS.findbyemail(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(ubasic))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, user not found',
            );
        } else {
            AdsDto_.userID = new mongoose.Types.ObjectId(ubasic._id.toString());
        }

        //VALIDASI PARAM adsIdNumber
        var ceck_adsIdNumber = await this.utilsService.validateParam("adsIdNumber", AdsDto_.adsIdNumber, "string")
        if (ceck_adsIdNumber != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_adsIdNumber,
            );
        }

        //VALIDASI PARAM adsObjectivitasId
        var ceck_adsObjectivitasId = await this.utilsService.validateParam("adsObjectivitasId", AdsDto_.adsObjectivitasId, "string")
        if (ceck_adsObjectivitasId != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_adsObjectivitasId,
            );
        } else {
            AdsDto_.adsObjectivitasId = new mongoose.Types.ObjectId(AdsDto_.adsObjectivitasId.toString());
        }

        //VALIDASI PARAM typeAdsID
        var ceck_typeAdsID = await this.utilsService.validateParam("typeAdsID", AdsDto_.typeAdsID, "string")
        if (ceck_typeAdsID != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            var _id_InBetweenAds = this.configService.get("ID_ADS_IN_BETWEEN");
            getAdsType = await this.adsTypeService.findOne(_id_InBetweenAds);
        } else if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_POPUP")) {
            var _id_PopUpAds = this.configService.get("ID_ADS_IN_POPUP");
            getAdsType = await this.adsTypeService.findOne(_id_PopUpAds);
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param typeAdsID not found',
            );
        }
        AdsDto_.typeAdsID = new mongoose.Types.ObjectId(AdsDto_.typeAdsID.toString());
        if (await this.utilsService.ceckData(getAdsType)) {
            AdsDto_.CPA = getAdsType.CPA;
            AdsDto_.CPV = getAdsType.CPV;
        }

        //VALIDASI PARAM name
        var ceck_name = await this.utilsService.validateParam("name", AdsDto_.name, "string")
        if (ceck_name != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_name,
            );
        } else {
            if (AdsDto_.name.length > Number(getAdsType.titleMax)) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, name max length ' + getAdsType.titleMax.toString(),
                );
            }
        }

        //VALIDASI PARAM dayAds
        if (AdsDto_.dayAds == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        } else {
            if (
                AdsDto_.dayAds.sunday == undefined ||
                AdsDto_.dayAds.monday == undefined ||
                AdsDto_.dayAds.tuesday == undefined ||
                AdsDto_.dayAds.wednesday == undefined ||
                AdsDto_.dayAds.thursday == undefined ||
                AdsDto_.dayAds.friday == undefined ||
                AdsDto_.dayAds.saturday == undefined
            ) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, param typeAdsID is required',
                );
            }
        }

        //VALIDASI PARAM timeAds
        if (AdsDto_.timeAds == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param timeAds is required',
                );
            }
        }

        //VALIDASI PARAM skipTime
        if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_POPUP") || AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_CONTENT")) {
            var ceck_skipTime = await this.utilsService.validateParam("skipTime", AdsDto_.skipTime, "number")
            if (ceck_skipTime != "") {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
                await this.errorHandler.generateBadRequestException(
                    ceck_skipTime,
                );
            } else {
                console.log((Number(getAdsType.skipMax) >= Number(AdsDto_.skipTime)));
                console.log((Number(AdsDto_.skipTime) >= Number(getAdsType.skipMin)))
                if (!((Number(getAdsType.skipMax) >= Number(AdsDto_.skipTime)) && (Number(AdsDto_.skipTime) >= Number(getAdsType.skipMin)))) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
                    await this.errorHandler.generateBadRequestException(
                        'Unabled to proceed, skipTime required ' + getAdsType.skipMax.toString() + ' > skipTime >' + getAdsType.skipMin.toString(),
                    );
                }
            }
        }

        //VALIDASI PARAM placingID
        if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_CONTENT")) {
            var ceck_placingID = await this.utilsService.validateParam("placingID", AdsDto_.placingID, "string")
            if (ceck_placingID != "") {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
                await this.errorHandler.generateBadRequestException(
                    ceck_placingID,
                );
            } else {
                AdsDto_.placingID = new mongoose.Types.ObjectId(AdsDto_.placingID.toString());
            }
        }

        //VALIDASI PARAM liveAt
        var ceck_liveAt = await this.utilsService.validateParam("liveAt", AdsDto_.liveAt, "string")
        if (ceck_liveAt != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_liveAt,
            );
        }

        //VALIDASI PARAM liveEnd
        var ceck_liveEnd = await this.utilsService.validateParam("liveEnd", AdsDto_.liveEnd, "string")
        if (ceck_liveEnd != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_liveEnd,
            );
        }

        const liveAt_ = new Date(AdsDto_.liveAt);
        const liveEnd_ = new Date(AdsDto_.liveEnd);
        const oneDay = 1000 * 60 * 60 * 24;
        const diff = liveEnd_.getTime() - liveAt_.getTime();
        const dayCount = Math.round(diff / oneDay) + 1;

        //VALIDASI PARAM Duration Day 
        var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
        var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
        var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
        var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));

        if (!((Number(getSetting_AdsDurationMax.value) >= Number(dayCount)) && (Number(dayCount) >= Number(getSetting_AdsDurationMin.value)))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, duration day tayang required ' + getSetting_AdsDurationMax.value.toString() + ' > Day Duration : ' + Number(dayCount) + ' > ' + getSetting_AdsDurationMin.value.toString(),
            );
        }

        //VALIDASI PARAM tayang
        var ceck_tayang = await this.utilsService.validateParam("tayang", AdsDto_.tayang, "number")
        if (ceck_tayang != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_tayang,
            );
        } else {
            if (!((Number(getSetting_AdsPlanMax.value) >= Number(AdsDto_.tayang)) && (Number(AdsDto_.tayang) >= Number(getSetting_AdsPlanMin.value)))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                return await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, plan tayang required ' + getSetting_AdsPlanMax.value.toString() + ' > tayang > ' + getSetting_AdsPlanMin.value.toString(),
                );
            }
        }

        //VALIDASI PARAM credit
        var ceck_credit = await this.utilsService.validateParam("credit", AdsDto_.credit, "number")
        if (ceck_credit != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_credit,
            );
        } else {
            const minPembelianCredit = (getAdsType.CPV * AdsDto_.tayang) + (getAdsType.CPA * AdsDto_.tayang);
            if (minPembelianCredit != AdsDto_.credit) {
                AdsDto_.status = "DRAFT";
            } else {
                AdsDto_.status = "DRAFT";
                // if (AdsDto_.status == undefined) {
                //     var dataBalance = await this.adsBalaceCreditService.findsaldoKredit(ubasic._id);
                //     if (await this.utilsService.ceckData(dataBalance)){
                //         if (dataBalance.length > 0) {
                //             if (dataBalance[0].saldoKredit > AdsDto_.credit) {
                //                 AdsDto_.status = "UNDER_REVIEW";
                //             } else {
                //                 AdsDto_.status = "DRAFT";
                //             }
                //         } else {
                //             AdsDto_.status = "DRAFT";
                //         }
                //     }else{
                //         AdsDto_.status = "DRAFT";
                //     }
                // }
            }
        }

        //VALIDASI PARAM demografisID
        var Array_Demografis = [];
        if (AdsDto_.demografisID == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param demografisID is required',
            );
        } else {
            for (var i = 0; i < AdsDto_.demografisID.length; i++) {
                let demografisID_Object = AdsDto_.demografisID[i];
                if (demografisID_Object == "Lainnya") {
                    Array_Demografis.push("LAINNYA");
                } else {
                    let demografisID_Object_Dbref = { "$ref": "areas", "$id": new mongoose.Types.ObjectId(demografisID_Object), "$db": "ProdAll" }
                    Array_Demografis.push(demografisID_Object_Dbref);
                }
            }
            AdsDto_.demografisID = Array_Demografis;
        }

        //VALIDASI PARAM interestID
        var Array_Interest = [];
        if (AdsDto_.interestID == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param interestID is required',
            );
        } else {
            for (var i = 0; i < AdsDto_.interestID.length; i++) {
                let interestID_Object = AdsDto_.interestID[i];
                if (interestID_Object == "Lainnya") {
                    Array_Interest.push("LAINNYA");
                } else {
                    let interestID_Object_Dbref = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(interestID_Object), "$db": "ProdAll" }
                    Array_Interest.push(interestID_Object_Dbref);
                }
            }
            AdsDto_.interestID = Array_Interest;
        }

        //VALIDASI PARAM audiensFrekuensi
        var ceck_audiensFrekuensi = await this.utilsService.validateParam("audiensFrekuensi", AdsDto_.audiensFrekuensi, "number")
        if (ceck_audiensFrekuensi != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_audiensFrekuensi,
            );
        } else {
            if (AdsDto_.audiensFrekuensi > 1) {
                AdsDto_.liveTypeAds = true;
            } else {
                AdsDto_.liveTypeAds = false;
            }
        }

        //VALIDASI PARAM gender
        if (AdsDto_.gender == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param gender is required',
            );
        } else {
            if (AdsDto_.gender.length == 0) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param gender is required',
                );
            }
        }

        //VALIDASI PARAM age
        if (AdsDto_.age == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param age is required',
                );
            }
        }

        //VALIDASI PARAM ctaButton
        var ceck_ctaButton = await this.utilsService.validateParam("ctaButton", AdsDto_.ctaButton, "number")
        if (ceck_ctaButton != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_ctaButton,
            );
        }

        //VALIDASI PARAM status
        var ceck_status = await this.utilsService.validateParam("status", AdsDto_.status, "string")
        if (ceck_status != "") {
            AdsDto_.status = "DRAFT";
        }

        //VALIDASI PARAM idApsara
        // var ceck_idApsara = await this.utilsService.validateParam("idApsara", AdsDto_.idApsara, "string")
        // if (ceck_idApsara != "") {
        //     await this.errorHandler.generateBadRequestException(
        //         ceck_idApsara,
        //     );
        // }

        //VALIDASI PARAM urlLink
        var ceck_urlLink = await this.utilsService.validateParam("urlLink", AdsDto_.urlLink, "string")
        if (ceck_urlLink != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_urlLink,
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
        // if (AdsDto_.status == "UNDER_REVIEW") {
        //     const coutAds = await this.adsService.count();
        //     const generateCampaignID = await this.utilsService.generateCampaignID(coutAds + 1, AdsDto_.typeAdsID.toString());
        //     AdsDto_.campaignId = generateCampaignID;
        // }

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

            var getSetting_CreditPrice = await this.adsPriceCreditsService.findStatusActive();
            if (await this.utilsService.ceckData(getSetting_CreditPrice)) {
                AdsDto_.idAdspricecredits = getSetting_CreditPrice._id;
                AdsDto_.adspricecredits = getSetting_CreditPrice.creditPrice;
            }
            if (AdsDto_.status == "UNDER_REVIEW") {
                var dataTransaction = await this.transactionsV2Service.insertTransaction("BUS", "AD", "CREATE", 0, 0, 0, 0, AdsDto_.userID.toString(), undefined, undefined, [{ "adsID": AdsDto_._id, "credit": AdsDto_.credit }], "PENDING");
                if (dataTransaction != false) {
                    AdsDto_.idTransactionCreate = dataTransaction.data[0].idTransaction.toString()
                }
            }
            let data = await this.adsService.create(AdsDto_);
            // if (AdsDto_.status == "UNDER_REVIEW") {
            //     //--------------------INSERT BALANCE DEBET--------------------
            //     const AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
            //     AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId;
            //     AdsBalaceCreditDto_.iduser = AdsDto_.userID;
            //     AdsBalaceCreditDto_.debet = AdsDto_.credit;
            //     AdsBalaceCreditDto_.kredit = 0;
            //     AdsBalaceCreditDto_.type = "USE";
            //     AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
            //     AdsBalaceCreditDto_.description = "USE ADS CREATE";
            //     AdsBalaceCreditDto_.idtrans = data._id;
            //     await this.adsService.insertBalaceDebit(AdsBalaceCreditDto_);
            // }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Ads Type succesfully with status " + AdsDto_.status, data
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() AdsDto_: AdsDto, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(AdsDto_));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", AdsDto_._id, "string")
        if (ceck_id != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }
        //VALIDASI PARAM status
        var ceck_status = await this.utilsService.validateParam("status", AdsDto_.status, "string")
        if (ceck_status != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_status,
            );
        }
        //--------------------GET ADS--------------------
        const ads = await this.adsService.findOne(AdsDto_._id.toString());
        if (!(await this.utilsService.ceckData(ads))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ads not found',
            );
        }

        //--------------------GENERATE CAMPAIG ID--------------------
        if (AdsDto_.status == "UNDER_REVIEW") {
            const coutAds = await this.adsService.count();
            const generateCampaignID = await this.utilsService.generateCampaignID(coutAds + 1, ads.typeAdsID.toString(), ads.adsObjectivitasId.toString());
            AdsDto_.campaignId = generateCampaignID;
        }

        if (AdsDto_.status == "UNDER_REVIEW" || AdsDto_.status == "IN_ACTIVE") {
            // const AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
            // AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId;
            // AdsBalaceCreditDto_.iduser = AdsDto_.userID;
            // AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
            // AdsBalaceCreditDto_.idtrans = ads._id;
            if (ads.status != "ACTIVE") {
                if ((ads.status == "DRAFT") && (AdsDto_.status == "UNDER_REVIEW")) {
                    var dataTransaction = await this.transactionsV2Service.insertTransaction("BUS", "AD", "CREATE", 0, 0, 0, 0, AdsDto_.userID.toString(), undefined, undefined, [{ "adsID": AdsDto_._id, "credit": AdsDto_.credit }], "PENDING");
                    if (dataTransaction != false) {
                        AdsDto_.idTransactionCreate = dataTransaction.data[0].idTransaction.toString()
                    }
                    //--------------------INSERT BALANCE DEBET--------------------
                    // AdsBalaceCreditDto_.iduser = ads.userID;
                    // AdsBalaceCreditDto_.debet = ads.credit;
                    // AdsBalaceCreditDto_.kredit = 0;
                    // AdsBalaceCreditDto_.type = "USE";
                    // AdsBalaceCreditDto_.description = "ADS CREATION";

                    // const getUserVoucher = await this.uservouchersService.findUserVouchers(ads.userID.toString());

                    // let buyAds = ads.credit;
                    // if (await this.utilsService.ceckData(getUserVoucher)) {
                    //     for (let i = 0; i < getUserVoucher.length; i++) {
                    //         let sisaKredit = Number(getUserVoucher[i].totalCredit) - Number(getUserVoucher[i].usedCredit);
                    //         if (buyAds <= sisaKredit) {
                    //             let CreateUservouchersDto_ = new CreateUservouchersDto();
                    //             CreateUservouchersDto_.usedCredit = Number(getUserVoucher[i].usedCredit) + Number(buyAds);
                    //             await this.uservouchersService.update(getUserVoucher[i]._id.toString(), CreateUservouchersDto_);
                    //             break;
                    //         } else {
                    //             buyAds = buyAds - sisaKredit;
                    //             let CreateUservouchersDto_ = new CreateUservouchersDto();
                    //             CreateUservouchersDto_.usedCredit = Number(getUserVoucher[i].usedCredit) + Number(sisaKredit);
                    //             await this.uservouchersService.update(getUserVoucher[i]._id.toString(), CreateUservouchersDto_);
                    //         }
                    //     }
                    // }
                }
                if ((ads.status == "UNDER_REVIEW") && (AdsDto_.status == "IN_ACTIVE")) {
                    await this.transactionsV2Service.updateTransaction(AdsDto_.idTransactionCreate, "FAILED", [{ "adsID": AdsDto_._id, "credit": AdsDto_.credit }]);
                    //--------------------INSERT BALANCE KREDIT--------------------
                    // AdsBalaceCreditDto_.iduser = ads.userID;
                    // AdsBalaceCreditDto_.debet = 0;
                    // AdsBalaceCreditDto_.kredit = ads.credit;
                    // AdsBalaceCreditDto_.type = "REFUND";
                    // AdsBalaceCreditDto_.description = "ADS REJECTED";
                }
                //await this.adsService.insertBalaceDebit(AdsBalaceCreditDto_);
            }
        } else {
            //VALIDASI PARAM userId
            const ubasic = await this.basic2SS.findBymail(headers['x-auth-user']);
            if (!(await this.utilsService.ceckData(ubasic))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Ads Type succesfully", data
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getOne(@Param('id') id: string, @Headers() headers, @Request() req): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", id, "string")
        if (ceck_id != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

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

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads succesfully", AdsDto_
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/dashboard')
    @HttpCode(HttpStatus.ACCEPTED)
    async dashboard(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            end_date = new Date(end_date.setDate(end_date.getDate() + 1));
        }

        try {
            const ads_dashboard = await this.adsService.dashboard2(start_date, end_date);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Dashboard succesfully", ads_dashboard,
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/dashboard')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDashboard(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            end_date = new Date(end_date.setDate(end_date.getDate() + 1));
        }

        try {
            let ads_campaign_dashboard = await this.adsService.campaignDashboard(body.userId, start_date, end_date);
            let ads_status_campaign_dashboard = await this.adsService.getAdsSatus(body.userId, start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_dashboard)) {
                if (ads_campaign_dashboard.length > 0) {
                    ads_campaign_dashboard = ads_campaign_dashboard[0];
                    ads_campaign_dashboard.statusIklan = ads_status_campaign_dashboard[0].status;
                }
            }
            for (var d = start_date; d < end_date; d.setDate(d.getDate() + 1)) {
                var DateFormat = await this.utilsService.consvertDateTimeString(new Date(d));
                const isFoundreach = ads_campaign_dashboard.reach.some(element => {
                    if (element._id === DateFormat) {
                        return true;
                    }
                    return false;
                });
                if (!isFoundreach) {
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

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Dashboard succesfully", ads_campaign_dashboard,
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/all')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetailAll(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            end_date = new Date(end_date.setDate(end_date.getDate() + 1));
        }

        try {
            let ads_campaign_detail = await this.adsService.campaignDetailAll(body.adsId.toString(), start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_detail)) {
                if (ads_campaign_detail.length > 0) {
                    ads_campaign_detail = ads_campaign_detail[0];
                }
            }

            if (ads_campaign_detail.summary.CTR == null) {
                ads_campaign_detail.summary.CTR = "0%"
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
            if (ads_campaign_detail.adsDetail.idApsara != undefined) {
                listdata.push(ads_campaign_detail.adsDetail.idApsara);
            }
            if (listdata.length > 0) {
                var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
                if (apsaravideodata.VideoList.length > 0) {
                    if (apsaravideodata.VideoList[0] != undefined) {
                        ads_campaign_detail.adsDetail.media = apsaravideodata.VideoList[0];
                    }
                }
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/all/v2')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetailAll2(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            end_date = new Date(end_date.setDate(end_date.getDate() + 1));
        }

        try {
            let ads_campaign_detail = await this.adsService.campaignDetailAll2(body.adsId.toString(), start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_detail)) {
                if (ads_campaign_detail.length > 0) {
                    ads_campaign_detail = ads_campaign_detail[0];
                }
            }

            if (ads_campaign_detail.summary.CTR == null) {
                ads_campaign_detail.summary.CTR = "0%"
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
            if (ads_campaign_detail.adsDetail.idApsara != undefined) {
                listdata.push(ads_campaign_detail.adsDetail.idApsara);
            }
            if (listdata.length > 0) {
                var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
                if (apsaravideodata.VideoList.length > 0) {
                    if (apsaravideodata.VideoList[0] != undefined) {
                        ads_campaign_detail.adsDetail.media = apsaravideodata.VideoList[0];
                    }
                }
            }
            var listdataPortrait = [];
            if (ads_campaign_detail.idApsaraPortrait != undefined) {
                listdataPortrait.push(ads_campaign_detail.idApsaraPortrait);
            }
            if (listdataPortrait.length > 0) {
                var apsaravideodataportrait = await this.postContentService.getVideoApsara(listdataPortrait);
                if (apsaravideodataportrait.VideoList.length > 0) {
                    if (apsaravideodataportrait.VideoList[0] != undefined) {
                        ads_campaign_detail.mediaPortrait = apsaravideodataportrait.VideoList[0];
                    }
                }
            }
            var listdataLandscape = [];
            if (ads_campaign_detail.idApsaraLandscape != undefined) {
                listdataLandscape.push(ads_campaign_detail.idApsaraLandscape);
            }
            if (listdataLandscape.length > 0) {
                var apsaravideodatalandscape = await this.postContentService.getVideoApsara(listdataLandscape);
                if (apsaravideodatalandscape.VideoList.length > 0) {
                    if (apsaravideodatalandscape.VideoList[0] != undefined) {
                        ads_campaign_detail.mediaLandscape = apsaravideodatalandscape.VideoList[0];
                    }
                }
            }

            var adsImageContains = [];
            if (ads_campaign_detail.mediaUri && ads_campaign_detail.mediaUri != undefined) adsImageContains.push('DEFAULT');
            if (ads_campaign_detail.mediaPortraitUri && ads_campaign_detail.mediaPortraitUri != undefined) adsImageContains.push('PORTRAIT');
            if (ads_campaign_detail.mediaLandscapeUri && ads_campaign_detail.mediaLandscapeUri != undefined) adsImageContains.push('LANDSCAPE');
            ads_campaign_detail.adsImageContains = adsImageContains;

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetail1(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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

            var adsVideoContains = [];
            var listdata = [];
            if (ads_campaign_detail.idApsara != undefined) {
                listdata.push(ads_campaign_detail.idApsara);
            }
            if (listdata.length > 0) {
                var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
                if (apsaravideodata.VideoList.length > 0) {
                    if (apsaravideodata.VideoList[0] != undefined) {
                        ads_campaign_detail.media = apsaravideodata.VideoList[0];
                        adsVideoContains.push('media');
                    }
                }
            }
            var listdataPortrait = [];
            if (ads_campaign_detail.idApsaraPortrait != undefined) {
                listdataPortrait.push(ads_campaign_detail.idApsaraPortrait);
            }
            if (listdataPortrait.length > 0) {
                var apsaravideodataportrait = await this.postContentService.getVideoApsara(listdataPortrait);
                if (apsaravideodataportrait.VideoList.length > 0) {
                    if (apsaravideodataportrait.VideoList[0] != undefined) {
                        ads_campaign_detail.mediaPortrait = apsaravideodataportrait.VideoList[0];
                        adsVideoContains.push('mediaPortrait');
                    }
                }
            }
            var listdataLandscape = [];
            if (ads_campaign_detail.idApsaraLandscape != undefined) {
                listdataLandscape.push(ads_campaign_detail.idApsaraLandscape);
            }
            if (listdataLandscape.length > 0) {
                var apsaravideodatalandscape = await this.postContentService.getVideoApsara(listdataLandscape);
                if (apsaravideodatalandscape.VideoList.length > 0) {
                    if (apsaravideodatalandscape.VideoList[0] != undefined) {
                        ads_campaign_detail.mediaLandscape = apsaravideodatalandscape.VideoList[0];
                        adsVideoContains.push('mediaLandscape');
                    }
                }
            }
            ads_campaign_detail.adsVideoContains = adsVideoContains;

            var adsImageContains = [];
            if (ads_campaign_detail.mediaUri && ads_campaign_detail.mediaUri != undefined) adsImageContains.push('DEFAULT');
            if (ads_campaign_detail.mediaPortraitUri && ads_campaign_detail.mediaPortraitUri != undefined) adsImageContains.push('PORTRAIT');
            if (ads_campaign_detail.mediaLandscapeUri && ads_campaign_detail.mediaLandscapeUri != undefined) adsImageContains.push('LANDSCAPE');
            ads_campaign_detail.adsImageContains = adsImageContains;

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
    async adsList(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
            end_date = new Date(end_date.setDate(end_date.getDate() + 1));
        }

        try {
            const ads_dashboard = await this.adsService.list(body.userId, body.name_ads, start_date, end_date, body.type_ads, body.plan_ads, body.status_list, body.page, body.limit, body.sorting);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads List succesfully", ads_dashboard, ads_dashboard.length, body.page
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/list/reward')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsListReward(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            const ads_dashboard = await this.adsService.list_reward(body.name, body.startdate, body.enddate, body.gender, body.age, body.areas, body.similarity, body.page, body.limit, body.sorting, body.adsId);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads List succesfully", ads_dashboard, ads_dashboard.length, body.page
            );
        }
        catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/get/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAds(@Param('id') id: string, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        var current_date = await this.utilsService.getDateTimeString();
        var dataPlace = null;
        var genIdUserAds = new mongoose.Types.ObjectId();
        var AdsLogsDto_ = new AdsLogsDto();
        var logRequest = {
            header: headers,
            request: {
                email: headers['x-auth-user'],
                idAdsType: id,
            }
        }
        AdsLogsDto_.requestAds = JSON.stringify(logRequest);
        AdsLogsDto_.endPointAds = "api/adsv2/ads/get/" + id;
        AdsLogsDto_.type = "GET ADS";
        AdsLogsDto_.dateTime = await this.utilsService.getDateTimeString();
        AdsLogsDto_.nameActivitas = ["GetAds"];

        //Validasi Token
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unauthorized" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed email header dan token not match" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //Validasi Param typeAdsId
        if (id == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed, param id is required" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param id is required',
            );
        }
        const dataTypeAds = await this.adsTypeService.findOne(id);
        if (!(await this.utilsService.ceckData(dataTypeAds))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed TypeAds not found" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed TypeAds not found'
            );
        }

        //Validasi User
        const data_userbasic = await this.basic2SS.findBymail(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed User not found" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }
        AdsLogsDto_.iduser = new mongoose.Types.ObjectId(data_userbasic._id.toString());
        console.log("ok")
        const data_ads = await this.adsService.getAdsUser2(headers['x-auth-user'], data_userbasic._id.toString(), id);
        console.log(data_ads);
        if (await this.utilsService.ceckData(data_ads)) {
            var ceckData = await this.userAdsService.findAdsIDUserID(data_userbasic._id.toString(), data_ads[0]._id.toString());
            if (!(await this.utilsService.ceckData(ceckData))) {
                var CreateUserAdsDto_ = new CreateUserAdsDto();
                CreateUserAdsDto_._id = genIdUserAds;
                CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(data_ads[0]._id);
                CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(data_userbasic._id.toString());
                CreateUserAdsDto_.priority = data_ads[0].priority;
                if (data_ads[0].description != undefined) {
                    CreateUserAdsDto_.description = data_ads[0].description;
                }
                CreateUserAdsDto_.createdAt = current_date;
                CreateUserAdsDto_.statusClick = false;
                CreateUserAdsDto_.statusView = true;
                CreateUserAdsDto_.liveAt = data_ads[0].liveAt;
                CreateUserAdsDto_.liveTypeuserads = data_ads[0].liveTypeAds;
                CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_ads[0].typeAdsID);
                CreateUserAdsDto_.nameType = data_ads[0].nameType;
                if (data_ads[0].audiensFrekuensi == 1) {
                    CreateUserAdsDto_.isActive = false;
                } else {
                    CreateUserAdsDto_.isActive = true;
                }
                CreateUserAdsDto_.scoreAge = data_ads[0].scoreUmur;
                CreateUserAdsDto_.scoreGender = data_ads[0].scoreKelamin;
                CreateUserAdsDto_.scoreGeografis = data_ads[0].scoreGeografis;
                CreateUserAdsDto_.scoreInterest = data_ads[0].scoreMinat;
                CreateUserAdsDto_.scoreTotal = data_ads[0].scoreTotal;
                CreateUserAdsDto_.updateAt = [current_date];
                CreateUserAdsDto_.viewed = 1;
                this.userAdsService.create(CreateUserAdsDto_);
            } else {
                var data_Update_UserAds = {
                    $inc: { 'viewed': 1 },
                    $push: { "updateAt": current_date },
                }
                if (((ceckData.viewed != undefined ? ceckData.viewed : 0) + 1) == (data_ads[0].audiensFrekuensi != undefined ? data_ads[0].audiensFrekuensi : 0)) {
                    data_Update_UserAds["isActive"] = false;
                }
                await this.userAdsService.updateData(ceckData._id.toString(), data_Update_UserAds)
            }

            //update Ads
            var data_Update_Ads = {}
            if ((data_ads[0].totalView + 1) <= data_ads[0].tayang) {
                data_Update_Ads["$inc"] = { 'usedCredit': Number(data_ads[0].CPV), 'totalView': 1 };
            }
            if (data_ads[0].tayang == (data_ads[0].totalView + 1)) {
                data_Update_Ads["status"] = "IN_ACTIVE";
                data_Update_Ads["isActive"] = false;
            }
            await this.adsService.updateData(data_ads[0]._id.toString(), data_Update_Ads)

            //Get Pict User Ads
            const data_userbasic_ads = await this.basic2SS.findOne(data_ads[0].userID.toString());
            // var get_profilePict = null;
            // if (data_userbasic_ads.profilePict != undefined) {
            //     if (data_userbasic_ads.profilePict != null) {
            //         var mediaprofilepicts_json = JSON.parse(JSON.stringify(data_userbasic_ads.profilePict));
            //         get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
            //     }
            // }

            //Create Response
            var data_response = {};
            data_response['adsId'] = data_ads[0]._id.toString();
            data_response['adsUrlLink'] = data_ads[0].urlLink;
            data_response['adsDescription'] = data_ads[0].description;
            data_response['name'] = data_ads[0].description;
            if (await this.utilsService.ceckData(ceckData)) {
                data_response['useradsId'] = ceckData._id.toString();
            } else {
                data_response['useradsId'] = genIdUserAds.toString();
            }
            data_response['idUser'] = data_userbasic_ads._id.toString();
            data_response['fullName'] = data_userbasic_ads.fullName;
            data_response['email'] = data_userbasic_ads.email;
            data_response['username'] = data_userbasic_ads.username;
            data_response['scoreUmur'] = data_ads[0].scoreUmur;
            data_response['scoreKelamin'] = data_ads[0].scoreKelamin;
            data_response['scoreMinat'] = data_ads[0].scoreMinat;
            data_response['scoreGeografis'] = data_ads[0].scoreGeografis;
            data_response['scoreTotal'] = data_ads[0].scoreTotal;
            data_response['avartar'] = {
                mediaBasePath: (data_userbasic_ads.mediaBasePath != undefined) ? data_userbasic_ads.mediaBasePath : null,
                mediaUri: (data_userbasic_ads.mediaUri != undefined) ? data_userbasic_ads.mediaUri : null,
                mediaType: (data_userbasic_ads.mediaType != undefined) ? data_userbasic_ads.mediaType : null,
                mediaEndpoint: (data_userbasic_ads.mediaEndpoint != undefined) ? data_userbasic_ads.mediaEndpoint : null,
            }
            try {
                data_response['placingID'] = data_ads[0].placingID.toString();
                dataPlace = await this.adsplacesService.findOne(data_ads[0].placingID.toString());
                if (await this.utilsService.ceckData(dataPlace)) {
                    data_response['adsPlace'] = dataPlace.namePlace;
                }
            } catch (e) {
                data_response['placingID'] = null;
                data_response['adsPlace'] = null;
            }

            data_response['adsType'] = (await this.adsTypeService.findOne(data_ads[0].typeAdsID.toString())).nameType;
            data_response['adsSkip'] = (data_ads[0].skipTime != undefined) ? data_ads[0].skipTime : (await this.adsTypeService.findOne(data_ads[0].typeAdsID.toString())).AdsSkip;
            data_response['mediaType'] = data_ads[0].type;
            data_response['ctaButton'] = data_ads[0].ctaNames;
            data_response['videoId'] = data_ads[0].idApsara;
            data_response['duration'] = data_ads[0].duration;
            data_response['mediaBasePath'] = data_ads[0].mediaBasePath;
            data_response['mediaUri'] = data_ads[0].mediaUri;
            data_response['mediaThumBasePath'] = data_ads[0].mediaThumBasePath;
            data_response['mediaThumUri'] = data_ads[0].mediaThumUri;
            data_response['width'] = data_ads[0].width;
            data_response['height'] = data_ads[0].height;
            data_response['mediaPortraitBasePath'] = data_ads[0].mediaPortraitBasePath;
            data_response['mediaPortraitUri'] = data_ads[0].mediaPortraitUri;
            data_response['mediaPortraitThumBasePath'] = data_ads[0].mediaPortraitThumBasePath;
            data_response['mediaPortraitThumUri'] = data_ads[0].mediaPortraitThumUri;
            data_response['widthPortrait'] = data_ads[0].widthPortrait;
            data_response['heightPortrait'] = data_ads[0].heightPortrait;
            data_response['mediaLandscapeBasePath'] = data_ads[0].mediaLandscapeBasePath;
            data_response['mediaLandscapeUri'] = data_ads[0].mediaLandscapeUri;
            data_response['mediaLandscapeThumBasePath'] = data_ads[0].mediaLandscapeThumBasePath;
            data_response['mediaLandscapeThumUri'] = data_ads[0].mediaLandscapeThumUri;
            data_response['widthLandscape'] = data_ads[0].widthLandscape;
            data_response['heightLandscape'] = data_ads[0].heightLandscape;

            AdsLogsDto_.responseAds = JSON.stringify(data_response);
            //await this.adslogsService.create(AdsLogsDto_);
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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed Ads not found" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found'
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/get/v2/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAds2(@Param('id') id: string, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        var current_date = await this.utilsService.getDateTimeString();
        var dataPlace = null;
        var genIdUserAds = new mongoose.Types.ObjectId();
        var AdsLogsDto_ = new AdsLogsDto();
        var logRequest = {
            header: headers,
            request: {
                email: headers['x-auth-user'],
                idAdsType: id,
            }
        }
        AdsLogsDto_.requestAds = JSON.stringify(logRequest);
        AdsLogsDto_.endPointAds = "api/adsv2/ads/get/" + id;
        AdsLogsDto_.type = "GET ADS";
        AdsLogsDto_.dateTime = await this.utilsService.getDateTimeString();
        AdsLogsDto_.nameActivitas = ["GetAds"];

        //Validasi Token
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unauthorized" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed email header dan token not match" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //Validasi Param typeAdsId
        if (id == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed, param id is required" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param id is required',
            );
        }
        const dataTypeAds = await this.adsTypeService.findOne(id);
        if (!(await this.utilsService.ceckData(dataTypeAds))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed TypeAds not found" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed TypeAds not found'
            );
        }

        //Validasi User
        const data_userbasic = await this.basic2SS.findBymail(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed User not found" });
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }
        AdsLogsDto_.iduser = new mongoose.Types.ObjectId(data_userbasic._id.toString());
        console.log("ok")
        const data_ads = await this.adsService.getAdsUser2(headers['x-auth-user'], data_userbasic._id.toString(), id);
        console.log(data_ads);
        if (await this.utilsService.ceckData(data_ads)) {
            var ceckData = await this.userAdsService.findAdsIDUserID(data_userbasic._id.toString(), data_ads[0]._id.toString());
            if (!(await this.utilsService.ceckData(ceckData))) {
                var CreateUserAdsDto_ = new CreateUserAdsDto();
                CreateUserAdsDto_._id = genIdUserAds;
                CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(data_ads[0]._id);
                CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(data_userbasic._id.toString());
                CreateUserAdsDto_.priority = data_ads[0].priority;
                if (data_ads[0].description != undefined) {
                    CreateUserAdsDto_.description = data_ads[0].description;
                }
                CreateUserAdsDto_.createdAt = current_date;
                CreateUserAdsDto_.statusClick = false;
                CreateUserAdsDto_.statusView = true;
                CreateUserAdsDto_.liveAt = data_ads[0].liveAt;
                CreateUserAdsDto_.liveTypeuserads = data_ads[0].liveTypeAds;
                CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_ads[0].typeAdsID);
                CreateUserAdsDto_.nameType = data_ads[0].nameType;
                if (data_ads[0].audiensFrekuensi == 1) {
                    CreateUserAdsDto_.isActive = false;
                } else {
                    CreateUserAdsDto_.isActive = true;
                }
                CreateUserAdsDto_.scoreAge = data_ads[0].scoreUmur;
                CreateUserAdsDto_.scoreGender = data_ads[0].scoreKelamin;
                CreateUserAdsDto_.scoreGeografis = data_ads[0].scoreGeografis;
                CreateUserAdsDto_.scoreInterest = data_ads[0].scoreMinat;
                CreateUserAdsDto_.scoreTotal = data_ads[0].scoreTotal;
                CreateUserAdsDto_.updateAt = [current_date];
                CreateUserAdsDto_.viewed = 1;
                this.userAdsService.create(CreateUserAdsDto_);
            } else {
                var data_Update_UserAds = {
                    $inc: { 'viewed': 1 },
                    $push: { "updateAt": current_date },
                }
                if (((ceckData.viewed != undefined ? ceckData.viewed : 0) + 1) == (data_ads[0].audiensFrekuensi != undefined ? data_ads[0].audiensFrekuensi : 0)) {
                    data_Update_UserAds["isActive"] = false;
                }
                await this.userAdsService.updateData(ceckData._id.toString(), data_Update_UserAds)
            }

            //update Ads
            var data_Update_Ads = {}
            if ((data_ads[0].totalView + 1) <= data_ads[0].tayang) {
                data_Update_Ads["$inc"] = { 'usedCredit': Number(data_ads[0].CPV), 'totalView': 1 };
            }
            if (data_ads[0].tayang == (data_ads[0].totalView + 1)) {
                data_Update_Ads["status"] = "IN_ACTIVE";
                data_Update_Ads["isActive"] = false;
            }
            await this.adsService.updateData(data_ads[0]._id.toString(), data_Update_Ads)

            //Get Pict User Ads
            const data_userbasic_ads = await this.basic2SS.findOne(data_ads[0].userID.toString());
            // var get_profilePict = null;
            // if (data_userbasic_ads.profilePict != undefined) {
            //     if (data_userbasic_ads.profilePict != null) {
            //         var mediaprofilepicts_json = JSON.parse(JSON.stringify(data_userbasic_ads.profilePict));
            //         get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
            //     }
            // }

            //Create Response
            var data_response = {};
            data_response['adsId'] = data_ads[0]._id.toString();
            data_response['adsUrlLink'] = data_ads[0].urlLink;
            data_response['adsDescription'] = data_ads[0].description;
            data_response['name'] = data_ads[0].description;
            if (await this.utilsService.ceckData(ceckData)) {
                data_response['useradsId'] = ceckData._id.toString();
            } else {
                data_response['useradsId'] = genIdUserAds.toString();
            }
            data_response['idUser'] = data_userbasic_ads._id.toString();
            data_response['fullName'] = data_userbasic_ads.fullName;
            data_response['email'] = data_userbasic_ads.email;
            data_response['username'] = data_userbasic_ads.username;
            data_response['scoreUmur'] = data_ads[0].scoreUmur;
            data_response['scoreKelamin'] = data_ads[0].scoreKelamin;
            data_response['scoreMinat'] = data_ads[0].scoreMinat;
            data_response['scoreGeografis'] = data_ads[0].scoreGeografis;
            data_response['scoreTotal'] = data_ads[0].scoreTotal;
            data_response['avartar'] = {
                mediaBasePath: (data_userbasic_ads.mediaBasePath != undefined) ? data_userbasic_ads.mediaBasePath : null,
                mediaUri: (data_userbasic_ads.mediaUri != undefined) ? data_userbasic_ads.mediaUri : null,
                mediaType: (data_userbasic_ads.mediaType != undefined) ? data_userbasic_ads.mediaType : null,
                mediaEndpoint: (data_userbasic_ads.mediaEndpoint != undefined) ? data_userbasic_ads.mediaEndpoint : null,
            }
            try {
                data_response['placingID'] = data_ads[0].placingID.toString();
                dataPlace = await this.adsplacesService.findOne(data_ads[0].placingID.toString());
                if (await this.utilsService.ceckData(dataPlace)) {
                    data_response['adsPlace'] = dataPlace.namePlace;
                }
            } catch (e) {
                data_response['placingID'] = null;
                data_response['adsPlace'] = null;
            }

            data_response['adsType'] = (await this.adsTypeService.findOne(data_ads[0].typeAdsID.toString())).nameType;
            data_response['adsSkip'] = (data_ads[0].skipTime != undefined) ? data_ads[0].skipTime : (await this.adsTypeService.findOne(data_ads[0].typeAdsID.toString())).AdsSkip;
            data_response['mediaType'] = data_ads[0].type;
            data_response['ctaButton'] = data_ads[0].ctaNames;
            data_response['videoId'] = data_ads[0].idApsara;
            data_response['duration'] = data_ads[0].duration;
            data_response['mediaBasePath'] = data_ads[0].mediaBasePath;
            data_response['mediaUri'] = data_ads[0].mediaUri;
            data_response['mediaThumBasePath'] = data_ads[0].mediaThumBasePath;
            data_response['mediaThumUri'] = data_ads[0].mediaThumUri;
            data_response['width'] = data_ads[0].width;
            data_response['height'] = data_ads[0].height;
            data_response['mediaPortraitBasePath'] = data_ads[0].mediaPortraitBasePath;
            data_response['mediaPortraitUri'] = data_ads[0].mediaPortraitUri;
            data_response['mediaPortraitThumBasePath'] = data_ads[0].mediaPortraitThumBasePath;
            data_response['mediaPortraitThumUri'] = data_ads[0].mediaPortraitThumUri;
            data_response['widthPortrait'] = data_ads[0].widthPortrait;
            data_response['heightPortrait'] = data_ads[0].heightPortrait;
            data_response['mediaLandscapeBasePath'] = data_ads[0].mediaLandscapeBasePath;
            data_response['mediaLandscapeUri'] = data_ads[0].mediaLandscapeUri;
            data_response['mediaLandscapeThumBasePath'] = data_ads[0].mediaLandscapeThumBasePath;
            data_response['mediaLandscapeThumUri'] = data_ads[0].mediaLandscapeThumUri;
            data_response['widthLandscape'] = data_ads[0].widthLandscape;
            data_response['heightLandscape'] = data_ads[0].heightLandscape;

            AdsLogsDto_.responseAds = JSON.stringify(data_response);
            //await this.adslogsService.create(AdsLogsDto_);
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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed Ads not found" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found'
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/viewads')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsView(@Body() AdsAction_: AdsAction, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(AdsAction_));

        //Current Date
        var current_date = await this.utilsService.getDateTimeString();

        //Create Ads Logs
        var AdsLogsDto_ = new AdsLogsDto();
        var logRequest = {
            header: headers,
            request: AdsAction_
        }
        AdsLogsDto_.requestAds = JSON.stringify(logRequest);
        AdsLogsDto_.endPointAds = "api/adsv2/ads/viewads/";
        AdsLogsDto_.type = "VIEWS ADS";
        AdsLogsDto_.dateTime = await this.utilsService.getDateTimeString();
        AdsLogsDto_.nameActivitas = ["ViewAds"];

        //Validasi Token
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unauthorized" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed email header dan token not match" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //Validasi Param
        if (AdsAction_.watchingTime == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed param watchingTime is reqired" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param watchingTime is reqired',
            );
        }
        if (typeof AdsAction_.watchingTime != 'number') {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed param watchingTime invalid format ' + typeof AdsAction_.watchingTime });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param watchingTime invalid format ' + typeof AdsAction_.watchingTime,
            );
        }
        if (AdsAction_.adsId == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed param adsId is reqired' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param adsId is reqired',
            );
        }
        if (AdsAction_.useradsId == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed param useradsId is reqired' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param useradsId is reqired',
            );
        }

        //Ceck Data User Ads
        const dataAdsUser = await this.userAdsService.getAdsUser(AdsAction_.useradsId.toString());
        if (!(await this.utilsService.ceckData(dataAdsUser))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed UserAds not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed UserAds not found',
            );
        }

        //Ceck Data User
        const data_userbasic = await this.basic2SS.findBymail(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed User not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        //Ceck Data Ads
        const dataAds = await this.adsService.findOneActive(AdsAction_.adsId.toString());
        if (!(await this.utilsService.ceckData(dataAds))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed Ads not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found',
            );
        }

        //Ceck Data AdsType
        const dataTypeAds = await this.adsTypeService.findOne(dataAds.typeAdsID.toString());
        if (!(await this.utilsService.ceckData(dataTypeAds))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed typeAds not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed typeAds not found'
            );
        }

        //Get CPV
        if (dataTypeAds.CPV == undefined || dataTypeAds.CPA == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed typeAds CPV not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed typeAds CPV And CPA not found'
            );
        }

        try {
            //Update User Ads
            var data_Update_UserAds = {
                statusView: true,
                timeViewSecond: Number(AdsAction_.watchingTime),
                $inc: { 'viewed': 1 },
                $push: { "updateAt": current_date, 'timeView': Number(AdsAction_.watchingTime) },
            }
            if (((dataAdsUser.viewed != undefined ? dataAdsUser.viewed : 0) + 1) == (dataAds.audiensFrekuensi != undefined ? dataAds.audiensFrekuensi : 0)) {
                data_Update_UserAds["isActive"] = false;
            }
            await this.userAdsService.updateData(AdsAction_.useradsId.toString(), data_Update_UserAds)

            //update Ads
            var data_Update_Ads = {}
            if ((dataAds.totalView + 1) <= dataAds.tayang) {
                data_Update_Ads["$inc"] = { 'usedCredit': Number(dataAds.CPV), 'totalView': 1 };
            }
            if (dataAds.tayang == (dataAds.totalView + 1)) {
                data_Update_Ads["status"] = "IN_ACTIVE";
                data_Update_Ads["isActive"] = false;
            }
            await this.adsService.updateData(AdsAction_.adsId.toString(), data_Update_Ads)

            //Set Response
            var response = {
                response_code: 202,
                messages: {
                    info: ['successfully'],
                },
            };
            AdsLogsDto_.responseAds = JSON.stringify(response);
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return response;
        } catch (e) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed User Ads not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User Ads not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/clicked')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsClick(@Body() AdsAction_: AdsAction, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(AdsAction_));

        //Current Date
        var current_date_string = await this.utilsService.getDateTimeString();
        var current_date = await this.utilsService.getDateTime();

        //Create Ads Logs
        var AdsLogsDto_ = new AdsLogsDto();
        var logRequest = {
            header: headers,
            request: AdsAction_
        }
        AdsLogsDto_.requestAds = JSON.stringify(logRequest);
        AdsLogsDto_.endPointAds = "api/adsv2/ads/clicked/";
        AdsLogsDto_.type = "CLICKED ADS";
        AdsLogsDto_.dateTime = await this.utilsService.getDateTimeString();
        AdsLogsDto_.nameActivitas = ["ClickedAds"];

        //Validasi Token
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unauthorized" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed email header dan token not match" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //Validasi Param
        if (AdsAction_.watchingTime == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: "Unabled to proceed param watchingTime is reqired" });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param watchingTime is reqired',
            );
        }
        if (typeof AdsAction_.watchingTime != 'number') {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed param watchingTime invalid format ' + typeof AdsAction_.watchingTime });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param watchingTime invalid format ' + typeof AdsAction_.watchingTime,
            );
        }
        if (AdsAction_.adsId == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed param adsId is reqired' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param adsId is reqired',
            );
        }
        if (AdsAction_.useradsId == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed param useradsId is reqired' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param useradsId is reqired',
            );
        }

        //Ceck Data User Ads
        const dataAdsUser = await this.userAdsService.getAdsUser(AdsAction_.useradsId.toString());
        if (!(await this.utilsService.ceckData(dataAdsUser))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed UserAds not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed UserAds not found',
            );
        }

        //Ceck Data User
        const data_userbasic = await this.basic2SS.findBymail(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed User not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        //Ceck Data Ads
        const dataAds = await this.adsService.findOneActive(AdsAction_.adsId.toString());
        if (!(await this.utilsService.ceckData(dataAds))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed Ads not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found',
            );
        }

        const dataRewards = await this.adsRewardsService.findStatusActive(dataAds.typeAdsID.toString());
        if (!(await this.utilsService.ceckData(dataRewards))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed rewards not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed rewards not found'
            );
        }

        //Ceck Data AdsType
        const dataTypeAds = await this.adsTypeService.findOne(dataAds.typeAdsID.toString());
        if (!(await this.utilsService.ceckData(dataTypeAds))) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed typeAds not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed typeAds not found'
            );
        }

        //Get CPA
        if (dataTypeAds.CPA == undefined || dataTypeAds.CPA == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed typeAds CPA not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed typeAds CPA not found'
            );
        }

        //Get Reward
        if (dataTypeAds.rewards == undefined || dataTypeAds.rewards == undefined) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed typeAds rewards not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed typeAds rewards not found'
            );
        }

        try {
            //Update User Ads
            var data_Update_UserAds = {
                statusClick: true,
                $inc: { 'cliked': 1 },
                $push: { "clickTime": current_date_string, },
            }
            // var data_Update_UserAds = {
            //     statusClick: true,
            //     timeViewSecond: Number(AdsAction_.watchingTime),
            //     $inc: { 'viewed': 1, 'cliked': 1 },
            //     $push: { "updateAt": current_date_string, 'timeView': Number(AdsAction_.watchingTime), "clickTime": current_date_string, },
            // }
            // if (((dataAdsUser.viewed != undefined ? dataAdsUser.viewed : 0) + 1) == (dataAds.audiensFrekuensi != undefined ? dataAds.audiensFrekuensi : 0)) {
            //     data_Update_UserAds["isActive"] = false;
            // }
            this.userAdsService.updateData(AdsAction_.useradsId.toString(), data_Update_UserAds)

            //update Ads
            var data_Update_Ads = {}
            if ((dataAds.totalView) <= dataAds.tayang) {
                data_Update_Ads["$inc"] = { 'usedCredit': Number(dataAds.CPA), 'totalClick': 1 };
            }
            if (dataAds.tayang == (dataAds.totalView)) {
                data_Update_Ads["status"] = "IN_ACTIVE";
                data_Update_Ads["isActive"] = false;
            }

            //Ads Rewatch Transaction
            let getDatacurency = await this.transactionsV2Service.getCurency();
            let cointReward = Number(dataRewards.rewardPrice) / Number(getDatacurency.coin);
            
            var dataTransaction = await this.transactionsV2Service.insertTransaction("APP", "AD", "CLICKED", cointReward, 0, 0, 0, undefined, data_userbasic._id.toString(), undefined, [dataAds], "SUCCESS");
            if (dataTransaction != false) {
                let arrayDataTransaction = dataTransaction.data;
                arrayDataTransaction.filter((bd) => {
                    return bd.type == "USER";
                });

                if (arrayDataTransaction.length == 1) {
                    let dataTransactionSharing = dataAds.idTransactionSharing;
                    dataTransactionSharing.push(arrayDataTransaction[0].idTransaction);
                    data_Update_Ads["idTransactionSharing"] = dataTransaction.data[0].idTransaction.toString()
                } 
            }
            this.adsService.updateData(AdsAction_.adsId.toString(), data_Update_Ads)

            //Update Account Balace
            // var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
            // CreateAccountbalancesDto_.iduser = Object(data_userbasic._id.toString());
            // CreateAccountbalancesDto_.debet = 0;
            // CreateAccountbalancesDto_.kredit = dataRewards.rewardPrice;
            // CreateAccountbalancesDto_.type = "rewards";
            // CreateAccountbalancesDto_.timestamp = current_date.toISOString();
            // CreateAccountbalancesDto_.description = "rewards form ads view";
            // CreateAccountbalancesDto_.idtrans = new mongoose.Types.ObjectId(AdsAction_.adsId.toString());
            // this.accountbalancesService.create(CreateAccountbalancesDto_);

            //Send Fcm
            var eventType = "TRANSACTION";
            var event = "ADS CLICK";
            this.utilsService.sendFcmV2(data_userbasic.email.toString(), data_userbasic.email.toString(), eventType, event, "REWARDS", null, null, null, dataRewards.rewardPrice.toString());

            //Set Response
            var response = {
                response_code: 202,
                data: {
                    nominal: Number(dataRewards.rewardPrice),
                    rewards: true,
                },
                messages: {
                    info: ['successfully'],
                },
            };
            AdsLogsDto_.responseAds = JSON.stringify(response);
            //await this.adslogsService.create(AdsLogsDto_);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return response;
        } catch (e) {
            AdsLogsDto_.responseAds = JSON.stringify({ response: 'Unabled to proceed User Ads not found' });
            //await this.adslogsService.create(AdsLogsDto_);
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User Ads not found',
            );
        }
    }

    @Get('image/read/:id')
    @HttpCode(HttpStatus.OK)
    async imageRead(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var dataAds = await this.adsService.findOne(id);
                if (await this.utilsService.ceckData(dataAds)) {
                    if (dataAds.mediaBasePath != undefined) {
                        var data = await this.ossContentPictService.readFile(dataAds.mediaBasePath);
                        if (data != null) {
                            response.set("Content-Type", "image/jpeg");

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(data);
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(null);
                        }
                    } else {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                        response.send(null);
                    }
                } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                    response.send(null);
                }
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                response.send(null);
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            response.send(null);
        }
    }
    @Get('image/read/portrait/:id')
    @HttpCode(HttpStatus.OK)
    async imageReadPortrait(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var dataAds = await this.adsService.findOne(id);
                if (await this.utilsService.ceckData(dataAds)) {
                    if (dataAds.mediaPortraitBasePath != undefined) {
                        var data = await this.ossContentPictService.readFile(dataAds.mediaPortraitBasePath);
                        if (data != null) {
                            response.set("Content-Type", "image/jpeg");

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(data);
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(null);
                        }
                    } else {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                        response.send(null);
                    }
                } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                    response.send(null);
                }
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                response.send(null);
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            response.send(null);
        }
    }
    @Get('image/read/landscape/:id')
    @HttpCode(HttpStatus.OK)
    async imageReadLandscape(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var dataAds = await this.adsService.findOne(id);
                if (await this.utilsService.ceckData(dataAds)) {
                    if (dataAds.mediaLandscapeBasePath != undefined) {
                        var data = await this.ossContentPictService.readFile(dataAds.mediaLandscapeBasePath);
                        if (data != null) {
                            response.set("Content-Type", "image/jpeg");

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(data);
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(null);
                        }
                    } else {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                        response.send(null);
                    }
                } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                    response.send(null);
                }
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                response.send(null);
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            response.send(null);
        }
    }

    @Get('image/thumb/read/:id')
    @HttpCode(HttpStatus.OK)
    async imageThumbRead(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var dataAds = await this.adsService.findOne(id);
                if (await this.utilsService.ceckData(dataAds)) {
                    if (dataAds.mediaThumBasePath != undefined) {
                        var data = await this.ossContentPictService.readFile(dataAds.mediaThumBasePath);
                        if (data != null) {
                            response.set("Content-Type", "image/jpeg");

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(data);
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(null);
                        }
                    } else {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                        response.send(null);
                    }
                } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                    response.send(null);
                }
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                response.send(null);
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            response.send(null);
        }
    }
    @Get('image/thumb/read/portrait/:id')
    @HttpCode(HttpStatus.OK)
    async imagePortraitThumbRead(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var dataAds = await this.adsService.findOne(id);
                if (await this.utilsService.ceckData(dataAds)) {
                    if (dataAds.mediaPortraitThumBasePath != undefined) {
                        var data = await this.ossContentPictService.readFile(dataAds.mediaPortraitThumBasePath);
                        if (data != null) {
                            response.set("Content-Type", "image/jpeg");

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(data);
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(null);
                        }
                    } else {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                        response.send(null);
                    }
                } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                    response.send(null);
                }
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                response.send(null);
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            response.send(null);
        }
    }
    @Get('image/thumb/read/landscape/:id')
    @HttpCode(HttpStatus.OK)
    async imageLandscapeThumbRead(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var dataAds = await this.adsService.findOne(id);
                if (await this.utilsService.ceckData(dataAds)) {
                    if (dataAds.mediaLandscapeThumBasePath != undefined) {
                        var data = await this.ossContentPictService.readFile(dataAds.mediaLandscapeThumBasePath);
                        if (data != null) {
                            response.set("Content-Type", "image/jpeg");

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(data);
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                            response.send(null);
                        }
                    } else {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                        response.send(null);
                    }
                } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                    response.send(null);
                }
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                response.send(null);
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            response.send(null);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/interest/get')
    @HttpCode(HttpStatus.ACCEPTED)
    async getInterest(@Headers() headers, @Request() req): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        try {
            var data = await this.basic2SS.findTopFive("INTEREST");

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get interest succesfully", data
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/location/get')
    @HttpCode(HttpStatus.ACCEPTED)
    async getLocation(@Headers() headers, @Request() req): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        try {
            var data = await this.basic2SS.findTopFive("LOCATION");

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get location succesfully", data
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }
}