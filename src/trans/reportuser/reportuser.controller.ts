import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Headers, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { ReportuserService } from './reportuser.service';
import { CreateReportsuserDto, DetailReport } from './dto/create-reportuser.dto';
import { Reportuser } from './schemas/reportuser.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ReportreasonsService } from '../reportreasons/reportreasons.service';
import { RemovedreasonsService } from '../removedreasons/removedreasons.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { PostsService } from '../../content/posts/posts.service';
import { AdsService } from '../ads/ads.service';
import { CreateAdsDto } from '../ads/dto/create-ads.dto';
import { CreatePostsDto } from 'src/content/posts/dto/create-posts.dto';
import { CreateUserbasicDto } from '../userbasics/dto/create-userbasic.dto';
import { PostContentService } from '../../content/posts/postcontent.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UserauthsService } from '../userauths/userauths.service';
import { UserAdsService } from '../userads/userads.service';
import { UserticketsService } from '../usertickets/usertickets.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';
import { UtilsService } from '../../utils/utils.service';
import { GetusercontentsService } from '../getusercontents/getusercontents.service';
import { UserbankaccountsService } from '../userbankaccounts/userbankaccounts.service';
import { SettingsService } from '../settings/settings.service';
import { LogapisService } from '../logapis/logapis.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { NewPostService } from 'src/content/new_post/new_post.service';
import { CreateNewPostDTO } from 'src/content/new_post/dto/create-newPost.dto';
import { CreateuserbasicnewDto } from '../userbasicnew/dto/Createuserbasicnew-dto';
import { TempPOSTService } from 'src/content/new_post/temp_post.service';
import { tempposts } from 'src/content/new_post/schemas/tempPost.schema';
import { AdsService as AdsV2Service } from '../adsv2/ads/ads.service';
@Controller('api/reportuser')
export class ReportuserController {

    constructor(private readonly reportuserService: ReportuserService,
        private readonly reportreasonsService: ReportreasonsService,
        private readonly removedreasonsService: RemovedreasonsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
        private readonly adsService: AdsService,
        private readonly transactionsService: TransactionsService,
        private readonly userauthsService: UserauthsService,
        private readonly userAdsService: UserAdsService,
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly utilsService: UtilsService,
        private readonly userticketsService: UserticketsService,
        private readonly mediaproofpictsService: MediaproofpictsService,
        private readonly getusercontentsService: GetusercontentsService,
        private readonly userbankaccountsService: UserbankaccountsService,
        private readonly settingsService: SettingsService,
        private readonly logapiSS: LogapisService,
        private readonly basic2SS: UserbasicnewService,
        private readonly post2SS: NewPostService,
        private readonly temppost2SS: TempPOSTService,
        private readonly ads2SS: AdsV2Service
    ) { }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.reportuserService.findAll();

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async report(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var reportedStatus = null;
        var reportedUserHandle = [];
        var postID = null;
        var data = null;
        var reportedUserCount = null;
        var lenguserreport = null
        var lengreporthandle = null
        var reportedUser = [];
        var dataauth = null;
        var arrayreportedUser = [];
        var arrayreportedHandle = [];
        var contentModeration = null;
        var contentModerationResponse = null;
        var datacontent = null;
        var objreportuser = {};
        var objreporthandle = {};
        var type = null;


        var request_json = JSON.parse(JSON.stringify(request.body));

        reportedStatus = request_json["reportedStatus"];

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        reportedUser = request_json["reportedUser"];
        //reportedUserHandle = request_json["reportedUserHandle"];
        contentModeration = request_json["contentModeration"];
        contentModerationResponse = request_json["contentModerationResponse"];

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var status = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        try {
            lenguserreport = reportedUser.length;
        } catch (e) {
            lenguserreport = 0;
        }


        if (type === "content") {
            let createPostsDto = new CreatePostsDto();
            try {
                datacontent = await this.postsService.findByPostId(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {


                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }

                if (reportedUserNew === null || reportedUserNew === undefined) {
                    reportedUserNew = [];
                }


                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }

                try {

                    status = datacontent._doc.reportedStatus;
                } catch (e) {
                    status = null;
                }

                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let description = reportedUser[i].description;
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        reportedUserNew.push(objreportuser);

                    }
                } else {

                }

                if (reportedUserCount === 0 || reportedUserCount === undefined) {

                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = lenguserreport;
                    if (reportedUserNew.length > 0) {
                        createPostsDto.reportedUser = reportedUserNew;
                    } else {

                    }

                    if (status == "BLURRED") {
                        createPostsDto.reportedStatus = "BLURRED"
                    } else {
                        createPostsDto.reportedStatus = reportedStatus;
                    }

                    this.postsService.update(postID, createPostsDto);
                } else {

                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createPostsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    if (status == "BLURRED") {
                        createPostsDto.reportedStatus = "BLURRED"
                    } else {
                        createPostsDto.reportedStatus = reportedStatus;
                    }
                    this.postsService.update(postID, createPostsDto);
                }

                var data = request_json;

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                return { response_code: 202, data, messages };


            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                throw new BadRequestException("postID is not found...!");
            }
        }
        else if (type === "ads") {


            let createAdsDto = new CreateAdsDto();

            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.adsService.findOne(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }

                if (reportedUserNew === null || reportedUserNew === undefined) {
                    reportedUserNew = [];
                }

                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                try {

                    status = datacontent._doc.reportedStatus;
                } catch (e) {
                    status = null;
                }


                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let description = reportedUser[i].description;
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        reportedUserNew.push(objreportuser);
                    }
                } else {

                }




                if (reportedUserCount === 0 || reportedUserCount === undefined) {

                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = lenguserreport;

                    if (reportedUserNew.length > 0) {
                        createAdsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    if (status == "BLURRED") {
                        createAdsDto.reportedStatus = "BLURRED"
                    } else {
                        createAdsDto.reportedStatus = reportedStatus;
                    }
                    this.adsService.update(postID, createAdsDto);
                } else {

                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createAdsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    if (status == "BLURRED") {
                        createAdsDto.reportedStatus = "BLURRED"
                    } else {
                        createAdsDto.reportedStatus = reportedStatus;
                    }
                    this.adsService.update(postID, createAdsDto);
                }

                var data = request_json;

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                return { response_code: 202, data, messages };


            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                throw new BadRequestException("Ads ID is not found...!");
            }
        }
        else if (type === "user") {
            let createUserbasicDto = new CreateUserbasicDto();
            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.userbasicsService.findbyid(postID);
                console.log(datacontent)

            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {
                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }
                if (reportedUserNew === null || reportedUserNew === undefined) {
                    reportedUserNew = [];
                }

                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {
                        let description = reportedUser[i].description;
                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        reportedUserNew.push(objreportuser);
                    }
                } else {

                }


                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = lenguserreport;

                    if (reportedUserNew.length > 0) {
                        createUserbasicDto.reportedUser = reportedUserNew;
                    } else {

                    }

                    this.userbasicsService.update(postID, createUserbasicDto);
                } else {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createUserbasicDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    this.userbasicsService.update(postID, createUserbasicDto);
                }

                var data = request_json;

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                return { response_code: 202, data, messages };


            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                throw new BadRequestException("User ID is not found...!");
            }
        }


        //deletetagpeople


    }

    @UseGuards(JwtAuthGuard)
    @Post('create/V2')
    async report2(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var reportedStatus = null;
        var reportedUserHandle = [];
        var postID = null;
        var data = null;
        var reportedUserCount = null;
        var lenguserreport = null
        var lengreporthandle = null
        var reportedUser = [];
        var dataauth = null;
        var arrayreportedUser = [];
        var arrayreportedHandle = [];
        var contentModeration = null;
        var contentModerationResponse = null;
        var datacontent = null;
        var datatempcontent = null;
        var objreportuser = {};
        var objreporthandle = {};
        var type = null;


        var request_json = JSON.parse(JSON.stringify(request.body));

        reportedStatus = request_json["reportedStatus"];

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        reportedUser = request_json["reportedUser"];
        //reportedUserHandle = request_json["reportedUserHandle"];
        contentModeration = request_json["contentModeration"];
        contentModerationResponse = request_json["contentModerationResponse"];

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var status = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        try {
            lenguserreport = reportedUser.length;
        } catch (e) {
            lenguserreport = 0;
        }


        if (type === "content") {
            let createPostsDto = new CreateNewPostDTO();
            let createTepostsDto = new tempposts();
            try {
                datacontent = await this.post2SS.findByPostId(postID);
                datatempcontent = await this.temppost2SS.findByPostId(postID);

            } catch (e) {
                datacontent = null;
                datatempcontent = null;
            }

            if (datacontent !== null) {


                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }

                if (reportedUserNew === null || reportedUserNew === undefined) {
                    reportedUserNew = [];
                }


                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }

                try {

                    status = datacontent._doc.reportedStatus;
                } catch (e) {
                    status = null;
                }

                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let description = reportedUser[i].description;
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        reportedUserNew.push(objreportuser);

                    }
                } else {

                }

                if (reportedUserCount === 0 || reportedUserCount === undefined) {

                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = lenguserreport;
                    if (reportedUserNew.length > 0) {
                        createPostsDto.reportedUser = reportedUserNew;
                    } else {

                    }

                    if (status == "BLURRED") {
                        createPostsDto.reportedStatus = "BLURRED"
                    } else {
                        createPostsDto.reportedStatus = reportedStatus;
                    }

                    this.post2SS.update(postID, createPostsDto);
                } else {

                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createPostsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    if (status == "BLURRED") {
                        createPostsDto.reportedStatus = "BLURRED"
                    } else {
                        createPostsDto.reportedStatus = reportedStatus;
                    }
                    this.post2SS.update(postID, createPostsDto);
                }

                if (datatempcontent != null) {
                    createTepostsDto.reportedUser = reportedUserNew;
                    createTepostsDto.reportedStatus = createPostsDto.reportedStatus;
                    this.temppost2SS.updateByPostIdv2(postID, createTepostsDto);
                }

                var data = request_json;

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                return { response_code: 202, data, messages };


            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                throw new BadRequestException("postID is not found...!");
            }
        }
        else if (type === "ads") {


            let createAdsDto = new CreateAdsDto();

            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.adsService.findOne(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }

                if (reportedUserNew === null || reportedUserNew === undefined) {
                    reportedUserNew = [];
                }

                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                try {

                    status = datacontent._doc.reportedStatus;
                } catch (e) {
                    status = null;
                }


                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let description = reportedUser[i].description;
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        reportedUserNew.push(objreportuser);
                    }
                } else {

                }




                if (reportedUserCount === 0 || reportedUserCount === undefined) {

                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = lenguserreport;

                    if (reportedUserNew.length > 0) {
                        createAdsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    if (status == "BLURRED") {
                        createAdsDto.reportedStatus = "BLURRED"
                    } else {
                        createAdsDto.reportedStatus = reportedStatus;
                    }
                    this.adsService.update(postID, createAdsDto);
                } else {

                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createAdsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    if (status == "BLURRED") {
                        createAdsDto.reportedStatus = "BLURRED"
                    } else {
                        createAdsDto.reportedStatus = reportedStatus;
                    }
                    this.adsService.update(postID, createAdsDto);
                }

                var data = request_json;

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                return { response_code: 202, data, messages };


            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                throw new BadRequestException("Ads ID is not found...!");
            }
        }
        else if (type === "user") {
            let createUserbasicDto = new CreateUserbasicDto();
            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.userbasicsService.findbyid(postID);
                console.log(datacontent)

            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {
                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }
                if (reportedUserNew === null || reportedUserNew === undefined) {
                    reportedUserNew = [];
                }

                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {
                        let description = reportedUser[i].description;
                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        reportedUserNew.push(objreportuser);
                    }
                } else {

                }


                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = lenguserreport;

                    if (reportedUserNew.length > 0) {
                        createUserbasicDto.reportedUser = reportedUserNew;
                    } else {

                    }

                    this.userbasicsService.update(postID, createUserbasicDto);
                } else {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createUserbasicDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    this.userbasicsService.update(postID, createUserbasicDto);
                }

                var data = request_json;

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                return { response_code: 202, data, messages };


            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

                throw new BadRequestException("User ID is not found...!");
            }
        }


        //deletetagpeople


    }
    @UseGuards(JwtAuthGuard)
    @Post('appeal')
    async reportHandle(@Req() request) {
        var reportedStatus = null;
        var reportedUserHandle = [];
        var postID = null;
        var data = null;
        var reportedUserCount = null;
        var lenguserreport = null
        var lengreporthandle = null
        var reportedUser = [];
        var dataauth = null;
        var arrayreportedUser = [];
        var arrayreportedHandle = [];
        var contentModeration = null;
        var contentModerationResponse = null;
        var datacontent = null;
        var objreportuser = {};
        var objreporthandle = {};
        var type = null;
        var datahandel = null;
        var objhandel = {};
        var reportedHandel = null;
        var name = "";
        var event = "";
        var tipe = "";

        var reportCount = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        reportedStatus = request_json["reportedStatus"];

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        reportedUserHandle = request_json["reportedUserHandle"];
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
        try {
            lenguserreport = reportedUser.length;
        } catch (e) {
            lenguserreport = 0;
        }

        try {
            lengreporthandle = reportedUserHandle.length;
        } catch (e) {
            lengreporthandle = 0;
        }

        if (type === "content") {
            name = "NOTIFY_APPEAL";
            event = "REQUEST_APPEAL";
            tipe = "CONTENT";

            let createPostsDto = new CreatePostsDto();
            try {
                datacontent = await this.postsService.findByPostId(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                // if (reportCount >= 200) {
                //     throw new BadRequestException("Appeal tidak bisa diajukan...!");
                // } 

                // else {
                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let reason = reportedUserHandle[i].reason;
                        // let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {


                            "reason": reason,
                            "remark": remark,
                            "reasonAdmin": "",
                            "reasonId": null,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }


                createPostsDto.reportedStatus = reportedStatus;
                if (arrayreportedHandle.length > 0) {
                    createPostsDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.postsService.update(postID, createPostsDto);
                this.sendReportAppealFCM(name, event, tipe, postID);
                var data = request_json;

                return { response_code: 202, data, messages };


                // }


            } else {
                throw new BadRequestException("postID is not found...!");
            }
        }
        else if (type === "ads") {


            let createAdsDto = new CreateAdsDto();


            try {
                datacontent = await this.adsService.findOne(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                // if (reportCount >= 200) {
                //     throw new BadRequestException("Appeal tidak bisa diajukan...!");
                // }
                // else {
                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let reason = reportedUserHandle[i].reason;
                        // let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {


                            "reason": reason,
                            "remark": remark,
                            "reasonAdmin": "",
                            "reasonId": null,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }

                if (arrayreportedHandle.length > 0) {
                    createAdsDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.adsService.update(postID, createAdsDto);
                var data = request_json;
                return { response_code: 202, data, messages };

                //}
            } else {
                throw new BadRequestException("Ads ID is not found...!");
            }
        }
        else if (type === "user") {
            let createUserbasicDto = new CreateUserbasicDto();
            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.userbasicsService.findbyid(postID);
                console.log(datacontent)

            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                // if (reportCount >= 200) {
                //     throw new BadRequestException("Appeal tidak bisa diajukan...!");
                // }
                // else {
                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let reason = reportedUserHandle[i].reason;
                        // let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {

                            "reason": reason,
                            "remark": remark,
                            "reasonAdmin": "",
                            "reasonId": null,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }


                createUserbasicDto.reportedStatus = reportedStatus;


                if (arrayreportedHandle.length > 0) {
                    createUserbasicDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.userbasicsService.update(postID, createUserbasicDto);


                var data = request_json;
                return { response_code: 202, data, messages };
                // }


            } else {
                throw new BadRequestException("User ID is not found...!");
            }
        }


        //deletetagpeople


    }

    @UseGuards(JwtAuthGuard)
    @Post('appeal/v2')
    async reportHandle2(@Req() request) {
        var reportedStatus = null;
        var reportedUserHandle = [];
        var postID = null;
        var data = null;
        var reportedUserCount = null;
        var lenguserreport = null
        var lengreporthandle = null
        var reportedUser = [];
        var dataauth = null;
        var arrayreportedUser = [];
        var arrayreportedHandle = [];
        var contentModeration = null;
        var contentModerationResponse = null;
        var datacontent = null;
        var objreportuser = {};
        var objreporthandle = {};
        var type = null;
        var datahandel = null;
        var objhandel = {};
        var reportedHandel = null;
        var name = "";
        var event = "";
        var tipe = "";

        var reportCount = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        reportedStatus = request_json["reportedStatus"];

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        reportedUserHandle = request_json["reportedUserHandle"];
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
        try {
            lenguserreport = reportedUser.length;
        } catch (e) {
            lenguserreport = 0;
        }

        try {
            lengreporthandle = reportedUserHandle.length;
        } catch (e) {
            lengreporthandle = 0;
        }

        if (type === "content") {
            name = "NOTIFY_APPEAL";
            event = "REQUEST_APPEAL";
            tipe = "CONTENT";

            let createPostsDto = new CreateNewPostDTO();
            try {
                datacontent = await this.post2SS.findByPostId(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;
                    arrayreportedHandle = datahandel;
                } catch (e) {
                    datahandel = null;
                }

                // if (datahandel.length > 0) {
                //     for (let i = 0; i < datahandel.length; i++) {
                //         let status = datahandel[i].status;

                //         if (status === "BARU") {
                //             throw new BadRequestException("Appeal sudah diajukan...!");
                //         }
                //     }

                // }

                if (datahandel.length > 0) {
                    var lastdata = datahandel[datahandel.length - 1];
                    if (lastdata.status === "BARU") {
                        throw new BadRequestException("Appeal sudah diajukan...!");
                    }
                }

                // if (reportCount >= 200) {
                //     throw new BadRequestException("Appeal tidak bisa diajukan...!");
                // } 

                // else {
                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let reason = reportedUserHandle[i].reason;
                        // let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {


                            "reason": reason,
                            "remark": remark,
                            "reasonAdmin": "",
                            "reasonId": null,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }


                createPostsDto.reportedStatus = reportedStatus;
                if (arrayreportedHandle.length > 0) {
                    createPostsDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.post2SS.update(postID, createPostsDto);
                this.sendReportAppealFCMV2(name, event, tipe, postID);
                var data = request_json;

                return { response_code: 202, data, messages };


                // }


            } else {
                throw new BadRequestException("postID is not found...!");
            }
        }
        else if (type === "ads") {


            let createAdsDto = new CreateAdsDto();


            try {
                datacontent = await this.adsService.findOne(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                // if (reportCount >= 200) {
                //     throw new BadRequestException("Appeal tidak bisa diajukan...!");
                // }
                // else {
                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let reason = reportedUserHandle[i].reason;
                        // let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {


                            "reason": reason,
                            "remark": remark,
                            "reasonAdmin": "",
                            "reasonId": null,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }

                if (arrayreportedHandle.length > 0) {
                    createAdsDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.adsService.update(postID, createAdsDto);
                var data = request_json;
                return { response_code: 202, data, messages };

                //}
            } else {
                throw new BadRequestException("Ads ID is not found...!");
            }
        }
        else if (type === "user") {
            let createUserbasicDto = new CreateuserbasicnewDto();
            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.basic2SS.findOne(postid);
                console.log(datacontent)

            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                // if (reportCount >= 200) {
                //     throw new BadRequestException("Appeal tidak bisa diajukan...!");
                // }
                // else {
                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let reason = reportedUserHandle[i].reason;
                        // let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {

                            "reason": reason,
                            "remark": remark,
                            "reasonAdmin": "",
                            "reasonId": null,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }


                createUserbasicDto.reportedStatus = reportedStatus;


                if (arrayreportedHandle.length > 0) {
                    createUserbasicDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.basic2SS.update(postID, createUserbasicDto);


                var data = request_json;
                return { response_code: 202, data, messages };
                // }


            } else {
                throw new BadRequestException("User ID is not found...!");
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('approval/v2')
    async reportHandleAproval2(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;

        var type = null;
        var ditangguhkan = null;
        var reason = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["ditangguhkan"] !== undefined) {
            ditangguhkan = request_json["ditangguhkan"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        reason = request_json["reason"];
        reasonId = request_json["reasonId"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idreason = mongoose.Types.ObjectId(reasonId);
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };



        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];
        var name = "";
        var event = "";
        var tipe = "";

        // old
        // if (type === "content") {
        //     try {
        //         datacontent = await this.post2SS.findByPostId(postID);
        //         reportedUserHandle = datacontent._doc.reportedUserHandle;

        //     } catch (e) {
        //         datacontent = null;
        //         reportedUserHandle = [];
        //     }
        //     if (ditangguhkan === true) {
        //         name = "NOTIFY_APPEAL";
        //         event = "SUSPENDED_APPEAL";
        //         tipe = "CONTENT";

        //         if (reportedUserHandle.length > 0) {
        //             await this.post2SS.updateDitangguhkan(postID, reason, dt.toISOString(), idreason);
        //             this.sendReportAppealFCMV2(name, event, tipe, postID);
        //         } else {

        //             objreporthandle = {

        //                 "reasonId": reasonId,
        //                 "reasonAdmin": reason,
        //                 "reason": "",
        //                 "remark": "",
        //                 "createdAt": dt.toISOString(),
        //                 "updatedAt": dt.toISOString(),
        //                 "status": "DITANGGUHKAN"
        //             };
        //             arrayreportedHandle.push(objreporthandle);

        //             await this.post2SS.updateDitangguhkanEmpty(postID, dt.toISOString(), arrayreportedHandle);
        //             this.sendReportAppealFCMV2(name, event, tipe, postID);
        //         }


        //     } else {
        //         name = "NOTIFY_APPEAL";
        //         event = "NOTSUSPENDED_APPEAL";
        //         tipe = "CONTENT";
        //         if (reportedUserHandle.length > 0) {
        //             await this.post2SS.updateTidakditangguhkan(postID, dt.toISOString());
        //             await this.post2SS.nonactive(postID, dt.toISOString());
        //             this.sendReportAppealFCMV2(name, event, tipe, postID);
        //         } else {
        //             objreporthandle = {

        //                 "reasonId": null,
        //                 "reasonAdmin": "",
        //                 "reason": "",
        //                 "remark": "",
        //                 "createdAt": dt.toISOString(),
        //                 "updatedAt": dt.toISOString(),
        //                 "status": "TIDAK DITANGGUHKAN"
        //             };
        //             arrayreportedHandle.push(objreporthandle);

        //             await this.post2SS.updateTidakditangguhkanEmpty(postID, dt.toISOString(), arrayreportedHandle);
        //             await this.post2SS.nonactive(postID, dt.toISOString());
        //             this.sendReportAppealFCMV2(name, event, tipe, postID);
        //         }
        //     }

        // }
        if (type === "content") {
            try {
                datacontent = await this.post2SS.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            if (ditangguhkan === true) {
                name = "NOTIFY_APPEAL";
                event = "SUSPENDED_APPEAL";
                tipe = "CONTENT";

                objreporthandle = {

                    "reasonId": reasonId,
                    "reasonAdmin": reason,
                    "reason": "",
                    "remark": "",
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DITANGGUHKAN"
                };
                reportedUserHandle.push(objreporthandle);
                await this.post2SS.updateDitangguhkanEmpty(postID, dt.toISOString(), reportedUserHandle);
                this.sendReportAppealFCMV2(name, event, tipe, postID);

            } else {
                name = "NOTIFY_APPEAL";
                event = "NOTSUSPENDED_APPEAL";
                tipe = "CONTENT";
                objreporthandle = {

                    "reasonId": null,
                    "reasonAdmin": "",
                    "reason": "",
                    "remark": "",
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "TIDAK DITANGGUHKAN"
                };
                reportedUserHandle.push(objreporthandle);
                await this.post2SS.updateTidakditangguhkanEmpty(postID, dt.toISOString(), reportedUserHandle);
                await this.post2SS.nonactive(postID, dt.toISOString());
                this.sendReportAppealFCMV2(name, event, tipe, postID);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (ditangguhkan === true) {

                if (reportedUserHandle.length > 0) {
                    await this.adsService.updateDitangguhkan(adsId, reason, dt.toISOString(), idreason);
                } else {

                    objreporthandle = {

                        "reasonId": reasonId,
                        "reasonAdmin": reason,
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.adsService.updateDitangguhkanEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                }

            } else {
                objreporthandle = {
                    "reasonId": null,
                    "reasonAdmin": "",
                    "reason": "",
                    "remark": "",
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "TIDAK DITANGGUHKAN"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateTidakditangguhkanEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                await this.adsService.nonactive(adsId, dt.toISOString());

            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('approval')
    async reportHandleAproval(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;

        var type = null;
        var ditangguhkan = null;
        var reason = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["ditangguhkan"] !== undefined) {
            ditangguhkan = request_json["ditangguhkan"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        reason = request_json["reason"];
        reasonId = request_json["reasonId"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idreason = mongoose.Types.ObjectId(reasonId);
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };



        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];
        var name = "";
        var event = "";
        var tipe = "";

        if (type === "content") {
            try {
                datacontent = await this.postsService.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            if (ditangguhkan === true) {
                name = "NOTIFY_APPEAL";
                event = "SUSPENDED_APPEAL";
                tipe = "CONTENT";

                if (reportedUserHandle.length > 0) {
                    await this.postsService.updateDitangguhkan(postID, reason, dt.toISOString(), idreason);
                    this.sendReportAppealFCM(name, event, tipe, postID);
                } else {

                    objreporthandle = {

                        "reasonId": reasonId,
                        "reasonAdmin": reason,
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.postsService.updateDitangguhkanEmpty(postID, dt.toISOString(), arrayreportedHandle);
                    this.sendReportAppealFCM(name, event, tipe, postID);
                }


            } else {
                name = "NOTIFY_APPEAL";
                event = "NOTSUSPENDED_APPEAL";
                tipe = "CONTENT";
                if (reportedUserHandle.length > 0) {
                    await this.postsService.updateTidakditangguhkan(postID, dt.toISOString());
                    await this.postsService.nonactive(postID, dt.toISOString());
                    this.sendReportAppealFCM(name, event, tipe, postID);
                } else {
                    objreporthandle = {

                        "reasonId": null,
                        "reasonAdmin": "",
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "TIDAK DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.postsService.updateTidakditangguhkanEmpty(postID, dt.toISOString(), arrayreportedHandle);
                    await this.postsService.nonactive(postID, dt.toISOString());
                    this.sendReportAppealFCM(name, event, tipe, postID);
                }
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (ditangguhkan === true) {

                if (reportedUserHandle.length > 0) {
                    await this.adsService.updateDitangguhkan(adsId, reason, dt.toISOString(), idreason);
                } else {

                    objreporthandle = {

                        "reasonId": reasonId,
                        "reasonAdmin": reason,
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.adsService.updateDitangguhkanEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                }

            } else {
                objreporthandle = {
                    "reasonId": null,
                    "reasonAdmin": "",
                    "reason": "",
                    "remark": "",
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "TIDAK DITANGGUHKAN"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateTidakditangguhkanEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                await this.adsService.nonactive(adsId, dt.toISOString());

            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('flaging')
    async reportHandleFlaging(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;

        var type = null;
        var reason = null;
        var reasonId = null;
        var name = "";
        var event = "";
        var tipe = "";
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        reasonId = request_json["reasonId"];


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
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];

        if (type === "content") {
            name = "NOTIFY_FLAGING";
            event = "ADMIN_FLAGING";
            tipe = "CONTENT";
            try {
                datacontent = await this.postsService.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }

            if (reportedUserHandle.length > 0) {
                await this.postsService.updateFlaging(postID, dt.toISOString());
                await this.postsService.nonactive(postID, dt.toISOString());
                this.sendReportAppealFCM(name, event, tipe, postID);

            } else {

                objreporthandle = {

                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "FLAGING"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.postsService.updateFlagingEmpty(postID, dt.toISOString(), arrayreportedHandle);
                await this.postsService.nonactive(postID, dt.toISOString());
                this.sendReportAppealFCM(name, event, tipe, postID);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (reportedUserHandle.length > 0) {
                await this.adsService.updateFlaging(adsId, dt.toISOString());
                await this.adsService.nonactive(adsId, dt.toISOString());

            } else {

                objreporthandle = {

                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "FLAGING"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateFlagingEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                await this.adsService.nonactive(adsId, dt.toISOString());

            }


        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }
    @UseGuards(JwtAuthGuard)
    @Post('flaging/v2')
    async reportHandleFlagingV2(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;

        var type = null;
        var reason = null;
        var reasonId = null;
        var name = "";
        var event = "";
        var tipe = "";
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        reasonId = request_json["reasonId"];


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
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];

        if (type === "content") {
            name = "NOTIFY_FLAGING";
            event = "ADMIN_FLAGING";
            tipe = "CONTENT";
            try {
                datacontent = await this.post2SS.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }

            if (reportedUserHandle.length > 0) {
                await this.post2SS.updateFlaging(postID, dt.toISOString());
                await this.post2SS.nonactive(postID, dt.toISOString());
                this.sendReportAppealFCMV2(name, event, tipe, postID);

            } else {

                objreporthandle = {

                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "FLAGING"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.post2SS.updateFlagingEmpty(postID, dt.toISOString(), arrayreportedHandle);
                await this.post2SS.nonactive(postID, dt.toISOString());
                this.sendReportAppealFCMV2(name, event, tipe, postID);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (reportedUserHandle.length > 0) {
                await this.adsService.updateFlaging(adsId, dt.toISOString());
                await this.adsService.nonactive(adsId, dt.toISOString());

            } else {

                objreporthandle = {

                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "FLAGING"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateFlagingEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                await this.adsService.nonactive(adsId, dt.toISOString());

            }


        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }
    @UseGuards(JwtAuthGuard)
    @Post('listreport')
    async finddata(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var key = null;
        var page = null;
        var type = null;
        var email = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var iduser = null;
        var totalpage = null;
        var postType = null;
        var totalallrow = null;
        var datasearch = null;
        var totalsearch = null;
        var total = null;
        var startreport = null;
        var endreport = null;
        var status = null;
        var reason = null;
        var descending = null;
        var reasonAppeal = null;
        var username = null;
        var jenis = null;
        var valuemax = null;
        var idmax = "64b4e15ef578000070003532";
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
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
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["jenis"] !== undefined) {
            jenis = request_json["jenis"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        postType = request_json["postType"];
        key = request_json["key"];

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        startreport = request_json["startreport"];
        endreport = request_json["endreport"];
        status = request_json["status"];
        reason = request_json["reason"];
        descending = request_json["descending"];
        reasonAppeal = request_json["reasonAppeal"];
        username = request_json["username"];
        email = request_json["email"];

        var datamaxreport = null;

        try {
            datamaxreport = await this.settingsService.findOne(idmax);
        } catch (e) {
            datamaxreport = null;
        }

        if (type === "content") {

            let datacount200 = null;
            let dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);

            if (datamaxreport !== null) {
                valuemax = datamaxreport.value;
            } else {
                valuemax = 0;
            }

            try {

                datacount200 = await this.postsService.find200(valuemax);


            } catch (e) {
                datacount200 = null;

            }

            if (datacount200 !== null) {

                var lengdatatr = datacount200.length;

                for (var i = 0; i < lengdatatr; i++) {

                    var id = datacount200[i].postID;

                    await this.postsService.updateStatusOwned(id, dt.toISOString());

                }


            }

            let query = await this.postsService.findreport(key, postType, startdate, enddate, page, limit, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;

            for (var i = 0; i < query.length; i++) {
                let dataquery = await this.getusercontentsService.getapsaraDatabase(query, i);
                arrdata.push(dataquery[i]);
            }

            total = query.length;
            // let datasearch = await this.postsService.findreport(key, postType, startdate, enddate, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalsearch = datasearch.length;

            // let dataall = await this.postsService.findreport(undefined, undefined, undefined, undefined, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalallrow = dataall.length;

            // var tpage = null;
            // var tpage2 = null;

            // tpage2 = (totalsearch / limit).toFixed(0);
            // tpage = (totalsearch % limit);
            // if (tpage > 0 && tpage < 5) {
            //     totalpage = parseInt(tpage2) + 1;

            // } else {
            //     totalpage = parseInt(tpage2);
            // }


        }

        else if (type === "ads") {

            let datacount200 = null;
            let dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);
            if (datamaxreport !== null) {
                valuemax = datamaxreport.value;
            } else {
                valuemax = 0;
            }


            try {

                datacount200 = await this.adsService.find200(valuemax);


            } catch (e) {
                datacount200 = null;

            }

            if (datacount200 !== null) {

                var lengdatatr = datacount200.length;

                for (var i = 0; i < lengdatatr; i++) {

                    var id = datacount200[i]._id;
                    let adsid = mongoose.Types.ObjectId(id);

                    await this.adsService.updateStatusOwned(adsid, dt.toISOString());
                }
            }
            let query = await this.adsService.findreportads(key, postType, startdate, enddate, page, limit, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);

            var arrdata = [];
            let pict: String[] = [];
            var type = null;

            for (var i = 0; i < query.length; i++) {
                let dataquery = await this.getusercontentsService.getapsaraDatabaseAds(query, i);

                arrdata.push(dataquery[i]);
            }
            total = query.length;
            // let datasearch = await this.adsService.findreportads(key, postType, startdate, enddate, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalsearch = datasearch.length;
            // let dataall = await this.adsService.findreportads(undefined, undefined, undefined, undefined, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalallrow = dataall.length;

            // var tpage = null;
            // var tpage2 = null;

            // tpage2 = (totalsearch / limit).toFixed(0);
            // tpage = (totalsearch % limit);
            // if (tpage > 0 && tpage < 5) {
            //     totalpage = parseInt(tpage2) + 1;

            // } else {
            //     totalpage = parseInt(tpage2);
            // }


        }
        return { response_code: 202, arrdata, page, limit, total, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('listreport/v2')
    async finddata2(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var key = null;
        var page = null;
        var type = null;
        var email = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var iduser = null;
        var totalpage = null;
        var postType = null;
        var totalallrow = null;
        var datasearch = null;
        var totalsearch = null;
        var total = null;
        var startreport = null;
        var endreport = null;
        var status = null;
        var reason = null;
        var descending = null;
        var reasonAppeal = null;
        var username = null;
        var jenis = null;
        var valuemax = null;
        var idmax = "64b4e15ef578000070003532";
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
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
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["jenis"] !== undefined) {
            jenis = request_json["jenis"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        postType = request_json["postType"];
        key = request_json["key"];

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        startreport = request_json["startreport"];
        endreport = request_json["endreport"];
        status = request_json["status"];
        reason = request_json["reason"];
        descending = request_json["descending"];
        reasonAppeal = request_json["reasonAppeal"];
        username = request_json["username"];
        email = request_json["email"];

        var datamaxreport = null;

        try {
            datamaxreport = await this.settingsService.findOne(idmax);
        } catch (e) {
            datamaxreport = null;
        }

        if (type === "content") {

            let datacount200 = null;
            let dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);

            if (datamaxreport !== null) {
                valuemax = datamaxreport.value;
            } else {
                valuemax = 0;
            }

            try {

                datacount200 = await this.post2SS.find200(valuemax);


            } catch (e) {
                datacount200 = null;

            }

            if (datacount200 !== null) {

                var lengdatatr = datacount200.length;

                for (var i = 0; i < lengdatatr; i++) {

                    var id = datacount200[i].postID;

                    await this.post2SS.updateStatusOwned(id, dt.toISOString());

                }


            }

            let query = await this.post2SS.findreport2(key, postType, startdate, enddate, page, limit, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;

            for (var i = 0; i < query.length; i++) {
                let dataquery = await this.getusercontentsService.getapsaraDatabase(query, i);
                var outputresult = {
                    _id: query[i]._id,
                    createdAt: query[i].createdAt,
                    updatedAt: query[i].updatedAt,
                    postID: query[i].postID,
                    email: query[i].email,
                    postType: query[i].postType,
                    description: query[i].description,
                    title: query[i].title,
                    active: query[i].active,
                    contentModeration: query[i].contentModeration,
                    contentModerationResponse: query[i].contentModerationResponse,
                    reportedStatus: query[i].reportedStatus,
                    reportedUserCount: query[i].reportedUserCount,
                    reportedUserHandle: query[i].reportedUserHandle,
                    reportedUser: query[i].reportedUser,
                    fullName: query[i].fullName,
                    username: query[i].username,
                    avatar: query[i].avatar,
                    rotate: query[i].rotate,
                    mediaBasePath: query[i].mediaBasePath,
                    mediaUri: query[i].mediaUri,
                    mediaType: query[i].mediaType,
                    mediaThumbEndpoint: query[i].mediaThumbEndpoint,
                    mediaEndpoint: query[i].mediaEndpoint,
                    mediaThumbUri: query[i].mediaThumbUri,
                    apsaraId: query[i].apsaraId,
                    apsara: query[i].apsara,
                    reportReasonIdLast: query[i].reportReasonIdLast,
                    reasonLast: query[i].reasonLast,
                    lastAppeal: query[i].lastAppeal,
                    createdAtReportLast: query[i].createdAtReportLast,
                    createdAtAppealLast: query[i].createdAtAppealLast,
                    statusLast: query[i].statusLast,
                    reportStatusLast: query[i].reportStatusLast,
                    media: dataquery[i].media
                };

                arrdata.push(outputresult);
            }

            total = query.length;
            // let datasearch = await this.postsService.findreport(key, postType, startdate, enddate, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalsearch = datasearch.length;

            // let dataall = await this.postsService.findreport(undefined, undefined, undefined, undefined, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalallrow = dataall.length;

            // var tpage = null;
            // var tpage2 = null;

            // tpage2 = (totalsearch / limit).toFixed(0);
            // tpage = (totalsearch % limit);
            // if (tpage > 0 && tpage < 5) {
            //     totalpage = parseInt(tpage2) + 1;

            // } else {
            //     totalpage = parseInt(tpage2);
            // }


        }

        else if (type === "ads") {

            let datacount200 = null;
            let dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);
            if (datamaxreport !== null) {
                valuemax = datamaxreport.value;
            } else {
                valuemax = 0;
            }


            try {

                datacount200 = await this.adsService.find200(valuemax);


            } catch (e) {
                datacount200 = null;

            }

            if (datacount200 !== null) {

                var lengdatatr = datacount200.length;

                for (var i = 0; i < lengdatatr; i++) {

                    var id = datacount200[i]._id;
                    let adsid = mongoose.Types.ObjectId(id);

                    await this.adsService.updateStatusOwned(adsid, dt.toISOString());
                }
            }
            let query = await this.adsService.findreportads2(key, postType, startdate, enddate, page, limit, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);

            var arrdata = [];
            let pict: String[] = [];
            var type = null;

            for (var i = 0; i < query.length; i++) {
                let dataquery = await this.getusercontentsService.getapsaraDatabaseAds(query, i);

                arrdata.push(dataquery[i]);
            }
            total = query.length;
            // let datasearch = await this.adsService.findreportads(key, postType, startdate, enddate, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalsearch = datasearch.length;
            // let dataall = await this.adsService.findreportads(undefined, undefined, undefined, undefined, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis, email);
            // totalallrow = dataall.length;

            // var tpage = null;
            // var tpage2 = null;

            // tpage2 = (totalsearch / limit).toFixed(0);
            // tpage = (totalsearch % limit);
            // if (tpage > 0 && tpage < 5) {
            //     totalpage = parseInt(tpage2) + 1;

            // } else {
            //     totalpage = parseInt(tpage2);
            // }


        }
        return { response_code: 202, arrdata, page, limit, total, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('listdetail')
    async finddetail(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/reportuser/listdetail';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var data = [];
        var query = null;
        var totalReport = null;
        var reportuser = null;

        var reportedUserCount = null;
        if (type === "content") {
            var email = null;
            var tagPeople = [];
            var tagpeoples = [];
            var lengUser = null;
            try {
                query = await this.postsService.findreportuserdetail(postID);
                lengUser = query.length;
                reportedUserCount = query[0].reportedUserCount;
            } catch (e) {
                query = null;
                lengUser = 0;
                reportedUserCount = 0;
            }
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var objauth = {};
            var dataauth = null;
            var idusersell = null;
            var tgltransaksi = null;
            var namapenjual = null;

            let dataapsara = null;


            if (lengUser > 0) {
                email = query[0].email;
                tagPeople = query[0].tagPeople;


                if (tagPeople !== undefined) {

                    for (let i = 0; i < tagPeople.length; i++) {
                        var idauth = tagPeople[i].oid;

                        dataauth = await this.userauthsService.findOneId(idauth);
                        console.log(dataauth);

                        objauth = {
                            username: dataauth._doc.username
                        }
                        tagpeoples.push(objauth);
                    }

                } else {
                    tagpeoples = [];
                }

                var ubasicpembeli = await this.userbasicsService.findOne(email);
                var iduserbuyer = mongoose.Types.ObjectId(ubasicpembeli._id);
                var namapembeli = ubasicpembeli.fullName;

                var datatransaksi = await this.transactionsService.findpostidanduser(query[0].postID, iduserbuyer);

                if (datatransaksi === null || datatransaksi === undefined) {
                    namapenjual = "";
                    tgltransaksi = "";
                } else {
                    idusersell = datatransaksi.idusersell;
                    tgltransaksi = datatransaksi.timestamp;

                    var ubasicpenjual = await this.userbasicsService.findbyid(idusersell.toString());
                    namapenjual = ubasicpenjual.fullName;

                }


                try {
                    idapsara = query[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[0].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = {};
                }
                else {
                    if (type === "pict") {

                        try {
                            dataapsara = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                    else if (type === "vid") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }

                    }
                    else if (type === "story") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                    else if (type === "diary") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                }

                if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                    apsaradefine = false;
                } else {
                    apsaradefine = true;
                }

                if (idapsara === undefined || idapsara === "" || idapsara === null) {
                    idapsaradefine = "";
                } else {
                    idapsaradefine = idapsara;
                }
                objk = {
                    "_id": query[0]._id,
                    "postID": query[0].postID,
                    "email": query[0].email,
                    "postType": query[0].postType,
                    "description": query[0].description,
                    "active": query[0].active,
                    "createdAt": query[0].createdAt,
                    "updatedAt": query[0].updatedAt,
                    "visibility": query[0].visibility,
                    "location": query[0].location,
                    "tags": query[0].tags,
                    "allowComments": query[0].allowComments,
                    "isSafe": query[0].isSafe,
                    "isOwned": query[0].isOwned,
                    "saleLike": query[0].saleLike,
                    "saleView": query[0].saleView,
                    "metadata": query[0].metadata,
                    "likes": query[0].likes,
                    "views": query[0].views,
                    "shares": query[0].shares,
                    "comments": query[0].comments,
                    "tagPeople": query[0].tagPeople,
                    "proofpict": query[0].proofpict,
                    "insight": query[0].insight,
                    "avatar": query[0].avatar,
                    "fullName": query[0].fullName,
                    "username": query[0].username,
                    "privacy": query[0].privacy,
                    "isIdVerified": query[0].isIdVerified,
                    "statusUser": query[0].statusUser,
                    "isViewed": query[0].isViewed,
                    "monetize": query[0].monetize,
                    "saleAmount": query[0].saleAmount,
                    "mediaref": query[0].mediaref,
                    "mediaType": query[0].mediaType,
                    "mediaThumbEndpoint": query[0].mediaThumbEndpoint,
                    "mediaEndpoint": query[0].mediaEndpoint,
                    "namapenjual": namapenjual,
                    "pemiliksekarang": namapembeli,
                    "tgltransaksi": tgltransaksi,
                    "reportedStatus": query[0].reportedStatus,
                    "reportStatusLast": query[0].reportStatusLast,
                    "reportedUser": query[0].reportedUser,
                    "reportedUserHandle": query[0].reportedUserHandle,
                    "createdAtReportLast": query[0].createdAtReportLast,
                    "createdAtAppealLast": query[0].createdAtAppealLast,
                    "reasonLastAppeal": query[0].reasonLastAppeal,
                    "reasonLastAppealAdmin": query[0].reasonLastAppealAdmin,
                    "reasonLastReport": query[0].reasonLastReport,
                    "tagpeople": tagpeoples,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "media": dataapsara
                };

                data.push(objk);
            } else {
                data = [];

            }



            var datacount = null;
            var objcoun = {};
            var dataSum = [];

            try {

                datacount = await this.postsService.countReason(postID);
            } catch (e) {
                datacount = null;
            }

            // reportedUserCount hanya mengambil data yang status nya true
            for (let i = 0; i < datacount.length; i++) {
                let mycount = datacount[i].myCount;
                let reason = datacount[i]._id;

                let persen = mycount * 100 / reportedUserCount;
                objcoun = {
                    reason: reason,
                    count: mycount,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

            try {
                reportuser = query[0].reportedUser;
                lengreportuser = reportuser.length;
            } catch (e) {
                reportuser = null;
                lengreportuser = 0;
            }

            if (lengreportuser > 0) {
                // for (let x = 0; x < lengreportuser; x++) {
                //     if (reportuser[x].active == false) {
                //         lengreportuser = lengreportuser - x;
                //         totalReport = lengreportuser - 1;
                //     } else {
                //         totalReport = lengreportuser;
                //     }
                // }
                totalReport = reportedUserCount;

            }
            else {
                totalReport = 0;
            }


            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, totalReport, dataSum, data, messages };
        }
        else if (type === "ads") {
            var adsId = mongoose.Types.ObjectId(postID);
            try {
                query = await this.adsService.detailadsreport(adsId);
            } catch (e) {
                query = null;
            }
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var dataapsara = null;
            var dtcounview = null;
            var dtcountclick = null;
            var tView = null;
            var tClick = null;
            var lengreportuser = null;



            if (query !== null) {

                try {
                    dtcounview = await this.userAdsService.countViewads(adsId);
                    tView = dtcounview[0].totalView;
                } catch (e) {
                    dtcounview = null;
                    tView = 0;
                }
                try {
                    dtcountclick = await this.userAdsService.countKlikads(adsId);
                    tClick = dtcountclick[0].totalClick;
                } catch (e) {
                    dtcountclick = null;
                    tClick = 0;
                }

                try {
                    reportuser = query[0].reportedUser;
                    lengreportuser = reportuser.length;
                } catch (e) {
                    reportuser = null;
                    lengreportuser = 0;
                }

                if (lengreportuser > 0) {
                    for (let x = 0; x < lengreportuser; x++) {
                        if (reportuser[x].active == false) {
                            lengreportuser = lengreportuser - x;
                            totalReport = lengreportuser - 1;
                        } else {
                            totalReport = lengreportuser;
                        }
                    }

                }

                try {
                    idapsara = query[0].idApsara;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[0].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[0].type;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = {};
                } else {
                    if (type === "image") {

                        try {
                            dataapsara = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                    else if (type === "video") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }

                    }

                }

                if (idapsara === undefined || idapsara === "" || idapsara === null) {
                    idapsaradefine = "";

                } else {
                    idapsaradefine = idapsara;

                }
                objk = {
                    "_id": query[0]._id,
                    "userID": query[0].userID,
                    "name": query[0].name,
                    "nameType": query[0].nameType,
                    "status": query[0].status,
                    "timestamp": query[0].timestamp,
                    "totalUsedCredit": query[0].totalUsedCredit,
                    "type": query[0].type,
                    "tayang": query[0].tayang,
                    "usedCredit": query[0].usedCredit,
                    "usedCreditFree": query[0].usedCreditFree,
                    "creditFree": query[0].creditFree,
                    "creditValue": query[0].creditValue,
                    "totalCredit": query[0].totalCredit,
                    "totalView": tView,
                    "totalClick": tClick,
                    "idApsara": query[0].idApsara,
                    "reportedStatus": query[0].reportedStatus,
                    "reportedUserCount": query[0].reportedUserCount,
                    "reportedUser": query[0].reportedUser,
                    "reportedUserHandle": query[0].reportedUserHandle,
                    "contentModeration": query[0].contentModeration,
                    "contentModerationResponse": query[0].contentModerationResponse,
                    "interest": query[0].interest,
                    "place": query[0].place,
                    "reportStatusLast": query[0].reportStatusLast,
                    "createdAtReportLast": query[0].createdAtReportLast,
                    "createdAtAppealLast": query[0].createdAtAppealLast,
                    "reasonLastReport": query[0].reasonLastReport,
                    "reasonLastAppeal": query[0].reasonLastAppeal,
                    "reasonLastAppealAdmin": query[0].reasonLastAppealAdmin,
                    "fullName": query[0].fullName,
                    "email": query[0].email,
                    "proofpict": query[0].proofpict,
                    "avatar": query[0].avatar,
                    "statusUser": query[0].statusUser,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara
                };

                data.push(objk);
            } else {
                data = [];

            }



            var datacount = null;
            var objcoun = {};
            var dataSum = [];

            try {

                datacount = await this.adsService.countReason(adsId);
            } catch (e) {
                datacount = null;
            }

            for (let i = 0; i < datacount.length; i++) {
                let mycount = datacount[i].myCount;
                let reason = datacount[i]._id;

                let persen = mycount * 100 / reportedUserCount;
                objcoun = {
                    reason: reason,
                    count: mycount,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, totalReport, dataSum, data, messages };
        }

    }

    @UseGuards(JwtAuthGuard)
    @Post('listdetail/v2')
    async finddetail2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/reportuser/listdetail/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var data = [];
        var query = null;
        var totalReport = null;
        var reportuser = null;

        var reportedUserCount = null;
        if (type === "content") {
            var email = null;
            var tagPeople = [];
            var tagpeoples = [];
            var lengUser = null;
            try {
                query = await this.post2SS.findreportuserdetail(postID);
                lengUser = query.length;
                reportedUserCount = query[0].reportedUserCount;
            } catch (e) {
                query = null;
                lengUser = 0;
                reportedUserCount = 0;
            }
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var objauth = {};
            var dataauth = null;
            var idusersell = null;
            var tgltransaksi = null;
            var namapenjual = null;

            let dataapsara = null;


            if (lengUser > 0) {
                email = query[0].email;
                tagpeoples = query[0].tagPeople;

                var ubasicpembeli = await this.basic2SS.findbyemail(email);
                var iduserbuyer = mongoose.Types.ObjectId(ubasicpembeli._id);
                var namapembeli = ubasicpembeli.fullName;

                var datatransaksi = await this.transactionsService.findpostidanduser(query[0].postID, iduserbuyer);

                if (datatransaksi === null || datatransaksi === undefined) {
                    namapenjual = "";
                    tgltransaksi = "";
                } else {
                    idusersell = datatransaksi.idusersell;
                    tgltransaksi = datatransaksi.timestamp;

                    var ubasicpenjual = await this.basic2SS.findOne(idusersell.toString());
                    namapenjual = ubasicpenjual.fullName;

                }


                try {
                    idapsara = query[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[0].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = {};
                }
                else {
                    if (type === "pict") {

                        try {
                            dataapsara = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                    else if (type === "vid") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }

                    }
                    else if (type === "story") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                    else if (type === "diary") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                }

                if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                    apsaradefine = false;
                } else {
                    apsaradefine = true;
                }

                if (idapsara === undefined || idapsara === "" || idapsara === null) {
                    idapsaradefine = "";
                } else {
                    idapsaradefine = idapsara;
                }
                objk = {
                    "_id": query[0]._id,
                    "postID": query[0].postID,
                    "email": query[0].email,
                    "postType": query[0].postType,
                    "description": query[0].description,
                    "active": query[0].active,
                    "createdAt": query[0].createdAt,
                    "updatedAt": query[0].updatedAt,
                    "visibility": query[0].visibility,
                    "location": query[0].location,
                    "tags": query[0].tags,
                    "allowComments": query[0].allowComments,
                    "isSafe": query[0].isSafe,
                    "isOwned": query[0].isOwned,
                    "saleLike": query[0].saleLike,
                    "saleView": query[0].saleView,
                    "metadata": query[0].metadata,
                    "likes": query[0].likes,
                    "views": query[0].views,
                    "shares": query[0].shares,
                    "comments": query[0].comments,
                    "tagPeople": query[0].tagPeople,
                    "proofpict": query[0].proofpict,
                    "insight": query[0].insight,
                    "avatar": query[0].avatar,
                    "fullName": query[0].fullName,
                    "username": query[0].username,
                    "privacy": query[0].privacy,
                    "isIdVerified": query[0].isIdVerified,
                    "statusUser": query[0].statusUser,
                    "isViewed": query[0].isViewed,
                    "monetize": query[0].monetize,
                    "saleAmount": query[0].saleAmount,
                    "mediaref": query[0].mediaref,
                    "mediaType": query[0].mediaType,
                    "mediaThumbEndpoint": query[0].mediaThumbEndpoint,
                    "mediaEndpoint": query[0].mediaEndpoint,
                    "namapenjual": namapenjual,
                    "pemiliksekarang": namapembeli,
                    "tgltransaksi": tgltransaksi,
                    "reportedStatus": query[0].reportedStatus,
                    "reportStatusLast": query[0].reportStatusLast,
                    "reportedUser": query[0].reportedUser,
                    "reportedUserHandle": query[0].reportedUserHandle,
                    "createdAtReportLast": query[0].createdAtReportLast,
                    "createdAtAppealLast": query[0].createdAtAppealLast,
                    "reasonLastAppeal": query[0].reasonLastAppeal,
                    "reasonLastAppealAdmin": query[0].reasonLastAppealAdmin,
                    "reasonLastReport": query[0].reasonLastReport,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "media": dataapsara
                };

                data.push(objk);
            } else {
                data = [];

            }



            var datacount = null;
            var objcoun = {};
            var dataSum = [];

            try {

                datacount = await this.post2SS.countReason(postID);
            } catch (e) {
                datacount = null;
            }

            // reportedUserCount hanya mengambil data yang status nya true
            for (let i = 0; i < datacount.length; i++) {
                let mycount = datacount[i].myCount;
                let reason = datacount[i]._id;

                let persen = mycount * 100 / reportedUserCount;
                objcoun = {
                    reason: reason,
                    count: mycount,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

            try {
                reportuser = query[0].reportedUser;
                lengreportuser = reportuser.length;
            } catch (e) {
                reportuser = null;
                lengreportuser = 0;
            }

            if (lengreportuser > 0) {
                // for (let x = 0; x < lengreportuser; x++) {
                //     if (reportuser[x].active == false) {
                //         lengreportuser = lengreportuser - x;
                //         totalReport = lengreportuser - 1;
                //     } else {
                //         totalReport = lengreportuser;
                //     }
                // }
                totalReport = reportedUserCount;

            }
            else {
                totalReport = 0;
            }


            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, totalReport, dataSum, data, messages };
        }
        else if (type === "ads") {
            var adsId = mongoose.Types.ObjectId(postID);
            try {
                query = await this.adsService.detailadsreport2(adsId);
            } catch (e) {
                query = null;
            }
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var dataapsara = null;
            var dtcounview = null;
            var dtcountclick = null;
            var tView = null;
            var tClick = null;
            var lengreportuser = null;



            if (query !== null) {

                try {
                    dtcounview = await this.userAdsService.countViewads(adsId);
                    tView = dtcounview[0].totalView;
                } catch (e) {
                    dtcounview = null;
                    tView = 0;
                }
                try {
                    dtcountclick = await this.userAdsService.countKlikads(adsId);
                    tClick = dtcountclick[0].totalClick;
                } catch (e) {
                    dtcountclick = null;
                    tClick = 0;
                }

                try {
                    reportuser = query[0].reportedUser;
                    lengreportuser = reportuser.length;
                } catch (e) {
                    reportuser = null;
                    lengreportuser = 0;
                }

                if (lengreportuser > 0) {
                    for (let x = 0; x < lengreportuser; x++) {
                        if (reportuser[x].active == false) {
                            lengreportuser = lengreportuser - x;
                            totalReport = lengreportuser - 1;
                        } else {
                            totalReport = lengreportuser;
                        }
                    }

                }

                try {
                    idapsara = query[0].idApsara;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[0].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[0].type;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = {};
                } else {
                    if (type === "image") {

                        try {
                            dataapsara = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }
                    }
                    else if (type === "video") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = {};
                        }

                    }

                }

                if (idapsara === undefined || idapsara === "" || idapsara === null) {
                    idapsaradefine = "";

                } else {
                    idapsaradefine = idapsara;

                }
                objk = {
                    "_id": query[0]._id,
                    "userID": query[0].userID,
                    "name": query[0].name,
                    "nameType": query[0].nameType,
                    "status": query[0].status,
                    "timestamp": query[0].timestamp,
                    "totalUsedCredit": query[0].totalUsedCredit,
                    "type": query[0].type,
                    "tayang": query[0].tayang,
                    "usedCredit": query[0].usedCredit,
                    "usedCreditFree": query[0].usedCreditFree,
                    "creditFree": query[0].creditFree,
                    "creditValue": query[0].creditValue,
                    "totalCredit": query[0].totalCredit,
                    "totalView": tView,
                    "totalClick": tClick,
                    "idApsara": query[0].idApsara,
                    "reportedStatus": query[0].reportedStatus,
                    "reportedUserCount": query[0].reportedUserCount,
                    "reportedUser": query[0].reportedUser,
                    "reportedUserHandle": query[0].reportedUserHandle,
                    "contentModeration": query[0].contentModeration,
                    "contentModerationResponse": query[0].contentModerationResponse,
                    "interest": query[0].interest,
                    "place": query[0].place,
                    "reportStatusLast": query[0].reportStatusLast,
                    "createdAtReportLast": query[0].createdAtReportLast,
                    "createdAtAppealLast": query[0].createdAtAppealLast,
                    "reasonLastReport": query[0].reasonLastReport,
                    "reasonLastAppeal": query[0].reasonLastAppeal,
                    "reasonLastAppealAdmin": query[0].reasonLastAppealAdmin,
                    "fullName": query[0].fullName,
                    "email": query[0].email,
                    "proofpict": query[0].proofpict,
                    "avatar": query[0].avatar,
                    "statusUser": query[0].statusUser,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara
                };

                data.push(objk);
            } else {
                data = [];

            }



            var datacount = null;
            var objcoun = {};
            var dataSum = [];

            try {

                datacount = await this.adsService.countReason(adsId);
            } catch (e) {
                datacount = null;
            }

            for (let i = 0; i < datacount.length; i++) {
                let mycount = datacount[i].myCount;
                let reason = datacount[i]._id;

                let persen = mycount * 100 / reportedUserCount;
                objcoun = {
                    reason: reason,
                    count: mycount,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, totalReport, dataSum, data, messages };
        }

    }

    @UseGuards(JwtAuthGuard)
    @Post('listuserreport')
    async finduserreport(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/reportuser/listuserreport';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var data = [];
        var query = null;

        var reportedUser = [];
        var reportedUserCount = null;
        var mediaprofilepicts = null;
        var mediaprofilepicts_res = {};
        var lengUser = null;
        var media = null;
        if (type === "content") {

            var objrepuser = {};
            var arrRepuser = [];
            var datauser = null;

            try {
                query = await this.postsService.findreportuserdetail(postID);
            } catch (e) {
                query = null;
            }


            if (query !== null) {

                try {
                    reportedUser = query[0].reportedUser;
                    lengUser = reportedUser.length;
                } catch (e) {
                    reportedUser = null;
                    lengUser = 0;
                }
                try {
                    reportedUserCount = query[0].reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }


                if (reportedUser !== null || reportedUser !== undefined || lengUser > 0) {

                    // for (let i = 0; i < lengUser; i++) {


                    //     let createdAt = reportedUser[i].createdAt;
                    //     let remark = reportedUser[i].description;
                    //     let email = reportedUser[i].email;

                    //     try {
                    //         datauser = await this.userbasicsService.findOne(email);
                    //     } catch (e) {
                    //         datauser = null;
                    //     }

                    //     if (datauser !== null || datauser !== undefined) {
                    //         try {
                    //             media = datauser._doc.profilePict.oid;
                    //         } catch (e) {
                    //             media = null;
                    //         }
                    //         var fullName = datauser._doc.fullName;

                    //         if (media !== null) {

                    //             try {

                    //                 mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
                    //                 console.log(mediaprofilepicts)
                    //                 var mediaID = mediaprofilepicts.mediaID;
                    //                 let result = "/profilepict/" + mediaID;
                    //                 mediaprofilepicts_res = {
                    //                     mediaBasePath: mediaprofilepicts.mediaBasePath,
                    //                     mediaUri: mediaprofilepicts.mediaUri,
                    //                     mediaType: mediaprofilepicts.mediaType,
                    //                     mediaEndpoint: result
                    //                 };
                    //             } catch (e) {

                    //                 mediaprofilepicts_res = {
                    //                     mediaBasePath: "",
                    //                     mediaUri: "",
                    //                     mediaType: "",
                    //                     mediaEndpoint: ""
                    //                 };
                    //             }
                    //         } else {
                    //             mediaprofilepicts_res = {
                    //                 mediaBasePath: "",
                    //                 mediaUri: "",
                    //                 mediaType: "",
                    //                 mediaEndpoint: ""
                    //             };
                    //         }
                    //     }

                    //     objrepuser = {
                    //         "fullName": fullName,
                    //         "email": email,
                    //         "createdAt": createdAt,
                    //         "description": remark,
                    //         "avatar": mediaprofilepicts_res,

                    //     }

                    //     arrRepuser.push(objrepuser);

                    // }

                    for (let i = 0; i < lengUser; i++) {

                        let cekactive = reportedUser[i].active;
                        if (cekactive == true) {
                            let createdAt = reportedUser[i].createdAt;
                            let remark = reportedUser[i].description;
                            let email = reportedUser[i].email;

                            try {
                                datauser = await this.userbasicsService.findOne(email);
                            } catch (e) {
                                datauser = null;
                            }

                            if (datauser !== null || datauser !== undefined) {
                                try {
                                    media = datauser._doc.profilePict.oid;
                                } catch (e) {
                                    media = null;
                                }
                                var fullName = datauser._doc.fullName;

                                if (media !== null) {

                                    try {

                                        mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
                                        console.log(mediaprofilepicts)
                                        var mediaID = mediaprofilepicts.mediaID;
                                        let result = "/profilepict/" + mediaID;
                                        mediaprofilepicts_res = {
                                            mediaBasePath: mediaprofilepicts.mediaBasePath,
                                            mediaUri: mediaprofilepicts.mediaUri,
                                            mediaType: mediaprofilepicts.mediaType,
                                            mediaEndpoint: result
                                        };
                                    } catch (e) {

                                        mediaprofilepicts_res = {
                                            mediaBasePath: "",
                                            mediaUri: "",
                                            mediaType: "",
                                            mediaEndpoint: ""
                                        };
                                    }
                                } else {
                                    mediaprofilepicts_res = {
                                        mediaBasePath: "",
                                        mediaUri: "",
                                        mediaType: "",
                                        mediaEndpoint: ""
                                    };
                                }
                            }

                            objrepuser = {
                                "fullName": fullName,
                                "email": email,
                                "createdAt": createdAt,
                                "description": remark,
                                "avatar": mediaprofilepicts_res,

                            }

                            arrRepuser.push(objrepuser);
                        }

                    }

                    let active = reportedUser[lengUser - 1].active;

                    if (active === true) {
                        data = arrRepuser;
                    } else {
                        data = [];
                    }

                } else {
                    data = [];
                }


            }
        }
        else if (type === "ads") {
            var adsId = mongoose.Types.ObjectId(postID);

            var objrepuser = {};
            var arrRepuser = [];
            var datauser = null;
            try {
                query = await this.adsService.detailadsreport(adsId);
            } catch (e) {
                query = null;
            }


            if (query !== null) {

                try {
                    reportedUser = query[0].reportedUser;
                    lengUser = reportedUser.length;
                } catch (e) {
                    reportedUser = null;
                    lengUser = 0;
                }
                try {
                    reportedUserCount = query[0].reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }


                if (reportedUser !== null || reportedUser !== undefined || reportedUser.length > 0) {

                    for (let i = 0; i < reportedUser.length; i++) {


                        let createdAt = reportedUser[i].createdAt;
                        let remark = reportedUser[i].description;
                        let email = reportedUser[i].email;
                        try {
                            datauser = await this.userbasicsService.findOne(email);
                        } catch (e) {
                            datauser = null;
                        }

                        if (datauser !== null || datauser !== undefined) {

                            try {
                                media = datauser._doc.profilePict.oid;
                            } catch (e) {
                                media = null;
                            }
                            var fullName = datauser._doc.fullName;

                            if (media !== null) {

                                try {

                                    mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
                                    console.log(mediaprofilepicts)
                                    var mediaID = mediaprofilepicts.mediaID;
                                    let result = "/profilepict/" + mediaID;
                                    mediaprofilepicts_res = {
                                        mediaBasePath: mediaprofilepicts.mediaBasePath,
                                        mediaUri: mediaprofilepicts.mediaUri,
                                        mediaType: mediaprofilepicts.mediaType,
                                        mediaEndpoint: result
                                    };
                                } catch (e) {

                                    mediaprofilepicts_res = {
                                        mediaBasePath: "",
                                        mediaUri: "",
                                        mediaType: "",
                                        mediaEndpoint: ""
                                    };
                                }
                            } else {
                                mediaprofilepicts_res = {
                                    mediaBasePath: "",
                                    mediaUri: "",
                                    mediaType: "",
                                    mediaEndpoint: ""
                                };
                            }
                        }
                        objrepuser = {
                            "fullName": fullName,
                            "email": email,
                            "createdAt": createdAt,
                            "description": remark,
                            "avatar": mediaprofilepicts_res,

                        }

                        arrRepuser.push(objrepuser);

                    }

                    let active = reportedUser[lengUser - 1].active;

                    if (active === true) {
                        data = arrRepuser;
                    } else {
                        data = [];
                    }

                } else {
                    data = [];
                }


            }


        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, totalReport: reportedUserCount, data, messages };

    }

    @UseGuards(JwtAuthGuard)
    @Post('listuserreport/v2')
    async finduserreport2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/reportuser/listuserreport/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var data = [];
        var query = null;

        var reportedUser = [];
        var reportedUserCount = null;
        var mediaprofilepicts = null;
        var mediaprofilepicts_res = {};
        var lengUser = null;
        var media = null;
        if (type === "content") {

            var objrepuser = {};
            var arrRepuser = [];
            var datauser = null;

            try {
                query = await this.post2SS.detailuserreport(postID);
            } catch (e) {
                query = null;
            }


            if (query !== null) {

                try {
                    reportedUser = query[0].reportedUser;
                    lengUser = reportedUser.length;
                } catch (e) {
                    reportedUser = null;
                    lengUser = 0;
                }
                try {
                    reportedUserCount = query[0].reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }


                if (reportedUser !== null || reportedUser !== undefined || lengUser > 0) {

                    // for (let i = 0; i < lengUser; i++) {


                    //     let createdAt = reportedUser[i].createdAt;
                    //     let remark = reportedUser[i].description;
                    //     let email = reportedUser[i].email;

                    //     try {
                    //         datauser = await this.userbasicsService.findOne(email);
                    //     } catch (e) {
                    //         datauser = null;
                    //     }

                    //     if (datauser !== null || datauser !== undefined) {
                    //         try {
                    //             media = datauser._doc.profilePict.oid;
                    //         } catch (e) {
                    //             media = null;
                    //         }
                    //         var fullName = datauser._doc.fullName;

                    //         if (media !== null) {

                    //             try {

                    //                 mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
                    //                 console.log(mediaprofilepicts)
                    //                 var mediaID = mediaprofilepicts.mediaID;
                    //                 let result = "/profilepict/" + mediaID;
                    //                 mediaprofilepicts_res = {
                    //                     mediaBasePath: mediaprofilepicts.mediaBasePath,
                    //                     mediaUri: mediaprofilepicts.mediaUri,
                    //                     mediaType: mediaprofilepicts.mediaType,
                    //                     mediaEndpoint: result
                    //                 };
                    //             } catch (e) {

                    //                 mediaprofilepicts_res = {
                    //                     mediaBasePath: "",
                    //                     mediaUri: "",
                    //                     mediaType: "",
                    //                     mediaEndpoint: ""
                    //                 };
                    //             }
                    //         } else {
                    //             mediaprofilepicts_res = {
                    //                 mediaBasePath: "",
                    //                 mediaUri: "",
                    //                 mediaType: "",
                    //                 mediaEndpoint: ""
                    //             };
                    //         }
                    //     }

                    //     objrepuser = {
                    //         "fullName": fullName,
                    //         "email": email,
                    //         "createdAt": createdAt,
                    //         "description": remark,
                    //         "avatar": mediaprofilepicts_res,

                    //     }

                    //     arrRepuser.push(objrepuser);

                    // }

                    for (let i = 0; i < lengUser; i++) {

                        let cekactive = reportedUser[i].active;
                        if (cekactive == true) {
                            let createdAt = reportedUser[i].createdAt;
                            let remark = reportedUser[i].description;
                            let email = reportedUser[i].email;

                            try {
                                datauser = await this.basic2SS.findbyemail(email);
                            } catch (e) {
                                datauser = null;
                            }
                            let fullName = datauser.fullName;
                            mediaprofilepicts_res = {
                                mediaBasePath: (datauser.mediaBasePath == undefined && datauser.mediaBasePath == null ? "" : datauser.mediaBasePath),
                                mediaUri: (datauser.mediaUri == undefined && datauser.mediaUri == null ? "" : datauser.mediaUri),
                                mediaType: (datauser.mediaType == undefined && datauser.mediaType == null ? "" : datauser.mediaType),
                                mediaEndpoint: (datauser.mediaEndpoint == undefined && datauser.mediaEndpoint == null ? "" : datauser.mediaEndpoint),
                            };

                            objrepuser = {
                                "fullName": fullName,
                                "email": email,
                                "createdAt": createdAt,
                                "description": remark,
                                "avatar": mediaprofilepicts_res,

                            }

                            arrRepuser.push(objrepuser);
                        }

                    }

                    let active = reportedUser[lengUser - 1].active;

                    if (active === true) {
                        data = arrRepuser;
                    } else {
                        data = [];
                    }

                } else {
                    data = [];
                }


            }
        }
        else if (type === "ads") {
            var adsId = mongoose.Types.ObjectId(postID);

            var objrepuser = {};
            var arrRepuser = [];
            var datauser = null;
            try {
                query = await this.adsService.detailadsreport2(adsId);
            } catch (e) {
                query = null;
            }


            if (query !== null) {

                try {
                    reportedUser = query[0].reportedUser;
                    lengUser = reportedUser.length;
                } catch (e) {
                    reportedUser = null;
                    lengUser = 0;
                }
                try {
                    reportedUserCount = query[0].reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }


                if (reportedUser !== null || reportedUser !== undefined || reportedUser.length > 0) {

                    for (let i = 0; i < lengUser; i++) {

                        let cekactive = reportedUser[i].active;
                        if (cekactive == true) {
                            let createdAt = reportedUser[i].createdAt;
                            let remark = reportedUser[i].description;
                            let email = reportedUser[i].email;

                            try {
                                datauser = await this.basic2SS.findbyemail(email);
                            } catch (e) {
                                datauser = null;
                            }
                            let fullName = datauser.fullName;
                            mediaprofilepicts_res = {
                                mediaBasePath: (datauser.mediaBasePath == undefined && datauser.mediaBasePath == null ? "" : datauser.mediaBasePath),
                                mediaUri: (datauser.mediaUri == undefined && datauser.mediaUri == null ? "" : datauser.mediaUri),
                                mediaType: (datauser.mediaType == undefined && datauser.mediaType == null ? "" : datauser.mediaType),
                                mediaEndpoint: (datauser.mediaEndpoint == undefined && datauser.mediaEndpoint == null ? "" : datauser.mediaEndpoint),
                            };

                            objrepuser = {
                                "fullName": fullName,
                                "email": email,
                                "createdAt": createdAt,
                                "description": remark,
                                "avatar": mediaprofilepicts_res,

                            }

                            arrRepuser.push(objrepuser);
                        }

                    }

                    let active = reportedUser[lengUser - 1].active;

                    if (active === true) {
                        data = arrRepuser;
                    } else {
                        data = [];
                    }

                } else {
                    data = [];
                }


            }


        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, totalReport: reportedUserCount, data, messages };

    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard)
    @Post('delete')
    async reportHandleDelete(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;

        var type = null;
        var remark = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        reasonId = request_json["reasonId"];
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
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];

        if (type === "content") {
            try {
                datacontent = await this.postsService.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }

            if (reportedUserHandle.length > 0) {
                await this.postsService.updateActive(postID, dt.toISOString(), remark);
                this.sendReportAppealFCM("NOTIFY_APPEAL", "DELETE", "CONTENT", postID);

            } else {

                objreporthandle = {
                    "remark": remark,
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DELETE"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.postsService.updateActiveEmpty(postID, dt.toISOString(), arrayreportedHandle);
                this.sendReportAppealFCM("NOTIFY_APPEAL", "DELETE", "CONTENT", postID);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (reportedUserHandle.length > 0) {
                await this.adsService.updateActive(adsId, dt.toISOString(), remark);

            } else {

                objreporthandle = {
                    "remark": remark,
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DELETE"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateActiveEmpty(adsId, dt.toISOString(), arrayreportedHandle);
            }


        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('delete/v2')
    async reportHandleDeleteV2(@Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;

        var type = null;
        var remark = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        reasonId = request_json["reasonId"];
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
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];

        if (type === "content") {
            try {
                datacontent = await this.post2SS.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }

            if (reportedUserHandle.length > 0) {
                await this.post2SS.updateActive(postID, dt.toISOString(), remark);
                this.sendReportAppealFCM("NOTIFY_APPEAL", "DELETE", "CONTENT", postID);

            } else {

                objreporthandle = {
                    "remark": remark,
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DELETE"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.post2SS.updateActiveEmpty(postID, dt.toISOString(), arrayreportedHandle);
                this.sendReportAppealFCM("NOTIFY_APPEAL", "DELETE", "CONTENT", postID);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.ads2SS.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (reportedUserHandle.length > 0) {
                await this.ads2SS.updateActive(adsId, dt.toISOString(), remark);

            } else {

                objreporthandle = {
                    "remark": remark,
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DELETE"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.ads2SS.updateActiveEmpty(adsId, dt.toISOString(), arrayreportedHandle);
            }


        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('summary')
    async findsummary(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));


        var startdate = null;
        var enddate = null;

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        // Content
        var datacontentreport = null;
        var datakyc = null;
        var reportContent = [];
        var appealContent = [];
        var moderationContent = [];
        var lengreportContent = null;
        var lengappealContent = null;
        var lengmoderationContent = null;
        var sumreportContent = null;
        var sumappealContent = null;
        var summoderationContent = null;
        var objreportContent = {}
        var arrDataContent = [];
        var objappealContent = {}
        var arrDataContentAppeal = [];
        var objmoderationContent = {}
        var arrDataContentModeration = [];
        var arrkyc = [];

        //ads
        var dataadsreport = null;
        var reportAds = [];
        var appealAds = [];
        var moderationAds = [];
        var lengreportAds = null;
        var lengappealAds = null;
        var lengmoderationAds = null;
        var sumreportAds = null;
        var sumappealAds = null;
        var summoderationAds = null;
        var summkyc = null;
        var objreportAds = {}
        var arrDataAds = [];
        var objappealAds = {}
        var arrDataAdsAppeal = [];
        var objmoderationAds = {}
        var arrDataAdsModeration = [];
        var lengkyc = null;
        var persen = null;

        var dataappealbank = null;
        var objappealBank = {}
        var arrDataBankAppeal = [];
        var sumAppealBank = null;
        var lengappealbank = 0;

        try {

            dataappealbank = await this.userbankaccountsService.countAppealakunbank(startdate, enddate);
            lengappealbank = dataappealbank.length;

        } catch (e) {
            dataappealbank = null;
            lengappealbank = 0;

        }

        if (lengappealbank > 0) {

            for (let i = 0; i < lengappealbank; i++) {
                sumAppealBank += dataappealbank[i].myCount;

            }

        } else {
            sumAppealBank = 0;
        }
        if (lengappealbank > 0) {


            for (let i = 0; i < lengappealbank; i++) {
                let count = dataappealbank[i].myCount;
                let id = dataappealbank[i]._id;
                persen = count * 100 / sumAppealBank;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "red"
                    };
                    arrDataBankAppeal.push(objbaru);
                }
                let objkyc = {}
                if (id === "DITOLAK") {
                    objkyc = {
                        "_id": "DITOLAK",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataBankAppeal.push(objkyc);
                }
                let objtidakditangguhkan = {}
                if (id === "DISETUJUI") {
                    objtidakditangguhkan = {
                        "_id": "DISETUJUI",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrDataBankAppeal.push(objtidakditangguhkan);
                }

            }
        } else {
            arrDataBankAppeal = [];
        }
        var appealAkunBank = null;

        appealAkunBank = {
            appealAkunBank: [{
                totalReport: sumAppealBank,
                data: arrDataBankAppeal
            }
            ],
        };


        try {

            datacontentreport = await this.postsService.countReportStatus(startdate, enddate);
            reportContent = datacontentreport[0].report;
            appealContent = datacontentreport[0].appeal;
            moderationContent = datacontentreport[0].moderation;

        } catch (e) {
            datacontentreport = null;
            reportContent = [];
            appealContent = [];
            moderationContent = [];
        }

        try {
            lengreportContent = reportContent.length;
        } catch (e) {
            lengreportContent = 0;
        }
        try {
            lengappealContent = appealContent.length;
        } catch (e) {
            lengappealContent = 0;
        }

        try {
            lengmoderationContent = moderationContent.length;
        } catch (e) {
            lengmoderationContent = 0;
        }



        if (lengreportContent > 0) {

            for (let i = 0; i < lengreportContent; i++) {
                sumreportContent += reportContent[i].myCount;

            }

        } else {
            sumreportContent = 0;
        }

        if (lengreportContent > 0) {

            for (let i = 0; i < lengreportContent; i++) {
                let count = reportContent[i].myCount;
                let id = reportContent[i]._id;
                persen = count * 100 / sumreportContent;


                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataContent.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataContent.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataContent.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataContent.push(objflagging);
                }

            }

        } else {
            arrDataContent = [];
        }

        if (lengappealContent > 0) {

            for (let i = 0; i < lengappealContent; i++) {
                sumappealContent += appealContent[i].myCount;

            }
        } else {
            sumappealContent = 0;
        }

        if (lengappealContent > 0) {


            for (let i = 0; i < lengappealContent; i++) {
                let count = appealContent[i].myCount;
                let id = appealContent[i]._id;
                persen = count * 100 / sumappealContent;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataContentAppeal.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataContentAppeal.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataContentAppeal.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataContentAppeal.push(objflagging);
                }


            }
        } else {
            arrDataContentAppeal = [];
        }

        if (lengmoderationContent > 0) {

            for (let i = 0; i < lengmoderationContent; i++) {
                summoderationContent += moderationContent[i].myCount;

            }

        } else {
            summoderationContent = 0;
        }

        if (lengmoderationContent > 0) {


            for (let i = 0; i < lengmoderationContent; i++) {
                let count = moderationContent[i].myCount;
                let id = moderationContent[i]._id;
                persen = count * 100 / summoderationContent;

                objmoderationContent = {
                    "_id": id,
                    "myCount": count,
                    "persen": persen.toFixed(2)
                }

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataContentModeration.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataContentModeration.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataContentModeration.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataContentModeration.push(objflagging);
                }


            }
        } else {
            arrDataContentModeration = [];
        }

        var content = null;

        content = {
            report: [{
                totalReport: sumreportContent,
                data: arrDataContent
            }
            ],
            appeal: [{
                totalReport: sumappealContent,
                data: arrDataContentAppeal
            }
            ],
            moderation: [{
                totalReport: summoderationContent,
                data: arrDataContentModeration
            }
            ],
        };



        try {

            dataadsreport = await this.adsService.countReportStatus(startdate, enddate);
            reportAds = dataadsreport[0].report;
            appealAds = dataadsreport[0].appeal;
            moderationAds = dataadsreport[0].moderation;

        } catch (e) {
            dataadsreport = null;
            reportAds = [];
            appealAds = [];
            moderationAds = [];
        }

        try {
            lengreportAds = reportAds.length;
        } catch (e) {
            lengreportAds = 0;
        }
        try {
            lengappealAds = appealAds.length;
        } catch (e) {
            lengappealAds = 0;
        }

        try {
            lengmoderationAds = moderationAds.length;
        } catch (e) {
            lengmoderationAds = 0;
        }



        if (lengreportAds > 0) {

            for (let i = 0; i < lengreportAds; i++) {
                sumreportAds += reportAds[i].myCount;

            }

        } else {
            sumreportAds = 0;
        }

        if (lengreportAds > 0) {

            for (let i = 0; i < lengreportAds; i++) {
                let count = reportAds[i].myCount;
                let id = reportAds[i]._id;
                persen = count * 100 / sumreportAds;

                objreportAds = {
                    "_id": id,
                    "myCount": count,
                    "persen": persen.toFixed(2)
                }

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataAds.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataAds.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataAds.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataAds.push(objflagging);
                }

            }

        } else {
            arrDataAds = [];
        }

        if (lengappealAds > 0) {

            for (let i = 0; i < lengappealAds; i++) {
                sumappealAds += appealAds[i].myCount;

            }
        } else {
            sumappealAds = 0;
        }

        if (lengappealAds > 0) {


            for (let i = 0; i < lengappealAds; i++) {
                let count = appealAds[i].myCount;
                let id = appealAds[i]._id;
                persen = count * 100 / sumappealAds;
                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataAdsAppeal.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataAdsAppeal.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataAdsAppeal.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataAdsAppeal.push(objflagging);
                }

            }
        } else {
            arrDataAdsAppeal = [];
        }

        if (lengmoderationAds > 0) {

            for (let i = 0; i < lengmoderationAds; i++) {
                summoderationAds += moderationAds[i].myCount;

            }

        } else {
            summoderationAds = 0;
        }

        if (lengmoderationAds > 0) {


            for (let i = 0; i < lengmoderationAds; i++) {
                let count = moderationAds[i].myCount;
                let id = moderationAds[i]._id;
                persen = count * 100 / summoderationAds;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataAdsModeration.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataAdsModeration.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataAdsModeration.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataAdsModeration.push(objflagging);
                }



            }
        } else {
            arrDataAdsModeration = [];
        }

        var ads = null;

        ads = {
            report: [{
                totalReport: sumreportAds,
                data: arrDataAds
            }
            ],
            appeal: [{
                totalReport: sumappealAds,
                data: arrDataAdsAppeal
            }
            ],
            moderation: [{
                totalReport: summoderationAds,
                data: arrDataAdsModeration
            }
            ],
        };

        var datauserticket = null;
        var objusertiket = {};
        var arrusertiket = [];
        var lengusertiket = null;
        var sumusertiket = null;

        try {

            datauserticket = await this.userticketsService.countUserticketStatus(startdate, enddate);
            lengusertiket = datauserticket.length;


        } catch (e) {
            datauserticket = null;
            lengusertiket = 0;

        }
        if (lengusertiket > 0) {

            for (let i = 0; i < lengusertiket; i++) {
                sumusertiket += datauserticket[i].myCount;

            }
        } else {
            sumusertiket = 0;
        }

        if (lengusertiket > 0) {


            for (let i = 0; i < lengusertiket; i++) {
                let count = datauserticket[i].myCount;
                let id = datauserticket[i]._id;
                persen = count * 100 / sumusertiket;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "red"
                    };
                    arrusertiket.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DALAM PROSES") {
                    objditangguhkan = {
                        "_id": "DALAM PROSES",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8C00D9"
                    };
                    arrusertiket.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "SELESAI") {
                    objtidakditangguhkan = {
                        "_id": "SELESAI",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrusertiket.push(objtidakditangguhkan);
                }

            }
        } else {
            arrusertiket = [];
        }

        var userticket = null;

        userticket = {
            ticket: [{
                totalReport: sumusertiket,
                data: arrusertiket
            }
            ],
        };

        try {

            //datakyc = await this.mediaproofpictsService.listkycsummary(startdate, enddate);
            datakyc = await this.userbasicsService.listkycsummary2(startdate, enddate, 'summary', null, null, null, null, null);
            lengkyc = datakyc.length;

        } catch (e) {
            datakyc = null;
            lengkyc = 0;

        }

        if (lengkyc > 0) {

            for (let i = 0; i < lengkyc; i++) {
                summkyc += datakyc[i].myCount;

            }
        } else {
            summkyc = 0;
        }

        if (lengkyc > 0) {


            for (let i = 0; i < lengkyc; i++) {
                let count = datakyc[i].myCount;
                let id = datakyc[i]._id;
                persen = count * 100 / summkyc;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "red"
                    };
                    arrkyc.push(objbaru);
                }
                let objkyc = {}
                if (id === "DITOLAK") {
                    objkyc = {
                        "_id": "DITOLAK",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrkyc.push(objkyc);
                }
                let objtidakditangguhkan = {}
                if (id === "DISETUJUI") {
                    objtidakditangguhkan = {
                        "_id": "DISETUJUI",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrkyc.push(objtidakditangguhkan);
                }
                let objbysystem = {}
                if (id === "BYSYSTEM") {
                    objbysystem = {
                        "_id": "BYSYSTEM",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrkyc.push(objbysystem);
                }

            }
        } else {
            arrkyc = [];
        }
        var kyc = null;

        kyc = {
            kyc: [{
                totalReport: summkyc,
                data: arrkyc
            }
            ],
        };

        return { response_code: 202, content, ads, userticket, kyc, appealAkunBank, messages };



    }

    @UseGuards(JwtAuthGuard)
    @Post('summary/v2')
    async findsummary2(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));


        var startdate = null;
        var enddate = null;

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        // Content
        var datacontentreport = null;
        var datakyc = null;
        var reportContent = [];
        var appealContent = [];
        var moderationContent = [];
        var lengreportContent = null;
        var lengappealContent = null;
        var lengmoderationContent = null;
        var sumreportContent = null;
        var sumappealContent = null;
        var summoderationContent = null;
        var objreportContent = {}
        var arrDataContent = [];
        var objappealContent = {}
        var arrDataContentAppeal = [];
        var objmoderationContent = {}
        var arrDataContentModeration = [];
        var arrkyc = [];

        //ads
        var dataadsreport = null;
        var reportAds = [];
        var appealAds = [];
        var moderationAds = [];
        var lengreportAds = null;
        var lengappealAds = null;
        var lengmoderationAds = null;
        var sumreportAds = null;
        var sumappealAds = null;
        var summoderationAds = null;
        var summkyc = null;
        var objreportAds = {}
        var arrDataAds = [];
        var objappealAds = {}
        var arrDataAdsAppeal = [];
        var objmoderationAds = {}
        var arrDataAdsModeration = [];
        var lengkyc = null;
        var persen = null;

        var dataappealbank = null;
        var objappealBank = {}
        var arrDataBankAppeal = [];
        var sumAppealBank = null;
        var lengappealbank = 0;

        try {

            dataappealbank = await this.userbankaccountsService.countAppealakunbank(startdate, enddate);
            lengappealbank = dataappealbank.length;

        } catch (e) {
            dataappealbank = null;
            lengappealbank = 0;

        }

        if (lengappealbank > 0) {

            for (let i = 0; i < lengappealbank; i++) {
                sumAppealBank += dataappealbank[i].myCount;

            }

        } else {
            sumAppealBank = 0;
        }
        if (lengappealbank > 0) {


            for (let i = 0; i < lengappealbank; i++) {
                let count = dataappealbank[i].myCount;
                let id = dataappealbank[i]._id;
                persen = count * 100 / sumAppealBank;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "red"
                    };
                    arrDataBankAppeal.push(objbaru);
                }
                let objkyc = {}
                if (id === "DITOLAK") {
                    objkyc = {
                        "_id": "DITOLAK",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataBankAppeal.push(objkyc);
                }
                let objtidakditangguhkan = {}
                if (id === "DISETUJUI") {
                    objtidakditangguhkan = {
                        "_id": "DISETUJUI",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrDataBankAppeal.push(objtidakditangguhkan);
                }

            }
        } else {
            arrDataBankAppeal = [];
        }
        var appealAkunBank = null;

        appealAkunBank = {
            appealAkunBank: [{
                totalReport: sumAppealBank,
                data: arrDataBankAppeal
            }
            ],
        };


        try {

            datacontentreport = await this.post2SS.countReportStatus(startdate, enddate);
            reportContent = datacontentreport[0].report;
            appealContent = datacontentreport[0].appeal;
            moderationContent = datacontentreport[0].moderation;

        } catch (e) {
            datacontentreport = null;
            reportContent = [];
            appealContent = [];
            moderationContent = [];
        }

        try {
            lengreportContent = reportContent.length;
        } catch (e) {
            lengreportContent = 0;
        }
        try {
            lengappealContent = appealContent.length;
        } catch (e) {
            lengappealContent = 0;
        }

        try {
            lengmoderationContent = moderationContent.length;
        } catch (e) {
            lengmoderationContent = 0;
        }



        if (lengreportContent > 0) {

            for (let i = 0; i < lengreportContent; i++) {
                sumreportContent += reportContent[i].myCount;

            }

        } else {
            sumreportContent = 0;
        }

        if (lengreportContent > 0) {

            for (let i = 0; i < lengreportContent; i++) {
                let count = reportContent[i].myCount;
                let id = reportContent[i]._id;
                persen = count * 100 / sumreportContent;


                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataContent.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataContent.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataContent.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataContent.push(objflagging);
                }

            }

        } else {
            arrDataContent = [];
        }

        if (lengappealContent > 0) {

            for (let i = 0; i < lengappealContent; i++) {
                sumappealContent += appealContent[i].myCount;

            }
        } else {
            sumappealContent = 0;
        }

        if (lengappealContent > 0) {


            for (let i = 0; i < lengappealContent; i++) {
                let count = appealContent[i].myCount;
                let id = appealContent[i]._id;
                persen = count * 100 / sumappealContent;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataContentAppeal.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataContentAppeal.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataContentAppeal.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataContentAppeal.push(objflagging);
                }


            }
        } else {
            arrDataContentAppeal = [];
        }

        if (lengmoderationContent > 0) {

            for (let i = 0; i < lengmoderationContent; i++) {
                summoderationContent += moderationContent[i].myCount;

            }

        } else {
            summoderationContent = 0;
        }

        if (lengmoderationContent > 0) {


            for (let i = 0; i < lengmoderationContent; i++) {
                let count = moderationContent[i].myCount;
                let id = moderationContent[i]._id;
                persen = count * 100 / summoderationContent;

                objmoderationContent = {
                    "_id": id,
                    "myCount": count,
                    "persen": persen.toFixed(2)
                }

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataContentModeration.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataContentModeration.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataContentModeration.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataContentModeration.push(objflagging);
                }


            }
        } else {
            arrDataContentModeration = [];
        }

        var content = null;

        content = {
            report: [{
                totalReport: sumreportContent,
                data: arrDataContent
            }
            ],
            appeal: [{
                totalReport: sumappealContent,
                data: arrDataContentAppeal
            }
            ],
            moderation: [{
                totalReport: summoderationContent,
                data: arrDataContentModeration
            }
            ],
        };



        try {

            dataadsreport = await this.adsService.countReportStatus(startdate, enddate);
            reportAds = dataadsreport[0].report;
            appealAds = dataadsreport[0].appeal;
            moderationAds = dataadsreport[0].moderation;

        } catch (e) {
            dataadsreport = null;
            reportAds = [];
            appealAds = [];
            moderationAds = [];
        }

        try {
            lengreportAds = reportAds.length;
        } catch (e) {
            lengreportAds = 0;
        }
        try {
            lengappealAds = appealAds.length;
        } catch (e) {
            lengappealAds = 0;
        }

        try {
            lengmoderationAds = moderationAds.length;
        } catch (e) {
            lengmoderationAds = 0;
        }



        if (lengreportAds > 0) {

            for (let i = 0; i < lengreportAds; i++) {
                sumreportAds += reportAds[i].myCount;

            }

        } else {
            sumreportAds = 0;
        }

        if (lengreportAds > 0) {

            for (let i = 0; i < lengreportAds; i++) {
                let count = reportAds[i].myCount;
                let id = reportAds[i]._id;
                persen = count * 100 / sumreportAds;

                objreportAds = {
                    "_id": id,
                    "myCount": count,
                    "persen": persen.toFixed(2)
                }

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataAds.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataAds.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataAds.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataAds.push(objflagging);
                }

            }

        } else {
            arrDataAds = [];
        }

        if (lengappealAds > 0) {

            for (let i = 0; i < lengappealAds; i++) {
                sumappealAds += appealAds[i].myCount;

            }
        } else {
            sumappealAds = 0;
        }

        if (lengappealAds > 0) {


            for (let i = 0; i < lengappealAds; i++) {
                let count = appealAds[i].myCount;
                let id = appealAds[i]._id;
                persen = count * 100 / sumappealAds;
                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataAdsAppeal.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataAdsAppeal.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataAdsAppeal.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataAdsAppeal.push(objflagging);
                }

            }
        } else {
            arrDataAdsAppeal = [];
        }

        if (lengmoderationAds > 0) {

            for (let i = 0; i < lengmoderationAds; i++) {
                summoderationAds += moderationAds[i].myCount;

            }

        } else {
            summoderationAds = 0;
        }

        if (lengmoderationAds > 0) {


            for (let i = 0; i < lengmoderationAds; i++) {
                let count = moderationAds[i].myCount;
                let id = moderationAds[i]._id;
                persen = count * 100 / summoderationAds;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#E31D41"
                    };
                    arrDataAdsModeration.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DITANGGUHKAN") {
                    objditangguhkan = {
                        "_id": "DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#8DCD03"
                    };
                    arrDataAdsModeration.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "TIDAK DITANGGUHKAN") {
                    objtidakditangguhkan = {
                        "_id": "TIDAK DITANGGUHKAN",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8800"
                    };
                    arrDataAdsModeration.push(objtidakditangguhkan);
                }

                let objflagging = {}
                if (id === "FLAGING") {
                    objflagging = {
                        "_id": "DITANDAI SENSITIF",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrDataAdsModeration.push(objflagging);
                }



            }
        } else {
            arrDataAdsModeration = [];
        }

        var ads = null;

        ads = {
            report: [{
                totalReport: sumreportAds,
                data: arrDataAds
            }
            ],
            appeal: [{
                totalReport: sumappealAds,
                data: arrDataAdsAppeal
            }
            ],
            moderation: [{
                totalReport: summoderationAds,
                data: arrDataAdsModeration
            }
            ],
        };

        var datauserticket = null;
        var objusertiket = {};
        var arrusertiket = [];
        var lengusertiket = null;
        var sumusertiket = null;

        try {

            datauserticket = await this.userticketsService.countUserticketStatus(startdate, enddate);
            lengusertiket = datauserticket.length;


        } catch (e) {
            datauserticket = null;
            lengusertiket = 0;

        }
        if (lengusertiket > 0) {

            for (let i = 0; i < lengusertiket; i++) {
                sumusertiket += datauserticket[i].myCount;

            }
        } else {
            sumusertiket = 0;
        }

        if (lengusertiket > 0) {


            for (let i = 0; i < lengusertiket; i++) {
                let count = datauserticket[i].myCount;
                let id = datauserticket[i]._id;
                persen = count * 100 / sumusertiket;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "red"
                    };
                    arrusertiket.push(objbaru);
                }
                let objditangguhkan = {}
                if (id === "DALAM PROSES") {
                    objditangguhkan = {
                        "_id": "DALAM PROSES",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#FF8C00D9"
                    };
                    arrusertiket.push(objditangguhkan);
                }
                let objtidakditangguhkan = {}
                if (id === "SELESAI") {
                    objtidakditangguhkan = {
                        "_id": "SELESAI",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrusertiket.push(objtidakditangguhkan);
                }

            }
        } else {
            arrusertiket = [];
        }

        var userticket = null;

        userticket = {
            ticket: [{
                totalReport: sumusertiket,
                data: arrusertiket
            }
            ],
        };

        try {

            //datakyc = await this.mediaproofpictsService.listkycsummary(startdate, enddate);
            datakyc = await this.basic2SS.listkycsummary2(startdate, enddate, 'summary', null, null, null, null, null);
            lengkyc = datakyc.length;

        } catch (e) {
            datakyc = null;
            lengkyc = 0;

        }

        if (lengkyc > 0) {

            for (let i = 0; i < lengkyc; i++) {
                summkyc += datakyc[i].myCount;

            }
        } else {
            summkyc = 0;
        }

        if (lengkyc > 0) {


            for (let i = 0; i < lengkyc; i++) {
                let count = datakyc[i].myCount;
                let id = datakyc[i]._id;
                persen = count * 100 / summkyc;

                let objbaru = {}
                if (id === "BARU") {
                    objbaru = {
                        "_id": "BARU",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "red"
                    };
                    arrkyc.push(objbaru);
                }
                let objkyc = {}
                if (id === "DITOLAK") {
                    objkyc = {
                        "_id": "DITOLAK",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#7C7C7C"
                    };
                    arrkyc.push(objkyc);
                }
                let objtidakditangguhkan = {}
                if (id === "DISETUJUI") {
                    objtidakditangguhkan = {
                        "_id": "DISETUJUI",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrkyc.push(objtidakditangguhkan);
                }
                let objbysystem = {}
                if (id === "BYSYSTEM") {
                    objbysystem = {
                        "_id": "BYSYSTEM",
                        "myCount": count,
                        "persen": persen.toFixed(2),
                        "warna": "#71A500D9"
                    };
                    arrkyc.push(objbysystem);
                }

            }
        } else {
            arrkyc = [];
        }
        var kyc = null;

        kyc = {
            kyc: [{
                totalReport: summkyc,
                data: arrkyc
            }
            ],
        };

        return { response_code: 202, content, ads, userticket, kyc, appealAkunBank, messages };



    }

    @UseGuards(JwtAuthGuard)
    @Post('landingpage')
    async finddetailtest(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var data = [];
        var query = null;
        var totalReport = null;


        try {
            query = await this.postsService.testLandingpage();

        } catch (e) {
            query = null;

        }

        return { response_code: 202, query, messages };

    }

    @UseGuards(JwtAuthGuard)
    @Post('detailreason')
    async finddetailreason(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));


        var postID = null;


        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var data = null;
        var peaks = null;

        try {
            peaks = await this.postsService.countReason(postID);
            var post = await this.postsService.findByPostId(postID);
            if (await this.utilsService.ceckData(post)) {
                var get_languages = await this.utilsService.getUserlanguages(post.email.toString());
                var messages_data = "Detects Moderation Content in a Hyppe" + post.postType.toString();
                if (get_languages == "id") {
                    messages_data = "Mendeteksi Konten Moderasi di Hyppe" + post.postType.toString();
                } else {
                    messages_data = "Detects Moderation Content in a Hyppe" + post.postType.toString();
                }
                if (post.contentModeration) {
                    if (post.moderationReason != undefined) {
                        data = {
                            "_id": messages_data,
                            "myCount": 1
                        }
                    } else {
                        data = {
                            "_id": messages_data,
                            "myCount": 1
                        }
                    }
                } else {
                    data = peaks.reduce((maxPeak, peak) => !maxPeak || maxPeak.myCount < peak.myCount ? peak : maxPeak, null);
                }
            } else {
                peaks = null;
                data = null;
            }

        } catch (e) {
            peaks = null;
            data = null;

        }

        return { response_code: 202, data, messages };


    }

    async sendReportAppealFCM(name: string, event: string, type: string, postID: string) {
        var Templates_ = new TemplatesRepo();
        Templates_ = await this.utilsService.getTemplateAppealReport(name, event, type, 'NOTIFICATION');

        var titlein = Templates_.subject_id.toString();
        var titleen = Templates_.subject.toString();
        var email_post = "";
        var posts = await this.postsService.findid(postID);
        var bodyin_get = Templates_.body_detail_id.toString();
        var bodyen_get = Templates_.body_detail.toString();
        var post_type = "";
        if (await this.utilsService.ceckData(posts)) {
            post_type = posts.postType.toString();
            email_post = posts.email.toString();
        }

        var eventType = type.toString();
        await this.utilsService.sendFcm(email_post, titlein, titleen, bodyin_get, bodyen_get, eventType, event, postID, post_type, undefined, "APPEAL");
    }

    async sendReportAppealFCMV2(name: string, event: string, type: string, postID: string) {
        var Templates_ = new TemplatesRepo();
        Templates_ = await this.utilsService.getTemplateAppealReport(name, event, type, 'NOTIFICATION');

        var titlein = Templates_.subject_id.toString();
        var titleen = Templates_.subject.toString();
        var email_post = "";
        var posts = await this.post2SS.findid(postID);
        var bodyin_get = Templates_.body_detail_id.toString();
        var bodyen_get = Templates_.body_detail.toString();
        var post_type = "";
        if (await this.utilsService.ceckData(posts)) {
            post_type = posts.postType.toString();
            email_post = posts.email.toString();
            var settype = null;
            switch (post_type) {
                case "pict":
                    settype = "HyppePict";
                    break;
                case "vid":
                    settype = "HyppeVid";
                    break;
                case "story":
                    settype = "HyppeStory";
                    break;
                default:
                    settype = "HyppePict";
                    break;
            }
            var tempbodyEN = bodyen_get.replace("${post_type}", settype);
            var tempbodyID = bodyin_get.replace("${post_type}", settype);
            bodyin_get = tempbodyID;
            bodyen_get = tempbodyEN;
        }

        var eventType = type.toString();
        await this.utilsService.sendFcm(email_post, titlein, titleen, bodyin_get, bodyen_get, eventType, event, postID, post_type, undefined, "APPEAL");
    }
}
