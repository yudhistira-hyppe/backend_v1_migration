import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Headers,
  Request, Logger,
  BadRequestException, HttpStatus, Put, Res, HttpCode, Query, UseInterceptors, UploadedFile, Header
} from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { PostsService } from './posts.service';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { CreatePostResponse, CreatePostsDto, PostLandingResponseApps, PostResponseApps, TagPeople } from './dto/create-posts.dto';
import { Posts } from './schemas/posts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostContentService } from './postcontent.service';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { InsightsService } from '../insights/insights.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import mongoose from 'mongoose';
import { PostCommentService } from './postcomment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DisqusService } from '../disqus/disqus.service';
import { ContentModService } from './contentmod.service';
import { OyPgService } from '../../paymentgateway/oypg/oypg.service';
import { MethodepaymentsService } from '../../trans/methodepayments/methodepayments.service';
import { PostBoostService } from './postboost.service';
import { TransactionsPostService } from '../../trans/transactionpost/transactionspost.service';
import { TagCountService } from '../tag_count/tag_count.service';
import { InterestCountService } from '../interest_count/interest_count.service';
import { InterestdayService } from '../interestday/interestday.service';
import { TagCountDto } from '../tag_count/dto/create-tag_count.dto';
import { InterestCountDto } from '../interest_count/dto/create-interest_count.dto';
import { InterestdayDto } from '../interestday/dto/create-interestday.dto';
import { OssContentPictService } from './osscontentpict.service';
import { Mediapicts } from '../mediapicts/schemas/mediapicts.schema';
import { UserchallengesService } from 'src/trans/userchallenges/userchallenges.service';
import { ChallengeService } from 'src/trans/challenge/challenge.service';
import { PostchallengeService } from 'src/trans/postchallenge/postchallenge.service';
import { Postchallenge } from 'src/trans/postchallenge/schemas/postchallenge.schema';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';

import { MediastikerService } from 'src/content/mediastiker/mediastiker.service';
import { NewpostService } from '../disqus/newpost/newpost.service';
import { mingrionRun } from 'src/trans/userbasics/dto/create-userbasic.dto';
import { LogMigrationsService } from 'src/trans/logmigrations/logmigrations.service';
import { LogMigrations } from 'src/trans/logmigrations/schema/logmigrations.schema';
@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly PostsService: PostsService,
    private readonly postContentService: PostContentService,
    private readonly userauthsService: UserauthsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly bootsService: PostBoostService,
    private readonly contenteventsService: ContenteventsService,
    private readonly insightsService: InsightsService,
    private readonly userbasicsService: UserbasicsService,
    private readonly postCommentService: PostCommentService,
    private readonly notifService: NotificationsService,
    private readonly cmodService: ContentModService,
    private readonly disqusService: DisqusService,
    private transactionsPostService: TransactionsPostService,
    private readonly tagCountService: TagCountService,
    private readonly interestCountService: InterestCountService,
    private readonly interestdayService: InterestdayService,
    private readonly mediamusicService: MediamusicService,
    private ossContentPictService: OssContentPictService,
    private readonly userchallengesService: UserchallengesService,
    private readonly challengeService: ChallengeService,
    private readonly postchallengeService: PostchallengeService,
    private readonly logapiSS: LogapisService,
    private readonly basic2SS: UserbasicnewService,
    private readonly MediastikerService: MediastikerService,
    private readonly methodepaymentsService: MethodepaymentsService,
    private readonly logMigrationsService: LogMigrationsService,
    private readonly NewPostService: NewpostService) { }

  @Post()
  async create(@Body() CreatePostsDto: CreatePostsDto) {
    await this.PostsService.create(CreatePostsDto);
  }

  @Get('api/posts')
  @UseGuards(JwtAuthGuard)
  async findAll(@Headers() headers): Promise<Posts[]> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = await this.PostsService.findAll();
    // return this.PostsService.findAll();

    var fullurl = headers.host + "/api/posts";
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/regcontens')
  async regContent(): Promise<Object> {
    return this.PostsService.regcontenMonetize();
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/newcontens')
  async newContent(): Promise<Object> {
    return this.PostsService.newcontenMonetize();
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getcontent/')
  async getContent(@Req() req): Promise<Object> {
    var email = req.body.email;
    var type = req.body.type;
    var type_ = "all";
    if (email == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    if (type != undefined) {
      type_ = type;
    }
    return this.PostsService.getContent(email, type_);
  }

  @Get('api/posts:email')
  async findOneId(@Param('email') email: string): Promise<Posts> {
    return this.PostsService.findOne(email);
  }

  @Get('api/posts/test')
  async test(): Promise<string> {
    console.log('sdfds');
    return this.postContentService.generateCertificate('da65f057-288f-49cf-9f43-f83251b2b098', 'id');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.PostsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/monetizebyyear')
  async countPost(@Body('year') year: number, @Headers() headers): Promise<Object> {
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email is required',
      );
    }

    var user_email_header = headers['x-auth-user'];

    await this.errorHandler.generateNotAcceptableException(
      'Unabled to proceed, user permission cannot acces module',
    );
    return this.PostsService.MonetizeByYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update:id')
  async update(@Res() res, @Param('id') id: string, @Req() request: Request) {
    var saleAmount = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["saleAmount"] !== undefined) {
      saleAmount = request_json["saleAmount"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    try {
      let data = await this.PostsService.updateprice(id, saleAmount);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/deletetag')
  async deleteTag(@Req() request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;

    var email = null;
    var postID = null;
    var data = null;
    var dataauth = null;
    var tagPeople = [];
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["postID"] !== undefined) {
      postID = request_json["postID"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      dataauth = await this.userauthsService.findOneByEmail(email);
      var ido = dataauth._id;
    } catch (e) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    //deletetagpeople
    try {

      this.PostsService.updateTags(postID, ido);

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request_json);

      return { response_code: 202, messages };
    } catch (e) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request_json);

      return { response_code: 500, messagesEror };
    }

  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('api/posts/getpost')
  async getposts(
    @Query() CreatePostsDto_: CreatePostsDto,
    @Headers() headers) {
    var dataquery = await this.PostsService.findOnepostID(CreatePostsDto_.postID.toString());
    var endpoind = '';
    var data_post = {};
    if (dataquery[0].postType == 'vid') {
      if (dataquery[0].metadata != undefined) {
        data_post['metadata'] = {
          "duration": (dataquery[0].metadata.duration != undefined) ? dataquery[0].metadata.duration : null,
          "postRoll": (dataquery[0].metadata.postRoll != undefined) ? dataquery[0].metadata.postRoll : null,
          "postType": (dataquery[0].metadata.postType != undefined) ? dataquery[0].metadata.postType : null,
          "preRoll": (dataquery[0].metadata.preRoll != undefined) ? dataquery[0].metadata.preRoll : null,
          "midRoll": (dataquery[0].metadata.midRoll != undefined) ? dataquery[0].metadata.midRoll : null,
          "postID": (dataquery[0].metadata.postID != undefined) ? dataquery[0].metadata.postID : null,
          "email": (dataquery[0].metadata.email != undefined) ? dataquery[0].metadata.email : null,
        };
      }
    }

    if (dataquery[0].datacontent != undefined) {
      if (dataquery[0].datacontent.leght > 0) {
        data_post['mediaBasePath'] = (dataquery[0].datacontent[0].mediaBasePath != undefined) ? dataquery[0].datacontent[0].mediaBasePath : null;
        data_post['mediaType'] = (dataquery[0].datacontent[0].mediaType != undefined) ? dataquery[0].datacontent[0].mediaType : null;
        data_post['mediaUri'] = (dataquery[0].datacontent[0].mediaUri != undefined) ? dataquery[0].datacontent[0].mediaUri : null;
      }
    }

    data_post['postType'] = (dataquery[0].postType != undefined) ? dataquery[0].postType : null;
    data_post['description'] = (dataquery[0].description != undefined) ? dataquery[0].description : null;
    data_post['active'] = (dataquery[0].active != undefined) ? dataquery[0].active : null;

    if (dataquery[0].datauser != undefined) {
      if (dataquery[0].datauser.leght > 0) {
        data_post['privacy'] = {
          "isPostPrivate": (dataquery[0].datauser.isPostPrivate != undefined) ? dataquery[0].datauser.isPostPrivate : null,
          "isCelebrity": (dataquery[0].datauser.isCelebrity != undefined) ? dataquery[0].datauser.isCelebrity : null,
          "isPrivate": (dataquery[0].datauser.isPrivate != undefined) ? dataquery[0].datauser.isPrivate : null,
        }
      }
    }
    if (dataquery[0].postType != undefined) {
      if (dataquery[0].postType == 'diary' || dataquery[0].postType == 'vid') {
        data_post['mediaThumbEndpoint'] = '/thumb/' + dataquery[0].postID;
      }
    }
    data_post['postID'] = (dataquery[0].postID != undefined) ? dataquery[0].postID : null;
    data_post['avatar'] = (dataquery[0].avatar != undefined) ? dataquery[0].avatar : null;
    if (dataquery[0].postType != undefined) {
      if (dataquery[0].postType == 'vid') {
        data_post['title'] = dataquery[0].description;
      }
    }
    data_post['tags'] = (dataquery[0].tags != undefined) ? dataquery[0].tags : null;
    data_post['allowComments'] = (dataquery[0].allowComments != undefined) ? dataquery[0].allowComments : null;
    data_post['createdAt'] = (dataquery[0].createdAt != undefined) ? dataquery[0].createdAt : null;

    if (dataquery[0].datauser != undefined) {
      if (dataquery[0].datauser.leght > 0) {
        if (dataquery[0].datauser.insight != undefined) {
          data_post['insight'] = {
            "shares": (dataquery[0].datauser.insight.shares != undefined) ? dataquery[0].datauser.insight.shares : null,
            "comments": (dataquery[0].datauser.insight.comments != undefined) ? dataquery[0].datauser.insight.comments : null,
            "reactions": (dataquery[0].datauser.insight.reactions != undefined) ? dataquery[0].datauser.insight.reactions : null,
            "views": (dataquery[0].datauser.insight.views != undefined) ? dataquery[0].datauser.insight.views : null,
            "likes": (dataquery[0].datauser.insight.likes != undefined) ? dataquery[0].datauser.insight.likes : null,
          };

          data_post['profileInsight'] = {
            "follower": (dataquery[0].datauser.insight.shares != undefined) ? dataquery[0].datauser.insight.followers : null,
            "following": (dataquery[0].datauser.insight.shares != undefined) ? dataquery[0].datauser.insight.followings : null,
          };
        }
      }
    }
    if (dataquery[0].postType != undefined) {
      if (dataquery[0].postType == 'pict') {
        endpoind = '/pict/';
      }
      if (dataquery[0].postType == 'vid') {
        endpoind = '/pict/';
      }
    }
    data_post['mediaEndpoint'] = endpoind + dataquery[0].datacontent[0].postID;
    data_post['email'] = dataquery[0].datauser.email;
    data_post['updatedAt'] = dataquery[0].updatedAt;
    data_post['username'] = dataquery[0].datauser.username;
    data_post['fullName'] = dataquery[0].datauser.fullName;

    var data = [data_post];
    var response = {
      "response_code": 202,
      "data": data,
      "messages": {
        info: ['Successful'],
      },
    }
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/v1/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPostV1(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("createPost >>> start");
    console.log('>>>>>>>>>> BODY <<<<<<<<<<', JSON.stringify(body))
    return this.postContentService.createNewPostV1(file, body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/v2/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPostV2(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("createPost >>> start");
    console.log('>>>>>>>>>> BODY <<<<<<<<<<', JSON.stringify(body))
    return this.postContentService.createNewPostV2(file, body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/v4/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPostv4(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    var fullurl = headers.host + "/api/posts/v4/createpost";

    this.logger.log("createPost >>> start");
    console.log('>>>>>>>>>> BODY <<<<<<<<<<', JSON.stringify(body))
    var arrtag = [];

    if (body.tags !== undefined && body.tags !== "") {
      var tag = body.tags;
      var splittag = tag.split(',');
      for (let x = 0; x < splittag.length; x++) {

        var tagreq = splittag[x].replace(/"/g, "");
        arrtag.push(tagreq)

      }
      body.tags = arrtag;
    }


    var data = await this.postContentService.createNewPostV4(file, body, headers, fullurl);
    var postID = data.data.postID;


    //Tags

    if (body.tags !== undefined && body.tags !== "") {
      var tag2 = body.tags;
      for (let i = 0; i < tag2.length; i++) {
        let id = tag2[i];

        var datatag2 = null;

        try {
          datatag2 = await this.tagCountService.findOneById(id);

        } catch (e) {
          datatag2 = null;

        }

        if (datatag2 === null) {

          let tagCountDto_ = new TagCountDto();
          tagCountDto_._id = id;
          tagCountDto_.total = 1;
          tagCountDto_.listdata = [{ "postID": postID }];
          await this.tagCountService.create(tagCountDto_);
        }
        else {

          var datatag3 = null;
          var lengdata3 = null;

          try {
            datatag3 = await this.tagCountService.finddatabypostid(id, postID);
            lengdata3 = datatag3.length;

          } catch (e) {
            datatag3 = null;
            lengdata3 = 0;
          }

          var tagslast = [];
          var datapostawal = null;

          try {
            datapostawal = await this.PostsService.findByPostId(postID);
            tagslast = datapostawal.tags;
          } catch (e) {
            datapostawal = null;
            tagslast = [];
          }

          if (tagslast.length > 0) {
            let idnew = tagslast[i];
            var total2 = 0;
            var postidlist2 = [];
            let obj = { "postID": datapostawal.postID };
            total2 = datatag2.total;
            postidlist2 = datatag2.listdata;
            if (id === idnew) {
              if (lengdata3 == 0) {
                postidlist2.push(obj);
              }
            } else {

            }

            let tagCountDto_ = new TagCountDto();
            tagCountDto_._id = id;
            if (id === idnew) {
              if (lengdata3 == 0) {
                tagCountDto_.total = total2 + 1;
              }

            }

            tagCountDto_.listdata = postidlist2;
            await this.tagCountService.update(id, tagCountDto_);
          }

        }

      }

    }

    //Interest
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;


    if (body.cats !== undefined && body.cats !== "") {
      var cats = body.cats;
      var splitcats = cats.split(',');
      for (let i = 0; i < splitcats.length; i++) {
        let id = splitcats[i];
        var datacats = null;
        var datacatsday = null;

        try {
          datacats = await this.interestCountService.findOneById(id);

        } catch (e) {
          datacats = null;

        }

        if (datacats === null) {

          let interestCountDto_ = new InterestCountDto();
          interestCountDto_._id = mongoose.Types.ObjectId(id);
          interestCountDto_.total = 1;
          interestCountDto_.listdata = [{ "postID": postID }];
          await this.interestCountService.create(interestCountDto_);


        }
        else {


          var catslast = [];
          var datapostawal = null;

          try {
            datapostawal = await this.PostsService.findByPostId(postID);
            catslast = datapostawal.category;
          } catch (e) {
            datapostawal = null;
            catslast = [];
          }
          let idnew = catslast[i].oid.toString();
          var totalcats = 0;
          var postidlistcats = [];
          let obj = { "postID": datapostawal.postID };
          totalcats = datacats.total;
          postidlistcats = datacats.listdata;
          if (id === idnew) {
            postidlistcats.push(obj);
          }

          let interestCountDto_ = new InterestCountDto();
          interestCountDto_._id = mongoose.Types.ObjectId(id);
          if (id === idnew) {
            interestCountDto_.total = totalcats + 1;
          }

          interestCountDto_.listdata = postidlistcats;
          await this.interestCountService.update(id, interestCountDto_);
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var stringdate = splitdate[0];
        var date = stringdate.substring(0, 10) + " " + "00:00:00";
        var cekdata = null;

        try {
          cekdata = await this.interestdayService.finddate(date);

        } catch (e) {
          cekdata = null;

        }

        try {
          datacatsday = await this.interestdayService.finddatabydate(date, id);

        } catch (e) {
          datacatsday = null;

        }

        if (cekdata.length == 0) {
          let interestdayDto_ = new InterestdayDto();
          interestdayDto_.date = date;
          interestdayDto_.listinterest = [{
            "_id": mongoose.Types.ObjectId(id),
            "total": 1,
            "createdAt": stringdate,
            "updatedAt": stringdate
          }];
          await this.interestdayService.create(interestdayDto_);
        } else {


          if (datacatsday.length > 0) {
            var idq = datacatsday[0]._id;
            var idint = datacatsday[0].listinterest._id;
            var totalint = datacatsday[0].listinterest.total;
            await this.interestdayService.updatefilter(idq.toString(), idint.toString(), totalint + 1, stringdate);
          }
        }

      }
    }
    return data;
  }

  @Post('api/posts/apsaraId')
  async getPlayInfo(@Body() body) {
    return this.postContentService.getVideoApsaraSingleV4(body.apsaraId, body.definition);
  }

  @Post('api/posts/testUpload')
  @UseInterceptors(FileInterceptor('postContent'))
  async testPost(@UploadedFile() file: Express.Multer.File, @Body() body) {
    return this.postContentService.uploadVideo(file, body.postID.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/removecomment')
  @UseInterceptors(FileInterceptor('postContent'))
  async removeComment(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("removeComment >>> start");
    return this.postCommentService.removeComment2(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/postviewer')
  @UseInterceptors(FileInterceptor('postContent'))
  async postViewer(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("postViewer >>> start");
    return this.postCommentService.postViewer(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/updatepost')
  @UseInterceptors(FileInterceptor('postContent'))
  async updatePostnew(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/updatepost";
    var reqbody = body;

    this.logger.log("updatePost >>> start");
    var email = headers['x-auth-user'];
    var saleAmount = body.saleAmount;
    var data = null;
    var datapostchallenge = null;
    var active = null;
    var lang = await this.utilsService.getUserlanguages(email);
    var posts = null;
    var startDatetime = null;
    var endDatetime = null;

    try {
      posts = await this.PostsService.findid(body.postID.toString());
    } catch (e) {
      posts = null;
    }
    var dataTransaction = await this.transactionsPostService.findpostid(body.postID.toString());
    if (await this.utilsService.ceckData(dataTransaction)) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

      if (lang == "id") {
        await this.errorHandler.generateNotAcceptableException(
          "Tidak bisa mengedit postingan karena sedang dalam proses pembayaran",
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          " Unable to edit the post because it is in the process of payment.",
        );
      }
    }
    try {
      datapostchallenge = await this.postchallengeService.findBypostID2(body.postID.toString());
    } catch (e) {
      datapostchallenge = null;
    }

    if (body.active == 'false') {


      let datapostawal = null;
      let tags = [];
      let cats = [];
      //tags
      try {
        datapostawal = await this.PostsService.findByPostId(body.postID);
        tags = datapostawal.tags;
        cats = datapostawal.category;

      } catch (e) {
        datapostawal = null;
        tags = [];
        cats = [];

      }




      if (datapostchallenge == null) {
        if (tags.length > 0) {
          const stringSet = new Set(tags);
          const uniqstring = [...stringSet];

          console.log(uniqstring)

          for (let i = 0; i < uniqstring.length; i++) {
            let id = uniqstring[i];

            let datatag2 = null;
            try {
              datatag2 = await this.tagCountService.findOneById(id);
            } catch (e) {
              datatag2 = null;
            }

            let total = 0;
            if (datatag2 !== null) {
              let postidlist = datatag2.listdata;
              total = datatag2.total;

              for (let i = 0; i < postidlist.length; i++) {
                if (postidlist[i].postID === body.postID) {
                  postidlist.splice(i, 1);
                }
              }
              let tagCountDto_ = new TagCountDto();
              tagCountDto_.total = total - 1;
              tagCountDto_.listdata = postidlist;
              await this.tagCountService.update(id, tagCountDto_);
            }


          }

        }

        //interest

        if (cats.length > 0) {
          const stringSetin = new Set(cats);
          const uniqstringin = [...stringSetin];

          console.log(uniqstringin)

          for (let i = 0; i < uniqstringin.length; i++) {
            let idin = uniqstringin[i];

            let datain = null;
            try {
              datain = await this.interestCountService.findOneById(idin);
            } catch (e) {
              datain = null;
            }

            let totalin = 0;
            if (datain !== null) {
              let postidlistin = datain.listdata;
              totalin = datain.total;

              for (let i = 0; i < postidlistin.length; i++) {
                if (postidlistin[i].postID === body.postID) {
                  postidlistin.splice(i, 1);
                }
              }
              let tagCountDto_ = new TagCountDto();
              tagCountDto_.total = totalin - 1;
              tagCountDto_.listdata = postidlistin;
              await this.tagCountService.update(idin, tagCountDto_);
            }


          }
        }
        data = await this.postContentService.updatePost(body, headers);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
        if (saleAmount > 0) {
          await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
          //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
        }
        return data;
      } else {
        var datenow = new Date(Date.now());
        startDatetime = datapostchallenge.startDatetime;
        endDatetime = datapostchallenge.endDatetime;

        // if (datenow >= new Date(startDatetime) && datenow <= new Date(endDatetime)) {
        //   // var timestamps_end = await this.utilsService.getDateTimeString();
        //   // this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

        //   // await this.errorHandler.generateNotAcceptableException(
        //   //   'Unabled to proceed, content is participating in the challenge',
        //   // );


        // } else {
        if (tags.length > 0) {
          const stringSet = new Set(tags);
          const uniqstring = [...stringSet];

          console.log(uniqstring)

          for (let i = 0; i < uniqstring.length; i++) {
            let id = uniqstring[i];

            let datatag2 = null;
            try {
              datatag2 = await this.tagCountService.findOneById(id);
            } catch (e) {
              datatag2 = null;
            }

            let total = 0;
            if (datatag2 !== null) {
              let postidlist = datatag2.listdata;
              total = datatag2.total;

              for (let i = 0; i < postidlist.length; i++) {
                if (postidlist[i].postID === body.postID) {
                  postidlist.splice(i, 1);
                }
              }
              let tagCountDto_ = new TagCountDto();
              tagCountDto_.total = total - 1;
              tagCountDto_.listdata = postidlist;
              await this.tagCountService.update(id, tagCountDto_);
            }


          }

        }

        //interest

        if (cats.length > 0) {
          const stringSetin = new Set(cats);
          const uniqstringin = [...stringSetin];

          console.log(uniqstringin)

          for (let i = 0; i < uniqstringin.length; i++) {
            let idin = uniqstringin[i];

            let datain = null;
            try {
              datain = await this.interestCountService.findOneById(idin);
            } catch (e) {
              datain = null;
            }

            let totalin = 0;
            if (datain !== null) {
              let postidlistin = datain.listdata;
              totalin = datain.total;

              for (let i = 0; i < postidlistin.length; i++) {
                if (postidlistin[i].postID === body.postID) {
                  postidlistin.splice(i, 1);
                }
              }
              let tagCountDto_ = new TagCountDto();
              tagCountDto_.total = totalin - 1;
              tagCountDto_.listdata = postidlistin;
              await this.tagCountService.update(idin, tagCountDto_);
            }


          }
        }
        data = await this.postContentService.updatePost(body, headers);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
        // if (saleAmount > 0) {
        //   await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
        //   //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
        // }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

        let datapostchallenge2 = null;
        try {
          datapostchallenge2 = await this.postchallengeService.findOneBypostid(body.postID.toString());
        } catch (e) {
          datapostchallenge2 = null;
        }

        if (datapostchallenge2.length > 0) {

          for (let y = 0; y < datapostchallenge2.length; y++) {
            let postid = null;
            let idChallenge = null;
            let idSubChallenge = null;
            postid = datapostchallenge2[y].postID;
            idSubChallenge = datapostchallenge2[y].idSubChallenge;
            idChallenge = datapostchallenge2[y].idChallenge;
            await this.PostsService.deletePostChalenge(postid, idChallenge, idSubChallenge);
          }

        }





        return data;

        //}
      }

    }
    else {

      var datapostawal = null;
      var tags = [];
      var arrtag = [];
      var datacats = null;
      var arrcat = [];
      var cats = [];
      try {
        datapostawal = await this.PostsService.findByPostId(body.postID);
        tags = datapostawal.tags;
        cats = datapostawal.category;
      } catch (e) {
        datapostawal = null;
        tags = [];
        cats = [];
      }
      var datatag = null;


      if (datapostchallenge == null) {
        if (tags.length > 0) {
          if (body.tags !== undefined && body.tags !== "") {
            var tag = body.tags;

            var splittag = tag.split(',');
            for (let x = 0; x < splittag.length; x++) {
              var tagkata = tags[x];
              var tagreq = splittag[x].replace(/"/g, "");
              arrtag.push(tagreq)

              if (tagreq !== undefined && tagreq !== tagkata) {

                try {
                  datatag = await this.tagCountService.findOneById(tagkata);
                } catch (e) {
                  datatag = null;
                }

                var total = 0;
                if (datatag !== null) {
                  var postidlist = datatag.listdata;
                  total = datatag.total;

                  for (var i = 0; i < postidlist.length; i++) {
                    if (postidlist[i].postID === body.postID) {
                      postidlist.splice(i, 1);
                    }
                  }
                  let tagCountDto_ = new TagCountDto();
                  tagCountDto_.total = total - 1;
                  tagCountDto_.listdata = postidlist;
                  await this.tagCountService.update(tagkata, tagCountDto_);
                }
              }
            }
            body.tags = arrtag;
          } else {
            body.tags = [];

          }

        } else {
          body.tags = [];

        }

        //interest

        if (cats.length > 0) {
          if (body.cats !== undefined && body.cats !== "") {
            var cat = body.cats;
            var splittcat = null;
            if (cat !== undefined && cat !== "") {
              splittcat = cat.split(',');
              for (let x = 0; x < splittcat.length; x++) {

                var tagcat = null;
                try {
                  tagcat = cats[x].oid.toString();
                } catch (e) {
                  tagcat = "";
                }
                var catreq = splittcat[x];

                if (catreq !== undefined && catreq !== tagcat) {

                  try {
                    datacats = await this.interestCountService.findOneById(tagcat);
                  } catch (e) {
                    datacats = null;
                  }
                  var total = 0;
                  if (datacats !== null) {
                    let postidlist = datacats.listdata;
                    total = datacats.total;

                    for (var i = 0; i < postidlist.length; i++) {
                      if (postidlist[i].postID === body.postID) {
                        postidlist.splice(i, 1);
                      }
                    }
                    let catCountDto_ = new InterestCountDto();
                    catCountDto_.total = total - 1;
                    catCountDto_.listdata = postidlist;
                    await this.interestCountService.update(tagcat, catCountDto_);
                  }
                }
              }
            }

          } else {
            body.cats = [];
          }

        }
        data = await this.postContentService.updatePost(body, headers);
        //tags
        if (body.tags !== undefined && body.tags.length > 0) {
          var tag2 = body.tags;
          for (let i = 0; i < tag2.length; i++) {
            let id = tag2[i];
            var datatag2 = null;

            try {
              datatag2 = await this.tagCountService.findOneById(id);

            } catch (e) {
              datatag2 = null;

            }

            if (datatag2 === null) {

              let tagCountDto_ = new TagCountDto();
              tagCountDto_._id = id;
              tagCountDto_.total = 1;
              tagCountDto_.listdata = [{ "postID": body.postID }];
              await this.tagCountService.create(tagCountDto_);
            } else {

              var datatag3 = null;
              var lengdata3 = null;

              try {
                datatag3 = await this.tagCountService.finddatabypostid(id, body.postID);
                lengdata3 = datatag3.length;

              } catch (e) {
                datatag3 = null;
                lengdata3 = 0;
              }
              var datapost = null;
              var tagslast = [];
              try {
                datapost = await this.PostsService.findByPostId(body.postID);
                tagslast = datapost.tags;
              } catch (e) {
                datapost = null;
                tagslast = [];
              }
              let idnew = tagslast[i];
              var total2 = 0;
              var postidlist2 = [];
              let obj = { "postID": body.postID };
              total2 = datatag2.total;
              postidlist2 = datatag2.listdata;
              if (id === idnew) {
                if (lengdata3 == 0) {
                  postidlist2.push(obj);
                }
              }

              let tagCountDto_ = new TagCountDto();
              tagCountDto_._id = id;
              if (id === idnew) {

                if (lengdata3 == 0) {
                  tagCountDto_.total = total2 + 1;
                }
              }

              tagCountDto_.listdata = postidlist2;
              await this.tagCountService.update(id, tagCountDto_);
            }

          }
        } else {

        }

        //Interest
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (body.cats !== undefined) {
          let cats = body.cats;
          var splitcats = cats.split(',');
          for (let i = 0; i < splitcats.length; i++) {
            let id = splitcats[i];
            var datacats = null;
            var datacatsday = null;

            try {
              datacats = await this.interestCountService.findOneById(id);

            } catch (e) {
              datacats = null;

            }

            if (datacats === null) {


              let interestCountDto_ = new InterestCountDto();
              interestCountDto_._id = mongoose.Types.ObjectId(id);
              interestCountDto_.total = 1;
              interestCountDto_.listdata = [{ "postID": body.postID }];
              await this.interestCountService.create(interestCountDto_);


            }
            else {


              var catslast = [];
              var datapostawal = null;

              try {
                datapostawal = await this.PostsService.findByPostId(body.postID);
                catslast = datapostawal.category;
              } catch (e) {
                datapostawal = null;
                catslast = [];
              }
              let idnew = catslast[i].oid.toString();
              var totalcats = 0;
              var postidlistcats = [];
              let obj = { "postID": datapostawal.postID };
              totalcats = datacats.total;
              postidlistcats = datacats.listdata;
              if (id !== idnew) {
                postidlistcats.push(obj);
              }

              let interestCountDto_ = new InterestCountDto();
              interestCountDto_._id = mongoose.Types.ObjectId(id);
              if (id !== idnew) {
                interestCountDto_.total = totalcats + 1;
              }
              interestCountDto_.listdata = postidlistcats;
              await this.interestCountService.update(id, interestCountDto_);
            }

            var dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);
            var strdate = dt.toISOString();
            var repdate = strdate.replace('T', ' ');
            var splitdate = repdate.split('.');
            var stringdate = splitdate[0];
            var date = stringdate.substring(0, 10) + " " + "00:00:00";
            var cekdata = null;

            try {
              cekdata = await this.interestdayService.finddate(date);

            } catch (e) {
              cekdata = null;

            }

            try {
              datacatsday = await this.interestdayService.finddatabydate(date, id);

            } catch (e) {
              datacatsday = null;

            }

            if (cekdata.length == 0) {
              let interestdayDto_ = new InterestdayDto();
              interestdayDto_.date = date;
              interestdayDto_.listinterest = [{
                "_id": mongoose.Types.ObjectId(id),
                "total": 1,
                "createdAt": stringdate,
                "updatedAt": stringdate
              }];
              await this.interestdayService.create(interestdayDto_);
            } else {
              if (datacatsday.length > 0) {
                var idq = datacatsday[0]._id;
                var idint = datacatsday[0].listinterest._id;
                var totalint = datacatsday[0].listinterest.total;
                await this.interestdayService.updatefilter(idq.toString(), idint.toString(), totalint + 1, stringdate);
              } else {
                var idInt = cekdata[0]._id.toString();
                var list = cekdata[0].listinterest;
                var objin = {
                  "_id": mongoose.Types.ObjectId(id),
                  "total": 1,
                  "createdAt": stringdate,
                  "updatedAt": stringdate
                };
                list.push(objin);
                await this.interestdayService.updateInterestday(idInt, list);
              }
            }

          }
        }

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
        if (saleAmount > 0) {
          await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
          //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

        return data;
      }
      else {
        var datenow = new Date(Date.now());
        startDatetime = datapostchallenge.startDatetime;
        endDatetime = datapostchallenge.endDatetime;

        if (datenow >= new Date(startDatetime) && datenow <= new Date(endDatetime) && saleAmount > 0) {
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, content is participating in the challenge',
          );
        } else {


          if (tags.length > 0) {
            if (body.tags !== undefined && body.tags !== "") {
              var tag = body.tags;

              var splittag = tag.split(',');
              for (let x = 0; x < splittag.length; x++) {
                var tagkata = tags[x];
                var tagreq = splittag[x].replace(/"/g, "");
                arrtag.push(tagreq)

                if (tagreq !== undefined && tagreq !== tagkata) {

                  try {
                    datatag = await this.tagCountService.findOneById(tagkata);
                  } catch (e) {
                    datatag = null;
                  }

                  var total = 0;
                  if (datatag !== null) {
                    var postidlist = datatag.listdata;
                    total = datatag.total;

                    for (var i = 0; i < postidlist.length; i++) {
                      if (postidlist[i].postID === body.postID) {
                        postidlist.splice(i, 1);
                      }
                    }
                    let tagCountDto_ = new TagCountDto();
                    tagCountDto_.total = total - 1;
                    tagCountDto_.listdata = postidlist;
                    await this.tagCountService.update(tagkata, tagCountDto_);
                  }
                }
              }
              body.tags = arrtag;
            } else {
              body.tags = [];

            }

          } else {
            body.tags = [];

          }

          //interest

          if (cats.length > 0) {
            if (body.cats !== undefined && body.cats !== "") {
              var cat = body.cats;
              var splittcat = null;
              if (cat !== undefined && cat !== "") {
                splittcat = cat.split(',');
                for (let x = 0; x < splittcat.length; x++) {

                  var tagcat = null;
                  try {
                    tagcat = cats[x].oid.toString();
                  } catch (e) {
                    tagcat = "";
                  }
                  var catreq = splittcat[x];

                  if (catreq !== undefined && catreq !== tagcat) {

                    try {
                      datacats = await this.interestCountService.findOneById(tagcat);
                    } catch (e) {
                      datacats = null;
                    }
                    var total = 0;
                    if (datacats !== null) {
                      let postidlist = datacats.listdata;
                      total = datacats.total;

                      for (var i = 0; i < postidlist.length; i++) {
                        if (postidlist[i].postID === body.postID) {
                          postidlist.splice(i, 1);
                        }
                      }
                      let catCountDto_ = new InterestCountDto();
                      catCountDto_.total = total - 1;
                      catCountDto_.listdata = postidlist;
                      await this.interestCountService.update(tagcat, catCountDto_);
                    }
                  }
                }
              }

            } else {
              body.cats = [];
            }

          }
          data = await this.postContentService.updatePost(body, headers);
          //tags
          if (body.tags !== undefined && body.tags.length > 0) {
            var tag2 = body.tags;
            for (let i = 0; i < tag2.length; i++) {
              let id = tag2[i];
              var datatag2 = null;

              try {
                datatag2 = await this.tagCountService.findOneById(id);

              } catch (e) {
                datatag2 = null;

              }

              if (datatag2 === null) {

                let tagCountDto_ = new TagCountDto();
                tagCountDto_._id = id;
                tagCountDto_.total = 1;
                tagCountDto_.listdata = [{ "postID": body.postID }];
                await this.tagCountService.create(tagCountDto_);
              } else {

                var datatag3 = null;
                var lengdata3 = null;

                try {
                  datatag3 = await this.tagCountService.finddatabypostid(id, body.postID);
                  lengdata3 = datatag3.length;

                } catch (e) {
                  datatag3 = null;
                  lengdata3 = 0;
                }
                var datapost = null;
                var tagslast = [];
                try {
                  datapost = await this.PostsService.findByPostId(body.postID);
                  tagslast = datapost.tags;
                } catch (e) {
                  datapost = null;
                  tagslast = [];
                }
                let idnew = tagslast[i];
                var total2 = 0;
                var postidlist2 = [];
                let obj = { "postID": body.postID };
                total2 = datatag2.total;
                postidlist2 = datatag2.listdata;
                if (id === idnew) {
                  if (lengdata3 == 0) {
                    postidlist2.push(obj);
                  }
                }

                let tagCountDto_ = new TagCountDto();
                tagCountDto_._id = id;
                if (id === idnew) {

                  if (lengdata3 == 0) {
                    tagCountDto_.total = total2 + 1;
                  }
                }

                tagCountDto_.listdata = postidlist2;
                await this.tagCountService.update(id, tagCountDto_);
              }

            }
          } else {

          }

          //Interest
          const mongoose = require('mongoose');
          var ObjectId = require('mongodb').ObjectId;

          if (body.cats !== undefined) {
            let cats = body.cats;
            var splitcats = cats.split(',');
            for (let i = 0; i < splitcats.length; i++) {
              let id = splitcats[i];
              var datacats = null;
              var datacatsday = null;

              try {
                datacats = await this.interestCountService.findOneById(id);

              } catch (e) {
                datacats = null;

              }

              if (datacats === null) {


                let interestCountDto_ = new InterestCountDto();
                interestCountDto_._id = mongoose.Types.ObjectId(id);
                interestCountDto_.total = 1;
                interestCountDto_.listdata = [{ "postID": body.postID }];
                await this.interestCountService.create(interestCountDto_);


              }
              else {


                var catslast = [];
                var datapostawal = null;

                try {
                  datapostawal = await this.PostsService.findByPostId(body.postID);
                  catslast = datapostawal.category;
                } catch (e) {
                  datapostawal = null;
                  catslast = [];
                }
                let idnew = catslast[i].oid.toString();
                var totalcats = 0;
                var postidlistcats = [];
                let obj = { "postID": datapostawal.postID };
                totalcats = datacats.total;
                postidlistcats = datacats.listdata;
                if (id !== idnew) {
                  postidlistcats.push(obj);
                }

                let interestCountDto_ = new InterestCountDto();
                interestCountDto_._id = mongoose.Types.ObjectId(id);
                if (id !== idnew) {
                  interestCountDto_.total = totalcats + 1;
                }
                interestCountDto_.listdata = postidlistcats;
                await this.interestCountService.update(id, interestCountDto_);
              }

              var dt = new Date(Date.now());
              dt.setHours(dt.getHours() + 7); // timestamp
              dt = new Date(dt);
              var strdate = dt.toISOString();
              var repdate = strdate.replace('T', ' ');
              var splitdate = repdate.split('.');
              var stringdate = splitdate[0];
              var date = stringdate.substring(0, 10) + " " + "00:00:00";
              var cekdata = null;

              try {
                cekdata = await this.interestdayService.finddate(date);

              } catch (e) {
                cekdata = null;

              }

              try {
                datacatsday = await this.interestdayService.finddatabydate(date, id);

              } catch (e) {
                datacatsday = null;

              }

              if (cekdata.length == 0) {
                let interestdayDto_ = new InterestdayDto();
                interestdayDto_.date = date;
                interestdayDto_.listinterest = [{
                  "_id": mongoose.Types.ObjectId(id),
                  "total": 1,
                  "createdAt": stringdate,
                  "updatedAt": stringdate
                }];
                await this.interestdayService.create(interestdayDto_);
              } else {
                if (datacatsday.length > 0) {
                  var idq = datacatsday[0]._id;
                  var idint = datacatsday[0].listinterest._id;
                  var totalint = datacatsday[0].listinterest.total;
                  await this.interestdayService.updatefilter(idq.toString(), idint.toString(), totalint + 1, stringdate);
                } else {
                  var idInt = cekdata[0]._id.toString();
                  var list = cekdata[0].listinterest;
                  var objin = {
                    "_id": mongoose.Types.ObjectId(id),
                    "total": 1,
                    "createdAt": stringdate,
                    "updatedAt": stringdate
                  };
                  list.push(objin);
                  await this.interestdayService.updateInterestday(idInt, list);
                }
              }

            }
          }

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
          if (saleAmount > 0) {
            await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
            //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
          }

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

          return data;
        }
      }



    }
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());

    if (saleAmount > 0) {
      if (posts.saleAmount != saleAmount) {
        await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
      }
      //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

    return data;

  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/createpost/backup')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPostV3new(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/createpost";
    var reqbody = body;
    // reqbody['postContent'] = file;

    this.logger.log("createPost >>> start");
    console.log('>>>>>>>>>> BODY <<<<<<<<<<', JSON.stringify(body))
    var arrtag = [];

    var cekarray = Array.isArray(body.tags);
    console.log(cekarray)

    if (cekarray == false) {
      if (body.tags !== undefined && body.tags !== "") {
        var tag = body.tags;
        var splittag = tag.split(',');
        for (let x = 0; x < splittag.length; x++) {

          var tagreq = splittag[x].replace(/"/g, "");
          arrtag.push(tagreq)

        }
        body.tags = arrtag;
      }
    }

    var data = await this.postContentService.createNewPostV4(file, body, headers, fullurl);
    var postID = data.data.postID;

    var email = data.data.email;

    const databasic = await this.userbasicsService.findOne(
      email
    );
    // var iduser = null;
    // if (databasic !== null) {
    //   iduser = databasic._id;
    //   this.userChallengePost(iduser.toString(), postID.toString(), "posts", "POST", postID);
    // }

    //Tags

    if (body.tags !== undefined && body.tags !== "") {
      var tag2 = body.tags;
      for (let i = 0; i < tag2.length; i++) {
        let id = tag2[i];

        var datatag2 = null;

        try {
          datatag2 = await this.tagCountService.findOneById(id);

        } catch (e) {
          datatag2 = null;

        }

        if (datatag2 === null) {

          let tagCountDto_ = new TagCountDto();
          tagCountDto_._id = id;
          tagCountDto_.total = 1;
          tagCountDto_.listdata = [{ "postID": postID }];
          await this.tagCountService.create(tagCountDto_);
        }
        else {

          var datatag3 = null;
          var lengdata3 = null;

          try {
            datatag3 = await this.tagCountService.finddatabypostid(id, postID);
            lengdata3 = datatag3.length;

          } catch (e) {
            datatag3 = null;
            lengdata3 = 0;
          }

          var tagslast = [];
          var datapostawal = null;

          try {
            datapostawal = await this.PostsService.findByPostId(postID);
            tagslast = datapostawal.tags;
          } catch (e) {
            datapostawal = null;
            tagslast = [];
          }

          if (tagslast.length > 0) {
            let idnew = tagslast[i];
            var total2 = 0;
            var postidlist2 = [];
            let obj = { "postID": datapostawal.postID };
            total2 = datatag2.total;
            postidlist2 = datatag2.listdata;
            if (id === idnew) {
              if (lengdata3 == 0) {
                postidlist2.push(obj);
              }
            } else {

            }

            let tagCountDto_ = new TagCountDto();
            tagCountDto_._id = id;
            if (id === idnew) {
              if (lengdata3 == 0) {
                tagCountDto_.total = total2 + 1;
              }

            }

            tagCountDto_.listdata = postidlist2;
            await this.tagCountService.update(id, tagCountDto_);
          }

        }

      }

    }

    //Interest
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;


    if (body.cats !== undefined && body.cats !== "") {
      var cats = body.cats;
      var splitcats = cats.split(',');
      for (let i = 0; i < splitcats.length; i++) {
        let id = splitcats[i];
        var datacats = null;
        var datacatsday = null;

        try {
          datacats = await this.interestCountService.findOneById(id);

        } catch (e) {
          datacats = null;

        }

        if (datacats === null) {

          let interestCountDto_ = new InterestCountDto();
          interestCountDto_._id = mongoose.Types.ObjectId(id);
          interestCountDto_.total = 1;
          interestCountDto_.listdata = [{ "postID": postID }];
          await this.interestCountService.create(interestCountDto_);


        }
        else {


          var catslast = [];
          var datapostawal = null;

          try {
            datapostawal = await this.PostsService.findByPostId(postID);
            catslast = datapostawal.category;
          } catch (e) {
            datapostawal = null;
            catslast = [];
          }
          let idnew = catslast[i].oid.toString();
          var totalcats = 0;
          var postidlistcats = [];
          let obj = { "postID": datapostawal.postID };
          totalcats = datacats.total;
          postidlistcats = datacats.listdata;
          if (id === idnew) {
            postidlistcats.push(obj);
          }

          let interestCountDto_ = new InterestCountDto();
          interestCountDto_._id = mongoose.Types.ObjectId(id);
          if (id === idnew) {
            interestCountDto_.total = totalcats + 1;
          }

          interestCountDto_.listdata = postidlistcats;
          await this.interestCountService.update(id, interestCountDto_);
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var stringdate = splitdate[0];
        var date = stringdate.substring(0, 10) + " " + "00:00:00";
        var cekdata = null;

        try {
          cekdata = await this.interestdayService.finddate(date);

        } catch (e) {
          cekdata = null;

        }

        try {
          datacatsday = await this.interestdayService.finddatabydate(date, id);

        } catch (e) {
          datacatsday = null;

        }

        if (cekdata.length == 0) {
          let interestdayDto_ = new InterestdayDto();
          interestdayDto_.date = date;
          interestdayDto_.listinterest = [{
            "_id": mongoose.Types.ObjectId(id),
            "total": 1,
            "createdAt": stringdate,
            "updatedAt": stringdate
          }];
          await this.interestdayService.create(interestdayDto_);
        } else {


          if (datacatsday.length > 0) {
            var idq = datacatsday[0]._id;
            var idint = datacatsday[0].listinterest._id;
            var totalint = datacatsday[0].listinterest.total;
            await this.interestdayService.updatefilter(idq.toString(), idint.toString(), totalint + 1, stringdate);
          }
        }

      }
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPostV4new(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    console.log('============================================== CREATE POST HEADERS ==============================================', JSON.stringify(headers));
    console.log('============================================== CREATE POST BODY ==============================================', JSON.stringify(body));
    if (body.stiker !== undefined && body.image !== undefined && body.type !== undefined && body.position !== undefined) {

      var arrayStiker = [];
      var stiker = body.stiker;

      var splitstiker = stiker.toString();
      var splitreq2stiker = splitstiker.split(',');


      var image = body.image;
      var splitimage = image.toString();
      var splitreq2image = splitimage.split(',');

      var type = body.type;
      var splittype = type.toString();
      var splitreq2type = splittype.split(',');

      var position = body.position;
      var splitposition = position.toString();
      var splitreq2position = splitposition.split('#');

      if (splitreq2stiker.length !== splitreq2image.length && splitreq2stiker.length !== splitreq2type.length && splitreq2stiker.length !== splitreq2position.length) {
        throw new BadRequestException("Unabled to proceed,the length of data must be the same");
      } else {
        for (var i = 0; i < splitreq2stiker.length; i++) {
          let id = splitreq2stiker[i];
          let image = splitreq2image[i];
          let type = splitreq2type[i];
          let position = splitreq2position[i];
          var ids = new mongoose.Types.ObjectId(id);
          let arrayPosition = [];
          let splitpos = position.split(',');
          for (let x = 0; x < splitpos.length; x++) {
            var num = parseFloat(splitpos[x]);
            arrayPosition.push(num);
          }

          var obj = {
            "_id": ids,
            "image": image,
            "position": arrayPosition,
            "type": type
          };
          arrayStiker.push(obj);
        }
        body.stiker = arrayStiker;


      }
    }

    if (body.text !== undefined) {

      var arraytext = [];
      var text = body.text;

      var splitreqtext = text.toString();
      var splitreq2text = splitreqtext.split(',');

      for (var i = 0; i < splitreq2text.length; i++) {
        let idtext = splitreq2text[i];
        arraytext.push(idtext);
      }
      body.text = arraytext;
    }
    var data = await this.postContentService.createNewPostV5(file, body, headers);

    if (data !== undefined && data !== null) {
      console.log(arrayStiker)

      if (arrayStiker !== undefined && arrayStiker.length > 0) {
        this.updateused(arrayStiker);
      }

      var postID = data.data.postID;

      var email = data.data.email;

      const databasic = await this.userbasicsService.findOne(
        email
      );
      // var iduser = null;
      // if (databasic !== null) {
      //   iduser = databasic._id;
      //   // this.userChallengePost(iduser.toString(), postID.toString(), "posts", "POST", postID);
      //   this.scorepostrequest(iduser.toString(), postID.toString(), "posts", "POST", postID);
      // }
    }

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPost(@Body() body, @Headers() headers): Promise<PostResponseApps> {
    this.logger.log("getUserPost >>> start: " + JSON.stringify(body));
    return this.postContentService.getUserPost(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts/landing-page')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPostLandingPage(@Body() body, @Headers() headers): Promise<PostLandingResponseApps> {
    console.log(body);
    this.logger.log("getUserPostLandingPage >>> start: " + JSON.stringify(body));
    //if (body.visibility == 'PUBLIC') {

    return this.bootsService.getBoostV2_(body, headers);
    //} else {
    //  return this.postContentService.getUserPostLandingPage(body, headers);
    //}


  }

  // @UseGuards(JwtAuthGuard)
  // @Post('api/posts/getuserposts/my')
  // @UseInterceptors(FileInterceptor('postContent'))
  // async getUserPostMy(@Body() body, @Headers() headers): Promise<PostResponseApps> {
  //   this.logger.log("getUserPostMy >>> start: " + JSON.stringify(body));
  //   return this.postContentService.getUserPostMy(body, headers);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/getboost/backup')
  async getPostBoost(
    @Query('pageNumber') pageNumber: number,
    @Query('pageRow') pageRow: number,
    @Headers() headers) {
    const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
    const pageRow_ = (pageRow != undefined) ? (pageRow != 0) ? pageRow : 10 : 10;
    return this.postContentService.getUserPostBoost(pageNumber_, pageRow_, headers);
  }

  @Post('api/posts/getnotification')
  @UseInterceptors(FileInterceptor('postContent'))
  async getNotification(@Body() body, @Headers() headers) {
    this.logger.log("getNotification >>> start: " + JSON.stringify(body));
    let y = await this.postContentService.getNotification(body, headers);
    this.logger.log("getNotification >>> res: " + JSON.stringify(y));
    return y;
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('api/posts/getnotification2')
  // @UseInterceptors(FileInterceptor('postContent'))
  // async getNotification2(@Body() body, @Headers('x-auth-user') email: string, @Headers() headers) {
  //   var timestamps_start = await this.utilsService.getDateTimeString();
  //   this.logger.log("getNotification >>> start: " + JSON.stringify(body));
  //   var eventType = null;
  //   var pageRow = null;
  //   var pageNumber = null;
  //   var data = null;
  //   var lengpict = null;
  //   if (body.eventType !== undefined) {
  //     eventType = body.eventType;
  //   }
  //   if (body.pageNumber !== undefined) {
  //     pageNumber = body.pageNumber;
  //   }

  //   if (body.pageRow !== undefined) {
  //     pageRow = body.pageRow;
  //   }
  //   const messages = {
  //     "info": ["The process successful"],
  //   };
  //   try {

  //     data = await this.notifService.getNotification2(email, eventType, parseInt(pageNumber), parseInt(pageRow));
  //     lengpict = data.length;

  //   } catch (e) {
  //     data = null;
  //     lengpict = 0;

  //   }

  //   var datatemp = [];
  //   var tempdatapict = [];
  //   var apsaraId = null;
  //   var isApsara = null;
  //   var apsaraThumbId = null;
  //   var uploadSource = null;
  //   var postType = null;
  //   var mediaTypeStory = null;
  //   // console.log(lengpict);
  //   if (lengpict > 0) {

  //     for (let i = 0; i < lengpict; i++) {

  //       try {
  //         postType = data[i].postType;
  //       } catch (e) {
  //         postType = "";
  //       }
  //       try {
  //         mediaTypeStory = data[i].mediaTypeStory;
  //       } catch (e) {
  //         mediaTypeStory = "";
  //       }
  //       if (postType === "pict") {
  //         try {
  //           apsaraId = data[i].content.apsaraId;
  //         } catch (e) {
  //           apsaraId = "";
  //         }
  //         try {
  //           isApsara = data[i].content.isApsara;
  //         } catch (e) {
  //           isApsara = "";
  //         }
  //         try {
  //           apsaraThumbId = data[i].content.apsaraThumbId;
  //         } catch (e) {
  //           apsaraThumbId = "";
  //         }


  //         try {

  //           uploadSource = data[i].content.uploadSource;
  //         } catch (e) {
  //           uploadSource = "";
  //         }

  //         if (apsaraId !== undefined && apsaraThumbId !== undefined) {
  //           tempdatapict.push(data[i].content.apsaraThumbId);

  //         }
  //         else if (apsaraId !== undefined && apsaraThumbId === undefined) {
  //           tempdatapict.push(data[i].content.apsaraId);

  //         }
  //         else if (apsaraId === undefined && apsaraThumbId !== undefined) {
  //           tempdatapict.push(data[i].content.apsaraThumbId);

  //         }
  //         var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
  //         var gettempresultpictapsara = resultpictapsara.ImageInfo;

  //         if (uploadSource == "OSS") {
  //           data[i].content.mediaThumbEndpoint = data[i].content.mediaEndpoint;

  //         } else {
  //           for (var j = 0; j < gettempresultpictapsara.length; j++) {

  //             if (gettempresultpictapsara[j].ImageId == data[i].content.apsaraThumbId) {

  //               data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

  //             }
  //             else if (gettempresultpictapsara[j].ImageId == data[i].content.apsaraId) {

  //               data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

  //             }
  //           }
  //         }


  //       }
  //       else if (postType === "vid" || postType === "diary") {
  //         try {
  //           apsaraId = data[i].content.apsaraId;
  //         } catch (e) {
  //           apsaraId = "";
  //         }
  //         try {
  //           isApsara = data[i].content.isApsara;
  //         } catch (e) {
  //           isApsara = "";
  //         }

  //         try {

  //           uploadSource = data[i].content.uploadSource;
  //         } catch (e) {
  //           uploadSource = "";
  //         }


  //         if (apsaraId !== undefined && apsaraId !== '') {
  //           tempdatapict.push(data[i].content.apsaraId);

  //         }

  //         var resultvidapsara = await this.postContentService.getVideoApsara(tempdatapict);
  //         var gettempresultvidapsara = resultvidapsara.VideoList;

  //         for (var j = 0; j < gettempresultvidapsara.length; j++) {
  //           var apsaraID = null;
  //           try {

  //             apsaraID = data[i].content.apsaraId;
  //           } catch (e) {
  //             apsaraID = null;
  //           }

  //           if (apsaraID !== null && apsaraID !== undefined) {
  //             if (gettempresultvidapsara[j].VideoId == apsaraID) {

  //               data[i].content.mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;

  //             }
  //           }



  //         }
  //       }
  //       else {


  //         try {
  //           apsaraId = data[i].content.apsaraId;
  //         } catch (e) {
  //           apsaraId = "";
  //         }
  //         try {
  //           isApsara = data[i].content.isApsara;
  //         } catch (e) {
  //           isApsara = "";
  //         }

  //         try {

  //           uploadSource = data[i].content.uploadSource;
  //         } catch (e) {
  //           uploadSource = "";
  //         }


  //         if (apsaraId !== undefined && apsaraId !== '') {
  //           tempdatapict.push(data[i].content.apsaraId);

  //         }

  //         if (mediaTypeStory !== undefined && mediaTypeStory === "video") {
  //           var resultvidapsara = await this.postContentService.getVideoApsara(tempdatapict);
  //           var gettempresultvidapsara = resultvidapsara.VideoList;

  //           for (var j = 0; j < gettempresultvidapsara.length; j++) {

  //             if (gettempresultvidapsara[j].VideoId == data[i].content.apsaraId) {

  //               data[i].content.mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;

  //             }

  //           }
  //         } else {
  //           var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
  //           var gettempresultpictapsara = resultpictapsara.ImageInfo;

  //           for (var j = 0; j < gettempresultpictapsara.length; j++) {

  //             if (apsaraId !== undefined && apsaraId !== "") {
  //               if (gettempresultpictapsara[j].ImageId == apsaraId) {

  //                 data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

  //               }
  //             }

  //           }
  //         }
  //       }




  //     }


  //   } else {
  //     data = [];
  //   }

  //   var fullurl = headers.host + "/api/posts/getnotification2";
  //   var timestamps_end = await this.utilsService.getDateTimeString();
  //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, body);

  //   return { response_code: 202, data, messages };
  // }

  @Post('api/posts/getnotificationAll')
  async getNotificationAll() {
    return await this.notifService.getNotificationAll();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/posts/tagpeople')
  async getTagpeople(@Headers() headers, @Body() body) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/tagpeople";
    var reqbody = JSON.parse(JSON.stringify(body));

    //CECK BAEARER TOKEN
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    //CECK DATA USER
    const data_userbasic = await this.userbasicsService.findOne(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(data_userbasic))) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed User not found'
      );
    }

    if (body.postId == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param PostID required'
      );
    }

    var userEmail = headers['x-auth-user'];
    var post = await this.PostsService.findByPostId(body.postId.toString());
    let following = await this.contenteventsService.findFollowing(userEmail);
    if (await this.utilsService.ceckData(post)) {
      if (post.tagPeople != undefined && post.tagPeople.length > 0) {
        let atp = post.tagPeople;
        let atp1 = Array<TagPeople>();

        for (let x = 0; x < atp.length; x++) {
          let tp = atp[x];
          if (tp?.namespace) {
            let oid = tp.oid;
            let ua = await this.userauthsService.findById(oid.toString());
            if (ua != undefined) {
              let tp1 = new TagPeople();
              tp1.email = String(ua.email);
              tp1.username = String(ua.username);

              let ub = await this.userbasicsService.findone_(String(ua.email));
              if (ub != undefined) {
                tp1.avatar = await this.postContentService.getProfileAvatar(ub);

                if (await this.utilsService.ceckData(ub.userBadge)) {
                  tp1.urluserBadge = ub.urluserBadge;
                }
                else {
                  tp1.urluserBadge = null;
                }
              }

              tp1.status = 'TOFOLLOW';
              if (tp1.email == userEmail) {
                tp1.status = "UNLINK";
              } else {
                var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(tp1.email, "FOLLOWER", "ACCEPT", userEmail, "", "");
                if (await this.utilsService.ceckData(ceck_data_FOLLOWER)) {
                  if (ceck_data_FOLLOWER.active) {
                    tp1.status = "FOLLOWING";
                  }
                }
              }
              atp1.push(tp1);
            }
          }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        return {
          response_code: 202,
          data: atp1,
          messages: {
            info: ['successfuly'],
          },
        };
      }
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Data Post not found'
      );
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('api/posts/getuserposts/byprofile')
  // @UseInterceptors(FileInterceptor('postContent'))
  // async getUserPostByProfile(@Body() body, @Headers() headers): Promise<PostResponseApps> {
  //   this.logger.log("getUserPostByProfile >>> start: " + JSON.stringify(body));
  //   return this.postContentService.getUserPostByProfile(body, headers);
  // }

  @Post('api/posts/notifyapsara/backup')
  async notifyApsara(@Body() body, @Headers() headers) {
    this.logger.log("notifyApsara >>> start: " + JSON.stringify(body));
    this.postContentService.updateNewPost(body, headers);
    let t = { 'response': 'Done' };
    return JSON.stringify(t);
  }

  @Post('api/posts/cmod/socket')
  async cmod(@Body() body) {
    this.logger.log("cmod >>> start: " + JSON.stringify(body));
    var event = body.event;
    var payload = body.payload;
    this.cmodService.ws(event, JSON.stringify(payload));
    let t = { 'response': 'Done' };
    return JSON.stringify(t);
  }

  @Get('api/posts/ads')
  async getPostAds(@Headers() headers) {
    return await this.bootsService.sendSoketAds(headers['x-auth-user']);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('api/posts/notifyapsara/cmod/image')
  // async notifyApsaraCmodImage(@Body() body, @Headers() headers) {
  //   this.logger.log("notifyApsaraCmodImage >>> start: " + JSON.stringify(body));
  //   this.cmodService.cmodResponse(body);
  //   let t = { 'response': 'Done' };
  //   return JSON.stringify(t);
  // }

  @Post('api/posts/getvideo')
  async getVideo(@Body() body, @Headers() headers) {

    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/posts/getvideo';
    var reqbody = JSON.parse(JSON.stringify(body));

    this.logger.log("getVideo >>> start: " + JSON.stringify(body));
    var definition = "SD";
    if (body.definition != undefined) {
      definition = String(body.definition);
    }
    // return this.postContentService.getVideoApsaraSingle(String(body.apsaraId), definition);
    var data = await this.postContentService.getVideoApsaraSingleV4(String(body.apsaraId), definition);

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/apsaraauth?')
  @HttpCode(HttpStatus.ACCEPTED)
  async getApsaraAuth(
    @Query('apsaraId') apsaraId: string,
    @Headers() headers) {
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var fullurl = headers.host + "/api/posts/apsaraauth?apsaraId=" + apsaraId;

    this.logger.log("apsaraId >>> start: " + JSON.stringify(apsaraId));
    return this.postContentService.getVideoPlayAuth(apsaraId, fullurl, auth.email);
  }

  //@UseGuards(JwtAuthGuard)
  @Get('api/posts/apsarasts?')
  @HttpCode(HttpStatus.ACCEPTED)
  async getApsaraStd(
    @Query('apsaraId') apsaraId: string,
    @Headers() headers) {
    return this.postContentService.getApsaraSts();
  }

  @Post('api/userplaylist/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateUserPlaylist(@Body() CreateUserplaylistDto_: CreateUserplaylistDto) {
    return await this.PostsService.generateUserPlaylist(CreateUserplaylistDto_);
  }

  @Post('api/userplaylist/updategenerate')
  @HttpCode(HttpStatus.ACCEPTED)
  async updategenerateUserPlaylist(@Body() body) {
    var CreateUserplaylistDto_ = new CreateUserplaylistDto();
    CreateUserplaylistDto_.userPostId = new mongoose.Types.ObjectId(body.userPostId);
    CreateUserplaylistDto_.mediaId = body.mediaId;
    CreateUserplaylistDto_.postType = body.postType;
    return await this.PostsService.updateGenerateUserPlaylist(new mongoose.Types.ObjectId(body.oldUserPostID), CreateUserplaylistDto_);
  }

  @Post('api/userplaylist/updategenerate2')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateGenerateUserPlaylist_(@Body() body) {
    var CreateUserplaylistDto_ = new CreateUserplaylistDto();
    CreateUserplaylistDto_.userPostId = new mongoose.Types.ObjectId(body.userPostId);
    CreateUserplaylistDto_.mediaId = body.mediaId;
    CreateUserplaylistDto_.postType = body.postType;
    return await this.PostsService.updateGenerateUserPlaylist_(CreateUserplaylistDto_);
  }

  @Get('api/userplaylist/generateNewUserPlaylist')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateNewUserPlaylist() {
    return await this.PostsService.generateNewUserPlaylist("633d0c26c9dca3610d7209f9");
  }

  //@UseGuards(JwtAuthGuard)
  @Post('api/posts/getinteractives')
  @HttpCode(HttpStatus.ACCEPTED)
  @FormDataRequest()
  async getinteractives(
    @Headers() headers,
    @Body() body,
    @Req() request
    // @Query('eventType') eventType: string,
    // @Query('withDetail') withDetail: boolean,
    // @Query('withEvents') withEvents: string,
    // @Query('postID') postID: string,
    // @Query('pageRow') pageRow: number,
    // @Query('pageNumber') pageNumber: number,
    // @Query('senderOrReceiver') senderOrReceiver: string
  ) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;
    var reqbody = JSON.parse(JSON.stringify(body));

    if (headers['x-auth-user'] == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

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

    let postID_ = "";
    let eventType_ = "";
    let withEvents_ = [];
    let withDetail_ = false;
    let pageRow_ = 10;
    let pageNumber_ = 1;
    let senderOrReceiver_ = "";

    if (body.pageRow != undefined) {
      pageRow_ = body.pageRow;
    }
    if (body.pageNumber != undefined) {
      pageNumber_ = body.pageNumber;
    }
    if (body.postID != undefined) {
      postID_ = body.postID;
    }
    if (body.eventType != undefined) {
      eventType_ = body.eventType;
    }
    if (body.withDetail != undefined) {
      withDetail_ = body.withDetail;
    }
    if (body.withEvents != undefined) {
      const Array_withEvents = body.withEvents.split(",");
      for (let i = 0; i < Array_withEvents.length; i++) {
        withEvents_.push(Array_withEvents[i]);
      }
    }
    if (body.senderOrReceiver != undefined) {
      senderOrReceiver_ = body.senderOrReceiver;
    }
    const insightsService_data = await this.insightsService.findemail(headers['x-auth-user']);
    const userbasicsService_data = await this.userbasicsService.findOne(headers['x-auth-user']);
    const contenteventsService_data_ = await this.contenteventsService.findByCriteria(headers['x-auth-user'], postID_, eventType_, withEvents_, pageRow_, pageNumber_);
    let contenteventsService_data = contenteventsService_data_;
    if (eventType_ == "FOLLOWER") {
      contenteventsService_data = [...new Map(contenteventsService_data_.map(item => [item["receiverParty"], item])).values()];
    } else if (eventType_ == "FOLLOWING") {
      contenteventsService_data = [...new Map(contenteventsService_data_.map(item => [item["senderParty"], item])).values()];
    }
    var getProfile_ = await this.utilsService.generateProfile(headers['x-auth-user'], 'PROFILE');
    var avatar_ = {}
    if (getProfile_ != null || getProfile_ != undefined) {
      if (getProfile_.avatar != null || getProfile_.avatar != undefined) {
        if (getProfile_.avatar.mediaBasePath != null || getProfile_.avatar.mediaBasePath != undefined) {
          Object.assign(avatar_, {
            "mediaBasePath": getProfile_.avatar.mediaBasePath,
          });
        }
        if (getProfile_.avatar.mediaUri != null || getProfile_.avatar.mediaUri != undefined) {
          Object.assign(avatar_, {
            "mediaUri": getProfile_.avatar.mediaUri,
          });
        }
        if (getProfile_.avatar.mediaType != null || getProfile_.avatar.mediaType != undefined) {
          Object.assign(avatar_, {
            "mediaType": getProfile_.avatar.mediaType,
          });
        }
        if (getProfile_.avatar.mediaEndpoint != null || getProfile_.avatar.mediaEndpoint != undefined) {
          Object.assign(avatar_, {
            "mediaEndpoint": getProfile_.avatar.mediaEndpoint,
          });
        }
      }
    }

    let data_response = [];
    for (let i = 0; i < contenteventsService_data.length; i++) {
      var emailSenderorreceiver = (contenteventsService_data[i].senderParty != undefined) ? contenteventsService_data[i].senderParty : (contenteventsService_data[i].receiverParty != undefined) ? contenteventsService_data[i].receiverParty : null;

      if (emailSenderorreceiver != null) {
        var getProfile = await this.utilsService.generateProfile(emailSenderorreceiver.toString(), 'PROFILE');
      }

      var datas = {}
      var senderOrReceiverInfo = {}
      var avatar = {}
      if (getProfile != null || getProfile != undefined) {
        if (getProfile.avatar != null || getProfile.avatar != undefined) {
          if (getProfile.avatar.mediaBasePath != null || getProfile.avatar.mediaBasePath != undefined) {
            Object.assign(avatar, {
              "mediaBasePath": getProfile.avatar.mediaBasePath,
            });
          }
          if (getProfile.avatar.mediaUri != null || getProfile.avatar.mediaUri != undefined) {
            Object.assign(avatar, {
              "mediaUri": getProfile.avatar.mediaUri,
            });
          }
          if (getProfile.avatar.mediaType != null || getProfile.avatar.mediaType != undefined) {
            Object.assign(avatar, {
              "mediaType": getProfile.avatar.mediaType,
            });
          }
          if (getProfile.avatar.mediaEndpoint != null || getProfile.avatar.mediaEndpoint != undefined) {
            Object.assign(avatar, {
              "mediaEndpoint": getProfile.avatar.mediaEndpoint,
            });
          }
        }
      }

      if (getProfile != null || getProfile != undefined) {
        Object.assign(senderOrReceiverInfo, {
          "fullName": (getProfile != null) ? (getProfile.fullName != undefined) ? getProfile.fullName : "" : "",
          avatar,
          "urluserBadge": getProfile.urluserBadge,
          "email": getProfile.email,
          "username": getProfile.username,
        });
      }
      if (withDetail_) {
        Object.assign(datas, {
          "createdAt": contenteventsService_data[i].createdAt,
        });
        Object.assign(datas, {
          "profileInsight": {
            "follower": insightsService_data.followers,
            "following": insightsService_data.followings,
          },
        });
        Object.assign(datas, {
          senderOrReceiverInfo,
        });
        Object.assign(datas, {
          "fullName": userbasicsService_data.fullName,
        });
      }
      var avatar = avatar_;
      Object.assign(datas, {
        "flowIsDone": contenteventsService_data[i].flowIsDone,
        "eventType": contenteventsService_data[i].eventType,
        avatar,
        "urluserBadge": getProfile_.urluserBadge,
        "event": contenteventsService_data[i].event,
        "senderOrReceiver": (contenteventsService_data[i].senderParty != undefined) ? contenteventsService_data[i].senderParty : contenteventsService_data[i].receiverParty,
        "email": contenteventsService_data[i].email
      });
      if (getProfile_ != null || getProfile_ != undefined) {
        if (withDetail_) {
          Object.assign(datas, {
            "username": getProfile_.username,
          });
        }
      }
      data_response.push(datas);
    }
    let data_filter = [];
    console.log("senderOrReceiver_", senderOrReceiver_);
    if (senderOrReceiver_ != "") {
      data_filter = data_response.filter(function (data_response_) {
        return data_response_.senderOrReceiver == senderOrReceiver_;
      });
      data_response = data_filter;
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    return {
      "response_code": 202,
      "data": data_response,
      "messages": {
        "info": [
          "The process successful"
        ]
      }
    }
  }

  @Post('api/posts/getinteractives/v2')
  @HttpCode(HttpStatus.ACCEPTED)
  @FormDataRequest()
  async getinteractives2(
    @Headers() headers,
    @Body() body,
    @Req() request
    // @Query('eventType') eventType: string,
    // @Query('withDetail') withDetail: boolean,
    // @Query('withEvents') withEvents: string,
    // @Query('postID') postID: string,
    // @Query('pageRow') pageRow: number,
    // @Query('pageNumber') pageNumber: number,
    // @Query('senderOrReceiver') senderOrReceiver: string
  ) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;
    var reqbody = JSON.parse(JSON.stringify(body));

    if (headers['x-auth-user'] == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

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

    let postID_ = "";
    let eventType_ = "";
    let withEvents_ = [];
    let withDetail_ = false;
    let pageRow_ = 10;
    let pageNumber_ = 1;
    let senderOrReceiver_ = "";

    if (body.pageRow != undefined) {
      pageRow_ = body.pageRow;
    }
    if (body.pageNumber != undefined) {
      pageNumber_ = body.pageNumber;
    }
    if (body.postID != undefined) {
      postID_ = body.postID;
    }
    if (body.eventType != undefined) {
      eventType_ = body.eventType;
    }
    if (body.withDetail != undefined) {
      withDetail_ = body.withDetail;
    }
    if (body.withEvents != undefined) {
      const Array_withEvents = body.withEvents.split(",");
      for (let i = 0; i < Array_withEvents.length; i++) {
        withEvents_.push(Array_withEvents[i]);
      }
    }
    if (body.senderOrReceiver != undefined) {
      senderOrReceiver_ = body.senderOrReceiver;
    }
    const insightsService_data = await this.insightsService.findemail(headers['x-auth-user']);
    const userbasicsService_data = await this.basic2SS.findbyemail(headers['x-auth-user']);
    let contenteventsService_data = [];
    if (eventType_ == "FOLLOWER" || eventType_ == "FOLLOWING") {
      contenteventsService_data = (eventType_ == "FOLLOWING" ? userbasicsService_data.following : userbasicsService_data.follower);
    }
    else if (eventType_ == "UNFOLLOW" || eventType_ == "REACTION" || eventType_ == "VIEW") {
      //UNFOLLOW nih yang mau dicari apa ya ???
      const contenteventsService_data_ = await this.contenteventsService.findByCriteria2(headers['x-auth-user'], postID_, eventType_, withEvents_, pageRow_, pageNumber_);
      if (contenteventsService_data_ != null && contenteventsService_data_.length != 0) {
        for (var i = 0; i < contenteventsService_data_.length; i++) {
          if (eventType_ == "UNFOLLOW") {
            contenteventsService_data.push(contenteventsService_data_[i].receiverParty);
          }
          else {
            contenteventsService_data.push(contenteventsService_data_[i].senderParty);
          }
        }
      }
    }
    else {
      await this.errorHandler.generateNotAcceptableException("Unabled to proceed. eventType field is required");
    }
    // console.log(contenteventsService_data);
    // var getProfile_ = await this.utilsService.generateProfile2(headers['x-auth-user'], 'PROFILE');
    // var avatar_ = {}
    // if (getProfile_ != null || getProfile_ != undefined) {
    //   if (getProfile_.avatar != null || getProfile_.avatar != undefined) {
    //     if (getProfile_.avatar.mediaBasePath != null || getProfile_.avatar.mediaBasePath != undefined) {
    //       Object.assign(avatar_, {
    //         "mediaBasePath": getProfile_.avatar.mediaBasePath,
    //       });
    //     }
    //     if (getProfile_.avatar.mediaUri != null || getProfile_.avatar.mediaUri != undefined) {
    //       Object.assign(avatar_, {
    //         "mediaUri": getProfile_.avatar.mediaUri,
    //       });
    //     }
    //     if (getProfile_.avatar.mediaType != null || getProfile_.avatar.mediaType != undefined) {
    //       Object.assign(avatar_, {
    //         "mediaType": getProfile_.avatar.mediaType,
    //       });
    //     }
    //     if (getProfile_.avatar.mediaEndpoint != null || getProfile_.avatar.mediaEndpoint != undefined) {
    //       Object.assign(avatar_, {
    //         "mediaEndpoint": getProfile_.avatar.mediaEndpoint,
    //       });
    //     }
    //   }
    // }

    // let data_response = [];
    // if(contenteventsService_data.length != 0)
    // {
    //   var listuser = await this.basic2SS.findInbyemail(contenteventsService_data);
    //   for (let i = 0; i < listuser.length; i++) {
    //     var emailSenderorreceiver = (contenteventsService_data[i].senderParty != undefined) ? contenteventsService_data[i].senderParty : (contenteventsService_data[i].receiverParty != undefined) ? contenteventsService_data[i].receiverParty : null;

    //     if (emailSenderorreceiver != null) {
    //       var getProfile = await this.utilsService.generateProfile2(emailSenderorreceiver.toString(), 'PROFILE');
    //     }

    //     var datas = {}
    //     var senderOrReceiverInfo = {}
    //     var avatar = {}
    //     if (getProfile != null || getProfile != undefined) {
    //       if (getProfile.avatar != null || getProfile.avatar != undefined) {
    //         if (getProfile.avatar.mediaBasePath != null || getProfile.avatar.mediaBasePath != undefined) {
    //           Object.assign(avatar, {
    //             "mediaBasePath": getProfile.avatar.mediaBasePath,
    //           });
    //         }
    //         if (getProfile.avatar.mediaUri != null || getProfile.avatar.mediaUri != undefined) {
    //           Object.assign(avatar, {
    //             "mediaUri": getProfile.avatar.mediaUri,
    //           });
    //         }
    //         if (getProfile.avatar.mediaType != null || getProfile.avatar.mediaType != undefined) {
    //           Object.assign(avatar, {
    //             "mediaType": getProfile.avatar.mediaType,
    //           });
    //         }
    //         if (getProfile.avatar.mediaEndpoint != null || getProfile.avatar.mediaEndpoint != undefined) {
    //           Object.assign(avatar, {
    //             "mediaEndpoint": getProfile.avatar.mediaEndpoint,
    //           });
    //         }
    //       }
    //     }

    //     if (getProfile != null || getProfile != undefined) {
    //       Object.assign(senderOrReceiverInfo, {
    //         "fullName": (getProfile != null) ? (getProfile.fullName != undefined) ? getProfile.fullName : "" : "",
    //         avatar,
    //         "urluserBadge": getProfile.urluserBadge,
    //         "email": getProfile.email,
    //         "username": getProfile.username,
    //       });
    //     }
    //     if (withDetail_) {
    //       Object.assign(datas, {
    //         "createdAt": contenteventsService_data[i].createdAt,
    //       });
    //       Object.assign(datas, {
    //         "profileInsight": {
    //           "follower": insightsService_data.followers,
    //           "following": insightsService_data.followings,
    //         },
    //       });
    //       Object.assign(datas, {
    //         senderOrReceiverInfo,
    //       });
    //       Object.assign(datas, {
    //         "fullName": userbasicsService_data.fullName,
    //       });
    //     }
    //     var avatar = avatar_;
    //     Object.assign(datas, {
    //       "flowIsDone": contenteventsService_data[i].flowIsDone,
    //       "eventType": contenteventsService_data[i].eventType,
    //       avatar,
    //       "urluserBadge": getProfile_.urluserBadge,
    //       "event": contenteventsService_data[i].event,
    //       "senderOrReceiver": (contenteventsService_data[i].senderParty != undefined) ? contenteventsService_data[i].senderParty : contenteventsService_data[i].receiverParty,
    //       "email": contenteventsService_data[i].email
    //     });
    //     if (getProfile_ != null || getProfile_ != undefined) {
    //       if (withDetail_) {
    //         Object.assign(datas, {
    //           "username": getProfile_.username,
    //         });
    //       }
    //     }
    //     data_response.push(datas);
    //   }
    // }

    // let data_filter = [];
    // console.log("senderOrReceiver_", senderOrReceiver_);
    // if (senderOrReceiver_ != "") {
    //   data_filter = data_response.filter(function (data_response_) {
    //     return data_response_.senderOrReceiver == senderOrReceiver_;
    //   });
    //   data_response = data_filter;
    // }

    var getlist = null;
    if (senderOrReceiver_ != "") {
      getlist = contenteventsService_data.filter((element) => element == senderOrReceiver_);
    }
    else {
      getlist = contenteventsService_data;
    }

    if (eventType_ == "FOLLOWER" || eventType_ == "FOLLOWING") {
      var before = Number(pageNumber_) * pageRow_;
      var after = (Number(pageNumber_) + 1) * pageRow_;
      getlist = getlist.slice(before, after);
    }

    var data_response = null;
    if (getlist.length != 0) {
      data_response = await this.basic2SS.listfilterInteractive(headers['x-auth-user'], getlist, eventType_, withDetail_);
    }
    else {
      data_response = [];
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    return {
      "response_code": 202,
      "data": data_response,
      "messages": {
        "info": [
          "The process successful"
        ]
      }
    }
  }

  @Get('api/posts/getpostm2m/backup')
  @HttpCode(HttpStatus.ACCEPTED)
  async getPostM2M(@Query('postID') postID: string,) {
    var response = {};
    var post = await this.PostsService.findByPostId(postID);
    if (await this.utilsService.ceckData(post)) {
      var media = await this.PostsService.findOnepostID(postID);
      if (await this.utilsService.ceckData(media)) {
        var data = [];
        var data_ = {};
        if (media[0].datacontent[0].mediaBasePath != undefined) {
          data_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          data_["postType"] = post.postType;
          if (post.postType == 'vid') {
            if (media[0].datacontent[0].apsaraId != undefined) {
              var dataApsara = await this.postContentService.getVideoApsaraSingleNoDefinition(media[0].datacontent[0].apsaraId);
              var metadata = {
                duration: dataApsara.Duration
              }
              console.log(dataApsara);
              data_['metadata'] = metadata;
            }
          } else if (post.postType == 'diary') {
            if (media[0].datacontent[0].apsaraId != undefined) {
              var dataApsara = await this.postContentService.getVideoApsaraSingleNoDefinition(media[0].datacontent[0].apsaraId);
              var metadata = {
                duration: dataApsara.Duration
              }
              console.log(dataApsara);
              data_['metadata'] = metadata;
            }
          } else if (post.postType == 'story') {
            if (media[0].datacontent[0].apsaraId != undefined) {
              var dataApsara = await this.postContentService.getVideoApsaraSingleNoDefinition(media[0].datacontent[0].apsaraId);
              var metadata = {
                duration: dataApsara.Duration
              }
              console.log(dataApsara);
              data_['metadata'] = metadata;
            }
          }
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          data_["mediaUri"] = media[0].datacontent[0].mediaUri;
        }
        if (post.description != undefined) {
          data_["description"] = post.description;
        }
        if (post.active != undefined) {
          data_["active"] = post.active;
        }
        if (media[0].datacontent[0].mediaType != undefined) {
          data_["mediaType"] = media[0].datacontent[0].mediaType;
        }
        if (post.postID != undefined) {
          data_["postID"] = post.postID;
        }
        if (post.tags != undefined) {
          data_["tags"] = post.tags;
        }
        if (post.allowComments != undefined) {
          data_["allowComments"] = post.allowComments;
        }
        if (post.createdAt != undefined) {
          data_["createdAt"] = post.createdAt;
        }
        if (media[0].datauser.insight != undefined) {
          data_["insight"] = media[0].datauser.insight;
        }
        if (post.email != undefined) {
          data_["email"] = post.email;
          var dataUserauth = await this.userauthsService.findOneByEmail(post.email.toString());
          if (await this.utilsService.ceckData(dataUserauth)) {
            data_["username"] = dataUserauth.username;
          }
        }
        if (post.email != undefined) {
          var dataUserbasic = await this.userbasicsService.findOne(post.email.toString());
          if (await this.utilsService.ceckData(dataUserbasic)) {
            data_["fullName"] = dataUserbasic.fullName;
          }
        }
        if (post.updatedAt != undefined) {
          data_["updatedAt"] = post.updatedAt;
        }
        data.push(data_)
        response = {
          "response_code": 202,
          "data": data,
          "messages": {
            info: [
              "Succesfully"
            ]
          }
        }
      } else {
        response = {
          "response_code": 202,
          "data": [],
          "messages": {
            info: [
              "Succesfully"
            ]
          }
        }
      }
    } else {
      response = {
        "response_code": 202,
        "data": [],
        "messages": {
          info: [
            "Succesfully"
          ]
        }
      }
    }
    return response;
  }

  // @Get('thumb/:id')
  // @HttpCode(HttpStatus.OK)
  // async thumb(
  //   @Param('id') id: string,
  //   @Query('x-auth-token') token: string,
  //   @Query('x-auth-user') email: string, @Res() response) {
  //   if ((id != undefined) && (token != undefined) && (email != undefined)) {
  //     if (await this.utilsService.validasiTokenEmailParam(token, email)) {
  //       var dataMedia = await this.PostsService.findOnepostID2(id);
  //       if (await this.utilsService.ceckData(dataMedia)) {
  //         if (dataMedia[0].datacontent[0].uploadSource != undefined) {
  //           console.log("OSS");
  //           if (dataMedia[0].datacontent[0].uploadSource == "OSS") {
  //             var mediaMime = "";
  //             if (dataMedia[0].datacontent[0].mediaMime != undefined) {
  //               mediaMime = dataMedia[0].datacontent[0].mediaMime.toString();
  //             } else {
  //               mediaMime = "image/jpeg";
  //             }

  //             var path = "";
  //             if (dataMedia[0].datacontent[0].mediaThumBasePath != undefined) {
  //               path = dataMedia[0].datacontent[0].mediaThumBasePath.toString();
  //             } else {
  //               path = dataMedia[0].datacontent[0].mediaBasePath.toString();
  //             }
  //             console.log(path);

  //             var data2 = await this.ossContentPictService.readFile(path);
  //             console.log(data2);
  //             if (data2 != null) {
  //               response.set("Content-Type", "image/jpeg");
  //               response.send(data2);
  //             } else {
  //               response.send(null);
  //             }
  //           } else {
  //             response.send(null);
  //           }
  //         } else {
  //           console.log("NON OSS");
  //           var thum_data = "";
  //           if (dataMedia[0].datacontent[0].apsara) {
  //             if (dataMedia[0].datacontent[0].apsaraId != undefined) {
  //               var resultpictapsara = await this.postContentService.getVideoApsara([dataMedia[0].datacontent[0].apsaraId.toString()]);
  //               var UrlThumnail = resultpictapsara.VideoList[0].CoverURL;
  //               var data_thum = await this.PostsService.urlToBuffer(UrlThumnail);
  //               //var data_thum = await this.postContentService.generate_thumnail_buffer(data, "jpg");

  //               if (data_thum != null) {
  //                 response.set("Content-Type", "image/jpeg");
  //                 response.send(data_thum);
  //               } else {
  //                 response.send(null);
  //               }
  //             } else {
  //               response.send(null);
  //             }
  //           } else {
  //             if (dataMedia[0].datacontent[0].fsTargetThumbUri != undefined) {
  //               thum_data = dataMedia[0].datacontent[0].fsTargetThumbUri;
  //             } else {
  //               thum_data = dataMedia[0].datacontent[0].fsSourceUri;
  //             }
  //             if (thum_data != '') {
  //               var data = await this.PostsService.thum(thum_data);
  //               if (data != null) {
  //                 var data_thum = await this.postContentService.generate_thumnail_buffer(data, "jpg");
  //                 console.log("data_thum", data_thum);
  //                 if (data_thum != null) {
  //                   response.set("Content-Type", "image/jpeg");
  //                   response.send(data_thum);
  //                 } else {
  //                   response.send(null);
  //                 }
  //               } else {
  //                 response.send(null);
  //               }
  //             } else {
  //               response.send(null);
  //             }
  //           }
  //         }
  //       } else {
  //         response.send(null);
  //       }
  //     } else {
  //       response.send(null);
  //     }
  //   } else {
  //     response.send(null);
  //   }
  // }

  // @Get('pict/:id')
  // @HttpCode(HttpStatus.OK)
  // async pict(
  //   @Param('id') id: string,
  //   @Query('x-auth-token') token: string,
  //   @Query('x-auth-user') email: string, @Res() response) {
  //   if ((id != undefined) && (token != undefined) && (email != undefined)) {
  //     if (await this.utilsService.validasiTokenEmailParam(token, email)) {
  //       var dataMedia = await this.PostsService.findOnepostID2(id);
  //       if (await this.utilsService.ceckData(dataMedia)) {
  //         if (dataMedia[0].datacontent[0].uploadSource != undefined) {
  //           console.log("OSS");
  //           if (dataMedia[0].datacontent[0].uploadSource == "OSS") {
  //             var mediaMime = "";
  //             if (dataMedia[0].datacontent[0].mediaMime != undefined) {
  //               mediaMime = dataMedia[0].datacontent[0].mediaMime.toString();
  //             } else {
  //               mediaMime = "image/jpeg";
  //             }

  //             var path = "";
  //             if (dataMedia[0].datacontent[0].mediaBasePath != undefined) {
  //               path = dataMedia[0].datacontent[0].mediaBasePath.toString();
  //             } else {
  //               path = dataMedia[0].datacontent[0].mediaBasePath.toString();
  //             }
  //             console.log(path);

  //             var data2 = await this.ossContentPictService.readFile(path);
  //             console.log(data2);
  //             if (data2 != null) {
  //               response.set("Content-Type", "image/jpeg");
  //               response.send(data2);
  //             } else {
  //               response.send(null);
  //             }
  //           } else {
  //             response.send(null);
  //           }
  //         } else {
  //           console.log("NON OSS");
  //           var image_data = "";
  //           var mediaMime = "";
  //           if (dataMedia[0].datacontent[0].fsSourceUri != undefined) {
  //             image_data = dataMedia[0].datacontent[0].fsSourceUri;
  //           }
  //           if (dataMedia[0].datacontent[0].mediaMime != undefined) {
  //             mediaMime = dataMedia[0].datacontent[0].mediaMime;
  //           } else {
  //             mediaMime = "image/jpeg";
  //           }
  //           if (image_data != '') {
  //             var data = await this.PostsService.pict(image_data);
  //             if (data != null) {
  //               response.set("Content-Type", "image/png");
  //               response.send(data);
  //             } else {
  //               response.send(null);
  //             }
  //           } else {
  //             response.send(null);
  //           }
  //         }
  //       } else {
  //         response.send(null);
  //       }
  //     } else {
  //       response.send(null);
  //     }
  //   } else {
  //     response.send(null);
  //   }
  // }

  @Get('thumb/:id')
  @HttpCode(HttpStatus.OK)
  async thumb(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var dataMedia = await this.NewPostService.findOnepostID2(id);
        if (await this.utilsService.ceckData(dataMedia)) {
          if (dataMedia.mediaSource != undefined) {
            if (dataMedia.mediaSource.length > 0) {
              if (dataMedia.mediaSource[0].uploadSource !== undefined) {
                console.log("OSS");
                if (dataMedia.mediaSource[0].uploadSource == "OSS") {
                  var mediaMime = "";
                  if (dataMedia.mediaSource[0].mediaMime != undefined) {
                    mediaMime = dataMedia.mediaSource[0].mediaMime.toString();
                  } else {
                    mediaMime = "image/jpeg";
                  }

                  var path = "";
                  if (dataMedia.mediaSource[0].mediaThumBasePath != undefined) {
                    path = dataMedia.mediaSource[0].mediaThumBasePath.toString();
                  } else {
                    path = dataMedia.mediaSource[0].mediaBasePath.toString();
                  }
                  console.log(path);

                  var data2 = await this.ossContentPictService.readFile(path);
                  console.log(data2);
                  if (data2 != null) {
                    response.set("Content-Type", "image/jpeg");
                    response.send(data2);
                  } else {
                    response.send(null);
                  }
                } else {
                  response.send(null);
                }
              } else {
                console.log("NON OSS");
                var thum_data = "";
                if (dataMedia.mediaSource[0].apsara) {
                  if (dataMedia.mediaSource[0].apsaraId != undefined) {
                    var resultpictapsara = await this.postContentService.getVideoApsara([dataMedia.mediaSource[0].apsaraId.toString()]);
                    var UrlThumnail = resultpictapsara.VideoList[0].CoverURL;
                    var data_thum = await this.PostsService.urlToBuffer(UrlThumnail);
                    //var data_thum = await this.postContentService.generate_thumnail_buffer(data, "jpg");

                    if (data_thum != null) {
                      response.set("Content-Type", "image/jpeg");
                      response.send(data_thum);
                    } else {
                      response.send(null);
                    }
                  } else {
                    response.send(null);
                  }
                } else {
                  let thum = null;

                  try {
                    thum = dataMedia.mediaSource[0].fsTargetThumbUri;
                  } catch (e) {
                    thum = null
                  }
                  if (thum != undefined && thum != null) {
                    thum_data = dataMedia.mediaSource[0].fsTargetThumbUri;
                  } else {
                    thum_data = dataMedia.mediaSource[0].fsSourceUri;
                  }
                  if (thum_data != '') {
                    var data = await this.PostsService.thum(thum_data);
                    if (data != null) {
                      var data_thum = await this.postContentService.generate_thumnail_buffer(data, "jpg");
                      console.log("data_thum", data_thum);
                      if (data_thum != null) {
                        response.set("Content-Type", "image/jpeg");
                        response.send(data_thum);
                      } else {
                        response.send(null);
                      }
                    } else {
                      response.send(null);
                    }
                  } else {
                    response.send(null);
                  }
                }
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }
  @Get('pict/:id')
  @HttpCode(HttpStatus.OK)
  async pict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var dataMedia = await this.NewPostService.findOnepostID2(id);
        if (await this.utilsService.ceckData(dataMedia)) {
          if (dataMedia.mediaSource != undefined) {
            if (dataMedia.mediaSource.length > 0) {
              if (dataMedia.mediaSource[0].uploadSource !== undefined) {
                console.log("OSS");
                if (dataMedia.mediaSource[0].uploadSource == "OSS") {
                  var mediaMime = "";
                  if (dataMedia.mediaSource[0].mediaMime != undefined) {
                    mediaMime = dataMedia.mediaSource[0].mediaMime.toString();
                  } else {
                    mediaMime = "image/jpeg";
                  }

                  var path = "";
                  if (dataMedia.mediaSource[0].mediaBasePath != undefined) {
                    path = dataMedia.mediaSource[0].mediaBasePath.toString();
                  } else {
                    path = dataMedia.mediaSource[0].mediaBasePath.toString();
                  }
                  console.log(path);

                  var data2 = await this.ossContentPictService.readFile(path);
                  console.log(data2);
                  if (data2 != null) {
                    response.set("Content-Type", "image/jpeg");
                    response.send(data2);
                  } else {
                    response.send(null);
                  }
                } else {
                  response.send(null);
                }
              } else {
                console.log("NON OSS");
                var image_data = "";
                var mediaMime = "";
                if (dataMedia.mediaSource[0].fsSourceUri != undefined) {
                  image_data = dataMedia.mediaSource[0].fsSourceUri;
                }
                if (dataMedia.mediaSource[0].mediaMime != undefined) {
                  mediaMime = dataMedia.mediaSource[0].mediaMime;
                } else {
                  mediaMime = "image/jpeg";
                }
                if (image_data != '') {
                  var data = await this.NewPostService.pict(image_data);
                  if (data != null) {
                    response.set("Content-Type", "image/png");
                    response.send(data);
                  } else {
                    response.send(null);
                  }
                } else {
                  response.send(null);
                }
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }
  // @Get('stream/v2?')
  // @HttpCode(HttpStatus.OK)
  // async stream_v2(@Query('postid') postid: string) {
  //   var dataMedia = await this.PostsService.findOnepostID2(postid);
  //   console.log(dataMedia);
  //   if (await this.utilsService.ceckData(dataMedia)) {
  //     var fsSourceUri = "";
  //     if (dataMedia != null) {
  //       if (dataMedia[0].datacontent[0].mediaUri != undefined) {
  //         fsSourceUri = dataMedia[0].datacontent[0].fsSourceUri;
  //       }
  //       if (fsSourceUri != "") {
  //         return {
  //           response_code: 202,
  //           data: {
  //             url: 'https://' + process.env.SEAWEEDFS_HOST + fsSourceUri
  //           },
  //           messages: {
  //             info: ['successful'],
  //           },
  //         };
  //       } else {
  //         return {
  //           response_code: 202,
  //           data: [],
  //           messages: {
  //             info: ['successful'],
  //           },
  //         };
  //       }
  //     } else {
  //       return {
  //         response_code: 202,
  //         data: [],
  //         messages: {
  //           info: ['Logout successful'],
  //         },
  //       };
  //     }
  //   } else {
  //     return {
  //       response_code: 202,
  //       data: [],
  //       messages: {
  //         info: ['Logout successful'],
  //       },
  //     };
  //   }
  // }
  @Get('stream/v2?')
  @HttpCode(HttpStatus.OK)
  async stream_v2(@Query('postid') postid: string) {
    var dataMedia = await this.NewPostService.findOnepostID2(postid);
    console.log(dataMedia);
    if (await this.utilsService.ceckData(dataMedia)) {
      if (dataMedia.mediaSource != undefined) {
        if (dataMedia.mediaSource.length > 0) {
        }
      }
      var fsSourceUri = "";
      if (dataMedia != null) {
        if (dataMedia.mediaSource[0].mediaUri != undefined) {
          fsSourceUri = dataMedia.mediaSource[0].fsSourceUri;
        }
        if (fsSourceUri != "") {
          return {
            response_code: 202,
            data: {
              url: 'https://' + process.env.SEAWEEDFS_HOST + fsSourceUri
            },
            messages: {
              info: ['successful'],
            },
          };
        } else {
          return {
            response_code: 202,
            data: [],
            messages: {
              info: ['successful'],
            },
          };
        }
      } else {
        return {
          response_code: 202,
          data: [],
          messages: {
            info: ['Logout successful'],
          },
        };
      }
    } else {
      return {
        response_code: 202,
        data: [],
        messages: {
          info: ['Logout successful'],
        },
      };
    }
  }
  // @Get('stream/:id')
  // @HttpCode(HttpStatus.OK)
  // async stream(@Param('id') mediaFile: string, @Headers() headers, @Res() response) {
  //   var timestamps_start = await this.utilsService.getDateTimeString();
  //   var fullurl = headers.host + "/stream/" + mediaFile;

  //   console.log(mediaFile);
  //   if ((headers['x-auth-user'] != undefined) && (headers['x-auth-token'] != undefined) && (headers['post-id'] != undefined) && (mediaFile != undefined)) {
  //     if (await this.utilsService.validasiTokenEmailParam(headers['x-auth-token'], headers['x-auth-user'])) {
  //       var dataMedia = await this.PostsService.findOnepostID(headers['post-id']);
  //       if (await this.utilsService.ceckData(dataMedia)) {
  //         var mediaBasePath = "";
  //         if (dataMedia != null) {
  //           if (dataMedia[0].datacontent[0].mediaBasePath != undefined) {
  //             mediaBasePath = dataMedia[0].datacontent[0].mediaBasePath;
  //           }
  //           if (mediaBasePath != "") {
  //             var data = await this.PostsService.stream(mediaBasePath + mediaFile);
  //             if (data != null) {
  //               var timestamps_end = await this.utilsService.getDateTimeString();
  //               this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //               response.set("Content-Type", "application/octet-stream");
  //               response.send(data);
  //             } else {
  //               var timestamps_end = await this.utilsService.getDateTimeString();
  //               this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //               response.send(null);
  //             }
  //           } else {
  //             var timestamps_end = await this.utilsService.getDateTimeString();
  //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //             response.send(null);
  //           }
  //         } else {
  //           var timestamps_end = await this.utilsService.getDateTimeString();
  //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //           response.send(null);
  //         }
  //       } else {
  //         var timestamps_end = await this.utilsService.getDateTimeString();
  //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //         response.send(null);
  //       }
  //     } else {
  //       var timestamps_end = await this.utilsService.getDateTimeString();
  //       this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

  //       response.send(null);
  //     }
  //   } else {
  //     var timestamps_end = await this.utilsService.getDateTimeString();
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

  //     response.send(null);
  //   }
  // }

  // @Get('stream/:id')
  // @HttpCode(HttpStatus.OK)
  // async stream(@Param('id') mediaFile: string, @Headers() headers, @Res() response) {
  //   var timestamps_start = await this.utilsService.getDateTimeString();
  //   var fullurl = headers.host + "/stream/" + mediaFile;

  //   console.log(mediaFile);
  //   if ((headers['x-auth-user'] != undefined) && (headers['x-auth-token'] != undefined) && (headers['post-id'] != undefined) && (mediaFile != undefined)) {
  //     if (await this.utilsService.validasiTokenEmailParam(headers['x-auth-token'], headers['x-auth-user'])) {
  //       var dataMedia = await this.PostsService.findOnepostID(headers['post-id']);
  //       if (await this.utilsService.ceckData(dataMedia)) {
  //         var mediaBasePath = "";
  //         if (dataMedia != null) {
  //           if (dataMedia[0].datacontent[0].mediaBasePath != undefined) {
  //             mediaBasePath = dataMedia[0].datacontent[0].mediaBasePath;
  //           }
  //           if (mediaBasePath != "") {
  //             var data = await this.PostsService.stream(mediaBasePath + mediaFile);
  //             if (data != null) {
  //               var timestamps_end = await this.utilsService.getDateTimeString();
  //               this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //               response.set("Content-Type", "application/octet-stream");
  //               response.send(data);
  //             } else {
  //               var timestamps_end = await this.utilsService.getDateTimeString();
  //               this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //               response.send(null);
  //             }
  //           } else {
  //             var timestamps_end = await this.utilsService.getDateTimeString();
  //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //             response.send(null);
  //           }
  //         } else {
  //           var timestamps_end = await this.utilsService.getDateTimeString();
  //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //           response.send(null);
  //         }
  //       } else {
  //         var timestamps_end = await this.utilsService.getDateTimeString();
  //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //         response.send(null);
  //       }
  //     } else {
  //       var timestamps_end = await this.utilsService.getDateTimeString();
  //       this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

  //       response.send(null);
  //     }
  //   } else {
  //     var timestamps_end = await this.utilsService.getDateTimeString();
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

  //     response.send(null);
  //   }
  // }

  @Get('stream/:id')
  @HttpCode(HttpStatus.OK)
  async stream(@Param('id') mediaFile: string, @Headers() headers, @Res() response) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/stream/" + mediaFile;

    console.log(mediaFile);
    if ((headers['x-auth-user'] != undefined) && (headers['x-auth-token'] != undefined) && (headers['post-id'] != undefined) && (mediaFile != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(headers['x-auth-token'], headers['x-auth-user'])) {
        var dataMedia = await this.NewPostService.findid(mediaFile);
        console.log(dataMedia.mediaSource);
        if (await this.utilsService.ceckData(dataMedia)) {
          var mediaBasePath = "";
          if (dataMedia != null) {
            if (dataMedia.mediaSource[0].mediaBasePath != undefined) {
              mediaBasePath = dataMedia.mediaSource[0].mediaBasePath;
            }
            if (mediaBasePath != "") {
              var data = await this.PostsService.stream(mediaBasePath + mediaFile);
              if (data != null) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

                response.set("Content-Type", "application/octet-stream");
                response.send(data);
              } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

                response.send(null);
              }
            } else {
              console.log("NON OSS");
              var thum_data = "";
              if (dataMedia.mediaSource[0].apsara) {
                if (dataMedia.mediaSource[0].apsaraId != undefined) {
                  var resultpictapsara = await this.postContentService.getVideoApsara([dataMedia.mediaSource[0].apsaraId.toString()]);
                  var UrlThumnail = resultpictapsara.VideoList[0].CoverURL;
                  var data_thum = await this.PostsService.urlToBuffer(UrlThumnail);
                  //var data_thum = await this.postContentService.generate_thumnail_buffer(data, "jpg");

                  if (data_thum != null) {
                    response.set("Content-Type", "image/jpeg");
                    response.send(data_thum);
                  } else {
                    response.send(null);
                  }
                } else {
                  response.send(null);
                }
              } else {
                let thum = null;

                try {
                  thum = dataMedia.mediaSource[0].fsTargetThumbUri;
                } catch (e) {
                  thum = null
                }
                if (thum != undefined && thum != null) {
                  thum_data = dataMedia.mediaSource[0].fsTargetThumbUri;
                } else {
                  thum_data = dataMedia.mediaSource[0].fsSourceUri;
                }
                // if (thum_data != '') {
                //   var data = await this.PostsService.thum(thum_data);
                //   if (data != null) {
                //     var data_thum = await this.postContentService.generate_thumnail_buffer(data, "jpg");
                //     console.log("data_thum", data_thum);
                //     if (data_thum != null) {
                //       response.set("Content-Type", "image/jpeg");
                //       response.send(data_thum);
                //     } else {
                //       response.send(null);
                //     }
                //   } else {
                //     response.send(null);
                //   }
                // } else {
                //   response.send(null);
                // }
              }
            }
          } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            response.send(null);
          }
        } else {
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

          response.send(null);
        }
      } else {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

        response.send(null);
      }
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

      response.send(null);
    }
  }

  @Get('api/posts/getMax')
  async testdm() {
    return await this.cmodService.getMax2();
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/posts/delete/:id')
  async deletePost(@Res() res, @Param('id') id: string, @Req() request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    // var idobj = mongoose.Types.ObjectId(id);
    try {
      let data = await this.PostsService.updatenonaktif(id);

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @Post('api/posts/postbychart')
  @UseGuards(JwtAuthGuard)
  async getPostChartBasedDate(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/postbychart";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = null;
    var date = null;
    var iduser = null;

    const messages = {
      "info": ["The process successful"],
    };

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["date"] !== undefined) {
      date = request_json["date"];
    }
    else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    var tempdata = await this.PostsService.getPostByDate(date);
    var getdata = [];
    try {
      getdata = tempdata[0].resultdata;
    }
    catch (e) {
      getdata = [];
    }

    var startdate = new Date(date);
    startdate.setDate(startdate.getDate() - 1);
    var tempdate = new Date(startdate).toISOString().split("T")[0];
    var end = new Date().toISOString().split("T")[0];
    var array = [];

    //kalo lama, berarti error disini!!
    while (tempdate != end) {
      var temp = new Date(tempdate);
      temp.setDate(temp.getDate() + 1);
      tempdate = new Date(temp).toISOString().split("T")[0];
      //console.log(tempdate);

      let obj = getdata.find(objs => objs._id === tempdate);
      //console.log(obj);
      if (obj == undefined) {
        obj =
        {
          _id: tempdate,
          totaldata: 0
        }
      }

      array.push(obj);
    }

    data =
    {
      data: array,
      total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

    return { response_code: 202, messages, data };
  }
  @Post('api/posts/postbychart/v2')
  @UseGuards(JwtAuthGuard)
  async getPostChartBasedDate2(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/postbychart";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = null;
    var date = null;
    var iduser = null;

    const messages = {
      "info": ["The process successful"],
    };

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["date"] !== undefined) {
      date = request_json["date"];
    }
    else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    var tempdata = await this.NewPostService.getPostByDate(date);
    var getdata = [];
    try {
      getdata = tempdata[0].resultdata;
    }
    catch (e) {
      getdata = [];
    }

    var startdate = new Date(date);
    startdate.setDate(startdate.getDate() - 1);
    var tempdate = new Date(startdate).toISOString().split("T")[0];
    var end = new Date().toISOString().split("T")[0];
    var array = [];

    //kalo lama, berarti error disini!!
    while (tempdate != end) {
      var temp = new Date(tempdate);
      temp.setDate(temp.getDate() + 1);
      tempdate = new Date(temp).toISOString().split("T")[0];
      //console.log(tempdate);

      let obj = getdata.find(objs => objs._id === tempdate);
      //console.log(obj);
      if (obj == undefined) {
        obj =
        {
          _id: tempdate,
          totaldata: 0
        }
      }

      array.push(obj);
    }

    data =
    {
      data: array,
      total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

    return { response_code: 202, messages, data };
  }

  @Get('api/posts/showsertifikasistatbychart')
  @UseGuards(JwtAuthGuard)
  async getCertifiedStatByChart(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/showsertifikasistatbychart";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = null;

    const messages = {
      "info": ["The process successful"],
    };

    var tempdata = await this.PostsService.getAllSertifikasiChart();
    try {
      data = tempdata[0].data;
    }
    catch (e) {
      data = [
        {
          "id": "TIDAK BERSERTIFIKAT",
          "total": 0,
          "persentase": 0
        },
        {
          "id": "BERSERTIFIKAT",
          "total": 0,
          "persentase": 0
        }
      ];
    }
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

    return { response_code: 202, messages, data };
  }

  @Post('api/posts/analityc')
  @UseGuards(JwtAuthGuard)
  async getByChart(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/analityc";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = null;
    var startdate = null;
    var enddate = null;
    var datasummary = [];
    var lengviews = 0;
    var arrdataview = [];
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["startdate"] !== undefined) {
      startdate = request_json["startdate"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["enddate"] !== undefined) {
      enddate = request_json["enddate"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);
      throw new BadRequestException("Unabled to proceed");
    }

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasummary = await this.PostsService.analiticPost(startdate, enddate);
      lengviews = datasummary.length;
    }
    catch (e) {
      datasummary = [];
      lengviews = 0;
    }

    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var diary = 0;
        var pict = 0;
        var vid = 0;
        var story = 0;
        for (var j = 0; j < lengviews; j++) {
          if (datasummary[j].date == stdt) {
            diary = datasummary[j].diary;
            pict = datasummary[j].pict;
            vid = datasummary[j].vid;
            story = datasummary[j].story;
            break;
          }
        }
        arrdataview.push({
          'date': stdt,
          'diary': diary,
          'pict': pict,
          'vid': vid,
          'story': story
        });

      }

    }
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

    return { response_code: 202, messages, data: arrdataview };
  }

  @Post('api/posts/analityc/v2')
  @UseGuards(JwtAuthGuard)
  async getByChartv2(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/analityc/v2";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = null;
    var startdate = null;
    var enddate = null;
    var datasummary = [];
    var lengviews = 0;
    var arrdataview = [];
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["startdate"] !== undefined) {
      startdate = request_json["startdate"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["enddate"] !== undefined) {
      enddate = request_json["enddate"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);
      throw new BadRequestException("Unabled to proceed");
    }

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasummary = await this.NewPostService.analiticPost(startdate, enddate);
      lengviews = datasummary.length;
    }
    catch (e) {
      datasummary = [];
      lengviews = 0;
    }

    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        // var diary = 0;
        var pict = 0;
        var vid = 0;
        var story = 0;
        for (var j = 0; j < lengviews; j++) {
          if (datasummary[j].date == stdt) {
            // diary = datasummary[j].diary;
            pict = datasummary[j].pict;
            vid = datasummary[j].vid;
            story = datasummary[j].story;
            break;
          }
        }
        arrdataview.push({
          'date': stdt,
          // 'diary': diary,
          'pict': pict,
          'vid': vid,
          'story': story
        });

      }

    }
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

    return { response_code: 202, messages, data: arrdataview };
  }

  @Post('api/posts/landing-page/recentStory')
  @UseGuards(JwtAuthGuard)
  async getRecentStory(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/landing-page/recentStory";

    var data = null;
    var email = null;
    var page = null;
    var limit = null;
    var dataApsaraThumnail = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };
    var tempdata = null;

    try {
      tempdata = await this.NewPostService.getRecentStory3(email, page, limit);
    } catch (e) {
      tempdata = null;
    }

    if (tempdata !== null) {
      for (var i = 0; i < tempdata.length; i++) {
        var getdata = tempdata[i].story;
        for (var j = 0; j < getdata.length; j++) {
          var listvideo = [];
          var listimage = [];
          var getchildata = getdata[j];
          var response = null;
          if (getchildata.mediaType == "image" || getchildata.mediaType == "images") {
            listimage.push(getchildata.apsaraId);

            if (getchildata.apsara == true) {
              try {
                getchildata.media = await this.postContentService.getImageApsara(listimage);
              } catch (e) {
                getchildata.media = {};
              }
            } else {
              getchildata.media = {};
            }

          }

          if (getchildata.music.apsaraThumnail != undefined) {
            try {
              dataApsaraThumnail = await this.mediamusicService.getImageApsara([getchildata.music.apsaraThumnail]);
              getchildata.music.apsaraThumnailUrl = dataApsaraThumnail.ImageInfo.find(x => x.ImageId == getchildata.music.apsaraThumnail).URL;
            } catch (e) {
              console.log(dataApsaraThumnail)
            }
            // getchildata.music.apsaraThumnailUrl = dataApsaraThumnail.ImageInfo[0].URL;
          }

        }
      }

      data = tempdata;
    } else {
      data = [];
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, data, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/story/following/')
  async getAllFollowerStoryBasedEmail(@Req() request: Request): Promise<any> {
    var data = null;
    var email = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    var tempdata = await this.contenteventsService.getFollowerStoryByEmail(email);
    //console.log(tempdata);
    for (var i = 0; i < tempdata.length; i++) {
      var getdata = tempdata[i].story;
      for (var j = 0; j < getdata.length; j++) {
        var listimage = [];
        var getchildata = getdata[j];
        if (getchildata.mediaType == "image" || getchildata.mediaType == "images") {
          listimage.push(getchildata.apsaraId);
          try {
            getchildata.media = await this.postContentService.getImageApsara(listimage);
          } catch (e) {
            getchildata.media = {};
          }
        }
      }
    }

    data = tempdata;

    return { response_code: 202, data, messages };
  }


  @Post('api/posts/interaksi')
  @UseGuards(JwtAuthGuard)
  async getByCharti(@Req() request: Request): Promise<any> {
    var data = null;
    var startdate = null;
    var enddate = null;
    var datasummary = [];
    var lengviews = 0;
    var arrdataview = [];
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["startdate"] !== undefined) {
      startdate = request_json["startdate"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["enddate"] !== undefined) {
      enddate = request_json["enddate"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasummary = await this.PostsService.analitycview(startdate, enddate);
      lengviews = datasummary.length;
    }
    catch (e) {
      datasummary = [];
      lengviews = 0;
    }

    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var views = 0;
        var likes = 0;
        var comments = 0;

        for (var j = 0; j < lengviews; j++) {
          if (datasummary[j].date == stdt) {
            views = datasummary[j].views;
            likes = datasummary[j].likes;
            comments = datasummary[j].comments;

            break;
          }
        }
        arrdataview.push({
          'date': stdt,
          'views': views,
          'likes': likes,
          'comments': comments,

        });

      }

    }

    return { response_code: 202, messages, data: arrdataview };
  }

  @Post('api/posts/createnewcollection')
  // @UseGuards(JwtAuthGuard)
  async createnewCollection(@Req() request: Request): Promise<any> {
    var pilihan = null;
    var messages = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["pilihan"] !== undefined) {
      var pilihan = request_json["pilihan"];
      if (pilihan == 'hashtags') {
        messages = {
          "info": ["New hashtag list collection successfully created"],
        };

        await this.PostsService.createTagsCollection();
      }
      else if (pilihan == 'interests') {
        messages = {
          "info": ["New interest list collection successfully created"],
        };

        await this.PostsService.createInterestCollection();
      }
      else {
        throw new BadRequestException("Unabled to proceed");
      }
    }
    else {
      throw new BadRequestException("Unabled to proceed");
    }

    return { response_code: 202, pilihan, messages }
  }

  @Post('api/posts/pict/seaweed/migration')
  async mediapictSeaweedMigration() {
    var Mediapicts_ = await this.postContentService.getDataMediapictSeaweed();
    console.log(Mediapicts_.length);
    this.postContentService.runMigrationPict(Mediapicts_);
    return {
      status: 202,
      messages: "RUN MIGRATION PICT"
    }
  }

  @Post('api/posts/vid/seaweed/migration')
  async mediavidSeaweedMigration() {
    var Mediavid_ = await this.postContentService.getDataMediavidSeaweed();
    console.log(Mediavid_.length);
    this.postContentService.runMigrationVid(Mediavid_);
    return {
      status: 202,
      messages: "RUN MIGRATION VID"
    }
  }

  @Post('api/posts/diaries/seaweed/migration')
  async mediadiariesSeaweedMigration() {
    var Mediadiaries_ = await this.postContentService.getDataMediadiariesSeaweed();
    console.log(Mediadiaries_.length);
    this.postContentService.runMigrationDiary(Mediadiaries_);
    return {
      status: 202,
      messages: "RUN MIGRATION DIARRY"
    }
  }

  @Post('api/posts/vid/seaweed/migration/one')
  async mediavidSeaweedMigrationOne(@Body('postID') postID: string): Promise<any> {
    var Mediavid_ = await this.postContentService.getDataMediavidSeaweedOne(postID);
    console.log(Mediavid_.length);
    console.log(postID);
    this.postContentService.runMigrationVid(Mediavid_);
    return {
      status: 202,
      messages: "RUN MIGRATION VID POSTID " + postID
    }
  }


  async userChallengePost(iduser: string, idref: string, nametable: string, action: string, postID: string) {
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
    var poin = null;
    var datatag = null;
    var poinViewVid = null;
    var poinViewDiary = null;
    var poinPict = null;
    var tagar = null;
    var datapost = null;
    var createAt = null;
    var saleAmount = null;
    var postTypeparent = null;
    try {
      datapost = await this.PostsService.findByPostId(postID);
    } catch (e) {
      datapost = null;
    }
    if (datapost !== null) {
      postTypeparent = datapost.postType;
      createAt = datapost.createdAt;
      if (datapost.saleAmount !== undefined) {
        saleAmount = datapost.saleAmount;
      } else {
        saleAmount = 0;
      }
    }
    try {
      datachallenge = await this.challengeService.challengeKonten();
    } catch (e) {
      datachallenge = null;
    }

    if (datachallenge !== null && datachallenge.length > 0) {
      lengchal = datachallenge.length;

      for (let i = 0; i < lengchal; i++) {
        var idChallenge = datachallenge[i]._id.toString();
        try {
          poinViewVid = datachallenge[i].buatKonten[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].buatKonten[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }
        try {
          poinPict = datachallenge[i].buatKonten[0].HyppePic;
        } catch (e) {
          poinPict = 0;
        }

        try {
          tagar = datachallenge[i].tagar;
        } catch (e) {
          tagar = "";
        }

        if (tagar != undefined && tagar != "" && tagar.length > 0) {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }

          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              let postIDpost = datatag[i].postID;
              let postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
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

                      let iduserchall = datauserchall[y]._id;
                      let idsubchallenge = datauserchall[y].idSubChallenge;
                      let idChallenges = datauserchall[y].idChallenge;
                      let session = datauserchall[y].session;
                      let startDatetime = datauserchall[y].startDatetime;
                      let endDatetime = datauserchall[y].endDatetime;
                      let start = new Date(datauserchall[y].startDatetime);
                      let end = new Date(datauserchall[y].endDatetime);
                      let datenow = new Date(Date.now());
                      if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                        if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                          var obj = {};

                          obj = {
                            "updatedAt": datauserchall[y].updatedAt,
                            "score": datauserchall[y].score,
                            "ranking": datauserchall[y].ranking,
                          }

                          if (postType == "vid") {
                            poin = poinViewVid;
                          } else if (postType == "diary") {
                            poin = poinViewDiary;
                          } else if (postType == "pict") {
                            poin = poinPict;
                          }

                          try {
                            var Postchallenge_ = new Postchallenge();
                            Postchallenge_.postID = postID;
                            Postchallenge_.createdAt = timedate;
                            Postchallenge_.idChallenge = idChallenge;
                            Postchallenge_.idSubChallenge = idsubchallenge;
                            Postchallenge_.session = session;
                            Postchallenge_.startDatetime = startDatetime;
                            Postchallenge_.endDatetime = endDatetime;
                            Postchallenge_.updatedAt = timedate;
                            Postchallenge_.idUser = mongoose.Types.ObjectId(iduser);
                            Postchallenge_.score = poin;
                            Postchallenge_.postType = postTypeparent;

                            await this.postchallengeService.create(Postchallenge_);


                          } catch (e) {

                          }
                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                          await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);

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

          }

        }
        else {

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

                let iduserchall = datauserchall[y]._id;
                let idsubchallenge = datauserchall[y].idSubChallenge;
                let idChallenges = datauserchall[y].idChallenge;
                let session = datauserchall[y].session;
                let startDatetime = datauserchall[y].startDatetime;
                let endDatetime = datauserchall[y].endDatetime;
                let start = new Date(datauserchall[y].startDatetime);
                let end = new Date(datauserchall[y].endDatetime);
                let datenow = new Date(Date.now());
                if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }
                    if (postTypeparent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeparent == "diary") {
                      poin = poinViewDiary;
                    } else if (postTypeparent == "pict") {
                      poin = poinPict;
                    }
                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                    await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                    try {
                      var Postchallenge_ = new Postchallenge();
                      Postchallenge_.postID = postID;
                      Postchallenge_.createdAt = timedate;
                      Postchallenge_.idChallenge = idChallenge;
                      Postchallenge_.idSubChallenge = idsubchallenge;
                      Postchallenge_.session = session;
                      Postchallenge_.startDatetime = startDatetime;
                      Postchallenge_.endDatetime = endDatetime;
                      Postchallenge_.updatedAt = timedate;
                      Postchallenge_.idUser = mongoose.Types.ObjectId(iduser);
                      Postchallenge_.score = poin;
                      Postchallenge_.postType = postTypeparent;
                      await this.postchallengeService.create(Postchallenge_);
                    } catch (e) {

                    }
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

                        //  if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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


    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/music/used/:id')
  async getOneMusicPost(@Param('id') id: string, @Req() request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;

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
    if (id == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param id is required',
      );
    }

    var data = await this.PostsService.findByMusicId(id);
    console.log(data.length);
    // if (data.length > 0) {
    //   if (data[0].apsaraMusic != undefined) {
    //     var dataApsaraMusic = await this.mediamusicService.getVideoApsaraSingle(data[0].apsaraMusic)
    //     var apsaraMusicData = {
    //       PlayURL: dataApsaraMusic.PlayInfoList.PlayInfo[0].PlayURL,
    //       Duration: dataApsaraMusic.PlayInfoList.PlayInfo[0].Duration,
    //     }
    //     data[0]["music"] = apsaraMusicData;
    //   }
    //   if (data[0].apsaraThumnail != undefined) {
    //     var dataApsaraThumnail = await this.mediamusicService.getImageApsara([data[0].apsaraThumnail])
    //     data[0]["apsaraThumnailUrl"] = dataApsaraThumnail.ImageInfo.find(x => x.ImageId == data[0].apsaraThumnail).URL;
    //   }
    // }
    var Response = {
      data: data,
      response_code: 202,
      messages: {
        info: [
          "Get music succesfully"
        ]
      }
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

    return Response;
  }
  async updateused(list: any[]) {
    return await this.MediastikerService.updatedata(list, "used");
  }

  async scorepostrequest(iduser: string, idevent: string, namatabel: string, event: string, postID: string, listchallenge: any[]) {
    await this.contenteventsService.scorepostrequest(iduser, idevent, namatabel, event, postID, listchallenge);
  }

  @Post('api/posts/migration')
  async runMigrationDBNewUserBasic(@Body() mingrionRun_: mingrionRun) {
    let LogMigrations_ = new LogMigrations();
    let _id = new mongoose.Types.ObjectId();
    LogMigrations_._id = _id;
    LogMigrations_.limit = mingrionRun_.limit;
    LogMigrations_.limitstop = mingrionRun_.limitstop;
    LogMigrations_.skip = mingrionRun_.skip;
    LogMigrations_.startAt = (await this.PostsService.getDate()).dateString;
    LogMigrations_.status = "RUNNING";
    LogMigrations_.type = "POST";
    this.logMigrationsService.create(LogMigrations_);
    this.PostsService.migrationRun(mingrionRun_, _id.toString());
    return { response_code: 202, messages: "Success" };
  }
}
