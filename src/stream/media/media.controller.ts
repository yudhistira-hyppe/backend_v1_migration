import { Body, Controller, Post, UploadedFiles, Logger, Headers, UseInterceptors, Req, BadRequestException, NotAcceptableException, Res, HttpException, HttpStatus, HttpCode, Request, Query, UseGuards, UploadedFile } from "@nestjs/common";
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express/multer";
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { MediaService } from "./media.service";
import { ErrorHandler } from "../../utils/error.handler";
import { SeaweedfsService } from "../seaweedfs/seaweedfs.service";
import { CreateMediaproofpictsDto } from "../../content/mediaproofpicts/dto/create-mediaproofpicts.dto";
import { UtilsService } from "../../utils/utils.service";
import { extname } from "path";
import { diskStorage } from "multer";
import { AwsService } from "../aws/aws.service";
import { UserbasicsService } from "../../trans/userbasics/userbasics.service";
import { MediaproofpictsService } from "../../content/mediaproofpicts/mediaproofpicts.service";
import { MediaprofilepictsService } from "../../content/mediaprofilepicts/mediaprofilepicts.service";
import mongoose from "mongoose";
import { SettingsService } from "../../trans/settings/settings.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { UserauthsService } from "../../trans/userauths/userauths.service";
import { CreateMediaprofilepictsDto } from "src/content/mediaprofilepicts/dto/create-mediaprofilepicts.dto";
import { Mediaprofilepicts } from "src/content/mediaprofilepicts/schemas/mediaprofilepicts.schema";
import { ContenteventsService } from "../../content/contentevents/contentevents.service";
import { OssService } from "../oss/oss.service";
import { FriendListService } from "../../content/friend_list/friend_list.service";
import { ConfigService } from "@nestjs/config";
import { createWriteStream } from "fs";
import { UserbasicnewService } from "src/trans/userbasicnew/userbasicnew.service";
import { CreateuserbasicnewDto } from "src/trans/userbasicnew/dto/Createuserbasicnew-dto";
import { ReferralService } from "src/trans/referral/referral.service";
import { CreateContenteventsDto } from "src/content/contentevents/dto/create-contentevents.dto";
import { InsightsService } from "src/content/insights/insights.service";
import { CreateReferralDto } from "src/trans/referral/dto/create-referral.dto";
import { ChallengeService } from "src/trans/challenge/challenge.service";
import { UserchallengesService } from "src/trans/userchallenges/userchallenges.service";

//import FormData from "form-data";
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");
const sharp = require('sharp');
const vision = require("@google-cloud/vision");

export const multerConfig = {
    //dest: process.env.PATH_UPLOAD,
    dest: './temp/'
};

export const multerOptions = {
    // limits: {
    //     fileSize: +process.env.MAX_FILE_SIZE,
    // },
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
export class MediaController {

    private readonly logger = new Logger(MediaController.name);

    constructor(
        private readonly contenteventsService: ContenteventsService,
        private readonly mediaService: MediaService,
        private readonly friendListService: FriendListService,
        private readonly errorHandler: ErrorHandler,
        private readonly awsService: AwsService,
        private readonly ossService: OssService,
        private readonly utilsService: UtilsService,
        private readonly settingsService: SettingsService,
        private readonly mediaproofpictsService: MediaproofpictsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly userauthsService: UserauthsService,
        private readonly seaweedfsService: SeaweedfsService,
        private readonly basic2SS: UserbasicnewService,
        private readonly referralSS: ReferralService,
        private readonly insightsService: InsightsService,
        private readonly challengeService: ChallengeService,
        private readonly userchallengesService: UserchallengesService,
        private readonly configService: ConfigService) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/gettext')
    @UseInterceptors(FileInterceptor('cardPict'))
    async uploadGetText(@UploadedFile() file: Express.Multer.File, @Body() body,) {
        if (body.fullName == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Param fullName is required',
            );
        }
        var getSetting = await this.utilsService.getSetting_("642e3ded2d0a0000b8000b02");
        var fullName = body.fullName.toLowerCase();
        var fullNameSplit = fullName.split(" ");

        var cardPictNumber_ = "";
        var persetaseCardNumber_ = 0;
        var CardNumber_ = false;
        var cardPictName_ = "";
        var persetaseCardName_ = 0;
        var CardName_ = false;
        var StatusKYC_ = false;

        if (file != undefined) {
            var originalname = file.originalname;
            var ext = originalname.split(".");
            var generateFileName = new mongoose.Types.ObjectId();
            var pathSave = this.configService.get("PATH_UPLOAD") + generateFileName.toString() + "." + ext[1];

            const ws = createWriteStream(pathSave);
            ws.write(file.buffer);
            ws.close();
            await new Promise<void>((resolve, reject) => {
                ws.on('finish', async () => {
                    const vision = require('@google-cloud/vision');
                    const client = new vision.ImageAnnotatorClient({
                        keyFilename: this.configService.get("GOOGLE_APPLICATION_CREDENTIALS")
                    });
                    const [result] = await client.textDetection(pathSave);
                    const labels = result.textAnnotations;
                    if (fs.existsSync(pathSave)) {
                        fs.unlink(pathSave, (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log("Delete File successfully.");
                        });
                    }
                    var k = 0;
                    await labels.forEach((labels_) => {
                        var description_ = labels_.description;
                        if (description_.length == 16) {
                            if (/[0-9]/.test(description_)) {
                                cardPictNumber_ = description_;
                                persetaseCardNumber_ = 100;
                                CardNumber_ = true;
                            }
                        }
                        if (k == 0) {
                            var search = new RegExp(body.fullName.toLowerCase(), 'i');
                            var separateLines = description_.split(/\r?\n|\r|\n/g);
                            let searchName = separateLines.filter(item => search.test(item));
                            if (searchName.length > 0) {
                                cardPictName_ = searchName[0];
                                persetaseCardName_ = 100;
                                CardName_ = true;
                            } else {
                                var nama_ceck = fullName
                                for (var z = fullNameSplit.length; z > 0; z--) {
                                    if (fullNameSplit.length > 1) {
                                        if (z >= 1) {
                                            var namaReplace = nama_ceck.replace(fullNameSplit[z - 1].toLowerCase(), "");
                                            var search_1 = new RegExp(namaReplace.toLowerCase(), 'i');
                                            let searchName_1 = separateLines.filter(item => search_1.test(item));
                                            if (searchName_1.length > 0) {
                                                cardPictName_ = searchName_1[0];
                                                persetaseCardName_ = ((z - 1) / fullNameSplit.length) * 100;
                                                if (persetaseCardName_ >= getSetting) {
                                                    CardName_ = true;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        k++;
                    });
                    console.log(cardPictNumber_);
                    console.log(cardPictName_);

                    resolve();
                }).on('error', err => {
                    reject(err);
                });

            });
            if (CardNumber_ && CardName_) {
                StatusKYC_ = true;
            }
            return {
                response_code: 202,
                data: {
                    cardPictNumber: cardPictNumber_,
                    persetaseCardNumber: persetaseCardNumber_,
                    CardNumber: CardNumber_,
                    cardPictName: cardPictName_,
                    persetaseCardName: persetaseCardName_,
                    CardName: CardName_,
                    StatusKYC: StatusKYC_,
                },
                messages: {
                    info: ['Successful'],
                },
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Param cardPict is required',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/posts/v1/profilepicture')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'profilePict', maxCount: 1 }, { name: 'proofPict', maxCount: 1, }], multerOptions))
    async uploadcomparing(
        @UploadedFiles() files: {
            profilePict?: Express.Multer.File[],
            proofPict?: Express.Multer.File[]
        },
        @Body() request,
        @Headers() headers) {

        this.logger.log("uploadcomparing >>> start");

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed header email is required',
            );
        }
        if (request.email == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param mail is required',
            );
        }

        //Var profilePict
        var profilePict_data = null;
        var profilePict_filename = '';
        var profilePict_etx = '';
        let profilePict_mimetype = '';
        var profilePict_name = '';
        var profilePict_filename_new = '';
        let profilePict_local_path = '';
        let profilePict_seaweedfs_path = '';

        //Var proofPict
        var proofPict_data = null;
        var proofPict_filename = '';
        var proofPict_etx = '';
        let proofPict_mimetype = '';
        var proofPict_name = '';
        var proofPict_filename_new = '';
        let proofPict_local_path = '';
        let proofPict_seaweedfs_path = '';

        //Var bitmap
        let bitmap_profilePict = null;
        let bitmap_proofPict = null;

        //Var buffer
        let buffer_profilePict = null;
        let buffer_proofPict = null;

        var id_mediaprofilepicts = null;
        var mongoose_gen_media = null;

        var request_email = null;
        var request_verifyID = null;

        request_email = request.email;
        request_verifyID = request.verifyID;

        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        let isNew = true;
        if (await this.utilsService.ceckData(datauserbasicsService)) {

            /*
            if (datauserbasicsService.profilePict != undefined) {
                var profilePict_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
                id_mediaprofilepicts = profilePict_json.$id;
                //Ceck User profilePict
                const datamediaprofilepictsService = await this.mediaprofilepictsService.findOne(
                    id_mediaprofilepicts,
                );

                if (await this.utilsService.ceckData(datamediaprofilepictsService)) {
                    mongoose_gen_media = datamediaprofilepictsService.mediaBasePath.toString().replace("/profilepict", "");
                } else {
                    mongoose_gen_media = new mongoose.Types.ObjectId();
                }
                isNew = false;
            } else {
                id_mediaprofilepicts = await this.utilsService.generateId();
                mongoose_gen_media = new mongoose.Types.ObjectId();
            }
            */

            id_mediaprofilepicts = await this.utilsService.generateId();
            mongoose_gen_media = new mongoose.Types.ObjectId();
            //Ceck cardPict
            if (files.profilePict != undefined) {
                var FormData_ = new FormData();
                profilePict_data = files.profilePict[0];
                profilePict_mimetype = files.profilePict[0].mimetype;
                profilePict_filename = files.profilePict[0].filename;
                //profilePict_etx = profilePict_filename.substring(profilePict_filename.lastIndexOf('.') + 1, profilePict_filename.length);
                profilePict_etx = 'jpeg';
                profilePict_name = profilePict_filename.substring(0, profilePict_filename.lastIndexOf('.'));

                let rand = Math.floor(Math.random() * 1000) + 1;
                //New Name file cardPict
                profilePict_filename_new = id_mediaprofilepicts + '_' + rand + '.' + profilePict_etx;
                //Rename Name file cardPict
                fs.renameSync('./temp/' + profilePict_filename, './temp/' + profilePict_filename_new);
                //Local path
                profilePict_local_path = './temp/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new;
                //SeaweedFs path
                profilePict_seaweedfs_path = '/' + mongoose_gen_media.toString() + '/profilepict/';

                isNew = true;

                if (isNew) {
                    //Create Folder Id
                    if (await this.utilsService.createFolder('./temp/', mongoose_gen_media.toString())) {
                        //Create folder proofpict
                        if (await this.utilsService.createFolder('./temp/' + mongoose_gen_media + '/', 'profilepict')) {
                            //Move File
                            await fse.move('./temp/' + profilePict_filename_new, './temp/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new);
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed create folder proofpict',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder ' + mongoose_gen_media.toString(),
                        );
                    }
                } else {
                    await fse.move('./temp/' + profilePict_filename_new, './temp/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new);
                }


                //Upload Seaweedfs
                try {
                    FormData_.append('proofpict', fs.createReadStream(path.resolve(profilePict_local_path)));
                    await this.seaweedfsService.write(profilePict_seaweedfs_path, FormData_);

                    if (isNew) {
                        let mp = new Mediaprofilepicts();
                        mp._id = id_mediaprofilepicts;
                        mp.mediaID = id_mediaprofilepicts;
                        mp.active = true;
                        mp.createdAt = await this.utilsService.getDateTimeString();
                        mp.updatedAt = await this.utilsService.getDateTimeString();
                        mp.fsSourceName = id_mediaprofilepicts + '.' + profilePict_etx;
                        mp.fsSourceUri = '/localrepo/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new;
                        mp.fsTargetUri = '/localrepo/' + mongoose_gen_media.toString() + '/profilepict/' + profilePict_filename_new;
                        mp.mediaBasePath = mongoose_gen_media + '/profilepict';
                        mp.mediaMime = "image/jpg";
                        mp.mediaType = "image";
                        mp.mediaUri = profilePict_filename_new;
                        mp.originalName = profilePict_filename;
                        mp.postType = "profilepict";
                        mp._class = 'io.melody.hyppe.content.domain.MediaProfilePict';

                        let nmp = await this.mediaprofilepictsService.create(mp);

                        var usp = { "$ref": "mediaprofilepicts", "$id": nmp._id, "$db": "hyppe_content_db" };
                        datauserbasicsService.profilePict = usp;
                        await this.userbasicsService.createV2(datauserbasicsService);

                    }
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed proofpict failed upload seaweedfs',
                    );
                }

                //Delete directory recursively
                fs.rm('./temp/' + mongoose_gen_media.toString(), { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }
                });

                return {
                    "response_code": 202,
                    "messages": {
                        "info": [
                            "Update Profile interest successful"
                        ]
                    }
                };
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/verificationid')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }]))
    async uploadcomparingid(
        @UploadedFiles() files: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[]
        },
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        if (CreateMediaproofpictsDto_.idcardnumber == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed idcardnumber is required',
            );
        } else {
            if (CreateMediaproofpictsDto_.idcardnumber.length < 16) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed idcardnumber must length 16 digit',
                );
            }
        }
        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }
        var listAddKyc = [];
        //Var cardPict
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_filename_new = '';
        let cardPict_filename_new_thum = '';
        let url_cardPict = '';
        let url_cardPict_thum = '';

        //Var selfiepict
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_filename_new = '';
        let selfiepict_filename_new_thum = '';
        let url_selfiepict = '';
        let url_selfiepict_thum = '';

        //Var buffer
        let buffer_cardPict = null;
        let buffer_selfiepict = null;

        //Var response facedetect
        let face_detect_cardPict = null;
        let face_detect_selfiepict = null;

        let id_mediaproofpicts_ = null;
        let iduserbasic = null;
        let emailuserbasic = null;

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();

        //Get Setting Similarity
        var Similarity = await (await this.settingsService.findOneByJenis('Similarity')).value;

        //Ceck User Userbasics
        const datauserbasicsService = await this.basic2SS.findBymail(
            headers['x-auth-user'],
        );
        var re = /(?:\.([^.]+))?$/;

        if (await this.utilsService.ceckData(datauserbasicsService)) {
            emailuserbasic = datauserbasicsService.email;
            iduserbasic = datauserbasicsService._id.toString();

            //Ceck cardPict
            if (files.cardPict != undefined) {
                cardPict_filename = files.cardPict[0].originalname;
                //cardPict_etx = cardPict_filename.substring(cardPict_filename.lastIndexOf('.'), cardPict_filename.length);
                // var textSplit = cardPict_filename.split('.');
                // if (textSplit.length == 2) {
                //     cardPict_etx = textSplit[1];
                // } else {
                //     cardPict_etx = textSplit[textSplit.length - 1];
                // }
                cardPict_etx = '.jpeg';
                cardPict_filename_new = iduserbasic + cardPict_etx;
                cardPict_filename_new_thum = iduserbasic + "_thum" + cardPict_etx;
                cardPict_mimetype = files.cardPict[0].mimetype;

                var result = await this.ossService.uploadFile(files.cardPict[0], iduserbasic + "/kyc/proofpict/" + cardPict_filename_new);
                console.log("RESULT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_cardPict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                var cardPict_thum = await this.generate_thumnail(files.cardPict[0], "jpeg");
                var result_thum = await this.ossService.uploadFileBuffer(cardPict_thum, iduserbasic + "/kyc/proofpict/" + cardPict_filename_new_thum);
                if (result_thum != undefined) {
                    if (result_thum.res != undefined) {
                        if (result_thum.res.statusCode != undefined) {
                            if (result_thum.res.statusCode == 200) {
                                url_cardPict_thum = result_thum.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                //AWS face detect proofpict
                try {
                    //Create Buffer
                    buffer_cardPict = await this.ossService.readFileBase64(iduserbasic + "/kyc/proofpict/" + cardPict_filename_new);
                    var data_cardPict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_cardPict,
                        }
                    };

                    //AWS face detect 
                    face_detect_cardPict = await this.awsService.detect(data_cardPict);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect proofpict ' + err,
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }

            //Ceck selfiepict
            if (files.selfiepict != undefined) {
                selfiepict_filename = files.selfiepict[0].originalname;
                //selfiepict_etx = selfiepict_filename.substring(selfiepict_filename.lastIndexOf('.'), selfiepict_filename.length);
                // var textSplit = selfiepict_filename.split('.');
                // if (textSplit.length == 2) {
                //     selfiepict_etx = textSplit[1];
                // } else {
                //     selfiepict_etx = textSplit[textSplit.length-1];
                // }
                selfiepict_etx = '.jpeg';
                selfiepict_filename_new = iduserbasic + selfiepict_etx;
                selfiepict_filename_new_thum = iduserbasic + "_thum" + selfiepict_etx;
                selfiepict_mimetype = files.selfiepict[0].mimetype;

                var result = await this.ossService.uploadFile(files.selfiepict[0], iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new);
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_selfiepict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                var selfiepict_thum = await this.generate_thumnail(files.selfiepict[0], "jpeg");
                var result_thum = await this.ossService.uploadFileBuffer(selfiepict_thum, iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new_thum);
                if (result_thum != undefined) {
                    if (result_thum.res != undefined) {
                        if (result_thum.res.statusCode != undefined) {
                            if (result_thum.res.statusCode == 200) {
                                url_selfiepict_thum = result_thum.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                //AWS face detect selfiepict
                try {
                    //Create Buffer
                    buffer_selfiepict = await this.ossService.readFileBase64(iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new);

                    var data_selfiepict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_selfiepict,
                        }
                    };
                    //AWS face detect 
                    face_detect_selfiepict = await this.awsService.detect(data_selfiepict);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect selfiepict ' + err,
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed selfiepict is required',
                );
            }

            //Ceck Data user proofPict
            if (datauserbasicsService.proofPict != undefined) {
                //Update proofPict
                try {
                    var proofPict_json = JSON.parse(JSON.stringify(datauserbasicsService.proofPict));
                    var data_mediaproofpicts = await this.mediaproofpictsService.findOne(proofPict_json.$id);
                    id_mediaproofpicts_ = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.mediaType = 'image';

                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;

                    CreateMediaproofpictsDto_.fsSourceUri = url_cardPict;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsTargetUri = url_cardPict;
                    CreateMediaproofpictsDto_.mediaThumBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new_thum;
                    CreateMediaproofpictsDto_.mediaThumUri = url_cardPict_thum;

                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.proofpictUploadSource = "OSS";

                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = iduserbasic + '/kyc/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;

                    CreateMediaproofpictsDto_.SelfiefsSourceUri = url_selfiepict;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = url_selfiepict;
                    CreateMediaproofpictsDto_.SelfiemediaThumBasePath = iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new_thum;
                    CreateMediaproofpictsDto_.SelfiemediaThumUri = url_selfiepict_thum;

                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.SelfieUploadSource = "OSS";

                    CreateMediaproofpictsDto_._class = "io.melody.hyppe.content.domain.MediaProofPict";
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(iduserbasic),
                        $db: "hyppe_trans_db"
                    }
                    await this.mediaproofpictsService.updatebyId(data_mediaproofpicts._id.toString(), CreateMediaproofpictsDto_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed update Mediaproofpicts ' + err,
                    );
                }
            } else {

                try {
                    listAddKyc = datauserbasicsService.listAddKyc;
                } catch (e) {
                    listAddKyc = [];
                }
                if (listAddKyc === null || listAddKyc === undefined) {
                    listAddKyc = [];
                }
                var objkyc = {
                    "mediaID": IdMediaproofpictsDto,
                    "createdAt": current_date
                }
                listAddKyc.push(objkyc);

                //Insert proofPict
                try {
                    id_mediaproofpicts_ = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaType = 'image';

                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;

                    CreateMediaproofpictsDto_.fsSourceUri = url_cardPict;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsTargetUri = url_cardPict;

                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.proofpictUploadSource = "OSS";

                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = iduserbasic + '/kyc/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;

                    CreateMediaproofpictsDto_.SelfiefsSourceUri = url_selfiepict;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = url_selfiepict;

                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.SelfieUploadSource = "OSS";
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(datauserbasicsService._id.toString()),
                        $db: "hyppe_trans_db"
                    }
                    await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                    await this.userbasicsService.updatebyEmail(datauserbasicsService.email.toString(), {
                        idProofName: CreateMediaproofpictsDto_.nama,
                        idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                        idProofStatus: 'COMPLETE',
                        proofPict: {
                            $ref: 'mediaproofpicts',
                            $id: new Object(IdMediaproofpictsDto),
                            $db: 'hyppe_content_db'
                        },
                        listAddKyc: listAddKyc
                    });
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed insert Mediaproofpicts ' + err,
                    );
                }
            }

            //Ceck face detect true
            if (face_detect_selfiepict.FaceDetails.length > 0 && face_detect_cardPict.FaceDetails.length > 0) {
                //try {
                var data_comparing = {
                    "SimilarityThreshold": Similarity,
                    "SourceImage": {
                        "Bytes": buffer_cardPict
                    },
                    "TargetImage": {
                        "Bytes": buffer_selfiepict
                    }
                };

                //Face comparing
                face_detect_selfiepict = await this.awsService.comparing(data_comparing);
                console.log(JSON.stringify(face_detect_selfiepict))
                console.log(face_detect_selfiepict)
                if (face_detect_selfiepict.FaceMatches.length > 0) {
                    emailuserbasic = datauserbasicsService.email;
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FINISH';
                    _CreateMediaproofpictsDto.valid = true;
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, true, 'verified');
                    await this.userauthsService.update(emailuserbasic, 'ROLE_PREMIUM');
                    //await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);

                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_VERIFIED');
                    return {
                        "response_code": 202,
                        "data": {
                            "id_mediaproofpicts": id_mediaproofpicts_,
                            "valid": true
                        },
                        "messages": {
                            "info": [
                                "Face match"
                            ]
                        }
                    };
                } else {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FAILED';
                    _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict dan Selfie Pict';
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Face not match"
                                ]
                            }
                        }
                    );
                }
                // } catch (err) {
                //     await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                //     var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                //     _CreateMediaproofpictsDto.status = 'FAILED';
                //     _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict';
                //     iduserbasic = datauserbasicsService._id;
                //     await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                //     await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                //     //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                //     await this.errorHandler.generateCustomNotAcceptableException(
                //         {
                //             "response_code": 202,
                //             "data": {
                //                 "id_mediaproofpicts": id_mediaproofpicts_,
                //                 "valid": false
                //             },
                //             "messages": {
                //                 "info": [
                //                     "Face not match"
                //                 ]
                //             }
                //         }
                //     );
                // }
                // return face_detect_selfiepict;
            } else {
                if (face_detect_selfiepict.FaceDetails.length == 0) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FAILED';
                    _CreateMediaproofpictsDto.state = 'Kesalahan Selfie Pict';
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed selfiepict not face detect"
                                ]
                            }
                        }
                    );
                }
                if (face_detect_cardPict.FaceDetails.length == 0) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.state = 'KTP Pict';
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed cardPict not face detect"
                                ]
                            }
                        }
                    );
                }
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/verificationid/v2')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }]))
    async uploadcomparingid2(
        @UploadedFiles() files: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[]
        },
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, token and email do not match',
            );
        }
        if (CreateMediaproofpictsDto_.idcardnumber == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, idcardnumber is required',
            );
        } else {
            if (CreateMediaproofpictsDto_.idcardnumber.length < 16) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unable to proceed, idcardnumber must be 16 digits long',
                );
            }
        }
        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, email is required',
            );
        }
        var listAddKyc = [];
        var datakyc = null;
        //Var cardPict
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_filename_new = '';
        let cardPict_filename_new_thum = '';
        let url_cardPict = '';
        let url_cardPict_thum = '';

        //Var selfiepict
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_filename_new = '';
        let selfiepict_filename_new_thum = '';
        let url_selfiepict = '';
        let url_selfiepict_thum = '';

        //Var buffer
        let buffer_cardPict = null;
        let buffer_selfiepict = null;

        //Var response facedetect
        let face_detect_cardPict = null;
        let face_detect_selfiepict = null;

        let id_mediaproofpicts_ = null;
        let iduserbasic = null;
        let emailuserbasic = null;
        let listchallenge = null;

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();

        //Get Setting Similarity
        var Similarity = await (await this.settingsService.findOneByJenis('Similarity')).value;

        try {
            listchallenge = CreateMediaproofpictsDto_.listchallenge;
        } catch (e) {
            listchallenge = [];
        }

        //Ceck User Userbasics
        const datauserbasicsService = await this.basic2SS.findbyemail(
            headers['x-auth-user'],
        );
        var re = /(?:\.([^.]+))?$/;

        if (await this.utilsService.ceckData(datauserbasicsService)) {
            if (datauserbasicsService.kyc.length != 0 && datauserbasicsService.kyc[0].postType != undefined) {
                datakyc = datauserbasicsService.kyc[0];
            }
            emailuserbasic = datauserbasicsService.email;
            iduserbasic = datauserbasicsService._id.toString();

            if (await this.basic2SS.getDuplicateIdCardNumber(CreateMediaproofpictsDto_.idcardnumber.toString(), emailuserbasic)) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unable to proceed, found duplicate idcardnumber',
                );
            }

            //Ceck cardPict
            if (files.cardPict != undefined) {
                cardPict_filename = files.cardPict[0].originalname;
                //cardPict_etx = cardPict_filename.substring(cardPict_filename.lastIndexOf('.'), cardPict_filename.length);
                // var textSplit = cardPict_filename.split('.');
                // if (textSplit.length == 2) {
                //     cardPict_etx = textSplit[1];
                // } else {
                //     cardPict_etx = textSplit[textSplit.length - 1];
                // }
                cardPict_etx = '.jpeg';
                cardPict_filename_new = iduserbasic + cardPict_etx;
                cardPict_filename_new_thum = iduserbasic + "_thum" + cardPict_etx;
                cardPict_mimetype = files.cardPict[0].mimetype;

                var result = await this.ossService.uploadFile(files.cardPict[0], iduserbasic + "/kyc/proofpict/" + cardPict_filename_new);
                console.log("RESULT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", result);
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_cardPict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                var cardPict_thum = await this.generate_thumnail(files.cardPict[0], "jpeg");
                var result_thum = await this.ossService.uploadFileBuffer(cardPict_thum, iduserbasic + "/kyc/proofpict/" + cardPict_filename_new_thum);
                if (result_thum != undefined) {
                    if (result_thum.res != undefined) {
                        if (result_thum.res.statusCode != undefined) {
                            if (result_thum.res.statusCode == 200) {
                                url_cardPict_thum = result_thum.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                //AWS face detect proofpict
                try {
                    //Create Buffer
                    buffer_cardPict = await this.ossService.readFileBase64(iduserbasic + "/kyc/proofpict/" + cardPict_filename_new);
                    var data_cardPict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_cardPict,
                        }
                    };

                    //AWS face detect 
                    face_detect_cardPict = await this.awsService.detect(data_cardPict);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect proofpict ' + err,
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }

            //Ceck selfiepict
            if (files.selfiepict != undefined) {
                selfiepict_filename = files.selfiepict[0].originalname;
                //selfiepict_etx = selfiepict_filename.substring(selfiepict_filename.lastIndexOf('.'), selfiepict_filename.length);
                // var textSplit = selfiepict_filename.split('.');
                // if (textSplit.length == 2) {
                //     selfiepict_etx = textSplit[1];
                // } else {
                //     selfiepict_etx = textSplit[textSplit.length-1];
                // }
                selfiepict_etx = '.jpeg';
                selfiepict_filename_new = iduserbasic + selfiepict_etx;
                selfiepict_filename_new_thum = iduserbasic + "_thum" + selfiepict_etx;
                selfiepict_mimetype = files.selfiepict[0].mimetype;

                var result = await this.ossService.uploadFile(files.selfiepict[0], iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new);
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_selfiepict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                var selfiepict_thum = await this.generate_thumnail(files.selfiepict[0], "jpeg");
                var result_thum = await this.ossService.uploadFileBuffer(selfiepict_thum, iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new_thum);
                if (result_thum != undefined) {
                    if (result_thum.res != undefined) {
                        if (result_thum.res.statusCode != undefined) {
                            if (result_thum.res.statusCode == 200) {
                                url_selfiepict_thum = result_thum.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }

                //AWS face detect selfiepict
                try {
                    //Create Buffer
                    buffer_selfiepict = await this.ossService.readFileBase64(iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new);

                    var data_selfiepict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_selfiepict,
                        }
                    };
                    //AWS face detect 
                    face_detect_selfiepict = await this.awsService.detect(data_selfiepict);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect selfiepict ' + err,
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed selfiepict is required',
                );
            }

            //Ceck Data user proofPict
            if (datauserbasicsService.proofPict != undefined) {
                //Update proofPict
                try {
                    var proofPict_json = JSON.parse(JSON.stringify(datauserbasicsService.proofPict));
                    var data_mediaproofpicts = await this.mediaproofpictsService.findOne(proofPict_json.$id);
                    id_mediaproofpicts_ = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.mediaType = 'image';

                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;

                    CreateMediaproofpictsDto_.fsSourceUri = url_cardPict;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsTargetUri = url_cardPict;
                    CreateMediaproofpictsDto_.mediaThumBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new_thum;
                    CreateMediaproofpictsDto_.mediaThumUri = url_cardPict_thum;

                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.proofpictUploadSource = "OSS";

                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = iduserbasic + '/kyc/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;

                    CreateMediaproofpictsDto_.SelfiefsSourceUri = url_selfiepict;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = url_selfiepict;
                    CreateMediaproofpictsDto_.SelfiemediaThumBasePath = iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new_thum;
                    CreateMediaproofpictsDto_.SelfiemediaThumUri = url_selfiepict_thum;

                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.SelfieUploadSource = "OSS";

                    CreateMediaproofpictsDto_._class = "io.melody.hyppe.content.domain.MediaProofPict";
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(iduserbasic),
                        $db: "hyppe_trans_db"
                    }

                    // CreateMediaproofpictsDto_.idcardnumber = (CreateMediaproofpictsDto_.idcardnumber == null && CreateMediaproofpictsDto_.idcardnumber == undefined ? datakyc.idcardnumber : CreateMediaproofpictsDto_.idcardnumber);
                    // CreateMediaproofpictsDto_.nama = (CreateMediaproofpictsDto_.nama == null && CreateMediaproofpictsDto_.nama == undefined ? datakyc.nama : CreateMediaproofpictsDto_.nama);
                    // CreateMediaproofpictsDto_.tempatLahir = (CreateMediaproofpictsDto_.tempatLahir == null && CreateMediaproofpictsDto_.tempatLahir == undefined ? datakyc.tempatLahir : CreateMediaproofpictsDto_.tempatLahir);
                    // CreateMediaproofpictsDto_.jenisKelamin = (CreateMediaproofpictsDto_.jenisKelamin == null && CreateMediaproofpictsDto_.jenisKelamin == undefined ? datakyc.jenisKelamin : CreateMediaproofpictsDto_.jenisKelamin);
                    // CreateMediaproofpictsDto_.alamat = (CreateMediaproofpictsDto_.alamat == null && CreateMediaproofpictsDto_.alamat == undefined ? datakyc.alamat : CreateMediaproofpictsDto_.alamat);
                    // CreateMediaproofpictsDto_.statusPerkawinan = (CreateMediaproofpictsDto_.statusPerkawinan == null && CreateMediaproofpictsDto_.statusPerkawinan == undefined ? datakyc.statusPerkawinan : CreateMediaproofpictsDto_.statusPerkawinan);
                    // CreateMediaproofpictsDto_.pekerjaan = (CreateMediaproofpictsDto_.pekerjaan == null && CreateMediaproofpictsDto_.pekerjaan == undefined ? datakyc.pekerjaan : CreateMediaproofpictsDto_.pekerjaan);
                    // CreateMediaproofpictsDto_.kewarganegaraan = (CreateMediaproofpictsDto_.kewarganegaraan == null && CreateMediaproofpictsDto_.kewarganegaraan == undefined ? datakyc.kewarganegaraan : CreateMediaproofpictsDto_.kewarganegaraan);

                    await this.mediaproofpictsService.updatebyId(data_mediaproofpicts._id.toString(), CreateMediaproofpictsDto_);
                    datakyc = CreateMediaproofpictsDto_;
                    var updatedata = new CreateuserbasicnewDto();
                    updatedata.kyc = [CreateMediaproofpictsDto_];
                    await this.basic2SS.update(iduserbasic, updatedata);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed update Mediaproofpicts ' + err,
                    );
                }
            } else {

                try {
                    listAddKyc = datauserbasicsService.listAddKyc;
                } catch (e) {
                    listAddKyc = [];
                }
                if (listAddKyc === null || listAddKyc === undefined) {
                    listAddKyc = [];
                }
                var objkyc = {
                    "mediaID": IdMediaproofpictsDto,
                    "createdAt": current_date
                }
                listAddKyc.push(objkyc);

                //Insert proofPict
                try {
                    id_mediaproofpicts_ = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.mediaType = 'image';

                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;

                    CreateMediaproofpictsDto_.fsSourceUri = url_cardPict;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsTargetUri = url_cardPict;

                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.proofpictUploadSource = "OSS";

                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = iduserbasic + '/kyc/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;

                    CreateMediaproofpictsDto_.SelfiefsSourceUri = url_selfiepict;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = url_selfiepict;

                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.SelfieUploadSource = "OSS";
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(datauserbasicsService._id.toString()),
                        $db: "hyppe_trans_db"
                    }

                    // CreateMediaproofpictsDto_.idcardnumber = CreateMediaproofpictsDto_.idcardnumber;
                    // CreateMediaproofpictsDto_.nama = CreateMediaproofpictsDto_.nama;
                    // CreateMediaproofpictsDto_.tempatLahir = CreateMediaproofpictsDto_.tempatLahir;
                    // CreateMediaproofpictsDto_.jenisKelamin = CreateMediaproofpictsDto_.jenisKelamin;
                    // CreateMediaproofpictsDto_.alamat = CreateMediaproofpictsDto_.alamat;
                    // CreateMediaproofpictsDto_.statusPerkawinan = CreateMediaproofpictsDto_.statusPerkawinan;
                    // CreateMediaproofpictsDto_.pekerjaan = CreateMediaproofpictsDto_.pekerjaan;
                    // CreateMediaproofpictsDto_.kewarganegaraan = CreateMediaproofpictsDto_.kewarganegaraan;

                    await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                    datakyc = CreateMediaproofpictsDto_;
                    await this.basic2SS.updatebyEmail(datauserbasicsService.email.toString(), {
                        idProofName: CreateMediaproofpictsDto_.nama,
                        idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                        idProofStatus: 'COMPLETE',
                        gender: CreateMediaproofpictsDto_.jenisKelamin,
                        proofPict: {
                            $ref: 'mediaproofpicts',
                            $id: new Object(IdMediaproofpictsDto),
                            $db: 'hyppe_content_db'
                        },
                        listAddKyc: listAddKyc,
                        kyc: [CreateMediaproofpictsDto_]
                    });
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed insert Mediaproofpicts ' + err,
                    );
                }
            }

            //Ceck face detect true
            if (face_detect_selfiepict.FaceDetails.length > 0 && face_detect_cardPict.FaceDetails.length > 0) {
                //try {
                var data_comparing = {
                    "SimilarityThreshold": Similarity,
                    "SourceImage": {
                        "Bytes": buffer_cardPict
                    },
                    "TargetImage": {
                        "Bytes": buffer_selfiepict
                    }
                };

                //Face comparing
                face_detect_selfiepict = await this.awsService.comparing(data_comparing);
                console.log(JSON.stringify(face_detect_selfiepict))
                console.log(face_detect_selfiepict)
                if (face_detect_selfiepict.FaceMatches.length > 0) {
                    emailuserbasic = datauserbasicsService.email;
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FINISH';
                    _CreateMediaproofpictsDto.valid = true;
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    datakyc.status = 'FINISH';
                    datakyc.valid = true;
                    iduserbasic = datauserbasicsService._id;
                    var updatedata = new CreateuserbasicnewDto();
                    updatedata.roles = ['ROLE_PREMIUM'];
                    updatedata.kyc = [datakyc];
                    await this.basic2SS.updateIdVerifiedUser(iduserbasic, true, 'verified');
                    await this.basic2SS.update(iduserbasic.toString(), updatedata);
                    //await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);

                    var checkreferraldata = await this.referralSS.findPendingStatusByChildren(datauserbasicsService.email.toString());
                    if(await this.utilsService.ceckData(checkreferraldata) == true)
                    {
                        this.followUser(datauserbasicsService, checkreferraldata, listchallenge);
                    }

                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_VERIFIED');
                    return {
                        "response_code": 202,
                        "data": {
                            "id_mediaproofpicts": datauserbasicsService._id.toString(),
                            "valid": true
                        },
                        "messages": {
                            "info": [
                                "Face match"
                            ]
                        }
                    };
                } else {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FAILED';
                    _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict dan Selfie Pict';
                    datakyc.status = 'FAILED';
                    datakyc.state = 'Kesalahan KTP Pict dan Selfie Pict';
                    var updatedata = new CreateuserbasicnewDto();
                    updatedata.kyc = [datakyc];
                    iduserbasic = datauserbasicsService._id;
                    await this.basic2SS.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    await this.basic2SS.update(iduserbasic.toString(), updatedata);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": datauserbasicsService._id.toString(),
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Face not match"
                                ]
                            }
                        }
                    );
                }
                // } catch (err) {
                //     await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                //     var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                //     _CreateMediaproofpictsDto.status = 'FAILED';
                //     _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict';
                //     iduserbasic = datauserbasicsService._id;
                //     await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                //     await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                //     //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                //     await this.errorHandler.generateCustomNotAcceptableException(
                //         {
                //             "response_code": 202,
                //             "data": {
                //                 "id_mediaproofpicts": id_mediaproofpicts_,
                //                 "valid": false
                //             },
                //             "messages": {
                //                 "info": [
                //                     "Face not match"
                //                 ]
                //             }
                //         }
                //     );
                // }
                // return face_detect_selfiepict;
            } else {
                if (face_detect_selfiepict.FaceDetails.length == 0) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FAILED';
                    _CreateMediaproofpictsDto.state = 'Kesalahan Selfie Pict';
                    datakyc.status = 'FAILED';
                    datakyc.state = 'Kesalahan Selfie Pict';
                    var updatedata = new CreateuserbasicnewDto();
                    updatedata.kyc = [datakyc];
                    iduserbasic = datauserbasicsService._id;
                    await this.basic2SS.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                    await this.basic2SS.update(iduserbasic.toString(), updatedata);
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": datauserbasicsService._id.toString(),
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed selfiepict not face detect"
                                ]
                            }
                        }
                    );
                }
                if (face_detect_cardPict.FaceDetails.length == 0) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REJECT');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.state = 'KTP Pict';
                    datakyc.status = 'FAILED';
                    datakyc.state = 'KTP Pict';
                    var updatedata = new CreateuserbasicnewDto();
                    updatedata.kyc = [datakyc];
                    iduserbasic = datauserbasicsService._id;
                    await this.basic2SS.updateIdVerifiedUser(iduserbasic, false, 'unverified');
                    await this.basic2SS.update(iduserbasic, updatedata);
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": datauserbasicsService._id.toString(),
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed cardPict not face detect"
                                ]
                            }
                        }
                    );
                }
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    async generate_thumnail(file: Express.Multer.File, format: string) {
        var SIZE_IMAGE_RESIZE = 320;
        console.log("CONFIG SIZE_IMAGE_RESIZE : " + SIZE_IMAGE_RESIZE);

        //Get Image Information
        var image_information = await sharp(file.buffer).metadata();
        console.log("IMAGE INFORMATION", image_information);

        var image_height = image_information.height;
        var image_width = image_information.width;
        var image_size = image_information.size;
        var image_format = image_information.format;
        var image_orientation = image_information.orientation;

        //Get Image Mode
        var image_mode = await this.utilsService.getImageMode(image_width, image_height);
        console.log("IMAGE MODE", image_mode);

        var thumnail = null;
        var ori = null;
        try {
            if (image_orientation == 1) {
                thumnail = await sharp(file.buffer, { failOnError: false }).resize(480, 480).toBuffer();
            } else if (image_orientation == 6) {
                thumnail = await sharp(file.buffer, { failOnError: false }).rotate(90).resize(480, 480).toBuffer();
            } else if (image_orientation == 8) {
                thumnail = await sharp(file.buffer, { failOnError: false }).rotate(270).resize(480, 480).toBuffer();
            } else {
                thumnail = await sharp(file.buffer, { failOnError: false }).resize(480, 480).toBuffer();
            }
            console.log(typeof thumnail);
        } catch (e) {
            console.log(e, "FAILED TO CREATE THUMNAIL");
            console.log("THUMNAIL", "FAILED TO CREATE THUMNAIL");
        }
        return thumnail;
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/v2/verificationid')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }], multerOptions))
    async uploadcomparingidV2(
        @UploadedFiles() files: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[]
        },
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        if (CreateMediaproofpictsDto_.idcardnumber == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed idcardnumber is required',
            );
        } else {
            if (CreateMediaproofpictsDto_.idcardnumber.length < 16) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed idcardnumber must length 16 digit',
                );
            }
        }
        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }
        var titleingagal = "Verifikasi Gagal";
        var titleengagal = "Verification Failed";
        var bodyingagal = "Maaf! verifikasi ID Anda ditolak karena data yang diterima tidak cocok, silahkan coba unggah lagi dengan data asli.";
        var bodyengagal = "Sorry! your ID verification is denied because the data received did not match, please upload it again with the genuine data.";

        var titleinsukses = "Verifikasi Berhasil";
        var titleensukses = "Verification Successful";
        var bodyinsukses = "Selamat! Anda telah menjadi pengguna premium, nikmati manfaatnya";
        var bodyensukses = "Congratulations! you have become a premium user, enjoy the benefits";
        var eventType = "VERIFICATIONID";
        var event = "REQUEST";
        var listAddKyc = [];
        //Var cardPict
        let cardPict_data = null;
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_name = '';
        let cardPict_filename_new = '';
        let cardPict_local_path = '';
        let cardPict_seaweedfs_path = '';

        //Var selfiepict
        let selfiepict_data = null;
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_name = '';
        let selfiepict_filename_new = '';
        let selfiepict_local_path = '';
        let selfiepict_seaweedfs_path = '';

        //Var bitmap
        let bitmap_cardPict = null;
        let bitmap_selfiepict = null;

        //Var buffer
        let buffer_cardPict = null;
        let buffer_selfiepict = null;

        //Var response facedetect
        let face_detect_cardPict = null;
        let face_detect_selfiepict = null;

        let id_mediaproofpicts_ = null;
        let iduserbasic = null;
        let emailuserbasic = null;

        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose
        var mongoose_gen_meida = new mongoose.Types.ObjectId();

        //Get Setting Similarity
        var Similarity = await (await this.settingsService.findOneByJenis('Similarity')).value;

        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );
        if (await this.utilsService.ceckData(datauserbasicsService)) {
            emailuserbasic = datauserbasicsService.email;


            //Ceck cardPict
            if (files.cardPict != undefined) {
                var FormData_ = new FormData();
                cardPict_data = files.cardPict[0];
                cardPict_mimetype = files.cardPict[0].mimetype;
                cardPict_filename = files.cardPict[0].filename;
                cardPict_etx = cardPict_filename.substring(cardPict_filename.lastIndexOf('.') + 1, cardPict_filename.length);
                cardPict_name = cardPict_filename.substring(0, cardPict_filename.lastIndexOf('.'));

                //New Name file cardPict
                cardPict_filename_new = IdMediaproofpictsDto + '_0001.' + cardPict_etx;
                //Rename Name file cardPict
                fs.renameSync('./temp/' + cardPict_filename, './temp/' + cardPict_filename_new);

                //Local path
                cardPict_local_path = './temp/' + mongoose_gen_meida._id.toString() + '/proofpict/' + cardPict_filename_new;
                //SeaweedFs path
                cardPict_seaweedfs_path = '/' + mongoose_gen_meida._id.toString() + '/proofpict/';

                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida._id.toString())) {
                    //Create folder proofpict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida + '/', 'proofpict')) {
                        //Move File
                        await fse.move('./temp/' + cardPict_filename_new, './temp/' + mongoose_gen_meida._id.toString() + '/proofpict/' + cardPict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder proofpict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_meida._id.toString(),
                    );
                }

                //AWS face detect proofpict
                try {
                    //Create bitmap from local
                    bitmap_cardPict = await fs.readFileSync('./temp/' + mongoose_gen_meida._id.toString() + '/proofpict/' + cardPict_filename_new, 'base64');
                    buffer_cardPict = Buffer.from(bitmap_cardPict, 'base64');

                    var data_cardPict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_cardPict,
                        }
                    };

                    //AWS face detect 
                    face_detect_cardPict = await this.awsService.detect(data_cardPict);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect proofpict ' + err,
                    );
                }

                //Upload Seaweedfs
                try {
                    FormData_.append('proofpict', fs.createReadStream(path.resolve(cardPict_local_path)));
                    await this.seaweedfsService.write(cardPict_seaweedfs_path, FormData_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed proofpict failed upload seaweedfs',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed cardPict is required',
                );
            }

            //Ceck selfiepict
            if (files.selfiepict != undefined) {
                var FormData_ = new FormData();
                selfiepict_data = files.selfiepict[0];
                selfiepict_mimetype = files.cardPict[0].mimetype;
                selfiepict_filename = files.selfiepict[0].filename;
                selfiepict_etx = selfiepict_filename.substring(selfiepict_filename.lastIndexOf('.') + 1, selfiepict_filename.length);
                selfiepict_name = selfiepict_filename.substring(0, selfiepict_filename.lastIndexOf('.'));

                //New Name file selfiepict
                selfiepict_filename_new = mongoose_gen_meida._id.toString() + '_0001.' + selfiepict_etx;
                //Rename Name file selfiepict
                await fs.renameSync('./temp/' + selfiepict_filename, './temp/' + selfiepict_filename_new);
                //Local path
                selfiepict_local_path = './temp/' + mongoose_gen_meida._id.toString() + '/selfiepict/' + selfiepict_filename_new;
                //SeaweedFs path
                selfiepict_seaweedfs_path = '/' + mongoose_gen_meida._id.toString() + '/selfiepict/';

                //Create Folder Id
                if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida._id.toString())) {
                    //Create folder selfiepict
                    if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida._id.toString() + '/', 'selfiepict')) {
                        //Move File
                        await fse.move('./temp/' + selfiepict_filename_new, './temp/' + mongoose_gen_meida._id.toString() + '/selfiepict/' + selfiepict_filename_new);
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed create folder selfiepict',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed create folder ' + mongoose_gen_meida._id.toString(),
                    );
                }

                //AWS face detect selfiepict
                try {
                    //Create bitmap from local
                    bitmap_selfiepict = await fs.readFileSync('./temp/' + mongoose_gen_meida._id.toString() + '/selfiepict/' + selfiepict_filename_new, 'base64');
                    buffer_selfiepict = Buffer.from(bitmap_selfiepict, 'base64');

                    var data_selfiepict = {
                        "Attributes": ["ALL"],
                        "Image": {
                            "Bytes": buffer_selfiepict,
                        }
                    };
                    //AWS face detect 
                    face_detect_selfiepict = await this.awsService.detect(data_selfiepict);
                } catch (err) {

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed face detect selfiepict ' + err,
                    );
                }

                //Upload Seaweedfs
                try {
                    FormData_.append('selfiepict', fs.createReadStream(path.resolve(selfiepict_local_path)));
                    await this.seaweedfsService.write(selfiepict_seaweedfs_path, FormData_);
                } catch (err) {

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed selfiepict failed upload seaweedfs ' + err,
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed selfiepict is required',
                );
            }

            //Ceck Data user proofPict
            if (datauserbasicsService.proofPict != undefined) {
                //Update proofPict
                try {
                    var proofPict_json = JSON.parse(JSON.stringify(datauserbasicsService.proofPict));
                    var data_mediaproofpicts = await this.mediaproofpictsService.findOne(proofPict_json.$id);
                    id_mediaproofpicts_ = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
                    CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaType = 'image';
                    CreateMediaproofpictsDto_.mediaBasePath = mongoose_gen_meida + '/proofpict/';
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;
                    CreateMediaproofpictsDto_.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = mongoose_gen_meida + '/selfiepict/';
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                    CreateMediaproofpictsDto_.SelfiefsSourceUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_._class = "io.melody.hyppe.content.domain.MediaProofPict";
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(datauserbasicsService._id.toString()),
                        $db: "hyppe_trans_db"
                    }
                    await this.mediaproofpictsService.updatebyId(data_mediaproofpicts._id.toString(), CreateMediaproofpictsDto_);
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed update Mediaproofpicts ' + err,
                    );
                }
            } else {

                try {
                    listAddKyc = datauserbasicsService.listAddKyc;
                } catch (e) {
                    listAddKyc = [];
                }
                if (listAddKyc === null || listAddKyc === undefined) {
                    listAddKyc = [];
                }
                var objkyc = {
                    "mediaID": IdMediaproofpictsDto,
                    "createdAt": current_date
                }
                listAddKyc.push(objkyc);

                //Insert proofPict
                try {
                    id_mediaproofpicts_ = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                    CreateMediaproofpictsDto_.active = true;
                    CreateMediaproofpictsDto_.valid = false;
                    CreateMediaproofpictsDto_.createdAt = current_date;
                    CreateMediaproofpictsDto_.updatedAt = current_date;
                    CreateMediaproofpictsDto_.postType = 'proofpict';
                    CreateMediaproofpictsDto_.mediaType = 'image';
                    CreateMediaproofpictsDto_.mediaBasePath = mongoose_gen_meida + '/proofpict/';
                    CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                    CreateMediaproofpictsDto_.originalName = cardPict_filename;
                    CreateMediaproofpictsDto_.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                    CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                    CreateMediaproofpictsDto_.mediaSelfieBasePath = mongoose_gen_meida + '/selfiepict/';
                    CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                    CreateMediaproofpictsDto_.SelfiefsSourceUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
                    CreateMediaproofpictsDto_.SelfiefsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
                    CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + cardPict_filename_new;
                    CreateMediaproofpictsDto_._class = "io.melody.hyppe.content.domain.MediaProofPict";
                    CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                    CreateMediaproofpictsDto_.userId = {
                        $ref: "userbasics",
                        $id: Object(datauserbasicsService._id.toString()),
                        $db: "hyppe_trans_db"
                    }
                    await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                    await this.userbasicsService.updatebyEmail(datauserbasicsService.email.toString(), {
                        idProofName: CreateMediaproofpictsDto_.nama,
                        idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                        idProofStatus: 'COMPLETE',
                        proofPict: {
                            $ref: 'mediaproofpicts',
                            $id: new Object(IdMediaproofpictsDto),
                            $db: 'hyppe_content_db'
                        },
                        listAddKyc: listAddKyc
                    });
                } catch (err) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed insert Mediaproofpicts ' + err,
                    );
                }
            }

            //Delete directory recursively
            fs.rm('./temp/' + mongoose_gen_meida._id.toString(), { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });

            //Ceck face detect true
            if (face_detect_selfiepict.FaceDetails.length > 0 && face_detect_cardPict.FaceDetails.length > 0) {
                try {
                    var data_comparing = {
                        "SimilarityThreshold": Similarity,
                        "SourceImage": {
                            "Bytes": buffer_cardPict
                        },
                        "TargetImage": {
                            "Bytes": buffer_selfiepict
                        }
                    };

                    //Face comparing
                    face_detect_selfiepict = await this.awsService.comparing(data_comparing);
                    if (face_detect_selfiepict.FaceMatches.length > 0) {
                        emailuserbasic = datauserbasicsService.email;
                        var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                        _CreateMediaproofpictsDto.status = 'FINISH';
                        _CreateMediaproofpictsDto.valid = true;
                        await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                        iduserbasic = datauserbasicsService._id;
                        await this.userbasicsService.updateIdVerifiedUser(iduserbasic, true, 'verified');
                        await this.userauthsService.update(emailuserbasic, 'ROLE_PREMIUM');
                        //await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);

                        await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_VERIFIED');
                        return {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": true
                            },
                            "messages": {
                                "info": [
                                    "Face match"
                                ]
                            }
                        };
                    } else {
                        await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REVIEW');
                        var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                        _CreateMediaproofpictsDto.status = 'FAILED';
                        _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict dan Selfie Pict';
                        iduserbasic = datauserbasicsService._id;
                        await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'review');
                        await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                        //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                        await this.errorHandler.generateCustomNotAcceptableException(
                            {
                                "response_code": 202,
                                "data": {
                                    "id_mediaproofpicts": id_mediaproofpicts_,
                                    "valid": false
                                },
                                "messages": {
                                    "info": [
                                        "Face not match"
                                    ]
                                }
                            }
                        );
                    }
                } catch (err) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REVIEW');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FAILED';
                    _CreateMediaproofpictsDto.state = 'Kesalahan KTP Pict';
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'review');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Face not match"
                                ]
                            }
                        }
                    );
                }
                return face_detect_selfiepict;
            } else {
                if (face_detect_selfiepict.FaceDetails.length == 0) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REVIEW');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.status = 'FAILED';
                    _CreateMediaproofpictsDto.state = 'Kesalahan Selfie Pict';
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'review');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed selfiepict not face detect"
                                ]
                            }
                        }
                    );
                }
                if (face_detect_cardPict.FaceDetails.length == 0) {
                    await this.utilsService.sendFcmV2(emailuserbasic, emailuserbasic, 'KYC', 'REQUEST', 'KYC_REVIEW');
                    var _CreateMediaproofpictsDto = new CreateMediaproofpictsDto();
                    _CreateMediaproofpictsDto.state = 'KTP Pict';
                    iduserbasic = datauserbasicsService._id;
                    await this.userbasicsService.updateIdVerifiedUser(iduserbasic, false, 'review');
                    await this.mediaproofpictsService.updatebyId(id_mediaproofpicts_, _CreateMediaproofpictsDto);
                    //await this.utilsService.sendFcm(emailuserbasic, titleingagal, titleengagal, bodyingagal, bodyengagal, eventType, event);
                    await this.errorHandler.generateCustomNotAcceptableException(
                        {
                            "response_code": 202,
                            "data": {
                                "id_mediaproofpicts": id_mediaproofpicts_,
                                "valid": false
                            },
                            "messages": {
                                "info": [
                                    "Unabled to proceed cardPict not face detect"
                                ]
                            }
                        }
                    );
                }
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @HttpCode(HttpStatus.ACCEPTED)
    // @Post('api/posts/supportfile')
    // @UseInterceptors(AnyFilesInterceptor(multerOptions))
    // async uploadsuportfile(
    //     @UploadedFiles() files: Array<Express.Multer.File>,
    //     @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
    //     @Headers() headers) {
    //     var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();

    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }

    //     if (headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email is required',
    //         );
    //     }

    //     var countfile = files.length;
    //     //Var supportFile
    //     let supportFile_data = null;
    //     let supportFile_filename = '';
    //     let supportFile_etx = '';
    //     let supportFile_mimetype = '';
    //     let supportFile_name = '';
    //     let supportFile_filename_new = '';
    //     let supportFile_local_path = '';
    //     let supportFile_seaweedfs_path = '';
    //     var arrayUri = [];
    //     var arrayName = [];
    //     var arraySuri = [];
    //     var arraySname = [];

    //     //Var bitmap
    //     let bitmap_supportFile = null;

    //     //Var buffer
    //     let buffer_supportFile = null;

    //     //Var response facedetect
    //     let face_detect_supportFile = null;

    //     let id_mediaproofpicts_ = null;

    //     //Var current date
    //     var current_date = await this.utilsService.getDateTimeString();

    //     //Var generate id
    //     // var IdMediaproofpictsDto = await this.utilsService.generateId();
    //     //Var generate id mongoose


    //     //Ceck User Userbasics
    //     const datamediaproofService = await this.mediaproofpictsService.findOne(
    //         idmediaproofpict
    //     );

    //     if (await this.utilsService.ceckData(datamediaproofService)) {
    //         // var mongoose_gen_meida = new mongoose.Types.ObjectId();



    //         var paths = datamediaproofService.mediaBasePath.toString();
    //         // var mongoose_gen_meida = paths.replace("/PROOF_PICTURE/", "");
    //         var mongoose_gen_meidas = paths.split('/');
    //         var mongoose_gen_meida = mongoose_gen_meidas[0];
    //         //Ceck supportFile
    //         if (files != undefined) {


    //             for (var i = 0; i < countfile; i++) {
    //                 var FormData_ = new FormData();
    //                 supportFile_data = files[i];
    //                 supportFile_mimetype = files[i].mimetype;
    //                 supportFile_filename = files[i].filename;
    //                 supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
    //                 supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

    //                 //New Name file supportFile
    //                 supportFile_filename_new = idmediaproofpict + '_000' + (i + 1) + '.' + supportFile_etx;
    //                 //Rename Name file supportFile
    //                 fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

    //                 //Local path
    //                 supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
    //                 //SeaweedFs path
    //                 supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/supportfile/';

    //                 //Create Folder Id
    //                 if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //                     await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                     );
    //                 }

    //                 //Upload Seaweedfs
    //                 try {
    //                     FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
    //                     await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
    //                 } catch (err) {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed proofpict failed upload seaweedfs',
    //                     );
    //                 }

    //                 var objSuri = '/localrepo/' + mongoose_gen_meida + '/supportfile/' + supportFile_filename_new;
    //                 var objsname = supportFile_filename_new.replace('_000' + i, '');

    //                 arrayUri.push(supportFile_filename_new);
    //                 arrayName.push(supportFile_filename);
    //                 arraySuri.push(objSuri);
    //                 arraySname.push(objsname);
    //             }

    //         } else {
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed supportFile is required',
    //             );
    //         }

    //         //Ceck Data user proofPict
    //         if (datamediaproofService._id != undefined) {
    //             //Update proofPict
    //             try {

    //                 var data_mediaproofpicts = datamediaproofService;
    //                 id_mediaproofpicts_ = data_mediaproofpicts._id;
    //                 CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
    //                 CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
    //                 CreateMediaproofpictsDto_.active = true;
    //                 CreateMediaproofpictsDto_.valid = false;
    //                 CreateMediaproofpictsDto_.createdAt = current_date;
    //                 CreateMediaproofpictsDto_.updatedAt = current_date;

    //                 CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
    //                 CreateMediaproofpictsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
    //                 CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
    //                 CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
    //                 CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
    //                 CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
    //                 CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
    //                 CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
    //                 CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
    //                 await this.mediaproofpictsService.updatebyId(idmediaproofpict, CreateMediaproofpictsDto_);
    //             } catch (err) {
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed failed update Mediaproofpicts ' + err,
    //                 );
    //             }
    //         }
    //         else {
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed supportFile is required',
    //             );

    //         }


    //         //Delete directory recursively

    //         fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //         });

    //         return {
    //             "response_code": 202,
    //             "data": {
    //                 "id_mediaproofpicts": idmediaproofpict,
    //                 "status": "IN_PROGGRESS"
    //             },
    //             "messages": {
    //                 "info": [
    //                     "Success Upload"
    //                 ]
    //             }
    //         };
    //     } else {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed user not found',
    //         );
    //     }
    // }


    // @UseGuards(JwtAuthGuard)
    // @HttpCode(HttpStatus.ACCEPTED)
    // @Post('api/posts/upload')
    // @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }, { name: 'supportFile', maxCount: 10, }], multerOptions))
    // async upload(
    //     @UploadedFiles() files1: {
    //         cardPict?: Express.Multer.File[],
    //         selfiepict?: Express.Multer.File[],
    //         supportFile?: Express.Multer.File[]
    //     },
    //     // @UploadedFiles() files2: Array<Express.Multer.File>,
    //     @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
    //     @Headers() headers) {
    //     //  var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();


    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }

    //     if (headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email is required',
    //         );
    //     }

    //     console.log(files1);
    //     //   console.log(files2);

    //     var countfile = files1.supportFile.length;
    //     //Var supportFile
    //     let supportFile_data = null;
    //     let supportFile_filename = '';
    //     let supportFile_etx = '';
    //     let supportFile_mimetype = '';
    //     let supportFile_name = '';
    //     let supportFile_filename_new = '';
    //     let supportFile_local_path = '';
    //     let supportFile_seaweedfs_path = '';
    //     var arrayUri = [];
    //     var arrayName = [];
    //     var arraySuri = [];
    //     var arraySname = [];

    //     //Var cardPict
    //     let cardPict_data = null;
    //     let cardPict_filename = '';
    //     let cardPict_etx = '';
    //     let cardPict_mimetype = '';
    //     let cardPict_name = '';
    //     let cardPict_filename_new = '';
    //     let cardPict_local_path = '';
    //     let cardPict_seaweedfs_path = '';

    //     //Var selfiepict
    //     let selfiepict_data = null;
    //     let selfiepict_filename = '';
    //     let selfiepict_etx = '';
    //     let selfiepict_mimetype = '';
    //     let selfiepict_name = '';
    //     let selfiepict_filename_new = '';
    //     let selfiepict_local_path = '';
    //     let selfiepict_seaweedfs_path = '';
    //     var emailuserbasic = null;
    //     //Var current date
    //     var current_date = await this.utilsService.getDateTimeString();

    //     //Var generate id
    //     var IdMediaproofpictsDto = await this.utilsService.generateId();
    //     //Var generate id mongoose


    //     //Ceck User Userbasics
    //     const datauserbasicsService = await this.userbasicsService.findOne(
    //         headers['x-auth-user'],
    //     );

    //     var titleinsukses = null;
    //     var titleensukses = null;
    //     var bodyinsukses = null;
    //     var bodyensukses = null;
    //     var eventType = null;
    //     var event = null;
    //     if (await this.utilsService.ceckData(datauserbasicsService)) {
    //         // var mongoose_gen_meida = new mongoose.Types.ObjectId();
    //         titleinsukses = "Dalam Proses Verifikasi";
    //         titleensukses = "Verification On Progress";
    //         bodyinsukses = "Hai " + datauserbasicsService.fullName + "! Kami sedang meninjau data yang Anda kirimkan. ini akan memakan waktu 3x24 jam proses";
    //         bodyensukses = "Hi " + datauserbasicsService.fullName + "! We are currently reviewing the data you submitted. this will take a 3x24 hour process";
    //         eventType = "SUPPORTFILE";
    //         event = "REQUEST";

    //         emailuserbasic = datauserbasicsService.email;


    //         var paths = IdMediaproofpictsDto;
    //         var mongoose_gen_meida = paths;

    //         //Ceck cardPict
    //         if (files1.cardPict != undefined) {
    //             var FormData_ = new FormData();
    //             cardPict_data = files1.cardPict[0];
    //             cardPict_mimetype = files1.cardPict[0].mimetype;
    //             cardPict_filename = files1.cardPict[0].filename;
    //             cardPict_etx = cardPict_filename.substring(cardPict_filename.lastIndexOf('.') + 1, cardPict_filename.length);
    //             cardPict_name = cardPict_filename.substring(0, cardPict_filename.lastIndexOf('.'));

    //             //New Name file cardPict
    //             cardPict_filename_new = IdMediaproofpictsDto + '_0001.' + cardPict_etx;
    //             //Rename Name file cardPict
    //             fs.renameSync('./temp/' + cardPict_filename, './temp/' + cardPict_filename_new);

    //             //Local path
    //             cardPict_local_path = './temp/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
    //             //SeaweedFs path
    //             cardPict_seaweedfs_path = '/' + mongoose_gen_meida + '/proofpict/';


    //             //Create Folder Id
    //             if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {
    //                 //Create folder proofpict
    //                 if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida + '/', 'proofpict')) {
    //                     //Move File
    //                     await fse.move('./temp/' + cardPict_filename_new, './temp/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder proofpict',
    //                     );
    //                 }
    //             } else {
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                 );
    //             }

    //             // //Create Folder Id
    //             // if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //             //     await fse.move('./temp/' + cardPict_filename_new, './temp/' + mongoose_gen_meida + '/' + cardPict_filename_new);
    //             // } else {
    //             //     await this.errorHandler.generateNotAcceptableException(
    //             //         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //             //     );
    //             // }

    //             //Upload Seaweedfs
    //             try {
    //                 FormData_.append('proofpict', fs.createReadStream(path.resolve(cardPict_local_path)));
    //                 await this.seaweedfsService.write(cardPict_seaweedfs_path, FormData_);
    //             } catch (err) {
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed proofpict failed upload seaweedfs',
    //                 );
    //             }
    //         } else {
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed cardPict is required',
    //             );
    //         }

    //         //Ceck selfiepict
    //         if (files1.selfiepict != undefined) {
    //             var FormData_ = new FormData();
    //             selfiepict_data = files1.selfiepict[0];
    //             selfiepict_mimetype = files1.cardPict[0].mimetype;
    //             selfiepict_filename = files1.selfiepict[0].filename;
    //             selfiepict_etx = selfiepict_filename.substring(selfiepict_filename.lastIndexOf('.') + 1, selfiepict_filename.length);
    //             selfiepict_name = selfiepict_filename.substring(0, selfiepict_filename.lastIndexOf('.'));

    //             //New Name file selfiepict
    //             selfiepict_filename_new = IdMediaproofpictsDto + '_0001.' + selfiepict_etx;
    //             //Rename Name file selfiepict
    //             await fs.renameSync('./temp/' + selfiepict_filename, './temp/' + selfiepict_filename_new);
    //             //Local path
    //             selfiepict_local_path = './temp/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
    //             //SeaweedFs path
    //             selfiepict_seaweedfs_path = '/' + mongoose_gen_meida + '/selfiepict/';

    //             // //Create Folder Id
    //             // if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //             //     await fse.move('./temp/' + selfiepict_filename_new, './temp/' + mongoose_gen_meida + '/' + selfiepict_filename_new);
    //             // } else {
    //             //     await this.errorHandler.generateNotAcceptableException(
    //             //         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //             //     );
    //             // }

    //             //Create Folder Id
    //             if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {
    //                 //Create folder selfiepict
    //                 if (await this.utilsService.createFolder('./temp/' + mongoose_gen_meida + '/', 'selfiepict')) {
    //                     //Move File
    //                     await fse.move('./temp/' + selfiepict_filename_new, './temp/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder selfiepict',
    //                     );
    //                 }
    //             } else {
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed create folder ' + mongoose_gen_meida
    //                 );
    //             }

    //             //Upload Seaweedfs
    //             try {
    //                 FormData_.append('selfiepict', fs.createReadStream(path.resolve(selfiepict_local_path)));
    //                 await this.seaweedfsService.write(selfiepict_seaweedfs_path, FormData_);
    //             } catch (err) {

    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed selfiepict failed upload seaweedfs ' + err,
    //                 );
    //             }
    //         } else {


    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed selfiepict is required',
    //             );
    //         }
    //         //Ceck supportFile
    //         if (files1.supportFile != undefined) {


    //             for (var i = 0; i < countfile; i++) {
    //                 var FormData_ = new FormData();
    //                 supportFile_data = files1.supportFile[i];
    //                 supportFile_mimetype = files1.supportFile[i].mimetype;
    //                 supportFile_filename = files1.supportFile[i].filename;
    //                 supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
    //                 supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

    //                 //New Name file supportFile
    //                 supportFile_filename_new = IdMediaproofpictsDto + '_000' + (i + 1) + '.' + supportFile_etx;
    //                 //Rename Name file supportFile
    //                 fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

    //                 //Local path
    //                 supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
    //                 //SeaweedFs path
    //                 supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/supportfile/';

    //                 //Create Folder Id
    //                 if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //                     await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                     );
    //                 }

    //                 //Upload Seaweedfs
    //                 try {
    //                     FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
    //                     await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
    //                 } catch (err) {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed proofpict failed upload seaweedfs',
    //                     );
    //                 }

    //                 var objSuri = '/localrepo/' + mongoose_gen_meida + '/supportfile/' + supportFile_filename_new;
    //                 var objsname = supportFile_filename_new.replace('_000' + i, '');

    //                 arrayUri.push(supportFile_filename_new);
    //                 arrayName.push(supportFile_filename);
    //                 arraySuri.push(objSuri);
    //                 arraySname.push(objsname);
    //             }

    //         } else {
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed supportFile is required',
    //             );
    //         }


    //         // /Ceck Data user proofPict
    //         // Ceck Data user proofPict

    //         //Update proofPict
    //         try {


    //             CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
    //             CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
    //             CreateMediaproofpictsDto_.active = true;
    //             CreateMediaproofpictsDto_.valid = false;
    //             CreateMediaproofpictsDto_.createdAt = current_date;
    //             CreateMediaproofpictsDto_.updatedAt = current_date;
    //             CreateMediaproofpictsDto_.postType = 'proofpict';
    //             CreateMediaproofpictsDto_.mediaType = 'image';
    //             CreateMediaproofpictsDto_.mediaBasePath = mongoose_gen_meida + '/proofpict/';
    //             CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
    //             CreateMediaproofpictsDto_.originalName = cardPict_filename;
    //             CreateMediaproofpictsDto_.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
    //             CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
    //             CreateMediaproofpictsDto_.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/proofpict/' + cardPict_filename_new;
    //             CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
    //             CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
    //             CreateMediaproofpictsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
    //             CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
    //             CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
    //             CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
    //             CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
    //             CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
    //             CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
    //             CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
    //             CreateMediaproofpictsDto_.mediaSelfieBasePath = mongoose_gen_meida + '/selfiepict/';
    //             CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
    //             CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
    //             CreateMediaproofpictsDto_.SelfiefsSourceUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
    //             CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new.replace(cardPict_etx, 'jpg').replace('_0001', '');
    //             CreateMediaproofpictsDto_.SelfiefsTargetUri = '/localrepo/' + mongoose_gen_meida + '/selfiepict/' + selfiepict_filename_new;
    //             CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
    //             CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
    //             await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
    //             await this.userbasicsService.updatebyEmail(datauserbasicsService.email.toString(), {
    //                 idProofName: CreateMediaproofpictsDto_.nama,
    //                 idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
    //                 idProofStatus: 'COMPLETE',
    //                 isIdVerified: false,
    //                 statusKyc: 'review',
    //                 proofPict: {
    //                     $ref: 'mediaproofpicts',
    //                     $id: new Object(IdMediaproofpictsDto),
    //                     $db: 'hyppe_content_db'
    //                 }
    //             });
    //             await this.utilsService.sendFcmV2(datauserbasicsService.email.toString(), datauserbasicsService.email.toString(), 'KYC', 'REQUEST', 'KYC_REVIEW');

    //             // await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
    //         } catch (err) {
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed failed update Mediaproofpicts ' + err,
    //             );
    //         }



    //         //Delete directory recursively

    //         fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //         });

    //         return {
    //             "response_code": 202,
    //             "data": {
    //                 "id_mediaproofpicts": IdMediaproofpictsDto,
    //                 "status": "IN_PROGGRESS"
    //             },
    //             "messages": {
    //                 "info": [
    //                     "Success Upload"
    //                 ]
    //             }
    //         };
    //     } else {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed user not found',
    //         );
    //     }
    // }

    @Post('api/mediaproofpicts/listkyc')
    @UseGuards(JwtAuthGuard)
    async profileuser(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var keys = null;
        var data = null;
        var page = null;
        var limit = null;
        var startdate = null;
        var enddate = null;
        var status = null;

        var descending = null;

        const messages = {
            "info": ["The process successful"],
        };
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        keys = request_json["keys"];
        status = request_json["status"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        descending = request_json["descending"];
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        try {
            // data = await this.mediaproofpictsService.listkyc(keys, status, startdate, enddate, descending, page, limit);
            data = await this.userbasicsService.listkycsummary2(startdate, enddate, 'listing', keys, status, descending, page, limit);
        } catch (e) {
            data = null;
        }
        // let datasearch = await this.mediaproofpictsService.listkyc(keys, status, startdate, enddate, descending, 0, 0);
        // var totalsearch = datasearch.length;
        // var allrow = await this.mediaproofpictsService.listkyc(undefined, undefined, undefined, undefined, descending, 0, 0);
        // var totalallrow = allrow.length;
        var totalrow = data.length;

        // var tpage = null;
        // var tpage2 = null;
        // var totalpage = null;
        // tpage2 = (totalsearch / limit).toFixed(0);
        // tpage = (totalsearch % limit);
        // if (tpage > 0 && tpage < 5) {
        //     totalpage = parseInt(tpage2) + 1;

        // } else {
        //     totalpage = parseInt(tpage2);
        // }

        return { response_code: 202, data, page, limit, totalrow, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };
    }

    @Post('api/mediaproofpicts/listkyc/v2')
    @UseGuards(JwtAuthGuard)
    async profileuser2(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var keys = null;
        var data = null;
        var page = null;
        var limit = null;
        var startdate = null;
        var enddate = null;
        var status = null;

        var descending = null;

        const messages = {
            "info": ["The process successful"],
        };
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        keys = request_json["keys"];
        status = request_json["status"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        descending = request_json["descending"];
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        try {
            // data = await this.mediaproofpictsService.listkyc(keys, status, startdate, enddate, descending, page, limit);
            data = await this.basic2SS.listkycsummary2(startdate, enddate, 'listing', keys, status, descending, page, limit);
        } catch (e) {
            data = null;
        }
        // let datasearch = await this.mediaproofpictsService.listkyc(keys, status, startdate, enddate, descending, 0, 0);
        // var totalsearch = datasearch.length;
        // var allrow = await this.mediaproofpictsService.listkyc(undefined, undefined, undefined, undefined, descending, 0, 0);
        // var totalallrow = allrow.length;
        var totalrow = data.length;

        // var tpage = null;
        // var tpage2 = null;
        // var totalpage = null;
        // tpage2 = (totalsearch / limit).toFixed(0);
        // tpage = (totalsearch % limit);
        // if (tpage > 0 && tpage < 5) {
        //     totalpage = parseInt(tpage2) + 1;

        // } else {
        //     totalpage = parseInt(tpage2);
        // }

        return { response_code: 202, data, page, limit, totalrow, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };
    }

    @Post('api/mediaproofpicts/detailkyc')
    @UseGuards(JwtAuthGuard)
    async detailkyc(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));

        var id = null;
        var datakyc = null;
        var obj = {};
        var data = [];
        var fileselfiepict = null;
        var fileproofpict = null;
        var filesupport = [];
        var newselfie = null;
        var newproof = null;
        var newsupport = null;
        var lengsupport = null;
        var datafriend = null;
        var lengfrend = null;
        var totalfriend = null;

        var arrsuport = [];
        const messages = {
            "info": ["The process successful"],
        };


        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        try {
            datakyc = await this.mediaproofpictsService.detailkyc(id);
            try {
                datafriend = await this.friendListService.findOnebyemail(datakyc[0].email);
                totalfriend = datafriend.totalfriend;
            } catch (e) {
                datafriend = null;
                totalfriend = 0;
            }
            try {
                fileselfiepict = datakyc[0].mediaSelfieUri;
                let splitselfi = fileselfiepict.split('_');
                newselfie = "/selfiepict/" + splitselfi[0].toString();

            } catch (e) {
                fileselfiepict = "";
                newselfie = "";
            }
            try {

                fileproofpict = datakyc[0].mediaSelfieUri;
                let splitproof = fileproofpict.split('_');
                newproof = "/proofpict/" + splitproof[0].toString();

            } catch (e) {
                fileproofpict = "";
                newproof = "";
            }

            try {

                filesupport = datakyc[0].mediaSupportUri;
                lengsupport = filesupport.length;
            } catch (e) {
                filesupport = [];
                lengsupport = 0;
            }


            if (lengsupport > 0) {
                for (let i = 0; i < lengsupport; i++) {
                    let splitsupport = filesupport[i].split('_');
                    newsupport = "/supportfile/" + splitsupport[0].toString() + "/" + i;
                    arrsuport.push(newsupport);

                }
            }
            arrsuport.push(newproof);
            arrsuport.push(newselfie);
            var objinsig = {};
            if (datakyc[0].insight !== null) {
                objinsig = {

                    followers: datakyc[0].insight.followers,
                    followings: datakyc[0].insight.followings,
                    friends: totalfriend
                };
            } else {
                objinsig = {};
            }


            obj = {

                "_id": datakyc[0]._id,
                "createdAt": datakyc[0].createdAt,
                "nama": datakyc[0].nama,
                "fullName": datakyc[0].fullName,
                "jenisKelamin": datakyc[0].jenisKelamin,
                "tempatLahir": datakyc[0].tempatLahir,
                "mobileNumber": datakyc[0].mobileNumber,
                "alamat": datakyc[0].alamat,
                "agama": datakyc[0].agama,
                "statusPerkawinan": datakyc[0].statusPerkawinan,
                "pekerjaan": datakyc[0].pekerjaan,
                "kewarganegaraan": datakyc[0].kewarganegaraan,
                "FileEndpoint": arrsuport,
                "idcardnumber": datakyc[0].idcardnumber,
                "email": datakyc[0].email,
                "isIdVerified": datakyc[0].isIdVerified,
                "tglLahir": datakyc[0].tglLahir,
                "username": datakyc[0].username,
                "status": datakyc[0].status,
                "statusUser": datakyc[0].statusUser,
                "jumlahPermohonan": datakyc[0].jumlahPermohonan,
                "tahapan": datakyc[0].tahapan,
                "avatar": datakyc[0].avatar,
                "countries": datakyc[0].countries,
                "area": datakyc[0].area,
                "cities": datakyc[0].cities,
                "insight": objinsig
            }
            data.push(obj);
        } catch (e) {
            throw new BadRequestException("Data not found..!" + e);
        }



        return { response_code: 202, data, messages };
    }

    @Post('api/mediaproofpicts/detailkyc/v2')
    @UseGuards(JwtAuthGuard)
    async detailkyc2(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));

        var id = null;
        var datakyc = null;
        var obj = {};
        var data = [];
        var fileselfiepict = null;
        var fileproofpict = null;
        var filesupport = [];
        var newselfie = null;
        var newproof = null;
        var newsupport = null;
        var lengsupport = null;
        var datafriend = null;
        var lengfrend = null;
        var totalfriend = null;

        var arrsuport = [];
        const messages = {
            "info": ["The process successful"],
        };


        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        try {
            datakyc = await this.basic2SS.detailkyc(id);
            try {
                datafriend = datakyc[0].friend;
                totalfriend = datafriend.totalfriend;
            } catch (e) {
                datafriend = null;
                totalfriend = 0;
            }
            try {
                fileselfiepict = datakyc[0].mediaSelfieUri;
                let splitselfi = fileselfiepict.split('_');
                newselfie = "/selfiepict/" + splitselfi[0].toString();

            } catch (e) {
                fileselfiepict = "";
                newselfie = "";
            }
            try {

                fileproofpict = datakyc[0].mediaSelfieUri;
                let splitproof = fileproofpict.split('_');
                newproof = "/proofpict/" + splitproof[0].toString();

            } catch (e) {
                fileproofpict = "";
                newproof = "";
            }

            try {

                filesupport = datakyc[0].mediaSupportUri;
                lengsupport = filesupport.length;
            } catch (e) {
                filesupport = [];
                lengsupport = 0;
            }


            if (lengsupport > 0) {
                for (let i = 0; i < lengsupport; i++) {
                    let splitsupport = filesupport[i].split('_');
                    newsupport = "/supportfile/" + splitsupport[0].toString() + "/" + i;
                    arrsuport.push(newsupport);

                }
            }
            arrsuport.push(newproof);
            arrsuport.push(newselfie);
            var objinsig = {};
            if (datakyc[0].insight !== null) {
                objinsig = {

                    followers: datakyc[0].insight.followers,
                    followings: datakyc[0].insight.followings,
                    friends: totalfriend
                };
            } else {
                objinsig = {};
            }


            obj = {

                "_id": datakyc[0]._id,
                "createdAt": datakyc[0].createdAt,
                "nama": datakyc[0].nama,
                "fullName": datakyc[0].fullName,
                "jenisKelamin": datakyc[0].jenisKelamin,
                "tempatLahir": datakyc[0].tempatLahir,
                "mobileNumber": datakyc[0].mobileNumber,
                "alamat": datakyc[0].alamat,
                "agama": datakyc[0].agama,
                "statusPerkawinan": datakyc[0].statusPerkawinan,
                "pekerjaan": datakyc[0].pekerjaan,
                "kewarganegaraan": datakyc[0].kewarganegaraan,
                "FileEndpoint": arrsuport,
                "idcardnumber": datakyc[0].idcardnumber,
                "email": datakyc[0].email,
                "isIdVerified": datakyc[0].isIdVerified,
                "tglLahir": datakyc[0].tglLahir,
                "username": datakyc[0].username,
                "status": datakyc[0].status,
                "statusUser": datakyc[0].statusUser,
                "jumlahPermohonan": datakyc[0].jumlahPermohonan,
                "tahapan": datakyc[0].tahapan,
                "avatar": datakyc[0].avatar,
                "countries": datakyc[0].countries,
                "area": datakyc[0].area,
                "cities": datakyc[0].cities,
                "insight": objinsig
            }
            data.push(obj);
        } catch (e) {
            throw new BadRequestException("Data not found..!" + e);
        }



        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/mediaproofpicts/approve')
    async reportHandleAproval(@Req() request) {
        var id = null;
        var nama = null;
        var tempatLahir = null;
        var jenisKelamin = null;
        var tglLahir = null;
        var noktp = null;
        var status = null;
        var datakyc = null;
        var iduserhandle = null;
        var kycHandle = [];
        var dataemailuser = null;
        var databasic = null;
        var email = null;
        var reasonId = null;
        var reasonValue = null;
        var remark = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        nama = request_json["nama"];
        tempatLahir = request_json["tempatLahir"];
        jenisKelamin = request_json["jenisKelamin"];
        tglLahir = request_json["tglLahir"];
        noktp = request_json["noktp"];
        status = request_json["status"];
        iduserhandle = request_json["iduserhandle"];
        reasonId = request_json["reasonId"];
        reasonValue = request_json["reasonValue"];
        remark = request_json["remark"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };



        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var iduser = mongoose.Types.ObjectId(iduserhandle);

        try {
            dataemailuser = await this.mediaproofpictsService.finduser(id);
            email = dataemailuser[0].email;
        } catch (e) {
            dataemailuser = null;
            email = "";
        }


        if (status === "DISETUJUI") {
            kycHandle = [
                {
                    noktp: noktp,
                    nama: nama,
                    createdAt: dt.toISOString(),
                    jenisKelamin: jenisKelamin,
                    tempatLahir: tempatLahir,
                    tglLahir: tglLahir,
                    status: "FINISH",
                    iduserhandle: iduser,
                    reasonId: null,
                    reasonValue: "",
                    remark: ""
                }

            ];
            try {

                let data = await this.mediaproofpictsService.updateKyc(id, noktp, nama, tglLahir, tempatLahir, jenisKelamin, "DISETUJUI", kycHandle);
                await this.userbasicsService.updateStatusKycName(nama, jenisKelamin, email, true, "verified", tglLahir);
                await this.utilsService.sendFcmV2(email.toString(), email.toString(), 'KYC', 'REQUEST', 'KYC_VERIFIED');

                return { response_code: 202, data, messages };

            } catch (e) {
                throw new BadRequestException("Unabled to proceed " + e);

            }
        } else if (status === "DITOLAK") {
            kycHandle = [
                {
                    noktp: noktp,
                    nama: nama,
                    createdAt: dt.toISOString(),
                    jenisKelamin: jenisKelamin,
                    tempatLahir: tempatLahir,
                    tglLahir: tglLahir,
                    status: "FAILED",
                    iduserhandle: iduser,
                    reasonId: reasonId,
                    reasonValue: reasonValue,
                    remark: remark
                }

            ];
            try {
                let data = await this.mediaproofpictsService.updateKyc(id, noktp, nama, tglLahir, tempatLahir, jenisKelamin, "FAILED", kycHandle);
                await this.userbasicsService.updateStatusKycFailed(email, false, "unverified");
                await this.utilsService.sendFcmV2(email.toString(), email.toString(), 'KYC', 'REQUEST', 'KYC_REJECT');

                return { response_code: 202, data, messages };

            } catch (e) {
                throw new BadRequestException("Unabled to proceed " + e);


            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/mediaproofpicts/approve/v2')
    async reportHandleAproval2(@Req() request) {
        var id = null;
        var nama = null;
        var tempatLahir = null;
        var jenisKelamin = null;
        var tglLahir = null;
        var noktp = null;
        var status = null;
        var datakyc = null;
        var loaddatakyc = null;
        var iduserhandle = null;
        var kycHandle = [];
        var dataemailuser = null;
        var databasic = null;
        var email = null;
        var reasonId = null;
        var reasonValue = null;
        var remark = null;
        var listchallenge = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        nama = request_json["nama"];
        tempatLahir = request_json["tempatLahir"];
        jenisKelamin = request_json["jenisKelamin"];
        tglLahir = request_json["tglLahir"];
        noktp = request_json["noktp"];
        status = request_json["status"];
        iduserhandle = request_json["iduserhandle"];
        reasonId = request_json["reasonId"];
        reasonValue = request_json["reasonValue"];
        remark = request_json["remark"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            listchallenge = request_json['listchallenge'];
        } catch (e) {
            listchallenge = [];
        }


        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var iduser = mongoose.Types.ObjectId(iduserhandle);

        try {
            dataemailuser = await this.basic2SS.findOne(id);
            email = dataemailuser.email;
            loaddatakyc = dataemailuser.kyc[0];

            // var setutil = require('util');
            // console.log(setutil.inspect(loaddatakyc, { showHidden: false, depth: null }));

            loaddatakyc['idcardnumber'] = noktp;
            loaddatakyc['nama'] = nama;
            loaddatakyc['tglLahir'] = tglLahir;
            loaddatakyc['tempatLahir'] = tempatLahir;
            loaddatakyc['jenisKelamin'] = jenisKelamin;

            let hasduplicateidcardnumber = await this.basic2SS.getDuplicateIdCardNumber(noktp, dataemailuser.email);
            if (hasduplicateidcardnumber) {
                throw new BadRequestException("error, found duplicate ID card number");
            }
        } catch (e) {
            throw new BadRequestException("Unable to proceed!!, " + e);

            dataemailuser = null;
            email = "";
            loaddatakyc =
            {
                "idcardnumber": noktp,
                "nama": nama,
                "tglLahir": tglLahir,
                "tempatLahir": tempatLahir,
                "jenisKelamin": jenisKelamin
            };
        }

        if (status === "DISETUJUI") {
            loaddatakyc['kycHandle'] = [
                {
                    noktp: noktp,
                    nama: nama,
                    createdAt: dt.toISOString(),
                    jenisKelamin: jenisKelamin,
                    tempatLahir: tempatLahir,
                    tglLahir: tglLahir,
                    status: "FINISH",
                    iduserhandle: iduser,
                    reasonId: null,
                    reasonValue: "",
                    remark: ""
                }

            ];
            loaddatakyc['status'] = 'DISETUJUI';
            try {

                await this.basic2SS.updateStatusKycName(nama, jenisKelamin, email, true, "verified", tglLahir, [loaddatakyc]);
                await this.utilsService.sendFcmV2(email.toString(), email.toString(), 'KYC', 'REQUEST', 'KYC_VERIFIED');
                var checkreferraldata = await this.referralSS.findPendingStatusByChildren(dataemailuser.email.toString());
                if(await this.utilsService.ceckData(checkreferraldata) == true)
                {
                    this.followUser(dataemailuser, checkreferraldata, listchallenge);
                }

                return { response_code: 202, data: loaddatakyc.kycHandle[0], messages };

            } catch (e) {
                throw new BadRequestException("Unable to proceed, " + e);

            }
        } else if (status === "DITOLAK") {
            loaddatakyc['kycHandle'] = [
                {
                    noktp: noktp,
                    nama: nama,
                    createdAt: dt.toISOString(),
                    jenisKelamin: jenisKelamin,
                    tempatLahir: tempatLahir,
                    tglLahir: tglLahir,
                    status: "FAILED",
                    iduserhandle: iduser,
                    reasonId: reasonId,
                    reasonValue: reasonValue,
                    remark: remark
                }

            ];

            loaddatakyc['status'] = 'FAILED';
            try {
                await this.basic2SS.updateStatusKycFailed(email, false, "unverified", [loaddatakyc]);
                await this.utilsService.sendFcmV2(email.toString(), email.toString(), 'KYC', 'REQUEST', 'KYC_REJECT');

                return { response_code: 202, data: loaddatakyc.kycHandle[0], messages };

            } catch (e) {
                throw new BadRequestException("Unable to proceed, " + e);


            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/supportfile')
    @UseInterceptors(AnyFilesInterceptor())
    async uploadsuportfileNEW(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }

        var countfile = files.length;
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
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];
        var emailuserbasic = null;
        var iduserbasic = null;
        var url_cardPict = null;
        let id_mediaproofpicts_ = null;
        var url_cardPict_thum = null;
        var arrayThumbUri = [];
        var supportFile_filename_new_thum = null;
        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );


        //Ceck User mediaproof
        const datamediaproofService = await this.mediaproofpictsService.findOne(
            idmediaproofpict
        );

        if (await this.utilsService.ceckData(datauserbasicsService)) {
            emailuserbasic = datauserbasicsService.email;
            iduserbasic = datauserbasicsService._id.toString();


            if (await this.utilsService.ceckData(datamediaproofService)) {

                var paths = datamediaproofService.mediaBasePath.toString();
                // var mongoose_gen_meida = paths.replace("/PROOF_PICTURE/", "");
                var mongoose_gen_meidas = paths.split('/');
                var mongoose_gen_meida = mongoose_gen_meidas[0];
                //Ceck supportFile
                if (files != undefined) {


                    for (var i = 0; i < countfile; i++) {
                        var FormData_ = new FormData();
                        supportFile_data = files[i];


                        supportFile_filename = files[i].originalname;
                        supportFile_etx = '.jpeg';
                        supportFile_filename_new = idmediaproofpict + '_000' + (i + 1) + supportFile_etx;
                        supportFile_mimetype = files[i].mimetype;

                        var result = await this.ossService.uploadFile(files[i], iduserbasic + "/kyc/supportfile/" + supportFile_filename_new);
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

                        var cardPict_thum = await this.generate_thumnail(files[i], "jpeg");
                        supportFile_filename_new_thum = mongoose_gen_meida + "_thum" + '_000' + (i + 1) + supportFile_etx;
                        var result_thum = await this.ossService.uploadFileBuffer(cardPict_thum, iduserbasic + "/kyc/supportfile/" + supportFile_filename_new_thum);
                        if (result_thum != undefined) {
                            if (result_thum.res != undefined) {
                                if (result_thum.res.statusCode != undefined) {
                                    if (result_thum.res.statusCode == 200) {
                                        url_cardPict_thum = result_thum.res.requestUrls[0];
                                    } else {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unabled to proceed cardPict failed upload',
                                        );
                                    }
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed cardPict failed upload',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                        var pathnew = iduserbasic + '/kyc/supportfile/' + supportFile_filename_new
                        arrayUri.push(pathnew);
                        arrayThumbUri.push(url_cardPict_thum);
                        arrayName.push(supportFile_filename);
                        arraySuri.push(url_cardPict);
                        arraySname.push(supportFile_filename);
                    }

                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed supportFile is required',
                    );
                }

                //Ceck Data user proofPict
                if (datamediaproofService._id != undefined) {
                    //Update proofPict
                    try {

                        var data_mediaproofpicts = datamediaproofService;
                        id_mediaproofpicts_ = data_mediaproofpicts._id;
                        CreateMediaproofpictsDto_._id = data_mediaproofpicts._id;
                        CreateMediaproofpictsDto_.mediaID = data_mediaproofpicts.mediaID;
                        CreateMediaproofpictsDto_.active = true;
                        CreateMediaproofpictsDto_.valid = false;
                        CreateMediaproofpictsDto_.createdAt = current_date;
                        CreateMediaproofpictsDto_.updatedAt = current_date;
                        CreateMediaproofpictsDto_.SupportUploadSource = "OSS";
                        CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
                        CreateMediaproofpictsDto_.mediaSupportBasePath = idmediaproofpict + '/supportfile/';
                        CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
                        CreateMediaproofpictsDto_.mediaSupportUriThumb = arrayThumbUri;
                        CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
                        CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
                        CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
                        CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
                        CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
                        CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
                        await this.mediaproofpictsService.updatebyId(idmediaproofpict, CreateMediaproofpictsDto_);
                    } catch (err) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed failed update Mediaproofpicts ' + err,
                        );
                    }
                }
                else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed supportFile is required',
                    );

                }

                return {
                    "response_code": 202,
                    "data": {
                        "id_mediaproofpicts": idmediaproofpict,
                        "status": "IN_PROGGRESS"
                    },
                    "messages": {
                        "info": [
                            "Success Upload"
                        ]
                    }
                };
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed user not found',
                );
            }
        }
        else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/upload')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }, { name: 'supportFile', maxCount: 10, }]))
    async uploadnew(
        @UploadedFiles() files1: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[],
            supportFile?: Express.Multer.File[]
        },
        // @UploadedFiles() files2: Array<Express.Multer.File>,
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        //  var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();


        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email is required',
            );
        }

        var iduserbasic = null;
        var url_cardPict = null;

        var countfile = files1.supportFile.length;
        //Var supportFile
        let supportFile_data = null;
        let supportFile_filename = '';
        let supportFile_etx = '';
        let supportFile_mimetype = '';
        let supportFile_name = '';
        let supportFile_filename_new = '';
        let supportFile_local_path = '';
        let supportFile_seaweedfs_path = '';
        var url_cardPict = null;
        var url_supportPict = null;
        var url_selfiepict = null;

        var arrayUri = [];
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];
        var arrayThumbUri = [];
        //Var cardPict
        let cardPict_data = null;
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_name = '';
        let cardPict_filename_new = '';
        let cardPict_local_path = '';
        let cardPict_seaweedfs_path = '';

        //Var selfiepict
        let selfiepict_data = null;
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_name = '';
        let selfiepict_filename_new = '';
        let selfiepict_local_path = '';
        let selfiepict_seaweedfs_path = '';
        var emailuserbasic = null;
        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose


        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        var titleinsukses = null;
        var titleensukses = null;
        var bodyinsukses = null;
        var bodyensukses = null;
        var eventType = null;
        var supportFile_filename_new_thum = null;
        var event = null;
        if (await this.utilsService.ceckData(datauserbasicsService)) {
            // var mongoose_gen_meida = new mongoose.Types.ObjectId();
            titleinsukses = "Dalam Proses Verifikasi";
            titleensukses = "Verification On Progress";
            bodyinsukses = "Hai " + datauserbasicsService.fullName + "! Kami sedang meninjau data yang Anda kirimkan. ini akan memakan waktu 3x24 jam proses";
            bodyensukses = "Hi " + datauserbasicsService.fullName + "! We are currently reviewing the data you submitted. this will take a 3x24 hour process";
            eventType = "SUPPORTFILE";
            event = "REQUEST";

            emailuserbasic = datauserbasicsService.email;
            iduserbasic = datauserbasicsService._id.toString();

            var paths = IdMediaproofpictsDto;
            var mongoose_gen_meida = paths;
            var url_cardPict_thum = null;
            //Ceck cardPict
            if (files1.cardPict != undefined) {
                var FormData_ = new FormData();
                cardPict_filename = files1.cardPict[0].originalname;

                cardPict_etx = '.jpeg';
                cardPict_filename_new = iduserbasic + cardPict_etx;
                cardPict_mimetype = files1.cardPict[0].mimetype;

                var result = await this.ossService.uploadFile(files1.cardPict[0], iduserbasic + "/kyc/proofpict/" + cardPict_filename_new);
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_cardPict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed cardPict failed upload',
                    );
                }


                //Ceck selfiepict
                if (files1.selfiepict != undefined) {
                    var FormData_ = new FormData();
                    selfiepict_filename = files1.selfiepict[0].originalname;

                    selfiepict_etx = '.jpeg';
                    selfiepict_filename_new = iduserbasic + selfiepict_etx;
                    selfiepict_mimetype = files1.selfiepict[0].mimetype;

                    var result = await this.ossService.uploadFile(files1.selfiepict[0], iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new);
                    if (result != undefined) {
                        if (result.res != undefined) {
                            if (result.res.statusCode != undefined) {
                                if (result.res.statusCode == 200) {
                                    url_selfiepict = result.res.requestUrls[0];
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed cardPict failed upload',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed cardPict failed upload',
                        );
                    }
                } else {


                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed selfiepict is required',
                    );
                }
                //Ceck supportFile
                if (files1.supportFile != undefined) {


                    for (var i = 0; i < countfile; i++) {
                        var FormData_ = new FormData();
                        supportFile_data = files1.supportFile[i];


                        supportFile_filename = files1.supportFile[i].originalname;
                        supportFile_etx = '.jpeg';
                        supportFile_filename_new = mongoose_gen_meida + '_000' + (i + 1) + supportFile_etx;
                        supportFile_mimetype = files1.supportFile[i].mimetype;


                        var result = await this.ossService.uploadFile(files1.supportFile[i], iduserbasic + "/kyc/supportfile/" + supportFile_filename_new);
                        console.log(result)
                        if (result != undefined) {
                            if (result.res != undefined) {
                                if (result.res.statusCode != undefined) {
                                    if (result.res.statusCode == 200) {
                                        url_supportPict = result.res.requestUrls[0];
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

                        var cardPict_thum = await this.generate_thumnail(files1.supportFile[i], "jpeg");
                        supportFile_filename_new_thum = mongoose_gen_meida + "_thum" + '_000' + (i + 1) + supportFile_etx;
                        var result_thum = await this.ossService.uploadFileBuffer(cardPict_thum, iduserbasic + "/kyc/supportfile/" + supportFile_filename_new_thum);
                        if (result_thum != undefined) {
                            if (result_thum.res != undefined) {
                                if (result_thum.res.statusCode != undefined) {
                                    if (result_thum.res.statusCode == 200) {
                                        url_cardPict_thum = result_thum.res.requestUrls[0];
                                    } else {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unabled to proceed cardPict failed upload',
                                        );
                                    }
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed cardPict failed upload',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed cardPict failed upload',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed cardPict failed upload',
                            );
                        }
                        var pathnew = iduserbasic + '/kyc/supportfile/' + supportFile_filename_new
                        arrayUri.push(pathnew);
                        arrayThumbUri.push(url_cardPict_thum);
                        arrayName.push(supportFile_filename);
                        arraySuri.push(url_cardPict);
                        arraySname.push(supportFile_filename);
                    }
                }

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );
            }


            // /Ceck Data user proofPict
            // Ceck Data user proofPict

            //Update proofPict
            try {


                CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                CreateMediaproofpictsDto_.active = true;
                CreateMediaproofpictsDto_.valid = false;
                CreateMediaproofpictsDto_.createdAt = current_date;
                CreateMediaproofpictsDto_.updatedAt = current_date;


                CreateMediaproofpictsDto_.mediaType = 'image';
                CreateMediaproofpictsDto_.postType = 'proofpict';
                CreateMediaproofpictsDto_.mediaBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new;
                CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                CreateMediaproofpictsDto_.originalName = cardPict_filename;
                CreateMediaproofpictsDto_.fsSourceUri = url_cardPict;
                CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new;
                CreateMediaproofpictsDto_.fsTargetUri = url_cardPict;
                CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                CreateMediaproofpictsDto_.proofpictUploadSource = "OSS";

                CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                CreateMediaproofpictsDto_.mediaSelfieBasePath = iduserbasic + '/kyc/selfiepict/' + selfiepict_filename_new;
                CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                CreateMediaproofpictsDto_.SelfiefsSourceUri = url_selfiepict;
                CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfiefsTargetUri = url_selfiepict;
                CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                CreateMediaproofpictsDto_.SelfieUploadSource = "OSS";


                CreateMediaproofpictsDto_.SupportUploadSource = "OSS";
                CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
                CreateMediaproofpictsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
                CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
                CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
                CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
                CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
                CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
                CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
                CreateMediaproofpictsDto_.mediaSupportUriThumb = arrayThumbUri;


                CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
                await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                await this.userbasicsService.updatebyEmail(datauserbasicsService.email.toString(), {
                    idProofName: CreateMediaproofpictsDto_.nama,
                    idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                    idProofStatus: 'COMPLETE',
                    isIdVerified: false,
                    statusKyc: 'review',
                    proofPict: {
                        $ref: 'mediaproofpicts',
                        $id: new Object(IdMediaproofpictsDto),
                        $db: 'hyppe_content_db'
                    }
                });
                await this.utilsService.sendFcmV2(datauserbasicsService.email.toString(), datauserbasicsService.email.toString(), 'KYC', 'REQUEST', 'KYC_REVIEW');

                // await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
            } catch (err) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed update Mediaproofpicts ' + err,
                );
            }




            return {
                "response_code": 202,
                "data": {
                    "id_mediaproofpicts": IdMediaproofpictsDto,
                    "status": "IN_PROGGRESS"
                },
                "messages": {
                    "info": [
                        "Success Upload"
                    ]
                }
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/posts/upload/v2')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'cardPict', maxCount: 1 }, { name: 'selfiepict', maxCount: 1, }, { name: 'supportFile', maxCount: 10, }]))
    async uploadnewv2(
        @UploadedFiles() files1: {
            cardPict?: Express.Multer.File[],
            selfiepict?: Express.Multer.File[],
            supportFile?: Express.Multer.File[]
        },
        // @UploadedFiles() files2: Array<Express.Multer.File>,
        @Body() CreateMediaproofpictsDto_: CreateMediaproofpictsDto,
        @Headers() headers) {
        //  var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();


        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, token and email do not match',
            );
        }

        if (headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, email is required',
            );
        }

        var iduserbasic = null;
        var url_cardPict = null;

        var countfile = files1.supportFile.length;
        //Var supportFile
        let supportFile_data = null;
        let supportFile_filename = '';
        let supportFile_etx = '';
        let supportFile_mimetype = '';
        let supportFile_name = '';
        let supportFile_filename_new = '';
        let supportFile_local_path = '';
        let supportFile_seaweedfs_path = '';
        var url_cardPict = null;
        var url_supportPict = null;
        var url_selfiepict = null;

        var arrayUri = [];
        var arrayName = [];
        var arraySuri = [];
        var arraySname = [];
        var arrayThumbUri = [];
        //Var cardPict
        let cardPict_data = null;
        let cardPict_filename = '';
        let cardPict_etx = '';
        let cardPict_mimetype = '';
        let cardPict_name = '';
        let cardPict_filename_new = '';
        let cardPict_local_path = '';
        let cardPict_seaweedfs_path = '';

        //Var selfiepict
        let selfiepict_data = null;
        let selfiepict_filename = '';
        let selfiepict_etx = '';
        let selfiepict_mimetype = '';
        let selfiepict_name = '';
        let selfiepict_filename_new = '';
        let selfiepict_local_path = '';
        let selfiepict_seaweedfs_path = '';
        var emailuserbasic = null;
        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose


        //Ceck User Userbasics
        const datauserbasicsService = await this.basic2SS.findBymail(
            headers['x-auth-user'],
        );

        var titleinsukses = null;
        var titleensukses = null;
        var bodyinsukses = null;
        var bodyensukses = null;
        var eventType = null;
        var supportFile_filename_new_thum = null;
        var event = null;
        if (await this.utilsService.ceckData(datauserbasicsService)) {
            // var mongoose_gen_meida = new mongoose.Types.ObjectId();
            titleinsukses = "Dalam Proses Verifikasi";
            titleensukses = "Verification On Progress";
            bodyinsukses = "Hai " + datauserbasicsService.fullName + "! Kami sedang meninjau data yang Anda kirimkan. ini akan memakan waktu 3x24 jam proses";
            bodyensukses = "Hi " + datauserbasicsService.fullName + "! We are currently reviewing the data you submitted. this will take a 3x24 hour process";
            eventType = "SUPPORTFILE";
            event = "REQUEST";

            emailuserbasic = datauserbasicsService.email;
            iduserbasic = datauserbasicsService._id.toString();

            var paths = IdMediaproofpictsDto;
            var mongoose_gen_meida = paths;
            var url_cardPict_thum = null;
            //Ceck cardPict
            if (files1.cardPict != undefined) {
                var FormData_ = new FormData();
                cardPict_filename = files1.cardPict[0].originalname;

                cardPict_etx = '.jpeg';
                cardPict_filename_new = iduserbasic + cardPict_etx;
                cardPict_mimetype = files1.cardPict[0].mimetype;

                var result = await this.ossService.uploadFile(files1.cardPict[0], iduserbasic + "/kyc/proofpict/" + cardPict_filename_new);
                if (result != undefined) {
                    if (result.res != undefined) {
                        if (result.res.statusCode != undefined) {
                            if (result.res.statusCode == 200) {
                                url_cardPict = result.res.requestUrls[0];
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unable to proceed, cardPict failed to upload: response status code is not 200',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unable to proceed, cardPict failed to upload: response status code is undefined',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unable to proceed, cardPict failed to upload: response data is undefined',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unable to proceed, cardPict failed to upload: result is undefined',
                    );
                }


                //Ceck selfiepict
                if (files1.selfiepict != undefined) {
                    var FormData_ = new FormData();
                    selfiepict_filename = files1.selfiepict[0].originalname;

                    selfiepict_etx = '.jpeg';
                    selfiepict_filename_new = iduserbasic + selfiepict_etx;
                    selfiepict_mimetype = files1.selfiepict[0].mimetype;

                    var result = await this.ossService.uploadFile(files1.selfiepict[0], iduserbasic + "/kyc/selfiepict/" + selfiepict_filename_new);
                    if (result != undefined) {
                        if (result.res != undefined) {
                            if (result.res.statusCode != undefined) {
                                if (result.res.statusCode == 200) {
                                    url_selfiepict = result.res.requestUrls[0];
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unable to proceed, selfiePict failed to upload: response status code is not 200',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unable to proceed, selfiePict failed to upload: response status code is undefined',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unable to proceed, selfiePict failed to upload: response data is undefined',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unable to proceed, selfiePict failed to upload: response data is undefined',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unable to proceed, selfiepict is required',
                    );
                }
                //Ceck supportFile
                if (files1.supportFile != undefined) {

                    for (var i = 0; i < countfile; i++) {
                        var FormData_ = new FormData();
                        supportFile_data = files1.supportFile[i];

                        supportFile_filename = files1.supportFile[i].originalname;
                        supportFile_etx = '.jpeg';
                        supportFile_filename_new = mongoose_gen_meida + '_000' + (i + 1) + supportFile_etx;
                        supportFile_mimetype = files1.supportFile[i].mimetype;

                        var result = await this.ossService.uploadFile(files1.supportFile[i], iduserbasic + "/kyc/supportfile/" + supportFile_filename_new);
                        console.log(result)
                        if (result != undefined) {
                            if (result.res != undefined) {
                                if (result.res.statusCode != undefined) {
                                    if (result.res.statusCode == 200) {
                                        url_supportPict = result.res.requestUrls[0];
                                    } else {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unable to proceed, supportFile failed to upload: response status code is not 200',
                                        );
                                    }
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unable to proceed, supportFile failed to upload: response status code is undefined',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unable to proceed, supportFile failed to upload: response data is undefined',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unable to proceed, supportFile failed to upload: result is undefined',
                            );
                        }

                        var cardPict_thum = await this.generate_thumnail(files1.supportFile[i], "jpeg");
                        supportFile_filename_new_thum = mongoose_gen_meida + "_thum" + '_000' + (i + 1) + supportFile_etx;
                        var result_thum = await this.ossService.uploadFileBuffer(cardPict_thum, iduserbasic + "/kyc/supportfile/" + supportFile_filename_new_thum);
                        if (result_thum != undefined) {
                            if (result_thum.res != undefined) {
                                if (result_thum.res.statusCode != undefined) {
                                    if (result_thum.res.statusCode == 200) {
                                        url_cardPict_thum = result_thum.res.requestUrls[0];
                                    } else {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unable to proceed, cardPict thumnail failed to upload: response status code is not 200',
                                        );
                                    }
                                } else {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unable to proceed, cardPict thumnail failed to upload: response status code is undefined',
                                    );
                                }
                            } else {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unable to proceed, cardPict thumnail failed to upload: response data is undefined',
                                );
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unable to proceed, cardPict thumnail failed to upload: result is undefined',
                            );
                        }
                        var pathnew = iduserbasic + '/kyc/supportfile/' + supportFile_filename_new
                        arrayUri.push(pathnew);
                        arrayThumbUri.push(url_cardPict_thum);
                        arrayName.push(supportFile_filename);
                        arraySuri.push(url_cardPict);
                        arraySname.push(supportFile_filename);
                    }
                }

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unable to proceed, supportFile is required',
                );
            }

            // /Ceck Data user proofPict
            // Ceck Data user proofPict

            //Update proofPict
            try {

                CreateMediaproofpictsDto_._id = IdMediaproofpictsDto;
                CreateMediaproofpictsDto_.mediaID = IdMediaproofpictsDto;
                CreateMediaproofpictsDto_.active = true;
                CreateMediaproofpictsDto_.valid = false;
                CreateMediaproofpictsDto_.createdAt = current_date;
                CreateMediaproofpictsDto_.updatedAt = current_date;

                CreateMediaproofpictsDto_.mediaType = 'image';
                CreateMediaproofpictsDto_.postType = 'proofpict';
                CreateMediaproofpictsDto_.mediaBasePath = iduserbasic + "/kyc/proofpict/" + cardPict_filename_new;
                CreateMediaproofpictsDto_.mediaUri = cardPict_filename_new;
                CreateMediaproofpictsDto_.originalName = cardPict_filename;
                CreateMediaproofpictsDto_.fsSourceUri = url_cardPict;
                CreateMediaproofpictsDto_.fsSourceName = cardPict_filename_new;
                CreateMediaproofpictsDto_.fsTargetUri = url_cardPict;
                CreateMediaproofpictsDto_.mediaMime = cardPict_mimetype;
                CreateMediaproofpictsDto_.proofpictUploadSource = "OSS";

                CreateMediaproofpictsDto_.mediaSelfieType = 'selfiepict';
                CreateMediaproofpictsDto_.mediaSelfieBasePath = iduserbasic + '/kyc/selfiepict/' + selfiepict_filename_new;
                CreateMediaproofpictsDto_.mediaSelfieUri = selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfieOriginalName = selfiepict_filename;
                CreateMediaproofpictsDto_.SelfiefsSourceUri = url_selfiepict;
                CreateMediaproofpictsDto_.SelfiefsSourceName = selfiepict_filename_new;
                CreateMediaproofpictsDto_.SelfiefsTargetUri = url_selfiepict;
                CreateMediaproofpictsDto_.SelfiemediaMime = selfiepict_mimetype;
                CreateMediaproofpictsDto_.SelfieUploadSource = "OSS";

                CreateMediaproofpictsDto_.SupportUploadSource = "OSS";
                CreateMediaproofpictsDto_.mediaSupportType = 'supportfile';
                CreateMediaproofpictsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
                CreateMediaproofpictsDto_.mediaSupportUri = arrayUri;
                CreateMediaproofpictsDto_.SupportOriginalName = arrayName;
                CreateMediaproofpictsDto_.SupportfsSourceUri = arraySuri;
                CreateMediaproofpictsDto_.SupportfsSourceName = arraySname;
                CreateMediaproofpictsDto_.SupportfsTargetUri = arrayUri;
                CreateMediaproofpictsDto_.SupportmediaMime = supportFile_mimetype;
                CreateMediaproofpictsDto_.mediaSupportUriThumb = arrayThumbUri;

                CreateMediaproofpictsDto_.status = 'IN_PROGGRESS';
                await this.mediaproofpictsService.create(CreateMediaproofpictsDto_);
                await this.basic2SS.updatebyEmail(datauserbasicsService.email.toString(), {
                    idProofName: CreateMediaproofpictsDto_.nama,
                    idProofNumber: CreateMediaproofpictsDto_.idcardnumber,
                    idProofStatus: 'COMPLETE',
                    isIdVerified: false,
                    statusKyc: 'review',
                    proofPict: {
                        $ref: 'mediaproofpicts',
                        $id: new Object(IdMediaproofpictsDto),
                        $db: 'hyppe_content_db'
                    },
                    kyc: [CreateMediaproofpictsDto_]
                });
                await this.utilsService.sendFcmV2(datauserbasicsService.email.toString(), datauserbasicsService.email.toString(), 'KYC', 'REQUEST', 'KYC_REVIEW');

                // await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
            } catch (err) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unable to proceed, failed to update Mediaproofpicts ' + err,
                );
            }

            return {
                "response_code": 202,
                "data": {
                    "id_mediaproofpicts": IdMediaproofpictsDto,
                    "status": "IN_PROGGRESS"
                },
                "messages": {
                    "info": [
                        "Successfully Uploaded"
                    ]
                }
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unable to proceed, user not found',
            );
        }
    }

    async followUser(data:any, list:any, listchallenge:any[])
    {
        console.log('Proses follow orang buat referral');
        var tempfollow = data.following;
        for(var i = 0; i < list.length; i++)
        {
            var gettempdata = list[i];

            var checkfollowing = tempfollow.filter(emaildata => emaildata == gettempdata.parent);
            if(checkfollowing.length == 0)
            {
                var current_date = await this.utilsService.getDateTimeString()
                var _id_1 = (await this.utilsService.generateId());
                var _id_2 = (await this.utilsService.generateId());
                var _id_3 = (await this.utilsService.generateId());
                var _id_4 = (await this.utilsService.generateId());

                // var CreateContenteventsDto1 = new CreateContenteventsDto();
                // CreateContenteventsDto1._id = _id_1
                // CreateContenteventsDto1.contentEventID = (await this.utilsService.generateId())
                // CreateContenteventsDto1.email = req.body.referral
                // CreateContenteventsDto1.eventType = "FOLLOWER"
                // CreateContenteventsDto1.active = true
                // CreateContenteventsDto1.event = "REQUEST"
                // CreateContenteventsDto1.createdAt = current_date
                // CreateContenteventsDto1.updatedAt = current_date
                // CreateContenteventsDto1.sequenceNumber = 0
                // CreateContenteventsDto1.flowIsDone = true
                // CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
                // CreateContenteventsDto1.senderParty = req.body.email
                // CreateContenteventsDto1.transitions = [{
                //   $ref: 'contentevents',
                //   $id: Object(_id_2),
                //   $db: 'hyppe_trans_db',
                // }]

                var CreateContenteventsDto2 = new CreateContenteventsDto();
                CreateContenteventsDto2._id = _id_2
                CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
                CreateContenteventsDto2.email = gettempdata.parent
                CreateContenteventsDto2.eventType = "FOLLOWER"
                CreateContenteventsDto2.active = true
                CreateContenteventsDto2.event = "ACCEPT"
                CreateContenteventsDto2.createdAt = current_date
                CreateContenteventsDto2.updatedAt = current_date
                CreateContenteventsDto2.sequenceNumber = 1
                CreateContenteventsDto2.flowIsDone = true
                CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
                CreateContenteventsDto2.receiverParty = gettempdata.children

                // var CreateContenteventsDto3 = new CreateContenteventsDto();
                // CreateContenteventsDto3._id = _id_3
                // CreateContenteventsDto3.contentEventID = (await this.utilsService.generateId())
                // CreateContenteventsDto3.email = req.body.email
                // CreateContenteventsDto3.eventType = "FOLLOWING"
                // CreateContenteventsDto3.active = true
                // CreateContenteventsDto3.event = "INITIAL"
                // CreateContenteventsDto3.createdAt = current_date
                // CreateContenteventsDto3.updatedAt = current_date
                // CreateContenteventsDto3.sequenceNumber = 0
                // CreateContenteventsDto3.flowIsDone = true
                // CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
                // CreateContenteventsDto3.receiverParty = req.body.referral
                // CreateContenteventsDto3.transitions = [{
                //   $ref: 'contentevents',
                //   $id: Object(_id_4),
                //   $db: 'hyppe_trans_db',
                // }]

                var CreateContenteventsDto4 = new CreateContenteventsDto();
                CreateContenteventsDto4._id = _id_4
                CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
                CreateContenteventsDto4.email = gettempdata.children
                CreateContenteventsDto4.eventType = "FOLLOWING"
                CreateContenteventsDto4.active = true
                CreateContenteventsDto4.event = "ACCEPT"
                CreateContenteventsDto4.createdAt = current_date
                CreateContenteventsDto4.updatedAt = current_date
                CreateContenteventsDto4.sequenceNumber = 1
                CreateContenteventsDto4.flowIsDone = true
                CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
                CreateContenteventsDto4.senderParty = gettempdata.parent

                //await this.contenteventsService.create(CreateContenteventsDto1);
                await this.contenteventsService.create(CreateContenteventsDto2);
                //await this.contenteventsService.create(CreateContenteventsDto3);
                await this.contenteventsService.create(CreateContenteventsDto4);
                await this.insightsService.updateFollower(gettempdata.parent);
                await this.insightsService.updateFollowing(gettempdata.children);
                await this.basic2SS.updatefollowSystem(gettempdata.children, gettempdata.parent, "FOLLOWER");
                tempfollow.push(gettempdata.parent);
            }

            var insertreferraldata = {
                "_id": gettempdata._id,
                "active":gettempdata.active,
                "verified":gettempdata.verified,
                "imei":gettempdata.imei,
                "createdAt":gettempdata.createdAt,
                "updatedAt":current_date,
                "email":gettempdata.children
            };

            var updatereferral = new CreateReferralDto();
            updatereferral.status = 'ACTIVE';
            updatereferral.updatedAt = await this.utilsService.getDateTimeString();

            await this.referralSS.updateOne(gettempdata._id.toString(), updatereferral);
            await this.basic2SS.updateReferralSystem(insertreferraldata, gettempdata.parent);

            const databasic = await this.basic2SS.findbyemail(
              gettempdata.parent,
            );

            if (databasic !== null) {
              var idref = gettempdata._id;
              this.userChallenge(databasic._id.toString(), idref.toString(), "referral", "REFERAL");
            }

            if (databasic !== null) {
              var idref = gettempdata._id;
              try {
                //this.userChallenge(databasic._id.toString(), idref.toString(), "referral", "REFERAL");
                this.scorereferralrequest(databasic._id.toString(), idref.toString(), "referral", "REFERAL", listchallenge)

              } catch (e) {

              }
            }

            console.log(data.email + ' berhasil follow si ' + gettempdata.parent);
        }

        var updateuserbasic = new CreateuserbasicnewDto();
        updateuserbasic.following = tempfollow;

        await this.basic2SS.update(data._id.toString(), updateuserbasic);
    }

    async userChallenge(iduser: string, idref: string, nametable: string, action: string) {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
    
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
    
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var lengchal = null;
        var datauserchall = null;
        var datachallenge = null;
        var arrdata = [];
        var objintr = {};
        var datasubchallenge = null;
    
    
        try {
          datachallenge = await this.challengeService.challengeReferal();
        } catch (e) {
          datachallenge = null;
        }
    
        if (datachallenge !== null && datachallenge.length > 0) {
          lengchal = datachallenge.length;
    
          for (let i = 0; i < lengchal; i++) {
            var idChallenge = datachallenge[i]._id.toString();
            var poinReferal = datachallenge[i].poinReferal;
            try {
              datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser, idChallenge);
            } catch (e) {
              datauserchall = null;
            }
    
            if (datauserchall !== null) {
    
              let leng = null;
              try {
                leng = datauserchall.length;
              } catch (e) {
                leng = 0;
              }
    
    
              if (leng > 0) {
    
    
                for (let y = 0; y < leng; y++) {
    
                  var iduserchall = datauserchall[y]._id;
                  var idsubchallenge = datauserchall[y].idSubChallenge;
                  var idChallenges = datauserchall[y].idChallenge;
                  var start = new Date(datauserchall[y].startDatetime);
                  var end = new Date(datauserchall[y].endDatetime);
                  var datenow = new Date(Date.now());
    
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {
    
                    var obj = {};
    
                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }
                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                    await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poinReferal);
                    var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    var activity = detail.activity;
                    objintr = { "type": nametable, "id": idref, "desc": action }
                    console.log(objintr)
                    activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);
    
                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {
    
                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;
    
                        //if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                        await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                        // }
    
                      }
                    }
                  }
                }
              }
            }
    
    
    
          }
    
    
        }
    
    }

    async scorereferralrequest(iduser: string, idevent: string, namatabel: string, event: string, listchallenge: any[]) {
        await this.contenteventsService.scorereferralrequest(iduser, idevent, namatabel, event, listchallenge)
    }
}