import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserbasicsnewService } from '../trans/newuserbasic/userbasicsnew.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { CountriesService } from '../infra/countries/countries.service';
import { AreasService } from '../infra/areas/areas.service';
import { LanguagesService } from '../infra/languages/languages.service';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { InsightsService } from '../content/insights/insights.service';
import { InterestsService } from '../infra/interests/interests.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { ActivityeventsService } from '../trans/activityevents/activityevents.service';
import { CreateUserdeviceDto } from '../trans/userdevices/dto/create-userdevice.dto';
import { CreateActivityeventsDto } from '../trans/activityevents/dto/create-activityevents.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Double, Int32, ObjectId } from 'mongodb';
import { UtilsService } from '../utils/utils.service';
import { ErrorHandler } from '../utils/error.handler';
import { Templates } from '../infra/templates/schemas/templates.schema';
import { CreateUserbasicDto } from '../trans/userbasics/dto/create-userbasic.dto';
import { CreateUserauthDto } from '../trans/userauths/dto/create-userauth.dto';
import { CreateInsightsDto } from '../content/insights/dto/create-insights.dto';
import { CitiesService } from '../infra/cities/cities.service';
import { ReferralService } from '../trans/referral/referral.service';
import { CreateReferralDto } from '../trans/referral/dto/create-referral.dto';
import mongoose from 'mongoose';
import { SeaweedfsService } from '../stream/seaweedfs/seaweedfs.service';
import { AdsUserCompareService } from '../trans/ads/adsusercompare/adsusercompare.service';
import { Long } from 'mongodb';
import * as fs from 'fs';
import { ContenteventsService } from '../content/contentevents/contentevents.service';
import { CreateContenteventsDto } from '../content/contentevents/dto/create-contentevents.dto';
import { CreateGetcontenteventsDto } from '../trans/getusercontents/getcontentevents/dto/create-getcontentevents.dto';
import { CreateUserbasicnewDto } from '../trans/newuserbasic/dto/create-userbasicnew.dto';
import { PostsService } from '../content/posts/posts.service';
import { AuthService } from './auth.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { ConfigService } from '@nestjs/config';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateuserbasicnewDto } from 'src/trans/userbasicnew/dto/Createuserbasicnew-dto';
@Injectable()
export class SocmedService {

  private readonly logger = new Logger(SocmedService.name);

  constructor(
    private userbasicsnewService: UserbasicnewService,
    private userauthsService: UserauthsService,
    private jwtService: JwtService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private countriesService: CountriesService,
    private languagesService: LanguagesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    private authService: AuthService,
    private interestsRepoService: InterestsRepoService,
    private activityeventsService: ActivityeventsService,
    private areasService: AreasService,
    private utilsService: UtilsService,
    private errorHandler: ErrorHandler,
    private citiesService: CitiesService,
    private referralService: ReferralService,
    private seaweedfsService: SeaweedfsService,
    private adsUserCompareService: AdsUserCompareService,
    private contenteventsService: ContenteventsService,
    private postsService: PostsService,
    private readonly logapiSS: LogapisService,
    private readonly configService: ConfigService,
  ) { }

  async signupsosmed(req: any, headers: any) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/user/signup/socmed';
    var reqbody = JSON.parse(JSON.stringify(req.body));

    this.logger.log("signupsosmedv2 >>> start: ");
    console.log("signupsosmedv2 >>> PARAM: " + JSON.stringify(req.body));
    var user_email = null;
    var user_socmedSource = null;
    var user_deviceId = null;
    var user_langIso = null;
    var user_referral = null;
    var user_devicetype = null;
    var user_imei = null;

    if (req.body.email == undefined) {

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


      await this.errorHandler.generateNotAcceptableException(
        'Email is mandatory',
      );
    } else {
      if (req.body.email == '') {

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


        await this.errorHandler.generateNotAcceptableException(
          'Email is mandatory',
        );
      } else {
        user_email = req.body.email;
      }
    }

    if (req.body.socmedSource == undefined) {

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Socmed is mandatory',
      );
    } else {
      if (req.body.socmedSource == '') {

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Socmed is mandatory',
        );
      } else {
        user_socmedSource = req.body.socmedSource;
      }
    }

    if (req.body.deviceId != undefined) {
      user_deviceId = req.body.deviceId;
    }

    if (req.body.langIso != undefined) {
      user_langIso = req.body.langIso;
    }

    if (req.body.referral != undefined) {
      user_referral = req.body.referral;
    }

    if (req.body.devicetype != undefined) {
      user_devicetype = req.body.devicetype;
    }

    if (req.body.imei != undefined) {
      user_imei = req.body.imei;
    }

    if (!(await this.utilsService.validasiEmail(user_email.trim()))) {

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Invalid email format'],
        },
      });
    }

    var current_date = await this.utilsService.getDateTimeString();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';
    var _class_UserAuths = 'io.melody.core.domain.UserAuth';
    var _class_UserProfile = 'io.melody.core.domain.UserProfile';
    var _class_Referral = 'io.melody.core.domain.Referral';

    var type = '';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var CurrentTarget = '';

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User Userauths
    const datauserauthsService = await this.userauthsService.findOneByEmail(
      user_email,
    );

    //Ceck User Userdevices
    const datauserdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

    if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datauserauthsService))) {
      type = 'LOGIN';
      if (datauserauthsService.isEmailVerified != undefined) {
        this.userauthsService.updatebyId(datauserauthsService._id.toString(), { isEmailVerified: true, loginSource: user_socmedSource });
      }

      //Ceck User Userdevices
      const user_userdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

      //Ceck User ActivityEvent Parent
      var user_activityevents = null;
      if (user_deviceId != null) {
        user_activityevents =
          await this.activityeventsService.findParent(
            user_email,
            user_deviceId,
            type,
            false,
          );
      } else {
        user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );
      }

      //Ceck User jwtrefresh token
      const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
        user_email,
      );

      if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datajwtrefreshtoken))) {
        var ID_user_userdevicesService = null;
        var id_Activityevents_parent = new mongoose.Types.ObjectId();
        var id_Activityevents_child = new mongoose.Types.ObjectId();

        var ID_parent_ActivityEvent = (
          await this.utilsService.generateId()
        ).toLowerCase();
        var ID_child_ActivityEvent = (
          await this.utilsService.generateId()
        ).toLowerCase();

        if (Object.keys(user_activityevents).length > 0) {
          //Create ActivityEvent child
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'INITIAL';
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              user_activityevents[0].activityEventID;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent child


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );


          } catch (error) {

            var timestamps_end = await this.utilsService.getDateTimeString();

            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error:' + error,
            );
          }

          //Update ActivityEvent Parent
          try {
            const data_transitions = user_activityevents[0].transitions;
            data_transitions.push({
              $ref: 'activityevents',
              $id: new Object(ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            });

            //Update ActivityEvent Parent
            const update_activityevents_parent =
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
          } catch (error) {

            var timestamps_end = await this.utilsService.getDateTimeString();

            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Activity events Parent. Error:' +
              error,
            );
          }
        } else {
          //Create ActivityEvent Parent
          try {
            var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
            data_CreateActivityeventsDto_parent.event = 'LOGIN';
            data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_parent.createdAt = current_date;
            data_CreateActivityeventsDto_parent.updatedAt = current_date;
            data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
            data_CreateActivityeventsDto_parent.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_parent.transitions = [
              {
                $ref: 'activityevents',
                $id: Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              },
            ];
            data_CreateActivityeventsDto_parent.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_parent,
            );


          } catch (error) {

            var timestamps_end = await this.utilsService.getDateTimeString();

            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Parent. Error:' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'INITIAL';
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );


          } catch (error) {

            var timestamps_end = await this.utilsService.getDateTimeString();

            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error:' + error,
            );
          }

          //Userdevices != null
          if (req.body.deviceId != undefined) {
            if (await this.utilsService.ceckData(datauserdevicesService)) {
              //Get Userdevices
              try {
                await this.userdevicesService.updatebyEmail(
                  user_email,
                  user_deviceId,
                  {
                    active: true,
                  },
                );
                ID_device = datauserdevicesService._id;
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Get Userdevices. Error:' + error,
                );
              }
            } else {
              //Create Userdevices
              try {
                var data_CreateUserdeviceDto = new CreateUserdeviceDto();
                ID_device = (await this.utilsService.generateId()).toLowerCase();
                data_CreateUserdeviceDto._id = ID_device;
                data_CreateUserdeviceDto.deviceID = user_deviceId;
                data_CreateUserdeviceDto.email = user_email;
                data_CreateUserdeviceDto.active = true;
                data_CreateUserdeviceDto._class = _class_UserDevices;
                data_CreateUserdeviceDto.createdAt = current_date;
                data_CreateUserdeviceDto.updatedAt = current_date;
                //Insert User Userdevices
                await this.userdevicesService.create(data_CreateUserdeviceDto);
              } catch (error) {

                var timestamps_end = await this.utilsService.getDateTimeString();

                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Userdevices. Error:' + error,
                );
              }
            }
          }

          //Update Devices Userauths
          try {
            //Get Devices Userauths
            const datauserauthsService_devices = datauserauthsService.devices;

            //Filter ID_user_userdevicesService Devices UserDevices
            var filteredData = datauserauthsService_devices.filter(function (
              datauserauthsService_devices,
            ) {
              return (
                JSON.parse(JSON.stringify(datauserauthsService_devices)).$id ===
                ID_user_userdevicesService
              );
            });

            if (filteredData.length == 0) {
              //Pust Devices Userauths
              datauserauthsService_devices.push({
                $ref: 'userdevices',
                $id: Object(ID_user_userdevicesService),
                $db: 'hyppe_trans_db',
              });

              await this.userauthsService.updatebyEmail(user_email, {
                devices: datauserauthsService_devices,
              });
            }
          } catch (error) {

            var timestamps_end = await this.utilsService.getDateTimeString();

            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Devices Userauths. Error:' + error,
            );
          }
        }

        var token = (
          await this.utilsService.generateToken(user_email, user_deviceId)
        ).toString();

        //Ceck User jwtrefresh token
        const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
          user_email,
        );

        var user_interest = [];
        let ins = datauserbasicsService.userInterests;
        if (ins != undefined && ins.length > 0) {
          for (let i = 0; i < ins.length; i++) {
            let idx = ins[i];
            let ns = idx.namespace;
            let oid = idx.oid;
            let inss = await this.interestsRepoService.findOne(String(oid));
            user_interest.push(inss);
          }
        }

        var vesion = await this.utilsService.getversion();


        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        let arrayTutor = [];
        if (datauserbasicsService.tutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.utilsService.getSettingMixed(SETTING_TUTOR);
          if (await this.utilsService.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(datauserbasicsService.tutor)) {
              if (getSettingTutor.value.length == datauserbasicsService.tutor.length) {
                arrayTutor = datauserbasicsService.tutor;
                let arraySetting = getSettingTutor.value;
                var data_ii = await Promise.all(arrayTutor.map(async (item, index) => {
                  console.log();
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
                arrayTutor = data_ii;
              }
            }
          }
        }
        return {
          response_code: 202,
          data: {
            idProofNumber: "ID",
            roles: [
              "ROLE_USER"
            ],
            fullName: username_,
            isIdVerified: "false",
            isEmailVerified: "true",
            token: "Bearer " + token,
            idProofStatus: "IN_PROGRESS",
            painsight: {
              shares: new Double(0),
              followers: new Double(0),
              comments: new Double(0),
              followings: new Double(0),
              reactions: new Double(0),
              posts: new Double(0),
              views: new Double(0),
              likes: new Double(0)
            },
            interest: user_interest,
            event: "UPDATE_BIO",
            email: user_email,
            username: username_,
            iduser: String(datauserbasicsService._id),
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id,
            tutor: arrayTutor
          },
          version: vesion,
          version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(),
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Login successful'],
          },
        };
      } else {

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'User not found',
        );
      }
    } else {

      type = 'ENROL';
      CurrentStatus = 'INITIAL';
      CurrentEvent = 'SIGN_UP';
      CurrentTarget = 'IN_PROGRESS';

      //Ceck User ActivityEvent Parent
      var dataactivityevents = null;
      if (user_deviceId != null) {
        dataactivityevents = await this.activityeventsService.findParent(user_email, user_deviceId, type, false);
      } else {
        dataactivityevents = await this.activityeventsService.findParentWitoutDevice(user_email, type, false,);
      }

      if (!(await this.utilsService.ceckData(dataactivityevents))) {
        var user_interest = [];
        var ID_device = null;
        var ID_insights = null;
        var username_ = await this.utilsService.generateUsername(user_email);
        var id_user_langIso = null;

        var mongoose_gen_id_user_auth = new mongoose.Types.ObjectId();
        var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

        //Get Id Language
        if (req.body.langIso != undefined) {
          try {
            if (user_langIso != undefined) {
              if (user_langIso != null) {
                var data_language = await this.languagesService.findOneLangiso(
                  user_langIso,
                );
                if (await this.utilsService.ceckData(data_language)) {
                  id_user_langIso = data_language._id;
                }
              }
            }
          } catch (error) {

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Language. Error: ' + error,
            );
          }
        }

        //Create Insights
        try {
          var data_CreateInsightsDto = new CreateInsightsDto();
          ID_insights = (await this.utilsService.generateId()).toLowerCase();
          data_CreateInsightsDto._id = ID_insights;
          data_CreateInsightsDto.insightID = ID_insights;
          data_CreateInsightsDto.active = true;
          data_CreateInsightsDto.createdAt = current_date;
          data_CreateInsightsDto.updatedAt = current_date;
          data_CreateInsightsDto.email = user_email;
          data_CreateInsightsDto.followers = Long.fromString('0');
          data_CreateInsightsDto.followings = Long.fromString('0');
          data_CreateInsightsDto.unfollows = Long.fromString('0');
          data_CreateInsightsDto.likes = Long.fromString('0');
          data_CreateInsightsDto.views = Long.fromString('0');
          data_CreateInsightsDto.comments = Long.fromString('0');
          data_CreateInsightsDto.posts = Long.fromString('0');
          data_CreateInsightsDto.shares = Long.fromString('0');
          data_CreateInsightsDto.reactions = Long.fromString('0');
          data_CreateInsightsDto._class =
            'io.melody.hyppe.content.domain.Insight';

          //Insert Insights
          await this.insightsService.create(data_CreateInsightsDto);
        } catch (error) {

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Insights. Error: ' + error,
          );
        }

        //Userdevices != null
        if (req.body.deviceId != undefined) {
          if (await this.utilsService.ceckData(datauserdevicesService)) {
            //Get Userdevices
            try {
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: true,
                },
              );
              ID_device = datauserdevicesService._id;
            } catch (error) {

              var timestamps_end = await this.utilsService.getDateTimeString();
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Get Userdevices. Error:' + error,
              );
            }
          } else {
            //Create Userdevices
            try {
              var data_CreateUserdeviceDto = new CreateUserdeviceDto();
              ID_device = (await this.utilsService.generateId()).toLowerCase();
              data_CreateUserdeviceDto._id = ID_device;
              data_CreateUserdeviceDto.deviceID = user_deviceId;
              data_CreateUserdeviceDto.email = user_email;
              data_CreateUserdeviceDto.active = true;
              data_CreateUserdeviceDto._class = _class_UserDevices;
              data_CreateUserdeviceDto.createdAt = current_date;
              data_CreateUserdeviceDto.updatedAt = current_date;
              //Insert User Userdevices
              await this.userdevicesService.create(data_CreateUserdeviceDto);
            } catch (error) {

              var timestamps_end = await this.utilsService.getDateTimeString();
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Userdevices. Error:' + error,
              );
            }
          }
        }

        //Create UserAuth
        var pass_gen = await this.utilsService.generatePassword('HyppeNew');
        try {
          var data_CreateUserauthDto = new CreateUserauthDto();
          var ID_user = (await this.utilsService.generateId()).toLowerCase();
          data_CreateUserauthDto._id = mongoose_gen_id_user_auth;
          data_CreateUserauthDto.username = username_;
          data_CreateUserauthDto.password = pass_gen;
          data_CreateUserauthDto.userID = ID_user;
          data_CreateUserauthDto.email = user_email;
          data_CreateUserauthDto.createdAt = current_date;
          data_CreateUserauthDto.updatedAt = current_date;
          data_CreateUserauthDto.regSrc = 'iOS';
          data_CreateUserauthDto.isExpiryPass = false;
          data_CreateUserauthDto.isEmailVerified = true;
          data_CreateUserauthDto.isEnabled = true;
          data_CreateUserauthDto.isAccountNonExpired = true;
          data_CreateUserauthDto.isAccountNonLocked = true;
          data_CreateUserauthDto.isCredentialsNonExpired = true;
          data_CreateUserauthDto.roles = ['ROLE_USER'];
          data_CreateUserauthDto._class = _class_UserAuths;
          data_CreateUserauthDto.loginSource = user_socmedSource;
          data_CreateUserauthDto.devices = [
            {
              $ref: 'userdevices',
              $id: ID_device,
              $db: 'hyppe_trans_db',
            },
          ];

          //Insert UserAuth
          await this.userauthsService.create(data_CreateUserauthDto);
        } catch (error) {

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create UserAuth. Error: ' + error,
          );
        }

        let arrayTutor = [
          {
            key: "protection",
            status: false
          },
          {
            key: "sell",
            status: false
          },
          {
            key: "interest",
            status: false
          },
          {
            key: "ownership",
            status: false
          },
          {
            key: "boost",
            status: false
          },
          {
            key: "transaction",
            status: false
          },
          {
            key: "idRefferal",
            status: false
          },
          {
            key: "shareRefferal",
            status: false
          },
          {
            key: "codeRefferal",
            status: false
          }
        ];
        //Create UserBasic
        try {
          var data_CreateUserbasicDto = new CreateUserbasicDto();
          var gen_profileID = (await this.utilsService.generateId()).toLowerCase();
          data_CreateUserbasicDto._id = mongoose_gen_id_user_basic;
          data_CreateUserbasicDto.profileID = gen_profileID;
          data_CreateUserbasicDto.email = user_email;
          data_CreateUserbasicDto.fullName = username_;
          data_CreateUserbasicDto.status = CurrentStatus;
          data_CreateUserbasicDto.event = CurrentEvent;
          data_CreateUserbasicDto.isComplete = false;
          data_CreateUserbasicDto.isCelebrity = false;
          data_CreateUserbasicDto.isIdVerified = false;
          data_CreateUserbasicDto.isPrivate = false;
          data_CreateUserbasicDto.isFollowPrivate = false;
          data_CreateUserbasicDto.isPostPrivate = false;
          data_CreateUserbasicDto.createdAt = current_date;
          data_CreateUserbasicDto.updatedAt = current_date;
          data_CreateUserbasicDto.statusKyc = 'unverified';
          //data_CreateUserbasicDto.tutor = arrayTutor;
          data_CreateUserbasicDto.insight = {
            $ref: 'insights',
            $id: ID_insights,
            $db: 'hyppe_content_db',
          };
          if (mongoose_gen_id_user_auth != undefined || mongoose_gen_id_user_auth != null) {
            data_CreateUserbasicDto.userAuth = {
              $ref: 'userauths',
              $id: new ObjectId(mongoose_gen_id_user_auth._id.toString()),
              $db: 'hyppe_trans_db',
            };
          }
          if (id_user_langIso != null) {
            data_CreateUserbasicDto.languages = {
              $ref: 'languages',
              $id: id_user_langIso,
              $db: 'hyppe_infra_db',
            };
          }
          data_CreateUserbasicDto._class = _class_UserProfile;
          data_CreateUserbasicDto.creator = false;

          //Insert UserBasic
          await this.userbasicsService.create(data_CreateUserbasicDto);
        } catch (error) {

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create UserBasic. Error: ' + error,
          );
        }

        //Create ActivityEvent Parent SIGN_UP
        var mongoose_gen_id_Activityevents_parent = new mongoose.Types.ObjectId();
        var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
        var gen_ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        try {
          var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
          data_CreateActivityeventsDto_parent._id = mongoose_gen_id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = type;
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = CurrentStatus;
          data_CreateActivityeventsDto_parent.target = CurrentTarget;
          data_CreateActivityeventsDto_parent.event = CurrentEvent;
          data_CreateActivityeventsDto_parent.fork = undefined;
          data_CreateActivityeventsDto_parent.action = undefined;
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: undefined,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt = current_date;
          data_CreateActivityeventsDto_parent.updatedAt = current_date;
          data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
          data_CreateActivityeventsDto_parent.__v = undefined;
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.transitions = [
            {
              $ref: 'activityevents',
              $id: Object(gen_ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            },
          ];
          data_CreateActivityeventsDto_parent.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );


        } catch (error) {

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error: ' +
            error,
          );
        }

        //Referral
        // if (user_referral != null && user_referral.length > 0) {
        //   //Ceck User Userbasics Parent
        //   const datauserbasicsService_parent = await this.userbasicsService.findOne(
        //     user_referral,
        //   );
        //   if (await this.utilsService.ceckData(datauserbasicsService_parent)) {

        //     //Ceck User Referral parent children
        //     const data_referral_parent_children = await this.referralService.findAllByParentChildren(
        //       user_referral, user_email,
        //     );
        //     if (!(await this.utilsService.ceckData(data_referral_parent_children))) {
        //       //Insert Referral
        //       try {
        //         var CreateReferralDto_ = new CreateReferralDto();
        //         CreateReferralDto_._id = (await this.utilsService.generateId()).toLowerCase();
        //         CreateReferralDto_.parent = user_referral;
        //         CreateReferralDto_.children = user_email;
        //         if (user_imei != null) {
        //           CreateReferralDto_.imei = user_imei;
        //         }
        //         CreateReferralDto_.active = true;
        //         CreateReferralDto_.verified = true;
        //         CreateReferralDto_.createdAt = current_date;
        //         CreateReferralDto_.updatedAt = current_date;
        //         CreateReferralDto_._class = _class_Referral;

        //         this.referralService.create(CreateReferralDto_);

        //         var _id_2 = (await this.utilsService.generateId());
        //         var _id_4 = (await this.utilsService.generateId());

        //         var CreateContenteventsDto2 = new CreateContenteventsDto();
        //         CreateContenteventsDto2._id = _id_2
        //         CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        //         CreateContenteventsDto2.email = req.body.referral
        //         CreateContenteventsDto2.eventType = "FOLLOWER"
        //         CreateContenteventsDto2.active = true
        //         CreateContenteventsDto2.event = "ACCEPT"
        //         CreateContenteventsDto2.createdAt = current_date
        //         CreateContenteventsDto2.updatedAt = current_date
        //         CreateContenteventsDto2.sequenceNumber = 1
        //         CreateContenteventsDto2.flowIsDone = true
        //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        //         CreateContenteventsDto2.receiverParty = req.body.email

        //         var CreateContenteventsDto4 = new CreateContenteventsDto();
        //         CreateContenteventsDto4._id = _id_4
        //         CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
        //         CreateContenteventsDto4.email = req.body.email
        //         CreateContenteventsDto4.eventType = "FOLLOWING"
        //         CreateContenteventsDto4.active = true
        //         CreateContenteventsDto4.event = "ACCEPT"
        //         CreateContenteventsDto4.createdAt = current_date
        //         CreateContenteventsDto4.updatedAt = current_date
        //         CreateContenteventsDto4.sequenceNumber = 1
        //         CreateContenteventsDto4.flowIsDone = true
        //         CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
        //         CreateContenteventsDto4.senderParty = req.body.referral

        //         //await this.contenteventsService.create(CreateContenteventsDto1);
        //         await this.contenteventsService.create(CreateContenteventsDto2);
        //         //await this.contenteventsService.create(CreateContenteventsDto3);
        //         await this.contenteventsService.create(CreateContenteventsDto4);
        //         await this.insightsService.updateFollower(req.body.referral);
        //         await this.insightsService.updateFollowing(req.body.email);
        //       } catch (error) {

        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        //         await this.errorHandler.generateNotAcceptableException(
        //           'Unabled to proceed Create Refferal. Error:' +
        //           error,
        //         );
        //       }
        //     }
        //   }
        // }

        if (req.body.referral != undefined && req.body.imei != undefined) {

          if (req.body.referral != "" && req.body.imei != "") {
            var data_refferal = await this.referralService.findOneInChild(req.body.email);
            if (!(await this.utilsService.ceckData(data_refferal))) {
              var data_imei = await this.referralService.findOneInIme(req.body.imei);
              if (!(await this.utilsService.ceckData(data_imei))) {
                var CreateReferralDto_ = new CreateReferralDto();
                CreateReferralDto_._id = (await this.utilsService.generateId())
                CreateReferralDto_.parent = req.body.referral;
                CreateReferralDto_.children = req.body.email;
                CreateReferralDto_.active = true;
                CreateReferralDto_.verified = true;
                CreateReferralDto_.createdAt = current_date;
                CreateReferralDto_.updatedAt = current_date;
                CreateReferralDto_.imei = req.body.imei;
                CreateReferralDto_._class = "io.melody.core.domain.Referral";
                var insertdata = await this.referralService.create(CreateReferralDto_);

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
                CreateContenteventsDto2.email = req.body.referral
                CreateContenteventsDto2.eventType = "FOLLOWER"
                CreateContenteventsDto2.active = true
                CreateContenteventsDto2.event = "ACCEPT"
                CreateContenteventsDto2.createdAt = current_date
                CreateContenteventsDto2.updatedAt = current_date
                CreateContenteventsDto2.sequenceNumber = 1
                CreateContenteventsDto2.flowIsDone = true
                CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
                CreateContenteventsDto2.receiverParty = req.body.email

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
                CreateContenteventsDto4.email = req.body.email
                CreateContenteventsDto4.eventType = "FOLLOWING"
                CreateContenteventsDto4.active = true
                CreateContenteventsDto4.event = "ACCEPT"
                CreateContenteventsDto4.createdAt = current_date
                CreateContenteventsDto4.updatedAt = current_date
                CreateContenteventsDto4.sequenceNumber = 1
                CreateContenteventsDto4.flowIsDone = true
                CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
                CreateContenteventsDto4.senderParty = req.body.referral

                //await this.contenteventsService.create(CreateContenteventsDto1);
                await this.contenteventsService.create(CreateContenteventsDto2);
                //await this.contenteventsService.create(CreateContenteventsDto3);
                await this.contenteventsService.create(CreateContenteventsDto4);
                await this.insightsService.updateFollower(req.body.referral);
                await this.insightsService.updateFollowing(req.body.email);
              }
            }
          }
        }

        //Create Or Update refresh Token
        await this.authService.updateRefreshToken(user_email);

        //Ceck User Userdevices
        const user_userdevicesService = await this.userdevicesService.findOneEmail_(user_email);

        var token = (
          await this.utilsService.generateToken(user_email, user_userdevicesService.deviceID)
        ).toString();

        //Ceck User jwtrefresh token
        const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
          user_email,
        );

        this.userbasicsService.updatebyEmail(user_email, {
          status: 'IN_PROGRESS',
          event: 'UPDATE_BIO',
        });

        //Create ActivityEvent child IN_PROGRESS
        try {
          var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
          data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            gen_ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = type;
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'IN_PROGRESS';
          data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
          data_CreateActivityeventsDto_child.event = 'UPDATE_BIO';
          data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: undefined,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_child.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );


        } catch (error) {

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Child. Error: ' +
            error,
          );
        }

        //Create ActivityEvent Parent LOGIN
        var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
        var mongoose_gen_id_Activityevents_parent = new mongoose.Types.ObjectId();
        var gen_ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        try {
          data_CreateActivityeventsDto_parent._id = mongoose_gen_id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = 'INITIAL';
          data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
          data_CreateActivityeventsDto_parent.event = 'LOGIN';
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: current_date,
            login_device: user_userdevicesService.deviceID,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt = current_date;
          data_CreateActivityeventsDto_parent.updatedAt = current_date;
          data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.__v = undefined;
          data_CreateActivityeventsDto_parent.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );
        } catch (error) {

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error:' +
            error,
          );
        }


        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        if (arrayTutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.utilsService.getSettingMixed(SETTING_TUTOR);
          if (await this.utilsService.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(arrayTutor)) {
              if (getSettingTutor.value.length == arrayTutor.length) {
                let arraySetting = getSettingTutor.value;
                var data_i = await Promise.all(arrayTutor.map(async (item, index) => {
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
                arrayTutor = data_i;
              }
            }
          }
        }
        return {
          response_code: 202,
          data: {
            idProofNumber: "ID",
            roles: [
              "ROLE_USER"
            ],
            fullName: username_,
            isIdVerified: "false",
            isEmailVerified: "false",
            token: "Bearer " + token,
            idProofStatus: "IN_PROGRESS",
            insight: {
              shares: new Double(0),
              followers: new Double(0),
              comments: new Double(0),
              followings: new Double(0),
              reactions: new Double(0),
              posts: new Double(0),
              views: new Double(0),
              likes: new Double(0)
            },
            interest: user_interest,
            event: "UPDATE_BIO",
            email: user_email,
            username: username_,
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id,
            tutor: arrayTutor
          },
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Signup successful'],
          },
        };
      } else {

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Sorry! This email already registered',
        );
      }
    }
  }

  async newsignupsosmed(req: any, headers:any) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/user/signup/socmed/v2';
    var reqbody = JSON.parse(JSON.stringify(req.body));

    this.logger.log("signupsosmedv2 >>> start: ");
    console.log("signupsosmedv2 >>> PARAM: " + JSON.stringify(req.body));
    var user_email = null;
    var user_socmedSource = null;
    var user_deviceId = null;
    var user_langIso = null;
    var user_referral = null;
    var user_devicetype = null;
    var user_imei = null;

    if (req.body.email == undefined) {
      
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


      await this.errorHandler.generateNotAcceptableException(
        'Email is mandatory',
      );
    } else {
      if (req.body.email == '') {
        
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


        await this.errorHandler.generateNotAcceptableException(
          'Email is mandatory',
        );
      } else {
        user_email = req.body.email;
      }
    }

    if (req.body.socmedSource == undefined) {
      
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Socmed is mandatory',
      );
    } else {
      if (req.body.socmedSource == '') {
        
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Socmed is mandatory',
        );
      } else {
        user_socmedSource = req.body.socmedSource;
      }
    }

    if (req.body.deviceId != undefined) {
      user_deviceId = req.body.deviceId;
    }

    if (req.body.langIso != undefined) {
      user_langIso = req.body.langIso;
    }

    if (req.body.referral != undefined) {
      user_referral = req.body.referral;
    }

    if (req.body.devicetype != undefined) {
      user_devicetype = req.body.devicetype;
    }

    if (req.body.imei != undefined) {
      user_imei = req.body.imei;
    }

    if (!(await this.utilsService.validasiEmail(user_email.trim()))) {
      
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Invalid email format'],
        },
      });
    }

    var current_date = await this.utilsService.getDateTimeString();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';
    var _class_UserProfile = 'io.melody.core.domain.UserProfile';
    var _class_Referral = 'io.melody.core.domain.Referral';

    var type = '';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var CurrentTarget = '';

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsnewService.finddetail(
      user_email,
    );

    //Ceck User Userdevices
    const datauserdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

    if (await this.utilsService.ceckData(datauserbasicsService)){
      type = 'LOGIN';
      if (datauserbasicsService.isEmailVerified != undefined) {
        var updatedata = new CreateuserbasicnewDto();
        updatedata.isEmailVerified = true;
        updatedata.loginSource = user_socmedSource;
        updatedata.loginSrc = user_socmedSource;
        this.userbasicsnewService.update(datauserbasicsService._id.toString(), updatedata);
      }

      //Ceck User Userdevices
      const user_userdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

      //Ceck User ActivityEvent Parent
      var user_activityevents = null;
      if (user_deviceId != null) {
        user_activityevents =
          await this.activityeventsService.findParent(
            user_email,
            user_deviceId,
            type,
            false,
          );
      } else {
        user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );
      }

      //Ceck User jwtrefresh token
      const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
        user_email,
      );

      if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datajwtrefreshtoken))) {
        var ID_user_userdevicesService = null;
        var id_Activityevents_parent = new mongoose.Types.ObjectId();
        var id_Activityevents_child = new mongoose.Types.ObjectId();

        var ID_parent_ActivityEvent = (
          await this.utilsService.generateId()
        ).toLowerCase();
        var ID_child_ActivityEvent = (
          await this.utilsService.generateId()
        ).toLowerCase();

        if (Object.keys(user_activityevents).length > 0) {
          //Create ActivityEvent child
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'INITIAL';
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              user_activityevents[0].activityEventID;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            var updateactivityevent = new CreateuserbasicnewDto();
            updateactivityevent.userEvent = "LOGIN";
            updateactivityevent.event = "LOGIN";
            var konvert = datauserbasicsService._id;
            await this.userbasicsnewService.update(konvert.toString(), updateactivityevent);

            //Insert ActivityEvent child

            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );


          } catch (error) {
            
            var timestamps_end = await this.utilsService.getDateTimeString();
            
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error:' + error,
            );
          }

          //Update ActivityEvent Parent
          try {
            const data_transitions = user_activityevents[0].transitions;
            data_transitions.push({
              $ref: 'activityevents',
              $id: new Object(ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            });

            //Update ActivityEvent Parent
            const update_activityevents_parent =
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
          } catch (error) {
            
            var timestamps_end = await this.utilsService.getDateTimeString();
            
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Activity events Parent. Error:' +
              error,
            );
          }
        } else {
          //Create ActivityEvent Parent
          try {
            var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
            data_CreateActivityeventsDto_parent.event = 'LOGIN';
            data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_parent.createdAt = current_date;
            data_CreateActivityeventsDto_parent.updatedAt = current_date;
            data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
            data_CreateActivityeventsDto_parent.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_parent.transitions = [
              {
                $ref: 'activityevents',
                $id: Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              },
            ];
            data_CreateActivityeventsDto_parent.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent

            var updatedata = new CreateuserbasicnewDto();
            updatedata.event = "LOGIN";
            updatedata.userEvent = "LOGIN";
            this.userbasicsnewService.update(datauserbasicsService._id.toString(), updatedata);

            await this.activityeventsService.create(
              data_CreateActivityeventsDto_parent,
            );


          } catch (error) {
            
            var timestamps_end = await this.utilsService.getDateTimeString();
            
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Parent. Error:' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'INITIAL';
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent

            var updateactivityevent = new CreateuserbasicnewDto();
            updateactivityevent.userEvent = "LOGIN";
            updateactivityevent.event = "LOGIN";
            var konvert = datauserbasicsService._id;
            await this.userbasicsnewService.update(konvert.toString(), updateactivityevent);


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );


          } catch (error) {
            
            var timestamps_end = await this.utilsService.getDateTimeString();
            
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error:' + error,
            );
          }

          //Userdevices != null
          if (req.body.deviceId != undefined) {
            if (await this.utilsService.ceckData(datauserdevicesService)) {
              //Get Userdevices
              try {
                await this.userdevicesService.updatebyEmail(
                  user_email,
                  user_deviceId,
                  {
                    active: true,
                  },
                );
                ID_device = datauserdevicesService._id;
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Get Userdevices. Error:' + error,
                );
              }
            } else {
              //Create Userdevices
              try {
                var data_CreateUserdeviceDto = new CreateUserdeviceDto();
                ID_device = (await this.utilsService.generateId()).toLowerCase();
                data_CreateUserdeviceDto._id = ID_device;
                data_CreateUserdeviceDto.deviceID = user_deviceId;
                data_CreateUserdeviceDto.email = user_email;
                data_CreateUserdeviceDto.active = true;
                data_CreateUserdeviceDto._class = _class_UserDevices;
                data_CreateUserdeviceDto.createdAt = current_date;
                data_CreateUserdeviceDto.updatedAt = current_date;
                //Insert User Userdevices
                await this.userdevicesService.create(data_CreateUserdeviceDto);
              } catch (error) {
                
                var timestamps_end = await this.utilsService.getDateTimeString();
                
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Userdevices. Error:' + error,
                );
              }
            }
          }

          //Update Devices Userauths
          try {
            //Get Devices Userauths
            const datauserauthsService_devices = datauserbasicsService.authUsers.devices;

            //Filter ID_user_userdevicesService Devices UserDevices
            var filteredData = datauserauthsService_devices.filter(function (
              datauserauthsService_devices,
            ) {
              return (
                JSON.parse(JSON.stringify(datauserauthsService_devices)).$id ===
                ID_device
              );
            });
            
            if (filteredData.length == 0) {
              //Pust Devices Userauths
              datauserauthsService_devices.push({
                $ref: 'userdevices',
                $id: Object(ID_device),
                $db: 'hyppe_trans_db',
              });

              var updatedata = new CreateuserbasicnewDto();
              updatedata.authUsers = {
                "devices":datauserauthsService_devices
              };
              await this.userbasicsnewService.update(datauserbasicsService._id.toString(), updatedata);
            }
          } catch (error) {
            
            var timestamps_end = await this.utilsService.getDateTimeString();
            
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Devices Userauths. Error:' + error,
            );
          }
        }

        var token = (
          await this.utilsService.generateToken(user_email, user_deviceId)
        ).toString();

        //Ceck User jwtrefresh token
        const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
          user_email,
        );

        var user_interest = [];
        let ins = datauserbasicsService.userInterests;
        if (ins != undefined && ins.length > 0) {
          for (let i = 0; i < ins.length; i++) {
            let idx = ins[i];
            let ns = idx.namespace;
            let oid = idx.oid;
            let inss = await this.interestsRepoService.findOne(String(oid));
            user_interest.push(inss);
          }
        }

        var vesion = await this.utilsService.getversion();

        
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        let arrayTutor = [];
        if (datauserbasicsService.tutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.utilsService.getSettingMixed(SETTING_TUTOR);
          if (await this.utilsService.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(datauserbasicsService.tutor)) {
              if (getSettingTutor.value.length == datauserbasicsService.tutor.length) {
                arrayTutor = datauserbasicsService.tutor;
                let arraySetting = getSettingTutor.value;
                var data_ii = await Promise.all(arrayTutor.map(async (item, index) => {
                  console.log();
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
                arrayTutor = data_ii;
              }
            }
          }
        }
        return {
          response_code: 202,
          data: {
            idProofNumber: "ID",
            roles: [
              "ROLE_USER"
            ],
            fullName: username_,
            isIdVerified: (datauserbasicsService.statusKyc == "verified" ? 'true' : 'false'),
            isEmailVerified: "true",
            token: "Bearer " + token,
            idProofStatus: "IN_PROGRESS",
            painsight: {
              shares: new Double(0),
              followers: new Double(0),
              comments: new Double(0),
              followings: new Double(0),
              reactions: new Double(0),
              posts: new Double(0),
              views: new Double(0),
              likes: new Double(0)
            },
            interest: user_interest,
            avatar:datauserbasicsService.avatar,
            event: "UPDATE_BIO",
            email: user_email,
            username: username_,
            iduser: String(datauserbasicsService._id),
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id,
            tutor: arrayTutor,
            statusKyc: datauserbasicsService.statusKyc
          },
          version: vesion,
          version_ios : (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(),
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Login successful'],
          },
        };
      } else {
        
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'User not found',
        );
      }
    } else {

      type = 'ENROL';
      CurrentStatus = 'INITIAL';
      CurrentEvent = 'SIGN_UP';
      CurrentTarget = 'IN_PROGRESS';

      //Ceck User ActivityEvent Parent
      var dataactivityevents = null;
      if (user_deviceId != null) {
        dataactivityevents = await this.activityeventsService.findParent(user_email, user_deviceId, type, false);
      } else {
        dataactivityevents = await this.activityeventsService.findParentWitoutDevice(user_email, type, false,);
      }

      if (!(await this.utilsService.ceckData(dataactivityevents))) {
        var user_interest = [];
        var ID_device = null;
        var ID_insights = null;
        var username_ = await this.utilsService.generateUsername(user_email);
        var id_user_langIso = null;

        var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

        //Get Id Language
        if (req.body.langIso != undefined) {
          try {
            if (user_langIso != undefined) {
              if (user_langIso != null) {
                var data_language = await this.languagesService.findOneLangiso(
                  user_langIso,
                );
                if (await this.utilsService.ceckData(data_language)) {
                  id_user_langIso = data_language._id;
                }
              }
            }
          } catch (error) {
            
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Language. Error: ' + error,
            );
          }
        }

        //Create Insights
        try {
          var data_CreateInsightsDto = new CreateInsightsDto();
          ID_insights = (await this.utilsService.generateId()).toLowerCase();
          data_CreateInsightsDto._id = ID_insights;
          data_CreateInsightsDto.insightID = ID_insights;
          data_CreateInsightsDto.active = true;
          data_CreateInsightsDto.createdAt = current_date;
          data_CreateInsightsDto.updatedAt = current_date;
          data_CreateInsightsDto.email = user_email;
          data_CreateInsightsDto.followers = Long.fromString('0');
          data_CreateInsightsDto.followings = Long.fromString('0');
          data_CreateInsightsDto.unfollows = Long.fromString('0');
          data_CreateInsightsDto.likes = Long.fromString('0');
          data_CreateInsightsDto.views = Long.fromString('0');
          data_CreateInsightsDto.comments = Long.fromString('0');
          data_CreateInsightsDto.posts = Long.fromString('0');
          data_CreateInsightsDto.shares = Long.fromString('0');
          data_CreateInsightsDto.reactions = Long.fromString('0');
          data_CreateInsightsDto._class =
            'io.melody.hyppe.content.domain.Insight';

          //Insert Insights
          await this.insightsService.create(data_CreateInsightsDto);
        } catch (error) {
          
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Insights. Error: ' + error,
          );
        }

        //Userdevices != null
        if (req.body.deviceId != undefined) {
          if (await this.utilsService.ceckData(datauserdevicesService)) {
            //Get Userdevices
            try {
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: true,
                },
              );
              ID_device = datauserdevicesService._id;
            } catch (error) {
              
              var timestamps_end = await this.utilsService.getDateTimeString();
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Get Userdevices. Error:' + error,
              );
            }
          } else {
            //Create Userdevices
            try {
              var data_CreateUserdeviceDto = new CreateUserdeviceDto();
              ID_device = (await this.utilsService.generateId()).toLowerCase();
              data_CreateUserdeviceDto._id = ID_device;
              data_CreateUserdeviceDto.deviceID = user_deviceId;
              data_CreateUserdeviceDto.email = user_email;
              data_CreateUserdeviceDto.active = true;
              data_CreateUserdeviceDto._class = _class_UserDevices;
              data_CreateUserdeviceDto.createdAt = current_date;
              data_CreateUserdeviceDto.updatedAt = current_date;
              //Insert User Userdevices
              await this.userdevicesService.create(data_CreateUserdeviceDto);
            } catch (error) {
              
              var timestamps_end = await this.utilsService.getDateTimeString();
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Userdevices. Error:' + error,
              );
            }
          }
        }

        let arrayTutor = [
          {
            key: "protection",
            status: false
          },
          {
            key: "sell",
            status: false
          },
          {
            key: "interest",
            status: false
          },
          {
            key: "ownership",
            status: false
          },
          {
            key: "boost",
            status: false
          },
          {
            key: "transaction",
            status: false
          },
          {
            key: "idRefferal",
            status: false
          },
          {
            key: "shareRefferal",
            status: false
          },
          {
            key: "codeRefferal",
            status: false
          }
        ];
        //Create UserBasic
        try {

          var data_CreateUserbasicDto = new CreateuserbasicnewDto();
          var pass_gen = await this.utilsService.generatePassword('HyppeNew');
          var gen_profileID = (await this.utilsService.generateId()).toLowerCase();
          var ID_user = (await this.utilsService.generateId()).toLowerCase();
          data_CreateUserbasicDto._id = mongoose_gen_id_user_basic;
          data_CreateUserbasicDto.profileID = gen_profileID;
          data_CreateUserbasicDto.email = user_email;
          data_CreateUserbasicDto.fullName = username_;
          data_CreateUserbasicDto.username = username_;
          data_CreateUserbasicDto.password = pass_gen;
          data_CreateUserbasicDto.userID = ID_user;
          data_CreateUserbasicDto.status = CurrentStatus;
          data_CreateUserbasicDto.event = CurrentEvent;
          data_CreateUserbasicDto.regSrc = "IOS";
          data_CreateUserbasicDto.isExpiryPass = false;
          data_CreateUserbasicDto.isEmailVerified = true;
          data_CreateUserbasicDto.isEnabled = true;
          data_CreateUserbasicDto.isAccountNonExpired = true;
          data_CreateUserbasicDto.isAccountNonLocked = true;
          data_CreateUserbasicDto.isCredentialsNonExpired = true;
          data_CreateUserbasicDto.roles = ['ROLE_USER'];
          data_CreateUserbasicDto.isComplete = false;
          data_CreateUserbasicDto.loginSource = user_socmedSource;
          data_CreateUserbasicDto.loginSrc = user_socmedSource;
          data_CreateUserbasicDto.authUsers = {
            "devices":[
              {
                $ref: 'userdevices',
                $id: ID_device,
                $db: 'hyppe_trans_db',
              },
            ],
          };
          data_CreateUserbasicDto.isCelebrity = false;
          data_CreateUserbasicDto.isIdVerified = false;
          data_CreateUserbasicDto.isPrivate = false;
          data_CreateUserbasicDto.isFollowPrivate = false;
          data_CreateUserbasicDto.isPostPrivate = false;
          data_CreateUserbasicDto.createdAt = current_date;
          data_CreateUserbasicDto.updatedAt = current_date;
          data_CreateUserbasicDto.statusKyc = 'unverified';
          //data_CreateUserbasicDto.tutor = arrayTutor;
          data_CreateUserbasicDto.insight = {
            $ref: 'insights',
            $id: ID_insights,
            $db: 'hyppe_content_db',
          };
          if (id_user_langIso != null) {
            data_CreateUserbasicDto.languages = {
              $ref: 'languages',
              $id: id_user_langIso,
              $db: 'hyppe_infra_db',
            };
          }
          data_CreateUserbasicDto._class = _class_UserProfile;

          //Insert UserBasic
          await this.userbasicsnewService.create(data_CreateUserbasicDto);
        } catch (error) {
          
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create UserBasic. Error: ' + error,
          );
        }

        //Create ActivityEvent Parent SIGN_UP
        var mongoose_gen_id_Activityevents_parent = new mongoose.Types.ObjectId();
        var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
        var gen_ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        try {
          var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
          data_CreateActivityeventsDto_parent._id = mongoose_gen_id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = type;
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = CurrentStatus;
          data_CreateActivityeventsDto_parent.target = CurrentTarget;
          data_CreateActivityeventsDto_parent.event = CurrentEvent;
          data_CreateActivityeventsDto_parent.fork = undefined;
          data_CreateActivityeventsDto_parent.action = undefined;
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: undefined,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt = current_date;
          data_CreateActivityeventsDto_parent.updatedAt = current_date;
          data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
          data_CreateActivityeventsDto_parent.__v = undefined;
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.transitions = [
            {
              $ref: 'activityevents',
              $id: Object(gen_ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            },
          ];
          data_CreateActivityeventsDto_parent.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );


        } catch (error) {
          
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error: ' +
            error,
          );
        }

        var setreferral = null;
        var datareferral = null;

        /* 
          usernya ada 2 :
          dari awal emang pingin jadi user
          mualaf dari guest ke user
        */

        if(req.body.imei != undefined)
        {
          var data_imei = await this.referralService.findOneInIme(req.body.imei);
          var checkexistimei = await this.utilsService.ceckData(data_imei); 
          if(checkexistimei)
          {
            // untuk ngecek data ini pernah direplace ama user atau belum
            var getname = data_imei.children.search('hyppeguest.com');
            if(data_imei.status == "PENDING" && getname >= 0)
            {
              var updatereferral = new CreateReferralDto();
              updatereferral.children = req.body.email;

              await this.referralService.updateOne(data_imei._id.toString(), updatereferral);
            }
          }
          else if(req.body.referral != undefined && req.body.imei != undefined)
          {
            var data_refferal = await this.referralService.findOneInChild(req.body.email);
            var checkexistreferral = await this.utilsService.ceckData(data_refferal);
            if(checkexistreferral == false)
            {
                setreferral = req.body.referral;
              
                var CreateReferralDto_ = new CreateReferralDto();
                CreateReferralDto_._id = (await this.utilsService.generateId())
                CreateReferralDto_.parent = setreferral;
                CreateReferralDto_.children = req.body.email;
                CreateReferralDto_.active = true;
                CreateReferralDto_.verified = true;
                CreateReferralDto_.createdAt = current_date;
                CreateReferralDto_.updatedAt = current_date;
                CreateReferralDto_.imei = req.body.imei;
                CreateReferralDto_._class = "io.melody.core.domain.Referral";
                CreateReferralDto_.status = 'PENDING';

                datareferral = CreateReferralDto_;
                await this.referralService.create(CreateReferralDto_);
            }
          }
        }

        //Referral
        // if (user_referral != null && user_referral.length > 0) {
        //   //Ceck User Userbasics Parent
        //   const datauserbasicsService_parent = await this.userbasicsnewService.findbyemail(
        //     user_referral,
        //   );
        //   if (await this.utilsService.ceckData(datauserbasicsService_parent)) {

        //     //Ceck User Referral parent children
        //     const data_referral_parent_children = await this.referralService.findAllByParentChildren(
        //       user_referral, user_email,
        //     );
        //     if (!(await this.utilsService.ceckData(data_referral_parent_children))) {
        //       //Insert Referral
        //       try {
        //         var CreateReferralDto_ = new CreateReferralDto();
        //         CreateReferralDto_._id = (await this.utilsService.generateId()).toLowerCase();
        //         CreateReferralDto_.parent = user_referral;
        //         CreateReferralDto_.children = user_email;
        //         if (user_imei != null) {
        //           CreateReferralDto_.imei = user_imei;
        //         }
        //         CreateReferralDto_.active = true;
        //         CreateReferralDto_.verified = true;
        //         CreateReferralDto_.createdAt = current_date;
        //         CreateReferralDto_.updatedAt = current_date;
        //         CreateReferralDto_._class = _class_Referral;

        //         this.referralService.create(CreateReferralDto_);

        //         var _id_2 = (await this.utilsService.generateId());
        //         var _id_4 = (await this.utilsService.generateId());

        //         var CreateContenteventsDto2 = new CreateContenteventsDto();
        //         CreateContenteventsDto2._id = _id_2
        //         CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        //         CreateContenteventsDto2.email = req.body.referral
        //         CreateContenteventsDto2.eventType = "FOLLOWER"
        //         CreateContenteventsDto2.active = true
        //         CreateContenteventsDto2.event = "ACCEPT"
        //         CreateContenteventsDto2.createdAt = current_date
        //         CreateContenteventsDto2.updatedAt = current_date
        //         CreateContenteventsDto2.sequenceNumber = 1
        //         CreateContenteventsDto2.flowIsDone = true
        //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        //         CreateContenteventsDto2.receiverParty = req.body.email

        //         var CreateContenteventsDto4 = new CreateContenteventsDto();
        //         CreateContenteventsDto4._id = _id_4
        //         CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
        //         CreateContenteventsDto4.email = req.body.email
        //         CreateContenteventsDto4.eventType = "FOLLOWING"
        //         CreateContenteventsDto4.active = true
        //         CreateContenteventsDto4.event = "ACCEPT"
        //         CreateContenteventsDto4.createdAt = current_date
        //         CreateContenteventsDto4.updatedAt = current_date
        //         CreateContenteventsDto4.sequenceNumber = 1
        //         CreateContenteventsDto4.flowIsDone = true
        //         CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
        //         CreateContenteventsDto4.senderParty = req.body.referral

        //         //await this.contenteventsService.create(CreateContenteventsDto1);
        //         await this.contenteventsService.create(CreateContenteventsDto2);
        //         //await this.contenteventsService.create(CreateContenteventsDto3);
        //         await this.contenteventsService.create(CreateContenteventsDto4);
        //         await this.insightsService.updateFollower(req.body.referral);
        //         await this.insightsService.updateFollowing(req.body.email);
        //         await this.userbasicsnewService.updatefollowSystem(req.body.email, req.body.referral, "FOLLOWER");
        //         await this.userbasicsnewService.updatefollowSystem(req.body.referral, req.body.email, "FOLLOWING");
        //       } catch (error) {
                
        //         var timestamps_end = await this.utilsService.getDateTimeString();
        //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        //         await this.errorHandler.generateNotAcceptableException(
        //           'Unabled to proceed Create Refferal. Error:' +
        //           error,
        //         );
        //       }
        //     }
        //   }
        // }

        //Create Or Update refresh Token
        await this.authService.updateRefreshToken2(user_email);

        //Ceck User Userdevices
        const user_userdevicesService = await this.userdevicesService.findOneEmail_(user_email);

        var token = (
          await this.utilsService.generateToken(user_email, user_userdevicesService.deviceID)
        ).toString();

        //Ceck User jwtrefresh token
        const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
          user_email,
        );

        this.userbasicsService.updatebyEmail(user_email, {
          status: 'IN_PROGRESS',
          event: 'UPDATE_BIO',
        });

        //Create ActivityEvent child IN_PROGRESS
        try {
          var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
          data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            gen_ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = type;
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'IN_PROGRESS';
          data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
          data_CreateActivityeventsDto_child.event = 'UPDATE_BIO';
          data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: undefined,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_child.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );


        } catch (error) {
          
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Child. Error: ' +
            error,
          );
        }

        //Create ActivityEvent Parent LOGIN
        var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
        var mongoose_gen_id_Activityevents_parent = new mongoose.Types.ObjectId();
        var gen_ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        try {
          data_CreateActivityeventsDto_parent._id = mongoose_gen_id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = 'INITIAL';
          data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
          data_CreateActivityeventsDto_parent.event = 'LOGIN';
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: current_date,
            login_device: user_userdevicesService.deviceID,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt = current_date;
          data_CreateActivityeventsDto_parent.updatedAt = current_date;
          data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.__v = undefined;
          data_CreateActivityeventsDto_parent.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );
        } catch (error) {
          
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error:' +
            error,
          );
        }

        
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);
        
        if (arrayTutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.utilsService.getSettingMixed(SETTING_TUTOR);
          if (await this.utilsService.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(arrayTutor)) {
              if (getSettingTutor.value.length == arrayTutor.length) {
                let arraySetting = getSettingTutor.value;
                var data_i = await Promise.all(arrayTutor.map(async (item, index) => {
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
                arrayTutor = data_i;
              }
            }
          }
        }
        return {
          response_code: 202,
          data: {
            idProofNumber: "ID",
            roles: [
              "ROLE_USER"
            ],
            fullName: username_,
            isIdVerified: "false",
            isEmailVerified: "false",
            token: "Bearer " + token,
            idProofStatus: "IN_PROGRESS",
            insight: {
              shares: new Double(0),
              followers: new Double(0),
              comments: new Double(0),
              followings: new Double(0),
              reactions: new Double(0),
              posts: new Double(0),
              views: new Double(0),
              likes: new Double(0)
            },
            interest: user_interest,
            event: "UPDATE_BIO",
            email: user_email,
            username: username_,
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id,
            tutor: arrayTutor,
            statusKyc: data_CreateUserbasicDto.statusKyc
          },
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Signup successful'],
          },
        };
      } else {
        
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Sorry! This email already registered',
        );
      }
    }
  }

  async signupsosmed2(req: any) {
    this.logger.log("signupsosmedv2 >>> start: ");
    console.log("signupsosmedv2 >>> PARAM: " + JSON.stringify(req.body));
    var user_email = null;
    var user_socmedSource = null;
    var user_deviceId = null;
    var user_langIso = null;
    var user_referral = null;
    var user_devicetype = null;
    var user_imei = null;
    var uuid = null;
    var userUuid = null;

    if (req.body.email == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Email is mandatory',
      );
    } else {
      if (req.body.email == '') {
        await this.errorHandler.generateNotAcceptableException(
          'Email is mandatory',
        );
      } else {
        user_email = req.body.email;
      }
    }

    if (req.body.socmedSource == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Socmed is mandatory',
      );
    } else {
      if (req.body.socmedSource == '') {
        await this.errorHandler.generateNotAcceptableException(
          'Socmed is mandatory',
        );
      } else {
        user_socmedSource = req.body.socmedSource;
      }
    }

    if (req.body.deviceId != undefined) {
      user_deviceId = req.body.deviceId;
    }

    if (req.body.langIso != undefined) {
      user_langIso = req.body.langIso;
    }

    if (req.body.referral != undefined) {
      user_referral = req.body.referral;
    }

    if (req.body.devicetype != undefined) {
      user_devicetype = req.body.devicetype;
    }

    if (req.body.imei != undefined) {
      user_imei = req.body.imei;
    }


    if (req.body.uuid == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'uuid is mandatory',
      );
    } else {
      if (req.body.uuid == '') {
        await this.errorHandler.generateNotAcceptableException(
          'uuid is mandatory',
        );
      } else {
        uuid = req.body.uuid;
      }
    }

    if (!(await this.utilsService.validasiEmail(user_email.trim()))) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Invalid email format'],
        },
      });
    }

    var current_date = await this.utilsService.getDateTimeString();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';
    var _class_UserAuths = 'io.melody.core.domain.UserAuth';
    var _class_UserProfile = 'io.melody.core.domain.UserProfile';
    var _class_Referral = 'io.melody.core.domain.Referral';

    var type = '';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var CurrentTarget = '';

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User Userauths
    const datauserauthsService = await this.userauthsService.findOneByEmail(
      user_email,
    );

    //Ceck User Userdevices
    const datauserdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

    if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datauserauthsService))) {
      type = 'LOGIN';
      userUuid = datauserauthsService.uuid;
      if (datauserauthsService.isEmailVerified != undefined) {
        if (userUuid == undefined) {
          this.userauthsService.updatebyId(datauserauthsService._id.toString(), { isEmailVerified: true, loginSource: user_socmedSource, uuid: uuid });
        } else {
          this.userauthsService.updatebyId(datauserauthsService._id.toString(), { isEmailVerified: true, loginSource: user_socmedSource });
        }
      }

      //Ceck User Userdevices
      const user_userdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

      //Ceck User ActivityEvent Parent
      var user_activityevents = null;
      if (user_deviceId != null) {
        user_activityevents =
          await this.activityeventsService.findParent(
            user_email,
            user_deviceId,
            type,
            false,
          );
      } else {
        user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );
      }

      //Ceck User jwtrefresh token
      const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
        user_email,
      );

      if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datajwtrefreshtoken))) {
        var ID_user_userdevicesService = null;
        var id_Activityevents_parent = new mongoose.Types.ObjectId();
        var id_Activityevents_child = new mongoose.Types.ObjectId();

        var ID_parent_ActivityEvent = (
          await this.utilsService.generateId()
        ).toLowerCase();
        var ID_child_ActivityEvent = (
          await this.utilsService.generateId()
        ).toLowerCase();

        if (Object.keys(user_activityevents).length > 0) {
          //Create ActivityEvent child
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'INITIAL';
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              user_activityevents[0].activityEventID;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent child


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );


          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error:' + error,
            );
          }

          //Update ActivityEvent Parent
          try {
            const data_transitions = user_activityevents[0].transitions;
            data_transitions.push({
              $ref: 'activityevents',
              $id: new Object(ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            });

            //Update ActivityEvent Parent
            const update_activityevents_parent =
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Activity events Parent. Error:' +
              error,
            );
          }
        } else {
          //Create ActivityEvent Parent
          try {
            var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
            data_CreateActivityeventsDto_parent.event = 'LOGIN';
            data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_parent.createdAt = current_date;
            data_CreateActivityeventsDto_parent.updatedAt = current_date;
            data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
            data_CreateActivityeventsDto_parent.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_parent.transitions = [
              {
                $ref: 'activityevents',
                $id: Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              },
            ];
            data_CreateActivityeventsDto_parent.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_parent,
            );


          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Parent. Error:' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'INITIAL';
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: user_deviceId,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent


            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );


          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error:' + error,
            );
          }

          //Userdevices != null
          if (req.body.deviceId != undefined) {
            if (await this.utilsService.ceckData(datauserdevicesService)) {
              //Get Userdevices
              try {
                await this.userdevicesService.updatebyEmail(
                  user_email,
                  user_deviceId,
                  {
                    active: true,
                  },
                );
                ID_device = datauserdevicesService._id;
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Get Userdevices. Error:' + error,
                );
              }
            } else {
              //Create Userdevices
              try {
                var data_CreateUserdeviceDto = new CreateUserdeviceDto();
                ID_device = (await this.utilsService.generateId()).toLowerCase();
                data_CreateUserdeviceDto._id = ID_device;
                data_CreateUserdeviceDto.deviceID = user_deviceId;
                data_CreateUserdeviceDto.email = user_email;
                data_CreateUserdeviceDto.active = true;
                data_CreateUserdeviceDto._class = _class_UserDevices;
                data_CreateUserdeviceDto.createdAt = current_date;
                data_CreateUserdeviceDto.updatedAt = current_date;
                //Insert User Userdevices
                await this.userdevicesService.create(data_CreateUserdeviceDto);
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Userdevices. Error:' + error,
                );
              }
            }
          }

          //Update Devices Userauths
          try {
            //Get Devices Userauths
            const datauserauthsService_devices = datauserauthsService.devices;

            //Filter ID_user_userdevicesService Devices UserDevices
            var filteredData = datauserauthsService_devices.filter(function (
              datauserauthsService_devices,
            ) {
              return (
                JSON.parse(JSON.stringify(datauserauthsService_devices)).$id ===
                ID_user_userdevicesService
              );
            });

            if (filteredData.length == 0) {
              //Pust Devices Userauths
              datauserauthsService_devices.push({
                $ref: 'userdevices',
                $id: Object(ID_user_userdevicesService),
                $db: 'hyppe_trans_db',
              });

              await this.userauthsService.updatebyEmail(user_email, {
                devices: datauserauthsService_devices,
              });
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Devices Userauths. Error:' + error,
            );
          }
        }

        var token = (
          await this.utilsService.generateToken(user_email, user_deviceId)
        ).toString();

        //Ceck User jwtrefresh token
        const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
          user_email,
        );

        var user_interest = [];
        let ins = datauserbasicsService.userInterests;
        if (ins != undefined && ins.length > 0) {
          for (let i = 0; i < ins.length; i++) {
            let idx = ins[i];
            let ns = idx.namespace;
            let oid = idx.oid;
            let inss = await this.interestsRepoService.findOne(String(oid));
            user_interest.push(inss);
          }
        }

        var vesion = await this.utilsService.getversion();
        let arrayTutor = [];
        if (datauserbasicsService.tutor != undefined) {
          const SETTING_TUTOR = this.configService.get("SETTING_TUTOR");
          const getSettingTutor = await this.utilsService.getSettingMixed(SETTING_TUTOR);
          if (await this.utilsService.ceckData(getSettingTutor)) {
            if (Array.isArray(getSettingTutor.value) && Array.isArray(datauserbasicsService.tutor)) {
              if (getSettingTutor.value.length == datauserbasicsService.tutor.length) {
                arrayTutor = datauserbasicsService.tutor;
                let arraySetting = getSettingTutor.value;
                var data_ii = await Promise.all(arrayTutor.map(async (item, index) => {
                  console.log();
                  return {
                    "key": item.key,
                    "textID": arraySetting[index].textID,
                    "textEn": arraySetting[index].textEn,
                    "status": item.status,
                  }
                }));
                arrayTutor = data_ii;
              }
            }
          }
        }
        return {
          response_code: 202,
          data: {
            idProofNumber: "ID",
            roles: [
              "ROLE_USER"
            ],
            fullName: username_,
            isIdVerified: "false",
            isEmailVerified: "true",
            token: "Bearer " + token,
            idProofStatus: "IN_PROGRESS",
            painsight: {
              shares: new Double(0),
              followers: new Double(0),
              comments: new Double(0),
              followings: new Double(0),
              reactions: new Double(0),
              posts: new Double(0),
              views: new Double(0),
              likes: new Double(0)
            },
            interest: user_interest,
            event: "UPDATE_BIO",
            email: user_email,
            username: username_,
            iduser: String(datauserbasicsService._id),
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id,
            uuid: uuid
          },
          version: vesion,
          version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(),
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Login successful'],
          },
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'User not found',
        );
      }
    } else {

      type = 'ENROL';
      CurrentStatus = 'INITIAL';
      CurrentEvent = 'SIGN_UP';
      CurrentTarget = 'IN_PROGRESS';

      //Ceck User ActivityEvent Parent
      var dataactivityevents = null;
      if (user_deviceId != null) {
        dataactivityevents = await this.activityeventsService.findParent(user_email, user_deviceId, type, false);
      } else {
        dataactivityevents = await this.activityeventsService.findParentWitoutDevice(user_email, type, false,);
      }

      if (!(await this.utilsService.ceckData(dataactivityevents))) {
        var user_interest = [];
        var ID_device = null;
        var ID_insights = null;
        var username_ = await this.utilsService.generateUsername(user_email);
        var id_user_langIso = null;

        var mongoose_gen_id_user_auth = new mongoose.Types.ObjectId();
        var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

        //Get Id Language
        if (req.body.langIso != undefined) {
          try {
            if (user_langIso != undefined) {
              if (user_langIso != null) {
                var data_language = await this.languagesService.findOneLangiso(
                  user_langIso,
                );
                if (await this.utilsService.ceckData(data_language)) {
                  id_user_langIso = data_language._id;
                }
              }
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Language. Error: ' + error,
            );
          }
        }

        //Create Insights
        try {
          var data_CreateInsightsDto = new CreateInsightsDto();
          ID_insights = (await this.utilsService.generateId()).toLowerCase();
          data_CreateInsightsDto._id = ID_insights;
          data_CreateInsightsDto.insightID = ID_insights;
          data_CreateInsightsDto.active = true;
          data_CreateInsightsDto.createdAt = current_date;
          data_CreateInsightsDto.updatedAt = current_date;
          data_CreateInsightsDto.email = user_email;
          data_CreateInsightsDto.followers = Long.fromString('0');
          data_CreateInsightsDto.followings = Long.fromString('0');
          data_CreateInsightsDto.unfollows = Long.fromString('0');
          data_CreateInsightsDto.likes = Long.fromString('0');
          data_CreateInsightsDto.views = Long.fromString('0');
          data_CreateInsightsDto.comments = Long.fromString('0');
          data_CreateInsightsDto.posts = Long.fromString('0');
          data_CreateInsightsDto.shares = Long.fromString('0');
          data_CreateInsightsDto.reactions = Long.fromString('0');
          data_CreateInsightsDto._class =
            'io.melody.hyppe.content.domain.Insight';

          //Insert Insights
          await this.insightsService.create(data_CreateInsightsDto);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Insights. Error: ' + error,
          );
        }

        //Userdevices != null
        if (req.body.deviceId != undefined) {
          if (await this.utilsService.ceckData(datauserdevicesService)) {
            //Get Userdevices
            try {
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: true,
                },
              );
              ID_device = datauserdevicesService._id;
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Get Userdevices. Error:' + error,
              );
            }
          } else {
            //Create Userdevices
            try {
              var data_CreateUserdeviceDto = new CreateUserdeviceDto();
              ID_device = (await this.utilsService.generateId()).toLowerCase();
              data_CreateUserdeviceDto._id = ID_device;
              data_CreateUserdeviceDto.deviceID = user_deviceId;
              data_CreateUserdeviceDto.email = user_email;
              data_CreateUserdeviceDto.active = true;
              data_CreateUserdeviceDto._class = _class_UserDevices;
              data_CreateUserdeviceDto.createdAt = current_date;
              data_CreateUserdeviceDto.updatedAt = current_date;
              //Insert User Userdevices
              await this.userdevicesService.create(data_CreateUserdeviceDto);
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Userdevices. Error:' + error,
              );
            }
          }
        }

        //Create UserAuth
        var pass_gen = await this.utilsService.generatePassword('HyppeNew');
        try {
          var data_CreateUserauthDto = new CreateUserauthDto();
          var ID_user = (await this.utilsService.generateId()).toLowerCase();
          data_CreateUserauthDto._id = mongoose_gen_id_user_auth;
          data_CreateUserauthDto.username = username_;
          data_CreateUserauthDto.password = pass_gen;
          data_CreateUserauthDto.userID = ID_user;
          data_CreateUserauthDto.email = user_email;
          data_CreateUserauthDto.createdAt = current_date;
          data_CreateUserauthDto.updatedAt = current_date;
          data_CreateUserauthDto.regSrc = 'iOS';
          data_CreateUserauthDto.isExpiryPass = false;
          data_CreateUserauthDto.isEmailVerified = true;
          data_CreateUserauthDto.isEnabled = true;
          data_CreateUserauthDto.isAccountNonExpired = true;
          data_CreateUserauthDto.isAccountNonLocked = true;
          data_CreateUserauthDto.isCredentialsNonExpired = true;
          data_CreateUserauthDto.roles = ['ROLE_USER'];
          data_CreateUserauthDto._class = _class_UserAuths;
          data_CreateUserauthDto.loginSource = user_socmedSource;
          data_CreateUserauthDto.uuid = uuid;
          data_CreateUserauthDto.devices = [
            {
              $ref: 'userdevices',
              $id: ID_device,
              $db: 'hyppe_trans_db',
            },
          ];

          //Insert UserAuth
          await this.userauthsService.create(data_CreateUserauthDto);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create UserAuth. Error: ' + error,
          );
        }

        //Create UserBasic
        try {
          var data_CreateUserbasicDto = new CreateUserbasicDto();
          var gen_profileID = (await this.utilsService.generateId()).toLowerCase();
          data_CreateUserbasicDto._id = mongoose_gen_id_user_basic;
          data_CreateUserbasicDto.profileID = gen_profileID;
          data_CreateUserbasicDto.email = user_email;
          data_CreateUserbasicDto.fullName = username_;
          data_CreateUserbasicDto.status = CurrentStatus;
          data_CreateUserbasicDto.event = CurrentEvent;
          data_CreateUserbasicDto.isComplete = false;
          data_CreateUserbasicDto.isCelebrity = false;
          data_CreateUserbasicDto.isIdVerified = false;
          data_CreateUserbasicDto.isPrivate = false;
          data_CreateUserbasicDto.isFollowPrivate = false;
          data_CreateUserbasicDto.isPostPrivate = false;
          data_CreateUserbasicDto.createdAt = current_date;
          data_CreateUserbasicDto.updatedAt = current_date;
          data_CreateUserbasicDto.statusKyc = 'unverified';
          data_CreateUserbasicDto.insight = {
            $ref: 'insights',
            $id: ID_insights,
            $db: 'hyppe_content_db',
          };
          if (mongoose_gen_id_user_auth != undefined || mongoose_gen_id_user_auth != null) {
            data_CreateUserbasicDto.userAuth = {
              $ref: 'userauths',
              $id: new ObjectId(mongoose_gen_id_user_auth._id.toString()),
              $db: 'hyppe_trans_db',
            };
          }
          if (id_user_langIso != null) {
            data_CreateUserbasicDto.languages = {
              $ref: 'languages',
              $id: id_user_langIso,
              $db: 'hyppe_infra_db',
            };
          }
          data_CreateUserbasicDto._class = _class_UserProfile;

          //Insert UserBasic
          await this.userbasicsService.create(data_CreateUserbasicDto);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create UserBasic. Error: ' + error,
          );
        }

        //Create ActivityEvent Parent SIGN_UP
        var mongoose_gen_id_Activityevents_parent = new mongoose.Types.ObjectId();
        var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
        var gen_ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        try {
          var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
          data_CreateActivityeventsDto_parent._id = mongoose_gen_id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = type;
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = CurrentStatus;
          data_CreateActivityeventsDto_parent.target = CurrentTarget;
          data_CreateActivityeventsDto_parent.event = CurrentEvent;
          data_CreateActivityeventsDto_parent.fork = undefined;
          data_CreateActivityeventsDto_parent.action = undefined;
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: undefined,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt = current_date;
          data_CreateActivityeventsDto_parent.updatedAt = current_date;
          data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
          data_CreateActivityeventsDto_parent.__v = undefined;
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.transitions = [
            {
              $ref: 'activityevents',
              $id: Object(gen_ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            },
          ];
          data_CreateActivityeventsDto_parent.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );


        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error: ' +
            error,
          );
        }

        //Referral
        // if (user_referral != null && user_referral.length > 0) {
        //   //Ceck User Userbasics Parent
        //   const datauserbasicsService_parent = await this.userbasicsService.findOne(
        //     user_referral,
        //   );
        //   if (await this.utilsService.ceckData(datauserbasicsService_parent)) {

        //     //Ceck User Referral parent children
        //     const data_referral_parent_children = await this.referralService.findAllByParentChildren(
        //       user_referral, user_email,
        //     );
        //     if (!(await this.utilsService.ceckData(data_referral_parent_children))) {
        //       //Insert Referral
        //       try {
        //         var CreateReferralDto_ = new CreateReferralDto();
        //         CreateReferralDto_._id = (await this.utilsService.generateId()).toLowerCase();
        //         CreateReferralDto_.parent = user_referral;
        //         CreateReferralDto_.children = user_email;
        //         if (user_imei != null) {
        //           CreateReferralDto_.imei = user_imei;
        //         }
        //         CreateReferralDto_.active = true;
        //         CreateReferralDto_.verified = true;
        //         CreateReferralDto_.createdAt = current_date;
        //         CreateReferralDto_.updatedAt = current_date;
        //         CreateReferralDto_._class = _class_Referral;

        //         this.referralService.create(CreateReferralDto_);

        //         var _id_2 = (await this.utilsService.generateId());
        //         var _id_4 = (await this.utilsService.generateId());

        //         var CreateContenteventsDto2 = new CreateContenteventsDto();
        //         CreateContenteventsDto2._id = _id_2
        //         CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        //         CreateContenteventsDto2.email = req.body.referral
        //         CreateContenteventsDto2.eventType = "FOLLOWER"
        //         CreateContenteventsDto2.active = true
        //         CreateContenteventsDto2.event = "ACCEPT"
        //         CreateContenteventsDto2.createdAt = current_date
        //         CreateContenteventsDto2.updatedAt = current_date
        //         CreateContenteventsDto2.sequenceNumber = 1
        //         CreateContenteventsDto2.flowIsDone = true
        //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        //         CreateContenteventsDto2.receiverParty = req.body.email

        //         var CreateContenteventsDto4 = new CreateContenteventsDto();
        //         CreateContenteventsDto4._id = _id_4
        //         CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
        //         CreateContenteventsDto4.email = req.body.email
        //         CreateContenteventsDto4.eventType = "FOLLOWING"
        //         CreateContenteventsDto4.active = true
        //         CreateContenteventsDto4.event = "ACCEPT"
        //         CreateContenteventsDto4.createdAt = current_date
        //         CreateContenteventsDto4.updatedAt = current_date
        //         CreateContenteventsDto4.sequenceNumber = 1
        //         CreateContenteventsDto4.flowIsDone = true
        //         CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
        //         CreateContenteventsDto4.senderParty = req.body.referral

        //         //await this.contenteventsService.create(CreateContenteventsDto1);
        //         await this.contenteventsService.create(CreateContenteventsDto2);
        //         //await this.contenteventsService.create(CreateContenteventsDto3);
        //         await this.contenteventsService.create(CreateContenteventsDto4);
        //         await this.insightsService.updateFollower(req.body.referral);
        //         await this.insightsService.updateFollowing(req.body.email);
        //       } catch (error) {
        //         await this.errorHandler.generateNotAcceptableException(
        //           'Unabled to proceed Create Refferal. Error:' +
        //           error,
        //         );
        //       }
        //     }
        //   }
        // }

        if (req.body.referral != undefined && req.body.imei != undefined) {

          if (req.body.referral != "" && req.body.imei != "") {
            var data_refferal = await this.referralService.findOneInChild(req.body.email);
            if (!(await this.utilsService.ceckData(data_refferal))) {
              var data_imei = await this.referralService.findOneInIme(req.body.imei);
              if (!(await this.utilsService.ceckData(data_imei))) {
                var CreateReferralDto_ = new CreateReferralDto();
                CreateReferralDto_._id = (await this.utilsService.generateId())
                CreateReferralDto_.parent = req.body.referral;
                CreateReferralDto_.children = req.body.email;
                CreateReferralDto_.active = true;
                CreateReferralDto_.verified = true;
                CreateReferralDto_.createdAt = current_date;
                CreateReferralDto_.updatedAt = current_date;
                CreateReferralDto_.imei = req.body.imei;
                CreateReferralDto_._class = "io.melody.core.domain.Referral";
                var insertdata = await this.referralService.create(CreateReferralDto_);

                const databasic = await this.userbasicsService.findOne(
                  req.body.referral,
                );

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
                CreateContenteventsDto2.email = req.body.referral
                CreateContenteventsDto2.eventType = "FOLLOWER"
                CreateContenteventsDto2.active = true
                CreateContenteventsDto2.event = "ACCEPT"
                CreateContenteventsDto2.createdAt = current_date
                CreateContenteventsDto2.updatedAt = current_date
                CreateContenteventsDto2.sequenceNumber = 1
                CreateContenteventsDto2.flowIsDone = true
                CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
                CreateContenteventsDto2.receiverParty = req.body.email

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
                CreateContenteventsDto4.email = req.body.email
                CreateContenteventsDto4.eventType = "FOLLOWING"
                CreateContenteventsDto4.active = true
                CreateContenteventsDto4.event = "ACCEPT"
                CreateContenteventsDto4.createdAt = current_date
                CreateContenteventsDto4.updatedAt = current_date
                CreateContenteventsDto4.sequenceNumber = 1
                CreateContenteventsDto4.flowIsDone = true
                CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
                CreateContenteventsDto4.senderParty = req.body.referral

                //await this.contenteventsService.create(CreateContenteventsDto1);
                await this.contenteventsService.create(CreateContenteventsDto2);
                //await this.contenteventsService.create(CreateContenteventsDto3);
                await this.contenteventsService.create(CreateContenteventsDto4);
                await this.insightsService.updateFollower(req.body.referral);
                await this.insightsService.updateFollowing(req.body.email);
              }
            }
          }
        }

        //Create Or Update refresh Token
        await this.authService.updateRefreshToken(user_email);

        //Ceck User Userdevices
        const user_userdevicesService = await this.userdevicesService.findOneEmail_(user_email);

        var token = (
          await this.utilsService.generateToken(user_email, user_userdevicesService.deviceID)
        ).toString();

        //Ceck User jwtrefresh token
        const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
          user_email,
        );

        this.userbasicsService.updatebyEmail(user_email, {
          status: 'IN_PROGRESS',
          event: 'UPDATE_BIO',
        });

        //Create ActivityEvent child IN_PROGRESS
        try {
          var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
          data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            gen_ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = type;
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'IN_PROGRESS';
          data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
          data_CreateActivityeventsDto_child.event = 'UPDATE_BIO';
          data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: undefined,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_child.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );


        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Child. Error: ' +
            error,
          );
        }

        //Create ActivityEvent Parent LOGIN
        var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
        var mongoose_gen_id_Activityevents_parent = new mongoose.Types.ObjectId();
        var gen_ID_parent_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
        try {
          data_CreateActivityeventsDto_parent._id = mongoose_gen_id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            gen_ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = 'INITIAL';
          data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
          data_CreateActivityeventsDto_parent.event = 'LOGIN';
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: undefined,
              longitude: undefined,
            },
            logout_date: undefined,
            login_date: current_date,
            login_device: user_userdevicesService.deviceID,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt = current_date;
          data_CreateActivityeventsDto_parent.updatedAt = current_date;
          data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.__v = undefined;
          data_CreateActivityeventsDto_parent.userbasic =
            Object(mongoose_gen_id_user_basic);

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error:' +
            error,
          );
        }

        return {
          response_code: 202,
          data: {
            idProofNumber: "ID",
            roles: [
              "ROLE_USER"
            ],
            fullName: username_,
            isIdVerified: "false",
            isEmailVerified: "false",
            token: "Bearer " + token,
            idProofStatus: "IN_PROGRESS",
            insight: {
              shares: new Double(0),
              followers: new Double(0),
              comments: new Double(0),
              followings: new Double(0),
              reactions: new Double(0),
              posts: new Double(0),
              views: new Double(0),
              likes: new Double(0)
            },
            interest: user_interest,
            event: "UPDATE_BIO",
            email: user_email,
            username: username_,
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id,
            uuid: uuid
          },
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Signup successful'],
          },
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Sorry! This email already registered',
        );
      }
    }
  }
}