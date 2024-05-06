import { Body, Controller, Get, Post, UploadedFiles, Logger, Headers, UseInterceptors, Req, BadRequestException, NotAcceptableException, Res, HttpException, HttpStatus, HttpCode, Request, Query, UseGuards, Put, Param } from "@nestjs/common";
import { AnyFilesInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { UserbankaccountsService } from './userbankaccounts.service';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Userbankaccounts } from './schemas/userbankaccounts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { BanksService } from '../banks/banks.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
import { isLowercase } from 'class-validator';
import { ErrorHandler } from "../../utils/error.handler";
import { SeaweedfsService } from "../../stream/seaweedfs/seaweedfs.service";
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UtilsService } from "../../utils/utils.service";
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';
import { start } from "repl";
import { OssService } from "../../stream/oss/oss.service";
import { UserbasicnewService } from "../userbasicnew/userbasicnew.service";

//import FormData from "form-data";
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");

export const multerConfig = {
    //dest: process.env.PATH_UPLOAD,
    dest: './temp/'
};

export const multerOptions = {
    limits: {
        fileSize: +process.env.MAX_FILE_SIZE,
    },
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null, true);
        } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
            const uploadPath = multerConfig.dest;
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (req: any, file: any, cb: any) => {
            const fileName = file.originalname.toLowerCase().split(' ').join('-');
            cb(null, fileName)
        },
    }),
};
@Controller()
export class UserbankaccountsController {
    constructor(private readonly userbankaccountsService: UserbankaccountsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly banksService: BanksService,
        private readonly mediaproofpictsService: MediaproofpictsService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly ossService: OssService,
        private readonly basic2SS: UserbasicnewService,
        private readonly seaweedfsService: SeaweedfsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/userbankaccounts')
    async create(@Res() res, @Body() CreateUserbankaccountsDto: CreateUserbankaccountsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var email = null;
        var noRek = null;
        var bankcode = null;
        var nama = null;
        var idbank = null;
        var datamediaprof = null;
        var datarekkembar = null;
        var namamediaprof = null;
        var language = null;
        var messageRespon = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["language"] !== undefined) {
            language = request_json["language"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        if (request_json["noRek"] !== undefined) {
            noRek = request_json["noRek"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["nama"] !== undefined) {
            nama = request_json["nama"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var proofPict_json = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;

        var stringSimilarity = require("string-similarity");

        var similarity = stringSimilarity.compareTwoStrings("healed", "sealed");
        try {
            proofPict_json = JSON.parse(JSON.stringify(ubasic.proofPict));
        } catch (e) {
            throw new BadRequestException("Maaf Silahkan lakukan KYC dahulu !");
        }
        var id_mediaproofpicts = proofPict_json.$id;
        try {
            datamediaprof = await this.mediaproofpictsService.findOne(id_mediaproofpicts);
            namamediaprof = datamediaprof.nama.toLowerCase();
        } catch (e) {
            datamediaprof = null;
            namamediaprof = "";
        }



        if (language === "id") {
            messageRespon = "Nama yang Anda masukkan salah, pastikan nama yang Anda masukkan sesuai dengan ID yang terdaftar di Hyppe, nama yang sudah terdaftar adalah " + namamediaprof.toUpperCase();;
        }
        else if (language === "en") {
            messageRespon = "The name you entered is wrong, make sure the name you enter matches the ID registered on Hyppe, the registered name is " + namamediaprof.toUpperCase();;
        }



        var lownama = nama.toLowerCase();
        var idakun = null;
        var databank = null;
        var namabank = "";
        try {
            databank = await this.banksService.findbankcode(bankcode);
            namabank = databank._doc.bankname;
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        try {
            datarekkembar = await this.userbankaccountsService.findnorek(noRek, idbank);
            idakun = datarekkembar._id;
        } catch (e) {
            datarekkembar = null;
        }
        if (datarekkembar === null) {

            if (lownama === namamediaprof) {
                try {
                    CreateUserbankaccountsDto.userId = iduser;
                    CreateUserbankaccountsDto.noRek = noRek;
                    CreateUserbankaccountsDto.idBank = idbank;
                    CreateUserbankaccountsDto.createdAt = dt.toISOString();
                    CreateUserbankaccountsDto.updatedAt = dt.toISOString();
                    CreateUserbankaccountsDto.active = true;
                    let data = null;

                    data = await this.userbankaccountsService.create(CreateUserbankaccountsDto);

                    return res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                } catch (e) {
                    return res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "message": messagesEror
                    });
                }
            } else {
                return res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": messageRespon
                });
            }

        } else {


            await this.userbankaccountsService.updateactivetrue(idakun);
            let data = await this.userbankaccountsService.findOneid(idakun);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
            // throw new BadRequestException("account number already exists..!");
        }

    }

    @UseGuards(JwtAuthGuard)
    @Post('api/userbankaccounts/v2')
    async create2(@Res() res, @Body() CreateUserbankaccountsDto: CreateUserbankaccountsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var email = null;
        var noRek = null;
        var bankcode = null;
        var nama = null;
        var idbank = null;
        var datamediaprof = null;
        var datarekkembar = null;
        var namamediaprof = null;
        var language = null;
        var messageRespon = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["language"] !== undefined) {
            language = request_json["language"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        if (request_json["noRek"] !== undefined) {
            noRek = request_json["noRek"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["nama"] !== undefined) {
            nama = request_json["nama"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var ubasic = await this.basic2SS.findBymail(email);

        var iduser = ubasic._id;
        if (ubasic.isIdVerified == false) {
            throw new BadRequestException("Maaf Silahkan lakukan KYC dahulu !");
        }
        else {
            var listkyc = ubasic.kyc;
            if (listkyc.length != 0) {
                for (var loopKyc = 0; loopKyc < listkyc.length; loopKyc++) {
                    if (listkyc[loopKyc].status == "DISETUJUI" || listkyc[loopKyc].status == "FINISH") {
                        namamediaprof = listkyc[loopKyc].nama.toLowerCase();
                        break;
                    }
                    else if (listkyc[loopKyc].kycHandle.length != 0) {
                        var listtempKYC = listkyc[loopKyc].kycHandle;
                        for (var loopDalam = 0; loopDalam < listtempKYC.length; loopDalam++) {
                            if (listtempKYC[loopDalam].status == "FINISH") {
                                try {
                                    namamediaprof = listtempKYC[loopDalam].nama.toLowerCase();
                                }
                                catch (e) {
                                    namamediaprof = listkyc[loopKyc].nama.toLowerCase();
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (language === "id") {
            messageRespon = "Nama yang Anda masukkan salah, pastikan nama yang Anda masukkan sesuai dengan ID yang terdaftar di Hyppe, nama yang sudah terdaftar adalah " + namamediaprof.toUpperCase();;
        }
        else if (language === "en") {
            messageRespon = "The name you entered is wrong, make sure the name you enter matches the ID registered on Hyppe, the registered name is " + namamediaprof.toUpperCase();;
        }

        var lownama = nama.toLowerCase();
        var idakun = null;
        var databank = null;
        var namabank = "";
        try {
            databank = await this.banksService.findbankcode(bankcode);
            namabank = databank._doc.bankname;
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        try {
            datarekkembar = await this.userbankaccountsService.findnorek(noRek, idbank);
            idakun = datarekkembar._id;
        } catch (e) {
            datarekkembar = null;
        }

        if (datarekkembar === null) {

            if (lownama === namamediaprof) {
                try {
                    var mongo = require('mongoose');
                    CreateUserbankaccountsDto.userId = new mongo.Types.ObjectId(iduser.toString());
                    CreateUserbankaccountsDto.noRek = noRek;
                    CreateUserbankaccountsDto.idBank = idbank;
                    CreateUserbankaccountsDto.createdAt = dt.toISOString();
                    CreateUserbankaccountsDto.updatedAt = dt.toISOString();
                    CreateUserbankaccountsDto.active = true;
                    let data = null;

                    data = await this.userbankaccountsService.create(CreateUserbankaccountsDto);

                    return res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                } catch (e) {
                    return res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "message": messagesEror
                    });
                }
            } else {
                return res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": messageRespon
                });
            }

        } else {


            await this.userbankaccountsService.updateactivetrue(idakun);
            let data = await this.userbankaccountsService.findOneid(idakun);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
            // throw new BadRequestException("account number already exists..!");
        }

    }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/userbankaccounts/appeal')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 3, }]))
    async upload(
        @UploadedFiles() files1: {
            supportFile?: Express.Multer.File[]
        },

        @Body() CreateUserbankaccountsDto_: CreateUserbankaccountsDto,
        @Headers() headers) {

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        //Var supportFile
        let supportFile_data = null;
        let supportFile_filename = '';
        let supportFile_etx = '';
        let supportFile_mimetype = '';
        let supportFile_name = '';
        let supportFile_filename_new = '';
        let supportFile_local_path = '';
        let supportFile_seaweedfs_path = '';
        var arrayUri = [];
        var arrayTargetUri = [];
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];
        var idBank = null;
        var email = null;
        var iduserbank = null;
        var fullname = null;
        var url_cardPict = null;
        var iduser = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var data = null;
        var datauserbank = null;
        var dataacount = null;

        iduserbank = CreateUserbankaccountsDto_._id;

        var iduserbankacount = mongoose.Types.ObjectId(iduserbank);

        CreateUserbankaccountsDto_.active = true;
        CreateUserbankaccountsDto_.createdAt = dt.toISOString();
        CreateUserbankaccountsDto_.updatedAt = dt.toISOString();
        CreateUserbankaccountsDto_.userHandle = [{
            "reasonId": null,
            "valueReason": "",
            "idUserHandle": null,
            "createdAt": dt.toISOString(),
            "updatedAt": dt.toISOString(),
            "status": "BARU"
        }];

        var paths = iduserbank;
        var mongoose_gen_meida = paths;

        try {
            datauserbank = await this.userbankaccountsService.findemail(iduserbankacount);
        } catch (e) {
            datauserbank = null;
        }

        if (datauserbank !== undefined || datauserbank !== null) {
            email = datauserbank[0].email;
            fullname = datauserbank[0].fullName;
            iduser = datauserbank[0].iduser.toString();

            //Ceck supportFile
            if (files1.supportFile != undefined) {
                var countfile = files1.supportFile.length;

                for (var i = 0; i < countfile; i++) {
                    var FormData_ = new FormData();
                    supportFile_data = files1.supportFile[i];
                    supportFile_filename = files1.supportFile[i].originalname;
                    supportFile_etx = '.jpeg';
                    supportFile_filename_new = iduserbank + '_000' + (i + 1) + supportFile_etx;
                    supportFile_mimetype = files1.supportFile[i].mimetype;

                    var result = await this.ossService.uploadFile(files1.supportFile[i], iduser.toString() + "/akunbank/supportfile/" + supportFile_filename_new);
                    console.log(result)
                    if (result != undefined) {
                        if (result.res != undefined) {
                            if (result.res.statusCode != undefined) {
                                if (result.res.statusCode == 200) {
                                    url_cardPict = result.res.requestUrls[0];
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed supportfile failed upload',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed supportfile failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed supportfile failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed supportfile failed upload',
                        );
                    }
                    var pathnew = iduser.toString() + '/akunbank/supportfile/' + supportFile_filename_new;
                    var pathnew2 = '/akunbank/supportfile/' + supportFile_filename_new;

                    arrayUri.push(pathnew);
                    arrayTargetUri.push(pathnew2);
                    arrayName.push(supportFile_filename);
                    arraySuri.push(url_cardPict);
                    arraySname.push(supportFile_filename);

                }

                CreateUserbankaccountsDto_.mediaSupportType = 'supportfile';
                CreateUserbankaccountsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
                CreateUserbankaccountsDto_.mediaSupportUri = arrayUri;
                CreateUserbankaccountsDto_.SupportUploadSource = "OSS";
                CreateUserbankaccountsDto_.SupportOriginalName = arrayName;
                CreateUserbankaccountsDto_.SupportfsSourceUri = arraySuri;
                CreateUserbankaccountsDto_.SupportfsSourceName = arraySname;
                CreateUserbankaccountsDto_.SupportfsTargetUri = arrayTargetUri;
                CreateUserbankaccountsDto_.SupportmediaMime = supportFile_mimetype;

                data = await this.userbankaccountsService.update(iduserbank, CreateUserbankaccountsDto_);

                try {
                    dataacount = await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "REQUEST_APPEAL", "BANK", fullname);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        e.toString(),
                    );
                }
                return {
                    "response_code": 202,
                    "data": data,
                    "messages": {
                        "info": [
                            "Success Upload"
                        ]
                    }
                };

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );
            }

        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed data is not found',
            );
        }


    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/userbankaccounts/v3')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 3, }]))
    async create3(
        @UploadedFiles() files1: {
            supportFile?: Express.Multer.File[]
        },

        @Body() CreateUserbankaccountsDto_,
        @Headers() headers) {

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        //Var supportFile
        var noRek = null;
        var bankcode = null;
        var nama = null;
        var idbank = null;
        var datamediaprof = null;
        var datarekkembar = null;
        var namamediaprof = null;
        var language = null;
        var messageRespon = null;
        let supportFile_data = null;
        let supportFile_filename = '';
        let supportFile_etx = '';
        let supportFile_mimetype = '';
        let supportFile_name = '';
        let supportFile_filename_new = '';
        let supportFile_local_path = '';
        let supportFile_seaweedfs_path = '';
        var arrayUri = [];
        var arrayTargetUri = [];
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];
        var idBank = null;
        var email = null;
        var iduserbank = null;
        var fullname = null;
        var url_cardPict = null;
        var iduser = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var data = null;
        var user;
        var datauserbank = null;
        var dataacount = null;

        // iduserbank = CreateUserbankaccountsDto_._id;

        //Step 1
        if (CreateUserbankaccountsDto_.email !== undefined) {
            email = CreateUserbankaccountsDto_.email;
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (CreateUserbankaccountsDto_.language !== undefined) {
            language = CreateUserbankaccountsDto_.language;
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        if (CreateUserbankaccountsDto_.noRek !== undefined) {
            noRek = CreateUserbankaccountsDto_.noRek;
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (CreateUserbankaccountsDto_.bankcode !== undefined) {
            bankcode = CreateUserbankaccountsDto_.bankcode;
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (CreateUserbankaccountsDto_.nama !== undefined) {
            nama = CreateUserbankaccountsDto_.nama;
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var ubasic = await this.basic2SS.findBymail(email);
        if (!ubasic) {
            throw new BadRequestException("User data not found");
        }

        iduser = ubasic._id;
        if (ubasic.isIdVerified == false) {
            throw new BadRequestException("Maaf Silahkan lakukan KYC dahulu !");
        }
        else {
            var listkyc = ubasic.kyc;
            if (listkyc.length != 0) {
                for (var loopKyc = 0; loopKyc < listkyc.length; loopKyc++) {
                    if (listkyc[loopKyc].status == "DISETUJUI" || listkyc[loopKyc].status == "FINISH") {
                        namamediaprof = listkyc[loopKyc].nama.toLowerCase();
                        break;
                    }
                    else if (listkyc[loopKyc].kycHandle.length != 0) {
                        var listtempKYC = listkyc[loopKyc].kycHandle;
                        for (var loopDalam = 0; loopDalam < listtempKYC.length; loopDalam++) {
                            if (listtempKYC[loopDalam].status == "FINISH") {
                                try {
                                    namamediaprof = listtempKYC[loopDalam].nama.toLowerCase();
                                }
                                catch (e) {
                                    namamediaprof = listkyc[loopKyc].nama.toLowerCase();
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        // if (language === "id") {
        //     messageRespon = "Nama yang Anda masukkan salah, pastikan nama yang Anda masukkan sesuai dengan ID yang terdaftar di Hyppe, nama yang sudah terdaftar adalah " + namamediaprof.toUpperCase();
        //     throw new BadRequestException(messageRespon);
        // }
        // else if (language === "en") {
        //     messageRespon = "The name you entered is wrong, make sure the name you enter matches the ID registered on Hyppe, the registered name is " + namamediaprof.toUpperCase();
        //     throw new BadRequestException(messageRespon);
        // }

        var lownama = nama.toLowerCase();
        var idakun = null;
        var databank = null;
        var namabank = "";
        try {
            databank = await this.banksService.findbankcode(bankcode);
            namabank = databank._doc.bankname;
            idBank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        try {
            datarekkembar = await this.userbankaccountsService.findnorek(noRek, idBank);
            idakun = datarekkembar._id;
        } catch (e) {
            datarekkembar = null;
        }

        if (datarekkembar === null) {

            // if (lownama === namamediaprof) {

            // } else {
            //     return res.status(HttpStatus.OK).json({
            //         response_code: 202,
            //         "message": messageRespon
            //     });
            // }
            try {
                var mongo = require('mongoose');
                CreateUserbankaccountsDto_.userId = new mongo.Types.ObjectId(iduser.toString());
                // CreateUserbankaccountsDto.noRek = noRek;
                CreateUserbankaccountsDto_.idBank = idBank;
                CreateUserbankaccountsDto_.createdAt = dt.toISOString();
                CreateUserbankaccountsDto_.updatedAt = dt.toISOString();
                CreateUserbankaccountsDto_.active = true;

                user = await this.userbankaccountsService.create(CreateUserbankaccountsDto_);

                // return res.status(HttpStatus.OK).json({
                //     response_code: 202,
                //     "data": data,
                //     "message": messages
                // });
            } catch (e) {
                // return res.status(HttpStatus.OK).json({
                //     response_code: 202,
                //     "message": messagesEror
                // });
            }

        } else {


            await this.userbankaccountsService.updateactivetrue(idakun);
            user = await this.userbankaccountsService.findOneid(idakun);
            // return res.status(HttpStatus.OK).json({
            //     response_code: 202,
            //     "data": data,
            //     "message": messages
            // });
            // throw new BadRequestException("account number already exists..!");
        }
        //Step 2
        iduserbank = user._id.toString()
        var iduserbankacount = user._id;

        CreateUserbankaccountsDto_.active = true;
        // CreateUserbankaccountsDto_.createdAt = dt.toISOString();
        // CreateUserbankaccountsDto_.updatedAt = dt.toISOString();
        CreateUserbankaccountsDto_.userHandle = [{
            "reasonId": null,
            "valueReason": "",
            "idUserHandle": null,
            "createdAt": dt.toISOString(),
            "updatedAt": dt.toISOString(),
            "status": "BARU"
        }];

        var paths = iduserbank;
        var mongoose_gen_meida = paths;

        try {
            datauserbank = await this.userbankaccountsService.findemail2(iduserbankacount);
        } catch (e) {
            datauserbank = null;
        }

        email = datauserbank[0].email;
        fullname = datauserbank[0].fullName;
        iduser = datauserbank[0].iduser.toString();

        //Ceck supportFile
        if (files1.supportFile != undefined) {
            var countfile = files1.supportFile.length;

            for (var i = 0; i < countfile; i++) {
                var FormData_ = new FormData();
                supportFile_data = files1.supportFile[i];
                supportFile_filename = files1.supportFile[i].originalname;
                supportFile_etx = '.jpeg';
                supportFile_filename_new = iduserbank + '_000' + (i + 1) + supportFile_etx;
                supportFile_mimetype = files1.supportFile[i].mimetype;

                var result = await this.ossService.uploadFile(files1.supportFile[i], iduser.toString() + "/akunbank/supportfile/" + supportFile_filename_new);
                console.log(result)
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_cardPict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed supportfile failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed supportfile failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed supportfile failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed supportfile failed upload',
                    );
                }
                var pathnew = iduser.toString() + '/akunbank/supportfile/' + supportFile_filename_new;
                var pathnew2 = '/akunbank/supportfile/' + supportFile_filename_new;

                arrayUri.push(pathnew);
                arrayTargetUri.push(pathnew2);
                arrayName.push(supportFile_filename);
                arraySuri.push(url_cardPict);
                arraySname.push(supportFile_filename);

            }

            CreateUserbankaccountsDto_.mediaSupportType = 'supportfile';
            CreateUserbankaccountsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
            CreateUserbankaccountsDto_.mediaSupportUri = arrayUri;
            CreateUserbankaccountsDto_.SupportUploadSource = "OSS";
            CreateUserbankaccountsDto_.SupportOriginalName = arrayName;
            CreateUserbankaccountsDto_.SupportfsSourceUri = arraySuri;
            CreateUserbankaccountsDto_.SupportfsSourceName = arraySname;
            CreateUserbankaccountsDto_.SupportfsTargetUri = arrayTargetUri;
            CreateUserbankaccountsDto_.SupportmediaMime = supportFile_mimetype;
            CreateUserbankaccountsDto_.status = 'NEW';

            data = await this.userbankaccountsService.update(iduserbank, CreateUserbankaccountsDto_);

            try {
                this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "CREATE_APPEAL", "BANK", fullname);
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    e.toString(),
                );
            }
            return {
                "response_code": 202,
                "data": data,
                "messages": {
                    "info": [
                        "Successfully created"
                    ]
                }
            };

        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed supportFile is required',
            );
        }


    }

    @UseGuards(JwtAuthGuard)
    @Post('api/userbankaccounts/approval')
    async reportHandleAproval(@Req() request) {
        var id = null;

        var disetujui = null;
        var reason = null;
        var reasonId = null;
        var iduserhandle = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["disetujui"] !== undefined) {
            disetujui = request_json["disetujui"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["iduserhandle"] !== undefined) {
            iduserhandle = request_json["iduserhandle"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        reason = request_json["reason"];
        reasonId = request_json["reasonId"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idreason = mongoose.Types.ObjectId(reasonId);
        var idakun = mongoose.Types.ObjectId(id);
        var iduser = mongoose.Types.ObjectId(iduserhandle);



        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var userHandle = [];
        var datauserbank = null;
        var email = null;


        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        try {
            datauserbank = await this.userbankaccountsService.findemail(idakun);
        } catch (e) {
            datauserbank = null;
        }



        if (datauserbank !== undefined || datauserbank !== null) {
            email = datauserbank[0].email;

            try {
                datacontent = await this.userbankaccountsService.findOneid(idakun);
                userHandle = datacontent._doc.userHandle;

            } catch (e) {
                datacontent = null;
                userHandle = [];
            }
            if (disetujui === true) {


                if (userHandle.length > 0) {
                    await this.userbankaccountsService.updateDisetujui(idakun, "", dt.toISOString(), null, iduser);

                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "NOTSUSPENDED_APPEAL", "BANK", "");
                }
                else {

                    objreporthandle = {

                        "reasonId": null,
                        "valueReason": "",
                        "idUserHandle": iduser,
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DISETUJUI"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.userbankaccountsService.updateDisetujuiEmpty(idakun, dt.toISOString(), arrayreportedHandle);
                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "NOTSUSPENDED_APPEAL", "BANK", "");
                }


            }

            else {

                if (userHandle.length > 0) {
                    await this.userbankaccountsService.updateDitolak(idakun, reason, dt.toISOString(), idreason, iduser);
                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "SUSPENDED_APPEAL", "BANK", "");

                } else {
                    objreporthandle = {

                        "reasonId": idreason,
                        "valueReason": "",
                        "idUserHandle": iduser,
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITOLAK"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.userbankaccountsService.updateDitolakEmpty(idakun, dt.toISOString(), arrayreportedHandle);
                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "SUSPENDED_APPEAL", "BANK", "");

                }


            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed data is not found',
            );
        }
        return { response_code: 202, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Put('api/userbankaccounts/:id')
    async update(@Res() res, @Param('id') id: string, @Body() createUserbankaccountsDto: CreateUserbankaccountsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.userbankaccountsService.update(id, createUserbankaccountsDto);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }


    @Post('api/userbankaccounts/byuser')
    @UseGuards(JwtAuthGuard)
    async contentuser(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var datauserbasicsService = null;
        var iduser = null;
        //Ceck User Userbasics
        try {
            datauserbasicsService = await this.userbasicsService.findOne(email);
        } catch (e) {
            throw new BadRequestException("User not found");
        }
        const messages = {
            "info": ["The process successful"],
        };

        iduser = mongoose.Types.ObjectId(datauserbasicsService._id);
        let data = await this.userbankaccountsService.findOneUser(iduser);

        return { response_code: 202, data, messages };
    }

    @Post('api/userbankaccounts/byuser/v2')
    @UseGuards(JwtAuthGuard)
    async contentuser2(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var datauserbasicsService = null;
        var iduser = null;
        //Ceck User Userbasics
        try {
            datauserbasicsService = await this.basic2SS.findbyemail(email);
        } catch (e) {
            throw new BadRequestException("User not found");
        }
        const messages = {
            "info": ["The process successful"],
        };

        iduser = mongoose.Types.ObjectId(datauserbasicsService._id);
        let data = await this.userbankaccountsService.findOneUser(iduser);

        return { response_code: 202, data, messages };
    }

    @Post('api/userbankaccounts/delete')
    @UseGuards(JwtAuthGuard)
    async delete(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var id = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The delete successful"],
        };

        var _id = mongoose.Types.ObjectId(id);
        let data = await this.userbankaccountsService.updateactive(_id);

        return { response_code: 202, messages };
    }

    @Post('api/userbankaccounts/getAccountList')
    @UseGuards(JwtAuthGuard)
    async getAccountList(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var statusLast = [];
        var limit = null;
        var totalpage = 0;
        var totalallrow = 0;
        var totalsearch = 0;
        var total = 0;
        var descending = null;
        var namapemohon = null;
        var query = null;
        var data = null;
        var datasearch = null;
        var dataall = null;
        var startdate = null;
        var enddate = null;

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        namapemohon = request_json["namapemohon"];
        statusLast = request_json["statusLast"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        descending = request_json["descending"];
        try {
            query = await this.userbankaccountsService.getlistappeal(startdate, enddate, namapemohon, statusLast, descending, page, limit);
            data = query;
        } catch (e) {
            query = null;
            data = [];
        }

        try {
            total = query.length;
        } catch (e) {
            total = 0;
        }

        try {
            datasearch = await this.userbankaccountsService.getlistappealcount(startdate, enddate, namapemohon, statusLast);
            totalsearch = datasearch[0].totalpost;
        } catch (e) {
            totalsearch = 0;
        }

        try {
            dataall = await this.userbankaccountsService.getlistappealcount(undefined, undefined, undefined, undefined);
            totalallrow = dataall[0].totalpost;

        } catch (e) {
            totalallrow = 0;
        }


        var tpage = null;
        var tpage2 = null;

        tpage2 = (totalsearch / limit).toFixed(0);
        tpage = (totalsearch % limit);
        if (tpage > 0 && tpage < 5) {
            totalpage = parseInt(tpage2) + 1;

        } else {
            totalpage = parseInt(tpage2);
        }
        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }

    @Post('api/userbankaccounts/getAccountList/v2')
    @UseGuards(JwtAuthGuard)
    async getAccountList2(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var statusLast = [];
        var limit = null;
        var totalpage = 0;
        var totalallrow = 0;
        var totalsearch = 0;
        var total = 0;
        var descending = null;
        var namapemohon = null;
        var query = null;
        var data = null;
        var datasearch = null;
        var dataall = null;
        var startdate = null;
        var enddate = null;

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        namapemohon = request_json["namapemohon"];
        statusLast = request_json["statusLast"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        descending = request_json["descending"];
        try {
            query = await this.userbankaccountsService.getlistappeal2(startdate, enddate, namapemohon, statusLast, descending, page, limit);
            data = query;
        } catch (e) {
            query = null;
            data = [];
        }

        try {
            total = query.length;
        } catch (e) {
            total = 0;
        }

        try {
            datasearch = await this.userbankaccountsService.getlistappealcount2(startdate, enddate, namapemohon, statusLast);
            totalsearch = datasearch[0].totalpost;
        } catch (e) {
            totalsearch = 0;
        }

        try {
            dataall = await this.userbankaccountsService.getlistappealcount2(undefined, undefined, undefined, undefined);
            totalallrow = dataall[0].totalpost;

        } catch (e) {
            totalallrow = 0;
        }


        var tpage = null;
        var tpage2 = null;

        tpage2 = (totalsearch / limit).toFixed(0);
        tpage = (totalsearch % limit);
        if (tpage > 0 && tpage < 5) {
            totalpage = parseInt(tpage2) + 1;

        } else {
            totalpage = parseInt(tpage2);
        }
        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }

    @Get('api/userbankaccounts/getAccountList/:id')
    @UseGuards(JwtAuthGuard)
    async getDetailAccountBank(@Param('id') id: string) {
        var data = null;

        const messages = {
            "info": ["The process successful"],
        };

        data = await this.userbankaccountsService.getDetailAccountBankById(id);


        return { response_code: 202, messages, data };
    }
    @Get('api/userbankaccounts/getAccountList/v2/:id')
    @UseGuards(JwtAuthGuard)
    async getDetailAccountBank2(@Param('id') id: string) {
        var data = null;

        const messages = {
            "info": ["The process successful"],
        };

        data = await this.userbankaccountsService.getDetailAccountBankById2(id);


        return { response_code: 202, messages, data };
    }

    async sendReportAppealBankFCM(email: string, name: string, event: string, type: string, fullname: string) {
        var Templates_ = new TemplatesRepo();
        var repbodyin = null;
        var repbodyen = null;
        Templates_ = await this.utilsService.getTemplateAppealBank(name, event, 'NOTIFICATION', type);

        var titlein = Templates_.subject_id.toString();
        var titleen = Templates_.subject.toString();



        var bodyin_get = Templates_.body_detail_id.toString();
        var bodyen_get = Templates_.body_detail.toString();

        if (event === "REQUEST_APPEAL" && type === "BANK") {
            repbodyin = bodyin_get.replace("${user_name}", fullname);
            repbodyen = bodyen_get.replace("${user_name}", fullname);
        } else {
            repbodyin = bodyin_get;
            repbodyen = bodyen_get;
        }

        var eventType = type.toString();
        await this.utilsService.sendFcm(email, titlein, titleen, repbodyin, repbodyen, eventType, event, "", "AKUN BANK", "", "APPEAL");
    }
}
