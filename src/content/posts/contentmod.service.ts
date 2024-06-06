import { Logger, Injectable, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar, PostLandingResponseApps, PostLandingData, PostBuildData, VideoList, ImageInfo } from './dto/create-posts.dto';
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
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { v4 as uuidv4 } from 'uuid';
import { AppGateway } from 'src/content/socket/socket.gateway';


@Injectable()
export class ContentModService {
  private readonly logger = new Logger(ContentModService.name);

  constructor(
    private postService: PostsService,
    private utilService: UtilsService,
    private gtw: AppGateway,
    private readonly configService: ConfigService,
  ) { }

  async cmodImage(postId: string, url: string) {
    this.logger.log('cmodImage >>> start');
    const accessKeyId = this.configService.get("APSARA_ACCESS_KEY");
    const accessKeySecret = this.configService.get("APSARA_ACCESS_SECRET");
    const greenVersion = '2017-01-12';
    var hostname = 'green.ap-southeast-1.aliyuncs.com';
    var path = '/green/image/asyncscan';

    var clientInfo = {
      "ip": "127.0.0.1"
    };

    let requestBody = JSON.stringify({
      bizType: 'CoreModeration',
      scenes: ['porn', 'terrorism'],
      callback: this.configService.get("APSARA_IMAGE_CMOD_CALLBACK"),
      seed: uuidv4(),
      tasks: [{
        'dataId': postId,
        'url': url
      }]
    });

    let bizCfg = {
      'accessKeyId': accessKeyId,
      'accessKeySecret': accessKeySecret,
      'path': path,
      'clientInfo': clientInfo,
      'requestBody': requestBody,
      'hostname': hostname,
      'greenVersion': greenVersion
    }

    this.greenUpload(bizCfg, this.execute);

  }

  async cmodVideo(postId: string, url: string) {
    this.logger.log('cmodVideo >>> start');
    const accessKeyId = this.configService.get("APSARA_ACCESS_KEY");
    const accessKeySecret = this.configService.get("APSARA_ACCESS_SECRET");
    const greenVersion = '2017-01-12';
    var hostname = 'green.ap-southeast-1.aliyuncs.com';
    var path = '/green/video/asyncscan';

    var clientInfo = {
      "ip": "127.0.0.1"
    };

    let requestBody = JSON.stringify({
      bizType: 'CoreModeration',
      scenes: ['porn', 'terrorism'],
      callback: this.configService.get("APSARA_IMAGE_CMOD_CALLBACK"),
      seed: uuidv4(),
      tasks: [{
        'dataId': postId,
        'url': url,
        'interval': 1,
        'maxFrames': 20
      }]
    });

    let bizCfg = {
      'accessKeyId': accessKeyId,
      'accessKeySecret': accessKeySecret,
      'path': path,
      'clientInfo': clientInfo,
      'requestBody': requestBody,
      'hostname': hostname,
      'greenVersion': greenVersion
    }

    this.greenUpload(bizCfg, this.execute);

  }

  async cmodResult(postId: string, taskId: string) {
    this.logger.log('cmodResult >>> start');
    const accessKeyId = this.configService.get("APSARA_ACCESS_KEY");
    const accessKeySecret = this.configService.get("APSARA_ACCESS_SECRET");
    const greenVersion = '2017-01-12';
    var hostname = 'green.ap-southeast-1.aliyuncs.com';
    var path = '/green/video/results';

    var clientInfo = {
      "ip": "127.0.0.1"
    };

    let requestBody = JSON.stringify([taskId]);

    let bizCfg = {
      'accessKeyId': accessKeyId,
      'accessKeySecret': accessKeySecret,
      'path': path,
      'clientInfo': clientInfo,
      'requestBody': requestBody,
      'hostname': hostname,
      'greenVersion': greenVersion
    }

    this.greenUploadNoCallback(postId, bizCfg);

  }

  execute(chunk) {
    console.log('BODY: ' + chunk);
  }

  greenUpload(bizCfg: any, callback) {

    var http = require('http');
    var crypto = require('crypto');

    var accessKeyId = bizCfg['accessKeyId'];
    var accessKeySecret = bizCfg['accessKeySecret'];
    var path = bizCfg['path'];
    var clientInfo = bizCfg['clientInfo'];
    var requestBody = bizCfg['requestBody'];
    var greenVersion = bizCfg['greenVersion'];
    var hostname = bizCfg['hostname'];
    var gmtCreate = new Date().toUTCString();
    var md5 = crypto.createHash('md5');
    // 请求头
    var requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-MD5': md5.update(requestBody).digest().toString('base64'),
      'Date': gmtCreate,
      'x-acs-version': greenVersion,
      'x-acs-signature-nonce': uuidv4(),
      'x-acs-signature-version': '1.0',
      'x-acs-signature-method': 'HMAC-SHA1'
    };

    // 对请求的签名
    this.signature(requestHeaders, bizCfg);

    // HTTP请求设置
    var options = {
      hostname: hostname,
      port: 80,
      path: encodeURI(path + '?clientInfo=' + JSON.stringify(clientInfo)),
      method: 'POST',
      headers: requestHeaders
    };

    this.logger.log('host => ' + hostname + ":" + 443 + encodeURI(path + '?clientInfo=' + JSON.stringify(clientInfo)));
    this.logger.log('header => ' + JSON.stringify(requestHeaders));
    this.logger.log('body => ' + JSON.stringify(requestBody));


    var req = http.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        callback(chunk);
      });
    });

    req.write(requestBody);

    req.end();
  }

  greenUploadNoCallback(postId: string, bizCfg: any) {

    var http = require('http');
    var crypto = require('crypto');

    var accessKeyId = bizCfg['accessKeyId'];
    var accessKeySecret = bizCfg['accessKeySecret'];
    var path = bizCfg['path'];
    var clientInfo = bizCfg['clientInfo'];
    var requestBody = bizCfg['requestBody'];
    var greenVersion = bizCfg['greenVersion'];
    var hostname = bizCfg['hostname'];
    var gmtCreate = new Date().toUTCString();
    var md5 = crypto.createHash('md5');
    // 请求头
    var requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-MD5': md5.update(requestBody).digest().toString('base64'),
      'Date': gmtCreate,
      'x-acs-version': greenVersion,
      'x-acs-signature-nonce': uuidv4(),
      'x-acs-signature-version': '1.0',
      'x-acs-signature-method': 'HMAC-SHA1'
    };

    // 对请求的签名
    this.signature(requestHeaders, bizCfg);

    // HTTP请求设置
    var options = {
      hostname: hostname,
      port: 80,
      path: encodeURI(path + '?clientInfo=' + JSON.stringify(clientInfo)),
      method: 'POST',
      headers: requestHeaders
    };

    this.logger.log('host => ' + hostname + ":" + 443 + encodeURI(path + '?clientInfo=' + JSON.stringify(clientInfo)));
    this.logger.log('header => ' + JSON.stringify(requestHeaders));
    this.logger.log('body => ' + JSON.stringify(requestBody));

    let data = "";
    let x = this;
    var req = http.request(options, function (res) {
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('close', () => {
        x.postUpdateCB(postId, data);
      });
    });

    req.write(requestBody);

    req.end();

  }

  postUpdateCB(postId: string, data: string) {
    console.log(data);
    let odata = JSON.parse(data);
    if (odata.data[0].msg == 'OK') {
      this.postService.updateStatusCB(postId, 'DONE');
    } else {
      this.postService.updateStatusCB(postId, 'PENDING');
    }
  }


  private signature(requestHeaders, bizCfg) {
    var crypto = require('crypto');

    var accessKeyId = bizCfg['accessKeyId'];
    var accessKeySecret = bizCfg['accessKeySecret'];
    var path = bizCfg['path'];
    var clientInfo = bizCfg['clientInfo'];

    var signature = [];
    signature.push('POST\n');
    signature.push('application/json\n');
    signature.push(requestHeaders['Content-MD5'] + '\n');
    signature.push('application/json\n');
    signature.push(requestHeaders['Date'] + '\n');
    signature.push('x-acs-signature-method:HMAC-SHA1\n');
    signature.push('x-acs-signature-nonce:' + requestHeaders['x-acs-signature-nonce'] + '\n');
    signature.push('x-acs-signature-version:1.0\n');
    signature.push('x-acs-version:2017-01-12\n');
    signature.push(path + '?clientInfo=' + JSON.stringify(clientInfo));


    var authorization = crypto.createHmac('sha1', accessKeySecret)
      .update(signature.join(''))
      .digest().toString('base64');

    requestHeaders.Authorization = 'acs ' + accessKeyId + ':' + authorization;
  }


  async cmodResponse(body: any) {
    if (body.content == undefined) {
      this.logger.error('cmodResponse >>> body content is undefined');
      return;
    }
    this.logger.error('cmodResponse >>> ' + JSON.stringify(body));

    let con = JSON.parse(body.content);
    if (con.code == undefined || con.code != 200) {
      this.logger.error('cmodResponse >>> body content code undefined');
      return;
    }

    let pid = String(con.dataId);
    let pd = await this.postService.findByPostId(pid);
    if (pd == undefined) {
      this.logger.error('cmodResponse >>> post id:' + con.dataId + ' not found');
      return;
    }

    let reason = '';
    let res = con.results;
    // var dataResult = await this.getMax(res);
    // this.logger.log('cmodResponse >>> dataResult: ' + dataResult);
    // if (dataResult == "ad") {
    //   reason = dataResult+"s";
    // }else{
    //   reason = dataResult;
    // }
    let pass = true;
    for (let i = 0; i < res.length; i++) {
      let re = res[i];
      if ((re.suggestion == 'block')) {
        pass = false;
        reason = re.scene;
      }
    }
    pd.moderationReason = reason;

    this.logger.log('cmodResponse >>> pass: ' + pass);
    if (pass == false) {
      let pold = pd.contentModeration;

      pd.contentModeration = true;
      pd.reportedStatus = 'OWNED';

      if (pold != true) {
        this.logger.log('cmodResponse >>> trying to sendFCmMod: ');
        await this.utilService.sendFcmCMod(String(pd.email), "CONTENTMOD", "CONTENTMOD", String(pd.postID), String(pd.postType));
      }

    } else {
      pd.contentModeration = false;
      pd.reportedStatus = 'ALL';
    }
    let today = new Date();
    pd.contentModerationDate = await this.utilService.getDateTimeString();
    pd.contentModerationResponse = JSON.stringify(body);

    await this.postService.create(pd);

  }

  async ws(event: string, payload: string) {
    this.gtw.event(event, payload);
  }

  async getMax(Array_: Array<Object>) {
    const highest = Array_.reduce((previous, current) => {
      return current['rate'] > previous['rate'] ? current : previous;
    });

    var filteredArray = Array_.filter(function (itm) {
      return itm['rate'] == highest['rate'];
    });

    if (filteredArray.length > 1) {
      var filteredArrayPorn = filteredArray.filter(function (itm) {
        return itm['scene'] == 'porn';
      });

      if (filteredArrayPorn.length > 0) {
        return 'porn';
      } else {
        return highest['scene']
      }
    } else {
      return highest['scene']
    }
  }

  async getReason(Array_: Array<Object>) {
    var reason = [];
    for (var i = 0; i < Array_.length; i++) {
      this.logger.log('reasoni: ', reason);
      reason.push(Array_[i]["scene"]);
    }
    this.logger.log('reason: ', reason);
    return reason;
  }

  async getMax2() {
    var Array_ = [
      {
        "label": "normal",
        "rate": 99.9,
        "scene": "porn",
        "suggestion": "pass"
      },
      {
        "frames": [
          {
            "label": "bloody",
            "offset": 19,
            "rate": 82.81,
            "url": "https://aligreen-singapore.oss-ap-southeast-1.aliyuncs.com/prod/hammal/13174820f/18451_46709b5562a34e01917a49f0540d41ea-17094b5515ae49c7401e46aaf6b0d442-fd.mp4-frames/f00020.jpg?Expires=1673580654&OSSAccessKeyId=H4sp5QfNbuDghquU&Signature=QxosA%2BmQ%2Fxq%2FweylaadPktGDMZE%3D"
          }
        ],
        "label": "terrorism",
        "rate": 82.81,
        "scene": "terrorism",
        "suggestion": "review"
      },
      {
        "label": "normal",
        "rate": 99.9,
        "scene": "ad",
        "suggestion": "pass"
      }
    ]
    const highest = Array_.reduce((previous, current) => {
      return current['rate'] > previous['rate'] ? current : previous;
    });
    var filteredArray = Array_.filter(function (itm) {
      return itm['rate'] == highest['rate'];
    });

    if (filteredArray.length > 1) {
      var filteredArrayPorn = filteredArray.filter(function (itm) {
        return itm['scene'] == 'porn';
      });
      if (filteredArrayPorn.length > 0) {
        return 'porn';
      } else {
        return highest['scene']
      }
    } else {
      return highest['scene']
    }
  }
}