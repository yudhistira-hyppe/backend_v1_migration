import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Int32, Long, ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar, PostLandingResponseApps, PostLandingData, PostBuildData, VideoList, ImageInfo, GetVideoPlayAuthResponse } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';
import { GetuserprofilesService } from '../../trans/getuserprofiles/getuserprofiles.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { Mediavideos } from '../mediavideos/schemas/mediavideos.schema';
import { UtilsService } from '../../utils/utils.service';
import { InterestsService } from '../../infra/interests/interests.service';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { InsightsService } from '../insights/insights.service';
import { Insights } from '../insights/schemas/insights.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, unlink } from 'fs'
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { PostsService } from './posts.service';
import { Mediastories } from '../mediastories/schemas/mediastories.schema';
import { MediastoriesService } from '../mediastories/mediastories.service';
import { Mediadiaries } from '../mediadiaries/schemas/mediadiaries.schema';
import { Mediapicts } from '../mediapicts/schemas/mediapicts.schema';
import { MediapictsService } from '../mediapicts/mediapicts.service';
import { MediadiariesService } from '../mediadiaries/mediadiaries.service';
import { MediaprofilepictsService } from '../mediaprofilepicts/mediaprofilepicts.service';
import { IsDefined } from 'class-validator';
import { CreateUserplaylistDto, MediaData } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from '../../trans/userplaylist/schemas/userplaylist.schema';
import { PostPlaylistService } from '../postplaylist/postplaylist.service';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';
import { ErrorHandler } from '../../utils/error.handler';
import * as fs from 'fs';
import { post } from 'jquery';
import { TemplatesRepoService } from '../../infra/templates_repo/templates_repo.service';
import { UnsubscriptionError } from 'rxjs';
import { Userauth } from '../../trans/userauths/schemas/userauth.schema';
import { SettingsService } from '../../trans/settings/settings.service';
import { InsightlogsService } from '../insightlogs/insightlogs.service';
import { ContentModService } from './contentmod.service';
import { threadId } from 'worker_threads';
import { NotificationsService } from '../notifications/notifications.service';
import { ContentDTO, CreateNotificationsDto, NotifResponseApps } from '../notifications/dto/create-notifications.dto';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { Readable, PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import { OssContentPictService } from './osscontentpict.service';
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { Mediaprofilepicts } from '../mediaprofilepicts/schemas/mediaprofilepicts.schema';
import { TagCountService } from '../tag_count/tag_count.service';
import { TagCountDto } from '../tag_count/dto/create-tag_count.dto';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { logApis } from 'src/trans/logapis/schema/logapis.schema';

const webp = require('webp-converter');
const sharp = require('sharp');
const Jimp_ = require('jimp');
const convert = require('heic-convert');

//import FormData from "form-data";
var FormData = require('form-data');

@Injectable()
export class PostContentService {
  private readonly logger = new Logger(PostContentService.name);

  constructor(
    @InjectModel(Posts.name, 'SERVER_FULL')
    private readonly PostsModel: Model<PostsDocument>,
    private postService: PostsService,
    private userService: UserbasicsService,
    private utilService: UtilsService,
    private interestService: InterestsService,
    private userAuthService: UserauthsService,
    private videoService: MediavideosService,
    private storyService: MediastoriesService,
    private picService: MediapictsService,
    private diaryService: MediadiariesService,
    private insightService: InsightsService,
    private insightLogService: InsightlogsService,
    private contentEventService: ContenteventsService,
    private profilePictService: MediaprofilepictsService,
    private cmodService: ContentModService,
    private readonly configService: ConfigService,
    private seaweedfsService: SeaweedfsService,
    private templateService: TemplatesRepoService,
    private settingsService: SettingsService,
    private readonly notifService: NotificationsService,
    private errorHandler: ErrorHandler,
    private mediamusicService: MediamusicService,
    private ossContentPictService: OssContentPictService,
    private disqusService: DisqusService,
    private readonly tagCountService: TagCountService,
    private disqusLogService: DisquslogsService,
    private readonly logapiSS: LogapisService
  ) { }

  async uploadVideo(file: Express.Multer.File, postID: string) {
    const form = new FormData();
    form.append('file', file.buffer, { filename: file.originalname });
    form.append('postID', postID);
    console.log(form);
    axios.post(this.configService.get("APSARA_UPLOADER_VIDEO_V2"), form, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async createNewPostV5(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + '/api/posts/createpost';
    var reqbody = JSON.parse(JSON.stringify(body));
    // reqbody['postContent'] = file;

    //Create Response
    let CreatePostResponse_ = new CreatePostResponse();
    let Messages_ = new Messages();
    CreatePostResponse_.response_code = 204;

    //Generate postID
    const postID = await this.utilService.generateId();
    body.postID = postID;

    //Tag
    if (body.tags !== undefined && body.tags !== "") {
      if (!(Array.isArray(body.tags))) {
        const ArrayTags = []
        const tag_split = (body.tags).split(',');
        for (let tgs = 0; tgs < tag_split.length; tgs++) {
          let tag_data = tag_split[tgs].replace(/"/g, "");
          ArrayTags.push(tag_data);
          //Update Tag Count
          let ceckDataCount = await this.tagCountService.findOneById(tag_data);
          let tagCountDto_ = new TagCountDto();
          if (await this.utilService.ceckData(ceckDataCount)) {
            const UpdateCountData = {
              $inc: { total: 1 },
              $push: { listdata: { postID: postID } }
            }
            this.tagCountService.updateData(tag_data, UpdateCountData);
          } else {
            tagCountDto_._id = tag_data;
            tagCountDto_.total = 1;
            tagCountDto_.listdata = [{ "postID": postID }];
            this.tagCountService.create(tagCountDto_);
          }
        }
        body.tags = ArrayTags;
      }
    }

    //Get Email
    const email = JSON.parse(Buffer.from((headers['x-auth-token']).split('.')[1], 'base64').toString()).email;

    //Get userbasics
    const data_userbasics = await this.userService.findOne(email);
    if (!(await this.utilService.ceckData(data_userbasics))) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

      Messages_.info = ["Email unknown"];
      CreatePostResponse_.messages = Messages_;
      return CreatePostResponse_;
    }

    //Validasi isIdVerified
    if (body.certified && body.certified == "true") {
      if (data_userbasics.isIdVerified != true) {
        Messages_.info = ["The user ID has not been verified"];
        CreatePostResponse_.messages = Messages_;
        return CreatePostResponse_;
      }
    }

    const mime = file.mimetype;
    if (mime.startsWith('video')) {
      console.log('============================================== CREATE POST TYPE ' + body.postID + ' ==============================================', mime);
      return this.createNewPostVideoV5(file, body, data_userbasics, fullurl);
    } else {
      console.log('============================================== CREATE POST TYPE ' + body.postID + ' ==============================================', mime);
      return this.createNewPostPictV5(file, body, data_userbasics, fullurl);
    }
  }

  async createNewPostV4(file: Express.Multer.File, body: any, headers: any, url: string): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var reqbody = body;
    reqbody['postContent'] = file;

    this.logger.log('createNewPost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(url, timestamps_start, timestamps_end, body.email, null, null, reqbody);

      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        var timestamps_end = await this.utilService.getDateTimeString();
        this.logapiSS.create2(url, timestamps_start, timestamps_end, body.email, null, null, reqbody);

        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }

    var mime = file.mimetype;
    if (mime.startsWith('video')) {
      this.logger.log('createNewPost >>> is video');
      return this.createNewPostVideoV3(file, body, headers);
    } else {
      this.logger.log('createNewPost >>> is picture');
      return this.createNewPostPictV4(file, body, headers);
    }
  }

  async createNewPostV3(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }

    var mime = file.mimetype;
    if (mime.startsWith('video')) {
      this.logger.log('createNewPost >>> is video');
      return this.createNewPostVideoV3(file, body, headers);
    } else {
      this.logger.log('createNewPost >>> is picture');
      return this.createNewPostPictV3(file, body, headers);
    }
  }

  async createNewPostV2(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }

    var mime = file.mimetype;
    if (mime.startsWith('video')) {
      this.logger.log('createNewPost >>> is video');
      return this.createNewPostVideoV2(file, body, headers);
    } else {
      this.logger.log('createNewPost >>> is picture');
      return this.createNewPostPictV2(file, body, headers);
    }
  }

  async createNewPostV1(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }

    var mime = file.mimetype;
    if (mime.startsWith('video')) {
      this.logger.log('createNewPost >>> is video');
      return this.createNewPostVideoV1(file, body, headers);
    } else {
      this.logger.log('createNewPost >>> is picture');
      return this.createNewPostPictV1(file, body, headers);
    }
  }

  private async buildPost(body: any, headers: any, postId: any): Promise<Posts> {
    this.logger.log('buildPost >>> start');
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('buildPost >>> profile: ' + profile.email);

    let post = new Posts();
    post._id = postId;
    post.postID = post._id;
    post.postType = body.postType;
    post.active = true;
    post.email = auth.email;
    post.createdAt = await this.utilService.getDateTimeString();
    post.updatedAt = await this.utilService.getDateTimeString();
    let big = BigInt(this.utilService.generateAddExpirationFromToday(1));
    post.expiration = Long.fromBigInt(big);
    if (body.musicId != undefined) {
      post.musicId = mongoose.Types.ObjectId(body.musicId)
    }
    post._class = 'io.melody.hyppe.content.domain.ContentPost';

    if (body.description != undefined) {
      post.description = body.description;
    }

    if (body.tags != undefined) {
      var obj = body.tags;
      // var tgs = obj.split(",");
      post.tags = obj;
    }

    if (body.visibility != undefined) {
      post.visibility = body.visibility;
    } else {
      post.visibility = 'PUBLIC';
    }

    if (body.location != undefined) {
      post.location = body.location;
    }

    if (body.lat != undefined) {
      post.lat = body.lat;
    }

    if (body.lon != undefined) {
      post.lon = body.lon;
    }

    if (body.saleAmount != undefined) {
      post.saleAmount = body.saleAmount;
    } else {
      post.saleAmount = null;
    }

    if (body.saleLike != undefined) {
      post.saleLike = body.saleLike;
    } else {
      post.saleLike = false;
    }

    if (body.saleView != undefined) {
      post.saleView = body.saleView;
    } else {
      post.saleView = false;
    }

    if (body.allowComments != undefined) {
      post.allowComments = body.allowComments;
    } else {
      post.allowComments = true;
    }

    if (body.isSafe != undefined) {
      post.isSafe = body.isSafe;
    } else {
      post.isSafe = false;
    }

    if (body.isOwned != undefined) {
      post.isOwned = body.isOwned;
    } else {
      post.isOwned = false;
    }

    if (body.certified != undefined) {
      post.certified = <boolean>body.certified;
    } else {
      post.certified = false;
    }

    var usp = { "$ref": "userbasics", "$id": mongoose.Types.ObjectId(profile._id), "$db": "hyppe_trans_db" };
    post.userProfile = usp;

    if (body.cats != undefined && body.cats.length > 1) {
      var obj = body.cats;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        // var cat = await this.interestService.findByName(tmp);
        if (tmp != undefined) {
          var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(tmp), "$db": "hyppe_infra_db" };
          pcats.push(objintr);
        }
      }
      post.category = pcats;
    }
    // if (body.cats != undefined && body.cats.length > 1) {
    //   var obj = body.cats;
    //   var cats = obj;
    //   var pcats = [];
    //   for (var i = 0; i < cats.length; i++) {
    //     var tmp = cats[i];
    //     // var cat = await this.interestService.findByName(tmp);
    //     if (tmp != undefined) {
    //       var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(tmp), "$db": "hyppe_infra_db" };
    //       pcats.push(objintr);
    //     }
    //   }
    //   post.category = pcats;
    // }



    post.likes = Long.fromInt(0);
    post.views = Long.fromInt(0);
    post.shares = Long.fromInt(0);


    if (body.tagPeople != undefined && body.tagPeople.length > 1) {
      var obj = body.tagPeople;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp.username != undefined) {
            var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(postId);
            console.log(post.postType.toString());
            //this.utilService.sendFcmV2(tp.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", postId, post.postType.toString());
            pcats.push(objintr);
          }
        }
      }
      post.tagPeople = pcats;
    }

    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      var obj = body.tagDescription;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp != undefined || tp != null) {
            var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(postId);
            console.log(post.postType.toString());
            //this.utilService.sendFcmV2(tp.email.toString(), auth.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", postId, post.postType.toString())
            pcats.push(objintrx);
          }
        }
      }
      post.tagDescription = pcats;
    }

    post.active = false;

    //TODO Insight
    var ins = await this.insightService.findemail(auth.email);
    if (ins == undefined) {
      ins = new Insights();
      ins._id = await this.utilService.generateId();
      ins.insightID = ins._id;
      ins.active = true;
      ins.email = auth.email
      ins.createdAt = await this.utilService.getDateTimeString();
      ins.updatedAt = await this.utilService.getDateTimeString();
      ins._class = 'io.melody.hyppe.content.domain.Insight';

      if (post.postType != 'story') {
        ins.posts = new Long(1);
      }
    } else {

      if (post.postType != 'story') {
        //TODO BUG BUG BUG
        let prevPost = ins.posts;
        let nextPost = Number(prevPost) + 1;
        ins.posts = new Long(nextPost);
      }

    }
    this.insightService.create(ins);

    //TODO ContentEVent
    var ce = new Contentevents();
    ce._id = await this.utilService.generateId();
    ce.contentEventID = ce._id;
    ce.eventType = 'POST';
    ce.createdAt = await this.utilService.getDateTimeString();
    ce.updatedAt = await this.utilService.getDateTimeString();
    ce.active = true;
    ce.event = 'ACCEPT';
    ce.flowIsDone = true;
    ce.email = auth.email;
    ce.sequenceNumber = 0;
    ce._class = 'io.melody.hyppe.content.domain.ContentEvent';
    this.contentEventService.create(ce);
    // this.createUserscore(ce, auth.email);
    return post;
  }

  private async buildPost_(body: any, data_userbasics: Userbasic): Promise<Posts> {
    //Current Date
    const currentDate = await this.utilService.getDateTimeString();

    //Generate Expired
    const generateExpired = BigInt(this.utilService.generateAddExpirationFromToday(1));

    //Generate Post
    let Posts_ = new Posts();
    Posts_._id = body.postID;
    Posts_.postID = body.postID;
    Posts_.postType = body.postType;

    Posts_.active = true;
    Posts_.email = data_userbasics.email;
    Posts_.createdAt = currentDate;
    Posts_.updatedAt = currentDate;
    Posts_.saleAmount = body.saleAmount;
    Posts_.expiration = Long.fromBigInt(generateExpired);
    if (body.musicId != undefined) {
      Posts_.musicId = new mongoose.Types.ObjectId(body.musicId);
    }
    if (body.stiker != undefined) {
      Posts_.stiker = body.stiker;
    }
    if (body.description != undefined) {
      Posts_.description = body.description;
    }
    if (body.tags != undefined) {
      Posts_.tags = body.tags;
    }
    if (body.visibility != undefined) {
      Posts_.visibility = body.visibility;
    } else {
      Posts_.visibility = 'PUBLIC';
    }
    if (body.location != undefined) {
      Posts_.location = body.location;
    }
    if (body.lat != undefined) {
      Posts_.lat = body.lat;
    }
    if (body.lon != undefined) {
      Posts_.lon = body.lon;
    }
    if (body.saleAmount != undefined) {
      Posts_.saleAmount = body.saleAmount;
    } else {
      Posts_.saleAmount = null;
    }
    if (body.saleLike != undefined) {
      Posts_.saleLike = body.saleLike;
    } else {
      Posts_.saleLike = false;
    }
    if (body.saleView != undefined) {
      Posts_.saleView = body.saleView;
    } else {
      Posts_.saleView = false;
    }
    if (body.allowComments != undefined) {
      Posts_.allowComments = body.allowComments;
    } else {
      Posts_.allowComments = true;
    }
    if (body.isSafe != undefined) {
      Posts_.isSafe = body.isSafe;
    } else {
      Posts_.isSafe = false;
    }
    if (body.isOwned != undefined) {
      Posts_.isOwned = body.isOwned;
    } else {
      Posts_.isOwned = false;
    }
    if (body.certified != undefined) {
      Posts_.certified = <boolean>body.certified;
    } else {
      Posts_.certified = false;
    }
    Posts_._class = 'io.melody.hyppe.content.domain.ContentPost';
    const userIdObject = { "$ref": "userbasics", "$id": new mongoose.Types.ObjectId(data_userbasics._id.toString()), "$db": "hyppe_trans_db" };
    Posts_.userProfile = userIdObject;
    if (body.cats != undefined && body.cats.length > 1) {
      const catsSplit = (body.cats).split(",");
      let interests_array = [];
      for (var i = 0; i < catsSplit.length; i++) {
        interests_array.push({ "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(catsSplit[i]), "$db": "hyppe_infra_db" });
      }
      Posts_.category = interests_array;
    }
    Posts_.likes = Long.fromInt(0);
    Posts_.views = Long.fromInt(0);
    Posts_.shares = Long.fromInt(0);
    if (body.tagPeople != undefined && body.tagPeople.length > 1) {
      const tagPeopleSplit = (body.tagPeople).split(",");
      let tagPeople_array = [];
      for (var i = 0; i < tagPeopleSplit.length; i++) {
        let getUserauth = await this.userAuthService.findOneUsername(tagPeopleSplit[i].toString());
        if (await this.utilService.ceckData(getUserauth)) {
          tagPeople_array.push({ "$ref": "userauths", "$id": new mongoose.Types.ObjectId(getUserauth._id.toString()), "$db": "hyppe_trans_db" });
        }
      }
      Posts_.tagPeople = tagPeople_array;
    }
    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      const tagDescriptionSplit = (body.tagDescription).split(",");
      let tagDescription_array = [];
      for (var i = 0; i < tagDescriptionSplit.length; i++) {
        let getUserauth = await this.userAuthService.findOneUsername(tagDescriptionSplit[i].toString());
        if (await this.utilService.ceckData(getUserauth)) {
          tagDescription_array.push({ "$ref": "userauths", "$id": new mongoose.Types.ObjectId(getUserauth._id.toString()), "$db": "hyppe_trans_db" });
        }
      }
      Posts_.tagDescription = tagDescription_array;
    }
    Posts_.active = false;
    if (body.isShared == undefined) {
      Posts_.isShared = true;
    } else {
      Posts_.isShared = body.isShared;
    }

    //Update Insight
    let data_insight = await this.insightService.findemail(data_userbasics.email.toString());
    if (!(await this.utilService.ceckData(data_insight))) {
      data_insight = new Insights();
      data_insight._id = await this.utilService.generateId();
      data_insight.insightID = data_insight._id;
      data_insight.active = true;
      data_insight.email = data_userbasics.email.toString();
      data_insight.createdAt = currentDate;
      data_insight.updatedAt = currentDate;
      data_insight._class = 'io.melody.hyppe.content.domain.Insight';

      if (Posts_.postType != 'story') {
        data_insight.posts = new Long(1);
      }
    } else {
      if (Posts_.postType != 'story') {
        let prevPost = data_insight.posts;
        let nextPost = Number(prevPost) + 1;
        data_insight.posts = new Long(nextPost);
      }

    }
    this.insightService.create(data_insight);

    //Create Contentevents
    var Contentevents_ = new Contentevents();
    let _id_1= await this.utilService.generateId();
    Contentevents_._id = _id_1;
    Contentevents_.contentEventID = Contentevents_._id;
    Contentevents_.eventType = 'POST';
    Contentevents_.createdAt = currentDate;
    Contentevents_.updatedAt = currentDate;
    Contentevents_.active = true;
    Contentevents_.event = 'ACCEPT';
    Contentevents_.flowIsDone = true;
    Contentevents_.email = data_userbasics.email.toString();
    Contentevents_.sequenceNumber = 0;
    Contentevents_.postID = body.postID;
    Contentevents_._class = 'io.melody.hyppe.content.domain.ContentEvent';

    let uniq = null;
    uniq = await this.addUniqEvent(data_userbasics.email.toString(), "POST", "true", "ACCEPT", data_userbasics.email.toString(), body.postID,_id_1);
    Contentevents_.uniqEvent = uniq;
    this.contentEventService.create(Contentevents_);
    return Posts_;
  }

  private async createNewPostVideoV1(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPostVideo >>> start: ' + JSON.stringify(body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    var postID = await this.utilService.generateId();
    let post = await this.buildPost(body, headers, postID);

    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];

    let mediaId = "";
    if (postType == 'vid') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var med = new Mediavideos();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'video';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaVideo';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retd = await this.videoService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retd);

      var vids = { "$ref": "mediavideos", "$id": retd.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retd.mediaID);
    } else if (postType == 'advertise') {

    } else if (postType == 'story') {

      var mime = file.mimetype;
      if (mime.startsWith('video')) {
        var width_ = 0;
        var height_ = 0;
        if (body.width != undefined) {
          width_ = parseInt(body.width.toString());
        }
        if (body.height != undefined) {
          height_ = parseInt(body.height.toString());
        }
        let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
        post.metadata = metadata;
      }

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'video';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    } else if (postType == 'diary') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'diary', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var mer = new Mediadiaries();
      mer._id = await this.utilService.generateId();
      mer.mediaID = mer._id;
      mer.postID = post.postID;
      mer.active = false;
      mer.createdAt = await this.utilService.getDateTimeString();
      mer.updatedAt = await this.utilService.getDateTimeString();
      mer.mediaMime = file.mimetype;
      mer.mediaType = 'video';
      mer.originalName = file.originalname;
      mer.apsara = true;
      mer._class = 'io.melody.hyppe.content.domain.MediaDiary';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retr = await this.diaryService.create(mer);

      this.logger.log('createNewPostVideo >>> ' + retr);

      var diaries = { "$ref": "mediadiaries", "$id": retr.mediaID, "$db": "hyppe_content_db" };
      cm.push(diaries);

      mediaId = String(retr.mediaID);
    } else if (postType == 'pict') {

      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var medx = new Mediapicts();
      medx._id = await this.utilService.generateId();
      medx.mediaID = medx._id;
      medx.postID = post.postID;
      medx.active = false;
      medx.createdAt = await this.utilService.getDateTimeString();
      medx.updatedAt = await this.utilService.getDateTimeString();
      medx.mediaMime = file.mimetype;
      medx.mediaType = 'video';
      medx.originalName = file.originalname;
      medx.apsara = true;
      medx._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save music');
      var retdx = await this.picService.create(medx);

      this.logger.log('createNewPostVideo >>> ' + retdx);

      var vids = { "$ref": "mediapicts", "$id": retdx.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retdx.mediaID);
    }

    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    let fn = file.originalname;
    let ext = fn.split(".");
    let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + post._id + "." + ext[1];
    const ws = createWriteStream(nm);
    ws.write(file.buffer);
    ws.close();

    ws.on('finish', async () => {
      //Upload Seaweedfs
      const seaweedfs_path = '/' + post._id + '/' + postType + '/';
      this.logger.log('uploadSeaweedfs >>> ' + seaweedfs_path);
      try {
        var FormData_ = new FormData();
        FormData_.append(postType, fs.createReadStream(nm));
        const dataupload = await this.seaweedfsService.write(seaweedfs_path, FormData_);
        this.logger.log('uploadSeaweedfs >>> ' + dataupload);
      } catch (err) {
        this.logger.error('uploadSeaweedfs >>> Unabled to proceed ' + postType + ' failed upload seaweedfs, ' + err);
      }
      let payload = { 'file': '/localrepo' + seaweedfs_path + post._id + "." + ext[1], 'postId': apost._id };
      //let payload = { 'file': nm, 'postId': apost._id };
      axios.post(this.configService.get("APSARA_UPLOADER_VIDEO_V1"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
    });

    this.logger.log('createNewPostVideo >>> check certified. ' + post.certified);

    // if (post.certified) {
    //   this.generateCertificate(String(post.postID), 'id');
    // }


    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostVideoV2(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPostVideo >>> start: ' + JSON.stringify(body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    var postID = await this.utilService.generateId();
    let post = await this.buildPost(body, headers, postID);

    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];

    let mediaId = "";
    if (postType == 'vid') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var med = new Mediavideos();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'video';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaVideo';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retd = await this.videoService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retd);

      var vids = { "$ref": "mediavideos", "$id": retd.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retd.mediaID);
    } else if (postType == 'advertise') {

    } else if (postType == 'story') {

      var mime = file.mimetype;
      if (mime.startsWith('video')) {
        var width_ = 0;
        var height_ = 0;
        if (body.width != undefined) {
          width_ = parseInt(body.width.toString());
        }
        if (body.height != undefined) {
          height_ = parseInt(body.height.toString());
        }
        let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
        post.metadata = metadata;
      }

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'video';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    } else if (postType == 'diary') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'diary', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var mer = new Mediadiaries();
      mer._id = await this.utilService.generateId();
      mer.mediaID = mer._id;
      mer.postID = post.postID;
      mer.active = false;
      mer.createdAt = await this.utilService.getDateTimeString();
      mer.updatedAt = await this.utilService.getDateTimeString();
      mer.mediaMime = file.mimetype;
      mer.mediaType = 'video';
      mer.originalName = file.originalname;
      mer.apsara = true;
      mer._class = 'io.melody.hyppe.content.domain.MediaDiary';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retr = await this.diaryService.create(mer);

      this.logger.log('createNewPostVideo >>> ' + retr);

      var diaries = { "$ref": "mediadiaries", "$id": retr.mediaID, "$db": "hyppe_content_db" };
      cm.push(diaries);

      mediaId = String(retr.mediaID);
    } else if (postType == 'pict') {

      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var medx = new Mediapicts();
      medx._id = await this.utilService.generateId();
      medx.mediaID = medx._id;
      medx.postID = post.postID;
      medx.active = false;
      medx.createdAt = await this.utilService.getDateTimeString();
      medx.updatedAt = await this.utilService.getDateTimeString();
      medx.mediaMime = file.mimetype;
      medx.mediaType = 'video';
      medx.originalName = file.originalname;
      medx.apsara = true;
      medx._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save music');
      var retdx = await this.picService.create(medx);

      this.logger.log('createNewPostVideo >>> ' + retdx);

      var vids = { "$ref": "mediapicts", "$id": retdx.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retdx.mediaID);
    }

    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    const form = new FormData();
    form.append('file', file.buffer, { filename: file.originalname });
    form.append('postID', post._id);
    console.log(form);
    axios.post(this.configService.get("APSARA_UPLOADER_VIDEO_V2"), form, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostVideoV3(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPostVideo >>> start: ' + JSON.stringify(body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    var postID = await this.utilService.generateId();
    let post = await this.buildPost(body, headers, postID);

    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];

    let mediaId = "";
    if (postType == 'vid') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var med = new Mediavideos();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'video';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaVideo';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retd = await this.videoService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retd);

      var vids = { "$ref": "mediavideos", "$id": retd.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retd.mediaID);
    } else if (postType == 'advertise') {

    } else if (postType == 'story') {

      var mime = file.mimetype;
      if (mime.startsWith('video')) {
        var width_ = 0;
        var height_ = 0;
        if (body.width != undefined) {
          width_ = parseInt(body.width.toString());
        }
        if (body.height != undefined) {
          height_ = parseInt(body.height.toString());
        }
        let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
        post.metadata = metadata;
      }

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'video';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    } else if (postType == 'diary') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'diary', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var mer = new Mediadiaries();
      mer._id = await this.utilService.generateId();
      mer.mediaID = mer._id;
      mer.postID = post.postID;
      mer.active = false;
      mer.createdAt = await this.utilService.getDateTimeString();
      mer.updatedAt = await this.utilService.getDateTimeString();
      mer.mediaMime = file.mimetype;
      mer.mediaType = 'video';
      mer.originalName = file.originalname;
      mer.apsara = true;
      mer._class = 'io.melody.hyppe.content.domain.MediaDiary';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retr = await this.diaryService.create(mer);

      this.logger.log('createNewPostVideo >>> ' + retr);

      var diaries = { "$ref": "mediadiaries", "$id": retr.mediaID, "$db": "hyppe_content_db" };
      cm.push(diaries);

      mediaId = String(retr.mediaID);
    } else if (postType == 'pict') {

      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var medx = new Mediapicts();
      medx._id = await this.utilService.generateId();
      medx.mediaID = medx._id;
      medx.postID = post.postID;
      medx.active = false;
      medx.createdAt = await this.utilService.getDateTimeString();
      medx.updatedAt = await this.utilService.getDateTimeString();
      medx.mediaMime = file.mimetype;
      medx.mediaType = 'video';
      medx.originalName = file.originalname;
      medx.apsara = true;
      medx._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save music');
      var retdx = await this.picService.create(medx);

      this.logger.log('createNewPostVideo >>> ' + retdx);

      var vids = { "$ref": "mediapicts", "$id": retdx.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retdx.mediaID);
    }

    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    // const form = new FormData();
    // form.append('file', file.buffer, { filename: file.originalname });
    // form.append('postID', post._id);
    // console.log(form);
    // axios.post(this.configService.get("APSARA_UPLOADER_VIDEO_V2"), form, {
    //   maxContentLength: Infinity,
    //   maxBodyLength: Infinity,
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    console.log("POST REQUEST VIDEO", JSON.stringify(body));
    var postUpload = await this.uploadJavaV3(file, post._id.toString());
    console.log("POST RESPONSE JAVA", postUpload);
    if (postUpload.data.status) {
      postUpload.data.email = auth.email;
      await this.updateNewPostData3(postUpload.data);
    }

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    pd.stiker = apost.stiker;
    res.data = pd;

    return res;
  }

  private async createNewPostVideoV4(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPostVideo >>> start: ' + JSON.stringify(body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    var postID = await this.utilService.generateId();
    let post = await this.buildPost(body, headers, postID);

    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];

    let mediaId = "";
    if (postType == 'vid') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var med = new Mediavideos();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'video';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaVideo';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retd = await this.videoService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retd);

      var vids = { "$ref": "mediavideos", "$id": retd.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retd.mediaID);
    } else if (postType == 'advertise') {

    } else if (postType == 'story') {

      var mime = file.mimetype;
      if (mime.startsWith('video')) {
        var width_ = 0;
        var height_ = 0;
        if (body.width != undefined) {
          width_ = parseInt(body.width.toString());
        }
        if (body.height != undefined) {
          height_ = parseInt(body.height.toString());
        }
        let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
        post.metadata = metadata;
      }

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'video';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    } else if (postType == 'diary') {
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'diary', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      post.metadata = metadata;

      var mer = new Mediadiaries();
      mer._id = await this.utilService.generateId();
      mer.mediaID = mer._id;
      mer.postID = post.postID;
      mer.active = false;
      mer.createdAt = await this.utilService.getDateTimeString();
      mer.updatedAt = await this.utilService.getDateTimeString();
      mer.mediaMime = file.mimetype;
      mer.mediaType = 'video';
      mer.originalName = file.originalname;
      mer.apsara = true;
      mer._class = 'io.melody.hyppe.content.domain.MediaDiary';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retr = await this.diaryService.create(mer);

      this.logger.log('createNewPostVideo >>> ' + retr);

      var diaries = { "$ref": "mediadiaries", "$id": retr.mediaID, "$db": "hyppe_content_db" };
      cm.push(diaries);

      mediaId = String(retr.mediaID);
    } else if (postType == 'pict') {

      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var medx = new Mediapicts();
      medx._id = await this.utilService.generateId();
      medx.mediaID = medx._id;
      medx.postID = post.postID;
      medx.active = false;
      medx.createdAt = await this.utilService.getDateTimeString();
      medx.updatedAt = await this.utilService.getDateTimeString();
      medx.mediaMime = file.mimetype;
      medx.mediaType = 'video';
      medx.originalName = file.originalname;
      medx.apsara = true;
      medx._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save music');
      var retdx = await this.picService.create(medx);

      this.logger.log('createNewPostVideo >>> ' + retdx);

      var vids = { "$ref": "mediapicts", "$id": retdx.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retdx.mediaID);
    }

    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    // const form = new FormData();
    // form.append('file', file.buffer, { filename: file.originalname });
    // form.append('postID', post._id);
    // console.log(form);
    // axios.post(this.configService.get("APSARA_UPLOADER_VIDEO_V2"), form, {
    //   maxContentLength: Infinity,
    //   maxBodyLength: Infinity,
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    var postUpload = await this.uploadJavaV4(file, post._id.toString());
    if (postUpload.data.status) {
      postUpload.data.email = auth.email;
      await this.updateNewPostData4(postUpload.data);
    }

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostVideoV5(file: Express.Multer.File, body: any, data_userbasics: Userbasic, link: string): Promise<CreatePostResponse> {
    //Current Date
    const currentDate = await this.utilService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(body));
    // reqbody['postContent'] = file;
    var inputemail = data_userbasics.email;
    var setemail = inputemail.toString();

    //Build Post
    let Posts_: Posts = await this.buildPost_(body, data_userbasics);
    console.log('============================================== BUILD POST ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
    let contentMedias_ = [];
    if (Posts_.postType == 'vid') {
      //Set Metadata
      let width_ = 0;
      let height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'vid', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      Posts_.metadata = metadata;

      //Set Mediavideos
      let Mediavideos_ = new Mediavideos();
      Mediavideos_._id = await this.utilService.generateId();
      Mediavideos_.mediaID = Mediavideos_._id;
      Mediavideos_.postID = Posts_.postID;
      Mediavideos_.active = false;
      Mediavideos_.createdAt = currentDate;
      Mediavideos_.updatedAt = currentDate;
      Mediavideos_.mediaMime = file.mimetype;
      Mediavideos_.mediaType = 'video';
      Mediavideos_.originalName = file.originalname;
      Mediavideos_.apsara = true;
      Mediavideos_._class = 'io.melody.hyppe.content.domain.MediaVideo';
      this.videoService.create(Mediavideos_);

      //Set contentMedias
      const vids = { "$ref": "mediavideos", "$id": Mediavideos_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(vids);
    } else if (Posts_.postType == 'story') {
      //Set Metadata
      const mime = file.mimetype;
      if (mime.startsWith('video')) {
        let width_ = 0;
        let height_ = 0;
        if (body.width != undefined) {
          width_ = parseInt(body.width.toString());
        }
        if (body.height != undefined) {
          height_ = parseInt(body.height.toString());
        }
        let metadata = { postType: 'story', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
        Posts_.metadata = metadata;
      }

      //Set Mediastories
      let Mediastories_ = new Mediastories();
      Mediastories_._id = await this.utilService.generateId();
      Mediastories_.mediaID = Mediastories_._id;
      Mediastories_.postID = Posts_.postID;
      Mediastories_.active = false;
      Mediastories_.createdAt = currentDate;
      Mediastories_.updatedAt = currentDate;
      Mediastories_.mediaMime = file.mimetype;
      Mediastories_.mediaType = 'video';
      Mediastories_.originalName = file.originalname;
      Mediastories_.apsara = true;
      Mediastories_._class = 'io.melody.hyppe.content.domain.MediaStory';
      this.storyService.create(Mediastories_);

      //Set contentMedias
      const stories = { "$ref": "mediastories", "$id": Mediastories_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(stories);
    } else if (Posts_.postType == 'diary') {
      //Set Metadata
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'diary', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      Posts_.metadata = metadata;

      //Set Mediadiaries
      let Mediadiaries_ = new Mediadiaries();
      Mediadiaries_._id = await this.utilService.generateId();
      Mediadiaries_.mediaID = Mediadiaries_._id;
      Mediadiaries_.postID = Posts_.postID;
      Mediadiaries_.active = false;
      Mediadiaries_.createdAt = currentDate;
      Mediadiaries_.updatedAt = currentDate;
      Mediadiaries_.mediaMime = file.mimetype;
      Mediadiaries_.mediaType = 'video';
      Mediadiaries_.originalName = file.originalname;
      Mediadiaries_.apsara = true;
      Mediadiaries_._class = 'io.melody.hyppe.content.domain.MediaDiary';
      this.diaryService.create(Mediadiaries_);

      const diaries = { "$ref": "mediadiaries", "$id": Mediadiaries_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(diaries);
    } else if (Posts_.postType == 'pict') {
      //Set Metadata
      let metadata = { postType: 'vid', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      Posts_.metadata = metadata;

      //Set Mediapicts
      let Mediapicts_ = new Mediapicts();
      Mediapicts_._id = await this.utilService.generateId();
      Mediapicts_.mediaID = Mediapicts_._id;
      Mediapicts_.postID = Posts_.postID;
      Mediapicts_.active = false;
      Mediapicts_.createdAt = await this.utilService.getDateTimeString();
      Mediapicts_.updatedAt = await this.utilService.getDateTimeString();
      Mediapicts_.mediaMime = file.mimetype;
      Mediapicts_.mediaType = 'video';
      Mediapicts_.originalName = file.originalname;
      Mediapicts_.apsara = true;
      Mediapicts_._class = 'io.melody.hyppe.content.domain.MediaPict';
      this.picService.create(Mediapicts_);

      const pict = { "$ref": "mediapicts", "$id": Mediapicts_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(pict);
    }
    Posts_.contentMedias = contentMedias_;

    //Update Music
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    //Upload File
    const postUpload = await this.uploadJavaV3(file, Posts_._id.toString());
    console.log('============================================== STATUS UPLOAD POST ==============================================', JSON.stringify(postUpload.data));

    //Update Post
    if (postUpload.data.status) {
      postUpload.data.email = data_userbasics.email.toString();
      await this.updateNewPostData5(postUpload.data, Posts_);
    }

    //Create Response
    let dataPosts = await this.postService.findByPostId(Posts_._id.toString());
    var dataResponseGenerate = await this.genrateDataPost5(dataPosts, data_userbasics);
    let CreatePostResponse_ = new CreatePostResponse();
    let Messages_ = new Messages();

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(link, currentDate, timestamps_end, setemail, null, null, reqbody);

    Messages_.info = ["The process successful"];
    CreatePostResponse_.messages = Messages_;
    CreatePostResponse_.response_code = 202;
    CreatePostResponse_.data = dataResponseGenerate;
    console.log('============================================== CREATE POST END ==============================================', JSON.stringify(CreatePostResponse_));
    return CreatePostResponse_;
  }

  private async createNewPostVideoV6(file: Express.Multer.File, body: any, data_userbasics: Userbasic): Promise<CreatePostResponse> {
    //Current Date
    const currentDate = await this.utilService.getDateTimeString();

    //Build Post
    let Posts_: Posts = await this.buildPost_(body, data_userbasics);
    console.log('============================================== BUILD POST ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
    let contentMedias_ = [];
    let Mediavideos_ = new Mediavideos();
    let Mediastories_ = new Mediastories();
    let Mediadiaries_ = new Mediadiaries();
    let Mediapicts_ = new Mediapicts();
    if (Posts_.postType == 'vid') {
      //Set Metadata
      let width_ = 0;
      let height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'vid', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      Posts_.metadata = metadata;

      //Set Mediavideos
      Mediavideos_._id = await this.utilService.generateId();
      Mediavideos_.mediaID = Mediavideos_._id;
      Mediavideos_.postID = Posts_.postID;
      Mediavideos_.active = false;
      Mediavideos_.createdAt = currentDate;
      Mediavideos_.updatedAt = currentDate;
      Mediavideos_.mediaMime = file.mimetype;
      Mediavideos_.mediaType = 'video';
      Mediavideos_.originalName = file.originalname;
      Mediavideos_.apsara = true;
      Mediavideos_._class = 'io.melody.hyppe.content.domain.MediaVideo';

      //Set contentMedias
      const vids = { "$ref": "mediavideos", "$id": Mediavideos_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(vids);
    } else if (Posts_.postType == 'story') {
      //Set Metadata
      const mime = file.mimetype;
      if (mime.startsWith('video')) {
        let width_ = 0;
        let height_ = 0;
        if (body.width != undefined) {
          width_ = parseInt(body.width.toString());
        }
        if (body.height != undefined) {
          height_ = parseInt(body.height.toString());
        }
        let metadata = { postType: 'story', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
        Posts_.metadata = metadata;
      }

      //Set Mediastories
      Mediastories_._id = await this.utilService.generateId();
      Mediastories_.mediaID = Mediastories_._id;
      Mediastories_.postID = Posts_.postID;
      Mediastories_.active = false;
      Mediastories_.createdAt = currentDate;
      Mediastories_.updatedAt = currentDate;
      Mediastories_.mediaMime = file.mimetype;
      Mediastories_.mediaType = 'video';
      Mediastories_.originalName = file.originalname;
      Mediastories_.apsara = true;
      Mediastories_._class = 'io.melody.hyppe.content.domain.MediaStory';

      //Set contentMedias
      const stories = { "$ref": "mediastories", "$id": Mediastories_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(stories);
    } else if (Posts_.postType == 'diary') {
      //Set Metadata
      var width_ = 0;
      var height_ = 0;
      if (body.width != undefined) {
        width_ = parseInt(body.width.toString());
      }
      if (body.height != undefined) {
        height_ = parseInt(body.height.toString());
      }
      let metadata = { postType: 'diary', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: width_, height: height_ };
      Posts_.metadata = metadata;

      //Set Mediadiaries
      Mediadiaries_._id = await this.utilService.generateId();
      Mediadiaries_.mediaID = Mediadiaries_._id;
      Mediadiaries_.postID = Posts_.postID;
      Mediadiaries_.active = false;
      Mediadiaries_.createdAt = currentDate;
      Mediadiaries_.updatedAt = currentDate;
      Mediadiaries_.mediaMime = file.mimetype;
      Mediadiaries_.mediaType = 'video';
      Mediadiaries_.originalName = file.originalname;
      Mediadiaries_.apsara = true;
      Mediadiaries_._class = 'io.melody.hyppe.content.domain.MediaDiary';

      const diaries = { "$ref": "mediadiaries", "$id": Mediadiaries_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(diaries);
    } else if (Posts_.postType == 'pict') {
      //Set Metadata
      let metadata = { postType: 'vid', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      Posts_.metadata = metadata;

      //Set Mediapicts
      Mediapicts_._id = await this.utilService.generateId();
      Mediapicts_.mediaID = Mediapicts_._id;
      Mediapicts_.postID = Posts_.postID;
      Mediapicts_.active = false;
      Mediapicts_.createdAt = await this.utilService.getDateTimeString();
      Mediapicts_.updatedAt = await this.utilService.getDateTimeString();
      Mediapicts_.mediaMime = file.mimetype;
      Mediapicts_.mediaType = 'video';
      Mediapicts_.originalName = file.originalname;
      Mediapicts_.apsara = true;
      Mediapicts_._class = 'io.melody.hyppe.content.domain.MediaPict';

      const pict = { "$ref": "mediapicts", "$id": Mediapicts_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(pict);
    }
    Posts_.contentMedias = contentMedias_;

    //Update Music
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    //Upload File
    const postUpload = await this.uploadJavaV3(file, Posts_._id.toString());
    console.log('============================================== STATUS UPLOAD POST ==============================================', JSON.stringify(postUpload.data));

    //Update Post
    if (postUpload.data.status) {
      postUpload.data.email = data_userbasics.email.toString();
      Posts_ = await this.updateNewPostData6(postUpload.data, Posts_, Mediavideos_, Mediastories_, Mediadiaries_, Mediapicts_);
    }

    //Create Response
    var dataResponseGenerate = await this.genrateDataPost6(Posts_, data_userbasics, Mediavideos_, Mediastories_, Mediadiaries_, Mediapicts_);
    let CreatePostResponse_ = new CreatePostResponse();
    let Messages_ = new Messages();
    Messages_.info = ["The process successful"];
    CreatePostResponse_.messages = Messages_;
    CreatePostResponse_.response_code = 202;
    CreatePostResponse_.data = dataResponseGenerate;
    console.log('============================================== CREATE POST END ==============================================', JSON.stringify(CreatePostResponse_));
    return CreatePostResponse_;
  }

  async uploadJavaV3_buffer(file: any, postId: string, originalname: string): Promise<any> {
    var Url = this.configService.get("APSARA_UPLOADER_VIDEO_V3");
    return new Promise(async function (resolve, reject) {
      const form = new FormData();
      form.append('file', file, { filename: originalname });
      form.append('postID', postId);
      console.log(form);

      await axios.post(Url, form, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(response => {
        console.log("postUpload", response.data);
        return resolve(response);
      }).catch(err => {
        console.error(err);
        return reject(err);
      });
    });
  }

  async uploadJavaV3(file: any, postId: string): Promise<any> {
    var Url = this.configService.get("APSARA_UPLOADER_VIDEO_V3");
    return new Promise(async function (resolve, reject) {
      const form = new FormData();
      form.append('file', file.buffer, { filename: file.originalname });
      form.append('postID', postId);

      await axios.post(Url, form, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(response => {
        return resolve(response);
      }).catch(err => {
        console.error(err);
        return reject(err);
      });
    });
  }

  async updateNewPostData3(body: any) {
    this.logger.log('updateNewPost >>> start', body);
    let post = await this.postService.findid(body.postID);
    if (post == undefined) {
      return;
    }
    var profile = await this.userService.findOne(String(post.email));

    let cm = post.contentMedias[0];
    let ns = cm.namespace;
    this.logger.log('updateNewPost >>> namespace: ' + ns);
    if (ns == 'mediavideos') {
      let vid = await this.videoService.findOne(cm.oid);
      if (vid == undefined) {
        return;
      }

      vid.apsaraId = body.videoId;
      vid.active = true;
      this.videoService.create(vid);

      let todel = body.originalName + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod video');
      let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
      if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
        let aim = aimg.PlayUrl;
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
        //TODO 
        this.cmodService.cmodVideo(body.postID, aim);
      }

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: body.width, height: body.height };
      post.metadata = metadata;
      post.active = true;
      //TODO 
      await this.postService.create(post);
    } else if (ns == 'mediapicts') {
      this.logger.log('updateNewPost >>> checking picture oid: ' + cm.oid);
      let pic = await this.picService.findOne(cm.oid);
      if (pic == undefined) {
        this.logger.error('updateNewPost >>> checking picture oid: ' + cm.oid + " error");
        return;
      }

      pic.apsaraId = body.videoId;
      pic.apsaraThumbId = body.thId;
      pic.active = true;
      //TODO 
      this.picService.create(pic);

      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod image');
      let aimg = await this.getImageApsara(ids);
      if (aimg != undefined && aimg.ImageInfo != undefined && aimg.ImageInfo.length > 0) {
        let aim = aimg.ImageInfo[0];
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim.URL);
        this.cmodService.cmodImage(body.postID, aim.URL);
      }

    } else if (ns == 'mediastories') {
      let st = await this.storyService.findOne(cm.oid);
      if (st == undefined) {
        return;
      }

      st.apsaraId = body.videoId;
      st.active = true;
      //TODO 
      this.storyService.create(st);

      post.active = true;

      this.logger.log('updateNewPost >>> mediatype: ' + st.mediaType);
      if (st.mediaType == 'video') {
        let meta = post.metadata;
        let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
        post.metadata = metadata;
      }

      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.originalName + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      if (st.mediaType == 'video') {
        this.logger.log('updateNewPost >>> checking cmod');
        let ids: string[] = [];
        ids.push(body.videoId);
        this.logger.log('updateNewPost >>> checking cmod video');
        let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
        if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
          let aim = aimg.PlayUrl;
          this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
          //TODO 
          this.cmodService.cmodVideo(body.postID, aim);
        }
      } else {
        this.logger.log('updateNewPost >>> checking cmod');
        let ids: string[] = [];
        ids.push(body.videoId);
        this.logger.log('updateNewPost >>> checking cmod image');
        let aimg = await this.getImageApsara(ids);
        if (aimg != undefined && aimg.ImageInfo != undefined && aimg.ImageInfo.length > 0) {
          let aim = aimg.ImageInfo[0];
          this.logger.log('updateNewPost >>> checking cmod image img: ' + aim.URL);
          //TODO 
          this.cmodService.cmodImage(body.postID, aim.URL);
        }
      }
    } else if (ns == 'mediadiaries') {
      let dy = await this.diaryService.findOne(cm.oid);
      if (dy == undefined) {
        return;
      }

      dy.apsaraId = body.videoId;
      dy.active = true;
      //TODO 
      this.diaryService.create(dy);

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      post.metadata = metadata;
      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.originalName + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod video');
      let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
      if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
        let aim = aimg.PlayUrl;
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
        //TODO 
        this.cmodService.cmodVideo(body.postID, aim);
      }
    }

    var lang = await this.utilService.getUserlanguages(post.email.toString());
    if (post.certified) {
      this.generateCertificate(String(body.postID), lang.toString());
    }

    let myus = await this.userAuthService.findOneByEmail(post.email);

    let tag = post.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then((as) => {
          let em = String(myus.username);
          let bodyi = em + ' Menandai kamu di ';
          let bodye = em + ' Tagged you in ';
          if (post.postType == 'pict') {
            bodyi = bodyi + ' HyppePic';
            bodye = bodye + ' HyppePic';
          } else if (post.postType == 'vid') {
            bodyi = bodyi + ' HyppeVideo';
            bodye = bodye + ' HyppeVideo';
          } else if (post.postType == 'diary') {
            bodyi = bodyi + ' HyppeDiary';
            bodye = bodye + ' HyppeDiary';
          } else if (post.postType == 'story') {
            bodyi = bodyi + ' HyppeStory';
            bodye = bodye + ' HyppeStory';
          }
          this.utilService.sendFcmV2(as.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), post.postType.toString())
          //this.utilService.sendFcm(String(as.email), 'Disebut', 'Mentioned', bodyi, bodye, 'REACTION', 'ACCEPT', String(post.postID), String(post.postType));
        });
      });
    }

    let tagd = post.tagDescription;
    if (tagd != undefined && tagd.length > 0) {
      tagd.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then((as) => {
          let em = String(myus.username);
          let bodyi = em + ' Menandai kamu di ';
          let bodye = em + ' Tagged you in ';
          if (post.postType == 'pict') {
            bodyi = bodyi + ' HyppePic';
            bodye = bodye + ' HyppePic';
          } else if (post.postType == 'vid') {
            bodyi = bodyi + ' HyppeVideo';
            bodye = bodye + ' HyppeVideo';
          } else if (post.postType == 'diary') {
            bodyi = bodyi + ' HyppeDiary';
            bodye = bodye + ' HyppeDiary';
          } else if (post.postType == 'story') {
            bodyi = bodyi + ' HyppeStory';
            bodye = bodye + ' HyppeStory';
          }
          this.utilService.sendFcmV2(as.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), post.postType.toString())
          //this.utilService.sendFcm(String(as.email), 'Disebut', 'Mentioned', bodyi, bodye, 'REACTION', 'ACCEPT', null, null);
        });
      });
    }

    let playlist = new CreateUserplaylistDto();
    playlist.userPostId = Object(profile._id);
    playlist.postType = post.postType;
    playlist.mediaId = Object(cm.oid);
    this.logger.log('createNewPostVideo >>> generate playlist ' + JSON.stringify(playlist));
    //this.postService.generateUserPlaylist(playlist);
  }

  async updateNewPostData5(body: any, Posts_: Posts) {
    let contentMedias_ = Posts_.contentMedias[0];
    let namespace_ = contentMedias_.$ref.toString();
    if (namespace_ == 'mediavideos') {
      //Update Post mediavideos
      let vid = await this.videoService.findOne(contentMedias_.$id.toString());
      if (!(await this.utilService.ceckData(vid))) {
        return;
      }
      vid.apsaraId = body.videoId;
      vid.active = true;
      this.videoService.create(vid);

      //Get Video Apsara
      let getApsara = await this.getVideoApsaraSingleNoDefinition(body.videoId);
      if (getApsara != undefined && getApsara.PlayUrl != undefined && getApsara.PlayUrl.length > 0) {
        let aim = getApsara.PlayUrl;
        //Post Ceck Moderation 
        this.cmodService.cmodVideo(body.postID, aim);
      }

      //Update Post 
      let meta = Posts_.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: Posts_._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: body.width, height: body.height };
      Posts_.metadata = metadata;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIAVIDEOS ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);
    } else if (namespace_ == 'mediapicts') {
      //Update Post mediapicts
      let pict = await this.picService.findOne(contentMedias_.$id.toString());
      if (!(await this.utilService.ceckData(pict))) {
        return;
      }
      pict.apsaraId = body.videoId;
      pict.apsaraThumbId = body.thId;
      pict.active = true;
      this.picService.create(pict);

      //Get Pict Apsara
      let videoIdArray: string[] = [];
      videoIdArray.push(body.videoId);
      let getApsara = await this.getImageApsara(videoIdArray);
      if (getApsara != undefined && getApsara.ImageInfo != undefined && getApsara.ImageInfo.length > 0) {
        let aim = getApsara.ImageInfo[0];
        //Post Ceck Moderation
        this.cmodService.cmodImage(body.postID, aim.URL);
      }

      //Update Post
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIAPICTS ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);
    } else if (namespace_ == 'mediastories') {
      //Update Post mediastories
      let story = await this.storyService.findOne(contentMedias_.$id.toString());
      if (!(await this.utilService.ceckData(story))) {
        return;
      }
      story.apsaraId = body.videoId;
      story.active = true;
      this.storyService.create(story);

      //Update Post 
      if (story.mediaType == 'video') {
        let meta = Posts_.metadata;
        let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: Posts_._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
        Posts_.metadata = metadata;
      }
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIASTORIES ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);

      if (story.mediaType == 'video') {
        //Get Video Apsara
        let getApsara = await this.getVideoApsaraSingleNoDefinition(body.videoId);
        if (getApsara != undefined && getApsara.PlayUrl != undefined && getApsara.PlayUrl.length > 0) {
          let aim = getApsara.PlayUrl;
          //Post Ceck Moderation
          this.cmodService.cmodVideo(body.postID, aim);
        }
      } else {
        //Get Video Apsara
        let videoIdArray: string[] = [];
        videoIdArray.push(body.videoId);
        let getApsara = await this.getImageApsara(videoIdArray);
        if (getApsara != undefined && getApsara.ImageInfo != undefined && getApsara.ImageInfo.length > 0) {
          let aim = getApsara.ImageInfo[0];
          //Post Ceck Moderation
          this.cmodService.cmodImage(body.postID, aim.URL);
        }
      }
    } else if (namespace_ == 'mediadiaries') {
      //Update Post mediadiaries
      let diaries = await this.diaryService.findOne(contentMedias_.$id.toString());
      if (!(await this.utilService.ceckData(diaries))) {
        return;
      }
      diaries.apsaraId = body.videoId;
      diaries.active = true;
      this.diaryService.create(diaries);

      //Update Post 
      let meta = Posts_.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: Posts_._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      Posts_.metadata = metadata;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIADIARIES ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);

      //Get Video Apsara
      let getApsara = await this.getVideoApsaraSingleNoDefinition(body.videoId);
      if (getApsara != undefined && getApsara.PlayUrl != undefined && getApsara.PlayUrl.length > 0) {
        let aim = getApsara.PlayUrl;
        //Post Ceck Moderation
        this.cmodService.cmodVideo(body.postID, aim);
      }
    }

    //Get lang User
    const lang = await this.utilService.getUserlanguages(Posts_.email.toString());

    //Generate Certified
    if (Posts_.certified) {
      this.generateCertificate(String(body.postID), lang.toString());
    }

    //Sale amount send notice
    if (Posts_.saleAmount > 0) {
      console.log("SALE AMOUNT", Posts_.saleAmount);
      this.utilService.sendFcmV2(Posts_.email.toString(), Posts_.email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), Posts_.postType.toString())
      //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
    }


    //Send FCM Tag
    let tag = Posts_.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.$id.toString();
        this.userAuthService.findById(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString());
          }
        });
      });
    }

    //Send FCM Tag Description
    let tagdescription = Posts_.tagDescription;
    if (tagdescription != undefined && tagdescription.length > 0) {
      tagdescription.forEach(el => {
        let oid = el.$id.toString();
        this.userAuthService.findById(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString())
          }
        });
      });
    }
  }

  async updateNewPostData6(body: any, Posts_: Posts, Mediavideos_: Mediavideos, Mediastories_: Mediastories, Mediadiaries_: Mediadiaries, Mediapicts_: Mediapicts) {
    let contentMedias_ = Posts_.contentMedias[0];
    let namespace_ = contentMedias_.$ref.toString();
    if (namespace_ == 'mediavideos') {
      //Update Post mediavideos
      let vid = Mediavideos_;
      if (!(await this.utilService.ceckData(vid))) {
        return;
      }
      vid.apsaraId = body.videoId;
      vid.active = true;
      this.videoService.create(vid);

      //Get Video Apsara
      let getApsara = await this.getVideoApsaraSingleNoDefinition(body.videoId);
      if (getApsara != undefined && getApsara.PlayUrl != undefined && getApsara.PlayUrl.length > 0) {
        let aim = getApsara.PlayUrl;
        //Post Ceck Moderation 
        this.cmodService.cmodVideo(body.postID, aim);
      }

      //Update Post 
      let meta = Posts_.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: Posts_._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: body.width, height: body.height };
      Posts_.metadata = metadata;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIAVIDEOS ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);
    } else if (namespace_ == 'mediapicts') {
      //Update Post mediapicts
      let pict = Mediapicts_;
      if (!(await this.utilService.ceckData(pict))) {
        return;
      }
      pict.apsaraId = body.videoId;
      pict.apsaraThumbId = body.thId;
      pict.active = true;
      this.picService.create(pict);

      //Get Pict Apsara
      let videoIdArray: string[] = [];
      videoIdArray.push(body.videoId);
      let getApsara = await this.getImageApsara(videoIdArray);
      if (getApsara != undefined && getApsara.ImageInfo != undefined && getApsara.ImageInfo.length > 0) {
        let aim = getApsara.ImageInfo[0];
        //Post Ceck Moderation
        this.cmodService.cmodImage(body.postID, aim.URL);
      }

      //Update Post
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIAPICTS ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);
    } else if (namespace_ == 'mediastories') {
      //Update Post mediastories
      let story = Mediastories_;
      if (!(await this.utilService.ceckData(story))) {
        return;
      }
      story.apsaraId = body.videoId;
      story.active = true;
      this.storyService.create(story);

      //Update Post 
      if (story.mediaType == 'video') {
        let meta = Posts_.metadata;
        let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: Posts_._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
        Posts_.metadata = metadata;
      }
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIASTORIES ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);

      if (story.mediaType == 'video') {
        //Get Video Apsara
        let getApsara = await this.getVideoApsaraSingleNoDefinition(body.videoId);
        if (getApsara != undefined && getApsara.PlayUrl != undefined && getApsara.PlayUrl.length > 0) {
          let aim = getApsara.PlayUrl;
          //Post Ceck Moderation
          this.cmodService.cmodVideo(body.postID, aim);
        }
      } else {
        //Get Video Apsara
        let videoIdArray: string[] = [];
        videoIdArray.push(body.videoId);
        let getApsara = await this.getImageApsara(videoIdArray);
        if (getApsara != undefined && getApsara.ImageInfo != undefined && getApsara.ImageInfo.length > 0) {
          let aim = getApsara.ImageInfo[0];
          //Post Ceck Moderation
          this.cmodService.cmodImage(body.postID, aim.URL);
        }
      }
    } else if (namespace_ == 'mediadiaries') {
      //Update Post mediadiaries
      let diaries = Mediadiaries_;
      if (!(await this.utilService.ceckData(diaries))) {
        return;
      }
      diaries.apsaraId = body.videoId;
      diaries.active = true;
      this.diaryService.create(diaries);

      //Update Post 
      let meta = Posts_.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: Posts_._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      Posts_.metadata = metadata;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIADIARIES ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.postService.create(Posts_);

      //Get Video Apsara
      let getApsara = await this.getVideoApsaraSingleNoDefinition(body.videoId);
      if (getApsara != undefined && getApsara.PlayUrl != undefined && getApsara.PlayUrl.length > 0) {
        let aim = getApsara.PlayUrl;
        //Post Ceck Moderation
        this.cmodService.cmodVideo(body.postID, aim);
      }
    }

    //Get lang User
    const lang = await this.utilService.getUserlanguages(Posts_.email.toString());

    //Generate Certified
    if (Posts_.certified) {
      this.generateCertificate(String(body.postID), lang.toString());
    }

    //Send FCM Tag
    let tag = Posts_.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString());
          }
        });
      });
    }

    //Send FCM Tag Description
    let tagdescription = Posts_.tagDescription;
    if (tagdescription != undefined && tagdescription.length > 0) {
      tagdescription.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString())
          }
        });
      });
    }
    return Posts_;
  }

  async uploadJavaV4(file: any, postId: string): Promise<any> {
    var Url = this.configService.get("APSARA_UPLOADER_VIDEO_V4");
    return new Promise(async function (resolve, reject) {
      const form = new FormData();
      form.append('file', file.buffer, { filename: file.originalname });
      form.append('postID', postId);
      console.log(form);

      await axios.post(Url, form, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(response => {
        console.log("postUpload", response.data);
        return resolve(response);
      }).catch(err => {
        console.error(err);
        return reject(err);
      });
    });
  }

  async updateNewPostData4(body: any) {
    this.logger.log('updateNewPost >>> start');
    let post = await this.postService.findid(body.postID);
    if (post == undefined) {
      return;
    }
    var profile = await this.userService.findOne(String(post.email));

    let cm = post.contentMedias[0];
    let ns = cm.namespace;
    this.logger.log('updateNewPost >>> namespace: ' + ns);
    if (ns == 'mediavideos') {
      let vid = await this.videoService.findOne(cm.oid);
      if (vid == undefined) {
        return;
      }

      vid.apsaraId = body.videoId;
      vid.active = true;
      this.videoService.create(vid);

      let todel = body.originalName + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod video');
      let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
      if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
        let aim = aimg.PlayUrl;
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
        //TODO 
        this.cmodService.cmodVideo(body.postID, aim);
      }

      // let meta = post.metadata;
      // let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      // post.metadata = metadata;
      post.active = true;
      //TODO 
      await this.postService.create(post);
    } else if (ns == 'mediapicts') {
      this.logger.log('updateNewPost >>> checking picture oid: ' + cm.oid);
      let pic = await this.picService.findOne(cm.oid);
      if (pic == undefined) {
        this.logger.error('updateNewPost >>> checking picture oid: ' + cm.oid + " error");
        return;
      }

      pic.apsaraId = body.videoId;
      pic.apsaraThumbId = body.thId;
      pic.active = true;
      //TODO 
      this.picService.create(pic);

      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod image');
      let aimg = await this.getImageApsara(ids);
      if (aimg != undefined && aimg.ImageInfo != undefined && aimg.ImageInfo.length > 0) {
        let aim = aimg.ImageInfo[0];
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim.URL);
        this.cmodService.cmodImage(body.postID, aim.URL);
      }

    } else if (ns == 'mediastories') {
      let st = await this.storyService.findOne(cm.oid);
      if (st == undefined) {
        return;
      }

      st.apsaraId = body.videoId;
      st.active = true;
      //TODO 
      this.storyService.create(st);

      post.active = true;

      this.logger.log('updateNewPost >>> mediatype: ' + st.mediaType);
      // if (st.mediaType == 'video') {
      //   let meta = post.metadata;
      //   let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      //   post.metadata = metadata;
      // }

      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.originalName + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      if (st.mediaType == 'video') {
        this.logger.log('updateNewPost >>> checking cmod');
        let ids: string[] = [];
        ids.push(body.videoId);
        this.logger.log('updateNewPost >>> checking cmod video');
        let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
        if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
          let aim = aimg.PlayUrl;
          this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
          //TODO 
          this.cmodService.cmodVideo(body.postID, aim);
        }
      } else {
        this.logger.log('updateNewPost >>> checking cmod');
        let ids: string[] = [];
        ids.push(body.videoId);
        this.logger.log('updateNewPost >>> checking cmod image');
        let aimg = await this.getImageApsara(ids);
        if (aimg != undefined && aimg.ImageInfo != undefined && aimg.ImageInfo.length > 0) {
          let aim = aimg.ImageInfo[0];
          this.logger.log('updateNewPost >>> checking cmod image img: ' + aim.URL);
          //TODO 
          this.cmodService.cmodImage(body.postID, aim.URL);
        }
      }
    } else if (ns == 'mediadiaries') {
      let dy = await this.diaryService.findOne(cm.oid);
      if (dy == undefined) {
        return;
      }

      dy.apsaraId = body.videoId;
      dy.active = true;
      //TODO 
      this.diaryService.create(dy);

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      post.metadata = metadata;
      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.originalName + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod video');
      let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
      if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
        let aim = aimg.PlayUrl;
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
        //TODO 
        this.cmodService.cmodVideo(body.postID, aim);
      }
    }

    var lang = await this.utilService.getUserlanguages(post.email.toString());
    if (post.certified) {
      this.generateCertificate(String(body.postID), lang.toString());
    }

    let myus = await this.userAuthService.findOneByEmail(post.email);

    let tag = post.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then((as) => {
          let em = String(myus.username);
          let bodyi = em + ' Menandai kamu di ';
          let bodye = em + ' Tagged you in ';
          if (post.postType == 'pict') {
            bodyi = bodyi + ' HyppePic';
            bodye = bodye + ' HyppePic';
          } else if (post.postType == 'vid') {
            bodyi = bodyi + ' HyppeVideo';
            bodye = bodye + ' HyppeVideo';
          } else if (post.postType == 'diary') {
            bodyi = bodyi + ' HyppeDiary';
            bodye = bodye + ' HyppeDiary';
          } else if (post.postType == 'story') {
            bodyi = bodyi + ' HyppeStory';
            bodye = bodye + ' HyppeStory';
          }
          this.utilService.sendFcmV2(as.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), post.postType.toString())
          //this.utilService.sendFcm(String(as.email), 'Disebut', 'Mentioned', bodyi, bodye, 'REACTION', 'ACCEPT', String(post.postID), String(post.postType));
        });
      });
    }

    let tagd = post.tagDescription;
    if (tagd != undefined && tagd.length > 0) {
      tagd.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then((as) => {
          let em = String(myus.username);
          let bodyi = em + ' Menandai kamu di ';
          let bodye = em + ' Tagged you in ';
          if (post.postType == 'pict') {
            bodyi = bodyi + ' HyppePic';
            bodye = bodye + ' HyppePic';
          } else if (post.postType == 'vid') {
            bodyi = bodyi + ' HyppeVideo';
            bodye = bodye + ' HyppeVideo';
          } else if (post.postType == 'diary') {
            bodyi = bodyi + ' HyppeDiary';
            bodye = bodye + ' HyppeDiary';
          } else if (post.postType == 'story') {
            bodyi = bodyi + ' HyppeStory';
            bodye = bodye + ' HyppeStory';
          }
          this.utilService.sendFcmV2(as.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), post.postType.toString())
          //this.utilService.sendFcm(String(as.email), 'Disebut', 'Mentioned', bodyi, bodye, 'REACTION', 'ACCEPT', null, null);
        });
      });
    }

    let playlist = new CreateUserplaylistDto();
    playlist.userPostId = Object(profile._id);
    playlist.postType = post.postType;
    playlist.mediaId = Object(cm.oid);
    this.logger.log('createNewPostVideo >>> generate playlist ' + JSON.stringify(playlist));
    //this.postService.generateUserPlaylist(playlist);
  }

  private async createNewPostPictV1(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    var postID = await this.utilService.generateId();
    let post = await this.buildPost(body, headers, postID);
    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];
    let mediaId = "";

    if (postType == 'pict') {
      var med = new Mediapicts();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'image';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retm = await this.picService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retm);

      var vids = { "$ref": "mediapicts", "$id": retm.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retm.mediaID);
    } else if (postType == 'story') {
      let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'image';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    }
    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);

    let fn = file.originalname;
    let ext = fn.split(".");
    let nm = this.configService.get("APSARA_UPLOADER_PICTURE_V1") + post._id + "." + ext[1];
    const ws = createWriteStream(nm);
    ws.write(file.buffer);
    ws.close();

    ws.on('finish', async () => {
      //Upload Seaweedfs
      const seaweedfs_path = '/' + post._id + '/' + postType + '/';
      this.logger.log('uploadSeaweedfs >>> ' + seaweedfs_path);
      try {
        var FormData_ = new FormData();
        FormData_.append(postType, fs.createReadStream(nm));
        const dataupload = await this.seaweedfsService.write(seaweedfs_path, FormData_);
        this.logger.log('uploadSeaweedfs >>> ' + dataupload);
      } catch (err) {
        this.logger.error('uploadSeaweedfs >>> Unabled to proceed ' + postType + ' failed upload seaweedfs, ' + err);
      }
      let payload = { 'file': '/localrepo' + seaweedfs_path + post._id + "." + ext[1], 'postId': apost._id };
      //let payload = { 'file': nm, 'postId': apost._id };
      axios.post(this.configService.get("APSARA_UPLOADER_PICTURE_V2"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });

    });
    /*
    let playlist = new CreateUserplaylistDto();
    playlist.userPostId = Object(profile._id);
    playlist.postType = post.postType;
    playlist.mediaId = Object(mediaId);
    this.logger.log('createNewPostPic >>> generate playlist ' + JSON.stringify(playlist));
    this.postService.generateUserPlaylist(playlist);
    */
    this.logger.log('createNewPostPict >>> check certified. ' + JSON.stringify(post));
    if (post.certified) {
      this.generateCertificate(String(post.postID), 'id');
    } else {
      this.logger.error('createNewPostPict >>> post is not certified');
    }

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostPictV2(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    var postID = await this.utilService.generateId();
    let post = await this.buildPost(body, headers, postID);
    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];
    let mediaId = "";

    if (postType == 'pict') {
      var med = new Mediapicts();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'image';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retm = await this.picService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retm);

      var vids = { "$ref": "mediapicts", "$id": retm.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retm.mediaID);
    } else if (postType == 'story') {
      let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'image';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    }
    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);

    const form = new FormData();
    form.append('file', file.buffer, { filename: file.originalname });
    form.append('postID', post._id);
    console.log(form);
    axios.post(this.configService.get("APSARA_UPLOADER_PICTURE_V2"), form, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // let fn = file.originalname;
    // let ext = fn.split(".");
    // let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + post._id + "." + ext[1];
    // const ws = createWriteStream(nm);
    // ws.write(file.buffer);
    // ws.close();

    // ws.on('finish', async () => {
    //   //Upload Seaweedfs
    //   const seaweedfs_path = '/' + post._id + '/' + postType + '/';
    //   this.logger.log('uploadSeaweedfs >>> ' + seaweedfs_path);
    //   try {
    //     var FormData_ = new FormData();
    //     FormData_.append(postType, fs.createReadStream(nm));
    //     const dataupload = await this.seaweedfsService.write(seaweedfs_path, FormData_);
    //     this.logger.log('uploadSeaweedfs >>> ' + dataupload);
    //   } catch (err) {
    //     this.logger.error('uploadSeaweedfs >>> Unabled to proceed ' + postType + ' failed upload seaweedfs, ' + err);
    //   }
    //   let payload = { 'file': '/localrepo' + seaweedfs_path + post._id + "." + ext[1], 'postId': apost._id };
    //   //let payload = { 'file': nm, 'postId': apost._id };
    //   axios.post(this.configService.get("APSARA_UPLOADER_PICTURE"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });

    // });
    /*
    let playlist = new CreateUserplaylistDto();
    playlist.userPostId = Object(profile._id);
    playlist.postType = post.postType;
    playlist.mediaId = Object(mediaId);
    this.logger.log('createNewPostPic >>> generate playlist ' + JSON.stringify(playlist));
    this.postService.generateUserPlaylist(playlist);
    */

    this.logger.log('createNewPostPict >>> check certified. ' + JSON.stringify(post));
    if (post.certified) {
      this.generateCertificate(String(post.postID), 'id');
    } else {
      this.logger.error('createNewPostPict >>> post is not certified');
    }

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostPictV3(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    var postID = await this.utilService.generateId();
    var file_commpress = await this.resizeImage(file);

    //Get Image Information
    var image_information = await sharp(file_commpress).metadata();
    console.log("IMAGE INFORMATION file_commpress", image_information);

    var uploadJava = await this.uploadJava(postID, file.originalname, file_commpress);
    // console.log(uploadJava.data);
    // var rr = "";
    // if (rr != "Done") {
    if (uploadJava.data.toString() != "Done") {
      await this.errorHandler.generateNotAcceptableException(
        'Failed Upload Content',
      );
    }

    let post = await this.buildPost(body, headers, postID);
    let postType = body.postType;
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];
    let mediaId = "";

    if (postType == 'pict') {
      var med = new Mediapicts();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'image';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retm = await this.picService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retm);

      var vids = { "$ref": "mediapicts", "$id": retm.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retm.mediaID);
    } else if (postType == 'story') {
      let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'image';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    }
    post.contentMedias = cm;
    post.isShared = isShared;
    let apost = await this.PostsModel.create(post);

    this.logger.log('createNewPostPict >>> check certified. ' + JSON.stringify(post));
    if (post.certified) {
      this.generateCertificate(String(post.postID), 'id');
    } else {
      this.logger.error('createNewPostPict >>> post is not certified');
    }

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostPictV4(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    var userId = profile._id.toString();
    let postType = body.postType;

    var postID = await this.utilService.generateId();
    var extension = "jpg";

    var filename = postID + "." + extension;
    var filename_thum = postID + "_thum." + extension;
    var filename_original = postID + "_original." + extension;

    var file_upload = await this.generate_upload(file, extension);
    var file_thumnail = await this.generate_thumnail(file, extension);

    var url_filename = "";
    var url_filename_thum = "";

    var upload_file_upload = await this.uploadOss(file_upload, postID, filename, userId, postType);
    var upload_file_thumnail = await this.uploadOss(file_thumnail, postID, filename_thum, userId, postType);
    this.uploadOss(file.buffer, postID, filename_original, userId, postType);

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

    let post = await this.buildPost(body, headers, postID);
    let isShared = null;

    if (body.isShared === undefined) {
      isShared = true;
    } else {
      isShared = body.isShared;
    }
    var cm = [];
    let mediaId = "";

    if (postType == 'pict') {
      var med = new Mediapicts();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = true;
      med.mediaType = 'image';
      med.originalName = file.originalname;
      med.mediaMime = file.mimetype;
      med.mediaBasePath = userId + "/post/" + postType + "/" + post.postID + "/" + filename;
      med.mediaUri = filename;
      med.fsSourceUri = url_filename;
      med.fsSourceName = filename;
      med.fsTargetUri = url_filename;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.apsara = false;
      med.uploadSource = "OSS";
      med.mediaThumName = filename_thum;
      med.mediaThumBasePath = userId + "/post/" + postType + "/" + post.postID + "/" + filename_thum;
      med.mediaThumUri = url_filename_thum;
      med._class = 'io.melody.hyppe.content.domain.MediaPict';
      this.logger.log('createNewPostVideo >>> prepare save');
      var retm = await this.picService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retm);

      var vids = { "$ref": "mediapicts", "$id": retm.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retm.mediaID);
    } else if (postType == 'story') {
      let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      post.metadata = metadata;

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = true;
      mes.mediaType = 'image';
      mes.originalName = file.originalname;
      mes.mediaMime = file.mimetype;
      mes.mediaBasePath = userId + "/post/" + postType + "/" + post.postID + "/" + filename;
      mes.mediaUri = filename;
      mes.fsSourceUri = url_filename;
      mes.fsSourceName = filename;
      mes.fsTargetUri = url_filename;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.apsara = false;
      mes._class = 'io.melody.hyppe.content.domain.MediaPict';
      mes.uploadSource = "OSS";
      mes.mediaThumName = filename_thum;
      mes.mediaThumBasePath = userId + "/post/" + postType + "/" + post.postID + "/" + filename_thum;
      mes.mediaThumUri = url_filename_thum;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    }
    post.contentMedias = cm;
    post.isShared = isShared;
    post.active = true;

    if (post.certified) {
      this.generateCertificate(postID, 'id');
    }

    if (body.tagPeople != undefined && body.tagPeople.length > 1) {
      var obj = body.tagPeople;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp.username != undefined) {
            var objintr = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(post.postType.toString());
            this.utilService.sendFcmV2(tp.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", postID, post.postType.toString());
            pcats.push(objintr);
          }
        }
      }
      post.tagPeople = pcats;
    }

    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      var obj = body.tagDescription;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp != undefined || tp != null) {
            var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(post.postType.toString());
            this.utilService.sendFcmV2(tp.email.toString(), auth.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", postID, post.postType.toString())
            pcats.push(objintrx);
          }
        }
      }
      post.tagDescription = pcats;
    }


    var lang = await this.utilService.getUserlanguages(auth.email.toString());
    this.logger.log('createNewPostPict >>> check certified. ' + JSON.stringify(post));
    if (post.certified) {
      this.generateCertificate(postID.toString(), lang.toString());
    } else {
      this.logger.error('createNewPostPict >>> post is not certified');
    }
    let apost = await this.PostsModel.create(post);

    this.cmodService.cmodImage(post.postID.toString(), url_filename);


    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);
    res.data = pd;

    return res;
  }

  private async createNewPostPictV5(file: Express.Multer.File, body: any, data_userbasics: Userbasic, link: string): Promise<CreatePostResponse> {
    //Current Date
    const currentDate = await this.utilService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(body));
    // reqbody['postContent'] = file;
    var inputemail = data_userbasics.email;
    var setemail = inputemail.toString();

    //Set Extension
    var extension = "jpg";

    //Set File Name
    var filename = body.postID + "." + extension;
    var filename_thum = body.postID + "_thum." + extension;
    var filename_original = body.postID + "_original." + extension;

    //Generate File Upload
    var file_upload = await this.generate_upload(file, extension);
    var file_thumnail = await this.generate_thumnail(file, extension);

    //Upload File OSS
    var upload_file_upload = await this.uploadOss(file_upload, body.postID, filename, data_userbasics._id.toString(), body.postType);
    var upload_file_thumnail = await this.uploadOss(file_thumnail, body.postID, filename_thum, data_userbasics._id.toString(), body.postType);
    this.uploadOss(file.buffer, body.postID, filename_original, data_userbasics._id.toString(), body.postType);

    //Get Url Image
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

    //Build Post
    let Posts_: Posts = await this.buildPost_(body, data_userbasics);

    let contentMedias_ = [];
    if (Posts_.postType == 'pict') {
      //Set Mediapicts
      let Mediapicts_ = new Mediapicts();
      Mediapicts_._id = await this.utilService.generateId();
      Mediapicts_.mediaID = Mediapicts_._id;
      Mediapicts_.postID = Posts_.postID;
      Mediapicts_.active = true;
      Mediapicts_.mediaType = 'image';
      Mediapicts_.originalName = file.originalname;
      Mediapicts_.mediaMime = file.mimetype;
      Mediapicts_.mediaBasePath = data_userbasics._id.toString() + "/post/" + Posts_.postType + "/" + Posts_.postID + "/" + filename;
      Mediapicts_.mediaUri = filename;
      Mediapicts_.fsSourceUri = url_filename;
      Mediapicts_.fsSourceName = filename;
      Mediapicts_.fsTargetUri = url_filename;
      Mediapicts_.createdAt = currentDate;
      Mediapicts_.updatedAt = currentDate;
      Mediapicts_.apsara = false;
      Mediapicts_.uploadSource = "OSS";
      Mediapicts_.mediaThumName = filename_thum;
      Mediapicts_.mediaThumBasePath = data_userbasics._id.toString() + "/post/" + Posts_.postType + "/" + Posts_.postID + "/" + filename_thum;
      Mediapicts_.mediaThumUri = url_filename_thum;
      Mediapicts_._class = 'io.melody.hyppe.content.domain.MediaPict';
      this.picService.create(Mediapicts_);

      var vids = { "$ref": "mediapicts", "$id": Mediapicts_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(vids);
    } else if (Posts_.postType == 'story') {
      //Set Metadata
      let metadata = { postType: 'story', duration: 0, postID: Posts_._id, email: data_userbasics.email, postRoll: 0, midRoll: 0, preRoll: 0, width: 0, height: 0 };
      Posts_.metadata = metadata;

      //Set Mediastories
      let Mediastories_ = new Mediastories();
      Mediastories_._id = await this.utilService.generateId();
      Mediastories_.mediaID = Mediastories_._id;
      Mediastories_.postID = Posts_.postID;
      Mediastories_.active = true;
      Mediastories_.mediaType = 'image';
      Mediastories_.originalName = file.originalname;
      Mediastories_.mediaMime = file.mimetype;
      Mediastories_.mediaBasePath = data_userbasics._id.toString() + "/post/" + Posts_.postType + "/" + Posts_.postID + "/" + filename;
      Mediastories_.mediaUri = filename;
      Mediastories_.fsSourceUri = url_filename;
      Mediastories_.fsSourceName = filename;
      Mediastories_.fsTargetUri = url_filename;
      Mediastories_.createdAt = currentDate;
      Mediastories_.updatedAt = currentDate;
      Mediastories_.apsara = false;
      Mediastories_._class = 'io.melody.hyppe.content.domain.MediaPict';
      Mediastories_.uploadSource = "OSS";
      Mediastories_.mediaThumName = filename_thum;
      Mediastories_.mediaThumBasePath = data_userbasics._id.toString() + "/post/" + Posts_.postType + "/" + Posts_.postID + "/" + filename_thum;
      Mediastories_.mediaThumUri = url_filename_thum;
      Mediastories_._class = 'io.melody.hyppe.content.domain.MediaStory';
      this.storyService.create(Mediastories_);

      var stories = { "$ref": "mediastories", "$id": Mediastories_.mediaID, "$db": "hyppe_content_db" };
      contentMedias_.push(stories);
    }
    Posts_.contentMedias = contentMedias_;
    Posts_.active = true;

    //Generate Certified
    if (Posts_.certified) {
      this.generateCertificate(Posts_.postID.toString(), 'id');
    }

    //Send FCM Tag
    let tag = Posts_.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.$id.toString();
        this.userAuthService.findById(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString());
          }
        });
      });
    }

    //Send FCM Tag Description
    let tagdescription = Posts_.tagDescription;
    if (tagdescription != undefined && tagdescription.length > 0) {
      tagdescription.forEach(el => {
        let oid = el.$id.toString();
        this.userAuthService.findById(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString())
          }
        });
      });
    }

    //Get lang User
    const lang = await this.utilService.getUserlanguages(Posts_.email.toString());

    //Generate Certified
    if (Posts_.certified) {
      this.generateCertificate(Posts_.postID.toString(), lang.toString());
    }

    //Create Post
    await this.PostsModel.create(Posts_);

    //Update Music
    if (body.musicId != undefined) {
      await this.mediamusicService.updateUsed(body.musicId);
    }

    //Sale amount send notice
    if (Posts_.saleAmount > 0) {
      console.log("SALE AMOUNT", Posts_.saleAmount);
      this.utilService.sendFcmV2(Posts_.email.toString(), Posts_.email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), Posts_.postType.toString())
      //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
    }

    //Post Ceck Moderation
    this.cmodService.cmodImage(Posts_.postID.toString(), url_filename);

    //Create Response
    let dataPosts = await this.postService.findByPostId(Posts_._id.toString());
    var dataResponseGenerate = await this.genrateDataPost5(dataPosts, data_userbasics);
    let CreatePostResponse_ = new CreatePostResponse();
    let Messages_ = new Messages();

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(link, currentDate, timestamps_end, setemail, null, null, reqbody);

    Messages_.info = ["The process successful"];
    CreatePostResponse_.messages = Messages_;
    CreatePostResponse_.response_code = 202;
    CreatePostResponse_.data = dataResponseGenerate;
    console.log('============================================== CREATE POST END ==============================================', JSON.stringify(CreatePostResponse_));
    return CreatePostResponse_;
  }

  async genrateDataPost5(Posts_: Posts, data_userbasics: Userbasic) {
    let PostData_ = new PostData();
    PostData_._id = Posts_._id.toString();
    PostData_.isLiked = false;
    PostData_.active = Posts_.active;
    PostData_.allowComments = Posts_.allowComments;
    PostData_.certified = Posts_.certified;
    PostData_.createdAt = Posts_.createdAt.toString();
    PostData_.updatedAt = Posts_.updatedAt.toString();
    PostData_.description = Posts_.description.toString();
    PostData_.email = Posts_.email.toString();
    PostData_.comment = [];
    PostData_.comments = 0;
    PostData_.reportedStatus = Posts_.reportedStatus;
    PostData_.stiker = Posts_.stiker;

    //PRIPACY
    let privacy = new Privacy();
    privacy.isPostPrivate = false;
    privacy.isPrivate = false;
    privacy.isCelebrity = false;
    var getVerified = false;
    if (data_userbasics.statusKyc != undefined) {
      if (data_userbasics.statusKyc.toString() == "verified") {
        getVerified = true;
      }
    }
    privacy.isIdVerified = getVerified;
    PostData_.privacy = privacy;

    //INSIGHT
    let InsightPost_ = new InsightPost();
    InsightPost_.likes = Number(Posts_.likes);
    InsightPost_.views = Number(Posts_.views);
    InsightPost_.shares = Number(Posts_.shares);
    InsightPost_.comments = Number(Posts_.comments);
    PostData_.insight = InsightPost_;

    //BOOSTED
    var boostedRes = [];
    if (Posts_.boosted != undefined) {
      if (Posts_.boosted.length > 0) {
        PostData_.boosted = Posts_.boosted;
        PostData_.isBoost = Posts_.isBoost;
        for (var p = 0; p < Posts_.boosted.length; p++) {
          var CurrentDate = new Date(await (await this.utilService.getDateTime()).toISOString());
          var DateBoostStart = new Date(Posts_.boosted[p].boostSession.start.split(" ")[0] + "T" + Posts_.boosted[p].boostSession.start.split(" ")[1] + ".000Z")
          var DateBoostEnd = new Date(Posts_.boosted[p].boostSession.end.split(" ")[0] + "T" + Posts_.boosted[p].boostSession.end.split(" ")[1] + ".000Z")
          var boostedData = {};
          var boostedStatus = "TIDAK ADA";
          if ((DateBoostStart < CurrentDate) && (CurrentDate < DateBoostEnd)) {
            boostedStatus = "BERLANGSUNG";
            boostedData["type"] = Posts_.boosted[p].type
            boostedData["boostDate"] = Posts_.boosted[p].boostDate
            boostedData["boostInterval"] = Posts_.boosted[p].boostInterval
            boostedData["boostSession"] = Posts_.boosted[p].boostSession
            boostedData["boostViewer"] = Posts_.boosted[p].boostViewer
          } else if ((DateBoostStart > CurrentDate) && (DateBoostEnd > CurrentDate)) {
            boostedStatus = "AKAN DATANG";
            boostedData["type"] = Posts_.boosted[p].type
            boostedData["boostDate"] = Posts_.boosted[p].boostDate
            boostedData["boostInterval"] = Posts_.boosted[p].boostInterval
            boostedData["boostSession"] = Posts_.boosted[p].boostSession
            boostedData["boostViewer"] = Posts_.boosted[p].boostViewer
          }
          if (Object.keys(boostedData).length > 0) {
            boostedRes.push(boostedData);
          }
        }
        PostData_.boosted = boostedRes;
        if (boostedRes.length > 0) {
          PostData_.boostJangkauan = (boostedRes[0].boostViewer != undefined) ? boostedRes[0].boostViewer.length : 0;
        }
        PostData_.statusBoost = boostedStatus;
      }
    }
    if (PostData_.reportedStatus != undefined) {
      PostData_.reportedStatus = Posts_.reportedStatus;
    } else {
      PostData_.reportedStatus = "ALL";
    }
    if (PostData_.reportedUserCount != undefined) {
      PostData_.reportedUserCount = Number(Posts_.reportedUserCount);
    }

    //MUSIC
    var music = {}
    let thumnail_data: string[] = [];
    if (Posts_.musicId != undefined) {
      var dataMusic = await this.mediamusicService.findOneMusic(Posts_.musicId.toString());
      if (await this.utilService.ceckData(dataMusic)) {
        if (dataMusic.apsaraThumnail != undefined && dataMusic.apsaraThumnail != "" && dataMusic.apsaraThumnail != null) {
          thumnail_data.push(dataMusic.apsaraThumnail.toString());
        }
      }
      var dataApsaraThumnail = await this.mediamusicService.getImageApsara(thumnail_data);
      if (await this.utilService.ceckData(dataMusic)) {
        music["_id"] = Posts_.musicId.toString()
        music["musicTitle"] = dataMusic.musicTitle;
        music["artistName"] = dataMusic.artistName;
        music["albumName"] = dataMusic.albumName;
        music["apsaraMusic"] = dataMusic.apsaraMusic;
        music["apsaraThumnail"] = dataMusic.apsaraThumnail;
        console.log(dataMusic.apsaraThumnail)
        if (dataMusic.apsaraThumnail != undefined && dataMusic.apsaraThumnail != "" && dataMusic.apsaraThumnail != null) {
          music["apsaraThumnailUrl"] = dataApsaraThumnail.ImageInfo.find(x => x.ImageId == dataMusic.apsaraThumnail).URL;
        }
      }
    }
    PostData_.music = music;

    //USER
    let ub = await this.userAuthService.findOneByEmail(data_userbasics.email);
    let ubadge = await this.userService.findone_(data_userbasics.email.toString());
    PostData_.isIdVerified = data_userbasics.isIdVerified;
    PostData_.avatar = await this.getProfileAvatar2(data_userbasics);
    PostData_.username = ub.username;
    PostData_.urluserBadge = ubadge.urluserBadge;

    PostData_.isApsara = false;
    PostData_.location = Posts_.location;
    PostData_.visibility = String(Posts_.visibility);
    if (Posts_.metadata != undefined) {
      let md = Posts_.metadata;
      let md1 = new Metadata();
      md1.duration = Number(md.duration);
      md1.email = String(md.email);
      md1.midRoll = Number(md.midRoll);
      md1.postID = String(md.postID);
      md1.postRoll = Number(md.postRoll);
      md1.postType = String(md.postType);
      md1.preRoll = Number(md.preRoll);
      md1.width = (md.width != undefined) ? Number(md.width) : 0;
      md1.height = (md.height != undefined) ? Number(md.height) : 0;
      PostData_.metadata = md1;
    }

    if (Posts_.isShared != undefined) {
      PostData_.isShared = Posts_.isShared;
    } else {
      PostData_.isShared = true;
    }
    PostData_.postID = String(Posts_.postID);
    PostData_.postType = String(Posts_.postType);
    PostData_.saleAmount = Posts_.saleAmount;
    PostData_.saleLike = Posts_.saleLike;
    PostData_.saleView = Posts_.saleView;

    let following = await this.contentEventService.findFollowing(PostData_.email);
    if (Posts_.tagPeople != undefined && Posts_.tagPeople.length > 0) {
      let atp = Posts_.tagPeople;
      let atp1 = Array<TagPeople>();
      for (let x = 0; x < atp.length; x++) {
        let tp = atp[x];
        if (tp?.namespace) {
          let oid = tp.oid;
          let ua = await this.userAuthService.findById(oid.toString());
          if (ua != undefined) {
            let tp1 = new TagPeople();
            tp1.email = String(ua.email);
            tp1.username = String(ua.username);
            let ub = await this.userService.findOne(String(ua.email));
            if (ub != undefined) {
              tp1.avatar = await this.getProfileAvatar(ub);
            }

            tp1.status = 'TOFOLLOW';
            if (tp1.email == PostData_.email) {
              tp1.status = "UNLINK";
            } else {
              for (let i = 0; i < following.length; i++) {
                let fol = following[i];
                if (fol.email == tp1.email) {
                  tp1.status = "FOLLOWING";
                }
              }
            }
            atp1.push(tp1);
          }
        }
      }
      PostData_.tagPeople = atp1;
    }
    if (Posts_.category != undefined && Posts_.category.length > 0) {
      let atp = Posts_.category;
      let atp1 = Array<Cat>();
      for (let x = 0; x < atp.length; x++) {
        let tp = atp[x];
        console.log(JSON.stringify(tp));
        if (tp?.namespace) {
          let oid = tp.oid;
          let ua = await this.interestService.findOne(oid.toString());
          if (ua != undefined) {
            let tp1 = new Cat();
            tp1._id = String(ua._id);
            tp1.interestName = String(ua.interestName);
            tp1.langIso = String(ua.langIso);
            tp1.icon = String(ua.icon);
            tp1.createdAt = String(ua.createdAt);
            tp1.updatedAt = String(ua.updatedAt);

            atp1.push(tp1);
          }
        }
      }
      PostData_.cats = atp1;
    }

    //MEDIA
    let vids: String[] = [];
    let pics: String[] = [];
    let pics_thumnail: String[] = [];
    let meds = Posts_.contentMedias;
    if (meds != undefined) {
      for (let i = 0; i < meds.length; i++) {
        let med = meds[i];
        let ns = med.namespace;
        if (ns == 'mediavideos') {
          let video = await this.videoService.findOne(String(med.oid));
          if (video.apsara == true) {
            let getApsara = await this.getVideoApsara([video.apsaraId]);
            if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
              let vi = getApsara.VideoList[0];
              if (video.apsaraId == vi.VideoId) {
                PostData_.mediaThumbEndpoint = vi.CoverURL;
              }
            }
            PostData_.apsaraId = String(video.apsaraId);
            PostData_.isApsara = true;
          } else {
            PostData_.mediaThumbUri = video.mediaThumb;
            PostData_.mediaEndpoint = '/stream/' + video.postID;
            PostData_.mediaThumbEndpoint = '/thumb/' + video.postID;
          }
          PostData_.mediaType = 'video';
          PostData_.isViewed = false;
        } else if (ns == 'mediapicts') {
          let pic = await this.picService.findOne(String(med.oid));
          if (pic.apsara == true) {
            pics.push(pic.apsaraId);
            if (pic.apsaraThumbId != undefined) {
              pics_thumnail.push(pic.apsaraThumbId);
            } else {
              pics_thumnail.push(pic.apsaraId);
            }
            PostData_.apsaraId = String(pic.apsaraId);
            PostData_.isApsara = true;
            if (pic.apsaraThumbId != undefined) {
              PostData_.apsaraThumbId = String(pic.apsaraThumbId);
            } else {
              PostData_.apsaraThumbId = String(pic.apsaraId);
            }
          } else {
            PostData_.mediaThumbEndpoint = '/pict/' + pic.postID;
            PostData_.mediaEndpoint = '/pict/' + pic.postID;
            PostData_.mediaUri = pic.mediaUri;
          }
          PostData_.mediaType = 'image';
          PostData_.isViewed = false;
        } else if (ns == 'mediadiaries') {
          let diary = await this.diaryService.findOne(String(med.oid));
          if (diary.apsara == true) {
            let getApsara = await this.getVideoApsara([diary.apsaraId]);
            if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
              let vi = getApsara.VideoList[0];
              if (diary.apsaraId == vi.VideoId) {
                PostData_.mediaThumbEndpoint = vi.CoverURL;
              }
            }
            PostData_.apsaraId = String(diary.apsaraId);
            PostData_.isApsara = true;
          } else {
            PostData_.mediaThumbUri = diary.mediaThumb;
            PostData_.mediaEndpoint = '/stream/' + diary.postID;
            PostData_.mediaThumbEndpoint = '/thumb/' + diary.postID;
          }
          PostData_.mediaType = 'video';
          PostData_.isViewed = false;
        } else if (ns == 'mediastories') {
          let story = await this.storyService.findOne(String(med.oid));

          if (story.mediaType == 'video') {
            if (story.apsara == true) {
              let getApsara = await this.getVideoApsara([story.apsaraId]);
              if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
                let vi = getApsara.VideoList[0];
                if (story.apsaraId == vi.VideoId) {
                  PostData_.mediaThumbEndpoint = vi.CoverURL;
                }
              }
              PostData_.apsaraId = String(story.apsaraId);
              PostData_.isApsara = true;
            } else {
              PostData_.mediaThumbUri = story.mediaThumb;
              PostData_.mediaEndpoint = '/stream/' + story.postID;
              PostData_.mediaThumbEndpoint = '/thumb/' + story.postID;
            }
            PostData_.mediaType = 'video';
          } else {
            if (story.apsara == true) {
              pics.push(story.apsaraId);
              PostData_.apsaraId = String(story.apsaraId);
              PostData_.isApsara = true;
            } else {
              PostData_.mediaThumbUri = story.mediaThumb;
              PostData_.mediaEndpoint = '/pict/' + story.postID;
              PostData_.mediaThumbEndpoint = '/thumb/' + story.postID;
            }
            PostData_.mediaType = 'image';
          }
          PostData_.isViewed = false;
        }
      }
    }
    return PostData_;
  }

  async genrateDataPost6(Posts_: Posts, data_userbasics: Userbasic, Mediavideos_: Mediavideos, Mediastories_: Mediastories, Mediadiaries_: Mediadiaries, Mediapicts_: Mediapicts) {
    let PostData_ = new PostData();
    PostData_._id = Posts_._id.toString();
    PostData_.isLiked = false;
    PostData_.active = Posts_.active;
    PostData_.allowComments = Posts_.allowComments;
    PostData_.certified = Posts_.certified;
    PostData_.createdAt = Posts_.createdAt.toString();
    PostData_.updatedAt = Posts_.updatedAt.toString();
    PostData_.description = Posts_.description.toString();
    PostData_.email = Posts_.email.toString();
    PostData_.comment = [];
    PostData_.comments = 0;
    PostData_.reportedStatus = Posts_.reportedStatus;

    //PRIPACY
    let privacy = new Privacy();
    privacy.isPostPrivate = false;
    privacy.isPrivate = false;
    privacy.isCelebrity = false;
    var getVerified = false;
    if (data_userbasics.statusKyc != undefined) {
      if (data_userbasics.statusKyc.toString() == "verified") {
        getVerified = true;
      }
    }
    privacy.isIdVerified = getVerified;
    PostData_.privacy = privacy;

    //INSIGHT
    let InsightPost_ = new InsightPost();
    InsightPost_.likes = Number(Posts_.likes);
    InsightPost_.views = Number(Posts_.views);
    InsightPost_.shares = Number(Posts_.shares);
    InsightPost_.comments = Number(Posts_.comments);
    PostData_.insight = InsightPost_;

    //BOOSTED
    var boostedRes = [];
    if (Posts_.boosted != undefined) {
      if (Posts_.boosted.length > 0) {
        PostData_.boosted = Posts_.boosted;
        PostData_.isBoost = Posts_.isBoost;
        for (var p = 0; p < Posts_.boosted.length; p++) {
          var CurrentDate = new Date(await (await this.utilService.getDateTime()).toISOString());
          var DateBoostStart = new Date(Posts_.boosted[p].boostSession.start.split(" ")[0] + "T" + Posts_.boosted[p].boostSession.start.split(" ")[1] + ".000Z")
          var DateBoostEnd = new Date(Posts_.boosted[p].boostSession.end.split(" ")[0] + "T" + Posts_.boosted[p].boostSession.end.split(" ")[1] + ".000Z")
          var boostedData = {};
          var boostedStatus = "TIDAK ADA";
          if ((DateBoostStart < CurrentDate) && (CurrentDate < DateBoostEnd)) {
            boostedStatus = "BERLANGSUNG";
            boostedData["type"] = Posts_.boosted[p].type
            boostedData["boostDate"] = Posts_.boosted[p].boostDate
            boostedData["boostInterval"] = Posts_.boosted[p].boostInterval
            boostedData["boostSession"] = Posts_.boosted[p].boostSession
            boostedData["boostViewer"] = Posts_.boosted[p].boostViewer
          } else if ((DateBoostStart > CurrentDate) && (DateBoostEnd > CurrentDate)) {
            boostedStatus = "AKAN DATANG";
            boostedData["type"] = Posts_.boosted[p].type
            boostedData["boostDate"] = Posts_.boosted[p].boostDate
            boostedData["boostInterval"] = Posts_.boosted[p].boostInterval
            boostedData["boostSession"] = Posts_.boosted[p].boostSession
            boostedData["boostViewer"] = Posts_.boosted[p].boostViewer
          }
          if (Object.keys(boostedData).length > 0) {
            boostedRes.push(boostedData);
          }
        }
        PostData_.boosted = boostedRes;
        if (boostedRes.length > 0) {
          PostData_.boostJangkauan = (boostedRes[0].boostViewer != undefined) ? boostedRes[0].boostViewer.length : 0;
        }
        PostData_.statusBoost = boostedStatus;
      }
    }
    if (PostData_.reportedStatus != undefined) {
      PostData_.reportedStatus = Posts_.reportedStatus;
    } else {
      PostData_.reportedStatus = "ALL";
    }
    if (PostData_.reportedUserCount != undefined) {
      PostData_.reportedUserCount = Number(Posts_.reportedUserCount);
    }

    //MUSIC
    var music = {}
    let thumnail_data: string[] = [];
    if (Posts_.musicId != undefined) {
      var dataMusic = await this.mediamusicService.findOneMusic(Posts_.musicId.toString());
      if (await this.utilService.ceckData(dataMusic)) {
        if (dataMusic.apsaraThumnail != undefined && dataMusic.apsaraThumnail != "" && dataMusic.apsaraThumnail != null) {
          thumnail_data.push(dataMusic.apsaraThumnail.toString());
        }
      }
      var dataApsaraThumnail = await this.mediamusicService.getImageApsara(thumnail_data);
      if (await this.utilService.ceckData(dataMusic)) {
        music["_id"] = Posts_.musicId.toString()
        music["musicTitle"] = dataMusic.musicTitle;
        music["artistName"] = dataMusic.artistName;
        music["albumName"] = dataMusic.albumName;
        music["apsaraMusic"] = dataMusic.apsaraMusic;
        music["apsaraThumnail"] = dataMusic.apsaraThumnail;
        console.log(dataMusic.apsaraThumnail)
        if (dataMusic.apsaraThumnail != undefined && dataMusic.apsaraThumnail != "" && dataMusic.apsaraThumnail != null) {
          music["apsaraThumnailUrl"] = dataApsaraThumnail.ImageInfo.find(x => x.ImageId == dataMusic.apsaraThumnail).URL;
        }
      }
    }
    PostData_.music = music;

    //USER
    let ub = await this.userAuthService.findOneByEmail(data_userbasics.email);
    let ubadge = await this.userService.findone_(data_userbasics.email.toString());
    PostData_.isIdVerified = data_userbasics.isIdVerified;
    PostData_.avatar = await this.getProfileAvatar2(data_userbasics);
    PostData_.username = ub.username;
    PostData_.urluserBadge = ubadge.urluserBadge;

    PostData_.isApsara = false;
    PostData_.location = Posts_.location;
    PostData_.visibility = String(Posts_.visibility);
    if (Posts_.metadata != undefined) {
      let md = Posts_.metadata;
      let md1 = new Metadata();
      md1.duration = Number(md.duration);
      md1.email = String(md.email);
      md1.midRoll = Number(md.midRoll);
      md1.postID = String(md.postID);
      md1.postRoll = Number(md.postRoll);
      md1.postType = String(md.postType);
      md1.preRoll = Number(md.preRoll);
      md1.width = (md.width != undefined) ? Number(md.width) : 0;
      md1.height = (md.height != undefined) ? Number(md.height) : 0;
      PostData_.metadata = md1;
    }

    if (Posts_.isShared != undefined) {
      PostData_.isShared = Posts_.isShared;
    } else {
      PostData_.isShared = true;
    }
    PostData_.postID = String(Posts_.postID);
    PostData_.postType = String(Posts_.postType);
    PostData_.saleAmount = Posts_.saleAmount;
    PostData_.saleLike = Posts_.saleLike;
    PostData_.saleView = Posts_.saleView;

    let following = await this.contentEventService.findFollowing(PostData_.email);
    if (Posts_.tagPeople != undefined && Posts_.tagPeople.length > 0) {
      let atp = Posts_.tagPeople;
      let atp1 = Array<TagPeople>();
      for (let x = 0; x < atp.length; x++) {
        let tp = atp[x];
        if (tp?.namespace) {
          let oid = tp.oid;
          let ua = await this.userAuthService.findById(oid.toString());
          if (ua != undefined) {
            let tp1 = new TagPeople();
            tp1.email = String(ua.email);
            tp1.username = String(ua.username);
            let ub = await this.userService.findOne(String(ua.email));
            if (ub != undefined) {
              tp1.avatar = await this.getProfileAvatar(ub);
            }

            tp1.status = 'TOFOLLOW';
            if (tp1.email == PostData_.email) {
              tp1.status = "UNLINK";
            } else {
              for (let i = 0; i < following.length; i++) {
                let fol = following[i];
                if (fol.email == tp1.email) {
                  tp1.status = "FOLLOWING";
                }
              }
            }
            atp1.push(tp1);
          }
        }
      }
      PostData_.tagPeople = atp1;
    }
    if (Posts_.category != undefined && Posts_.category.length > 0) {
      let atp = Posts_.category;
      let atp1 = Array<Cat>();
      for (let x = 0; x < atp.length; x++) {
        let tp = atp[x];
        console.log(JSON.stringify(tp));
        if (tp?.namespace) {
          let oid = tp.oid;
          let ua = await this.interestService.findOne(oid.toString());
          if (ua != undefined) {
            let tp1 = new Cat();
            tp1._id = String(ua._id);
            tp1.interestName = String(ua.interestName);
            tp1.langIso = String(ua.langIso);
            tp1.icon = String(ua.icon);
            tp1.createdAt = String(ua.createdAt);
            tp1.updatedAt = String(ua.updatedAt);

            atp1.push(tp1);
          }
        }
      }
      PostData_.cats = atp1;
    }

    //MEDIA
    let vids: String[] = [];
    let pics: String[] = [];
    let pics_thumnail: String[] = [];
    let meds = Posts_.contentMedias;
    if (meds != undefined) {
      for (let i = 0; i < meds.length; i++) {
        let med = meds[i];
        let ns = med.namespace;
        if (ns == 'mediavideos') {
          let video = await this.videoService.findOne(String(med.oid));
          if (video.apsara == true) {
            let getApsara = await this.getVideoApsara([video.apsaraId]);
            if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
              let vi = getApsara.VideoList[0];
              if (video.apsaraId == vi.VideoId) {
                PostData_.mediaThumbEndpoint = vi.CoverURL;
              }
            }
            PostData_.apsaraId = String(video.apsaraId);
            PostData_.isApsara = true;
          } else {
            PostData_.mediaThumbUri = video.mediaThumb;
            PostData_.mediaEndpoint = '/stream/' + video.postID;
            PostData_.mediaThumbEndpoint = '/thumb/' + video.postID;
          }
          PostData_.mediaType = 'video';
          PostData_.isViewed = false;
        } else if (ns == 'mediapicts') {
          let pic = await this.picService.findOne(String(med.oid));
          if (pic.apsara == true) {
            pics.push(pic.apsaraId);
            if (pic.apsaraThumbId != undefined) {
              pics_thumnail.push(pic.apsaraThumbId);
            } else {
              pics_thumnail.push(pic.apsaraId);
            }
            PostData_.apsaraId = String(pic.apsaraId);
            PostData_.isApsara = true;
            if (pic.apsaraThumbId != undefined) {
              PostData_.apsaraThumbId = String(pic.apsaraThumbId);
            } else {
              PostData_.apsaraThumbId = String(pic.apsaraId);
            }
          } else {
            PostData_.mediaThumbEndpoint = '/thumb/' + pic.postID;
            PostData_.mediaEndpoint = '/pict/' + pic.postID;
            PostData_.mediaUri = pic.mediaUri;
          }
          PostData_.mediaType = 'image';
          PostData_.isViewed = false;
        } else if (ns == 'mediadiaries') {
          let diary = await this.diaryService.findOne(String(med.oid));
          if (diary.apsara == true) {
            let getApsara = await this.getVideoApsara([diary.apsaraId]);
            if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
              let vi = getApsara.VideoList[0];
              if (diary.apsaraId == vi.VideoId) {
                PostData_.mediaThumbEndpoint = vi.CoverURL;
              }
            }
            PostData_.apsaraId = String(diary.apsaraId);
            PostData_.isApsara = true;
          } else {
            PostData_.mediaThumbUri = diary.mediaThumb;
            PostData_.mediaEndpoint = '/stream/' + diary.postID;
            PostData_.mediaThumbEndpoint = '/thumb/' + diary.postID;
          }
          PostData_.mediaType = 'video';
          PostData_.isViewed = false;
        } else if (ns == 'mediastories') {
          let story = await this.storyService.findOne(String(med.oid));

          if (story.mediaType == 'video') {
            if (story.apsara == true) {
              let getApsara = await this.getVideoApsara([story.apsaraId]);
              if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
                let vi = getApsara.VideoList[0];
                if (story.apsaraId == vi.VideoId) {
                  PostData_.mediaThumbEndpoint = vi.CoverURL;
                }
              }
              PostData_.apsaraId = String(story.apsaraId);
              PostData_.isApsara = true;
            } else {
              PostData_.mediaThumbUri = story.mediaThumb;
              PostData_.mediaEndpoint = '/stream/' + story.postID;
              PostData_.mediaThumbEndpoint = '/thumb/' + story.postID;
            }
            PostData_.mediaType = 'video';
          } else {
            if (story.apsara == true) {
              pics.push(story.apsaraId);
              PostData_.apsaraId = String(story.apsaraId);
              PostData_.isApsara = true;
            } else {
              PostData_.mediaThumbUri = story.mediaThumb;
              PostData_.mediaEndpoint = '/pict/' + story.postID;
              PostData_.mediaThumbEndpoint = '/thumb/' + story.postID;
            }
            PostData_.mediaType = 'image';
          }
          PostData_.isViewed = false;
        }
      }
    }
    return PostData_;
  }

  async uploadOss(buffer: Buffer, postId: string, filename: string, userId: string, mediaTipe: string) {
    var result = await this.ossContentPictService.uploadFileBuffer(buffer, userId + "/post/" + mediaTipe + "/" + postId + "/" + filename);
    return result;
  }

  async uploadOssProfile(buffer: Buffer, filename: string, userId: string) {
    var result = await this.ossContentPictService.uploadFileBuffer(buffer, userId + "/profilePict/" + filename);
    return result;
  }

  async uploadJava(postId: string, filename_: string, buffer: Buffer) {
    //Get Image Information
    var image_information = await sharp(buffer).metadata();
    console.log("IMAGE INFORMATION buffer", image_information);
    const form = new FormData();
    form.append('file', buffer, { filename: filename_ });
    form.append('postID', postId);
    console.log(form);
    const gettest = await axios.post(this.configService.get("APSARA_UPLOADER_PICTURE_V3"), form, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return gettest;
  }

  async resizeImage(file: Express.Multer.File) {
    var buffers_file = file.buffer;
    var SIZE_IMAGE_UPLOAD = this.configService.get("SIZE_IMAGE_UPLOAD");
    var SIZE_IMAGE_RESIZE = this.configService.get("SIZE_IMAGE_RESIZE");
    console.log("CONFIG SIZE_IMAGE_UPLOAD : " + SIZE_IMAGE_UPLOAD);
    console.log("CONFIG SIZE_IMAGE_RESIZE : " + SIZE_IMAGE_RESIZE);

    var image_information = await sharp(buffers_file).metadata();
    console.log("IMAGE INFORMATION", image_information);

    var image_height = image_information.height;
    var image_width = image_information.width;
    var image_size = image_information.size;
    var image_format = image_information.format;
    var image_orientation = image_information.orientation;

    let fileSizeKB = image_size / 1024;
    let fileSizeMB = fileSizeKB / 1024;
    console.log("SIZE KB", fileSizeKB + "kb");
    console.log("SIZE MB", fileSizeMB + "mb");
    var image_mode = await this.utilService.getImageMode(image_width, image_height);
    console.log("IMAGE MODE", image_mode);

    var New_height = 0;
    var New_width = 0;

    if (image_mode == "LANDSCAPE") {
      if (image_width > SIZE_IMAGE_RESIZE) {
        New_height = await this.utilService.getHeight(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_width = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    } else if (image_mode == "POTRET") {
      if (image_height > SIZE_IMAGE_RESIZE) {
        New_width = await this.utilService.getWidth(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_height = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    }
    console.log("NEW WIDTH : " + Math.round(New_width));
    console.log("NEW HEIGHT : " + Math.round(New_height));

    var file_resize = null;
    if (image_format == "heif") {
      const outputBuffer = await convert({
        buffer: buffers_file,
        format: 'JPEG',
        quality: 1
      });
      console.log("outputBuffer", await sharp(outputBuffer).metadata());
      file_resize = await sharp(outputBuffer).resize(Math.round(New_width), Math.round(New_height)).withMetadata({ image_orientation }).toBuffer();
    } else {
      file_resize = await sharp(buffers_file, { failOnError: false }).resize(Math.round(New_width), Math.round(New_height)).withMetadata({ image_orientation }).toBuffer();
    }

    var new_image_information = await sharp(file_resize).metadata();
    console.log("NEW IMAGE INFORMATION", new_image_information);

    var new_image_height = new_image_information.height;
    var new_image_width = new_image_information.width;
    var new_image_size = new_image_information.size;
    var new_image_format = new_image_information.format;

    let new_fileSizeKB = new_image_size / 1024;
    let new_fileSizeMB = new_fileSizeKB / 1024;
    console.log("NEW SIZE KB", new_fileSizeKB + "kb");
    console.log("NEW SIZE MB", new_fileSizeMB + "mb");

    var file_commpress = file_resize;
    if (new_fileSizeKB > SIZE_IMAGE_UPLOAD) {
      // file_commpress = await Jimp_.read(file_resize).then((image) => {
      //   return new Promise(function (resolve, reject) {
      //       image.quality(20).getBuffer(file.mimetype, (error, buffer) => error ? reject(error) : resolve(buffer));
      //     });
      //   }).catch((err) => {
      //     this.logger.error('Failed Compress : ' + err);
      //   });
      file_commpress = await this.compressImage(file_resize, file.mimetype)
    } else {
      file_commpress = file_resize;
    }

    // fs.writeFile("./tmp/some1.jpeg", buffers_file, function (err) {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   console.log("The file was saved!");
    // });
    // fs.writeFile("./tmp/some2.jpeg", file_commpress, function (err) {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   console.log("The file was saved!");
    // });
    return file_commpress;
  }

  async generate_upload_profile(file: Buffer) {
    var image_information = await sharp(file).metadata();
    var image_format = image_information.format;
    var image_height = image_information.height;
    var image_width = image_information.width;
    var image_orientation = image_information.orientation;

    //Get Image Mode
    var image_mode = await this.utilService.getImageMode(image_width, image_height);
    console.log("IMAGE MODE", image_mode);

    //Get Ceck Mode
    var New_height = 0;
    var New_width = 0;

    if (image_mode == "LANDSCAPE") {
      New_height = image_height;
      New_width = image_width;
    } else if (image_mode == "POTRET") {
      New_height = image_height;
      New_width = image_width;
    }

    var file_convert = null;
    if (image_format == "heif") {
      const outputBuffer = await convert({
        buffer: file,
        format: 'JPEG',
        quality: 1
      });
      console.log("outputBuffer", await sharp(outputBuffer).metadata());
      file_convert = await sharp(outputBuffer).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
    } else {
      file_convert = await sharp(file, { failOnError: false }).resize(Math.round(New_width), Math.round(New_height)).withMetadata({ image_orientation }).toBuffer();
    }

    var image_information2 = await sharp(file_convert).metadata();
    console.log("image_information2", image_information2);

    var image_orientation2 = image_information2.orientation;
    console.log("image_orientation2", image_orientation2);

    var thumnail = null;
    var ori = null;
    try {
      if (image_orientation2 == 1) {
        thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
        ori = await sharp(file_convert).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
      } else if (image_orientation2 == 6) {
        thumnail = await sharp(file_convert).rotate(90).resize(100, 100).toBuffer();
        ori = await sharp(file_convert).rotate(90).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
      } else if (image_orientation2 == 8) {
        thumnail = await sharp(file_convert).rotate(270).resize(100, 100).toBuffer();
        ori = await sharp(file_convert).rotate(270).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
      } else {
        thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
        ori = file_convert;
      }
      console.log(typeof thumnail);
    } catch (e) {
      console.log("THUMNAIL", "FAILED TO CREATE THUMNAIL");
    }

    return [ori, thumnail];
  }

  async generate_upload_buffer(file: Buffer, format: string) {
    var SIZE_IMAGE_UPLOAD = this.configService.get("SIZE_IMAGE_UPLOAD");
    var SIZE_IMAGE_RESIZE = this.configService.get("SIZE_IMAGE_RESIZE");
    console.log("CONFIG SIZE_IMAGE_UPLOAD : " + SIZE_IMAGE_UPLOAD);
    console.log("CONFIG SIZE_IMAGE_RESIZE : " + SIZE_IMAGE_RESIZE);

    //Get Image Information
    var image_information = await sharp(file).metadata();
    console.log("IMAGE INFORMATION", image_information);

    var image_height = image_information.height;
    var image_width = image_information.width;
    var image_size = image_information.size;
    var image_format = image_information.format;
    var image_orientation = image_information.orientation;

    //Get Image Mode
    var image_mode = await this.utilService.getImageMode(image_width, image_height);
    console.log("IMAGE MODE", image_mode);

    //Get Ceck Mode
    var New_height = 0;
    var New_width = 0;
    if (image_mode == "LANDSCAPE") {
      if (image_width > SIZE_IMAGE_RESIZE) {
        New_height = await this.utilService.getHeight(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_width = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    } else if (image_mode == "POTRET") {
      if (image_height > SIZE_IMAGE_RESIZE) {
        New_width = await this.utilService.getWidth(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_height = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    }

    //Convert Image
    const buffers_file = await webp.buffer2webpbuffer(file, format, "-q 70", this.configService.get("PATH_UPLOAD"));
    var file_commpress = buffers_file;

    //Convert Image Orientation
    var file_commpress = null;
    if (image_orientation == 1) {
      file_commpress = await sharp(buffers_file).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
    } else if (image_orientation == 6) {
      file_commpress = await sharp(buffers_file).rotate(90).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
    } else if (image_orientation == 8) {
      file_commpress = await sharp(buffers_file).rotate(270).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
    } else {
      file_commpress = await sharp(buffers_file).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
      //file_commpress = buffers_file;
    }

    // fs.writeFile("./temp/some.jpeg", file_commpress, function (err) {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   console.log("The file was saved!");
    // });
    return file_commpress;
  }

  async generate_upload(file: Express.Multer.File, format: string) {
    var SIZE_IMAGE_UPLOAD = this.configService.get("SIZE_IMAGE_UPLOAD");
    var SIZE_IMAGE_RESIZE = this.configService.get("SIZE_IMAGE_RESIZE");
    console.log("CONFIG SIZE_IMAGE_UPLOAD : " + SIZE_IMAGE_UPLOAD);
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
    var image_mode = await this.utilService.getImageMode(image_width, image_height);
    console.log("IMAGE MODE", image_mode);

    //Get Ceck Mode
    var New_height = 0;
    var New_width = 0;
    if (image_mode == "LANDSCAPE") {
      if (image_width > SIZE_IMAGE_RESIZE) {
        New_height = await this.utilService.getHeight(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_width = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    } else if (image_mode == "POTRET") {
      if (image_height > SIZE_IMAGE_RESIZE) {
        New_width = await this.utilService.getWidth(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_height = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    }

    var file_resize = null;
    if (image_format == "heif") {
      console.log("heif", "true");
      file_resize = await convert({
        buffer: file.buffer,
        format: 'JPEG',
        quality: 1
      });
    } else {
      console.log("heif", "false");
      file_resize = file;
    }

    //Convert Image
    const buffers_file = await webp.buffer2webpbuffer(file_resize.buffer, format, "-q 70", this.configService.get("PATH_UPLOAD"));
    var file_commpress = buffers_file;

    //Convert Image Orientation
    var file_commpress = null;
    if (image_orientation == 1) {
      file_commpress = await sharp(buffers_file).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
    } else if (image_orientation == 6) {
      file_commpress = await sharp(buffers_file).rotate(90).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
    } else if (image_orientation == 8) {
      file_commpress = await sharp(buffers_file).rotate(270).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
    } else {
      //file_commpress = await sharp(buffers_file).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
      file_commpress = buffers_file;
    }
    return file_commpress;
  }

  async generate_upload_noresize(file: Express.Multer.File, format: string) {

    //Get Image Information
    var image_information = await sharp(file.buffer).metadata();
    console.log("IMAGE INFORMATION", image_information);

    // var image_height = image_information.height;
    // var image_width = image_information.width;
    // var image_size = image_information.size;
    var image_format = image_information.format;
    // var image_orientation = image_information.orientation;

    var file_resize = null;
    if (image_format == "heif") {
      console.log("heif", "true");
      file_resize = await convert({
        buffer: file.buffer,
        format: 'JPEG',
        quality: 1
      });
    } else {
      console.log("heif", "false");
      file_resize = file;
    }

    //Convert Image
    const buffers_file = await webp.buffer2webpbuffer(file_resize.buffer, format, "-q 70", this.configService.get("PATH_UPLOAD"));
    var file_commpress = buffers_file;

    return file_commpress;
  }

  async generate_thumnail_buffer(buffer: Buffer, format: string) {
    var SIZE_IMAGE_UPLOAD = this.configService.get("SIZE_IMAGE_UPLOAD");
    var SIZE_IMAGE_RESIZE = this.configService.get("SIZE_IMAGE_RESIZE");
    console.log("CONFIG SIZE_IMAGE_UPLOAD : " + SIZE_IMAGE_UPLOAD);
    console.log("CONFIG SIZE_IMAGE_RESIZE : " + SIZE_IMAGE_RESIZE);

    //Get Image Information
    var image_information = await sharp(buffer).metadata();
    console.log("IMAGE INFORMATION", image_information);

    var image_height = image_information.height;
    var image_width = image_information.width;
    var image_size = image_information.size;
    var image_format = image_information.format;
    var image_orientation = image_information.orientation;

    //Get Image Mode
    var image_mode = await this.utilService.getImageMode(image_width, image_height);
    console.log("IMAGE MODE", image_mode);

    //Get Ceck Mode
    var New_height = 0;
    var New_width = 0;
    if (image_mode == "LANDSCAPE") {
      if (image_width > SIZE_IMAGE_RESIZE) {
        New_height = await this.utilService.getHeight(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_width = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    } else if (image_mode == "POTRET") {
      if (image_height > SIZE_IMAGE_RESIZE) {
        New_width = await this.utilService.getWidth(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_height = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    }

    //Convert Image
    const buffers_file = await webp.buffer2webpbuffer(buffer, format, "-q 70", "./temp/");
    var file_commpress = buffers_file;

    //Convert Image Orientation
    var file_commpress = null;
    if (image_orientation == 1) {
      file_commpress = await sharp(buffers_file).resize(480, 480).toBuffer();
    } else if (image_orientation == 6) {
      file_commpress = await sharp(buffers_file).rotate(90).resize(480, 480).toBuffer();
    } else if (image_orientation == 8) {
      file_commpress = await sharp(buffers_file).rotate(270).resize(480, 480).toBuffer();
    } else {
      //file_commpress = await sharp(buffers_file).resize(480, 480).toBuffer();
      file_commpress = buffers_file;
    }
    return file_commpress;
  }

  async generate_thumnail(file: Express.Multer.File, format: string) {
    var SIZE_IMAGE_UPLOAD = this.configService.get("SIZE_IMAGE_UPLOAD");
    var SIZE_IMAGE_RESIZE = this.configService.get("SIZE_IMAGE_RESIZE");
    console.log("CONFIG SIZE_IMAGE_UPLOAD : " + SIZE_IMAGE_UPLOAD);
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
    var image_mode = await this.utilService.getImageMode(image_width, image_height);
    console.log("IMAGE MODE", image_mode);

    //Get Ceck Mode
    var New_height = 0;
    var New_width = 0;
    if (image_mode == "LANDSCAPE") {
      if (image_width > SIZE_IMAGE_RESIZE) {
        New_height = await this.utilService.getHeight(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_width = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    } else if (image_mode == "POTRET") {
      if (image_height > SIZE_IMAGE_RESIZE) {
        New_width = await this.utilService.getWidth(image_width, image_height, SIZE_IMAGE_RESIZE);
        New_height = SIZE_IMAGE_RESIZE;
      } else {
        New_height = image_height;
        New_width = image_width;
      }
    }

    var file_resize = null;
    if (image_format == "heif") {
      console.log("heif", "true");
      file_resize = await convert({
        buffer: file.buffer,
        format: 'JPEG',
        quality: 1
      });
    } else {
      console.log("heif", "false");
      file_resize = file;
    }

    //Convert Image
    const buffers_file = await webp.buffer2webpbuffer(file_resize.buffer, format, "-q 70", "./temp/");
    var file_commpress = buffers_file;

    //Convert Image Orientation
    var file_commpress = null;
    if (image_orientation == 1) {
      file_commpress = await sharp(buffers_file).resize(480, 480).toBuffer();
    } else if (image_orientation == 6) {
      file_commpress = await sharp(buffers_file).rotate(90).resize(480, 480).toBuffer();
    } else if (image_orientation == 8) {
      file_commpress = await sharp(buffers_file).rotate(270).resize(480, 480).toBuffer();
    } else {
      //file_commpress = await sharp(buffers_file).resize(480, 480).toBuffer();
      file_commpress = buffers_file;
    }
    return file_commpress;
  }

  async convertImage(image: Buffer, outputFormat: string): Promise<Buffer> {
    const result = await webp.buffer2webpbuffer(image, "jpg", "-q 80");
    return result
    // return new Promise((resolve, reject) => {
    //   const chunks: Buffer[] = []
    //   const passthrough = new PassThrough()
    //   ffmpeg().input(image).outputFormat(outputFormat)
    //     .on("error", (error) => {
    //       return reject(error);
    //     })
    //     .stream(passthrough, { end: true });
    //   passthrough.on("data", data => chunks.push(data))
    //   passthrough.on("error", (error) => {
    //     return reject(error);
    //   })
    //   passthrough.on("end", () => {
    //     const originalImage = Buffer.concat(chunks)
    //     //const editedImage = originalImage.copyWithin(4, -4).slice(0, -4)
    //     return resolve(originalImage)
    //   })
    // })
    // const chunks = ffmpeg().input(image).outputFormat(outputFormat);
    // return chunks;
  }

  async compressImage(buffer: Buffer, mimetype: string) {
    var file_commpress = await Jimp_.read(buffer).then((image) => {
      return new Promise(function (resolve, reject) {
        image.quality(20).getBuffer(mimetype, (error, buffer) => error ? reject(error) : resolve(buffer));
      });
    }).catch((err) => {
      this.logger.error('Failed Compress : ' + err);
    });
    return file_commpress;
  }

  async updateNewPost(body: any, headers: any) {
    this.logger.log('updateNewPost >>> start');
    let post = await this.postService.findid(body.postID);
    if (post == undefined) {
      return;
    }
    var profile = await this.userService.findOne(String(post.email));

    let cm = post.contentMedias[0];
    let ns = cm.namespace;
    this.logger.log('updateNewPost >>> namespace: ' + ns);
    if (ns == 'mediavideos') {
      let vid = await this.videoService.findOne(cm.oid);
      if (vid == undefined) {
        return;
      }

      vid.apsaraId = body.videoId;
      vid.active = true;
      this.videoService.create(vid);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod video');
      let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
      if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
        let aim = aimg.PlayUrl;
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
        //TODO 
        this.cmodService.cmodVideo(body.postID, aim);
      }

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      post.metadata = metadata;
      post.active = true;
      //TODO 
      await this.postService.create(post);
    } else if (ns == 'mediapicts') {
      this.logger.log('updateNewPost >>> checking picture oid: ' + cm.oid);
      let pic = await this.picService.findOne(cm.oid);
      if (pic == undefined) {
        this.logger.error('updateNewPost >>> checking picture oid: ' + cm.oid + " error");
        return;
      }

      pic.apsaraId = body.videoId;
      pic.apsaraThumbId = body.thId;
      pic.active = true;
      //TODO 
      this.picService.create(pic);

      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod image');
      let aimg = await this.getImageApsara(ids);
      if (aimg != undefined && aimg.ImageInfo != undefined && aimg.ImageInfo.length > 0) {
        let aim = aimg.ImageInfo[0];
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim.URL);
        this.cmodService.cmodImage(body.postID, aim.URL);
      }


    } else if (ns == 'mediastories') {
      let st = await this.storyService.findOne(cm.oid);
      if (st == undefined) {
        return;
      }

      st.apsaraId = body.videoId;
      st.active = true;
      //TODO 
      this.storyService.create(st);

      post.active = true;

      this.logger.log('updateNewPost >>> mediatype: ' + st.mediaType);
      if (st.mediaType == 'video') {
        let meta = post.metadata;
        let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
        post.metadata = metadata;
      }

      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      if (st.mediaType == 'video') {
        this.logger.log('updateNewPost >>> checking cmod');
        let ids: string[] = [];
        ids.push(body.videoId);
        this.logger.log('updateNewPost >>> checking cmod video');
        let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
        if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
          let aim = aimg.PlayUrl;
          this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
          //TODO 
          this.cmodService.cmodVideo(body.postID, aim);
        }
      } else {
        this.logger.log('updateNewPost >>> checking cmod');
        let ids: string[] = [];
        ids.push(body.videoId);
        this.logger.log('updateNewPost >>> checking cmod image');
        let aimg = await this.getImageApsara(ids);
        if (aimg != undefined && aimg.ImageInfo != undefined && aimg.ImageInfo.length > 0) {
          let aim = aimg.ImageInfo[0];
          this.logger.log('updateNewPost >>> checking cmod image img: ' + aim.URL);
          //TODO 
          this.cmodService.cmodImage(body.postID, aim.URL);
        }
      }
    } else if (ns == 'mediadiaries') {
      let dy = await this.diaryService.findOne(cm.oid);
      if (dy == undefined) {
        return;
      }

      dy.apsaraId = body.videoId;
      dy.active = true;
      //TODO 
      this.diaryService.create(dy);

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll, width: meta.width, height: meta.height };
      post.metadata = metadata;
      post.active = true;
      //TODO 
      await this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      this.logger.log('updateNewPost >>> checking cmod');
      let ids: string[] = [];
      ids.push(body.videoId);
      this.logger.log('updateNewPost >>> checking cmod video');
      let aimg = await this.getVideoApsaraSingleNoDefinition(ids[0]);
      if (aimg != undefined && aimg.PlayUrl != undefined && aimg.PlayUrl.length > 0) {
        let aim = aimg.PlayUrl;
        this.logger.log('updateNewPost >>> checking cmod image img: ' + aim);
        //TODO 
        this.cmodService.cmodVideo(body.postID, aim);
      }
    }

    if (post.certified) {
      this.generateCertificate(String(post.postID), 'id');
    }

    let myus = await this.userAuthService.findOneByEmail(post.email);

    let tag = post.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then((as) => {
          let em = String(myus.username);
          let bodyi = em + ' Menandai kamu di ';
          let bodye = em + ' Tagged you in ';
          if (post.postType == 'pict') {
            bodyi = bodyi + ' HyppePic';
            bodye = bodye + ' HyppePic';
          } else if (post.postType == 'vid') {
            bodyi = bodyi + ' HyppeVideo';
            bodye = bodye + ' HyppeVideo';
          } else if (post.postType == 'diary') {
            bodyi = bodyi + ' HyppeDiary';
            bodye = bodye + ' HyppeDiary';
          } else if (post.postType == 'story') {
            bodyi = bodyi + ' HyppeStory';
            bodye = bodye + ' HyppeStory';
          }
          this.utilService.sendFcmV2(as.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), post.postType.toString())
          //this.utilService.sendFcm(String(as.email), 'Disebut', 'Mentioned', bodyi, bodye, 'REACTION', 'ACCEPT', String(post.postID), String(post.postType));
        });
      });
    }

    let tagd = post.tagDescription;
    if (tagd != undefined && tagd.length > 0) {
      tagd.forEach(el => {
        let oid = el.oid;
        this.userAuthService.findById(oid).then((as) => {
          let em = String(myus.username);
          let bodyi = em + ' Menandai kamu di ';
          let bodye = em + ' Tagged you in ';
          if (post.postType == 'pict') {
            bodyi = bodyi + ' HyppePic';
            bodye = bodye + ' HyppePic';
          } else if (post.postType == 'vid') {
            bodyi = bodyi + ' HyppeVideo';
            bodye = bodye + ' HyppeVideo';
          } else if (post.postType == 'diary') {
            bodyi = bodyi + ' HyppeDiary';
            bodye = bodye + ' HyppeDiary';
          } else if (post.postType == 'story') {
            bodyi = bodyi + ' HyppeStory';
            bodye = bodye + ' HyppeStory';
          }
          this.utilService.sendFcmV2(as.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), post.postType.toString())
          //this.utilService.sendFcm(String(as.email), 'Disebut', 'Mentioned', bodyi, bodye, 'REACTION', 'ACCEPT', null, null);
        });
      });
    }

    let playlist = new CreateUserplaylistDto();
    playlist.userPostId = Object(profile._id);
    playlist.postType = post.postType;
    playlist.mediaId = Object(cm.oid);
    this.logger.log('createNewPostVideo >>> generate playlist ' + JSON.stringify(playlist));
    //this.postService.generateUserPlaylist(playlist);
  }

  async getUserPost(body: any, headers: any): Promise<PostResponseApps> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getuserposts";
    var reqbody = JSON.parse(JSON.stringify(body));

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findone_(auth.email);
    if (profile == null) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

      let res = new PostResponseApps();
      let msg = new Messages
      msg.info = ["User tidak tedaftar"];
      res.messages = msg;
      res.response_code = 204;
      return res;
    }
    this.logger.log('getUserPost >>> profile: ' + profile.email);

    let res = new PostResponseApps();
    res.response_code = 202;

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }

    //let postId = await this.postPlaylistService.doGetUserPostPlaylist(body, headers, profile);
    let posts = await this.doGetUserPost(body, headers, profile);
    //let posts = await this.loadBulk(postId, page, row);
    let pd = await this.loadPostData(posts, body, profile, profile);
    res.data = pd;

    var ver = await this.settingsService.findOneByJenis('AppsVersion');
    ver.value;
    res.version = String(ver.value);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  async getUserPostMy(body: any, headers: any): Promise<PostResponseApps> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getuserposts/my";
    var reqbody = JSON.parse(JSON.stringify(body));

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPost >>> profile: ' + profile);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostMy(body, headers, profile);
    let pd = await this.loadPostData(posts, body, profile, profile);
    res.data = pd;

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  async getUserPostBoost(pageNumber: number, pageRow: number, headers: any) {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getuserposts/my";
    var setdata = {
      "pageNumber": pageNumber,
      "pageRow": pageRow,
    };
    var reqbody = JSON.parse(JSON.stringify(setdata));

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostBoost(pageNumber, pageRow, profile);
    let pd = await this.loadPostBoostData(posts, profile);
    res.data = pd;

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  private async doGetUserPostBoost(pageNumber: number, pageRow: number, whoami: Userbasic): Promise<Posts[]> {
    var currentDateString = await this.utilService.getDateTimeISOString();
    var currentDate = new Date(currentDateString);
    var currentDateFormat = currentDate.toISOString().split('T')[0] + " " + currentDate.toISOString().split('T')[1].split('.')[0];
    console.log(currentDate)
    console.log(currentDate.toISOString().split('T')[0] + " " + currentDate.toISOString().split('T')[1].split('.')[0])
    var perPage = Math.max(0, pageRow), page = Math.max(0, pageNumber);

    const query = await this.PostsModel.aggregate([
      {
        $match: {
          "boosted": {
            $exists: true,
            $ne: null
          }
        }
      },
      {
        $addFields: {
          coutBoost: { $size: "$boosted" },
          mediaId: ({ $arrayElemAt: ['$contentMedias', 0] }),
        }
      },
      {
        $match: {
          $and: [
            {
              coutBoost: { $gt: 0 }
            },
            {
              email: whoami.email.toString()
            },
            {
              active: true
            },
            // {
            //   $or: [
            //     {
            //       $and: [
            //         {
            //           boosted: {
            //             $elemMatch: {
            //               "boostSession.start": { $lte: currentDateFormat }
            //             }
            //           }
            //         },
            //         {
            //           boosted: {
            //             $elemMatch: {
            //               "boostSession.end": { $gte: currentDateFormat }
            //             }
            //           }
            //         }
            //       ]
            //     },
            //     {
            //       $and: [
            //         {
            //           boosted: {
            //             $elemMatch: {
            //               "boostSession.start": { $gte: currentDateFormat }
            //             }
            //           }
            //         },
            //         {
            //           boosted: {
            //             $elemMatch: {
            //               "boostSession.end": { $gte: currentDateFormat }
            //             }
            //           }
            //         }
            //       ]
            //     }
            //   ]
            // },
          ]
        }
      },
      {
        $addFields: {
          mediaId: '$mediaId.$id'
        }
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $addFields: {
          cout_mediaPict: { $size: "$mediaPict_data" },
          cout_mediadiaries: { $size: "$mediadiaries_data" },
          cout_mediavideos: { $size: "$mediavideos_data" },
        }
      },
      {
        $addFields: {
          media: {
            $switch: {
              branches: [
                { case: { $gt: ["$cout_mediaPict", 0] }, then: "$mediaPict_data", },
                { case: { $gt: ["$cout_mediadiaries", 0] }, then: "$mediadiaries_data" },
                { case: { $gt: ["$cout_mediavideos", 0] }, then: "$mediavideos_data" },
              ],
              "default": null
            }
          }
        }
      },
      {
        $unwind: {
          path: "$boosted"
        }
      },
      // {
      //   $match: {
      //     $or: [
      //       {
      //         $and: [
      //           {
      //             "boosted.boostSession.start": { $lte: currentDateFormat }
      //           },
      //           {
      //             "boosted.boostSession.end": { $gte: currentDateFormat }
      //           }
      //         ]
      //       },
      //       {
      //         $and: [
      //           {
      //             "boosted.boostSession.start": { $gte: currentDateFormat }
      //           },
      //           {
      //             "boosted.boostSession.end": { $gte: currentDateFormat }
      //           }
      //         ]
      //       }
      //     ]
      //   }      
      // },
      {
        $addFields: {
          boostJangkauan: { $size: "$boosted.boostViewer" },
          boostStart: "$boosted.boostSession.start",
          boostEnd: "$boosted.boostSession.end",
          boostDate: "$boosted.boostDate",
        }
      },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $and: [{ $lte: ["$boostStart", currentDateFormat] }, { $gte: ["$boostEnd", currentDateFormat] }] }, then: "BERLANGSUNG" },
                { case: { $and: [{ $gte: ["$boostStart", currentDateFormat] }, { $gte: ["$boostEnd", currentDateFormat] }] }, then: "AKAN DATANG" }
              ],
              "default": "SELESAI"
            }
          },
        }
      },
      { $sort: { status: -1, boostDate: -1 } },
      { $skip: (perPage * page) },
      { $limit: perPage },
    ])


    // var where = {};
    // where['email'] = whoami.email;
    // where['active'] = true;
    // where['boosted'] = { $ne: null };
    // where['boosted.1'] = { $exists: true };
    // const query = await this.PostsModel.find(where).limit(perPage).skip(perPage * page).sort({ 'postType': 1, 'createdAt': -1 });
    return query;
  }

  private async loadPostBoostData(posts: Posts[], iam: Userbasic): Promise<PostData[]> {
    //this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(posts));
    let pd = Array<PostData>();
    if (posts != undefined) {

      let vids: String[] = [];
      let pics: String[] = [];

      let postx: string[] = [];

      for (let i = 0; i < posts.length; i++) {
        let ps = posts[i];
        let pa = new PostData();

        pa.active = ps.active;
        pa.allowComments = ps.allowComments;
        pa.certified = ps.certified;
        pa.createdAt = String(ps.createdAt);
        pa.updatedAt = String(ps.updatedAt);
        pa.description = String(ps.description);
        pa.email = String(ps.email);
        pa.boosted = [ps.boosted];
        pa.isBoost = ps.isBoost;
        pa.boostJangkauan = ps['boostJangkauan'];
        pa.statusBoost = ps['status'];

        if (ps.reportedStatus != undefined) {
          pa.reportedStatus = ps.reportedStatus;
        }
        if (ps.reportedUserCount != undefined) {
          pa.reportedUserCount = Number(ps.reportedUserCount);
        }

        let following = await this.contentEventService.findFollowing(pa.email);

        if (ps.userProfile != undefined) {
          if (ps.userProfile?.namespace) {
            let oid = String(ps.userProfile.oid);
            let ua = await this.userService.findbyid(oid.toString());
            if (ua != undefined) {
              let ub = await this.userAuthService.findOneByEmail(ua.email);
              if (ub != undefined) {
                pa.username = ub.username;
              }

              pa.avatar = await this.getProfileAvatar(ua);
            } else {
              this.logger.log('oid: ' + oid + ' error');
            }
          }
        }

        pa.isApsara = false;
        pa.location = ps.location;
        pa.visibility = String(ps.visibility);

        if (ps.metadata != undefined) {
          let md = ps.metadata;
          let md1 = new Metadata();
          md1.duration = Number(md.duration);
          md1.email = String(md.email);
          md1.midRoll = Number(md.midRoll);
          md1.postID = String(md.postID);
          md1.postRoll = Number(md.postRoll);
          md1.postType = String(md.postType);
          md1.preRoll = Number(md.preRoll);
          md1.width = (md.width != undefined) ? Number(md.width) : 0;
          md1.height = (md.height != undefined) ? Number(md.height) : 0;
          pa.metadata = md1;
        }


        pa.postID = String(ps.postID);
        pa.postType = String(ps.postType);
        pa.saleAmount = ps.saleAmount;
        pa.saleLike = ps.saleLike;
        pa.saleView = ps.saleView;

        if (ps.tagPeople != undefined && ps.tagPeople.length > 0) {
          let atp = ps.tagPeople;
          let atp1 = Array<TagPeople>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.userAuthService.findById(oid.toString());
              if (ua != undefined) {
                let tp1 = new TagPeople();
                tp1.email = String(ua.email);
                tp1.username = String(ua.username);

                let ub = await this.userService.findOne(String(ua.email));
                if (ub != undefined) {
                  tp1.avatar = await this.getProfileAvatar(ub);
                }

                tp1.status = 'TOFOLLOW';
                if (tp1.email == pa.email) {
                  tp1.status = "UNLINK";
                } else {
                  for (let i = 0; i < following.length; i++) {
                    let fol = following[i];
                    if (fol.email == tp1.email) {
                      tp1.status = "FOLLOWING";
                    }
                  }
                }
                atp1.push(tp1);
              }
            }
          }

          pa.tagPeople = atp1;
        }

        if (ps.category != undefined && ps.category.length > 0) {
          let atp = ps.category;
          let atp1 = Array<Cat>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.interestService.findOne(oid.toString());
              if (ua != undefined) {
                let tp1 = new Cat();
                tp1._id = String(ua._id);
                tp1.interestName = String(ua.interestName);
                tp1.langIso = String(ua.langIso);
                tp1.icon = String(ua.icon);
                tp1.createdAt = String(ua.createdAt);
                tp1.updatedAt = String(ua.updatedAt);

                atp1.push(tp1);
              }
            }
          }
          pa.cats = atp1;
        }

        let privacy = new Privacy();
        privacy.isPostPrivate = false;
        privacy.isPrivate = false;
        privacy.isCelebrity = false;
        pa.privacy = privacy;

        //MEDIA
        let meds = ps.contentMedias;
        if (meds != undefined) {
          for (let i = 0; i < meds.length; i++) {
            let med = meds[i];
            let ns = med.namespace;
            if (ns == 'mediavideos') {
              let video = await this.videoService.findOne(String(med.oid));
              if (video.apsara == true) {
                vids.push(video.apsaraId);
                pa.apsaraId = String(video.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = video.mediaThumb;
                pa.mediaEndpoint = '/stream/' + video.mediaUri;
                pa.mediaThumbEndpoint = '/thumb/' + video.postID;
              }

              //mediatype
              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (video.viewers != undefined && video.viewers.length > 0) {
                for (let i = 0; i < video.viewers.length; i++) {
                  let vwt = video.viewers[i];
                  let vwns = vwt.namespace;
                  if (vwns == 'userbasics') {
                    let vw = await this.userService.findbyid(vwns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            } else if (ns == 'mediapicts') {
              let pic = await this.picService.findOne(String(med.oid));
              if (pic.apsara == true) {
                pics.push(pic.apsaraId);
                pa.apsaraId = String(pic.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaEndpoint = '/pict/' + pic.postID;
                pa.mediaUri = pic.mediaUri;
              }

              pa.mediaType = 'image';

              //isview
              pa.isViewed = false;
              if (pic.viewers != undefined && pic.viewers.length > 0) {
                for (let i = 0; i < pic.viewers.length; i++) {
                  let pct = pic.viewers[i];
                  let pcns = pct.namespace;
                  if (pcns == 'userbasics') {
                    let vw = await this.userService.findbyid(pcns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediadiaries') {
              let diary = await this.diaryService.findOne(String(med.oid));
              if (diary.apsara == true) {
                vids.push(diary.apsaraId);
                pa.apsaraId = String(diary.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = diary.mediaThumb;
                pa.mediaEndpoint = '/stream/' + diary.mediaUri;
                pa.mediaThumbEndpoint = '/thumb/' + diary.postID;
              }

              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (diary.viewers != undefined && diary.viewers.length > 0) {
                for (let i = 0; i < diary.viewers.length; i++) {
                  let drt = diary.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    let vw = await this.userService.findbyid(drns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediastories') {
              let story = await this.storyService.findOne(String(med.oid));

              if (story.mediaType == 'video') {
                if (story.apsara == true) {
                  vids.push(story.apsaraId);
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/stream/' + story.mediaUri;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'video';
              } else {
                if (story.apsara == true) {
                  pics.push(story.apsaraId);
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/pict/' + story.mediaUri;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'image';
              }

              //isview
              pa.isViewed = false;
              if (story.viewers != undefined && story.viewers.length > 0) {
                for (let i = 0; i < story.viewers.length; i++) {
                  let drt = story.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    let vw = await this.userService.findbyid(drns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        postx.push(pa.postID);
        pd.push(pa);
      }

      let insl = await this.contentEventService.findEventByEmail(String(iam.email), postx, 'LIKE');
      let insh = new Map();
      for (let i = 0; i < insl.length; i++) {
        let ins = insl[i];
        if (insh.has(String(ins.postID)) == false) {
          insh.set(ins.postID, ins.postID);
        }
      }

      if (vids.length > 0) {
        let res = await this.getVideoApsara(vids);
        if (res != undefined && res.VideoList != undefined && res.VideoList.length > 0) {
          for (let i = 0; i < res.VideoList.length; i++) {
            let vi = res.VideoList[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraId == vi.VideoId) {
                ps.mediaThumbEndpoint = vi.CoverURL;
              }
              if (insh.has(String(ps.postID))) {
                ps.isLiked = true;
              } else {
                ps.isLiked = false;
              }
            }
          }
        }
      }

      if (pics.length > 0) {
        let res = await this.getImageApsara(pics);
        if (res != undefined && res.ImageInfo != undefined && res.ImageInfo.length > 0) {
          for (let i = 0; i < res.ImageInfo.length; i++) {
            let vi = res.ImageInfo[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraId == vi.ImageId) {
                ps.mediaEndpoint = vi.URL;
                ps.mediaUri = vi.URL;

                ps.mediaThumbEndpoint = vi.URL;
                ps.mediaThumbUri = vi.URL;
              }

              if (ps.apsaraThumbId == vi.ImageId) {
                ps.mediaThumbEndpoint = vi.URL;
                ps.mediaThumbUri = vi.URL;
              }
              if (insh.has(String(ps.postID))) {
                ps.isLiked = true;
              } else {
                ps.isLiked = false;
              }
            }
          }
        }
      }
    }
    return pd;
  }

  async getUserPostByProfile(body: any, headers: any): Promise<PostResponseApps> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getuserposts/byprofile";
    var reqbody = JSON.parse(JSON.stringify(body));

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(body.email);
    var profile_ = await this.userService.findOne(headers['x-auth-user']);
    this.logger.log('getUserPost >>>> profile: ' + profile);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostTheir(body, headers, profile);
    let pd = await this.loadPostData(posts, body, profile_, profile);
    res.data = pd;

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  private async doGetUserPost(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    let st = await this.utilService.getDateTimeDate();
    var emailUser = headers['x-auth-user'];
    let queryx = this.PostsModel.find({
      $or: [
        {
          $and: [
            {
              "reportedUser.email": emailUser
            },
            {
              "reportedUser.active": false
            },

          ]
        },
        {
          "reportedUser.email": {
            $not: {
              $regex: emailUser
            }
          }
        },
      ]
    });
    let query = this.PostsModel.find();
    let con = true;
    if (body.visibility != undefined) {
      if (body.visibility == 'PRIVATE') {
        query.where('email', whoami.email);
      } else if (body.visibility == 'FOLLOWING') {
        let following = [];
        let check = await this.contentEventService.findFollowing(whoami.email);
        if (check != undefined) {
          for (let i = 0; i < check.length; i++) {
            var ce = check[i];
            if (ce.receiverParty != undefined && ce.receiverParty.length > 1) {
              following.push(ce.receiverParty);
            }
          }
        }

        if (following.length > 0) {
          query.where('visibility').in(['FRIEND', 'PUBLIC']);
          query.where('email').in(following);
        } else {
          con = false;
        }

        query.where('reportedStatus').ne('OWNED');
      } else if (body.visibility == 'FRIEND') {
        let friend: String[] = [];
        let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
        if (check != undefined) {
          for (let i = 0; i < check.length; i++) {
            var cex = check[i];
            friend.push(String(cex.friend));
          }
        }

        if (friend.length > 0) {
          friend.push(whoami.email);
          query.where('visibility').in(['FRIEND', 'PUBLIC']);
          query.where('email').in(friend);
        } else {
          query.where('visibility', 'PUBLIC');
          con = false;
        }
      } else {
        /*
        let friend :String[] = [];
        let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
        if (check != undefined) {
          for (let i = 0; i < check.length; i++) {
            var cex = check[i];
            friend.push(String(cex.friend));
          }
        }

        if (friend.length > 0) {
          friend.push(whoami.email);
          query.where('visibility').in(['FRIEND', 'PUBLIC']);
          query.where('email').in(friend);
        } else {
          query.where('visibility', 'PUBLIC');
        }
        */
        query.where('visibility', 'PUBLIC');
      }
    }

    if (con == true) {
      if (body.postID != undefined) {
        query.where('postID', body.postID);
      }

      if (body.postType != undefined) {
        query.where('postType', body.postType);
      } else {
        query.where('postType').ne('advertise');
      }

      if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
        query.where('active', true);
      }

      if (body.withExp != undefined && (body.withExp == 'true' || body.withExp == true)) {
        this.logger.log("doGetUserPost >>> story: 1679037971313");
        this.logger.log("doGetUserPost >>> today: " + this.utilService.now());
        this.logger.log("doGetUserPost >>> gte: " + this.utilService.generateExpirationFromToday(1));
        this.logger.log("doGetUserPost >>> ceck: " + (1679037971313 > this.utilService.now()));
        query.where('expiration').gte(this.utilService.now());
      }

      let row = 20;
      let page = 0;
      if (body.pageNumber != undefined) {
        page = body.pageNumber;
      }
      if (body.pageRow != undefined) {
        row = body.pageRow;
      }
      let skip = this.paging(page, row);
      query.skip(skip);
      query.limit(row);
      query.sort({ 'createdAt': 1, 'postType': 1 });
      let res = await query.exec();
      let ed = await this.utilService.getDateTimeDate();
      let gap = ed.getTime() - st.getTime();
      this.logger.log('doGetUserPost >>> exec time: ' + gap);
      return res;
    }

    return undefined;

  }

  private async doGetUserPostMy(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    var emailUser = headers['x-auth-user'];
    let query = this.PostsModel.find();
    query.where('email', whoami.email);
    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('active', true);
    }
    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'postType': 1, 'createdAt': -1 });
    let res = await query.exec();
    return res;
  }

  private async doGetUserPostTheir(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    var emailUser = headers['x-auth-user'];
    let query = this.PostsModel.find({ "reportedUser.email": { $not: { $regex: emailUser } }, reportedStatus: { $ne: "OWNED" } });
    query.where('email', whoami.email);
    //let friend = [];
    //let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
    //if (check != undefined) {
    //  for (let i = 0; i < check.length; i++) {
    //    var cex = check[i];
    //    friend.push(cex.friend);
    //  }
    //}

    //if (friend.length > 0) {
    //  friend.push(whoami.email);
    //  query.where('visibility').in(['FRIEND', 'PUBLIC']);
    //  query.where('email').in(friend);
    //} else {
    //  query.where('visibility', 'PUBLIC');
    //  query.where('email', whoami.email);
    // }
    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('active', true);
    }
    if (body.postType != undefined) {
      query.where('postType', body.postType);
      if (body.postType == "story") {
        query.where('expiration').gte(this.utilService.now());
      }
    } else {
      query.where('postType').ne('advertise');
    }
    query.where('visibility', 'PUBLIC');

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    if (body.postType == "story") {
      query.sort({ 'postType': 1, 'createdAt': 1 });
    } else {
      query.sort({ 'postType': 1, 'createdAt': -1 });
    }
    let res = await query.exec();
    return res;
  }

  private async loadBulk(ids: String[], page, row): Promise<Posts[]> {
    this.logger.log('loadBulk >>> start: ' + JSON.stringify(ids));
    let p: Posts[] = [];
    let query = this.PostsModel.find();
    query.where('_id').in(ids);
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'postType': 1, 'createdAt': -1 });
    let res = await query.exec();
    return res;
    //for (let i = 0; i < ids.length; i++) {
    //  let po = await this.PostsModel.findOne({ _id: ids[i] }).exec();
    //  if (po != undefined) {
    //    p.push(po);
    //  }
    //}
    //return p;
  }

  private async loadPostData(posts: Posts[], body: any, iam: Userbasic, iam2: Userbasic): Promise<PostData[]> {
    //this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(posts));
    var getVerified = false;
    var getFollowing = false;
    if (iam2.statusKyc != undefined) {
      if (iam2.statusKyc.toString() == "verified") {
        getVerified = true;
      }
    }
    var ceck_data_FOLLOW = await this.contentEventService.ceckData(String(iam.email), "FOLLOWING", "ACCEPT", "", iam2.email, "", true);
    if (await this.utilService.ceckData(ceck_data_FOLLOW)) {
      getFollowing = true;
    }
    let pd = Array<PostData>();
    if (posts != undefined) {

      let vids: String[] = [];
      let pics: String[] = [];

      let pics_thumnail: String[] = [];

      let postx: string[] = [];

      //GET THUMNAIL MUSIC
      let thumnail_data: string[] = [];
      for (let i = 0; i < posts.length; i++) {
        let data_item = posts[i];
        if (data_item.musicId != undefined) {
          var dataMusic = await this.mediamusicService.findOneMusic(data_item.musicId.toString());
          if (await this.utilService.ceckData(dataMusic)) {
            if (dataMusic.apsaraThumnail != undefined && dataMusic.apsaraThumnail != "" && dataMusic.apsaraThumnail != null) {
              thumnail_data.push(dataMusic.apsaraThumnail.toString());
            }
          }
        }
      }
      var dataApsaraThumnail = await this.mediamusicService.getImageApsara(thumnail_data);
      //GET THUMNAIL MUSIC

      for (let i = 0; i < posts.length; i++) {
        let ps = posts[i];
        let pa = new PostData();

        var ceck_data_DONE = await this.contentEventService.ceckData(String(iam.email), "LIKE", "DONE", ps.email.toString(), "", ps.postID.toString());

        if (await this.utilService.ceckData(ceck_data_DONE)) {
          if (ceck_data_DONE.active) {
            pa.isLiked = true;
          } else {
            pa.isLiked = false;
          }
        } else {
          pa.isLiked = false;
        }
        pa.active = ps.active;
        pa.allowComments = ps.allowComments;
        pa.certified = ps.certified;
        pa.createdAt = String(ps.createdAt);
        pa.updatedAt = String(ps.updatedAt);
        pa.description = String(ps.description);
        pa.email = String(ps.email);
        pa.following = getFollowing;
        pa.stiker = ps.stiker;

        //SET DISCUS/COMMENT
        var discus = await this.disqusService.findDisqusByPost(ps.postID.toString(), "COMMENT");
        if (await this.utilService.ceckData(discus)) {
          var discusLogCount = await this.disqusLogService.findDiscusLog_All(discus[0]._id.toString());
          var discusLog = await this.disqusLogService.findDiscusLog_(discus[0]._id.toString());
          var dataComment = [];
          if (discusLog.length > 0) {
            for (var g = 0; g < discusLog.length; g++) {
              console.log("🚀 ~ file: postcontent.service.ts:4046 ~ loadPostData ~ discusLog.length:", discusLog.length)
              if (g == 2) {
                break;
              }
              var dataComment_ = discusLog[g];
              console.log("🚀 ~ file: postcontent.service.ts:4050 ~ loadPostData ~ discusLog[t]:", discusLog[g])
              var senderCommentEmail = dataComment_.sender.toString();
              var senderComment = await this.userAuthService.findOne(senderCommentEmail);
              var json = JSON.parse(JSON.stringify(dataComment_));
              json['userComment'] = {
                _id: senderComment._id.toString(),
                username: senderComment.username.toString(),
              }
              dataComment.push(json);
            }
            pa.comment = dataComment;
          } else {
            pa.comment = [];
          }
          pa.comments = discusLogCount.length;
        } else {
          pa.comment = [];
          pa.comments = 0;
        }

        //SET DATA BOOST
        var boostedRes = [];
        if (ps.boosted != undefined) {
          if (ps.boosted.length > 0) {
            pa.boosted = ps.boosted;
            pa.isBoost = ps.isBoost;
            for (var p = 0; p < ps.boosted.length; p++) {
              var CurrentDate = new Date(await (await this.utilService.getDateTime()).toISOString());
              console.log("CurrentDate", CurrentDate);

              var DateBoostStart = new Date(ps.boosted[p].boostSession.start.split(" ")[0] + "T" + ps.boosted[p].boostSession.start.split(" ")[1] + ".000Z")
              var DateBoostEnd = new Date(ps.boosted[p].boostSession.end.split(" ")[0] + "T" + ps.boosted[p].boostSession.end.split(" ")[1] + ".000Z")
              console.log("DateBoostStart", DateBoostStart);
              console.log("DateBoostEnd", DateBoostEnd);
              console.log("CurrentDate", CurrentDate);
              var boostedData = {};
              var boostedStatus = "TIDAK ADA";
              if ((DateBoostStart < CurrentDate) && (CurrentDate < DateBoostEnd)) {
                boostedStatus = "BERLANGSUNG";
                boostedData["type"] = ps.boosted[p].type
                boostedData["boostDate"] = ps.boosted[p].boostDate
                boostedData["boostInterval"] = ps.boosted[p].boostInterval
                boostedData["boostSession"] = ps.boosted[p].boostSession
                boostedData["boostViewer"] = ps.boosted[p].boostViewer
              } else if ((DateBoostStart > CurrentDate) && (DateBoostEnd > CurrentDate)) {
                boostedStatus = "AKAN DATANG";
                boostedData["type"] = ps.boosted[p].type
                boostedData["boostDate"] = ps.boosted[p].boostDate
                boostedData["boostInterval"] = ps.boosted[p].boostInterval
                boostedData["boostSession"] = ps.boosted[p].boostSession
                boostedData["boostViewer"] = ps.boosted[p].boostViewer
              }

              if (Object.keys(boostedData).length > 0) {
                boostedRes.push(boostedData);
              }
            }

            pa.boosted = boostedRes;
            if (boostedRes.length > 0) {
              pa.boostJangkauan = (boostedRes[0].boostViewer != undefined) ? boostedRes[0].boostViewer.length : 0;
            }
            pa.statusBoost = boostedStatus;
          }
        }
        //SET DATA BOOST

        //SET DATA REPORT
        if (ps.reportedStatus != undefined) {
          pa.reportedStatus = ps.reportedStatus;
        }
        if (ps.reportedUserCount != undefined) {
          pa.reportedUserCount = Number(ps.reportedUserCount);
        }
        //SET DATA REPORT

        //SET DATA MUSIC
        var music = {}
        if (ps.musicId != undefined) {
          var dataMusic = await this.mediamusicService.findOneMusic(ps.musicId.toString());
          if (await this.utilService.ceckData(dataMusic)) {
            music["_id"] = ps.musicId.toString()
            music["musicTitle"] = dataMusic.musicTitle;
            music["artistName"] = dataMusic.artistName;
            music["albumName"] = dataMusic.albumName;
            music["apsaraMusic"] = dataMusic.apsaraMusic;
            music["apsaraThumnail"] = dataMusic.apsaraThumnail;
            console.log(dataMusic.apsaraThumnail)
            if (dataMusic.apsaraThumnail != undefined && dataMusic.apsaraThumnail != "" && dataMusic.apsaraThumnail != null) {
              music["apsaraThumnailUrl"] = dataApsaraThumnail.ImageInfo.find(x => x.ImageId == dataMusic.apsaraThumnail).URL;
            }
          }
        }
        pa.music = music;
        //SET DATA MUSIC

        let following = await this.contentEventService.findFollowing(pa.email);

        if (ps.userProfile != undefined) {
          if (ps.userProfile?.namespace) {
            let oid = String(ps.userProfile.oid);
            let ua = await this.userService.findbyid(oid.toString());

            if (ua != undefined) {
              let ubadge = await this.userService.findone_(ua.email.toString());
              let ub = await this.userAuthService.findOneByEmail(ua.email);
              if (ub != undefined) {
                pa.username = ub.username;
              }
              pa.isIdVerified = ua.isIdVerified;
              pa.avatar = await this.getProfileAvatar(ua);
              pa.urluserBadge = ubadge.urluserBadge;
            } else {
              this.logger.log('oid: ' + oid + ' error');
            }
          }
        }

        pa.isApsara = false;
        pa.location = ps.location;
        pa.visibility = String(ps.visibility);

        if (ps.metadata != undefined) {
          let md = ps.metadata;
          let md1 = new Metadata();
          md1.duration = Number(md.duration);
          md1.email = String(md.email);
          md1.midRoll = Number(md.midRoll);
          md1.postID = String(md.postID);
          md1.postRoll = Number(md.postRoll);
          md1.postType = String(md.postType);
          md1.preRoll = Number(md.preRoll);
          md1.width = (md.width != undefined) ? Number(md.width) : 0;
          md1.height = (md.height != undefined) ? Number(md.height) : 0;
          pa.metadata = md1;
        }

        if (ps.isShared != undefined) {
          pa.isShared = ps.isShared;
        } else {
          pa.isShared = true;
        }

        pa.postID = String(ps.postID);
        pa.postType = String(ps.postType);
        pa.saleAmount = ps.saleAmount;
        pa.saleLike = ps.saleLike;
        pa.saleView = ps.saleView;



        if (ps.tagPeople != undefined && ps.tagPeople.length > 0) {
          let atp = ps.tagPeople;
          let atp1 = Array<TagPeople>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[x];
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.userAuthService.findById(oid.toString());
              if (ua != undefined) {
                let tp1 = new TagPeople();
                tp1.email = String(ua.email);
                tp1.username = String(ua.username);

                let ub = await this.userService.findOne(String(ua.email));
                if (ub != undefined) {
                  tp1.avatar = await this.getProfileAvatar(ub);
                }

                tp1.status = 'TOFOLLOW';
                if (tp1.email == pa.email) {
                  tp1.status = "UNLINK";
                } else {
                  for (let i = 0; i < following.length; i++) {
                    let fol = following[i];
                    if (fol.email == tp1.email) {
                      tp1.status = "FOLLOWING";
                    }
                  }
                }
                atp1.push(tp1);
              }
            }
          }

          pa.tagPeople = atp1;
        }

        if (ps.category != undefined && ps.category.length > 0) {
          let atp = ps.category;
          let atp1 = Array<Cat>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[x];
            console.log(JSON.stringify(tp));
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.interestService.findOne(oid.toString());
              if (ua != undefined) {
                let tp1 = new Cat();
                tp1._id = String(ua._id);
                tp1.interestName = String(ua.interestName);
                tp1.langIso = String(ua.langIso);
                tp1.icon = String(ua.icon);
                tp1.createdAt = String(ua.createdAt);
                tp1.updatedAt = String(ua.updatedAt);

                atp1.push(tp1);
              }
            }
          }
          pa.cats = atp1;
        }

        let privacy = new Privacy();
        privacy.isPostPrivate = false;
        privacy.isPrivate = false;
        privacy.isCelebrity = false;
        privacy.isIdVerified = getVerified;
        pa.privacy = privacy;

        if (body.tags != undefined) {
          let txs: string[] = [];
          for (let i = 0; i < body.tags.length; i++) {
            let oo = String(body.tags[i]);
            if (oo.length > 0) {
              txs.push(oo);
            }
          }
          pa.tags = txs;
        }

        //Insight

        if ((body.withInsight != undefined && (body.withInsight == true || body.withInsight == 'true'))) {
          //let insight = await this.insightService.findemail(String(ps.email));
          //if (insight == undefined) {
          //  continue;
          //}

          let tmp = new InsightPost();
          //tmp.follower = Number(ps.followers);
          //tmp.following = Number(insight.followings);
          tmp.likes = Number(ps.likes);
          tmp.views = Number(ps.views);
          tmp.shares = Number(ps.shares);
          tmp.comments = Number(ps.comments);
          //tmp.reactions = Number(ps.reactions);
          pa.insight = tmp;

        }

        //MEDIA
        let meds = ps.contentMedias;
        if (meds != undefined) {
          for (let i = 0; i < meds.length; i++) {
            let med = meds[i];
            let ns = med.namespace;
            if (ns == 'mediavideos') {
              let video = await this.videoService.findOne(String(med.oid));
              if (video.apsara == true) {
                vids.push(video.apsaraId);
                pa.apsaraId = String(video.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = video.mediaThumb;
                pa.mediaEndpoint = '/stream/' + video.postID;
                pa.mediaThumbEndpoint = '/thumb/' + video.postID;
              }

              //mediatype
              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (video.viewers != undefined && video.viewers.length > 0) {
                for (let i = 0; i < video.viewers.length; i++) {
                  let vwt = video.viewers[i];
                  let vwns = vwt.namespace;
                  if (vwns == 'userbasics') {
                    let vw = await this.userService.findbyid(vwns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            } else if (ns == 'mediapicts') {
              let pic = await this.picService.findOne(String(med.oid));
              if (pic.apsara == true) {
                pics.push(pic.apsaraId);
                if (pic.apsaraThumbId != undefined) {
                  pics_thumnail.push(pic.apsaraThumbId);
                } else {
                  pics_thumnail.push(pic.apsaraId);
                }
                pa.apsaraId = String(pic.apsaraId);
                pa.isApsara = true;
                if (pic.apsaraThumbId != undefined) {
                  pa.apsaraThumbId = String(pic.apsaraThumbId);
                } else {
                  pa.apsaraThumbId = String(pic.apsaraId);
                }
              } else {
                pa.mediaThumbEndpoint = '/thumb/' + pic.postID;
                pa.mediaEndpoint = '/pict/' + pic.postID;
                pa.mediaUri = pic.mediaUri;
              }

              pa.mediaType = 'image';

              //isview
              pa.isViewed = false;
              if (pic.viewers != undefined && pic.viewers.length > 0) {
                for (let i = 0; i < pic.viewers.length; i++) {
                  let pct = pic.viewers[i];
                  let pcns = pct.namespace;
                  if (pcns == 'userbasics') {
                    let vw = await this.userService.findbyid(pcns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediadiaries') {
              let diary = await this.diaryService.findOne(String(med.oid));
              if (diary.apsara == true) {
                vids.push(diary.apsaraId);
                pa.apsaraId = String(diary.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = diary.mediaThumb;
                pa.mediaEndpoint = '/stream/' + diary.postID;
                pa.mediaThumbEndpoint = '/thumb/' + diary.postID;
              }

              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (diary.viewers != undefined && diary.viewers.length > 0) {
                for (let i = 0; i < diary.viewers.length; i++) {
                  let drt = diary.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    let vw = await this.userService.findbyid(drns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediastories') {
              let story = await this.storyService.findOne(String(med.oid));

              if (story.mediaType == 'video') {
                if (story.apsara == true) {
                  vids.push(story.apsaraId);
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/stream/' + story.postID;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'video';
              } else {
                if (story.apsara == true) {
                  pics.push(story.apsaraId);
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/pict/' + story.postID;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'image';
              }

              //isview
              pa.isViewed = false;
              if (ps.viewer != undefined && ps.viewer.length > 0) {
                for (let i = 0; i < ps.viewer.length; i++) {
                  let drt = ps.viewer[i];
                  //let drns = drt.namespace;
                  //if (drns == 'userbasics') {
                  //let vw = await this.userService.findbyid(drns.oid);
                  if (drt == iam.email) {
                    pa.isViewed = true;
                    break;
                  }
                  //}
                }
              }
            }
          }
        }

        postx.push(pa.postID);
        pd.push(pa);
      }

      let insl = await this.contentEventService.findEventByEmail(String(iam.email), postx, 'LIKE');
      let insh = new Map();
      for (let i = 0; i < insl.length; i++) {
        let ins = insl[i];
        if (insh.has(String(ins.postID)) == false) {
          insh.set(ins.postID, ins.postID);
        }
      }

      if (vids.length > 0) {
        let res = await this.getVideoApsara(vids);
        if (res != undefined && res.VideoList != undefined && res.VideoList.length > 0) {
          for (let i = 0; i < res.VideoList.length; i++) {
            let vi = res.VideoList[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraId == vi.VideoId) {
                ps.mediaThumbEndpoint = vi.CoverURL;
              }
              if (insh.has(String(ps.postID))) {
                ps.isLiked = true;
              } else {
                ps.isLiked = false;
              }
            }
          }
        }
      }

      if (pics.length > 0) {
        let res = await this.getImageApsara(pics);
        if (res != undefined && res.ImageInfo != undefined && res.ImageInfo.length > 0) {
          for (let i = 0; i < res.ImageInfo.length; i++) {
            let vi = res.ImageInfo[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraId == vi.ImageId) {
                ps.mediaEndpoint = vi.URL;
                ps.mediaUri = vi.URL;

                //ps.mediaThumbEndpoint = vi.URL;
                //ps.mediaThumbUri = vi.URL;
              }
              if (insh.has(String(ps.postID))) {
                ps.isLiked = true;
              } else {
                ps.isLiked = false;
              }
            }
          }
        }

        let res2 = await this.getImageApsara(pics_thumnail);
        if (res2 != undefined && res2.ImageInfo != undefined && res2.ImageInfo.length > 0) {
          for (let i = 0; i < res2.ImageInfo.length; i++) {
            let vi = res2.ImageInfo[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraThumbId == vi.ImageId) {
                ps.mediaThumbEndpoint = vi.URL;
                ps.mediaThumbUri = vi.URL;
              }
            }
          }
        }
      }
    }
    return pd;
  }

  private async loadPostDataBulk(posts: Posts[], body: any, iam: Userbasic, xvids: string[], xpics: string[], user: string[]): Promise<PostData[]> {
    //this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(posts));
    let st = await this.utilService.getDateTimeDate();
    let pd = Array<PostData>();
    if (posts != undefined) {

      for (let i = 0; i < posts.length; i++) {
        let ps = posts[i];
        let pa = new PostData();

        pa.active = ps.active;
        pa.allowComments = ps.allowComments;
        pa.certified = ps.certified;
        pa.createdAt = String(ps.createdAt);
        pa.updatedAt = String(ps.updatedAt);
        pa.description = String(ps.description);
        pa.email = String(ps.email);
        pa.username = pa.email;
        user.push(pa.email);

        //let following = await this.contentEventService.findFollowing(pa.email);

        //if (ps.userProfile != undefined) {
        //  if (ps.userProfile?.namespace) {
        //    let oid = String(ps.userProfile.oid);
        //    pa.username = oid;
        //pa.avatar = oid;
        /*
        let ua = await this.userService.findbyid(oid.toString());
        if (ua != undefined) {
          let ub = await this.userAuthService.findOneByEmail(ua.email);
          if (ub != undefined) {
            pa.username = ub.username;
          }

          pa.avatar = await this.getProfileAvatar(ua);
        } else {
          this.logger.log('oid: ' + oid + ' error');
        }*/

        //  }

        //}

        pa.isApsara = false;
        pa.location = ps.location;
        pa.visibility = String(ps.visibility);

        if (ps.metadata != undefined) {
          let md = ps.metadata;
          let md1 = new Metadata();
          md1.duration = Number(md.duration);
          md1.email = String(md.email);
          md1.midRoll = Number(md.midRoll);
          md1.postID = String(md.postID);
          md1.postRoll = Number(md.postRoll);
          md1.postType = String(md.postType);
          md1.preRoll = Number(md.preRoll);
          md1.width = (md.width != undefined) ? Number(md.width) : 0;
          md1.height = (md.height != undefined) ? Number(md.height) : 0;
          pa.metadata = md1;
        }


        pa.postID = String(ps.postID);
        pa.postType = String(ps.postType);
        pa.saleAmount = ps.saleAmount;
        pa.saleLike = ps.saleLike;
        pa.saleView = ps.saleView;

        if (ps.tagPeople != undefined && ps.tagPeople.length > 0) {
          let atp = ps.tagPeople;
          let atp1 = Array<TagPeople>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              let tp1 = new TagPeople();
              tp1.username = oid;
              /*
              let ua = await this.userAuthService.findById(oid.toString());
              if (ua != undefined) {
                let tp1 = new TagPeople();
                tp1.email = String(ua.email);
                tp1.username = String(ua.username);

                let ub = await this.userService.findOne(String(ua.email));
                if (ub != undefined) {
                  tp1.avatar = await this.getProfileAvatar(ub);
                }

                tp1.status = 'TOFOLLOW';
                if (tp1.email == pa.email) {
                  tp1.status = "UNLINK";
                } else {
                  for (let i = 0; i < following.length; i++) {
                    let fol = following[i];
                    if (fol.email == tp1.email) {
                      tp1.status = "FOLLOWING";
                    }
                  }
                }
                atp1.push(tp1);
              }
              */
              atp1.push(tp1);
              user.push(oid);
            }
          }

          pa.tagPeople = atp1;
        }

        if (ps.category != undefined && ps.category.length > 0) {
          let atp = ps.category;
          let atp1 = Array<Cat>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.interestService.findOne(oid.toString());
              if (ua != undefined) {
                let tp1 = new Cat();
                tp1._id = String(ua._id);
                tp1.interestName = String(ua.interestName);
                tp1.langIso = String(ua.langIso);
                tp1.icon = String(ua.icon);
                tp1.createdAt = String(ua.createdAt);
                tp1.updatedAt = String(ua.updatedAt);

                atp1.push(tp1);
              }
            }
          }
          pa.cats = atp1;
        }

        let privacy = new Privacy();
        privacy.isPostPrivate = false;
        privacy.isPrivate = false;
        privacy.isCelebrity = false;
        pa.privacy = privacy;

        pa.tags = ps.tags;

        //Insight

        if ((body.withInsight != undefined && (body.withInsight == true || body.withInsight == 'true'))) {
          /*
          let insight = await this.insightService.findemail(String(ps.email));
          if (insight == undefined) {
            continue;
          }
          */
          let tmp = new InsightPost();
          //tmp.follower = Number(ps.fo);
          //tmp.following = Number(insight.followings);
          tmp.likes = Number(ps.likes);
          tmp.views = Number(ps.views);
          tmp.shares = Number(ps.shares);
          tmp.comments = Number(ps.comments);
          //tmp.reactions = Number(ps.reactions);
          pa.insight = tmp;

        }

        //MEDIA
        let meds = ps.contentMedias;
        if (meds != undefined) {
          for (let i = 0; i < meds.length; i++) {
            let med = meds[i];
            let ns = med.namespace;
            if (ns == 'mediavideos') {
              let video = await this.videoService.findOne(String(med.oid));
              if (video.apsara == true) {
                xvids.push(String(video.apsaraId));
                pa.apsaraId = String(video.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = video.mediaThumb;
                pa.mediaEndpoint = '/stream/' + video.postID;
                pa.mediaThumbEndpoint = '/thumb/' + video.postID;
              }

              //mediatype
              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;

              if (video.viewers != undefined && video.viewers.length > 0) {
                for (let i = 0; i < video.viewers.length; i++) {
                  let vwt = video.viewers[i];
                  let vwns = vwt.namespace;
                  if (vwns == 'userbasics') {
                    if (String(vwt.oid) == String(iam._id.oid)) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }


            } else if (ns == 'mediapicts') {
              let pic = await this.picService.findOne(String(med.oid));
              if (pic.apsara == true) {
                xpics.push(String(pic.apsaraId));
                if (pic.apsaraThumbId != undefined) {
                  xpics.push(String(pic.apsaraThumbId));
                } else {
                  xpics.push(String(pic.apsaraId));
                }
                pa.apsaraId = String(pic.apsaraId);
                pa.apsaraThumbId = String(pic.apsaraThumbId);
                pa.isApsara = true;
              } else {
                pa.mediaEndpoint = '/pict/' + pic.postID;
                pa.mediaUri = pic.mediaUri;
              }

              pa.mediaType = 'image';

              //isview
              pa.isViewed = false;

              if (pic.viewers != undefined && pic.viewers.length > 0) {
                for (let i = 0; i < pic.viewers.length; i++) {
                  let pct = pic.viewers[i];
                  let pcns = pct.namespace;
                  if (pcns == 'userbasics') {
                    if (String(pct.oid) == String(iam._id.oid)) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            } else if (ns == 'mediadiaries') {
              let diary = await this.diaryService.findOne(String(med.oid));
              if (diary.apsara == true) {
                xvids.push(String(diary.apsaraId));
                pa.apsaraId = String(diary.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = diary.mediaThumb;
                pa.mediaEndpoint = '/stream/' + diary.postID;
                pa.mediaThumbEndpoint = '/thumb/' + diary.postID;
              }

              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;

              if (diary.viewers != undefined && diary.viewers.length > 0) {
                for (let i = 0; i < diary.viewers.length; i++) {
                  let drt = diary.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    if (String(drt.oid) == String(iam._id.oid)) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            } else if (ns == 'mediastories') {
              let story = await this.storyService.findOne(String(med.oid));

              if (story.mediaType == 'video') {
                if (story.apsara == true) {
                  xvids.push(String(story.apsaraId));
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/stream/' + story.postID;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'video';
              } else {
                if (story.apsara == true) {
                  xpics.push(String(story.apsaraId));
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/pict/' + story.postID;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'image';
              }

              //isview
              pa.isViewed = false;

              if (story.viewers != undefined && story.viewers.length > 0) {
                for (let i = 0; i < story.viewers.length; i++) {
                  let drt = story.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    let a = String(drt.oid);
                    let b = String(iam._id);
                    if (a == b) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            }
          }
        }
        pd.push(pa);
      }
    }
    let ed = await this.utilService.getDateTimeDate();
    let gap = ed.getTime() - st.getTime();
    this.logger.log('loadPostDataBulk >>> exec time: ' + gap);
    return pd;
  }

  private async buildDataRef(posts: Posts[], body: any, iam: Userbasic): Promise<PostBuildData> {
    let res = new PostBuildData();
    let xvids = new Map();
    let xpics = new Map();
    let xdiary = new Map();
    let xstory = new Map();
    let xuser = new Map();
    let ins = new Map();

    if (posts != undefined) {

      for (let i = 0; i < posts.length; i++) {
        let ps = posts[i];

        if (ps.userProfile != undefined) {
          if (ps.userProfile?.namespace) {
            let oid = String(ps.userProfile.oid);
            xuser.set(oid, oid);
          }
        }

        if (ps.tagPeople != undefined && ps.tagPeople.length > 0) {
          let atp = ps.tagPeople;

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              xuser.set(oid, oid);
            }
          }
        }

        ins.set(String(ps.email), String(ps.email));

        let meds = ps.contentMedias;
        if (meds != undefined) {
          for (let i = 0; i < meds.length; i++) {
            let med = meds[i];
            let ns = med.namespace;
            if (ns == 'mediavideos') {
              xvids.set(String(med.oid), String(med.oid));
            } else if (ns == 'mediapicts') {
              xpics.set(String(med.oid), String(med.oid));
            } else if (ns == 'mediadiaries') {
              xdiary.set(String(med.oid), String(med.oid));
            } else if (ns == 'mediastories') {
              xstory.set(String(med.oid), String(med.oid));
            }
          }
        }
      }

      let tmpvid = Array.from(xvids.values());
      if (tmpvid.length > 0) {
        let vids = await this.videoService.findByIds(tmpvid);
        console.log(vids);
      }
    }

    return res;
  }

  public async getVideoApsara(ids: String[]): Promise<ApsaraVideoResponse> {
    let san: String[] = [];
    for (let i = 0; i < ids.length; i++) {
      let obj = ids[i];
      if (obj != undefined && obj != 'undefined') {
        san.push(obj);
      }
    }

    let tx = new ApsaraVideoResponse();
    let vl: VideoList[] = [];
    let chunk = this.chunkify(san, 15);
    for (let i = 0; i < chunk.length; i++) {
      let c = chunk[i];

      let vids = c.join(',');
      this.logger.log("getVideoApsara >>> video id: " + vids);
      var RPCClient = require('@alicloud/pop-core').RPCClient;

      let client = new RPCClient({
        accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
        accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
        endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
        apiVersion: '2017-03-21'
      });

      let params = {
        "RegionId": this.configService.get("APSARA_REGION_ID"),
        "VideoIds": vids
      }

      let requestOption = {
        method: 'POST'
      };

      try {
        let dto = new ApsaraVideoResponse();
        let result = await client.request('GetVideoInfos', params, requestOption);
        let ty: ApsaraVideoResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));
        if (ty.VideoList.length > 0) {
          for (let x = 0; x < ty.VideoList.length; x++) {
            let vv = ty.VideoList[x];
            vl.push(vv);
          }
        }
      } catch (ex) {

      }
    }
    tx.VideoList = vl;

    return tx;
  }

  public async getImageApsara(ids: String[]): Promise<ApsaraImageResponse> {
    let san: String[] = [];
    for (let i = 0; i < ids.length; i++) {
      let obj = ids[i];
      if (obj != undefined && obj != 'undefined') {
        san.push(obj);
      }
    }

    let tx = new ApsaraImageResponse();
    let vl: ImageInfo[] = [];
    let chunk = this.chunkify(san, 15);
    for (let i = 0; i < chunk.length; i++) {
      let c = chunk[i];

      let vids = c.join(',');
      this.logger.log("getImageApsara >>> video id: " + vids);
      var RPCClient = require('@alicloud/pop-core').RPCClient;

      let client = new RPCClient({
        accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
        accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
        endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
        apiVersion: '2017-03-21'
      });

      let params = {
        "RegionId": this.configService.get("APSARA_REGION_ID"),
        "ImageIds": vids
      }

      let requestOption = {
        method: 'POST'
      };

      try {
        let dto = new ApsaraImageResponse();
        let result = await client.request('GetImageInfos', params, requestOption);
        let ty: ApsaraImageResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));
        this.logger.log("getImageApsara >>> result: " + ty);

        if (ty.ImageInfo.length > 0) {
          for (let x = 0; x < ty.ImageInfo.length; x++) {
            let vv = ty.ImageInfo[x];
            vl.push(vv);
          }
        }
      } catch (e) {
        console.log(e.toString());
      }
    }
    tx.ImageInfo = vl;
    return tx;
  }

  public async getVideoApsaraSingleNoDefinition(ids: String): Promise<ApsaraPlayResponse> {
    this.logger.log('getVideoApsaraSingle >>> start: ' + ids);
    var RPCClient = require('@alicloud/pop-core').RPCClient;

    let client = new RPCClient({
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
      endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
      apiVersion: '2017-03-21'
    });

    let params = {
      "RegionId": this.configService.get("APSARA_REGION_ID"),
      "VideoId": ids
    }

    let requestOption = {
      method: 'POST'
    };

    let result = await client.request('GetPlayInfo', params, requestOption);
    let xres = new ApsaraPlayResponse();
    this.logger.log('getVideoApsaraSingle >>> response: ' + JSON.stringify(result));
    if (result != null && result.PlayInfoList != null && result.PlayInfoList.PlayInfo && result.PlayInfoList.PlayInfo.length > 0) {
      xres.PlayUrl = result.PlayInfoList.PlayInfo[0].PlayURL;
      xres.Duration = result.PlayInfoList.PlayInfo[0].Duration;
    }
    console.log("APSARA VIDEO GET", JSON.stringify(xres))
    return xres;
  }

  public async getVideoApsaraSingle(ids: String, definition: String): Promise<ApsaraPlayResponse> {
    this.logger.log('getVideoApsaraSingle >>> start: ' + ids);
    var RPCClient = require('@alicloud/pop-core').RPCClient;

    let client = new RPCClient({
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
      endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
      apiVersion: '2017-03-21'
    });

    let params = {
      "RegionId": this.configService.get("APSARA_REGION_ID"),
      "VideoId": ids,
      "Definition": definition
    }

    let requestOption = {
      method: 'POST'
    };

    let result = await client.request('GetPlayInfo', params, requestOption);
    let xres = new ApsaraPlayResponse();
    this.logger.log('getVideoApsaraSingle >>> response: ' + JSON.stringify(result));
    if (result != null && result.PlayInfoList != null && result.PlayInfoList.PlayInfo && result.PlayInfoList.PlayInfo.length > 0) {
      xres.PlayUrl = result.PlayInfoList.PlayInfo[0].PlayURL;
      xres.Duration = result.PlayInfoList.PlayInfo[0].Duration;
    }
    console.log("APSARA VIDEO GET", JSON.stringify(xres))
    return xres;
  }

  public async getVideoPlayAuth(ids: String, link: string, email: string): Promise<ApsaraPlayResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();

    this.logger.log('getVideoApsaraSingle >>> start: ' + ids);
    var RPCClient = require('@alicloud/pop-core').RPCClient;

    let client = new RPCClient({
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
      endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
      apiVersion: '2017-03-21'
    });

    let params = {
      "RegionId": this.configService.get("APSARA_REGION_ID"),
      "VideoId": ids,
      "AuthInfoTimeout": 3000,
      "ApiVersion": '1.0.0',
    }

    let requestOption = {
      method: 'POST'
    };

    try {
      let result = await client.request('GetVideoPlayAuth', params, requestOption);
      let xres = new GetVideoPlayAuthResponse();
      this.logger.log('getVideoApsaraSingle >>> response: ' + JSON.stringify(result));
      console.log("APSARA VIDEO GET", JSON.stringify(result))

      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(link, timestamps_start, timestamps_end, email, null, null, null);

      return result;
    } catch (e) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(link, timestamps_start, timestamps_end, email, null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, ' + e,
      );
    }
  }

  public async getApsaraSts(): Promise<any> {
    const StsClient = require('@alicloud/sts-sdk');

    const sts = new StsClient({
      endpoint: 'sts.aliyuncs.com',
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
    });
    const res2 = await sts.getCallerIdentity();
    const res1 = await sts.assumeRole(`acs:ram::${"5454753205280549"}:role/${"aliyunvoddefaultrole"}`, 'xxx');
    return res1;
  }

  public async getVideoApsaraSingleV4(ids: String, definition: String) {
    this.logger.log('getVideoApsaraSingle >>> start: ' + ids);
    var RPCClient = require('@alicloud/pop-core').RPCClient;

    let client = new RPCClient({
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
      endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
      apiVersion: '2017-03-21'
    });

    let requestOption = {
      method: 'POST'
    };

    try {

      let params = {
        "RegionId": this.configService.get("APSARA_REGION_ID"),
        "VideoId": ids,
        "Definition": definition
      }

      let result = await client.request('GetPlayInfo', params, requestOption);
      let xres = new ApsaraPlayResponse();
      this.logger.log('getVideoApsaraSingle >>> response: ' + JSON.stringify(result));
      if (result != null && result.PlayInfoList != null && result.PlayInfoList.PlayInfo && result.PlayInfoList.PlayInfo.length > 0) {
        xres.PlayUrl = result.PlayInfoList.PlayInfo[0].PlayURL;
        xres.Duration = result.PlayInfoList.PlayInfo[0].Duration;
      }
      console.log("APSARA VIDEO GET", JSON.stringify(xres))
      return xres;
    } catch {
      let params = {
        "RegionId": this.configService.get("APSARA_REGION_ID"),
        "VideoId": ids,
        "Definition": "OD"
      }

      let result = await client.request('GetPlayInfo', params, requestOption);
      let xres = new ApsaraPlayResponse();
      this.logger.log('getVideoApsaraSingle >>> response: ' + JSON.stringify(result));
      if (result != null && result.PlayInfoList != null && result.PlayInfoList.PlayInfo && result.PlayInfoList.PlayInfo.length > 0) {
        xres.PlayUrl = result.PlayInfoList.PlayInfo[0].PlayURL;
        xres.Duration = result.PlayInfoList.PlayInfo[0].Duration;
      }
      console.log("APSARA VIDEO GET", JSON.stringify(xres))
      return xres;
    }
  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }

  private chunkify(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }

  public async getProfileAvatar2(profile: Userbasic) {
    console.log(profile);
    let AvatarDTO_ = new Avatar();
    var get_profilePict = null;
    if (profile.profilePict != null) {
      var mediaprofilepicts_json = JSON.parse(JSON.stringify(profile.profilePict));
      get_profilePict = await this.profilePictService.findOne(mediaprofilepicts_json.$id);
    }

    if (await this.utilService.ceckData(get_profilePict)) {
      AvatarDTO_.mediaBasePath = get_profilePict.mediaBasePath;
      AvatarDTO_.mediaUri = get_profilePict.mediaUri;
      AvatarDTO_.mediaType = get_profilePict.mediaType;
      AvatarDTO_.mediaEndpoint = '/profilepict/' + get_profilePict.mediaID;
    }
    return AvatarDTO_;
  }

  public async getProfileAvatar(profile: Userbasic) {
    if (profile == undefined || profile.profilePict == undefined) {
      return undefined;
    }

    let cm = profile.profilePict;
    let ns = cm.namespace;
    if (ns == 'mediaprofilepicts') {
      let pp = await this.profilePictService.findOne(cm.oid);
      if (pp == undefined) {
        return;
      }

      let av = new Avatar();
      av.mediaBasePath = String(pp.mediaBasePath);
      av.mediaType = String(pp.mediaType);
      av.mediaUri = String(pp.mediaUri);
      av.mediaEndpoint = '/profilepict/' + pp.mediaID;
      return av;
    }
    return undefined;
  }

  public async generateCertificate(postId: string, lang: string): Promise<string> {

    this.logger.log('generateCertificate >>> post: ' + postId + ', lang: ' + lang);
    const cheerio = require('cheerio');
    const QRCode = require('qrcode');
    const pdfWriter = require('html-pdf-node');

    let post = await this.PostsModel.findOne({ postID: postId }).exec();
    if (post == undefined) {
      this.logger.error('generateCertificate >>> get post: undefined');
      return undefined;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', post validated');
    if (post.certified == false) {
      this.logger.error('generateCertificate >>> get post certified: ' + post.certified);
      return undefined;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', post certified validated');
    let profile = await this.userService.findOne(String(post.email));
    if (profile == undefined) {
      this.logger.error('generateCertificate >>> validate profile: ' + post.email);
      return undefined;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', profile validated');
    let fileName = post.postID + ".pdf";

    let postType = 'HyppeVid';

    if (post.postType == 'vid') {
      postType = "HyppeVid";
    } else if (post.postType == 'diary') {
      postType = "HyppeDiary";
    } else if (post.postType == 'pict') {
      postType = "HyppePic";
    }

    let template = await this.templateService.findTemplateCreatePost();
    let body = template.body_detail;
    if (lang == 'id' && template.body_detail_id != undefined) {
      body = template.body_detail_id;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', body: ' + body);

    const $_ = cheerio.load(body);

    $_('#fullname').text(profile.fullName);
    $_('#email').text(profile.email);
    $_('#postType').text(postType);
    $_('#createdAt').text(post.createdAt);
    $_('#contentID').text(post.postID);

    let qr = await this.utilService.generateQRCode(process.env.LINK_QR + post.postID);
    $_('#qrcode').attr('src', qr);

    let meta = post.metadata;
    if (meta != undefined && meta.duration != undefined) {
      $_('#duration').text(this.formatTime(meta.duration));
    } else {
      $_('#duration').text('-');
    }

    var html = $_.html().toString();

    template = await this.templateService.findTemplateCreatePostPdf();
    body = template.body_detail;
    if (lang == 'id' && template.body_detail_id != undefined) {
      body = template.body_detail_id;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', post pdf validated');

    let pdf = cheerio.load(body);
    pdf('#fullname').text(profile.fullName);
    pdf('#email').text(profile.email);
    pdf('#postType').text(postType);
    pdf('#createdAt').text(post.createdAt);
    pdf('#contentID').text(post.postID);
    pdf('#title').text(post.description);
    pdf('#postID').text(post.postID);

    let tg = "";
    let tgs = post.tags;
    for (let i = 0; i < tgs.length; i++) {
      let obj = tgs[i];
      tg += '#' + obj + ',';
    }
    pdf('#tag').text(tg);

    if (meta != undefined && meta.duration != undefined) {
      pdf('#duration').text(this.formatTime(meta.duration));
    } else {
      pdf('#duration').text('-');
    }

    pdf('#qrcode').attr('src', qr);

    let htmlPdf = pdf.html().toString();
    let file = { content: htmlPdf };
    let options = { format: 'A4', landscape: true };
    pdfWriter.generatePdf(file, options).then(pdfBuffer => {
      this.logger.log('generateCertificate >>> sending email to: ' + String(post.email) + ', with subject: ' + String(template.subject));
      this.utilService.sendEmailWithAttachment(String(post.email), 'no-reply@hyppe.app', String(template.subject), html, { filename: fileName, content: pdfBuffer });
    });


    return htmlPdf;
  }

  async updatePost(body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('updatePost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    let opost = await this.postService.findByPostId(body.postID);

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }



    let post = await this.buildUpdatePost(body, headers);
    let apost = await this.PostsModel.create(post);

    if (body.certified && body.certified == "true") {
      console.log("post cert: " + opost.certified);
      if (opost.certified == undefined || opost.certified == false) {
        this.generateCertificate(String(post.postID), 'id');
      }

    }

    let cm = post.contentMedias[0];

    let updatePl = new CreateUserplaylistDto();
    updatePl.userPostId = Object(profile._id);
    updatePl.mediaId = Object(cm.oid);
    updatePl.postType = apost.postType;
    //this.postService.updateGenerateUserPlaylist_(updatePl);

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);

    return res;
  }

  private async buildUpdatePost(body: any, headers: any): Promise<Posts> {
    this.logger.log('buildPost >>> start');
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('buildPost >>> profile: ' + profile.email);

    let post = await this.postService.findByPostId(body.postID);
    post.updatedAt = await this.utilService.getDateTimeString();
    let isShared = null;

    if (body.description != undefined) {
      post.description = body.description;
    }

    if (body.isShared != undefined) {
      post.isShared = body.isShared;
    } else {
      post.isShared = true;
    }

    if (body.tags != undefined && (String(body.tags).length > 0)) {
      var obj = body.tags;
      //var tgs = obj.split(",");
      post.tags = obj;
    }



    if (body.visibility != undefined) {
      post.visibility = body.visibility;
    } else {
      post.visibility = 'PUBLIC';
    }

    if (body.location != undefined) {
      post.location = body.location;
    }

    if (body.lat != undefined) {
      post.lat = body.lat;
    }

    if (body.lon != undefined) {
      post.lon = body.lon;
    }

    if (body.saleAmount != undefined) {
      post.saleAmount = body.saleAmount;
    } else {
      post.saleAmount = null;
    }

    if (body.saleLike != undefined) {
      post.saleLike = body.saleLike;
    } else {
      post.saleLike = false;
    }

    if (body.saleView != undefined) {
      post.saleView = body.saleView;
    } else {
      post.saleView = false;
    }

    if (body.allowComments != undefined) {
      post.allowComments = body.allowComments;
    } else {
      post.allowComments = true;
    }

    if (body.isSafe != undefined) {
      post.isSafe = body.isSafe;
    } else {
      post.isSafe = false;
    }

    if (body.isOwned != undefined) {
      post.isOwned = body.isOwned;
    } else {
      post.isOwned = false;
    }

    if (body.active != undefined) {
      post.active = body.active;
    }


    if (body.cats != undefined && body.cats.length > 1) {
      var obj = body.cats;
      var cats = obj.split(",");

      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        // var cat = await this.interestService.findByName(tmp);
        if (tmp != undefined) {
          var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(tmp), "$db": "hyppe_infra_db" };
          pcats.push(objintr);
        }
      }
      post.category = pcats;
    }

    // if (body.tagPeople != undefined && body.tagPeople.length > 1) {
    //   var obj = body.tagPeople;
    //   var cats = obj.split(",");
    //   var pcats = [];
    //   for (var i = 0; i < cats.length; i++) {
    //     var tmp = cats[i];
    //     var tp = await this.userAuthService.findOneUsername(tmp);
    //     if (await this.utilService.ceckData(tp)) {
    //       if (tp != undefined) {
    //         var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
    //         pcats.push(objintr);
    //       }
    //     }
    //   }
    //   post.tagPeople = pcats;
    // }

    if (body.tagPeople != undefined && body.tagPeople.length > 1) {
      var obj = body.tagPeople;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp.username != undefined) {
            var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(body.postID);
            console.log(post.postType.toString());
            this.utilService.sendFcmV2(tp.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID, post.postType.toString());
            pcats.push(objintr);
          }
        }
      }
      post.tagPeople = pcats;
    }

    // if (body.tagDescription != undefined && body.tagDescription.length > 0) {
    //   var obj = body.tagDescription;
    //   var cats = obj.split(",");
    //   var pcats = [];
    //   for (var i = 0; i < cats.length; i++) {
    //     var tmp = cats[i];
    //     var tp = await this.userAuthService.findOneUsername(tmp);
    //     if (await this.utilService.ceckData(tp)) {
    //       if (tp != undefined) {
    //         var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
    //         pcats.push(objintrx);
    //       }
    //     }
    //   }
    //   post.tagDescription = pcats;
    // }

    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      var obj = body.tagDescription;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp != undefined || tp != null) {
            var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(body.postID);
            console.log(post.postType.toString());
            this.utilService.sendFcmV2(tp.email.toString(), auth.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID, post.postType.toString())
            pcats.push(objintrx);
          }
        }
      }
      post.tagDescription = pcats;
    }

    if (body.certified != undefined) {
      post.certified = <boolean>body.certified;
    } else {
      post.certified = false;
    }

    return post;
  }

  async getUserPostLandingPage(body: any, headers: any): Promise<PostLandingResponseApps> {
    let st = await this.utilService.getDateTimeDate();
    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPostLandingPage >>> profile: ' + profile);

    let res = new PostLandingResponseApps();
    let data = new PostLandingData();
    res.response_code = 202;

    let vids: string[] = [];
    let pics: string[] = [];
    let user: string[] = [];

    let posts: string[] = [];

    let resVideo: PostData[] = [];
    let resPic: PostData[] = [];
    let resDiary: PostData[] = [];
    let resStory: PostData[] = [];

    let pdp: PostData[] = [];
    let pdv: PostData[] = [];
    let pds: PostData[] = [];
    let pdd: PostData[] = [];

    if (String(body.postType) == 'pict') {
      this.logger.log('getUserPostLandingPage >>> exec: pict');
      body.postType = 'pict';
      let pp = await this.doGetUserPost(body, headers, profile);
      pdp = await this.loadPostDataBulk(pp, body, profile, vids, pics, user);
      for (let i = 0; i < pdp.length; i++) {
        let ps = pdp[i];
        posts.push(ps.postID);
      }
      data.pict = pdp;
    }


    if (String(body.postType) == 'vid') {
      this.logger.log('getUserPostLandingPage >>> exec: video');
      body.postType = 'vid';
      body.withExp = false;
      let pv = await this.doGetUserPost(body, headers, profile);
      pdv = await this.loadPostDataBulk(pv, body, profile, vids, pics, user);
      for (let i = 0; i < pdv.length; i++) {
        let ps = pdv[i];
        posts.push(ps.postID);
      }
      data.video = pdv;
    }

    if (String(body.postType) == 'diary') {
      this.logger.log('getUserPostLandingPage >>> exec: diary');
      body.postType = 'diary';
      let pd = await this.doGetUserPost(body, headers, profile);
      pdd = await this.loadPostDataBulk(pd, body, profile, vids, pics, user);
      for (let i = 0; i < pdd.length; i++) {
        let ps = pdd[i];
        posts.push(ps.postID);
      }
      data.diary = pdd;
    }


    if (String(body.postType) == 'story') {
      this.logger.log('getUserPostLandingPage >>> exec: story');
      body.postType = 'story';
      body.withExp = true;
      let ps = await this.doGetUserPost(body, headers, profile);
      pds = await this.loadPostDataBulk(ps, body, profile, vids, pics, user);
      for (let i = 0; i < pds.length; i++) {
        let ps = pds[i];
        posts.push(ps.postID);
      }
      data.story = pds;
    }


    this.logger.log('getUserPostLandingPage >>> exec: insightlog');
    let insl = await this.contentEventService.findEventByEmail(String(profile.email), posts, 'LIKE');
    let insh = new Map();
    for (let i = 0; i < insl.length; i++) {
      let ins = insl[i];
      if (insh.has(String(ins.postID)) == false) {
        insh.set(ins.postID, ins.postID);
      }
    }
    this.logger.log('getUserPostLandingPage >>> exec: insightlog - done');

    let xvids: string[] = [];
    let xpics: string[] = [];
    let xuser: string[] = [];

    for (let i = 0; i < vids.length; i++) {
      let o = vids[i];
      if (o != undefined) {
        xvids.push(o);
      }
    }

    for (let i = 0; i < pics.length; i++) {
      let o = pics[i];
      if (o != undefined) {
        xpics.push(o);
      }
    }

    for (let i = 0; i < user.length; i++) {
      let o = user[i];
      if (o != undefined) {
        xuser.push(o);
      }
    }

    let vapsara = undefined;
    let papsara = undefined;
    let cuser = undefined;
    let ubs = undefined;
    let mp = new Map();

    if (xvids.length > 0) {
      vapsara = await this.getVideoApsara(xvids);
    }

    if (xpics.length > 0) {
      papsara = await this.getImageApsara(xpics);
    }

    if (xuser.length > 0) {
      cuser = await this.userAuthService.findIn(xuser);
      ubs = await this.userService.findIn(xuser);

      for (let v = 0; v < cuser.length; v++) {
        let vv = cuser[v];
        if (mp.has(String(vv.email)) == false) {
          mp.set(vv.email, vv);
        }

      }
    }

    if (vapsara != undefined) {
      if (pdv.length > 0) {
        for (let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;

              let oid = pdvv.username;
              pdvv.username = this.getUserName(oid, cuser, ubs);
              pdvv.avatar = await this.getAvatar(oid, cuser, ubs);
            }
          }
          if (insh.has(String(pdvv.postID))) {
            pdvv.isLiked = true;
          } else {
            pdvv.isLiked = false;
          }

          if (mp.has(String(pdvv.email))) {
            pdvv.username = pdvv.username;
          }
          resVideo.push(pdvv);
        }

      }
      if (pds.length > 0) {
        for (let i = 0; i < pds.length; i++) {
          let pdss = pds[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;

              let oid = pdss.username;
              pdss.username = this.getUserName(oid, cuser, ubs);
              pdss.avatar = await this.getAvatar(oid, cuser, ubs);
            }
          }
          if (insh.has(String(pdss.postID))) {
            pdss.isLiked = true;
          } else {
            pdss.isLiked = false;
          }

          if (mp.has(String(pdss.email))) {
            pdss.username = pdss.username;
          }
          resStory.push(pdss);
        }
      }
      if (pdd.length > 0) {
        for (let i = 0; i < pdd.length; i++) {
          let pddd = pdd[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;

              let oid = pddd.username;
              pddd.username = this.getUserName(oid, cuser, ubs);
              pddd.avatar = await this.getAvatar(oid, cuser, ubs);
            }
          }
          if (insh.has(String(pddd.postID))) {
            pddd.isLiked = true;
          } else {
            pddd.isLiked = false;
          }

          if (mp.has(String(pddd.email))) {
            pddd.username = pddd.username;
          }
          resDiary.push(pddd);
        }
      }
    }

    if (papsara != undefined) {
      if (pdv.length > 0) {
        for (let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdvv.apsaraId == vi.ImageId) {
              pdvv.mediaThumbEndpoint = vi.URL;
              pdvv.mediaThumbUri = vi.URL;

              let oid = pdvv.username;
              pdvv.username = this.getUserName(oid, cuser, ubs);
              pdvv.avatar = await this.getAvatar(oid, cuser, ubs);
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (pds.length > 0) {
        for (let i = 0; i < pds.length; i++) {
          let pdss = pds[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdss.apsaraId == vi.ImageId) {
              pdss.mediaEndpoint = vi.URL;
              pdss.mediaUri = vi.URL;

              pdss.mediaThumbEndpoint = vi.URL;
              pdss.mediaThumbUri = vi.URL;

              let oid = pdss.username;
              pdss.username = this.getUserName(oid, cuser, ubs);
              pdss.avatar = await this.getAvatar(oid, cuser, ubs);
            }
          }
          resStory.push(pdss);
        }
      }
      if (pdd.length > 0) {
        for (let i = 0; i < pdd.length; i++) {
          let pddd = pdd[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pddd.apsaraId == vi.ImageId) {
              pddd.mediaThumbEndpoint = vi.URL;
              pddd.mediaThumbUri = vi.URL;

              let oid = pddd.username;
              pddd.username = this.getUserName(oid, cuser, ubs);
              pddd.avatar = await this.getAvatar(oid, cuser, ubs);
            }
          }
          resDiary.push(pddd);
        }
      }
      if (pdp.length > 0) {
        for (let i = 0; i < pdp.length; i++) {
          let pdpp = pdp[i];
          let found = false;
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdpp.apsaraId == vi.ImageId) {
              pdpp.mediaEndpoint = vi.URL;
              pdpp.mediaUri = vi.URL;

              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;

              let oid = pdpp.username;
              pdpp.username = this.getUserName(oid, cuser, ubs);
              pdpp.avatar = await this.getAvatar(oid, cuser, ubs);
              found = true;
            }
            if (pdpp.apsaraThumbId == vi.ImageId) {
              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;

            }
          }
          if (insh.has(String(pdpp.postID))) {
            pdpp.isLiked = true;
          } else {
            pdpp.isLiked = false;
          }

          if (mp.has(String(pdpp.email))) {
            pdpp.username = pdpp.username;
          }
          resPic.push(pdpp);
        }
      }
    }


    if (resVideo.length > 0) {
      data.video = resVideo;
    }

    if (resPic.length > 0) {
      data.pict = resPic;
    }

    if (resStory.length > 0) {
      data.story = resStory;
    }

    if (resDiary.length > 0) {
      data.diary = resDiary;
    }

    if (data.video != undefined && data.video.length > 0) {
      resVideo = [];
      for (let x = 0; x < data.video.length; x++) {
        let obj = data.video[x];
        if (mp.has(String(obj.email))) {
          let mpobj = mp.get(String(obj.email));
          obj.username = mpobj.username;
          resVideo.push(obj);
        }
      }
      data.video = resVideo;
    }

    if (data.pict != undefined && data.pict.length > 0) {
      resPic = [];
      for (let x = 0; x < data.pict.length; x++) {
        let obj = data.pict[x];
        if (mp.has(String(obj.email))) {
          let mpobj = mp.get(String(obj.email));
          obj.username = mpobj.username;
          resPic.push(obj);
        }
      }
      data.pict = resPic;
    }

    if (data.story != undefined && data.story.length > 0) {
      resStory = [];
      for (let x = 0; x < data.story.length; x++) {
        let obj = data.story[x];
        if (mp.has(String(obj.email))) {
          let mpobj = mp.get(String(obj.email));
          obj.username = mpobj.username;
          resStory.push(obj);
        }
      }
      data.story = resStory;
    }

    if (data.diary != undefined && data.diary.length > 0) {
      resDiary = [];
      for (let x = 0; x < data.diary.length; x++) {
        let obj = data.diary[x];
        if (mp.has(String(obj.email))) {
          let mpobj = mp.get(String(obj.email));
          obj.username = mpobj.username;
          resDiary.push(obj);
        }
      }
      data.diary = resDiary;
    }

    res.data = data;


    var ver = await this.settingsService.findOneByJenis('AppsVersion');
    ver.value;
    res.version = String(ver.value);

    let ed = await this.utilService.getDateTimeDate();
    let gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> finexec: ' + gap);
    return res;
  }

  async getNotification(body: any, headers: any): Promise<NotifResponseApps> {
    let dat = await this.notifService.getNotification(body, headers);
    let dx = dat.data;

    let payload = new NotifResponseApps();
    payload.messages = dat.messages;
    payload.response_code = dat.response_code;
    payload.version = dat.version;

    let xvids: string[] = [];
    let xpics: string[] = [];
    let ndat: CreateNotificationsDto[] = [];

    if (dx != undefined && dx.length > 0) {
      for (let i = 0; i < dx.length; i++) {
        let dy = dx[i];
        let ndy = new CreateNotificationsDto();
        ndy._id = dy._id;
        ndy.active = dy.active;
        ndy.body = dy.body;
        ndy.bodyId = dy.bodyId;
        ndy.contentEventID = dy.contentEventID;
        ndy.createdAt = dy.createdAt;
        ndy.email = dy.email;
        ndy.event = dy.event;
        ndy.eventType = dy.eventType;
        ndy.flowIsDone = dy.flowIsDone;
        ndy.mate = dy.mate;
        ndy.postType = dy.postType;
        ndy.notificationID = dy.notificationID;
        ndy.postID = dy.postID;
        ndy.senderOrReceiverInfo = dy.senderOrReceiverInfo;
        ndy.title = dy.title;
        ndy.updatedAt = dy.updatedAt;

        if (dy.senderOrReceiverInfo != null) {
          var getAvatar = await this.utilService.getAvatarUser(dy.mate.toString());
          dy.senderOrReceiverInfo.avatar = getAvatar;

          var getUsername = await this.userAuthService.findOne(dy.mate.toString());
          dy.senderOrReceiverInfo.username = getUsername.username;

          console.log("MATE", dy.mate);
          var getFullname = await this.userService.findOne(dy.mate.toString());
          console.log("GET FULLNAME", getFullname);
          if (getFullname != undefined) {
            if (getFullname.fullName != undefined) {
              dy.senderOrReceiverInfo.fullName = getFullname.fullName;
            } else {
              dy.senderOrReceiverInfo.fullName = "";
            }
          } else {
            dy.senderOrReceiverInfo.fullName = "";
          }
        }

        if (dy.postID != null) {
          let pid = String(dy.postID);
          let ps = await this.postService.findByPostId(pid);
          if (ps != undefined) {
            let meds = ps.contentMedias;
            if (meds != undefined && meds.length > 0) {

              let med = meds[0];
              let cn = new ContentDTO();
              let ns = med.namespace;
              if (ns == 'mediavideos') {
                let video = await this.videoService.findOne(String(med.oid));
                if (video.apsara == true) {
                  xvids.push(String(video.apsaraId));
                  cn.apsaraId = String(video.apsaraId);
                  cn.isApsara = true;
                } else {
                  cn.mediaThumbUri = String(video.mediaThumb);
                  cn.mediaEndpoint = '/stream/' + video.mediaUri;
                  cn.mediaThumbEndpoint = '/thumb/' + video.postID;
                }

                //mediatype
                cn['mediaType'] = 'video';

              } else if (ns == 'mediapicts') {
                let pic = await this.picService.findOne(String(med.oid));
                if (pic.apsara == true) {
                  xpics.push(String(pic.apsaraId));
                  if (pic.apsaraThumbId != undefined) {
                    xpics.push(String(pic.apsaraThumbId));
                  } else {
                    xpics.push(String(pic.apsaraId));
                  }
                  cn.apsaraId = String(pic.apsaraId);
                  cn.apsaraThumbId = String(pic.apsaraThumbId);
                  cn.isApsara = true;
                } else {
                  cn.mediaEndpoint = '/pict/' + pic.postID;
                  cn.mediaUri = String(pic.mediaUri);
                }

                cn.mediaType = 'image';

              } else if (ns == 'mediadiaries') {
                let diary = await this.diaryService.findOne(String(med.oid));
                if (diary.apsara == true) {
                  xvids.push(String(diary.apsaraId));
                  cn.apsaraId = String(diary.apsaraId);
                  cn.isApsara = true;
                } else {
                  cn.mediaThumbUri = String(diary.mediaThumb);
                  cn.mediaEndpoint = '/stream/' + diary.mediaUri;
                  cn.mediaThumbEndpoint = '/thumb/' + diary.postID;
                }

                cn.mediaType = 'video';


              } else if (ns == 'mediastories') {
                let story = await this.storyService.findOne(String(med.oid));

                if (story.mediaType == 'video') {
                  if (story.apsara == true) {
                    xvids.push(String(story.apsaraId));
                    cn.apsaraId = String(story.apsaraId);
                    cn.isApsara = true;
                  } else {
                    cn.mediaThumbUri = String(story.mediaThumb);
                    cn.mediaEndpoint = '/stream/' + story.mediaUri;
                    cn.mediaThumbEndpoint = '/thumb/' + story.postID;
                  }
                  cn.mediaType = 'video';
                } else {
                  if (story.apsara == true) {
                    xpics.push(String(story.apsaraId));
                    cn.apsaraId = String(story.apsaraId);
                    cn.isApsara = true;
                  } else {
                    cn.mediaThumbUri = String(story.mediaThumb);
                    cn.mediaEndpoint = '/pict/' + story.mediaUri;
                    cn.mediaThumbEndpoint = '/thumb/' + story.postID;
                  }
                  cn.mediaType = 'image';
                }
              }

              ndy.content = cn;
              ndy.postType = ps.postType;

              this.logger.log('dy.content: ' + JSON.stringify(ndy));
              ndat.push(ndy);
            }
          }
        } else {
          ndat.push(ndy);
        }
      }

      let yvids: string[] = [];
      let ypics: string[] = [];

      for (let i = 0; i < xvids.length; i++) {
        let o = xvids[i];
        if (o != undefined) {
          yvids.push(o);
        }
      }

      for (let i = 0; i < xpics.length; i++) {
        let o = xpics[i];
        if (o != undefined) {
          ypics.push(o);
        }
      }

      let vapsara = undefined;
      let papsara = undefined;


      if (yvids.length > 0) {
        vapsara = await this.getVideoApsara(xvids);
      }

      if (ypics.length > 0) {
        papsara = await this.getImageApsara(xpics);
      }

      for (let i = 0; i < ndat.length; i++) {
        let pdvv = ndat[i];
        if (pdvv.content != undefined) {
          if (vapsara != undefined) {
            for (let i = 0; i < vapsara.VideoList.length; i++) {
              let vi = vapsara.VideoList[i];
              if (pdvv.content['apsaraId'] == vi.VideoId) {
                pdvv.content['mediaThumbEndpoint'] = vi.CoverURL;
              }
            }
          }

          if (papsara != undefined) {
            for (let i = 0; i < papsara.ImageInfo.length; i++) {
              let vi = papsara.ImageInfo[i];
              if (pdvv.content['apsaraId'] == vi.ImageId) {
                pdvv.content['mediaThumbEndpoint'] = vi.URL;
                pdvv.content['mediaThumbUri'] = vi.URL;

              }
            }
          }
        }

      }

      payload.data = ndat;
    }

    return payload;
  }



  async cmodCheckResult(postID: string) {
    if (postID == undefined) {
      this.logger.error('cmodCheckResult >>> body content is undefined');
      return;
    }
    let pd = await this.postService.findByPostId(postID);
    if (pd == undefined) {
      this.logger.error('cmodResponse >>> post id:' + postID + ' not found');
      return;
    }

    if (pd.statusCB == undefined || pd.statusCB == 'PENDING') {
      let cr = pd.contentModerationResponse;
      if (cr == undefined || cr == '') {
        return;
      }

      let ocr = JSON.parse(cr);
      let cont = ocr.content;
      if (cont == undefined) {
        return;
      }
      let ocr2 = JSON.parse(cont);
      let taskId = ocr2.taskId;

      let rc = await this.cmodService.cmodResult(String(pd._id), taskId);
    }
  }

  private formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return [
      m > 9 ? m : (h ? '0' + m : m || '0'),
      s > 9 ? s : '0' + s
    ].filter(Boolean).join(':');
  }

  private getUserName(oid: string, cuser: Userauth[], ub: Userbasic[]) {
    for (let x = 0; x < cuser.length; x++) {
      let c = cuser[x];
      if (c.email == oid) {
        return c.username;
      }
    }

    return "";
  }

  private async getAvatar(oid: any, cuser: Userauth[], ub: Userbasic[]) {
    for (let i = 0; i < ub.length; i++) {
      let u = ub[i];
      if (u.email == String(oid)) {
        return this.getProfileAvatar(u);
      }
    }

    return;
  }



  async createUserscore(data: any, email: string) {
    let userdata = await this.userService.findOne(email);
    if (userdata == null || userdata == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, auth-user data not found',
      );
    }
    await this.utilService.counscore("CE", "prodAll", "contentevents", data._id, data.eventType.toString(), userdata._id);
  }

  async getDataMediapictSeaweed(): Promise<Mediapicts[]> {
    return await this.picService.getDataMediapictSeaweed();
  }

  async getDataMediavidSeaweed(): Promise<Mediavideos[]> {
    return await this.videoService.getDataMediavideosSeaweed();
  }

  async getDataMediavidSeaweedOne(postID: string): Promise<Mediavideos[]> {
    return await this.videoService.getDataMediavideosSeaweedOne(postID);
  }

  async getDataMediadiariesSeaweed(): Promise<Mediadiaries[]> {
    return await this.diaryService.getDataMediadiariesSeaweed();
  }

  async getDataMediaProfileSeaweed(): Promise<Mediaprofilepicts[]> {
    return await this.profilePictService.getDataMediaProfileSeaweed();
  }

  // async getDataMediavidSeaweedOne(postID: string): Promise<Mediavideos[]> {
  //   return await this.videoService.getDataMediavideosSeaweedOne(postID);
  // }

  async getSeaweedFile(media: string): Promise<any> {
    var data = await this.seaweedfsService.read(media.replace('/localrepo', ''));
    return data;
  }

  // async runMigrationProfile(Mediaprofilepicts_: Mediaprofilepicts[]) {
  //   var timeEnd = await this.utilService.getSetting_("6323d7ca3325000002003f72");
  //   var date = new Date();
  //   var timeEndDate = null;
  //   date.setDate(date.getDate() + 1);
  //   if (timeEnd.toString().length > 1) {
  //     timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " " + timeEnd.toString() + ":00:00");
  //   } else {
  //     timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " 0" + timeEnd.toString() + ":00:00");
  //   }
  //   console.log("------------------------------ DATA LENGTH " + Mediaprofilepicts_.length + " ------------------------------");

  //   for (var i = 0; i < Mediaprofilepicts_.length; i++) {
  //     var dateCurrent = await this.utilService.getDateTime();
  //     console.log("------------------------------ START MIGRATION PICT INDEX NUMBER " + i + " ------------------------------");
  //     console.log("------------------------------ CURRENT DATE " + dateCurrent + " ------------------------------");
  //     console.log("------------------------------ CURRENT DATE " + dateCurrent.getTime() + " ------------------------------");
  //     console.log("------------------------------ POST ID " + Mediaprofilepicts_[i].mediaID.toString() + " ------------------------------");
  //     if (dateCurrent.getTime() >= timeEndDate) {
  //       break;
  //     }
  //     // if (i == 1) {
  //     //   break;
  //     // }
  //     var data_user = await this.userService.findByProfileId({ "$ref": 'mediaprofilepicts', "$id": Mediaprofilepicts_[i]._id.toString(), "$db": 'hyppe_content_db' });
  //     if (await this.utilService.ceckData(data_user)) {
  //       var image = await this.getSeaweedFile(Mediaprofilepicts_[i].fsSourceUri.toString());
  //       if (image != null) {
  //         var format = "jpg";
  //         await this.prossesMigrationProfile(image, _id, Mediaprofilepicts_[i].mediaID, userId, postType, format);
  //         console.log("GET DATA POST IMAGE");
  //         var dataPost = await this.postService.findByPostId(Mediaprofilepicts_[i].postID.toString());
  //         if (await this.utilService.ceckData(dataPost)) {
  //           var email = dataPost.email.toString();
  //           console.log("GET DATA USER IMAGE");
  //           var dataUser = await this.userService.findOne(email);
  //           if (await this.utilService.ceckData(dataUser)) {

  //             var _id = Mediaprofilepicts_[i]._id.toString();
  //             var postID = Mediaprofilepicts_[i].postID.toString();
  //             var userId = dataUser._id.toString();
  //             var postType = "pict";
  //             console.log("------------------------------ END MIGRATION PICT INDEX NUMBER " + i + " ------------------------------");
  //           } else {
  //             await this.updateDataMigrationProfileLogs(Mediaprofilepicts_[i]._id.toString(), "FAILED", "DATA USER NULL");
  //           }
  //         } else {
  //           await this.updateDataMigrationProfileLogs(Mediaprofilepicts_[i]._id.toString(), "FAILED", "DATA POST NULL");
  //         }
  //       } else {
  //         await this.updateDataMigrationProfileLogs(Mediaprofilepicts_[i]._id.toString(), "FAILED", "IMAGE NULL");
  //       }
  //     } else {
  //       await this.updateDataMigrationProfileLogs(Mediapicts_[i]._id.toString(), "FAILED", "IMAGE NULL");
  //     }
  //   }
  // }

  async runMigrationPict(Mediapicts_: Mediapicts[]) {
    var timeEnd = await this.utilService.getSetting_("6323d7ca3325000002003f72");
    var date = new Date();
    var timeEndDate = null;
    date.setDate(date.getDate() + 1);
    if (timeEnd.toString().length > 1) {
      timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " " + timeEnd.toString() + ":00:00");
    } else {
      timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " 0" + timeEnd.toString() + ":00:00");
    }
    console.log("------------------------------ DATA LENGTH " + Mediapicts_.length + " ------------------------------");

    for (var i = 0; i < Mediapicts_.length; i++) {
      var dateCurrent = await this.utilService.getDateTime();
      console.log("------------------------------ START MIGRATION PICT INDEX NUMBER " + i + " ------------------------------");
      console.log("------------------------------ CURRENT DATE " + dateCurrent + " ------------------------------");
      console.log("------------------------------ CURRENT DATE " + dateCurrent.getTime() + " ------------------------------");
      console.log("------------------------------ POST ID " + Mediapicts_[i].postID.toString() + " ------------------------------");
      if (dateCurrent.getTime() >= timeEndDate) {
        break;
      }
      // if (i == 1) {
      //   break;
      // }
      var image = await this.getSeaweedFile(Mediapicts_[i].fsSourceUri.toString());
      if (image != null) {
        console.log("GET DATA POST IMAGE");
        var dataPost = await this.postService.findByPostId(Mediapicts_[i].postID.toString());
        if (await this.utilService.ceckData(dataPost)) {
          var email = dataPost.email.toString();
          console.log("GET DATA USER IMAGE");
          var dataUser = await this.userService.findOne(email);
          if (await this.utilService.ceckData(dataUser)) {

            var _id = Mediapicts_[i]._id.toString();
            var postID = Mediapicts_[i].postID.toString();
            var userId = dataUser._id.toString();
            var postType = "pict";
            var format = "jpg";
            await this.prossesMigrationPict(image, _id, postID, userId, postType, format);
            console.log("------------------------------ END MIGRATION PICT INDEX NUMBER " + i + " ------------------------------");
          } else {
            await this.updateDataMigrationPictLogs(Mediapicts_[i]._id.toString(), "FAILED", "DATA USER NULL");
          }
        } else {
          await this.updateDataMigrationPictLogs(Mediapicts_[i]._id.toString(), "FAILED", "DATA POST NULL");
        }
      } else {
        await this.updateDataMigrationPictLogs(Mediapicts_[i]._id.toString(), "FAILED", "IMAGE NULL");
      }
    }
  }

  async runMigrationVid(Mediavideos_: Mediavideos[]) {
    var timeEnd = await this.utilService.getSetting_("6323d7ca3325000002003f72");
    var date = new Date();
    var timeEndDate = null;
    date.setDate(date.getDate() + 1);
    if (timeEnd.toString().length > 1) {
      timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " " + timeEnd.toString() + ":00:00");
    } else {
      timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " 0" + timeEnd.toString() + ":00:00");
    }
    console.log("------------------------------ DATA LENGTH " + Mediavideos_.length + " ------------------------------");
    for (var i = 0; i < Mediavideos_.length; i++) {
      var dateCurrent = await this.utilService.getDateTime();
      console.log("------------------------------ START MIGRATION VID INDEX NUMBER " + i + " ------------------------------");
      console.log("------------------------------ CURRENT DATE " + dateCurrent + " ------------------------------");
      console.log("------------------------------ CURRENT DATE " + dateCurrent.getTime() + " ------------------------------");
      console.log("------------------------------ POST ID " + Mediavideos_[i].postID.toString() + " ------------------------------");
      if (dateCurrent.getTime() >= timeEndDate) {
        break;
      }
      // if (i == 1) {
      //   break;
      // }
      var video = await this.getSeaweedFile(Mediavideos_[i].fsSourceUri.toString());
      if (video != null) {
        var mime = Mediavideos_[i].mediaMime.toString().replace("video/", "");
        var _id = Mediavideos_[i]._id.toString();
        var postID = Mediavideos_[i].postID.toString();
        var originalName = (Mediavideos_[i].originalName != undefined) ? Mediavideos_[i].originalName.toString() : postID + "." + mime;
        console.log("PROCCESS MIGRATION");
        await this.prossesMigrationVid(video, _id, postID, originalName);
        console.log("------------------------------ END MIGRATION VID INDEX NUMBER " + i + " ------------------------------");
      } else {
        console.error("ERROR ", "VIDEO NULL");
        await this.updateDataMigrationVidLogs(Mediavideos_[i]._id.toString(), "FAILED", "VIDEO NULL");
      }
    }
  }

  async runMigrationDiary(Mediadiaries_: Mediadiaries[]) {
    var timeEnd = await this.utilService.getSetting_("6323d7ca3325000002003f72");
    var date = new Date();
    var timeEndDate = null;
    date.setDate(date.getDate() + 1);
    if (timeEnd.toString().length > 1) {
      timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " " + timeEnd.toString() + ":00:00");
    } else {
      timeEndDate = Date.parse(date.toISOString().substring(0, 10) + " 0" + timeEnd.toString() + ":00:00");
    }
    console.log("------------------------------ DATA LENGTH " + Mediadiaries_.length + " ------------------------------");
    for (var i = 0; i < Mediadiaries_.length; i++) {
      var dateCurrent = await this.utilService.getDateTime();
      console.log("------------------------------ START MIGRATION DIARIES INDEX NUMBER " + i + " ------------------------------");
      console.log("------------------------------ CURRENT DATE " + dateCurrent + " ------------------------------");
      console.log("------------------------------ CURRENT DATE " + dateCurrent.getTime() + " ------------------------------");
      console.log("------------------------------ POST ID " + Mediadiaries_[i].postID.toString() + " ------------------------------");
      if (dateCurrent.getTime() >= timeEndDate) {
        break;
      }
      // if (i == 1) {
      //   break;
      // }
      var video = await this.getSeaweedFile(Mediadiaries_[i].fsSourceUri.toString());
      if (video != null) {
        var mime = Mediadiaries_[i].mediaMime.toString().replace("video/", "");
        var _id = Mediadiaries_[i]._id.toString();
        var postID = Mediadiaries_[i].postID.toString();
        var originalName = (Mediadiaries_[i].originalName != undefined) ? Mediadiaries_[i].originalName.toString() : postID + "." + mime;
        console.log("PROCCESS MIGRATION");
        await this.prossesMigrationDiary(video, _id, postID, originalName);
        console.log("------------------------------ END MIGRATION DIARIES INDEX NUMBER " + i + " ------------------------------");
      } else {
        console.error("ERROR ", "VIDEO NULL");
        await this.updateDataMigrationDiaryLogs(Mediadiaries_[i]._id.toString(), "FAILED", "VIDEO NULL");
      }
    }
  }

  async prossesMigrationPict(file: any, _id: string, postID: string, userId: string, postType: string, format: string) {
    try {
      console.log(typeof file);
      //GENERATE FILE
      console.log("GENERATE FILE");
      var file_upload = await this.generate_upload_buffer(file, format);
      console.log("GENERATE THUMNAIL");
      var file_thumnail = await this.generate_thumnail_buffer(file, format);

      var filename = postID + "." + format;
      var filename_thum = postID + "_thum." + format;
      var filename_original = postID + "_original." + format;

      var url_filename = "";
      var url_filename_thum = "";

      //UPLOAD OSS
      console.log("OSS UPLOAD FILE");
      var upload_file_upload = await this.uploadOss(file_upload, postID, filename, userId, postType);
      console.log("OSS UPLOAD THUMNAIL");
      var upload_file_thumnail = await this.uploadOss(file_thumnail, postID, filename_thum, userId, postType);
      console.log("OSS UPLOAD ORIGINAL");
      this.uploadOss(file, postID, filename_original, userId, postType);

      //GET URL PICT FROM RESPONSE
      if (upload_file_upload != undefined) {
        if (upload_file_upload.res != undefined) {
          if (upload_file_upload.res.statusCode != undefined) {
            if (upload_file_upload.res.statusCode == 200) {
              url_filename = upload_file_upload.res.requestUrls[0];
            }
          }
        }
      }

      //GET URL PICT THUMNAIL FROM RESPONSE
      if (upload_file_thumnail != undefined) {
        if (upload_file_thumnail.res != undefined) {
          if (upload_file_thumnail.res.statusCode != undefined) {
            if (upload_file_thumnail.res.statusCode == 200) {
              url_filename_thum = upload_file_thumnail.res.requestUrls[0];
            }
          }
        }
      }

      const postData = {
        _id: _id,
        userId: userId,
        postType: postType,
        postID: postID,
        filename: filename,
        url_filename: url_filename,
        filename_thum: filename_thum,
        url_filename_thum: url_filename_thum,
      }
      await this.updateDataMigrationPict(postData);
    } catch (e) {
      await this.updateDataMigrationPictLogs(_id, "FAILED", e.toString());
    }
  }

  async prossesMigrationVid(file: any, _id: string, postID: string, originalname: string) {
    try {
      console.log("APSARA UPLOAD VID");
      var postUpload = await this.uploadJavaV3_buffer(file, postID, originalname);
      console.log("APSARA UPLOAD VID STATUS " + postUpload.data.status);
      if (postUpload.data.status) {
        postUpload.data._id = _id;
        await this.updateDataMigrationVid(postUpload.data);
      }
    } catch (e) {
      console.error("ERROR ", e.toString());
      await this.updateDataMigrationVidLogs(_id, "FAILED", e.toString());
    }
  }

  async prossesMigrationDiary(file: any, _id: string, postID: string, originalname: string) {
    try {
      console.log("APSARA UPLOAD VID");
      var postUpload = await this.uploadJavaV3_buffer(file, postID, originalname);
      console.log("APSARA UPLOAD VID STATUS " + postUpload.data.status);
      if (postUpload.data.status) {
        postUpload.data._id = _id;
        await this.updateDataMigrationDiary(postUpload.data);
      }
    } catch (e) {
      console.error("ERROR ", e.toString());
      await this.updateDataMigrationDiaryLogs(_id, "FAILED", e.toString());
    }
  }

  // async prossesMigrationProfile(file: any, _id: string, mediaID: string, userId: string, format: string) {
  //   try {
  //     console.log(typeof file);
  //     //GENERATE FILE
  //     console.log("GENERATE FILE");
  //     var array_file_upload = await this.generate_upload_profile(file);
  //     console.log("GENERATE THUMNAIL");
  //     var file_thumnail = await this.generate_thumnail_buffer(file, format);

  //     var filename = postID + "." + format;
  //     var filename_thum = postID + "_thum." + format;
  //     var filename_original = postID + "_original." + format;

  //     var url_filename = "";
  //     var url_filename_thum = "";

  //     //UPLOAD OSS
  //     console.log("OSS UPLOAD FILE");
  //     var upload_file_upload = await this.uploadOssProfile(file_upload, filename, userId);
  //     console.log("OSS UPLOAD THUMNAIL");
  //     var upload_file_thumnail = await this.uploadOss(file_thumnail, mediaID, filename_thum, userId, postType);
  //     console.log("OSS UPLOAD ORIGINAL");
  //     this.uploadOss(file, mediaID, filename_original, userId, postType);

  //     //GET URL PICT FROM RESPONSE
  //     if (upload_file_upload != undefined) {
  //       if (upload_file_upload.res != undefined) {
  //         if (upload_file_upload.res.statusCode != undefined) {
  //           if (upload_file_upload.res.statusCode == 200) {
  //             url_filename = upload_file_upload.res.requestUrls[0];
  //           }
  //         }
  //       }
  //     }

  //     //GET URL PICT THUMNAIL FROM RESPONSE
  //     if (upload_file_thumnail != undefined) {
  //       if (upload_file_thumnail.res != undefined) {
  //         if (upload_file_thumnail.res.statusCode != undefined) {
  //           if (upload_file_thumnail.res.statusCode == 200) {
  //             url_filename_thum = upload_file_thumnail.res.requestUrls[0];
  //           }
  //         }
  //       }
  //     }

  //     const postData = {
  //       _id: _id,
  //       userId: userId,
  //       postType: postType,
  //       postID: postID,
  //       filename: filename,
  //       url_filename: url_filename,
  //       filename_thum: filename_thum,
  //       url_filename_thum: url_filename_thum,
  //     }
  //     await this.updateDataMigrationPict(postData);
  //   } catch (e) {
  //     await this.updateDataMigrationProfileLogs(_id, "FAILED", e.toString());
  //   }
  // }

  async updateDataMigrationPict(post: any) {
    var med = new Mediapicts();
    med.mediaBasePath = post.userId + "/post/" + post.postType + "/" + post.postID + "/" + post.filename;
    med.mediaUri = post.filename;
    med.fsSourceUri = post.url_filename;
    med.fsSourceName = post.filename;
    med.fsTargetUri = post.url_filename;
    med.apsara = false;
    med.uploadSource = "OSS";
    med.mediaThumName = post.filename_thum;
    med.mediaThumBasePath = post.userId + "/post/" + post.postType + "/" + post.postID + "/" + post.filename_thum;
    med.mediaThumUri = post.url_filename_thum;
    med.descMigration = "";
    med.statusMigration = "SUCCESS";
    await this.picService.updatebyId(post._id, med);
  }

  async updateDataMigrationVid(post: any) {
    var med = new Mediavideos();
    med.apsaraId = post.videoId;
    med.apsara = true;
    med.descMigration = "";
    med.statusMigration = "SUCCESS";
    console.log(post);
    console.log("UPDATE DB VIDEO");
    await this.videoService.updatebyId(post._id, med);
  }

  async updateDataMigrationDiary(post: any) {
    var med = new Mediadiaries();
    med.apsaraId = post.videoId;
    med.apsara = true;
    med.descMigration = "";
    med.statusMigration = "SUCCESS";
    console.log(post);
    console.log("UPDATE DB VIDEO");
    await this.diaryService.updatebyId(post._id, med);
  }

  async updateDataMigrationPictLogs(_id: string, statusMigration_: string, descMigration_: string) {
    var med = new Mediapicts();
    med.statusMigration = statusMigration_;
    med.descMigration = descMigration_;
    await this.picService.updatebyId(_id, med);
  }

  async updateDataMigrationVidLogs(_id: string, statusMigration_: string, descMigration_: string) {
    var med = new Mediavideos();
    med.statusMigration = statusMigration_;
    med.descMigration = descMigration_;
    await this.videoService.updatebyId(_id, med);
  }

  async updateDataMigrationDiaryLogs(_id: string, statusMigration_: string, descMigration_: string) {
    var med = new Mediadiaries();
    med.statusMigration = statusMigration_;
    med.descMigration = descMigration_;
    await this.diaryService.updatebyId(_id, med);
  }

  // async updateDataMigrationProfileLogs(_id: string, statusMigration_: string, descMigration_: string) {
  //   var med = new Mediaprofilepicts();
  //   med.statusMigration = statusMigration_;
  //   med.descMigration = descMigration_;
  //   await this.profilePictService.updatebyId(_id, med);
  // }

  async cronJobSeaweedPictStart() {
    var Mediapicts_ = await this.getDataMediapictSeaweed();
    console.log(Mediapicts_.length);
    this.runMigrationPict(Mediapicts_);
  }

  async cronJobSeaweedVidStart() {
    var Mediavid_ = await this.getDataMediavidSeaweed();
    console.log(Mediavid_.length);
    this.runMigrationVid(Mediavid_);
  }

  async cronJobSeaweedDiariesStart() {
    var Mediadiaries_ = await this.getDataMediadiariesSeaweed();
    console.log(Mediadiaries_.length);
    this.runMigrationDiary(Mediadiaries_);
  }
  async addUniqEvent(email_receiverParty: string, eventType: string, active: string, event: string, email_user: string, postID: string,id:string) {
    var uniqEvent = null;
    var arrData = [];

   
    uniqEvent = email_receiverParty + "," + eventType + "," + active + "," + event + "," + email_user + "," + postID + "," + id;
  
    arrData.push(uniqEvent);
    return arrData;
  }
  // async cronJobSeaweedProfileStart() {
  //   var mediaprofilepicts_ = await this.getDataMediaProfileSeaweed();
  //   console.log(mediaprofilepicts_.length);
  //   this.runMigrationProfile(mediaprofilepicts_);
  // }
}
