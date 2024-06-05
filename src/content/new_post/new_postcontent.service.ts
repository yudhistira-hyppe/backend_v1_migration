import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { newPosts, NewpostsDocument } from './schemas/newPost.schema';
import mongoose, { Model } from 'mongoose';
import { Long } from 'mongodb';
import axios from 'axios';
import { ApsaraImageResponse, ApsaraPlayResponse, ApsaraVideoResponse, Avatar, Cat, CreatePostResponse, ImageInfo, InsightPost, Messages, Metadata, PostData, PostResponseApps, Privacy, TagPeople, VideoList } from './dto/create-newPost.dto';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { ConfigService } from '@nestjs/config';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { UtilsService } from 'src/utils/utils.service';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { InterestsService } from 'src/infra/interests/interests.service';
import { OssContentPictService } from '../posts/osscontentpict.service';
import { TagCountDto } from '../tag_count/dto/create-tag_count.dto';
import { TagCountService } from '../tag_count/tag_count.service';
import { Insights } from '../insights/schemas/insights.schema';
import { InsightsService } from '../insights/insights.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Mediavideos } from '../mediavideos/schemas/mediavideos.schema';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { Mediastories } from '../mediastories/schemas/mediastories.schema';
import { MediastoriesService } from '../mediastories/mediastories.service';
import { Mediadiaries } from '../mediadiaries/schemas/mediadiaries.schema';
import { MediadiariesService } from '../mediadiaries/mediadiaries.service';
import { Mediapicts } from '../mediapicts/schemas/mediapicts.schema';
import { MediapictsService } from '../mediapicts/mediapicts.service';
import { ContentModService } from '../posts/contentmod.service';
import { TemplatesRepoService } from 'src/infra/templates_repo/templates_repo.service';
import { NewPostService } from './new_post.service';
import { CreateUserplaylistDto } from 'src/trans/userplaylist/dto/create-userplaylist.dto';
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';

const webp = require('webp-converter');
const sharp = require('sharp');
const Jimp_ = require('jimp');
const convert = require('heic-convert');
var FormData = require('form-data');

@Injectable()
export class NewPostContentService {
  private readonly logger = new Logger(NewPostContentService.name);
  constructor(
    @InjectModel(newPosts.name, 'SERVER_FULL')
    private readonly loaddata: Model<NewpostsDocument>,
    private readonly logapiSS: LogapisService,
    private readonly newPostService: NewPostService,
    private readonly configService: ConfigService,
    private utilService: UtilsService,
    private mediamusicService: MediamusicService,
    private readonly basic2SS: UserbasicnewService,
    private interestService: InterestsService,
    private ossContentPictService: OssContentPictService,
    private readonly tagCountService: TagCountService,
    private insightService: InsightsService,
    private contentEventService: ContenteventsService,
    private videoService: MediavideosService,
    private storyService: MediastoriesService,
    private diaryService: MediadiariesService,
    private picService: MediapictsService,
    private cmodService: ContentModService,
    private templateService: TemplatesRepoService,
    private disqusService: DisqusService,
    private disqusLogService: DisquslogsService,
  ) { }



  async createNewPostV5(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + '/api/posts/createpost/v2';
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
    const data_userbasics = await this.basic2SS.findBymail(email);
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

  private async createNewPostVideoV5(file: Express.Multer.File, body: any, data_userbasics: Userbasicnew, link: string): Promise<CreatePostResponse> {
    //Current Date
    const currentDate = await this.utilService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(body));
    // reqbody['postContent'] = file;
    var inputemail = data_userbasics.email;
    var setemail = inputemail.toString();

    //Build Post
    let Posts_: newPosts = await this.buildPost_(body, data_userbasics);
    console.log('============================================== BUILD POST ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
    let contentMedias_ = [];
    let mediaSource_ = [];
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
      mediaSource_.push(Mediavideos_);
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
      mediaSource_.push(Mediastories_);
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
      mediaSource_.push(Mediadiaries_);
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
      mediaSource_.push(Mediapicts_);
      contentMedias_.push(pict);
    }
    Posts_.contentMedias = contentMedias_;
    Posts_.mediaSource = mediaSource_;

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
      await this.updateNewPostData5(postUpload.data, Posts_, data_userbasics);
    }

    //Create Response
    let dataPosts = await this.newPostService.findOne(Posts_._id.toString());
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

  private async createNewPostPictV5(file: Express.Multer.File, body: any, data_userbasics: Userbasicnew, link: string): Promise<CreatePostResponse> {
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
    let Posts_: newPosts = await this.buildPost_(body, data_userbasics);

    let contentMedias_ = [];
    let mediaSource_ = [];
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
      mediaSource_.push(Mediapicts_);
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
      mediaSource_.push(Mediastories_);
    }
    Posts_.contentMedias = contentMedias_;
    Posts_.mediaSource = mediaSource_;
    Posts_.active = true;
    

    //Send FCM Tag
    let tag = Posts_.tagPeople;
    if (tag != undefined && tag.length > 0) {
      tag.forEach(el => {
        let oid = el.toString();
        //let oid = el.toString();
        this.basic2SS.findOne(oid).then(async (as) => {
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
        let oid = el.toString();
        //let oid = el.toString();
        this.basic2SS.findOne(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString())
          }
        });
      });
    }

    //Get lang User
    const lang = await this.utilService.getUserlanguages(Posts_.email.toString());

    //Generate Certified
    if (Posts_.certified.toString() == "true") {
      console.log("---------------------------------------------------XXX 1---------------------------------------------------")
      this.generateCertificate(Posts_.postID.toString(), lang.toString(), Posts_, data_userbasics);
    }

    //Create Post
    await this.loaddata.create(Posts_);

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
    let dataPosts = await this.newPostService.findOne(Posts_._id.toString());
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

  async updateNewPostData5(body: any, Posts_: newPosts, data_userbasics: Userbasicnew) {
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
      Posts_.mediaSource[0].apsaraId = body.videoId;
      Posts_.mediaSource[0].active = true;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIAVIDEOS ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.newPostService.create(Posts_);
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
      await this.newPostService.create(Posts_);
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
      Posts_.mediaSource[0].apsaraId = body.videoId;
      Posts_.mediaSource[0].active = true;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIASTORIES ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.newPostService.create(Posts_);

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
      Posts_.mediaSource[0].apsaraId = body.videoId;
      Posts_.mediaSource[0].active = true;
      Posts_.active = true;
      console.log('============================================== UPDATE POST MEDIADIARIES ' + Posts_._id + ' ==============================================', JSON.stringify(Posts_));
      await this.newPostService.create(Posts_);

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
    if (Posts_.certified.toString() == "true") {
      console.log(Posts_.certified)
      console.log("---------------------------------------------------XXX 2---------------------------------------------------")
      this.generateCertificate(String(body.postID), lang.toString(), Posts_, data_userbasics);
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
        let oid = el.toString();
        //let oid = el.oid;
        this.basic2SS.findOne(oid).then(async (as) => {
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
        let oid = el.toString();
        //let oid = el.oid;
        this.basic2SS.findOne(oid).then(async (as) => {
          if (await this.utilService.ceckData(as)) {
            this.utilService.sendFcmV2(as.email.toString(), Posts_.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID.toString(), Posts_.postType.toString())
          }
        });
      });
    }
  }

  async updatePost(body: any, headers: any, data_userbasics: Userbasicnew): Promise<CreatePostResponse> {
    this.logger.log('updatePost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    // var profile = await this.basic2SS.findBymail(auth.email);
    // if (profile == undefined) {
    //   let msg = new Messages();
    //   msg.info = ["Email unknown"];
    //   res.messages = msg;
    //   return res;
    // }

    let opost = await this.newPostService.findByPostId(body.postID);

    if (body.certified && body.certified == "true") {
      if (data_userbasics.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }



    let post = await this.buildUpdatePost(body, headers);
    let apost = await this.loaddata.create(post);

    if (body.certified && body.certified == true) {
      console.log("post cert: " + opost.certified);
      if (opost.certified == undefined || opost.certified == false) {
        console.log(body.certified)
        console.log("---------------------------------------------------XXX 3---------------------------------------------------")
        this.generateCertificate(String(post.postID), 'id', apost, data_userbasics);
      }
    }

    let cm = post.contentMedias[0];

    let updatePl = new CreateUserplaylistDto();
    updatePl.userPostId = Object(data_userbasics._id.toString());
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

  async getImageApsara(ids: String[]): Promise<ApsaraImageResponse> {
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
      //this.logger.log("getImageApsara >>> video id: " + vids);
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

      let dto = new ApsaraImageResponse();
      let result = await client.request('GetImageInfos', params, requestOption);
      let ty: ApsaraImageResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));

      if (ty.ImageInfo.length > 0) {
        for (let x = 0; x < ty.ImageInfo.length; x++) {
          let vv = ty.ImageInfo[x];
          vl.push(vv);
        }
      }
    }
    tx.ImageInfo = vl;
    return tx;
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

      let dto = new ApsaraVideoResponse();
      let result = await client.request('GetVideoInfos', params, requestOption);
      let ty: ApsaraVideoResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));
      if (ty.VideoList.length > 0) {
        for (let x = 0; x < ty.VideoList.length; x++) {
          let vv = ty.VideoList[x];
          vl.push(vv);
        }
      }

    }
    tx.VideoList = vl;

    return tx;
  }

  private chunkify(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
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

  async genrateDataPost5(Posts_: newPosts, data_userbasics: Userbasicnew) {
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
    PostData_.judulLink=Posts_.judulLink;
    PostData_.urlLink=Posts_.urlLink;

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
    let ubadge = await this.basic2SS.findone_(data_userbasics.email.toString());
    PostData_.isIdVerified = data_userbasics.isIdVerified;
    PostData_.avatar = await this.getProfileAvatar(data_userbasics);
    PostData_.username = data_userbasics.username;
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

    if (Posts_.tagPeople != undefined && Posts_.tagPeople.length > 0) {
      let atp = Posts_.tagPeople;
      let atp1 = Array<TagPeople>();
      for (let x = 0; x < atp.length; x++) {
        let tp = atp[x].toString();
        //if (tp?.namespace) {
          let oid = tp.oid;
        let ua = await this.basic2SS.findOne(tp);
          if (ua != undefined) {
            let tp1 = new TagPeople();
            tp1.email = String(ua.email);
            tp1.username = String(ua.username);
            tp1.avatar = await this.getProfileAvatar(ua);

            tp1.status = 'TOFOLLOW';
            if (tp1.email == PostData_.email) {
              tp1.status = "UNLINK";
            } else {
              let ceckFOLLOWING = data_userbasics.following.includes(tp1.email)
              if (ceckFOLLOWING) {
                tp1.status = "FOLLOWING";
              }
            }
            atp1.push(tp1);
          }
        //}
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
    let pics: String[] = [];
    let pics_thumnail: String[] = [];
    let meds = Posts_.contentMedias;
    if (meds != undefined) {
      for (let i = 0; i < meds.length; i++) {
        let med = meds[i];
        let ns = med.namespace;
        if (ns == 'mediavideos') {
          if (Posts_.mediaSource[0].apsara == true) {
            let getApsara = await this.getVideoApsara([Posts_.mediaSource[0].apsaraId]);
            if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
              let vi = getApsara.VideoList[0];
              if (Posts_.mediaSource[0].apsaraId == vi.VideoId) {
                PostData_.mediaThumbEndpoint = vi.CoverURL;
              }
            }
            PostData_.apsaraId = String(Posts_.mediaSource[0].apsaraId);
            PostData_.isApsara = true;
          } else {
            PostData_.mediaThumbUri = Posts_.mediaSource[0].mediaThumb;
            PostData_.mediaEndpoint = '/stream/' + Posts_.postID;
            PostData_.mediaThumbEndpoint = '/thumb/' + Posts_.postID;
          }
          PostData_.mediaType = 'video';
          PostData_.isViewed = false;
        } else if (ns == 'mediapicts') {
          if (Posts_.mediaSource[0].apsara == true) {
            pics.push(Posts_.mediaSource[0].apsaraId);
            if (Posts_.mediaSource[0].apsaraThumbId != undefined) {
              pics_thumnail.push(Posts_.mediaSource[0].apsaraThumbId);
            } else {
              pics_thumnail.push(Posts_.mediaSource[0].apsaraId);
            }
            PostData_.apsaraId = String(Posts_.mediaSource[0].apsaraId);
            PostData_.isApsara = true;
            if (Posts_.mediaSource[0].apsaraThumbId != undefined) {
              PostData_.apsaraThumbId = String(Posts_.mediaSource[0].apsaraThumbId);
            } else {
              PostData_.apsaraThumbId = String(Posts_.mediaSource[0].apsaraId);
            }
          } else {
            PostData_.mediaThumbEndpoint = '/pict/' + Posts_.postID;
            PostData_.mediaEndpoint = '/pict/' + Posts_.postID;
            PostData_.mediaUri = Posts_.mediaSource[0].mediaUri;
          }
          PostData_.mediaType = 'image';
          PostData_.isViewed = false;
        } else if (ns == 'mediadiaries') {
          if (Posts_.mediaSource[0].apsara == true) {
            let getApsara = await this.getVideoApsara([Posts_.mediaSource[0].apsaraId]);
            if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
              let vi = getApsara.VideoList[0];
              if (Posts_.mediaSource[0].apsaraId == vi.VideoId) {
                PostData_.mediaThumbEndpoint = vi.CoverURL;
              }
            }
            PostData_.apsaraId = String(Posts_.mediaSource[0].apsaraId);
            PostData_.isApsara = true;
          } else {
            PostData_.mediaThumbUri = Posts_.mediaSource[0].mediaThumb;
            PostData_.mediaEndpoint = '/stream/' + Posts_.postID;
            PostData_.mediaThumbEndpoint = '/thumb/' + Posts_.postID;
          }
          PostData_.mediaType = 'video';
          PostData_.isViewed = false;
        } else if (ns == 'mediastories') {
          if (Posts_.mediaSource[0].mediaType == 'video') {
            if (Posts_.mediaSource[0].apsara == true) {
              let getApsara = await this.getVideoApsara([Posts_.mediaSource[0].apsaraId]);
              if (getApsara != undefined && getApsara.VideoList != undefined && getApsara.VideoList.length > 0) {
                let vi = getApsara.VideoList[0];
                if (Posts_.mediaSource[0].apsaraId == vi.VideoId) {
                  PostData_.mediaThumbEndpoint = vi.CoverURL;
                }
              }
              PostData_.apsaraId = String(Posts_.mediaSource[0].apsaraId);
              PostData_.isApsara = true;
            } else {
              PostData_.mediaThumbUri = Posts_.mediaSource[0].mediaThumb;
              PostData_.mediaEndpoint = '/stream/' + Posts_.mediaSource[0].postID;
              PostData_.mediaThumbEndpoint = '/thumb/' + Posts_.mediaSource[0].postID;
            }
            PostData_.mediaType = 'video';
          } else {
            if (Posts_.mediaSource[0].apsara == true) {
              pics.push(Posts_.mediaSource[0].apsaraId);
              PostData_.apsaraId = String(Posts_.mediaSource[0].apsaraId);
              PostData_.isApsara = true;
            } else {
              PostData_.mediaThumbUri = Posts_.mediaSource[0].mediaThumb;
              PostData_.mediaEndpoint = '/pict/' + Posts_.postID;
              PostData_.mediaThumbEndpoint = '/thumb/' + Posts_.postID;
            }
            PostData_.mediaType = 'image';
          }
          PostData_.isViewed = false;
        }
      }
    }
    return PostData_;
  }

  public async getProfileAvatar(profile: Userbasicnew) {
    console.log("PROFILE", profile)
    console.log("PROFILE profilePict", profile.profilePict)
    let AvatarDTO_ = new Avatar();
    if (profile._idAvatar != undefined) {
      AvatarDTO_.mediaBasePath = profile.mediaBasePath;
      AvatarDTO_.mediaUri = profile.mediaUri;
      AvatarDTO_.mediaType = profile.mediaType;
      AvatarDTO_.mediaEndpoint = '/profilepict/' + profile._idAvatar.toString();
      console.log("AvatarDTO_", AvatarDTO_)
      return AvatarDTO_;
    } else {
      console.log("AvatarDTO_", AvatarDTO_)
      return AvatarDTO_;
    }
  }

  async uploadOss(buffer: Buffer, postId: string, filename: string, userId: string, mediaTipe: string) {
    var result = await this.ossContentPictService.uploadFileBuffer(buffer, userId + "/post/" + mediaTipe + "/" + postId + "/" + filename);
    return result;
  }

  private async buildPost_(body: any, data_userbasics: Userbasicnew): Promise<newPosts> {
    //Current Date
    const currentDate = await this.utilService.getDateTimeString();

    //Generate Expired
    const generateExpired = BigInt(this.utilService.generateAddExpirationFromToday(1));

    //Generate Post
    let Posts_ = new newPosts();
    Posts_._id = body.postID;
    Posts_.postID = body.postID;
    Posts_.postType = body.postType;

    Posts_.active = true;
    Posts_.email = data_userbasics.email;
    Posts_.createdAt = currentDate;
    Posts_.updatedAt = currentDate;
    Posts_.saleAmount = body.saleAmount;
    Posts_.expiration = Long.fromBigInt(generateExpired);

    if (body.urlLink != null && body.urlLink != undefined) {
      Posts_.urlLink = body.urlLink;
    }
    if (body.judulLink != null && body.judulLink != undefined) {
      Posts_.judulLink = body.judulLink;
    }else{
      if (body.urlLink != null && body.urlLink != undefined) {
        Posts_.judulLink = body.urlLink;
      }
    }
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
        let getUserauth = await this.basic2SS.findOneUsername(tagPeopleSplit[i].toString());
        if (await this.utilService.ceckData(getUserauth)) {
          tagPeople_array.push(new mongoose.Types.ObjectId(getUserauth._id.toString()));
          //tagPeople_array.push(new mongoose.Types.ObjectId(getUserauth._id.toString()));
        }
      }
      Posts_.tagPeople = tagPeople_array;
    }
    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      const tagDescriptionSplit = (body.tagDescription).split(",");
      let tagDescription_array = [];
      for (var i = 0; i < tagDescriptionSplit.length; i++) {
        let getUserauth = await this.basic2SS.findOneUsername(tagDescriptionSplit[i].toString());
        if (await this.utilService.ceckData(getUserauth)) {
          tagDescription_array.push(new mongoose.Types.ObjectId(getUserauth._id.toString()));
          //tagDescription_array.push(new mongoose.Types.ObjectId(getUserauth._id.toString()));
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
    Contentevents_._id = await this.utilService.generateId();
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

    let uniq=null;
    uniq=await this.addUniqEvent(data_userbasics.email.toString(),"POST","true","ACCEPT",null,body.postID);
    Contentevents_.uniqEvent=uniq;


    this.contentEventService.create(Contentevents_);
    return Posts_;
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

  public async generateCertificate(postId: string, lang: string, Posts_: newPosts, data_userbasics: Userbasicnew): Promise<string> {

    this.logger.log('generateCertificate >>> post: ' + postId + ', lang: ' + lang);
    const cheerio = require('cheerio');
    const QRCode = require('qrcode');
    const pdfWriter = require('html-pdf-node');

    if (Posts_ == undefined) {
      this.logger.error('generateCertificate >>> get post: undefined');
      return undefined;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', post validated');
    if (Posts_.certified == false) {
      this.logger.error('generateCertificate >>> get post certified: ' + Posts_.certified);
      return undefined;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', post certified validated');
    if (data_userbasics == undefined) {
      this.logger.error('generateCertificate >>> validate profile: ' + data_userbasics.email);
      return undefined;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', profile validated');
    let fileName = Posts_.postID + ".pdf";

    let postType = 'HyppeVid';

    if (Posts_.postType == 'vid') {
      postType = "HyppeVid";
    } else if (Posts_.postType == 'diary') {
      postType = "HyppeDiary";
    } else if (Posts_.postType == 'pict') {
      postType = "HyppePic";
    }

    let template = await this.templateService.findTemplateCreatePost();
    let body = template.body_detail;
    if (lang == 'id' && template.body_detail_id != undefined) {
      body = template.body_detail_id;
    }
    this.logger.log('generateCertificate >>> post: ' + postId + ', body: ' + body);

    const $_ = cheerio.load(body);

    $_('#fullname').text(data_userbasics.fullName);
    $_('#email').text(data_userbasics.email);
    $_('#postType').text(postType);
    $_('#createdAt').text(Posts_.createdAt);
    $_('#contentID').text(Posts_.postID);

    let qr = await this.utilService.generateQRCode(process.env.LINK_QR + Posts_.postID);
    $_('#qrcode').attr('src', qr);

    let meta = Posts_.metadata;
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
    pdf('#fullname').text(data_userbasics.fullName);
    pdf('#email').text(data_userbasics.email);
    pdf('#postType').text(postType);
    pdf('#createdAt').text(Posts_.createdAt);
    pdf('#contentID').text(Posts_.postID);
    pdf('#title').text(Posts_.description);
    pdf('#postID').text(Posts_.postID);

    let tg = "";
    let tgs = Posts_.tags;
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
      this.logger.log('generateCertificate >>> sending email to: ' + String(Posts_.email) + ', with subject: ' + String(template.subject));
      this.utilService.sendEmailWithAttachment(String(Posts_.email), 'no-reply@hyppe.app', String(template.subject), html, { filename: fileName, content: pdfBuffer });
    });


    return htmlPdf;
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

  private async buildUpdatePost(body: any, headers: any): Promise<newPosts> {
    this.logger.log('buildPost >>> start');
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.basic2SS.findBymail(auth.email);
    this.logger.log('buildPost >>> profile: ' + profile.email);

    let post = await this.newPostService.findByPostId(body.postID);
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
        var tp = await this.basic2SS.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp.username != undefined) {
            var objintr_ = new mongoose.Types.ObjectId(tp._id);
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
            pcats.push(objintr_);
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
        var tp = await this.basic2SS.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp != undefined || tp != null) {
            var objintrx = new mongoose.Types.ObjectId(tp._id);
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

    if(body.urlLink != undefined) {
      post.urlLink = body.urlLink.toString();
    }

    if(body.judulLink != undefined) {
      post.judulLink = body.judulLink.toString();
    }

    return post;
  }

  async getUserPostBoost(pageNumber: number, pageRow: number, headers: any) {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getboost";
    var setdata = {
      "pageNumber": pageNumber,
      "pageRow": pageRow,
    };
    var reqbody = JSON.parse(JSON.stringify(setdata));

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.basic2SS.findBymail(auth.email);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostBoost(pageNumber, pageRow, profile);
    let pd = await this.loadPostBoostData(posts, profile);
    res.data = pd;

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  private async doGetUserPostBoost(pageNumber: number, pageRow: number, whoami: Userbasicnew): Promise<newPosts[]> {
    var currentDateString = await this.utilService.getDateTimeISOString();
    var currentDate = new Date(currentDateString);
    var currentDateFormat = currentDate.toISOString().split('T')[0] + " " + currentDate.toISOString().split('T')[1].split('.')[0];
    console.log(currentDate)
    console.log(currentDate.toISOString().split('T')[0] + " " + currentDate.toISOString().split('T')[1].split('.')[0])
    var perPage = Math.max(0, pageRow), page = Math.max(0, pageNumber);

    const query = await this.loaddata.aggregate([
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
          ]
        }
      },
      {
        $addFields: {
          mediaId: '$mediaId.$id'
        }
      },
      {
        $addFields: {
          media: "$mediaSource"
        }
      },
      {
        $unwind: {
          path: "$boosted"
        }
      },
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
    return query;
  }

  private async loadPostBoostData(posts: newPosts[], iam: Userbasicnew): Promise<PostData[]> {
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
        pa.stiker = ps.stiker;

        if (ps.reportedStatus != undefined) {
          pa.reportedStatus = ps.reportedStatus;
        }
        if (ps.reportedUserCount != undefined) {
          pa.reportedUserCount = Number(ps.reportedUserCount);
        }
        pa.username = iam.username;
        pa.avatar = await this.getProfileAvatar(iam);

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
              let ua = await this.basic2SS.findOne(oid.toString());
              if (ua != undefined) {
                let tp1 = new TagPeople();
                tp1.email = String(ua.email);
                tp1.username = String(ua.username);
                tp1.avatar = await this.getProfileAvatar(ua);

                tp1.status = 'TOFOLLOW';
                if (tp1.email == pa.email) {
                  tp1.status = "UNLINK";
                } else {
                  let ceckFOLLOWING = iam.following.includes(tp1.email)
                  if (ceckFOLLOWING) {
                    tp1.status = "FOLLOWING";
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
              if (ps.mediaSource[0].apsara == true) {
                vids.push(ps.mediaSource[0].apsaraId);
                pa.apsaraId = String(ps.mediaSource[0].apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = ps.mediaSource[0].mediaThumb;
                pa.mediaEndpoint = '/stream/' + ps.mediaSource[0].mediaUri;
                pa.mediaThumbEndpoint = '/thumb/' + ps.mediaSource[0].postID;
              }

              //mediatype
              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (ps.userView != undefined ) {
                if (ps.userView.length > 0) {
                  for (let i = 0; i < ps.userView.length; i++) {
                    let vwt = ps.userView[i];
                    let vw = await this.basic2SS.findBymail(vwt);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            } else if (ns == 'mediapicts') {
              if (ps.mediaSource[0].apsara == true) {
                pics.push(ps.mediaSource[0].apsaraId);
                pa.apsaraId = String(ps.mediaSource[0].apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaEndpoint = '/pict/' + ps.mediaSource[0].postID;
                pa.mediaUri = ps.mediaSource[0].mediaUri;
              }

              pa.mediaType = 'image';

              //isview
              pa.isViewed = false;
              if (ps.userView != undefined) {
                if (ps.userView.length > 0) {
                  for (let i = 0; i < ps.userView.length; i++) {
                    let vwt = ps.userView[i];
                    let vw = await this.basic2SS.findBymail(vwt);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediadiaries') {
              if (ps.mediaSource[0].apsara == true) {
                vids.push(ps.mediaSource[0].apsaraId);
                pa.apsaraId = String(ps.mediaSource[0].apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = ps.mediaSource[0].mediaThumb;
                pa.mediaEndpoint = '/stream/' + ps.mediaSource[0].mediaUri;
                pa.mediaThumbEndpoint = '/thumb/' + ps.mediaSource[0].postID;
              }

              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (ps.userView != undefined) {
                if (ps.userView.length > 0) {
                  for (let i = 0; i < ps.userView.length; i++) {
                    let vwt = ps.userView[i];
                    let vw = await this.basic2SS.findBymail(vwt);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediastories') {
              if (ps.mediaSource[0].mediaType == 'video') {
                if (ps.mediaSource[0].apsara == true) {
                  vids.push(ps.mediaSource[0].apsaraId);
                  pa.apsaraId = String(ps.mediaSource[0].apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = ps.mediaSource[0].mediaThumb;
                  pa.mediaEndpoint = '/stream/' + ps.mediaSource[0].mediaUri;
                  pa.mediaThumbEndpoint = '/thumb/' + ps.mediaSource[0].postID;
                }
                pa.mediaType = 'video';
              } else {
                if (ps.mediaSource[0].apsara == true) {
                  pics.push(ps.mediaSource[0].apsaraId);
                  pa.apsaraId = String(ps.mediaSource[0].apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = ps.mediaSource[0].mediaThumb;
                  pa.mediaEndpoint = '/pict/' + ps.mediaSource[0].mediaUri;
                  pa.mediaThumbEndpoint = '/thumb/' + ps.mediaSource[0].postID;
                }
                pa.mediaType = 'image';
              }

              //isview
              pa.isViewed = false;
              if (ps.userView != undefined) {
                if (ps.userView.length > 0) {
                  for (let i = 0; i < ps.userView.length; i++) {
                    let vwt = ps.userView[i];
                    let vw = await this.basic2SS.findBymail(vwt);
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

        pa.isLiked = false;
        let ceckLike = ps.userLike.includes(iam.email)
        if (ceckLike) {
          pa.isLiked = true;
        }

        let InsightPost_ = new InsightPost();
        InsightPost_.likes = Number(ps.likes);
        InsightPost_.views = Number(ps.views);
        InsightPost_.shares = Number(ps.shares);
        InsightPost_.comments = Number(ps.comments);
        pa.insight = InsightPost_;

        postx.push(pa.postID);
        pd.push(pa);
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
            }
          }
        }
      }
    }
    return pd;
  }

  async addUniqEvent(email_receiverParty:string,eventType:string,active:string,event:string,email_user:string,postID:string){
    var uniqEvent=null;
    var arrData=[];
    uniqEvent=email_receiverParty+","+eventType+","+active+","+event+","+email_user+","+postID;
    arrData.push(uniqEvent);
    return arrData;
  }
}
