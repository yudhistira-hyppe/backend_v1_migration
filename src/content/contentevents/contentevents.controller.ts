import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger } from '@nestjs/common';
import { ContenteventsService } from './contentevents.service';
import { ContentEventId, CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents } from './schemas/contentevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { InsightsService } from '../insights/insights.service';
import { PostDisqusService } from '../disqus/post/postdisqus.service';
import { request } from 'http';
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';
import { CreateInsightlogsDto } from '../insightlogs/dto/create-insightlogs.dto';
import { InsightlogsService } from '../insightlogs/insightlogs.service';
import { CreateInsightsDto } from '../insights/dto/create-insights.dto';
import { DisquscontactsService } from '../disquscontacts/disquscontacts.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { CreateDisquslogsDto } from '../disquslogs/dto/create-disquslogs.dto';
import { ContentDto, CreateDisqusDto, DisqusResDto } from '../disqus/dto/create-disqus.dto';
import { CreateDisquscontactsDto } from '../disquscontacts/dto/create-disquscontacts.dto';
import { Posts } from '../posts/schemas/posts.schema';
import { DisqusContentEventService } from './discus/disqusdisquscontentevent.service';
import { DisqusContentEventController } from './discus/disquscontentevent.controller';
import { Disquslogs } from '../disquslogs/schemas/disquslogs.schema';
import { ReactionsRepoService } from '../../infra/reactions_repo/reactions_repo.service';
import { FriendListService } from '../friend_list/friend_list.service';
import { UserbasicsService } from 'src/trans/userbasics/userbasics.service';
import { NewpostsService } from '../newposts/newposts.service';
import { UserchallengesService } from 'src/trans/userchallenges/userchallenges.service';
import { ChallengeService } from 'src/trans/challenge/challenge.service';
import { TagCountService } from 'src/content/tag_count/tag_count.service';
import { PostchallengeService } from 'src/trans/postchallenge/postchallenge.service';
import { Postchallenge } from 'src/trans/postchallenge/schemas/postchallenge.schema';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { logApis } from 'src/trans/logapis/schema/logapis.schema';
import { subChallengeService } from 'src/trans/challenge/subChallenge.service';
import { MediastreamingService } from '../mediastreaming/mediastreaming.service';
import mongoose from 'mongoose';
import { RequestSoctDto } from '../mediastreaming/dto/mediastreaming.dto';
import { ConfigService } from '@nestjs/config';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { NewpostService } from '../disqus/newpost/newpost.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { temppostDISCUSS } from '../disqus/newpost/temppost.service';
@Controller()
export class ContenteventsController {
  private readonly logger = new Logger(ContenteventsController.name);
  constructor(
    private readonly contenteventsService: ContenteventsService,
    private readonly utilsService: UtilsService,
    private readonly insightlogsService: InsightlogsService,
    private readonly insightsService: InsightsService,
    private readonly postsService: PostDisqusService,
    private readonly disquscontactsService: DisquscontactsService,
    private readonly disquslogsService: DisquslogsService,
    private readonly disqusContentEventService: DisqusContentEventService,
    private readonly reactionsRepoService: ReactionsRepoService,
    private readonly disqusContentEventController: DisqusContentEventController,
    private readonly friendListService: FriendListService,
    private readonly userbasicsService: UserbasicsService,
    private readonly NewpostsService: NewpostsService,
    private readonly userchallengesService: UserchallengesService,
    private readonly challengeService: ChallengeService,
    private readonly tagCountService: TagCountService,
    private readonly postchallengeService: PostchallengeService,
    private readonly errorHandler: ErrorHandler,
    private readonly logapiSS: LogapisService,
    private readonly configService: ConfigService,
    private readonly mediastreamingService: MediastreamingService,
    private readonly postDisqusSS: NewpostService,
    private readonly basic2SS: UserbasicnewService,
    private readonly subChallengeService: subChallengeService,
    private readonly tempostSS: temppostDISCUSS) { }

  @Post('api/contentevents')
  async create(@Body() CreateContenteventsDto: CreateContenteventsDto) {

    try {
      await this.contenteventsService.create(CreateContenteventsDto);
    } catch (e) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, '

      );
    }
  }

  @Get('api/contentevents')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Contentevents[]> {
    return this.contenteventsService.findAll();
  }

  @Get('api/contentevents/:email')
  async findOneId(@Param('email') email: string): Promise<Contentevents> {
    return this.contenteventsService.findOne(email);
  }

  @Delete('api/contentevents/:id')
  async delete(@Param('id') id: string) {
    return this.contenteventsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/contentevents/useractivitynow')
  async countUsersActivityNow(@Body('date') date: Date, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Now', 'view'))){
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivityNow(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/contentevents/useractivitybeforetoday')
  async countUserActivityBeforeToday(
    @Body('day') day: number, @Headers() headers
  ): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Before-Today', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivityBeforeToday(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysize')
  async countUserActivitySize(@Body('day') day: number, @Headers() headers
  ): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Size', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivitySize(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysizeYear')
  async countUserActivitySizeYear(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-User-Activity-Size-Year', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivitySizeYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivityyear')
  async countUserActivityYear(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-User-Activity-Year', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivityYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/friend/:email')
  async friend(@Param('email') email: string, @Headers() headers, @Req() req) {
    var timestamps_start = await this.utilsService.getDateTimeString();

    var data = await this.contenteventsService.friend(email, headers);

    var fullurl = req.get("Host") + req.originalUrl;
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
      response_code: 202,
      data: data,
      count_friend: (await data).length,
      messages: {
        info: ['Succes Get Friend'],
      },
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.ACCEPTED)
  // @Post('api/posts/interactive')
  // async interactive(@Req() request: any, @Headers() headers) {
  //   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(request.body));
  //   if (headers['x-auth-user'] == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed auth-user undefined',
  //     );
  //   }
  //   if (request.body.eventType == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param eventType is required',
  //     );
  //   }
  //   if (request.body.receiverParty == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param receiverParty is required',
  //     );
  //   }

  //   const eventType = request.body.eventType;
  //   const email_user = headers['x-auth-user'];
  //   const email_receiverParty = request.body.receiverParty;
  //   const current_date = await this.utilsService.getDateTimeString();

  //   var Insight_sender = await this.insightsService.findemail(email_user);
  //   var Insight_receiver = await this.insightsService.findemail(email_receiverParty);

  //   if (eventType == "FOLLOWING") {
  //     var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
  //     var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
  //     if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
  //       var _id_1 = (await this.utilsService.generateId());
  //       var _id_2 = (await this.utilsService.generateId());
  //       var CreateContenteventsDto1 = new CreateContenteventsDto();
  //       CreateContenteventsDto1._id = _id_1
  //       CreateContenteventsDto1.contentEventID = _id_1
  //       CreateContenteventsDto1.email = email_receiverParty
  //       CreateContenteventsDto1.eventType = "FOLLOWER"
  //       CreateContenteventsDto1.active = true
  //       CreateContenteventsDto1.event = "ACCEPT"
  //       CreateContenteventsDto1.createdAt = current_date
  //       CreateContenteventsDto1.updatedAt = current_date
  //       CreateContenteventsDto1.sequenceNumber = 1
  //       CreateContenteventsDto1.flowIsDone = true
  //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto1.receiverParty = email_user

  //       var CreateContenteventsDto2 = new CreateContenteventsDto();
  //       CreateContenteventsDto2._id = _id_2
  //       CreateContenteventsDto2.contentEventID = _id_2
  //       CreateContenteventsDto2.email = email_user
  //       CreateContenteventsDto2.eventType = "FOLLOWING"
  //       CreateContenteventsDto2.active = true
  //       CreateContenteventsDto2.event = "ACCEPT"
  //       CreateContenteventsDto2.createdAt = current_date
  //       CreateContenteventsDto2.updatedAt = current_date
  //       CreateContenteventsDto2.sequenceNumber = 1
  //       CreateContenteventsDto2.flowIsDone = true
  //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto2.senderParty = email_receiverParty

  //       if (await this.utilsService.ceckData(Insight_sender)) {
  //         var _id_sender = (await this.utilsService.generateId());
  //         var CreateInsightlogsDto_sender = new CreateInsightlogsDto()
  //         CreateInsightlogsDto_sender._id = _id_sender;
  //         CreateInsightlogsDto_sender.insightID = Insight_sender._id;
  //         CreateInsightlogsDto_sender.createdAt = current_date;
  //         CreateInsightlogsDto_sender.updatedAt = current_date;
  //         CreateInsightlogsDto_sender.mate = email_receiverParty
  //         CreateInsightlogsDto_sender.eventInsight = "FOLLOWING"
  //         CreateInsightlogsDto_sender._class = "io.melody.hyppe.content.domain.InsightLog"
  //         await this.insightlogsService.create(CreateInsightlogsDto_sender);

  //         var LogInsught_sensder = Insight_sender.insightLogs;
  //         LogInsught_sensder.push({
  //           $ref: 'insightlogs',
  //           $id: _id_sender,
  //           $db: 'hyppe_content_db',
  //         });

  //         var CreateInsightsDto_sender = new CreateInsightsDto()
  //         CreateInsightsDto_sender.insightLogs = LogInsught_sensder;
  //         await this.insightsService.updateone(email_user, CreateInsightsDto_sender)

  //       }
  //       if (await this.utilsService.ceckData(Insight_receiver)) {
  //         var _id_receiver = (await this.utilsService.generateId());
  //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //         CreateInsightlogsDto_receiver._id = _id_receiver;
  //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //         CreateInsightlogsDto_receiver.createdAt = current_date;
  //         CreateInsightlogsDto_receiver.updatedAt = current_date;
  //         CreateInsightlogsDto_receiver.mate = email_user
  //         CreateInsightlogsDto_receiver.eventInsight = "FOLLOWER"
  //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //         var LogInsught_receiver = Insight_receiver.insightLogs;
  //         LogInsught_receiver.push({
  //           $ref: 'insightlogs',
  //           $id: _id_receiver,
  //           $db: 'hyppe_content_db',
  //         });

  //         var CreateInsightsDto_receiver = new CreateInsightsDto()
  //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
  //       }

  //       try {
  //         await this.contenteventsService.create(CreateContenteventsDto1);
  //         await this.contenteventsService.create(CreateContenteventsDto2);
  //         await this.insightsService.updateFollower(email_receiverParty);
  //         await this.insightsService.updateFollowing(email_user);
  //         this.sendInteractiveFCM(email_receiverParty, "FOLLOWER", "", email_user);
  //         //this.sendInteractiveFCM(email_user, "FOLLOWING", "", email_receiverParty);
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     } else {
  //       if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
  //         await this.contenteventsService.updateFollowing(email_user, "FOLLOWING", email_receiverParty);
  //         await this.contenteventsService.updateFollower(email_receiverParty, "FOLLOWER", email_user);
  //         await this.insightsService.updateFollower(email_receiverParty);
  //         await this.insightsService.updateFollowing(email_user);
  //         this.sendInteractiveFCM(email_receiverParty, "FOLLOWER", "", email_user);
  //       }
  //     }

  //     this.checkFriendbasedString(email_user, email_receiverParty, "create");
  //   }
  //   else if (eventType == "VIEW") {
  //     if (email_user !== email_receiverParty) {
  //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
  //       var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
  //       var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
  //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
  //         var _id_1 = (await this.utilsService.generateId());
  //         var _id_2 = (await this.utilsService.generateId());
  //         var CreateContenteventsDto1 = new CreateContenteventsDto();
  //         CreateContenteventsDto1._id = _id_1
  //         CreateContenteventsDto1.contentEventID = _id_1
  //         CreateContenteventsDto1.email = email_user
  //         CreateContenteventsDto1.eventType = "VIEW"
  //         CreateContenteventsDto1.active = true
  //         CreateContenteventsDto1.event = "DONE"
  //         CreateContenteventsDto1.createdAt = current_date
  //         CreateContenteventsDto1.updatedAt = current_date
  //         CreateContenteventsDto1.sequenceNumber = 1
  //         CreateContenteventsDto1.flowIsDone = true
  //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //         CreateContenteventsDto1.receiverParty = email_receiverParty
  //         CreateContenteventsDto1.postID = request.body.postID

  //         var CreateContenteventsDto2 = new CreateContenteventsDto();
  //         CreateContenteventsDto2._id = _id_2
  //         CreateContenteventsDto2.contentEventID = _id_2
  //         CreateContenteventsDto2.email = email_receiverParty
  //         CreateContenteventsDto2.eventType = "VIEW"
  //         CreateContenteventsDto2.active = true
  //         CreateContenteventsDto2.event = "ACCEPT"
  //         CreateContenteventsDto2.createdAt = current_date
  //         CreateContenteventsDto2.updatedAt = current_date
  //         CreateContenteventsDto2.sequenceNumber = 1
  //         CreateContenteventsDto2.flowIsDone = true
  //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //         CreateContenteventsDto2.senderParty = email_user
  //         CreateContenteventsDto2.postID = request.body.postID

  //         if (await this.utilsService.ceckData(Insight_receiver)) {
  //           var _id_receiver = (await this.utilsService.generateId());
  //           var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //           CreateInsightlogsDto_receiver._id = _id_receiver;
  //           CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //           CreateInsightlogsDto_receiver.createdAt = current_date;
  //           CreateInsightlogsDto_receiver.updatedAt = current_date;
  //           CreateInsightlogsDto_receiver.mate = email_user
  //           CreateInsightlogsDto_receiver.postID = request.body.postID
  //           CreateInsightlogsDto_receiver.eventInsight = "VIEW"
  //           CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //           await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //           var LogInsught_receiver = Insight_receiver.insightLogs;
  //           LogInsught_receiver.push({
  //             $ref: 'insightlogs',
  //             $id: _id_receiver,
  //             $db: 'hyppe_content_db',
  //           });

  //           var CreateInsightsDto_receiver = new CreateInsightsDto()
  //           CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //           await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
  //         }

  //         try {
  //           await this.contenteventsService.create(CreateContenteventsDto1);
  //           await this.contenteventsService.create(CreateContenteventsDto2);
  //           await this.postsService.updateView(email_receiverParty, request.body.postID);
  //           await this.insightsService.updateViews(email_receiverParty);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, ' +
  //             error,
  //           );
  //         }
  //       }
  //     }
  //   } else if (eventType == "LIKE") {
  //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
  //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
  //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //       var _id_1 = (await this.utilsService.generateId());
  //       var _id_2 = (await this.utilsService.generateId());
  //       var CreateContenteventsDto1 = new CreateContenteventsDto();
  //       CreateContenteventsDto1._id = _id_1
  //       CreateContenteventsDto1.contentEventID = _id_1
  //       CreateContenteventsDto1.email = email_user
  //       CreateContenteventsDto1.eventType = "LIKE"
  //       CreateContenteventsDto1.active = true
  //       CreateContenteventsDto1.event = "DONE"
  //       CreateContenteventsDto1.createdAt = current_date
  //       CreateContenteventsDto1.updatedAt = current_date
  //       CreateContenteventsDto1.sequenceNumber = 1
  //       CreateContenteventsDto1.flowIsDone = true
  //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto1.receiverParty = email_receiverParty
  //       CreateContenteventsDto1.postID = request.body.postID

  //       var CreateContenteventsDto2 = new CreateContenteventsDto();
  //       CreateContenteventsDto2._id = _id_2
  //       CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
  //       CreateContenteventsDto2.email = email_receiverParty
  //       CreateContenteventsDto2.eventType = "LIKE"
  //       CreateContenteventsDto2.active = true
  //       CreateContenteventsDto2.event = "ACCEPT"
  //       CreateContenteventsDto2.createdAt = current_date
  //       CreateContenteventsDto2.updatedAt = current_date
  //       CreateContenteventsDto2.sequenceNumber = 1
  //       CreateContenteventsDto2.flowIsDone = true
  //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto2.senderParty = email_user
  //       CreateContenteventsDto2.postID = request.body.postID

  //       if (await this.utilsService.ceckData(Insight_receiver)) {
  //         var _id_receiver = (await this.utilsService.generateId());
  //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //         CreateInsightlogsDto_receiver._id = _id_receiver;
  //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //         CreateInsightlogsDto_receiver.createdAt = current_date;
  //         CreateInsightlogsDto_receiver.updatedAt = current_date;
  //         CreateInsightlogsDto_receiver.mate = email_user
  //         CreateInsightlogsDto_receiver.eventInsight = "LIKE"
  //         CreateInsightlogsDto_receiver.postID = request.body.postID
  //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //         var LogInsught_receiver = Insight_receiver.insightLogs;
  //         LogInsught_receiver.push({
  //           $ref: 'insightlogs',
  //           $id: _id_receiver,
  //           $db: 'hyppe_content_db',
  //         });

  //         var CreateInsightsDto_receiver = new CreateInsightsDto()
  //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
  //       }

  //       try {
  //         await this.contenteventsService.create(CreateContenteventsDto1);
  //         await this.contenteventsService.create(CreateContenteventsDto2);
  //         await this.insightsService.updateLike(email_receiverParty);
  //         await this.postsService.updateLike(email_receiverParty, request.body.postID);
  //         this.sendInteractiveFCM(email_receiverParty, "LIKE", request.body.postID, email_user);
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     } else {
  //       if (ceck_data_DONE.active && ceck_data_DONE.active) {
  //         try {
  //           await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
  //           await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
  //           await this.insightsService.updateUnlike(email_receiverParty);
  //           await this.postsService.updateUnLike(email_receiverParty, request.body.postID);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, ' +
  //             error,
  //           );
  //         }
  //       } else {
  //         try {
  //           await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
  //           await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
  //           await this.insightsService.updateLike(email_receiverParty);
  //           await this.postsService.updateLike(email_receiverParty, request.body.postID);
  //         } catch (error) {
  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, ' +
  //             error,
  //           );
  //         }
  //       }
  //     }
  //   }else if (eventType == "UNLIKE") {
  //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
  //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
  //     if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //       try {
  //         await this.insightsService.updateUnlike(email_receiverParty);
  //         await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
  //         await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
  //         await this.postsService.updateUnLike(email_receiverParty, request.body.postID);
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     } else {
  //       if (ceck_data_DONE.active != undefined && !ceck_data_ACCEPT.active != undefined) {
  //         if (ceck_data_DONE.active && ceck_data_ACCEPT.active) {
  //           try {
  //             await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
  //             await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
  //             await this.insightsService.updateUnlike(email_receiverParty);
  //             await this.postsService.updateUnLike(email_receiverParty, request.body.postID);
  //           } catch (error) {
  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, ' +
  //               error,
  //             );
  //           }
  //         } else {
  //           try {
  //             await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
  //             await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
  //             await this.insightsService.updateLike(email_receiverParty);
  //             await this.postsService.updateLike(email_receiverParty, request.body.postID);
  //           } catch (error) {
  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, ' +
  //               error,
  //             );
  //           }
  //         }
  //       }
  //     }
  //   } else if (eventType == "UNFOLLOW") {
  //     var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
  //     var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
  //     if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
  //       try {
  //         await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
  //         await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
  //         await this.insightsService.updateUnFollower(email_receiverParty);
  //         await this.insightsService.updateUnFollowing(email_user);
  //         await this.insightsService.updateUnFollow(email_user);

  //         this.checkFriendbasedString(email_user, email_receiverParty, "delete");
  //       } catch (error) {
  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     }
  //   } else if (eventType == "REACTION") {
  //     // var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
  //     // var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
  //     // if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //     var _id_1 = (await this.utilsService.generateId());
  //     var _id_2 = (await this.utilsService.generateId());
  //     var CreateContenteventsDto1 = new CreateContenteventsDto();
  //     CreateContenteventsDto1._id = _id_1
  //     CreateContenteventsDto1.contentEventID = _id_1
  //     CreateContenteventsDto1.email = email_user
  //     CreateContenteventsDto1.eventType = "REACTION"
  //     CreateContenteventsDto1.active = true
  //     CreateContenteventsDto1.event = "DONE"
  //     CreateContenteventsDto1.createdAt = current_date
  //     CreateContenteventsDto1.updatedAt = current_date
  //     CreateContenteventsDto1.sequenceNumber = 1
  //     CreateContenteventsDto1.flowIsDone = true
  //     CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //     CreateContenteventsDto1.receiverParty = email_receiverParty
  //     CreateContenteventsDto1.reactionUri = request.body.reactionUri
  //     CreateContenteventsDto1.postID = request.body.postID

  //     var CreateContenteventsDto2 = new CreateContenteventsDto();
  //     CreateContenteventsDto2._id = _id_2
  //     CreateContenteventsDto2.contentEventID = _id_2
  //     CreateContenteventsDto2.email = email_receiverParty
  //     CreateContenteventsDto2.eventType = "REACTION"
  //     CreateContenteventsDto2.active = true
  //     CreateContenteventsDto2.event = "ACCEPT"
  //     CreateContenteventsDto2.createdAt = current_date
  //     CreateContenteventsDto2.updatedAt = current_date
  //     CreateContenteventsDto2.sequenceNumber = 1
  //     CreateContenteventsDto2.flowIsDone = true
  //     CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //     CreateContenteventsDto2.senderParty = email_user
  //     CreateContenteventsDto2.reactionUri = request.body.reactionUri
  //     CreateContenteventsDto2.postID = request.body.postID

  //     if (await this.utilsService.ceckData(Insight_receiver)) {
  //       var _id_receiver = (await this.utilsService.generateId());
  //       var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //       CreateInsightlogsDto_receiver._id = _id_receiver;
  //       CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //       CreateInsightlogsDto_receiver.createdAt = current_date;
  //       CreateInsightlogsDto_receiver.updatedAt = current_date;
  //       CreateInsightlogsDto_receiver.mate = email_user
  //       CreateInsightlogsDto_receiver.eventInsight = "REACTION"
  //       CreateInsightlogsDto_receiver.postID = request.body.postID
  //       CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //       await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //       var LogInsught_receiver = Insight_receiver.insightLogs;
  //       LogInsught_receiver.push({
  //         $ref: 'insightlogs',
  //         $id: _id_receiver,
  //         $db: 'hyppe_content_db',
  //       });

  //       var CreateInsightsDto_receiver = new CreateInsightsDto()
  //       CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //       await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
  //     }

  //     //SEND DIRECT MESSAGE
  //     let retVal = new DisqusResDto();

  //     //CECk DISQUS CONTACT
  //     var CeckDataDiscusContact = await this.disquscontactsService.findMayeEmail(email_user, email_receiverParty);
  //     var id_discus_contact = "";
  //     var id_discus = "";
  //     var id_discus_log = "";

  //     var post = await this.postsService.findByPostId(request.body.postID.toString());
  //     var media = await this.postsService.findOnepostID(request.body.postID.toString());
  //     var media_ = {}
  //     if (await this.utilsService.ceckData(media)) {
  //       if (post.createdAt != undefined) {
  //         media_["createdAt"] = post.createdAt;
  //       }
  //       if (media[0].datacontent[0].mediaBasePath != undefined) {
  //         media_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
  //       }
  //       if (post.postType != undefined) {
  //         media_["postType"] = post.postType;
  //       }
  //       if (media[0].datacontent[0].mediaUri != undefined) {
  //         media_["mediaUri"] = media[0].datacontent[0].mediaUri;
  //       }
  //       if (media[0].datacontent[0].mediaUri != undefined) {
  //         media_["mediaThumbUri"] = media[0].datacontent[0].mediaThumb;
  //       }
  //       if (post.description != undefined) {
  //         media_["description"] = post.description;
  //       }
  //       if (post.active != undefined) {
  //         media_["active"] = post.active;
  //       }
  //       if (media[0].datacontent[0].mediaType != undefined) {
  //         media_["mediaType"] = media[0].datacontent[0].mediaType;
  //       }
  //       if (media[0].datacontent[0].mediaType != undefined) {
  //         media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
  //       }
  //       if (post.postID != undefined) {
  //         media_["postID"] = post.postID;
  //       }
  //       if (media[0].datacontent[0].mediaUri != undefined) {
  //         media_["mediaEndpoint"] = "/stream/" + media[0].datacontent[0].mediaUri;
  //       }
  //       if (media[0].datacontent[0].apsara != undefined) {
  //         media_["apsara"] = media[0].datacontent[0].apsara
  //       }
  //       if (media[0].datacontent[0].apsaraId != undefined) {
  //         media_["apsaraId"] = media[0].datacontent[0].apsaraId
  //       }
  //     }

  //     var body_messages = "";
  //     var body_ = "";
  //     var dataEmote = await this.reactionsRepoService.findByUrl(request.body.reactionUri);
  //     var Emote = (await this.utilsService.ceckData(dataEmote)) ? dataEmote.icon : "";
  //     var Templates_ = await this.utilsService.getTemplate_repo('REACTION', 'NOTIFICATION');
  //     var get_languages = await this.utilsService.getUserlanguages(email_receiverParty);
  //     if (get_languages == "en") {
  //       body_ = Templates_.body_detail.toString()
  //       body_messages = body_.toString().replace("${emoticon}", Emote.toString())
  //     } else {
  //       body_ = Templates_.body_detail_id.toString()
  //       body_messages = body_.toString().replace("${emoticon}", Emote.toString())
  //     }

  //     if (!(await this.utilsService.ceckData(CeckDataDiscusContact))) {
  //       id_discus_contact = await this.utilsService.generateId()
  //       id_discus = await this.utilsService.generateId()
  //       id_discus_log = await this.utilsService.generateId()

  //       //INSERT DISQUS CONTACT
  //       var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
  //       try {
  //         CreateDisquscontactsDto_._id = id_discus_contact;
  //         CreateDisquscontactsDto_.active = true;
  //         CreateDisquscontactsDto_.email = email_user;
  //         CreateDisquscontactsDto_.mate = email_receiverParty;
  //         CreateDisquscontactsDto_.disqus = {
  //           $ref: 'disqus',
  //           $id: id_discus,
  //           $db: 'hyppe_content_db',
  //         };
  //         CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
  //         this.disquscontactsService.create(CreateDisquscontactsDto_);
  //       } catch (error) {
  //         this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
  //       }

  //       //INSERT DISQUS
  //       var CreateDisqusDto_ = new CreateDisqusDto();
  //       try {
  //         CreateDisqusDto_._id = id_discus;
  //         CreateDisqusDto_.room = id_discus;
  //         CreateDisqusDto_.disqusID = id_discus;
  //         CreateDisqusDto_.active = true
  //         CreateDisqusDto_.email = email_user;
  //         CreateDisqusDto_.mate = email_receiverParty;
  //         CreateDisqusDto_.eventType = "DIRECT_MSG";
  //         CreateDisqusDto_.room = id_discus;
  //         CreateDisqusDto_.createdAt = current_date;
  //         CreateDisqusDto_.updatedAt = current_date;
  //         CreateDisqusDto_.lastestMessage = Emote;
  //         CreateDisqusDto_.emailActive = true;
  //         CreateDisqusDto_.mateActive = true;
  //         CreateDisqusDto_.disqusLogs = [{
  //           $ref: 'disquslogs',
  //           $id: id_discus_log,
  //           $db: 'hyppe_content_db',
  //         }];
  //         CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
  //         this.disqusContentEventService.create(CreateDisqusDto_);
  //       } catch (error) {
  //         this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
  //       }

  //       //INSERT DISQUS LOG
  //       var CreateDisquslogsDto_ = new Disquslogs();
  //       try {
  //         CreateDisquslogsDto_._id = id_discus_log;
  //         CreateDisquslogsDto_.disqusID = id_discus;
  //         CreateDisquslogsDto_.active = true;
  //         CreateDisquslogsDto_.sequenceNumber = 0;
  //         CreateDisquslogsDto_.postID = request.body.postID.toString();
  //         CreateDisquslogsDto_.eventInsight = "REACTION";
  //         CreateDisquslogsDto_.sender = email_user;
  //         CreateDisquslogsDto_.receiver = email_receiverParty;
  //         CreateDisquslogsDto_.postType = "txt_msg";
  //         CreateDisquslogsDto_.createdAt = current_date;
  //         CreateDisquslogsDto_.updatedAt = current_date;
  //         CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
  //         CreateDisquslogsDto_.medias = [media_];
  //         CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
  //         CreateDisquslogsDto_.receiverActive = true;
  //         CreateDisquslogsDto_.senderActive = true;
  //         this.disquslogsService.create(CreateDisquslogsDto_);
  //       } catch (error) {
  //         this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //       }

  //       retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
  //       this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
  //     } else {
  //       id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact[0].disqus))).$id;
  //       id_discus_log = await this.utilsService.generateId()

  //       //CECK DISQUS
  //       var CreateDisqusDto_ = new CreateDisqusDto();
  //       CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
  //       if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
  //         //INSERT DISQUS
  //         try {
  //           CreateDisqusDto_._id = id_discus;
  //           CreateDisqusDto_.room = id_discus;
  //           CreateDisqusDto_.disqusID = id_discus;
  //           CreateDisqusDto_.active = true
  //           CreateDisqusDto_.email = email_user;
  //           CreateDisqusDto_.mate = email_receiverParty;
  //           CreateDisqusDto_.eventType = "DIRECT_MSG";
  //           CreateDisqusDto_.room = id_discus;
  //           CreateDisqusDto_.createdAt = current_date;
  //           CreateDisqusDto_.updatedAt = current_date;
  //           CreateDisqusDto_.lastestMessage = Emote.toString();
  //           CreateDisqusDto_.emailActive = true;
  //           CreateDisqusDto_.mateActive = true;
  //           CreateDisqusDto_.disqusLogs = [{
  //             $ref: 'disquslogs',
  //             $id: id_discus_log,
  //             $db: 'hyppe_content_db',
  //           }];
  //           CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
  //           this.disqusContentEventService.create(CreateDisqusDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //       } else {
  //         //UPDATE DISQUS
  //         try {
  //           var data_disqusLogs = CreateDisqusDto_.disqusLogs;
  //           data_disqusLogs.push({
  //             $ref: 'disquslogs',
  //             $id: id_discus_log,
  //             $db: 'hyppe_content_db',
  //           });
  //           CreateDisqusDto_.disqusLogs = data_disqusLogs;
  //           CreateDisqusDto_.lastestMessage = Emote.toString();
  //           this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //       }

  //       //INSERT DISQUS LOG
  //       var CreateDisquslogsDto_ = new Disquslogs();
  //       try {
  //         CreateDisquslogsDto_._id = id_discus_log;
  //         CreateDisquslogsDto_.disqusID = id_discus;
  //         CreateDisquslogsDto_.active = true;
  //         CreateDisquslogsDto_.sequenceNumber = 0;
  //         CreateDisquslogsDto_.postID = request.body.postID.toString();
  //         CreateDisquslogsDto_.eventInsight = "REACTION";
  //         CreateDisquslogsDto_.sender = email_user;
  //         CreateDisquslogsDto_.receiver = email_receiverParty;
  //         CreateDisquslogsDto_.postType = "txt_msg";
  //         CreateDisquslogsDto_.createdAt = current_date;
  //         CreateDisquslogsDto_.updatedAt = current_date;
  //         CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
  //         CreateDisquslogsDto_.medias = [media_];
  //         CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
  //         CreateDisquslogsDto_.receiverActive = true;
  //         CreateDisquslogsDto_.senderActive = true;
  //         this.disquslogsService.create(CreateDisquslogsDto_);
  //       } catch (error) {
  //         this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //       }

  //       retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
  //       this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
  //       this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
  //     }

  //     console.log("retVal", retVal);
  //     try {
  //       await this.contenteventsService.create(CreateContenteventsDto1);
  //       await this.contenteventsService.create(CreateContenteventsDto2);
  //       await this.postsService.updateReaction(email_receiverParty, request.body.postID);
  //       await this.insightsService.updateReactions(email_user);
  //       this.sendInteractiveFCM(email_receiverParty, "REACTION", request.body.postID, email_user, Emote);
  //     } catch (error) {
  //       await this.errorHandler.generateNotAcceptableException(
  //         'Unabled to proceed, ' +
  //         error,
  //       );
  //     }
  //     //}
  //   }

  //   return {
  //     response_code: 202,
  //     messages: {
  //       info: ['Successful'],
  //     },
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/posts/interactive')
  async interactive2(@Req() request: any, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(request.body));
    if (headers['x-auth-user'] == undefined) {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed auth-user undefined',
      );
    }
    if (request.body.eventType == undefined) {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param eventType is required',
      );
    }
    if (request.body.receiverParty == undefined) {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param receiverParty is required',
      );
    }

    const eventType = request.body.eventType;
    const email_user = headers['x-auth-user'];
    const email_receiverParty = request.body.receiverParty;
    const current_date = await this.utilsService.getDateTimeString();

    var Insight_sender = await this.insightsService.findemail(email_user);
    var Insight_receiver = await this.insightsService.findemail(email_receiverParty);

    var userbasic1 = await this.userbasicsService.findOne(email_user);
    var iduser = null;
    if (userbasic1 == null || userbasic1 == undefined) {
      iduser = userbasic1._id;
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, auth-user data not found',
      );
    }

    if (eventType == "FOLLOWING") {
      var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
      var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
      if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_receiverParty
        CreateContenteventsDto1.eventType = "FOLLOWER"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "ACCEPT"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_user

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = _id_2
        CreateContenteventsDto2.email = email_user
        CreateContenteventsDto2.eventType = "FOLLOWING"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_receiverParty

        if (await this.utilsService.ceckData(Insight_sender)) {
          var _id_sender = (await this.utilsService.generateId());
          var CreateInsightlogsDto_sender = new CreateInsightlogsDto()
          CreateInsightlogsDto_sender._id = _id_sender;
          CreateInsightlogsDto_sender.insightID = Insight_sender._id;
          CreateInsightlogsDto_sender.createdAt = current_date;
          CreateInsightlogsDto_sender.updatedAt = current_date;
          CreateInsightlogsDto_sender.mate = email_receiverParty
          CreateInsightlogsDto_sender.eventInsight = "FOLLOWING"
          CreateInsightlogsDto_sender._class = "io.melody.hyppe.content.domain.InsightLog"
          await this.insightlogsService.create(CreateInsightlogsDto_sender);

          var LogInsught_sensder = Insight_sender.insightLogs;
          LogInsught_sensder.push({
            $ref: 'insightlogs',
            $id: _id_sender,
            $db: 'hyppe_content_db',
          });

          var CreateInsightsDto_sender = new CreateInsightsDto()
          CreateInsightsDto_sender.insightLogs = LogInsught_sensder;
          await this.insightsService.updateone(email_user, CreateInsightsDto_sender)

        }
        if (await this.utilsService.ceckData(Insight_receiver)) {
          var _id_receiver = (await this.utilsService.generateId());
          var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
          CreateInsightlogsDto_receiver._id = _id_receiver;
          CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
          CreateInsightlogsDto_receiver.createdAt = current_date;
          CreateInsightlogsDto_receiver.updatedAt = current_date;
          CreateInsightlogsDto_receiver.mate = email_user
          CreateInsightlogsDto_receiver.eventInsight = "FOLLOWER"
          CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
          await this.insightlogsService.create(CreateInsightlogsDto_receiver);

          var LogInsught_receiver = Insight_receiver.insightLogs;
          LogInsught_receiver.push({
            $ref: 'insightlogs',
            $id: _id_receiver,
            $db: 'hyppe_content_db',
          });

          var CreateInsightsDto_receiver = new CreateInsightsDto()
          CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
          await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)

        }

        //INSERt FOLOWING STREAM
        if (request.body.idMediaStreaming != undefined) {
          const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
          if (!(await this.utilsService.ceckData(ceckView))) {
            const dataFollower = {
              userId: new mongoose.Types.ObjectId(userbasic1._id.toString()),
              status: true,
              createAt: current_date,
              updateAt: current_date
            }
            await this.mediastreamingService.insertFollower(request.body.idMediaStreaming, dataFollower)
          } else {
            await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), false, true, current_date);
          }
        }

        try {
          const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
          let idevent1 = resultdata1._id;
          let event1 = resultdata1.eventType.toString();
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
          await this.contenteventsService.create(CreateContenteventsDto2);
          await this.insightsService.updateFollower(email_receiverParty);
          await this.insightsService.updateFollowing(email_user);
          this.sendInteractiveFCM(email_receiverParty, "FOLLOWER", "", email_user);
          //  this.sendInteractiveFCM(email_user, "FOLLOWING", "", email_receiverParty);
          const databasic = await this.userbasicsService.findOne(
            email_user
          );
          var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   // this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
          //   this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW")
          // }
        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {
        if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
          await this.contenteventsService.updateFollowing(email_user, "FOLLOWING", email_receiverParty);
          await this.contenteventsService.updateFollower(email_receiverParty, "FOLLOWER", email_user);
          await this.insightsService.updateFollower(email_receiverParty);
          await this.insightsService.updateFollowing(email_user);
          this.sendInteractiveFCM(email_receiverParty, "FOLLOWER", "", email_user);
          let idevent1 = ceck_data_FOLLOWING._id;
          let event1 = ceck_data_FOLLOWING.eventType.toString();
          //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

          const databasic = await this.userbasicsService.findOne(
            email_user
          );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   //this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
          //   this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW")
          // }


        }
      }

      this.checkFriendbasedString(email_user, email_receiverParty, "create");
    }
    //  else if (eventType == "VIEW") {

    //   if (email_user !== email_receiverParty) {
    //     var idevent1 = null;
    //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
    //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
    //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
    //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //       var _id_1 = (await this.utilsService.generateId());
    //       var _id_2 = (await this.utilsService.generateId());
    //       var CreateContenteventsDto1 = new CreateContenteventsDto();
    //       CreateContenteventsDto1._id = _id_1
    //       CreateContenteventsDto1.contentEventID = _id_1
    //       CreateContenteventsDto1.email = email_user
    //       CreateContenteventsDto1.eventType = "VIEW"
    //       CreateContenteventsDto1.active = true
    //       CreateContenteventsDto1.event = "DONE"
    //       CreateContenteventsDto1.createdAt = current_date
    //       CreateContenteventsDto1.updatedAt = current_date
    //       CreateContenteventsDto1.sequenceNumber = 1
    //       CreateContenteventsDto1.flowIsDone = true
    //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto1.receiverParty = email_receiverParty
    //       CreateContenteventsDto1.postID = request.body.postID

    //       var CreateContenteventsDto2 = new CreateContenteventsDto();
    //       CreateContenteventsDto2._id = _id_2
    //       CreateContenteventsDto2.contentEventID = _id_2
    //       CreateContenteventsDto2.email = email_receiverParty
    //       CreateContenteventsDto2.eventType = "VIEW"
    //       CreateContenteventsDto2.active = true
    //       CreateContenteventsDto2.event = "ACCEPT"
    //       CreateContenteventsDto2.createdAt = current_date
    //       CreateContenteventsDto2.updatedAt = current_date
    //       CreateContenteventsDto2.sequenceNumber = 1
    //       CreateContenteventsDto2.flowIsDone = true
    //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto2.senderParty = email_user
    //       CreateContenteventsDto2.postID = request.body.postID



    //       if (await this.utilsService.ceckData(Insight_receiver)) {
    //         var _id_receiver = (await this.utilsService.generateId());
    //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
    //         CreateInsightlogsDto_receiver._id = _id_receiver;
    //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
    //         CreateInsightlogsDto_receiver.createdAt = current_date;
    //         CreateInsightlogsDto_receiver.updatedAt = current_date;
    //         CreateInsightlogsDto_receiver.mate = email_user
    //         CreateInsightlogsDto_receiver.postID = request.body.postID
    //         CreateInsightlogsDto_receiver.eventInsight = "VIEW"
    //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
    //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

    //         var LogInsught_receiver = Insight_receiver.insightLogs;
    //         LogInsught_receiver.push({
    //           $ref: 'insightlogs',
    //           $id: _id_receiver,
    //           $db: 'hyppe_content_db',
    //         });

    //         var CreateInsightsDto_receiver = new CreateInsightsDto()
    //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
    //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)


    //       }

    //       try {
    //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //         idevent1 = resultdata1._id;
    //         let event1 = resultdata1.eventType.toString();
    //         //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
    //         var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

    //         await this.postsService.updateView(email_receiverParty, request.body.postID);
    //         await this.insightsService.updateViews(email_receiverParty);


    //       } catch (error) {
    //         var fullurl = request.get("Host") + request.originalUrl;
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         var reqbody = JSON.parse(JSON.stringify(request.body));
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //         await this.errorHandler.generateNotAcceptableException(
    //           'Unabled to proceed, ' +
    //           error,
    //         );
    //       }
    //     }
    //     else {

    //       let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
    //       let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
    //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {

    //         var _id_1 = (await this.utilsService.generateId());
    //         var _id_2 = (await this.utilsService.generateId());
    //         var CreateContenteventsDto1 = new CreateContenteventsDto();
    //         CreateContenteventsDto1._id = _id_1
    //         CreateContenteventsDto1.contentEventID = _id_1
    //         CreateContenteventsDto1.email = email_user
    //         CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto1.active = true
    //         CreateContenteventsDto1.event = "DONE"
    //         CreateContenteventsDto1.createdAt = current_date
    //         CreateContenteventsDto1.updatedAt = current_date
    //         CreateContenteventsDto1.sequenceNumber = 1
    //         CreateContenteventsDto1.flowIsDone = true
    //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto1.receiverParty = email_receiverParty
    //         CreateContenteventsDto1.postID = request.body.postID

    //         var CreateContenteventsDto2 = new CreateContenteventsDto();
    //         CreateContenteventsDto2._id = _id_2
    //         CreateContenteventsDto2.contentEventID = _id_2
    //         CreateContenteventsDto2.email = email_receiverParty
    //         CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto2.active = true
    //         CreateContenteventsDto2.event = "ACCEPT"
    //         CreateContenteventsDto2.createdAt = current_date
    //         CreateContenteventsDto2.updatedAt = current_date
    //         CreateContenteventsDto2.sequenceNumber = 1
    //         CreateContenteventsDto2.flowIsDone = true
    //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto2.senderParty = email_user
    //         CreateContenteventsDto2.postID = request.body.postID

    //         try {
    //           var resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //           idevent1 = resultdata1._id;
    //           var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);


    //         } catch (error) {
    //           var fullurl = request.get("Host") + request.originalUrl;
    //           var timestamps_end = await this.utilsService.getDateTimeString();
    //           var reqbody = JSON.parse(JSON.stringify(request.body));
    //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //           await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed, ' +
    //             error,
    //           );
    //         }

    //       }

    //     }
    //     if (idevent1 != null) {
    //       try {
    //         this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
    //         console.log("sukses hitung score")
    //       } catch (e) {
    //         console.log("gagal ngitung skor" + e)
    //       }

    //     }
    //   }
    //   var datapost = await this.NewpostsService.updatePostviewer(request.body.postID, email_user);
    // } 
    else if (eventType == "VIEW") {
      if (email_user !== email_receiverParty) {
        var idevent1 = null;
        var idevent2 = null;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
        var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
        var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
        if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_user
          CreateContenteventsDto1.eventType = "VIEW"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "DONE"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_receiverParty
          CreateContenteventsDto1.postID = request.body.postID

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_receiverParty
          CreateContenteventsDto2.eventType = "VIEW"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_user
          CreateContenteventsDto2.postID = request.body.postID

          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.postID = request.body.postID
            CreateInsightlogsDto_receiver.eventInsight = "VIEW"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
          }

          try {
            const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
            idevent1 = resultdata1._id;
            let event1 = resultdata1.eventType.toString();
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

            await this.postsService.updateView(email_receiverParty, request.body.postID);
            await this.insightsService.updateViews(email_receiverParty);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }


        var datacek = null;

        try {
          datacek = await this.userchallengesService.cekUserjoin(iduser);
        } catch (e) {
          datacek = null;
        }

        if (datacek !== null) {
          let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
          let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
          if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
            var _id_1 = (await this.utilsService.generateId());
            var _id_2 = (await this.utilsService.generateId());
            var CreateContenteventsDto1 = new CreateContenteventsDto();
            CreateContenteventsDto1._id = _id_1
            CreateContenteventsDto1.contentEventID = _id_1
            CreateContenteventsDto1.email = email_user
            CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto1.active = true
            CreateContenteventsDto1.event = "DONE"
            CreateContenteventsDto1.createdAt = current_date
            CreateContenteventsDto1.updatedAt = current_date
            CreateContenteventsDto1.sequenceNumber = 1
            CreateContenteventsDto1.flowIsDone = true
            CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto1.receiverParty = email_receiverParty
            CreateContenteventsDto1.postID = request.body.postID

            var CreateContenteventsDto2 = new CreateContenteventsDto();
            CreateContenteventsDto2._id = _id_2
            CreateContenteventsDto2.contentEventID = _id_2
            CreateContenteventsDto2.email = email_receiverParty
            CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto2.active = true
            CreateContenteventsDto2.event = "ACCEPT"
            CreateContenteventsDto2.createdAt = current_date
            CreateContenteventsDto2.updatedAt = current_date
            CreateContenteventsDto2.sequenceNumber = 1
            CreateContenteventsDto2.flowIsDone = true
            CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto2.senderParty = email_user
            CreateContenteventsDto2.postID = request.body.postID

            try {
              let resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
              idevent1 = resultdata1._id;
              let dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

              // if (idevent1 !== null) {
              //   try {
              //     // this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
              //     this.scoreviewrequest(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty)
              //     console.log("sukses hitung score")
              //   } catch (e) {
              //     console.log("gagal ngitung skor" + e)
              //   }


              // }


            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }

          }
        }


      }
      var datapost = await this.NewpostsService.updatePostviewer(request.body.postID, email_user);
    }
    else if (eventType == "LIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "LIKE"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.postID = request.body.postID

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "LIKE"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.postID = request.body.postID

        if (await this.utilsService.ceckData(Insight_receiver)) {
          var _id_receiver = (await this.utilsService.generateId());
          var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
          CreateInsightlogsDto_receiver._id = _id_receiver;
          CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
          CreateInsightlogsDto_receiver.createdAt = current_date;
          CreateInsightlogsDto_receiver.updatedAt = current_date;
          CreateInsightlogsDto_receiver.mate = email_user
          CreateInsightlogsDto_receiver.eventInsight = "LIKE"
          CreateInsightlogsDto_receiver.postID = request.body.postID
          CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
          await this.insightlogsService.create(CreateInsightlogsDto_receiver);

          var LogInsught_receiver = Insight_receiver.insightLogs;
          LogInsught_receiver.push({
            $ref: 'insightlogs',
            $id: _id_receiver,
            $db: 'hyppe_content_db',
          });

          var CreateInsightsDto_receiver = new CreateInsightsDto()
          CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
          await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
        }

        try {
          const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
          let idevent1 = resultdata1._id;
          let event1 = resultdata1.eventType.toString();
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
          await this.contenteventsService.create(CreateContenteventsDto2);
          await this.insightsService.updateLike(email_receiverParty);
          await this.postsService.updateLike(email_receiverParty, request.body.postID);
          this.sendInteractiveFCM(email_receiverParty, "LIKE", request.body.postID, email_user);
          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeLike(iduser.toString(), idevent1.toString(), "contentevents", "LIKE", request.body.postID);
          // }
          //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);
          // this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty)

        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {
        if (ceck_data_DONE.active && ceck_data_DONE.active) {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
            await this.insightsService.updateUnlike(email_receiverParty);
            await this.postsService.updateUnLike(email_receiverParty, request.body.postID);

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
            // const databasic = await this.userbasicsService.findOne(
            //   email_receiverParty
            // );
            // var iduser = null;
            // if (databasic !== null) {
            //   iduser = databasic._id;
            //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
            // }
            // this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            // this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty)
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
            await this.insightsService.updateLike(email_receiverParty);
            await this.postsService.updateLike(email_receiverParty, request.body.postID);

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            // this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);
            // this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty)

          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    }
    else if (eventType == "UNLIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        try {
          await this.insightsService.updateUnlike(email_receiverParty);
          await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
          await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
          await this.postsService.updateUnLike(email_receiverParty, request.body.postID);

          let idevent1 = ceck_data_DONE._id;
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);

          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
          // }
          //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);
          //this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty)
        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {

        if (ceck_data_DONE.active != undefined && !ceck_data_ACCEPT.active != undefined) {
          if (ceck_data_DONE.active && ceck_data_ACCEPT.active) {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
              await this.insightsService.updateUnlike(email_receiverParty);
              await this.postsService.updateUnLike(email_receiverParty, request.body.postID);

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
              // }

              //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);
              // this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          } else {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
              await this.insightsService.updateLike(email_receiverParty);
              await this.postsService.updateLike(email_receiverParty, request.body.postID);

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "LIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeLike2( idevent1.toString(), "contentevents", "LIKE", request.body.postID);
              // }

              //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);
              //this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty)
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          }
        }
      }
    } else if (eventType == "UNFOLLOW") {
      var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
      var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
      if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
        try {
          await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
          await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
          await this.insightsService.updateUnFollower(email_receiverParty);
          await this.insightsService.updateUnFollowing(email_user);
          await this.insightsService.updateUnFollow(email_user);

          //INSERt UNFOLLOW STREAM
          if (request.body.idMediaStreaming != undefined) {
            const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
            if (await this.utilsService.ceckData(ceckView)) {
              await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), true, false, current_date);
            }
          }

          let idevent1 = ceck_data_FOLLOWING._id;
          //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNFOLLOW", userbasic1._id);

          const databasic = await this.userbasicsService.findOne(
            email_user
          );
          var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   // this.userChallengeUnFollow(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW");
          //   this.scoreunfollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW")
          // }

          this.checkFriendbasedString(email_user, email_receiverParty, "delete");
        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    } else if (eventType == "REACTION") {
      // var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
      // var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
      // if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
      var _id_1 = (await this.utilsService.generateId());
      var _id_2 = (await this.utilsService.generateId());
      var CreateContenteventsDto1 = new CreateContenteventsDto();
      CreateContenteventsDto1._id = _id_1
      CreateContenteventsDto1.contentEventID = _id_1
      CreateContenteventsDto1.email = email_user
      CreateContenteventsDto1.eventType = "REACTION"
      CreateContenteventsDto1.active = true
      CreateContenteventsDto1.event = "DONE"
      CreateContenteventsDto1.createdAt = current_date
      CreateContenteventsDto1.updatedAt = current_date
      CreateContenteventsDto1.sequenceNumber = 1
      CreateContenteventsDto1.flowIsDone = true
      CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto1.receiverParty = email_receiverParty
      CreateContenteventsDto1.reactionUri = request.body.reactionUri
      CreateContenteventsDto1.postID = request.body.postID

      var CreateContenteventsDto2 = new CreateContenteventsDto();
      CreateContenteventsDto2._id = _id_2
      CreateContenteventsDto2.contentEventID = _id_2
      CreateContenteventsDto2.email = email_receiverParty
      CreateContenteventsDto2.eventType = "REACTION"
      CreateContenteventsDto2.active = true
      CreateContenteventsDto2.event = "ACCEPT"
      CreateContenteventsDto2.createdAt = current_date
      CreateContenteventsDto2.updatedAt = current_date
      CreateContenteventsDto2.sequenceNumber = 1
      CreateContenteventsDto2.flowIsDone = true
      CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto2.senderParty = email_user
      CreateContenteventsDto2.reactionUri = request.body.reactionUri
      CreateContenteventsDto2.postID = request.body.postID

      if (await this.utilsService.ceckData(Insight_receiver)) {
        var _id_receiver = (await this.utilsService.generateId());
        var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
        CreateInsightlogsDto_receiver._id = _id_receiver;
        CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
        CreateInsightlogsDto_receiver.createdAt = current_date;
        CreateInsightlogsDto_receiver.updatedAt = current_date;
        CreateInsightlogsDto_receiver.mate = email_user
        CreateInsightlogsDto_receiver.eventInsight = "REACTION"
        CreateInsightlogsDto_receiver.postID = request.body.postID
        CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
        await this.insightlogsService.create(CreateInsightlogsDto_receiver);

        var LogInsught_receiver = Insight_receiver.insightLogs;
        LogInsught_receiver.push({
          $ref: 'insightlogs',
          $id: _id_receiver,
          $db: 'hyppe_content_db',
        });

        var CreateInsightsDto_receiver = new CreateInsightsDto()
        CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
        await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)
      }

      //SEND DIRECT MESSAGE
      let retVal = new DisqusResDto();

      //CECk DISQUS CONTACT
      var CeckDataDiscusContact = await this.disquscontactsService.findMayeEmail(email_user, email_receiverParty);
      var id_discus_contact = "";
      var id_discus = "";
      var id_discus_log = "";

      var post = await this.postsService.findByPostId(request.body.postID.toString());
      var media = await this.postsService.findOnepostID3(post);
      var media_ = {}
      if (await this.utilsService.ceckData(media)) {
        if (post.createdAt != undefined) {
          media_["createdAt"] = post.createdAt;
        }
        if (media[0].datacontent[0].mediaBasePath != undefined) {
          media_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          media_["postType"] = post.postType;
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          media_["mediaUri"] = media[0].datacontent[0].mediaUri;
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          media_["mediaThumbUri"] = media[0].datacontent[0].mediaThumb;
        }
        if (post.description != undefined) {
          media_["description"] = post.description;
        }
        if (post.active != undefined) {
          media_["active"] = post.active;
        }
        if (media[0].datacontent[0].mediaType != undefined) {
          media_["mediaType"] = media[0].datacontent[0].mediaType;
        }
        if (media[0].datacontent[0].mediaType != undefined) {
          media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
        }
        if (post.postID != undefined) {
          media_["postID"] = post.postID;
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          media_["mediaEndpoint"] = "/stream/" + media[0].datacontent[0].mediaUri;
        }
        if (media[0].datacontent[0].apsara != undefined) {
          media_["apsara"] = media[0].datacontent[0].apsara
        }
        if (media[0].datacontent[0].apsaraId != undefined) {
          media_["apsaraId"] = media[0].datacontent[0].apsaraId
        }
      }

      var body_messages = "";
      var body_ = "";
      var dataEmote = await this.reactionsRepoService.findByUrl(request.body.reactionUri);
      var Emote = (await this.utilsService.ceckData(dataEmote)) ? dataEmote.icon : "";
      var Templates_ = await this.utilsService.getTemplate_repo('REACTION', 'NOTIFICATION');
      var get_languages = await this.utilsService.getUserlanguages(email_receiverParty);
      if (get_languages == "en") {
        body_ = Templates_.body_detail.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      } else {
        body_ = Templates_.body_detail_id.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      }

      if (!(await this.utilsService.ceckData(CeckDataDiscusContact))) {
        id_discus_contact = await this.utilsService.generateId()
        id_discus = await this.utilsService.generateId()
        id_discus_log = await this.utilsService.generateId()

        //INSERT DISQUS CONTACT
        var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
        try {
          CreateDisquscontactsDto_._id = id_discus_contact;
          CreateDisquscontactsDto_.active = true;
          CreateDisquscontactsDto_.email = email_user;
          CreateDisquscontactsDto_.mate = email_receiverParty;
          CreateDisquscontactsDto_.disqus = {
            $ref: 'disqus',
            $id: id_discus,
            $db: 'hyppe_content_db',
          };
          CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
          this.disquscontactsService.create(CreateDisquscontactsDto_);
        } catch (error) {
          this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
        }

        //INSERT DISQUS
        var CreateDisqusDto_ = new CreateDisqusDto();
        try {
          CreateDisqusDto_._id = id_discus;
          CreateDisqusDto_.room = id_discus;
          CreateDisqusDto_.disqusID = id_discus;
          CreateDisqusDto_.active = true
          CreateDisqusDto_.email = email_user;
          CreateDisqusDto_.mate = email_receiverParty;
          CreateDisqusDto_.eventType = "DIRECT_MSG";
          CreateDisqusDto_.room = id_discus;
          CreateDisqusDto_.createdAt = current_date;
          CreateDisqusDto_.updatedAt = current_date;
          CreateDisqusDto_.lastestMessage = Emote;
          CreateDisqusDto_.emailActive = true;
          CreateDisqusDto_.mateActive = true;
          CreateDisqusDto_.disqusLogs = [{
            $ref: 'disquslogs',
            $id: id_discus_log,
            $db: 'hyppe_content_db',
          }];
          CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
          this.disqusContentEventService.create(CreateDisqusDto_);
        } catch (error) {
          this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
        }

        //INSERT DISQUS LOG
        var CreateDisquslogsDto_ = new Disquslogs();
        try {
          CreateDisquslogsDto_._id = id_discus_log;
          CreateDisquslogsDto_.disqusID = id_discus;
          CreateDisquslogsDto_.active = true;
          CreateDisquslogsDto_.sequenceNumber = 0;
          CreateDisquslogsDto_.postID = request.body.postID.toString();
          CreateDisquslogsDto_.eventInsight = "REACTION";
          CreateDisquslogsDto_.sender = email_user;
          CreateDisquslogsDto_.receiver = email_receiverParty;
          CreateDisquslogsDto_.postType = "txt_msg";
          CreateDisquslogsDto_.createdAt = current_date;
          CreateDisquslogsDto_.updatedAt = current_date;
          CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
          CreateDisquslogsDto_.medias = [media_];
          CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
          CreateDisquslogsDto_.receiverActive = true;
          CreateDisquslogsDto_.senderActive = true;
          this.disquslogsService.create(CreateDisquslogsDto_);
        } catch (error) {
          this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
        }

        retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
        const STREAM_MODE = this.configService.get("STREAM_MODE");
        if (STREAM_MODE == "1") {
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        } else {
          let RequestSoctDto_ = new RequestSoctDto();
          RequestSoctDto_.event = "STATUS_STREAM";
          RequestSoctDto_.data = JSON.stringify(retVal);
          this.disqusContentEventService.socketRequest(RequestSoctDto_);
        }
      } else {
        id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact[0].disqus))).$id;
        id_discus_log = await this.utilsService.generateId()

        //CECK DISQUS
        var CreateDisqusDto_ = new CreateDisqusDto();
        CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
        if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
        } else {
          //UPDATE DISQUS
          try {
            var data_disqusLogs = CreateDisqusDto_.disqusLogs;
            data_disqusLogs.push({
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            });
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.disqusLogs = data_disqusLogs;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
          }
        }

        //INSERT DISQUS LOG
        var CreateDisquslogsDto_ = new Disquslogs();
        try {
          CreateDisquslogsDto_._id = id_discus_log;
          CreateDisquslogsDto_.disqusID = id_discus;
          CreateDisquslogsDto_.active = true;
          CreateDisquslogsDto_.sequenceNumber = 0;
          CreateDisquslogsDto_.postID = request.body.postID.toString();
          CreateDisquslogsDto_.eventInsight = "REACTION";
          CreateDisquslogsDto_.sender = email_user;
          CreateDisquslogsDto_.receiver = email_receiverParty;
          CreateDisquslogsDto_.postType = "txt_msg";
          CreateDisquslogsDto_.createdAt = current_date;
          CreateDisquslogsDto_.updatedAt = current_date;
          CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
          CreateDisquslogsDto_.medias = [media_];
          CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
          CreateDisquslogsDto_.receiverActive = true;
          CreateDisquslogsDto_.senderActive = true;
          this.disquslogsService.create(CreateDisquslogsDto_);
        } catch (error) {
          this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
        }

        retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
        const STREAM_MODE = this.configService.get("STREAM_MODE");
        if (STREAM_MODE == "1") {
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        } else {
          let RequestSoctDto_ = new RequestSoctDto();
          RequestSoctDto_.event = "STATUS_STREAM";
          RequestSoctDto_.data = JSON.stringify(retVal);
          this.disqusContentEventService.socketRequest(RequestSoctDto_);
        }
      }

      console.log("retVal", retVal);
      try {
        const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
        let idevent1 = resultdata1._id;
        let event1 = resultdata1.eventType.toString();
        // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
        await this.contenteventsService.create(CreateContenteventsDto2);
        await this.postsService.updateReaction(email_receiverParty, request.body.postID);
        await this.insightsService.updateReactions(email_user);
        this.sendInteractiveFCM(email_receiverParty, "REACTION", request.body.postID, email_user, Emote);
      } catch (error) {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(request.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
      //}
    }

    var fullurl = request.get("Host") + request.originalUrl;
    var timestamps_end = await this.utilsService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(request.body));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    return {
      response_code: 202,
      messages: {
        info: ['Successful'],
      },
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.ACCEPTED)
  // @Post('api/posts/interactive/v2')
  // async interactive3(@Req() request: any, @Headers() headers) {
  //   var timestamps_start = await this.utilsService.getDateTimeString();
  //   var listchallenge = null;
  //   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(request.body));
  //   if (headers['x-auth-user'] == undefined || headers['x-auth-user'] == null || headers['x-auth-user'] == '') {
  //     var fullurl = request.get("Host") + request.originalUrl;
  //     var timestamps_end = await this.utilsService.getDateTimeString();
  //     var reqbody = JSON.parse(JSON.stringify(request.body));
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed auth-user undefined',
  //     );
  //   }
  //   if (request.body.eventType == undefined || request.body.eventType == null || request.body.eventType == '') {
  //     var fullurl = request.get("Host") + request.originalUrl;
  //     var timestamps_end = await this.utilsService.getDateTimeString();
  //     var reqbody = JSON.parse(JSON.stringify(request.body));
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param eventType is required',
  //     );
  //   }
  //   if (request.body.receiverParty == undefined || request.body.receiverParty == null || request.body.receiverParty == '') {
  //     var fullurl = request.get("Host") + request.originalUrl;
  //     var timestamps_end = await this.utilsService.getDateTimeString();
  //     var reqbody = JSON.parse(JSON.stringify(request.body));
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param receiverParty is required',
  //     );
  //   }

  //   try {
  //     listchallenge = request.body.listchallenge;
  //   } catch (e) {
  //     listchallenge = null;
  //   }

  //   const eventType = request.body.eventType;
  //   const email_user = headers['x-auth-user'];
  //   const email_receiverParty = request.body.receiverParty;
  //   const current_date = await this.utilsService.getDateTimeString();

  //   var userbasic1 = await this.basic2SS.findbyemail(email_user);
  //   var userbasic2 = await this.basic2SS.findbyemail(email_receiverParty);

  //   var insightID1 = JSON.parse(JSON.stringify(userbasic1.insight)).$id;
  //   var insightID2 = JSON.parse(JSON.stringify(userbasic2.insight)).$id;

  //   var Insight_sender = await this.insightsService.findOne(insightID1);
  //   var Insight_receiver = await this.insightsService.findOne(insightID2);

  //   var iduser = null;
  //   var isguest = false;
  //   if (userbasic1 == null || userbasic1 == undefined) {
  //     var fullurl = request.get("Host") + request.originalUrl;
  //     var timestamps_end = await this.utilsService.getDateTimeString();
  //     var reqbody = JSON.parse(JSON.stringify(request.body));
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, auth-user data not found',
  //     );
  //   }
  //   iduser = userbasic1._id;
  //   isguest = userbasic1.guestMode;

  //   if (eventType == "FOLLOWING") {
  //     var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
  //     var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
  //     if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
  //       var _id_1 = (await this.utilsService.generateId());
  //       var _id_2 = (await this.utilsService.generateId());
  //       var CreateContenteventsDto1 = new CreateContenteventsDto();
  //       CreateContenteventsDto1._id = _id_1
  //       CreateContenteventsDto1.contentEventID = _id_1
  //       CreateContenteventsDto1.email = email_receiverParty
  //       CreateContenteventsDto1.eventType = "FOLLOWER"
  //       CreateContenteventsDto1.active = true
  //       CreateContenteventsDto1.event = "ACCEPT"
  //       CreateContenteventsDto1.createdAt = current_date
  //       CreateContenteventsDto1.updatedAt = current_date
  //       CreateContenteventsDto1.sequenceNumber = 1
  //       CreateContenteventsDto1.flowIsDone = true
  //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto1.receiverParty = email_user

  //       var CreateContenteventsDto2 = new CreateContenteventsDto();
  //       CreateContenteventsDto2._id = _id_2
  //       CreateContenteventsDto2.contentEventID = _id_2
  //       CreateContenteventsDto2.email = email_user
  //       CreateContenteventsDto2.eventType = "FOLLOWING"
  //       CreateContenteventsDto2.active = true
  //       CreateContenteventsDto2.event = "ACCEPT"
  //       CreateContenteventsDto2.createdAt = current_date
  //       CreateContenteventsDto2.updatedAt = current_date
  //       CreateContenteventsDto2.sequenceNumber = 1
  //       CreateContenteventsDto2.flowIsDone = true
  //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto2.senderParty = email_receiverParty

  //       if (await this.utilsService.ceckData(Insight_sender)) {
  //         var _id_sender = (await this.utilsService.generateId());
  //         var CreateInsightlogsDto_sender = new CreateInsightlogsDto()
  //         CreateInsightlogsDto_sender._id = _id_sender;
  //         CreateInsightlogsDto_sender.insightID = Insight_sender._id;
  //         CreateInsightlogsDto_sender.createdAt = current_date;
  //         CreateInsightlogsDto_sender.updatedAt = current_date;
  //         CreateInsightlogsDto_sender.mate = email_receiverParty
  //         CreateInsightlogsDto_sender.eventInsight = "FOLLOWING"
  //         CreateInsightlogsDto_sender._class = "io.melody.hyppe.content.domain.InsightLog"
  //         await this.insightlogsService.create(CreateInsightlogsDto_sender);

  //         var LogInsught_sensder = Insight_sender.insightLogs;
  //         LogInsught_sensder.push({
  //           $ref: 'insightlogs',
  //           $id: _id_sender,
  //           $db: 'hyppe_content_db',
  //         });

  //         var CreateInsightsDto_sender = new CreateInsightsDto()
  //         CreateInsightsDto_sender.insightLogs = LogInsught_sensder;
  //         await this.insightsService.updateoneByID(insightID1, CreateInsightsDto_sender)

  //       }
  //       if (await this.utilsService.ceckData(Insight_receiver)) {
  //         var _id_receiver = (await this.utilsService.generateId());
  //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //         CreateInsightlogsDto_receiver._id = _id_receiver;
  //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //         CreateInsightlogsDto_receiver.createdAt = current_date;
  //         CreateInsightlogsDto_receiver.updatedAt = current_date;
  //         CreateInsightlogsDto_receiver.mate = email_user
  //         CreateInsightlogsDto_receiver.eventInsight = "FOLLOWER"
  //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //         var LogInsught_receiver = Insight_receiver.insightLogs;
  //         LogInsught_receiver.push({
  //           $ref: 'insightlogs',
  //           $id: _id_receiver,
  //           $db: 'hyppe_content_db',
  //         });

  //         var CreateInsightsDto_receiver = new CreateInsightsDto()
  //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //         await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)

  //       }

  //       //INSERt FOLOWING STREAM
  //       if (request.body.idMediaStreaming != undefined) {
  //         const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
  //         if (!(await this.utilsService.ceckData(ceckView))) {
  //           const dataFollower = {
  //             userId: new mongoose.Types.ObjectId(userbasic1._id.toString()),
  //             status: true,
  //             createAt: current_date,
  //             updateAt: current_date
  //           }
  //           await this.mediastreamingService.insertFollower(request.body.idMediaStreaming, dataFollower)
  //         } else {
  //           await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), false, true, current_date);
  //         }
  //       }

  //       try {
  //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //         let idevent1 = resultdata1._id;
  //         let event1 = resultdata1.eventType.toString();
  //         // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
  //         await this.contenteventsService.create(CreateContenteventsDto2);
  //         await this.insightsService.updateFollowerByID(insightID2);
  //         await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
  //         await this.insightsService.updateFollowingByID(insightID1);
  //         this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
  //         await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
  //         //  this.sendInteractiveFCM2(email_user, "FOLLOWING", "", email_receiverParty);

  //         const databasic = await this.basic2SS.findbyemail(
  //           email_user
  //         );
  //         var iduser = null;
  //         if (databasic !== null) {
  //           iduser = databasic._id;
  //           // this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
  //           this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW",listchallenge)
  //         }
  //       } catch (error) {
  //         var fullurl = request.get("Host") + request.originalUrl;
  //         var timestamps_end = await this.utilsService.getDateTimeString();
  //         var reqbody = JSON.parse(JSON.stringify(request.body));
  //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     } else {
  //       if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
  //         await this.contenteventsService.updateFollowing(email_user, "FOLLOWING", email_receiverParty);
  //         await this.contenteventsService.updateFollower(email_receiverParty, "FOLLOWER", email_user);
  //         await this.insightsService.updateFollowerByID(insightID2);
  //         await this.insightsService.updateFollowingByID(insightID1);
  //         await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
  //         this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
  //         await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
  //         let idevent1 = ceck_data_FOLLOWING._id;
  //         let event1 = ceck_data_FOLLOWING.eventType.toString();
  //         //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

  //         const databasic = await this.basic2SS.findbyemail(
  //           email_user
  //         );
  //         var iduser = null;
  //         if (databasic !== null) {
  //           iduser = databasic._id;
  //           //this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
  //           this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW",listchallenge)
  //         }


  //       }
  //     }

  //     this.checkFriendbasedString2(userbasic1, userbasic2, "create");
  //   }
  //   //  else if (eventType == "VIEW") {

  //   //   if (email_user !== email_receiverParty) {
  //   //     var idevent1 = null;
  //   //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
  //   //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
  //   //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
  //   //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //   //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
  //   //       var _id_1 = (await this.utilsService.generateId());
  //   //       var _id_2 = (await this.utilsService.generateId());
  //   //       var CreateContenteventsDto1 = new CreateContenteventsDto();
  //   //       CreateContenteventsDto1._id = _id_1
  //   //       CreateContenteventsDto1.contentEventID = _id_1
  //   //       CreateContenteventsDto1.email = email_user
  //   //       CreateContenteventsDto1.eventType = "VIEW"
  //   //       CreateContenteventsDto1.active = true
  //   //       CreateContenteventsDto1.event = "DONE"
  //   //       CreateContenteventsDto1.createdAt = current_date
  //   //       CreateContenteventsDto1.updatedAt = current_date
  //   //       CreateContenteventsDto1.sequenceNumber = 1
  //   //       CreateContenteventsDto1.flowIsDone = true
  //   //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //   //       CreateContenteventsDto1.receiverParty = email_receiverParty
  //   //       CreateContenteventsDto1.postID = request.body.postID

  //   //       var CreateContenteventsDto2 = new CreateContenteventsDto();
  //   //       CreateContenteventsDto2._id = _id_2
  //   //       CreateContenteventsDto2.contentEventID = _id_2
  //   //       CreateContenteventsDto2.email = email_receiverParty
  //   //       CreateContenteventsDto2.eventType = "VIEW"
  //   //       CreateContenteventsDto2.active = true
  //   //       CreateContenteventsDto2.event = "ACCEPT"
  //   //       CreateContenteventsDto2.createdAt = current_date
  //   //       CreateContenteventsDto2.updatedAt = current_date
  //   //       CreateContenteventsDto2.sequenceNumber = 1
  //   //       CreateContenteventsDto2.flowIsDone = true
  //   //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //   //       CreateContenteventsDto2.senderParty = email_user
  //   //       CreateContenteventsDto2.postID = request.body.postID



  //   //       if (await this.utilsService.ceckData(Insight_receiver)) {
  //   //         var _id_receiver = (await this.utilsService.generateId());
  //   //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //   //         CreateInsightlogsDto_receiver._id = _id_receiver;
  //   //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //   //         CreateInsightlogsDto_receiver.createdAt = current_date;
  //   //         CreateInsightlogsDto_receiver.updatedAt = current_date;
  //   //         CreateInsightlogsDto_receiver.mate = email_user
  //   //         CreateInsightlogsDto_receiver.postID = request.body.postID
  //   //         CreateInsightlogsDto_receiver.eventInsight = "VIEW"
  //   //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //   //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //   //         var LogInsught_receiver = Insight_receiver.insightLogs;
  //   //         LogInsught_receiver.push({
  //   //           $ref: 'insightlogs',
  //   //           $id: _id_receiver,
  //   //           $db: 'hyppe_content_db',
  //   //         });

  //   //         var CreateInsightsDto_receiver = new CreateInsightsDto()
  //   //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //   //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)


  //   //       }

  //   //       try {
  //   //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //   //         idevent1 = resultdata1._id;
  //   //         let event1 = resultdata1.eventType.toString();
  //   //         //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
  //   //         var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

  //   //         await this.postsService.updateView(email_receiverParty, request.body.postID);
  //   //         await this.insightsService.updateViews(email_receiverParty);


  //   //       } catch (error) {
  //   //         var fullurl = request.get("Host") + request.originalUrl;
  //   //         var timestamps_end = await this.utilsService.getDateTimeString();
  //   //         var reqbody = JSON.parse(JSON.stringify(request.body));
  //   //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //   //         await this.errorHandler.generateNotAcceptableException(
  //   //           'Unabled to proceed, ' +
  //   //           error,
  //   //         );
  //   //       }
  //   //     }
  //   //     else {

  //   //       let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
  //   //       let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
  //   //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {

  //   //         var _id_1 = (await this.utilsService.generateId());
  //   //         var _id_2 = (await this.utilsService.generateId());
  //   //         var CreateContenteventsDto1 = new CreateContenteventsDto();
  //   //         CreateContenteventsDto1._id = _id_1
  //   //         CreateContenteventsDto1.contentEventID = _id_1
  //   //         CreateContenteventsDto1.email = email_user
  //   //         CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
  //   //         CreateContenteventsDto1.active = true
  //   //         CreateContenteventsDto1.event = "DONE"
  //   //         CreateContenteventsDto1.createdAt = current_date
  //   //         CreateContenteventsDto1.updatedAt = current_date
  //   //         CreateContenteventsDto1.sequenceNumber = 1
  //   //         CreateContenteventsDto1.flowIsDone = true
  //   //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //   //         CreateContenteventsDto1.receiverParty = email_receiverParty
  //   //         CreateContenteventsDto1.postID = request.body.postID

  //   //         var CreateContenteventsDto2 = new CreateContenteventsDto();
  //   //         CreateContenteventsDto2._id = _id_2
  //   //         CreateContenteventsDto2.contentEventID = _id_2
  //   //         CreateContenteventsDto2.email = email_receiverParty
  //   //         CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
  //   //         CreateContenteventsDto2.active = true
  //   //         CreateContenteventsDto2.event = "ACCEPT"
  //   //         CreateContenteventsDto2.createdAt = current_date
  //   //         CreateContenteventsDto2.updatedAt = current_date
  //   //         CreateContenteventsDto2.sequenceNumber = 1
  //   //         CreateContenteventsDto2.flowIsDone = true
  //   //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //   //         CreateContenteventsDto2.senderParty = email_user
  //   //         CreateContenteventsDto2.postID = request.body.postID

  //   //         try {
  //   //           var resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //   //           idevent1 = resultdata1._id;
  //   //           var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);


  //   //         } catch (error) {
  //   //           var fullurl = request.get("Host") + request.originalUrl;
  //   //           var timestamps_end = await this.utilsService.getDateTimeString();
  //   //           var reqbody = JSON.parse(JSON.stringify(request.body));
  //   //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //   //           await this.errorHandler.generateNotAcceptableException(
  //   //             'Unabled to proceed, ' +
  //   //             error,
  //   //           );
  //   //         }

  //   //       }

  //   //     }
  //   //     if (idevent1 != null) {
  //   //       try {
  //   //         this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
  //   //         console.log("sukses hitung score")
  //   //       } catch (e) {
  //   //         console.log("gagal ngitung skor" + e)
  //   //       }

  //   //     }
  //   //   }
  //   //   var datapost = await this.NewpostsService.updatePostviewer(request.body.postID, email_user);
  //   // } 
  //   else if (eventType == "VIEW") {
  //     if (email_user !== email_receiverParty) {
  //       var idevent1 = null;
  //       var idevent2 = null;
  //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
  //       var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
  //       var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
  //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
  //         var _id_1 = (await this.utilsService.generateId());
  //         var _id_2 = (await this.utilsService.generateId());
  //         var CreateContenteventsDto1 = new CreateContenteventsDto();
  //         CreateContenteventsDto1._id = _id_1
  //         CreateContenteventsDto1.contentEventID = _id_1
  //         CreateContenteventsDto1.email = email_user
  //         CreateContenteventsDto1.eventType = "VIEW"
  //         CreateContenteventsDto1.active = true
  //         CreateContenteventsDto1.event = "DONE"
  //         CreateContenteventsDto1.createdAt = current_date
  //         CreateContenteventsDto1.updatedAt = current_date
  //         CreateContenteventsDto1.sequenceNumber = 1
  //         CreateContenteventsDto1.flowIsDone = true
  //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //         CreateContenteventsDto1.receiverParty = email_receiverParty
  //         CreateContenteventsDto1.postID = request.body.postID

  //         var CreateContenteventsDto2 = new CreateContenteventsDto();
  //         CreateContenteventsDto2._id = _id_2
  //         CreateContenteventsDto2.contentEventID = _id_2
  //         CreateContenteventsDto2.email = email_receiverParty
  //         CreateContenteventsDto2.eventType = "VIEW"
  //         CreateContenteventsDto2.active = true
  //         CreateContenteventsDto2.event = "ACCEPT"
  //         CreateContenteventsDto2.createdAt = current_date
  //         CreateContenteventsDto2.updatedAt = current_date
  //         CreateContenteventsDto2.sequenceNumber = 1
  //         CreateContenteventsDto2.flowIsDone = true
  //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //         CreateContenteventsDto2.senderParty = email_user
  //         CreateContenteventsDto2.postID = request.body.postID

  //         if (await this.utilsService.ceckData(Insight_receiver)) {
  //           var _id_receiver = (await this.utilsService.generateId());
  //           var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //           CreateInsightlogsDto_receiver._id = _id_receiver;
  //           CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //           CreateInsightlogsDto_receiver.createdAt = current_date;
  //           CreateInsightlogsDto_receiver.updatedAt = current_date;
  //           CreateInsightlogsDto_receiver.mate = email_user
  //           CreateInsightlogsDto_receiver.postID = request.body.postID
  //           CreateInsightlogsDto_receiver.eventInsight = "VIEW"
  //           CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //           await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //           var LogInsught_receiver = Insight_receiver.insightLogs;
  //           LogInsught_receiver.push({
  //             $ref: 'insightlogs',
  //             $id: _id_receiver,
  //             $db: 'hyppe_content_db',
  //           });

  //           var CreateInsightsDto_receiver = new CreateInsightsDto()
  //           CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //           await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
  //         }

  //         try {
  //           const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //           idevent1 = resultdata1._id;
  //           let event1 = resultdata1.eventType.toString();
  //           //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
  //           var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

  //           var getpost = await this.postDisqusSS.findid(request.body.postID);
  //           var result = getpost.userView.filter((email) => email === email_user);
  //           if (result.length == 0) {
  //             await this.postDisqusSS.updateView(email_receiverParty, email_user, request.body.postID);
  //           }
  //           await this.insightsService.updateViewsByID(insightID2);
  //         } catch (error) {
  //           var fullurl = request.get("Host") + request.originalUrl;
  //           var timestamps_end = await this.utilsService.getDateTimeString();
  //           var reqbody = JSON.parse(JSON.stringify(request.body));
  //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, ' +
  //             error,
  //           );
  //         }
  //       }


  //       var datacek = null;

  //       try {
  //         datacek = await this.userchallengesService.cekUserjoin(iduser);
  //       } catch (e) {
  //         datacek = null;
  //       }

  //       if (datacek !== null) {
  //         let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
  //         let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
  //         if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //           var _id_1 = (await this.utilsService.generateId());
  //           var _id_2 = (await this.utilsService.generateId());
  //           var CreateContenteventsDto1 = new CreateContenteventsDto();
  //           CreateContenteventsDto1._id = _id_1
  //           CreateContenteventsDto1.contentEventID = _id_1
  //           CreateContenteventsDto1.email = email_user
  //           CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
  //           CreateContenteventsDto1.active = true
  //           CreateContenteventsDto1.event = "DONE"
  //           CreateContenteventsDto1.createdAt = current_date
  //           CreateContenteventsDto1.updatedAt = current_date
  //           CreateContenteventsDto1.sequenceNumber = 1
  //           CreateContenteventsDto1.flowIsDone = true
  //           CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //           CreateContenteventsDto1.receiverParty = email_receiverParty
  //           CreateContenteventsDto1.postID = request.body.postID

  //           var CreateContenteventsDto2 = new CreateContenteventsDto();
  //           CreateContenteventsDto2._id = _id_2
  //           CreateContenteventsDto2.contentEventID = _id_2
  //           CreateContenteventsDto2.email = email_receiverParty
  //           CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
  //           CreateContenteventsDto2.active = true
  //           CreateContenteventsDto2.event = "ACCEPT"
  //           CreateContenteventsDto2.createdAt = current_date
  //           CreateContenteventsDto2.updatedAt = current_date
  //           CreateContenteventsDto2.sequenceNumber = 1
  //           CreateContenteventsDto2.flowIsDone = true
  //           CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //           CreateContenteventsDto2.senderParty = email_user
  //           CreateContenteventsDto2.postID = request.body.postID

  //           try {
  //             let resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //             idevent1 = resultdata1._id;
  //             let dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

  //             if (idevent1 !== null) {
  //               try {
  //                 // this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
  //                 this.scoreviewrequest(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty,listchallenge)
  //                 console.log("sukses hitung score")
  //               } catch (e) {
  //                 console.log("gagal ngitung skor" + e)
  //               }


  //             }


  //           } catch (error) {
  //             var fullurl = request.get("Host") + request.originalUrl;
  //             var timestamps_end = await this.utilsService.getDateTimeString();
  //             var reqbody = JSON.parse(JSON.stringify(request.body));
  //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, ' +
  //               error,
  //             );
  //           }

  //         }
  //       }


  //     }

  //     var datapost = await this.postDisqusSS.updatePostviewer(request.body.postID, email_user);
  //   }
  //   else if (eventType == "LIKE") {
  //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
  //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
  //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //       var _id_1 = (await this.utilsService.generateId());
  //       var _id_2 = (await this.utilsService.generateId());
  //       var CreateContenteventsDto1 = new CreateContenteventsDto();
  //       CreateContenteventsDto1._id = _id_1
  //       CreateContenteventsDto1.contentEventID = _id_1
  //       CreateContenteventsDto1.email = email_user
  //       CreateContenteventsDto1.eventType = "LIKE"
  //       CreateContenteventsDto1.active = true
  //       CreateContenteventsDto1.event = "DONE"
  //       CreateContenteventsDto1.createdAt = current_date
  //       CreateContenteventsDto1.updatedAt = current_date
  //       CreateContenteventsDto1.sequenceNumber = 1
  //       CreateContenteventsDto1.flowIsDone = true
  //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto1.receiverParty = email_receiverParty
  //       CreateContenteventsDto1.postID = request.body.postID

  //       var CreateContenteventsDto2 = new CreateContenteventsDto();
  //       CreateContenteventsDto2._id = _id_2
  //       CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
  //       CreateContenteventsDto2.email = email_receiverParty
  //       CreateContenteventsDto2.eventType = "LIKE"
  //       CreateContenteventsDto2.active = true
  //       CreateContenteventsDto2.event = "ACCEPT"
  //       CreateContenteventsDto2.createdAt = current_date
  //       CreateContenteventsDto2.updatedAt = current_date
  //       CreateContenteventsDto2.sequenceNumber = 1
  //       CreateContenteventsDto2.flowIsDone = true
  //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //       CreateContenteventsDto2.senderParty = email_user
  //       CreateContenteventsDto2.postID = request.body.postID

  //       if (await this.utilsService.ceckData(Insight_receiver)) {
  //         var _id_receiver = (await this.utilsService.generateId());
  //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //         CreateInsightlogsDto_receiver._id = _id_receiver;
  //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //         CreateInsightlogsDto_receiver.createdAt = current_date;
  //         CreateInsightlogsDto_receiver.updatedAt = current_date;
  //         CreateInsightlogsDto_receiver.mate = email_user
  //         CreateInsightlogsDto_receiver.eventInsight = "LIKE"
  //         CreateInsightlogsDto_receiver.postID = request.body.postID
  //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //         var LogInsught_receiver = Insight_receiver.insightLogs;
  //         LogInsught_receiver.push({
  //           $ref: 'insightlogs',
  //           $id: _id_receiver,
  //           $db: 'hyppe_content_db',
  //         });

  //         var CreateInsightsDto_receiver = new CreateInsightsDto()
  //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //         await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
  //       }

  //       try {
  //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //         let idevent1 = resultdata1._id;
  //         let event1 = resultdata1.eventType.toString();
  //         // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
  //         await this.contenteventsService.create(CreateContenteventsDto2);
  //         var getpost = await this.postDisqusSS.findid(request.body.postID);
  //         var result = getpost.userLike.filter((email) => email === email_user);
  //         if (result.length == 0) {
  //           await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);
  //         }
  //         await this.insightsService.updateLikeByID(insightID2);
  //         if (!isguest) {
  //           this.sendInteractiveFCM2(email_receiverParty, "LIKE", request.body.postID, email_user);
  //         }
  //         // const databasic = await this.userbasicsService.findOne(
  //         //   email_receiverParty
  //         // );
  //         // var iduser = null;
  //         // if (databasic !== null) {
  //         //   iduser = databasic._id;
  //         //   this.userChallengeLike(iduser.toString(), idevent1.toString(), "contentevents", "LIKE", request.body.postID);
  //         // }
  //         //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

  //         //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);


  //          this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);




  //       } catch (error) {
  //         var fullurl = request.get("Host") + request.originalUrl;
  //         var timestamps_end = await this.utilsService.getDateTimeString();
  //         var reqbody = JSON.parse(JSON.stringify(request.body));
  //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     } else {
  //       if (ceck_data_DONE.active && ceck_data_DONE.active) {
  //         try {
  //           await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
  //           await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
  //           await this.insightsService.updateUnlikeByID(insightID2);
  //           await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

  //           let idevent1 = ceck_data_DONE._id;
  //           let event1 = ceck_data_DONE.eventType.toString();
  //           //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
  //           // const databasic = await this.userbasicsService.findOne(
  //           //   email_receiverParty
  //           // );
  //           // var iduser = null;
  //           // if (databasic !== null) {
  //           //   iduser = databasic._id;
  //           //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
  //           // }
  //           // this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

  //           // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

  //            this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty,listchallenge);
  //         } catch (error) {
  //           var fullurl = request.get("Host") + request.originalUrl;
  //           var timestamps_end = await this.utilsService.getDateTimeString();
  //           var reqbody = JSON.parse(JSON.stringify(request.body));
  //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, ' +
  //             error,
  //           );
  //         }
  //       } else {
  //         try {
  //           await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
  //           await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
  //           await this.insightsService.updateLikeByID(insightID2);
  //           await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

  //           let idevent1 = ceck_data_DONE._id;
  //           let event1 = ceck_data_DONE.eventType.toString();
  //           // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
  //           // this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

  //           // this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

  //           // this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

  //               this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);


  //         } catch (error) {
  //           var fullurl = request.get("Host") + request.originalUrl;
  //           var timestamps_end = await this.utilsService.getDateTimeString();
  //           var reqbody = JSON.parse(JSON.stringify(request.body));
  //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //           await this.errorHandler.generateNotAcceptableException(
  //             'Unabled to proceed, ' +
  //             error,
  //           );
  //         }
  //       }
  //     }
  //   }
  //   else if (eventType == "UNLIKE") {
  //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
  //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
  //     if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //       try {
  //         await this.insightsService.updateUnlikeByID(insightID2);
  //         await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
  //         await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
  //         await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

  //         let idevent1 = ceck_data_DONE._id;
  //         // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);

  //         // const databasic = await this.userbasicsService.findOne(
  //         //   email_receiverParty
  //         // );
  //         // var iduser = null;
  //         // if (databasic !== null) {
  //         //   iduser = databasic._id;
  //         //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
  //         // }
  //         //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

  //         //this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

  //         this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty,listchallenge);
  //       } catch (error) {
  //         var fullurl = request.get("Host") + request.originalUrl;
  //         var timestamps_end = await this.utilsService.getDateTimeString();
  //         var reqbody = JSON.parse(JSON.stringify(request.body));
  //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     } else {

  //       if (ceck_data_DONE.active != undefined && !ceck_data_ACCEPT.active != undefined) {
  //         if (ceck_data_DONE.active && ceck_data_ACCEPT.active) {
  //           try {
  //             await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
  //             await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
  //             await this.insightsService.updateUnlikeByID(insightID2);
  //             await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

  //             let idevent1 = ceck_data_DONE._id;
  //             // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
  //             // const databasic = await this.userbasicsService.findOne(
  //             //   email_receiverParty
  //             // );
  //             // var iduser = null;
  //             // if (databasic !== null) {
  //             //   iduser = databasic._id;
  //             //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
  //             // }

  //             //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

  //             // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

  //              this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty,listchallenge);
  //           } catch (error) {
  //             var fullurl = request.get("Host") + request.originalUrl;
  //             var timestamps_end = await this.utilsService.getDateTimeString();
  //             var reqbody = JSON.parse(JSON.stringify(request.body));
  //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, ' +
  //               error,
  //             );
  //           }
  //         } else {
  //           try {
  //             await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
  //             await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
  //             await this.insightsService.updateLikeByID(insightID2);
  //             await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

  //             let idevent1 = ceck_data_DONE._id;
  //             // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "LIKE", userbasic1._id);
  //             // const databasic = await this.userbasicsService.findOne(
  //             //   email_receiverParty
  //             // );
  //             // var iduser = null;
  //             // if (databasic !== null) {
  //             //   iduser = databasic._id;
  //             //   this.userChallengeLike2( idevent1.toString(), "contentevents", "LIKE", request.body.postID);
  //             // }

  //             //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

  //             //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

  //             this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty,listchallenge);
  //           } catch (error) {
  //             var fullurl = request.get("Host") + request.originalUrl;
  //             var timestamps_end = await this.utilsService.getDateTimeString();
  //             var reqbody = JSON.parse(JSON.stringify(request.body));
  //             this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //             await this.errorHandler.generateNotAcceptableException(
  //               'Unabled to proceed, ' +
  //               error,
  //             );
  //           }
  //         }
  //       }
  //     }
  //   } else if (eventType == "UNFOLLOW") {
  //     var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
  //     var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
  //     if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
  //       try {
  //         await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
  //         await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
  //         await this.insightsService.updateUnFollowerByID(insightID2);
  //         await this.insightsService.updateUnFollowingByID(insightID1);
  //         await this.insightsService.updateUnFollowByID(insightID1);
  //         await this.basic2SS.updateunfollowSystem(email_user, email_receiverParty, "FOLLOWER");
  //         await this.basic2SS.updateunfollowSystem(email_receiverParty, email_user, "FOLLOWING");

  //         //INSERt UNFOLLOW STREAM
  //         if (request.body.idMediaStreaming != undefined) {
  //           const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
  //           if (await this.utilsService.ceckData(ceckView)) {
  //             await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), true, false, current_date);
  //           }
  //         }

  //         let idevent1 = ceck_data_FOLLOWING._id;
  //         //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNFOLLOW", userbasic1._id);

  //         const databasic = await this.basic2SS.findbyemail(
  //           email_user
  //         );
  //         var iduser = null;
  //         if (databasic !== null) {
  //           iduser = databasic._id;
  //           // this.userChallengeUnFollow(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW");

  //           this.scoreunfollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW",listchallenge)
  //         }

  //         this.checkFriendbasedString2(userbasic1, userbasic2, "delete");
  //       } catch (error) {
  //         var fullurl = request.get("Host") + request.originalUrl;
  //         var timestamps_end = await this.utilsService.getDateTimeString();
  //         var reqbody = JSON.parse(JSON.stringify(request.body));
  //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //         await this.errorHandler.generateNotAcceptableException(
  //           'Unabled to proceed, ' +
  //           error,
  //         );
  //       }
  //     }
  //   } else if (eventType == "REACTION") {
  //     // var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
  //     // var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
  //     // if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
  //     var _id_1 = (await this.utilsService.generateId());
  //     var _id_2 = (await this.utilsService.generateId());
  //     var CreateContenteventsDto1 = new CreateContenteventsDto();
  //     CreateContenteventsDto1._id = _id_1
  //     CreateContenteventsDto1.contentEventID = _id_1
  //     CreateContenteventsDto1.email = email_user
  //     CreateContenteventsDto1.eventType = "REACTION"
  //     CreateContenteventsDto1.active = true
  //     CreateContenteventsDto1.event = "DONE"
  //     CreateContenteventsDto1.createdAt = current_date
  //     CreateContenteventsDto1.updatedAt = current_date
  //     CreateContenteventsDto1.sequenceNumber = 1
  //     CreateContenteventsDto1.flowIsDone = true
  //     CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
  //     CreateContenteventsDto1.receiverParty = email_receiverParty
  //     CreateContenteventsDto1.reactionUri = request.body.reactionUri
  //     CreateContenteventsDto1.postID = request.body.postID

  //     var CreateContenteventsDto2 = new CreateContenteventsDto();
  //     CreateContenteventsDto2._id = _id_2
  //     CreateContenteventsDto2.contentEventID = _id_2
  //     CreateContenteventsDto2.email = email_receiverParty
  //     CreateContenteventsDto2.eventType = "REACTION"
  //     CreateContenteventsDto2.active = true
  //     CreateContenteventsDto2.event = "ACCEPT"
  //     CreateContenteventsDto2.createdAt = current_date
  //     CreateContenteventsDto2.updatedAt = current_date
  //     CreateContenteventsDto2.sequenceNumber = 1
  //     CreateContenteventsDto2.flowIsDone = true
  //     CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
  //     CreateContenteventsDto2.senderParty = email_user
  //     CreateContenteventsDto2.reactionUri = request.body.reactionUri
  //     CreateContenteventsDto2.postID = request.body.postID

  //     if (await this.utilsService.ceckData(Insight_receiver)) {
  //       var _id_receiver = (await this.utilsService.generateId());
  //       var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
  //       CreateInsightlogsDto_receiver._id = _id_receiver;
  //       CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
  //       CreateInsightlogsDto_receiver.createdAt = current_date;
  //       CreateInsightlogsDto_receiver.updatedAt = current_date;
  //       CreateInsightlogsDto_receiver.mate = email_user
  //       CreateInsightlogsDto_receiver.eventInsight = "REACTION"
  //       CreateInsightlogsDto_receiver.postID = request.body.postID
  //       CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
  //       await this.insightlogsService.create(CreateInsightlogsDto_receiver);

  //       var LogInsught_receiver = Insight_receiver.insightLogs;
  //       LogInsught_receiver.push({
  //         $ref: 'insightlogs',
  //         $id: _id_receiver,
  //         $db: 'hyppe_content_db',
  //       });

  //       var CreateInsightsDto_receiver = new CreateInsightsDto()
  //       CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
  //       await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
  //     }

  //     //SEND DIRECT MESSAGE
  //     let retVal = new DisqusResDto();

  //     //CECk DISQUS CONTACT
  //     var CeckDataDiscusContact_sender = await this.disquscontactsService.findMayeEmail(email_user, email_receiverParty);
  //     var CeckDataDiscusContact_receiver = await this.disquscontactsService.findMayeEmail(email_receiverParty, email_user);

  //     var id_discus_contact = "";
  //     var id_discus = "";
  //     var id_discus_log = "";

  //     var post = await this.postDisqusSS.findByPostId(request.body.postID.toString());
  //     var media_ = {}
  //     if (await this.utilsService.ceckData(post.mediaSource[0])) {
  //       if (post.createdAt != undefined) {
  //         media_["createdAt"] = post.createdAt;
  //       }
  //       if (post.mediaSource[0].mediaBasePath != undefined) {
  //         media_["mediaBasePath"] = post.mediaSource[0].mediaBasePath;
  //       }
  //       if (post.postType != undefined) {
  //         media_["postType"] = post.postType;
  //       }
  //       if (post.mediaSource[0].mediaUri != undefined) {
  //         media_["mediaUri"] = post.mediaSource[0].mediaUri;
  //       }
  //       if (post.mediaSource[0].mediaThumb != undefined) {
  //         media_["mediaThumbUri"] = post.mediaSource[0].mediaThumb;
  //       }
  //       if (post.description != undefined) {
  //         media_["description"] = post.description;
  //       }
  //       if (post.active != undefined) {
  //         media_["active"] = post.active;
  //       }
  //       if (post.mediaSource[0].mediaType != undefined) {
  //         media_["mediaType"] = post.mediaSource[0].mediaType;
  //       }
  //       if (post.postID != undefined) {
  //         media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
  //       }
  //       if (post.postID != undefined) {
  //         media_["postID"] = post.postID;
  //       }
  //       if (post.mediaSource[0].mediaUri != undefined) {
  //         media_["mediaEndpoint"] = post.mediaSource[0].mediaUri;
  //       }
  //       if (post.mediaSource[0].apsara != undefined) {
  //         media_["apsara"] = post.mediaSource[0].apsara;
  //       }
  //       if (post.mediaSource[0].apsaraId != undefined) {
  //         media_["apsaraId"] = post.mediaSource[0].apsaraId;
  //       }
  //     }

  //     var body_messages = "";
  //     var body_ = "";
  //     var dataEmote = await this.reactionsRepoService.findByUrl(request.body.reactionUri);
  //     var Emote = (await this.utilsService.ceckData(dataEmote)) ? dataEmote.icon : "";
  //     var Templates_ = await this.utilsService.getTemplate_repo('REACTION', 'NOTIFICATION');
  //     var get_languages = await this.utilsService.getUserlanguages(email_receiverParty);
  //     if (get_languages == "en") {
  //       body_ = Templates_.body_detail.toString()
  //       body_messages = body_.toString().replace("${emoticon}", Emote.toString())
  //     } else {
  //       body_ = Templates_.body_detail_id.toString()
  //       body_messages = body_.toString().replace("${emoticon}", Emote.toString())
  //     }

  //     id_discus_log = await this.utilsService.generateId()
  //     //INSERT DISQUS LOG
  //     var CreateDisquslogsDto_ = new Disquslogs();
  //     try {
  //       CreateDisquslogsDto_._id = id_discus_log;
  //       CreateDisquslogsDto_.disqusID = id_discus;
  //       CreateDisquslogsDto_.active = true;
  //       CreateDisquslogsDto_.sequenceNumber = 0;
  //       CreateDisquslogsDto_.postID = request.body.postID.toString();
  //       CreateDisquslogsDto_.eventInsight = "REACTION";
  //       CreateDisquslogsDto_.sender = email_user;
  //       CreateDisquslogsDto_.receiver = email_receiverParty;
  //       CreateDisquslogsDto_.postType = "txt_msg";
  //       CreateDisquslogsDto_.createdAt = current_date;
  //       CreateDisquslogsDto_.updatedAt = current_date;
  //       CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
  //       CreateDisquslogsDto_.medias = [media_];
  //       CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
  //       CreateDisquslogsDto_.receiverActive = true;
  //       CreateDisquslogsDto_.senderActive = true;
  //       this.disquslogsService.create(CreateDisquslogsDto_);
  //     } catch (error) {
  //       this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //     }

  //     //INSERT DISQUS
  //     var CreateDisqusDto_ = new CreateDisqusDto();
  //     if ((await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && (await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
  //       id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
  //       CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
  //       if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
  //         //INSERT DISQUS
  //         try {
  //           CreateDisqusDto_._id = id_discus;
  //           CreateDisqusDto_.room = id_discus;
  //           CreateDisqusDto_.disqusID = id_discus;
  //           CreateDisqusDto_.active = true;
  //           CreateDisqusDto_.email = email_user;
  //           CreateDisqusDto_.mate = email_receiverParty;
  //           CreateDisqusDto_.eventType = "DIRECT_MSG";
  //           CreateDisqusDto_.room = id_discus;
  //           CreateDisqusDto_.createdAt = current_date;
  //           CreateDisqusDto_.updatedAt = current_date;
  //           CreateDisqusDto_.lastestMessage = Emote.toString();
  //           CreateDisqusDto_.emailActive = true;
  //           CreateDisqusDto_.mateActive = true;
  //           CreateDisqusDto_.disqusLogs = [{
  //             $ref: 'disquslogs',
  //             $id: id_discus_log,
  //             $db: 'hyppe_content_db',
  //           }];
  //           CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
  //           this.disqusContentEventService.create(CreateDisqusDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //       } else {
  //         //UPDATE DISQUS
  //         try {
  //           var data_disqusLogs = CreateDisqusDto_.disqusLogs;
  //           data_disqusLogs.push({
  //             $ref: 'disquslogs',
  //             $id: id_discus_log,
  //             $db: 'hyppe_content_db',
  //           });
  //           CreateDisqusDto_.emailActive = true;
  //           CreateDisqusDto_.mateActive = true;
  //           CreateDisqusDto_.updatedAt = current_date;
  //           CreateDisqusDto_.disqusLogs = data_disqusLogs;
  //           CreateDisqusDto_.lastestMessage = Emote.toString();
  //           this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //       }
  //       retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
  //       this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
  //       this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
  //     } else {
  //       if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && !(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
  //         id_discus = await this.utilsService.generateId();
  //         //INSERT DISQUS CONTACT
  //         var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
  //         try {
  //           id_discus_contact = await this.utilsService.generateId();
  //           CreateDisquscontactsDto_._id = id_discus_contact;
  //           CreateDisquscontactsDto_.active = true;
  //           CreateDisquscontactsDto_.email = email_user;
  //           CreateDisquscontactsDto_.mate = email_receiverParty;
  //           CreateDisquscontactsDto_.disqus = {
  //             $ref: 'disqus',
  //             $id: id_discus,
  //             $db: 'hyppe_content_db',
  //           };
  //           CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
  //           this.disquscontactsService.create(CreateDisquscontactsDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //         //INSERT DISQUS CONTACT
  //         var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
  //         try {
  //           id_discus_contact = await this.utilsService.generateId();
  //           CreateDisquscontactsDto_._id = id_discus_contact;
  //           CreateDisquscontactsDto_.active = true;
  //           CreateDisquscontactsDto_.email = email_receiverParty;
  //           CreateDisquscontactsDto_.mate = email_user;
  //           CreateDisquscontactsDto_.disqus = {
  //             $ref: 'disqus',
  //             $id: id_discus,
  //             $db: 'hyppe_content_db',
  //           };
  //           CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
  //           this.disquscontactsService.create(CreateDisquscontactsDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //         //INSERT DISQUS
  //         try {
  //           CreateDisqusDto_._id = id_discus;
  //           CreateDisqusDto_.room = id_discus;
  //           CreateDisqusDto_.disqusID = id_discus;
  //           CreateDisqusDto_.active = true;
  //           CreateDisqusDto_.email = email_user;
  //           CreateDisqusDto_.mate = email_receiverParty;
  //           CreateDisqusDto_.eventType = "DIRECT_MSG";
  //           CreateDisqusDto_.room = id_discus;
  //           CreateDisqusDto_.createdAt = current_date;
  //           CreateDisqusDto_.updatedAt = current_date;
  //           CreateDisqusDto_.lastestMessage = Emote.toString();
  //           CreateDisqusDto_.emailActive = true;
  //           CreateDisqusDto_.mateActive = true;
  //           CreateDisqusDto_.disqusLogs = [{
  //             $ref: 'disquslogs',
  //             $id: id_discus_log,
  //             $db: 'hyppe_content_db',
  //           }];
  //           CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
  //           this.disqusContentEventService.create(CreateDisqusDto_);
  //         } catch (error) {
  //           this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
  //         }
  //         retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
  //         this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
  //         this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
  //       } else {
  //         if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender))) {
  //           //INSERT DISQUS CONTACT
  //           var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
  //           try {
  //             CreateDisquscontactsDto_._id = id_discus_contact;
  //             CreateDisquscontactsDto_.active = true;
  //             CreateDisquscontactsDto_.email = email_user;
  //             CreateDisquscontactsDto_.mate = email_receiverParty;
  //             CreateDisquscontactsDto_.disqus = {
  //               $ref: 'disqus',
  //               $id: id_discus,
  //               $db: 'hyppe_content_db',
  //             };
  //             CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
  //             this.disquscontactsService.create(CreateDisquscontactsDto_);
  //           } catch (error) {
  //             this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
  //           }
  //           id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_receiver.disqus))).$id;
  //           CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
  //           if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
  //             //INSERT DISQUS
  //             try {
  //               CreateDisqusDto_._id = id_discus;
  //               CreateDisqusDto_.room = id_discus;
  //               CreateDisqusDto_.disqusID = id_discus;
  //               CreateDisqusDto_.active = true;
  //               CreateDisqusDto_.email = email_user;
  //               CreateDisqusDto_.mate = email_receiverParty;
  //               CreateDisqusDto_.eventType = "DIRECT_MSG";
  //               CreateDisqusDto_.room = id_discus;
  //               CreateDisqusDto_.createdAt = current_date;
  //               CreateDisqusDto_.updatedAt = current_date;
  //               CreateDisqusDto_.lastestMessage = Emote.toString();
  //               CreateDisqusDto_.emailActive = true;
  //               CreateDisqusDto_.mateActive = true;
  //               CreateDisqusDto_.disqusLogs = [{
  //                 $ref: 'disquslogs',
  //                 $id: id_discus_log,
  //                 $db: 'hyppe_content_db',
  //               }];
  //               CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
  //               this.disqusContentEventService.create(CreateDisqusDto_);
  //             } catch (error) {
  //               this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
  //             }
  //           } else {
  //             //UPDATE DISQUS
  //             try {
  //               var data_disqusLogs = CreateDisqusDto_.disqusLogs;
  //               data_disqusLogs.push({
  //                 $ref: 'disquslogs',
  //                 $id: id_discus_log,
  //                 $db: 'hyppe_content_db',
  //               });
  //               CreateDisqusDto_.emailActive = true;
  //               CreateDisqusDto_.mateActive = true;
  //               CreateDisqusDto_.updatedAt = current_date;
  //               CreateDisqusDto_.disqusLogs = data_disqusLogs;
  //               CreateDisqusDto_.lastestMessage = Emote.toString();
  //               this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
  //             } catch (error) {
  //               this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //             }
  //           }
  //         }
  //         if (!(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
  //           //INSERT DISQUS CONTACT
  //           var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
  //           try {
  //             CreateDisquscontactsDto_._id = id_discus_contact;
  //             CreateDisquscontactsDto_.active = true;
  //             CreateDisquscontactsDto_.email = email_receiverParty;
  //             CreateDisquscontactsDto_.mate = email_user;
  //             CreateDisquscontactsDto_.disqus = {
  //               $ref: 'disqus',
  //               $id: id_discus,
  //               $db: 'hyppe_content_db',
  //             };
  //             CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
  //             this.disquscontactsService.create(CreateDisquscontactsDto_);
  //           } catch (error) {
  //             this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
  //           }
  //           id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
  //           CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
  //           if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
  //             //INSERT DISQUS
  //             try {
  //               CreateDisqusDto_._id = id_discus;
  //               CreateDisqusDto_.room = id_discus;
  //               CreateDisqusDto_.disqusID = id_discus;
  //               CreateDisqusDto_.active = true;
  //               CreateDisqusDto_.email = email_user;
  //               CreateDisqusDto_.mate = email_receiverParty;
  //               CreateDisqusDto_.eventType = "DIRECT_MSG";
  //               CreateDisqusDto_.room = id_discus;
  //               CreateDisqusDto_.createdAt = current_date;
  //               CreateDisqusDto_.updatedAt = current_date;
  //               CreateDisqusDto_.lastestMessage = Emote.toString();
  //               CreateDisqusDto_.emailActive = true;
  //               CreateDisqusDto_.mateActive = true;
  //               CreateDisqusDto_.disqusLogs = [{
  //                 $ref: 'disquslogs',
  //                 $id: id_discus_log,
  //                 $db: 'hyppe_content_db',
  //               }];
  //               CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
  //               this.disqusContentEventService.create(CreateDisqusDto_);
  //             } catch (error) {
  //               this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
  //             }
  //           } else {
  //             //UPDATE DISQUS
  //             try {
  //               var data_disqusLogs = CreateDisqusDto_.disqusLogs;
  //               data_disqusLogs.push({
  //                 $ref: 'disquslogs',
  //                 $id: id_discus_log,
  //                 $db: 'hyppe_content_db',
  //               });
  //               CreateDisqusDto_.emailActive = true;
  //               CreateDisqusDto_.mateActive = true;
  //               CreateDisqusDto_.updatedAt = current_date;
  //               CreateDisqusDto_.disqusLogs = data_disqusLogs;
  //               CreateDisqusDto_.lastestMessage = Emote.toString();
  //               this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
  //             } catch (error) {
  //               this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
  //             }
  //           }
  //         }
  //         retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
  //         this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
  //         this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
  //       }
  //     }

  //     console.log("retVal", retVal);
  //     try {
  //       const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
  //       let idevent1 = resultdata1._id;
  //       let event1 = resultdata1.eventType.toString();
  //       // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
  //       await this.contenteventsService.create(CreateContenteventsDto2);
  //       await this.postDisqusSS.updateReaction(email_receiverParty, request.body.postID);
  //       await this.insightsService.updateReactionsByID(insightID1);
  //       this.sendInteractiveFCM2(email_receiverParty, "REACTION", request.body.postID, email_user, Emote);
  //     } catch (error) {
  //       var fullurl = request.get("Host") + request.originalUrl;
  //       var timestamps_end = await this.utilsService.getDateTimeString();
  //       var reqbody = JSON.parse(JSON.stringify(request.body));
  //       this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //       await this.errorHandler.generateNotAcceptableException(
  //         'Unabled to proceed, ' +
  //         error,
  //       );
  //     }
  //     //}
  //   }

  //   var fullurl = request.get("Host") + request.originalUrl;
  //   var timestamps_end = await this.utilsService.getDateTimeString();
  //   var reqbody = JSON.parse(JSON.stringify(request.body));
  //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

  //   return {
  //     response_code: 202,
  //     messages: {
  //       info: ['Successful'],
  //     },
  //   }
  // }

  //versi async
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/posts/interactive/v2/backup')
  async interactive3(@Req() request: any, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(request.body));
    if (headers['x-auth-user'] == undefined || headers['x-auth-user'] == null || headers['x-auth-user'] == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed auth-user undefined',
      );
    }
    if (request.body.eventType == undefined || request.body.eventType == null || request.body.eventType == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param eventType is required',
      );
    }
    if (request.body.receiverParty == undefined || request.body.receiverParty == null || request.body.receiverParty == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param receiverParty is required',
      );
    }

    this.synchInteractive(request, headers);

    return {
      response_code: 202,
      messages: {
        info: ['Successful'],
      },
    }
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/posts/interactive/v2')
  async interactive34(@Req() request: any, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(request.body));
    if (headers['x-auth-user'] == undefined || headers['x-auth-user'] == null || headers['x-auth-user'] == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed auth-user undefined',
      );
    }
    if (request.body.eventType == undefined || request.body.eventType == null || request.body.eventType == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param eventType is required',
      );
    }
    if (request.body.receiverParty == undefined || request.body.receiverParty == null || request.body.receiverParty == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param receiverParty is required',
      );
    }

    this.synchInteractivev2(request, headers);

    return {
      response_code: 202,
      messages: {
        info: ['Successful'],
      },
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/posts/interactive/v3')
  async interactive347(@Req() request: any, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(request.body));
    if (headers['x-auth-user'] == undefined || headers['x-auth-user'] == null || headers['x-auth-user'] == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed auth-user undefined',
      );
    }
    if (request.body.eventType == undefined || request.body.eventType == null || request.body.eventType == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param eventType is required',
      );
    }
    if (request.body.receiverParty == undefined || request.body.receiverParty == null || request.body.receiverParty == '') {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param receiverParty is required',
      );
    }

    this.synchInteractivev2(request, headers);

    return {
      response_code: 202,
      messages: {
        info: ['Successful'],
      },
    }
  }
  async sendInteractiveFCM2(email: string, type: string, postID: string, receiverParty: string, customText?: any) {
    // var Templates_ = new TemplatesRepo();
    // Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

    // var get_username_email = await this.utilsService.getUsertname(email);
    // var get_username_receiverParty = await this.utilsService.getUsertname(receiverParty);

    // var email = email;
    // var titlein = get_username_receiverParty?.toString() || '';
    // var titleen = get_username_receiverParty?.toString() || '';
    // var bodyin = "";
    // var bodyen = "";

    var email_post = "";

    // if (type == "LIKE") {
    var posts = await this.postDisqusSS.findid(postID);
    //   var bodyin_get = Templates_.body_detail_id.toString();
    //   var bodyen_get = Templates_.body_detail.toString();

    var post_type = "";
    if (await this.utilsService.ceckData(posts)) {
      post_type = posts.postType.toString();
      email_post = posts.email.toString();
    }

    //   var new_bodyin_get = bodyin_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));
    //   var new_bodyen_get = bodyen_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));

    //   var bodyin = new_bodyin_get;
    //   var bodyen = new_bodyen_get;
    // } else {
    //   var bodyin = Templates_.body_detail_id.toString();
    //   var bodyen = Templates_.body_detail.toString();
    // }
    var eventType = type.toString();
    // var event = "ACCEPT";
    var event = "ACCEPT";
    if (type == "LIKE") {
      if (receiverParty != email_post) {
        await this.utilsService.sendFcmV2(email, receiverParty, eventType, event, type, postID, post_type)
        //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event, postID, post_type);
      }
    } else {
      if (type == "REACTION") {
        await this.utilsService.sendFcmV2(email, receiverParty, eventType, event, type, postID, post_type, null, customText)
        //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event, postID, post_type);
      } else {
        await this.utilsService.sendFcmV2(email, receiverParty, eventType, event, type)
        //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
      }
    }
  }

  async sendInteractiveFCM(email: string, type: string, postID: string, receiverParty: string, customText?: any) {
    // var Templates_ = new TemplatesRepo();
    // Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

    // var get_username_email = await this.utilsService.getUsertname(email);
    // var get_username_receiverParty = await this.utilsService.getUsertname(receiverParty);

    // var email = email;
    // var titlein = get_username_receiverParty?.toString() || '';
    // var titleen = get_username_receiverParty?.toString() || '';
    // var bodyin = "";
    // var bodyen = "";

    var email_post = "";

    // if (type == "LIKE") {
    var posts = await this.postsService.findid(postID);
    //   var bodyin_get = Templates_.body_detail_id.toString();
    //   var bodyen_get = Templates_.body_detail.toString();

    var post_type = "";
    if (await this.utilsService.ceckData(posts)) {
      post_type = posts.postType.toString();
      email_post = posts.email.toString();
    }

    //   var new_bodyin_get = bodyin_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));
    //   var new_bodyen_get = bodyen_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));

    //   var bodyin = new_bodyin_get;
    //   var bodyen = new_bodyen_get;
    // } else {
    //   var bodyin = Templates_.body_detail_id.toString();
    //   var bodyen = Templates_.body_detail.toString();
    // }
    var eventType = type.toString();
    // var event = "ACCEPT";
    var event = "ACCEPT";
    if (type == "LIKE") {
      if (receiverParty != email_post) {
        await this.utilsService.sendFcmV2(email, receiverParty, eventType, event, type, postID, post_type)
        //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event, postID, post_type);
      }
    } else {
      if (type == "REACTION") {
        await this.utilsService.sendFcmV2(email, receiverParty, eventType, event, type, postID, post_type, null, customText)
        //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event, postID, post_type);
      } else {
        await this.utilsService.sendFcmV2(email, receiverParty, eventType, event, type)
        //await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
      }
    }
  }

  async checkFriendbasedString2(email1: Userbasicnew, email2: Userbasicnew, jenisoperasi: string) {
    console.log('proses data friend');
    console.log(jenisoperasi);

    var data = await this.contenteventsService.checkFriendListdata2(email1.email.toString(), email2.email.toString());
    var checkexist = await this.utilsService.ceckData(data);

    if (checkexist == true && data.length == 2) {
      try {
        if (jenisoperasi == 'create') {
          await this.basic2SS.addFriendList(email1, email2);
          await this.basic2SS.addFriendList(email2, email1);
        }
        else {
          await this.basic2SS.deleteFriendList(email1, email2);
          await this.basic2SS.deleteFriendList(email2, email1);
        }
      }
      catch (e) {
        console.log(e);
      }
    }
  }

  async checkFriendbasedString(email1: string, email2: string, jenisoperasi: string) {
    var data = await this.contenteventsService.checkFriendListdata(email1, email2);
    var checkexist = await this.utilsService.ceckData(data);

    // console.log(data);
    // console.log(checkexist);

    if (checkexist == true) {
      if (jenisoperasi == 'create') {
        await this.friendListService.addFriendList(email1, email2);
        await this.friendListService.addFriendList(email2, email1);
      }
      else {
        await this.friendListService.deleteFriendList(email1, email2);
        await this.friendListService.deleteFriendList(email2, email1);
      }
    }
  }

  async userChallengeFollow(iduser: string, idref: string, nametable: string, action: string) {
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
      datachallenge = await this.challengeService.challengeFollow();
    } catch (e) {
      datachallenge = null;
    }

    if (datachallenge !== null && datachallenge.length > 0) {
      lengchal = datachallenge.length;

      for (let i = 0; i < lengchal; i++) {
        var idChallenge = datachallenge[i]._id.toString();
        var poinFollow = datachallenge[i].poinFollow;
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
                await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poinFollow);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);

                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall !== null && datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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


  async userChallengeView(iduser: string, idref: string, nametable: string, action: string, postID: string) {
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
    var datapostchall = null;
    var idpostchall = null;
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
          tagar = datachallenge[i].tagar;
        } catch (e) {
          tagar = "";
        }
        if (tagar != undefined && tagar != "") {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }

          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              var postIDpost = datatag[i].postID;
              var postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

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

                      if (postType == "vid") {
                        poin = poinViewVid;
                      } else if (postType == "diary") {
                        poin = poinViewDiary;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      if (poin > 0) {
                        try {
                          await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                        } catch (e) {

                        }
                      }



                      var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                      if (datauschall.length > 0) {
                        for (let x = 0; x < datauschall.length; x++) {

                          let iducall = datauschall[x]._id;
                          let start = new Date(datauschall[x].startDatetime);
                          let end = new Date(datauschall[x].endDatetime);
                          let datenow = new Date(Date.now());
                          let idChallenges2 = datauschall[x].idChallenge;
                          let rank = x + 1;

                          if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                            await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
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

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

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

                if (postType == "vid") {
                  poin = poinViewVid;
                } else if (postType == "diary") {
                  poin = poinViewDiary;
                }
                await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                try {
                  datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                } catch (e) {
                  datapostchall = null;
                }
                if (datapostchall != null) {
                  idpostchall = datapostchall._id.toString();
                }
                try {
                  await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                } catch (e) {

                }
                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                      await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
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

  async userChallengeLike(iduser: string, idref: string, nametable: string, action: string, postID: string) {
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
    var datapostchall = null;
    var idpostchall = null;
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

        if (tagar != undefined && tagar != "") {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }

          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              var postIDpost = datatag[i].postID;
              var postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

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

                      if (postType == "vid") {
                        poin = poinViewVid;
                      } else if (postType == "diary") {
                        poin = poinViewDiary;
                      } else if (postType == "pict") {
                        poin = poinPict;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                      var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                      if (datauschall.length > 0) {
                        for (let x = 0; x < datauschall.length; x++) {

                          let iducall = datauschall[x]._id;
                          let start = new Date(datauschall[x].startDatetime);
                          let end = new Date(datauschall[x].endDatetime);
                          let datenow = new Date(Date.now());
                          let idChallenges2 = datauschall[x].idChallenge;
                          let rank = x + 1;

                          if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                            await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
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

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

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
                if (postType == "vid") {
                  poin = poinViewVid;
                } else if (postType == "diary") {
                  poin = poinViewDiary;
                } else if (postType == "pict") {
                  poin = poinPict;
                }
                await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                try {
                  datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                } catch (e) {
                  datapostchall = null;
                }
                if (datapostchall != null) {
                  idpostchall = datapostchall._id.toString();
                }
                try {
                  await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                } catch (e) {

                }
                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                      await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
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


  async userChallengeUnLike(iduser: string, idref: string, nametable: string, action: string, postID: string) {
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
    var datapostchall = null;
    var idpostchall = null;
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

        if (tagar != undefined && tagar != "") {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }

          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              var postIDpost = datatag[i].postID;
              var postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

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

                      if (postType == "vid") {
                        poin = poinViewVid;
                      } else if (postType == "diary") {
                        poin = poinViewDiary;
                      } else if (postType == "pict") {
                        poin = poinPict;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      try {
                        await this.postchallengeService.updateUnchallnge(idpostchall, poin);
                      } catch (e) {

                      }
                      var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                      if (datauschall.length > 0) {
                        for (let x = 0; x < datauschall.length; x++) {

                          let iducall = datauschall[x]._id;
                          let start = new Date(datauschall[x].startDatetime);
                          let end = new Date(datauschall[x].endDatetime);
                          let datenow = new Date(Date.now());
                          let idChallenges2 = datauschall[x].idChallenge;
                          let rank = x + 1;

                          if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                            await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
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

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

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
                if (postType == "vid") {
                  poin = poinViewVid;
                } else if (postType == "diary") {
                  poin = poinViewDiary;
                } else if (postType == "pict") {
                  poin = poinPict;
                }
                await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                try {
                  datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                } catch (e) {
                  datapostchall = null;
                }
                if (datapostchall != null) {
                  idpostchall = datapostchall._id.toString();
                }
                try {
                  await this.postchallengeService.updateUnchallnge(idpostchall, poin);
                } catch (e) {

                }
                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                      await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
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


  async userChallengeUnFollow(iduser: string, idref: string, nametable: string, action: string) {
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
    var datauserchallengeNew = null;
    var scorenegatif = null;

    try {
      datachallenge = await this.challengeService.challengeFollow();
    } catch (e) {
      datachallenge = null;
    }

    if (datachallenge !== null && datachallenge.length > 0) {
      lengchal = datachallenge.length;

      for (let i = 0; i < lengchal; i++) {
        var idChallenge = datachallenge[i]._id.toString();
        var poinFollow = datachallenge[i].poinFollow;
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
                await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poinFollow);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);

                //update score if negative
                try {
                  datauserchallengeNew = await this.userchallengesService.findOneByid(iduserchall.toString(), idsubchallenge.toString(),);
                } catch (e) {
                  datauserchallengeNew = null;
                }

                if (datauserchallengeNew !== null && datauserchallengeNew !== undefined) {
                  scorenegatif = datauserchallengeNew.score;
                } else {
                  scorenegatif = 0;
                }

                if (scorenegatif < 0) {
                  await this.userchallengesService.updateScoreNull(iduserchall.toString(), timedate);
                }
                //

                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall !== null && datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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


  async userChallengeViewv2(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].tonton[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].tonton[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }

        try {
          tagar = datachallenge[i].tagar;
        } catch (e) {
          tagar = "";
        }
        if (tagar != undefined && tagar != "") {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }

          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              var postIDpost = datatag[i].postID;
              var postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

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

                      if (postType == "vid") {
                        poin = poinViewVid;
                      } else if (postType == "diary") {
                        poin = poinViewDiary;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }


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
                          //}

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
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          try {
            datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
          } catch (e) {
            datauserchall = null;
          }

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

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

                if (postType == "vid") {
                  poin = poinViewVid;
                } else if (postType == "diary") {
                  poin = poinViewDiary;
                }
                await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                try {
                  datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                } catch (e) {
                  datapostchall = null;
                }
                if (datapostchall != null) {
                  idpostchall = datapostchall._id.toString();
                }
                try {
                  await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                } catch (e) {

                }
                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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
  async userChallengeLike2(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].suka[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].suka[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }
        try {
          poinPict = datachallenge[i].suka[0].HyppePic;
        } catch (e) {
          poinPict = 0;
        }

        try {
          tagar = datachallenge[i].tagar;
        } catch (e) {
          tagar = "";
        }

        if (tagar != undefined && tagar != "") {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              var postIDpost = datatag[i].postID;
              var postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

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

                      if (postType == "vid") {
                        poin = poinViewVid;
                      } else if (postType == "diary") {
                        poin = poinViewDiary;
                      } else if (postType == "pict") {
                        poin = poinPict;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
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
        else {
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          try {
            datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
          } catch (e) {
            datauserchall = null;
          }

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

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
                if (postType == "vid") {
                  poin = poinViewVid;
                } else if (postType == "diary") {
                  poin = poinViewDiary;
                } else if (postType == "pict") {
                  poin = poinPict;
                }
                await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                try {
                  datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                } catch (e) {
                  datapostchall = null;
                }
                if (datapostchall != null) {
                  idpostchall = datapostchall._id.toString();
                }
                try {
                  await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                } catch (e) {

                }
                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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

  async userChallengeUnLike2(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].suka[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].suka[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }
        try {
          poinPict = datachallenge[i].suka[0].HyppePic;
        } catch (e) {
          poinPict = 0;
        }

        try {
          tagar = datachallenge[i].tagar;
        } catch (e) {
          tagar = "";
        }

        if (tagar != undefined && tagar != "") {
          var tag2 = tagar.replace("#", "");
          try {
            datatag = await this.tagCountService.listag(tag2);
          } catch (e) {
            datatag = null;
          }

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          if (datatag != null && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              var postIDpost = datatag[i].postID;
              var postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

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

                      if (postType == "vid") {
                        poin = poinViewVid;
                      } else if (postType == "diary") {
                        poin = poinViewDiary;
                      } else if (postType == "pict") {
                        poin = poinPict;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      try {
                        await this.postchallengeService.updateUnchallnge(idpostchall, poin);
                      } catch (e) {

                      }
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
                          //}

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
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          try {
            datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
          } catch (e) {
            datauserchall = null;
          }

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

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
                if (postType == "vid") {
                  poin = poinViewVid;
                } else if (postType == "diary") {
                  poin = poinViewDiary;
                } else if (postType == "pict") {
                  poin = poinPict;
                }
                await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                var detail = await this.userchallengesService.findOne(iduserchall.toString());
                var activity = detail.activity;
                objintr = { "type": nametable, "id": idref, "desc": action }
                console.log(objintr)
                activity.push(objintr)
                await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                try {
                  datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                } catch (e) {
                  datapostchall = null;
                }
                if (datapostchall != null) {
                  idpostchall = datapostchall._id.toString();
                }
                try {
                  await this.postchallengeService.updateUnchallnge(idpostchall, poin);
                } catch (e) {

                }
                var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                if (datauschall.length > 0) {
                  for (let x = 0; x < datauschall.length; x++) {

                    let iducall = datauschall[x]._id;
                    let start = new Date(datauschall[x].startDatetime);
                    let end = new Date(datauschall[x].endDatetime);
                    let datenow = new Date(Date.now());
                    let idChallenges2 = datauschall[x].idChallenge;
                    let rank = x + 1;

                    // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                    await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                    //}

                  }
                }
              }
            }

          }
        }



      }


    }

  }

  async userChallengeViewv3(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
    var datapost = null;
    var createAt = null;
    var saleAmount = null;
    var postTypeParent = null;
    try {
      datapost = await this.postsService.findByPostId(postID);
    } catch (e) {
      datapost = null;
    }
    if (datapost !== null) {
      postTypeParent = datapost.postType;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].tonton[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].tonton[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
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

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }

          if (datatag != null && datatag != undefined && datatag.length > 0) {

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

                      var iduserchall = datauserchall[y]._id;
                      var idsubchallenge = datauserchall[y].idSubChallenge;
                      var idChallenges = datauserchall[y].idChallenge;
                      var start = new Date(datauserchall[y].startDatetime);
                      var end = new Date(datauserchall[y].endDatetime);
                      var datenow = new Date(Date.now());



                      if (objectChallenge == "KONTEN") {
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
                            }
                            else {
                              poin = 0;
                            }

                            await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                            await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                            var detail = await this.userchallengesService.findOne(iduserchall.toString());
                            var activity = detail.activity;
                            objintr = { "type": nametable, "id": idref, "desc": action }
                            console.log(objintr)
                            activity.push(objintr)
                            await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                            try {
                              datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                            } catch (e) {
                              datapostchall = null;
                            }
                            if (datapostchall != null) {
                              idpostchall = datapostchall._id.toString();
                            }
                            if (poin > 0) {
                              try {
                                await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                              } catch (e) {

                              }
                            }


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
                                //}

                              }
                            }


                          }
                        }
                      } else {
                        // if (saleAmount == 0) {

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
                        }
                        else {
                          poin = 0;
                        }
                        // if (datenow >= start && datenow <= end && idChallenges == idChallenge) {
                        await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                        await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                        var detail = await this.userchallengesService.findOne(iduserchall.toString());
                        var activity = detail.activity;
                        objintr = { "type": nametable, "id": idref, "desc": action }
                        console.log(objintr)
                        activity.push(objintr)
                        await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                        try {
                          datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                        } catch (e) {
                          datapostchall = null;
                        }
                        if (datapostchall != null) {
                          idpostchall = datapostchall._id.toString();
                        }
                        if (poin > 0) {
                          try {
                            await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                          } catch (e) {

                          }
                        }


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
                            //}

                          }
                        }


                      }
                      // }

                      // }


                    }
                  }

                }
              }


            }

          }

        }
        else {
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
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

                var iduserchall = datauserchall[y]._id;
                var idsubchallenge = datauserchall[y].idSubChallenge;
                var idChallenges = datauserchall[y].idChallenge;
                var start = new Date(datauserchall[y].startDatetime);
                var end = new Date(datauserchall[y].endDatetime);
                var datenow = new Date(Date.now());

                if (objectChallenge == "KONTEN") {
                  if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                    if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                      var obj = {};

                      obj = {
                        "updatedAt": datauserchall[y].updatedAt,
                        "score": datauserchall[y].score,
                        "ranking": datauserchall[y].ranking,
                      }

                      if (postTypeParent == "vid") {
                        poin = poinViewVid;
                      } else if (postTypeParent == "diary") {
                        poin = poinViewDiary;
                      } else {
                        poin = 0;
                      }

                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      let objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      if (poin > 0) {
                        try {
                          await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                        } catch (e) {

                        }
                      }
                      var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                      if (datauschall.length > 0) {
                        for (let x = 0; x < datauschall.length; x++) {

                          let iducall = datauschall[x]._id;
                          let start = new Date(datauschall[x].startDatetime);
                          let end = new Date(datauschall[x].endDatetime);
                          let datenow = new Date(Date.now());
                          let idChallenges2 = datauschall[x].idChallenge;
                          let rank = x + 1;

                          // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                          await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                          // }

                        }
                      }
                    }
                  }
                } else {
                  // if (saleAmount == 0) {


                  var obj = {};

                  obj = {
                    "updatedAt": datauserchall[y].updatedAt,
                    "score": datauserchall[y].score,
                    "ranking": datauserchall[y].ranking,
                  }

                  if (postTypeParent == "vid") {
                    poin = poinViewVid;
                  } else if (postTypeParent == "diary") {
                    poin = poinViewDiary;
                  } else {
                    poin = 0;
                  }
                  // if (datenow >= start && datenow <= end && idChallenges == idChallenge) {
                  await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                  await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                  var detail = await this.userchallengesService.findOne(iduserchall.toString());
                  var activity = detail.activity;
                  let objintr = { "type": nametable, "id": idref, "desc": action }
                  console.log(objintr)
                  activity.push(objintr)
                  await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                  try {
                    datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                  } catch (e) {
                    datapostchall = null;
                  }
                  if (datapostchall != null) {
                    idpostchall = datapostchall._id.toString();
                  }
                  if (poin > 0) {
                    try {
                      await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                    } catch (e) {

                    }
                  }
                  var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                  if (datauschall.length > 0) {
                    for (let x = 0; x < datauschall.length; x++) {

                      let iducall = datauschall[x]._id;
                      let start = new Date(datauschall[x].startDatetime);
                      let end = new Date(datauschall[x].endDatetime);
                      let datenow = new Date(Date.now());
                      let idChallenges2 = datauschall[x].idChallenge;
                      let rank = x + 1;

                      // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                      await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                      // }

                    }
                  }
                  // }
                  //}
                }
              }
            }
          }
        }

      }

    }

  }

  async userChallengeLike3(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
    var datapost = null;
    var createAt = null;
    var saleAmount = null;
    var postTypeParent = null;
    try {
      datapost = await this.postsService.findByPostId(postID);
    } catch (e) {
      datapost = null;
    }
    if (datapost !== null) {
      postTypeParent = datapost.postType;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].suka[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].suka[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }
        try {
          poinPict = datachallenge[i].suka[0].HyppePic;
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

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
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

                      var iduserchall = datauserchall[y]._id;
                      var idsubchallenge = datauserchall[y].idSubChallenge;
                      var idChallenges = datauserchall[y].idChallenge;
                      var start = new Date(datauserchall[y].startDatetime);
                      var end = new Date(datauserchall[y].endDatetime);
                      var datenow = new Date(Date.now());



                      if (objectChallenge == "KONTEN") {
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
                            else {
                              poin = 0;
                            }
                            await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                            await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                            var detail = await this.userchallengesService.findOne(iduserchall.toString());
                            var activity = detail.activity;
                            objintr = { "type": nametable, "id": idref, "desc": action }
                            console.log(objintr)
                            activity.push(objintr)
                            await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                            try {
                              datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                            } catch (e) {
                              datapostchall = null;
                            }
                            if (datapostchall != null) {
                              idpostchall = datapostchall._id.toString();
                            }
                            if (poin > 0) {
                              try {
                                await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                              } catch (e) {

                              }
                            }


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
                                //}

                              }
                            }


                          }
                        }
                      } else {
                        // if (saleAmount == 0) {
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
                          } else {
                            poin = 0;
                          }
                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                          await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                          var detail = await this.userchallengesService.findOne(iduserchall.toString());
                          var activity = detail.activity;
                          objintr = { "type": nametable, "id": idref, "desc": action }
                          console.log(objintr)
                          activity.push(objintr)
                          await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                          try {
                            datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                          } catch (e) {
                            datapostchall = null;
                          }
                          if (datapostchall != null) {
                            idpostchall = datapostchall._id.toString();
                          }
                          if (poin > 0) {
                            try {
                              await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                            } catch (e) {

                            }
                          }


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
                              //}

                            }
                          }


                        }
                        //}

                      }


                    }

                  }
                }
              }


            }

          }

        }
        else {
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
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

                var iduserchall = datauserchall[y]._id;
                var idsubchallenge = datauserchall[y].idSubChallenge;
                var idChallenges = datauserchall[y].idChallenge;
                var start = new Date(datauserchall[y].startDatetime);
                var end = new Date(datauserchall[y].endDatetime);
                var datenow = new Date(Date.now());

                if (objectChallenge == "KONTEN") {
                  if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                    if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                      var obj = {};

                      obj = {
                        "updatedAt": datauserchall[y].updatedAt,
                        "score": datauserchall[y].score,
                        "ranking": datauserchall[y].ranking,
                      }

                      if (postTypeParent == "vid") {
                        poin = poinViewVid;
                      } else if (postTypeParent == "diary") {
                        poin = poinViewDiary;
                      } else if (postTypeParent == "pict") {
                        poin = poinPict;
                      }
                      else {
                        poin = 0;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      let objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      if (poin > 0) {
                        try {
                          await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                        } catch (e) {

                        }
                      }
                      var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                      if (datauschall.length > 0) {
                        for (let x = 0; x < datauschall.length; x++) {

                          let iducall = datauschall[x]._id;
                          let start = new Date(datauschall[x].startDatetime);
                          let end = new Date(datauschall[x].endDatetime);
                          let datenow = new Date(Date.now());
                          let idChallenges2 = datauschall[x].idChallenge;
                          let rank = x + 1;

                          // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                          await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                          // }

                        }
                      }
                    }
                  }
                } else {
                  // if (saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }

                    if (postTypeParent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeParent == "diary") {
                      poin = poinViewDiary;
                    } else if (postTypeParent == "pict") {
                      poin = poinPict;
                    } else {
                      poin = 0;
                    }
                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                    await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                    var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    var activity = detail.activity;
                    let objintr = { "type": nametable, "id": idref, "desc": action }
                    console.log(objintr)
                    activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
                    try {
                      datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                    } catch (e) {
                      datapostchall = null;
                    }
                    if (datapostchall != null) {
                      idpostchall = datapostchall._id.toString();
                    }
                    if (poin > 0) {
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                    }
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {

                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;

                        // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                        await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                        // }

                      }
                    }
                  }
                  // }
                }
              }
            }
          }
        }

      }

    }

  }

  async userChallengeUnLike3(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
    var datapost = null;
    var createAt = null;
    var saleAmount = null;
    var datauserchallengeNew = null;
    var scorenegatif = null;
    var postTypeParent = null;
    try {
      datapost = await this.postsService.findByPostId(postID);
    } catch (e) {
      datapost = null;
    }
    if (datapost !== null) {
      postTypeParent = datapost.postType;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].suka[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].suka[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }
        try {
          poinPict = datachallenge[i].suka[0].HyppePic;
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

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
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

                      var iduserchall = datauserchall[y]._id;
                      var idsubchallenge = datauserchall[y].idSubChallenge;
                      var idChallenges = datauserchall[y].idChallenge;
                      var start = new Date(datauserchall[y].startDatetime);
                      var end = new Date(datauserchall[y].endDatetime);
                      var datenow = new Date(Date.now());



                      if (objectChallenge == "KONTEN") {
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
                            } else {
                              poin = 0;
                            }

                            await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                            await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                            var detail = await this.userchallengesService.findOne(iduserchall.toString());
                            var activity = detail.activity;
                            objintr = { "type": nametable, "id": idref, "desc": action }
                            console.log(objintr)
                            activity.push(objintr)
                            await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);


                            //update score if negative
                            try {
                              datauserchallengeNew = await this.userchallengesService.findOneByid(iduserchall.toString(), idsubchallenge.toString(),);
                            } catch (e) {
                              datauserchallengeNew = null;
                            }

                            if (datauserchallengeNew !== null && datauserchallengeNew !== undefined) {
                              scorenegatif = datauserchallengeNew.score;
                            } else {
                              scorenegatif = 0;
                            }

                            if (scorenegatif < 0) {
                              await this.userchallengesService.updateScoreNull(iduserchall.toString(), timedate);
                            }
                            //
                            try {
                              datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                            } catch (e) {
                              datapostchall = null;
                            }
                            if (datapostchall != null) {
                              idpostchall = datapostchall._id.toString();
                            }
                            if (poin > 0) {
                              try {
                                await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                              } catch (e) {

                              }
                            }

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
                                //}

                              }
                            }


                          }
                        }
                      } else {
                        //if (saleAmount == 0) {
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
                          } else {
                            poin = 0;
                          }
                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                          await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                          var detail = await this.userchallengesService.findOne(iduserchall.toString());
                          var activity = detail.activity;
                          objintr = { "type": nametable, "id": idref, "desc": action }
                          console.log(objintr)
                          activity.push(objintr)
                          await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);

                          //update score if negative
                          try {
                            datauserchallengeNew = await this.userchallengesService.findOneByid(iduserchall.toString(), idsubchallenge.toString(),);
                          } catch (e) {
                            datauserchallengeNew = null;
                          }

                          if (datauserchallengeNew !== null && datauserchallengeNew !== undefined) {
                            scorenegatif = datauserchallengeNew.score;
                          } else {
                            scorenegatif = 0;
                          }

                          if (scorenegatif < 0) {
                            await this.userchallengesService.updateScoreNull(iduserchall.toString(), timedate);
                          }
                          //
                          try {
                            datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                          } catch (e) {
                            datapostchall = null;
                          }
                          if (datapostchall != null) {
                            idpostchall = datapostchall._id.toString();
                          }
                          if (poin > 0) {
                            try {
                              await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                            } catch (e) {

                            }
                          }


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
                              //}

                            }
                          }


                        }
                        // }

                      }


                    }
                  }

                }
              }


            }

          }

        }
        else {
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
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

                var iduserchall = datauserchall[y]._id;
                var idsubchallenge = datauserchall[y].idSubChallenge;
                var idChallenges = datauserchall[y].idChallenge;
                var start = new Date(datauserchall[y].startDatetime);
                var end = new Date(datauserchall[y].endDatetime);
                var datenow = new Date(Date.now());

                if (objectChallenge == "KONTEN") {
                  if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                    if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                      var obj = {};

                      obj = {
                        "updatedAt": datauserchall[y].updatedAt,
                        "score": datauserchall[y].score,
                        "ranking": datauserchall[y].ranking,
                      }

                      if (postTypeParent == "vid") {
                        poin = poinViewVid;
                      } else if (postTypeParent == "diary") {
                        poin = poinViewDiary;
                      } else if (postTypeParent == "pict") {
                        poin = poinPict;
                      }
                      else {
                        poin = 0;
                      }
                      await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                      await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                      var detail = await this.userchallengesService.findOne(iduserchall.toString());
                      var activity = detail.activity;
                      let objintr = { "type": nametable, "id": idref, "desc": action }
                      console.log(objintr)
                      activity.push(objintr)
                      await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);

                      //update score if negative
                      try {
                        datauserchallengeNew = await this.userchallengesService.findOneByid(iduserchall.toString(), idsubchallenge.toString(),);
                      } catch (e) {
                        datauserchallengeNew = null;
                      }

                      if (datauserchallengeNew !== null && datauserchallengeNew !== undefined) {
                        scorenegatif = datauserchallengeNew.score;
                      } else {
                        scorenegatif = 0;
                      }

                      if (scorenegatif < 0) {
                        await this.userchallengesService.updateScoreNull(iduserchall.toString(), timedate);
                      }
                      //
                      try {
                        datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                      } catch (e) {
                        datapostchall = null;
                      }
                      if (datapostchall != null) {
                        idpostchall = datapostchall._id.toString();
                      }
                      if (poin > 0) {
                        try {
                          await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                        } catch (e) {

                        }
                      }
                      var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                      if (datauschall.length > 0) {
                        for (let x = 0; x < datauschall.length; x++) {

                          let iducall = datauschall[x]._id;
                          let start = new Date(datauschall[x].startDatetime);
                          let end = new Date(datauschall[x].endDatetime);
                          let datenow = new Date(Date.now());
                          let idChallenges2 = datauschall[x].idChallenge;
                          let rank = x + 1;

                          // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                          await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                          // }

                        }
                      }
                    }
                  }
                } else {
                  // if (saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }

                    if (postTypeParent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeParent == "diary") {
                      poin = poinViewDiary;
                    } else if (postTypeParent == "pict") {
                      poin = poinPict;
                    } else {
                      poin = 0;
                    }
                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                    await this.userchallengesService.updateUnUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
                    var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    var activity = detail.activity;
                    let objintr = { "type": nametable, "id": idref, "desc": action }
                    console.log(objintr)
                    activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);

                    //update score if negative
                    try {
                      datauserchallengeNew = await this.userchallengesService.findOneByid(iduserchall.toString(), idsubchallenge.toString(),);
                    } catch (e) {
                      datauserchallengeNew = null;
                    }

                    if (datauserchallengeNew !== null && datauserchallengeNew !== undefined) {
                      scorenegatif = datauserchallengeNew.score;
                    } else {
                      scorenegatif = 0;
                    }

                    if (scorenegatif < 0) {
                      await this.userchallengesService.updateScoreNull(iduserchall.toString(), timedate);
                    }
                    //
                    try {
                      datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                    } catch (e) {
                      datapostchall = null;
                    }
                    if (datapostchall != null) {
                      idpostchall = datapostchall._id.toString();
                    }
                    if (poin > 0) {
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                    }
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {

                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;

                        // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                        await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                        // }

                      }
                    }
                  }
                  //}
                }
              }

            }
          }
        }

      }

    }

  }

  // async userChallengeLike3new(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
  //   const mongoose = require('mongoose');
  //   var ObjectId = require('mongodb').ObjectId;

  //   var dt = new Date(Date.now());
  //   dt.setHours(dt.getHours() + 7); // timestamp
  //   dt = new Date(dt);

  //   var strdate = dt.toISOString();
  //   var repdate = strdate.replace('T', ' ');
  //   var splitdate = repdate.split('.');
  //   var timedate = splitdate[0];
  //   var lengchal = null;
  //   var datauserchall = null;
  //   var datachallenge = null;
  //   var arrdata = [];
  //   var objintr = {};
  //   var datasubchallenge = null;
  //   var poin = null;
  //   var datatag = null;
  //   var poinViewVid = null;
  //   var poinViewDiary = null;
  //   var poinPict = null;
  //   var tagar = null;
  //   var datapostchall = null;
  //   var idpostchall = null;
  //   var databasic = null;
  //   var objectChallenge = null;
  //   var iduser = null;
  //   var datapost = null;
  //   var createAt = null;
  //   var saleAmount = null;
  //   var tonton = null;
  //   var postTypeParent = null;
  //   var datapoint=null;
  //   try {
  //     datapost = await this.postsService.findByPostId(postID);
  //   } catch (e) {
  //     datapost = null;
  //   }
  //   if (datapost !== null) {
  //     postTypeParent = datapost.postType;
  //     createAt = datapost.createdAt;
  //     if (datapost.saleAmount !== undefined) {
  //       saleAmount = datapost.saleAmount;
  //     } else {
  //       saleAmount = 0;
  //     }
  //   }
  //   try {
  //     datachallenge = await this.challengeService.challengeKonten();
  //   } catch (e) {
  //     datachallenge = null;
  //   }

  //   if (datachallenge !== null && datachallenge.length > 0) {
  //     lengchal = datachallenge.length;

  //     for (let i = 0; i < lengchal; i++) {
  //       var idChallenge = datachallenge[i]._id.toString();
  //       try {
  //         tonton = datachallenge[i].tonton;
  //       } catch (e) {
  //         tonton = null;
  //       }

  //       try {
  //         objectChallenge = datachallenge[i].objectChallenge;
  //       } catch (e) {
  //         objectChallenge = null;
  //       }

  //       try {
  //         poinViewVid = datachallenge[i].suka[0].HyppeVid;
  //       } catch (e) {
  //         poinViewVid = 0;
  //       }

  //       try {
  //         poinViewDiary = datachallenge[i].suka[0].HyppeDiary;
  //       } catch (e) {
  //         poinViewDiary = 0;
  //       }
  //       try {
  //         poinPict = datachallenge[i].suka[0].HyppePic;
  //       } catch (e) {
  //         poinPict = 0;
  //       }


  //       try {
  //         tagar = datachallenge[i].tagar;
  //       } catch (e) {
  //         tagar = "";
  //       }
  //       if (tagar != undefined && tagar != "" && tagar.length > 0) {

  //         try {
  //           datatag = await this.tagCountService.listag(tagar);
  //         } catch (e) {
  //           datatag = null;
  //         }

  //         if (objectChallenge == "AKUN") {
  //           try {
  //             databasic = await this.userbasicsService.findOne(emailuser);
  //             iduser = databasic._id;
  //           } catch (e) {
  //             databasic = null;
  //           }

  //         } else {
  //           try {
  //             databasic = await this.userbasicsService.findOne(emailreceiver);
  //             iduser = databasic._id;
  //           } catch (e) {
  //             databasic = null;
  //           }
  //         }

  //         if (datatag != null && datatag.length > 0) {

  //           for (let i = 0; i < datatag.length; i++) {
  //             let postIDpost = datatag[i].postID;
  //             let postType = datatag[i].postType;

  //             if (postIDpost == postID) {
  //               try {
  //                 datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
  //               } catch (e) {
  //                 datauserchall = null;
  //               }

  //               if (datauserchall.length > 0) {


  //                 for (let y = 0; y < datauserchall.length; y++) {

  //                   var iduserchall = datauserchall[y]._id;
  //                   var idsubchallenge = datauserchall[y].idSubChallenge;
  //                   var idChallenges = datauserchall[y].idChallenge;
  //                   var start = new Date(datauserchall[y].startDatetime);
  //                   var end = new Date(datauserchall[y].endDatetime);
  //                   var datenow = new Date(Date.now());
  //                   var startdate = datauserchall[y].startDatetime
  //                   var enddate = datauserchall[y].endDatetime;




  //                   if (objectChallenge == "KONTEN") {
  //                     if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
  //                       if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

  //                         var obj = {};

  //                         obj = {
  //                           "updatedAt": datauserchall[y].updatedAt,
  //                           "score": datauserchall[y].score,
  //                           "ranking": datauserchall[y].ranking,
  //                         }

  //                         if (postType == "vid") {
  //                           poin = poinViewVid;
  //                         } else if (postType == "diary") {
  //                           poin = poinViewDiary;
  //                         } else if (postType == "pict") {
  //                           poin = poinPict;
  //                         }

  //                         await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
  //                         await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
  //                         var detail = await this.userchallengesService.findOne(iduserchall.toString());
  //                         var activity = detail.activity;
  //                         objintr = { "type": nametable, "id": idref, "desc": action }
  //                         console.log(objintr)
  //                         activity.push(objintr)
  //                         await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
  //                         try {
  //                           datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
  //                         } catch (e) {
  //                           datapostchall = null;
  //                         }
  //                         if (datapostchall != null) {
  //                           idpostchall = datapostchall._id.toString();
  //                         }

  //                         // let totalAll = null;
  //                         // let dataViewevent = null;
  //                         // let totalview = null;
  //                         // try {
  //                         //   dataViewevent = await this.contenteventsService.findViewed(postID, startdate, enddate);
  //                         // } catch (e) {
  //                         //   dataViewevent = null;
  //                         // }

  //                         // if (tonton !== undefined && tonton !== null && tonton.length > 0) {
  //                         //   if (dataViewevent !== null && dataViewevent !== undefined) {
  //                         //     totalview = dataViewevent[0].myCount;
  //                         //   } else {
  //                         //     totalview = 0;
  //                         //   }
  //                         // } else {
  //                         //   totalview = 0;
  //                         // }


  //                         // let dataLikeevent = null;
  //                         // let total = null;
  //                         // try {
  //                         //   dataLikeevent = await this.contenteventsService.findLiked(postID, startdate, enddate);
  //                         // } catch (e) {
  //                         //   dataLikeevent = null;
  //                         // }

  //                         // if (dataLikeevent !== null && dataLikeevent !== undefined) {
  //                         //   total = dataLikeevent[0].myCount;
  //                         // } else {
  //                         //   total = 0;
  //                         // }
  //                         // totalAll = total + totalview;
  //                         // if (poin > 0) {
  //                         //   try {

  //                         //     await this.postchallengeService.updatePostchallenge2(idpostchall, timedate, (poin * totalAll));
  //                         //   } catch (e) {

  //                         //   }
  //                         // }


  //                         var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

  //                         if (datauschall.length > 0) {
  //                           for (let x = 0; x < datauschall.length; x++) {

  //                             let iducall = datauschall[x]._id;
  //                             let start = new Date(datauschall[x].startDatetime);
  //                             let end = new Date(datauschall[x].endDatetime);
  //                             let datenow = new Date(Date.now());
  //                             let idChallenges2 = datauschall[x].idChallenge;
  //                             let rank = x + 1;

  //                             //if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
  //                             await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
  //                             //}

  //                           }
  //                         }


  //                       }
  //                     }
  //                   } else {
  //                     if (saleAmount == 0) {
  //                       if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

  //                         var obj = {};

  //                         obj = {
  //                           "updatedAt": datauserchall[y].updatedAt,
  //                           "score": datauserchall[y].score,
  //                           "ranking": datauserchall[y].ranking,
  //                         }
  //                         if (postType == "vid") {
  //                           poin = poinViewVid;
  //                         } else if (postType == "diary") {
  //                           poin = poinViewDiary;
  //                         } else if (postType == "pict") {
  //                           poin = poinPict;
  //                         }
  //                         await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
  //                         await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
  //                         var detail = await this.userchallengesService.findOne(iduserchall.toString());
  //                         var activity = detail.activity;
  //                         objintr = { "type": nametable, "id": idref, "desc": action }
  //                         console.log(objintr)
  //                         activity.push(objintr)
  //                         await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
  //                         try {
  //                           datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
  //                         } catch (e) {
  //                           datapostchall = null;
  //                         }
  //                         if (datapostchall != null) {
  //                           idpostchall = datapostchall._id.toString();
  //                         }

  //                         let totalAll = null;
  //                         let dataViewevent = null;
  //                         let totalview = null;
  //                         try {
  //                           dataViewevent = await this.contenteventsService.findViewed(postID, startdate, enddate);
  //                         } catch (e) {
  //                           dataViewevent = null;
  //                         }

  //                         if (tonton !== undefined && tonton !== null && tonton.length > 0) {
  //                           if (dataViewevent !== null && dataViewevent !== undefined) {
  //                             totalview = dataViewevent[0].myCount;
  //                           } else {
  //                             totalview = 0;
  //                           }
  //                         } else {
  //                           totalview = 0;
  //                         }


  //                         let dataLikeevent = null;
  //                         let total = null;
  //                         try {
  //                           dataLikeevent = await this.contenteventsService.findLiked(postID, startdate, enddate);
  //                         } catch (e) {
  //                           dataLikeevent = null;
  //                         }

  //                         if (dataLikeevent !== null && dataLikeevent !== undefined) {
  //                           total = dataLikeevent[0].myCount;
  //                         } else {
  //                           total = 0;
  //                         }
  //                         totalAll = total + totalview;
  //                         if (poin > 0) {
  //                           try {

  //                             await this.postchallengeService.updatePostchallenge2(idpostchall, timedate, (poin * totalAll));
  //                           } catch (e) {

  //                           }
  //                         }


  //                         var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

  //                         if (datauschall.length > 0) {
  //                           for (let x = 0; x < datauschall.length; x++) {

  //                             let iducall = datauschall[x]._id;
  //                             let start = new Date(datauschall[x].startDatetime);
  //                             let end = new Date(datauschall[x].endDatetime);
  //                             let datenow = new Date(Date.now());
  //                             let idChallenges2 = datauschall[x].idChallenge;
  //                             let rank = x + 1;

  //                             //if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
  //                             await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
  //                             //}

  //                           }
  //                         }


  //                       }
  //                     }

  //                   }


  //                 }


  //               }
  //             }


  //           }

  //         }

  //       }
  //       else {
  //         if (objectChallenge == "AKUN") {
  //           try {
  //             databasic = await this.userbasicsService.findOne(emailuser);
  //             iduser = databasic._id;
  //           } catch (e) {
  //             databasic = null;
  //           }

  //         } else {
  //           try {
  //             databasic = await this.userbasicsService.findOne(emailreceiver);
  //             iduser = databasic._id;
  //           } catch (e) {
  //             databasic = null;
  //           }
  //         }
  //         try {
  //           datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
  //         } catch (e) {
  //           datauserchall = null;
  //         }

  //         if (datauserchall !== null && datauserchall.length > 0) {


  //           for (let y = 0; y < datauserchall.length; y++) {

  //             var iduserchall = datauserchall[y]._id;
  //             var idsubchallenge = datauserchall[y].idSubChallenge;
  //             var idChallenges = datauserchall[y].idChallenge;
  //             var start = new Date(datauserchall[y].startDatetime);
  //             var end = new Date(datauserchall[y].endDatetime);
  //             var datenow = new Date(Date.now());
  //             var startdate = datauserchall[y].startDatetime
  //             var enddate = datauserchall[y].endDatetime;
  //             if (objectChallenge == "KONTEN") {
  //               if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
  //                 if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

  //                   var obj = {};

  //                   obj = {
  //                     "updatedAt": datauserchall[y].updatedAt,
  //                     "score": datauserchall[y].score,
  //                     "ranking": datauserchall[y].ranking,
  //                   }

  //                   if (postTypeParent == "vid") {
  //                     poin = poinViewVid;
  //                   } else if (postTypeParent == "diary") {
  //                     poin = poinViewDiary;
  //                   } else if (postTypeParent == "pict") {
  //                     poin = poinPict;
  //                   }

  //                   await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
  //                   await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
  //                   var detail = await this.userchallengesService.findOne(iduserchall.toString());
  //                   var activity = detail.activity;
  //                   let objintr = { "type": nametable, "id": idref, "desc": action }
  //                   console.log(objintr)
  //                   activity.push(objintr)
  //                   await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
  //                   try {
  //                     datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
  //                   } catch (e) {
  //                     datapostchall = null;
  //                   }
  //                   if (datapostchall != null) {
  //                     idpostchall = datapostchall._id.toString();
  //                   }
  //                   let totalAll = null;
  //                   let dataViewevent = null;
  //                   let totalview = null;
  //                   try {
  //                     dataViewevent = await this.contenteventsService.findViewed(postID, startdate, enddate);
  //                   } catch (e) {
  //                     dataViewevent = null;
  //                   }

  //                   if (tonton !== undefined && tonton !== null && tonton.length > 0) {
  //                     if (dataViewevent !== null && dataViewevent !== undefined) {
  //                       totalview = dataViewevent[0].myCount;
  //                     } else {
  //                       totalview = 0;
  //                     }
  //                   } else {
  //                     totalview = 0;
  //                   }


  //                   let dataLikeevent = null;
  //                   let total = null;
  //                   try {
  //                     dataLikeevent = await this.contenteventsService.findLiked(postID, startdate, enddate);
  //                   } catch (e) {
  //                     dataLikeevent = null;
  //                   }

  //                   if (dataLikeevent !== null && dataLikeevent !== undefined) {
  //                     total = dataLikeevent[0].myCount;
  //                   } else {
  //                     total = 0;
  //                   }
  //                   totalAll = total + totalview;
  //                   if (poin > 0) {
  //                     try {

  //                       await this.postchallengeService.updatePostchallenge2(idpostchall, timedate, (poin * totalAll));
  //                     } catch (e) {

  //                     }
  //                   }
  //                   var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

  //                   if (datauschall.length > 0) {
  //                     for (let x = 0; x < datauschall.length; x++) {

  //                       let iducall = datauschall[x]._id;
  //                       let start = new Date(datauschall[x].startDatetime);
  //                       let end = new Date(datauschall[x].endDatetime);
  //                       let datenow = new Date(Date.now());
  //                       let idChallenges2 = datauschall[x].idChallenge;
  //                       let rank = x + 1;

  //                       // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
  //                       await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
  //                       // }

  //                     }
  //                   }
  //                 }
  //               }
  //             } else {
  //               if (saleAmount == 0) {
  //                 if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

  //                   var obj = {};

  //                   obj = {
  //                     "updatedAt": datauserchall[y].updatedAt,
  //                     "score": datauserchall[y].score,
  //                     "ranking": datauserchall[y].ranking,
  //                   }

  //                   if (postTypeParent == "vid") {
  //                     poin = poinViewVid;
  //                   } else if (postTypeParent == "diary") {
  //                     poin = poinViewDiary;
  //                   } else if (postTypeParent == "pict") {
  //                     poin = poinPict;
  //                   }
  //                   await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
  //                   await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), poin);
  //                   var detail = await this.userchallengesService.findOne(iduserchall.toString());
  //                   var activity = detail.activity;
  //                   let objintr = { "type": nametable, "id": idref, "desc": action }
  //                   console.log(objintr)
  //                   activity.push(objintr)
  //                   await this.userchallengesService.updateActivity(iduserchall.toString(), activity, timedate);
  //                   try {
  //                     datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
  //                   } catch (e) {
  //                     datapostchall = null;
  //                   }
  //                   if (datapostchall != null) {
  //                     idpostchall = datapostchall._id.toString();
  //                   }
  //                   let totalAll = null;
  //                   let dataViewevent = null;
  //                   let totalview = null;
  //                   try {
  //                     dataViewevent = await this.contenteventsService.findViewed(postID, startdate, enddate);
  //                   } catch (e) {
  //                     dataViewevent = null;
  //                   }

  //                   if (tonton !== undefined && tonton !== null && tonton.length > 0) {
  //                     if (dataViewevent !== null && dataViewevent !== undefined) {
  //                       totalview = dataViewevent[0].myCount;
  //                     } else {
  //                       totalview = 0;
  //                     }
  //                   } else {
  //                     totalview = 0;
  //                   }


  //                   let dataLikeevent = null;
  //                   let total = null;
  //                   try {
  //                     dataLikeevent = await this.contenteventsService.findLiked(postID, startdate, enddate);
  //                   } catch (e) {
  //                     dataLikeevent = null;
  //                   }

  //                   if (dataLikeevent !== null && dataLikeevent !== undefined) {
  //                     total = dataLikeevent[0].myCount;
  //                   } else {
  //                     total = 0;
  //                   }
  //                   totalAll = total + totalview;
  //                   if (poin > 0) {
  //                     try {

  //                       await this.postchallengeService.updatePostchallenge2(idpostchall, timedate, (poin * totalAll));
  //                     } catch (e) {

  //                     }
  //                   }
  //                   var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

  //                   if (datauschall.length > 0) {
  //                     for (let x = 0; x < datauschall.length; x++) {

  //                       let iducall = datauschall[x]._id;
  //                       let start = new Date(datauschall[x].startDatetime);
  //                       let end = new Date(datauschall[x].endDatetime);
  //                       let datenow = new Date(Date.now());
  //                       let idChallenges2 = datauschall[x].idChallenge;
  //                       let rank = x + 1;

  //                       // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
  //                       await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
  //                       // }

  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }

  //         }
  //       }

  //     }

  //   }

  // }
  async userChallengeLike3Newpoin(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
    var datapost = null;
    var createAt = null;
    var saleAmount = null;
    var postTypeParent = null;
    var datapoin = null;
    var totalscor = null;
    var scoreLike = null;
    var scorePost = null;
    var scoreView = null;
    var event = null;
    try {
      datapost = await this.postsService.findByPostId(postID);
    } catch (e) {
      datapost = null;
    }
    if (datapost !== null) {
      postTypeParent = datapost.postType;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].suka[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].suka[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
        }
        try {
          poinPict = datachallenge[i].suka[0].HyppePic;
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

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
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

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {

                    var iduserchall = datauserchall[y]._id;
                    var userid = datauserchall[y].idUser;
                    var idsubchallenge = datauserchall[y].idSubChallenge;
                    var idChallenges = datauserchall[y].idChallenge;
                    var start = new Date(datauserchall[y].startDatetime);
                    var end = new Date(datauserchall[y].endDatetime);
                    var datenow = new Date(Date.now());


                    const databasic = await this.userbasicsService.findbyid(
                      userid.toString()
                    );
                    var email = databasic.email;
                    try {
                      datapoin = await this.subChallengeService.getPoinchallenge(idsubchallenge.toString(), email.toString());
                    } catch (e) {
                      datapoin = null;
                    }
                    console.log(datapoin)

                    if (datapoin !== null) {

                      try {
                        scoreLike = datapoin.scoreLike;
                      } catch (e) {
                        scoreLike = 0;
                      }

                      try {
                        scorePost = datapoin.scorePost;
                      } catch (e) {
                        scorePost = 0;
                      }

                      try {
                        scoreView = datapoin.scoreView;
                      } catch (e) {
                        scoreView = 0;
                      }



                      try {
                        event = datapoin.event;
                      } catch (e) {
                        event = [];
                      }
                    }
                    if (event == null) {
                      event = [];
                    }
                    if (scoreView == null) {
                      scoreView = 0;
                    }
                    if (scoreLike == null) {
                      scoreLike = 0;
                    }
                    if (scorePost == null) {
                      scorePost = 0;
                    }
                    totalscor = scoreLike + scorePost + scoreView;

                    if (totalscor == null) {
                      totalscor = 0;
                    }

                    if (objectChallenge == "KONTEN") {
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
                          await this.userchallengesService.updateScoring(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);

                          // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                          // var activity = detail.activity;
                          // objintr = { "type": nametable, "id": idref, "desc": action }
                          // console.log(objintr)
                          // activity.push(objintr)
                          await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                          try {
                            datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                          } catch (e) {
                            datapostchall = null;
                          }
                          if (datapostchall != null) {
                            idpostchall = datapostchall._id.toString();
                          }
                          if (poin > 0) {
                            try {
                              await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                            } catch (e) {

                            }
                          }


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
                              //}

                            }
                          }


                        }
                      }
                    } else {
                      if (saleAmount == 0) {
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
                          await this.userchallengesService.updateScoring(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);

                          // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                          // var activity = detail.activity;
                          // objintr = { "type": nametable, "id": idref, "desc": action }
                          // console.log(objintr)
                          // activity.push(objintr)
                          await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                          try {
                            datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                          } catch (e) {
                            datapostchall = null;
                          }
                          if (datapostchall != null) {
                            idpostchall = datapostchall._id.toString();
                          }
                          if (poin > 0) {
                            try {
                              await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                            } catch (e) {

                            }
                          }

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
                              //}

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
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          try {
            datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
          } catch (e) {
            datauserchall = null;
          }

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {

              var iduserchall = datauserchall[y]._id;
              var userid = datauserchall[y].idUser;
              var idsubchallenge = datauserchall[y].idSubChallenge;
              var idChallenges = datauserchall[y].idChallenge;
              var start = new Date(datauserchall[y].startDatetime);
              var end = new Date(datauserchall[y].endDatetime);
              var datenow = new Date(Date.now());


              const databasic = await this.userbasicsService.findbyid(
                userid.toString()
              );
              var email = databasic.email;
              try {
                datapoin = await this.subChallengeService.getPoinchallenge(idsubchallenge.toString(), email.toString());
              } catch (e) {
                datapoin = null;
              }
              console.log(datapoin)

              if (datapoin !== null) {

                try {
                  scoreLike = datapoin.scoreLike;
                } catch (e) {
                  scoreLike = 0;
                }

                try {
                  scorePost = datapoin.scorePost;
                } catch (e) {
                  scorePost = 0;
                }

                try {
                  scoreView = datapoin.scoreView;
                } catch (e) {
                  scoreView = 0;
                }



                try {
                  event = datapoin.event;
                } catch (e) {
                  event = [];
                }
              }
              if (event == null) {
                event = [];
              }
              if (scoreView == null) {
                scoreView = 0;
              }
              if (scoreLike == null) {
                scoreLike = 0;
              }
              if (scorePost == null) {
                scorePost = 0;
              }
              totalscor = scoreLike + scorePost + scoreView;

              if (totalscor == null) {
                totalscor = 0;
              }

              if (objectChallenge == "KONTEN") {
                if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }

                    if (postTypeParent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeParent == "diary") {
                      poin = poinViewDiary;
                    } else if (postTypeParent == "pict") {
                      poin = poinPict;
                    }

                    await this.userchallengesService.updateScoring(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);

                    // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    // var activity = detail.activity;
                    // objintr = { "type": nametable, "id": idref, "desc": action }
                    // console.log(objintr)
                    // activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                    try {
                      datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                    } catch (e) {
                      datapostchall = null;
                    }
                    if (datapostchall != null) {
                      idpostchall = datapostchall._id.toString();
                    }
                    if (poin > 0) {
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                    }
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {

                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;

                        // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                        await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                        // }

                      }
                    }
                  }
                }
              } else {
                if (saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }

                    if (postTypeParent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeParent == "diary") {
                      poin = poinViewDiary;
                    } else if (postTypeParent == "pict") {
                      poin = poinPict;
                    }
                    await this.userchallengesService.updateScoring(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);

                    // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    // var activity = detail.activity;
                    // objintr = { "type": nametable, "id": idref, "desc": action }
                    // console.log(objintr)
                    // activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                    try {
                      datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                    } catch (e) {
                      datapostchall = null;
                    }
                    if (datapostchall != null) {
                      idpostchall = datapostchall._id.toString();
                    }
                    if (poin > 0) {
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                    }
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {

                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;

                        // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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

  async userChallengeViewv3Newpoin(idref: string, nametable: string, action: string, postID: string, emailuser: string, emailreceiver: string) {
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
    var datapostchall = null;
    var idpostchall = null;
    var databasic = null;
    var objectChallenge = null;
    var iduser = null;
    var datapost = null;
    var createAt = null;
    var saleAmount = null;
    var postTypeParent = null;
    var datapoin = null;
    var totalscor = null;
    var scoreLike = null;
    var scorePost = null;
    var scoreView = null;
    var event = null;
    try {
      datapost = await this.postsService.findByPostId(postID);
    } catch (e) {
      datapost = null;
    }
    if (datapost !== null) {
      postTypeParent = datapost.postType;
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
          objectChallenge = datachallenge[i].objectChallenge;
        } catch (e) {
          objectChallenge = null;
        }

        try {
          poinViewVid = datachallenge[i].tonton[0].HyppeVid;
        } catch (e) {
          poinViewVid = 0;
        }

        try {
          poinViewDiary = datachallenge[i].tonton[0].HyppeDiary;
        } catch (e) {
          poinViewDiary = 0;
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

          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }

          if (datatag != null && datatag != undefined && datatag.length > 0) {

            for (let i = 0; i < datatag.length; i++) {
              let postIDpost = datatag[i].postID;
              let postType = datatag[i].postType;

              if (postIDpost == postID) {
                try {
                  datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
                } catch (e) {
                  datauserchall = null;
                }

                if (datauserchall.length > 0) {


                  for (let y = 0; y < datauserchall.length; y++) {


                    var iduserchall = datauserchall[y]._id;
                    var userid = datauserchall[y].idUser;
                    var idsubchallenge = datauserchall[y].idSubChallenge;
                    var idChallenges = datauserchall[y].idChallenge;
                    var start = new Date(datauserchall[y].startDatetime);
                    var end = new Date(datauserchall[y].endDatetime);
                    var datenow = new Date(Date.now());

                    const databasic = await this.userbasicsService.findbyid(
                      userid.toString()
                    );
                    var email = databasic.email;
                    try {
                      datapoin = await this.subChallengeService.getPoinchallenge(idsubchallenge.toString(), email.toString());
                    } catch (e) {
                      datapoin = null;
                    }
                    console.log(datapoin)

                    if (datapoin !== null) {

                      try {
                        scoreLike = datapoin.scoreLike;
                      } catch (e) {
                        scoreLike = 0;
                      }

                      try {
                        scorePost = datapoin.scorePost;
                      } catch (e) {
                        scorePost = 0;
                      }

                      try {
                        scoreView = datapoin.scoreView;
                      } catch (e) {
                        scoreView = 0;
                      }



                      try {
                        event = datapoin.event;
                      } catch (e) {
                        event = [];
                      }
                    }
                    if (event == null) {
                      event = [];
                    }
                    if (scoreView == null) {
                      scoreView = 0;
                    }
                    if (scoreLike == null) {
                      scoreLike = 0;
                    }
                    if (scorePost == null) {
                      scorePost = 0;
                    }
                    totalscor = scoreLike + scorePost + scoreView;

                    if (totalscor == null) {
                      totalscor = 0;
                    }

                    if (objectChallenge == "KONTEN") {
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
                          }


                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                          await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                          // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                          // var activity = detail.activity;
                          // objintr = { "type": nametable, "id": idref, "desc": action }
                          // console.log(objintr)
                          // activity.push(objintr)
                          await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                          try {
                            datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                          } catch (e) {
                            datapostchall = null;
                          }
                          if (datapostchall != null) {
                            idpostchall = datapostchall._id.toString();
                          }
                          if (poin > 0) {
                            try {
                              await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                            } catch (e) {

                            }
                          }

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
                              //}

                            }
                          }


                        }
                      }
                    } else {
                      if (saleAmount == 0) {
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
                          }


                          await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                          await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                          // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                          // var activity = detail.activity;
                          // objintr = { "type": nametable, "id": idref, "desc": action }
                          // console.log(objintr)
                          // activity.push(objintr)
                          await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                          try {
                            datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                          } catch (e) {
                            datapostchall = null;
                          }
                          if (datapostchall != null) {
                            idpostchall = datapostchall._id.toString();
                          }
                          if (poin > 0) {
                            try {
                              await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                            } catch (e) {

                            }
                          }


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
                              //}

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
          if (objectChallenge == "AKUN") {
            try {
              databasic = await this.userbasicsService.findOne(emailuser);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }

          } else {
            try {
              databasic = await this.userbasicsService.findOne(emailreceiver);
              iduser = databasic._id;
            } catch (e) {
              databasic = null;
            }
          }
          try {
            datauserchall = await this.userchallengesService.userChallengebyIdChall(iduser.toString(), idChallenge);
          } catch (e) {
            datauserchall = null;
          }

          if (datauserchall !== null && datauserchall.length > 0) {


            for (let y = 0; y < datauserchall.length; y++) {
              var iduserchall = datauserchall[y]._id;
              var userid = datauserchall[y].idUser;
              var idsubchallenge = datauserchall[y].idSubChallenge;
              var idChallenges = datauserchall[y].idChallenge;
              var start = new Date(datauserchall[y].startDatetime);
              var end = new Date(datauserchall[y].endDatetime);
              var datenow = new Date(Date.now());

              const databasic = await this.userbasicsService.findbyid(
                userid.toString()
              );
              var email = databasic.email;
              try {
                datapoin = await this.subChallengeService.getPoinchallenge(idsubchallenge.toString(), email.toString());
              } catch (e) {
                datapoin = null;
              }
              console.log(datapoin)

              if (datapoin !== null) {

                try {
                  scoreLike = datapoin.scoreLike;
                } catch (e) {
                  scoreLike = 0;
                }

                try {
                  scorePost = datapoin.scorePost;
                } catch (e) {
                  scorePost = 0;
                }

                try {
                  scoreView = datapoin.scoreView;
                } catch (e) {
                  scoreView = 0;
                }



                try {
                  event = datapoin.event;
                } catch (e) {
                  event = [];
                }
              }
              if (event == null) {
                event = [];
              }
              if (scoreView == null) {
                scoreView = 0;
              }
              if (scoreLike == null) {
                scoreLike = 0;
              }
              if (scorePost == null) {
                scorePost = 0;
              }
              totalscor = scoreLike + scorePost + scoreView;

              if (totalscor == null) {
                totalscor = 0;
              }

              if (objectChallenge == "KONTEN") {
                if (new Date(createAt) >= start && new Date(createAt) <= end && saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }

                    if (postTypeParent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeParent == "diary") {
                      poin = poinViewDiary;
                    }

                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                    await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                    // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    // var activity = detail.activity;
                    // objintr = { "type": nametable, "id": idref, "desc": action }
                    // console.log(objintr)
                    // activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                    try {
                      datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                    } catch (e) {
                      datapostchall = null;
                    }
                    if (datapostchall != null) {
                      idpostchall = datapostchall._id.toString();
                    }
                    if (poin > 0) {
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                    }
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {

                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;

                        // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
                        await this.userchallengesService.updateRangking(iducall.toString(), rank, timedate);
                        // }

                      }
                    }
                  }
                }
              } else {
                if (saleAmount == 0) {
                  if (datenow >= start && datenow <= end && idChallenges == idChallenge) {

                    var obj = {};

                    obj = {
                      "updatedAt": datauserchall[y].updatedAt,
                      "score": datauserchall[y].score,
                      "ranking": datauserchall[y].ranking,
                    }

                    if (postTypeParent == "vid") {
                      poin = poinViewVid;
                    } else if (postTypeParent == "diary") {
                      poin = poinViewDiary;
                    }

                    await this.userchallengesService.updateHistory(iduserchall.toString(), idsubchallenge.toString(), obj);
                    await this.userchallengesService.updateUserchallenge(iduserchall.toString(), idsubchallenge.toString(), totalscor);
                    // var detail = await this.userchallengesService.findOne(iduserchall.toString());
                    // var activity = detail.activity;
                    // objintr = { "type": nametable, "id": idref, "desc": action }
                    // console.log(objintr)
                    // activity.push(objintr)
                    await this.userchallengesService.updateActivity(iduserchall.toString(), event, timedate);
                    try {
                      datapostchall = await this.postchallengeService.findBypostID(postID, idChallenges.toString());
                    } catch (e) {
                      datapostchall = null;
                    }
                    if (datapostchall != null) {
                      idpostchall = datapostchall._id.toString();
                    }
                    if (poin > 0) {
                      try {
                        await this.postchallengeService.updatePostchallenge(idpostchall, poin);
                      } catch (e) {

                      }
                    }
                    var datauschall = await this.userchallengesService.datauserchallbyidchall(idChallenges, idsubchallenge);

                    if (datauschall.length > 0) {
                      for (let x = 0; x < datauschall.length; x++) {

                        let iducall = datauschall[x]._id;
                        let start = new Date(datauschall[x].startDatetime);
                        let end = new Date(datauschall[x].endDatetime);
                        let datenow = new Date(Date.now());
                        let idChallenges2 = datauschall[x].idChallenge;
                        let rank = x + 1;

                        // if (datenow >= start && datenow <= end && idChallenges == idChallenges2) {
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

  async synchInteractive(request: any, headers: any) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var listchallenge = null;
    var checkexisttemppost = false;

    try {
      listchallenge = request.body.listchallenge;
    } catch (e) {
      listchallenge = null;
    }

    const eventType = request.body.eventType;
    const email_user = headers['x-auth-user'];
    const email_receiverParty = request.body.receiverParty;
    const current_date = await this.utilsService.getDateTimeString();

    var userbasic1 = await this.basic2SS.findbyemail(email_user);
    var userbasic2 = await this.basic2SS.findbyemail(email_receiverParty);

    var insightID1 = JSON.parse(JSON.stringify(userbasic1.insight)).$id;
    var insightID2 = JSON.parse(JSON.stringify(userbasic2.insight)).$id;

    var Insight_sender = await this.insightsService.findOne(insightID1);
    var Insight_receiver = await this.insightsService.findOne(insightID2);

    var iduser = null;
    var isguest = false;
    if (userbasic1 == null || userbasic1 == undefined) {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, auth-user data not found',
      );
    }
    iduser = userbasic1._id;
    isguest = userbasic1.guestMode;

    if (request.body.postID != null && request.body.postID != undefined) {
      var gettemppost = await this.tempostSS.findByPostId(request.body.postID);
      if (await this.utilsService.ceckData(gettemppost)) {
        checkexisttemppost = true;
      }
    }

    if (eventType == "FOLLOWING") {
      if (email_receiverParty != email_user) {
        var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
        var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
        if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_receiverParty
          CreateContenteventsDto1.eventType = "FOLLOWER"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "ACCEPT"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_user

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_user
          CreateContenteventsDto2.eventType = "FOLLOWING"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_receiverParty

          if (await this.utilsService.ceckData(Insight_sender)) {
            var _id_sender = (await this.utilsService.generateId());
            var CreateInsightlogsDto_sender = new CreateInsightlogsDto()
            CreateInsightlogsDto_sender._id = _id_sender;
            CreateInsightlogsDto_sender.insightID = Insight_sender._id;
            CreateInsightlogsDto_sender.createdAt = current_date;
            CreateInsightlogsDto_sender.updatedAt = current_date;
            CreateInsightlogsDto_sender.mate = email_receiverParty
            CreateInsightlogsDto_sender.eventInsight = "FOLLOWING"
            CreateInsightlogsDto_sender._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_sender);

            var LogInsught_sensder = Insight_sender.insightLogs;
            LogInsught_sensder.push({
              $ref: 'insightlogs',
              $id: _id_sender,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_sender = new CreateInsightsDto()
            CreateInsightsDto_sender.insightLogs = LogInsught_sensder;
            await this.insightsService.updateoneByID(insightID1, CreateInsightsDto_sender)

          }
          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.eventInsight = "FOLLOWER"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)

          }

          //INSERt FOLOWING STREAM
          if (request.body.idMediaStreaming != undefined) {
            const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
            if (!(await this.utilsService.ceckData(ceckView))) {
              const dataFollower = {
                userId: new mongoose.Types.ObjectId(userbasic1._id.toString()),
                status: true,
                createAt: current_date,
                updateAt: current_date
              }
              await this.mediastreamingService.insertFollower(request.body.idMediaStreaming, dataFollower)
            } else {
              await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), false, true, current_date);
            }
          }

          try {
            const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
            let idevent1 = resultdata1._id;
            let event1 = resultdata1.eventType.toString();
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            await this.contenteventsService.create(CreateContenteventsDto2);
            await this.insightsService.updateFollowerByID(insightID2);
            await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
            await this.insightsService.updateFollowingByID(insightID1);
            this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
            await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
            //  this.sendInteractiveFCM2(email_user, "FOLLOWING", "", email_receiverParty);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              // this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
              this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW", listchallenge)
            }
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
            await this.contenteventsService.updateFollowing(email_user, "FOLLOWING", email_receiverParty);
            await this.contenteventsService.updateFollower(email_receiverParty, "FOLLOWER", email_user);
            await this.insightsService.updateFollowerByID(insightID2);
            await this.insightsService.updateFollowingByID(insightID1);
            await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
            this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
            await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
            let idevent1 = ceck_data_FOLLOWING._id;
            // let event1 = ceck_data_FOLLOWING.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              //this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
              this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW", listchallenge)
            }


          }
        }

        await this.checkFriendbasedString2(userbasic1, userbasic2, "create");
      }
    }
    //  else if (eventType == "VIEW") {

    //   if (email_user !== email_receiverParty) {
    //     var idevent1 = null;
    //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
    //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
    //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
    //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //       var _id_1 = (await this.utilsService.generateId());
    //       var _id_2 = (await this.utilsService.generateId());
    //       var CreateContenteventsDto1 = new CreateContenteventsDto();
    //       CreateContenteventsDto1._id = _id_1
    //       CreateContenteventsDto1.contentEventID = _id_1
    //       CreateContenteventsDto1.email = email_user
    //       CreateContenteventsDto1.eventType = "VIEW"
    //       CreateContenteventsDto1.active = true
    //       CreateContenteventsDto1.event = "DONE"
    //       CreateContenteventsDto1.createdAt = current_date
    //       CreateContenteventsDto1.updatedAt = current_date
    //       CreateContenteventsDto1.sequenceNumber = 1
    //       CreateContenteventsDto1.flowIsDone = true
    //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto1.receiverParty = email_receiverParty
    //       CreateContenteventsDto1.postID = request.body.postID

    //       var CreateContenteventsDto2 = new CreateContenteventsDto();
    //       CreateContenteventsDto2._id = _id_2
    //       CreateContenteventsDto2.contentEventID = _id_2
    //       CreateContenteventsDto2.email = email_receiverParty
    //       CreateContenteventsDto2.eventType = "VIEW"
    //       CreateContenteventsDto2.active = true
    //       CreateContenteventsDto2.event = "ACCEPT"
    //       CreateContenteventsDto2.createdAt = current_date
    //       CreateContenteventsDto2.updatedAt = current_date
    //       CreateContenteventsDto2.sequenceNumber = 1
    //       CreateContenteventsDto2.flowIsDone = true
    //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto2.senderParty = email_user
    //       CreateContenteventsDto2.postID = request.body.postID



    //       if (await this.utilsService.ceckData(Insight_receiver)) {
    //         var _id_receiver = (await this.utilsService.generateId());
    //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
    //         CreateInsightlogsDto_receiver._id = _id_receiver;
    //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
    //         CreateInsightlogsDto_receiver.createdAt = current_date;
    //         CreateInsightlogsDto_receiver.updatedAt = current_date;
    //         CreateInsightlogsDto_receiver.mate = email_user
    //         CreateInsightlogsDto_receiver.postID = request.body.postID
    //         CreateInsightlogsDto_receiver.eventInsight = "VIEW"
    //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
    //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

    //         var LogInsught_receiver = Insight_receiver.insightLogs;
    //         LogInsught_receiver.push({
    //           $ref: 'insightlogs',
    //           $id: _id_receiver,
    //           $db: 'hyppe_content_db',
    //         });

    //         var CreateInsightsDto_receiver = new CreateInsightsDto()
    //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
    //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)


    //       }

    //       try {
    //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //         idevent1 = resultdata1._id;
    //         let event1 = resultdata1.eventType.toString();
    //         //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
    //         var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

    //         await this.postsService.updateView(email_receiverParty, request.body.postID);
    //         await this.insightsService.updateViews(email_receiverParty);


    //       } catch (error) {
    //         var fullurl = request.get("Host") + request.originalUrl;
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         var reqbody = JSON.parse(JSON.stringify(request.body));
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //         await this.errorHandler.generateNotAcceptableException(
    //           'Unabled to proceed, ' +
    //           error,
    //         );
    //       }
    //     }
    //     else {

    //       let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
    //       let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
    //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {

    //         var _id_1 = (await this.utilsService.generateId());
    //         var _id_2 = (await this.utilsService.generateId());
    //         var CreateContenteventsDto1 = new CreateContenteventsDto();
    //         CreateContenteventsDto1._id = _id_1
    //         CreateContenteventsDto1.contentEventID = _id_1
    //         CreateContenteventsDto1.email = email_user
    //         CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto1.active = true
    //         CreateContenteventsDto1.event = "DONE"
    //         CreateContenteventsDto1.createdAt = current_date
    //         CreateContenteventsDto1.updatedAt = current_date
    //         CreateContenteventsDto1.sequenceNumber = 1
    //         CreateContenteventsDto1.flowIsDone = true
    //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto1.receiverParty = email_receiverParty
    //         CreateContenteventsDto1.postID = request.body.postID

    //         var CreateContenteventsDto2 = new CreateContenteventsDto();
    //         CreateContenteventsDto2._id = _id_2
    //         CreateContenteventsDto2.contentEventID = _id_2
    //         CreateContenteventsDto2.email = email_receiverParty
    //         CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto2.active = true
    //         CreateContenteventsDto2.event = "ACCEPT"
    //         CreateContenteventsDto2.createdAt = current_date
    //         CreateContenteventsDto2.updatedAt = current_date
    //         CreateContenteventsDto2.sequenceNumber = 1
    //         CreateContenteventsDto2.flowIsDone = true
    //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto2.senderParty = email_user
    //         CreateContenteventsDto2.postID = request.body.postID

    //         try {
    //           var resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //           idevent1 = resultdata1._id;
    //           var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);


    //         } catch (error) {
    //           var fullurl = request.get("Host") + request.originalUrl;
    //           var timestamps_end = await this.utilsService.getDateTimeString();
    //           var reqbody = JSON.parse(JSON.stringify(request.body));
    //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //           await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed, ' +
    //             error,
    //           );
    //         }

    //       }

    //     }
    //     if (idevent1 != null) {
    //       try {
    //         this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
    //         console.log("sukses hitung score")
    //       } catch (e) {
    //         console.log("gagal ngitung skor" + e)
    //       }

    //     }
    //   }
    //   var datapost = await this.NewpostsService.updatePostviewer(request.body.postID, email_user);
    // } 
    else if (eventType == "VIEW") {
      if (email_user !== email_receiverParty) {
        var idevent1 = null;
        var idevent2 = null;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
        var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
        var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
        if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_user
          CreateContenteventsDto1.eventType = "VIEW"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "DONE"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_receiverParty
          CreateContenteventsDto1.postID = request.body.postID

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_receiverParty
          CreateContenteventsDto2.eventType = "VIEW"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_user
          CreateContenteventsDto2.postID = request.body.postID

          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.postID = request.body.postID
            CreateInsightlogsDto_receiver.eventInsight = "VIEW"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
          }

          try {
            const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
            idevent1 = resultdata1._id;
            let event1 = resultdata1.eventType.toString();
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

            var getpost = await this.postDisqusSS.findid(request.body.postID);
            var result = getpost.userView.filter((email) => email === email_user);
            if (result.length == 0) {
              await this.postDisqusSS.updateView(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateView(email_receiverParty, email_user, request.body.postID);
              }
            }
            await this.insightsService.updateViewsByID(insightID2);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }


        var datacek = null;

        try {
          datacek = await this.userchallengesService.cekUserjoin(iduser);
        } catch (e) {
          datacek = null;
        }

        if (datacek !== null) {
          let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
          let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
          if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
            var _id_1 = (await this.utilsService.generateId());
            var _id_2 = (await this.utilsService.generateId());
            var CreateContenteventsDto1 = new CreateContenteventsDto();
            CreateContenteventsDto1._id = _id_1
            CreateContenteventsDto1.contentEventID = _id_1
            CreateContenteventsDto1.email = email_user
            CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto1.active = true
            CreateContenteventsDto1.event = "DONE"
            CreateContenteventsDto1.createdAt = current_date
            CreateContenteventsDto1.updatedAt = current_date
            CreateContenteventsDto1.sequenceNumber = 1
            CreateContenteventsDto1.flowIsDone = true
            CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto1.receiverParty = email_receiverParty
            CreateContenteventsDto1.postID = request.body.postID

            var CreateContenteventsDto2 = new CreateContenteventsDto();
            CreateContenteventsDto2._id = _id_2
            CreateContenteventsDto2.contentEventID = _id_2
            CreateContenteventsDto2.email = email_receiverParty
            CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto2.active = true
            CreateContenteventsDto2.event = "ACCEPT"
            CreateContenteventsDto2.createdAt = current_date
            CreateContenteventsDto2.updatedAt = current_date
            CreateContenteventsDto2.sequenceNumber = 1
            CreateContenteventsDto2.flowIsDone = true
            CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto2.senderParty = email_user
            CreateContenteventsDto2.postID = request.body.postID

            try {
              let resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
              idevent1 = resultdata1._id;
              let dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

              if (idevent1 !== null) {
                try {
                  // this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
                  this.scoreviewrequest(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty, listchallenge)
                  console.log("sukses hitung score")
                } catch (e) {
                  console.log("gagal ngitung skor" + e)
                }


              }


            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }

          }
        }


      }

      var datapost = await this.postDisqusSS.updatePostviewer(request.body.postID, email_user);

      if (checkexisttemppost == true) {
        await this.tempostSS.updatePostviewer(request.body.postID, email_user);
      }
    }
    else if (eventType == "LIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "LIKE"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.postID = request.body.postID

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "LIKE"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.postID = request.body.postID

        if (await this.utilsService.ceckData(Insight_receiver)) {
          var _id_receiver = (await this.utilsService.generateId());
          var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
          CreateInsightlogsDto_receiver._id = _id_receiver;
          CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
          CreateInsightlogsDto_receiver.createdAt = current_date;
          CreateInsightlogsDto_receiver.updatedAt = current_date;
          CreateInsightlogsDto_receiver.mate = email_user
          CreateInsightlogsDto_receiver.eventInsight = "LIKE"
          CreateInsightlogsDto_receiver.postID = request.body.postID
          CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
          await this.insightlogsService.create(CreateInsightlogsDto_receiver);

          var LogInsught_receiver = Insight_receiver.insightLogs;
          LogInsught_receiver.push({
            $ref: 'insightlogs',
            $id: _id_receiver,
            $db: 'hyppe_content_db',
          });

          var CreateInsightsDto_receiver = new CreateInsightsDto()
          CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
          await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
        }

        try {
          const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
          let idevent1 = resultdata1._id;
          let event1 = resultdata1.eventType.toString();
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
          await this.contenteventsService.create(CreateContenteventsDto2);
          var getpost = await this.postDisqusSS.findid(request.body.postID);
          var result = getpost.userLike.filter((email) => email === email_user);
          if (result.length == 0) {
            await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
            }
          }
          await this.insightsService.updateLikeByID(insightID2);
          if (!isguest) {
            this.sendInteractiveFCM2(email_receiverParty, "LIKE", request.body.postID, email_user);
          }
          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeLike(iduser.toString(), idevent1.toString(), "contentevents", "LIKE", request.body.postID);
          // }
          //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);


          this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);




        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {
        if (ceck_data_DONE.active && ceck_data_DONE.active) {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
            await this.insightsService.updateUnlikeByID(insightID2);
            await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
            }

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
            // const databasic = await this.userbasicsService.findOne(
            //   email_receiverParty
            // );
            // var iduser = null;
            // if (databasic !== null) {
            //   iduser = databasic._id;
            //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
            // }
            // this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
            await this.insightsService.updateLikeByID(insightID2);
            await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
            }

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            // this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);


          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    }
    else if (eventType == "UNLIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        try {
          await this.insightsService.updateUnlikeByID(insightID2);
          await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
          await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
          await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

          if (checkexisttemppost == true) {
            await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
          }

          let idevent1 = ceck_data_DONE._id;
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);

          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
          // }
          //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {

        if (ceck_data_DONE.active != undefined && !ceck_data_ACCEPT.active != undefined) {
          if (ceck_data_DONE.active && ceck_data_ACCEPT.active) {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
              await this.insightsService.updateUnlikeByID(insightID2);
              await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
              }

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
              // }

              //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          } else {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
              await this.insightsService.updateLikeByID(insightID2);
              await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
              }

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "LIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeLike2( idevent1.toString(), "contentevents", "LIKE", request.body.postID);
              // }

              //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          }
        }
      }
    } else if (eventType == "UNFOLLOW") {
      if (email_receiverParty != email_user) {
        var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
        var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
        if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
          try {
            await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
            await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
            await this.insightsService.updateUnFollowerByID(insightID2);
            await this.insightsService.updateUnFollowingByID(insightID1);
            await this.insightsService.updateUnFollowByID(insightID1);
            await this.basic2SS.updateunfollowSystem(email_user, email_receiverParty, "FOLLOWER");
            await this.basic2SS.updateunfollowSystem(email_receiverParty, email_user, "FOLLOWING");

            //INSERt UNFOLLOW STREAM
            if (request.body.idMediaStreaming != undefined) {
              const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
              if (await this.utilsService.ceckData(ceckView)) {
                await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), true, false, current_date);
              }
            }

            let idevent1 = ceck_data_FOLLOWING._id;
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNFOLLOW", userbasic1._id);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              // this.userChallengeUnFollow(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW");

              this.scoreunfollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW", listchallenge)
            }

            await this.checkFriendbasedString2(userbasic1, userbasic2, "delete");
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    } else if (eventType == "REACTION") {
      // var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
      // var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
      // if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
      var _id_1 = (await this.utilsService.generateId());
      var _id_2 = (await this.utilsService.generateId());
      var CreateContenteventsDto1 = new CreateContenteventsDto();
      CreateContenteventsDto1._id = _id_1
      CreateContenteventsDto1.contentEventID = _id_1
      CreateContenteventsDto1.email = email_user
      CreateContenteventsDto1.eventType = "REACTION"
      CreateContenteventsDto1.active = true
      CreateContenteventsDto1.event = "DONE"
      CreateContenteventsDto1.createdAt = current_date
      CreateContenteventsDto1.updatedAt = current_date
      CreateContenteventsDto1.sequenceNumber = 1
      CreateContenteventsDto1.flowIsDone = true
      CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto1.receiverParty = email_receiverParty
      CreateContenteventsDto1.reactionUri = request.body.reactionUri
      CreateContenteventsDto1.postID = request.body.postID

      var CreateContenteventsDto2 = new CreateContenteventsDto();
      CreateContenteventsDto2._id = _id_2
      CreateContenteventsDto2.contentEventID = _id_2
      CreateContenteventsDto2.email = email_receiverParty
      CreateContenteventsDto2.eventType = "REACTION"
      CreateContenteventsDto2.active = true
      CreateContenteventsDto2.event = "ACCEPT"
      CreateContenteventsDto2.createdAt = current_date
      CreateContenteventsDto2.updatedAt = current_date
      CreateContenteventsDto2.sequenceNumber = 1
      CreateContenteventsDto2.flowIsDone = true
      CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto2.senderParty = email_user
      CreateContenteventsDto2.reactionUri = request.body.reactionUri
      CreateContenteventsDto2.postID = request.body.postID

      if (await this.utilsService.ceckData(Insight_receiver)) {
        var _id_receiver = (await this.utilsService.generateId());
        var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
        CreateInsightlogsDto_receiver._id = _id_receiver;
        CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
        CreateInsightlogsDto_receiver.createdAt = current_date;
        CreateInsightlogsDto_receiver.updatedAt = current_date;
        CreateInsightlogsDto_receiver.mate = email_user
        CreateInsightlogsDto_receiver.eventInsight = "REACTION"
        CreateInsightlogsDto_receiver.postID = request.body.postID
        CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
        await this.insightlogsService.create(CreateInsightlogsDto_receiver);

        var LogInsught_receiver = Insight_receiver.insightLogs;
        LogInsught_receiver.push({
          $ref: 'insightlogs',
          $id: _id_receiver,
          $db: 'hyppe_content_db',
        });

        var CreateInsightsDto_receiver = new CreateInsightsDto()
        CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
        await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
      }

      //SEND DIRECT MESSAGE
      let retVal = new DisqusResDto();

      //CECk DISQUS CONTACT
      var CeckDataDiscusContact_sender = await this.disquscontactsService.findMayeEmail(email_user, email_receiverParty);
      var CeckDataDiscusContact_receiver = await this.disquscontactsService.findMayeEmail(email_receiverParty, email_user);

      var id_discus_contact = "";
      var id_discus = "";
      var id_discus_log = "";

      var post = await this.postDisqusSS.findByPostId(request.body.postID.toString());
      var media_ = {}
      if (await this.utilsService.ceckData(post.mediaSource[0])) {
        if (post.createdAt != undefined) {
          media_["createdAt"] = post.createdAt;
        }
        if (post.mediaSource[0].mediaBasePath != undefined) {
          media_["mediaBasePath"] = post.mediaSource[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          media_["postType"] = post.postType;
        }
        if (post.mediaSource[0].mediaUri != undefined) {
          media_["mediaUri"] = post.mediaSource[0].mediaUri;
        }
        if (post.mediaSource[0].mediaThumb != undefined) {
          media_["mediaThumbUri"] = post.mediaSource[0].mediaThumb;
        }
        if (post.description != undefined) {
          media_["description"] = post.description;
        }
        if (post.active != undefined) {
          media_["active"] = post.active;
        }
        if (post.mediaSource[0].mediaType != undefined) {
          media_["mediaType"] = post.mediaSource[0].mediaType;
        }
        if (post.postID != undefined) {
          media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
        }
        if (post.postID != undefined) {
          media_["postID"] = post.postID;
        }
        if (post.mediaSource[0].mediaUri != undefined) {
          media_["mediaEndpoint"] = post.mediaSource[0].mediaUri;
        }
        if (post.mediaSource[0].apsara != undefined) {
          media_["apsara"] = post.mediaSource[0].apsara;
        }
        if (post.mediaSource[0].apsaraId != undefined) {
          media_["apsaraId"] = post.mediaSource[0].apsaraId;
        }
      }

      var body_messages = "";
      var body_ = "";
      var dataEmote = await this.reactionsRepoService.findByUrl(request.body.reactionUri);
      var Emote = (await this.utilsService.ceckData(dataEmote)) ? dataEmote.icon : "";
      var Templates_ = await this.utilsService.getTemplate_repo('REACTION', 'NOTIFICATION');
      var get_languages = await this.utilsService.getUserlanguages(email_receiverParty);
      if (get_languages == "en") {
        body_ = Templates_.body_detail.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      } else {
        body_ = Templates_.body_detail_id.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      }

      id_discus_log = await this.utilsService.generateId()
      //INSERT DISQUS LOG
      var CreateDisquslogsDto_ = new Disquslogs();
      try {
        CreateDisquslogsDto_._id = id_discus_log;
        CreateDisquslogsDto_.disqusID = id_discus;
        CreateDisquslogsDto_.active = true;
        CreateDisquslogsDto_.sequenceNumber = 0;
        CreateDisquslogsDto_.postID = request.body.postID.toString();
        CreateDisquslogsDto_.eventInsight = "REACTION";
        CreateDisquslogsDto_.sender = email_user;
        CreateDisquslogsDto_.receiver = email_receiverParty;
        CreateDisquslogsDto_.postType = "txt_msg";
        CreateDisquslogsDto_.createdAt = current_date;
        CreateDisquslogsDto_.updatedAt = current_date;
        CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
        CreateDisquslogsDto_.medias = [media_];
        CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
        CreateDisquslogsDto_.receiverActive = true;
        CreateDisquslogsDto_.senderActive = true;
        this.disquslogsService.create(CreateDisquslogsDto_);
      } catch (error) {
        this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
      }

      //INSERT DISQUS
      var CreateDisqusDto_ = new CreateDisqusDto();
      if ((await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && (await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
        id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
        CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
        if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
        } else {
          //UPDATE DISQUS
          try {
            var data_disqusLogs = CreateDisqusDto_.disqusLogs;
            data_disqusLogs.push({
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            });
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.disqusLogs = data_disqusLogs;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
          }
        }
        retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
        this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
        this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
      } else {
        if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && !(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
          id_discus = await this.utilsService.generateId();
          //INSERT DISQUS CONTACT
          var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
          try {
            id_discus_contact = await this.utilsService.generateId();
            CreateDisquscontactsDto_._id = id_discus_contact;
            CreateDisquscontactsDto_.active = true;
            CreateDisquscontactsDto_.email = email_user;
            CreateDisquscontactsDto_.mate = email_receiverParty;
            CreateDisquscontactsDto_.disqus = {
              $ref: 'disqus',
              $id: id_discus,
              $db: 'hyppe_content_db',
            };
            CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
            this.disquscontactsService.create(CreateDisquscontactsDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
          }
          //INSERT DISQUS CONTACT
          var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
          try {
            id_discus_contact = await this.utilsService.generateId();
            CreateDisquscontactsDto_._id = id_discus_contact;
            CreateDisquscontactsDto_.active = true;
            CreateDisquscontactsDto_.email = email_receiverParty;
            CreateDisquscontactsDto_.mate = email_user;
            CreateDisquscontactsDto_.disqus = {
              $ref: 'disqus',
              $id: id_discus,
              $db: 'hyppe_content_db',
            };
            CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
            this.disquscontactsService.create(CreateDisquscontactsDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
          }
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
          retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
          this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        } else {
          if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender))) {
            //INSERT DISQUS CONTACT
            var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
            try {
              CreateDisquscontactsDto_._id = id_discus_contact;
              CreateDisquscontactsDto_.active = true;
              CreateDisquscontactsDto_.email = email_user;
              CreateDisquscontactsDto_.mate = email_receiverParty;
              CreateDisquscontactsDto_.disqus = {
                $ref: 'disqus',
                $id: id_discus,
                $db: 'hyppe_content_db',
              };
              CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
              this.disquscontactsService.create(CreateDisquscontactsDto_);
            } catch (error) {
              this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
            }
            id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_receiver.disqus))).$id;
            CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
            if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
              //INSERT DISQUS
              try {
                CreateDisqusDto_._id = id_discus;
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.disqusID = id_discus;
                CreateDisqusDto_.active = true;
                CreateDisqusDto_.email = email_user;
                CreateDisqusDto_.mate = email_receiverParty;
                CreateDisqusDto_.eventType = "DIRECT_MSG";
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.createdAt = current_date;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.disqusLogs = [{
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                }];
                CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
                this.disqusContentEventService.create(CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
              }
            } else {
              //UPDATE DISQUS
              try {
                var data_disqusLogs = CreateDisqusDto_.disqusLogs;
                data_disqusLogs.push({
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                });
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.disqusLogs = data_disqusLogs;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
              }
            }
          }
          if (!(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
            //INSERT DISQUS CONTACT
            var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
            try {
              CreateDisquscontactsDto_._id = id_discus_contact;
              CreateDisquscontactsDto_.active = true;
              CreateDisquscontactsDto_.email = email_receiverParty;
              CreateDisquscontactsDto_.mate = email_user;
              CreateDisquscontactsDto_.disqus = {
                $ref: 'disqus',
                $id: id_discus,
                $db: 'hyppe_content_db',
              };
              CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
              this.disquscontactsService.create(CreateDisquscontactsDto_);
            } catch (error) {
              this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
            }
            id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
            CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
            if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
              //INSERT DISQUS
              try {
                CreateDisqusDto_._id = id_discus;
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.disqusID = id_discus;
                CreateDisqusDto_.active = true;
                CreateDisqusDto_.email = email_user;
                CreateDisqusDto_.mate = email_receiverParty;
                CreateDisqusDto_.eventType = "DIRECT_MSG";
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.createdAt = current_date;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.disqusLogs = [{
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                }];
                CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
                this.disqusContentEventService.create(CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
              }
            } else {
              //UPDATE DISQUS
              try {
                var data_disqusLogs = CreateDisqusDto_.disqusLogs;
                data_disqusLogs.push({
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                });
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.disqusLogs = data_disqusLogs;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
              }
            }
          }
          retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
          this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        }
      }

      console.log("retVal", retVal);
      try {
        const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
        let idevent1 = resultdata1._id;
        let event1 = resultdata1.eventType.toString();
        // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
        await this.contenteventsService.create(CreateContenteventsDto2);
        await this.postDisqusSS.updateReaction(email_receiverParty, request.body.postID);

        if (checkexisttemppost == true) {
          await this.tempostSS.updateReaction(email_receiverParty, request.body.postID);
        }
        await this.insightsService.updateReactionsByID(insightID1);
        this.sendInteractiveFCM2(email_receiverParty, "REACTION", request.body.postID, email_user, Emote);
      } catch (error) {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(request.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
      //}
    }

    var fullurl = request.get("Host") + request.originalUrl;
    var timestamps_end = await this.utilsService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(request.body));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
  }

  async synchInteractivev2(request: any, headers: any) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var listchallenge = null;
    var checkexisttemppost = false;
    var uniqEvent = null;

    try {
      listchallenge = request.body.listchallenge;
    } catch (e) {
      listchallenge = null;
    }

    const eventType = request.body.eventType;
    const email_user = headers['x-auth-user'];
    const email_receiverParty = request.body.receiverParty;
    const current_date = await this.utilsService.getDateTimeString();

    var userbasic1 = await this.basic2SS.findbyemail(email_user);
    var userbasic2 = await this.basic2SS.findbyemail(email_receiverParty);

    var insightID1 = JSON.parse(JSON.stringify(userbasic1.insight)).$id;
    var insightID2 = JSON.parse(JSON.stringify(userbasic2.insight)).$id;

    var Insight_sender = await this.insightsService.findOne(insightID1);
    var Insight_receiver = await this.insightsService.findOne(insightID2);

    var iduser = null;
    var isguest = false;
    if (userbasic1 == null || userbasic1 == undefined) {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, auth-user data not found',
      );
    }
    iduser = userbasic1._id;
    isguest = userbasic1.guestMode;

    if (request.body.postID != null && request.body.postID != undefined) {
      var gettemppost = await this.tempostSS.findByPostId(request.body.postID);
      if (await this.utilsService.ceckData(gettemppost)) {
        checkexisttemppost = true;
      }
    }

    if (eventType == "FOLLOWING") {
      if (email_receiverParty != email_user) {
        var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
        var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
        if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_receiverParty
          CreateContenteventsDto1.eventType = "FOLLOWER"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "ACCEPT"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_user
          let uniq = null;
          uniq = await this.addUniqEvent(email_receiverParty, "FOLLOWER", "true", "ACCEPT", email_user, null,null);
          CreateContenteventsDto1.uniqEvent = uniq;

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_user
          CreateContenteventsDto2.eventType = "FOLLOWING"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_receiverParty

          let uniq2 = null;
          uniq2 = await this.addUniqEvent(email_user, "FOLLOWING", "true", "ACCEPT", email_receiverParty, null,null);
          CreateContenteventsDto2.uniqEvent = uniq2;

          if (await this.utilsService.ceckData(Insight_sender)) {
            var _id_sender = (await this.utilsService.generateId());
            var CreateInsightlogsDto_sender = new CreateInsightlogsDto()
            CreateInsightlogsDto_sender._id = _id_sender;
            CreateInsightlogsDto_sender.insightID = Insight_sender._id;
            CreateInsightlogsDto_sender.createdAt = current_date;
            CreateInsightlogsDto_sender.updatedAt = current_date;
            CreateInsightlogsDto_sender.mate = email_receiverParty
            CreateInsightlogsDto_sender.eventInsight = "FOLLOWING"
            CreateInsightlogsDto_sender._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_sender);

            var LogInsught_sensder = Insight_sender.insightLogs;
            LogInsught_sensder.push({
              $ref: 'insightlogs',
              $id: _id_sender,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_sender = new CreateInsightsDto()
            CreateInsightsDto_sender.insightLogs = LogInsught_sensder;
            await this.insightsService.updateoneByID(insightID1, CreateInsightsDto_sender)

          }
          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.eventInsight = "FOLLOWER"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)

          }

          //INSERt FOLOWING STREAM
          if (request.body.idMediaStreaming != undefined) {
            const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
            if (!(await this.utilsService.ceckData(ceckView))) {
              const dataFollower = {
                userId: new mongoose.Types.ObjectId(userbasic1._id.toString()),
                status: true,
                createAt: current_date,
                updateAt: current_date
              }
              await this.mediastreamingService.insertFollower(request.body.idMediaStreaming, dataFollower)
            } else {
              await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), false, true, current_date);
            }
          }

          try {

            try {
              const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
              let idevent1 = resultdata1._id;
              let event1 = resultdata1.eventType.toString();
              const databasic = await this.basic2SS.findbyemail(
                email_user
              );
              var iduser = null;
              if (databasic !== null) {
                iduser = databasic._id;
                // this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
                this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW", listchallenge)
              }

            } catch (e) {

            }
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

            try {
              await this.contenteventsService.create(CreateContenteventsDto2);
            } catch (e) {

            }
            await this.insightsService.updateFollowerByID(insightID2);
            await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
            await this.insightsService.updateFollowingByID(insightID1);
            this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
            await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
            //  this.sendInteractiveFCM2(email_user, "FOLLOWING", "", email_receiverParty);


          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
            await this.contenteventsService.updateFollowing(email_user, "FOLLOWING", email_receiverParty);
            await this.contenteventsService.updateFollower(email_receiverParty, "FOLLOWER", email_user);
            await this.insightsService.updateFollowerByID(insightID2);
            await this.insightsService.updateFollowingByID(insightID1);
            await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
            this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
            await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
            let idevent1 = ceck_data_FOLLOWING._id;
            // let event1 = ceck_data_FOLLOWING.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              //this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
              this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW", listchallenge)
            }


          }
        }

        await this.checkFriendbasedString2(userbasic1, userbasic2, "create");
      }
    }
    //  else if (eventType == "VIEW") {

    //   if (email_user !== email_receiverParty) {
    //     var idevent1 = null;
    //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
    //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
    //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
    //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //       var _id_1 = (await this.utilsService.generateId());
    //       var _id_2 = (await this.utilsService.generateId());
    //       var CreateContenteventsDto1 = new CreateContenteventsDto();
    //       CreateContenteventsDto1._id = _id_1
    //       CreateContenteventsDto1.contentEventID = _id_1
    //       CreateContenteventsDto1.email = email_user
    //       CreateContenteventsDto1.eventType = "VIEW"
    //       CreateContenteventsDto1.active = true
    //       CreateContenteventsDto1.event = "DONE"
    //       CreateContenteventsDto1.createdAt = current_date
    //       CreateContenteventsDto1.updatedAt = current_date
    //       CreateContenteventsDto1.sequenceNumber = 1
    //       CreateContenteventsDto1.flowIsDone = true
    //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto1.receiverParty = email_receiverParty
    //       CreateContenteventsDto1.postID = request.body.postID

    //       var CreateContenteventsDto2 = new CreateContenteventsDto();
    //       CreateContenteventsDto2._id = _id_2
    //       CreateContenteventsDto2.contentEventID = _id_2
    //       CreateContenteventsDto2.email = email_receiverParty
    //       CreateContenteventsDto2.eventType = "VIEW"
    //       CreateContenteventsDto2.active = true
    //       CreateContenteventsDto2.event = "ACCEPT"
    //       CreateContenteventsDto2.createdAt = current_date
    //       CreateContenteventsDto2.updatedAt = current_date
    //       CreateContenteventsDto2.sequenceNumber = 1
    //       CreateContenteventsDto2.flowIsDone = true
    //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto2.senderParty = email_user
    //       CreateContenteventsDto2.postID = request.body.postID



    //       if (await this.utilsService.ceckData(Insight_receiver)) {
    //         var _id_receiver = (await this.utilsService.generateId());
    //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
    //         CreateInsightlogsDto_receiver._id = _id_receiver;
    //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
    //         CreateInsightlogsDto_receiver.createdAt = current_date;
    //         CreateInsightlogsDto_receiver.updatedAt = current_date;
    //         CreateInsightlogsDto_receiver.mate = email_user
    //         CreateInsightlogsDto_receiver.postID = request.body.postID
    //         CreateInsightlogsDto_receiver.eventInsight = "VIEW"
    //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
    //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

    //         var LogInsught_receiver = Insight_receiver.insightLogs;
    //         LogInsught_receiver.push({
    //           $ref: 'insightlogs',
    //           $id: _id_receiver,
    //           $db: 'hyppe_content_db',
    //         });

    //         var CreateInsightsDto_receiver = new CreateInsightsDto()
    //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
    //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)


    //       }

    //       try {
    //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //         idevent1 = resultdata1._id;
    //         let event1 = resultdata1.eventType.toString();
    //         //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
    //         var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

    //         await this.postsService.updateView(email_receiverParty, request.body.postID);
    //         await this.insightsService.updateViews(email_receiverParty);


    //       } catch (error) {
    //         var fullurl = request.get("Host") + request.originalUrl;
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         var reqbody = JSON.parse(JSON.stringify(request.body));
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //         await this.errorHandler.generateNotAcceptableException(
    //           'Unabled to proceed, ' +
    //           error,
    //         );
    //       }
    //     }
    //     else {

    //       let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
    //       let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
    //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {

    //         var _id_1 = (await this.utilsService.generateId());
    //         var _id_2 = (await this.utilsService.generateId());
    //         var CreateContenteventsDto1 = new CreateContenteventsDto();
    //         CreateContenteventsDto1._id = _id_1
    //         CreateContenteventsDto1.contentEventID = _id_1
    //         CreateContenteventsDto1.email = email_user
    //         CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto1.active = true
    //         CreateContenteventsDto1.event = "DONE"
    //         CreateContenteventsDto1.createdAt = current_date
    //         CreateContenteventsDto1.updatedAt = current_date
    //         CreateContenteventsDto1.sequenceNumber = 1
    //         CreateContenteventsDto1.flowIsDone = true
    //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto1.receiverParty = email_receiverParty
    //         CreateContenteventsDto1.postID = request.body.postID

    //         var CreateContenteventsDto2 = new CreateContenteventsDto();
    //         CreateContenteventsDto2._id = _id_2
    //         CreateContenteventsDto2.contentEventID = _id_2
    //         CreateContenteventsDto2.email = email_receiverParty
    //         CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto2.active = true
    //         CreateContenteventsDto2.event = "ACCEPT"
    //         CreateContenteventsDto2.createdAt = current_date
    //         CreateContenteventsDto2.updatedAt = current_date
    //         CreateContenteventsDto2.sequenceNumber = 1
    //         CreateContenteventsDto2.flowIsDone = true
    //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto2.senderParty = email_user
    //         CreateContenteventsDto2.postID = request.body.postID

    //         try {
    //           var resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //           idevent1 = resultdata1._id;
    //           var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);


    //         } catch (error) {
    //           var fullurl = request.get("Host") + request.originalUrl;
    //           var timestamps_end = await this.utilsService.getDateTimeString();
    //           var reqbody = JSON.parse(JSON.stringify(request.body));
    //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //           await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed, ' +
    //             error,
    //           );
    //         }

    //       }

    //     }
    //     if (idevent1 != null) {
    //       try {
    //         this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
    //         console.log("sukses hitung score")
    //       } catch (e) {
    //         console.log("gagal ngitung skor" + e)
    //       }

    //     }
    //   }
    //   var datapost = await this.NewpostsService.updatePostviewer(request.body.postID, email_user);
    // } 
    else if (eventType == "VIEW") {
      if (email_user !== email_receiverParty) {
        var idevent1 = null;
        var idevent2 = null;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
        var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
        var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
        if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_user
          CreateContenteventsDto1.eventType = "VIEW"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "DONE"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_receiverParty
          CreateContenteventsDto1.postID = request.body.postID

          let uniq = null;
          uniq = await this.addUniqEvent(email_user, "VIEW", "true", "DONE", email_receiverParty, request.body.postID,null);
          CreateContenteventsDto1.uniqEvent = uniq;

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_receiverParty
          CreateContenteventsDto2.eventType = "VIEW"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_user
          CreateContenteventsDto2.postID = request.body.postID

          let uniq2 = null;
          uniq2 = await this.addUniqEvent(email_receiverParty, "VIEW", "true", "ACCEPT", email_user, request.body.postID,null);
          CreateContenteventsDto2.uniqEvent = uniq2;

          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.postID = request.body.postID
            CreateInsightlogsDto_receiver.eventInsight = "VIEW"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
          }

          try {
            const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
            idevent1 = resultdata1._id;
            let event1 = resultdata1.eventType.toString();
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

            var getpost = await this.postDisqusSS.findid(request.body.postID);
            var result = getpost.userView.filter((email) => email === email_user);
            if (result.length == 0) {
              await this.postDisqusSS.updateView(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateView(email_receiverParty, email_user, request.body.postID);
              }
            }
            await this.insightsService.updateViewsByID(insightID2);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }


        var datacek = null;

        try {
          datacek = await this.userchallengesService.cekUserjoin(iduser);
        } catch (e) {
          datacek = null;
        }

        if (datacek !== null) {
          let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
          let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
          if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
            var _id_1 = (await this.utilsService.generateId());
            var _id_2 = (await this.utilsService.generateId());
            var CreateContenteventsDto1 = new CreateContenteventsDto();
            CreateContenteventsDto1._id = _id_1
            CreateContenteventsDto1.contentEventID = _id_1
            CreateContenteventsDto1.email = email_user
            CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto1.active = true
            CreateContenteventsDto1.event = "DONE"
            CreateContenteventsDto1.createdAt = current_date
            CreateContenteventsDto1.updatedAt = current_date
            CreateContenteventsDto1.sequenceNumber = 1
            CreateContenteventsDto1.flowIsDone = true
            CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto1.receiverParty = email_receiverParty
            CreateContenteventsDto1.postID = request.body.postID

            let uniq = null;
            uniq = await this.addUniqEvent(email_user, "VIEWCHALLENGE", "true", "DONE", email_receiverParty, request.body.postID,null);
            CreateContenteventsDto1.uniqEvent = uniq;

            var CreateContenteventsDto2 = new CreateContenteventsDto();
            CreateContenteventsDto2._id = _id_2
            CreateContenteventsDto2.contentEventID = _id_2
            CreateContenteventsDto2.email = email_receiverParty
            CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto2.active = true
            CreateContenteventsDto2.event = "ACCEPT"
            CreateContenteventsDto2.createdAt = current_date
            CreateContenteventsDto2.updatedAt = current_date
            CreateContenteventsDto2.sequenceNumber = 1
            CreateContenteventsDto2.flowIsDone = true
            CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto2.senderParty = email_user
            CreateContenteventsDto2.postID = request.body.postID

            let uniq2 = null;
            uniq2 = await this.addUniqEvent(email_receiverParty, "VIEWCHALLENGE", "true", "ACCEPT", email_user, request.body.postID,null);
            CreateContenteventsDto2.uniqEvent = uniq2;


            try {
              let resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
              idevent1 = resultdata1._id;
              let dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

              if (idevent1 !== null) {
                try {
                  // this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
                  this.scoreviewrequest(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty, listchallenge)
                  console.log("sukses hitung score")
                } catch (e) {
                  console.log("gagal ngitung skor" + e)
                }


              }


            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }

          }
        }


      }

      var datapost = await this.postDisqusSS.updatePostviewer(request.body.postID, email_user);

      if (checkexisttemppost == true) {
        await this.tempostSS.updatePostviewer(request.body.postID, email_user);
      }
    }
    else if (eventType == "LIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "LIKE"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.postID = request.body.postID

        let uniq = null;
        uniq = await this.addUniqEvent(email_user, "LIKE", "true", "DONE", email_receiverParty, request.body.postID,null);
        CreateContenteventsDto1.uniqEvent = uniq;

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "LIKE"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.postID = request.body.postID

        let uniq2 = null;
        uniq2 = await this.addUniqEvent(email_receiverParty, "LIKE", "true", "ACCEPT", email_user, request.body.postID,null);
        CreateContenteventsDto2.uniqEvent = uniq2;

        if (await this.utilsService.ceckData(Insight_receiver)) {
          var _id_receiver = (await this.utilsService.generateId());
          var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
          CreateInsightlogsDto_receiver._id = _id_receiver;
          CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
          CreateInsightlogsDto_receiver.createdAt = current_date;
          CreateInsightlogsDto_receiver.updatedAt = current_date;
          CreateInsightlogsDto_receiver.mate = email_user
          CreateInsightlogsDto_receiver.eventInsight = "LIKE"
          CreateInsightlogsDto_receiver.postID = request.body.postID
          CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
          await this.insightlogsService.create(CreateInsightlogsDto_receiver);

          var LogInsught_receiver = Insight_receiver.insightLogs;
          LogInsught_receiver.push({
            $ref: 'insightlogs',
            $id: _id_receiver,
            $db: 'hyppe_content_db',
          });

          var CreateInsightsDto_receiver = new CreateInsightsDto()
          CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
          await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
        }

        try {
          const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
          let idevent1 = resultdata1._id;
          let event1 = resultdata1.eventType.toString();
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
          await this.contenteventsService.create(CreateContenteventsDto2);
          var getpost = await this.postDisqusSS.findid(request.body.postID);
          var result = getpost.userLike.filter((email) => email === email_user);
          if (result.length == 0) {
            await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
            }
          }
          await this.insightsService.updateLikeByID(insightID2);
          if (!isguest) {
            this.sendInteractiveFCM2(email_receiverParty, "LIKE", request.body.postID, email_user);
          }
          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeLike(iduser.toString(), idevent1.toString(), "contentevents", "LIKE", request.body.postID);
          // }
          //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);


          this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);




        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {
        if (ceck_data_DONE.active && ceck_data_DONE.active) {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
            await this.insightsService.updateUnlikeByID(insightID2);
            await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
            }

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
            // const databasic = await this.userbasicsService.findOne(
            //   email_receiverParty
            // );
            // var iduser = null;
            // if (databasic !== null) {
            //   iduser = databasic._id;
            //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
            // }
            // this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
            await this.insightsService.updateLikeByID(insightID2);
            await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
            }

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            // this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);


          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    }
    else if (eventType == "UNLIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        try {
          await this.insightsService.updateUnlikeByID(insightID2);
          await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
          await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
          await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

          if (checkexisttemppost == true) {
            await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
          }

          let idevent1 = ceck_data_DONE._id;
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);

          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
          // }
          //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {

        if (ceck_data_DONE.active != undefined && !ceck_data_ACCEPT.active != undefined) {
          if (ceck_data_DONE.active && ceck_data_ACCEPT.active) {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
              await this.insightsService.updateUnlikeByID(insightID2);
              await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
              }

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
              // }

              //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          } else {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
              await this.insightsService.updateLikeByID(insightID2);
              await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
              }

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "LIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeLike2( idevent1.toString(), "contentevents", "LIKE", request.body.postID);
              // }

              //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          }
        }
      }
    }
    else if (eventType == "UNFOLLOW") {
      if (email_receiverParty != email_user) {
        var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
        var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
        if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
          try {
            await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
            await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
            await this.insightsService.updateUnFollowerByID(insightID2);
            await this.insightsService.updateUnFollowingByID(insightID1);
            await this.insightsService.updateUnFollowByID(insightID1);
            await this.basic2SS.updateunfollowSystem(email_user, email_receiverParty, "FOLLOWER");
            await this.basic2SS.updateunfollowSystem(email_receiverParty, email_user, "FOLLOWING");

            //INSERt UNFOLLOW STREAM
            if (request.body.idMediaStreaming != undefined) {
              const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
              if (await this.utilsService.ceckData(ceckView)) {
                await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), true, false, current_date);
              }
            }

            let idevent1 = ceck_data_FOLLOWING._id;
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNFOLLOW", userbasic1._id);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              // this.userChallengeUnFollow(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW");

              this.scoreunfollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW", listchallenge)
            }

            await this.checkFriendbasedString2(userbasic1, userbasic2, "delete");
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    } else if (eventType == "REACTION") {
      // var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
      // var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
      // if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
      var _id_1 = (await this.utilsService.generateId());
      var _id_2 = (await this.utilsService.generateId());
      var CreateContenteventsDto1 = new CreateContenteventsDto();
      CreateContenteventsDto1._id = _id_1
      CreateContenteventsDto1.contentEventID = _id_1
      CreateContenteventsDto1.email = email_user
      CreateContenteventsDto1.eventType = "REACTION"
      CreateContenteventsDto1.active = true
      CreateContenteventsDto1.event = "DONE"
      CreateContenteventsDto1.createdAt = current_date
      CreateContenteventsDto1.updatedAt = current_date
      CreateContenteventsDto1.sequenceNumber = 1
      CreateContenteventsDto1.flowIsDone = true
      CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto1.receiverParty = email_receiverParty
      CreateContenteventsDto1.reactionUri = request.body.reactionUri
      CreateContenteventsDto1.postID = request.body.postID

      let uniq = null;
      uniq = await this.addUniqEvent(email_user, "REACTION", "true", "DONE", email_receiverParty, request.body.postID,_id_1);
      CreateContenteventsDto1.uniqEvent = uniq;

      var CreateContenteventsDto2 = new CreateContenteventsDto();
      CreateContenteventsDto2._id = _id_2
      CreateContenteventsDto2.contentEventID = _id_2
      CreateContenteventsDto2.email = email_receiverParty
      CreateContenteventsDto2.eventType = "REACTION"
      CreateContenteventsDto2.active = true
      CreateContenteventsDto2.event = "ACCEPT"
      CreateContenteventsDto2.createdAt = current_date
      CreateContenteventsDto2.updatedAt = current_date
      CreateContenteventsDto2.sequenceNumber = 1
      CreateContenteventsDto2.flowIsDone = true
      CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto2.senderParty = email_user
      CreateContenteventsDto2.reactionUri = request.body.reactionUri
      CreateContenteventsDto2.postID = request.body.postID

      let uniq2 = null;
      uniq2 = await this.addUniqEvent(email_receiverParty, "REACTION", "true", "ACCEPT", email_user, request.body.postID,_id_2);
      CreateContenteventsDto2.uniqEvent = uniq2;

      if (await this.utilsService.ceckData(Insight_receiver)) {
        var _id_receiver = (await this.utilsService.generateId());
        var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
        CreateInsightlogsDto_receiver._id = _id_receiver;
        CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
        CreateInsightlogsDto_receiver.createdAt = current_date;
        CreateInsightlogsDto_receiver.updatedAt = current_date;
        CreateInsightlogsDto_receiver.mate = email_user
        CreateInsightlogsDto_receiver.eventInsight = "REACTION"
        CreateInsightlogsDto_receiver.postID = request.body.postID
        CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
        await this.insightlogsService.create(CreateInsightlogsDto_receiver);

        var LogInsught_receiver = Insight_receiver.insightLogs;
        LogInsught_receiver.push({
          $ref: 'insightlogs',
          $id: _id_receiver,
          $db: 'hyppe_content_db',
        });

        var CreateInsightsDto_receiver = new CreateInsightsDto()
        CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
        await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
      }

      //SEND DIRECT MESSAGE
      let retVal = new DisqusResDto();

      //CECk DISQUS CONTACT
      var CeckDataDiscusContact_sender = await this.disquscontactsService.findMayeEmail(email_user, email_receiverParty);
      var CeckDataDiscusContact_receiver = await this.disquscontactsService.findMayeEmail(email_receiverParty, email_user);

      var id_discus_contact = "";
      var id_discus = "";
      var id_discus_log = "";

      var post = await this.postDisqusSS.findByPostId(request.body.postID.toString());
      var media_ = {}
      if (await this.utilsService.ceckData(post.mediaSource[0])) {
        if (post.createdAt != undefined) {
          media_["createdAt"] = post.createdAt;
        }
        if (post.mediaSource[0].mediaBasePath != undefined) {
          media_["mediaBasePath"] = post.mediaSource[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          media_["postType"] = post.postType;
        }
        if (post.mediaSource[0].mediaUri != undefined) {
          media_["mediaUri"] = post.mediaSource[0].mediaUri;
        }
        if (post.mediaSource[0].mediaThumb != undefined) {
          media_["mediaThumbUri"] = post.mediaSource[0].mediaThumb;
        }
        if (post.description != undefined) {
          media_["description"] = post.description;
        }
        if (post.active != undefined) {
          media_["active"] = post.active;
        }
        if (post.mediaSource[0].mediaType != undefined) {
          media_["mediaType"] = post.mediaSource[0].mediaType;
        }
        if (post.postID != undefined) {
          media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
        }
        if (post.postID != undefined) {
          media_["postID"] = post.postID;
        }
        if (post.mediaSource[0].mediaUri != undefined) {
          media_["mediaEndpoint"] = post.mediaSource[0].mediaUri;
        }
        if (post.mediaSource[0].apsara != undefined) {
          media_["apsara"] = post.mediaSource[0].apsara;
        }
        if (post.mediaSource[0].apsaraId != undefined) {
          media_["apsaraId"] = post.mediaSource[0].apsaraId;
        }
      }

      var body_messages = "";
      var body_ = "";
      var dataEmote = await this.reactionsRepoService.findByUrl(request.body.reactionUri);
      var Emote = (await this.utilsService.ceckData(dataEmote)) ? dataEmote.icon : "";
      var Templates_ = await this.utilsService.getTemplate_repo('REACTION', 'NOTIFICATION');
      var get_languages = await this.utilsService.getUserlanguages(email_receiverParty);
      if (get_languages == "en") {
        body_ = Templates_.body_detail.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      } else {
        body_ = Templates_.body_detail_id.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      }

      id_discus_log = await this.utilsService.generateId()
      //INSERT DISQUS LOG
      var CreateDisquslogsDto_ = new Disquslogs();
      try {
        CreateDisquslogsDto_._id = id_discus_log;
        CreateDisquslogsDto_.disqusID = id_discus;
        CreateDisquslogsDto_.active = true;
        CreateDisquslogsDto_.sequenceNumber = 0;
        CreateDisquslogsDto_.postID = request.body.postID.toString();
        CreateDisquslogsDto_.eventInsight = "REACTION";
        CreateDisquslogsDto_.sender = email_user;
        CreateDisquslogsDto_.receiver = email_receiverParty;
        CreateDisquslogsDto_.postType = "txt_msg";
        CreateDisquslogsDto_.createdAt = current_date;
        CreateDisquslogsDto_.updatedAt = current_date;
        CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
        CreateDisquslogsDto_.medias = [media_];
        CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
        CreateDisquslogsDto_.receiverActive = true;
        CreateDisquslogsDto_.senderActive = true;
        this.disquslogsService.create(CreateDisquslogsDto_);
      } catch (error) {
        this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
      }

      //INSERT DISQUS
      var CreateDisqusDto_ = new CreateDisqusDto();
      if ((await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && (await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
        id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
        CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
        if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
        } else {
          //UPDATE DISQUS
          try {
            var data_disqusLogs = CreateDisqusDto_.disqusLogs;
            data_disqusLogs.push({
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            });
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.disqusLogs = data_disqusLogs;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
          }
        }
        retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
        this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
        this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
      } else {
        if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && !(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
          id_discus = await this.utilsService.generateId();
          //INSERT DISQUS CONTACT
          var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
          try {
            id_discus_contact = await this.utilsService.generateId();
            CreateDisquscontactsDto_._id = id_discus_contact;
            CreateDisquscontactsDto_.active = true;
            CreateDisquscontactsDto_.email = email_user;
            CreateDisquscontactsDto_.mate = email_receiverParty;
            CreateDisquscontactsDto_.disqus = {
              $ref: 'disqus',
              $id: id_discus,
              $db: 'hyppe_content_db',
            };
            CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
            this.disquscontactsService.create(CreateDisquscontactsDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
          }
          //INSERT DISQUS CONTACT
          var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
          try {
            id_discus_contact = await this.utilsService.generateId();
            CreateDisquscontactsDto_._id = id_discus_contact;
            CreateDisquscontactsDto_.active = true;
            CreateDisquscontactsDto_.email = email_receiverParty;
            CreateDisquscontactsDto_.mate = email_user;
            CreateDisquscontactsDto_.disqus = {
              $ref: 'disqus',
              $id: id_discus,
              $db: 'hyppe_content_db',
            };
            CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
            this.disquscontactsService.create(CreateDisquscontactsDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
          }
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
          retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
          this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        } else {
          if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender))) {
            //INSERT DISQUS CONTACT
            var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
            try {
              CreateDisquscontactsDto_._id = id_discus_contact;
              CreateDisquscontactsDto_.active = true;
              CreateDisquscontactsDto_.email = email_user;
              CreateDisquscontactsDto_.mate = email_receiverParty;
              CreateDisquscontactsDto_.disqus = {
                $ref: 'disqus',
                $id: id_discus,
                $db: 'hyppe_content_db',
              };
              CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
              this.disquscontactsService.create(CreateDisquscontactsDto_);
            } catch (error) {
              this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
            }
            id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_receiver.disqus))).$id;
            CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
            if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
              //INSERT DISQUS
              try {
                CreateDisqusDto_._id = id_discus;
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.disqusID = id_discus;
                CreateDisqusDto_.active = true;
                CreateDisqusDto_.email = email_user;
                CreateDisqusDto_.mate = email_receiverParty;
                CreateDisqusDto_.eventType = "DIRECT_MSG";
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.createdAt = current_date;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.disqusLogs = [{
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                }];
                CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
                this.disqusContentEventService.create(CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
              }
            } else {
              //UPDATE DISQUS
              try {
                var data_disqusLogs = CreateDisqusDto_.disqusLogs;
                data_disqusLogs.push({
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                });
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.disqusLogs = data_disqusLogs;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
              }
            }
          }
          if (!(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
            //INSERT DISQUS CONTACT
            var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
            try {
              CreateDisquscontactsDto_._id = id_discus_contact;
              CreateDisquscontactsDto_.active = true;
              CreateDisquscontactsDto_.email = email_receiverParty;
              CreateDisquscontactsDto_.mate = email_user;
              CreateDisquscontactsDto_.disqus = {
                $ref: 'disqus',
                $id: id_discus,
                $db: 'hyppe_content_db',
              };
              CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
              this.disquscontactsService.create(CreateDisquscontactsDto_);
            } catch (error) {
              this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
            }
            id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
            CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
            if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
              //INSERT DISQUS
              try {
                CreateDisqusDto_._id = id_discus;
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.disqusID = id_discus;
                CreateDisqusDto_.active = true;
                CreateDisqusDto_.email = email_user;
                CreateDisqusDto_.mate = email_receiverParty;
                CreateDisqusDto_.eventType = "DIRECT_MSG";
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.createdAt = current_date;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.disqusLogs = [{
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                }];
                CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
                this.disqusContentEventService.create(CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
              }
            } else {
              //UPDATE DISQUS
              try {
                var data_disqusLogs = CreateDisqusDto_.disqusLogs;
                data_disqusLogs.push({
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                });
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.disqusLogs = data_disqusLogs;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
              }
            }
          }
          retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
          this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        }
      }

      console.log("retVal", retVal);
      try {
        const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
        let idevent1 = resultdata1._id;
        let event1 = resultdata1.eventType.toString();
        // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
        await this.contenteventsService.create(CreateContenteventsDto2);
        await this.postDisqusSS.updateReaction(email_receiverParty, request.body.postID);

        if (checkexisttemppost == true) {
          await this.tempostSS.updateReaction(email_receiverParty, request.body.postID);
        }
        await this.insightsService.updateReactionsByID(insightID1);
        this.sendInteractiveFCM2(email_receiverParty, "REACTION", request.body.postID, email_user, Emote);
      } catch (error) {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(request.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
      //}
    }

    var fullurl = request.get("Host") + request.originalUrl;
    var timestamps_end = await this.utilsService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(request.body));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
  }

  async synchInteractivev3(request: any, headers: any) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var listchallenge = null;
    var checkexisttemppost = false;
    var uniqEvent = null;

    try {
      listchallenge = request.body.listchallenge;
    } catch (e) {
      listchallenge = null;
    }

    const eventType = request.body.eventType;
    const email_user = headers['x-auth-user'];
    const email_receiverParty = request.body.receiverParty;
    const current_date = await this.utilsService.getDateTimeString();

    var userbasic1 = await this.basic2SS.findbyemail(email_user);
    var userbasic2 = await this.basic2SS.findbyemail(email_receiverParty);

    var insightID1 = JSON.parse(JSON.stringify(userbasic1.insight)).$id;
    var insightID2 = JSON.parse(JSON.stringify(userbasic2.insight)).$id;

    var Insight_sender = await this.insightsService.findOne(insightID1);
    var Insight_receiver = await this.insightsService.findOne(insightID2);

    var iduser = null;
    var isguest = false;
    if (userbasic1 == null || userbasic1 == undefined) {
      var fullurl = request.get("Host") + request.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(request.body));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, auth-user data not found',
      );
    }
    iduser = userbasic1._id;
    isguest = userbasic1.guestMode;

    if (request.body.postID != null && request.body.postID != undefined) {
      var gettemppost = await this.tempostSS.findByPostId(request.body.postID);
      if (await this.utilsService.ceckData(gettemppost)) {
        checkexisttemppost = true;
      }
    }

    if (eventType == "FOLLOWING") {
      if (email_receiverParty != email_user) {
        var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
        var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
        if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_receiverParty
          CreateContenteventsDto1.eventType = "FOLLOWER"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "ACCEPT"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_user
          let uniq = null;
          uniq = await this.addUniqEvent(email_receiverParty, "FOLLOWER", "true", "ACCEPT", email_user, null,null);
          CreateContenteventsDto1.uniqEvent = uniq;

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_user
          CreateContenteventsDto2.eventType = "FOLLOWING"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_receiverParty

          let uniq2 = null;
          uniq2 = await this.addUniqEvent(email_user, "FOLLOWING", "true", "ACCEPT", email_receiverParty, null,null);
          CreateContenteventsDto2.uniqEvent = uniq2;

          if (await this.utilsService.ceckData(Insight_sender)) {
            var _id_sender = (await this.utilsService.generateId());
            var CreateInsightlogsDto_sender = new CreateInsightlogsDto()
            CreateInsightlogsDto_sender._id = _id_sender;
            CreateInsightlogsDto_sender.insightID = Insight_sender._id;
            CreateInsightlogsDto_sender.createdAt = current_date;
            CreateInsightlogsDto_sender.updatedAt = current_date;
            CreateInsightlogsDto_sender.mate = email_receiverParty
            CreateInsightlogsDto_sender.eventInsight = "FOLLOWING"
            CreateInsightlogsDto_sender._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_sender);

            var LogInsught_sensder = Insight_sender.insightLogs;
            LogInsught_sensder.push({
              $ref: 'insightlogs',
              $id: _id_sender,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_sender = new CreateInsightsDto()
            CreateInsightsDto_sender.insightLogs = LogInsught_sensder;
            await this.insightsService.updateoneByID(insightID1, CreateInsightsDto_sender)

          }
          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.eventInsight = "FOLLOWER"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)

          }

          //INSERt FOLOWING STREAM
          if (request.body.idMediaStreaming != undefined) {
            const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
            if (!(await this.utilsService.ceckData(ceckView))) {
              const dataFollower = {
                userId: new mongoose.Types.ObjectId(userbasic1._id.toString()),
                status: true,
                createAt: current_date,
                updateAt: current_date
              }
              await this.mediastreamingService.insertFollower(request.body.idMediaStreaming, dataFollower)
            } else {
              await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), false, true, current_date);
            }
          }

          try {

            try {
              const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
              let idevent1 = resultdata1._id;
              let event1 = resultdata1.eventType.toString();
              const databasic = await this.basic2SS.findbyemail(
                email_user
              );
              var iduser = null;
              if (databasic !== null) {
                iduser = databasic._id;
                // this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
                this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW", listchallenge)
              }

            } catch (e) {

            }
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

            try {
              await this.contenteventsService.create(CreateContenteventsDto2);
            } catch (e) {

            }
            await this.insightsService.updateFollowerByID(insightID2);
            await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
            await this.insightsService.updateFollowingByID(insightID1);
            this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
            await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
            //  this.sendInteractiveFCM2(email_user, "FOLLOWING", "", email_receiverParty);


          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          if (!ceck_data_FOLLOWER.active && !ceck_data_FOLLOWING.active) {
            await this.contenteventsService.updateFollowing(email_user, "FOLLOWING", email_receiverParty);
            await this.contenteventsService.updateFollower(email_receiverParty, "FOLLOWER", email_user);
            await this.insightsService.updateFollowerByID(insightID2);
            await this.insightsService.updateFollowingByID(insightID1);
            await this.basic2SS.updatefollowSystem(email_user, email_receiverParty, "FOLLOWER");
            this.sendInteractiveFCM2(email_receiverParty, "FOLLOWER", "", email_user);
            await this.basic2SS.updatefollowSystem(email_receiverParty, email_user, "FOLLOWING");
            let idevent1 = ceck_data_FOLLOWING._id;
            // let event1 = ceck_data_FOLLOWING.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              //this.userChallengeFollow(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW");
              this.scorefollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "FOLLOW", listchallenge)
            }


          }
        }

        await this.checkFriendbasedString2(userbasic1, userbasic2, "create");
      }
    }
    //  else if (eventType == "VIEW") {

    //   if (email_user !== email_receiverParty) {
    //     var idevent1 = null;
    //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //     var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
    //     var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
    //     if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
    //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
    //       var _id_1 = (await this.utilsService.generateId());
    //       var _id_2 = (await this.utilsService.generateId());
    //       var CreateContenteventsDto1 = new CreateContenteventsDto();
    //       CreateContenteventsDto1._id = _id_1
    //       CreateContenteventsDto1.contentEventID = _id_1
    //       CreateContenteventsDto1.email = email_user
    //       CreateContenteventsDto1.eventType = "VIEW"
    //       CreateContenteventsDto1.active = true
    //       CreateContenteventsDto1.event = "DONE"
    //       CreateContenteventsDto1.createdAt = current_date
    //       CreateContenteventsDto1.updatedAt = current_date
    //       CreateContenteventsDto1.sequenceNumber = 1
    //       CreateContenteventsDto1.flowIsDone = true
    //       CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto1.receiverParty = email_receiverParty
    //       CreateContenteventsDto1.postID = request.body.postID

    //       var CreateContenteventsDto2 = new CreateContenteventsDto();
    //       CreateContenteventsDto2._id = _id_2
    //       CreateContenteventsDto2.contentEventID = _id_2
    //       CreateContenteventsDto2.email = email_receiverParty
    //       CreateContenteventsDto2.eventType = "VIEW"
    //       CreateContenteventsDto2.active = true
    //       CreateContenteventsDto2.event = "ACCEPT"
    //       CreateContenteventsDto2.createdAt = current_date
    //       CreateContenteventsDto2.updatedAt = current_date
    //       CreateContenteventsDto2.sequenceNumber = 1
    //       CreateContenteventsDto2.flowIsDone = true
    //       CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //       CreateContenteventsDto2.senderParty = email_user
    //       CreateContenteventsDto2.postID = request.body.postID



    //       if (await this.utilsService.ceckData(Insight_receiver)) {
    //         var _id_receiver = (await this.utilsService.generateId());
    //         var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
    //         CreateInsightlogsDto_receiver._id = _id_receiver;
    //         CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
    //         CreateInsightlogsDto_receiver.createdAt = current_date;
    //         CreateInsightlogsDto_receiver.updatedAt = current_date;
    //         CreateInsightlogsDto_receiver.mate = email_user
    //         CreateInsightlogsDto_receiver.postID = request.body.postID
    //         CreateInsightlogsDto_receiver.eventInsight = "VIEW"
    //         CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
    //         await this.insightlogsService.create(CreateInsightlogsDto_receiver);

    //         var LogInsught_receiver = Insight_receiver.insightLogs;
    //         LogInsught_receiver.push({
    //           $ref: 'insightlogs',
    //           $id: _id_receiver,
    //           $db: 'hyppe_content_db',
    //         });

    //         var CreateInsightsDto_receiver = new CreateInsightsDto()
    //         CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
    //         await this.insightsService.updateone(email_receiverParty, CreateInsightsDto_receiver)


    //       }

    //       try {
    //         const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //         idevent1 = resultdata1._id;
    //         let event1 = resultdata1.eventType.toString();
    //         //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
    //         var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

    //         await this.postsService.updateView(email_receiverParty, request.body.postID);
    //         await this.insightsService.updateViews(email_receiverParty);


    //       } catch (error) {
    //         var fullurl = request.get("Host") + request.originalUrl;
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         var reqbody = JSON.parse(JSON.stringify(request.body));
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //         await this.errorHandler.generateNotAcceptableException(
    //           'Unabled to proceed, ' +
    //           error,
    //         );
    //       }
    //     }
    //     else {

    //       let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
    //       let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
    //       if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {

    //         var _id_1 = (await this.utilsService.generateId());
    //         var _id_2 = (await this.utilsService.generateId());
    //         var CreateContenteventsDto1 = new CreateContenteventsDto();
    //         CreateContenteventsDto1._id = _id_1
    //         CreateContenteventsDto1.contentEventID = _id_1
    //         CreateContenteventsDto1.email = email_user
    //         CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto1.active = true
    //         CreateContenteventsDto1.event = "DONE"
    //         CreateContenteventsDto1.createdAt = current_date
    //         CreateContenteventsDto1.updatedAt = current_date
    //         CreateContenteventsDto1.sequenceNumber = 1
    //         CreateContenteventsDto1.flowIsDone = true
    //         CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto1.receiverParty = email_receiverParty
    //         CreateContenteventsDto1.postID = request.body.postID

    //         var CreateContenteventsDto2 = new CreateContenteventsDto();
    //         CreateContenteventsDto2._id = _id_2
    //         CreateContenteventsDto2.contentEventID = _id_2
    //         CreateContenteventsDto2.email = email_receiverParty
    //         CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
    //         CreateContenteventsDto2.active = true
    //         CreateContenteventsDto2.event = "ACCEPT"
    //         CreateContenteventsDto2.createdAt = current_date
    //         CreateContenteventsDto2.updatedAt = current_date
    //         CreateContenteventsDto2.sequenceNumber = 1
    //         CreateContenteventsDto2.flowIsDone = true
    //         CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
    //         CreateContenteventsDto2.senderParty = email_user
    //         CreateContenteventsDto2.postID = request.body.postID

    //         try {
    //           var resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
    //           idevent1 = resultdata1._id;
    //           var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);


    //         } catch (error) {
    //           var fullurl = request.get("Host") + request.originalUrl;
    //           var timestamps_end = await this.utilsService.getDateTimeString();
    //           var reqbody = JSON.parse(JSON.stringify(request.body));
    //           this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

    //           await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed, ' +
    //             error,
    //           );
    //         }

    //       }

    //     }
    //     if (idevent1 != null) {
    //       try {
    //         this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
    //         console.log("sukses hitung score")
    //       } catch (e) {
    //         console.log("gagal ngitung skor" + e)
    //       }

    //     }
    //   }
    //   var datapost = await this.NewpostsService.updatePostviewer(request.body.postID, email_user);
    // } 
    else if (eventType == "VIEW") {
      if (email_user !== email_receiverParty) {
        var idevent1 = null;
        var idevent2 = null;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW Email Not Same >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
        var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
        var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
        if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> interactive VIEW ceck_data_DONE && ceck_data_ACCEPT = TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", JSON.stringify({ postID: request.body.postID, email_user: email_user, email_receiverParty: email_receiverParty }));
          var _id_1 = (await this.utilsService.generateId());
          var _id_2 = (await this.utilsService.generateId());
          var CreateContenteventsDto1 = new CreateContenteventsDto();
          CreateContenteventsDto1._id = _id_1
          CreateContenteventsDto1.contentEventID = _id_1
          CreateContenteventsDto1.email = email_user
          CreateContenteventsDto1.eventType = "VIEW"
          CreateContenteventsDto1.active = true
          CreateContenteventsDto1.event = "DONE"
          CreateContenteventsDto1.createdAt = current_date
          CreateContenteventsDto1.updatedAt = current_date
          CreateContenteventsDto1.sequenceNumber = 1
          CreateContenteventsDto1.flowIsDone = true
          CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto1.receiverParty = email_receiverParty
          CreateContenteventsDto1.postID = request.body.postID

          let uniq = null;
          uniq = await this.addUniqEvent(email_user, "VIEW", "true", "DONE", email_receiverParty, request.body.postID,null);
          CreateContenteventsDto1.uniqEvent = uniq;

          var CreateContenteventsDto2 = new CreateContenteventsDto();
          CreateContenteventsDto2._id = _id_2
          CreateContenteventsDto2.contentEventID = _id_2
          CreateContenteventsDto2.email = email_receiverParty
          CreateContenteventsDto2.eventType = "VIEW"
          CreateContenteventsDto2.active = true
          CreateContenteventsDto2.event = "ACCEPT"
          CreateContenteventsDto2.createdAt = current_date
          CreateContenteventsDto2.updatedAt = current_date
          CreateContenteventsDto2.sequenceNumber = 1
          CreateContenteventsDto2.flowIsDone = true
          CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
          CreateContenteventsDto2.senderParty = email_user
          CreateContenteventsDto2.postID = request.body.postID

          let uniq2 = null;
          uniq2 = await this.addUniqEvent(email_receiverParty, "VIEW", "true", "ACCEPT", email_user, request.body.postID,null);
          CreateContenteventsDto2.uniqEvent = uniq2;

          if (await this.utilsService.ceckData(Insight_receiver)) {
            var _id_receiver = (await this.utilsService.generateId());
            var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
            CreateInsightlogsDto_receiver._id = _id_receiver;
            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
            CreateInsightlogsDto_receiver.createdAt = current_date;
            CreateInsightlogsDto_receiver.updatedAt = current_date;
            CreateInsightlogsDto_receiver.mate = email_user
            CreateInsightlogsDto_receiver.postID = request.body.postID
            CreateInsightlogsDto_receiver.eventInsight = "VIEW"
            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

            var LogInsught_receiver = Insight_receiver.insightLogs;
            LogInsught_receiver.push({
              $ref: 'insightlogs',
              $id: _id_receiver,
              $db: 'hyppe_content_db',
            });

            var CreateInsightsDto_receiver = new CreateInsightsDto()
            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
          }

          try {
            const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
            idevent1 = resultdata1._id;
            let event1 = resultdata1.eventType.toString();
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            var dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

            var getpost = await this.postDisqusSS.findid(request.body.postID);
            var result = getpost.userView.filter((email) => email === email_user);
            if (result.length == 0) {
              await this.postDisqusSS.updateView(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateView(email_receiverParty, email_user, request.body.postID);
              }
            }
            await this.insightsService.updateViewsByID(insightID2);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }


        var datacek = null;

        try {
          datacek = await this.userchallengesService.cekUserjoin(iduser);
        } catch (e) {
          datacek = null;
        }

        if (datacek !== null) {
          let ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEWCHALLENGE", "DONE", email_receiverParty, "", request.body.postID);
          let ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEWCHALLENGE", "ACCEPT", "", email_user, request.body.postID);
          if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
            var _id_1 = (await this.utilsService.generateId());
            var _id_2 = (await this.utilsService.generateId());
            var CreateContenteventsDto1 = new CreateContenteventsDto();
            CreateContenteventsDto1._id = _id_1
            CreateContenteventsDto1.contentEventID = _id_1
            CreateContenteventsDto1.email = email_user
            CreateContenteventsDto1.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto1.active = true
            CreateContenteventsDto1.event = "DONE"
            CreateContenteventsDto1.createdAt = current_date
            CreateContenteventsDto1.updatedAt = current_date
            CreateContenteventsDto1.sequenceNumber = 1
            CreateContenteventsDto1.flowIsDone = true
            CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto1.receiverParty = email_receiverParty
            CreateContenteventsDto1.postID = request.body.postID

            let uniq = null;
            uniq = await this.addUniqEvent(email_user, "VIEWCHALLENGE", "true", "DONE", email_receiverParty, request.body.postID,null);
            CreateContenteventsDto1.uniqEvent = uniq;

            var CreateContenteventsDto2 = new CreateContenteventsDto();
            CreateContenteventsDto2._id = _id_2
            CreateContenteventsDto2.contentEventID = _id_2
            CreateContenteventsDto2.email = email_receiverParty
            CreateContenteventsDto2.eventType = "VIEWCHALLENGE"
            CreateContenteventsDto2.active = true
            CreateContenteventsDto2.event = "ACCEPT"
            CreateContenteventsDto2.createdAt = current_date
            CreateContenteventsDto2.updatedAt = current_date
            CreateContenteventsDto2.sequenceNumber = 1
            CreateContenteventsDto2.flowIsDone = true
            CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
            CreateContenteventsDto2.senderParty = email_user
            CreateContenteventsDto2.postID = request.body.postID

            let uniq2 = null;
            uniq2 = await this.addUniqEvent(email_receiverParty, "VIEWCHALLENGE", "true", "ACCEPT", email_user, request.body.postID,null);
            CreateContenteventsDto2.uniqEvent = uniq2;


            try {
              let resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
              idevent1 = resultdata1._id;
              let dataconten = await this.contenteventsService.create(CreateContenteventsDto2);

              if (idevent1 !== null) {
                try {
                  // this.userChallengeViewv3(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty);
                  this.scoreviewrequest(idevent1.toString(), "contentevents", "VIEW", request.body.postID, email_user, email_receiverParty, listchallenge)
                  console.log("sukses hitung score")
                } catch (e) {
                  console.log("gagal ngitung skor" + e)
                }


              }


            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }

          }
        }


      }

      var datapost = await this.postDisqusSS.updatePostviewer(request.body.postID, email_user);

      if (checkexisttemppost == true) {
        await this.tempostSS.updatePostviewer(request.body.postID, email_user);
      }
    }
    else if (eventType == "LIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "LIKE"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.postID = request.body.postID

        let uniq = null;
        uniq = await this.addUniqEvent(email_user, "LIKE", "true", "DONE", email_receiverParty, request.body.postID,null);
        CreateContenteventsDto1.uniqEvent = uniq;

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "LIKE"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.postID = request.body.postID

        let uniq2 = null;
        uniq2 = await this.addUniqEvent(email_receiverParty, "LIKE", "true", "ACCEPT", email_user, request.body.postID,null);
        CreateContenteventsDto2.uniqEvent = uniq2;

        if (await this.utilsService.ceckData(Insight_receiver)) {
          var _id_receiver = (await this.utilsService.generateId());
          var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
          CreateInsightlogsDto_receiver._id = _id_receiver;
          CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
          CreateInsightlogsDto_receiver.createdAt = current_date;
          CreateInsightlogsDto_receiver.updatedAt = current_date;
          CreateInsightlogsDto_receiver.mate = email_user
          CreateInsightlogsDto_receiver.eventInsight = "LIKE"
          CreateInsightlogsDto_receiver.postID = request.body.postID
          CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
          await this.insightlogsService.create(CreateInsightlogsDto_receiver);

          var LogInsught_receiver = Insight_receiver.insightLogs;
          LogInsught_receiver.push({
            $ref: 'insightlogs',
            $id: _id_receiver,
            $db: 'hyppe_content_db',
          });

          var CreateInsightsDto_receiver = new CreateInsightsDto()
          CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
          await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
        }

        try {
          const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
          let idevent1 = resultdata1._id;
          let event1 = resultdata1.eventType.toString();
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
          await this.contenteventsService.create(CreateContenteventsDto2);
          var getpost = await this.postDisqusSS.findid(request.body.postID);
          var result = getpost.userLike.filter((email) => email === email_user);
          if (result.length == 0) {
            await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
            }
          }
          await this.insightsService.updateLikeByID(insightID2);
          if (!isguest) {
            this.sendInteractiveFCM2(email_receiverParty, "LIKE", request.body.postID, email_user);
          }
          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeLike(iduser.toString(), idevent1.toString(), "contentevents", "LIKE", request.body.postID);
          // }
          //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);


          this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);




        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {
        if (ceck_data_DONE.active && ceck_data_DONE.active) {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
            await this.insightsService.updateUnlikeByID(insightID2);
            await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
            }

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            //  await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
            // const databasic = await this.userbasicsService.findOne(
            //   email_receiverParty
            // );
            // var iduser = null;
            // if (databasic !== null) {
            //   iduser = databasic._id;
            //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
            // }
            // this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

            this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        } else {
          try {
            await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
            await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
            await this.insightsService.updateLikeByID(insightID2);
            await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

            if (checkexisttemppost == true) {
              await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
            }

            let idevent1 = ceck_data_DONE._id;
            let event1 = ceck_data_DONE.eventType.toString();
            // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
            // this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            // this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

            this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);


          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    }
    else if (eventType == "UNLIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        try {
          await this.insightsService.updateUnlikeByID(insightID2);
          await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
          await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
          await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

          if (checkexisttemppost == true) {
            await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
          }

          let idevent1 = ceck_data_DONE._id;
          // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);

          // const databasic = await this.userbasicsService.findOne(
          //   email_receiverParty
          // );
          // var iduser = null;
          // if (databasic !== null) {
          //   iduser = databasic._id;
          //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
          // }
          //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          //this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

          this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
        } catch (error) {
          var fullurl = request.get("Host") + request.originalUrl;
          var timestamps_end = await this.utilsService.getDateTimeString();
          var reqbody = JSON.parse(JSON.stringify(request.body));
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      } else {

        if (ceck_data_DONE.active != undefined && !ceck_data_ACCEPT.active != undefined) {
          if (ceck_data_DONE.active && ceck_data_ACCEPT.active) {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, false);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, false);
              await this.insightsService.updateUnlikeByID(insightID2);
              await this.postDisqusSS.updateUnLike(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateUnLike(email_receiverParty, email_user, request.body.postID);
              }

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNLIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeUnLike(iduser.toString(), idevent1.toString(), "contentevents", "UNLIKE", request.body.postID);
              // }

              //this.userChallengeUnLike2(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              // this.userChallengeUnLike3(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty);

              this.scoreunlikerequest(idevent1.toString(), "contentevents", "UNLIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          } else {
            try {
              await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID, true);
              await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID, true);
              await this.insightsService.updateLikeByID(insightID2);
              await this.postDisqusSS.updateLike(email_receiverParty, email_user, request.body.postID);

              if (checkexisttemppost == true) {
                await this.tempostSS.updateLike(email_receiverParty, email_user, request.body.postID);
              }

              let idevent1 = ceck_data_DONE._id;
              // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "LIKE", userbasic1._id);
              // const databasic = await this.userbasicsService.findOne(
              //   email_receiverParty
              // );
              // var iduser = null;
              // if (databasic !== null) {
              //   iduser = databasic._id;
              //   this.userChallengeLike2( idevent1.toString(), "contentevents", "LIKE", request.body.postID);
              // }

              //this.userChallengeLike2(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              //this.userChallengeLike3(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty);

              this.scorelikerequest(idevent1.toString(), "contentevents", "LIKE", request.body.postID, email_user, email_receiverParty, listchallenge);
            } catch (error) {
              var fullurl = request.get("Host") + request.originalUrl;
              var timestamps_end = await this.utilsService.getDateTimeString();
              var reqbody = JSON.parse(JSON.stringify(request.body));
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' +
                error,
              );
            }
          }
        }
      }
    }
    else if (eventType == "UNFOLLOW") {
      if (email_receiverParty != email_user) {
        var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
        var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
        if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
          try {
            await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
            await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
            await this.insightsService.updateUnFollowerByID(insightID2);
            await this.insightsService.updateUnFollowingByID(insightID1);
            await this.insightsService.updateUnFollowByID(insightID1);
            await this.basic2SS.updateunfollowSystem(email_user, email_receiverParty, "FOLLOWER");
            await this.basic2SS.updateunfollowSystem(email_receiverParty, email_user, "FOLLOWING");

            //INSERt UNFOLLOW STREAM
            if (request.body.idMediaStreaming != undefined) {
              const ceckView = await this.mediastreamingService.findFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString());
              if (await this.utilsService.ceckData(ceckView)) {
                await this.mediastreamingService.updateFollower(request.body.idMediaStreaming.toString(), userbasic1._id.toString(), true, false, current_date);
              }
            }

            let idevent1 = ceck_data_FOLLOWING._id;
            //await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, "UNFOLLOW", userbasic1._id);

            const databasic = await this.basic2SS.findbyemail(
              email_user
            );
            var iduser = null;
            if (databasic !== null) {
              iduser = databasic._id;
              // this.userChallengeUnFollow(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW");

              this.scoreunfollowrequest(iduser.toString(), idevent1.toString(), "contentevents", "UNFOLLOW", listchallenge)
            }

            await this.checkFriendbasedString2(userbasic1, userbasic2, "delete");
          } catch (error) {
            var fullurl = request.get("Host") + request.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            var reqbody = JSON.parse(JSON.stringify(request.body));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, ' +
              error,
            );
          }
        }
      }
    } else if (eventType == "REACTION") {
      // var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
      // var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
      // if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
      var _id_1 = (await this.utilsService.generateId());
      var _id_2 = (await this.utilsService.generateId());
      var CreateContenteventsDto1 = new CreateContenteventsDto();
      CreateContenteventsDto1._id = _id_1
      CreateContenteventsDto1.contentEventID = _id_1
      CreateContenteventsDto1.email = email_user
      CreateContenteventsDto1.eventType = "REACTION"
      CreateContenteventsDto1.active = true
      CreateContenteventsDto1.event = "DONE"
      CreateContenteventsDto1.createdAt = current_date
      CreateContenteventsDto1.updatedAt = current_date
      CreateContenteventsDto1.sequenceNumber = 1
      CreateContenteventsDto1.flowIsDone = true
      CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto1.receiverParty = email_receiverParty
      CreateContenteventsDto1.reactionUri = request.body.reactionUri
      CreateContenteventsDto1.postID = request.body.postID

      let uniq = null;
      uniq = await this.addUniqEvent(email_user, "REACTION", "true", "DONE", email_receiverParty, request.body.postID,_id_1);
      CreateContenteventsDto1.uniqEvent = uniq;

      var CreateContenteventsDto2 = new CreateContenteventsDto();
      CreateContenteventsDto2._id = _id_2
      CreateContenteventsDto2.contentEventID = _id_2
      CreateContenteventsDto2.email = email_receiverParty
      CreateContenteventsDto2.eventType = "REACTION"
      CreateContenteventsDto2.active = true
      CreateContenteventsDto2.event = "ACCEPT"
      CreateContenteventsDto2.createdAt = current_date
      CreateContenteventsDto2.updatedAt = current_date
      CreateContenteventsDto2.sequenceNumber = 1
      CreateContenteventsDto2.flowIsDone = true
      CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
      CreateContenteventsDto2.senderParty = email_user
      CreateContenteventsDto2.reactionUri = request.body.reactionUri
      CreateContenteventsDto2.postID = request.body.postID

      let uniq2 = null;
      uniq2 = await this.addUniqEvent(email_receiverParty, "REACTION", "true", "ACCEPT", email_user, request.body.postID,_id_2);
      CreateContenteventsDto2.uniqEvent = uniq2;

      if (await this.utilsService.ceckData(Insight_receiver)) {
        var _id_receiver = (await this.utilsService.generateId());
        var CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
        CreateInsightlogsDto_receiver._id = _id_receiver;
        CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
        CreateInsightlogsDto_receiver.createdAt = current_date;
        CreateInsightlogsDto_receiver.updatedAt = current_date;
        CreateInsightlogsDto_receiver.mate = email_user
        CreateInsightlogsDto_receiver.eventInsight = "REACTION"
        CreateInsightlogsDto_receiver.postID = request.body.postID
        CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
        await this.insightlogsService.create(CreateInsightlogsDto_receiver);

        var LogInsught_receiver = Insight_receiver.insightLogs;
        LogInsught_receiver.push({
          $ref: 'insightlogs',
          $id: _id_receiver,
          $db: 'hyppe_content_db',
        });

        var CreateInsightsDto_receiver = new CreateInsightsDto()
        CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
        await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
      }

      //SEND DIRECT MESSAGE
      let retVal = new DisqusResDto();

      //CECk DISQUS CONTACT
      var CeckDataDiscusContact_sender = await this.disquscontactsService.findMayeEmail(email_user, email_receiverParty);
      var CeckDataDiscusContact_receiver = await this.disquscontactsService.findMayeEmail(email_receiverParty, email_user);

      var id_discus_contact = "";
      var id_discus = "";
      var id_discus_log = "";

      var post = await this.postDisqusSS.findByPostId(request.body.postID.toString());
      var media_ = {}
      if (await this.utilsService.ceckData(post.mediaSource[0])) {
        if (post.createdAt != undefined) {
          media_["createdAt"] = post.createdAt;
        }
        if (post.mediaSource[0].mediaBasePath != undefined) {
          media_["mediaBasePath"] = post.mediaSource[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          media_["postType"] = post.postType;
        }
        if (post.mediaSource[0].mediaUri != undefined) {
          media_["mediaUri"] = post.mediaSource[0].mediaUri;
        }
        if (post.mediaSource[0].mediaThumb != undefined) {
          media_["mediaThumbUri"] = post.mediaSource[0].mediaThumb;
        }
        if (post.description != undefined) {
          media_["description"] = post.description;
        }
        if (post.active != undefined) {
          media_["active"] = post.active;
        }
        if (post.mediaSource[0].mediaType != undefined) {
          media_["mediaType"] = post.mediaSource[0].mediaType;
        }
        if (post.postID != undefined) {
          media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
        }
        if (post.postID != undefined) {
          media_["postID"] = post.postID;
        }
        if (post.mediaSource[0].mediaUri != undefined) {
          media_["mediaEndpoint"] = post.mediaSource[0].mediaUri;
        }
        if (post.mediaSource[0].apsara != undefined) {
          media_["apsara"] = post.mediaSource[0].apsara;
        }
        if (post.mediaSource[0].apsaraId != undefined) {
          media_["apsaraId"] = post.mediaSource[0].apsaraId;
        }
      }

      var body_messages = "";
      var body_ = "";
      var dataEmote = await this.reactionsRepoService.findByUrl(request.body.reactionUri);
      var Emote = (await this.utilsService.ceckData(dataEmote)) ? dataEmote.icon : "";
      var Templates_ = await this.utilsService.getTemplate_repo('REACTION', 'NOTIFICATION');
      var get_languages = await this.utilsService.getUserlanguages(email_receiverParty);
      if (get_languages == "en") {
        body_ = Templates_.body_detail.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      } else {
        body_ = Templates_.body_detail_id.toString()
        body_messages = body_.toString().replace("${emoticon}", Emote.toString())
      }

      id_discus_log = await this.utilsService.generateId()
      //INSERT DISQUS LOG
      var CreateDisquslogsDto_ = new Disquslogs();
      try {
        CreateDisquslogsDto_._id = id_discus_log;
        CreateDisquslogsDto_.disqusID = id_discus;
        CreateDisquslogsDto_.active = true;
        CreateDisquslogsDto_.sequenceNumber = 0;
        CreateDisquslogsDto_.postID = request.body.postID.toString();
        CreateDisquslogsDto_.eventInsight = "REACTION";
        CreateDisquslogsDto_.sender = email_user;
        CreateDisquslogsDto_.receiver = email_receiverParty;
        CreateDisquslogsDto_.postType = "txt_msg";
        CreateDisquslogsDto_.createdAt = current_date;
        CreateDisquslogsDto_.updatedAt = current_date;
        CreateDisquslogsDto_.reactionUri = request.body.reactionUri;
        CreateDisquslogsDto_.medias = [media_];
        CreateDisquslogsDto_._class = "io.melody.hyppe.content.domain.DisqusLog";
        CreateDisquslogsDto_.receiverActive = true;
        CreateDisquslogsDto_.senderActive = true;
        this.disquslogsService.create(CreateDisquslogsDto_);
      } catch (error) {
        this.logger.log("ERROR INSERT DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
      }

      //INSERT DISQUS
      var CreateDisqusDto_ = new CreateDisqusDto();
      if ((await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && (await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
        id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
        CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
        if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
        } else {
          //UPDATE DISQUS
          try {
            var data_disqusLogs = CreateDisqusDto_.disqusLogs;
            data_disqusLogs.push({
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            });
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.disqusLogs = data_disqusLogs;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
          }
        }
        retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
        this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
        this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
      } else {
        if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender)) && !(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
          id_discus = await this.utilsService.generateId();
          //INSERT DISQUS CONTACT
          var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
          try {
            id_discus_contact = await this.utilsService.generateId();
            CreateDisquscontactsDto_._id = id_discus_contact;
            CreateDisquscontactsDto_.active = true;
            CreateDisquscontactsDto_.email = email_user;
            CreateDisquscontactsDto_.mate = email_receiverParty;
            CreateDisquscontactsDto_.disqus = {
              $ref: 'disqus',
              $id: id_discus,
              $db: 'hyppe_content_db',
            };
            CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
            this.disquscontactsService.create(CreateDisquscontactsDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
          }
          //INSERT DISQUS CONTACT
          var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
          try {
            id_discus_contact = await this.utilsService.generateId();
            CreateDisquscontactsDto_._id = id_discus_contact;
            CreateDisquscontactsDto_.active = true;
            CreateDisquscontactsDto_.email = email_receiverParty;
            CreateDisquscontactsDto_.mate = email_user;
            CreateDisquscontactsDto_.disqus = {
              $ref: 'disqus',
              $id: id_discus,
              $db: 'hyppe_content_db',
            };
            CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
            this.disquscontactsService.create(CreateDisquscontactsDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
          }
          //INSERT DISQUS
          try {
            CreateDisqusDto_._id = id_discus;
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.disqusID = id_discus;
            CreateDisqusDto_.active = true;
            CreateDisqusDto_.email = email_user;
            CreateDisqusDto_.mate = email_receiverParty;
            CreateDisqusDto_.eventType = "DIRECT_MSG";
            CreateDisqusDto_.room = id_discus;
            CreateDisqusDto_.createdAt = current_date;
            CreateDisqusDto_.updatedAt = current_date;
            CreateDisqusDto_.lastestMessage = Emote.toString();
            CreateDisqusDto_.emailActive = true;
            CreateDisqusDto_.mateActive = true;
            CreateDisqusDto_.disqusLogs = [{
              $ref: 'disquslogs',
              $id: id_discus_log,
              $db: 'hyppe_content_db',
            }];
            CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
            this.disqusContentEventService.create(CreateDisqusDto_);
          } catch (error) {
            this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
          }
          retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
          this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        } else {
          if (!(await this.utilsService.ceckData(CeckDataDiscusContact_sender))) {
            //INSERT DISQUS CONTACT
            var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
            try {
              CreateDisquscontactsDto_._id = id_discus_contact;
              CreateDisquscontactsDto_.active = true;
              CreateDisquscontactsDto_.email = email_user;
              CreateDisquscontactsDto_.mate = email_receiverParty;
              CreateDisquscontactsDto_.disqus = {
                $ref: 'disqus',
                $id: id_discus,
                $db: 'hyppe_content_db',
              };
              CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
              this.disquscontactsService.create(CreateDisquscontactsDto_);
            } catch (error) {
              this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
            }
            id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_receiver.disqus))).$id;
            CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
            if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
              //INSERT DISQUS
              try {
                CreateDisqusDto_._id = id_discus;
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.disqusID = id_discus;
                CreateDisqusDto_.active = true;
                CreateDisqusDto_.email = email_user;
                CreateDisqusDto_.mate = email_receiverParty;
                CreateDisqusDto_.eventType = "DIRECT_MSG";
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.createdAt = current_date;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.disqusLogs = [{
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                }];
                CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
                this.disqusContentEventService.create(CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
              }
            } else {
              //UPDATE DISQUS
              try {
                var data_disqusLogs = CreateDisqusDto_.disqusLogs;
                data_disqusLogs.push({
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                });
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.disqusLogs = data_disqusLogs;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
              }
            }
          }
          if (!(await this.utilsService.ceckData(CeckDataDiscusContact_receiver))) {
            //INSERT DISQUS CONTACT
            var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
            try {
              CreateDisquscontactsDto_._id = id_discus_contact;
              CreateDisquscontactsDto_.active = true;
              CreateDisquscontactsDto_.email = email_receiverParty;
              CreateDisquscontactsDto_.mate = email_user;
              CreateDisquscontactsDto_.disqus = {
                $ref: 'disqus',
                $id: id_discus,
                $db: 'hyppe_content_db',
              };
              CreateDisquscontactsDto_._class = "io.melody.hyppe.content.domain.DisqusContact";
              this.disquscontactsService.create(CreateDisquscontactsDto_);
            } catch (error) {
              this.logger.log("ERROR INSERT DISQUS CONTACT >>>>>>>>>>>>>>>>>>> ", error);
            }
            id_discus = (JSON.parse(JSON.stringify(CeckDataDiscusContact_sender.disqus))).$id;
            CreateDisqusDto_ = await this.disqusContentEventService.findById(id_discus);
            if (!(await this.utilsService.ceckData(CreateDisqusDto_))) {
              //INSERT DISQUS
              try {
                CreateDisqusDto_._id = id_discus;
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.disqusID = id_discus;
                CreateDisqusDto_.active = true;
                CreateDisqusDto_.email = email_user;
                CreateDisqusDto_.mate = email_receiverParty;
                CreateDisqusDto_.eventType = "DIRECT_MSG";
                CreateDisqusDto_.room = id_discus;
                CreateDisqusDto_.createdAt = current_date;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.disqusLogs = [{
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                }];
                CreateDisqusDto_._class = "io.melody.hyppe.content.domain.Disqus";
                this.disqusContentEventService.create(CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR INSERT DISQUS >>>>>>>>>>>>>>>>>>> ", error);
              }
            } else {
              //UPDATE DISQUS
              try {
                var data_disqusLogs = CreateDisqusDto_.disqusLogs;
                data_disqusLogs.push({
                  $ref: 'disquslogs',
                  $id: id_discus_log,
                  $db: 'hyppe_content_db',
                });
                CreateDisqusDto_.emailActive = true;
                CreateDisqusDto_.mateActive = true;
                CreateDisqusDto_.updatedAt = current_date;
                CreateDisqusDto_.disqusLogs = data_disqusLogs;
                CreateDisqusDto_.lastestMessage = Emote.toString();
                this.disqusContentEventService.update(id_discus, CreateDisqusDto_);
              } catch (error) {
                this.logger.log("ERROR UPDATE DISQUS LOG >>>>>>>>>>>>>>>>>>> ", error);
              }
            }
          }
          retVal = await this.disqusContentEventController.buildDisqus(CreateDisqusDto_, CreateDisquslogsDto_, body_messages);
          this.logger.log("REVAL DATA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", JSON.stringify(retVal));
          this.disqusContentEventService.sendDMNotif(String(retVal.room), JSON.stringify(retVal));
        }
      }

      console.log("retVal", retVal);
      try {
        const resultdata1 = await this.contenteventsService.create(CreateContenteventsDto1);
        let idevent1 = resultdata1._id;
        let event1 = resultdata1.eventType.toString();
        // await this.utilsService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
        await this.contenteventsService.create(CreateContenteventsDto2);
        await this.postDisqusSS.updateReaction(email_receiverParty, request.body.postID);

        if (checkexisttemppost == true) {
          await this.tempostSS.updateReaction(email_receiverParty, request.body.postID);
        }
        await this.insightsService.updateReactionsByID(insightID1);
        this.sendInteractiveFCM2(email_receiverParty, "REACTION", request.body.postID, email_user, Emote);
      } catch (error) {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(request.body));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
      //}
    }

    var fullurl = request.get("Host") + request.originalUrl;
    var timestamps_end = await this.utilsService.getDateTimeString();
    var reqbody = JSON.parse(JSON.stringify(request.body));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
  }
  async scoreunlikerequest(idevent: string, namatabel: string, event: string, postID: string, email_user: string, email_receiverParty: string, listchallenge: any[]) {
    await this.contenteventsService.scoreunlikerequest(idevent, namatabel, event, postID, email_user, email_receiverParty, listchallenge)
  }
  async scorelikerequest(idevent: string, namatabel: string, event: string, postID: string, email_user: string, email_receiverParty: string, listchallenge: any[]) {
    await this.contenteventsService.scorelikerequest(idevent, namatabel, event, postID, email_user, email_receiverParty, listchallenge)
  }

  async scoreviewrequest(idevent: string, namatabel: string, event: string, postID: string, email_user: string, email_receiverParty: string, listchallenge: any[]) {
    await this.contenteventsService.scoreviewrequest(idevent, namatabel, event, postID, email_user, email_receiverParty, listchallenge)
  }
  async scorefollowrequest(iduser: string, idevent: string, namatabel: string, event: string, listchallenge: any[]) {
    await this.contenteventsService.scorefollowrequest(iduser, idevent, namatabel, event, listchallenge)
  }

  async scoreunfollowrequest(iduser: string, idevent: string, namatabel: string, event: string, listchallenge: any[]) {
    await this.contenteventsService.scoreunfollowrequest(iduser, idevent, namatabel, event, listchallenge)
  }

  async addUniqEvent(email_receiverParty: string, eventType: string, active: string, event: string, email_user: string, postID: string,id:string) {
    var uniqEvent = null;
    var arrData = [];

    if(eventType=="REACTION"){
      uniqEvent = email_receiverParty + "," + eventType + "," + active + "," + event + "," + email_user + "," + postID + "," + id;
    }else{
    uniqEvent = email_receiverParty + "," + eventType + "," + active + "," + event + "," + email_user + "," + postID;
    }
    arrData.push(uniqEvent);
    return arrData;
  }
}
