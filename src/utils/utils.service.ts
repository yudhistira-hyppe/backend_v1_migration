import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { TemplatesRepoService } from '../infra/templates_repo/templates_repo.service';
import { TemplatesService } from '../infra/templates/templates.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Templates } from '../infra/templates/schemas/templates.schema';
import * as admin from 'firebase-admin';
import { ErrorHandler } from './error.handler';
import { AvatarDTO, ProfileDTO } from './data/Profile';
import { LanguagesService } from '../infra/languages/languages.service';
import { InsightsService } from '../content/insights/insights.service';
import { CitiesService } from '../infra/cities/cities.service';
import { CountriesService } from '../infra/countries/countries.service';
import { AreasService } from '../infra/areas/areas.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { InterestsService } from '../infra/interests/interests.service';
import { EulasService } from '../infra/eulas/eulas.service';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { CreateInsightsDto } from '../content/insights/dto/create-insights.dto';
import { SettingsService } from '../trans/settings/settings.service';
import { SeaweedfsService } from '../stream/seaweedfs/seaweedfs.service';
import { NotificationsService } from "../content/notifications/notifications.service";
import * as fs from 'fs';
import { double } from 'aws-sdk/clients/lightsail';
import { CreateNotificationsDto } from '../content/notifications/dto/create-notifications.dto';
import { TemplatesRepo } from '../infra/templates_repo/schemas/templatesrepo.schema';
import { BanksService } from '../trans/banks/banks.service';
import { Banks } from '../trans/banks/schemas/banks.schema';
import { DeepArService } from '../trans/deepar/deepar.service';
import { UserscoresService } from '../trans/userscores/userscores.service';
import { UserscoresDto } from 'src/trans/userscores/dto/create-userscores.dto';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';

import mongoose, { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { SettingsDocument, SettingsMixed } from 'src/trans/settings2/schemas/settings2.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { time } from 'console';
import { GetprofilecontenteventService } from './getprofilecontentevent/getprofilecontentevent.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';

const cheerio = require('cheerio');
const QRCode = require('qrcode');
const nodeHtmlToImage = require('node-html-to-image');
var path = require("path");
const Cryptr = require('cryptr');
const cryptr = new Cryptr("vgqgveogdwinzlig");

@Injectable()
export class UtilsService {

  private readonly logger = new Logger(UtilsService.name);

  constructor(

    @InjectModel(SettingsMixed.name, 'SERVER_FULL')
    private readonly settingMixes: Model<SettingsDocument>,
    //private userauthsService: UserauthsService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private templatesRepoService: TemplatesRepoService,
    private templatesService: TemplatesService,
    private errorHandler: ErrorHandler,
    //private userbasicsService: UserbasicsService,
    private languagesService: LanguagesService,
    private insightsService: InsightsService,
    private citiesService: CitiesService,
    private countriesService: CountriesService,
    private readonly configService: ConfigService,
    private areasService: AreasService,
    private interestsRepoService: InterestsRepoService,
    //private interestsService: InterestsService,
    private eulasService: EulasService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private settingsService: SettingsService,
    private seaweedfsService: SeaweedfsService,
    private banksService: BanksService,
    private userdevicesService: UserdevicesService,
    private notificationsService: NotificationsService,
    private deepArService: DeepArService,
    private userscoresService: UserscoresService,
    private basic2SS: UserbasicnewService,
    private getprofilecontenteventService: GetprofilecontenteventService,

  ) { }

  async sendEmail(
    to: string,
    from: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    var sendEmail_ = false;
    await this.mailerService
      .sendMail({
        to: to,
        from: from,
        subject: subject,
        html: html,
      })
      .then((success) => {
        sendEmail_ = true;
        //console.log(success);
      })
      .catch((err) => {
        sendEmail_ = false;
        //console.log(err);
      });
    return sendEmail_;
  }

  async generateNumberVoucher() {
    const getRandomId = (min = 0, max = 500000) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num.toString().padStart(6, "0")
    };
    return getRandomId();
  }

  async getImageMode(width: number, height: number) {
    var mode = "LANDSCAPE";
    if (width > height) {
      mode = "LANDSCAPE";
    } else if (height > width) {
      mode = "POTRET";
    } else {
      mode = "LANDSCAPE";
    }
    return mode;
  }

  public getRatio(width: number, height: number) {
    var ratio = width / height;
    return ratio;
  }

  async getSettingMixed(id: mongoose.Types.ObjectId): Promise<SettingsMixed> {
    return this.settingMixes.findOne({ _id: id }).exec();
  }

  async getHeight(width: number, height: number, new_width: number) {
    var ratio = await this.getRatio(width, height);
    var new_height = Number(new_width / ratio);
    return new_height;
  }

  async getWidth(width: number, height: number, new_height: number) {
    var ratio = this.getRatio(width, height);
    var new_width = Number(new_height * ratio);
    return new_width;
  }

  async sendEmailWithAttachment(to: string, from: string, subject: string, html: string, att: any,): Promise<boolean> {
    var sendEmail_ = false;
    await this.mailerService.sendMail({ to: to, from: from, subject: subject, html: html, attachments: [att] })
      .then((success) => {
        sendEmail_ = true;
        //console.log(success);
      }).catch((err) => {
        sendEmail_ = false;
        //console.log(err);
      });
    return sendEmail_;
  }

  async ceckDistance(
    lat1: double,
    lon1: double,
    lat2: double,
    lon2: double,
    unit: string
  ): Promise<any> {
    // 
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }

  async toRad(Value) {
    return Value * Math.PI / 180;
  }

  // async sendFcmV2(receiverParty: string, senderParty: string, eventType: string, event: string, typeTemplate: string, postID?: string, postType?: string, idtransaction?: string, customText?: any) {
  //   //GET DATE
  //   var currentDate = await this.getDateTimeString()

  //   //GET TEMPLATE
  //   var Templates_ = new TemplatesRepo();
  //   Templates_ = await this.getTemplate_repo(typeTemplate, 'NOTIFICATION');

  //   //GET USERNAME
  //   var get_username_receiverParty = await this.getUsertname(receiverParty);
  //   var get_username_senderParty = await this.getUsertname(senderParty);

  //   //GET PROFILE
  //   var profile_receiverParty = await this.generateProfile(receiverParty, "FULL");
  //   var profile_senderParty = await this.generateProfile(senderParty, "FULL");

  //   //GET REGSRC
  //   var profile_regsrc = await this.getregSrc(receiverParty);

  //   //GET LANGISO
  //   const langIso_receiverParty = (profile_receiverParty.langIso != undefined) ? profile_receiverParty.langIso : "id";
  //   const langIso_senderParty = (profile_senderParty.langIso != undefined) ? profile_senderParty.langIso : "id";

  //   //SET POST TYPE UPPERCASE
  //   var Post_type_upper = "";
  //   if (postType == undefined) {
  //     Post_type_upper = "";
  //   } else {
  //     Post_type_upper = postType[0].toUpperCase() + postType.substring(1)
  //   }

  //   //SET VARIABLE
  //   let title_send = "";
  //   let body_send = "";
  //   let data_send = {};

  //   let body_save_id = "";
  //   let body_save_en = "";

  //   let body_save_id_get = "";
  //   let body_save_en_get = "";

  //   //CECK EVENTTYPE
  //   if (eventType == "COMMENT_TAG") {
  //     eventType = "REACTION"
  //   }

  //   //SET TITLE AND BODY
  //   body_save_en_get = Templates_.body_detail.toString();
  //   body_save_id_get = Templates_.body_detail_id.toString();
  //   if (langIso_receiverParty == "en") {
  //     if (Templates_.subject != undefined) {
  //       if (Templates_.subject.toString() == "${user_name}") {
  //         title_send = "@" + get_username_senderParty;
  //       } else if (Templates_.subject.toString() == "Hi, ${user_name}") {
  //         title_send = "Hi, @" + get_username_senderParty;
  //       } else {
  //         title_send = Templates_.subject.toString();
  //       }
  //     } else {
  //       if (Templates_.subject_id.toString() == "${user_name}") {
  //         title_send = "@" + get_username_senderParty;
  //       } else if (Templates_.subject.toString() == "Hi, ${user_name}") {
  //         title_send = "Hi, @" + get_username_senderParty;
  //       } else {
  //         title_send = Templates_.subject_id.toString();
  //       }
  //     }
  //   } else {
  //     if (Templates_.subject_id != undefined) {
  //       if (Templates_.subject_id.toString() == "${user_name}") {
  //         title_send = "@" + get_username_senderParty;
  //       } else if (Templates_.subject_id.toString() == "Hi, ${user_name}") {
  //         title_send = "Hi, @" + get_username_senderParty;
  //       } else {
  //         title_send = Templates_.subject.toString();
  //       }
  //     } else {
  //       if (Templates_.subject.toString() == "${user_name}") {
  //         title_send = "@" + get_username_senderParty;
  //       } else if (Templates_.subject.toString() == "Hi, ${user_name}") {
  //         title_send = "Hi, @" + get_username_senderParty;
  //       } else {
  //         title_send = Templates_.subject.toString();
  //       }
  //     }
  //   }

  //   //SET BODY SAVE
  //   if ((eventType == "REACTION") || (eventType == "COMMENT") || (eventType == "LIKE") || (eventType == "TRANSACTION") || (event == "POST")) {
  //     if (event == "BOOST_SUCCES" || event == "ADS VIEW" || event == "ADS CLICK") {
  //       if (idtransaction != null) {
  //         data_send['postID'] = idtransaction
  //       }
  //       data_send['postType'] = eventType
  //     } else {
  //       data_send['postID'] = postID
  //       data_send['postType'] = postType
  //     }

  //     if (event == "ADS VIEW" || event == "ADS CLICK") {
  //       body_save_id = body_save_id_get.toString().replace("${rewards}", customText)
  //       body_save_en = body_save_en_get.toString().replace("${rewards}", customText)
  //     } else if (eventType == "REACTION") {
  //       if (typeTemplate == "POST_TAG") {
  //         body_save_id = body_save_id_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
  //         body_save_en = body_save_en_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
  //       } else {
  //         body_save_id = body_save_id_get.toString().replace("${emoticon}", customText)
  //         body_save_en = body_save_en_get.toString().replace("${emoticon}", customText)
  //       }
  //     } else {
  //       body_save_id = body_save_id_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
  //       body_save_en = body_save_en_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
  //     }
  //   } else {
  //     if (eventType == "FOLLOWER" || eventType == "FOLLOWING") {
  //       data_send['postType'] = eventType
  //       data_send['postID'] = get_username_senderParty
  //     } else if (eventType == "KYC") {
  //       data_send['postID'] = ''
  //       data_send['postType'] = ''
  //     } else {
  //       data_send['postID'] = postID
  //       data_send['postType'] = postType
  //     }

  //     if (eventType == "KYC") {
  //       body_save_id = body_save_id_get.toString().replace("${user_name}", get_username_senderParty)
  //       body_save_en = body_save_en_get.toString().replace("${user_name}", get_username_senderParty)
  //     } else {
  //       body_save_id = body_save_id_get.toString();
  //       body_save_en = body_save_en_get.toString();
  //     }
  //   }

  //   //SET BODY SEND
  //   if (langIso_receiverParty == "en") {
  //     body_send = body_save_en
  //   } else {
  //     body_send = body_save_id
  //   }

  //   // if (eventType == "KYC") {
  //   //   if (langIso_receiverParty == "en") {
  //   //     body_send = body_save_en
  //   //   } else {
  //   //     body_send = body_save_id
  //   //   }
  //   // }

  //   //SET RECEIVER OR SENDER
  //   var senderOrReceiverInfo = {
  //     fullName: (profile_senderParty.fullName != undefined) ? profile_senderParty.fullName : null,
  //     avatar: {
  //       mediaBasePath: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaBasePath != undefined) ? profile_senderParty.avatar.mediaBasePath : null : null,
  //       mediaUri: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaUri != undefined) ? profile_senderParty.avatar.mediaUri : null : null,
  //       mediaType: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaType != undefined) ? profile_senderParty.avatar.mediaType : null : null,
  //       mediaEndpoint: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaEndpoint != undefined) ? profile_senderParty.avatar.mediaEndpoint : null : null,
  //     },
  //     username: (profile_senderParty.username != undefined) ? profile_senderParty.username : null
  //   };

  //   //SEND FCM
  //   var datadevice = await this.userdevicesService.findActive(receiverParty);
  //   var device_user = [];
  //   var getDate = await ((await this.getDateTime()).getTime()).toString();

  //   data_send['title'] = title_send;
  //   data_send['body'] = body_send;
  //   if (typeTemplate != "REACTION") {
  //     for (var i = 0; i < datadevice.length; i++) {
  //       var notification = {
  //         data: data_send,
  //       }
  //       var option = {
  //         priority: "high",
  //         contentAvailable: true
  //       }
  //       console.log("NOTIFICTION ------------------------------------------------------------------->", notification);

  //       // if (profile_regsrc == "android") {
  //       //   notification = {
  //       //     data: data_send,
  //       //   }
  //       // } else if (profile_regsrc == "iOS") {
  //       //   notification = {
  //       //     notification: {
  //       //       title: data_send['title'],
  //       //       body: data_send['body']
  //       //     }
  //       //   };
  //       // } else if (profile_regsrc == "ios") {
  //       //   notification = {
  //       //     notification: {
  //       //       title: data_send['title'],
  //       //       body: data_send['body']
  //       //     }
  //       //   };
  //       // } else {
  //       //   notification = {
  //       //     data: data_send,
  //       //   }
  //       // }
  //       await admin.messaging().sendToDevice(datadevice[i].deviceID, notification, option);
  //       device_user.push(datadevice[i].deviceID)
  //     }
  //   }

  //   //INSERT NOTIFICATION
  //   var generateID = await this.generateId();
  //   var createNotificationsDto = new CreateNotificationsDto();
  //   createNotificationsDto._id = generateID;
  //   createNotificationsDto.notificationID = generateID;
  //   createNotificationsDto.email = receiverParty;
  //   createNotificationsDto.eventType = eventType;
  //   createNotificationsDto.event = event;
  //   createNotificationsDto.mate = senderParty;
  //   createNotificationsDto.devices = device_user;
  //   createNotificationsDto.title = title_send;
  //   createNotificationsDto.body = body_save_en;
  //   createNotificationsDto.bodyId = body_save_id;
  //   createNotificationsDto.active = true;
  //   createNotificationsDto.flowIsDone = true;
  //   createNotificationsDto.createdAt = currentDate;
  //   createNotificationsDto.updatedAt = currentDate;
  //   createNotificationsDto.actionButtons = null;
  //   createNotificationsDto.contentEventID = null;
  //   createNotificationsDto.senderOrReceiverInfo = senderOrReceiverInfo;
  //   if (postID != undefined) {
  //     createNotificationsDto.postID = postID.toString();
  //   }
  //   if (postType != undefined) {
  //     createNotificationsDto.postType = postType.toString();
  //   }

  //   if (eventType == "FOLLOWER") {
  //     var ceckNotification = await this.notificationsService.findCriteria(receiverParty, eventType, senderParty);
  //     if (await this.ceckData(ceckNotification)) {
  //       await this.notificationsService.updateNotifiaction(receiverParty, eventType, senderParty, currentDate);
  //     } else {
  //       await this.notificationsService.create(createNotificationsDto);
  //     }
  //   } else {
  //     await this.notificationsService.create(createNotificationsDto);
  //   }
  // }

  async sendFcmV2(receiverParty: string, senderParty: string, eventType: string, event: string, typeTemplate: string, postID?: string, postType?: string, idtransaction?: string, customText?: any) {
    //GET DATE
    var currentDate = await this.getDateTimeString()

    //GET TEMPLATE
    var Templates_ = new TemplatesRepo();
    Templates_ = await this.getTemplate_repo(typeTemplate, 'NOTIFICATION');

    //GET USERNAME
    // var get_username_receiverParty = await this.getUsertname(receiverParty);
    // var get_username_senderParty = await this.getUsertname(senderParty);
    var get_username_receiverParty = await this.getUsertname2(receiverParty);
    var get_username_senderParty = await this.getUsertname2(senderParty);

    //GET PROFILE
    // var profile_receiverParty = await this.generateProfile(receiverParty, "FULL");
    // var profile_senderParty = await this.generateProfile(senderParty, "FULL");
    var profile_receiverParty = await this.generateProfile2(receiverParty, "FULL");
    var profile_senderParty = await this.generateProfile2(senderParty, "FULL");

    //GET REGSRC
    // var profile_regsrc = await this.getregSrc(receiverParty);
    var profile_regsrc = await this.getregSrc2(receiverParty);

    //GET LANGISO
    const langIso_receiverParty = (profile_receiverParty.langIso != undefined) ? profile_receiverParty.langIso : "id";
    const langIso_senderParty = (profile_senderParty.langIso != undefined) ? profile_senderParty.langIso : "id";

    //SET POST TYPE UPPERCASE
    var Post_type_upper = "";
    if (postType == undefined) {
      Post_type_upper = "";
    } else {
      Post_type_upper = postType[0].toUpperCase() + postType.substring(1)
    }

    //SET VARIABLE
    let title_send = "";
    let body_send = "";
    let data_send = {};

    let body_save_id = "";
    let body_save_en = "";

    let body_save_id_get = "";
    let body_save_en_get = "";

    //CECK EVENTTYPE
    if (eventType == "COMMENT_TAG") {
      eventType = "REACTION"
    }

    //SET TITLE AND BODY
    body_save_en_get = Templates_.body_detail.toString();
    body_save_id_get = Templates_.body_detail_id.toString();
    if (langIso_receiverParty == "en") {
      if (Templates_.subject != undefined) {
        if (Templates_.subject.toString() == "${user_name}") {
          title_send = "@" + get_username_senderParty;
        } else if (Templates_.subject.toString() == "Hi, ${user_name}") {
          title_send = "Hi, @" + get_username_senderParty;
        } else {
          title_send = Templates_.subject.toString();
        }
      } else {
        if (Templates_.subject_id.toString() == "${user_name}") {
          title_send = "@" + get_username_senderParty;
        } else if (Templates_.subject.toString() == "Hi, ${user_name}") {
          title_send = "Hi, @" + get_username_senderParty;
        } else {
          title_send = Templates_.subject_id.toString();
        }
      }
    } else {
      if (Templates_.subject_id != undefined) {
        if (Templates_.subject_id.toString() == "${user_name}") {
          title_send = "@" + get_username_senderParty;
        } else if (Templates_.subject_id.toString() == "Hi, ${user_name}") {
          title_send = "Hi, @" + get_username_senderParty;
        } else {
          title_send = Templates_.subject.toString();
        }
      } else {
        if (Templates_.subject.toString() == "${user_name}") {
          title_send = "@" + get_username_senderParty;
        } else if (Templates_.subject.toString() == "Hi, ${user_name}") {
          title_send = "Hi, @" + get_username_senderParty;
        } else {
          title_send = Templates_.subject.toString();
        }
      }
    }

    //SET BODY SAVE
    if ((eventType == "REACTION") || (eventType == "COMMENT") || (eventType == "LIKE") || (eventType == "TRANSACTION") || (event == "POST")) {
      if (event == "BOOST_SUCCES" || event == "ADS VIEW" || event == "ADS CLICK") {
        if (idtransaction != null) {
          data_send['postID'] = idtransaction
        }
        data_send['postType'] = eventType
      } else {
        data_send['postID'] = postID
        data_send['postType'] = postType
      }

      if (event == "ADS VIEW" || event == "ADS CLICK") {
        body_save_id = body_save_id_get.toString().replace("${rewards}", customText)
        body_save_en = body_save_en_get.toString().replace("${rewards}", customText)
      } else if (eventType == "REACTION") {
        if (typeTemplate == "POST_TAG") {
          body_save_id = body_save_id_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
          body_save_en = body_save_en_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
        } else {
          body_save_id = body_save_id_get.toString().replace("${emoticon}", customText)
          body_save_en = body_save_en_get.toString().replace("${emoticon}", customText)
        }
      } else {
        body_save_id = body_save_id_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
        body_save_en = body_save_en_get.toString().replace("${post_type}", "Hyppe" + Post_type_upper)
      }
    } else {
      if (eventType == "FOLLOWER" || eventType == "FOLLOWING") {
        data_send['postType'] = eventType
        data_send['postID'] = get_username_senderParty
      } else if (eventType == "KYC") {
        data_send['postID'] = ''
        data_send['postType'] = ''
      } else {
        data_send['postID'] = postID
        data_send['postType'] = postType
      }

      if (eventType == "KYC") {
        body_save_id = body_save_id_get.toString().replace("${user_name}", get_username_senderParty)
        body_save_en = body_save_en_get.toString().replace("${user_name}", get_username_senderParty)
      } else {
        body_save_id = body_save_id_get.toString();
        body_save_en = body_save_en_get.toString();
      }
    }

    //SET BODY SEND
    if (langIso_receiverParty == "en") {
      body_send = body_save_en
    } else {
      body_send = body_save_id
    }

    // if (eventType == "KYC") {
    //   if (langIso_receiverParty == "en") {
    //     body_send = body_save_en
    //   } else {
    //     body_send = body_save_id
    //   }
    // }

    //SET RECEIVER OR SENDER
    var senderOrReceiverInfo = {
      fullName: (profile_senderParty.fullName != undefined) ? profile_senderParty.fullName : null,
      avatar: {
        mediaBasePath: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaBasePath != undefined) ? profile_senderParty.avatar.mediaBasePath : null : null,
        mediaUri: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaUri != undefined) ? profile_senderParty.avatar.mediaUri : null : null,
        mediaType: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaType != undefined) ? profile_senderParty.avatar.mediaType : null : null,
        mediaEndpoint: (profile_senderParty.avatar != undefined) ? (profile_senderParty.avatar.mediaEndpoint != undefined) ? profile_senderParty.avatar.mediaEndpoint : null : null,
      },
      username: (profile_senderParty.username != undefined) ? profile_senderParty.username : null
    };

    //SEND FCM
    var datadevice = await this.userdevicesService.findActive(receiverParty);
    var device_user = [];
    var getDate = await ((await this.getDateTime()).getTime()).toString();

    data_send['title'] = title_send;
    data_send['body'] = body_send;
    if (typeTemplate != "REACTION") {
      for (var i = 0; i < datadevice.length; i++) {
        var notification = {
          data: data_send,
        }
        var option = {
          priority: "high",
          contentAvailable: true
        }
        console.log("NOTIFICTION ------------------------------------------------------------------->", notification);

        // if (profile_regsrc == "android") {
        //   notification = {
        //     data: data_send,
        //   }
        // } else if (profile_regsrc == "iOS") {
        //   notification = {
        //     notification: {
        //       title: data_send['title'],
        //       body: data_send['body']
        //     }
        //   };
        // } else if (profile_regsrc == "ios") {
        //   notification = {
        //     notification: {
        //       title: data_send['title'],
        //       body: data_send['body']
        //     }
        //   };
        // } else {
        //   notification = {
        //     data: data_send,
        //   }
        // }
        try
        {
          await admin.messaging().sendToDevice(datadevice[i].deviceID, notification, option);
        }
        catch(e)
        {
          console.log('-------------------------------------------------- FCM ERROR --------------------------------------------------');  
          console.log(e);  
        }
        device_user.push(datadevice[i].deviceID)
      }
    }

    //INSERT NOTIFICATION
    var generateID = await this.generateId();
    var createNotificationsDto = new CreateNotificationsDto();
    createNotificationsDto._id = generateID;
    createNotificationsDto.notificationID = generateID;
    createNotificationsDto.email = receiverParty;
    createNotificationsDto.eventType = eventType;
    createNotificationsDto.event = event;
    createNotificationsDto.mate = senderParty;
    createNotificationsDto.devices = device_user;
    createNotificationsDto.title = title_send;
    createNotificationsDto.body = body_save_en;
    createNotificationsDto.bodyId = body_save_id;
    createNotificationsDto.active = true;
    createNotificationsDto.flowIsDone = true;
    createNotificationsDto.createdAt = currentDate;
    createNotificationsDto.updatedAt = currentDate;
    // createNotificationsDto.idEmail = new mongoose.Types.ObjectId(profile_receiverParty.iduser.toString());
    // createNotificationsDto.user = {
    //   _id: new mongoose.Types.ObjectId(profile_receiverParty.iduser.toString()),
    //   idEmail: new mongoose.Types.ObjectId(profile_receiverParty.iduser.toString()),
    //   email: receiverParty,
    //   emailEvent: receiverParty
    // };
    createNotificationsDto.actionButtons = null;
    createNotificationsDto.contentEventID = null;
    createNotificationsDto.senderOrReceiverInfo = senderOrReceiverInfo;
    if (postID != undefined) {
      createNotificationsDto.postID = postID.toString();
    }
    if (postType != undefined) {
      createNotificationsDto.postType = postType.toString();
    }

    if (eventType == "FOLLOWER") {
      var ceckNotification = await this.notificationsService.findCriteria(receiverParty, eventType, senderParty);
      if (await this.ceckData(ceckNotification)) {
        await this.notificationsService.updateNotifiaction(receiverParty, eventType, senderParty, currentDate);
      } else {
        await this.notificationsService.create(createNotificationsDto);
      }
    } else {
      await this.notificationsService.create(createNotificationsDto);
    }
  }

  async sendFcmCMod(receiverParty: string, eventType: string, event: string, postID?: string, postType?: string) {
    //GET DATE
    var currentDate = await this.getDateTimeString()
    var idprofilepict = null;
    var profilepict = null;
    var mediaprofilepicts = null;

    //GET TEMPLATE
    var Templates_ = new TemplatesRepo();
    Templates_ = await this.getTemplate_repo("CONTENTMOD", 'NOTIFICATION');
    this.logger.log('sendFcmCMod >>> template: ' + JSON.stringify(Templates_));

    //GET USERNAME
    var get_username_receiverParty = await this.getUsertname(receiverParty);

    //GET PROFILE
    var profile_receiverParty = await this.generateProfile(receiverParty, "FULL");

    //GET REGSRC
    var profile_regsrc = await this.getregSrc(receiverParty);

    //GET LANGISO
    const langIso_receiverParty = (profile_receiverParty.langIso != undefined) ? profile_receiverParty.langIso : "id";
    this.logger.log('sendFcmCMod >>> iso: ' + langIso_receiverParty);
    //SET POST TYPE UPPERCASE
    var Post_type_upper = "";
    if (postType == undefined) {
      Post_type_upper = "";
    } else {
      Post_type_upper = postType[0].toUpperCase() + postType.substring(1)
    }

    //SET VARIABLE
    let title_send = "";
    let body_send = "";
    let data_send = {};

    let body_save_id = "";
    let body_save_en = "";

    //CECK EVENTTYPE
    if (eventType == "COMMENT_TAG") {
      eventType = "REACTION"
    }

    //SET TITLE AND BODY
    if (langIso_receiverParty == "en") {
      title_send = Templates_.subject.toString();
    } else {
      title_send = Templates_.subject_id.toString();
    }

    body_save_en = Templates_.body_detail.toString();
    body_save_id = Templates_.body_detail_id.toString();

    data_send['postID'] = postID
    data_send['postType'] = postType

    //SET BODY SEND
    if (langIso_receiverParty == "en") {
      body_send = body_save_en;
      this.logger.log('sendFcmCMod >>> body en: ' + body_save_en);
    } else {
      body_send = body_save_id;
      this.logger.log('sendFcmCMod >>> body en: ' + body_save_id);
    }
    this.logger.log('sendFcmCMod >>> res: ' + JSON.stringify(body_send));

    const datauserbasicsService = await this.basic2SS.findBymail(receiverParty);

    var mediaUri = null;
    var mediaBasePath = null;
    var mediaType = null;
    var mediaEndpoint = null;

    try {
      profilepict = datauserbasicsService.profilePict;
      idprofilepict = profilepict.oid;
      mediaprofilepicts = await this.mediaprofilepictsService.findOne(idprofilepict);
    } catch (e) {
      mediaprofilepicts = null;
    }
    //const user_userAuth = await this.userauthsService.findOne(receiverParty);

    var mediaUri = null;
    var mediaBasePath = null;
    var mediaType = null;
    var mediaEndpoint = null;
    if (mediaprofilepicts != null) {
      mediaUri = mediaprofilepicts.mediaUri;
    }

    let result = null;
    if (mediaUri != null) {
      result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
    }
    if (mediaprofilepicts != null) {
      if (mediaprofilepicts.mediaBasePath != null) {
        mediaBasePath = mediaprofilepicts.mediaBasePath;
      }

      if (mediaprofilepicts.mediaUri != null) {
        mediaUri = mediaprofilepicts.mediaUri;
      }

      if (mediaprofilepicts.mediaType != null) {
        mediaType = mediaprofilepicts.mediaType;
      }
    }

    if (result != null) {
      mediaEndpoint = result;
    }
    var senderreceiver = {
      fullName: datauserbasicsService.fullName.toString(),
      avatar: {
        mediaBasePath: mediaBasePath,
        mediaUri: mediaUri,
        mediaType: mediaType,
        mediaEndpoint: mediaEndpoint
      },
      username: datauserbasicsService.username.toString()
    };

    //SEND FCM
    var datadevice = await this.userdevicesService.findActive(receiverParty);
    var device_user = [];

    data_send['title'] = title_send;
    data_send['body'] = body_send;
    for (var i = 0; i < datadevice.length; i++) {
      this.logger.log('sendFcmCMod >>> send: title-> ' + title_send + ' body: ' + JSON.stringify(body_send));
      var notification = {
        data: data_send,
      }
      var option = {
        priority: "high",
        contentAvailable: true
      }
      // if (profile_regsrc == "android") {
      //   notification_ = {
      //     data: data_send,
      //   }
      // } else if (profile_regsrc.toLowerCase() == "ios") {
      //   console.log("ios");
      //   notification_ = {
      //     notification: {
      //       title: data_send['title'],
      //       body: JSON.stringify(data_send)
      //     }
      //   };
      // } else {
      //   console.log("android");
      //   notification_ = {
      //     data: data_send,
      //   }
      // }
      await admin.messaging().sendToDevice(datadevice[i].deviceID, notification, option);
      device_user.push(datadevice[i].deviceID)
    }

    //INSERT NOTIFICATION
    var generateID = await this.generateId();
    var createNotificationsDto = new CreateNotificationsDto();
    createNotificationsDto._id = generateID;
    createNotificationsDto.notificationID = generateID;
    createNotificationsDto.email = receiverParty;
    createNotificationsDto.eventType = eventType;
    createNotificationsDto.event = event;
    createNotificationsDto.devices = device_user;
    createNotificationsDto.title = title_send;
    createNotificationsDto.body = body_save_en;
    createNotificationsDto.bodyId = body_save_id;
    createNotificationsDto.active = true;
    createNotificationsDto.flowIsDone = true;
    createNotificationsDto.mate = receiverParty;
    createNotificationsDto.createdAt = currentDate;
    createNotificationsDto.updatedAt = currentDate;
    createNotificationsDto.actionButtons = null;
    createNotificationsDto.contentEventID = null;
    createNotificationsDto.senderOrReceiverInfo = senderreceiver;
    if (postID != undefined) {
      createNotificationsDto.postID = postID.toString();
    }
    if (postType != undefined) {
      createNotificationsDto.postType = postType.toString();
    }
    await this.notificationsService.create(createNotificationsDto);
  }

  async sendFcm(email: string, titlein: string, titleen: string, bodyin: any, bodyen: any, eventType: string, event: string, postID_?: string, postType?: string, noinvoice?: string, jenis?: string) {

    console.log(postID_);
    var emailuserbasic = null;
    var datadevice = null;
    var languages = null;
    var payload = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var idprofilepict = null;
    var profilepict = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var dtstring = dt.toISOString();
    var splitdt = dtstring.split(".");
    var date = splitdt[0].replace("T", " ");
    var mediaprofilepicts = null;
    var bodypayload = null;
    var regSrc = null;
    let createNotificationsDto = new CreateNotificationsDto();

    const datauserbasicsService = await this.basic2SS.findBymail(
      email
    );
    if (await this.ceckData(datauserbasicsService)) {
      emailuserbasic = datauserbasicsService.email;

      try {
        profilepict = datauserbasicsService.profilePict;
        idprofilepict = profilepict.oid;
        mediaprofilepicts = await this.mediaprofilepictsService.findOne(idprofilepict);
      } catch (e) {
        mediaprofilepicts = null;
      }
      // const user_userAuth = await this.userauthsService.findOne(
      //   emailuserbasic
      // );

      var mediaUri = null;
      var mediaBasePath = null;
      var mediaType = null;
      var mediaEndpoint = null;
      if (mediaprofilepicts != null) {
        mediaUri = mediaprofilepicts.mediaUri;
      }

      let result = null;
      if (mediaUri != null) {
        result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
      }
      if (mediaprofilepicts != null) {
        if (mediaprofilepicts.mediaBasePath != null) {
          mediaBasePath = mediaprofilepicts.mediaBasePath;
        }

        if (mediaprofilepicts.mediaUri != null) {
          mediaUri = mediaprofilepicts.mediaUri;
        }

        if (mediaprofilepicts.mediaType != null) {
          mediaType = mediaprofilepicts.mediaType;
        }
      }

      if (result != null) {
        mediaEndpoint = result;
      }

      var senderreceiver = {
        fullName: datauserbasicsService.fullName,
        avatar: {
          mediaBasePath: mediaBasePath,
          mediaUri: mediaUri,
          mediaType: mediaType,
          mediaEndpoint: mediaEndpoint
        },
        username: datauserbasicsService.username.toString()
      };
      try {
        languages = datauserbasicsService.languages;
        idlanguages = languages.oid.toString();
        datalanguage = await this.languagesService.findOne(idlanguages)
        langIso = datalanguage.langIso;

        console.log(idlanguages)
      } catch (e) {
        languages = null;
        idlanguages = "";
        datalanguage = null;
        langIso = "";
      }
      var pid = null;
      if (jenis === "TRANSACTION" && noinvoice !== undefined) {

        pid = noinvoice;
      }
      else if (jenis === "APPEAL" && postID_ !== undefined) {

        pid = postID_;
      } else {
        pid = "";
      }

      var option = {
        priority: "high",
        contentAvailable: true
      }
      if (langIso === "id") {

        payload = {
          data: {

            title: titlein,
            body: bodyin,
            postID: pid,
            postType: postType
          }
        }


      }
      else if (langIso === "en") {

        payload = {
          data: {

            title: titleen,
            body: bodyen,
            postID: pid,
            postType: postType
          }
        }
      } else {
        payload = {
          data: {

            title: titlein,
            body: bodyin,
            postID: pid,
            postType: postType
          }
        }
      }

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> payload', JSON.stringify(payload));


      var arraydevice = [];
      datadevice = await this.userdevicesService.findActive(emailuserbasic);
      for (var i = 0; i < datadevice.length; i++) {
        var deviceid = datadevice[i].deviceID;
        await admin.messaging().sendToDevice(deviceid, payload, option);

        arraydevice.push(deviceid);

      }
      var generateID = await this.generateId();
      createNotificationsDto._id = generateID;
      createNotificationsDto.notificationID = generateID;
      createNotificationsDto.email = emailuserbasic;
      createNotificationsDto.eventType = eventType;
      createNotificationsDto.event = event;
      createNotificationsDto.mate = emailuserbasic;
      createNotificationsDto.devices = arraydevice;
      createNotificationsDto.title = payload.data.title;
      createNotificationsDto.body = bodyen;
      createNotificationsDto.bodyId = bodyin;
      createNotificationsDto.active = true;
      createNotificationsDto.flowIsDone = true;
      createNotificationsDto.createdAt = date;
      createNotificationsDto.updatedAt = date;
      createNotificationsDto.actionButtons = null;
      createNotificationsDto.contentEventID = null;
      createNotificationsDto.senderOrReceiverInfo = senderreceiver;

      if (eventType == "LIKE" || eventType == "REACTION" || eventType == "APPEAL" || eventType == "TRANSACTION" || eventType == "CONTENT" || eventType == "POST" || eventType == "BANK") {
        if (postID_ != undefined) {
          createNotificationsDto.postID = postID_;
        }
        if (postID_ != undefined) {
          createNotificationsDto.postType = postType;
        }
      }

      console.log('notif: ' + JSON.stringify(createNotificationsDto));
      await this.notificationsService.create(createNotificationsDto);


    }
  }
  async sendFcmWebMode(email: string, titlein: string, titleen: string, bodyin: any, bodyen: any, eventType: string, event: string, postID_?: string, postType?: string, noinvoice?: string, jenis?: string) {

    console.log(postID_);
    var emailuserbasic = null;
    var datadevice = null;
    var languages = null;
    var payload = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var idprofilepict = null;
    var profilepict = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var dtstring = dt.toISOString();
    var splitdt = dtstring.split(".");
    var date = splitdt[0].replace("T", " ");
    var mediaprofilepicts = null;
    var bodypayload = null;
    let createNotificationsDto = new CreateNotificationsDto();

    const datauserbasicsService = await this.basic2SS.findBymail(
      email
    );
    if (await this.ceckData(datauserbasicsService)) {
      emailuserbasic = datauserbasicsService.email;

      // try {
      //   profilepict = datauserbasicsService.profilePict;
      //   idprofilepict = profilepict.oid;
      //   mediaprofilepicts = await this.mediaprofilepictsService.findOne(idprofilepict);
      // } catch (e) {
      //   mediaprofilepicts = null;
      // }
      // const user_userAuth = await this.userauthsService.findOne(
      //   emailuserbasic
      // );

      var mediaUri = null;
      var mediaBasePath = null;
      var mediaType = null;
      var mediaEndpoint = null;
      if (datauserbasicsService.mediaUri != null) {
        mediaUri = datauserbasicsService.mediaUri;
      }

      let result = null;
      if (mediaUri != null) {
        result = datauserbasicsService.mediaEndpoint;
      }
      if (datauserbasicsService.mediaBasePath != null) {
        mediaBasePath = datauserbasicsService.mediaBasePath;
      }

      if (datauserbasicsService.mediaUri != null) {
        mediaUri = datauserbasicsService.mediaUri;
      }

      if (datauserbasicsService.mediaType != null) {
        mediaType = datauserbasicsService.mediaType;
      }

      if (result != null) {
        mediaEndpoint = result;
      }

      var senderreceiver = {
        fullName: datauserbasicsService.fullName,
        avatar: {
          mediaBasePath: mediaBasePath,
          mediaUri: mediaUri,
          mediaType: mediaType,
          mediaEndpoint: mediaEndpoint
        },
        username: datauserbasicsService.username.toString()
      };
      try {
        languages = datauserbasicsService.languages;
        idlanguages = languages.oid.toString();
        datalanguage = await this.languagesService.findOne(idlanguages)
        langIso = datalanguage.langIso;

        console.log(idlanguages)
      } catch (e) {
        languages = null;
        idlanguages = "";
        datalanguage = null;
        langIso = "";
      }
      var pid = null;
      if (jenis === "TRANSACTION" && noinvoice !== undefined) {

        pid = noinvoice;
      }
      else if (jenis === "APPEAL" && postID_ !== undefined) {

        pid = postID_;
      } else {
        pid = "";
      }


      var option = {
        priority: "high",
        contentAvailable: true
      }
      if (langIso === "id") {

        payload = {
          data: {

            title: titlein,
            body: bodyin,
            postID: pid,
            postType: postType
          }
        }


      }
      else if (langIso === "en") {

        payload = {
          data: {

            title: titleen,
            body: bodyen,
            postID: pid,
            postType: postType
          }
        }
      } else {
        payload = {
          data: {

            title: titlein,
            body: bodyin,
            postID: pid,
            postType: postType
          }
        }
      }





      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> payload', JSON.stringify(payload));


      var arraydevice = [];
      datadevice = await this.userdevicesService.findActive(emailuserbasic);
      for (var i = 0; i < datadevice.length; i++) {
        var deviceid = datadevice[i].deviceID;
        await admin.messaging().sendToDevice(deviceid, payload, option);

        arraydevice.push(deviceid);

      }
      var generateID = await this.generateId();
      createNotificationsDto._id = generateID;
      createNotificationsDto.notificationID = generateID;
      createNotificationsDto.email = emailuserbasic;
      createNotificationsDto.eventType = eventType;
      createNotificationsDto.event = event;
      createNotificationsDto.mate = emailuserbasic;
      createNotificationsDto.devices = arraydevice;
      createNotificationsDto.title = payload.data.title;
      createNotificationsDto.body = bodyen;
      createNotificationsDto.bodyId = bodyin;
      createNotificationsDto.active = true;
      createNotificationsDto.flowIsDone = true;
      createNotificationsDto.createdAt = date;
      createNotificationsDto.updatedAt = date;
      createNotificationsDto.actionButtons = null;
      createNotificationsDto.contentEventID = null;
      createNotificationsDto.senderOrReceiverInfo = senderreceiver;
      createNotificationsDto.deviceType = "WEB";

      if (eventType == "LIKE" || eventType == "REACTION" || eventType == "APPEAL" || eventType == "TRANSACTION" || eventType == "CONTENT" || eventType == "POST" || eventType == "BANK") {
        if (postID_ != undefined) {
          createNotificationsDto.postID = postID_;
        }
        if (postID_ != undefined) {
          createNotificationsDto.postType = postType;
        }
      }

      console.log('notif: ' + JSON.stringify(createNotificationsDto));
      await this.notificationsService.create(createNotificationsDto);


    }
  }

  async getSetting(jenis: string) {
    return (await this.settingsService.findOneByJenis(jenis)).value;
  }

  async getUsertname(email: string) {
    return (await this.basic2SS.findBymail(email)).username;
  }

  async getUsertname2(email: string) {
    var result = await this.basic2SS.findbyemail(email);
    return result.username;
  }

  async getregSrc(email: string) {
    var regSrc = (await this.basic2SS.findBymail(email)).regSrc;
    if (regSrc == undefined || regSrc == null) {
      regSrc = "android";
    }
    return regSrc;
  }

  async getregSrc2(email: string) {
    var result = await this.basic2SS.findbyemail(email);
    var regSrc = null;
    if (result.regSrc == undefined || regSrc == null) {
      regSrc = "android";
    }
    else {
      regSrc = result.regSrc;
    }

    return regSrc;
  }

  async updateSetting(jenis: string, value: any) {
    return await this.settingsService.findOneAndUpdate(jenis, value);
  }

  async getSetting_(_id_setting: string) {
    var getSetting = await this.settingsService.findOne(_id_setting);
    if (getSetting != null) {
      return getSetting.value;
    } else {
      return null;
    }
  }
  async getSetting2_(_id_setting: string) {
    // var getSetting = await this.settingsService.findOne(_id_setting);
    // if (getSetting != null) {
    //   return getSetting.value;
    // } else {
    //   return null;
    // }
    return await this.settingsService.findOne(_id_setting);
  }
  async getSetting_Mixed(_id_setting: string) {
    var getSetting = await this.settingMixes.findOne({ _id: new mongoose.Types.ObjectId(_id_setting) });
    if (getSetting != null) {
      return getSetting.value;
    } else {
      return null;
    }
  }

  async getDeepAr(id: string) {
    var getDeepAr = await this.deepArService.findOne(id);
    if (getDeepAr != null) {
      return getDeepAr.device;
    } else {
      return null;
    }
  }

  async updateSetting_(_id_setting: string, value: any) {
    return await this.settingsService.findOneAndUpdate_(_id_setting, value);
  }

  async convertToTime(time: string) {
    let timeString = "";
    if (time.length == 2) {
      timeString = timeString.concat(time);
    } else if (time.length == 1) {
      timeString = timeString.concat("0" + time);
    }
    timeString = timeString.concat(":00:00");
    return timeString;
  }

  async getTemplate(type: string, category: string): Promise<Templates> {
    return await this.templatesService.findOneByTypeAndCategory(type, category);
  }

  async getTemplate_repo(type: string, category: string): Promise<TemplatesRepo> {
    return await this.templatesRepoService.findOneByTypeAndCategory(type, category);
  }

  async getTemplateAppealReport(name: string, event: string, type:string, category: string): Promise<TemplatesRepo> {
    return await this.templatesRepoService.findByNameAndEventCategory(name, event, type, category);
  }
  async getTemplateAppealBank(name: string, event: string, category: string, type: string): Promise<TemplatesRepo> {
    return await this.templatesRepoService.findByNameAndEventCategoryType(name, event, category, type);
  }

  async ceckObjectid(id: string): Promise<boolean> {
    var valid = false;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      valid = true;
    }
    return valid;
  }

  async ceckUserByEmail(email: string): Promise<boolean> {
    var existing = false;
    var user_auth = await this.basic2SS.findBymail(email);
    if (await this.ceckData(user_auth)) {
      existing = true;
    }
    return existing;
  }

  async comparePassword(
    password_request: string,
    password_existing: string,
  ): Promise<boolean> {
    var isMatch = false;
    isMatch = await bcrypt.compare(password_request, password_existing);
    return isMatch;
  }

  async OTPExpires(otpRequestTime: number): Promise<boolean> {
    var isTrue = false;
    if (new Date().getTime() > otpRequestTime) {
      isTrue = true;
    }
    return isTrue;
  }

  async OTPNextAttempExpires(otpNextAttemptAllow: number): Promise<boolean> {
    var isTrue = false;
    if (new Date().getTime() > otpNextAttemptAllow) {
      isTrue = true;
    }
    return isTrue;
  }

  async compareOTPAttemp(otpattemp: number): Promise<boolean> {
    var isTrue = false;
    if (otpattemp <= Number(process.env.OTP_ATTEMP_MAX)) {
      isTrue = true;
    }
    return isTrue;
  }

  async generateId(): Promise<string> {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    var IdGenarate = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return IdGenarate;
  }

  async isAuthVerified(Data: any): Promise<boolean> {
    var isTrue = false;
    if (Data.isEmailVerified) {
      if (!(Data.status == 'NOTIFY') || !(Data.status == 'INITIAL')) {
        isTrue = true;
      }
    }
    return isTrue;
  }

  async ceckData(data: any): Promise<boolean> {
    var ceckdata = false;
    if (data != null) {
      if (data != undefined) {
        if (data.constructor.name === 'Array') {
          if (data.length > 0) {
            ceckdata = true;
          }
        } else if (data.constructor.name === 'Object') {
          if (Object.keys(data).length > 0) {
            ceckdata = true;
          }
        } else {
          if (Object.keys(data).length > 0) {
            ceckdata = true;
          }
        }
      }
    }
    return ceckdata;
  }

  async generateOTP(): Promise<String> {
    var result = '';
    for (var i = 0; i < Number(process.env.OTP_LEGHT); i++) {
      result += Math.floor(Math.random() * 9);
    }
    return result;
  }

  async generateOTPExpires(): Promise<Number> {
    var curent_date = new Date();
    curent_date.setMinutes(
      curent_date.getMinutes() + Number(process.env.OTP_EXPIRATION_TIME),
    );
    return curent_date.getTime();
  }

  async generateOTPExpiresNextAttemptAllow(): Promise<Number> {
    var curent_date = new Date();
    curent_date.setMinutes(
      curent_date.getMinutes() + Number(process.env.OTP_NEXT_ALLOW_MINUTE),
    );
    return curent_date.getTime();
  }

  async generateToken(email: string, deviceId: string) {
    const payload = {
      email: email,
      deviceId: deviceId,
    };
    return await this.jwtService.sign(payload);
  }

  async generateRefreshToken(): Promise<string> {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    var refreshToken = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return refreshToken;
  }

  async getBank(BankCode: String): Promise<Banks> {
    var Bank = await this.banksService.findbankcode(BankCode.toString());
    return Bank;
  }

  async generateNumber() {
    const getRandomId = (min = 0, max = 500000) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num.toString().padStart(6, "0")
    };
    return getRandomId();
  }

  async generateGuestUsername(): Promise<string> {
    const getUserGuest = await this.basic2SS.findGuestUser();
    return "GuestHyppe" + ((getUserGuest.length) + 1).toString();
  }

  async generatePassword(password: string): Promise<string> {
    return await bcrypt.hashSync(password, 5);
  }

  async generateUsername(email: string): Promise<string> {
    var username = email.substring(0, email.indexOf('@'));
    var list_username = await this.basic2SS.findOneUsername(username);
    if (await this.ceckData(list_username)) {
      username += '_' + await this.generateOTP();
    }
    return username;
  }

  async validateUsername(username: string): Promise<boolean> {
    var isTrue = false;
    var list_username = await this.basic2SS.findOneUsername(username);
    if (!(await this.ceckData(list_username))) {
      isTrue = true;
    }
    return isTrue;
  }
  async validateUsernamev2(username: string): Promise<boolean> {
    var isTrue = false;
    var list_username = await this.basic2SS.findbyusername(username);
    if (!(await this.ceckData(list_username))) {
      isTrue = true;
    }
    return isTrue;
  }
  async formatDateString(date: Date): Promise<string> {
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    return DateTime.substring(0, 10);
  }

  async getDateTimeString(): Promise<string> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    return DateTime.substring(0, DateTime.lastIndexOf('.'));
  }

  async getDate(): Promise<any> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    return {
      date: date,
      dateString: DateTime.substring(0, DateTime.lastIndexOf('.')),
    }
  }

  async consvertDateTimeString(date: Date): Promise<string> {
    var DateTime = new Date(date).toISOString().replace('T', ' ');
    return DateTime.substring(0, 10);
  }

  async getDateString(): Promise<string> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    return DateTime.substring(0, DateTime.lastIndexOf('.')).split(' ')[0];
  }

  async getDateTime(): Promise<Date> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return DateTime;
  }

  async getDateTimeISOString(): Promise<string> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return DateTime;
  }

  async getDateTimeStartAliFormat(): Promise<string> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return DateTime.substring(0, DateTime.lastIndexOf('.')).split(' ')[0] + "Z";
  }

  async getDateTimeEndAliFormat(day: number): Promise<string> {
    var date = new Date();
    date.setDate(date.getDate() + day);
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return DateTime.substring(0, DateTime.lastIndexOf('.')).split(' ')[0] + "Z";
  }

  async getDateTimePlusDayISOString(day: number): Promise<string> {
    var date = new Date();
    date.setDate(date.getDate() + day);
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return DateTime;
  }

  async getDateTimeDate(): Promise<Date> {
    return new Date();
  }

  async getIntegertoDate(time: number): Promise<string> {
    let myDate = new Date(1000 * time);
    let convert = (myDate.toISOString().replace('T', ' '));
    return convert.substring(0, convert.lastIndexOf('.'));
  }

  now(): number {
    let now = new Date();
    return now.getTime();
  }

  generateExpirationFromToday(day: number): number {
    let epoch = new Date().getTime();
    epoch -= ((1000 * 60 * 60 * 24) * day);
    return epoch;
  }

  generateAddExpirationFromToday(day: number): number {
    let epoch = new Date().getTime();
    epoch += ((1000 * 60 * 60 * 24) * day);
    return epoch;
  }

  async validasiEmail(email: string): Promise<boolean> {
    var valid_email = false;
    var atps = email.indexOf('@');
    var dots = email.lastIndexOf('.');
    if (atps < 1 || dots < atps + 2 || dots + 2 >= email.length) {
      valid_email = false;
    } else {
      valid_email = true;
    }
    return valid_email;
  }

  async validasiTokenEmail(head: any): Promise<boolean> {
    var isTrue = false;
    if (head != undefined) {
      if (head['x-auth-token'] != undefined) {
        var email = head['x-auth-user'];
        var token = ((head['x-auth-token']).split(" "))[1];
        var data = await this.jwtService.decode(token);
        if (data != undefined) {
          if (data['email'] == email) {
            isTrue = true;
          }
        }
      }
    }
    return isTrue;
  }

  async descripToken(head: any): Promise<any> {
    if (head != undefined) {
      if (head['x-auth-token'] != undefined) {
        var token = ((head['x-auth-token']).split(" "))[1];
        var data = await this.jwtService.decode(token);
        return data;
      }
    }
    return null;
  }

  async validasiTokenEmailParam(bearer_token: string, email: string): Promise<boolean> {
    var isTrue = false;
    if (bearer_token != undefined) {
      var isTrue = false;
      var email = email;
      var token = bearer_token.split(" ")[1];
      var data = await this.jwtService.decode(token);
      if (data != undefined) {
        if (data['email'] == email) {
          isTrue = true;
        }
      }
    }
    return isTrue;
  }

  async generateRomawi(num: number) {
    if (typeof num !== 'number')
      return false;

    var roman = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1
    };
    var str = '';

    for (var i of Object.keys(roman)) {
      var q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }

    return str;
  }

  async createFolder(current_path: string, new_folder: string): Promise<boolean> {
    var isTrue = false;
    if (await fs.existsSync(path.resolve(current_path + new_folder))) {
      isTrue = true;
    } else {
      try {
        await fs.mkdirSync(path.resolve(current_path + new_folder));
        isTrue = true;
      } catch (err) {
        isTrue = false;
      }
    }
    return isTrue;
  }

  async generateReferralImage(data: any): Promise<any> {
    try {
      var Templates_ = new TemplatesRepo();
      Templates_ = await this.getTemplate_repo('REFERRAL', 'REFERRAL');
      var html_body = Templates_.body_detail.trim().toString();
      const $_ = cheerio.load(html_body);
      var dataimage = null;
      if (data.image_profile != '') {
        dataimage = await this.seaweedfsService.read(data.image_profile.replace('/localrepo', ''));
      } else {
        dataimage = fs.readFileSync('./profile-default.jpg');
      }
      var data_string = 'data:image/png;base64,' + dataimage.toString('base64');
      $_('#profile').attr('src', data_string);
      $_('#fullname').text(data.fullName);
      $_('#username').text(data.username);
      $_('#qrcode').attr('src', await this.generateQRCode(data.refCode));
      var string_html = $_.html().toString();
      const images = await nodeHtmlToImage({
        html: string_html,
        quality: 80
      });
      return images;
    } catch (e) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed failed generate Image QR ' + e,
      );
    }
  }

  async generateQRCode(Url: string): Promise<any> {
    const generateQR = await QRCode.toDataURL(Url, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 0,
    })
    return generateQR;
  }

  async getversion(): Promise<string> {
    var get_version = await this.settingsService.findOneByJenis('AppsVersion');
    var version_number = '';
    if (await this.ceckData(get_version)) {
      if (get_version.value != undefined) { version_number = get_version.value.toString(); }
    }
    return version_number;
  }

  async getUserlanguages(email: string): Promise<String> {
    var get_userbasic = await this.basic2SS.findBymail(email);
    var get_languages = null;
    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.languages != undefined) {
        if (get_userbasic.languagesLangIso != undefined) {
          return get_userbasic.languagesLangIso.toString();
        } else {
          return 'id';
        }
      } else {
        return 'id';
      }
    } else {
      return 'id';
    }
  }
  async getUserlanguagesv2(email: string): Promise<String> {
    var get_userbasic = await this.basic2SS.findBymail(email);
    var get_languages = null;
    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.languages != undefined) {
        var languages_json = JSON.parse(JSON.stringify(get_userbasic.languages));
        get_languages = await this.languagesService.findOne(languages_json.$id);
        return get_languages.langIso.toString();
      } else {
        return 'id';
      }
    } else {
      return 'id';
    }
  }

  async getAvatarUser(email: string) {
    var AvatarDTO_ = new AvatarDTO();
    var get_profilePict = null;
    var get_userbasic = await this.basic2SS.findBymail(email);
    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.profilePict != null) {
        var mediaprofilepicts_json = JSON.parse(JSON.stringify(get_userbasic.profilePict));
        get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
      }

      if (await this.ceckData(get_profilePict)) {
        AvatarDTO_.mediaBasePath = get_profilePict.mediaBasePath;
        AvatarDTO_.mediaUri = get_profilePict.mediaUri;
        AvatarDTO_.mediaType = get_profilePict.mediaType;
        AvatarDTO_.mediaEndpoint = '/profilepict/' + get_profilePict.mediaID;
      }
    }
    return AvatarDTO_;
  }
  async getAvatarUser2(email: string) {
    var AvatarDTO_ = new AvatarDTO();
    var get_userbasic = await this.basic2SS.findBymail(email);
    if (await this.ceckData(get_userbasic)) {



      AvatarDTO_.mediaBasePath = get_userbasic.mediaBasePath;
      AvatarDTO_.mediaUri = get_userbasic.mediaUri;
      AvatarDTO_.mediaType = get_userbasic.mediaType;
      AvatarDTO_.mediaEndpoint = get_userbasic.mediaEndpoint;

    }
    return AvatarDTO_;
  }
  async generateProfile(email: string, datafor: string, email_view?: string): Promise<ProfileDTO> {
    var get_userbasic = await this.basic2SS.finddetail(email);
    // var get_userbasic = await this.userbasicsService.findOne(email);
    //var get_userauth = await this.userauthsService.findOne(email);

    var get_languages = null;
    var get_insight = null;
    var get_cities = null;
    var get_countries = null;
    var get_states = null;
    var get_profilePict = null;
    var pin_create = false;
    var otppinVerified = false;

    if (await this.ceckData(get_userbasic)) {

      if (get_userbasic.languages != undefined) {
        var languages_json = JSON.parse(JSON.stringify(get_userbasic.languages));
        get_languages = await this.languagesService.findOne(languages_json.$id);
      }

      if (get_userbasic.insight != undefined) {
        var insight_json = JSON.parse(JSON.stringify(get_userbasic.insight));
        get_insight = await this.insightsService.findOne(insight_json.$id);
      }

      if (get_userbasic.countries != undefined) {
        var countries_json = JSON.parse(JSON.stringify(get_userbasic.countries));
        get_countries = await this.countriesService.findOne(countries_json.$id);
      }

      if (get_userbasic.cities != undefined) {
        var cities_json = JSON.parse(JSON.stringify(get_userbasic.cities));
        get_cities = await this.citiesService.findOne(cities_json.$id);
      }

      if (get_userbasic.states != undefined) {
        var states_json = JSON.parse(JSON.stringify(get_userbasic.states));
        get_states = await this.areasService.findOneid(states_json.$id);
      }

      if (get_userbasic.profilePict != null) {
        var mediaprofilepicts_json = JSON.parse(JSON.stringify(get_userbasic.profilePict));
        get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
      }
    }

    var AvatarDTO_ = new AvatarDTO();

    if (await this.ceckData(get_profilePict)) {
      AvatarDTO_.mediaBasePath = get_profilePict.mediaBasePath;
      AvatarDTO_.mediaUri = get_profilePict.mediaUri;
      AvatarDTO_.mediaType = get_profilePict.mediaType;
      AvatarDTO_.mediaEndpoint = '/profilepict/' + get_profilePict.mediaID;
    }

    var CreateInsightsDto_ = new CreateInsightsDto();
    if (await this.ceckData(get_insight)) {
      const FOLLOWER = await this.getprofilecontenteventService.findByCriteria(email, "FOLLOWER");
      const FOLLOWER_ = [...new Map(FOLLOWER.map(item => [item["receiverParty"], item])).values()];
      const FOLLOWING = await this.getprofilecontenteventService.findByCriteria(email, "FOLLOWING");
      const FOLLOWING_ = [...new Map(FOLLOWING.map(item => [item["senderParty"], item])).values()];

      let aFOLLOWER_ = <any>FOLLOWER_.length;
      let aFOLLOWING_ = <any>FOLLOWING_.length;
      if (get_insight.shares != undefined) { CreateInsightsDto_.shares = get_insight.shares; }
      if (get_insight.followers != undefined) { CreateInsightsDto_.followers = aFOLLOWER_; }
      if (get_insight.comments != undefined) { CreateInsightsDto_.comments = get_insight.comments; }
      if (get_insight.followings != undefined) { CreateInsightsDto_.followings = aFOLLOWING_; }
      if (get_insight.reactions != undefined) { CreateInsightsDto_.reactions = get_insight.reactions; }
      if (get_insight.posts != undefined) { CreateInsightsDto_.posts = get_insight.posts; }
      if (get_insight.views != undefined) { CreateInsightsDto_.views = get_insight.views; }
      if (get_insight.likes != undefined) { CreateInsightsDto_.likes = get_insight.likes; }
    }

    var interests_array = [];
    console.log(email);
    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.userInterests.length > 0) {
        for (let i = 0; i < get_userbasic.userInterests.length; i++) {
          if (get_userbasic.userInterests[i] != null) {
            var interests_json = JSON.parse(
              JSON.stringify(get_userbasic.userInterests[i]),
            );
            if (interests_json.ref == 'interests_repo') {
              const interests = await this.interestsRepoService.findOne(
                interests_json.$id.toString(),
              );
              interests_array[i] = interests._id;
            } else {
              const interests = await this.interestsRepoService.findOne(
                interests_json.$id.toString(),
              );
              if (interests != null) {
                if (interests._id != undefined) {
                  interests_array[i] = interests._id;
                }
              }
            }
          }
        }
      }
    }

    var ProfileDTO_ = new ProfileDTO();
    if (datafor == 'FULL') {
      if (await this.ceckData(get_userbasic)) {
        if (get_userbasic.profileID != undefined) { ProfileDTO_.profileID = get_userbasic.profileID; }
        if (get_userbasic.regSrc != undefined) { ProfileDTO_.regSrc = get_userbasic.regSrc; }
        if (get_userbasic.bio != undefined) { ProfileDTO_.bio = get_userbasic.bio; }
        if (get_userbasic.dob != undefined) { ProfileDTO_.dob = get_userbasic.dob; }
        if (get_userbasic.gender != undefined) { ProfileDTO_.gender = get_userbasic.gender; }
        if (get_userbasic.idProofNumber != undefined) { ProfileDTO_.idProofNumber = get_userbasic.idProofNumber; }

        if (get_cities != null) { ProfileDTO_.city = get_cities.cityName; }
        if (get_states != null) { ProfileDTO_.area = get_states.stateName; }
        ProfileDTO_.mobileNumber = get_userbasic.mobileNumber;
        if (get_languages != null) {
          var eula = await this.eulasService.findOnelangiso(get_languages.langIso);
          if (await this.ceckData(eula)) {
            ProfileDTO_.eulaID = eula.eulaID;
          }
        }

        ProfileDTO_.isCelebrity = get_userbasic.isCelebrity.toString();
        ProfileDTO_.isPrivate = get_userbasic.isPrivate.toString();
        ProfileDTO_.isFollowPrivate = get_userbasic.isFollowPrivate.toString();
        ProfileDTO_.isPostPrivate = get_userbasic.isPostPrivate.toString();
        ProfileDTO_.otp = get_userbasic.oneTimePassword;
        ProfileDTO_.otpToken = get_userbasic.otpToken;
        ProfileDTO_.otpToken = get_userbasic.otpToken;
        ProfileDTO_.authEmail = get_userbasic.email;
        ProfileDTO_.iduser = get_userbasic._id;
        ProfileDTO_.profileID = get_userbasic.profileID;
        //ProfileDTO_.token =
        //ProfileDTO_.refreshToken =
        //ProfileDTO_.userProfile =
        //ProfileDTO_.socmedSource =
        //ProfileDTO_.referral =
        //ProfileDTO_.imei = 
        //ProfileDTO_.referralCount =
        //ProfileDTO_.children = 
      }
    }

    if (email_view != undefined) {
      const contenteventsService_data_ = await this.getprofilecontenteventService.findByCriteriaWithUser(email_view, "FOLLOWING", email);
      if (await this.ceckData(contenteventsService_data_)) {
        ProfileDTO_.following = true;
      } else {
        ProfileDTO_.following = false;
      }
    }

    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.pin != undefined) {
        if (get_userbasic.pin != null) {
          if (get_userbasic.pin != "") {
            pin_create = true;
          }
        }
      }
    }

    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.otppinVerified != undefined) {
        otppinVerified = get_userbasic.otppinVerified;
      }
    }
    if (await this.ceckData(get_userbasic)) {
      if (datafor == 'LOGIN' || datafor == 'FULL' || datafor == 'PROFILE') {
        if (get_states != null) { ProfileDTO_.area = get_states.stateName; }
        if (get_countries != null) { ProfileDTO_.country = get_countries.country; }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.gender != undefined) { ProfileDTO_.gender = get_userbasic.gender; }
        }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.dob != undefined) { ProfileDTO_.dob = get_userbasic.dob; }
        }
        if (get_cities != null) { ProfileDTO_.city = get_cities.cityName; }
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.mobileNumber = get_userbasic.mobileNumber;
        }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.idProofNumber != undefined) { ProfileDTO_.idProofNumber = get_userbasic.idProofNumber; }
        }
        if (get_userbasic.roles != undefined) {
          if (get_userbasic.roles != null) {
            ProfileDTO_.roles = get_userbasic.roles;
          }
        }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.fullName != undefined) { ProfileDTO_.fullName = get_userbasic.fullName; }
          if (get_userbasic.bio != undefined) { ProfileDTO_.bio = get_userbasic.bio; }
        }
        if (await this.ceckData(get_profilePict)) {
          ProfileDTO_.avatar = AvatarDTO_;
        }
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.isIdVerified = get_userbasic.isIdVerified.toString();
        }
        ProfileDTO_.isEmailVerified = get_userbasic.isEmailVerified.toString();
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.idProofStatus != undefined) { ProfileDTO_.idProofStatus = get_userbasic.idProofStatus; }
        }
        ProfileDTO_.insight = CreateInsightsDto_;
        if (get_languages != null) { ProfileDTO_.langIso = get_languages.langIso; }
        ProfileDTO_.interest = interests_array;
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.event = get_userbasic.event;
          if (get_userbasic.email != undefined) { ProfileDTO_.email = get_userbasic.email; }
        }
        if (get_userbasic.username != undefined) { ProfileDTO_.username = get_userbasic.username; }
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.isComplete = get_userbasic.isComplete.toString();
          ProfileDTO_.status = get_userbasic.status;
        }

        ProfileDTO_.urluserBadge = get_userbasic.urluserBadge;
        ProfileDTO_.pin_create = pin_create;
        ProfileDTO_.pin_verified = otppinVerified;
        ProfileDTO_.iduser = get_userbasic._id;
        ProfileDTO_.profileID = get_userbasic.profileID;
        if (get_userbasic.statusKyc != undefined) {
          ProfileDTO_.statusKyc = get_userbasic.statusKyc;
        } else {
          if (get_userbasic.isIdVerified != undefined) {
            if (get_userbasic.isIdVerified) {
              ProfileDTO_.statusKyc = "verified";
            } else {
              ProfileDTO_.statusKyc = "unverified";
            }
          } else {
            ProfileDTO_.statusKyc = "unverified";
          }
        }
        if (get_userbasic.tutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.getSettingMixed(SETTING_TUTOR);
          if (await this.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(get_userbasic.tutor)) {
              if (getSettingTutor.value.length == get_userbasic.tutor.length) {
                let arrayTutor = get_userbasic.tutor;
                let arraySetting = getSettingTutor.value;
                var data_ = await Promise.all(arrayTutor.map(async (item, index) => {
                  console.log();
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
                ProfileDTO_.tutor = data_;
              }
            }
          }
        }
        if (get_userbasic.creator != undefined) {
          ProfileDTO_.creator = get_userbasic.creator;
        }
        else {
          ProfileDTO_.creator = false;
        }
      }
    }
    return ProfileDTO_;
  }

  async generateProfile2(email: string, datafor: string, email_view?: string): Promise<ProfileDTO> {
    var get_userbasic = await this.basic2SS.finddetail(email);

    var get_languages = null;
    var get_insight = null;
    var get_cities = null;
    var get_countries = null;
    var get_states = null;
    var get_profilePict = null;
    var pin_create = false;
    var otppinVerified = false;

    console.log("GENERATE PROFILE");
    if (await this.ceckData(get_userbasic)) {

      get_languages = get_userbasic.languagesLangIso;
      get_countries = get_userbasic.countriesName;
      get_cities = get_userbasic.citiesName;
      get_states = get_userbasic.statesName;

      if (get_userbasic.insight != undefined) {
        var insight_json = JSON.parse(JSON.stringify(get_userbasic.insight));
        get_insight = await this.insightsService.findOne(insight_json.$id);
      }
    }

    var AvatarDTO_ = new AvatarDTO();

    try {
      if (get_userbasic.mediaBasePath != null || get_userbasic.mediaUri != null || get_userbasic.mediaType != null || get_userbasic.mediaEndpoint != null) {
        AvatarDTO_.mediaBasePath = get_userbasic.mediaBasePath;
        AvatarDTO_.mediaUri = get_userbasic.mediaUri;
        AvatarDTO_.mediaType = get_userbasic.mediaType;
        AvatarDTO_.mediaEndpoint = get_userbasic.mediaEndpoint;
      }
    }
    catch (e) {

    }

    var CreateInsightsDto_ = new CreateInsightsDto();
    if (await this.ceckData(get_insight)) {
      if (get_insight.shares != undefined) { CreateInsightsDto_.shares = get_insight.shares; }
      if (get_insight.followers != undefined) { CreateInsightsDto_.followers = get_insight.followers; }
      if (get_insight.comments != undefined) { CreateInsightsDto_.comments = get_insight.comments; }
      if (get_insight.followings != undefined) { CreateInsightsDto_.followings = get_insight.followings; }
      if (get_insight.reactions != undefined) { CreateInsightsDto_.reactions = get_insight.reactions; }
      if (get_insight.posts != undefined) { CreateInsightsDto_.posts = get_insight.posts; }
      if (get_insight.views != undefined) { CreateInsightsDto_.views = get_insight.views; }
      if (get_insight.likes != undefined) { CreateInsightsDto_.likes = get_insight.likes; }
    }

    var interests_array = [];
    console.log(email);
    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.userInterests.length > 0) {
        for (let i = 0; i < get_userbasic.userInterests.length; i++) {
          if (get_userbasic.userInterests[i] != null) {
            var interests_json = JSON.parse(
              JSON.stringify(get_userbasic.userInterests[i]),
            );
            if (interests_json.ref == 'interests_repo') {
              const interests = await this.interestsRepoService.findOne(
                interests_json.$id.toString(),
              );
              interests_array[i] = interests._id;
            } else {
              const interests = await this.interestsRepoService.findOne(
                interests_json.$id.toString(),
              );
              if (interests != null) {
                if (interests._id != undefined) {
                  interests_array[i] = interests._id;
                }
              }
            }
          }
        }
      }
    }

    var ProfileDTO_ = new ProfileDTO();
    if (datafor == 'FULL') {
      if (await this.ceckData(get_userbasic)) {
        if (get_userbasic.profileID != undefined) { ProfileDTO_.profileID = get_userbasic.profileID; }
        if (get_userbasic.authUsers.regSrc != undefined) { ProfileDTO_.regSrc = get_userbasic.authUsers.regSrc; }
        if (get_userbasic.bio != undefined) { ProfileDTO_.bio = get_userbasic.bio; }
        if (get_userbasic.dob != undefined) { ProfileDTO_.dob = get_userbasic.dob; }
        if (get_userbasic.gender != undefined) { ProfileDTO_.gender = get_userbasic.gender; }
        if (get_userbasic.idProofNumber != undefined) { ProfileDTO_.idProofNumber = get_userbasic.idProofNumber; }

        if (get_cities != null) { ProfileDTO_.city = get_cities; }
        if (get_states != null) { ProfileDTO_.area = get_states; }
        if (get_countries != null) { ProfileDTO_.country = get_countries; }
        ProfileDTO_.mobileNumber = get_userbasic.mobileNumber;
        if (get_languages != null) {
          var eula = await this.eulasService.findOnelangiso(get_languages.langIso);
          if (await this.ceckData(eula)) {
            ProfileDTO_.eulaID = eula.eulaID;
          }
        }

        ProfileDTO_.isCelebrity = get_userbasic.isCelebrity.toString();
        ProfileDTO_.isPrivate = get_userbasic.isPrivate.toString();
        ProfileDTO_.isFollowPrivate = get_userbasic.isFollowPrivate.toString();
        ProfileDTO_.isPostPrivate = get_userbasic.isPostPrivate.toString();
        ProfileDTO_.otp = get_userbasic.oneTimePassword;
        ProfileDTO_.otpToken = get_userbasic.otpToken;
        ProfileDTO_.authEmail = get_userbasic.email;
        ProfileDTO_.iduser = get_userbasic._id;
        ProfileDTO_.profileID = get_userbasic.profileID;
        ProfileDTO_.emailLogin = get_userbasic.emailLogin;
        //ProfileDTO_.token =
        //ProfileDTO_.refreshToken =
        //ProfileDTO_.userProfile =
        //ProfileDTO_.socmedSource =
        //ProfileDTO_.referral =
        //ProfileDTO_.imei = 
        //ProfileDTO_.referralCount =
        //ProfileDTO_.children = 
      }
    }

    if (email_view != undefined) {
      let ceckFOLLOWING = get_userbasic.follower.includes(email_view)
      if (ceckFOLLOWING) {
        ProfileDTO_.following = true;
      } else {
        ProfileDTO_.following = false;
      }

      // if (get_userbasic.email == email_view) {
      //   ProfileDTO_.status = "UNLINK";
      // } else {
      //   let ceckFOLLOWING = get_userbasic.following.includes(email_view)
      //   if (ceckFOLLOWING) {
      //     ProfileDTO_.following = true;
      //     ProfileDTO_.status = "FOLLOWING";
      //   } else {
      //     ProfileDTO_.following = false;
      //     ProfileDTO_.status = 'TOFOLLOW';
      //   }
      // }
    }

    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.pin != undefined) {
        if (get_userbasic.pin != null) {
          if (get_userbasic.pin != "") {
            pin_create = true;
          }
        }
      }
    }

    if (await this.ceckData(get_userbasic)) {
      if (get_userbasic.otppinVerified != undefined) {
        otppinVerified = get_userbasic.otppinVerified;
      }
    }
    if (await this.ceckData(get_userbasic)) {
      if (datafor == 'LOGIN' || datafor == 'FULL' || datafor == 'PROFILE') {
        if (get_states != null) { ProfileDTO_.area = get_states; }
        if (get_countries != null) { ProfileDTO_.country = get_countries; }
        if (get_cities != null) { ProfileDTO_.city = get_cities; }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.gender != undefined) { ProfileDTO_.gender = get_userbasic.gender; }
        }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.dob != undefined) { ProfileDTO_.dob = get_userbasic.dob; }
        }
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.mobileNumber = get_userbasic.mobileNumber;
        }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.idProofNumber != undefined) { ProfileDTO_.idProofNumber = get_userbasic.idProofNumber; }
        }
        if (get_userbasic.roles != undefined) {
          if (get_userbasic.roles != null) {
            ProfileDTO_.roles = get_userbasic.roles;
          }
        }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.fullName != undefined) { ProfileDTO_.fullName = get_userbasic.fullName; }
          if (get_userbasic.bio != undefined) { ProfileDTO_.bio = get_userbasic.bio; }
        }
        if (await this.ceckData(AvatarDTO_)) {
          ProfileDTO_.avatar = AvatarDTO_;
        }
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.isIdVerified = get_userbasic.isIdVerified.toString();
        }
        if (get_userbasic.isEmailVerified != undefined) { ProfileDTO_.isEmailVerified = get_userbasic.isEmailVerified.toString(); }
        if (await this.ceckData(get_userbasic)) {
          if (get_userbasic.idProofStatus != undefined) { ProfileDTO_.idProofStatus = get_userbasic.idProofStatus; }
        }
        ProfileDTO_.insight = CreateInsightsDto_;
        if (get_languages != null) { ProfileDTO_.langIso = get_userbasic.languagesLangIso; }
        ProfileDTO_.interest = interests_array;
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.event = get_userbasic.event;
          if (get_userbasic.email != undefined) { ProfileDTO_.email = get_userbasic.email; }
        }
        if (get_userbasic.username != undefined) { ProfileDTO_.username = get_userbasic.username; }
        if (await this.ceckData(get_userbasic)) {
          ProfileDTO_.isComplete = get_userbasic.isComplete.toString();
          ProfileDTO_.status = get_userbasic.status;
        }

        ProfileDTO_.urluserBadge = get_userbasic.urluserBadge;
        ProfileDTO_.pin_create = pin_create;
        ProfileDTO_.pin_verified = otppinVerified;
        ProfileDTO_.iduser = get_userbasic._id;
        ProfileDTO_.profileID = get_userbasic.profileID;
        ProfileDTO_.emailLogin = get_userbasic.emailLogin;
        if (get_userbasic.statusKyc != undefined) {
          ProfileDTO_.statusKyc = get_userbasic.statusKyc;
        } else {
          if (get_userbasic.isIdVerified != undefined) {
            if (get_userbasic.isIdVerified) {
              ProfileDTO_.statusKyc = "verified";
            } else {
              ProfileDTO_.statusKyc = "unverified";
            }
          } else {
            ProfileDTO_.statusKyc = "unverified";
          }
        }
        
        var data_ = null;
        if (get_userbasic.tutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.getSettingMixed(SETTING_TUTOR);
          if (await this.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(get_userbasic.tutor)) {
              if (getSettingTutor.value.length == get_userbasic.tutor.length) {
                let arrayTutor = get_userbasic.tutor;
                let arraySetting = getSettingTutor.value;
                data_ = await Promise.all(arrayTutor.map(async (item, index) => {
                  console.log();
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
              }
            }
          }
        }
        else
        {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.getSettingMixed(SETTING_TUTOR);
          if (await this.ceckData(getSettingTutor)) {
            var insertdata = [];
            let arraySetting = JSON.parse(JSON.stringify(getSettingTutor.value));
            for(var i = 0; i < arraySetting.length; i++)
            {
              insertdata.push(
                {
                  "key": arraySetting[i].key,
                  "textID": arraySetting[i].textID,
                  "textEn": arraySetting[i].textEn,
                  "status": true,  
                }
              );
            }
            
            data_ = insertdata;
          }
        }
        ProfileDTO_.tutor = data_;
        
        if (get_userbasic.creator != undefined) {
          ProfileDTO_.creator = get_userbasic.creator;
        }
        else {
          ProfileDTO_.creator = false;
        }
      }
    }
    return ProfileDTO_;
  }

  async getPin(email: string) {
    var pin = "";
    var data_user = await this.basic2SS.findBymail(email);
    if (data_user.otp_pin == undefined) {
      pin = data_user.pin.toString();
    }
    return await this.decrypt(pin);
  }

  async encrypt(text: string) {
    return await cryptr.encrypt(text);
  }

  async decrypt(text: string) {
    return cryptr.decrypt(text);
  }

  async generateTransactionNumber(No: number) {
    var date_current = await this.getDateTimeString();
    var tahun_nember = this.generateRomawi(parseInt(date_current.substring(0, 4)));
    var bulan_number = this.generateRomawi(parseInt(date_current.substring(7, 5)));
    var tanggal_number = this.generateRomawi(parseInt(date_current.substring(10, 8)));
    var datatransaction = No + 1;
    var TransactionNumber = "INV/" + (await tahun_nember).toString() + "/" + (await bulan_number).toString() + "/" + (await tanggal_number).toString() + "/" + datatransaction;
    return TransactionNumber;
  }

  async generateCampaignID(No: number, typeAdsID: string, ObjectivitasId: string) {
    var noCampaignID = "";
    var date_current = await this.getDateTimeString();
    var tahun_nember = date_current.substring(0, 4);
    noCampaignID += tahun_nember;
    if (typeAdsID == this.configService.get("ID_ADS_IN_POPUP")) {
      noCampaignID += "-01";
    } else if (typeAdsID == this.configService.get("ID_ADS_IN_BETWEEN")) {
      noCampaignID += "-02";
    } else if (typeAdsID == this.configService.get("ID_ADS_IN_CONTENT")) {
      noCampaignID += "-03";
    }

    if (ObjectivitasId == this.configService.get("ID_ADS_OBJECTTIVITAS_AWARENESS")) {
      noCampaignID += "-01";
    } else if (ObjectivitasId == this.configService.get("ID_ADS_OBJECTTIVITAS_CONSIDERATION")) {
      noCampaignID += "-02";
    } else if (ObjectivitasId == this.configService.get("ID_ADS_OBJECTTIVITAS_ACTION")) {
      noCampaignID += "-03";
    }


    if ((No.toString().length) == 6) {
      noCampaignID += "-" + No;
    } else if ((No.toString().length) == 5) {
      noCampaignID += "-0" + No;
    } else if ((No.toString().length) == 4) {
      noCampaignID += "-00" + No;
    } else if ((No.toString().length) == 3) {
      noCampaignID += "-000" + No;
    } else if ((No.toString().length) == 2) {
      noCampaignID += "-0000" + No;
    } else if ((No.toString().length) == 1) {
      noCampaignID += "-00000" + No;
    }
    return noCampaignID;
  }

  async formatMoney(num: number) {
    var p = num.toFixed(2).split(".");
    return "Rp " + p[0].split("").reverse().reduce(function (acc, num, i, orig) {
      return num + (num != "-" && i && !(i % 3) ? "." : "") + acc;
    }, "");
  }

  async formatAMPM(date: Date, dateShow: boolean) {
    var hours = date.getHours() - 7;
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    var strTime = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
    var DataDate = "";
    if (dateShow) {
      var day = date.getDate();
      var month = date.getMonth();
      var year = date.getFullYear();
      DataDate = (day < 10 ? '0' + day : day) + "/" + (month < 10 ? '0' + month : month) + "/" + year;
    }
    var DateReturn = (DataDate != "") ? DataDate + " " + strTime : strTime;
    return DateReturn;
  }

  async dateFormat(date: string) {
    var dateSplit = date.split("-");
    return dateSplit[2] + "/" + dateSplit[1] + "/" + dateSplit[0];
  }

  async getUserBasic(email: string) {
    return await this.basic2SS.findBymail(email);
  }
  async getUserBasic2(email: string) {
    return await this.basic2SS.findBymail(email);
  }
  async getDayName(lang: string, dateString: string) {
    var day_list = [];
    if (lang == "en") {
      day_list = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    } else {
      day_list = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    }
    var d = new Date(dateString);
    var dayName = day_list[d.getDay()];
    return dayName;
  }

  async getMontName(lang: string, dateString: string) {
    var month_list = [];
    if (lang == "en") {
      month_list = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    } else {
      month_list = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    }
    var d = new Date(dateString);
    var monthName = month_list[d.getMonth() - 1];
    return monthName;
  }

  async getDateFormat(lang: string, dateString: string) {
    // var dataSplite = (dateString.substring(0, dateString.lastIndexOf('.'))).split("T")
    // var DateSplite = dataSplite[0];
    // var DateSpliteplite = DateSplite.split("-");
    // var TimeSplite = dataSplite[1];

    // var day = DateSpliteplite[2];
    // var month = DateSpliteplite[1];
    // var year = DateSpliteplite[0];

    var d = new Date(dateString);
    var day = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();

    var hours = d.getHours() - 7;
    var minute = d.getMinutes();
    var timeData = (hours < 10 ? '0' + hours : hours) + ":" + (minute < 10 ? '0' + minute : minute)

    var DayName = await this.getDayName(lang, dateString);
    var MonthName = await this.getMontName(lang, dateString);
    return DayName + ", " + (day < 10 ? '0' + day : day) + " " + MonthName + " " + year + ", " + timeData;
  }

  async makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async counscore(type: string, namedb: string, nametabel: string, idevent: Object, event: string, iduser: Object) {
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var stringdate = splitdate[0];
    var date = stringdate.substring(0, 10) + " " + "00:00:00";
    var datacatsday = null;

    var dataseting = null;
    var value = null;

    try {
      dataseting = await this.settingsService.findOneByJenisremark(event, type);
      value = dataseting.value;
    } catch (e) {
      dataseting = null;
      value = 0;
    }

    var cekdata = null;

    try {
      cekdata = await this.userscoresService.finddate(date, iduser.toString());

    } catch (e) {
      cekdata = null;

    }

    if (cekdata.length == 0) {
      var UserscoresDto_ = new UserscoresDto();
      UserscoresDto_.iduser = iduser;
      UserscoresDto_.totalscore = value;
      UserscoresDto_.date = date;
      UserscoresDto_.listscore = [
        {
          "idevent": { "$ref": nametabel, "$id": idevent, "$db": namedb },
          "createdAt": stringdate,
          "event": event,
          "type": type,
          "score": value
        }
      ];
      await this.userscoresService.create(UserscoresDto_);
    } else {

      try {
        datacatsday = await this.userscoresService.finddatabydate(date, iduser.toString());

      } catch (e) {
        datacatsday = null;

      }

      if (datacatsday !== null || datacatsday.length > 0) {


        var idq = datacatsday[0]._id;
        var totalint = datacatsday[0].totalscore + value;
        var listscore = datacatsday[0].listscore;
        var obj = {
          "idevent": { "$ref": nametabel, "$id": idevent, "$db": namedb },
          "createdAt": stringdate,
          "event": event,
          "type": type,
          "score": value
        };
        listscore.push(obj);

        let UserscoresDto_ = new UserscoresDto();
        UserscoresDto_.totalscore = totalint;
        UserscoresDto_.listscore = listscore;

        await this.userscoresService.update(idq.toString(), UserscoresDto_);

      }

    }
  }

  async validateParam(nameParam: string, value: any, type: string): Promise<string> {
    if (value != undefined) {
      if ((typeof value) != type) {
        return "Unabled to proceed param " + nameParam + " is required " + type;
      } else {
        if (type == "string") {
          if (value.length == 0) {
            return "Unabled to proceed param " + nameParam + " is required";
          } else {
            return "";
          }
        } else {
          return "";
        }
      }
    } else {
      return "Unabled to proceed param " + nameParam + " is required";
    }
  }

  async sendFcmMassal(email: string, titlein: string, bodyin: any, eventType: string, event: string, postID_?: string, postType?: string) {

    console.log(postID_);
    var emailuserbasic = null;
    var datadevice = null;
    var languages = null;
    var payload = null;
    var payloadios = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var idprofilepict = null;
    var profilepict = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var dtstring = dt.toISOString();
    var splitdt = dtstring.split(".");
    var date = splitdt[0].replace("T", " ");
    var mediaprofilepicts = null;
    var bodypayload = null;
    let createNotificationsDto = new CreateNotificationsDto();

    const datauserbasicsService = await this.basic2SS.findBymail(
      email
    );
    if (await this.ceckData(datauserbasicsService)) {
      emailuserbasic = datauserbasicsService.email;

      try {
        profilepict = datauserbasicsService.profilePict;
        idprofilepict = profilepict.oid;
        mediaprofilepicts = await this.mediaprofilepictsService.findOne(idprofilepict);
      } catch (e) {
        mediaprofilepicts = null;
      }
      // const user_userAuth = await this.userauthsService.findOne(
      //   emailuserbasic
      // );

      var mediaUri = null;
      var mediaBasePath = null;
      var mediaType = null;
      var mediaEndpoint = null;
      var regSrc = null;
      var title = null;
      if (mediaprofilepicts != null) {
        mediaUri = mediaprofilepicts.mediaUri;
      }

      let result = null;
      if (mediaUri != null) {
        result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
      }
      if (mediaprofilepicts != null) {
        if (mediaprofilepicts.mediaBasePath != null) {
          mediaBasePath = mediaprofilepicts.mediaBasePath;
        }

        if (mediaprofilepicts.mediaUri != null) {
          mediaUri = mediaprofilepicts.mediaUri;
        }

        if (mediaprofilepicts.mediaType != null) {
          mediaType = mediaprofilepicts.mediaType;
        }
      }

      if (result != null) {
        mediaEndpoint = result;
      }

      var senderreceiver = {
        fullName: datauserbasicsService.fullName,
        avatar: {
          mediaBasePath: mediaBasePath,
          mediaUri: mediaUri,
          mediaType: mediaType,
          mediaEndpoint: mediaEndpoint
        },
        username: datauserbasicsService.username.toString()
      };

      payload = {
        data: {

          title: titlein,
          body: bodyin,
          postID: postID_,
          postType: postType
        }
      }
      var option = {
        priority: "high",
        contentAvailable: true
      }

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> payload', JSON.stringify(payload));


      var arraydevice = [];
      datadevice = await this.userdevicesService.findActive(emailuserbasic);
      for (var i = 0; i < datadevice.length; i++) {
        var deviceid = datadevice[i].deviceID;
        var adm = await admin.messaging().sendToDevice(deviceid, payload, option);
        console.log(adm);
        arraydevice.push(deviceid);

      }
      var generateID = await this.generateId();
      createNotificationsDto._id = generateID;
      createNotificationsDto.notificationID = generateID;
      createNotificationsDto.email = emailuserbasic;
      createNotificationsDto.eventType = eventType;
      createNotificationsDto.event = event;
      createNotificationsDto.mate = emailuserbasic;
      createNotificationsDto.devices = arraydevice;
      createNotificationsDto.title = titlein.toString();
      createNotificationsDto.body = bodyin;
      createNotificationsDto.bodyId = bodyin;
      createNotificationsDto.active = true;
      createNotificationsDto.flowIsDone = true;
      createNotificationsDto.createdAt = date;
      createNotificationsDto.updatedAt = date;
      createNotificationsDto.actionButtons = null;
      createNotificationsDto.contentEventID = null;
      createNotificationsDto.senderOrReceiverInfo = senderreceiver;


      if (postID_ != undefined) {
        createNotificationsDto.postID = postID_;
      }
      if (postID_ != undefined) {
        createNotificationsDto.postType = postType;
      }


      console.log('notif: ' + JSON.stringify(createNotificationsDto));
      await this.notificationsService.create(createNotificationsDto);


    }
  }

  async sendNotifChallenge(type: string, email: string, titlein: string, bodyin: any, bodyeng: any, eventType: string, event: string, postID_: string, postType: string, challengeSession: string, timesend: string) {

    console.log(postID_);
    var emailuserbasic = null;
    var datadevice = null;
    var languages = null;
    var payload = null;
    var payloadios = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var idprofilepict = null;
    var profilepict = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var dtstring = dt.toISOString();
    var splitdt = dtstring.split(".");
    var date = splitdt[0].replace("T", " ");
    var mediaprofilepicts = null;
    var bodypayload = null;
    var datanotifchall = null;
    let createNotificationsDto = new CreateNotificationsDto();

    const datauserbasicsService = await this.basic2SS.findBymail(
      email
    );
    if (await this.ceckData(datauserbasicsService)) {
      emailuserbasic = datauserbasicsService.email;

      try {
        profilepict = datauserbasicsService.profilePict;
        idprofilepict = profilepict.oid;
        mediaprofilepicts = await this.mediaprofilepictsService.findOne(idprofilepict);
      } catch (e) {
        mediaprofilepicts = null;
      }
      // const user_userAuth = await this.userauthsService.findOne(
      //   emailuserbasic
      // );

      var mediaUri = null;
      var mediaBasePath = null;
      var mediaType = null;
      var mediaEndpoint = null;
      var regSrc = null;
      var title = null;
      if (mediaprofilepicts != null) {
        mediaUri = mediaprofilepicts.mediaUri;
      }

      let result = null;
      if (mediaUri != null) {
        result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
      }
      if (mediaprofilepicts != null) {
        if (mediaprofilepicts.mediaBasePath != null) {
          mediaBasePath = mediaprofilepicts.mediaBasePath;
        }

        if (mediaprofilepicts.mediaUri != null) {
          mediaUri = mediaprofilepicts.mediaUri;
        }

        if (mediaprofilepicts.mediaType != null) {
          mediaType = mediaprofilepicts.mediaType;
        }
      }

      if (result != null) {
        mediaEndpoint = result;
      }

      var senderreceiver = {
        fullName: datauserbasicsService.fullName,
        avatar: {
          mediaBasePath: mediaBasePath,
          mediaUri: mediaUri,
          mediaType: mediaType,
          mediaEndpoint: mediaEndpoint
        },
        username: datauserbasicsService.username.toString()
      };
      try {
        languages = datauserbasicsService.languages;
        idlanguages = languages.oid.toString();
        datalanguage = await this.languagesService.findOne(idlanguages)
        langIso = datalanguage.langIso;

        console.log(idlanguages)
      } catch (e) {
        languages = null;
        idlanguages = "";
        datalanguage = null;
        langIso = "";
      }

      var option = {
        priority: "high",
        contentAvailable: true
      }


      if (langIso === "en") {

        if (type == "PEMENANG") {
          payload = {
            data: {

              title: titlein,
              body: bodyeng,
              postID: postID_.toString(),
              postType: eventType,
              challengeSession: challengeSession,
              index: "1",
              winner: "true"
            }
          }
        }
        else if (type == "BERAKHIR") {
          payload = {
            data: {

              title: titlein,
              body: bodyeng,
              postID: postID_.toString(),
              postType: eventType,
              challengeSession: challengeSession,
              index: "1"

            }
          }
        } else {
          payload = {
            data: {

              title: titlein,
              body: bodyeng,
              postID: postID_.toString(),
              postType: eventType
            }
          }
        }

      } else {
        if (type == "PEMENANG") {
          payload = {
            data: {

              title: titlein,
              body: bodyin,
              postID: postID_.toString(),
              postType: eventType,
              challengeSession: challengeSession,
              index: "1",
              winner: "true"
            }
          }
        }
        else if (type == "BERAKHIR") {
          payload = {
            data: {

              title: titlein,
              body: bodyin,
              postID: postID_.toString(),
              postType: eventType,
              challengeSession: challengeSession,
              index: "1",
            }
          }
        } else {

          payload = {
            data: {

              title: titlein,
              body: bodyin,
              postID: postID_.toString(),
              postType: eventType
            }
          }
        }

      }
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> payload', JSON.stringify(payload));


      var arraydevice = [];
      var adm = null;


      datadevice = await this.userdevicesService.findActive(emailuserbasic);
      for (var i = 0; i < datadevice.length; i++) {
        var deviceid = datadevice[i].deviceID;
        try {
          adm = await admin.messaging().sendToDevice(deviceid, payload, option);
          console.log(adm);
          arraydevice.push(deviceid);
        } catch (e) {
          // e.toString();
        }


      }

      var generateID = await this.generateId();
      createNotificationsDto._id = generateID;
      createNotificationsDto.notificationID = generateID;
      createNotificationsDto.email = emailuserbasic;
      createNotificationsDto.eventType = eventType;
      createNotificationsDto.event = event;
      createNotificationsDto.mate = emailuserbasic;
      createNotificationsDto.devices = arraydevice;
      // createNotificationsDto.title = titlein.toString();
      createNotificationsDto.title = payload.data.title;
      createNotificationsDto.body = bodyeng;
      createNotificationsDto.bodyId = bodyin;
      createNotificationsDto.active = true;
      createNotificationsDto.flowIsDone = true;
      createNotificationsDto.createdAt = date;
      createNotificationsDto.updatedAt = date;
      createNotificationsDto.sendNotifChallenge = timesend;

      if (type == "PEMENANG" || type == "BERAKHIR") {
        createNotificationsDto.contentEventID = payload.data.challengeSession;
      }
      else {
        createNotificationsDto.contentEventID = null;
      }
      createNotificationsDto.senderOrReceiverInfo = senderreceiver;


      if (postID_ != undefined) {
        createNotificationsDto.postID = postID_;
      }
      if (postID_ != undefined) {
        createNotificationsDto.postType = postType;
      }
      if (type == "PEMENANG") {
        createNotificationsDto.actionButtons = "true";
      }
      else {
        createNotificationsDto.actionButtons = null;
      }

      console.log('notif: ' + JSON.stringify(createNotificationsDto));
      await this.notificationsService.create(createNotificationsDto);


    }
  }

  async sendFcmPushNotif(email: string, titlein: string, bodyin: any, titleen: string, bodyen: any, eventType: string, event: string, url: string, idtemplate: string) {
    var emailuserbasic = null;
    var datadevice = null;
    var languages = null;
    var payload = null;
    var payloadios = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var idprofilepict = null;
    var profilepict = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var dtstring = dt.toISOString();
    var splitdt = dtstring.split(".");
    var date = splitdt[0].replace("T", " ");
    var mediaprofilepicts = null;
    var bodypayload = null;
    let createNotificationsDto = new CreateNotificationsDto();

    const datauserbasicsService = await this.basic2SS.findBymail(
      email
    );
    if (await this.ceckData(datauserbasicsService)) {
      emailuserbasic = datauserbasicsService.email;

      try {
        profilepict = datauserbasicsService.profilePict;
        idprofilepict = profilepict.oid;
        mediaprofilepicts = await this.mediaprofilepictsService.findOne(idprofilepict);
      } catch (e) {
        mediaprofilepicts = null;
      }
      // const user_userAuth = await this.userauthsService.findOne(
      //   emailuserbasic
      // );

      var mediaUri = null;
      var mediaBasePath = null;
      var mediaType = null;
      var mediaEndpoint = null;
      var regSrc = null;
      var title = null;
      if (mediaprofilepicts != null) {
        mediaUri = mediaprofilepicts.mediaUri;
      }

      let result = null;
      if (mediaUri != null) {
        result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
      }
      if (mediaprofilepicts != null) {
        if (mediaprofilepicts.mediaBasePath != null) {
          mediaBasePath = mediaprofilepicts.mediaBasePath;
        }

        if (mediaprofilepicts.mediaUri != null) {
          mediaUri = mediaprofilepicts.mediaUri;
        }

        if (mediaprofilepicts.mediaType != null) {
          mediaType = mediaprofilepicts.mediaType;
        }
      }

      if (result != null) {
        mediaEndpoint = result;
      }

      var senderreceiver = {
        fullName: datauserbasicsService.fullName,
        avatar: {
          mediaBasePath: mediaBasePath,
          mediaUri: mediaUri,
          mediaType: mediaType,
          mediaEndpoint: mediaEndpoint
        },
        username: datauserbasicsService.username.toString()
      };
      try {
        languages = datauserbasicsService.languages;
        idlanguages = languages.oid.toString();
        datalanguage = await this.languagesService.findOne(idlanguages)
        langIso = datalanguage.langIso;

        console.log(idlanguages)
      } catch (e) {
        languages = null;
        idlanguages = "";
        datalanguage = null;
        langIso = "";
      }
      if (langIso === "id") {

        payload = {
          data: {

            title: titlein,
            body: bodyin,
            url: url,
          }
        }


      }
      else if (langIso === "en") {

        payload = {
          data: {

            title: titleen,
            body: bodyen,
            url: url,
          }
        }
      } else {
        payload = {
          data: {

            title: titlein,
            body: bodyin,
            url: url,
          }
        }
      }
      var option = {
        priority: "high",
        contentAvailable: true
      }

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> payload', JSON.stringify(payload));


      var arraydevice = [];
      var arrStatusDevice = [];
      var objDevice = null;
      datadevice = await this.userdevicesService.findActive(emailuserbasic);
      for (var i = 0; i < datadevice.length; i++) {
        var deviceid = datadevice[i].deviceID;
        var adm = await admin.messaging().sendToDevice(deviceid, payload, option);
        console.log(adm);
        if (adm.successCount > 0) {
          objDevice = {

            "device": deviceid,
            "status": "SEND"
          }
        } else {
          objDevice = {

            "device": deviceid,
            "status": "NOTSEND"
          }
        }

        arraydevice.push(deviceid);
        arrStatusDevice.push(objDevice);

      }
      var generateID = await this.generateId();
      createNotificationsDto._id = generateID;
      createNotificationsDto.notificationID = generateID;
      createNotificationsDto.email = emailuserbasic;
      createNotificationsDto.eventType = eventType;
      createNotificationsDto.event = event;
      createNotificationsDto.mate = emailuserbasic;
      createNotificationsDto.devices = arraydevice;
      createNotificationsDto.title = payload.data.title;
      createNotificationsDto.body = bodyen;
      createNotificationsDto.bodyId = bodyin;
      createNotificationsDto.active = true;
      createNotificationsDto.flowIsDone = true;
      createNotificationsDto.createdAt = date;
      createNotificationsDto.updatedAt = date;
      createNotificationsDto.statusDevices = arrStatusDevice;
      createNotificationsDto.actionButtons = null;
      createNotificationsDto.contentEventID = null;
      createNotificationsDto.senderOrReceiverInfo = senderreceiver;
      if(event != "CREDIT")
      {
        createNotificationsDto.templateID = new Types.ObjectId(idtemplate);
      }


      if (url != undefined) {
        createNotificationsDto.actionButtons = url;
      }


      console.log('notif: ' + JSON.stringify(createNotificationsDto));
      await this.notificationsService.create(createNotificationsDto);

    }
  }

  async getIdUserByToken(head: any): Promise<Userbasicnew> {
    var token = ((head['x-auth-token']).split(" "))[1];
    var data = await this.jwtService.decode(token);
    if (data != undefined) {
      if (data['email'] != undefined) {
        const Userbasic_: Userbasicnew = await this.basic2SS.findBymail(data['email'])
        return Userbasic_;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async generateTransactionCode(Platform: string, categoryProduct: string, codeProduct: string, No: number) {
    let TransactionCode = "";

    //Year Code
    const CurrentDate = new Date();
    const Year = CurrentDate.getFullYear();

    //Platform Code
    let PlatformCode = "UNKNOWN";
    if (Platform == "App") {
      PlatformCode = "APP";
    } else if (Platform == "Business") {
      PlatformCode = "BUS";
    } else if (Platform == "Console") {
      PlatformCode = "CON";
    }else{
      PlatformCode = "UNKNOWN";
    }

    //Category Code
    if (categoryProduct == "PBC" || 
      categoryProduct == "PNC" ||
      categoryProduct == "PTC" ||
      categoryProduct == "RFN" ||
      categoryProduct == "PGC" ||
      categoryProduct == "PGH" ||
      categoryProduct == "PMC" ||
      categoryProduct == "PCM" ||
      categoryProduct == "PCR" ||
      categoryProduct == "PCH" ||
      categoryProduct == "PCB" ||
      categoryProduct == "PCN" ||
      categoryProduct == "UPH"){
      categoryProduct = categoryProduct;
    }else{
      categoryProduct = "UNKNOWN";
    }

    //Product Code
    if (codeProduct == "NN" || 
      codeProduct == "CO" ||
      codeProduct == "CM" ||
      codeProduct == "BP" ||
      codeProduct == "CN" ||
      codeProduct == "CR" ||
      codeProduct == "GF" ||
      codeProduct == "AD") {
      codeProduct = codeProduct;
    } else {
      codeProduct = "UNKNOWN";
    }

    //Transaction Code
    let TransactionNumber = "UNKNOWN"
    if ((No.toString().length) == 6) {
      TransactionNumber += No.toString();
    } else if ((No.toString().length) == 5) {
      TransactionNumber += "0" + No.toString();
    } else if ((No.toString().length) == 4) {
      TransactionNumber += "00" + No.toString();
    } else if ((No.toString().length) == 3) {
      TransactionNumber += "000" + No.toString();
    } else if ((No.toString().length) == 2) {
      TransactionNumber += "0000" + No.toString();
    } else if ((No.toString().length) == 1) {
      TransactionNumber += "00000" + No.toString();
    }

    TransactionCode += Year.toString() + "/" + PlatformCode + "/" + categoryProduct + "/" + TransactionNumber;
    return TransactionCode;
  }
}

