import { Body, Controller, Headers, Post, UseGuards, BadRequestException, Req, UseInterceptors, Logger, InternalServerErrorException } from '@nestjs/common';
import { PostsReadService } from './post_read.service';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { PostContentService } from 'src/content/posts/postcontent.service';
import { PostsService } from 'src/content/posts/posts.service';
import { ContenteventsService } from 'src/content/contentevents/contentevents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificationReadService } from './notification_read.service';
import { NewPostService } from 'src/content/new_post/new_post.service';
import { NewPostContentService } from 'src/content/new_post/new_postcontent.service';
import { TempPOSTService } from 'src/content/new_post/temp_post.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';

@Controller()
export class PostsReadController {
    private readonly logger = new Logger(PostsReadController.name);
    constructor(
        private readonly postsReadService: PostsReadService,
        private utilsService: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly postContentService: PostContentService,
        private readonly postsService: PostsService,
        private readonly contenteventsService: ContenteventsService,
        private readonly notificationReadService: NotificationReadService,
        private readonly post2SS: NewPostService,
        private readonly postContent2SS: NewPostContentService,
        private readonly tempPOSTss: TempPOSTService,
        private readonly basic2SS: UserbasicnewService,
    ) { }

    @Post('api/posts/getuserposts/my')
    @UseInterceptors(FileInterceptor('postContent'))
    // @UseGuards(JwtAuthGuard)
    async contentlandingpagemy(@Body() body, @Headers('x-auth-user') email: string): Promise<any> {
        console.log('=============================================MY PAGE HIT=============================================')
        console.log('============================================= BODY =============================================', JSON.stringify(body))

        var pageNumber = null;
        var pageRow = null;
        var postType = null;
        var data = null;
        var datasearch = null;
        var emailreceiver = null;
        if (body.pageNumber !== undefined) {
            pageNumber = body.pageNumber;
        }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        if (body.postType !== undefined) {
            postType = body.postType;
        }


        const messages = {
            "info": ["The process successful"],
        };

        var picts = [];
        var lengpict = null;

        try {

            data = await this.postsReadService.landingpageMy2(email, postType, parseInt(pageNumber), parseInt(pageRow), email);
            lengpict = data.length;

        } catch (e) {
            console.log("ERROR", e);
            data = null;
            lengpict = 0;

        }

        var tempapsaraMusicThumbId = [];
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];

        var tempdatapict = [];

        var apsaraMusicThumbId = null;
        var boosted = null;
        var boostCount = null;
        var version = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var mediaType = null;
        var postID = null;
        var gettempresultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {
            var tempapsaraId_result = null;
            var tempapsaraThumbId_result = null;
            var tempapsaraMusicThumbId_result = null;

            var resultpictapsara = null;
            version = data[0].version;
            // console.log(tempdatapict);
            if (postType == "pict") {
                for (let i = 0; i < lengpict; i++) {
                    uploadSource = data[i].uploadSource;
                    try {
                        apsaraId = data[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = data[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }
                    try {
                        apsaraMusicThumbId = data[i].apsaraMusicThumnail;
                    } catch (e) {
                        apsaraMusicThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(data[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(data[i].apsaraThumbId);
                    }

                    if (apsaraMusicThumbId != "") {
                        tempapsaraMusicThumbId.push(data[i].apsaraMusicThumnail);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);
                tempapsaraMusicThumbId_result = await this.postContentService.getImageApsara(tempapsaraMusicThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraMusicThumbId = tempapsaraMusicThumbId_result.ImageInfo;
                // for (let i = 0; i < lengpict; i++) {

                //     uploadSource = data[i].uploadSource;
                //     try {
                //         apsaraId = data[i].apsaraId;
                //     } catch (e) {
                //         apsaraId = "";
                //     }
                //     try {
                //         apsaraThumbId = data[i].apsaraThumbId;
                //     } catch (e) {
                //         apsaraThumbId = "";
                //     }

                //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);
                //         // tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
                //         tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);

                //     }
                // }
                // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // let gettempresultpictapsara = resultpictapsara.ImageInfo;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boosted = data[i].boosted;
                    boostCount = data[i].boostCount;
                    var checkpictketemu = false;
                    uploadSource = data[i].uploadSource;
                    var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    var dataUpsara = (data[i].apsaraId != undefined);

                    if (data[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
                                data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
                                data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }

                    if (data[i].apsaraMusicThumnail) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraMusicThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraMusicThumbId[j].ImageId == data[i].apsaraMusicThumnail) {
                                data[i].mediaMusicThumbEndpoint = gettempresultpictapsara_tempapsaraMusicThumbId[j].URL;
                            }
                        }
                    }
                    // emailreceiver = data[i].email;
                    // boosted = data[i].boosted;
                    // boostCount = data[i].boostCount;
                    // var checkpictketemu = false;
                    // uploadSource = data[i].uploadSource;
                    // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    // var dataUpsara = (data[i].apsaraId != undefined);

                    // if (data[i].isApsara) {
                    //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

                    //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsara) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             // checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                    //         }
                    //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsaraThum) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                    //         }
                    //     }
                    // } else {
                    //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
                    // }




                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.postsService.updateBoostViewer(data[i].postID, email);
                        }
                        //pd.boostJangkauan = this.countBoosted(obj, email);
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;
                                await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

                    picts.push(data[i]);
                }

            } else {
                for (let i = 0; i < lengpict; i++) {
                    //ini buat produksion
                    // postType = data[i].postType;
                    // if (postType === "diary") {
                    //     data[i].saleAmount = 0;
                    // }
                    mediaType = data[i].mediaType;


                    if (data[i].isApsara == true) {
                        tempdatapict.push(data[i].apsaraId);
                    } else {
                        if (mediaType == "image" || mediaType == "images") {
                            data[i].mediaEndpoint = "/pict/" + data[i].postID;
                        } else {
                            data[i].mediaEndpoint = "/stream/" + data[i].postID;

                        }
                    }
                }

                if (mediaType == "image" || mediaType == "images") {
                    resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.ImageInfo;

                } else {
                    resultpictapsara = await this.postContentService.getVideoApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.VideoList;
                }

                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boostCount = data[i].boostCount;
                    boosted = data[i].boosted;
                    var checkpictketemu = false;
                    for (var j = 0; j < gettempresultpictapsara.length; j++) {
                        if (mediaType == "image" || mediaType == "images") {
                            if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                // checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                            }
                            else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                            }
                        } else {
                            if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "VideoList": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
                            }
                        }
                    }

                    if (checkpictketemu == false) {
                        data[i].apsaraId = "";
                        data[i].isApsara = false;
                        data[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.postsService.updateBoostViewer(data[i].postID, email);
                        }
                        //pd.boostJangkauan = this.countBoosted(obj, email);
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;

                                await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


                    picts.push(data[i]);
                }
            }
        } else {
            picts = [];
            version = "";
        }
        return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    }

    @Post('api/posts/getuserposts/byprofile')
    @UseInterceptors(FileInterceptor('postContent'))
    // @UseGuards(JwtAuthGuard)
    async contentbyprofile(@Body() body, @Headers('x-auth-user') emailLogin: string): Promise<any> {
        console.log('=============================================BY PROFILE PAGE HIT=============================================')
        console.log('============================================= BODY =============================================', JSON.stringify(body))

        var pageNumber = null;
        var pageRow = null;
        var postType = null;
        var data = null;
        var datasearch = null;
        var emailreceiver = null;
        var email = null;

        if (body.pageNumber !== undefined) {
            pageNumber = body.pageNumber;
        }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        if (body.postType !== undefined) {
            postType = body.postType;
        }
        if (body.email !== undefined) {
            email = body.email;
        }

        const messages = {
            "info": ["The process successful"],
        };

        var picts = [];
        var lengpict = null;

        try {

            data = await this.postsReadService.landingpageMy2V2(email, postType, parseInt(pageNumber), parseInt(pageRow), emailLogin);
            lengpict = data.length;
            console.log("data", data);
        } catch (e) {
            console.log("ERROR", e);
            data = null;
            lengpict = 0;

        }


        //CECK FOLLOWING
        var getFollowing = false;
        var ceck_data_FOLLOW = await this.contenteventsService.ceckData(String(emailLogin), "FOLLOWING", "ACCEPT", "", email, "", true);
        if (await this.utilsService.ceckData(ceck_data_FOLLOW)) {
            getFollowing = true;
        }
        if (data != null) {
            data.forEach(v => { v.following = getFollowing; });
        }

        var tempapsaraMusicThumbId = [];
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];

        var tempdatapict = [];

        var apsaraMusicThumbId = null;
        var boosted = null;
        var boostCount = null;
        var version = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var mediaType = null;
        var postID = null;
        var gettempresultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {
            var tempapsaraId_result = null;
            var tempapsaraThumbId_result = null;
            var tempapsaraMusicThumbId_result = null;

            var resultpictapsara = null;
            version = data[0].version;
            // console.log(tempdatapict);
            if (postType == "pict") {

                for (let i = 0; i < lengpict; i++) {
                    uploadSource = data[i].uploadSource;
                    try {
                        apsaraId = data[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = data[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }
                    try {
                        apsaraMusicThumbId = data[i].apsaraMusicThumnail;
                    } catch (e) {
                        apsaraMusicThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(data[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(data[i].apsaraThumbId);
                    }

                    if (apsaraMusicThumbId != "") {
                        tempapsaraMusicThumbId.push(data[i].apsaraMusicThumnail);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);
                tempapsaraMusicThumbId_result = await this.postContentService.getImageApsara(tempapsaraMusicThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraMusicThumbId = tempapsaraMusicThumbId_result.ImageInfo;
                // for (let i = 0; i < lengpict; i++) {

                //     uploadSource = data[i].uploadSource;
                //     try {
                //         apsaraId = data[i].apsaraId;
                //     } catch (e) {
                //         apsaraId = "";
                //     }
                //     try {
                //         apsaraThumbId = data[i].apsaraThumbId;
                //     } catch (e) {
                //         apsaraThumbId = "";
                //     }

                //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);
                //         // tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
                //         tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);

                //     }
                // }
                // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // let gettempresultpictapsara = resultpictapsara.ImageInfo;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boosted = data[i].boosted;
                    boostCount = data[i].boostCount;
                    var checkpictketemu = false;
                    uploadSource = data[i].uploadSource;
                    var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    var dataUpsara = (data[i].apsaraId != undefined);

                    if (data[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
                                data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
                                data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }

                    if (data[i].apsaraMusicThumnail) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraMusicThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraMusicThumbId[j].ImageId == data[i].apsaraMusicThumnail) {
                                data[i].mediaMusicThumbEndpoint = gettempresultpictapsara_tempapsaraMusicThumbId[j].URL;
                            }
                        }
                    }
                    // emailreceiver = data[i].email;
                    // boosted = data[i].boosted;
                    // boostCount = data[i].boostCount;
                    // var checkpictketemu = false;
                    // uploadSource = data[i].uploadSource;
                    // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    // var dataUpsara = (data[i].apsaraId != undefined);

                    // if (data[i].isApsara) {
                    //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

                    //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsara) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             // checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                    //         }
                    //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsaraThum) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                    //         }
                    //     }
                    // } else {
                    //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
                    // }




                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.postsService.updateBoostViewer(data[i].postID, emailLogin);
                        }
                        //pd.boostJangkauan = this.countBoosted(obj, email);
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;
                                await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

                    picts.push(data[i]);
                }

            } else {
                for (let i = 0; i < lengpict; i++) {
                    //ini buat produksion
                    // postType = data[i].postType;
                    // if (postType === "diary") {
                    //     data[i].saleAmount = 0;
                    // }
                    mediaType = data[i].mediaType;

                    if (data[i].isApsara == true) {
                        tempdatapict.push(data[i].apsaraId);
                    } else {
                        if (mediaType == "image" || mediaType == "images") {
                            data[i].mediaEndpoint = "/pict/" + data[i].postID;
                        } else {
                            data[i].mediaEndpoint = "/stream/" + data[i].postID;

                        }
                    }
                }

                if (mediaType == "image" || mediaType == "images") {
                    resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.ImageInfo;

                } else {
                    resultpictapsara = await this.postContentService.getVideoApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.VideoList;
                }

                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boostCount = data[i].boostCount;
                    boosted = data[i].boosted;
                    var checkpictketemu = false;
                    for (var j = 0; j < gettempresultpictapsara.length; j++) {
                        if (mediaType == "image" || mediaType == "images") {
                            if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                // checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                            }
                            else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                            }
                        } else {
                            if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "VideoList": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
                            }
                        }
                    }

                    if (checkpictketemu == false) {
                        data[i].apsaraId = "";
                        data[i].isApsara = false;
                        data[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.postsService.updateBoostViewer(data[i].postID, emailLogin);
                        }
                        //pd.boostJangkauan = this.countBoosted(obj, email);
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;

                                await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


                    picts.push(data[i]);
                }
            }
        } else {
            picts = [];
            version = "";
        }


        return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    }

    @Post('api/posts/getuserposts/byprofile/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    // @UseGuards(JwtAuthGuard)
    async contentbyprofilev2(@Body() body, @Headers('x-auth-user') emailLogin: string): Promise<any> {
        console.log('=============================================BY PROFILE PAGE HIT=============================================')
        console.log('============================================= BODY =============================================', JSON.stringify(body))

        var pageNumber = null;
        var pageRow = null;
        var postType = null;
        var data = null;
        var datasearch = null;
        var emailreceiver = null;
        var email = null;
        var postid = null;
        var visibility = null;
        var active = null;
        var exp = null;
        var withinsight = null;

        if (body.pageNumber !== undefined) {
            pageNumber = body.pageNumber;
        }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        if (body.postType !== undefined) {
            postType = body.postType;
        }

        if (body.email !== undefined) {
            email = body.email;
        }

        if (body.visibility !== undefined) {
            visibility = body.visibility;
        }

        if (body.withActive !== undefined) {
            if (body.withActive == "true" || body.withActive == true) {
                active = true;
            }
            else {
                active = false;
            }
        }

        if (body.withExp !== undefined) {
            if (body.withExp == "true" || body.withExp == true) {
                exp = true;
            }
            else {
                exp = false;
            }
        }

        if (body.withInsight !== undefined) {
            if (body.withInsight == "true" || body.withInsight == true) {
                withinsight = true;
            }
            else {
                withinsight = false;
            }
        }

        if (body.postid !== undefined) {
            postid = body.postid;
        }

        const messages = {
            "info": ["The process was successful"],
        };

        var picts = [];
        var lengpict = null;

        try {

            //data = await this.postsReadService.landingpageMy2V2(email, postType, parseInt(pageNumber), parseInt(pageRow), emailLogin);
            // data = await this.post2SS.landingpageMigration(email, emailLogin, postType, postid, visibility, active, exp, withinsight, parseInt(pageNumber), parseInt(pageRow))
            // data = await this.post2SS.landingpageMigrationUpdate(email, emailLogin, postType, postid, visibility, active, exp, withinsight, parseInt(pageNumber), parseInt(pageRow))
            if(email != emailLogin)
            {
                data = await this.post2SS.landingPageGelondonganBedaEmail(email, emailLogin, postType, parseInt(pageNumber), parseInt(pageRow));    
            }
            else
            {
                data = await this.post2SS.landingPageGelondonganSamaEmail(email, postType, parseInt(pageNumber), parseInt(pageRow));
            }
            lengpict = data.length;
            console.log("data", data);
        } catch (e) {
            console.log("ERROR", e);
            data = null;
            lengpict = 0;

        }

        //CECK FOLLOWING
        // var getFollowing = false;
        // var ceck_data_FOLLOW = await this.contenteventsService.ceckData(String(emailLogin), "FOLLOWING", "ACCEPT", "", email, "", true);
        // if (await this.utilsService.ceckData(ceck_data_FOLLOW)) {
        //     getFollowing = true;
        // }
        // if (data != null) {
        //     data.forEach(v => { v.following = getFollowing; });
        // }

        var tempapsaraMusicThumbId = [];
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];

        var tempdatapict = [];

        var apsaraMusicThumbId = null;
        var boosted = null;
        var boostCount = null;
        var version = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var mediaType = null;
        var postID = null;
        var gettempresultpictapsara = null;
        if (lengpict > 0) {
            var tempapsaraId_result = null;
            var tempapsaraThumbId_result = null;
            var tempapsaraMusicThumbId_result = null;

            var resultpictapsara = null;
            version = data[0].version;
            if (postType == "pict") {

                for (let i = 0; i < lengpict; i++) {
                    uploadSource = data[i].uploadSource;
                    try {
                        apsaraId = data[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = data[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }
                    try {
                        apsaraMusicThumbId = data[i].apsaraMusicThumnail;
                    } catch (e) {
                        apsaraMusicThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(data[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(data[i].apsaraThumbId);
                    }

                    if (apsaraMusicThumbId != "") {
                        tempapsaraMusicThumbId.push(data[i].apsaraMusicThumnail);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContent2SS.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContent2SS.getImageApsara(tempapsaraThumbId);
                tempapsaraMusicThumbId_result = await this.postContent2SS.getImageApsara(tempapsaraMusicThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraMusicThumbId = tempapsaraMusicThumbId_result.ImageInfo;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boosted = data[i].boosted;
                    boostCount = data[i].boostCount;
                    var checkpictketemu = false;
                    uploadSource = data[i].uploadSource;
                    var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    var dataUpsara = (data[i].apsaraId != undefined);

                    if (data[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
                                data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
                                data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }

                    if (data[i].apsaraMusicThumnail) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraMusicThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraMusicThumbId[j].ImageId == data[i].apsaraMusicThumnail) {
                                data[i].mediaMusicThumbEndpoint = gettempresultpictapsara_tempapsaraMusicThumbId[j].URL;
                            }
                        }
                    }

                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.post2SS.updateBoostViewer(data[i].postID, emailLogin);
                        }
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;
                                await this.post2SS.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }

                    picts.push(data[i]);
                }

            } else {
                for (let i = 0; i < lengpict; i++) {
                    //ini buat produksion
                    // postType = data[i].postType;
                    // if (postType === "diary") {
                    //     data[i].saleAmount = 0;
                    // }
                    mediaType = data[i].mediaType;

                    if (data[i].isApsara == true) {
                        tempdatapict.push(data[i].apsaraId);
                    } else {
                        if (mediaType == "image" || mediaType == "images") {
                            data[i].mediaEndpoint = "/pict/" + data[i].postID;
                        } else {
                            data[i].mediaEndpoint = "/stream/" + data[i].postID;

                        }
                    }
                }

                if (mediaType == "image" || mediaType == "images") {
                    resultpictapsara = await this.postContent2SS.getImageApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.ImageInfo;

                } else {
                    resultpictapsara = await this.postContent2SS.getVideoApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.VideoList;
                }

                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boostCount = data[i].boostCount;
                    boosted = data[i].boosted;
                    var checkpictketemu = false;
                    for (var j = 0; j < gettempresultpictapsara.length; j++) {
                        if (mediaType == "image" || mediaType == "images") {
                            if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;

                            }
                            else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                            }
                        } else {
                            if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "VideoList": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
                            }
                        }
                    }

                    if (checkpictketemu == false) {
                        data[i].apsaraId = "";
                        data[i].isApsara = false;
                        data[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.post2SS.updateBoostViewer(data[i].postID, emailLogin);
                        }
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;

                                await this.post2SS.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }

                    picts.push(data[i]);
                }
            }
        } else {
            picts = [];
            version = "";
        }


        return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    }

    @Post('api/getusercontents/landingpage')
    // @UseGuards(JwtAuthGuard)
    async contentlandingpage(@Req() request: Request, @Headers() headers): Promise<any> {
        console.log('=============================================LANDING PAGE HIT=============================================')
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var skip = 0;
        var limit = 0;
        var type = null;
        var email = null;
        var data = null;
        var datasearch = null;
        var emailreceiver = null;


        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        limit = request_json["limit"];
        // if (request_json["limit"] !== undefined) {
        //     limit = request_json["limit"];
        // } else {
        //     throw new BadRequestException("Unabled to proceed");
        // }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        var picts = [];
        var lengpict = null;


        try {
            // data = await this.postsService.landingpage(email, type, skip, limit);
            data = await this.tempPOSTss.landingPagebaru(email, type, skip, limit);
            if (data.length < 5) {
                data = await this.postsReadService.landingpage7(email, type, skip, limit);
            }
            lengpict = data.length;

        } catch (e) {
            data = null;
            lengpict = 0;

        }
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];

        var boosted = null;
        var boostCount = null;
        var version = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var isApsara = null;
        var postType = null;
        var versionIos = null;
        // console.log(lengpict);
        if (lengpict > 0) {
            var resultpictapsara = null;
            version = data[0].version;
            versionIos = data[0].versionIos;
            var tempapsaraId_result = null;
            var tempapsaraThumbId_result = null;

            // console.log(tempdatapict);
            // if (type == "pict") {

            //     for (let i = 0; i < lengpict; i++) {

            //         uploadSource = data[i].uploadSource;
            //         isApsara = data[i].isApsara;
            //         try {
            //             apsaraId = data[i].apsaraId;
            //         } catch (e) {
            //             apsaraId = "";
            //         }
            //         try {
            //             apsaraThumbId = data[i].apsaraThumbId;
            //         } catch (e) {
            //             apsaraThumbId = "";
            //         }

            //         if (apsaraId !== undefined && apsaraThumbId !== undefined) {
            //             tempdatapict.push(data[i].apsaraId);

            //         }
            //         else if (apsaraId !== undefined && apsaraThumbId === undefined) {
            //             tempdatapict.push(data[i].apsaraId);

            //         }
            //         else if (apsaraId === undefined && apsaraThumbId !== undefined) {
            //             tempdatapict.push(data[i].apsaraThumbId);

            //         }
            //     }
            //     resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
            //     let gettempresultpictapsara = resultpictapsara.ImageInfo;
            //     for (let i = 0; i < lengpict; i++) {
            //         emailreceiver = data[i].email;
            //         boosted = data[i].boosted;
            //         boostCount = data[i].boostCount;
            //         var checkpictketemu = false;
            //         uploadSource = data[i].uploadSource;


            //         if (isApsara !== undefined && isApsara == false) {
            //             data[i].mediaThumbEndpoint = data[i].mediaEndpoint;

            //         } else {

            //             for (var j = 0; j < gettempresultpictapsara.length; j++) {

            //                 if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
            //                     // checkpictketemu = true;
            //                     data[i].media =
            //                     {
            //                         "ImageInfo": [gettempresultpictapsara[j]]
            //                     }

            //                     data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
            //                     data[i].mediaEndpoint = gettempresultpictapsara[j].URL;



            //                 }
            //                 else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
            //                     checkpictketemu = true;
            //                     data[i].media =
            //                     {
            //                         "ImageInfo": [gettempresultpictapsara[j]]
            //                     }

            //                     data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
            //                     data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

            //                 }
            //             }
            //         }




            //         if (boosted !== null || boosted.length > 0) {
            //             console.log("boosted: " + data[i].postID);
            //             this.postsService.updateBoostViewer(data[i].postID, email);
            //             //pd.boostJangkauan = this.countBoosted(obj, email);
            //             if (boosted.length > 0) {
            //                 if (boosted[0] != undefined) {
            //                     boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
            //                     boosted = boosted;
            //                     await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
            //                 } else {
            //                     boostCount = 0;
            //                     boosted = [];
            //                 }
            //             } else {
            //                 boostCount = 0;
            //                 boosted = [];
            //             }
            //         } else {
            //             boostCount = 0;
            //             boosted = [];
            //         }
            //         //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

            //         picts.push(data[i]);
            //     }

            // } 
            if (type == "pict") {
                for (let i = 0; i < lengpict; i++) {
                    uploadSource = data[i].uploadSource;
                    try {
                        apsaraId = data[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = data[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(data[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(data[i].apsaraThumbId);
                    }
                }
                // console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
                // for (let i = 0; i < lengpict; i++) {

                //     uploadSource = data[i].uploadSource;
                //     try {
                //         apsaraId = data[i].apsaraId;
                //     } catch (e) {
                //         apsaraId = "";
                //     }
                //     try {
                //         apsaraThumbId = data[i].apsaraThumbId;
                //     } catch (e) {
                //         apsaraThumbId = "";
                //     }

                //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);
                //         // tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
                //         tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);

                //     }
                // }
                // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // let gettempresultpictapsara = resultpictapsara.ImageInfo;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boosted = data[i].boosted;
                    boostCount = data[i].boostCount;
                    var checkpictketemu = false;
                    uploadSource = data[i].uploadSource;
                    var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    var dataUpsara = (data[i].apsaraId != undefined);

                    if (data[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
                                data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        // for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                        //     if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
                        //         data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                        //         if (!dataUpsara) {
                        //             data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                        //         }
                        //     }
                        // }
                    } else {
                        data[i].mediaThumbEndpoint = data[i].mediaEndpoint;

                    }
                    // emailreceiver = data[i].email;
                    // boosted = data[i].boosted;
                    // boostCount = data[i].boostCount;
                    // var checkpictketemu = false;
                    // uploadSource = data[i].uploadSource;
                    // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    // var dataUpsara = (data[i].apsaraId != undefined);

                    // if (data[i].isApsara) {
                    //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

                    //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsara) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             // checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                    //         }
                    //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsaraThum) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                    //         }
                    //     }
                    // } else {
                    //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
                    // }




                    if (boosted !== null && boosted !== undefined) {

                        if (boosted.length > 0) {
                            console.log("boosted: " + data[i].postID);
                            this.postsReadService.updateBoostViewer(data[i].postID, auth.email);
                            //pd.boostJangkauan = this.countBoosted(obj, email);
                            if (boosted.length > 0) {
                                if (boosted[0] != undefined) {
                                    boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                    boosted = boosted;
                                    await this.postsReadService.updateBoostCount(data[i].postID, boostCount + 1);
                                } else {
                                    boostCount = 0;
                                    boosted = [];
                                }
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        }

                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

                    picts.push(data[i]);
                }

            }
            else {
                for (let i = 0; i < lengpict; i++) {
                    //ini buat produksion
                    // postType = data[i].postType;
                    // if (postType === "diary") {
                    //     data[i].saleAmount = 0;
                    // }

                    if (data[i].isApsara == true) {
                        tempdatapict.push(data[i].apsaraId);
                    }
                }
                resultpictapsara = await this.postContentService.getVideoApsara(tempdatapict);
                let gettempresultpictapsara = resultpictapsara.VideoList;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boostCount = data[i].boostCount;
                    boosted = data[i].boosted;
                    var checkpictketemu = false;
                    for (var j = 0; j < gettempresultpictapsara.length; j++) {
                        if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
                            checkpictketemu = true;
                            data[i].media =
                            {
                                "VideoList": [gettempresultpictapsara[j]]
                            }

                            data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
                        }
                    }

                    if (checkpictketemu == false) {
                        data[i].apsaraId = "";
                        data[i].isApsara = false;
                        data[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    if (boosted !== null && boosted !== undefined) {
                        if (boosted.length > 0) {
                            console.log("boosted: " + data[i].postID);
                            this.postsReadService.updateBoostViewer(data[i].postID, auth.email);
                            //pd.boostJangkauan = this.countBoosted(obj, email);
                            if (boosted.length > 0) {
                                if (boosted[0] != undefined) {
                                    boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                    boosted = boosted;

                                    await this.postsReadService.updateBoostCount(data[i].postID, boostCount + 1);
                                } else {
                                    boostCount = 0;
                                    boosted = [];
                                }
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


                    picts.push(data[i]);
                }
            }
        } else {
            picts = [];
            version = "";
            versionIos = "";
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data: picts, version: version.toString(), version_ios: versionIos.toString(), messages };
    }

    // @UseGuards(JwtAuthGuard)
    @Post('api/posts/getnotification2')
    @UseInterceptors(FileInterceptor('postContent'))
    async getNotification2(@Body() body, @Headers('x-auth-user') email: string, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        this.logger.log("getNotification >>> start: " + JSON.stringify(body));
        var eventType = null;
        var pageRow = null;
        var pageNumber = null;
        var data = null;
        var lengpict = null;
        if (body.eventType !== undefined) {
            eventType = body.eventType;
        }
        if (body.pageNumber !== undefined) {
            pageNumber = body.pageNumber;
        }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        const messages = {
            "info": ["The process successful"],
        };
        try {

            data = await this.notificationReadService.getNotification2(email, eventType, parseInt(pageNumber), parseInt(pageRow));
            lengpict = data.length;

        } catch (e) {
            data = null;
            lengpict = 0;

        }

        var datatemp = [];
        var tempdatapict = [];
        var apsaraId = null;
        var isApsara = null;
        var apsaraThumbId = null;
        var uploadSource = null;
        var postType = null;
        var mediaTypeStory = null;
        // console.log(lengpict);
        if (lengpict > 0) {

            for (let i = 0; i < lengpict; i++) {

                try {
                    postType = data[i].postType;
                } catch (e) {
                    postType = "";
                }
                try {
                    mediaTypeStory = data[i].mediaTypeStory;
                } catch (e) {
                    mediaTypeStory = "";
                }
                if (postType === "pict") {
                    try {
                        apsaraId = data[i].content.apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        isApsara = data[i].content.isApsara;
                    } catch (e) {
                        isApsara = "";
                    }
                    try {
                        apsaraThumbId = data[i].content.apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }


                    try {

                        uploadSource = data[i].content.uploadSource;
                    } catch (e) {
                        uploadSource = "";
                    }

                    if (apsaraId !== undefined && apsaraThumbId !== undefined) {
                        tempdatapict.push(data[i].content.apsaraThumbId);

                    }
                    else if (apsaraId !== undefined && apsaraThumbId === undefined) {
                        tempdatapict.push(data[i].content.apsaraId);

                    }
                    else if (apsaraId === undefined && apsaraThumbId !== undefined) {
                        tempdatapict.push(data[i].content.apsaraThumbId);

                    }
                    var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                    var gettempresultpictapsara = resultpictapsara.ImageInfo;

                    if (uploadSource == "OSS") {
                        data[i].content.mediaThumbEndpoint = data[i].content.mediaEndpoint;

                    } else {
                        for (var j = 0; j < gettempresultpictapsara.length; j++) {

                            if (gettempresultpictapsara[j].ImageId == data[i].content.apsaraThumbId) {

                                data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

                            }
                            else if (gettempresultpictapsara[j].ImageId == data[i].content.apsaraId) {

                                data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

                            }
                        }
                    }


                }
                else if (postType === "vid" || postType === "diary") {
                    try {
                        apsaraId = data[i].content.apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        isApsara = data[i].content.isApsara;
                    } catch (e) {
                        isApsara = "";
                    }

                    try {

                        uploadSource = data[i].content.uploadSource;
                    } catch (e) {
                        uploadSource = "";
                    }


                    if (apsaraId !== undefined && apsaraId !== '') {
                        tempdatapict.push(data[i].content.apsaraId);

                    }

                    var resultvidapsara = await this.postContentService.getVideoApsara(tempdatapict);
                    var gettempresultvidapsara = resultvidapsara.VideoList;

                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        var apsaraID = null;
                        try {

                            apsaraID = data[i].content.apsaraId;
                        } catch (e) {
                            apsaraID = null;
                        }

                        if (apsaraID !== null && apsaraID !== undefined) {
                            if (gettempresultvidapsara[j].VideoId == apsaraID) {

                                data[i].content.mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;

                            }
                        }
                    }
                }
                else {


                    try {
                        apsaraId = data[i].content.apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        isApsara = data[i].content.isApsara;
                    } catch (e) {
                        isApsara = "";
                    }

                    try {

                        uploadSource = data[i].content.uploadSource;
                    } catch (e) {
                        uploadSource = "";
                    }


                    if (apsaraId !== undefined && apsaraId !== '') {
                        tempdatapict.push(data[i].content.apsaraId);

                    }

                    if (mediaTypeStory !== undefined && mediaTypeStory === "video") {
                        var resultvidapsara = await this.postContentService.getVideoApsara(tempdatapict);
                        var gettempresultvidapsara = resultvidapsara.VideoList;

                        for (var j = 0; j < gettempresultvidapsara.length; j++) {

                            if (gettempresultvidapsara[j].VideoId == data[i].content.apsaraId) {

                                data[i].content.mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;

                            }

                        }
                    } else {
                        var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                        var gettempresultpictapsara = resultpictapsara.ImageInfo;

                        for (var j = 0; j < gettempresultpictapsara.length; j++) {

                            if (apsaraId !== undefined && apsaraId !== "") {
                                if (gettempresultpictapsara[j].ImageId == apsaraId) {

                                    data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

                                }
                            }

                        }
                    }
                }

            }


        } else {
            data = [];
        }

        var fullurl = headers.host + "/api/posts/getnotification2";
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, body);

        return { response_code: 202, data, messages };
    }

    // @UseGuards(JwtAuthGuard)
    @Post('api/posts/getnotification2/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    async getNotification2V2(@Body() body, @Headers('x-auth-user') email: string, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        this.logger.log("getNotification >>> start: " + JSON.stringify(body));
        var eventType = null;
        var pageRow = null;
        var pageNumber = null;
        var data = null;
        var lengpict = null;
        if (body.eventType !== undefined) {
            eventType = body.eventType;
        }
        if (body.pageNumber !== undefined) {
            pageNumber = body.pageNumber;
        }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        const messages = {
            "info": ["The process was successful"],
        };
        console.log(await this.utilsService.getDateTimeString());
        try {
            data = await this.notificationReadService.getNotification2V2(email, eventType, parseInt(pageNumber), parseInt(pageRow));
            lengpict = data.length;

        } catch (e) {
            data = null;
            lengpict = 0;

        }
        // console.log(JSON.parse(JSON.stringify(data)));
        console.log(await this.utilsService.getDateTimeString());

        var datatemp = [];
        var tempdatapict = [];
        var apsaraId = null;
        var isApsara = null;
        var apsaraThumbId = null;
        var uploadSource = null;
        var postType = null;
        var mediaTypeStory = null;
        // console.log(lengpict);
        if (lengpict > 0) {
            var listdata = [];
            var tempresult = null;
            var tempdata = null;

            for (var j = 0; j < data.length; j++) {
                tempdata = data[j];
                if (tempdata.postID != null && tempdata.postID != undefined) {
                    if (tempdata.eventType != 'CHALLENGE') {
                        try {
                            if (tempdata.content.isApsara == true) {
                                listdata.push(tempdata.content.apsaraId);
                            }
                            else {
                                listdata.push(undefined);
                            }
                        } catch (e) {
                            listdata.push(undefined);
                        }
                    }
                }
            }

            //console.log(listdata);
            var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
            // console.log(apsaraimagedata);
            tempresult = apsaraimagedata.ImageInfo;
            for (var i = 0; i < data.length; i++) {
                let getdetailpost = data[i];
                if (getdetailpost.postID != null && getdetailpost.postID != undefined) {
                    if (getdetailpost.eventType != 'CHALLENGE') {
                        for (var j = 0; j < tempresult.length; j++) {
                            if (tempresult[j].ImageId == data[i].content.apsaraThumbId) {
                                data[i].content.mediaThumbEndpoint = tempresult[j].URL;
                            }
                            else if (tempresult[j].ImageId == data[i].content.apsaraId) {
                                data[i].content.mediaThumbEndpoint = tempresult[j].URL;
                            }
                        }
                    }
                }
            }

            var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
            // console.log(apsaravideodata);
            // console.log(resultdata.ImageInfo[0]);
            tempresult = apsaravideodata.VideoList;
            for (var i = 0; i < data.length; i++) {
                let getdetailpost = data[i];
                if (getdetailpost.postID != null && getdetailpost.postID != undefined) {
                    if (getdetailpost.eventType != 'CHALLENGE') {
                        for (var j = 0; j < tempresult.length; j++) {
                            if (tempresult[j].VideoId == data[i].content.apsaraId) {
                                data[i].content.mediaThumbEndpoint = tempresult[j].CoverURL;
                            }
                        }
                    }
                }
            }

            // for (let i = 0; i < lengpict; i++) {

            //     try {
            //         postType = data[i].postType;
            //     } catch (e) {
            //         postType = "";
            //     }
            //     try {
            //         // mediaTypeStory = data[i].mediaTypeStory;
            //         mediaTypeStory = data[i].content.mediaType;
            //     } catch (e) {
            //         mediaTypeStory = "";
            //     }
            //     if (postType === "pict") {
            //         try {
            //             apsaraId = data[i].content.apsaraId;
            //         } catch (e) {
            //             apsaraId = "";
            //         }
            //         try {
            //             isApsara = data[i].content.isApsara;
            //         } catch (e) {
            //             isApsara = "";
            //         }
            //         try {
            //             apsaraThumbId = data[i].content.apsaraThumbId;
            //         } catch (e) {
            //             apsaraThumbId = "";
            //         }


            //         try {

            //             uploadSource = data[i].content.uploadSource;
            //         } catch (e) {
            //             uploadSource = "";
            //         }

            //         if (apsaraId !== undefined && apsaraThumbId !== undefined) {
            //             tempdatapict.push(data[i].content.apsaraThumbId);

            //         }
            //         else if (apsaraId !== undefined && apsaraThumbId === undefined) {
            //             tempdatapict.push(data[i].content.apsaraId);

            //         }
            //         else if (apsaraId === undefined && apsaraThumbId !== undefined) {
            //             tempdatapict.push(data[i].content.apsaraThumbId);

            //         }
            //         var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
            //         var gettempresultpictapsara = resultpictapsara.ImageInfo;

            //         if (uploadSource == "OSS") {
            //             data[i].content.mediaThumbEndpoint = data[i].content.mediaEndpoint;

            //         } else {
            //             for (var j = 0; j < gettempresultpictapsara.length; j++) {

            //                 if (gettempresultpictapsara[j].ImageId == data[i].content.apsaraThumbId) {

            //                     data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

            //                 }
            //                 else if (gettempresultpictapsara[j].ImageId == data[i].content.apsaraId) {

            //                     data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

            //                 }
            //             }
            //         }


            //     }
            //     else if (postType === "vid" || postType === "diary") {
            //         try {
            //             apsaraId = data[i].content.apsaraId;
            //         } catch (e) {
            //             apsaraId = "";
            //         }
            //         try {
            //             isApsara = data[i].content.isApsara;
            //         } catch (e) {
            //             isApsara = "";
            //         }

            //         try {

            //             uploadSource = data[i].content.uploadSource;
            //         } catch (e) {
            //             uploadSource = "";
            //         }


            //         if (apsaraId !== undefined && apsaraId !== '') {
            //             tempdatapict.push(data[i].content.apsaraId);

            //         }

            //         var resultvidapsara = await this.postContentService.getVideoApsara(tempdatapict);
            //         var gettempresultvidapsara = resultvidapsara.VideoList;

            //         for (var j = 0; j < gettempresultvidapsara.length; j++) {
            //             var apsaraID = null;
            //             try {

            //                 apsaraID = data[i].content.apsaraId;
            //             } catch (e) {
            //                 apsaraID = null;
            //             }

            //             if (apsaraID !== null && apsaraID !== undefined) {
            //                 if (gettempresultvidapsara[j].VideoId == apsaraID) {

            //                     data[i].content.mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;

            //                 }
            //             }



            //         }
            //     }
            //     else {


            //         try {
            //             apsaraId = data[i].content.apsaraId;
            //         } catch (e) {
            //             apsaraId = "";
            //         }
            //         try {
            //             isApsara = data[i].content.isApsara;
            //         } catch (e) {
            //             isApsara = "";
            //         }

            //         try {

            //             uploadSource = data[i].content.uploadSource;
            //         } catch (e) {
            //             uploadSource = "";
            //         }


            //         if (apsaraId !== undefined && apsaraId !== '') {
            //             tempdatapict.push(data[i].content.apsaraId);

            //         }

            //         if (mediaTypeStory !== undefined && mediaTypeStory === "video") {
            //             var resultvidapsara = await this.postContentService.getVideoApsara(tempdatapict);
            //             var gettempresultvidapsara = resultvidapsara.VideoList;

            //             for (var j = 0; j < gettempresultvidapsara.length; j++) {

            //                 if (gettempresultvidapsara[j].VideoId == data[i].content.apsaraId) {

            //                     data[i].content.mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;

            //                 }

            //             }
            //         } else {
            //             var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
            //             var gettempresultpictapsara = resultpictapsara.ImageInfo;

            //             for (var j = 0; j < gettempresultpictapsara.length; j++) {

            //                 if (apsaraId !== undefined && apsaraId !== "") {
            //                     if (gettempresultpictapsara[j].ImageId == apsaraId) {

            //                         data[i].content.mediaThumbEndpoint = gettempresultpictapsara[j].URL;

            //                     }
            //                 }

            //             }
            //         }
            //     }




            // }


        } else {
            data = [];
        }

        var fullurl = headers.host + "/api/posts/getnotification2/v2";
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, body);

        return { response_code: 202, data, messages };
    }

    @Post('api/posts/getuserposts/byprofile/index')
    @UseInterceptors(FileInterceptor('postContent'))
    // @UseGuards(JwtAuthGuard)
    async contentbyprofilev24(@Body() body, @Headers('x-auth-user') emailLogin: string): Promise<any> {
        console.log('=============================================BY PROFILE PAGE HIT=============================================')
        console.log('============================================= BODY =============================================', JSON.stringify(body))

        var pageNumber = null;
        var pageRow = null;
        var postType = null;
        var data = null;
        var datasearch = null;
        var emailreceiver = null;
        var email = null;
        var postid = null;
        var visibility = null;
        var active = null;
        var exp = null;
        var withinsight = null;
        var index = null;
        var page = null;
        var sisa = null;

        // if (body.pageNumber !== undefined) {
        //     pageNumber = body.pageNumber;
        // }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        if (body.postType !== undefined) {
            postType = body.postType;
        }

        if (body.email !== undefined) {
            email = body.email;
        }

        if (body.visibility !== undefined) {
            visibility = body.visibility;
        }
        if (body.index !== undefined) {
            index = body.index;
        }
        if (body.withActive !== undefined) {
            if (body.withActive == "true" || body.withActive == true) {
                active = true;
            }
            else {
                active = false;
            }
        }

        if (body.withExp !== undefined) {
            if (body.withExp == "true" || body.withExp == true) {
                exp = true;
            }
            else {
                exp = false;
            }
        }

        if (body.withInsight !== undefined) {
            if (body.withInsight == "true" || body.withInsight == true) {
                withinsight = true;
            }
            else {
                withinsight = false;
            }
        }

        if (body.postid !== undefined) {
            postid = body.postid;
        }

        page = parseInt(index) / parseInt(pageRow);
        page = parseInt(page);

        sisa = index % pageRow;

        if (sisa > 0) {
            page = page + 1;
        }

        const messages = {
            "info": ["The process was successful"],
        };

        var picts = [];
        var lengpict = null;

        try {

            // data = await this.postsReadService.landingpageMy2V2(email, postType, parseInt(pageNumber), parseInt(pageRow), emailLogin);
            // data = await this.post2SS.landingpageMigration(email, emailLogin, postType, postid, visibility, active, exp, withinsight, parseInt(pageNumber), parseInt(pageRow))
            data = await this.post2SS.landingpageMigrationV2(email, emailLogin, postType, postid, visibility, active, exp, withinsight, page, parseInt(pageRow))
            lengpict = data.length;
            console.log("data", data);
        } catch (e) {
            console.log("ERROR", e);
            data = null;
            lengpict = 0;

        }

        //CECK FOLLOWING
        var getFollowing = false;
        var ceck_data_FOLLOW = await this.contenteventsService.ceckData(String(emailLogin), "FOLLOWING", "ACCEPT", "", email, "", true);
        if (await this.utilsService.ceckData(ceck_data_FOLLOW)) {
            getFollowing = true;
        }
        if (data != null) {
            data.forEach(v => { v.following = getFollowing; });
        }

        var tempapsaraMusicThumbId = [];
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];

        var tempdatapict = [];

        var apsaraMusicThumbId = null;
        var boosted = null;
        var boostCount = null;
        var version = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var mediaType = null;
        var postID = null;
        var gettempresultpictapsara = null;
        if (lengpict > 0) {
            var tempapsaraId_result = null;
            var tempapsaraThumbId_result = null;
            var tempapsaraMusicThumbId_result = null;

            var resultpictapsara = null;
            version = data[0].version;
            if (postType == "pict") {

                for (let i = 0; i < lengpict; i++) {
                    uploadSource = data[i].uploadSource;
                    try {
                        apsaraId = data[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = data[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }
                    try {
                        apsaraMusicThumbId = data[i].apsaraMusicThumnail;
                    } catch (e) {
                        apsaraMusicThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(data[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(data[i].apsaraThumbId);
                    }

                    if (apsaraMusicThumbId != "") {
                        tempapsaraMusicThumbId.push(data[i].apsaraMusicThumnail);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContent2SS.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContent2SS.getImageApsara(tempapsaraThumbId);
                tempapsaraMusicThumbId_result = await this.postContent2SS.getImageApsara(tempapsaraMusicThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraMusicThumbId = tempapsaraMusicThumbId_result.ImageInfo;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boosted = data[i].boosted;
                    boostCount = data[i].boostCount;
                    var checkpictketemu = false;
                    uploadSource = data[i].uploadSource;
                    var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    var dataUpsara = (data[i].apsaraId != undefined);

                    if (data[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
                                data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
                                data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }

                    if (data[i].apsaraMusicThumnail) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraMusicThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraMusicThumbId[j].ImageId == data[i].apsaraMusicThumnail) {
                                data[i].mediaMusicThumbEndpoint = gettempresultpictapsara_tempapsaraMusicThumbId[j].URL;
                            }
                        }
                    }

                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.post2SS.updateBoostViewer(data[i].postID, emailLogin);
                        }
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;
                                await this.post2SS.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }

                    picts.push(data[i]);
                }

            } else {
                for (let i = 0; i < lengpict; i++) {
                    //ini buat produksion
                    // postType = data[i].postType;
                    // if (postType === "diary") {
                    //     data[i].saleAmount = 0;
                    // }
                    mediaType = data[i].mediaType;

                    if (data[i].isApsara == true) {
                        tempdatapict.push(data[i].apsaraId);
                    } else {
                        if (mediaType == "image" || mediaType == "images") {
                            data[i].mediaEndpoint = "/pict/" + data[i].postID;
                        } else {
                            data[i].mediaEndpoint = "/stream/" + data[i].postID;

                        }
                    }
                }

                if (mediaType == "image" || mediaType == "images") {
                    resultpictapsara = await this.postContent2SS.getImageApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.ImageInfo;

                } else {
                    resultpictapsara = await this.postContent2SS.getVideoApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.VideoList;
                }

                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boostCount = data[i].boostCount;
                    boosted = data[i].boosted;
                    var checkpictketemu = false;
                    for (var j = 0; j < gettempresultpictapsara.length; j++) {
                        if (mediaType == "image" || mediaType == "images") {
                            if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;

                            }
                            else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                            }
                        } else {
                            if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "VideoList": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
                            }
                        }
                    }

                    if (checkpictketemu == false) {
                        data[i].apsaraId = "";
                        data[i].isApsara = false;
                        data[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.post2SS.updateBoostViewer(data[i].postID, emailLogin);
                        }
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;

                                await this.post2SS.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }

                    picts.push(data[i]);
                }
            }
        } else {
            picts = [];
            version = "";
        }


        return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    }
}