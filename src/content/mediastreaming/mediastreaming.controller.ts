import { Body, Controller, HttpCode, Headers, Get, HttpStatus, Post, UseGuards, Query } from '@nestjs/common';
import { MediastreamingService } from './mediastreaming.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { Long } from 'mongodb';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import mongoose from 'mongoose';
import { CallbackModeration, MediastreamingDto, MediastreamingRequestDto, RequestSoctDto } from './dto/mediastreaming.dto';
import { ConfigService } from '@nestjs/config';
import { MediastreamingalicloudService } from './mediastreamingalicloud.service';
import { AppGateway } from '../socket/socket.gateway';
import { UserauthsService } from 'src/trans/userauths/userauths.service';
import { MediastreamingrequestService } from './mediastreamingrequest.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { MediastreamingAgoraService } from './mediastreamingagora.service';
import { TransactionsV2Service } from 'src/trans/transactionsv2/transactionsv2.service';
import { MonetizationService } from 'src/trans/monetization/monetization.service';

@Controller("api/live") 
export class MediastreamingController {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly configService: ConfigService,
    private readonly mediastreamingService: MediastreamingService,
    private readonly mediastreamingalicloudService: MediastreamingalicloudService,
    private readonly mediastreamingAgoraService: MediastreamingAgoraService,
    private readonly userbasicnewService: UserbasicnewService,
    private readonly userauthService: UserauthsService, 
    private readonly mediastreamingrequestService: MediastreamingrequestService, 
    private readonly appGateway: AppGateway,) { } 

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @HttpCode(HttpStatus.ACCEPTED)
  async createStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
    const currentDate = await this.utilsService.getDate();
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
    var profile = await this.userbasicnewService.findBymail(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(profile))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }

    //Get EXPIRATION_TIME_LIVE
    const GET_EXPIRATION_TIME_LIVE = this.configService.get("EXPIRATION_TIME_LIVE");
    const EXPIRATION_TIME_LIVE = await this.utilsService.getSetting_Mixed(GET_EXPIRATION_TIME_LIVE);
    const generateId = new mongoose.Types.ObjectId();
  
    const expireTime = Math.round(((currentDate.date.getTime()) / 1000)) + Number(EXPIRATION_TIME_LIVE.toString());
    const generateToken = await this.mediastreamingAgoraService.generateToken(generateId.toString(), expireTime);
    //const generateToken = await this.mediastreamingAgoraService.generateToken(profile._id.toString(), expireTime);
    //const getUrl = await this.mediastreamingService.generateUrl(generateId.toString(), expireTime);
    let _MediastreamingDto_ = new MediastreamingDto();
    _MediastreamingDto_._id = generateId;
    _MediastreamingDto_.userId = new mongoose.Types.ObjectId(profile._id.toString());
    _MediastreamingDto_.expireTime = Long.fromInt(expireTime);
    _MediastreamingDto_.view = [];
    _MediastreamingDto_.comment = [];
    _MediastreamingDto_.like = [];
    _MediastreamingDto_.share = [];
    _MediastreamingDto_.follower = [];
    // _MediastreamingDto_.urlStream = getUrl.urlStream;
    // _MediastreamingDto_.urlIngest = getUrl.urlIngest;
    _MediastreamingDto_.createAt = currentDate.dateString;
    if (MediastreamingDto_.title != undefined) {
      _MediastreamingDto_.title = MediastreamingDto_.title;
    }
    _MediastreamingDto_.status = true;
    _MediastreamingDto_.startLive = currentDate.dateString;
    _MediastreamingDto_.tokenAgora = generateToken.token;

    const data = await this.mediastreamingService.createStreaming(_MediastreamingDto_);
    this.mediastreamingService.broadcastFCMLive(profile, MediastreamingDto_.title);

    const dataResponse = {};
    dataResponse['_id'] = data._id;
    dataResponse['title'] = data.title;
    dataResponse['userId'] = data.userId;
    dataResponse['expireTime'] = Number(data.expireTime);
    dataResponse['startLive'] = data.startLive;
    dataResponse['status'] = data.status;
    dataResponse['view'] = data.view;
    dataResponse['comment'] = data.comment;
    dataResponse['like'] = data.like;
    dataResponse['share'] = data.share;
    dataResponse['follower'] = data.follower;
    dataResponse['urlStream'] = data.urlStream;
    dataResponse['urlIngest'] = data.urlIngest;
    dataResponse['createAt'] = data.createAt;
    dataResponse['token'] = data.tokenAgora;
    dataResponse['url'] = data.url;
    dataResponse['textUrl'] = data.textUrl;
    const Response = {
      response_code: 202,
      data: dataResponse,
      messages: {
        info: [
          "Create stream succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
    const currentDate = await this.utilsService.getDateTimeString();
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
    var profile = await this.userbasicnewService.findBymail(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(profile))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
    //VALIDASI PARAM _id
    var ceck_id = await this.utilsService.validateParam("_id", MediastreamingDto_._id.toString(), "string")
    if (ceck_id != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_id,
      );
    }
    //VALIDASI PARAM type
    var ceck_type = await this.utilsService.validateParam("type", MediastreamingDto_.type, "string")
    if (ceck_type != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_type,
      );
    }

    const ceckId = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
    let _MediastreamingDto_ = new MediastreamingDto();
    if (await this.utilsService.ceckData(ceckId)){
      //CECK TYPE START
      if (MediastreamingDto_.type == "START"){
        const getDateTime = new Date().getTime();
        if (Number(ceckId.expireTime) > Number(getDateTime)) {
          if (MediastreamingDto_.title != undefined) {
            _MediastreamingDto_.title = MediastreamingDto_.title;
          }
          _MediastreamingDto_.status = true;
          _MediastreamingDto_.startLive = currentDate;
          await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
        } else {
          await this.errorHandler.generateInternalServerErrorException(
            'Unabled to proceed, Stream is expired ',
          );
        }
      }
      //CECK TYPE STOP
      if (MediastreamingDto_.type == "STOP") {
        _MediastreamingDto_.status = false;
        _MediastreamingDto_.endLive = currentDate;
        await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
        const getDataStream = await this.mediastreamingService.getDataEndLive(MediastreamingDto_._id.toString());
        //SEND STATUS STOP
        const dataPause = {
          data: {
            idStream: MediastreamingDto_._id.toString(),
            status: false,
            totalViews: getDataStream[0].view_unique.length,
          }
        }
        const STREAM_MODE = this.configService.get("STREAM_MODE");
        if (STREAM_MODE == "1") {
          this.appGateway.eventStream("STATUS_STREAM", JSON.stringify(dataPause));
        }else{
          let RequestSoctDto_ = new RequestSoctDto();
          RequestSoctDto_.event = "STATUS_STREAM";
          RequestSoctDto_.data = JSON.stringify(dataPause);
          this.mediastreamingService.socketRequest(RequestSoctDto_);
        }
      }
      //CECK TYPE STOP
      if (MediastreamingDto_.type == "PAUSE") {
        //UPDATE STATUS PAUSE
        const pause = (ceckId.pause != undefined) ? ceckId.pause:false;
        if (pause){
          _MediastreamingDto_.pause = false;
        } else {
          _MediastreamingDto_.pause = true;
        }
        await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
        //SEND STATUS PAUSE
        const dataPause = {
          data: {
            idStream: MediastreamingDto_._id.toString(),
            pause: _MediastreamingDto_.pause
          }
        }
        const STREAM_MODE = this.configService.get("STREAM_MODE");
        if (STREAM_MODE == "1") {
          this.appGateway.eventStream("STATUS_STREAM", JSON.stringify(dataPause));
        } else {
          let RequestSoctDto_ = new RequestSoctDto();
          RequestSoctDto_.event = "STATUS_STREAM";
          RequestSoctDto_.data = JSON.stringify(dataPause);
          this.mediastreamingService.socketRequest(RequestSoctDto_);
        }
      }
      //CECK TYPE OPEN_VIEW
      if (MediastreamingDto_.type == "OPEN_VIEW") {
        const ceckView = await this.mediastreamingService.findView(MediastreamingDto_._id.toString(), profile._id.toString());
        if (!(await this.utilsService.ceckData(ceckView))) {
          //UPDATE VIEW
          const dataView = {
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            createAt: currentDate,
            updateAt: currentDate
          }
          await this.mediastreamingService.insertView(MediastreamingDto_._id.toString(), dataView);
          //UPDATE COMMENT
          let idComment = new mongoose.Types.ObjectId();
          const dataComment = {
            idComment: idComment,
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            messages: "joined",
            createAt: currentDate,
            updateAt: currentDate
          }
          await this.mediastreamingService.insertComment(MediastreamingDto_._id.toString(), dataComment);
          //SEND VIEW COUNT
          const dataStream = await this.mediastreamingService.findOneStreamingView(MediastreamingDto_._id.toString());
          let viewCount = 0;
          if (dataStream.length > 0) {
            viewCount = dataStream[0].view.length;
          }
          const dataStreamSend = {
            data: {
              idStream: MediastreamingDto_._id.toString(),
              viewCount: viewCount
            }
          }
          const STREAM_MODE = this.configService.get("STREAM_MODE");
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "VIEW_STREAM";
            RequestSoctDto_.data = JSON.stringify(dataStreamSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
          //SEND COMMENT SINGLE
          const getUser = await this.userbasicnewService.getUser(profile._id.toString());
          getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          getUser[0]["messages"] = "joined";
          const singleSend = {
            data: getUser[0]
          }
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("COMMENT_STREAM_SINGLE", JSON.stringify(singleSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "COMMENT_STREAM_SINGLE";
            RequestSoctDto_.data = JSON.stringify(singleSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
        } 
      }
      //CECK TYPE CLOSE_VIEW
      if (MediastreamingDto_.type == "CLOSE_VIEW") {
        const ceckView = await this.mediastreamingService.findView(MediastreamingDto_._id.toString(), profile._id.toString());
        if (await this.utilsService.ceckData(ceckView)) {
          //UPDATE VIEW
          await this.mediastreamingService.updateView(MediastreamingDto_._id.toString(), profile._id.toString(), true, false, currentDate);
          //UPDATE COMMENT
          // const dataComment = {
          //   userId: new mongoose.Types.ObjectId(profile._id.toString()),
          //   status: true,
          //   messages: profile_auth.username + " Leave in room",
          //   createAt: currentDate,
          //   updateAt: currentDate
          // }
          // await this.mediastreamingService.insertComment(MediastreamingDto_._id.toString(), dataComment);
          //SEND VIEW COUNT
          const dataStream = await this.mediastreamingService.findOneStreamingView(MediastreamingDto_._id.toString());
          let viewCount = 0;
          if (dataStream.length > 0) {
            viewCount = dataStream[0].view.length;
          }
          const dataStreamSend = {
            data: {
              idStream: MediastreamingDto_._id.toString(),
              viewCount: viewCount
            }
          }
          const STREAM_MODE = this.configService.get("STREAM_MODE");
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "VIEW_STREAM";
            RequestSoctDto_.data = JSON.stringify(dataStreamSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
          //SEND COMMENT SINGLE
          // const getUser = await this.userbasicsService.getUser(profile._id.toString());
          // getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          // getUser[0]["messages"] = profile_auth.username + " Leave in room";
          // const singleSend = {
          //   data: getUser[0]
          // }
          // this.appGateway.eventStream("COMMENT_STREAM_SINGLE", JSON.stringify(singleSend));
        }
      }
      //CECK TYPE LIKE
      if (MediastreamingDto_.type == "LIKE") {
        if (MediastreamingDto_.like.length > 0) {
          let dataLike = MediastreamingDto_.like;
          const likesave = dataLike.map((str) => ({ userId: new mongoose.Types.ObjectId(profile._id.toString()), createAt: str }));
          await this.mediastreamingService.insertLike(MediastreamingDto_._id.toString(), likesave);
          const dataStream = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            data:{
              idStream: dataStream._id,
              userId: profile._id.toString(),
              likeCount: MediastreamingDto_.like.length,
              likeCountTotal: dataStream.like.length
            }
          }
          const STREAM_MODE = this.configService.get("STREAM_MODE");
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("LIKE_STREAM", JSON.stringify(dataStreamSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "LIKE_STREAM";
            RequestSoctDto_.data = JSON.stringify(dataStreamSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
        }
      }
      //CECK TYPE COMMENT
      if (MediastreamingDto_.type == "COMMENT") {
        if (MediastreamingDto_.commentType != undefined) {
          const getUser = await this.userbasicnewService.getUser(profile._id.toString());
          if (await this.utilsService.ceckData(getUser)) {
            let idComment = new mongoose.Types.ObjectId();
            let dataComment = {};
            if (MediastreamingDto_.commentType == "MESSAGGES") {
              //SET DATA COMMENT
              dataComment['idComment'] = idComment;
              dataComment['commentType'] = MediastreamingDto_.commentType;
              dataComment['userId'] = new mongoose.Types.ObjectId(profile._id.toString());
              dataComment['status'] = true;
              dataComment['pinned'] = false;
              dataComment['messages'] = MediastreamingDto_.messages;
              dataComment['createAt'] = currentDate;
              dataComment['updateAt'] = currentDate;

              getUser[0]["idComment"] = idComment;
              getUser[0]["idStream"] = MediastreamingDto_._id.toString();
              getUser[0]["commentType"] = MediastreamingDto_.commentType;
              getUser[0]["userId"] = MediastreamingDto_.userId;
              getUser[0]["status"] = true;
              getUser[0]["pinned"] = false;
              getUser[0]["messages"] = MediastreamingDto_.messages;
              getUser[0]["createAt"] = currentDate;
              getUser[0]["updateAt"] = currentDate;
            }
            if (MediastreamingDto_.commentType == "GIFT") {
              //SET DATA COMMENT
              dataComment['idComment'] = idComment;
              dataComment['commentType'] = MediastreamingDto_.commentType;
              dataComment['userId'] = new mongoose.Types.ObjectId(profile._id.toString());
              dataComment['status'] = true;
              dataComment['pinned'] = false;
              dataComment['messages'] = MediastreamingDto_.messages;
              dataComment['createAt'] = currentDate;
              dataComment['updateAt'] = currentDate;

              getUser[0]["idComment"] = idComment;
              getUser[0]["idStream"] = MediastreamingDto_._id.toString();
              getUser[0]["commentType"] = MediastreamingDto_.commentType;
              getUser[0]["userId"] = MediastreamingDto_.userId;
              getUser[0]["status"] = true;
              getUser[0]["pinned"] = false;
              getUser[0]["messages"] = MediastreamingDto_.messages;
              getUser[0]["createAt"] = currentDate;
              getUser[0]["updateAt"] = currentDate;

              if (MediastreamingDto_.idGift != undefined) {
                dataComment['idGift'] = MediastreamingDto_.idGift;
                getUser[0]["idGift"] = MediastreamingDto_.idGift;
                await this.mediastreamingService.insertGift(MediastreamingDto_._id.toString(), dataComment);
                this.mediastreamingService.transactionGift(profile.email.toString() ,MediastreamingDto_._id.toString(), profile._id.toString(), MediastreamingDto_.idGift.toString(), MediastreamingDto_.idDiscond.toString());
              }
              if (MediastreamingDto_.urlGift != undefined) {
                dataComment['urlGift'] = MediastreamingDto_.urlGift;
                getUser[0]["urlGift"] = MediastreamingDto_.urlGift;
              }
              if (MediastreamingDto_.urlGiftThum != undefined) {
                dataComment['urlGiftThum'] = MediastreamingDto_.urlGiftThum;
                getUser[0]["urlGiftThum"] = MediastreamingDto_.urlGiftThum;
              }
              if (MediastreamingDto_.idDiscond != undefined) {
                dataComment['idDiscond'] = MediastreamingDto_.idDiscond;
                getUser[0]["idDiscond"] = MediastreamingDto_.idDiscond;
              }
            }
            //UPDATE COMMENT
            await this.mediastreamingService.insertComment(MediastreamingDto_._id.toString(), dataComment);
            //GET SOCKET MODE
            const STREAM_MODE = this.configService.get("STREAM_MODE");
            //SEND COMMENT SINGLE
            const singleSend = {
              data: getUser[0]
            }
            if (STREAM_MODE == "1") {
              this.appGateway.eventStream("COMMENT_STREAM_SINGLE", JSON.stringify(singleSend));
            } else {
              let RequestSoctDto_ = new RequestSoctDto();
              RequestSoctDto_.event = "COMMENT_STREAM_SINGLE";
              RequestSoctDto_.data = JSON.stringify(singleSend);
              this.mediastreamingService.socketRequest(RequestSoctDto_);
            }
            //SEND COMMENT ALL
            const getData = await this.mediastreamingService.getDataComment(MediastreamingDto_._id.toString())
            const allSend = {
              data: getData
            }
            if (STREAM_MODE == "1") {
              this.appGateway.eventStream("COMMENT_STREAM_ALL", JSON.stringify(allSend));
            } else {
              let RequestSoctDto_ = new RequestSoctDto();
              RequestSoctDto_.event = "COMMENT_STREAM_ALL";
              RequestSoctDto_.data = JSON.stringify(allSend);
              this.mediastreamingService.socketRequest(RequestSoctDto_);
            }
          }
        }
      }
      //CECK TYPE COMMENT PINNED
      if (MediastreamingDto_.type == "COMMENT_PINNED") {
        if (MediastreamingDto_._id != undefined && MediastreamingDto_.idComment != undefined) {
          let pinned_ = false;
          if (MediastreamingDto_.pinned != undefined){
            if (MediastreamingDto_.pinned){
              pinned_ = true;
            }
          }
          if (pinned_) {
            await this.mediastreamingService.updateManyCommentPinned(MediastreamingDto_._id.toString(), false, currentDate);
          }
          await this.mediastreamingService.updateCommentPinned(MediastreamingDto_._id.toString(), MediastreamingDto_.idComment.toString(),  MediastreamingDto_.pinned, currentDate)
          //GET SOCKET MODE
          const STREAM_MODE = this.configService.get("STREAM_MODE");
          //SEND COMMENT SINGLE
          const getUser = await this.userbasicnewService.getUser(profile._id.toString());
          getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          getUser[0]["idComment"] = MediastreamingDto_.idComment.toString();
          getUser[0]["pinned"] = pinned_;
          const singleSend = {
            data: getUser[0]
          }
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("COMMENT_PINNED_STREAM_SINGLE", JSON.stringify(singleSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "COMMENT_PINNED_STREAM_SINGLE";
            RequestSoctDto_.data = JSON.stringify(singleSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
          //SEND COMMENT ALL
          const getData = await this.mediastreamingService.getDataCommentPinned(MediastreamingDto_._id.toString())
          const allSend = {
            data: getData
          }
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("COMMENT_PINNED_STREAM_ALL", JSON.stringify(allSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "COMMENT_PINNED_STREAM_ALL";
            RequestSoctDto_.data = JSON.stringify(allSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
        }
      }
      //CECK TYPE DELETE COMMENT
      if (MediastreamingDto_.type == "COMMENT_DELETE") {
        if (MediastreamingDto_._id != undefined && MediastreamingDto_.idComment != undefined) {
          let status = false;
          await this.mediastreamingService.updateCommentDelete(MediastreamingDto_._id.toString(), MediastreamingDto_.idComment.toString(), status, currentDate)

          //SEND COMMENT SINGLE
          const getUser = await this.userbasicnewService.getUser(profile._id.toString());
          getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          getUser[0]["idComment"] = MediastreamingDto_.idComment.toString();
          getUser[0]["status"] = status;
          const singleSend = {
            data: getUser[0]
          }
          const STREAM_MODE = this.configService.get("STREAM_MODE");
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("COMMENT_DELETE_STREAM_SINGLE", JSON.stringify(singleSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "COMMENT_DELETE_STREAM_SINGLE";
            RequestSoctDto_.data = JSON.stringify(singleSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
          //SEND COMMENT ALL
          const getData = await this.mediastreamingService.getDataCommentPinned(MediastreamingDto_._id.toString())
          const allSend = {
            data: getData
          }
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("COMMENT_DELETE_STREAM_ALL", JSON.stringify(allSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "COMMENT_DELETE_STREAM_ALL";
            RequestSoctDto_.data = JSON.stringify(allSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
        }
      }
      //CECK TYPE COMMENT DISABLED
      if (MediastreamingDto_.type == "COMMENT_DISABLED") {
        if (MediastreamingDto_.commentDisabled != undefined) {
          const allSend = {
            data: {
              idStream: MediastreamingDto_._id,
              comment: MediastreamingDto_.commentDisabled
            }
          }
          _MediastreamingDto_.commentDisabled = MediastreamingDto_.commentDisabled;
          await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
          const STREAM_MODE = this.configService.get("STREAM_MODE");
          if (STREAM_MODE == "1") {
            this.appGateway.eventStream("COMMENT_STREAM_DISABLED", JSON.stringify(allSend));
          } else {
            let RequestSoctDto_ = new RequestSoctDto();
            RequestSoctDto_.event = "COMMENT_STREAM_DISABLED";
            RequestSoctDto_.data = JSON.stringify(allSend);
            this.mediastreamingService.socketRequest(RequestSoctDto_);
          }
        }
      }
      //CECK TYPE KICK
      if (MediastreamingDto_.type == "KICK") {
        console.log(MediastreamingDto_.userId)
        if (MediastreamingDto_.userId != undefined) {
          const ceckView = await this.mediastreamingService.findView(MediastreamingDto_._id.toString(), MediastreamingDto_.userId.toString());
          console.log(ceckView)
          if (await this.utilsService.ceckData(ceckView)) {
            //UPDATE VIEW
            await this.mediastreamingService.updateView(MediastreamingDto_._id.toString(), MediastreamingDto_.userId.toString(), true, false, currentDate);
            //UPDATE KICK
            const dataKick = {
              userId: new mongoose.Types.ObjectId(MediastreamingDto_.userId.toString()),
              status: true,
              createAt: currentDate,
              updateAt: currentDate
            }
            await this.mediastreamingService.insertKick(MediastreamingDto_._id.toString(), dataKick);
            //SEND KICK USER
            const getUser = await this.userbasicnewService.getUser(MediastreamingDto_.userId.toString());
            getUser[0]["idStream"] = MediastreamingDto_._id.toString();
            const singleSend = {
              data: getUser[0]
            }
            const STREAM_MODE = this.configService.get("STREAM_MODE");
            if (STREAM_MODE == "1") {
              this.appGateway.eventStream("KICK_USER_STREAM", JSON.stringify(singleSend));
            } else {
              let RequestSoctDto_ = new RequestSoctDto();
              RequestSoctDto_.event = "KICK_USER_STREAM";
              RequestSoctDto_.data = JSON.stringify(singleSend);
              this.mediastreamingService.socketRequest(RequestSoctDto_);
            }
            //SEND VIEW COUNT
            const dataStream = await this.mediastreamingService.findOneStreamingView(MediastreamingDto_._id.toString());
            let viewCount = 0;
            if (dataStream.length > 0) {
              viewCount = dataStream[0].view.length;
            }
            const dataStreamSend = {
              data: {
                idStream: MediastreamingDto_._id.toString(),
                viewCount: viewCount
              }
            }
            if (STREAM_MODE == "1") {
              this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
            } else {
              let RequestSoctDto_ = new RequestSoctDto();
              RequestSoctDto_.event = "VIEW_STREAM";
              RequestSoctDto_.data = JSON.stringify(dataStreamSend);
              this.mediastreamingService.socketRequest(RequestSoctDto_);
            }
          }
        }
      }
      //CECK TYPE REPORT
      if (MediastreamingDto_.type == "REPORT") {
        if (MediastreamingDto_.messages != undefined) {
          //UPDATE REPORT
          let idReport = new mongoose.Types.ObjectId();
          const dataReport = {
            idReport: idReport,
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            messages: MediastreamingDto_.messages,
            createAt: currentDate,
            updateAt: currentDate
          };
          await this.mediastreamingService.insertReport(MediastreamingDto_._id.toString(), dataReport);
          let getData = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          if (await this.utilsService.ceckData(getData)){
            let getReportlength = getData.report.length;
            if (getReportlength) {
              const ID_SETTING_MAX_REPORT = this.configService.get("ID_SETTING_MAX_REPORT");
              const GET_ID_SETTING_MAX_REPORT = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_MAX_REPORT);
              if (getReportlength >= Number(GET_ID_SETTING_MAX_REPORT)) {
                _MediastreamingDto_.status = false;
                _MediastreamingDto_.endLive = currentDate;
                await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
                const getDataStream = await this.mediastreamingService.getDataEndLive(MediastreamingDto_._id.toString());
                //SEND STATUS STOP
                const dataPause = {
                  data: {
                    idStream: MediastreamingDto_._id.toString(),
                    status: false,
                    totalViews: getDataStream[0].view_unique.length,
                  }
                }
                const STREAM_MODE = this.configService.get("STREAM_MODE");
                if (STREAM_MODE == "1") {
                  this.appGateway.eventStream("STATUS_STREAM", JSON.stringify(dataPause));
                } else {
                  let RequestSoctDto_ = new RequestSoctDto();
                  RequestSoctDto_.event = "STATUS_STREAM";
                  RequestSoctDto_.data = JSON.stringify(dataPause);
                  this.mediastreamingService.socketRequest(RequestSoctDto_);
                }
              }
            }
          }
        }
      }

      if (MediastreamingDto_.type == "STOP") {
        const getDataStream = await this.mediastreamingService.getDataEndLive(MediastreamingDto_._id.toString());
        const dataResponse = {
          totalViews: getDataStream[0].view_unique.length,
          totalShare: getDataStream[0].share.length,
          totalFollower: getDataStream[0].follower.length, 
          totalComment: getDataStream[0].comment.length,
          totalLike: getDataStream[0].like.length
        }
        return await this.errorHandler.generateAcceptResponseCodeWithData(
          "Update stream succesfully", dataResponse
        );
      } else if (MediastreamingDto_.type == "OPEN_VIEW") {
        const dataStreamView = await this.mediastreamingService.findOneStreamingView(MediastreamingDto_._id.toString());
        const dataStreamPinned = await this.mediastreamingService.findOneStreamingPinned(MediastreamingDto_._id.toString());
        //GET ID JENIS REPORT
        const ID_SETTING_JENIS_REPORT = this.configService.get("ID_SETTING_JENIS_REPORT");
        const GET_ID_SETTING_JENIS_REPORT = await this.utilsService.getSetting_Mixed(ID_SETTING_JENIS_REPORT);

        const MediastreamingDto_Res = new MediastreamingDto();
        MediastreamingDto_Res._id = ceckId._id;
        MediastreamingDto_Res.title = ceckId.title;
        MediastreamingDto_Res.userId = ceckId.userId;
        MediastreamingDto_Res.expireTime = ceckId.expireTime;
        MediastreamingDto_Res.startLive = ceckId.startLive;
        MediastreamingDto_Res.status = ceckId.status;
        MediastreamingDto_Res.view = ceckId.view;
        MediastreamingDto_Res.comment = ceckId.comment;
        MediastreamingDto_Res.like = ceckId.like;
        MediastreamingDto_Res.share = ceckId.share;
        MediastreamingDto_Res.follower = ceckId.follower;
        MediastreamingDto_Res.urlStream = ceckId.urlStream;
        MediastreamingDto_Res.urlIngest = ceckId.urlIngest;
        MediastreamingDto_Res.createAt = ceckId.createAt;
        MediastreamingDto_Res.viewCountActive = dataStreamView[0].view.length;
        MediastreamingDto_Res.comment = dataStreamPinned;
        MediastreamingDto_Res.reportRemark = GET_ID_SETTING_JENIS_REPORT;
        return await this.errorHandler.generateAcceptResponseCodeWithData(
          "Update stream succesfully", MediastreamingDto_Res
        );
      } else {
        return await this.errorHandler.generateAcceptResponseCode(
          "Update stream succesfully",
        );
      }
    } else {
      await this.errorHandler.generateInternalServerErrorException(
        'Unabled to proceed, _id Stream not exist',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/view')
  @HttpCode(HttpStatus.ACCEPTED)
  async getViewStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
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
    var ceckId = await this.utilsService.validateParam("_id", MediastreamingDto_._id.toString(), "string")
    if (ceckId != "") {
      await this.errorHandler.generateBadRequestException(
        ceckId,
      );
    }
    let data = [];
    if (MediastreamingDto_.type != undefined) {
      if (MediastreamingDto_.type == "END") {
        data = await this.mediastreamingService.getDataViewUnic(MediastreamingDto_._id.toString(), MediastreamingDto_.page, MediastreamingDto_.limit);
      }
    } else {
      data = await this.mediastreamingService.getDataView(MediastreamingDto_._id.toString(), MediastreamingDto_.page, MediastreamingDto_.limit);
    }
    return await this.errorHandler.generateAcceptResponseCodeWithData(
      "Get view succesfully", data,
    );
  }

  @Get('/callback/apsara')
  @HttpCode(HttpStatus.OK)
  async getCallbackApsara(
    @Query('action') action: string,
    @Query('ip') ip: string,
    @Query('id') id: string,
    @Query('app	') app: string,
    @Query('appname') appname: string,
    @Query('time') time: string,
    @Query('usrargs') usrargs: string,
    @Query('height') height: string,
    @Query('width') width: string){
      if (id!=undefined){
        const CeckData = await this.mediastreamingService.findOneStreaming(id.toString());
        if (await this.utilsService.ceckData(CeckData)){
          let MediastreamingDto_ = new MediastreamingDto();
          if (action = "publish_done") {
            MediastreamingDto_.status = false;
            MediastreamingDto_.endLive = await this.utilsService.getIntegertoDate(Number(time));
          }
          if (action = "publish") {
            MediastreamingDto_.status = true;
          }
          // if (action = "publish") {
          //   MediastreamingDto_.status = true;
          //   MediastreamingDto_.startLive = await this.utilsService.getIntegertoDate(Number(time));
          // }
          this.mediastreamingService.updateStreaming(id.toString(), MediastreamingDto_)
        }
      }
      const param = {
        action: action,
        ip: ip,
        id: id,
        app: app,
        appname: appname,
        time: time,
        usrargs: usrargs,
        height: height,
        width: width,
      }
      const response = {
        code: 200,
        messages: "Succes"
      }
      let MediastreamingRequestDto_ = new MediastreamingRequestDto();
      MediastreamingRequestDto_._id = new mongoose.Types.ObjectId();
      MediastreamingRequestDto_.url = "/api/live/callback/apsara";
      MediastreamingRequestDto_.request = param;
      MediastreamingRequestDto_.response = response;
      MediastreamingRequestDto_.createAt = await this.utilsService.getDateTimeString();
      MediastreamingRequestDto_.updateAt = await this.utilsService.getDateTimeString();
      this.mediastreamingrequestService.createStreamingRequest(MediastreamingRequestDto_);
      return response
  }

  @Post('/callback/moderation')
  @HttpCode(HttpStatus.OK)
  async getCallbackModeration(@Body() CallbackModeration_: CallbackModeration) {
    const param = CallbackModeration_
    const response = {
      code: 200,
      messages: "Succes"
    }
    let MediastreamingRequestDto_ = new MediastreamingRequestDto();
    MediastreamingRequestDto_._id = new mongoose.Types.ObjectId();
    MediastreamingRequestDto_.url = "/api/live/callback/apsara";
    MediastreamingRequestDto_.request = param;
    MediastreamingRequestDto_.response = response;
    MediastreamingRequestDto_.createAt = await this.utilsService.getDateTimeString();
    MediastreamingRequestDto_.updateAt = await this.utilsService.getDateTimeString();
    this.mediastreamingrequestService.createStreamingRequest(MediastreamingRequestDto_);
    return response
  }

  @UseGuards(JwtAuthGuard)
  @Post('/feedback')
  @HttpCode(HttpStatus.ACCEPTED)
  async feedback(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
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
    var ceck_id = await this.utilsService.validateParam("_id", MediastreamingDto_._id.toString(), "string")
    if (ceck_id != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_id,
      );
    } 
    //VALIDASI PARAM feedBack
    // var ceck_feedBack = await this.utilsService.validateParam("feedBack", MediastreamingDto_.feedBack.toString(), "number")
    // if (ceck_feedBack != "") {
    //   await this.errorHandler.generateBadRequestException(
    //     ceck_feedBack,
    //   );
    // }
    try {
      let _MediastreamingDto_ = new MediastreamingDto();
      _MediastreamingDto_.feedBack = MediastreamingDto_.feedBack;
      _MediastreamingDto_.feedbackText = MediastreamingDto_.feedbackText;
      await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
      return await this.errorHandler.generateAcceptResponseCode(
        "Update stream succesfully",
      );
    } catch (e) {
      await this.errorHandler.generateInternalServerErrorException(
        'Unabled to proceed ' +e,
      );
    }
  }

  //@UseGuards(JwtAuthGuard)
  @Post('/list')
  @HttpCode(HttpStatus.ACCEPTED)
  async listStreamingAgora(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
    // if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unauthorized',
    //   );
    // }
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed email header dan token not match',
    //   );
    // }
    var profile = await this.userbasicnewService.findBymail(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(profile))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }

    let dataList = [];
    let skip_ = (Number(MediastreamingDto_.page) > 0) ? (Number(MediastreamingDto_.page) * Number(MediastreamingDto_.limit)) : Number(MediastreamingDto_.page);
    let limit_ = Number(MediastreamingDto_.limit);
    try {
      let _id: mongoose.Types.ObjectId[] = [];
      const data = await this.mediastreamingAgoraService.getChannelList();
      console.log(data);
      if (data != null) {
        let dataChannel = data.data.channels;
        console.log(dataChannel);
        if (dataChannel.length>0){
          dataChannel = dataChannel.slice(skip_, skip_ + limit_);
          _id = dataChannel.map(function (item) {
            console.log("channel_name", item['channel_name'])
            return new mongoose.Types.ObjectId(item['channel_name']);
          });
        }
        dataList = await this.mediastreamingService.getDataListAgora(profile._id.toString(), headers['x-auth-user'], _id, MediastreamingDto_.page, MediastreamingDto_.limit)
        return await this.errorHandler.generateAcceptResponseCodeWithData(
          "Get stream succesfully", dataList,
        );
      }
    } catch (e) {
      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Get stream succesfully", dataList,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/list/backup')
  @HttpCode(HttpStatus.ACCEPTED)
  async listStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
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

    let dataList = [];
    try {
      let _id: mongoose.Types.ObjectId[] = [];
      const data = await this.mediastreamingalicloudService.DescribeLiveStreamsOnlineList(undefined, MediastreamingDto_.page, MediastreamingDto_.limit);
      const arrayOnline = data.body.onlineInfo.liveStreamOnlineInfo;

      _id = arrayOnline.map(function (item) {
        console.log("streamName", item['streamName'])
        return new mongoose.Types.ObjectId(item['streamName']);
      });
      console.log("_id", _id)
      dataList = await this.mediastreamingService.getDataList(headers['x-auth-user'], _id, MediastreamingDto_.page, MediastreamingDto_.limit)
      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Get stream succesfully", dataList,
      );
    } catch (e) {
      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Get stream succesfully", dataList,
      );
    }
  }

  @Post('/test')
  async exampleGenerateLink(@Body() MediastreamingDto_: MediastreamingDto){
    // const getUrl = await this.mediastreamingService.generateUrlTest("657fb4b76ea72f0b782c610a", 1702873753);
    const dataStream = await this.mediastreamingService.findOneStreamingView(MediastreamingDto_._id.toString());
    if (dataStream.length > 0) {
      return dataStream[0].view;
    }else{
      return [];
    }
  }

  @Post('/agora/live')
  async generateToken(@Body() MediastreamingDto_: MediastreamingDto) {

    //EXPIRATION TIME LIVE
    const EXPIRATION_TIME_LIVE = this.configService.get("EXPIRATION_TIME_LIVE");
    const GET_EXPIRATION_TIME_LIVE = await this.utilsService.getSetting_Mixed(EXPIRATION_TIME_LIVE);

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + Number(GET_EXPIRATION_TIME_LIVE)
    return await this.mediastreamingAgoraService.generateToken(MediastreamingDto_.userId.toString(), privilegeExpireTime);
  }
}