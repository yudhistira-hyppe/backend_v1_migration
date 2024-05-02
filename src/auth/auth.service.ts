import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserbasicsnewService } from '../trans/newuserbasic/userbasicsnew.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
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
import mongoose, { Types } from 'mongoose';
import { SeaweedfsService } from '../stream/seaweedfs/seaweedfs.service';
import { AdsUserCompareService } from '../trans/ads/adsusercompare/adsusercompare.service';
import { Long } from 'mongodb';
import * as fs from 'fs';
import { ContenteventsService } from '../content/contentevents/contentevents.service';
import { CreateContenteventsDto } from '../content/contentevents/dto/create-contentevents.dto';
import { CreateGetcontenteventsDto } from '../trans/getusercontents/getcontentevents/dto/create-getcontentevents.dto';
import { CreateUserbasicnewDto } from '../trans/newuserbasic/dto/create-userbasicnew.dto';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { PostsService } from '../content/posts/posts.service';
import { Response } from 'express';
import { TemplatesRepo } from 'src/infra/templates_repo/schemas/templatesrepo.schema';
import { ChallengeService } from '../trans/challenge/challenge.service';
import { UserchallengesService } from '../trans/userchallenges/userchallenges.service';
import { Userchallenges } from '../trans/userchallenges/schemas/userchallenges.schema';
import { subChallengeService } from '../trans/challenge/subChallenge.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { CreateuserbasicnewDto } from 'src/trans/userbasicnew/dto/Createuserbasicnew-dto';
import { NewPostService } from 'src/content/new_post/new_post.service';
import { newPosts } from 'src/content/new_post/schemas/newPost.schema';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userbasicsnewService: UserbasicsnewService,
    private basic2SS: UserbasicnewService,
    private userauthsService: UserauthsService,
    private jwtService: JwtService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private countriesService: CountriesService,
    private languagesService: LanguagesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    //private interestsService: InterestsService,
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
    private challengeService: ChallengeService,
    private userchallengesService: UserchallengesService,
    private subChallengeService: subChallengeService,
    private readonly logapiSS: LogapisService,
    private readonly post2SS: NewPostService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    var isMatch = false;
    try {
      const user_userbasics = await this.userbasicsService.findOne(email);
      const user_auths = await this.userauthsService.findOne(email);
      if ((await this.utilsService.ceckData(user_auths)) && (await this.utilsService.ceckData(user_userbasics))) {
        const passuser = user_auths.password;
        isMatch = await this.utilsService.comparePassword(pass, passuser);
      } else {
        return 'NOTFOUND';
      }
      if (isMatch) {
        const { password, ...result } = user_auths;
        return result;
      } else {
        return 'INVALIDCREDENTIALSLID';
      }
    } catch (err) {
      return 'UNABLEDTOPROCEED';
    }
  }

  async validateUser2(email: string, pass: string): Promise<any> {
    var isMatch = false;
    try {
      const user_userbasics = await this.basic2SS.findbyemail(email);
      if (await this.utilsService.ceckData(user_userbasics)) {
        const passuser = user_userbasics.password;
        isMatch = await this.utilsService.comparePassword(pass, passuser);
      } else {
        return 'NOTFOUND';
      }
      if (isMatch) {
        const { password, ...result } = user_userbasics;
        return result;
      } else {
        return 'INVALIDCREDENTIALSLID';
      }
    } catch (err) {
      return 'UNABLEDTOPROCEED';
    }
  }

  async login(req: any) {
    var user_email = req.body.email;
    var user_location = req.body.location;
    var user_deviceId = req.body.deviceId;
    var user_devicetype = req.body.devicetype;

    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
    var data_CreateUserdeviceDto = new CreateUserdeviceDto();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var ID_user_userdevicesService = null;
    var id_Activityevents_parent = new mongoose.Types.ObjectId();
    var id_Activityevents_child = new mongoose.Types.ObjectId();

    var type = 'LOGIN';
    var status = 'INITIAL';
    var event = 'LOGIN';

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';

    var _isEmailVerified = false;

    //Ceck User ActivityEvent Parent
    const user_activityevents = await this.activityeventsService.findParent(
      user_email,
      user_deviceId,
      'LOGIN',
      false,
    );

    //Ceck User Userdevices
    const user_userdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

    //Ceck User Userauths
    const datauserauthsService = await this.userauthsService.findOneByEmail(
      user_email,
    );

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User jwtrefresh token
    const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
      user_email,
    );
    if (
      (await this.utilsService.ceckData(datauserbasicsService)) &&
      (await this.utilsService.ceckData(datajwtrefreshtoken))
    ) {

      if (await this.utilsService.ceckData(datauserauthsService)) {
        _isEmailVerified = datauserauthsService.isEmailVerified;
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'User auths not found',
        );
      }

      if (_isEmailVerified) {

        let messages;
        //ActivityEvent Parent > 0
        if (Object.keys(user_activityevents).length > 0) {

          //Create ActivityEvent child
          try {
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
                latitude: user_location.latitude,
                longitude: user_location.longitude,
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

          messages = {
            info: ['Device activity logging successful'],
          };

        } else {

          //Create ActivityEvent Parent
          try {
            data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = type;
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = status;
            data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
            data_CreateActivityeventsDto_parent.event = event;
            data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: user_location.latitude,
                longitude: user_location.longitude,
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
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = status;
            data_CreateActivityeventsDto_child.target = 'ACTIVE';
            data_CreateActivityeventsDto_child.event = 'AWAKE';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: user_location.latitude,
                longitude: user_location.longitude,
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
          if (await this.utilsService.ceckData(user_userdevicesService)) {
            //Get Userdevices
            try {
              if (user_devicetype != null) {
                await this.userdevicesService.updatebyEmail(
                  user_email,
                  user_deviceId,
                  {
                    active: true,
                    devicetype: user_devicetype
                  },
                );
              } else {
                await this.userdevicesService.updatebyEmail(
                  user_email,
                  user_deviceId,
                  {
                    active: true
                  },
                );
              }
              ID_user_userdevicesService = user_userdevicesService._id;
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Get Userdevices. Error:' + error,
              );
            }

          } else {

            //Create Userdevices
            try {
              ID_user_userdevicesService = (
                await this.utilsService.generateId()
              ).toLowerCase();
              data_CreateUserdeviceDto._id = ID_user_userdevicesService;
              data_CreateUserdeviceDto.deviceID = user_deviceId;
              data_CreateUserdeviceDto.email = user_email;
              data_CreateUserdeviceDto.active = true;
              data_CreateUserdeviceDto._class = _class_UserDevices;
              data_CreateUserdeviceDto.createdAt = current_date;
              data_CreateUserdeviceDto.updatedAt = current_date;
              data_CreateUserdeviceDto.devicetype = user_devicetype;
              //Insert User Userdevices
              await this.userdevicesService.create(data_CreateUserdeviceDto);
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Userdevices. Error:' + error,
              );
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

          messages = {
            info: ['Login successful'],
          };

        }

        var countries_json = null;
        if (datauserbasicsService.countries != undefined) {
          countries_json = JSON.parse(
            JSON.stringify(datauserbasicsService.countries),
          );
        }
        var languages_json = null;
        if (datauserbasicsService.languages != undefined) {
          languages_json = JSON.parse(
            JSON.stringify(datauserbasicsService.languages),
          );
        }
        var mediaprofilepicts_json = null;
        if (datauserbasicsService.profilePict != undefined) {
          mediaprofilepicts_json = JSON.parse(
            JSON.stringify(datauserbasicsService.profilePict),
          );
        }
        var insights_json = null;
        if (datauserbasicsService.insight != undefined) {
          insights_json = JSON.parse(
            JSON.stringify(datauserbasicsService.insight),
          );
        }

        var interests_array = [];
        if (datauserbasicsService.userInterests.length > 0) {
          for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
            var interests_json = JSON.parse(
              JSON.stringify(datauserbasicsService.userInterests[i]),
            );
            if (interests_json.ref == 'interests_repo') {
              const interests = await this.interestsRepoService.findOne(
                interests_json.$id,
              );
              interests_array[i] = interests.interestName;
            } else {
              const interests = await this.interestsRepoService.findOne(
                interests_json.$id,
              );
              interests_array[i] = interests.interestName;
            }
          }
        }

        let countries = null;
        if (countries_json != null) {
          countries = await this.countriesService.findOne(countries_json.$id);
        }

        let languages = null;
        if (languages_json != null) {
          languages = await this.languagesService.findOne(languages_json.$id);
        }

        let mediaprofilepicts = null;
        if (mediaprofilepicts_json != null) {
          mediaprofilepicts = await this.mediaprofilepictsService.findOne(
            mediaprofilepicts_json.$id,
          );
        }

        let insights = null;
        if (insights_json != null) {
          insights = await this.insightsService.findOne(insights_json.$id);
        }

        var mediaUri = null;
        if (mediaprofilepicts != null) {
          mediaUri = mediaprofilepicts.mediaUri;
        }

        let result = null;
        if (mediaUri != null) {
          result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
        }

        var mediaprofilepicts_res = {}
        if (mediaprofilepicts != null) {
          if (mediaprofilepicts.mediaBasePath != null) {
            mediaprofilepicts_res["mediaBasePath"] = mediaprofilepicts.mediaBasePath;
          }

          if (mediaprofilepicts.mediaUri != null) {
            mediaprofilepicts_res["mediaUri"] = mediaprofilepicts.mediaUri;
          }

          if (mediaprofilepicts.mediaType != null) {
            mediaprofilepicts_res['mediaType'] = mediaprofilepicts.mediaType;
          }
        }

        if (result != null) {
          mediaprofilepicts_res["mediaEndpoint"] = result;
        }

        var insights_res = {
          shares: insights.shares,
          followers: insights.followers,
          comments: insights.comments,
          followings: insights.followings,
          reactions: insights.reactions,
          posts: insights.posts,
          views: insights.views,
          likes: insights.likes,
        };

        var token = (
          await this.utilsService.generateToken(user_email, user_deviceId)
        ).toString();

        const data = {};
        if (countries != null) {
          data["country"] = countries.country;
        }
        data["roles"] = datauserauthsService.roles;
        data["fullName"] = datauserbasicsService.fullName;
        if (await this.utilsService.ceckData(mediaprofilepicts_res)) {
          data['avatar'] = mediaprofilepicts_res;
        }
        data["isIdVerified"] = datauserbasicsService.isIdVerified;
        data["isEmailVerified"] = datauserauthsService.isEmailVerified;
        data["token"] = 'Bearer ' + token;
        data["idProofStatus"] = datauserbasicsService.idProofStatus;
        data["insight"] = insights_res;
        if (languages != null) {
          data["langIso"] = languages.langIso;
        }
        data["interest"] = interests_array;
        data["event"] = datauserbasicsService.event;
        data["email"] = datauserbasicsService.email;
        data["username"] = datauserauthsService.username;
        data["isComplete"] = datauserbasicsService.isComplete;
        data["status"] = datauserbasicsService.status;
        data["refreshToken"] = datajwtrefreshtoken.refresh_token_id;

        return {
          response_code: 202,
          data,
          messages,
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unexpected problem, please check your email and re-verify the OTP',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'User basics and jwt not found',
      );
    }
  }

  async signup(req: any): Promise<any> {
    var user_email = null;
    var user_password = null;
    var user_deviceId = null;
    var user_interest = null;
    var user_langIso = null;
    var user_gender = null;

    var user_otp = null;
    var user_status = null;
    var user_event = null;

    var type = 'ENROL';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var user_regSrc = "";

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = req.body.lang.toString();
    }

    if (req.body.regSrc != undefined) {
      user_regSrc = req.body.regSrc.toString();
    }

    var current_date = await this.utilsService.getDateTimeString();

    if (req.body.email == undefined) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Email parameter required'],
        },
      });
    }

    if (!(await this.utilsService.validasiEmail(req.body.email))) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Invalid email format'],
        },
      });
    }

    //CECk signup/verify
    if (req.body.otp == undefined) {
      if (req.body.password == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Password parameter required '],
          },
        });
      } else {
        if (req.body.password == req.body.email) {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! Password cannot be the same as email.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Kata sandi tidak boleh sama dengan email.',
            );
          }
        }
      }
      if (req.body.password == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Password parameter required '],
          },
        });
      } else {
        if (req.body.password == req.body.email) {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! Password cannot be the same as email.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Kata sandi tidak boleh sama dengan email.',
            );
          }
        }
      }
      if (req.body.deviceId == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Device Id parameter required '],
          },
        });
      }
      if (req.body.deviceId == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Device Id parameter required '],
          },
        });
      }
      user_email = req.body.email;
      user_password = req.body.password;
      user_deviceId = req.body.deviceId;
      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
      if (req.body.interest != undefined) {
        user_interest = req.body.interest;
      }
      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }
    } else {
      if (req.body.otp == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, OTP parameter required '],
          },
        });
      }
      if (req.body.otp == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, OTP parameter required '],
          },
        });
      }
      if (req.body.status == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Status parameter required '],
          },
        });
      }
      if (req.body.status == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Status parameter required '],
          },
        });
      }
      if (req.body.event == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Event parameter required '],
          },
        });
      }
      if (req.body.event == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Event parameter required '],
          },
        });
      }
      user_email = req.body.email;
      user_otp = req.body.otp;
      user_status = req.body.status;
      user_event = req.body.event;
    }

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';
    var _class_UserAuths = 'io.melody.core.domain.UserAuth';
    var _class_UserProfile = 'io.melody.core.domain.UserProfile';

    //Set Status dan Event
    if (req.body.otp == undefined) {
      CurrentStatus = 'INITIAL';
      CurrentEvent = 'SIGN_UP';
    } else {
      CurrentStatus = user_status;
      CurrentEvent = user_event;
    }

    //CECk INITIAL
    const isNotInitial = !((CurrentEvent == 'SIGN_UP') && (CurrentStatus == 'INITIAL'));

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

    if (
      (await this.utilsService.ceckData(datauserbasicsService)) &&
      (await this.utilsService.ceckData(datauserauthsService)) &&
      isNotInitial
    ) {
      const dataactivityevents =
        await this.activityeventsService.findParentWitoutDevice(
          user_email,
          'ENROL',
          false,
        );

      if (Object.keys(dataactivityevents).length > 0) {
        let last;
        if (dataactivityevents[0].transitions.length > 0) {
          const json_transition = JSON.parse(JSON.stringify(dataactivityevents[0].transitions[0]));
          last = await this.activityeventsService.findbyactivityEventID(
            user_email,
            json_transition.$id,
            'ENROL',
            false,
          );
        } else {
          last = dataactivityevents;
        }

        let StatusNext;
        let EventNext;

        if (last[0].status == 'NOTIFY') {
          StatusNext = 'REPLY';
          EventNext = 'VERIFY_OTP';
        }

        if (StatusNext == CurrentStatus && EventNext == CurrentEvent) {
          if (
            datauserauthsService.oneTimePassword != undefined &&
            CurrentEvent == 'VERIFY_OTP' &&
            CurrentStatus == 'REPLY'
          ) {
            if (
              await this.utilsService.compareOTPAttemp(
                Number(datauserauthsService.otpAttempt),
              )
            ) {
              if (
                (datauserauthsService.oneTimePassword != undefined
                  ? await this.utilsService.OTPExpires(
                    Number(await datauserauthsService.otpRequestTime),
                  )
                  : false) == false &&
                user_otp == datauserauthsService.oneTimePassword
              ) {

                //Update Userauths by email 
                try {
                  await this.userauthsService.updatebyEmail(user_email, {
                    isEmailVerified: true
                  });
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed update userauths Email Verified. Error:' +
                    error,
                  );
                }

                const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);

                //Create Or Update refresh Token
                await this.updateRefreshToken(user_email);

                //Create ActivityEvent child VERIFY_OTP
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'REPLY';
                  data_CreateActivityeventsDto_child.target = 'IN_PROGRESS';
                  data_CreateActivityeventsDto_child.event = 'VERIFY_OTP';
                  data_CreateActivityeventsDto_child.action =
                    'VerifyActivityCommand';
                  data_CreateActivityeventsDto_child._class =
                    'io.melody.hyppe.trans.domain.ActivityEvent';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: dataactivityevents[0].payload.login_device,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    2,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      flowIsDone: false,
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity Event Parent. Error:' +
                    error,
                  );
                }

                //Ceck User Userdevices
                const user_userdevicesService = await this.userdevicesService.findOneEmail_(user_email);

                var countries_json = null;
                if (datauserbasicsService.countries != undefined) {
                  countries_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.countries),
                  );
                }
                var languages_json = null;
                if (datauserbasicsService.languages != undefined) {
                  languages_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.languages),
                  );
                }
                var mediaprofilepicts_json = null;
                if (datauserbasicsService.profilePict != undefined) {
                  mediaprofilepicts_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.profilePict),
                  );
                }
                var insights_json = null;
                if (datauserbasicsService.insight != undefined) {
                  insights_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.insight),
                  );
                }

                var interests_array = [];
                if (datauserbasicsService.userInterests.length > 0) {
                  for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
                    var interests_json = JSON.parse(
                      JSON.stringify(datauserbasicsService.userInterests[i]),
                    );
                    if (interests_json.$ref == 'interests_repo') {
                      const interests = await this.interestsRepoService.findOne(
                        interests_json.$id,
                      );
                      interests_array[i] = interests.interestName;
                    } else {
                      const interests = await this.interestsRepoService.findOne(
                        interests_json.$id,
                      );
                      interests_array[i] = interests.interestName;
                    }
                  }
                }

                let countries = null;
                if (countries_json != null) {
                  countries = await this.countriesService.findOne(countries_json.$id);
                }

                let languages = null;
                if (languages_json != null) {
                  languages = await this.languagesService.findOne(languages_json.$id);
                }

                let mediaprofilepicts = null;
                if (mediaprofilepicts_json != null) {
                  mediaprofilepicts = await this.mediaprofilepictsService.findOne(
                    mediaprofilepicts_json.$id,
                  );
                }

                let insights = null;
                if (insights_json != null) {
                  insights = await this.insightsService.findOne(insights_json.$id);
                }

                var mediaUri = null;
                if (mediaprofilepicts != null) {
                  mediaUri = mediaprofilepicts.mediaUri;
                }

                let result = null;
                if (mediaUri != null) {
                  result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
                }

                var mediaprofilepicts_res = {}
                if (mediaprofilepicts != null) {
                  if (mediaprofilepicts.mediaBasePath != null) {
                    mediaprofilepicts_res["mediaBasePath"] = mediaprofilepicts.mediaBasePath;
                  }

                  if (mediaprofilepicts.mediaUri != null) {
                    mediaprofilepicts_res["mediaUri"] = mediaprofilepicts.mediaUri;
                  }

                  if (mediaprofilepicts.mediaType != null) {
                    mediaprofilepicts_res['mediaType'] = mediaprofilepicts.mediaType;
                  }
                }

                if (result != null) {
                  mediaprofilepicts_res["mediaEndpoint"] = result;
                }

                var insights_res = {
                  shares: insights.shares,
                  followers: insights.followers,
                  comments: insights.comments,
                  followings: insights.followings,
                  reactions: insights.reactions,
                  posts: insights.posts,
                  views: insights.views,
                  likes: insights.likes,
                };

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

                this.userauthsService.updatebyEmail(user_email, {
                  oneTimePassword: null,
                  otpRequestTime: new Long(0),
                  otpAttempt: new Long(0),
                  otpNextAttemptAllow: new Long(0),
                });

                //Create ActivityEvent child UPDATE_BIO
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'IN_PROGRESS';
                  data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
                  data_CreateActivityeventsDto_child.event = 'UPDATE_BIO';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: dataactivityevents[0].payload.login_device,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    3,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;
                  data_CreateActivityeventsDto_child._class = _class_ActivityEvent;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      flowIsDone: false,
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity Event Parent. Error:' +
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

                const data = {};
                if (countries != null) {
                  data["country"] = countries.country;
                }
                data["roles"] = datauserauthsService.roles;
                data["fullName"] = datauserbasicsService.fullName;
                if (await this.utilsService.ceckData(mediaprofilepicts_res)) {
                  data['avatar'] = mediaprofilepicts_res;
                }
                data["isIdVerified"] = datauserbasicsService.isIdVerified;
                data["isEmailVerified"] = datauserauthsService.isEmailVerified;
                data["token"] = 'Bearer ' + token;
                data["idProofStatus"] = datauserbasicsService.idProofStatus;
                data["insight"] = insights_res;
                if (languages != null) {
                  data["langIso"] = languages.langIso;
                }
                data["interest"] = interests_array;
                data["event"] = 'UPDATE_BIO';
                data["email"] = datauserbasicsService.email;
                data["username"] = datauserauthsService.username;
                data["isComplete"] = datauserbasicsService.isComplete;
                data["status"] = 'IN_PROGRESS';
                data["refreshToken"] = datajwtrefreshtoken_data.refresh_token_id;

                console.log("---------------------------------------------------REQUEST---------------------------------------------------");
                console.log(req.body);
                console.log("---------------------------------------------------REQUEST---------------------------------------------------");
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
                        await this.referralService.create(CreateReferralDto_);

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

                //Create User Ads
                // try {
                //   await this.adsUserCompareService.createNewUserAds(datauserbasicsService._id.toString());
                // } catch (e) {
                //   console.log("Create User Ads", e);
                // }

                //Create User Playlist
                // try {
                //   await this.postsService.generateNewUserPlaylist(datauserbasicsService._id.toString());
                // } catch (e) {
                //   console.log("Create User Ads", e);
                // }

                return {
                  response_code: 202,
                  data,
                  messages: {
                    "nextFlow": [
                      "$.event: next should UPDATE_BIO",
                      "$.status: next should IN_PROGRESS"
                    ],
                    info: ['Verify OTP successful'],
                  },
                };
              } else {
                this.userauthsService.findOneupdatebyEmail(user_email);
                const user_userAuth = await this.userauthsService.findOne(
                  user_email,
                );
                if (await this.utilsService.ceckData(user_userAuth)) {
                  if (Number(user_userAuth.otpAttempt) >= 3) {
                    try {
                      var OTP_expires = await this.utilsService.generateOTPExpiresNextAttemptAllow();
                      this.userauthsService.updatebyEmail(user_email, { otpNextAttemptAllow: OTP_expires, });
                    } catch (e) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, Failed Update Userauths. Error : ' + e,
                      );
                    }
                  }
                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'The OTP code you entered is incorrect; please check again.',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
                    );
                  }
                } else {
                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'No users were found. Please check again.',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
                    );
                  }
                }
              }
            } else {
              if (
                (Number(datauserauthsService.otpNextAttemptAllow) > 0
                  ? await this.utilsService.OTPNextAttempExpires(
                    Number(datauserauthsService.otpNextAttemptAllow),
                  )
                  : datauserauthsService.oneTimePassword != undefined) &&
                (await this.utilsService.compareOTPAttemp(
                  Number(datauserauthsService.otpAttempt),
                ))
              ) {

                //Create ActivityEvent child NOTIFY_OTP
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'NOTIFY';
                  data_CreateActivityeventsDto_child.target = 'REPLY';
                  data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                  data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
                  data_CreateActivityeventsDto_child.action =
                    'NotifyActivityCommand';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: undefined,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    1,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.__v = undefined;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

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

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });

                  //Update ActivityEvent Parent
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
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

                var OTP = await this.utilsService.generateOTP();
                var OTP_expires = await this.utilsService.generateOTPExpires();

                //Update User Auth
                try {
                  this.userauthsService.updatebyEmail(user_email, {
                    oneTimePassword: OTP,
                    otpRequestTime: OTP_expires,
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed Update Userauths. Error:' +
                    error,
                  );
                }

                try {
                  await this.sendemailOTP(user_email, OTP.toString(), 'ENROL', "id");
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed Send Email. Error:' +
                    error,
                  );
                }

                var messages = "";
                if (lang == "en") {
                  messages = "Recovery password request successful";
                } else {
                  messages = "Permintaan pemulihan kata sandi berhasil";
                }

                return {
                  response_code: 202,
                  messages: {
                    info: [messages],
                  },
                };
              } else {
                if (lang == "en") {
                  await this.errorHandler.generateNotAcceptableException(
                    'OTP max attempt exceeded, please try after ' +
                    process.env.OTP_NEXT_ALLOW_MINUTE +
                    ' minute',
                  );
                } else {
                  await this.errorHandler.generateNotAcceptableException(
                    'Upaya maksimal OTP terlampaui, harap coba setelahnya ' +
                    process.env.OTP_NEXT_ALLOW_MINUTE +
                    ' menit',
                  );
                }
              }
            }
          } else {
            if (lang == "en") {
              await this.errorHandler.generateNotAcceptableException(
                'The OTP code you entered is incorrect; please check again.',
              );
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
              );
            }
          }
        } else {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'The OTP code you entered is incorrect; please check again.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
            );
          }
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Log activity events parent signup not axist',
        );
      }
    } else {
      var user_exist = false;
      var username = user_email.substr(0, user_email.indexOf('@'));

      //Ceck User Userauth
      const datauserauthsService_ =
        await this.userauthsService.findOne(
          user_email,
        );

      user_exist = !(await this.utilsService.ceckData(datauserauthsService_));
      if (user_exist) {

        //Ceck User ActivityEvent Parent
        const dataactivityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );
        if (
          (await this.utilsService.ceckData(datauserauthsService)) &&
          (await this.utilsService.ceckData(datauserbasicsService)) &&
          (await this.utilsService.ceckData(dataactivityevents))
        ) {
          user_exist = false;
        }

        if (
          user_exist &&
          CurrentStatus == 'INITIAL' &&
          CurrentEvent == 'SIGN_UP'
        ) {
          var ID_device = null;
          var data_interest_id = [];
          var OTP = await this.utilsService.generateOTP();
          var OTP_expires = await this.utilsService.generateOTPExpires();
          var username_ = await this.utilsService.generateUsername(user_email);
          var id_user_langIso = null;

          var mongoose_gen_id_user_auth = new mongoose.Types.ObjectId();
          var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

          //Get Id Language
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

          //Get Id Interest
          try {
            if (user_interest != undefined) {
              if (user_interest.length > 0) {
                for (var i = 0; i < user_interest.length; i++) {
                  var id_interest =
                    await this.interestsRepoService.findOneByInterestNameLangIso(
                      user_interest[i], id_user_langIso
                    );
                  if (id_interest != undefined) {
                    data_interest_id.push({
                      $ref: 'interests_repo',
                      $id: Object(id_interest._id),
                      $db: 'hyppe_infra_db',
                    });
                  }
                }
              }
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Interest. Error: ' + error,
            );
          }

          //Create Insights
          try {
            var data_CreateInsightsDto = new CreateInsightsDto();
            var ID_insights = (await this.utilsService.generateId()).toLowerCase();
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

          //Create UserAuth
          var pass_gen = await this.utilsService.generatePassword(user_password);
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
            data_CreateUserauthDto.regSrc = user_regSrc;
            data_CreateUserauthDto.isExpiryPass = false;
            data_CreateUserauthDto.isEmailVerified = false;
            data_CreateUserauthDto.otpAttempt = Long.fromString('0');
            data_CreateUserauthDto.otpRequestTime = Long.fromString(OTP_expires.toString());
            data_CreateUserauthDto.isEnabled = true;
            data_CreateUserauthDto.otpNextAttemptAllow = Long.fromString('0');
            data_CreateUserauthDto.isAccountNonExpired = true;
            data_CreateUserauthDto.isAccountNonLocked = true;
            data_CreateUserauthDto.isCredentialsNonExpired = true;
            data_CreateUserauthDto.roles = ['ROLE_USER'];
            data_CreateUserauthDto._class = _class_UserAuths;
            data_CreateUserauthDto.oneTimePassword = OTP;
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
            data_CreateUserbasicDto.gender = user_gender;
            data_CreateUserbasicDto.status = 'NOTIFY';
            data_CreateUserbasicDto.event = 'NOTIFY_OTP';
            data_CreateUserbasicDto.isComplete = false;
            data_CreateUserbasicDto.isCelebrity = false;
            data_CreateUserbasicDto.isIdVerified = false;
            data_CreateUserbasicDto.isPrivate = false;
            data_CreateUserbasicDto.isFollowPrivate = false;
            data_CreateUserbasicDto.isPostPrivate = false;
            data_CreateUserbasicDto.createdAt = current_date;
            data_CreateUserbasicDto.updatedAt = current_date;
            data_CreateUserbasicDto.statusKyc = 'unverified';
            data_CreateUserbasicDto.tutor = [
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
            data_CreateUserbasicDto.insight = {
              $ref: 'insights',
              $id: Object(ID_insights),
              $db: 'hyppe_content_db',
            };
            data_CreateUserbasicDto.userInterests = Object(data_interest_id);
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
            data_CreateActivityeventsDto_parent.target = 'NOTIFY';
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

          //Create ActivityEvent child NOTIFY_OTP
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              gen_ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = type;
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
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

          try {
            await this.sendemailOTP(user_email, OTP.toString(), 'ENROL', "id");
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Failed Send Email. Error:' +
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
              idProofStatus: "INITIAL",
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
              event: "NOTIFY_OTP",
              email: user_email,
              username: username_,
              isComplete: "false",
              status: "NOTIFY"
            },
            messages: {
              nextFlow: [
                "$.event: next should VERIFY_OTP",
                "$.status: next should REPLY"
              ],
              info: ['Signup successful'],
            },
          };
        } else {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! This email already registered.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Email ini sudah terdaftar.',
            );
          }
        }
      } else {
        if (lang == "en") {
          await this.errorHandler.generateNotAcceptableException(
            'Sorry! This email already registered.',
          );
        } else {
          await this.errorHandler.generateNotAcceptableException(
            'Maaf! Email ini sudah terdaftar.',
          );
        }
      }
    }
  }

  async updateprofile(req: any, head: any) {
    console.log("");
    console.log("");
    console.log("----------------------------HEAD---------------------------", head);
    console.log("----------------------------REG---------------------------", req);
    console.log("");
    console.log("");
    if (!(await this.utilsService.validasiTokenEmail(head))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    var user_email_header = null;
    var user_email = null;
    var user_username = null;
    var user_bio = null;
    var user_fullName = null;

    var user_country = null;
    var user_area = null;
    var user_city = null;
    var user_mobileNumber = null;
    var user_idProofNumber = null;
    var user_gender = null;
    var user_dob = null;
    var user_langIso = null;

    var event = req.body.event;
    var status = req.body.status;

    if (head['x-auth-user'] != undefined) {
      user_email_header = head['x-auth-user'];
    }

    if ((event == 'UPDATE_BIO') && (status == 'IN_PROGRESS')) {
      if (req.body.email != undefined) {
        user_email = req.body.email;
      }

      if (req.body.username != undefined) {
        user_username = req.body.username;
      }

      if (req.body.bio != undefined) {
        user_bio = req.body.bio;
      }

      if (req.body.fullName != undefined) {
        user_fullName = req.body.fullName;
      }

      if (req.body.country != undefined) {
        user_country = req.body.country;
      }

      if (req.body.area != undefined) {
        user_area = req.body.area;
      }

      if (req.body.city != undefined) {
        user_city = req.body.city;
      }

      if (req.body.mobileNumber != undefined) {
        user_mobileNumber = req.body.mobileNumber;
      }

      // if (req.body.$idProofNumber != undefined) {
      //   user_idProofNumber = req.body.idProofNumber;
      // }

      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }

      if (req.body.dob != undefined) {
        user_dob = req.body.dob;
      }

      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
    } else if ((event == 'UPDATE_PROFILE') && (status == 'COMPLETE_BIO')) {
      if (req.body.email != undefined) {
        user_email = req.body.email;
      }

      if (req.body.username != undefined) {
        user_username = req.body.username;
      }

      if (req.body.bio != undefined) {
        user_bio = req.body.bio;
      }

      if (req.body.fullName != undefined) {
        user_fullName = req.body.fullName;
      }

      if (req.body.country != undefined) {
        user_country = req.body.country;
      }

      if (req.body.area != undefined) {
        user_area = req.body.area;
      }

      if (req.body.city != undefined) {
        user_city = req.body.city;
      }

      if (req.body.mobileNumber != undefined) {
        user_mobileNumber = req.body.mobileNumber;
      }

      // if (req.body.$idProofNumber != undefined) {
      //   user_idProofNumber = req.body.$idProofNumber;
      // }

      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }

      if (req.body.dob != undefined) {
        user_dob = req.body.dob;
      }

      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
    } else {
      if (req.body.area != undefined) {
        user_area = req.body.area;
      }

      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      } else {
        user_gender = "";
      }

      if (req.body.dob != undefined) {
        user_dob = req.body.dob;
      } else {
        user_dob = "";
      }

      if (req.body.country != undefined) {
        user_country = req.body.country;
      }
    }

    // if (user_email_header != user_email) {
    //   throw new NotAcceptableException({
    //     response_code: 406,
    //     messages: {
    //       info: ['Unabled to proceed'],
    //     },
    //   });
    // }

    var type = 'ENROL';
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';

    //Ceck User ActivityEvent Parent
    const user_activityevents = await this.activityeventsService.findParentWitoutDevice(
      user_email_header,
      type,
      false,
    );

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email_header,
    );

    //Ceck User Userauths
    const datauserauthsService = await this.userauthsService.findOneByEmail(
      user_email_header,
    );

    if (await this.utilsService.ceckData(datauserauthsService)) {
      var usernameExisting = datauserauthsService.username.toString();
      if (usernameExisting != user_username) {
        var ceckUsername = await this.utilsService.validateUsername(user_username);
        if (!ceckUsername) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: ['Unabled to proceed, username is already in use'],
            },
          });
        }
      }
    }

    if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datauserauthsService))) {
      var Data = {
        isEmailVerified: datauserauthsService.isEmailVerified,
        status: datauserbasicsService.status,
      }
      if (await this.utilsService.isAuthVerified(Data)) {
        if (Object.keys(user_activityevents).length > 0) {
          if ((event == 'UPDATE_BIO') && (status == 'IN_PROGRESS')) {
            //Update Profile Bio
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              data_update_userbasict['status'] = status;
              data_update_userbasict['event'] = event;

              if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
                await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile bio. Error:' + error,
              );
            }

            //Create ActivityEvent child 1
            var ID_child_ActivityEvent_1 = (
              await this.utilsService.generateId()
            ).toLowerCase();
            try {
              var id_Activityevents_child_1 = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_Activityevents_child_1;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent_1;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = status;
              data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
              data_CreateActivityeventsDto_child.event = event;
              data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: current_date,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(4);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_parent.__v = undefined;
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

            //Update ActivityEvent Parent 1
            try {
              const data_transitions = user_activityevents[0].transitions;
              data_transitions.push({
                $ref: 'activityevents',
                $id: new Object(ID_child_ActivityEvent_1),
                $db: 'hyppe_trans_db',
              });

              //Update ActivityEvent Parent 1
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

          } else if ((event == 'UPDATE_PROFILE') && (status == 'COMPLETE_BIO')) {
            //Update Profile Detail
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              data_update_userbasict['isComplete'] = true;
              data_update_userbasict['status'] = status;
              data_update_userbasict['event'] = event;

              if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
                await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile detail. Error:' + error,
              );
            }

            //Create ActivityEvent child 2
            var ID_child_ActivityEvent_2 = (
              await this.utilsService.generateId()
            ).toLowerCase();
            try {
              var id_Activityevents_child_2 = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_Activityevents_child_2;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent_2;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = status;
              data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
              data_CreateActivityeventsDto_child.event = event;
              data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: current_date,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(4);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_parent.__v = undefined;
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
                $id: new Object(ID_child_ActivityEvent_2),
                $db: 'hyppe_trans_db',
              });

              //Update ActivityEvent Parent
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

            //Update ActivityEvent All Child True
            try {
              await this.activityeventsService.updateFlowDone(user_activityevents[0].activityEventID.toString());
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                error,
              );
            }
          } else {
            var data_update_userbasict = {};
            user_email = user_email_header;
            console.log("user_area", user_area)
            if (user_area != null) {
              var areas = await this.areasService.findOneName(user_area);
              if ((await this.utilsService.ceckData(areas))) {
                var areas_id = (await areas)._id;
                data_update_userbasict['states'] = {
                  $ref: 'areas',
                  $id: areas_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            if (user_gender != null) {
              data_update_userbasict['gender'] = user_gender;
            }
            if (user_dob != null) {
              data_update_userbasict['dob'] = user_dob;
            }
            if (user_country != null) {
              var countries = await this.countriesService.findOneName(user_country);
              if ((await this.utilsService.ceckData(countries))) {
                var countries_id = (await countries)._id;
                data_update_userbasict['countries'] = {
                  $ref: 'countries',
                  $id: countries_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
          }

          return {
            response_code: 202,
            messages: {
              info: ['Update profile successful'],
            }
          };
        } else {
          if ((event == 'UPDATE_BIO') && (status == 'IN_PROGRESS')) {
            //Update Profile Bio
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }

              //data_update_userbasict['status'] = status;
              //data_update_userbasict['event'] = event;

              await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
              // if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
              //   await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
              // }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile bio. Error:' + error,
              );
            }
          } else if ((event == 'UPDATE_PROFILE') && (status == 'COMPLETE_BIO')) {
            //Update Profile Detail
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              //data_update_userbasict['isComplete'] = true;
              //data_update_userbasict['status'] = status;
              //data_update_userbasict['event'] = event;

              if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
                await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile detail. Error:' + error,
              );
            }
          } else {
            var data_update_userbasict = {};
            user_email = user_email_header;
            console.log("user_email", user_email)
            if (user_area != null) {
              var areas = await this.areasService.findOneName(user_area);
              if ((await this.utilsService.ceckData(areas))) {
                var areas_id = (await areas)._id;
                data_update_userbasict['states'] = {
                  $ref: 'areas',
                  $id: areas_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            if (user_gender != null) {
              data_update_userbasict['gender'] = user_gender;
            }
            if (user_dob != null) {
              data_update_userbasict['dob'] = user_dob;
            }
            if (user_country != null) {
              var countries = await this.countriesService.findOneName(user_country);
              if ((await this.utilsService.ceckData(countries))) {
                var countries_id = (await countries)._id;
                data_update_userbasict['countries'] = {
                  $ref: 'countries',
                  $id: countries_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
          }

          return {
            response_code: 202,
            messages: {
              info: ['Update profile successful'],
            }
          };
        }
      } else {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, User not verified'],
          },
        });
      }
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, User not found'],
        },
      });
    }
  }


  async refreshToken(email: string, refresh_token_id: string) {
    //Ceck User Jwtrefreshtoken
    const datajwtrefreshtokenService =
      await this.jwtrefreshtokenService.findByEmailRefreshToken(
        email,
        refresh_token_id,
      );

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(email);

    if (await this.utilsService.ceckData(datajwtrefreshtokenService)) {
      var date_exp = await datajwtrefreshtokenService.exp;
      //Ceck Time Refresh Token Expired
      // if (new Date().getTime() > Number(await date_exp)) {
      //   await this.errorHandler.generateNotAcceptableException(
      //     'Refesh token still valid',
      //   );
      // } else {
      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(
        email,
      );

      //Get Id Userdevices
      const datauserauthsService_devices =
        datauserauthsService.devices[datauserauthsService.devices.length - 1];

      //Generate Token
      var Token =
        'Bearer ' +
        (await this.utilsService.generateToken(
          datauserbasicsService.email.toString(),
          datauserbasicsService._id.toString(),
        ));

      //Generate Refresh Token
      var RefreshToken = await this.updateRefreshToken(
        datauserbasicsService.email.toString(),
      );

      return {
        response_code: 202,
        data: {
          token: Token.toString(),
          refreshToken: RefreshToken.toString(),
        },
        messages: {
          info: ['Refresh Token successful'],
        },
      };
      //}
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
  }

  async updateRefreshToken(email: string): Promise<string> {
    try {
      var refreshToken = await this.utilsService.generateRefreshToken();
      var iatdate = new Date();
      var expdate = new Date();
      expdate.setDate(
        expdate.getDate() +
        Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
      );

      //Update Refresh Token
      await this.jwtrefreshtokenService.saveorupdateRefreshToken(
        refreshToken,
        email,
        expdate.getTime(),
        iatdate.getTime(),
      );
      return refreshToken;
    } catch (err) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Update Refresh Token. Error:' + err,
      );
    }
  }

  async updateRefreshToken2(email: string): Promise<string> {
    try {
      var refreshToken = await this.utilsService.generateRefreshToken();
      var iatdate = new Date();
      var expdate = new Date();
      expdate.setDate(
        expdate.getDate() +
        Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
      );

      //Update Refresh Token
      await this.jwtrefreshtokenService.saveorupdateRefreshToken2(
        refreshToken,
        email,
        expdate.getTime(),
        iatdate.getTime(),
      );
      console.log('masuk');
      return refreshToken;
    } catch (err) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Update Refresh Token. Error:' + err,
      );
    }
  }

  async logout(req: any, head: any): Promise<any> {
    if (!(await this.utilsService.validasiTokenEmail(head))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    req.logout();
    var user_email_header = head['x-auth-user'];
    var user_email = req.body.email;
    var user_deviceId = req.body.deviceId;
    var current_date = await this.utilsService.getDateTimeString();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    //Ceck User Userbasics
    const user_userbasics = await this.userbasicsService.findOne(user_email);

    //Ceck Activity Events
    const user_activityevents = await this.activityeventsService.findParent(
      user_email,
      user_deviceId,
      'LOGIN',
      false,
    );

    var id_Activityevents_child = new mongoose.Types.ObjectId();

    //Ceck User Devices
    const user_userdevicesService = await this.userdevicesService.findOneEmail(
      user_email,
      user_deviceId,
    );

    if (await this.utilsService.ceckData(user_userbasics)) {
      if (Object.keys(user_activityevents).length > 0) {
        //Create ActivityEvent Child
        try {
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'LOGIN';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'USER_LOGOUT';
          data_CreateActivityeventsDto_child.target = 'COMPLETE';
          data_CreateActivityeventsDto_child.event = 'LOGOUT';
          data_CreateActivityeventsDto_child._class =
            'io.melody.hyppe.trans.domain.ActivityEvent';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: user_activityevents[0].payload.login_location.latitude,
              longitude:
                user_activityevents[0].payload.login_location.longitude,
            },
            logout_date: current_date,
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
          data_CreateActivityeventsDto_child.flowIsDone = true;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic = user_userbasics._id;

          //Insert ActivityEvent Child
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity Event Child. Error:' + error,
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
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id,
            },
            {
              payload: {
                login_location: {
                  latitude:
                    user_activityevents[0].payload.login_location.latitude,
                  longitude:
                    user_activityevents[0].payload.login_location.longitude,
                },
                logout_date: current_date.substring(
                  0,
                  current_date.lastIndexOf('.'),
                ),
                login_date: user_activityevents[0].payload.login_date,
                login_device: user_deviceId,
                email: user_email,
              },
              flowIsDone: true,
              transitions: data_transitions,
            },
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity Event Parent. Error:' + error,
          );
        }

        //Update ActivityEvent All Child True
        try {
          await this.activityeventsService.updateFlowDone(
            user_activityevents[0].activityEventID,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update ActivityEvent All Child True. Error:' +
            error,
          );
        }

        //Update Userdevices
        try {
          if (user_userdevicesService != null) {
            const datauserauthsService =
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: false,
                },
              );
          }
          return {
            response_code: 202,
            messages: {
              info: ['Logout successful'],
            },
          };
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Userdevices. Error:' + error,
          );
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException('User not found');
    }
  }

  async deviceactivity(req: any, head: any): Promise<any> {
    var user_email_header = head['x-auth-user'];
    var user_email = req.body.email;
    var user_deviceId = req.body.deviceId;
    var user_event = req.body.event;
    var user_status = req.body.status;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var id_Activityevents_child = new mongoose.Types.ObjectId();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (
      !(
        (user_event == 'AWAKE' && user_status == 'INITIAL') ||
        (user_event == 'SLEEP' && user_status == 'ACTIVE')
      )
    ) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    var target_ = null;
    if (user_event == 'AWAKE') {
      target_ = 'ACTIVE';
    } else if (user_event == 'SLEEP') {
      target_ = 'INACTIVE';
    }

    //Ceck User basics
    const user_userbasics = await this.userbasicsService.findOne(user_email);

    if (await this.utilsService.ceckData(user_userbasics)) {
      //Ceck User ActivityEvent Parent
      const user_activityevents = await this.activityeventsService.findParent(
        user_email,
        user_deviceId,
        'LOGIN',
        false,
      );

      if (Object.keys(user_activityevents).length > 0) {
        var latitude_ = undefined;
        var longitude_ = undefined;
        if (user_activityevents[0].payload.login_location != undefined) {
          if (user_activityevents[0].payload.login_location.latitude != undefined) {
            latitude_ = user_activityevents[0].payload.login_location.latitude;
          }
          if (user_activityevents[0].payload.login_location.longitude != undefined) {
            longitude_ = user_activityevents[0].payload.login_location.longitude;
          }
        }
        //Create ActivityEvent Child
        try {
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = user_status;
          data_CreateActivityeventsDto_child.target = target_;
          data_CreateActivityeventsDto_child.event = user_event;
          data_CreateActivityeventsDto_child._class =
            'io.melody.hyppe.trans.domain.ActivityEvent';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: latitude_,
              longitude: longitude_,
            },
            logout_date: current_date,
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic = user_userbasics._id;

          //Insert ActivityEvent Child
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity Event Child. Error:' + error,
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
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id,
            },
            {
              flowIsDone: false,
              transitions: data_transitions,
            },
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity Event Parent. Error:' +
            error,
          );
        }

        return {
          response_code: 202,
          messages: {
            info: ['Device activity logging successful'],
          },
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed ',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException('User not found');
    }
  }

  async recoverpassword(req: any): Promise<any> {
    if (
      req.body.email == undefined ||
      req.body.event == undefined ||
      req.body.status == undefined
    ) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    var user_email = req.body.email;
    var user_otp = null;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = req.body.lang;
    }


    if (await this.utilsService.ceckData(datauserbasicsService)) {
      if (datauserbasicsService.userAuth != null) {
        //Ceck User ActivityEvent Parent
        const user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            'RECOVER_PASS',
            false,
          );
        //Ceck User Auth
        const user_userAuth = await this.userauthsService.findOne(user_email);

        //ActivityEvent Parent > 0
        if (Object.keys(user_activityevents).length > 0) {
          let last;
          if (user_activityevents[0].transitions.length > 0) {
            last = await this.activityeventsService.findbyactivityEventID(
              user_email,
              user_activityevents[0].transitions[0].oid,
              'RECOVER_PASS',
              false,
            );
          } else {
            last = user_activityevents;
          }

          let StatusNext;
          let EventNext;
          if (last[0].status == 'NOTIFY') {
            StatusNext = 'REPLY';
            EventNext = 'VERIFY_OTP';
          } else if (last[0].status == 'INITIAL') {
            StatusNext = user_activityevents[0].status;
            EventNext = user_activityevents[0].event;
          }

          if ('otp' in req.body) {
            user_otp = req.body.otp;
          }
          const StatusCurrent = req.body.status;
          const EventCurrent = req.body.event;

          if (
            StatusNext == 'REPLY' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {
            if (
              user_userAuth.oneTimePassword != undefined &&
              EventCurrent == 'VERIFY_OTP' &&
              StatusCurrent == 'REPLY'
            ) {

              //Create ActivityEvent child
              try {
                var id_child = new mongoose.Types.ObjectId();
                data_CreateActivityeventsDto_child._id = id_child;
                data_CreateActivityeventsDto_child.activityEventID =
                  ID_child_ActivityEvent;
                data_CreateActivityeventsDto_child.activityType =
                  'RECOVER_PASS';
                data_CreateActivityeventsDto_child.active = true;
                data_CreateActivityeventsDto_child.status = StatusCurrent;
                data_CreateActivityeventsDto_child.target = 'COMPLETE';
                data_CreateActivityeventsDto_child.event = EventCurrent;
                data_CreateActivityeventsDto_child.action =
                  'VerifyActivityCommand';
                data_CreateActivityeventsDto_child._class =
                  'io.melody.hyppe.trans.domain.ActivityEvent';
                data_CreateActivityeventsDto_child.payload = {
                  login_location: {
                    latitude: undefined,
                    longitude: undefined,
                  },
                  logout_date: undefined,
                  login_date: undefined,
                  login_device: undefined,
                  email: user_email,
                };
                data_CreateActivityeventsDto_child.createdAt = current_date;
                data_CreateActivityeventsDto_child.updatedAt = current_date;
                data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                  3,
                );
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
                  'Unabled to proceed Create Activity events Child. Error:' +
                  error,
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

              if (
                await this.utilsService.compareOTPAttemp(
                  Number(user_userAuth.otpAttempt),
                )
              ) {
                if (
                  (user_userAuth.oneTimePassword != undefined
                    ? await this.utilsService.OTPExpires(
                      Number(await user_userAuth.otpRequestTime),
                    )
                    : false) == false &&
                  user_otp == user_userAuth.oneTimePassword
                ) {
                  this.userauthsService.updatebyEmail(user_email, {
                    isEmailVerified: true,
                    password: bcrypt.hashSync(user_otp, 5),
                  });

                  const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);

                  if (
                    await this.utilsService.ceckData(datajwtrefreshtokenService)
                  ) {
                    this.updateRefreshToken(user_email);
                  }

                  //Create ActivityEvent child
                  try {
                    var id_child = new mongoose.Types.ObjectId();
                    data_CreateActivityeventsDto_child._id = id_child;
                    data_CreateActivityeventsDto_child.activityEventID =
                      ID_child_ActivityEvent;
                    data_CreateActivityeventsDto_child.activityType =
                      'RECOVER_PASS';
                    data_CreateActivityeventsDto_child.active = true;
                    data_CreateActivityeventsDto_child.status = 'COMPLETE';
                    data_CreateActivityeventsDto_child.target = 'COMPLETE';
                    data_CreateActivityeventsDto_child.event = 'COMPLETE';
                    data_CreateActivityeventsDto_child.action =
                      'VerifyActivityCommand';
                    data_CreateActivityeventsDto_child._class =
                      'io.melody.hyppe.trans.domain.ActivityEvent';
                    data_CreateActivityeventsDto_child.payload = {
                      login_location: {
                        latitude: undefined,
                        longitude: undefined,
                      },
                      logout_date: undefined,
                      login_date: undefined,
                      login_device: undefined,
                      email: user_email,
                    };
                    data_CreateActivityeventsDto_child.createdAt = current_date;
                    data_CreateActivityeventsDto_child.updatedAt = current_date;
                    data_CreateActivityeventsDto_child.sequenceNumber =
                      new Int32(4);
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
                      'Unabled to proceed Create Activity events Child. Error:' +
                      error,
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
                    await this.activityeventsService.update(
                      {
                        _id: user_activityevents[0]._id,
                      },
                      {
                        payload: {
                          login_location: {
                            latitude: undefined,
                            longitude: undefined,
                          },
                          logout_date: current_date,
                          login_date: user_activityevents[0].payload.login_date,
                          login_device: undefined,
                          email: user_email,
                        },
                        flowIsDone: true,
                        transitions: data_transitions,
                      },
                    );
                  } catch (error) {
                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Update Activity Event Parent. Error:' +
                      error,
                    );
                  }

                  //Update ActivityEvent All Child True
                  try {
                    await this.activityeventsService.updateFlowDone(
                      user_activityevents[0].activityEventID,
                    );
                  } catch (error) {
                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                      error,
                    );
                  }

                  this.userauthsService.updatebyEmail(user_email, {
                    oneTimePassword: null,
                    otpRequestTime: new Long(0),
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });

                  var messages = "";
                  if (lang == "en") {
                    messages = "Verify OTP successful";
                  } else {
                    messages = "Verifikasi OTP berhasil";
                  }

                  return {
                    response_code: 202,
                    messages: {
                      info: [messages],
                    },
                  };
                } else {
                  this.userauthsService.findOneupdatebyEmail(user_email);
                  const user_userAuth = await this.userauthsService.findOne(
                    user_email,
                  );
                  if (await this.utilsService.ceckData(user_userAuth)) {
                    if (Number(user_userAuth.otpAttempt) >= 3) {
                      var OTP_expires =
                        await this.utilsService.generateOTPExpiresNextAttemptAllow();
                      this.userauthsService.updatebyEmail(user_email, {
                        otpNextAttemptAllow: OTP_expires,
                      });
                    }
                    if (lang == "en") {
                      await this.errorHandler.generateNotAcceptableException(
                        'The OTP code you entered is incorrect, please check again.',
                      );
                    } else {
                      await this.errorHandler.generateNotAcceptableException(
                        'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
                      );
                    }
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed',
                    );
                  }
                }
              } else {
                if (
                  Number(user_userAuth.otpNextAttemptAllow) > 0
                    ? await this.utilsService.OTPNextAttempExpires(
                      Number(user_userAuth.otpNextAttemptAllow),
                    )
                    : user_userAuth.oneTimePassword != undefined &&
                    !(await this.utilsService.compareOTPAttemp(
                      Number(user_userAuth.otpAttempt),
                    ))
                ) {

                  //Create ActivityEvent child
                  try {
                    var id_child = new mongoose.Types.ObjectId();
                    data_CreateActivityeventsDto_child._id = id_child;
                    data_CreateActivityeventsDto_child.activityEventID =
                      ID_child_ActivityEvent;
                    data_CreateActivityeventsDto_child.activityType =
                      'RECOVER_PASS';
                    data_CreateActivityeventsDto_child.active = true;
                    data_CreateActivityeventsDto_child.status = 'NOTIFY';
                    data_CreateActivityeventsDto_child.target = 'REPLY';
                    data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                    data_CreateActivityeventsDto_child._class =
                      'io.melody.hyppe.trans.domain.ActivityEvent';
                    data_CreateActivityeventsDto_child.action =
                      'NotifyActivityCommand';
                    data_CreateActivityeventsDto_child.payload = {
                      login_location: {
                        latitude: undefined,
                        longitude: undefined,
                      },
                      logout_date: undefined,
                      login_date: undefined,
                      login_device: undefined,
                      email: user_email,
                    };
                    data_CreateActivityeventsDto_child.createdAt = current_date;
                    data_CreateActivityeventsDto_child.updatedAt = current_date;
                    data_CreateActivityeventsDto_child.sequenceNumber =
                      new Int32(2);
                    data_CreateActivityeventsDto_child.flowIsDone = false;
                    data_CreateActivityeventsDto_child.__v = undefined;
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
                      'Unabled to proceed Create Activity events Child. Error: ' +
                      error,
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

                  var OTP = await this.utilsService.generateOTP();
                  var OTP_expires =
                    await this.utilsService.generateOTPExpires();

                  //Update User Auth
                  this.userauthsService.updatebyEmail(user_email, {
                    oneTimePassword: OTP,
                    otpRequestTime: OTP_expires,
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });

                  await this.sendemailOTP(
                    user_userAuth.email.toString(),
                    OTP.toString(),
                    'RECOVER_PASS', lang
                  );

                  var messages = "";
                  if (lang == "en") {
                    messages = "Recovery password request successful";
                  } else {
                    messages = "Permintaan kata sandi pemulihan berhasil";
                  }

                  return {
                    response_code: 202,
                    messages: {
                      info: [messages],
                    },
                  };
                } else {
                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'OTP max attempt exceeded, please try after ' +
                      process.env.OTP_NEXT_ALLOW_MINUTE +
                      ' minute',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Upaya maksimal OTP terlampaui, silakan coba setelah ' + process.env.OTP_NEXT_ALLOW_MINUTE +
                      ' menit',
                    );
                  }
                }
              }
            } else {
              if (lang == "en") {
                await this.errorHandler.generateNotAcceptableException(
                  'No users were found. Please check again.',
                );
              } else {
                await this.errorHandler.generateNotAcceptableException(
                  'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
                );
              }
            }
          } else {

            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action =
                'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                datauserbasicsService._id;

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

            //Update ActivityEvent Parent
            try {
              const data_transitions = user_activityevents[0].transitions;
              data_transitions.push({
                $ref: 'activityevents',
                $id: new Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              });

              //Update ActivityEvent Parent
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

            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            this.userauthsService.updatebyEmail(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP(
              user_userAuth.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          }
        } else {

          //Create ActivityEvent Parent
          try {
            var id_parent = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_parent._id = id_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'RECOVER_PASS';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'NOTIFY';
            data_CreateActivityeventsDto_parent.event = 'RECOVER_PASS';
            data_CreateActivityeventsDto_parent.fork = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_parent.action = 'RecoverPassCommand';
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: undefined,
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
              'Unabled to proceed Create Activity events Parent. Error: ' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            var id_child = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_child._id = id_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.__v = undefined;
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
              'Unabled to proceed Create Activity events Child. Error: ' +
              error,
            );
          }

          //Generate OTP
          try {
            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            await this.userauthsService.updatebyEmail(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
            });

            await this.sendemailOTP(
              user_userAuth.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Gnerate OTP. Error: ' + error,
            );
          }
        }
      } else {
        if (lang == "en") {
          await this.errorHandler.generateNotAcceptableException(
            'No users were found. Please check again.',
          );
        } else {
          await this.errorHandler.generateNotAcceptableException(
            'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
          );
        }
      }
    } else {
      if (lang == "en") {
        await this.errorHandler.generateNotAcceptableException(
          'No users were found. Please check again.',
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
        );
      }
    }
  }

  async recoverpasswordV2(req: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    console.log("Request BODY >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(req.body));
    if (
      req.body.email == undefined ||
      req.body.event == undefined ||
      req.body.status == undefined
    ) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    var user_email = req.body.email;
    var user_otp = null;
    var user_password = null;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User Userauth
    const datauserauthsService = await this.userauthsService.findOne(
      user_email,
    );

    var login_source = "MANUAL";
    if (await this.utilsService.ceckData(datauserauthsService)) {
      login_source = ((datauserauthsService.loginSource != undefined)) ? datauserauthsService.loginSource.toString() : "MANUAL";
    }

    if (login_source != "MANUAL") {
      if (lang == "en") {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          800,
          "Your account is already registered. Please sign in using your Gmail account."
        );
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          800,
          "Akun Kamu Telah Terdaftar. Silakan masuk menggunakan akun Gmail."
        );
      }
    }

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = req.body.lang;
    }


    if (await this.utilsService.ceckData(datauserbasicsService)) {
      if (datauserbasicsService.userAuth != null) {
        //Ceck User ActivityEvent Parent
        const user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            'RECOVER_PASS',
            false,
          );
        //Ceck User Auth
        const user_userAuth = await this.userauthsService.findOne(user_email);

        //ActivityEvent Parent > 0
        if (Object.keys(user_activityevents).length > 0) {
          let last;
          if (user_activityevents[0].transitions.length > 0) {
            last = await this.activityeventsService.findbyactivityEventID(
              user_email,
              user_activityevents[0].transitions[(user_activityevents[0].transitions.length) - 1].oid,
              'RECOVER_PASS',
              false,
            );
          } else {
            last = user_activityevents;
          }

          let StatusNext;
          let EventNext;

          if (last[0].status == 'NOTIFY') {
            StatusNext = 'REPLY';
            EventNext = 'VERIFY_OTP';
          } else if (last[0].status == 'REPLY') {
            StatusNext = 'COMPLETE';
            EventNext = 'COMPLETE';
          } else if (last[0].status == 'INITIAL') {
            StatusNext = user_activityevents[0].status;
            EventNext = user_activityevents[0].event;
          }

          const StatusCurrent = req.body.status;
          const EventCurrent = req.body.event;

          if (
            StatusNext == 'REPLY' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {
            if ('otp' in req.body) {
              user_otp = req.body.otp;
            }

            if (
              user_userAuth.oneTimePassword != undefined &&
              EventCurrent == 'VERIFY_OTP' &&
              StatusCurrent == 'REPLY'
            ) {

              if (
                await this.utilsService.compareOTPAttemp(
                  Number(user_userAuth.otpAttempt),
                )
              ) {
                if (
                  (user_userAuth.oneTimePassword != undefined
                    ? await this.utilsService.OTPExpires(
                      Number(await user_userAuth.otpRequestTime),
                    )
                    : false) == false &&
                  user_otp == user_userAuth.oneTimePassword
                ) {

                  //Create ActivityEvent child
                  try {
                    var id_child = new mongoose.Types.ObjectId();
                    data_CreateActivityeventsDto_child._id = id_child;
                    data_CreateActivityeventsDto_child.activityEventID =
                      ID_child_ActivityEvent;
                    data_CreateActivityeventsDto_child.activityType =
                      'RECOVER_PASS';
                    data_CreateActivityeventsDto_child.active = true;
                    data_CreateActivityeventsDto_child.status = StatusCurrent;
                    data_CreateActivityeventsDto_child.target = 'COMPLETE';
                    data_CreateActivityeventsDto_child.event = EventCurrent;
                    data_CreateActivityeventsDto_child.action =
                      'VerifyActivityCommand';
                    data_CreateActivityeventsDto_child._class =
                      'io.melody.hyppe.trans.domain.ActivityEvent';
                    data_CreateActivityeventsDto_child.payload = {
                      login_location: {
                        latitude: undefined,
                        longitude: undefined,
                      },
                      logout_date: undefined,
                      login_date: undefined,
                      login_device: undefined,
                      email: user_email,
                    };
                    data_CreateActivityeventsDto_child.createdAt = current_date;
                    data_CreateActivityeventsDto_child.updatedAt = current_date;
                    data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                      3,
                    );
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
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Create Activity events Child. Error:' +
                      error,
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
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Update Activity events Parent. Error:' +
                      error,
                    );
                  }

                  this.userauthsService.updatebyEmail(user_email, {
                    isEmailVerified: true,
                  });

                  this.userauthsService.updatebyEmail(user_email, {
                    oneTimePassword: null,
                    otpRequestTime: new Long(0),
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });

                  var messages = "";
                  if (lang == "en") {
                    messages = "Verify OTP successful";
                  } else {
                    messages = "Verifikasi OTP berhasil";
                  }

                  var fullurl = req.get("Host") + req.originalUrl;
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  var reqbody = JSON.parse(JSON.stringify(req.body));
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                  return {
                    response_code: 202,
                    messages: {
                      info: [messages],
                    },
                  };
                } else {
                  this.userauthsService.findOneupdatebyEmail(user_email);
                  const user_userAuth = await this.userauthsService.findOne(
                    user_email,
                  );
                  if (await this.utilsService.ceckData(user_userAuth)) {
                    if (Number(user_userAuth.otpAttempt) >= 3) {
                      var OTP_expires =
                        await this.utilsService.generateOTPExpiresNextAttemptAllow();
                      this.userauthsService.updatebyEmail(user_email, {
                        otpNextAttemptAllow: OTP_expires,
                      });
                    }
                    if (lang == "en") {
                      var fullurl = req.get("Host") + req.originalUrl;
                      var timestamps_end = await this.utilsService.getDateTimeString();
                      var reqbody = JSON.parse(JSON.stringify(req.body));
                      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                      await this.errorHandler.generateNotAcceptableException(
                        'The OTP code you entered is incorrect, please check again.',
                      );
                    } else {
                      var fullurl = req.get("Host") + req.originalUrl;
                      var timestamps_end = await this.utilsService.getDateTimeString();
                      var reqbody = JSON.parse(JSON.stringify(req.body));
                      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                      await this.errorHandler.generateNotAcceptableException(
                        'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
                      );
                    }
                  } else {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed',
                    );
                  }
                }
              } else {
                if (
                  Number(user_userAuth.otpNextAttemptAllow) > 0
                    ? await this.utilsService.OTPNextAttempExpires(
                      Number(user_userAuth.otpNextAttemptAllow),
                    )
                    : user_userAuth.oneTimePassword != undefined &&
                    !(await this.utilsService.compareOTPAttemp(
                      Number(user_userAuth.otpAttempt),
                    ))
                ) {

                  //Create ActivityEvent child
                  try {
                    var id_child = new mongoose.Types.ObjectId();
                    data_CreateActivityeventsDto_child._id = id_child;
                    data_CreateActivityeventsDto_child.activityEventID =
                      ID_child_ActivityEvent;
                    data_CreateActivityeventsDto_child.activityType =
                      'RECOVER_PASS';
                    data_CreateActivityeventsDto_child.active = true;
                    data_CreateActivityeventsDto_child.status = 'NOTIFY';
                    data_CreateActivityeventsDto_child.target = 'REPLY';
                    data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                    data_CreateActivityeventsDto_child._class =
                      'io.melody.hyppe.trans.domain.ActivityEvent';
                    data_CreateActivityeventsDto_child.action =
                      'NotifyActivityCommand';
                    data_CreateActivityeventsDto_child.payload = {
                      login_location: {
                        latitude: undefined,
                        longitude: undefined,
                      },
                      logout_date: undefined,
                      login_date: undefined,
                      login_device: undefined,
                      email: user_email,
                    };
                    data_CreateActivityeventsDto_child.createdAt = current_date;
                    data_CreateActivityeventsDto_child.updatedAt = current_date;
                    data_CreateActivityeventsDto_child.sequenceNumber =
                      new Int32(2);
                    data_CreateActivityeventsDto_child.flowIsDone = false;
                    data_CreateActivityeventsDto_child.__v = undefined;
                    data_CreateActivityeventsDto_child.parentActivityEventID =
                      ID_parent_ActivityEvent;
                    data_CreateActivityeventsDto_child.userbasic =
                      datauserbasicsService._id;

                    //Insert ActivityEvent Parent
                    await this.activityeventsService.create(
                      data_CreateActivityeventsDto_child,
                    );
                  } catch (error) {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Create Activity events Child. Error: ' +
                      error,
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
                    await this.activityeventsService.update(
                      {
                        _id: user_activityevents[0]._id,
                      },
                      {
                        transitions: data_transitions,
                      },
                    );
                  } catch (error) {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Update Activity events Parent. Error:' +
                      error,
                    );
                  }

                  var OTP = await this.utilsService.generateOTP();
                  var OTP_expires =
                    await this.utilsService.generateOTPExpires();

                  //Update User Auth
                  this.userauthsService.updatebyEmail(user_email, {
                    oneTimePassword: OTP,
                    otpRequestTime: OTP_expires,
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });

                  await this.sendemailOTP(
                    user_userAuth.email.toString(),
                    OTP.toString(),
                    'RECOVER_PASS', lang
                  );

                  var messages = "";
                  if (lang == "en") {
                    messages = "Recovery password request successful";
                  } else {
                    messages = "Permintaan kata sandi pemulihan berhasil";
                  }

                  var fullurl = req.get("Host") + req.originalUrl;
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  var reqbody = JSON.parse(JSON.stringify(req.body));
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                  return {
                    response_code: 202,
                    messages: {
                      info: [messages],
                    },
                  };
                } else {
                  if (lang == "en") {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'OTP max attempt exceeded, please try after ' +
                      process.env.OTP_NEXT_ALLOW_MINUTE +
                      ' minute',
                    );
                  } else {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Upaya maksimal OTP terlampaui, silakan coba setelah ' + process.env.OTP_NEXT_ALLOW_MINUTE +
                      ' menit',
                    );
                  }
                }
              }
            } else {
              if (lang == "en") {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'No users were found. Please check again.',
                );
              } else {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
                );
              }
            }
          } else if (
            StatusNext == 'COMPLETE' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {

            if ('new_password' in req.body) {
              user_password = req.body.new_password;
            } else {
              if (lang == "en") {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Kata sandi baru diperlukan',
                );
              } else {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'New password is required',
                );
              }
            }

            this.userauthsService.updatebyEmail(user_email, {
              password: bcrypt.hashSync(user_password, 5),
            });

            const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);
            if (await this.utilsService.ceckData(datajwtrefreshtokenService)) {
              this.updateRefreshToken(user_email);
            }

            // Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType =
                'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'COMPLETE';
              data_CreateActivityeventsDto_child.target = 'COMPLETE';
              data_CreateActivityeventsDto_child.event = 'COMPLETE';
              data_CreateActivityeventsDto_child.action =
                'VerifyActivityCommand';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber =
                new Int32(4);
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
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error:' +
                error,
              );
            }

            // Update ActivityEvent Parent
            try {
              const data_transitions = user_activityevents[0].transitions;
              data_transitions.push({
                $ref: 'activityevents',
                $id: new Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              });
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  payload: {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: current_date,
                    login_date: user_activityevents[0].payload.login_date,
                    login_device: undefined,
                    email: user_email,
                  },
                  flowIsDone: true,
                  transitions: data_transitions,
                },
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update Activity Event Parent. Error:' +
                error,
              );
            }

            // Update ActivityEvent All Child True
            try {
              await this.activityeventsService.updateFlowDone(
                user_activityevents[0].activityEventID,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                error,
              );
            }

            var messages = "";
            if (lang == "en") {
              messages = "Change password successful";
            } else {
              messages = "Ganti Kata Sandi berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } else if (
            StatusNext == 'INITIAL' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {

            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action =
                'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                datauserbasicsService._id;

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error: ' +
                error,
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
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update Activity events Parent. Error:' +
                error,
              );
            }

            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            this.userauthsService.updatebyEmail(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP(
              user_userAuth.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } else {
            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action =
                'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                datauserbasicsService._id;

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error: ' +
                error,
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
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update Activity events Parent. Error:' +
                error,
              );
            }

            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            this.userauthsService.updatebyEmail(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP(
              user_userAuth.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          }
        } else {

          //Create ActivityEvent Parent
          try {
            var id_parent = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_parent._id = id_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'RECOVER_PASS';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'NOTIFY';
            data_CreateActivityeventsDto_parent.event = 'RECOVER_PASS';
            data_CreateActivityeventsDto_parent.fork = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_parent.action = 'RecoverPassCommand';
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: undefined,
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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Parent. Error: ' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            var id_child = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_child._id = id_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_child.userbasic =
              datauserbasicsService._id;

            //Insert ActivityEvent Parent
            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error: ' +
              error,
            );
          }

          //Generate OTP
          try {
            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            //Update User Auth
            this.userauthsService.updatebyEmail(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP(
              user_userAuth.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Gnerate OTP. Error: ' + error,
            );
          }
        }
      } else {
        if (lang == "en") {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'No users were found. Please check again.',
          );
        } else {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
          );
        }
      }
    } else {
      if (lang == "en") {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          801,
          'No users were found. Please check again.',
        );
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          801,
          'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
        );
      }
    }
  }


  async sendemailOTP(email: string, OTP: string, type: string, lang?: string) {
    //Send Email
    try {
      var Templates_ = new TemplatesRepo();
      Templates_ = await this.utilsService.getTemplate_repo(type, 'EMAIL');

      var subject = "";
      var body = "";
      var dataLang = "id";

      if (lang != undefined) {
        dataLang = lang;
      }

      if (dataLang == "en") {
        subject = Templates_.subject.toString();
        body = Templates_.body_detail.replace('9021', OTP);
      } else {
        subject = Templates_.subject_id.toString();
        body = Templates_.body_detail_id.replace('9021', OTP);
      }

      //var to = email;
      var to = email;
      var from = '"no-reply" <' + Templates_.from.toString() + '>';
      var subject = subject;
      var html_body = body;
      var send = await this.utilsService.sendEmail(
        to,
        from,
        subject,
        html_body,
      );
      await this.userbasicsService.updateStatusemail(email, (await this.utilsService.getDateTimeString()));
      if (!send) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed Send Email OTP',
        );
      }
    } catch (error) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Send Email OTP. Error:' + error,
      );
    }
  }

  async changepassword(req: any, head: any): Promise<any> {
    if (!(await this.utilsService.validasiTokenEmail(head))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (
      req.body.email == undefined ||
      req.body.oldPass == undefined ||
      req.body.newPass == undefined
    ) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    var user_email_header = head['x-auth-user'];
    var user_email = req.body.email;
    var user_oldPass = req.body.oldPass;
    var user_newPass = req.body.newPass;
    var isMatch = false;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var id_Activityevents_parent = new mongoose.Types.ObjectId();
    var id_Activityevents_child = new mongoose.Types.ObjectId();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    var userLang = await this.utilsService.getUserlanguages(user_email_header);

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = userLang.toString();
    }

    if (await this.utilsService.ceckData(datauserbasicsService)) {
      //Ceck User ActivityEvent Parent
      const user_activityevents =
        await this.activityeventsService.findParentWitoutDevice(
          user_email,
          'CHANGE_PASS',
          false,
        );

      //Ceck UserAuth
      const user_auths = await this.userauthsService.findOne(user_email);
      const passuser = user_auths.password;
      isMatch = await this.utilsService.comparePassword(user_oldPass, passuser);

      if (Object.keys(user_activityevents).length > 0) {
        if (isMatch) {
          this.userauthsService.updatebyEmail(user_email, {
            isEmailVerified: true,
            password: await this.utilsService.generatePassword(user_newPass),
          });

          //Create ActivityEvent child
          try {
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'COMPLETE';
            data_CreateActivityeventsDto_child.target = 'COMPLETE';
            data_CreateActivityeventsDto_child.event = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
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

          //Update ActivityEvent All Child True
          try {
            for (
              var i = 0;
              i < user_activityevents[0].transitions.length;
              i++
            ) {
              await this.activityeventsService.update(
                {
                  activityEventID: user_activityevents[0].transitions[i].oid,
                },
                {
                  flowIsDone: true,
                },
              );
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update ActivityEvent All Child True. Error:' +
              error,
            );
          }

          var messages = "Change password successful";
          if (lang == 'id') {
            messages = 'Ubah kata sandi berhasil'
          } else {
            messages = 'Change password successful'
          }

          return {
            response_code: 202,
            messages: {
              info: [messages],
            },
          };
        } else {

          var messages = "Password not Match";
          if (lang == 'id') {
            messages = 'Kata sandi tidak Cocok'
          } else {
            messages = 'Password not Match'
          }
          await this.errorHandler.generateNotAcceptableException(
            'Kata sandi tidak Cocok',
          );
        }
      } else {
        if (isMatch) {
          this.userauthsService.updatebyEmail(user_email, {
            isEmailVerified: true,
            password: bcrypt.hashSync(user_newPass, 5),
          });

          //Create ActivityEvent Parent
          try {
            data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'CHANGE_PASS';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'COMPLETE';
            data_CreateActivityeventsDto_parent.event = 'CHANGE_PASS';
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_parent.createdAt = current_date;
            data_CreateActivityeventsDto_parent.updatedAt = current_date;
            data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
            data_CreateActivityeventsDto_parent.flowIsDone = true;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
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
              'Unabled to proceed Create Activity events Parent. Error: ' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'COMPLETE';
            data_CreateActivityeventsDto_child.target = 'COMPLETE';
            data_CreateActivityeventsDto_child.event = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = true;
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
              'Unabled to proceed Create Activity events Child. Error: ' +
              error,
            );
          }

          var messages = "";
          if (lang == "en") {
            messages = "Change password successful";
          } else {
            messages = "Ubah kata sandi berhasil";
          }

          return {
            response_code: 202,
            messages: {
              info: [messages],
            },
          };
        } else {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Password not Match',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Kata sandi tidak Cocok',
            );
          }
        }
      }
    } else {
      if (lang == "en") {
        await this.errorHandler.generateNotAcceptableException(
          'No users were found. Please check again.',
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
        );
      }
    }
  }

  async updatelang(req: any, head: any): Promise<any> {
    if (await this.utilsService.validasiTokenEmail(head)) {
      if (req.body.langIso == undefined) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed',
        );
      }

      try {
        var langIso = req.body.langIso;
        var languages = await this.languagesService.findOneLangiso(langIso);
        var data_update_userbasict = {};
        if ((await this.utilsService.ceckData(languages))) {
          var languages_id = (await languages)._id;
          // data_update_userbasict['languages'] = {
          //   ref: 'languages',
          //   id: new ObjectId(languages_id),
          //   db: 'hyppe_infra_db',
          // };
          var CreateUserbasicnewDto_ = new CreateuserbasicnewDto();
          CreateUserbasicnewDto_.languagesLang = (await languages).lang.toString();
          CreateUserbasicnewDto_.languagesLangIso = (await languages).langIso.toString();
          CreateUserbasicnewDto_.languages = {
            $ref: 'languages',
            $id: languages_id,
            $db: 'hyppe_infra_db',
          }
          await this.basic2SS.updateLanguage(head['x-auth-user'], CreateUserbasicnewDto_);
        }

        return {
          response_code: 202,
          messages: {
            info: ['The process successful'],
          }
        }
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed ' + error,
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
  }

  async referralcount(req: any, head: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    if (await this.utilsService.validasiTokenEmail(head)) {
      var user_email = head['x-auth-user'];

      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(
        user_email,
      );

      //Ceck User Userbasics
      const datauserbasicsService = await this.userbasicsService.findOne(
        user_email,
      );

      if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datauserauthsService))) {
        try {
          var data_referral = await this.referralService.findAllByParent(user_email);
          var data_referral_parent = await this.referralService.findAllByChildren(user_email);

          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

          return {
            parent: (await this.utilsService.ceckData(data_referral_parent)) ? data_referral_parent[0].parent : "",
            response_code: 202,
            data: data_referral.length,
            messages: {
              info: ['The process successful'],
            },
            list: data_referral
          }
        } catch (error) {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed',
          );
        }
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed',
        );
      }
    } else {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
  }

  async referralcount2(req: any, head: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    if (await this.utilsService.validasiTokenEmail(head)) {
      var user_email = head['x-auth-user'];

      //Ceck User Userbasics
      const datauserbasicsService = await this.basic2SS.findbyemail(
        user_email,
      );

      if (await this.utilsService.ceckData(datauserbasicsService)) {
        try {
          // var data_referral = await this.referralService.findAllByParent(user_email);
          var data_referral = await this.referralService.newlisting(user_email);
          // var data_referral_parent = await this.referralService.findAllByChildren(user_email);
          var data_referral_parent = await this.referralService.findAllByChildren(user_email);

          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

          return {
            parent: (await this.utilsService.ceckData(data_referral_parent)) ? data_referral_parent[0].parent : "",
            response_code: 202,
            data: data_referral.length,
            messages: {
              info: ['The process successful'],
            },
            list: data_referral
          }
        } catch (error) {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed' + error,
          );
        }
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed',
        );
      }
    } else {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
  }

  async referral(req: any, head: any): Promise<any> {
    var user_email_parent = null;
    var user_username_parent = null;
    var user_imei_children = null;
    var user_email_children = null;
    var email_ceck = false;
    var current_date = await this.utilsService.getDateTimeString();

    if (head['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, required param email header',
      );
    } else {
      user_email_children = head['x-auth-user'];
    }

    if (req.body.imei == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, required param imei',
      );
    } else {
      user_imei_children = req.body.imei;
    }

    if (req.body.email == undefined) {
      if (req.body.username != undefined) {
        email_ceck = true;
        user_username_parent = req.body.username;
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, required param email or username',
        );
      }
    } else {
      email_ceck = false;
      user_email_parent = req.body.email;
    }

    var datauserauthService_parent = null;
    var datauserauthService_children = null;

    var useLanguage = await this.utilsService.getUserlanguages(head['x-auth-user']);
    var errorMessages = "";
    //Ceck User auth child
    datauserauthService_children = await this.userauthsService.findOneemail(user_email_children);
    if (!(await this.utilsService.ceckData(datauserauthService_children))) {
      if (useLanguage == "en") {
        errorMessages = "User not found, please check the username again";
      } else {
        errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
      }
      await this.errorHandler.generateNotAcceptableException(
        errorMessages,
      );
    }

    if (email_ceck) {
      //Ceck User auth parent
      datauserauthService_parent = await this.userauthsService.findOneUsername(user_username_parent);
      if (await this.utilsService.ceckData(datauserauthService_parent)) {
        user_email_parent = datauserauthService_parent.email;
      } else {
        if (useLanguage == "en") {
          errorMessages = "User not found, please check the username again";
        } else {
          errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
        }
        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    } else {
      //Ceck User auth parent
      datauserauthService_parent = await this.userauthsService.findOneemail(user_email_parent);
      if (!(await this.utilsService.ceckData(datauserauthService_parent))) {
        if (useLanguage == "en") {
          errorMessages = "User not found, please check the username again";
        } else {
          errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
        }
        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    }

    if (user_email_parent != "" && user_imei_children != "") {
      var data_refferal = await this.referralService.findOneInChildParent(user_email_children, user_email_parent);
      if (!(await this.utilsService.ceckData(data_refferal))) {
        var data_imei = await this.referralService.findOneInIme(user_imei_children);
        if (!(await this.utilsService.ceckData(data_imei))) {
          var CreateReferralDto_ = new CreateReferralDto();
          CreateReferralDto_._id = (await this.utilsService.generateId())
          CreateReferralDto_.parent = user_email_parent;
          CreateReferralDto_.children = user_email_children;
          CreateReferralDto_.active = true;
          CreateReferralDto_.verified = true;
          CreateReferralDto_.createdAt = current_date;
          CreateReferralDto_.updatedAt = current_date;
          CreateReferralDto_.imei = user_imei_children;
          CreateReferralDto_._class = "io.melody.core.domain.Referral";
          await this.referralService.create(CreateReferralDto_);



          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var _id_3 = (await this.utilsService.generateId());
          var _id_4 = (await this.utilsService.generateId());

          // var CreateContenteventsDto1 = new CreateContenteventsDto();
          // CreateContenteventsDto1._id = _id_1
          // CreateContenteventsDto1.contentEventID = (await this.utilsService.generateId())
          // CreateContenteventsDto1.email = LoginRequest_.referral
          // CreateContenteventsDto1.eventType = "FOLLOWER"
          // CreateContenteventsDto1.active = true
          // CreateContenteventsDto1.event = "REQUEST"
          // CreateContenteventsDto1.createdAt = current_date
          // CreateContenteventsDto1.updatedAt = current_date
          // CreateContenteventsDto1.sequenceNumber = 0
          // CreateContenteventsDto1.flowIsDone = true
          // CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          // CreateContenteventsDto1.senderParty = LoginRequest_.email
          // CreateContenteventsDto1.transitions = [{
          //   $ref: 'contentevents',
          //   $id: Object(_id_2),
          //   $db: 'hyppe_trans_db',
          // }]

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
          CreateContenteventsDto2.email = user_email_parent
          CreateContenteventsDto2.eventType = "FOLLOWER"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.receiverParty = user_email_children
          CreateContenteventsDto2.parentContentEventID = _id_1

          // var CreateContenteventsDto3 = new CreateContenteventsDto();
          // CreateContenteventsDto3._id = _id_3
          // CreateContenteventsDto3.contentEventID = (await this.utilsService.generateId())
          // CreateContenteventsDto3.email = LoginRequest_.email
          // CreateContenteventsDto3.eventType = "FOLLOWING"
          // CreateContenteventsDto3.active = true
          // CreateContenteventsDto3.event = "INITIAL"
          // CreateContenteventsDto3.createdAt = current_date
          // CreateContenteventsDto3.updatedAt = current_date
          // CreateContenteventsDto3.sequenceNumber = 0
          // CreateContenteventsDto3.flowIsDone = true
          // CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
          // CreateContenteventsDto3.receiverParty = LoginRequest_.referral
          // CreateContenteventsDto3.transitions = [{
          //   $ref: 'contentevents',
          //   $id: Object(_id_4),
          //   $db: 'hyppe_trans_db',
          // }]

          var CreateContenteventsDto4 = new CreateContenteventsDto();
          CreateContenteventsDto4._id = _id_4
          CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
          CreateContenteventsDto4.email = user_email_children
          CreateContenteventsDto4.eventType = "FOLLOWING"
          CreateContenteventsDto4.active = true
          CreateContenteventsDto4.event = "ACCEPT"
          CreateContenteventsDto4.createdAt = current_date
          CreateContenteventsDto4.updatedAt = current_date
          CreateContenteventsDto4.sequenceNumber = 1
          CreateContenteventsDto4.flowIsDone = true
          CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto4.senderParty = user_email_parent
          CreateContenteventsDto4.parentContentEventID = _id_3

          //await this.contenteventsService.create(CreateContenteventsDto1);
          await this.contenteventsService.create(CreateContenteventsDto2);
          //await this.contenteventsService.create(CreateContenteventsDto3);
          await this.contenteventsService.create(CreateContenteventsDto4);
          await this.insightsService.updateFollower(user_email_parent);
          await this.insightsService.updateFollowing(user_email_children);

          if (useLanguage == "en") {
            errorMessages = "Congratulation referral applied successfully";
          } else {
            errorMessages = "Selamat kode referral berhasil digunakan";
          }
          return {
            "response_code": 202,
            "messages": {
              "info": [
                errorMessages
              ]
            }
          };
        } else {
          if (useLanguage == "en") {
            errorMessages = "Referral Failed, Your device has been registered, please use another device";
          } else {
            errorMessages = "Referral Tidak Berhasil, Perangkat kamu telah terdaftar, harap gunakan perangkat lainnya";
          }
          await this.errorHandler.generateNotAcceptableException(
            errorMessages,
          );
        }
      } else {
        if (useLanguage == "en") {
          errorMessages = "Referral Failed, Username has been registered, please use another username";
        } else {
          errorMessages = "Referral Tidak Berhasil, Username telah terdaftar sebagai referral kamu, silahkan ganti dengan username lainnya";
        }
        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    }
  }

  async referralqrcode(req: any, head: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    if (await this.utilsService.validasiTokenEmail(head)) {
      if (head['x-auth-user'] == undefined) {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed auth-user undefined',
        );
      }
      if (req.body.refCode == undefined) {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed refCode undefined',
        );
      }
      var user_email = head['x-auth-user'];
      var user_email_refCode = req.body.refCode;
      var current_date = await this.utilsService.getDateTimeString();

      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(
        user_email,
      );

      //Ceck User Userbasics
      const datauserbasicsService = await this.userbasicsService.findOne(
        user_email,
      );

      var mediaprofilepicts_json = null;
      if (datauserbasicsService.profilePict != undefined) {
        mediaprofilepicts_json = JSON.parse(
          JSON.stringify(datauserbasicsService.profilePict),
        );
      }

      let mediaprofilepicts = null;
      if (mediaprofilepicts_json != null) {
        mediaprofilepicts = await this.mediaprofilepictsService.findOne(
          mediaprofilepicts_json.$id,
        );
      }

      var mediaprofilepicts_fsSourceUri = ''
      if (mediaprofilepicts != null) {
        if (mediaprofilepicts.fsSourceUri != null) {
          mediaprofilepicts_fsSourceUri = mediaprofilepicts.fsSourceUri;
        }
      }

      if ((await this.utilsService.ceckData(datauserbasicsService))) {
        var data = {
          refCode: user_email_refCode,
          email: user_email,
          fullName: datauserbasicsService.fullName,
          username: datauserauthsService.username,
          image_profile: mediaprofilepicts_fsSourceUri,
        }
        var html_data = await this.utilsService.generateReferralImage(data);

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

        return html_data;
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed user not found',
        );
      }
    } else {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email not match',
      );
    }
  }

  async referralqrcode2(req: any, head: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    if (await this.utilsService.validasiTokenEmail(head)) {
      if (head['x-auth-user'] == undefined) {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed auth-user undefined',
        );
      }
      if (req.body.refCode == undefined) {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed refCode undefined',
        );
      }
      var user_email = head['x-auth-user'];
      var user_email_refCode = req.body.refCode;
      var current_date = await this.utilsService.getDateTimeString();

      //Ceck User Userbasics
      const datauserbasicsService = await this.basic2SS.findbyemail(
        user_email,
      );

      if ((await this.utilsService.ceckData(datauserbasicsService))) {
        var data = {
          refCode: user_email_refCode,
          email: user_email,
          fullName: datauserbasicsService.fullName,
          username: datauserbasicsService.username,
          image_profile: datauserbasicsService.fsSourceUri,
        }
        var html_data = await this.utilsService.generateReferralImage(data);

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

        return html_data;
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed user not found',
        );
      }
    } else {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, head['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email not match',
      );
    }
  }

  async resendotp(req: any): Promise<any> {
    var user_email = null;
    if (req.body.email != undefined) {
      user_email = req.body.email;
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    var current_date = await this.utilsService.getDateTimeString();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';

    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User Userauths
    const datauserauthsService = await this.userauthsService.findOneByEmail(
      user_email,
    );
    if ((await this.utilsService.ceckData(datauserbasicsService)) && (await this.utilsService.ceckData(datauserauthsService))) {

      //Update User Auth
      this.userauthsService.updatebyEmail(user_email, {
        oneTimePassword: null,
        otpRequestTime: new Long(0),
        otpAttempt: new Long(0),
        otpNextAttemptAllow: new Long(0),
      });

      var OTP = await this.utilsService.generateOTP();
      var OTP_expires = await this.utilsService.generateOTPExpires();

      if (Number(datauserauthsService.otpRequestTime) > 0) {
        const user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            'ENROL',
            false,
          );

        if (Object.keys(user_activityevents).length > 0) {

          //Create ActivityEvent child
          try {
            var id_child = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_child._id = id_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'ENROL';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: (user_activityevents[0].payload.login_device != undefined) ? user_activityevents[0].payload.login_device : undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              user_activityevents[0].activityEventID;
            data_CreateActivityeventsDto_child.userbasic =
              user_activityevents[0].userbasic;

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

          //Update ActivityEvent Parent
          try {
            const data_transitions = user_activityevents[0].transitions;
            data_transitions.push({
              $ref: 'activityevents',
              $id: new Object(ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            });

            //Update ActivityEvent Parent
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

          await this.userauthsService.updatebyEmail(user_email, {
            oneTimePassword: OTP,
            otpRequestTime: OTP_expires,
          });

          await this.sendemailOTP(
            datauserauthsService.email.toString(),
            OTP.toString(),
            'ENROL', "id"
          );

          return {
            response_code: 202,
            messages: {
              info: ['Request resend OTP successful'],
            },
          };
        } else {
          await this.userauthsService.updatebyEmail(user_email, {
            oneTimePassword: OTP,
            otpRequestTime: OTP_expires,
          });

          await this.sendemailOTP(
            datauserauthsService.email.toString(),
            OTP.toString(),
            'ENROL', "id"
          );

          return {
            response_code: 202,
            messages: {
              info: ['Request resend OTP successful'],
            },
          };
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, OTP not active',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, User not found',
      );
    }
  }

  async profilePict(mediaprofilepicts: string): Promise<any> {
    var data = await this.seaweedfsService.read(mediaprofilepicts.replace('/localrepo', ''));
    return data;
  }

  async updateRole(email: string, head: any, req: any) {
    if ((email == undefined) || (head['x-auth-token'] == undefined)) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (!(await this.utilsService.validasiTokenEmailParam(head['x-auth-token'], email))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email dan token not match',
      );
    }
    if (req.body.roles == undefined || req.body.status == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (req.body.roles == "" || req.body.status == "") {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    var roles = req.body.roles;
    var status = req.body.status;

    try {
      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(
        email,
      );

      var response_status = '';
      if (await this.utilsService.ceckData(datauserauthsService)) {
        if (datauserauthsService.upgradeRole != 'FINISH') {
          if (status == "ON_PROGRESS") {
            await this.userauthsService.findUpdateEmailStatusRole(email, status);
            await this.sendemailVerification(email, 'PREMIUM_VERIFIKASI');
            response_status = (await this.userauthsService.findOneByEmail(email)).upgradeRole.toString();
          } else if (status == "CECK") {
            if (datauserauthsService.upgradeRole == undefined) {
              response_status = null;
            } else {
              response_status = (await this.userauthsService.findOneByEmail(email)).upgradeRole.toString();
            }
          } else if (status == "FINISH") {
            await this.userauthsService.findUpdateEmailStatusRole(email, status);
            await this.userauthsService.update(email, roles);
            response_status = (await this.userauthsService.findOneByEmail(email)).upgradeRole.toString();
          }
        } else {
          response_status = (await this.userauthsService.findOneByEmail(email)).upgradeRole.toString();
        }

        return {
          response_code: 202,
          status_user: response_status,
          messages: {
            info: ['Request Update ' + response_status],
          },
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'User Not Found!',
        );
      }
    } catch (e) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed ' + e,
      );
    }
  }

  async sendemailVerification(email: string, type: string) {
    //Send Email
    try {
      var Templates_ = new TemplatesRepo();
      const cheerio = require('cheerio');
      Templates_ = await this.utilsService.getTemplate_repo(type, 'EMAIL');
      var link = Templates_.action_buttons.toString();
      var html_body = Templates_.body_detail.trim().toString();
      const $_ = cheerio.load(html_body);
      $_('#linkverifikasi').attr('href', link + email);

      //var to = email;
      var to = email;
      var from = '"no-reply" <' + Templates_.from.toString() + '>';
      var subject = Templates_.subject.toString();
      var html_body_ = $_.html().toString();
      var send = await this.utilsService.sendEmail(
        to,
        from,
        subject,
        html_body_,
      );
      if (!send) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed Send Email OTP',
        );
      }
    } catch (error) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Send Email OTP. Error:' + error,
      );
    }
  }

  async signupsosmed(req: any) {
    var timestamps_start = await this.utilsService.getDateTimeString();

    this.logger.log("signupsosmed >>> start: ");
    var user_email = null;
    var user_socmedSource = null;
    var user_deviceId = null;
    var user_langIso = null;
    var user_referral = null;
    var user_devicetype = null;
    var user_imei = null;

    if (req.body.email == undefined) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


      await this.errorHandler.generateNotAcceptableException(
        'Email is mandatory',
      );
    } else {
      if (req.body.email == '') {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


        await this.errorHandler.generateNotAcceptableException(
          'Email is mandatory',
        );
      } else {
        user_email = req.body.email;
      }
    }

    if (req.body.socmedSource == undefined) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Socmed is mandatory',
      );
    } else {
      if (req.body.socmedSource == '') {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
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
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
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


        if (datauserauthsService.isEmailVerified != undefined) {
          this.userauthsService.updatebyId(datauserauthsService._id.toString(), { isEmailVerified: true, loginSource: user_socmedSource });
        }

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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
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
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
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
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
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

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


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
            token: token,
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
            isComplete: "false",
            status: "INITIAL",
            refreshToken: datajwtrefreshtoken_data.refresh_token_id
          },
          messages: {
            nextFlow: [
              "$.event: next should UPDATE_BIO",
              "$.status: next should IN_PROGRESS"
            ],
            info: ['Login successful'],
          },
        };
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
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
        dataactivityevents =
          await this.activityeventsService.findParent(
            user_email,
            user_deviceId,
            type,
            false,
          );
      } else {
        dataactivityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );
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
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
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
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
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
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
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
          data_CreateUserauthDto.loginSource = user_socmedSource;
          data_CreateUserauthDto._class = _class_UserAuths;
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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error: ' +
            error,
          );
        }

        //Referral
        if (user_referral != null && user_referral.length > 0) {
          //Ceck User Userbasics Parent
          const datauserbasicsService_parent = await this.userbasicsService.findOne(
            user_referral,
          );
          if (await this.utilsService.ceckData(datauserbasicsService_parent)) {

            //Ceck User Referral parent children
            const data_referral_parent_children = await this.referralService.findAllByParentChildren(
              user_referral, user_email,
            );
            if (!(await this.utilsService.ceckData(data_referral_parent_children))) {
              //Insert Referral
              try {
                var CreateReferralDto_ = new CreateReferralDto();
                CreateReferralDto_._id = (await this.utilsService.generateId()).toLowerCase();
                CreateReferralDto_.parent = user_referral;
                CreateReferralDto_.children = user_email;
                if (user_imei != null) {
                  CreateReferralDto_.imei = user_imei;
                }
                CreateReferralDto_.active = true;
                CreateReferralDto_.verified = true;
                CreateReferralDto_.createdAt = current_date;
                CreateReferralDto_.updatedAt = current_date;
                CreateReferralDto_._class = _class_Referral;

                this.referralService.create(CreateReferralDto_);

                var _id_2 = (await this.utilsService.generateId());
                var _id_4 = (await this.utilsService.generateId());

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
              } catch (error) {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed Create Refferal. Error:' +
                  error,
                );
              }
            }
          }
        }

        //Create Or Update refresh Token
        await this.updateRefreshToken(user_email);

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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error:' +
            error,
          );
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


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
            token: token,
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
            refreshToken: datajwtrefreshtoken_data.refresh_token_id
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
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Sorry! This email already registered',
        );
      }
    }
  }

  async getuserprofile(req: any, head: any) {

  }

  // async signsosmed(req: any) {
  //   this.logger.log("signsosmed >>> start: " + JSON.stringify(req.body));
  //   var user_email = req.body.email;
  //   var user_socmedSource = req.body.socmedSource;
  //   var user_deviceId = req.body.deviceId;
  //   var user_devicetype = req.body.devicetype;
  //   var user_langIso = req.body.langIso;
  //   var user_imei = req.body.imei;
  //   var current_date = await this.utilsService.getDateTimeString();

  //   var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
  //   var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
  //   var data_CreateUserdeviceDto = new CreateUserdeviceDto();

  //   var ID_parent_ActivityEvent = (
  //     await this.utilsService.generateId()
  //   ).toLowerCase();
  //   var ID_child_ActivityEvent = (
  //     await this.utilsService.generateId()
  //   ).toLowerCase();

  //   var ID_user_userdevicesService = null;
  //   var id_Activityevents_parent = new mongoose.Types.ObjectId();
  //   var id_Activityevents_child = new mongoose.Types.ObjectId();

  //   var type = 'LOGIN';
  //   var status = 'INITIAL';
  //   var event = 'LOGIN';

  //   var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
  //   var _class_UserDevices = 'io.melody.core.domain.UserDevices';

  //   var _isEmailVerified = false;

  //   //Ceck User ActivityEvent Parent
  //   const user_activityevents = await this.activityeventsService.findParent(
  //     user_email,
  //     user_deviceId,
  //     'LOGIN',
  //     false,
  //   );
  //   console.log(user_activityevents);

  //   //Ceck User Userdevices
  //   const user_userdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

  //   //Ceck User Userauths
  //   const datauserauthsService = await this.userauthsService.findOneByEmail(
  //     user_email,
  //   );

  //   //Ceck User Userbasics
  //   const datauserbasicsService = await this.userbasicsService.findOne(
  //     user_email,
  //   );

  //   //Ceck User jwtrefresh token
  //   const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
  //     user_email,
  //   );
  //   if (
  //     (await this.utilsService.ceckData(datauserbasicsService)) &&
  //     (await this.utilsService.ceckData(datajwtrefreshtoken))
  //   ) {

  //     if (await this.utilsService.ceckData(datauserauthsService)) {
  //       _isEmailVerified = datauserauthsService.isEmailVerified;
  //     } else {
  //       await this.errorHandler.generateNotAcceptableException(
  //         'User auths not found',
  //       );
  //     }

  //     //if (_isEmailVerified) {


  //     if (datauserauthsService.isEmailVerified != undefined) {
  //       this.userauthsService.updatebyId(datauserauthsService._id.toString(), { isEmailVerified: true, loginSource: user_socmedSource });
  //     }
  //     let messages;
  //     //ActivityEvent Parent > 0
  //     if (Object.keys(user_activityevents).length > 0) {

  //       //Create ActivityEvent child
  //       try {
  //         data_CreateActivityeventsDto_child._id = id_Activityevents_child;
  //         data_CreateActivityeventsDto_child.activityEventID =
  //           ID_child_ActivityEvent;
  //         data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
  //         data_CreateActivityeventsDto_child.active = true;
  //         data_CreateActivityeventsDto_child.status = 'INITIAL';
  //         data_CreateActivityeventsDto_child.target = 'ACTIVE';
  //         data_CreateActivityeventsDto_child.event = 'AWAKE';
  //         data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
  //         data_CreateActivityeventsDto_child.payload = {
  //           login_location: {
  //             latitude: "",
  //             longitude: "",
  //           },
  //           logout_date: undefined,
  //           login_date: current_date,
  //           login_device: user_deviceId,
  //           email: user_email,
  //         };
  //         data_CreateActivityeventsDto_child.createdAt = current_date;
  //         data_CreateActivityeventsDto_child.updatedAt = current_date;
  //         data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
  //         data_CreateActivityeventsDto_child.flowIsDone = false;
  //         data_CreateActivityeventsDto_parent.__v = undefined;
  //         data_CreateActivityeventsDto_child.parentActivityEventID =
  //           user_activityevents[0].activityEventID;
  //         data_CreateActivityeventsDto_child.userbasic =
  //           datauserbasicsService._id;

  //         //Insert ActivityEvent child



  //         const event = await this.activityeventsService.create(
  //           data_CreateActivityeventsDto_child,
  //         );
  //         let idevent = event._id;
  //         let eventType = event.event.toString();

  //         await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, datauserbasicsService._id);
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed Create Activity events Child. Error:' + error,
  //         );
  //       }

  //       //Update ActivityEvent Parent
  //       try {
  //         const data_transitions = user_activityevents[0].transitions;
  //         data_transitions.push({
  //           $ref: 'activityevents',
  //           $id: new Object(ID_child_ActivityEvent),
  //           $db: 'hyppe_trans_db',
  //         });

  //         //Update ActivityEvent Parent
  //         const update_activityevents_parent =
  //           await this.activityeventsService.update(
  //             {
  //               _id: user_activityevents[0]._id,
  //             },
  //             {
  //               transitions: data_transitions,
  //             },
  //           );
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed Update Activity events Parent. Error:' +
  //           error,
  //         );
  //       }

  //       messages = {
  //         info: ['Device activity logging successful'],
  //       };


  //     } else {

  //       //Create ActivityEvent Parent
  //       try {
  //         data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
  //         data_CreateActivityeventsDto_parent.activityEventID =
  //           ID_parent_ActivityEvent;
  //         data_CreateActivityeventsDto_parent.activityType = type;
  //         data_CreateActivityeventsDto_parent.active = true;
  //         data_CreateActivityeventsDto_parent.status = status;
  //         data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
  //         data_CreateActivityeventsDto_parent.event = event;
  //         data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
  //         data_CreateActivityeventsDto_parent.payload = {
  //           login_location: {
  //             latitude: "",
  //             longitude: "",
  //           },
  //           logout_date: undefined,
  //           login_date: current_date,
  //           login_device: user_deviceId,
  //           email: user_email,
  //         };
  //         data_CreateActivityeventsDto_parent.createdAt = current_date;
  //         data_CreateActivityeventsDto_parent.updatedAt = current_date;
  //         data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
  //         data_CreateActivityeventsDto_parent.flowIsDone = false;
  //         data_CreateActivityeventsDto_parent.__v = undefined;
  //         data_CreateActivityeventsDto_parent.transitions = [
  //           {
  //             $ref: 'activityevents',
  //             $id: Object(ID_child_ActivityEvent),
  //             $db: 'hyppe_trans_db',
  //           },
  //         ];
  //         data_CreateActivityeventsDto_parent.userbasic =
  //           datauserbasicsService._id;

  //         //Insert ActivityEvent Parent


  //         const events = await this.activityeventsService.create(
  //           data_CreateActivityeventsDto_parent,
  //         );
  //         let idevent = events._id;
  //         let eventType = events.event.toString();

  //         await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, datauserbasicsService._id);
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed Create Activity events Parent. Error:' +
  //           error,
  //         );
  //       }

  //       //Create ActivityEvent child
  //       try {
  //         data_CreateActivityeventsDto_child._id = id_Activityevents_child;
  //         data_CreateActivityeventsDto_child.activityEventID =
  //           ID_child_ActivityEvent;
  //         data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
  //         data_CreateActivityeventsDto_child.active = true;
  //         data_CreateActivityeventsDto_child.status = status;
  //         data_CreateActivityeventsDto_child.target = 'ACTIVE';
  //         data_CreateActivityeventsDto_child.event = 'AWAKE';
  //         data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
  //         data_CreateActivityeventsDto_child.payload = {
  //           login_location: {
  //             latitude: "",
  //             longitude: ""
  //           },
  //           logout_date: undefined,
  //           login_date: current_date,
  //           login_device: user_deviceId,
  //           email: user_email,
  //         };
  //         data_CreateActivityeventsDto_child.createdAt = current_date;
  //         data_CreateActivityeventsDto_child.updatedAt = current_date;
  //         data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
  //         data_CreateActivityeventsDto_child.flowIsDone = false;
  //         data_CreateActivityeventsDto_parent.__v = undefined;
  //         data_CreateActivityeventsDto_child.parentActivityEventID =
  //           ID_parent_ActivityEvent;
  //         data_CreateActivityeventsDto_child.userbasic =
  //           datauserbasicsService._id;

  //         //Insert ActivityEvent Parent


  //         const event = await this.activityeventsService.create(
  //           data_CreateActivityeventsDto_child,
  //         );
  //         let idevent = event._id;
  //         let eventType = event.event.toString();

  //         await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, datauserbasicsService._id);
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed Create Activity events Child. Error:' + error,
  //         );
  //       }

  //       //Userdevices != null
  //       if (await this.utilsService.ceckData(user_userdevicesService)) {
  //         //Get Userdevices
  //         try {
  //           if (user_devicetype != null) {
  //             await this.userdevicesService.updatebyEmail(
  //               user_email,
  //               user_deviceId,
  //               {
  //                 active: true,
  //                 devicetype: user_devicetype
  //               },
  //             );
  //           } else {
  //             await this.userdevicesService.updatebyEmail(
  //               user_email,
  //               user_deviceId,
  //               {
  //                 active: true
  //               },
  //             );
  //           }
  //           ID_user_userdevicesService = user_userdevicesService._id;
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed Get Userdevices. Error:' + error,
  //           );
  //         }

  //       } else {

  //         //Create Userdevices
  //         try {
  //           ID_user_userdevicesService = (
  //             await this.utilsService.generateId()
  //           ).toLowerCase();
  //           data_CreateUserdeviceDto._id = ID_user_userdevicesService;
  //           data_CreateUserdeviceDto.deviceID = user_deviceId;
  //           data_CreateUserdeviceDto.email = user_email;
  //           data_CreateUserdeviceDto.active = true;
  //           data_CreateUserdeviceDto._class = _class_UserDevices;
  //           data_CreateUserdeviceDto.createdAt = current_date;
  //           data_CreateUserdeviceDto.updatedAt = current_date;
  //           data_CreateUserdeviceDto.devicetype = user_devicetype;
  //           //Insert User Userdevices
  //           await this.userdevicesService.create(data_CreateUserdeviceDto);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed Create Userdevices. Error:' + error,
  //           );
  //         }

  //       }

  //       //Update Devices Userauths
  //       try {
  //         //Get Devices Userauths
  //         const datauserauthsService_devices = datauserauthsService.devices;

  //         //Filter ID_user_userdevicesService Devices UserDevices
  //         var filteredData = datauserauthsService_devices.filter(function (
  //           datauserauthsService_devices,
  //         ) {
  //           return (
  //             JSON.parse(JSON.stringify(datauserauthsService_devices)).$id ===
  //             ID_user_userdevicesService
  //           );
  //         });

  //         if (filteredData.length == 0) {
  //           //Pust Devices Userauths
  //           datauserauthsService_devices.push({
  //             $ref: 'userdevices',
  //             $id: Object(ID_user_userdevicesService),
  //             $db: 'hyppe_trans_db',
  //           });

  //           await this.userauthsService.updatebyEmail(user_email, {
  //             devices: datauserauthsService_devices,
  //           });
  //         }
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed Update Devices Userauths. Error:' + error,
  //         );
  //       }

  //       messages = {
  //         info: ['Login successful'],
  //       };

  //     }

  //     var countries_json = null;
  //     if (datauserbasicsService.countries != undefined) {
  //       countries_json = JSON.parse(
  //         JSON.stringify(datauserbasicsService.countries),
  //       );
  //     }
  //     var languages_json = null;
  //     if (datauserbasicsService.languages != undefined) {
  //       languages_json = JSON.parse(
  //         JSON.stringify(datauserbasicsService.languages),
  //       );
  //     }
  //     var mediaprofilepicts_json = null;
  //     if (datauserbasicsService.profilePict != undefined) {
  //       mediaprofilepicts_json = JSON.parse(
  //         JSON.stringify(datauserbasicsService.profilePict),
  //       );
  //     }
  //     var insights_json = null;
  //     if (datauserbasicsService.insight != undefined) {
  //       insights_json = JSON.parse(
  //         JSON.stringify(datauserbasicsService.insight),
  //       );
  //     }

  //     var interests_array = [];
  //     if (datauserbasicsService.userInterests.length > 0) {
  //       for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
  //         var interests_json = JSON.parse(
  //           JSON.stringify(datauserbasicsService.userInterests[i]),
  //         );
  //         if (interests_json.ref == 'interests_repo') {
  //           const interests = await this.interestsRepoService.findOne(
  //             interests_json.$id,
  //           );
  //           interests_array[i] = interests.interestName;
  //         } else {
  //           const interests = await this.interestsRepoService.findOne(
  //             interests_json.$id,
  //           );
  //           if (interests != undefined) {
  //             interests_array[i] = interests.interestName;
  //           }

  //         }
  //       }
  //     }

  //     let countries = null;
  //     if (countries_json != null) {
  //       countries = await this.countriesService.findOne(countries_json.$id);
  //     }

  //     let languages = null;
  //     if (languages_json != null) {
  //       languages = await this.languagesService.findOne(languages_json.$id);
  //     }

  //     let mediaprofilepicts = null;
  //     if (mediaprofilepicts_json != null) {
  //       mediaprofilepicts = await this.mediaprofilepictsService.findOne(
  //         mediaprofilepicts_json.$id,
  //       );
  //     }

  //     let insights = null;
  //     if (insights_json != null) {
  //       insights = await this.insightsService.findOne(insights_json.$id);
  //     }

  //     var mediaUri = null;
  //     if (mediaprofilepicts != null) {
  //       mediaUri = mediaprofilepicts.mediaUri;
  //     }

  //     let result = null;
  //     if (mediaUri != null) {
  //       result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
  //     }

  //     var mediaprofilepicts_res = {}
  //     if (mediaprofilepicts != null) {
  //       if (mediaprofilepicts.mediaBasePath != null) {
  //         mediaprofilepicts_res["mediaBasePath"] = mediaprofilepicts.mediaBasePath;
  //       }

  //       if (mediaprofilepicts.mediaUri != null) {
  //         mediaprofilepicts_res["mediaUri"] = mediaprofilepicts.mediaUri;
  //       }

  //       if (mediaprofilepicts.mediaType != null) {
  //         mediaprofilepicts_res['mediaType'] = mediaprofilepicts.mediaType;
  //       }
  //     }

  //     if (result != null) {
  //       mediaprofilepicts_res["mediaEndpoint"] = result;
  //     }

  //     var insights_res = {};
  //     if (insights != undefined) {
  //       insights_res = {
  //         shares: insights.shares,
  //         followers: insights.followers,
  //         comments: insights.comments,
  //         followings: insights.followings,
  //         reactions: insights.reactions,
  //         posts: insights.posts,
  //         views: insights.views,
  //         likes: insights.likes,
  //       };
  //     }

  //     var token = (
  //       await this.utilsService.generateToken(user_email, user_deviceId)
  //     ).toString();

  //     const data = {};
  //     if (countries != null) {
  //       data["country"] = countries.country;
  //     }
  //     data["roles"] = datauserauthsService.roles;
  //     data["fullName"] = datauserbasicsService.fullName;
  //     data["bio"] = datauserbasicsService.bio;
  //     if (await this.utilsService.ceckData(mediaprofilepicts_res)) {
  //       data['avatar'] = mediaprofilepicts_res;
  //     }
  //     data["isIdVerified"] = datauserbasicsService.isIdVerified;
  //     data["isEmailVerified"] = datauserauthsService.isEmailVerified;
  //     data["token"] = 'Bearer ' + token;
  //     data["idProofStatus"] = datauserbasicsService.idProofStatus;
  //     data["insight"] = insights_res;
  //     if (languages != null) {
  //       data["langIso"] = languages.langIso;
  //     }
  //     data["interest"] = interests_array;
  //     data["event"] = datauserbasicsService.event;
  //     data["email"] = datauserbasicsService.email;
  //     data["iduser"] = datauserbasicsService._id;
  //     data["username"] = datauserauthsService.username;
  //     data["isComplete"] = datauserbasicsService.isComplete;
  //     data["status"] = datauserbasicsService.status;
  //     data["refreshToken"] = datajwtrefreshtoken.refresh_token_id;

  //     return {
  //       response_code: 202,
  //       data,
  //       messages,
  //     };
  //     // } else {
  //     //   await this.errorHandler.generateNotAcceptableException(
  //     //     'Unexpected problem, please check your email and re-verify the OTP',
  //     //   );
  //     // }
  //   } else {

  //     return this.signupsosmed(req);

  //     //await this.errorHandler.generateNotAcceptableException(
  //     //  'User basics and jwt not found',
  //     //);
  //   }
  // }

  async signsosmed(req: any) {
    var timestamps_start = await this.utilsService.getDateTimeString();

    this.logger.log("signsosmed >>> start: " + JSON.stringify(req.body));
    var user_email = req.body.email;
    var user_socmedSource = req.body.socmedSource;
    var user_deviceId = req.body.deviceId;
    var user_devicetype = req.body.devicetype;
    var user_langIso = req.body.langIso;
    var user_imei = req.body.imei;
    var current_date = await this.utilsService.getDateTimeString();
    var getdevicedata = null;

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
    var data_CreateUserdeviceDto = new CreateUserdeviceDto();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var ID_user_userdevicesService = null;
    var id_Activityevents_parent = new mongoose.Types.ObjectId();
    var id_Activityevents_child = new mongoose.Types.ObjectId();

    var type = 'LOGIN';
    var status = 'INITIAL';
    var event = 'LOGIN';

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';

    var _isEmailVerified = false;

    //Ceck User ActivityEvent Parent
    const user_activityevents = await this.activityeventsService.findParent(
      user_email,
      user_deviceId,
      'LOGIN',
      false,
    );

    //Ceck User Userdevices
    const user_userdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);
    if (user_userdevicesService != null && user_userdevicesService != undefined) {
      if (user_userdevicesService.devicetype != undefined && user_userdevicesService.devicetype != null) {
        getdevicedata = user_userdevicesService.devicetype;
      }
    }

    //Ceck User Userauths
    const datauserauthsService = await this.userauthsService.findOneByEmail(
      user_email,
    );

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    //Ceck User jwtrefresh token
    const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
      user_email,
    );
    if (
      (await this.utilsService.ceckData(datauserbasicsService)) &&
      (await this.utilsService.ceckData(datajwtrefreshtoken))
    ) {

      if (await this.utilsService.ceckData(datauserauthsService)) {
        _isEmailVerified = datauserauthsService.isEmailVerified;
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'User auths not found',
        );
      }

      //if (_isEmailVerified) {


      if (datauserauthsService.isEmailVerified != undefined) {
        this.userauthsService.updatebyId(datauserauthsService._id.toString(), { isEmailVerified: true, loginSource: user_socmedSource });
      }
      let messages;
      //ActivityEvent Parent > 0
      if (Object.keys(user_activityevents).length > 0) {

        //Create ActivityEvent child
        try {
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
              latitude: "",
              longitude: "",
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
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic =
            datauserbasicsService._id;

          //Insert ActivityEvent child



          const event = await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
          let idevent = event._id;
          let eventType = event.event.toString();

          await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, datauserbasicsService._id);
        } catch (error) {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity events Parent. Error:' +
            error,
          );
        }

        messages = {
          info: ['Device activity logging successful'],
        };


      } else {

        //Create ActivityEvent Parent
        try {
          data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
          data_CreateActivityeventsDto_parent.activityEventID =
            ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = type;
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = status;
          data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
          data_CreateActivityeventsDto_parent.event = event;
          data_CreateActivityeventsDto_parent._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: "",
              longitude: "",
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


          const events = await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );
          let idevent = events._id;
          let eventType = events.event.toString();

          await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, datauserbasicsService._id);
        } catch (error) {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Parent. Error:' +
            error,
          );
        }

        //Create ActivityEvent child
        try {
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = status;
          data_CreateActivityeventsDto_child.target = 'ACTIVE';
          data_CreateActivityeventsDto_child.event = 'AWAKE';
          data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: "",
              longitude: ""
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


          const event = await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
          let idevent = event._id;
          let eventType = event.event.toString();

          await this.utilsService.counscore("AE", "prodAll", "activityevents", idevent, eventType, datauserbasicsService._id);
        } catch (error) {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity events Child. Error:' + error,
          );
        }

        //Userdevices != null
        if (await this.utilsService.ceckData(user_userdevicesService)) {
          //Get Userdevices
          try {
            if (user_devicetype != null) {
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: true,
                  devicetype: user_devicetype
                },
              );

              getdevicedata = user_devicetype;
            } else {
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: true
                },
              );
            }
            ID_user_userdevicesService = user_userdevicesService._id;
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Userdevices. Error:' + error,
            );
          }

        } else {

          //Create Userdevices
          try {
            ID_user_userdevicesService = (
              await this.utilsService.generateId()
            ).toLowerCase();
            data_CreateUserdeviceDto._id = ID_user_userdevicesService;
            data_CreateUserdeviceDto.deviceID = user_deviceId;
            data_CreateUserdeviceDto.email = user_email;
            data_CreateUserdeviceDto.active = true;
            data_CreateUserdeviceDto._class = _class_UserDevices;
            data_CreateUserdeviceDto.createdAt = current_date;
            data_CreateUserdeviceDto.updatedAt = current_date;
            data_CreateUserdeviceDto.devicetype = user_devicetype;
            if (user_devicetype != null) {
              getdevicedata = user_devicetype;
            }
            //Insert User Userdevices
            await this.userdevicesService.create(data_CreateUserdeviceDto);
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Userdevices. Error:' + error,
            );
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
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Devices Userauths. Error:' + error,
          );
        }

        messages = {
          info: ['Login successful'],
        };

      }

      var countries_json = null;
      if (datauserbasicsService.countries != undefined) {
        countries_json = JSON.parse(
          JSON.stringify(datauserbasicsService.countries),
        );
      }
      var languages_json = null;
      if (datauserbasicsService.languages != undefined) {
        languages_json = JSON.parse(
          JSON.stringify(datauserbasicsService.languages),
        );
      }
      var mediaprofilepicts_json = null;
      if (datauserbasicsService.profilePict != undefined) {
        mediaprofilepicts_json = JSON.parse(
          JSON.stringify(datauserbasicsService.profilePict),
        );
      }
      var insights_json = null;
      if (datauserbasicsService.insight != undefined) {
        insights_json = JSON.parse(
          JSON.stringify(datauserbasicsService.insight),
        );
      }

      var interests_array = [];
      if (datauserbasicsService.userInterests.length > 0) {
        for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
          var interests_json = JSON.parse(
            JSON.stringify(datauserbasicsService.userInterests[i]),
          );
          if (interests_json.ref == 'interests_repo') {
            const interests = await this.interestsRepoService.findOne(
              interests_json.$id,
            );
            interests_array[i] = interests.interestName;
          } else {
            const interests = await this.interestsRepoService.findOne(
              interests_json.$id,
            );
            if (interests != undefined) {
              interests_array[i] = interests.interestName;
            }

          }
        }
      }

      let countries = null;
      if (countries_json != null) {
        countries = await this.countriesService.findOne(countries_json.$id);
      }

      let languages = null;
      if (languages_json != null) {
        languages = await this.languagesService.findOne(languages_json.$id);
      }

      let mediaprofilepicts = null;
      if (mediaprofilepicts_json != null) {
        mediaprofilepicts = await this.mediaprofilepictsService.findOne(
          mediaprofilepicts_json.$id,
        );
      }

      let insights = null;
      if (insights_json != null) {
        insights = await this.insightsService.findOne(insights_json.$id);
      }

      var mediaUri = null;
      if (mediaprofilepicts != null) {
        mediaUri = mediaprofilepicts.mediaUri;
      }
      var mediaID = null;
      if (mediaprofilepicts != null) {
        mediaID = mediaprofilepicts.mediaID;
      }

      let result = null;
      if (mediaID != null) {
        result = '/profilepict/' + mediaID;
      }

      var mediaprofilepicts_res = {}
      if (mediaprofilepicts != null) {
        if (mediaprofilepicts.mediaBasePath != null) {
          mediaprofilepicts_res["mediaBasePath"] = mediaprofilepicts.mediaBasePath;
        }

        if (mediaprofilepicts.mediaUri != null) {
          mediaprofilepicts_res["mediaUri"] = mediaprofilepicts.mediaUri;
        }

        if (mediaprofilepicts.mediaType != null) {
          mediaprofilepicts_res['mediaType'] = mediaprofilepicts.mediaType;
        }
      }

      if (result != null) {
        mediaprofilepicts_res["mediaEndpoint"] = result;
      }

      var insights_res = {};
      if (insights != undefined) {
        insights_res = {
          shares: insights.shares,
          followers: insights.followers,
          comments: insights.comments,
          followings: insights.followings,
          reactions: insights.reactions,
          posts: insights.posts,
          views: insights.views,
          likes: insights.likes,
        };
      }

      var token = (
        await this.utilsService.generateToken(user_email, user_deviceId)
      ).toString();

      const data = {};
      if (countries != null) {
        data["country"] = countries.country;
      }
      data["roles"] = datauserauthsService.roles;
      data["fullName"] = datauserbasicsService.fullName;
      data["bio"] = datauserbasicsService.bio;
      if (await this.utilsService.ceckData(mediaprofilepicts_res)) {
        data['avatar'] = mediaprofilepicts_res;
      }
      data["isIdVerified"] = datauserbasicsService.isIdVerified;
      data["isEmailVerified"] = datauserauthsService.isEmailVerified;
      data["token"] = 'Bearer ' + token;
      data["idProofStatus"] = datauserbasicsService.idProofStatus;
      data["insight"] = insights_res;
      if (languages != null) {
        data["langIso"] = languages.langIso;
      }
      data["interest"] = interests_array;
      data["event"] = datauserbasicsService.event;
      data["email"] = datauserbasicsService.email;
      data["iduser"] = datauserbasicsService._id;
      data["username"] = datauserauthsService.username;
      data["isComplete"] = datauserbasicsService.isComplete;
      data["status"] = datauserbasicsService.status;
      data["refreshToken"] = datajwtrefreshtoken.refresh_token_id;
      data["devicetype"] = (getdevicedata != null ? getdevicedata : user_devicetype);

      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);


      return {
        response_code: 202,
        data,
        messages,
      };
      // } else {
      //   await this.errorHandler.generateNotAcceptableException(
      //     'Unexpected problem, please check your email and re-verify the OTP',
      //   );
      // }
    } else {

      return this.signupsosmed(req);

      //await this.errorHandler.generateNotAcceptableException(
      //  'User basics and jwt not found',
      //);
    }
  }

  async viewProfile(emailViewed: string, emailView: string) {
    var current_date = await this.utilsService.getDateTimeString();
    var _id_CreateContentevents = (await this.utilsService.generateId()).toLowerCase();

    //Create ContentEvent
    try {
      var CreateContenteventsDto_ = new CreateContenteventsDto();
      CreateContenteventsDto_._id = _id_CreateContentevents;
      CreateContenteventsDto_.contentEventID = _id_CreateContentevents;
      CreateContenteventsDto_.email = emailView;
      CreateContenteventsDto_.eventType = "VIEW_PROFILE";
      CreateContenteventsDto_.active = true;
      CreateContenteventsDto_.event = "ACCEPT";
      CreateContenteventsDto_.createdAt = current_date;
      CreateContenteventsDto_.updatedAt = current_date;
      CreateContenteventsDto_.sequenceNumber = 0;
      CreateContenteventsDto_.flowIsDone = true;
      CreateContenteventsDto_.senderParty = emailView;
      CreateContenteventsDto_.receiverParty = emailViewed;
      CreateContenteventsDto_._class = "io.melody.hyppe.content.domain.ContentEvent";

      let uniq=null;
      uniq=await this.addUniqEvent(emailView,"VIEW_PROFILE","true","ACCEPT",emailViewed,_id_CreateContentevents);
      CreateContenteventsDto_.uniqEvent=uniq;

      //Insert ContentEvent
      await this.contenteventsService.create(CreateContenteventsDto_);
    } catch (error) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Create Content Activity. Error:' +
        error,
      );
    }

    var CreateGetcontenteventsDto_ = new CreateGetcontenteventsDto();
    CreateGetcontenteventsDto_.email = emailView;
    CreateGetcontenteventsDto_.eventType = "VIEW_PROFILE";
    CreateGetcontenteventsDto_.event = "ACCEPT";
    CreateGetcontenteventsDto_.senderParty = emailView;
    CreateGetcontenteventsDto_.receiverParty = emailViewed;
    var CountUser = await this.contenteventsService.findAllCategory(CreateGetcontenteventsDto_);
    //Count View Profile
    try {
      if (emailViewed != emailView) {
        if (await this.utilsService.ceckData(CountUser)) {
          await this.insightsService.updateViewProfile(emailViewed);
        }
      }
    } catch (error) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Create Content Activity. Error:' +
        error,
      );
    }
  }

  async loginSocmed(body: any) {

  }

  async countPost(id: string): Promise<number> {

    return 0;
  }

  async friend(email: string) {
    const query = await this.contenteventsService.friend(email, "");
    return query;
  }

  async signupLoop(req: any): Promise<any> {
    var user_email = null;
    var user_password = null;
    var user_deviceId = null;
    var user_interest = null;
    var user_gender = null;
    var user_otp = null;
    var user_status = null;
    var user_event = null;
    var data = null;
    var type = 'ENROL';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var requser = req.body.user;
    var user_langIso = "id";
    var arrdata = [];
    var fullName = null;
    var createdAt = null;
    var updatedAt = null;
    var regSrc = null;
    var current_date = await this.utilsService.getDateTimeString();
    if (requser.length > 0) {

      for (let x = 0; x < requser.length; x++) {


        if (requser[x].email == undefined) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: ['Unabled to proceed, Email parameter required'],
            },
          });
        }
        if (requser[x].fullName == undefined) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: ['Unabled to proceed, fullName parameter required'],
            },
          });
        }

        if (!(await this.utilsService.validasiEmail(requser[x].email))) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: ['Unabled to proceed, Invalid email format'],
            },
          });
        }
        if (requser[x].deviceId == undefined) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: ['Unabled to proceed, Device Id parameter required '],
            },
          });
        }
        // if (requser[x].deviceId == '') {
        //   throw new NotAcceptableException({
        //     response_code: 406,
        //     messages: {
        //       info: ['Unabled to proceed, Device Id parameter required '],
        //     },
        //   });
        // }
        if (requser[x].createdAt != undefined) {
          createdAt = requser[x].createdAt.toString();
        }

        if (requser[x].updatedAt != undefined) {
          updatedAt = requser[x].updatedAt.toString();
        }
        if (requser[x].regSrc != undefined) {
          regSrc = requser[x].regSrc.toString();
        }
        if (requser[x].langIso != undefined) {
          user_langIso = requser[x].langIso;
        }
        if (requser[x].interest != undefined) {
          user_interest = requser[x].interest;
        }
        if (requser[x].gender != undefined) {
          user_gender = requser[x].gender;
        }
        var subpass = null;

        //CECk signup/verify
        fullName = requser[x].fullName.toString();

        user_email = requser[x].email;
        var rep = fullName.replace(" ", "");
        rep = rep.replace(" ", "");
        rep = rep.replace(" ", "");
        var lengname = rep.length;
        subpass = rep.substring(lengname, lengname - 5);
        var lengsup = subpass.length;
        if (lengsup < 5) {
          subpass = subpass + "12";
        }
        var devid = "dw-ckEuZFESeqnertertWjzzzetewerwert9UEertert:APA91bF2xMw67hdbbasdasdMgC2fXNXfo9BfLPmZZBVMFEDGMLStVdJFgfvjLlsqnMViLMhKx5aeY_25CoMqD3PnY-xvt-xHsE0F44WpnvLDvS8L0QNzRQzYmueyyFWdAyTHeyHnEl7Ra" + subpass;
        user_password = subpass;
        user_deviceId = devid;
        var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
        var _class_UserDevices = 'io.melody.core.domain.UserDevices';
        var _class_UserAuths = 'io.melody.core.domain.UserAuth';
        var _class_UserProfile = 'io.melody.core.domain.UserProfile';

        //Set Status dan Event

        CurrentStatus = 'INITIAL';
        CurrentEvent = 'SIGN_UP';


        //CECk INITIAL
        const isNotInitial = !((CurrentEvent == 'SIGN_UP') && (CurrentStatus == 'INITIAL'));

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

        var user_exist = false;
        var username = user_email.substr(0, user_email.indexOf('@'));

        //Ceck User Userauth
        const datauserauthsService_ =
          await this.userauthsService.findOne(
            user_email,
          );

        user_exist = !(await this.utilsService.ceckData(datauserauthsService_));
        if (user_exist) {

          //Ceck User ActivityEvent Parent
          const dataactivityevents =
            await this.activityeventsService.findParentWitoutDevice(
              user_email,
              type,
              false,
            );
          if (
            (await this.utilsService.ceckData(datauserauthsService)) &&
            (await this.utilsService.ceckData(datauserbasicsService))
          ) {
            user_exist = false;
          }

          if (
            user_exist &&
            CurrentStatus == 'INITIAL' &&
            CurrentEvent == 'SIGN_UP'
          ) {
            var ID_device = null;
            var data_interest_id = [];
            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();
            var username_ = await this.utilsService.generateUsername(user_email);
            var id_user_langIso = null;

            var mongoose_gen_id_user_auth = new mongoose.Types.ObjectId();
            var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

            //Get Id Language
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

            // Get Id Interest
            try {
              if (user_interest != undefined) {
                if (user_interest.length > 0) {
                  for (var i = 0; i < user_interest.length; i++) {
                    var id_interest =
                      await this.interestsRepoService.findOneByInterestNameLangIso(
                        user_interest[i], user_langIso
                      );
                    if (id_interest != undefined) {
                      data_interest_id.push({
                        $ref: 'interests_repo',
                        $id: Object(id_interest._id),
                        $db: 'hyppe_infra_db',
                      });
                    }
                  }
                }
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Get Id Interest. Error: ' + error,
              );
            }

            //Create Insights
            try {
              var data_CreateInsightsDto = new CreateInsightsDto();
              var ID_insights = (await this.utilsService.generateId()).toLowerCase();
              data_CreateInsightsDto._id = ID_insights;
              data_CreateInsightsDto.insightID = ID_insights;
              data_CreateInsightsDto.active = true;
              data_CreateInsightsDto.createdAt = createdAt;
              data_CreateInsightsDto.updatedAt = updatedAt;
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
                data_CreateUserdeviceDto.createdAt = createdAt;
                data_CreateUserdeviceDto.updatedAt = updatedAt;
                //Insert User Userdevices
                await this.userdevicesService.create(data_CreateUserdeviceDto);
              } catch (error) {
                await this.errorHandler.generateNotAcceptableException(
                  "Unabled to proceed Create Userdevice " + user_email + " row " + x + " Error: " + error
                );
              }
            }

            //Create UserAuth
            var pass_gen = await this.utilsService.generatePassword(user_password);
            try {
              var data_CreateUserauthDto = new CreateUserauthDto();
              var ID_user = (await this.utilsService.generateId()).toLowerCase();
              data_CreateUserauthDto._id = mongoose_gen_id_user_auth;
              data_CreateUserauthDto.username = username_;
              data_CreateUserauthDto.password = pass_gen;
              data_CreateUserauthDto.userID = ID_user;
              data_CreateUserauthDto.email = user_email;
              data_CreateUserauthDto.createdAt = createdAt;
              data_CreateUserauthDto.updatedAt = updatedAt;
              data_CreateUserauthDto.regSrc = regSrc;
              data_CreateUserauthDto.isExpiryPass = false;
              data_CreateUserauthDto.isEmailVerified = true;
              data_CreateUserauthDto.otpAttempt = Long.fromString('0');
              data_CreateUserauthDto.otpRequestTime = Long.fromString(OTP_expires.toString());
              data_CreateUserauthDto.isEnabled = true;
              data_CreateUserauthDto.otpNextAttemptAllow = Long.fromString('0');
              data_CreateUserauthDto.isAccountNonExpired = true;
              data_CreateUserauthDto.isAccountNonLocked = true;
              data_CreateUserauthDto.isCredentialsNonExpired = true;
              data_CreateUserauthDto.roles = ['ROLE_USER'];
              data_CreateUserauthDto._class = _class_UserAuths;
              data_CreateUserauthDto.oneTimePassword = OTP;
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
                "Unabled to proceed Create UserAuth " + user_email + " row " + x + " Error: " + error
              );
            }

            //Create UserBasic
            try {
              var data_CreateUserbasicDto = new CreateUserbasicDto();
              var gen_profileID = (await this.utilsService.generateId()).toLowerCase();
              data_CreateUserbasicDto._id = mongoose_gen_id_user_basic;
              data_CreateUserbasicDto.profileID = gen_profileID;
              data_CreateUserbasicDto.email = user_email;
              data_CreateUserbasicDto.fullName = fullName;
              data_CreateUserbasicDto.gender = user_gender;
              data_CreateUserbasicDto.status = 'NOTIFY';
              data_CreateUserbasicDto.event = 'NOTIFY_OTP';
              data_CreateUserbasicDto.isComplete = false;
              data_CreateUserbasicDto.isCelebrity = false;
              data_CreateUserbasicDto.isIdVerified = false;
              data_CreateUserbasicDto.isPrivate = false;
              data_CreateUserbasicDto.isFollowPrivate = false;
              data_CreateUserbasicDto.isPostPrivate = false;
              data_CreateUserbasicDto.createdAt = createdAt;
              data_CreateUserbasicDto.updatedAt = updatedAt;
              data_CreateUserbasicDto.statusKyc = 'unverified';
              data_CreateUserbasicDto.import = "YES";
              data_CreateUserbasicDto.insight = {
                $ref: 'insights',
                $id: Object(ID_insights),
                $db: 'hyppe_content_db',
              };
              data_CreateUserbasicDto.userInterests = data_interest_id;
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
                "Unabled to proceed Create UserBasic " + user_email + " row " + x + " Error: " + error
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
              data_CreateActivityeventsDto_parent.target = 'NOTIFY';
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
              data_CreateActivityeventsDto_parent.createdAt = createdAt;
              data_CreateActivityeventsDto_parent.updatedAt = updatedAt;
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
                "Unabled to proceed Create Activity Event " + user_email + " row " + x + " Error: " + error
              );
            }

            //Create ActivityEvent child NOTIFY_OTP
            try {
              var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
              data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
              data_CreateActivityeventsDto_child.activityEventID =
                gen_ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
              data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
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
                "Unabled to proceed Create Activity Event child " + user_email + " row " + x + " Error: " + error
              );
            }
            const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);

            //Create Or Update refresh Token
            await this.updateRefreshToken(user_email);
            // try {
            //   await this.sendemailOTP(user_email, OTP.toString(), 'ENROL', "id");
            // } catch (error) {
            //   await this.errorHandler.generateNotAcceptableException(
            //     'Unabled to proceed Failed Send Email. Error:' +
            //     error,
            //   );
            // }
            data = {
              fullName: fullName,
              gender: user_gender,
              isIdVerified: "false",
              isEmailVerified: "true",
              email: user_email,
              username: username_,
              createdAt: createdAt,
              updatedAt: updatedAt

            };

            arrdata.push(data);

          } else {
            if (user_langIso == "en") {
              await this.errorHandler.generateNotAcceptableException(
                "Sorry! This email " + user_email + " already registered.",
              );
            } else {
              await this.errorHandler.generateNotAcceptableException(
                "Maaf! Email " + user_email + " sudah terdaftar.",
              );
            }
          }
        } else {
          if (user_langIso == "en") {
            await this.errorHandler.generateNotAcceptableException(
              "Sorry! This email " + user_email + " already registered.",
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              "Maaf! Email " + user_email + " sudah terdaftar.",
            );
          }
        }

      }

      return {
        response_code: 202,
        data: arrdata,
        messages: {
          info: ['Signup successful'],
        },
      };

    }


  }

  async referral2(req: any, head: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    var user_email_parent = null;
    var user_username_parent = null;
    var user_imei_children = null;
    var user_email_children = null;
    var email_ceck = false;
    var iduser = null;
    var current_date = await this.utilsService.getDateTimeString();

    if (head['x-auth-user'] == undefined) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, required param email header',
      );
    } else {
      user_email_children = head['x-auth-user'];
    }

    if (req.body.imei == undefined) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, required param imei',
      );
    } else {
      user_imei_children = req.body.imei;
    }

    if (req.body.email == undefined) {
      if (req.body.username != undefined) {
        email_ceck = true;
        user_username_parent = req.body.username;
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, required param email or username',
        );
      }
    } else {
      email_ceck = false;
      user_email_parent = req.body.email;
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      req.body.email,
    );

    if (datauserbasicsService !== null) {
      iduser = datauserbasicsService._id;
    }

    var datauserauthService_parent = null;
    var datauserauthService_children = null;

    var useLanguage = await this.utilsService.getUserlanguages(head['x-auth-user']);
    var errorMessages = "";
    //Ceck User auth child
    datauserauthService_children = await this.userauthsService.findOneemail(user_email_children);
    if (!(await this.utilsService.ceckData(datauserauthService_children))) {
      if (useLanguage == "en") {
        errorMessages = "User not found, please check the username again";
      } else {
        errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
      }

      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        errorMessages,
      );
    }

    if (email_ceck) {
      //Ceck User auth parent
      datauserauthService_parent = await this.userauthsService.findOneUsername(user_username_parent);
      if (await this.utilsService.ceckData(datauserauthService_parent)) {
        user_email_parent = datauserauthService_parent.email;
      } else {
        if (useLanguage == "en") {
          errorMessages = "User not found, please check the username again";
        } else {
          errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    } else {
      //Ceck User auth parent
      datauserauthService_parent = await this.userauthsService.findOneemail(user_email_parent);
      if (!(await this.utilsService.ceckData(datauserauthService_parent))) {
        if (useLanguage == "en") {
          errorMessages = "User not found, please check the username again";
        } else {
          errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    }

    if (user_email_parent != "" && user_imei_children != "") {
      var data_refferal = await this.referralService.findOneInChildParent(user_email_children, user_email_parent);
      if (!(await this.utilsService.ceckData(data_refferal))) {
        var data_imei = await this.referralService.findOneInIme(user_imei_children);
        if (!(await this.utilsService.ceckData(data_imei))) {
          var CreateReferralDto_ = new CreateReferralDto();
          CreateReferralDto_._id = (await this.utilsService.generateId())
          CreateReferralDto_.parent = user_email_parent;
          CreateReferralDto_.children = user_email_children;
          CreateReferralDto_.active = true;
          CreateReferralDto_.verified = true;
          CreateReferralDto_.createdAt = current_date;
          CreateReferralDto_.updatedAt = current_date;
          CreateReferralDto_.imei = user_imei_children;
          CreateReferralDto_._class = "io.melody.core.domain.Referral";
          var insertdata = await this.referralService.create(CreateReferralDto_);
          var idref = insertdata._id;

          let userid = null;
          const databasics = await this.userbasicsService.findOne(
            user_email_parent
          );
          if (databasics !== null) {
            userid = databasics._id;
          }

          // try {
          //   //this.userChallenge(userid.toString(), idref.toString(), "referral", "REFERAL");
          //   this.scorereferralrequest(userid.toString(), idref.toString(), "referral", "REFERAL")
          // } catch (e) {

          // }


          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var _id_3 = (await this.utilsService.generateId());
          var _id_4 = (await this.utilsService.generateId());

          // var CreateContenteventsDto1 = new CreateContenteventsDto();
          // CreateContenteventsDto1._id = _id_1
          // CreateContenteventsDto1.contentEventID = (await this.utilsService.generateId())
          // CreateContenteventsDto1.email = LoginRequest_.referral
          // CreateContenteventsDto1.eventType = "FOLLOWER"
          // CreateContenteventsDto1.active = true
          // CreateContenteventsDto1.event = "REQUEST"
          // CreateContenteventsDto1.createdAt = current_date
          // CreateContenteventsDto1.updatedAt = current_date
          // CreateContenteventsDto1.sequenceNumber = 0
          // CreateContenteventsDto1.flowIsDone = true
          // CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          // CreateContenteventsDto1.senderParty = LoginRequest_.email
          // CreateContenteventsDto1.transitions = [{
          //   $ref: 'contentevents',
          //   $id: Object(_id_2),
          //   $db: 'hyppe_trans_db',
          // }]

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
          CreateContenteventsDto2.email = user_email_parent
          CreateContenteventsDto2.eventType = "FOLLOWER"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.receiverParty = user_email_children
          CreateContenteventsDto2.parentContentEventID = _id_1

          // var CreateContenteventsDto3 = new CreateContenteventsDto();
          // CreateContenteventsDto3._id = _id_3
          // CreateContenteventsDto3.contentEventID = (await this.utilsService.generateId())
          // CreateContenteventsDto3.email = LoginRequest_.email
          // CreateContenteventsDto3.eventType = "FOLLOWING"
          // CreateContenteventsDto3.active = true
          // CreateContenteventsDto3.event = "INITIAL"
          // CreateContenteventsDto3.createdAt = current_date
          // CreateContenteventsDto3.updatedAt = current_date
          // CreateContenteventsDto3.sequenceNumber = 0
          // CreateContenteventsDto3.flowIsDone = true
          // CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
          // CreateContenteventsDto3.receiverParty = LoginRequest_.referral
          // CreateContenteventsDto3.transitions = [{
          //   $ref: 'contentevents',
          //   $id: Object(_id_4),
          //   $db: 'hyppe_trans_db',
          // }]

          var CreateContenteventsDto4 = new CreateContenteventsDto();
          CreateContenteventsDto4._id = _id_4
          CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
          CreateContenteventsDto4.email = user_email_children
          CreateContenteventsDto4.eventType = "FOLLOWING"
          CreateContenteventsDto4.active = true
          CreateContenteventsDto4.event = "ACCEPT"
          CreateContenteventsDto4.createdAt = current_date
          CreateContenteventsDto4.updatedAt = current_date
          CreateContenteventsDto4.sequenceNumber = 1
          CreateContenteventsDto4.flowIsDone = true
          CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto4.senderParty = user_email_parent
          CreateContenteventsDto4.parentContentEventID = _id_3

          //await this.contenteventsService.create(CreateContenteventsDto1);
          await this.contenteventsService.create(CreateContenteventsDto2);
          //await this.contenteventsService.create(CreateContenteventsDto3);
          await this.contenteventsService.create(CreateContenteventsDto4);
          await this.insightsService.updateFollower(user_email_parent);
          await this.insightsService.updateFollowing(user_email_children);

          if (useLanguage == "en") {
            errorMessages = "Congratulation referral applied successfully";
          } else {
            errorMessages = "Selamat kode referral berhasil digunakan";
          }

          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

          return {
            "response_code": 202,
            "messages": {
              "info": [
                errorMessages
              ]
            }
          };
        } else {
          if (useLanguage == "en") {
            errorMessages = "Referral Failed, Your device has been registered, please use another device";
          } else {
            errorMessages = "Referral Tidak Berhasil, Perangkat kamu telah terdaftar, harap gunakan perangkat lainnya";
          }

          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            errorMessages,
          );
        }
      } else {
        if (useLanguage == "en") {
          errorMessages = "Referral Failed, Username has been registered, please use another username";
        } else {
          errorMessages = "Referral Tidak Berhasil, Username telah terdaftar sebagai referral kamu, silahkan ganti dengan username lainnya";
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    }
  }

  async referral3(req: any, head: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();

    var user_email_parent = null;
    var user_username_parent = null;
    var user_imei_children = null;
    var user_email_children = null;
    var email_ceck = false;
    var iduser = null;
    var listchallenge = null;
    var current_date = await this.utilsService.getDateTimeString();

    if (head['x-auth-user'] == undefined) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, required param email header',
      );
    } else {
      user_email_children = head['x-auth-user'];
    }
    try {
      listchallenge = req.body.listchallenge;
    } catch (e) {
      listchallenge = null;
    }
    if (req.body.imei == undefined) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, required param imei',
      );
    } else {
      user_imei_children = req.body.imei;
    }

    var detaildata = await this.basic2SS.findbyemail(head['x-auth-user']);

    if (req.body.email == undefined) {
      if (req.body.username != undefined) {
        email_ceck = true;
        user_username_parent = req.body.username;
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, required param email or username',
        );
      }
    } else {
      email_ceck = false;
      user_email_parent = req.body.email;
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.basic2SS.findbyemail(
      req.body.email,
    );

    if (datauserbasicsService !== null) {
      iduser = datauserbasicsService._id;
    }

    var datauserauthService_parent = null;
    var datauserauthService_children = null;

    var useLanguage = detaildata.languagesLangIso;
    var errorMessages = "";
    //Ceck User auth child
    datauserauthService_children = await this.basic2SS.findbyemail(user_email_children);
    if (!(await this.utilsService.ceckData(datauserauthService_children))) {
      if (useLanguage == "en") {
        errorMessages = "User not found, please check the username again";
      } else {
        errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
      }

      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        errorMessages,
      );
    }

    //baca dulu!!
    if (email_ceck) {
      //Ceck User auth parent
      datauserauthService_parent = await this.basic2SS.findbyusername(user_username_parent);
      if (await this.utilsService.ceckData(datauserauthService_parent)) {
        user_email_parent = datauserauthService_parent.email;
      } else {
        if (useLanguage == "en") {
          errorMessages = "User not found, please check the username again";
        } else {
          errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    } else {
      //Ceck User auth parent
      datauserauthService_parent = await this.basic2SS.findbyemail(user_email_parent);
      if (!(await this.utilsService.ceckData(datauserauthService_parent))) {
        if (useLanguage == "en") {
          errorMessages = "User not found, please check the username again";
        } else {
          errorMessages = "Pengguna tidak dapat ditemukan, silahkan cek kembali username pengguna tersebut";
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    }

    if (user_email_parent != "" && user_imei_children != "") {
      var data_refferal = await this.referralService.findOneInChildParent(user_email_children, user_email_parent);
      if (!(await this.utilsService.ceckData(data_refferal))) {
        var data_imei = await this.referralService.findOneInIme(user_imei_children);
        if (!(await this.utilsService.ceckData(data_imei))) {
          var CreateReferralDto_ = new CreateReferralDto();
          CreateReferralDto_._id = (await this.utilsService.generateId())
          CreateReferralDto_.parent = user_email_parent;
          CreateReferralDto_.children = user_email_children;
          CreateReferralDto_.active = true;
          CreateReferralDto_.verified = true;
          CreateReferralDto_.createdAt = current_date;
          CreateReferralDto_.updatedAt = current_date;
          CreateReferralDto_.imei = user_imei_children;
          CreateReferralDto_._class = "io.melody.core.domain.Referral";

          let userid = null;
          const databasics = await this.basic2SS.findBymail(
            user_email_parent
          );
          if (databasics !== null) {
            userid = databasics._id;
          }

          var isguest = null;
          try
          {
            if(datauserauthService_children.guestMode == true)
            {
              CreateReferralDto_.status = 'PENDING';
              isguest = true;
            }
            else
            {
              isguest = false;
            }
          }
          catch(e)
          {
            CreateReferralDto_.status = 'PENDING';
            isguest = true;
          }

          if(isguest == true)
          {
            if(user_email_children != user_email_parent)
            {
              var insertdata = await this.referralService.create(CreateReferralDto_);
            }
            //var idref = insertdata._id;
          }

          if(isguest == false)
          {
            // try {
              //this.userChallenge(userid.toString(), idref.toString(), "referral", "REFERAL");
              //await this.contenteventsService.scorereferralrequest(userid.toString(), idref.toString(), "referral", "REFERAL", listchallenge)
            // } catch (e) {
  
            // }
  
            var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(user_email_parent, "FOLLOWER", "ACCEPT", user_email_children, "", "");
            var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(user_email_children, "FOLLOWING", "ACCEPT", "", user_email_parent, "");
            if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
              var _id_1 = (await this.utilsService.generateId());
              var _id_2 = (await this.utilsService.generateId());
              var _id_3 = (await this.utilsService.generateId());
              var _id_4 = (await this.utilsService.generateId());
  
              // var CreateContenteventsDto1 = new CreateContenteventsDto();
              // CreateContenteventsDto1._id = _id_1
              // CreateContenteventsDto1.contentEventID = (await this.utilsService.generateId())
              // CreateContenteventsDto1.email = LoginRequest_.referral
              // CreateContenteventsDto1.eventType = "FOLLOWER"
              // CreateContenteventsDto1.active = true
              // CreateContenteventsDto1.event = "REQUEST"
              // CreateContenteventsDto1.createdAt = current_date
              // CreateContenteventsDto1.updatedAt = current_date
              // CreateContenteventsDto1.sequenceNumber = 0
              // CreateContenteventsDto1.flowIsDone = true
              // CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
              // CreateContenteventsDto1.senderParty = LoginRequest_.email
              // CreateContenteventsDto1.transitions = [{
              //   $ref: 'contentevents',
              //   $id: Object(_id_2),
              //   $db: 'hyppe_trans_db',
              // }]
  
              var CreateContenteventsDto2 = new CreateContenteventsDto();
              CreateContenteventsDto2._id = _id_2
              CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
              CreateContenteventsDto2.email = user_email_parent
              CreateContenteventsDto2.eventType = "FOLLOWER"
              CreateContenteventsDto2.active = true
              CreateContenteventsDto2.event = "ACCEPT"
              CreateContenteventsDto2.createdAt = current_date
              CreateContenteventsDto2.updatedAt = current_date
              CreateContenteventsDto2.sequenceNumber = 1
              CreateContenteventsDto2.flowIsDone = true
              CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
              CreateContenteventsDto2.receiverParty = user_email_children
              CreateContenteventsDto2.parentContentEventID = _id_1
  
              // var CreateContenteventsDto3 = new CreateContenteventsDto();
              // CreateContenteventsDto3._id = _id_3
              // CreateContenteventsDto3.contentEventID = (await this.utilsService.generateId())
              // CreateContenteventsDto3.email = LoginRequest_.email
              // CreateContenteventsDto3.eventType = "FOLLOWING"
              // CreateContenteventsDto3.active = true
              // CreateContenteventsDto3.event = "INITIAL"
              // CreateContenteventsDto3.createdAt = current_date
              // CreateContenteventsDto3.updatedAt = current_date
              // CreateContenteventsDto3.sequenceNumber = 0
              // CreateContenteventsDto3.flowIsDone = true
              // CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
              // CreateContenteventsDto3.receiverParty = LoginRequest_.referral
              // CreateContenteventsDto3.transitions = [{
              //   $ref: 'contentevents',
              //   $id: Object(_id_4),
              //   $db: 'hyppe_trans_db',
              // }]
  
              var CreateContenteventsDto4 = new CreateContenteventsDto();
              CreateContenteventsDto4._id = _id_4
              CreateContenteventsDto4.contentEventID = (await this.utilsService.generateId())
              CreateContenteventsDto4.email = user_email_children
              CreateContenteventsDto4.eventType = "FOLLOWING"
              CreateContenteventsDto4.active = true
              CreateContenteventsDto4.event = "ACCEPT"
              CreateContenteventsDto4.createdAt = current_date
              CreateContenteventsDto4.updatedAt = current_date
              CreateContenteventsDto4.sequenceNumber = 1
              CreateContenteventsDto4.flowIsDone = true
              CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
              CreateContenteventsDto4.senderParty = user_email_parent
              CreateContenteventsDto4.parentContentEventID = _id_3
  
              if(user_email_children != user_email_parent)
              {
                //await this.contenteventsService.create(CreateContenteventsDto1);
                await this.contenteventsService.create(CreateContenteventsDto2);
                //await this.contenteventsService.create(CreateContenteventsDto3);
                await this.contenteventsService.create(CreateContenteventsDto4);
                await this.insightsService.updateFollower(user_email_parent);
                await this.insightsService.updateFollowing(user_email_children);
                await this.basic2SS.updatefollowSystem(user_email_parent, user_email_children, "FOLLOWING");
                await this.basic2SS.updatefollowSystem(user_email_children, user_email_parent, "FOLLOWER");
                var insertreferraldata = {
                  "_id": CreateReferralDto_._id,
                  "active":CreateReferralDto_.active,
                  "verified":CreateReferralDto_.verified,
                  "imei":CreateReferralDto_.imei,
                  "createdAt":CreateReferralDto_.createdAt,
                  "updatedAt":CreateReferralDto_.updatedAt,
                  "email":CreateReferralDto_.children
                };

                await this.basic2SS.updateReferralSystem(insertreferraldata, user_email_parent); 
              }
  
              if (useLanguage == "en") {
                errorMessages = "Congratulation referral applied successfully";
              } else {
                errorMessages = "Selamat kode referral berhasil digunakan";
              }
  
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);
  
              return {
                "response_code": 202,
                "messages": {
                  "info": [
                    errorMessages
                  ]
                }
              };
            }
            else {
              if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
                if(user_email_children != user_email_parent)
                {
                  await this.contenteventsService.updateFollowing(user_email_children, "FOLLOWING", user_email_parent);
                  await this.contenteventsService.updateFollower(user_email_parent, "FOLLOWER", user_email_children);
                  await this.insightsService.updateFollower(user_email_parent);
                  await this.insightsService.updateFollowing(user_email_children);
                  await this.basic2SS.updatefollowSystem(user_email_children, user_email_parent, "FOLLOWER");
                  await this.basic2SS.updatefollowSystem(user_email_parent, user_email_children, "FOLLOWING");
                }
  
                if (useLanguage == "en") {
                  errorMessages = "Congratulation referral applied successfully";
                } else {
                  errorMessages = "Selamat kode referral berhasil digunakan";
                }
  
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);
  
                return {
                  "response_code": 202,
                  "messages": {
                    "info": [
                      errorMessages
                    ]
                  }
                };
              }
            }
          }
          else
          {
            if (useLanguage == "en") {
              errorMessages = "Congratulation referral applied successfully";
            } else {
              errorMessages = "Selamat kode referral berhasil digunakan";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

            return {
              "response_code": 202,
              "messages": {
                "info": [
                  errorMessages
                ]
              }
            };
          }
        } else {
          if (useLanguage == "en") {
            errorMessages = "Referral Failed, Your device has been registered, please use another device";
          } else {
            errorMessages = "Referral Tidak Berhasil, Perangkat kamu telah terdaftar, harap gunakan perangkat lainnya";
          }

          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            errorMessages,
          );
        }
      } else {
        if (useLanguage == "en") {
          errorMessages = "Referral Failed, Username has been registered, please use another username";
        } else {
          errorMessages = "Referral Tidak Berhasil, Username telah terdaftar sebagai referral kamu, silahkan ganti dengan username lainnya";
        }

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, user_email_children, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          errorMessages,
        );
      }
    }
  }

  async signup2(req: any): Promise<any> {
    var user_email = null;
    var user_password = null;
    var user_deviceId = null;
    var user_interest = null;
    var user_langIso = null;
    var user_gender = null;

    var user_otp = null;
    var user_status = null;
    var user_event = null;

    var type = 'ENROL';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var user_regSrc = "";

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = req.body.lang.toString();
    }

    if (req.body.regSrc != undefined) {
      user_regSrc = req.body.regSrc.toString();
    }

    var current_date = await this.utilsService.getDateTimeString();

    if (req.body.email == undefined) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Email parameter required'],
        },
      });
    }

    if (!(await this.utilsService.validasiEmail(req.body.email))) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Invalid email format'],
        },
      });
    }

    //CECk signup/verify
    if (req.body.otp == undefined) {
      if (req.body.password == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Password parameter required '],
          },
        });
      } else {
        if (req.body.password == req.body.email) {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! Password cannot be the same as email.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Kata sandi tidak boleh sama dengan email.',
            );
          }
        }
      }
      if (req.body.password == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Password parameter required '],
          },
        });
      } else {
        if (req.body.password == req.body.email) {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! Password cannot be the same as email.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Kata sandi tidak boleh sama dengan email.',
            );
          }
        }
      }
      if (req.body.deviceId == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Device Id parameter required '],
          },
        });
      }
      if (req.body.deviceId == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Device Id parameter required '],
          },
        });
      }
      user_email = req.body.email;
      user_password = req.body.password;
      user_deviceId = req.body.deviceId;
      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
      if (req.body.interest != undefined) {
        user_interest = req.body.interest;
      }
      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }
    } else {
      if (req.body.otp == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, OTP parameter required '],
          },
        });
      }
      if (req.body.otp == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, OTP parameter required '],
          },
        });
      }
      if (req.body.status == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Status parameter required '],
          },
        });
      }
      if (req.body.status == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Status parameter required '],
          },
        });
      }
      if (req.body.event == undefined) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Event parameter required '],
          },
        });
      }
      if (req.body.event == '') {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Event parameter required '],
          },
        });
      }
      user_email = req.body.email;
      user_otp = req.body.otp;
      user_status = req.body.status;
      user_event = req.body.event;
    }

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';
    var _class_UserAuths = 'io.melody.core.domain.UserAuth';
    var _class_UserProfile = 'io.melody.core.domain.UserProfile';

    //Set Status dan Event
    if (req.body.otp == undefined) {
      CurrentStatus = 'INITIAL';
      CurrentEvent = 'SIGN_UP';
    } else {
      CurrentStatus = user_status;
      CurrentEvent = user_event;
    }

    //CECk INITIAL
    const isNotInitial = !((CurrentEvent == 'SIGN_UP') && (CurrentStatus == 'INITIAL'));

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

    if (
      (await this.utilsService.ceckData(datauserbasicsService)) &&
      (await this.utilsService.ceckData(datauserauthsService)) &&
      isNotInitial
    ) {
      const dataactivityevents =
        await this.activityeventsService.findParentWitoutDevice(
          user_email,
          'ENROL',
          false,
        );

      if (Object.keys(dataactivityevents).length > 0) {
        let last;
        if (dataactivityevents[0].transitions.length > 0) {
          const json_transition = JSON.parse(JSON.stringify(dataactivityevents[0].transitions[0]));
          last = await this.activityeventsService.findbyactivityEventID(
            user_email,
            json_transition.$id,
            'ENROL',
            false,
          );
        } else {
          last = dataactivityevents;
        }

        let StatusNext;
        let EventNext;

        if (last[0].status == 'NOTIFY') {
          StatusNext = 'REPLY';
          EventNext = 'VERIFY_OTP';
        }

        if (StatusNext == CurrentStatus && EventNext == CurrentEvent) {
          if (
            datauserauthsService.oneTimePassword != undefined &&
            CurrentEvent == 'VERIFY_OTP' &&
            CurrentStatus == 'REPLY'
          ) {
            if (
              await this.utilsService.compareOTPAttemp(
                Number(datauserauthsService.otpAttempt),
              )
            ) {
              if (
                (datauserauthsService.oneTimePassword != undefined
                  ? await this.utilsService.OTPExpires(
                    Number(await datauserauthsService.otpRequestTime),
                  )
                  : false) == false &&
                user_otp == datauserauthsService.oneTimePassword
              ) {

                //Update Userauths by email 
                try {
                  await this.userauthsService.updatebyEmail(user_email, {
                    isEmailVerified: true
                  });
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed update userauths Email Verified. Error:' +
                    error,
                  );
                }

                const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);

                //Create Or Update refresh Token
                await this.updateRefreshToken(user_email);

                //Create ActivityEvent child VERIFY_OTP
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'REPLY';
                  data_CreateActivityeventsDto_child.target = 'IN_PROGRESS';
                  data_CreateActivityeventsDto_child.event = 'VERIFY_OTP';
                  data_CreateActivityeventsDto_child.action =
                    'VerifyActivityCommand';
                  data_CreateActivityeventsDto_child._class =
                    'io.melody.hyppe.trans.domain.ActivityEvent';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: dataactivityevents[0].payload.login_device,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    2,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      flowIsDone: false,
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity Event Parent. Error:' +
                    error,
                  );
                }

                //Ceck User Userdevices
                const user_userdevicesService = await this.userdevicesService.findOneEmail_(user_email);

                var countries_json = null;
                if (datauserbasicsService.countries != undefined) {
                  countries_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.countries),
                  );
                }
                var languages_json = null;
                if (datauserbasicsService.languages != undefined) {
                  languages_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.languages),
                  );
                }
                var mediaprofilepicts_json = null;
                if (datauserbasicsService.profilePict != undefined) {
                  mediaprofilepicts_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.profilePict),
                  );
                }
                var insights_json = null;
                if (datauserbasicsService.insight != undefined) {
                  insights_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.insight),
                  );
                }

                var interests_array = [];
                if (datauserbasicsService.userInterests.length > 0) {
                  for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
                    var interests_json = JSON.parse(
                      JSON.stringify(datauserbasicsService.userInterests[i]),
                    );
                    if (interests_json.$ref == 'interests_repo') {
                      const interests = await this.interestsRepoService.findOne(
                        interests_json.$id,
                      );
                      interests_array[i] = interests.interestName;
                    } else {
                      const interests = await this.interestsRepoService.findOne(
                        interests_json.$id,
                      );
                      interests_array[i] = interests.interestName;
                    }
                  }
                }

                let countries = null;
                if (countries_json != null) {
                  countries = await this.countriesService.findOne(countries_json.$id);
                }

                let languages = null;
                if (languages_json != null) {
                  languages = await this.languagesService.findOne(languages_json.$id);
                }

                let mediaprofilepicts = null;
                if (mediaprofilepicts_json != null) {
                  mediaprofilepicts = await this.mediaprofilepictsService.findOne(
                    mediaprofilepicts_json.$id,
                  );
                }

                let insights = null;
                if (insights_json != null) {
                  insights = await this.insightsService.findOne(insights_json.$id);
                }

                var mediaUri = null;
                if (mediaprofilepicts != null) {
                  mediaUri = mediaprofilepicts.mediaUri;
                }

                let result = null;
                if (mediaUri != null) {
                  result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
                }

                var mediaprofilepicts_res = {}
                if (mediaprofilepicts != null) {
                  if (mediaprofilepicts.mediaBasePath != null) {
                    mediaprofilepicts_res["mediaBasePath"] = mediaprofilepicts.mediaBasePath;
                  }

                  if (mediaprofilepicts.mediaUri != null) {
                    mediaprofilepicts_res["mediaUri"] = mediaprofilepicts.mediaUri;
                  }

                  if (mediaprofilepicts.mediaType != null) {
                    mediaprofilepicts_res['mediaType'] = mediaprofilepicts.mediaType;
                  }
                }

                if (result != null) {
                  mediaprofilepicts_res["mediaEndpoint"] = result;
                }

                var insights_res = {
                  shares: insights.shares,
                  followers: insights.followers,
                  comments: insights.comments,
                  followings: insights.followings,
                  reactions: insights.reactions,
                  posts: insights.posts,
                  views: insights.views,
                  likes: insights.likes,
                };

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

                this.userauthsService.updatebyEmail(user_email, {
                  oneTimePassword: null,
                  otpRequestTime: new Long(0),
                  otpAttempt: new Long(0),
                  otpNextAttemptAllow: new Long(0),
                });

                //Create ActivityEvent child UPDATE_BIO
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'IN_PROGRESS';
                  data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
                  data_CreateActivityeventsDto_child.event = 'UPDATE_BIO';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: dataactivityevents[0].payload.login_device,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    3,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;
                  data_CreateActivityeventsDto_child._class = _class_ActivityEvent;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      flowIsDone: false,
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity Event Parent. Error:' +
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

                const data = {};
                if (countries != null) {
                  data["country"] = countries.country;
                }
                data["roles"] = datauserauthsService.roles;
                data["fullName"] = datauserbasicsService.fullName;
                if (await this.utilsService.ceckData(mediaprofilepicts_res)) {
                  data['avatar'] = mediaprofilepicts_res;
                }
                data["isIdVerified"] = datauserbasicsService.isIdVerified;
                data["isEmailVerified"] = datauserauthsService.isEmailVerified;
                data["token"] = 'Bearer ' + token;
                data["idProofStatus"] = datauserbasicsService.idProofStatus;
                data["insight"] = insights_res;
                if (languages != null) {
                  data["langIso"] = languages.langIso;
                }
                data["interest"] = interests_array;
                data["event"] = 'UPDATE_BIO';
                data["email"] = datauserbasicsService.email;
                data["username"] = datauserauthsService.username;
                data["isComplete"] = datauserbasicsService.isComplete;
                data["status"] = 'IN_PROGRESS';
                data["refreshToken"] = datajwtrefreshtoken_data.refresh_token_id;

                console.log("---------------------------------------------------REQUEST---------------------------------------------------");
                console.log(req.body);
                console.log("---------------------------------------------------REQUEST---------------------------------------------------");
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

                        // if (databasic !== null) {
                        //   var idref = insertdata._id;
                        //   try {
                        //     //this.userChallenge(databasic._id.toString(), idref.toString(), "referral", "REFERAL");
                        //     this.scorereferralrequest(databasic._id.toString(), idref.toString(), "referral", "REFERAL")

                        //   } catch (e) {

                        //   }
                        // }

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

                //Create User Ads
                // try {
                //   await this.adsUserCompareService.createNewUserAds(datauserbasicsService._id.toString());
                // } catch (e) {
                //   console.log("Create User Ads", e);
                // }

                //Create User Playlist
                // try {
                //   await this.postsService.generateNewUserPlaylist(datauserbasicsService._id.toString());
                // } catch (e) {
                //   console.log("Create User Ads", e);
                // }

                return {
                  response_code: 202,
                  data,
                  messages: {
                    "nextFlow": [
                      "$.event: next should UPDATE_BIO",
                      "$.status: next should IN_PROGRESS"
                    ],
                    info: ['Verify OTP successful'],
                  },
                };
              } else {
                this.userauthsService.findOneupdatebyEmail(user_email);
                const user_userAuth = await this.userauthsService.findOne(
                  user_email,
                );
                if (await this.utilsService.ceckData(user_userAuth)) {
                  if (Number(user_userAuth.otpAttempt) >= 3) {
                    try {
                      var OTP_expires = await this.utilsService.generateOTPExpiresNextAttemptAllow();
                      this.userauthsService.updatebyEmail(user_email, { otpNextAttemptAllow: OTP_expires, });
                    } catch (e) {
                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, Failed Update Userauths. Error : ' + e,
                      );
                    }
                  }
                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'The OTP code you entered is incorrect; please check again.',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
                    );
                  }
                } else {
                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'No users were found. Please check again.',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
                    );
                  }
                }
              }
            } else {
              if (
                (Number(datauserauthsService.otpNextAttemptAllow) > 0
                  ? await this.utilsService.OTPNextAttempExpires(
                    Number(datauserauthsService.otpNextAttemptAllow),
                  )
                  : datauserauthsService.oneTimePassword != undefined) &&
                (await this.utilsService.compareOTPAttemp(
                  Number(datauserauthsService.otpAttempt),
                ))
              ) {

                //Create ActivityEvent child NOTIFY_OTP
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'NOTIFY';
                  data_CreateActivityeventsDto_child.target = 'REPLY';
                  data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                  data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
                  data_CreateActivityeventsDto_child.action =
                    'NotifyActivityCommand';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: undefined,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    1,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.__v = undefined;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

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

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });

                  //Update ActivityEvent Parent
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
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

                var OTP = await this.utilsService.generateOTP();
                var OTP_expires = await this.utilsService.generateOTPExpires();

                //Update User Auth
                try {
                  this.userauthsService.updatebyEmail(user_email, {
                    oneTimePassword: OTP,
                    otpRequestTime: OTP_expires,
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed Update Userauths. Error:' +
                    error,
                  );
                }

                try {
                  await this.sendemailOTP(user_email, OTP.toString(), 'ENROL', "id");
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed Send Email. Error:' +
                    error,
                  );
                }

                var messages = "";
                if (lang == "en") {
                  messages = "Recovery password request successful";
                } else {
                  messages = "Permintaan pemulihan kata sandi berhasil";
                }

                return {
                  response_code: 202,
                  messages: {
                    info: [messages],
                  },
                };
              } else {
                if (lang == "en") {
                  await this.errorHandler.generateNotAcceptableException(
                    'OTP max attempt exceeded, please try after ' +
                    process.env.OTP_NEXT_ALLOW_MINUTE +
                    ' minute',
                  );
                } else {
                  await this.errorHandler.generateNotAcceptableException(
                    'Upaya maksimal OTP terlampaui, harap coba setelahnya ' +
                    process.env.OTP_NEXT_ALLOW_MINUTE +
                    ' menit',
                  );
                }
              }
            }
          } else {
            if (lang == "en") {
              await this.errorHandler.generateNotAcceptableException(
                'The OTP code you entered is incorrect; please check again.',
              );
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
              );
            }
          }
        } else {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'The OTP code you entered is incorrect; please check again.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
            );
          }
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Log activity events parent signup not axist',
        );
      }
    } else {
      var user_exist = false;
      var username = user_email.substr(0, user_email.indexOf('@'));

      //Ceck User Userauth
      const datauserauthsService_ =
        await this.userauthsService.findOne(
          user_email,
        );

      user_exist = !(await this.utilsService.ceckData(datauserauthsService_));
      if (user_exist) {

        //Ceck User ActivityEvent Parent
        const dataactivityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );
        if (
          (await this.utilsService.ceckData(datauserauthsService)) &&
          (await this.utilsService.ceckData(datauserbasicsService)) &&
          (await this.utilsService.ceckData(dataactivityevents))
        ) {
          user_exist = false;
        }

        if (
          user_exist &&
          CurrentStatus == 'INITIAL' &&
          CurrentEvent == 'SIGN_UP'
        ) {
          var ID_device = null;
          var data_interest_id = [];
          var OTP = await this.utilsService.generateOTP();
          var OTP_expires = await this.utilsService.generateOTPExpires();
          var username_ = await this.utilsService.generateUsername(user_email);
          var id_user_langIso = null;

          var mongoose_gen_id_user_auth = new mongoose.Types.ObjectId();
          var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

          //Get Id Language
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

          //Get Id Interest
          try {
            if (user_interest != undefined) {
              if (user_interest.length > 0) {
                for (var i = 0; i < user_interest.length; i++) {
                  var id_interest =
                    await this.interestsRepoService.findOneByInterestNameLangIso(
                      user_interest[i], id_user_langIso
                    );
                  if (id_interest != undefined) {
                    data_interest_id.push({
                      $ref: 'interests_repo',
                      $id: Object(id_interest._id),
                      $db: 'hyppe_infra_db',
                    });
                  }
                }
              }
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Interest. Error: ' + error,
            );
          }

          //Create Insights
          try {
            var data_CreateInsightsDto = new CreateInsightsDto();
            var ID_insights = (await this.utilsService.generateId()).toLowerCase();
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

          //Create UserAuth
          var pass_gen = await this.utilsService.generatePassword(user_password);
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
            data_CreateUserauthDto.regSrc = user_regSrc;
            data_CreateUserauthDto.isExpiryPass = false;
            data_CreateUserauthDto.isEmailVerified = false;
            data_CreateUserauthDto.otpAttempt = Long.fromString('0');
            data_CreateUserauthDto.otpRequestTime = Long.fromString(OTP_expires.toString());
            data_CreateUserauthDto.isEnabled = true;
            data_CreateUserauthDto.otpNextAttemptAllow = Long.fromString('0');
            data_CreateUserauthDto.isAccountNonExpired = true;
            data_CreateUserauthDto.isAccountNonLocked = true;
            data_CreateUserauthDto.isCredentialsNonExpired = true;
            data_CreateUserauthDto.roles = ['ROLE_USER'];
            data_CreateUserauthDto._class = _class_UserAuths;
            data_CreateUserauthDto.oneTimePassword = OTP;
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
            data_CreateUserbasicDto.gender = user_gender;
            data_CreateUserbasicDto.status = 'NOTIFY';
            data_CreateUserbasicDto.event = 'NOTIFY_OTP';
            data_CreateUserbasicDto.isComplete = false;
            data_CreateUserbasicDto.isCelebrity = false;
            data_CreateUserbasicDto.isIdVerified = false;
            data_CreateUserbasicDto.isPrivate = false;
            data_CreateUserbasicDto.isFollowPrivate = false;
            data_CreateUserbasicDto.isPostPrivate = false;
            data_CreateUserbasicDto.createdAt = current_date;
            data_CreateUserbasicDto.updatedAt = current_date;
            data_CreateUserbasicDto.statusKyc = 'unverified';
            data_CreateUserbasicDto.creator = false;
            data_CreateUserbasicDto.tutor = [
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
            data_CreateUserbasicDto.insight = {
              $ref: 'insights',
              $id: Object(ID_insights),
              $db: 'hyppe_content_db',
            };
            data_CreateUserbasicDto.userInterests = Object(data_interest_id);
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
            data_CreateActivityeventsDto_parent.target = 'NOTIFY';
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

          //Create ActivityEvent child NOTIFY_OTP
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              gen_ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = type;
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
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

          try {
            await this.sendemailOTP(user_email, OTP.toString(), 'ENROL', "id");
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Failed Send Email. Error:' +
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
              idProofStatus: "INITIAL",
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
              event: "NOTIFY_OTP",
              email: user_email,
              username: username_,
              isComplete: "false",
              status: "NOTIFY",
              tutor: [
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
              ]
            },
            messages: {
              nextFlow: [
                "$.event: next should VERIFY_OTP",
                "$.status: next should REPLY"
              ],
              info: ['Signup successful'],
            },
          };
        } else {
          var messages = 'Maaf! Email ini sudah terdaftar.';
          if (lang == "en") {
            messages = 'Sorry! This email already registered.';
          } else {
            messages = 'Maaf! Email ini sudah terdaftar.';
          }
          var response = {
            response_code: 202,
            data: {
              email: datauserauthsService_.email,
              isEmailVerified: datauserauthsService_.isEmailVerified.toString()
            },
            messages: {
              info: [messages],
            },
          }
          return response;
          // if (lang == "en") {
          //   await this.errorHandler.generateNotAcceptableException(
          //     'Sorry! This email already registered.',
          //   );
          // } else {
          //   await this.errorHandler.generateNotAcceptableException(
          //     'Maaf! Email ini sudah terdaftar.',
          //   );
          // }
        }
      } else {
        var messages = 'Maaf! Email ini sudah terdaftar.';
        if (lang == "en") {
          messages = 'Sorry! This email already registered.';
        } else {
          messages = 'Maaf! Email ini sudah terdaftar.';
        }
        var response = {
          response_code: 202,
          data: {
            email: datauserauthsService_.email,
            isEmailVerified: datauserauthsService_.isEmailVerified.toString()
          },
          messages: {
            info: [messages],
          },
        }
        return response;
        // if (lang == "en") {
        //   await this.errorHandler.generateNotAcceptableException(
        //     'Sorry! This email already registered.',
        //   );
        // } else {
        //   await this.errorHandler.generateNotAcceptableException(
        //     'Maaf! Email ini sudah terdaftar.',
        //   );
        // }
      }
    }
  }

  async signup3(req: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = req.get("Host") + req.originalUrl;
    var request_json = JSON.parse(JSON.stringify(req.body));

    var user_email = null;
    var emailLogin = null;
    var user_password = null;
    var user_deviceId = null;
    var user_interest = null;
    var user_langIso = null;
    var user_gender = null;

    var user_otp = null;
    var user_status = null;
    var user_event = null;

    var type = 'ENROL';
    var CurrentStatus = '';
    var CurrentEvent = '';
    var user_regSrc = "";
    var listchallenge = null;

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = req.body.lang.toString();
    }

    if (req.body.regSrc != undefined) {
      user_regSrc = req.body.regSrc.toString();
    }
    try {
      listchallenge = req.body.listchallenge;
    } catch (e) {
      listchallenge = null;
    }
    var current_date = await this.utilsService.getDateTimeString();

    if (req.body.email == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Email parameter required'],
        },
      });
    }

    console.log(req.body.email);

    if (!(await this.utilsService.validasiEmail(req.body.email))) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, Invalid email format'],
        },
      });
    }

    //CECk signup/verify
    if (req.body.otp == undefined) {
      if (req.body.password == undefined) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Password parameter required '],
          },
        });
      } else {
        if (req.body.password == req.body.email) {
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! Password cannot be the same as email.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Kata sandi tidak boleh sama dengan email.',
            );
          }
        }
      }
      if (req.body.password == '') {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Password parameter required '],
          },
        });
      } else {
        if (req.body.password == req.body.email) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Sorry! Password cannot be the same as email.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Maaf! Kata sandi tidak boleh sama dengan email.',
            );
          }
        }
      }
      if (req.body.deviceId == undefined) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Device Id parameter required '],
          },
        });
      }
      if (req.body.deviceId == '') {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Device Id parameter required '],
          },
        });
      }
      user_email = req.body.email;
      emailLogin = req.body.email;
      user_password = req.body.password;
      user_deviceId = req.body.deviceId;
      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
      if (req.body.interest != undefined) {
        user_interest = req.body.interest;
      }
      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }
    } else {
      if (req.body.otp == undefined) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, OTP parameter required '],
          },
        });
      }
      if (req.body.otp == '') {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, OTP parameter required '],
          },
        });
      }
      if (req.body.status == undefined) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Status parameter required '],
          },
        });
      }
      if (req.body.status == '') {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Status parameter required '],
          },
        });
      }
      if (req.body.event == undefined) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Event parameter required '],
          },
        });
      }
      if (req.body.event == '') {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, Event parameter required '],
          },
        });
      }
      user_email = req.body.email;
      emailLogin = req.body.email;
      user_otp = req.body.otp;
      user_status = req.body.status;
      user_event = req.body.event;
    }

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';
    var _class_UserProfile = 'io.melody.core.domain.UserProfile';

    //Set Status dan Event
    if (req.body.otp == undefined) {
      CurrentStatus = 'INITIAL';
      CurrentEvent = 'SIGN_UP';
    } else {
      CurrentStatus = user_status;
      CurrentEvent = user_event;
    }

    //CECk INITIAL
    const isNotInitial = !((CurrentEvent == 'SIGN_UP') && (CurrentStatus == 'INITIAL'));

    //Ceck User Userbasics
    const datauserbasicsService = await this.basic2SS.finddetail(
      user_email,
    );

    console.log(datauserbasicsService);

    //Ceck User Userdevices
    const datauserdevicesService = await this.userdevicesService.findOneEmail(user_email, user_deviceId);

    if (await this.utilsService.ceckData(datauserbasicsService) && isNotInitial) {
      const dataactivityevents =
        await this.activityeventsService.findParentWitoutDevice(
          user_email,
          'ENROL',
          false,
        );

      if (Object.keys(dataactivityevents).length > 0) {
        let last;
        if (dataactivityevents[0].transitions.length > 0) {
          const json_transition = JSON.parse(JSON.stringify(dataactivityevents[0].transitions[0]));
          last = await this.activityeventsService.findbyactivityEventID(
            user_email,
            json_transition.$id,
            'ENROL',
            false,
          );
        } else {
          last = dataactivityevents;
        }

        let StatusNext;
        let EventNext;

        if (last[0].status == 'NOTIFY') {
          StatusNext = 'REPLY';
          EventNext = 'VERIFY_OTP';
        }

        if (StatusNext == CurrentStatus && EventNext == CurrentEvent) {
          if (
            datauserbasicsService.oneTimePassword != undefined &&
            CurrentEvent == 'VERIFY_OTP' &&
            CurrentStatus == 'REPLY'
          ) {
            if (
              await this.utilsService.compareOTPAttemp(
                Number(datauserbasicsService.otpAttempt),
              )
            ) {
              if (
                (datauserbasicsService.oneTimePassword != undefined
                  ? await this.utilsService.OTPExpires(
                    Number(await datauserbasicsService.otpRequestTime),
                  )
                  : false) == false &&
                user_otp == datauserbasicsService.oneTimePassword
              ) {

                //Update email verified 
                try {
                  var updatedata = new Userbasicnew();
                  updatedata.isEmailVerified = true;
                  await this.basic2SS.updatebyemail(user_email, updatedata);
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed update Email Verified. Error:' +
                    error,
                  );
                }

                const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);

                //Create Or Update refresh Token
                await this.updateRefreshToken2(user_email);

                //Create ActivityEvent child VERIFY_OTP
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'REPLY';
                  data_CreateActivityeventsDto_child.target = 'IN_PROGRESS';
                  data_CreateActivityeventsDto_child.event = 'VERIFY_OTP';
                  data_CreateActivityeventsDto_child.action =
                    'VerifyActivityCommand';
                  data_CreateActivityeventsDto_child._class =
                    'io.melody.hyppe.trans.domain.ActivityEvent';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: dataactivityevents[0].payload.login_device,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    2,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

                  var updatedata = new Userbasicnew();
                  updatedata.event = CurrentEvent;
                  updatedata.userEvent = CurrentEvent;
                  await this.basic2SS.updatebyemail(user_email, updatedata);

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      flowIsDone: false,
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity Event Parent. Error:' +
                    error,
                  );
                }

                //Ceck User Userdevices
                const user_userdevicesService = await this.userdevicesService.findOneEmail_(user_email);

                var countries = null;
                if (datauserbasicsService.countriesName != undefined) {
                  countries = datauserbasicsService.countriesName;
                }

                var languages = null;
                if (datauserbasicsService.languages != undefined) {
                  languages = datauserbasicsService.languagesLangIso;
                }

                var insights_json = null;
                if (datauserbasicsService.insight != undefined) {
                  insights_json = JSON.parse(
                    JSON.stringify(datauserbasicsService.insight),
                  );
                }

                var interests_array = [];
                if (datauserbasicsService.userInterests.length > 0) {
                  for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
                    var interests_json = JSON.parse(
                      JSON.stringify(datauserbasicsService.userInterests[i]),
                    );
                    if (interests_json.$ref == 'interests_repo') {
                      const interests = await this.interestsRepoService.findOne(
                        interests_json.$id,
                      );
                      interests_array[i] = interests.interestName;
                    } else {
                      const interests = await this.interestsRepoService.findOne(
                        interests_json.$id,
                      );
                      interests_array[i] = interests.interestName;
                    }
                  }
                }

                let mediaprofilepicts_res = {};
                if (datauserbasicsService.profilePict != undefined) {
                  if (datauserbasicsService.mediaBasePath != null) {
                    mediaprofilepicts_res["mediaBasePath"] = datauserbasicsService.mediaBasePath;
                  }

                  if (datauserbasicsService.mediaUri != null) {
                    mediaprofilepicts_res["mediaUri"] = datauserbasicsService.mediaUri;
                  }

                  if (datauserbasicsService.mediaType != null) {
                    mediaprofilepicts_res["mediaType"] = datauserbasicsService.mediaType;
                  }

                  if (datauserbasicsService.mediaEndpoint != null) {
                    mediaprofilepicts_res["mediaEndpoint"] = datauserbasicsService.mediaEndpoint;
                  }
                  else {
                    if (datauserbasicsService.profilePict.$id != null && datauserbasicsService.profilePict.$id != undefined) {
                      mediaprofilepicts_res["mediaEndpoint"] = "/profilepict/" + datauserbasicsService.profilePict.$id.toString();
                    }
                  }
                }

                let insights = null;
                if (insights_json != null) {
                  insights = await this.insightsService.findOne(insights_json.$id);
                }

                var insights_res = {
                  shares: insights.shares,
                  followers: insights.followers,
                  comments: insights.comments,
                  followings: insights.followings,
                  reactions: insights.reactions,
                  posts: insights.posts,
                  views: insights.views,
                  likes: insights.likes,
                };

                var token = (
                  await this.utilsService.generateToken(user_email, user_userdevicesService.deviceID)
                ).toString();

                //Ceck User jwtrefresh token
                const datajwtrefreshtoken_data = await this.jwtrefreshtokenService.findOne(
                  user_email,
                );

                var updatedata = new Userbasicnew();
                updatedata.status = 'IN_PROGRESS';
                updatedata.event = 'UPDATE_BIO';
                updatedata.userEvent = 'UPDATE_BIO';
                updatedata.oneTimePassword = null;
                updatedata.otpRequestTime = new Long(0);
                updatedata.otpAttempt = new Long(0);
                updatedata.otpNextAttemptAllow = new Long(0);
                this.basic2SS.updatebyemail(user_email, updatedata);

                //Create ActivityEvent child UPDATE_BIO
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'IN_PROGRESS';
                  data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
                  data_CreateActivityeventsDto_child.event = 'UPDATE_BIO';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: dataactivityevents[0].payload.login_device,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    3,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;
                  data_CreateActivityeventsDto_child._class = _class_ActivityEvent;

                  //Insert ActivityEvent child
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error:' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      flowIsDone: false,
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity Event Parent. Error:' +
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

                const data = {};
                if (countries != null) {
                  data["country"] = countries.country;
                }
                data["roles"] = datauserbasicsService.roles;
                data["fullName"] = datauserbasicsService.fullName;
                if (await this.utilsService.ceckData(mediaprofilepicts_res)) {
                  data['avatar'] = mediaprofilepicts_res;
                }
                data["isIdVerified"] = datauserbasicsService.isIdVerified;
                data["isEmailVerified"] = datauserbasicsService.isEmailVerified;
                data["token"] = 'Bearer ' + token;
                data["idProofStatus"] = datauserbasicsService.idProofStatus;
                data["insight"] = insights_res;
                if (languages != null) {
                  data["langIso"] = languages.langIso;
                }
                data["interest"] = interests_array;
                data["event"] = 'UPDATE_BIO';
                data["email"] = datauserbasicsService.email;
                data["emailLogin"] = datauserbasicsService.emailLogin;
                data["username"] = datauserbasicsService.username;
                data["isComplete"] = datauserbasicsService.isComplete;
                data["status"] = 'IN_PROGRESS';
                data["refreshToken"] = datajwtrefreshtoken_data.refresh_token_id;

                console.log("---------------------------------------------------REQUEST---------------------------------------------------");
                console.log(req.body);
                console.log("---------------------------------------------------REQUEST---------------------------------------------------");
                var setreferral = null;
                var datareferral = null;

                /* 
                  usernya ada 2 :
                  dari awal emang pingin jadi user
                  mualaf dari guest ke user
                */

                try
                {
                  if(req.body.imei != undefined)
                  {
                    var checkdouble = await this.referralService.checkBothparentandChild(req.body.referral, req.body.email);
                    if(checkdouble.length == 0)
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
                      else if(req.body.referral != undefined && checkexistimei == false)
                      {
                        var checkuserexist = await this.basic2SS.findBymail(req.body.referral);
                        if(checkuserexist != null && checkuserexist != undefined)
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
                    }
                  }
                }
                catch (error) {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed referral data. Error:' +
                    error,
                  );
                }
                
                // old
                // if (req.body.referral != undefined && req.body.imei != undefined) {

                //   if (req.body.referral != "" && req.body.imei != "") {
                //     var data_refferal = await this.referralService.findOneInChild(req.body.email);
                //     if (!(await this.utilsService.ceckData(data_refferal))) {
                //       var data_imei = await this.referralService.findOneInIme(req.body.imei);
                //       if (!(await this.utilsService.ceckData(data_imei))) {
                //         var CreateReferralDto_ = new CreateReferralDto();
                //         CreateReferralDto_._id = (await this.utilsService.generateId())
                //         CreateReferralDto_.parent = req.body.referral;
                //         CreateReferralDto_.children = req.body.email;
                //         CreateReferralDto_.active = true;
                //         CreateReferralDto_.verified = true;
                //         CreateReferralDto_.createdAt = current_date;
                //         CreateReferralDto_.updatedAt = current_date;
                //         CreateReferralDto_.imei = req.body.imei;
                //         CreateReferralDto_._class = "io.melody.core.domain.Referral";
                //         var insertdata = await this.referralService.create(CreateReferralDto_);

                //         const databasic = await this.basic2SS.findbyemail(
                //           req.body.referral,
                //         );

                //         // if (databasic !== null) {
                //         //   var idref = insertdata._id;
                //         //   this.userChallenge(databasic._id.toString(), idref.toString(), "referral", "REFERAL");
                //         // }



                //         if (databasic !== null) {
                //           var idref = insertdata._id;
                //           try {
                //             //this.userChallenge(databasic._id.toString(), idref.toString(), "referral", "REFERAL");
                //             this.scorereferralrequest(databasic._id.toString(), idref.toString(), "referral", "REFERAL", listchallenge)

                //           } catch (e) {

                //           }
                //         }

                //         var _id_1 = (await this.utilsService.generateId());
                //         var _id_2 = (await this.utilsService.generateId());
                //         var _id_3 = (await this.utilsService.generateId());
                //         var _id_4 = (await this.utilsService.generateId());

                //         // var CreateContenteventsDto1 = new CreateContenteventsDto();
                //         // CreateContenteventsDto1._id = _id_1
                //         // CreateContenteventsDto1.contentEventID = (await this.utilsService.generateId())
                //         // CreateContenteventsDto1.email = req.body.referral
                //         // CreateContenteventsDto1.eventType = "FOLLOWER"
                //         // CreateContenteventsDto1.active = true
                //         // CreateContenteventsDto1.event = "REQUEST"
                //         // CreateContenteventsDto1.createdAt = current_date
                //         // CreateContenteventsDto1.updatedAt = current_date
                //         // CreateContenteventsDto1.sequenceNumber = 0
                //         // CreateContenteventsDto1.flowIsDone = true
                //         // CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
                //         // CreateContenteventsDto1.senderParty = req.body.email
                //         // CreateContenteventsDto1.transitions = [{
                //         //   $ref: 'contentevents',
                //         //   $id: Object(_id_2),
                //         //   $db: 'hyppe_trans_db',
                //         // }]

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

                //         // var CreateContenteventsDto3 = new CreateContenteventsDto();
                //         // CreateContenteventsDto3._id = _id_3
                //         // CreateContenteventsDto3.contentEventID = (await this.utilsService.generateId())
                //         // CreateContenteventsDto3.email = req.body.email
                //         // CreateContenteventsDto3.eventType = "FOLLOWING"
                //         // CreateContenteventsDto3.active = true
                //         // CreateContenteventsDto3.event = "INITIAL"
                //         // CreateContenteventsDto3.createdAt = current_date
                //         // CreateContenteventsDto3.updatedAt = current_date
                //         // CreateContenteventsDto3.sequenceNumber = 0
                //         // CreateContenteventsDto3.flowIsDone = true
                //         // CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
                //         // CreateContenteventsDto3.receiverParty = req.body.referral
                //         // CreateContenteventsDto3.transitions = [{
                //         //   $ref: 'contentevents',
                //         //   $id: Object(_id_4),
                //         //   $db: 'hyppe_trans_db',
                //         // }]

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
                //         await this.basic2SS.updatefollowSystem(req.body.email, req.body.referral, "FOLLOWER");
                //         await this.basic2SS.updatefollowSystem(req.body.referral, req.body.email, "FOLLOWING");
                //       }
                //     }
                //   }
                // }

                //Create User Ads
                // try {
                //   await this.adsUserCompareService.createNewUserAds(datauserbasicsService._id.toString());
                // } catch (e) {
                //   console.log("Create User Ads", e);
                // }

                //Create User Playlist
                // try {
                //   await this.postsService.generateNewUserPlaylist(datauserbasicsService._id.toString());
                // } catch (e) {
                //   console.log("Create User Ads", e);
                // }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);
                
                return {
                  response_code: 202,
                  data,
                  messages: {
                    "nextFlow": [
                      "$.event: next should UPDATE_BIO",
                      "$.status: next should IN_PROGRESS"
                    ],
                    info: ['Verify OTP successful'],
                  },
                };
              } else {
                this.basic2SS.findOneupdatebyEmail(user_email);
                const user_Basic = await this.basic2SS.findbyemail(
                  user_email,
                );
                if (await this.utilsService.ceckData(user_Basic)) {
                  if (Number(user_Basic.otpAttempt) >= 3) {
                    try {
                      var updateotp = new Userbasicnew();
                      var OTP_expires = await this.utilsService.generateOTPExpiresNextAttemptAllow();
                      updateotp.otpNextAttemptAllow = Long.fromString(OTP_expires.toString());
                      this.basic2SS.update(user_email, updateotp);
                    } catch (e) {
                      var timestamps_end = await this.utilsService.getDateTimeString();
                      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                      await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, Failed Update newUserBasics. Error : ' + e,
                      );
                    }
                  }
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'The OTP code you entered is incorrect; please check again.',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
                    );
                  }
                } else {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  if (lang == "en") {
                    await this.errorHandler.generateNotAcceptableException(
                      'No users were found. Please check again.',
                    );
                  } else {
                    await this.errorHandler.generateNotAcceptableException(
                      'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
                    );
                  }
                }
              }
            } else {
              console.log(datauserbasicsService.otpNextAttemptAllow);
              if (
                (Number(datauserbasicsService.otpNextAttemptAllow) > 0
                  ? await this.utilsService.OTPNextAttempExpires(
                    Number(datauserbasicsService.otpNextAttemptAllow),
                  )
                  : datauserbasicsService.oneTimePassword != undefined) &&
                (await this.utilsService.compareOTPAttemp(
                  Number(datauserbasicsService.otpAttempt),
                ))
              ) {

                //Create ActivityEvent child NOTIFY_OTP
                var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
                var mongoose_gen_id_Activityevents_child = new mongoose.Types.ObjectId();
                var gen_ID_child_ActivityEvent = (await this.utilsService.generateId()).toLowerCase();
                try {
                  data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
                  data_CreateActivityeventsDto_child.activityEventID =
                    gen_ID_child_ActivityEvent;
                  data_CreateActivityeventsDto_child.activityType = 'ENROL';
                  data_CreateActivityeventsDto_child.active = true;
                  data_CreateActivityeventsDto_child.status = 'NOTIFY';
                  data_CreateActivityeventsDto_child.target = 'REPLY';
                  data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                  data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
                  data_CreateActivityeventsDto_child.action =
                    'NotifyActivityCommand';
                  data_CreateActivityeventsDto_child.payload = {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: undefined,
                    login_date: undefined,
                    login_device: undefined,
                    email: user_email,
                  };
                  data_CreateActivityeventsDto_child.createdAt = current_date;
                  data_CreateActivityeventsDto_child.updatedAt = current_date;
                  data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                    1,
                  );
                  data_CreateActivityeventsDto_child.flowIsDone = false;
                  data_CreateActivityeventsDto_child.__v = undefined;
                  data_CreateActivityeventsDto_child.parentActivityEventID =
                    dataactivityevents[0].activityEventID;
                  data_CreateActivityeventsDto_child.userbasic =
                    datauserbasicsService._id;

                  //Insert ActivityEvent Parent
                  await this.activityeventsService.create(
                    data_CreateActivityeventsDto_child,
                  );
                } catch (error) {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create Activity events Child. Error: ' +
                    error,
                  );
                }

                //Update ActivityEvent Parent
                try {
                  const data_transitions = dataactivityevents[0].transitions;
                  data_transitions.push({
                    $ref: 'activityevents',
                    $id: new Object(gen_ID_child_ActivityEvent),
                    $db: 'hyppe_trans_db',
                  });

                  //Update ActivityEvent Parent
                  await this.activityeventsService.update(
                    {
                      _id: dataactivityevents[0]._id,
                    },
                    {
                      transitions: data_transitions,
                    },
                  );
                } catch (error) {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update Activity events Parent. Error:' +
                    error,
                  );
                }

                var OTP = await this.utilsService.generateOTP();
                var OTP_expires = await this.utilsService.generateOTPExpires();

                //Update User Auth
                try {
                  var updatedata = new Userbasicnew();
                  updatedata.oneTimePassword = OTP.toString();
                  updatedata.otpRequestTime = Long.fromString(OTP_expires.toString());
                  updatedata.otpAttempt = new Long(0);
                  updatedata.otpNextAttemptAllow = new Long(0);

                  this.basic2SS.updatebyemail(user_email, updatedata);
                } catch (error) {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed Update newUserBasics. Error:' +
                    error,
                  );
                }

                try {
                  await this.sendemailOTP2(user_email, OTP.toString(), 'ENROL', "id");
                } catch (error) {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed Send Email. Error:' +
                    error,
                  );
                }

                var messages = "";
                if (lang == "en") {
                  messages = "Recovery password request successful";
                } else {
                  messages = "Permintaan pemulihan kata sandi berhasil";
                }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                return {
                  response_code: 202,
                  messages: {
                    info: [messages],
                  },
                };
              } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

                if (lang == "en") {
                  await this.errorHandler.generateNotAcceptableException(
                    'OTP max attempt exceeded, please try after ' +
                    process.env.OTP_NEXT_ALLOW_MINUTE +
                    ' minute',
                  );
                } else {
                  await this.errorHandler.generateNotAcceptableException(
                    'Upaya maksimal OTP terlampaui, harap coba setelahnya ' +
                    process.env.OTP_NEXT_ALLOW_MINUTE +
                    ' menit',
                  );
                }
              }
            }
          } else {
            if (lang == "en") {
              await this.errorHandler.generateNotAcceptableException(
                'The OTP code you entered is incorrect; please check again.',
              );
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
              );
            }
          }
        } else {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'The OTP code you entered is incorrect; please check again.',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
            );
          }
        }
      } else {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Log activity events parent signup not axist',
        );
      }
    } else {
      var user_exist = false;
      var username = user_email.substr(0, user_email.indexOf('@'));

      //Ceck data newuserbasic
      const datauserbasicsService = await this.basic2SS.findbyemail(user_email);
      user_exist = !(await this.utilsService.ceckData(datauserbasicsService));
      if (user_exist) {
        //Ceck User ActivityEvent Parent
        const dataactivityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            type,
            false,
          );

        if (
          (await this.utilsService.ceckData(datauserbasicsService)) &&
          (await this.utilsService.ceckData(dataactivityevents))
        ) {
          user_exist = false;
        }

        if (
          user_exist &&
          CurrentStatus == 'INITIAL' &&
          CurrentEvent == 'SIGN_UP'
        ) {
          var ID_device = null;
          var data_interest_id = [];
          var OTP = await this.utilsService.generateOTP();
          var OTP_expires = await this.utilsService.generateOTPExpires();
          var username_ = await this.utilsService.generateUsername(user_email);
          var id_user_langIso = null;

          var mongoose_gen_id_user_auth = new mongoose.Types.ObjectId();
          var mongoose_gen_id_user_basic = new mongoose.Types.ObjectId();

          //Get Id Language
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
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);
            
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Language. Error: ' + error,
            );
          }

          //Get Id Interest
          try {
            if (user_interest != undefined) {
              if (user_interest.length > 0) {
                for (var i = 0; i < user_interest.length; i++) {
                  var id_interest =
                    await this.interestsRepoService.findOneByInterestNameLangIso(
                      user_interest[i], id_user_langIso
                    );
                  if (id_interest != undefined) {
                    data_interest_id.push({
                      $ref: 'interests_repo',
                      $id: Object(id_interest._id),
                      $db: 'hyppe_infra_db',
                    });
                  }
                }
              }
            }
          } catch (error) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Get Id Interest. Error: ' + error,
            );
          }

          //Create Insights
          try {
            var data_CreateInsightsDto = new CreateInsightsDto();
            var ID_insights = (await this.utilsService.generateId()).toLowerCase();
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
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

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
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Userdevices. Error:' + error,
              );
            }
          }

          //Create UserBasic
          try {
            var data_CreateUserbasicDto = new Userbasicnew();
            var pass_gen = await this.utilsService.generatePassword(user_password);
            var gen_profileID = (await this.utilsService.generateId()).toLowerCase();
            var ID_user = (await this.utilsService.generateId()).toLowerCase();
            data_CreateUserbasicDto._id = mongoose_gen_id_user_basic;
            data_CreateUserbasicDto.profileID = gen_profileID;
            data_CreateUserbasicDto.email = user_email;
            data_CreateUserbasicDto.fullName = username_;
            data_CreateUserbasicDto.gender = user_gender;
            data_CreateUserbasicDto.status = 'NOTIFY';
            data_CreateUserbasicDto.event = 'NOTIFY_OTP';
            data_CreateUserbasicDto.userEvent = 'NOTIFY_OTP';
            data_CreateUserbasicDto.isComplete = false;
            data_CreateUserbasicDto.isCelebrity = false;
            data_CreateUserbasicDto.isIdVerified = false;
            data_CreateUserbasicDto.isPrivate = false;
            data_CreateUserbasicDto.isFollowPrivate = false;
            data_CreateUserbasicDto.isPostPrivate = false;
            data_CreateUserbasicDto.createdAt = current_date;
            data_CreateUserbasicDto.updatedAt = current_date;
            data_CreateUserbasicDto.statusKyc = 'unverified';
            data_CreateUserbasicDto.tutor = [
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
            data_CreateUserbasicDto.insight = {
              $ref: 'insights',
              $id: Object(ID_insights),
              $db: 'hyppe_content_db',
            };
            data_CreateUserbasicDto.userInterests = Object(data_interest_id);
            if (id_user_langIso != null) {
              data_CreateUserbasicDto.languages = {
                $ref: 'languages',
                $id: id_user_langIso,
                $db: 'hyppe_infra_db',
              };
            }
            data_CreateUserbasicDto._class = _class_UserProfile;
            data_CreateUserbasicDto.username = username_;
            data_CreateUserbasicDto.password = pass_gen;
            data_CreateUserbasicDto.userID = ID_user;
            data_CreateUserbasicDto.regSrc = user_regSrc;
            data_CreateUserbasicDto.isExpiryPass = false;
            data_CreateUserbasicDto.isEmailVerified = false;
            data_CreateUserbasicDto.otpAttempt = Long.fromString('0');
            data_CreateUserbasicDto.otpRequestTime = Long.fromString(OTP_expires.toString());
            data_CreateUserbasicDto.isEnabled = true;
            data_CreateUserbasicDto.otpNextAttemptAllow = Long.fromString('0');
            data_CreateUserbasicDto.isAccountNonExpired = true;
            data_CreateUserbasicDto.isAccountNonLocked = true;
            data_CreateUserbasicDto.isCredentialsNonExpired = true;
            data_CreateUserbasicDto.roles = ['ROLE_USER'];
            data_CreateUserbasicDto.oneTimePassword = OTP.toString();
            var authUsers = {
              "devices": [
                {
                  $ref: 'userdevices',
                  $id: ID_device,
                  $db: 'hyppe_trans_db',
                },
              ]
            };
            data_CreateUserbasicDto.authUsers = authUsers

            //Insert UserBasic
            await this.basic2SS.create(data_CreateUserbasicDto);
          } catch (error) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

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
            data_CreateActivityeventsDto_parent.target = 'NOTIFY';
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
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Parent. Error: ' +
              error,
            );
          }

          //Create ActivityEvent child NOTIFY_OTP
          try {
            var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
            data_CreateActivityeventsDto_child._id = mongoose_gen_id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              gen_ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = type;
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
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
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error: ' +
              error,
            );
          }

          try {
            await this.sendemailOTP2(user_email, OTP.toString(), 'ENROL', "id");
          } catch (error) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Failed Send Email. Error:' +
              error,
            );
          }

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

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
              idProofStatus: "INITIAL",
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
              event: "NOTIFY_OTP",
              email: user_email,
              username: username_,
              isComplete: "false",
              status: "NOTIFY",
              tutor: [
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
              ]
            },
            messages: {
              nextFlow: [
                "$.event: next should VERIFY_OTP",
                "$.status: next should REPLY"
              ],
              info: ['Signup successful'],
            },
          };
        } else {
          var messages = 'Maaf! Email ini sudah terdaftar.';
          if (lang == "en") {
            messages = 'Sorry! This email already registered.';
          } else {
            messages = 'Maaf! Email ini sudah terdaftar.';
          }
          var response = {
            response_code: 202,
            data: {
              email: datauserbasicsService.email,
              isEmailVerified: datauserbasicsService.isEmailVerified.toString()
            },
            messages: {
              info: [messages],
            },
          }

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

          return response;
          // if (lang == "en") {
          //   await this.errorHandler.generateNotAcceptableException(
          //     'Sorry! This email already registered.',
          //   );
          // } else {
          //   await this.errorHandler.generateNotAcceptableException(
          //     'Maaf! Email ini sudah terdaftar.',
          //   );
          // }
        }
      } else {
        var messages = 'Maaf! Email ini sudah terdaftar.';
        if (lang == "en") {
          messages = 'Sorry! This email already registered.';
        } else {
          messages = 'Maaf! Email ini sudah terdaftar.';
        }
        var response = {
          response_code: 202,
          data: {
            email: datauserbasicsService.email,
            isEmailVerified: datauserbasicsService.isEmailVerified.toString()
          },
          messages: {
            info: [messages],
          },
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, request_json);

        return response;
        // if (lang == "en") {
        //   await this.errorHandler.generateNotAcceptableException(
        //     'Sorry! This email already registered.',
        //   );
        // } else {
        //   await this.errorHandler.generateNotAcceptableException(
        //     'Maaf! Email ini sudah terdaftar.',
        //   );
        // }
      }
    }
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
  async getDateTimeString(): Promise<string> {
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);
    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];
    return timedate;
  }

  async changepasswordV2(req: any, head: any): Promise<any> {
    if (!(await this.utilsService.validasiTokenEmail(head))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (
      req.body.email == undefined ||
      req.body.oldPass == undefined ||
      req.body.newPass == undefined
    ) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    var mongo = require('mongoose');
    var user_email_header = head['x-auth-user'];
    var user_email = req.body.email;
    var user_oldPass = req.body.oldPass;
    var user_newPass = req.body.newPass;
    var isMatch = false;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var id_Activityevents_parent = new mongoose.Types.ObjectId();
    var id_Activityevents_child = new mongoose.Types.ObjectId();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.basic2SS.findbyemail(
      user_email,
    );

    var userLang = await this.utilsService.getUserlanguages(user_email_header);

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = userLang.toString();
    }

    if (await this.utilsService.ceckData(datauserbasicsService)) {
      //Ceck User ActivityEvent Parent
      const user_activityevents =
        await this.activityeventsService.findParentWitoutDevice(
          user_email,
          'CHANGE_PASS',
          false,
        );

      //Ceck UserAuth
      // const user_auths = await this.userauthsService.findOne(user_email);
      const passuser = datauserbasicsService.password;
      isMatch = await this.utilsService.comparePassword(user_oldPass, passuser);

      if (Object.keys(user_activityevents).length > 0) {
        if (isMatch) {
          this.basic2SS.updatebyEmail(user_email, {
            isEmailVerified: true,
            password: await this.utilsService.generatePassword(user_newPass),
          });

          //Create ActivityEvent child
          try {
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'COMPLETE';
            data_CreateActivityeventsDto_child.target = 'COMPLETE';
            data_CreateActivityeventsDto_child.event = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              user_activityevents[0].activityEventID;
            data_CreateActivityeventsDto_child.userbasic =
              mongo.Types.ObjectId(datauserbasicsService._id);

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

          //Update ActivityEvent All Child True
          try {
            for (
              var i = 0;
              i < user_activityevents[0].transitions.length;
              i++
            ) {
              await this.activityeventsService.update(
                {
                  activityEventID: user_activityevents[0].transitions[i].oid,
                },
                {
                  flowIsDone: true,
                },
              );
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update ActivityEvent All Child True. Error:' +
              error,
            );
          }

          var messages = "Change password successful";
          if (lang == 'id') {
            messages = 'Ubah kata sandi berhasil'
          } else {
            messages = 'Change password successful'
          }

          return {
            response_code: 202,
            messages: {
              info: [messages],
            },
          };
        } else {

          var messages = "Password not Match";
          if (lang == 'id') {
            messages = 'Kata sandi tidak Cocok'
          } else {
            messages = 'Password not Match'
          }
          await this.errorHandler.generateNotAcceptableException(
            'Kata sandi tidak Cocok',
          );
        }
      } else {
        if (isMatch) {
          this.userauthsService.updatebyEmail(user_email, {
            isEmailVerified: true,
            password: bcrypt.hashSync(user_newPass, 5),
          });

          //Create ActivityEvent Parent
          try {
            data_CreateActivityeventsDto_parent._id = id_Activityevents_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'CHANGE_PASS';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'COMPLETE';
            data_CreateActivityeventsDto_parent.event = 'CHANGE_PASS';
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_parent.createdAt = current_date;
            data_CreateActivityeventsDto_parent.updatedAt = current_date;
            data_CreateActivityeventsDto_parent.sequenceNumber = new Int32(0);
            data_CreateActivityeventsDto_parent.flowIsDone = true;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_parent.transitions = [
              {
                $ref: 'activityevents',
                $id: Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              },
            ];
            data_CreateActivityeventsDto_parent.userbasic =
              mongo.Types.ObjectId(datauserbasicsService._id);

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

          //Create ActivityEvent child
          try {
            data_CreateActivityeventsDto_child._id = id_Activityevents_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'COMPLETE';
            data_CreateActivityeventsDto_child.target = 'COMPLETE';
            data_CreateActivityeventsDto_child.event = 'CHANGE_PASS';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = true;
            data_CreateActivityeventsDto_parent.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_child.userbasic =
              mongo.Types.ObjectId(datauserbasicsService._id);

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

          var messages = "";
          if (lang == "en") {
            messages = "Change password successful";
          } else {
            messages = "Ubah kata sandi berhasil";
          }

          return {
            response_code: 202,
            messages: {
              info: [messages],
            },
          };
        } else {
          if (lang == "en") {
            await this.errorHandler.generateNotAcceptableException(
              'Password not Match',
            );
          } else {
            await this.errorHandler.generateNotAcceptableException(
              'Kata sandi tidak Cocok',
            );
          }
        }
      }
    } else {
      if (lang == "en") {
        await this.errorHandler.generateNotAcceptableException(
          'No users were found. Please check again.',
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
        );
      }
    }
  }

  async recoverpasswordV2new(req: any): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var mongo = require('mongoose');
    console.log("Request BODY >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(req.body));
    if (
      req.body.email == undefined ||
      req.body.event == undefined ||
      req.body.status == undefined
    ) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(req.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    var user_email = req.body.email;
    var user_otp = null;
    var user_password = null;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_parent_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    //Ceck User Userbasics
    const datauserbasicsService = await this.basic2SS.findbyemail(
      user_email,
    );

    //Ceck User Userauth
    // const datauserauthsService = await this.userauthsService.findOne(
    //   user_email,
    // );

    var login_source = "MANUAL";
    if (await this.utilsService.ceckData(datauserbasicsService)) {
      login_source = ((datauserbasicsService.loginSource != undefined)) ? datauserbasicsService.loginSource.toString() : "MANUAL";
    }

    if (login_source != "MANUAL") {
      if (lang == "en") {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          800,
          "Your account is already registered. Please sign in using your Gmail account."
        );
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          800,
          "Akun Kamu Telah Terdaftar. Silakan masuk menggunakan akun Gmail."
        );
      }
    }

    var lang = "id";
    if (req.body.lang != undefined) {
      lang = req.body.lang;
    }


    if (await this.utilsService.ceckData(datauserbasicsService)) {
      if (datauserbasicsService._id != null) {
        //Ceck User ActivityEvent Parent
        const user_activityevents =
          await this.activityeventsService.findParentWitoutDevice(
            user_email,
            'RECOVER_PASS',
            false,
          );
        //Ceck User Auth
        // const user_userAuth = await this.userauthsService.findOne(user_email);

        //ActivityEvent Parent > 0
        if (Object.keys(user_activityevents).length > 0) {
          let last;
          if (user_activityevents[0].transitions.length > 0) {
            last = await this.activityeventsService.findbyactivityEventID(
              user_email,
              user_activityevents[0].transitions[(user_activityevents[0].transitions.length) - 1].oid,
              'RECOVER_PASS',
              false,
            );
          } else {
            last = user_activityevents;
          }

          let StatusNext;
          let EventNext;

          if (last[0].status == 'NOTIFY') {
            StatusNext = 'REPLY';
            EventNext = 'VERIFY_OTP';
          } else if (last[0].status == 'REPLY') {
            StatusNext = 'COMPLETE';
            EventNext = 'COMPLETE';
          } else if (last[0].status == 'INITIAL') {
            StatusNext = user_activityevents[0].status;
            EventNext = user_activityevents[0].event;
          }

          const StatusCurrent = req.body.status;
          const EventCurrent = req.body.event;

          if (
            StatusNext == 'REPLY' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {
            if ('otp' in req.body) {
              user_otp = req.body.otp;
            }

            if (
              datauserbasicsService.oneTimePassword != undefined &&
              EventCurrent == 'VERIFY_OTP' &&
              StatusCurrent == 'REPLY'
            ) {

              if (
                await this.utilsService.compareOTPAttemp(
                  Number(datauserbasicsService.otpAttempt),
                )
              ) {
                if (
                  (datauserbasicsService.oneTimePassword != undefined
                    ? await this.utilsService.OTPExpires(
                      Number(await datauserbasicsService.otpRequestTime),
                    )
                    : false) == false &&
                  user_otp == datauserbasicsService.oneTimePassword
                ) {

                  //Create ActivityEvent child
                  try {
                    var id_child = new mongoose.Types.ObjectId();
                    data_CreateActivityeventsDto_child._id = id_child;
                    data_CreateActivityeventsDto_child.activityEventID =
                      ID_child_ActivityEvent;
                    data_CreateActivityeventsDto_child.activityType =
                      'RECOVER_PASS';
                    data_CreateActivityeventsDto_child.active = true;
                    data_CreateActivityeventsDto_child.status = StatusCurrent;
                    data_CreateActivityeventsDto_child.target = 'COMPLETE';
                    data_CreateActivityeventsDto_child.event = EventCurrent;
                    data_CreateActivityeventsDto_child.action =
                      'VerifyActivityCommand';
                    data_CreateActivityeventsDto_child._class =
                      'io.melody.hyppe.trans.domain.ActivityEvent';
                    data_CreateActivityeventsDto_child.payload = {
                      login_location: {
                        latitude: undefined,
                        longitude: undefined,
                      },
                      logout_date: undefined,
                      login_date: undefined,
                      login_device: undefined,
                      email: user_email,
                    };
                    data_CreateActivityeventsDto_child.createdAt = current_date;
                    data_CreateActivityeventsDto_child.updatedAt = current_date;
                    data_CreateActivityeventsDto_child.sequenceNumber = new Int32(
                      3,
                    );
                    data_CreateActivityeventsDto_child.flowIsDone = false;
                    data_CreateActivityeventsDto_child.parentActivityEventID =
                      user_activityevents[0].activityEventID;
                    data_CreateActivityeventsDto_child.userbasic =
                      mongo.Types.ObjectId(datauserbasicsService._id);

                    //Insert ActivityEvent child
                    await this.activityeventsService.create(
                      data_CreateActivityeventsDto_child,
                    );
                  } catch (error) {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Create Activity events Child. Error:' +
                      error,
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
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Update Activity events Parent. Error:' +
                      error,
                    );
                  }

                  this.basic2SS.updatebyEmailAuth(user_email, {
                    isEmailVerified: true,
                  });

                  this.basic2SS.updatebyEmailAuth(user_email, {
                    oneTimePassword: null,
                    otpRequestTime: new Long(0),
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });

                  var messages = "";
                  if (lang == "en") {
                    messages = "Verify OTP successful";
                  } else {
                    messages = "Verifikasi OTP berhasil";
                  }

                  var fullurl = req.get("Host") + req.originalUrl;
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  var reqbody = JSON.parse(JSON.stringify(req.body));
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                  return {
                    response_code: 202,
                    messages: {
                      info: [messages],
                    },
                  };
                } else {
                  this.basic2SS.findOneupdatebyEmail(user_email);
                  const user_userAuth = await this.userauthsService.findOne(
                    user_email,
                  );
                  if (await this.utilsService.ceckData(user_userAuth)) {
                    if (Number(user_userAuth.otpAttempt) >= 3) {
                      var OTP_expires =
                        await this.utilsService.generateOTPExpiresNextAttemptAllow();
                      this.basic2SS.updatebyEmailAuth(user_email, {
                        otpNextAttemptAllow: OTP_expires,
                      });
                    }
                    if (lang == "en") {
                      var fullurl = req.get("Host") + req.originalUrl;
                      var timestamps_end = await this.utilsService.getDateTimeString();
                      var reqbody = JSON.parse(JSON.stringify(req.body));
                      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                      await this.errorHandler.generateNotAcceptableException(
                        'The OTP code you entered is incorrect, please check again.',
                      );
                    } else {
                      var fullurl = req.get("Host") + req.originalUrl;
                      var timestamps_end = await this.utilsService.getDateTimeString();
                      var reqbody = JSON.parse(JSON.stringify(req.body));
                      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                      await this.errorHandler.generateNotAcceptableException(
                        'Kode OTP yang kamu masukan salah, silahkan cek kembali.',
                      );
                    }
                  } else {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed',
                    );
                  }
                }
              } else {
                if (
                  Number(datauserbasicsService.otpNextAttemptAllow) > 0
                    ? await this.utilsService.OTPNextAttempExpires(
                      Number(datauserbasicsService.otpNextAttemptAllow),
                    )
                    : datauserbasicsService.oneTimePassword != undefined &&
                    !(await this.utilsService.compareOTPAttemp(
                      Number(datauserbasicsService.otpAttempt),
                    ))
                ) {

                  //Create ActivityEvent child
                  try {
                    var id_child = new mongoose.Types.ObjectId();
                    data_CreateActivityeventsDto_child._id = id_child;
                    data_CreateActivityeventsDto_child.activityEventID =
                      ID_child_ActivityEvent;
                    data_CreateActivityeventsDto_child.activityType =
                      'RECOVER_PASS';
                    data_CreateActivityeventsDto_child.active = true;
                    data_CreateActivityeventsDto_child.status = 'NOTIFY';
                    data_CreateActivityeventsDto_child.target = 'REPLY';
                    data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
                    data_CreateActivityeventsDto_child._class =
                      'io.melody.hyppe.trans.domain.ActivityEvent';
                    data_CreateActivityeventsDto_child.action =
                      'NotifyActivityCommand';
                    data_CreateActivityeventsDto_child.payload = {
                      login_location: {
                        latitude: undefined,
                        longitude: undefined,
                      },
                      logout_date: undefined,
                      login_date: undefined,
                      login_device: undefined,
                      email: user_email,
                    };
                    data_CreateActivityeventsDto_child.createdAt = current_date;
                    data_CreateActivityeventsDto_child.updatedAt = current_date;
                    data_CreateActivityeventsDto_child.sequenceNumber =
                      new Int32(2);
                    data_CreateActivityeventsDto_child.flowIsDone = false;
                    data_CreateActivityeventsDto_child.__v = undefined;
                    data_CreateActivityeventsDto_child.parentActivityEventID =
                      ID_parent_ActivityEvent;
                    data_CreateActivityeventsDto_child.userbasic =
                      mongo.Types.ObjectId(datauserbasicsService._id);

                    //Insert ActivityEvent Parent
                    await this.activityeventsService.create(
                      data_CreateActivityeventsDto_child,
                    );
                  } catch (error) {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Create Activity events Child. Error: ' +
                      error,
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
                    await this.activityeventsService.update(
                      {
                        _id: user_activityevents[0]._id,
                      },
                      {
                        transitions: data_transitions,
                      },
                    );
                  } catch (error) {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed Update Activity events Parent. Error:' +
                      error,
                    );
                  }

                  var OTP = await this.utilsService.generateOTP();
                  var OTP_expires =
                    await this.utilsService.generateOTPExpires();

                  //Update User Auth
                  this.basic2SS.updatebyEmailAuth(user_email, {
                    oneTimePassword: OTP,
                    otpRequestTime: OTP_expires,
                    otpAttempt: new Long(0),
                    otpNextAttemptAllow: new Long(0),
                  });

                  await this.sendemailOTP2(
                    datauserbasicsService.email.toString(),
                    OTP.toString(),
                    'RECOVER_PASS', lang
                  );

                  var messages = "";
                  if (lang == "en") {
                    messages = "Recovery password request successful";
                  } else {
                    messages = "Permintaan kata sandi pemulihan berhasil";
                  }

                  var fullurl = req.get("Host") + req.originalUrl;
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  var reqbody = JSON.parse(JSON.stringify(req.body));
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                  return {
                    response_code: 202,
                    messages: {
                      info: [messages],
                    },
                  };
                } else {
                  if (lang == "en") {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'OTP max attempt exceeded, please try after ' +
                      process.env.OTP_NEXT_ALLOW_MINUTE +
                      ' minute',
                    );
                  } else {
                    var fullurl = req.get("Host") + req.originalUrl;
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    var reqbody = JSON.parse(JSON.stringify(req.body));
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Upaya maksimal OTP terlampaui, silakan coba setelah ' + process.env.OTP_NEXT_ALLOW_MINUTE +
                      ' menit',
                    );
                  }
                }
              }
            } else {
              if (lang == "en") {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'No users were found. Please check again.',
                );
              } else {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
                );
              }
            }
          } else if (
            StatusNext == 'COMPLETE' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {

            if ('new_password' in req.body) {
              user_password = req.body.new_password;
            } else {
              if (lang == "en") {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Kata sandi baru diperlukan',
                );
              } else {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                var reqbody = JSON.parse(JSON.stringify(req.body));
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'New password is required',
                );
              }
            }

            this.basic2SS.updatebyEmailAuth(user_email, {
              password: bcrypt.hashSync(user_password, 5),
            });

            const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findOne(user_email);
            if (await this.utilsService.ceckData(datajwtrefreshtokenService)) {
              this.updateRefreshToken(user_email);
            }

            // Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType =
                'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'COMPLETE';
              data_CreateActivityeventsDto_child.target = 'COMPLETE';
              data_CreateActivityeventsDto_child.event = 'COMPLETE';
              data_CreateActivityeventsDto_child.action =
                'VerifyActivityCommand';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber =
                new Int32(4);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                mongo.Types.ObjectId(datauserbasicsService._id);

              //Insert ActivityEvent child
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error:' +
                error,
              );
            }

            // Update ActivityEvent Parent
            try {
              const data_transitions = user_activityevents[0].transitions;
              data_transitions.push({
                $ref: 'activityevents',
                $id: new Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              });
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  payload: {
                    login_location: {
                      latitude: undefined,
                      longitude: undefined,
                    },
                    logout_date: current_date,
                    login_date: user_activityevents[0].payload.login_date,
                    login_device: undefined,
                    email: user_email,
                  },
                  flowIsDone: true,
                  transitions: data_transitions,
                },
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update Activity Event Parent. Error:' +
                error,
              );
            }

            // Update ActivityEvent All Child True
            try {
              await this.activityeventsService.updateFlowDone(
                user_activityevents[0].activityEventID,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                error,
              );
            }

            var messages = "";
            if (lang == "en") {
              messages = "Change password successful";
            } else {
              messages = "Ganti Kata Sandi berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } else if (
            StatusNext == 'INITIAL' &&
            StatusNext == StatusCurrent &&
            EventNext == EventCurrent
          ) {

            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action =
                'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                mongo.Types.ObjectId(datauserbasicsService._id);

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error: ' +
                error,
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
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update Activity events Parent. Error:' +
                error,
              );
            }

            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            this.basic2SS.updatebyEmailAuth(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP2(
              datauserbasicsService.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } else {
            //Create ActivityEvent child
            try {
              var id_child = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_child;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent;
              data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = 'NOTIFY';
              data_CreateActivityeventsDto_child.target = 'REPLY';
              data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
              data_CreateActivityeventsDto_child._class =
                'io.melody.hyppe.trans.domain.ActivityEvent';
              data_CreateActivityeventsDto_child.action =
                'NotifyActivityCommand';
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: undefined,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_child.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                mongo.Types.ObjectId(datauserbasicsService._id);

              //Insert ActivityEvent Parent
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error: ' +
                error,
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
              await this.activityeventsService.update(
                {
                  _id: user_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
            } catch (error) {
              var fullurl = req.get("Host") + req.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(req.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update Activity events Parent. Error:' +
                error,
              );
            }

            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            this.basic2SS.updatebyEmailAuth(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP2(
              datauserbasicsService.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          }
        } else {

          //Create ActivityEvent Parent
          try {
            var id_parent = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_parent._id = id_parent;
            data_CreateActivityeventsDto_parent.activityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_parent.activityType = 'RECOVER_PASS';
            data_CreateActivityeventsDto_parent.active = true;
            data_CreateActivityeventsDto_parent.status = 'INITIAL';
            data_CreateActivityeventsDto_parent.target = 'NOTIFY';
            data_CreateActivityeventsDto_parent.event = 'RECOVER_PASS';
            data_CreateActivityeventsDto_parent.fork = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_parent.action = 'RecoverPassCommand';
            data_CreateActivityeventsDto_parent._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_parent.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: undefined,
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
                $id: Object(ID_child_ActivityEvent),
                $db: 'hyppe_trans_db',
              },
            ];
            data_CreateActivityeventsDto_parent.userbasic =
              mongo.Types.ObjectId(datauserbasicsService._id);

            //Insert ActivityEvent Parent
            await this.activityeventsService.create(
              data_CreateActivityeventsDto_parent,
            );
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Parent. Error: ' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            var id_child = new mongoose.Types.ObjectId();
            data_CreateActivityeventsDto_child._id = id_child;
            data_CreateActivityeventsDto_child.activityEventID =
              ID_child_ActivityEvent;
            data_CreateActivityeventsDto_child.activityType = 'RECOVER_PASS';
            data_CreateActivityeventsDto_child.active = true;
            data_CreateActivityeventsDto_child.status = 'NOTIFY';
            data_CreateActivityeventsDto_child.target = 'REPLY';
            data_CreateActivityeventsDto_child.event = 'NOTIFY_OTP';
            data_CreateActivityeventsDto_child._class =
              'io.melody.hyppe.trans.domain.ActivityEvent';
            data_CreateActivityeventsDto_child.action = 'NotifyActivityCommand';
            data_CreateActivityeventsDto_child.payload = {
              login_location: {
                latitude: undefined,
                longitude: undefined,
              },
              logout_date: undefined,
              login_date: undefined,
              login_device: undefined,
              email: user_email,
            };
            data_CreateActivityeventsDto_child.createdAt = current_date;
            data_CreateActivityeventsDto_child.updatedAt = current_date;
            data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
            data_CreateActivityeventsDto_child.flowIsDone = false;
            data_CreateActivityeventsDto_child.__v = undefined;
            data_CreateActivityeventsDto_child.parentActivityEventID =
              ID_parent_ActivityEvent;
            data_CreateActivityeventsDto_child.userbasic =
              mongo.Types.ObjectId(datauserbasicsService._id);

            //Insert ActivityEvent Parent
            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Create Activity events Child. Error: ' +
              error,
            );
          }

          //Generate OTP
          try {
            var OTP = await this.utilsService.generateOTP();
            var OTP_expires = await this.utilsService.generateOTPExpires();

            //Update User Auth
            this.basic2SS.updatebyEmailAuth(user_email, {
              oneTimePassword: OTP,
              otpRequestTime: OTP_expires,
              otpAttempt: new Long(0),
              otpNextAttemptAllow: new Long(0),
            });

            await this.sendemailOTP2(
              datauserbasicsService.email.toString(),
              OTP.toString(),
              'RECOVER_PASS', lang
            );

            var messages = "";
            if (lang == "en") {
              messages = "Recovery password request successful";
            } else {
              messages = "Permintaan kata sandi pemulihan berhasil";
            }

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            return {
              response_code: 202,
              messages: {
                info: [messages],
              },
            };
          } catch (error) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(req.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Gnerate OTP. Error: ' + error,
            );
          }
        }
      } else {
        if (lang == "en") {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'No users were found. Please check again.',
          );
        } else {
          var fullurl = req.get("Host") + req.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(req.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
          );
        }
      }
    } else {
      if (lang == "en") {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          801,
          'No users were found. Please check again.',
        );
      } else {
        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(req.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, req.body.email, null, null, reqbody);

        await this.errorHandler.generateResponseCode(
          801,
          'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
        );
      }
    }
  }

  async sendemailOTP2(email: string, OTP: string, type: string, lang?: string) {
    //Send Email
    try {
      var Templates_ = new TemplatesRepo();
      Templates_ = await this.utilsService.getTemplate_repo(type, 'EMAIL');

      var subject = "";
      var body = "";
      var dataLang = "id";

      if (lang != undefined) {
        dataLang = lang;
      }

      if (dataLang == "en") {
        subject = Templates_.subject.toString();
        body = Templates_.body_detail.replace('9021', OTP);
      } else {
        subject = Templates_.subject_id.toString();
        body = Templates_.body_detail_id.replace('9021', OTP);
      }

      //var to = email;
      var to = email;
      var from = '"no-reply" <' + Templates_.from.toString() + '>';
      var subject = subject;
      var html_body = body;
      var send = await this.utilsService.sendEmail(
        to,
        from,
        subject,
        html_body,
      );
      await this.basic2SS.updateStatusemail(email, (await this.utilsService.getDateTimeString()));
      if (!send) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed Send Email OTP',
        );
      }
    } catch (error) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed Send Email OTP. Error:' + error,
      );
    }
  }


  async updateprofilev2(req: any, head: any) {
    if (!(await this.utilsService.validasiTokenEmail(head))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    var user_email_header = null;
    var user_email = null;
    var emailLogin = null;
    var user_username = null;
    var user_bio = null;
    var user_fullName = null;

    var user_country = null;
    var user_area = null;
    var user_city = null;
    var user_mobileNumber = null;
    var user_idProofNumber = null;
    var user_gender = null;
    var user_dob = null;
    var user_langIso = null;
    var mongo = require('mongoose');
    var event = req.body.event;
    var status = req.body.status;
    var urlLink=null;
    var judulLink=null;
    if (head['x-auth-user'] != undefined) {
      user_email_header = head['x-auth-user'];
    }

    if ((event == 'UPDATE_BIO') && (status == 'IN_PROGRESS')) {
      if (req.body.email != undefined) {
        user_email = req.body.email;
      }

      if (req.body.urlLink != undefined) {
        urlLink = req.body.urlLink;
      }
      if (req.body.judulLink != undefined) {
        judulLink = req.body.judulLink;
      }
      if (req.body.emailLogin != undefined) {

        emailLogin = req.body.emailLogin;
      }

      if (req.body.username != undefined) {
        user_username = req.body.username;
      }

      if (req.body.bio != undefined) {
        user_bio = req.body.bio;
      }

      if (req.body.fullName != undefined) {
        user_fullName = req.body.fullName;
      }

      if (req.body.country != undefined) {
        user_country = req.body.country;
      }

      if (req.body.area != undefined) {
        user_area = req.body.area;
      }

      if (req.body.city != undefined) {
        user_city = req.body.city;
      }

      if (req.body.mobileNumber != undefined) {
        user_mobileNumber = req.body.mobileNumber;
      }

      // if (req.body.$idProofNumber != undefined) {
      //   user_idProofNumber = req.body.idProofNumber;
      // }

      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }

      if (req.body.dob != undefined) {
        user_dob = req.body.dob;
      }

      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
    } else if ((event == 'UPDATE_PROFILE') && (status == 'COMPLETE_BIO')) {
      if (req.body.email != undefined) {
        user_email = req.body.email;
      }
      if (req.body.urlLink != undefined) {
        urlLink = req.body.urlLink;
      }
      if (req.body.judulLink != undefined) {
        judulLink = req.body.judulLink;
      }
      if (req.body.emailLogin != undefined) {

        emailLogin = req.body.emailLogin;
      }
      if (req.body.username != undefined) {
        user_username = req.body.username;
      }

      if (req.body.bio != undefined) {
        user_bio = req.body.bio;
      }

      if (req.body.fullName != undefined) {
        user_fullName = req.body.fullName;
      }

      if (req.body.country != undefined) {
        user_country = req.body.country;
      }

      if (req.body.area != undefined) {
        user_area = req.body.area;
      }

      if (req.body.city != undefined) {
        user_city = req.body.city;
      }

      if (req.body.mobileNumber != undefined) {
        user_mobileNumber = req.body.mobileNumber;
      }

      // if (req.body.$idProofNumber != undefined) {
      //   user_idProofNumber = req.body.$idProofNumber;
      // }

      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      }

      if (req.body.dob != undefined) {
        user_dob = req.body.dob;
      }

      if (req.body.langIso != undefined) {
        user_langIso = req.body.langIso;
      }
    } else {
      if (req.body.area != undefined) {
        user_area = req.body.area;
      }
      if (req.body.urlLink != undefined) {
        urlLink = req.body.urlLink;
      }
      if (req.body.judulLink != undefined) {
        judulLink = req.body.judulLink;
      }
      if (req.body.gender != undefined) {
        user_gender = req.body.gender;
      } else {
        user_gender = "";
      }

      if (req.body.dob != undefined) {
        user_dob = req.body.dob;
      } else {
        user_dob = "";
      }

      if (req.body.country != undefined) {
        user_country = req.body.country;
      }
    }

    // if (user_email_header != user_email) {
    //   throw new NotAcceptableException({
    //     response_code: 406,
    //     messages: {
    //       info: ['Unabled to proceed'],
    //     },
    //   });
    // }

    var type = 'ENROL';
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';

    //Ceck User ActivityEvent Parent
    const user_activityevents = await this.activityeventsService.findParentWitoutDevice(
      user_email_header,
      type,
      false,
    );

    //Ceck User Userbasics
    const datauserbasicsService = await this.basic2SS.findBymail(
      user_email_header,
    );

    //Ceck User Userauths
    // const datauserauthsService = await this.userauthsService.findOneByEmail(
    //   user_email,
    // );

    if (user_username != null) {
      if (await this.utilsService.ceckData(datauserbasicsService)) {
        var usernameExisting = datauserbasicsService.username.toString();
        if (usernameExisting != user_username) {
          var ceckUsername = await this.utilsService.validateUsername(user_username);
          if (!ceckUsername) {
            throw new NotAcceptableException({
              response_code: 406,
              messages: {
                info: ['Unabled to proceed, username is already in use'],
              },
            });
          }
        }
      }
    }

    if ((await this.utilsService.ceckData(datauserbasicsService))) {
      var id = datauserbasicsService._id.toString();
      var Data = {
        isEmailVerified: datauserbasicsService.isEmailVerified,
        status: datauserbasicsService.status,
      }
      if (await this.utilsService.isAuthVerified(Data)) {
        if (Object.keys(user_activityevents).length > 0) {

          if ((event == 'UPDATE_BIO') && (status == 'IN_PROGRESS')) {
            //Update Profile Bio
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (urlLink != null && urlLink !==undefined) {
                data_update_userbasict['urlLink'] = urlLink;
              }
              if (judulLink != null && judulLink !==undefined) {
                data_update_userbasict['judulLink'] = judulLink;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countriesName'] = (await countries).country;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['statesName'] = (await areas).stateName;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['citiesName'] = (await cities).cityName;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languagesLang'] = (await languages).lang;
                  data_update_userbasict['languagesLangIso'] = (await languages).langIso;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              data_update_userbasict['status'] = status;
              data_update_userbasict['event'] = event;
              if (emailLogin != null) {
                data_update_userbasict['emailLogin'] = emailLogin;
              }
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  data_update_userbasict['username'] = user_username;
                }
              }

              if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
                await this.basic2SS.updatebyEmail(user_email, data_update_userbasict);
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile bio. Error:' + error,
              );
            }

            //Create ActivityEvent child 1
            var ID_child_ActivityEvent_1 = (
              await this.utilsService.generateId()
            ).toLowerCase();
            try {
              var id_Activityevents_child_1 = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_Activityevents_child_1;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent_1;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = status;
              data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
              data_CreateActivityeventsDto_child.event = event;
              data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: current_date,
                login_device: undefined,
                email: user_email,
              };

              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(4);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_parent.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                mongo.Types.ObjectId(datauserbasicsService._id);

              //Insert ActivityEvent child
              await this.activityeventsService.create(
                data_CreateActivityeventsDto_child,
              );
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create Activity events Child. Error:' + error,
              );
            }

            //Update ActivityEvent Parent 1
            try {
              const data_transitions = user_activityevents[0].transitions;
              data_transitions.push({
                $ref: 'activityevents',
                $id: new Object(ID_child_ActivityEvent_1),
                $db: 'hyppe_trans_db',
              });

              //Update ActivityEvent Parent 1
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

          } else if ((event == 'UPDATE_PROFILE') && (status == 'COMPLETE_BIO')) {
            //Update Profile Detail
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (urlLink != null && urlLink !==undefined) {
                data_update_userbasict['urlLink'] = urlLink;
              }
              if (judulLink != null && judulLink !==undefined) {
                data_update_userbasict['judulLink'] = judulLink;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countriesName'] = (await countries).country;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['statesName'] = (await areas).stateName;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['citiesName'] = (await cities).cityName;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languagesLang'] = (await languages).lang;
                  data_update_userbasict['languagesLangIso'] = (await languages).langIso;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              data_update_userbasict['isComplete'] = true;
              data_update_userbasict['status'] = status;
              data_update_userbasict['event'] = event;
              if (emailLogin != null) {
                data_update_userbasict['emailLogin'] = emailLogin;
              }
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  data_update_userbasict['username'] = user_username;
                }
              }

              if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
                await this.basic2SS.updatebyEmail(user_email, data_update_userbasict);
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile detail. Error:' + error,
              );
            }

            //Create ActivityEvent child 2
            var ID_child_ActivityEvent_2 = (
              await this.utilsService.generateId()
            ).toLowerCase();
            try {
              var id_Activityevents_child_2 = new mongoose.Types.ObjectId();
              data_CreateActivityeventsDto_child._id = id_Activityevents_child_2;
              data_CreateActivityeventsDto_child.activityEventID =
                ID_child_ActivityEvent_2;
              data_CreateActivityeventsDto_child.activityType = type;
              data_CreateActivityeventsDto_child.active = true;
              data_CreateActivityeventsDto_child.status = status;
              data_CreateActivityeventsDto_child.target = 'COMPLETE_BIO';
              data_CreateActivityeventsDto_child.event = event;
              data_CreateActivityeventsDto_child._class = _class_ActivityEvent;
              data_CreateActivityeventsDto_child.payload = {
                login_location: {
                  latitude: undefined,
                  longitude: undefined,
                },
                logout_date: undefined,
                login_date: current_date,
                login_device: undefined,
                email: user_email,
              };
              data_CreateActivityeventsDto_child.createdAt = current_date;
              data_CreateActivityeventsDto_child.updatedAt = current_date;
              data_CreateActivityeventsDto_child.sequenceNumber = new Int32(4);
              data_CreateActivityeventsDto_child.flowIsDone = false;
              data_CreateActivityeventsDto_parent.__v = undefined;
              data_CreateActivityeventsDto_child.parentActivityEventID =
                user_activityevents[0].activityEventID;
              data_CreateActivityeventsDto_child.userbasic =
                mongo.Types.ObjectId(datauserbasicsService._id);

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
                $id: new Object(ID_child_ActivityEvent_2),
                $db: 'hyppe_trans_db',
              });

              //Update ActivityEvent Parent
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

            //Update ActivityEvent All Child True
            try {
              await this.activityeventsService.updateFlowDone(user_activityevents[0].activityEventID.toString());
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update ActivityEvent All Child True. Error:' +
                error,
              );
            }
          } else {
            var data_update_userbasict = {};
            user_email = user_email_header;
            console.log("user_area", user_area)
            if (user_area != null) {
              var areas = await this.areasService.findOneName(user_area);
              if ((await this.utilsService.ceckData(areas))) {
                var areas_id = (await areas)._id;
                data_update_userbasict['statesName'] = (await areas).stateName;
                data_update_userbasict['states'] = {
                  $ref: 'areas',
                  $id: areas_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            if (user_gender != null) {
              data_update_userbasict['gender'] = user_gender;
            }
            if (user_dob != null) {
              data_update_userbasict['dob'] = user_dob;
            }
            if (user_country != null) {
              var countries = await this.countriesService.findOneName(user_country);
              if ((await this.utilsService.ceckData(countries))) {
                var countries_id = (await countries)._id;
                data_update_userbasict['countriesName'] = (await countries).country;
                data_update_userbasict['countries'] = {
                  $ref: 'countries',
                  $id: countries_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            if (urlLink != null && urlLink !==undefined) {
              data_update_userbasict['urlLink'] = urlLink;
            }
            if (judulLink != null && judulLink !==undefined) {
              data_update_userbasict['judulLink'] = judulLink;
            }
            if (user_area != null || user_gender != null || user_dob != null || user_country != null) {
              await this.basic2SS.updatebyEmail(user_email_header, data_update_userbasict);
            }
          }

          return {
            response_code: 202,
            messages: {
              info: ['Update profile successful'],
            }
          };
        }
         else {
          if ((event == 'UPDATE_BIO') && (status == 'IN_PROGRESS')) {
            //Update Profile Bio
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (urlLink != null && urlLink !==undefined) {
                data_update_userbasict['urlLink'] = urlLink;
              }
              if (judulLink != null && judulLink !==undefined) {
                data_update_userbasict['judulLink'] = judulLink;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countriesName'] = (await countries).country;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['statesName'] = (await areas).stateName;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['citiesName'] = (await cities).cityName;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languagesLang'] = (await languages).lang;
                  data_update_userbasict['languagesLangIso'] = (await languages).langIso;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (emailLogin != null) {
                data_update_userbasict['emailLogin'] = emailLogin;
              }
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  data_update_userbasict['username'] = user_username;
                }
              }

              //data_update_userbasict['status'] = status;
              //data_update_userbasict['event'] = event;

              await this.basic2SS.updatebyEmail(user_email, data_update_userbasict);
              // if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
              //   await this.userbasicsService.updatebyEmail(user_email, data_update_userbasict);
              // }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile bio. Error:' + error,
              );
            }
          } else if ((event == 'UPDATE_PROFILE') && (status == 'COMPLETE_BIO')) {
            //Update Profile Detail
            try {
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  await this.userauthsService.updatebyEmail(user_email, {
                    username: user_username
                  });
                }
              }

              var data_update_userbasict = {};
              if (user_fullName != null) {
                data_update_userbasict['fullName'] = user_fullName;
              }
              if (user_bio != null) {
                data_update_userbasict['bio'] = user_bio;
              }
              if (user_mobileNumber != null) {
                data_update_userbasict['mobileNumber'] = user_mobileNumber;
              }
              // if (user_idProofNumber != null) {
              //   data_update_userbasict['idProofNumber'] = user_idProofNumber;
              // }
              if (user_gender != null) {
                data_update_userbasict['gender'] = user_gender;
              }
              if (user_dob != null) {
                data_update_userbasict['dob'] = user_dob;
              }
              if (user_country != null) {
                var countries = await this.countriesService.findOneName(user_country);
                if ((await this.utilsService.ceckData(countries))) {
                  var countries_id = (await countries)._id;
                  data_update_userbasict['countriesName'] = (await countries).country;
                  data_update_userbasict['countries'] = {
                    $ref: 'countries',
                    $id: countries_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_area != null) {
                var areas = await this.areasService.findOneName(user_area);
                if ((await this.utilsService.ceckData(areas))) {
                  var areas_id = (await areas)._id;
                  data_update_userbasict['statesName'] = (await areas).stateName;
                  data_update_userbasict['states'] = {
                    $ref: 'areas',
                    $id: areas_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_city != null) {
                var cities = await this.citiesService.findOneName(user_city);
                if ((await this.utilsService.ceckData(cities))) {
                  var cities_id = (await cities)._id;
                  data_update_userbasict['citiesName'] = (await cities).cityName;
                  data_update_userbasict['cities'] = {
                    $ref: 'cities',
                    $id: cities_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_langIso != null) {
                var languages = await this.languagesService.findOneLangiso(user_langIso);
                if ((await this.utilsService.ceckData(languages))) {
                  var languages_id = (await languages)._id;
                  data_update_userbasict['languagesLang'] = (await languages).lang;
                  data_update_userbasict['languagesLangIso'] = (await languages).langIso;
                  data_update_userbasict['languages'] = {
                    $ref: 'languages',
                    $id: languages_id,
                    $db: 'hyppe_infra_db',
                  };
                }
              }
              if (user_username != null) {
                if (await this.utilsService.validateUsername(user_username)) {
                  data_update_userbasict['username'] = user_username;
                }
              }
              //data_update_userbasict['isComplete'] = true;
              //data_update_userbasict['status'] = status;
              //data_update_userbasict['event'] = event;

              if (user_bio != null || user_fullName != null || user_dob != null || user_gender != null || user_mobileNumber != null) {
                await this.basic2SS.updatebyEmail(user_email, data_update_userbasict);
              }
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed update profile detail. Error:' + error,
              );
            }
          } else {
            var data_update_userbasict = {};
            user_email = user_email_header;
            console.log("user_email", user_email)
            if (user_area != null) {
              var areas = await this.areasService.findOneName(user_area);
              if ((await this.utilsService.ceckData(areas))) {
                var areas_id = (await areas)._id;
                data_update_userbasict['statesName'] = (await areas).stateName;
                data_update_userbasict['states'] = {
                  $ref: 'areas',
                  $id: areas_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            if (user_gender != null) {
              data_update_userbasict['gender'] = user_gender;
            }
            if (user_dob != null) {
              data_update_userbasict['dob'] = user_dob;
            }
            if (user_country != null) {
              var countries = await this.countriesService.findOneName(user_country);
              if ((await this.utilsService.ceckData(countries))) {
                var countries_id = (await countries)._id;
                data_update_userbasict['countriesName'] = (await countries).country;
                data_update_userbasict['countries'] = {
                  $ref: 'countries',
                  $id: countries_id,
                  $db: 'hyppe_infra_db',
                };
              }
            }
            if (user_area != null || user_gender != null || user_dob != null || user_country != null) {
              await this.basic2SS.updatebyEmail(user_email_header, data_update_userbasict);
            }
          }

          return {
            response_code: 202,
            messages: {
              info: ['Update profile successful'],
            }
          };
        }
      } else {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed, User not verified'],
          },
        });
      }
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, User not found'],
        },
      });
    }
  }


  async scorereferralrequest(iduser: string, idevent: string, namatabel: string, event: string, listchallenge: any[]) {
    await this.contenteventsService.scorereferralrequest(iduser, idevent, namatabel, event, listchallenge)
  }

  async guestToreal(data: Userbasicnew) {
    if (data.tempfollowing.length != 0) {
      var inputfollowing = data.following;
      var listfollower = data.tempfollowing;
      for (var i = 0; i < listfollower.length; i++) {
        inputfollowing.push(listfollower[i]);

        var getdata = await this.basic2SS.findbyemail(listfollower[i]);
        var listuser = getdata.follower;
        listuser.push(data.email.toString());
        var updateuser = new CreateuserbasicnewDto();
        updateuser.follower = listuser;
        await this.basic2SS.update(getdata._id.toString(), updateuser);
        // await this.utilsService.sendFcmV2(data.email.toString(), listfollower[i], "FOLLOWER", "ACCEPT", "FOLLOWER");
      }

      var updateuser = new CreateuserbasicnewDto();
      updateuser.tempfollowing = [];
      updateuser.following = inputfollowing;
      await this.basic2SS.update(data._id.toString(), updateuser);
    }

    var getlisttemp = await this.post2SS.countTemppost(data.email.toString(), "like");
    var totalpostlike = null;
    try {
      totalpostlike = getlisttemp[0].total;
    }
    catch (e) {
      totalpostlike = 0;
    }

    if (totalpostlike != 0) {
      var listlike = getlisttemp[0].data;
      var pagelike = null;
      var totalpage = totalpostlike / 25;

      var tpage2 = (totalpage).toFixed(0);
      var tpage = (totalpostlike % 25);
      if (tpage > 0 && tpage < 5) {
        pagelike = parseInt(tpage2) + 1;

      } else {
        pagelike = parseInt(tpage2);
      }

      for (var i = 0; i < pagelike; i++) {
        var currentlikepage = i * 25;
        var nextlikepage = (i + 1) * 25;
        var getlistpost = listlike.slice(currentlikepage, nextlikepage);

        var getresultlike = await this.post2SS.findById(getlistpost);
        for (var j = 0; j < getresultlike.length; j++) {
          var datapost = getresultlike[j];
          var getuserview = datapost.tempLike;
          var filterlike = getuserview.filter((element) => element != data.email.toString());
          var updatedata = new newPosts();
          updatedata.tempLike = filterlike;
          updatedata.userLike = datapost.userLike;
          updatedata.userLike.push(data.email.toString());

          await this.post2SS.update(datapost.postID, updatedata);
        }
      }
    }

    var getlisttemp = await this.post2SS.countTemppost(data.email.toString(), "view");
    var totalpostview = null;
    try {
      totalpostview = getlisttemp[0].total;
    }
    catch (e) {
      totalpostview = 0;
    }

    if (totalpostview != 0) {
      var listview = getlisttemp[0].data;
      var pageview = null;
      var totalpage = totalpostview / 25;

      var tpage2 = (totalpage).toFixed(0);
      var tpage = (totalpostview % 25);
      if (tpage > 0 && tpage < 5) {
        pageview = parseInt(tpage2) + 1;

      } else {
        pageview = parseInt(tpage2);
      }

      for (var i = 0; i < pageview; i++) {
        var currentviewpage = i * 25;
        var nextviewpage = (i + 1) * 25;
        var getlistpost = listview.slice(currentviewpage, nextviewpage);

        var getresultview = await this.post2SS.findById(getlistpost);
        for (var j = 0; j < getresultview.length; j++) {
          var datapost = getresultview[j];
          var getuserview = datapost.tempView;
          var filterview = getuserview.filter((element) => element != data.email.toString());
          var updatedata = new newPosts();
          updatedata.tempView = filterview;
          updatedata.userView = datapost.userView;
          updatedata.userView.push(data.email.toString());

          await this.post2SS.update(datapost.postID, updatedata);
        }
      }
    }
  }

  async addUniqEvent(email_receiverParty:string,eventType:string,active:string,event:string,email_user:string,postID:string){
    var uniqEvent=null;
    var arrData=[];
    uniqEvent=email_receiverParty+","+eventType+","+active+","+event+","+email_user+","+postID;
    arrData.push(uniqEvent);
    return arrData;
  }
}