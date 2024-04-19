import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Posttask, PosttaskDocument } from './schemas/posttask.schema';
import { ScheduleinjectService } from '../../schedule/scheduleinject/scheduleinject.service';
import { DummyuserService } from '../../trans/dummyuser/dummyuser.service';
import { HistoryuserService } from '../../content/historyuser/historyuser.service';
import { NewpostService } from '../../content/disqus/newpost/newpost.service';
import { ContenteventsService } from '../../content/contentevents/contentevents.service';
import { ContentEventId, CreateContenteventsDto } from '../../content/contentevents/dto/create-contentevents.dto';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { Historyuser } from '../../content/historyuser/schemas/historyuser.schema';
import { Scheduleinject } from '../../schedule/scheduleinject/schemas/scheduleinject.schema';
import { CreateInsightsDto } from '../insights/dto/create-insights.dto';
import { InsightsService } from '../insights/insights.service';
import { InsightlogsService } from '../insightlogs/insightlogs.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateInsightlogsDto } from '../insightlogs/dto/create-insightlogs.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
 import { TemppostService } from '../temppost/temppost.service';
@Injectable()
export class PosttaskService {

    constructor(
        @InjectModel(Posttask.name, 'SERVER_FULL_CRON')
        private readonly PosttaskModel: Model<PosttaskDocument>,
        private readonly ScheduleinjectService: ScheduleinjectService,
        private readonly DummyuserService: DummyuserService,
        private readonly HistoryuserService: HistoryuserService,
        private readonly NewpostService: NewpostService,
        private readonly ContenteventsService: ContenteventsService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly insightsService: InsightsService,
        private readonly insightlogsService: InsightlogsService,
        private readonly basic2SS: UserbasicnewService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly TemppostService: TemppostService,
    ) { }

    async create(Posttask_: Posttask): Promise<Posttask> {
        const _Posttask_ = await this.PosttaskModel.create(Posttask_);
        return _Posttask_;
    }

    async findOne(id: string): Promise<Posttask> {
        return this.PosttaskModel.findOne({ _id: new Types.ObjectId(id), active: true }).exec();
    }
    async findBypostID(postID: string): Promise<Posttask> {
        return this.PosttaskModel.findOne({ postID: postID }).exec();
    }

    async find(): Promise<Posttask[]> {
        return this.PosttaskModel.find({ active: true }).exec();
    }

    async update(id: string, Posttask_: Posttask): Promise<Posttask> {
        let data = await this.PosttaskModel.findByIdAndUpdate(id, Posttask_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }


        return data;
    }

    async updateView(email: string, postID: string) {
        this.PosttaskModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            { $inc: { viewCount: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateLike(email: string, postID: string) {
        this.PosttaskModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            { $inc: { likeCount: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateTotalInject(email: string, postID: string) {
        this.PosttaskModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            { $inc: { totalInject: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async delete(id: string) {
        const data = await this.PosttaskModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.PosttaskModel.updateOne({ "_id": id },
            {
                $set: {
                    "active": false
                }
            });
        return data;
    }

    async runCronSchedule() {

        try {
            this.taskSchedule();
        } catch (e) {

        }

    }

    async runCronTask() {

        var start = null;
        var end = null;

        const current_date = await this.utilsService.getDateTimeString();

        var splittime = current_date.split(" ");

        var time1 = splittime[1].toString();
        var time2 = time1.split(":")[0];
        console.log("============================ session jam " + time2 + " ===============================")

        if (time2 == "07") {
            start = splittime[0].toString() + " " + "07:00:00";
            end = splittime[0].toString() + " " + "08:00:00";
        }
        else if (time2 == "08") {
            start = splittime[0].toString() + " " + "08:00:00";
            end = splittime[0].toString() + " " + "09:00:00";
        }
        else if (time2 == "09") {
            start = splittime[0].toString() + " " + "09:00:00";
            end = splittime[0].toString() + " " + "10:00:00";
        }
        else if (time2 == "10") {
            start = splittime[0].toString() + " " + "10:00:00";
            end = splittime[0].toString() + " " + "11:00:00";
        }
        else if (time2 == "11") {
            start = splittime[0].toString() + " " + "11:00:00";
            end = splittime[0].toString() + " " + "12:00:00";
        }
        else if (time2 == "12") {
            start = splittime[0].toString() + " " + "12:00:00";
            end = splittime[0].toString() + " " + "13:00:00";
        }
        else if (time2 == "13") {
            start = splittime[0].toString() + " " + "13:00:00";
            end = splittime[0].toString() + " " + "14:00:00";
        }
        else if (time2 == "14") {
            start = splittime[0].toString() + " " + "14:00:00";
            end = splittime[0].toString() + " " + "15:00:00";
        }
        else if (time2 == "15") {
            start = splittime[0].toString() + " " + "15:00:00";
            end = splittime[0].toString() + " " + "16:00:00";
        }
        else if (time2 == "16") {
            start = splittime[0].toString() + " " + "16:00:00";
            end = splittime[0].toString() + " " + "17:00:00";
        }
        else if (time2 == "17") {
            start = splittime[0].toString() + " " + "17:00:00";
            end = splittime[0].toString() + " " + "18:00:00";
        }
        else if (time2 == "18") {
            start = splittime[0].toString() + " " + "18:00:00";
            end = splittime[0].toString() + " " + "19:00:00";
        }
        else if (time2 == "19") {
            start = splittime[0].toString() + " " + "19:00:00";
            end = splittime[0].toString() + " " + "20:00:00";
        }
        else if (time2 == "20") {
            start = splittime[0].toString() + " " + "20:00:00";
            end = splittime[0].toString() + " " + "21:00:00";
        }
        else if (time2 == "21") {
            start = splittime[0].toString() + " " + "21:00:00";
            end = splittime[0].toString() + " " + "22:00:00";
        }
        try {
            this.taskpost(start, end);
            //this.taskpost();
        } catch (e) {

        }

        console.log("============================ FINISH ===============================")

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
        var posts = await this.NewpostService.findByPostId(postID);
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

    async taskpost(start: string, end: string) {
        // async taskpost(){
        var dataposttask = null;
        var datanewpost = null;
        var datauser = null;
        var lengtuser = null;
        var dataloglike = null;
        var datalogview = null;
        var current_date = await this.utilsService.getDateTimeString();

        try {
            dataposttask = await this.ScheduleinjectService.listdetailold(start, end);
        } catch (e) {
            dataposttask = null;
        }

        if (dataposttask !== null) {
            if (dataposttask.length > 0) {
                for (let i = 0; i < dataposttask.length; i++) {
                    var viewCount = 0;
                    var likeCount = 0;
                    var time = null;
                    let postID = null;


                    try {
                        postID = dataposttask[i].postID;
                    } catch (e) {
                        postID = null;
                    }
                    let email_receiverParty = dataposttask[i].emailPost;
                    try {
                        likeCount = dataposttask[i].likeCount;
                    } catch (e) {
                        likeCount = 0;
                    }
                    try {
                        viewCount = dataposttask[i].viewCount;
                    } catch (e) {
                        viewCount = 0;
                    }

                    try {
                        datauser = await this.DummyuserService.findRandom();
                    } catch (e) {
                        datauser = null;
                    }
                    try {
                        datanewpost = await this.NewpostService.findByPostId(postID);
                    } catch (e) {
                        datanewpost = null;
                    }

                    if (datanewpost !== null) {

                        var userLike = null;
                        var active = null;
                        var likes = 0;
                        var contentModeration = null;
                        var visibility = null;

                        var reportedStatus = null;


                        try {
                            reportedStatus = datanewpost.reportedStatus;
                        } catch (e) {
                            reportedStatus = null;
                        }
                        try {
                            userLike = datanewpost.userLike;
                        } catch (e) {
                            userLike = [];
                        }

                        try {
                            likes = datanewpost.likes;
                        } catch (e) {
                            likes = 0;
                        }
                        try {
                            active = datanewpost.active;
                        } catch (e) {
                            active = null;
                        }
                        try {
                            contentModeration = datanewpost.contentModeration;
                        } catch (e) {
                            contentModeration = null;
                        }
                        try {
                            visibility = datanewpost.visibility;
                        } catch (e) {
                            visibility = null;
                        }
                        var userView = null;
                        var views = 0;
                        try {
                            userView = datanewpost.userView;
                        } catch (e) {
                            userView = [];
                        }
                        try {
                            views = datanewpost.views;
                        } catch (e) {
                            views = 0;
                        }


                        if (active == true) {
                            if (contentModeration == false) {

                                if (reportedStatus == "ALL") {
                                    if (visibility == "PUBLIC") {

                                        if (datauser !== null) {
                                            if (datauser.length > 0) {
                                                lengtuser = datauser.length;

                                                for (let x = 0; x < datauser.length; x++) {
                                                    let email_user = datauser[x].email;

                                                    // var userbasic1 = await this.basic2SS.findBymail(email_user);
                                                    // var userbasic2 = await this.basic2SS.findBymail(email_receiverParty);

                                                    // var insightID1 = JSON.parse(JSON.stringify(userbasic1.insight)).$id;
                                                    // var insightID2 = JSON.parse(JSON.stringify(userbasic2.insight)).$id;

                                                    // var Insight_sender = await this.insightsService.findOne(insightID1);
                                                    // var Insight_receiver = await this.insightsService.findOne(insightID2);


                                                    try {
                                                        dataloglike = await this.HistoryuserService.findBymailPostId(postID, email_user, "LIKE");
                                                    } catch (e) {
                                                        dataloglike = null;
                                                    }
                                                    if (dataloglike == null) {
                                                        //like
                                                        if (likeCount <= 20000) {
                                                            var Historyuser_ = new Historyuser()
                                                            Historyuser_.createdAt = current_date;
                                                            Historyuser_.updatedAt = current_date;
                                                            Historyuser_.email = email_user;
                                                            Historyuser_.postID = postID;
                                                            Historyuser_.event = "LIKE";
                                                            Historyuser_.sendFcm = false;
                                                            try {
                                                                await this.HistoryuserService.create(Historyuser_);
                                                            } catch (e) {

                                                            }
                                                            userLike.push(email_user);
                                                            likes += 1;


                                                            //event LIKE
                                                            // let _id_1 = (await this.utilsService.generateId());
                                                            // let _id_2 = (await this.utilsService.generateId());
                                                            // let CreateContenteventsDto1 = new CreateContenteventsDto();
                                                            // CreateContenteventsDto1._id = _id_1
                                                            // CreateContenteventsDto1.contentEventID = _id_1
                                                            // CreateContenteventsDto1.email = email_user
                                                            // CreateContenteventsDto1.eventType = "LIKE"
                                                            // CreateContenteventsDto1.active = true
                                                            // CreateContenteventsDto1.event = "DONE"
                                                            // CreateContenteventsDto1.createdAt = current_date
                                                            // CreateContenteventsDto1.updatedAt = current_date
                                                            // CreateContenteventsDto1.sequenceNumber = 1
                                                            // CreateContenteventsDto1.flowIsDone = true
                                                            // CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                            // CreateContenteventsDto1.receiverParty = email_receiverParty
                                                            // CreateContenteventsDto1.postID = postID

                                                            // let CreateContenteventsDto2 = new CreateContenteventsDto();
                                                            // CreateContenteventsDto2._id = _id_2
                                                            // CreateContenteventsDto2.contentEventID = _id_2
                                                            // CreateContenteventsDto2.email = email_receiverParty
                                                            // CreateContenteventsDto2.eventType = "LIKE"
                                                            // CreateContenteventsDto2.active = true
                                                            // CreateContenteventsDto2.event = "ACCEPT"
                                                            // CreateContenteventsDto2.createdAt = current_date
                                                            // CreateContenteventsDto2.updatedAt = current_date
                                                            // CreateContenteventsDto2.sequenceNumber = 1
                                                            // CreateContenteventsDto2.flowIsDone = true
                                                            // CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                            // CreateContenteventsDto2.senderParty = email_user
                                                            // CreateContenteventsDto2.postID = postID

                                                            // const resultdata1 = await this.ContenteventsService.create(CreateContenteventsDto1);
                                                            // const resultdata2 = await this.ContenteventsService.create(CreateContenteventsDto2);
                                                            // if (await this.utilsService.ceckData(Insight_receiver)) {
                                                            //     let _id_receiver = (await this.utilsService.generateId());
                                                            //     let CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
                                                            //     CreateInsightlogsDto_receiver._id = _id_receiver;
                                                            //     CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
                                                            //     CreateInsightlogsDto_receiver.createdAt = current_date;
                                                            //     CreateInsightlogsDto_receiver.updatedAt = current_date;
                                                            //     CreateInsightlogsDto_receiver.mate = email_user
                                                            //     CreateInsightlogsDto_receiver.eventInsight = "LIKE"
                                                            //     CreateInsightlogsDto_receiver.postID = postID
                                                            //     CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
                                                            //     await this.insightlogsService.create(CreateInsightlogsDto_receiver);

                                                            //     let LogInsught_receiver = Insight_receiver.insightLogs;
                                                            //     LogInsught_receiver.push({
                                                            //         $ref: 'insightlogs',
                                                            //         $id: _id_receiver,
                                                            //         $db: 'hyppe_content_db',
                                                            //     });

                                                            //     let CreateInsightsDto_receiver = new CreateInsightsDto()
                                                            //     CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
                                                            //     await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
                                                            // }


                                                            // try {

                                                            //     this.updateLike(email_receiverParty, postID);


                                                            // } catch (e) {

                                                            // }
                                                            // try {
                                                            //     await this.NewpostService.updateLikeByone( email_receiverParty, postID,1);
                                                            // } catch (e) {

                                                            // }

                                                            // try {
                                                            //     await this.ContenteventsService.userChallengeLike4new(_id_1.toString(), "contentevents", "LIKE", postID, email_user, email_receiverParty)
                                                            // } catch (e) {

                                                            // }

                                                            // try {

                                                            //     // this.sendInteractiveFCM2(email_receiverParty, "LIKE", postID, email_user);

                                                            // } catch (e) {

                                                            // }
                                                        }

                                                        //view
                                                        if (viewCount <= 40000) {
                                                            var Historyuser2_ = new Historyuser()
                                                            Historyuser2_.createdAt = current_date;
                                                            Historyuser2_.email = email_user;
                                                            Historyuser2_.postID = postID;
                                                            Historyuser2_.event = "VIEW";
                                                            Historyuser2_.sendFcm = false;
                                                            Historyuser2_.updatedAt = current_date;
                                                            try {
                                                                await this.HistoryuserService.create(Historyuser2_);
                                                            } catch (e) {

                                                            }
                                                            userView.push(email_user);
                                                            views += 1;
                                                            // //event VIEW
                                                            // let _id_3 = (await this.utilsService.generateId());
                                                            // let _id_4 = (await this.utilsService.generateId());
                                                            // let CreateContenteventsDto3 = new CreateContenteventsDto();
                                                            // CreateContenteventsDto3._id = _id_3
                                                            // CreateContenteventsDto3.contentEventID = _id_3
                                                            // CreateContenteventsDto3.email = email_user
                                                            // CreateContenteventsDto3.eventType = "VIEW"
                                                            // CreateContenteventsDto3.active = true
                                                            // CreateContenteventsDto3.event = "DONE"
                                                            // CreateContenteventsDto3.createdAt = current_date
                                                            // CreateContenteventsDto3.updatedAt = current_date
                                                            // CreateContenteventsDto3.sequenceNumber = 1
                                                            // CreateContenteventsDto3.flowIsDone = true
                                                            // CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                            // CreateContenteventsDto3.receiverParty = email_receiverParty
                                                            // CreateContenteventsDto3.postID = postID

                                                            // let CreateContenteventsDto4 = new CreateContenteventsDto();
                                                            // CreateContenteventsDto4._id = _id_4
                                                            // CreateContenteventsDto4.contentEventID = _id_4
                                                            // CreateContenteventsDto4.email = email_receiverParty
                                                            // CreateContenteventsDto4.eventType = "VIEW"
                                                            // CreateContenteventsDto4.active = true
                                                            // CreateContenteventsDto4.event = "ACCEPT"
                                                            // CreateContenteventsDto4.createdAt = current_date
                                                            // CreateContenteventsDto4.updatedAt = current_date
                                                            // CreateContenteventsDto4.sequenceNumber = 1
                                                            // CreateContenteventsDto4.flowIsDone = true
                                                            // CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                            // CreateContenteventsDto4.senderParty = email_user
                                                            // CreateContenteventsDto4.postID = postID

                                                            // const resultdata3 = await this.ContenteventsService.create(CreateContenteventsDto3);
                                                            // const resultdata4 = await this.ContenteventsService.create(CreateContenteventsDto4);

                                                            // if (await this.utilsService.ceckData(Insight_receiver)) {
                                                            //     let _id_receiver2 = (await this.utilsService.generateId());
                                                            //     let CreateInsightlogsDto_receiver2 = new CreateInsightlogsDto()
                                                            //     CreateInsightlogsDto_receiver2._id = _id_receiver2;
                                                            //     CreateInsightlogsDto_receiver2.insightID = Insight_receiver._id;
                                                            //     CreateInsightlogsDto_receiver2.createdAt = current_date;
                                                            //     CreateInsightlogsDto_receiver2.updatedAt = current_date;
                                                            //     CreateInsightlogsDto_receiver2.mate = email_user
                                                            //     CreateInsightlogsDto_receiver2.postID = postID
                                                            //     CreateInsightlogsDto_receiver2.eventInsight = "VIEW"
                                                            //     CreateInsightlogsDto_receiver2._class = "io.melody.hyppe.content.domain.InsightLog"
                                                            //     await this.insightlogsService.create(CreateInsightlogsDto_receiver2);

                                                            //     var LogInsught_receiver = Insight_receiver.insightLogs;
                                                            //     LogInsught_receiver.push({
                                                            //         $ref: 'insightlogs',
                                                            //         $id: _id_receiver2,
                                                            //         $db: 'hyppe_content_db',
                                                            //     });

                                                            //     var CreateInsightsDto_receiver = new CreateInsightsDto()
                                                            //     CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
                                                            //     await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
                                                            // }

                                                            // try {

                                                            //     this.updateView(email_receiverParty, postID);

                                                            // } catch (e) {

                                                            // }
                                                            // try {
                                                            //     await this.NewpostService.updateViewByone(email_receiverParty, postID, 1);
                                                            // } catch (e) {

                                                            // }
                                                            // try {
                                                            //     await this.ContenteventsService.userChallengeView4new(_id_3.toString(), "contentevents", "VIEW", postID, email_user, email_receiverParty)
                                                            // } catch (e) {

                                                            // }
                                                        }


                                                    }



                                                    // let datauserrandom = null;

                                                    // try {
                                                    //     datauserrandom = await this.DummyuserService.findRandom2();
                                                    // } catch (e) {
                                                    //     datauserrandom = null;
                                                    // }

                                                    // if (datauserrandom !== null) {
                                                    //     if (datauserrandom.length > 0) {
                                                    //         for (let y = 0; y < datauserrandom.length; y++) {
                                                    //             let email_userrand = datauserrandom[y].email;

                                                    //             if (viewCount <= 40000) {
                                                    //                 try {
                                                    //                     datalogview = await this.HistoryuserService.findBymailView(postID, email_userrand, "VIEW");
                                                    //                 } catch (e) {
                                                    //                     datalogview = null;
                                                    //                 }
                                                    //                 if (datalogview == null) {


                                                    //                     var Historyuser3_ = new Historyuser()
                                                    //                     Historyuser3_.createdAt = current_date;
                                                    //                     Historyuser3_.updatedAt = current_date;
                                                    //                     Historyuser3_.email = email_userrand;
                                                    //                     Historyuser3_.postID = postID;
                                                    //                     Historyuser3_.event = "VIEW";
                                                    //                     Historyuser3_.sendFcm = false;
                                                    //                     try {
                                                    //                         await this.HistoryuserService.create(Historyuser3_);
                                                    //                     } catch (e) {

                                                    //                     }

                                                    //                 }

                                                    //             }
                                                    //             if (y == (datauserrandom.length - 1)) {
                                                    //                 break;
                                                    //             }
                                                    //         }

                                                    //     }
                                                    // }



                                                    if (x == (datauser.length - 1)) {
                                                        break;
                                                    }

                                                }

                                            }
                                        }


                                        // try {
                                        //     await this.NewpostService.updatePostLike(postID, userLike);
                                        // } catch (e) {

                                        // }

                                        // try {
                                        //     await this.NewpostService.updatePostView(postID, userView);
                                        // } catch (e) {

                                        // }
                                    }

                                }

                            }

                        }


                    }
                }

            } else {
                console.log("============================ BELUM ADA CONTENT ===============================")
            }
        }
    }

    async taskSchedule() {
        var current_date = await this.utilsService.getDateTimeString();
        var dataschedule = null;
        var arr = [];
        try {
            dataschedule = await this.ScheduleinjectService.find();
        } catch (e) {
            dataschedule = null;
        }
        if (dataschedule !== null) {
            if (dataschedule.length > 0) {
                for (let i = 0; i < dataschedule.length; i++) {
                    let postID = null;
                    let email = null;
                    let id = null;
                    let datanewpost = null;
                    let rd = null;
                    let arrin = [];
                    var rndInt = 0;
                    try {
                        id = dataschedule[i]._id.toString();
                    } catch (e) {
                        id = null;
                    }
                    try {
                        postID = dataschedule[i].postID;
                    } catch (e) {
                        postID = null;
                    }
                    try {
                        email = dataschedule[i].emailPost;
                    } catch (e) {
                        email = null;
                    }

                    try {
                        datanewpost = await this.NewpostService.findByPostId(postID);
                    } catch (e) {
                        datanewpost = null;
                    }

                    if (datanewpost !== null) {
                        var active = null;

                        var contentModeration = null;
                        var visibility = null;
                        var reportedStatus = null;


                        try {
                            reportedStatus = datanewpost.reportedStatus;
                        } catch (e) {
                            reportedStatus = null;
                        }
                        try {
                            active = datanewpost.active;
                        } catch (e) {
                            active = null;
                        }
                        try {
                            contentModeration = datanewpost.contentModeration;
                        } catch (e) {
                            contentModeration = null;
                        }
                        try {
                            visibility = datanewpost.visibility;
                        } catch (e) {
                            visibility = null;
                        }

                    }

                    if (active == true) {
                        if (contentModeration == false) {
                            if (reportedStatus == "ALL") {
                                if (visibility == "PUBLIC") {
                                    for (let x = 0; x < 15; x++) {
                                        var rndInt = Math.floor(Math.random() * 59) + 1
                                        console.log(rndInt)

                                        if (rndInt == 1) {
                                            rd = "01"
                                        }
                                        else if (rndInt == 2) {
                                            rd = "02"
                                        }
                                        else if (rndInt == 3) {
                                            rd = "03"
                                        }
                                        else if (rndInt == 4) {
                                            rd = "04"
                                        }
                                        else if (rndInt == 5) {
                                            rd = "05"
                                        }
                                        else if (rndInt == 6) {
                                            rd = "06"
                                        }
                                        else if (rndInt == 7) {
                                            rd = "07"
                                        }
                                        else if (rndInt == 8) {
                                            rd = "08"
                                        }
                                        else if (rndInt == 9) {
                                            rd = "09"
                                        } else {
                                            rd = rndInt.toString();
                                        }
                                        arrin.push(rd);
                                    }
                                    console.log(arrin);

                                    if (arrin.length > 0) {

                                        let t1 = "07:" + arrin[0] + ":00";
                                        let t2 = "08:" + arrin[1] + ":00";
                                        let t3 = "09:" + arrin[2] + ":00";
                                        let t4 = "10:" + arrin[3] + ":00";
                                        let t5 = "11:" + arrin[4] + ":00";
                                        let t6 = "12:" + arrin[5] + ":00";
                                        let t7 = "13:" + arrin[6] + ":00";
                                        let t8 = "14:" + arrin[7] + ":00";
                                        let t9 = "15:" + arrin[8] + ":00";
                                        let t10 = "16:" + arrin[9] + ":00";
                                        let t11 = "17:" + arrin[10] + ":00";
                                        let t12 = "18:" + arrin[11] + ":00";
                                        let t13 = "19:" + arrin[12] + ":00";
                                        let t14 = "20:" + arrin[13] + ":00";
                                        let t15 = "21:" + arrin[14] + ":00";
                                        arr = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15]


                                    }
                                    var Scheduleinject_ = new Scheduleinject();
                                    Scheduleinject_.postID = postID;
                                    Scheduleinject_.time = arr;
                                    Scheduleinject_.emailPost = email;
                                    Scheduleinject_.type = "ENGINE";
                                    Scheduleinject_.updatedAt = current_date;
                                    try {
                                        await this.ScheduleinjectService.update(id, Scheduleinject_);
                                    } catch (e) {

                                    }
                                } else {
                                    try {
                                        await this.ScheduleinjectService.delete(id);
                                    } catch (e) {

                                    }
                                }
                            }
                        }
                    } else {
                        try {
                            await this.ScheduleinjectService.delete(id);
                        } catch (e) {

                        }
                    }
                }

            }

        }
    }

    async requestApiCron() {

        var call = {};
        console.log(JSON.stringify(call))
        let config = { headers: { "Content-Type": "application/json" } };
        const res = await this.httpService.post(this.configService.get("HYPPE_ENDPOINT") + "posttask/cron", call, config).toPromise();
        const data = res.data;
        return data;
    }

    async requestCronj() {
        console.log("============================ HIT API CRON ===============================")
        try {
            this.requestApiCron();
        } catch (e) {

        }

        console.log("============================ FINISH ===============================")
    }

    async requestChallengeLike(id_receive: string, postID: string, email_user: string, email_receiverParty: string) {
        try {
            await this.ContenteventsService.userChallengeLike4new(id_receive.toString(), "contentevents", "LIKE", postID, email_user, email_receiverParty)
        } catch (e) {

        }


    }

    async requestChallengeView(id_receive: string, postID: string, email_user: string, email_receiverParty: string) {

        try {
            await this.ContenteventsService.userChallengeView4new(id_receive.toString(), "contentevents", "VIEW", postID, email_user, email_receiverParty)
        } catch (e) {

        }
    }
    async requestFcm() {
        console.log("============================ HIT CRON FCM ===============================")
        this.fcm()

    }

    async fcm() {
        var datahistory = null;
        try {

            datahistory = await this.HistoryuserService.findFcm();

        } catch (e) {
            datahistory = null;
        }

        if (datahistory !== null) {
            if (datahistory.length > 0) {
                const delay = ms => new Promise(res => setTimeout(res, ms));
                for (let i = 0; i < datahistory.length; i++) {

                    let postID = null;
                    let email_receiverParty = null;
                    let email_user = null;
                    let datanewpost = null;
                    let dataposttask = null;
                    let event = null;
                    let id = null;
                    var current_date = await this.utilsService.getDateTimeString();
                    try {

                        id = datahistory[i]._id.toString();

                    } catch (e) {
                        id = null;
                    }
                    try {

                        event = datahistory[i].event;

                    } catch (e) {
                        event = null;
                    }

                    try {

                        postID = datahistory[i].postID;

                    } catch (e) {
                        postID = null;
                    }

                    try {
                        datanewpost = await this.NewpostService.findByPostId(postID);
                    } catch (e) {
                        datanewpost = null;
                    }

                    if (datanewpost !== null) {


                        var active = null;

                        var contentModeration = null;
                        var visibility = null;
                        var reportedStatus = null;


                        try {
                            reportedStatus = datanewpost.reportedStatus;
                        } catch (e) {
                            reportedStatus = null;
                        }
                        try {
                            active = datanewpost.active;
                        } catch (e) {
                            active = null;
                        }
                        try {
                            contentModeration = datanewpost.contentModeration;
                        } catch (e) {
                            contentModeration = null;
                        }
                        try {
                            visibility = datanewpost.visibility;
                        } catch (e) {
                            visibility = null;
                        }
                        try {

                            email_receiverParty = datanewpost.email;

                        } catch (e) {
                            email_receiverParty = null;
                        }


                        try {

                            email_user = datahistory[i].email;

                        } catch (e) {
                            email_user = null;
                        }

                        if (active == true) {
                            if (contentModeration == false) {
                                if (reportedStatus == "ALL") {
                                    if (visibility == "PUBLIC") {

                                        var userbasic1 = await this.basic2SS.findBymail(email_user);
                                        var userbasic2 = await this.basic2SS.findBymail(email_receiverParty);
                                        var insightID1 = null;
                                        try {
                                            insightID1 = JSON.parse(JSON.stringify(userbasic1.insight)).$id;
                                        } catch (e) {
                                            insightID1 = null;
                                        }
                                        var insightID2 = null;
                                        try {
                                            insightID2 = JSON.parse(JSON.stringify(userbasic2.insight)).$id;
                                        } catch (e) {
                                            insightID2 = null;
                                        }
                                        var Insight_sender = null;
                                        try {
                                            Insight_sender = await this.insightsService.findOne(insightID1);
                                        } catch (e) {
                                            Insight_sender = null;
                                        }

                                        var Insight_receiver = null;

                                        try {
                                            Insight_receiver = await this.insightsService.findOne(insightID2);
                                        } catch (e) {
                                            Insight_receiver = null;
                                        }

                                        try {
                                            dataposttask = await this.findBypostID(postID);
                                        } catch (e) {
                                            dataposttask = null;
                                        }

                                        if (dataposttask !== null) {
                                            let likeCount = 0;
                                            let viewCount = 0;
                                            try {
                                                likeCount = dataposttask.likeCount;
                                            } catch (e) {
                                                likeCount = 0;
                                            }
                                            try {
                                                viewCount = dataposttask.viewCount;
                                            } catch (e) {
                                                viewCount = 0;
                                            }

                                            try {



                                                let datauserlike1 = null;

                                                try {
                                                    datauserlike1 = await this.NewpostService.findbylikemail(email_user, postID);
                                                } catch (e) {
                                                    datauserlike1 = null;
                                                }
                                                if (likeCount <= 20000) {
                                                    if (datauserlike1 == null || datauserlike1.length == 0) {
                                                        //event LIKE
                                                        let _id_1 = (await this.utilsService.generateId());
                                                        let _id_2 = (await this.utilsService.generateId());
                                                        let CreateContenteventsDto1 = new CreateContenteventsDto();
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
                                                        CreateContenteventsDto1.postID = postID

                                                        let CreateContenteventsDto2 = new CreateContenteventsDto();
                                                        CreateContenteventsDto2._id = _id_2
                                                        CreateContenteventsDto2.contentEventID = _id_2
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
                                                        CreateContenteventsDto2.postID = postID

                                                        const resultdata1 = await this.ContenteventsService.create(CreateContenteventsDto1);
                                                        const resultdata2 = await this.ContenteventsService.create(CreateContenteventsDto2);
                                                        if (await this.utilsService.ceckData(Insight_receiver)) {
                                                            let _id_receiver = (await this.utilsService.generateId());
                                                            let CreateInsightlogsDto_receiver = new CreateInsightlogsDto()
                                                            CreateInsightlogsDto_receiver._id = _id_receiver;
                                                            CreateInsightlogsDto_receiver.insightID = Insight_receiver._id;
                                                            CreateInsightlogsDto_receiver.createdAt = current_date;
                                                            CreateInsightlogsDto_receiver.updatedAt = current_date;
                                                            CreateInsightlogsDto_receiver.mate = email_user
                                                            CreateInsightlogsDto_receiver.eventInsight = "LIKE"
                                                            CreateInsightlogsDto_receiver.postID = postID
                                                            CreateInsightlogsDto_receiver._class = "io.melody.hyppe.content.domain.InsightLog"
                                                            await this.insightlogsService.create(CreateInsightlogsDto_receiver);

                                                            let LogInsught_receiver = Insight_receiver.insightLogs;
                                                            LogInsught_receiver.push({
                                                                $ref: 'insightlogs',
                                                                $id: _id_receiver,
                                                                $db: 'hyppe_content_db',
                                                            });

                                                            let CreateInsightsDto_receiver = new CreateInsightsDto()
                                                            CreateInsightsDto_receiver.insightLogs = LogInsught_receiver;
                                                            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver)
                                                        }
                                                        try {

                                                            this.updateLike(email_receiverParty, postID);


                                                        } catch (e) {

                                                        }
                                                        try {
                                                            await this.NewpostService.updateLike(email_receiverParty, email_user, postID);
                                                        } catch (e) {

                                                        }
                                                        try {
                                                            await this.TemppostService.updateLike(email_receiverParty, email_user, postID);
                                                        } catch (e) {

                                                        }

                                                        try {

                                                            this.HistoryuserService.updateFcmlike(postID, current_date, email_user);
                                                        } catch (e) {

                                                        }
                                                        try {

                                                            this.requestChallengeLike(_id_1.toString(), postID, email_user, email_receiverParty);


                                                        } catch (e) {

                                                        }
                                                        try {
                                                            this.sendInteractiveFCM2(email_receiverParty, "LIKE", postID, email_user);

                                                        } catch (e) {

                                                        }

                                                    }
                                                }


                                                let datauserview1 = null;

                                                try {
                                                    datauserview1 = await this.NewpostService.findbyviewmail(email_user, postID);
                                                } catch (e) {
                                                    datauserview1 = null;
                                                }
                                                if (viewCount <= 40000) {
                                                    if (datauserview1 == null || datauserview1.length == 0) {
                                                        //event VIEW
                                                        let _id_3 = (await this.utilsService.generateId());
                                                        let _id_4 = (await this.utilsService.generateId());
                                                        let CreateContenteventsDto3 = new CreateContenteventsDto();
                                                        CreateContenteventsDto3._id = _id_3
                                                        CreateContenteventsDto3.contentEventID = _id_3
                                                        CreateContenteventsDto3.email = email_user
                                                        CreateContenteventsDto3.eventType = "VIEW"
                                                        CreateContenteventsDto3.active = true
                                                        CreateContenteventsDto3.event = "DONE"
                                                        CreateContenteventsDto3.createdAt = current_date
                                                        CreateContenteventsDto3.updatedAt = current_date
                                                        CreateContenteventsDto3.sequenceNumber = 1
                                                        CreateContenteventsDto3.flowIsDone = true
                                                        CreateContenteventsDto3._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                        CreateContenteventsDto3.receiverParty = email_receiverParty
                                                        CreateContenteventsDto3.postID = postID

                                                        let CreateContenteventsDto4 = new CreateContenteventsDto();
                                                        CreateContenteventsDto4._id = _id_4
                                                        CreateContenteventsDto4.contentEventID = _id_4
                                                        CreateContenteventsDto4.email = email_receiverParty
                                                        CreateContenteventsDto4.eventType = "VIEW"
                                                        CreateContenteventsDto4.active = true
                                                        CreateContenteventsDto4.event = "ACCEPT"
                                                        CreateContenteventsDto4.createdAt = current_date
                                                        CreateContenteventsDto4.updatedAt = current_date
                                                        CreateContenteventsDto4.sequenceNumber = 1
                                                        CreateContenteventsDto4.flowIsDone = true
                                                        CreateContenteventsDto4._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                        CreateContenteventsDto4.senderParty = email_user
                                                        CreateContenteventsDto4.postID = postID

                                                        const resultdata3 = await this.ContenteventsService.create(CreateContenteventsDto3);
                                                        const resultdata4 = await this.ContenteventsService.create(CreateContenteventsDto4);

                                                        if (await this.utilsService.ceckData(Insight_receiver)) {
                                                            let _id_receiver2 = (await this.utilsService.generateId());
                                                            let CreateInsightlogsDto_receiver2 = new CreateInsightlogsDto()
                                                            CreateInsightlogsDto_receiver2._id = _id_receiver2;
                                                            CreateInsightlogsDto_receiver2.insightID = Insight_receiver._id;
                                                            CreateInsightlogsDto_receiver2.createdAt = current_date;
                                                            CreateInsightlogsDto_receiver2.updatedAt = current_date;
                                                            CreateInsightlogsDto_receiver2.mate = email_user
                                                            CreateInsightlogsDto_receiver2.postID = postID
                                                            CreateInsightlogsDto_receiver2.eventInsight = "VIEW"
                                                            CreateInsightlogsDto_receiver2._class = "io.melody.hyppe.content.domain.InsightLog"
                                                            await this.insightlogsService.create(CreateInsightlogsDto_receiver2);

                                                            let LogInsught_receiver2 = Insight_receiver.insightLogs;
                                                            LogInsught_receiver2.push({
                                                                $ref: 'insightlogs',
                                                                $id: _id_receiver2,
                                                                $db: 'hyppe_content_db',
                                                            });

                                                            let CreateInsightsDto_receiver2 = new CreateInsightsDto()
                                                            CreateInsightsDto_receiver2.insightLogs = LogInsught_receiver2;
                                                            await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver2)
                                                        }

                                                        try {

                                                            this.updateView(email_receiverParty, postID);

                                                        } catch (e) {

                                                        }
                                                        try {

                                                            this.HistoryuserService.updateFcmview(postID, current_date, email_user)

                                                        } catch (e) {

                                                        }
                                                        try {
                                                            await this.NewpostService.updateView(email_receiverParty, email_user, postID);
                                                        } catch (e) {

                                                        }
                                                        try {
                                                            await this.TemppostService.updateView(email_receiverParty, email_user, postID);
                                                        } catch (e) {

                                                        }
                                                        try {
                                                            this.requestChallengeView(_id_3.toString(), postID, email_user, email_receiverParty)
                                                        } catch (e) {

                                                        }

                                                    }
                                                }



                                                // let dataviewhis = null;
                                                // try {
                                                //     dataviewhis = await this.HistoryuserService.findFcmview(postID);
                                                // } catch (e) {
                                                //     dataviewhis = null;
                                                // }
                                                // if (viewCount <= 40000) {
                                                //     if (dataviewhis !== null) {
                                                //         if (dataviewhis.length > 0) {
                                                //             // for (let i = 0; i < dataviewhis.length; i++) {
                                                //             let user = dataviewhis[0].email;

                                                //             if (email_user !== user) {
                                                //                 //event VIEW
                                                //                 let _id_5 = (await this.utilsService.generateId());
                                                //                 let _id_6 = (await this.utilsService.generateId());
                                                //                 let CreateContenteventsDto5 = new CreateContenteventsDto();
                                                //                 CreateContenteventsDto5._id = _id_5
                                                //                 CreateContenteventsDto5.contentEventID = _id_5
                                                //                 CreateContenteventsDto5.email = user
                                                //                 CreateContenteventsDto5.eventType = "VIEW"
                                                //                 CreateContenteventsDto5.active = true
                                                //                 CreateContenteventsDto5.event = "DONE"
                                                //                 CreateContenteventsDto5.createdAt = current_date
                                                //                 CreateContenteventsDto5.updatedAt = current_date
                                                //                 CreateContenteventsDto5.sequenceNumber = 1
                                                //                 CreateContenteventsDto5.flowIsDone = true
                                                //                 CreateContenteventsDto5._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                //                 CreateContenteventsDto5.receiverParty = email_receiverParty
                                                //                 CreateContenteventsDto5.postID = postID

                                                //                 let CreateContenteventsDto6 = new CreateContenteventsDto();
                                                //                 CreateContenteventsDto6._id = _id_6
                                                //                 CreateContenteventsDto6.contentEventID = _id_6
                                                //                 CreateContenteventsDto6.email = email_receiverParty
                                                //                 CreateContenteventsDto6.eventType = "VIEW"
                                                //                 CreateContenteventsDto6.active = true
                                                //                 CreateContenteventsDto6.event = "ACCEPT"
                                                //                 CreateContenteventsDto6.createdAt = current_date
                                                //                 CreateContenteventsDto6.updatedAt = current_date
                                                //                 CreateContenteventsDto6.sequenceNumber = 1
                                                //                 CreateContenteventsDto6.flowIsDone = true
                                                //                 CreateContenteventsDto6._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                //                 CreateContenteventsDto6.senderParty = user
                                                //                 CreateContenteventsDto6.postID = postID

                                                //                 const resultdata5 = await this.ContenteventsService.create(CreateContenteventsDto5);
                                                //                 const resultdata6 = await this.ContenteventsService.create(CreateContenteventsDto6);

                                                //                 if (await this.utilsService.ceckData(Insight_receiver)) {
                                                //                     let _id_receiver3 = (await this.utilsService.generateId());
                                                //                     let CreateInsightlogsDto_receiver3 = new CreateInsightlogsDto()
                                                //                     CreateInsightlogsDto_receiver3._id = _id_receiver3;
                                                //                     CreateInsightlogsDto_receiver3.insightID = Insight_receiver._id;
                                                //                     CreateInsightlogsDto_receiver3.createdAt = current_date;
                                                //                     CreateInsightlogsDto_receiver3.updatedAt = current_date;
                                                //                     CreateInsightlogsDto_receiver3.mate = user
                                                //                     CreateInsightlogsDto_receiver3.postID = postID
                                                //                     CreateInsightlogsDto_receiver3.eventInsight = "VIEW"
                                                //                     CreateInsightlogsDto_receiver3._class = "io.melody.hyppe.content.domain.InsightLog"
                                                //                     await this.insightlogsService.create(CreateInsightlogsDto_receiver3);

                                                //                     let LogInsught_receiver3 = Insight_receiver.insightLogs;
                                                //                     LogInsught_receiver3.push({
                                                //                         $ref: 'insightlogs',
                                                //                         $id: _id_receiver3,
                                                //                         $db: 'hyppe_content_db',
                                                //                     });

                                                //                     let CreateInsightsDto_receiver3 = new CreateInsightsDto()
                                                //                     CreateInsightsDto_receiver3.insightLogs = LogInsught_receiver3;
                                                //                     await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver3)
                                                //                 }


                                                //                 let datauserview = null;

                                                //                 try {
                                                //                     datauserview = await this.NewpostService.findbyviewmail(user, postID);
                                                //                 } catch (e) {
                                                //                     datauserview = null;
                                                //                 }

                                                //                 if (datauserview == null || datauserview.length == 0) {
                                                //                     try {

                                                //                         this.updateView(email_receiverParty, postID);

                                                //                     } catch (e) {

                                                //                     }
                                                //                     try {

                                                //                         this.HistoryuserService.updateFcmview(postID, current_date, user)

                                                //                     } catch (e) {

                                                //                     }


                                                //                     try {
                                                //                         await this.NewpostService.updateView(email_receiverParty, user, postID);
                                                //                     } catch (e) {

                                                //                     }
                                                //                     try {
                                                //                         await this.TemppostService.updateView(email_receiverParty, user, postID);
                                                //                     } catch (e) {

                                                //                     }
                                                //                     try {
                                                //                         this.requestChallengeView(_id_5.toString(), postID, user, email_receiverParty)
                                                //                     } catch (e) {

                                                //                     }

                                                //                 }

                                                //             }

                                                //             // if (i == (dataviewhis.length - 1)) {
                                                //             //     break;
                                                //             // }

                                                //             // }

                                                //         }

                                                //     }
                                                // }

                                                
                                                let datauserrandom = null;
                                                let datalogview=null;
                                                try {
                                                    datauserrandom = await this.DummyuserService.findRandom2();
                                                } catch (e) {
                                                    datauserrandom = null;
                                                }

                                                if (datauserrandom !== null) {
                                                    if (datauserrandom.length > 0) {
                                                        for (let y = 0; y < datauserrandom.length; y++) {
                                                            let email_userrand = datauserrandom[y].email;

                                                            if (viewCount <= 40000) {
                                                                try {
                                                                    datalogview = await this.HistoryuserService.findBymailView(postID, email_userrand, "VIEW");
                                                                } catch (e) {
                                                                    datalogview = null;
                                                                }
                                                                if (datalogview == null) {


                                                                    var Historyuser3_ = new Historyuser()
                                                                    Historyuser3_.createdAt = current_date;
                                                                    Historyuser3_.updatedAt = current_date;
                                                                    Historyuser3_.email = email_userrand;
                                                                    Historyuser3_.postID = postID;
                                                                    Historyuser3_.event = "VIEW";
                                                                    Historyuser3_.sendFcm = true;
                                                                    try {
                                                                        await this.HistoryuserService.create(Historyuser3_);
                                                                    } catch (e) {

                                                                    }

                                                                     //event VIEW
                                                                let _id_5 = (await this.utilsService.generateId());
                                                                let _id_6 = (await this.utilsService.generateId());
                                                                let CreateContenteventsDto5 = new CreateContenteventsDto();
                                                                CreateContenteventsDto5._id = _id_5
                                                                CreateContenteventsDto5.contentEventID = _id_5
                                                                CreateContenteventsDto5.email = email_userrand
                                                                CreateContenteventsDto5.eventType = "VIEW"
                                                                CreateContenteventsDto5.active = true
                                                                CreateContenteventsDto5.event = "DONE"
                                                                CreateContenteventsDto5.createdAt = current_date
                                                                CreateContenteventsDto5.updatedAt = current_date
                                                                CreateContenteventsDto5.sequenceNumber = 1
                                                                CreateContenteventsDto5.flowIsDone = true
                                                                CreateContenteventsDto5._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                                CreateContenteventsDto5.receiverParty = email_receiverParty
                                                                CreateContenteventsDto5.postID = postID

                                                                let CreateContenteventsDto6 = new CreateContenteventsDto();
                                                                CreateContenteventsDto6._id = _id_6
                                                                CreateContenteventsDto6.contentEventID = _id_6
                                                                CreateContenteventsDto6.email = email_receiverParty
                                                                CreateContenteventsDto6.eventType = "VIEW"
                                                                CreateContenteventsDto6.active = true
                                                                CreateContenteventsDto6.event = "ACCEPT"
                                                                CreateContenteventsDto6.createdAt = current_date
                                                                CreateContenteventsDto6.updatedAt = current_date
                                                                CreateContenteventsDto6.sequenceNumber = 1
                                                                CreateContenteventsDto6.flowIsDone = true
                                                                CreateContenteventsDto6._class = "io.melody.hyppe.content.domain.ContentEvent"
                                                                CreateContenteventsDto6.senderParty = email_userrand;
                                                                CreateContenteventsDto6.postID = postID

                                                                const resultdata5 = await this.ContenteventsService.create(CreateContenteventsDto5);
                                                                const resultdata6 = await this.ContenteventsService.create(CreateContenteventsDto6);

                                                                if (await this.utilsService.ceckData(Insight_receiver)) {
                                                                    let _id_receiver3 = (await this.utilsService.generateId());
                                                                    let CreateInsightlogsDto_receiver3 = new CreateInsightlogsDto()
                                                                    CreateInsightlogsDto_receiver3._id = _id_receiver3;
                                                                    CreateInsightlogsDto_receiver3.insightID = Insight_receiver._id;
                                                                    CreateInsightlogsDto_receiver3.createdAt = current_date;
                                                                    CreateInsightlogsDto_receiver3.updatedAt = current_date;
                                                                    CreateInsightlogsDto_receiver3.mate = email_userrand;
                                                                    CreateInsightlogsDto_receiver3.postID = postID
                                                                    CreateInsightlogsDto_receiver3.eventInsight = "VIEW"
                                                                    CreateInsightlogsDto_receiver3._class = "io.melody.hyppe.content.domain.InsightLog"
                                                                    await this.insightlogsService.create(CreateInsightlogsDto_receiver3);

                                                                    let LogInsught_receiver3 = Insight_receiver.insightLogs;
                                                                    LogInsught_receiver3.push({
                                                                        $ref: 'insightlogs',
                                                                        $id: _id_receiver3,
                                                                        $db: 'hyppe_content_db',
                                                                    });

                                                                    let CreateInsightsDto_receiver3 = new CreateInsightsDto()
                                                                    CreateInsightsDto_receiver3.insightLogs = LogInsught_receiver3;
                                                                    await this.insightsService.updateoneByID(insightID2, CreateInsightsDto_receiver3)
                                                                }


                                                                let datauserview = null;

                                                                try {
                                                                    datauserview = await this.NewpostService.findbyviewmail(email_userrand, postID);
                                                                } catch (e) {
                                                                    datauserview = null;
                                                                }

                                                                if (datauserview == null || datauserview.length == 0) {
                                                                    try {

                                                                        this.updateView(email_receiverParty, postID);

                                                                    } catch (e) {

                                                                    }
                                                                    try {

                                                                        this.HistoryuserService.updateFcmview(postID, current_date, email_userrand)

                                                                    } catch (e) {

                                                                    }


                                                                    try {
                                                                        await this.NewpostService.updateView(email_receiverParty, email_userrand, postID);
                                                                    } catch (e) {

                                                                    }
                                                                    try {
                                                                        await this.TemppostService.updateView(email_receiverParty, email_user, postID);
                                                                    } catch (e) {
            
                                                                    }
                                                                    try {
                                                                        this.requestChallengeView(_id_5.toString(), postID, email_userrand, email_receiverParty)
                                                                    } catch (e) {

                                                                    }

                                                                }

                                                                }

                                                            }
                                                            if (y == (datauserrandom.length - 1)) {
                                                                break;
                                                            }
                                                        }

                                                    }
                                                }


                                                console.log("        ----------------------- Length " + i + " -----------------------");
                                                console.log("");
                                                await delay(60000);
                                                console.log("        ----------------------- DELAY " + (60000 / 1000) + " second -----------------------");
                                            } catch (e) {

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


        console.log("============================ FINISH ===============================")
    }
}
