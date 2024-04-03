import { Body, Controller, Delete, Get, Param, Headers, Post, UseGuards, Put, BadRequestException, Head, UseInterceptors } from '@nestjs/common';
import { GetusercontentsService } from './getusercontents.service';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents } from './schemas/getusercontents.schema';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import { SettingsService } from '../settings/settings.service';
import { GetcontenteventsService } from '../getusercontents/getcontentevents/getcontentevents.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req } from '@nestjs/common';
import { Request } from 'express';
import { CountriesService } from '../../infra/countries/countries.service';
import { GetuserprofilesService } from '../getuserprofiles/getuserprofiles.service';
import { PostsService } from '../../content/posts/posts.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { PostContentService } from '../../content/posts/postcontent.service';
import { PostBoostService } from '../../content/posts/postboost.service';
import { DisquslogsService } from '../../content/disquslogs/disquslogs.service';
import { ContenteventsService } from '../../content/contentevents/contentevents.service';
import { TagCountService } from '../../content/tag_count/tag_count.service';
import { InterestCountService } from '../../content/interest_count/interest_count.service';
import { UtilsService } from '../../utils/utils.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogapisService } from '../logapis/logapis.service';
import { MediamusicService } from 'src/content/mediamusic/mediamusic.service';
@Controller()
export class GetusercontentsController {
    constructor(private readonly getusercontentsService: GetusercontentsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly getcontenteventsService: GetcontenteventsService,
        private readonly settingsService: SettingsService,
        private readonly countriesService: CountriesService,
        private readonly getuserprofilesService: GetuserprofilesService,
        private readonly userauthsService: UserauthsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
        private readonly PostBoostService: PostBoostService,
        private readonly mediaprofilepictsService: MediaprofilepictsService,
        private readonly contenteventsService: ContenteventsService,
        private readonly disquslogsService: DisquslogsService,
        private readonly tagCountService: TagCountService,
        private utilsService: UtilsService,
        private readonly interestCountService: InterestCountService,
        private readonly logapiSS: LogapisService,
        private readonly mediamusicService: MediamusicService
    ) { }

    @Post('api/getusercontents/all')
    @UseGuards(JwtAuthGuard)
    async contentuserall(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var page = 0;
        var limit = 0;
        var monetize = null;
        var startdate = null;
        var enddate = null;
        var popular = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        monetize = request_json["monetize"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        popular = request_json["popular"];
        const messages = {
            "info": ["The process successful"],
        };



        var total = null;
        var totalsearch = null;
        var totalallrow = null;
        var totalpage = null;
        let data = await this.getusercontentsService.findalldata(email, monetize, popular, startdate, enddate, page, limit);

        total = data.length;
        let datasearch = await this.getusercontentsService.findalldata(email, monetize, popular, startdate, enddate, 0, 0);
        totalsearch = datasearch.length;

        let dataall = await this.getusercontentsService.findalldata(email, undefined, undefined, undefined, undefined, 0, 0);
        totalallrow = dataall.length;

        var tpage = null;
        var tpage2 = null;

        tpage2 = (totalsearch / limit).toFixed(0);
        tpage = (totalsearch % limit);
        if (tpage > 0 && tpage < 5) {
            totalpage = parseInt(tpage2) + 1;

        } else {
            totalpage = parseInt(tpage2);
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }

    @Post('api/getusercontents/latest')
    @UseGuards(JwtAuthGuard)
    async contentuserlatest(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var skip = 0;
        var limit = 0;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findlatesdata(email, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/popular')
    @UseGuards(JwtAuthGuard)
    async contentuser(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var skip = 0;
        var limit = 0;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findpopular(email, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/monetize')
    @UseGuards(JwtAuthGuard)
    async contentusermonetize(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var skip = 0;
        var limit = 0;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findmonetize(email, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/search')
    @UseGuards(JwtAuthGuard)
    async contentusersearch(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var emailreq = auth.email;

        var skip = 0;
        var limit = 0;
        var email = null;
        var title = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, emailreq, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["title"] !== undefined) {
            title = request_json["title"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, emailreq, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, emailreq, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, emailreq, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findsearch(email, title, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, emailreq, null, null, request_json);

        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/management/all')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagement(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
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

        let data = await this.getusercontentsService.findmanagementcontentall(email);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/management/grouping')
    @UseGuards(JwtAuthGuard)
    async contentmanagemen2(@Req() request: Request): Promise<any> {
        var fullurl = request.get("Host") + request.originalUrl;

        var timestamps_start = await this.utilsService.getDateTimeString();
        var data = null;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
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
        data = await this.getusercontentsService.detaildasbor(email);

        var timestamps_end = await this.utilsService.getDateTimeString();

        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/grouping/activitygraph')
    @UseGuards(JwtAuthGuard)
    async contentmanagemengraphactivity(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var data = null;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
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

        data = await this.getusercontentsService.getactivitygraph(email);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/time')
    @UseGuards(JwtAuthGuard)
    async contentusertime(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var DateDiff = require('date-diff');

        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        let datatime = await this.getusercontentsService.findtime(postID);

        var createdate = datatime[0].createdAt;

        var subtahun = createdate.substring(0, 4);
        var subbulan = createdate.substring(7, 5);
        var subtanggal = createdate.substring(10, 8);
        var datatimestr = subtahun + "-" + subbulan + "-" + subtanggal;




        var today = new Date();
        var date1 = new Date(datatimestr);


        var diffDays = Math.floor(today.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
        var diffsec = Math.round(today.getTime() - date1.getTime()) / (1000) % 60;
        var diffMins = Math.round(today.getTime() - date1.getTime()) / (1000 * 60) % 60;
        var diffHrs = Math.floor(today.getTime() - date1.getTime()) / (1000 * 60 * 60) % 24;
        var days = diffDays.toFixed(0);
        var hours = diffHrs.toFixed(0);
        var minutes = diffMins.toFixed(0);;
        var seconds = diffsec.toFixed(0);
        const messages = {
            "info": ["The process successful"],
        };

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);



        return { response_code: 202, days, hours, minutes, seconds, messages };
    }

    @Post('api/getusercontents/details')
    @UseGuards(JwtAuthGuard)
    async contentuserdetail(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findpostid(postID);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/all')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkonten(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakonten(email, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/owned')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenowned(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenowned(email, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/monetize')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenmonetize(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenmonetize(email, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/management/konten/posttype')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenpostype(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var skip = 0;
        var limit = 0;
        var postType = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
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
        if (request_json["postType"] !== undefined) {
            postType = request_json["postType"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenpostype(email, postType, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/daterange')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenrange(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var skip = 0;
        var limit = 0;
        var startdate = null;
        var enddate = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
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
        if (request_json["startdate"] !== undefined) {
            startdate = request_json["startdate"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["enddate"] !== undefined) {
            enddate = request_json["enddate"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontendaterange(email, startdate, enddate, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/buy')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenbuy(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.userbasicsService.findOne(email);
        var iduser = ubasic._id;
        var userid = mongoose.Types.ObjectId(iduser);

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenbuy(userid, skip, limit);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/group')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenfilterss(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        var ownership = request_json["ownership"];
        var monetesisasi = request_json["monetesisasi"];
        var archived = request_json["archived"];
        var buy = request_json["buy"];
        var postType = request_json["postType"];
        var startdate = request_json["startdate"];
        var enddate = request_json["enddate"];
        var reported = request_json["reported"];


        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.userbasicsService.findOne(email);
        var iduser = ubasic._id;
        var userid = mongoose.Types.ObjectId(iduser);

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        var datatotal = await this.getusercontentsService.findcountfilter(email);
        var totalAll = datatotal[0].totalpost;
        let dataFilter = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, reported, postType, startdate, enddate, 0, totalAll);
        let data = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, reported, postType, startdate, enddate, skip, limit);
        var totalFilter = dataFilter.length;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, skip, limit, totalFilter, totalAll, messages };
    }

    @Post('api/getusercontents/management/analitic')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenanalitic(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
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

        let data = await this.getusercontentsService.findpopularanalitic(email);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/analitic/follower')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenfolowwing(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var email = null;
        var year = null;
        var datafollower = [];

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }



        if (request_json["year"] !== undefined) {
            year = request_json["year"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };
        var sumfollow = null;
        var lengfollower = null;
        var resultTime = null;
        var monthNew = [];
        var monthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        var currentdate = new Date(new Date().setMonth(new Date().getMonth() + 1));
        console.log(currentdate)

        var d;
        var month;
        var year;
        var arrdata = [];
        for (var i = 6; i > 0; i -= 1) {
            d = new Date(currentdate.getFullYear(), currentdate.getMonth() - i, 1);
            month = monthNames[d.getMonth()];
            year = d.getFullYear();
            // console.log(month);
            // console.log(year);
            monthNew.push(month)
        }

        resultTime = monthNew.length;

        try {
            arrdata = await this.getcontenteventsService.findfollower(email, year);
            lengfollower = arrdata.length;
        } catch (e) {
            arrdata = [];
            lengfollower = 0;
        }


        if (resultTime > 0) {
            for (var i = 0; i < resultTime; i++) {
                var months = monthNew[i];

                var count = 0;
                for (var j = 0; j < lengfollower; j++) {
                    if (arrdata[j].month == months) {
                        count = arrdata[j].count;
                        break;
                    }
                }
                datafollower.push({
                    'month': months,
                    'count': count
                });

            }
        }
        if (datafollower.length > 0) {

            for (let i = 0; i < datafollower.length; i++) {
                sumfollow += datafollower[i].count;

            }

        } else {
            sumfollow = 0;
        }

        var totalallfollower = sumfollow;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, datafollower, totalallfollower, messages };
    }

    @Post('api/getusercontents/buy/details')
    @UseGuards(JwtAuthGuard)
    async contentuserdetailbuy(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = null;
        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let databuy = await this.getusercontentsService.findcontenbuy(postID);

        var saleAmount = databuy[0].saleAmount;
        var totalamount = 0;
        var idmdradmin = "62bd413ff37a00001a004369";
        var idvacharege = "62bd40e0f37a00001a004366";
        var datamradmin = null;
        var datavacharge = null;
        var valuecharge = null;
        try {

            datavacharge = await this.settingsService.findOne(idvacharege);
            valuecharge = datavacharge._doc.value;

        } catch (e) {
            valuecharge = 0;
        }
        try {

            datamradmin = await this.settingsService.findOne(idmdradmin);
            var valuemradmin = datamradmin._doc.value;
            var nominalmradmin = saleAmount * valuemradmin / 100;

            totalamount = saleAmount + Math.ceil(nominalmradmin) + valuecharge;



        } catch (e) {
            totalamount = saleAmount + 0;
        }



        if (saleAmount > 0) {
            data = {

                "_id": databuy[0]._id,
                "mediaBasePath": databuy[0].mediaBasePath,
                "mediaUri": databuy[0].mediaUri,
                "mediaType": "image",
                "mediaEndpoint": databuy[0].mediaEndpoint,
                "createdAt": databuy[0].createdAt,
                "updatedAt": databuy[0].updatedAt,
                "postID": databuy[0].postID,
                "postType": databuy[0].postType,
                "description": databuy[0].description,
                "title": databuy[0].title,
                "active": databuy[0].active,
                "location": databuy[0].location,
                "tags": databuy[0].tags,
                "likes": databuy[0].likes,
                "shares": databuy[0].shares,
                "comments": databuy[0].comments,
                "isOwned": databuy[0].isOwned,
                "views": databuy[0].views,
                "privacy": databuy[0].privacy,
                "isViewed": databuy[0].isViewed,
                "allowComments": databuy[0].allowComments,
                "certified": databuy[0].certified,
                "saleLike": databuy[0].saleLike,
                "saleView": databuy[0].saleView,
                "adminFee": Math.ceil(nominalmradmin),
                "serviceFee": valuecharge,
                "prosentaseAdminFee": valuemradmin + " %",
                "price": databuy[0].saleAmount,
                "totalAmount": totalamount,
                "monetize": databuy[0].monetize

            };
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Content not for sell..!");
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/searchdata')
    @UseGuards(JwtAuthGuard)
    async contentsearch(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var listuser = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        listdiary = request_json["listdiary"];
        listuser = request_json["listuser"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;

        try {
            datasearch = await this.postsService.finddatasearchconten(keys, email, skip, limit, listpict, listvid, listdiary, listuser);
            user = datasearch[0].user;

        } catch (e) {
            datasearch = null;
            user = [];

        }

        try {
            user = datasearch[0].user;
            lenguser = user.length;

        } catch (e) {
            user = [];
            lenguser = 0;

        }

        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].vid;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    let datapicture = await this.getusercontentsService.getapsara(arrpict, i);
                    picts.push(datapicture[i])

                }

            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {
                for (let i = 0; i < lengvid; i++) {
                    let datavid = await this.getusercontentsService.getapsara(arrvid, i);
                    vid.push(datavid[i])

                }
            } else {
                vid = [];
            }

        } else {
            vid = [];
        }

        if (lengdiary > 0) {

            if (arrdiary[0]._id !== undefined) {
                for (let i = 0; i < lengdiary; i++) {
                    let datadiary = await this.getusercontentsService.getapsara(arrdiary, i);
                    diary.push(datadiary[i])

                }
            }
            else {
                diary = [];
            }
        } else {
            diary = [];
        }

        data = [{

            user, picts, vid, diary
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    // @Post('api/getusercontents/searchdatanew')
    // @UseGuards(JwtAuthGuard)
    // async contentsearchnew(@Req() request: Request): Promise<any> {


    //     var keys = null;
    //     var skip = 0;
    //     var limit = 0;

    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var dataLike = null;
    //     var listpict = null;
    //     var listvid = null;
    //     var listdiary = null;
    //     var listuser = null;
    //     var listtag = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];
    //     listpict = request_json["listpict"];
    //     listvid = request_json["listvid"];
    //     listdiary = request_json["listdiary"];
    //     listuser = request_json["listuser"];
    //     listtag = request_json["listtag"];

    //     const messages = {
    //         "info": ["The process successful"],
    //     };


    //     var user = [];
    //     var arrpict = [];
    //     var arrvid = [];
    //     var arrdiary = [];
    //     var picts = [];

    //     var vid = [];
    //     var diary = [];
    //     var tags = [];
    //     var lengpict = null;
    //     var lengdiary = null;
    //     var lengvid = null;
    //     var lenguser = null;
    //     var datatag = null;

    //     try {
    //         datasearch = await this.postsService.finddatasearchcontenNew(keys, email, skip, limit, listpict, listvid, listdiary, listuser, listtag);
    //         user = datasearch[0].user;
    //         tags = datasearch[0].tags;

    //     } catch (e) {
    //         datasearch = null;
    //         user = [];
    //         tags = [];
    //     }

    //     if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
    //         tags = [];
    //     }


    //     try {
    //         user = datasearch[0].user;
    //         lenguser = user.length;

    //     } catch (e) {
    //         user = [];
    //         lenguser = 0;

    //     }

    //     try {
    //         arrpict = datasearch[0].pict;
    //         lengpict = arrpict.length;

    //     } catch (e) {
    //         arrpict = [];
    //         lengpict = 0;

    //     }
    //     try {
    //         arrvid = datasearch[0].vid;
    //         lengvid = arrvid.length;

    //     } catch (e) {
    //         arrvid = [];
    //         lengvid = 0;

    //     }

    //     try {
    //         arrdiary = datasearch[0].diary;
    //         lengdiary = arrdiary.length;

    //     } catch (e) {
    //         arrdiary = [];
    //         lengdiary = 0;

    //     }

    //     if (lenguser > 0 && user[0].email !== undefined) {
    //         user = datasearch[0].user;
    //     } else {
    //         user = [];
    //     }

    //     if (lengpict > 0) {

    //         if (arrpict[0]._id !== undefined) {

    //             for (let i = 0; i < lengpict; i++) {
    //                 let datapicture = await this.getusercontentsService.getapsara(arrpict, i);
    //                 picts.push(datapicture[i])

    //             }

    //         } else {
    //             picts = [];
    //         }


    //     } else {
    //         picts = [];
    //     }

    //     if (lengvid > 0) {

    //         if (arrvid[0]._id !== undefined) {
    //             for (let i = 0; i < lengvid; i++) {
    //                 let datavid = await this.getusercontentsService.getapsara(arrvid, i);
    //                 vid.push(datavid[i])

    //             }
    //         } else {
    //             vid = [];
    //         }

    //     } else {
    //         vid = [];
    //     }

    //     if (lengdiary > 0) {

    //         if (arrdiary[0]._id !== undefined) {
    //             for (let i = 0; i < lengdiary; i++) {
    //                 let datadiary = await this.getusercontentsService.getapsara(arrdiary, i);
    //                 diary.push(datadiary[i])

    //             }
    //         }
    //         else {
    //             diary = [];
    //         }
    //     } else {
    //         diary = [];
    //     }

    //     data = [{

    //         user, picts, vid, diary, tags
    //     }];


    //     return { response_code: 202, data, messages };
    // }

    @Post('api/getusercontents/searchdatabyuser')
    @UseGuards(JwtAuthGuard)
    async contentfilterbyuser(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var datavids = null;
        var datadiary = null;
        var datapict = null;
        var keys = null;
        var datatag = null;
        var datauser = null;
        var postType = null;
        var skip = 0;
        var limit = 0;
        var totalFilterPostVid = null;
        var totalFilterVid = null;
        var totalFilterPostDiary = null;
        var totalFilterDiary = null;
        var totalFilterPostPic = null;
        var totalFilterPict = null;
        var totalFilterPostUser = null;
        var totalFilterUser = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["keys"] !== undefined) {
            keys = request_json["keys"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };




        try {
            datauser = await this.getuserprofilesService.findUserDetail(keys, skip, limit);

        } catch (e) {
            datauser = null;
        }

        try {
            datavids = await this.getusercontentsService.findcontentfilterbyuser(keys, "vid", skip, limit);
        } catch (e) {
            datavids = null;
        }

        try {
            datadiary = await this.getusercontentsService.findcontentfilterbyuser(keys, "diary", skip, limit);
        } catch (e) {
            datadiary = null;
        }

        try {
            datavids = await this.getusercontentsService.findcontentfilterbyuser(keys, "vid", skip, limit);
        } catch (e) {
            datapict = null;
        }


        try {
            totalFilterPostVid = await this.getusercontentsService.findcontentfilterbyuserCount(keys, "vid");
            totalFilterVid = totalFilterPostVid.length;
        } catch (e) {
            totalFilterVid = 0;
        }

        try {
            totalFilterPostDiary = await this.getusercontentsService.findcontentfilterbyuserCount(keys, "diary");
            totalFilterDiary = totalFilterPostDiary.length;
        } catch (e) {
            totalFilterDiary = 0;
        }

        try {
            totalFilterPostPic = await this.getusercontentsService.findcontentfilterbyuserCount(keys, "pict");
            totalFilterPict = totalFilterPostPic.length;
        } catch (e) {
            totalFilterPict = 0;
        }

        try {
            totalFilterPostUser = await this.getuserprofilesService.findUserDetailCount(keys);
            totalFilterUser = totalFilterPostUser.length;
        } catch (e) {
            totalFilterUser = 0;
        }


        let data = {
            "users": { "data": datauser, "totalFilter": totalFilterUser, "skip": skip, "limit": limit },
            "vid": { "data": datavids, "totalFilter": totalFilterVid, "skip": skip, "limit": limit },
            "diary": { "data": datadiary, "totalFilter": totalFilterDiary, "skip": skip, "limit": limit },
            "pict": { "data": datapict, "totalFilter": totalFilterPict, "skip": skip, "limit": limit },
        };

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    // @UseGuards(JwtAuthGuard)
    // @Post('api/getusercontents/database')
    // async finddata(@Req() request: Request): Promise<any> {
    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     var page = null;
    //     var startdate = null;
    //     var enddate = null;
    //     var limit = null;
    //     var totalpage = 0;
    //     var totalallrow = 0;
    //     var totalsearch = 0;
    //     var total = 0;
    //     var username = null;
    //     var kepemilikan = [];
    //     var statusjual = [];
    //     var data = [];
    //     var description = null;
    //     var postType = [];
    //     var kategori = [];
    //     var startmount = null;
    //     var endmount = null;
    //     var descending = null;
    //     var iduser = null;
    //     var buy = null;
    //     var reported = null;
    //     var popular = null;
    //     const mongoose = require('mongoose');
    //     var ObjectId = require('mongodb').ObjectId;
    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }
    //     if (request_json["page"] !== undefined) {
    //         page = request_json["page"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     startdate = request_json["startdate"];
    //     enddate = request_json["enddate"];
    //     username = request_json["username"];
    //     description = request_json["description"];
    //     kepemilikan = request_json["kepemilikan"];
    //     statusjual = request_json["statusjual"];
    //     postType = request_json["postType"];
    //     kategori = request_json["kategori"];
    //     startmount = request_json["startmount"];
    //     endmount = request_json["endmount"];
    //     descending = request_json["descending"];
    //     iduser = request_json["iduser"];
    //     buy = request_json["buy"];
    //     reported = request_json["reported"];
    //     popular = request_json["popular"];
    //     var userid = mongoose.Types.ObjectId(iduser);
    //     var query = null;
    //     var datasearch = null;
    //     var dataall = null;

    //     if (iduser !== undefined) {
    //         try {
    //             query = await this.getusercontentsService.databasenew(buy, reported, userid, username, description, kepemilikan, statusjual, postType, kategori, startdate, enddate, startmount, endmount, descending, page, limit, popular);
    //             data = query;
    //         } catch (e) {
    //             query = null;
    //             data = [];
    //         }
    //     } else {
    //         try {
    //             query = await this.getusercontentsService.databasenew(buy, reported, undefined, username, description, kepemilikan, statusjual, postType, kategori, startdate, enddate, startmount, endmount, descending, page, limit, popular);
    //             data = query;
    //         } catch (e) {
    //             query = null;
    //             data = [];
    //         }
    //     }



    //     // try {
    //     //     total = query.length;
    //     // } catch (e) {
    //     //     total = 0;
    //     // }

    //     // if (total < 10) {
    //     //     totalsearch = total;
    //     // } else {

    //     //     if (iduser !== undefined) {
    //     //         try {
    //     //             datasearch = await this.getusercontentsService.databasenewcount(buy, reported, userid, username, description, kepemilikan, statusjual, postType, kategori, startdate, enddate, startmount, endmount, descending);
    //     //             totalsearch = datasearch[0].totalpost;
    //     //         } catch (e) {
    //     //             totalsearch = 0;
    //     //         }
    //     //     } else {
    //     //         try {
    //     //             datasearch = await this.getusercontentsService.databasenewcount(undefined, reported, undefined, username, description, kepemilikan, statusjual, postType, kategori, startdate, enddate, startmount, endmount, descending);
    //     //             totalsearch = datasearch[0].totalpost;
    //     //         } catch (e) {
    //     //             totalsearch = 0;
    //     //         }
    //     //     }
    //     // }

    //     // try {

    //     //     dataall = await this.getusercontentsService.findcountall();
    //     //     totalallrow = dataall[0].totalpost;

    //     // } catch (e) {
    //     //     totalallrow = 0;
    //     // }

    //     // var tpage = null;
    //     // var tpage2 = null;

    //     // tpage2 = (totalsearch / limit).toFixed(0);
    //     // tpage = (totalsearch % limit);
    //     // if (tpage > 0 && tpage < 5) {
    //     //     totalpage = parseInt(tpage2) + 1;

    //     // } else {
    //     //     totalpage = parseInt(tpage2);
    //     // }

    //     return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    // }

    @Post('api/getusercontents/database/details')
    @UseGuards(JwtAuthGuard)
    async detailcontent(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;
        var page = null;
        var limit = null;
        var datadetail = null;
        var lengdetail = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        page = request_json["page"];
        limit = request_json["limit"];

        const messages = {
            "info": ["The process successful"],
        };

        try {
            // datadetail = await this.getusercontentsService.detailcontent(postID, page, limit);
            datadetail = await this.getusercontentsService.detailcontent2(postID, page, limit);
            lengdetail = datadetail.length;
        } catch (e) {
            datadetail = null;
            lengdetail = 0;
        }
        if (lengdetail > 0) {

            var dataquery = null;
            dataquery = datadetail;
            var data = [];
            let pict: String[] = [];
            var dataage = null;
            var lengage = null;
            var sumage = null;
            var objcoun = {};
            var dataSum = [];

            var datagender = null;
            var lenggender = null;
            var sumgender = null;
            var objcoungender = {};
            var dataSumgender = [];

            var datawilayah = null;
            var lengwilayah = null;
            var sumwilayah = null;
            var objcounwilayah = {};
            var dataSumwilayah = [];
            var createdate = datadetail[0].createdAt;

            var subtahun = createdate.substring(0, 4);
            var subbulan = createdate.substring(7, 5);
            var subtanggal = createdate.substring(10, 8);
            var datatimestr = subtahun + "-" + subbulan + "-" + subtanggal;

            var today = new Date();
            var date1 = new Date(datatimestr);

            var diffDays = Math.floor(today.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
            var diffsec = Math.round(today.getTime() - date1.getTime()) / (1000) % 60;
            var diffMins = Math.round(today.getTime() - date1.getTime()) / (1000 * 60) % 60;
            var diffHrs = Math.floor(today.getTime() - date1.getTime()) / (1000 * 60 * 60) % 24;
            var days = diffDays.toFixed(0);
            var hours = diffHrs.toFixed(0);
            var minutes = diffMins.toFixed(0);;
            var seconds = diffsec.toFixed(0);
            try {
                dataage = datadetail[0].age;
                lengage = dataage.length;
            } catch (e) {
                lengage = 0;
            }
            if (lengage > 0) {

                for (let i = 0; i < lengage; i++) {
                    sumage += dataage[i].count;

                }

            } else {
                sumage = 0;
            }

            if (lengage > 0) {

                for (let i = 0; i < lengage; i++) {
                    let count = dataage[i].count;
                    let id = dataage[i]._id;

                    let persen = count * 100 / sumage;
                    objcoun = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSum.push(objcoun);
                }

            } else {
                dataSum = [];
            }

            try {
                datagender = datadetail[0].gender;
                lenggender = datagender.length;
            } catch (e) {
                lenggender = 0;
            }
            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    sumgender += datagender[i].count;

                }

            } else {
                sumgender = 0;
            }

            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    let count = datagender[i].count;
                    let id = datagender[i]._id;


                    let persen = count * 100 / sumgender;
                    objcoungender = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumgender.push(objcoungender);
                }

            } else {
                dataSumgender = [];
            }

            try {
                datawilayah = datadetail[0].wilayah;
                lengwilayah = datawilayah.length;
            } catch (e) {
                lengwilayah = 0;
            }
            if (lengwilayah > 0) {

                for (let i = 0; i < lengwilayah; i++) {
                    sumwilayah += datawilayah[i].count;

                }

            } else {
                sumwilayah = 0;
            }

            if (lengwilayah > 0) {

                for (let i = 0; i < lengwilayah; i++) {
                    let count = datawilayah[i].count;
                    let id = datawilayah[i]._id;

                    let persen = count * 100 / sumwilayah;
                    objcounwilayah = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumwilayah.push(objcounwilayah);
                }

            } else {
                dataSumwilayah = [];
            }

            let datadet = await this.getusercontentsService.getapsaraDatabaseDetail(dataquery, days, hours, minutes, seconds, dataSum, dataSumgender, dataSumwilayah);
            data.push(datadet[0]);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, data, messages };
        }

        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Data is not found..!");
        }

    }

    @UseGuards(JwtAuthGuard)
    @Post('api/getusercontents/boostconsole')
    async finddataboost(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        //var request_json = JSON.parse(JSON.stringify(request.body));

        var query = null;
        var data = null;

        try {
            query = await this.getusercontentsService.boostlistconsole();
            data = query;
        } catch (e) {
            query = null;
            data = [];
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/getusercontents/boostconsole/list')
    async finddataboostbawah(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var statuspengajuan = [];
        var limit = null;
        var totalpage = 0;
        var totalallrow = 0;
        var totalsearch = 0;
        var total = 0;
        var descending = null;
        var email = null;
        var type = null;
        var sessionid = [];
        var query = null;
        var data = null;
        var datasearch = null;
        var dataall = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        email = request_json["email"];
        type = request_json["type"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        sessionid = request_json["sessionid"];
        descending = request_json["descending"];
        statuspengajuan = request_json["statuspengajuan"];
        try {
            query = await this.getusercontentsService.boostconsolebawah(email, startdate, enddate, type, sessionid, statuspengajuan, descending, page, limit);
            data = query;
        } catch (e) {
            query = null;
            data = [];
        }
        try {
            total = query.length;
        } catch (e) {
            total = 0;
        }

        // try {
        //     datasearch = await this.getusercontentsService.boostconsolebawahcount(email, startdate, enddate, type, sessionid, statuspengajuan);
        //     totalsearch = datasearch[0].totalpost;
        // } catch (e) {
        //     totalsearch = 0;
        // }

        // try {
        //     dataall = await this.getusercontentsService.boostconsolebawahcount(undefined, undefined, undefined, undefined, undefined, undefined);
        //     totalallrow = dataall[0].totalpost;

        // } catch (e) {
        //     totalallrow = 0;
        // }


        // var tpage = null;
        // var tpage2 = null;

        // tpage2 = (totalsearch / limit).toFixed(0);
        // tpage = (totalsearch % limit);
        // if (tpage > 0 && tpage < 5) {
        //     totalpage = parseInt(tpage2) + 1;

        // } else {
        //     totalpage = parseInt(tpage2);
        // }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, page, limit, total, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };

    }

    @Post('api/getusercontents/boostconsole/list/details')
    @UseGuards(JwtAuthGuard)
    async detailcontentboost(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;
        var page = null;
        var limit = null;
        var datadetail = null;
        var lengdetail = null;
        var startdate = null;
        var enddate = null;
        var lengviews = 0;
        var datasummary = [];
        var datacountlike = null;
        var datacountcomment = null;
        var startboost = null;
        var endboost = null;
        var dtstart = null;
        var dtend = null;
        var datakomentar = [];
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        page = request_json["page"];
        limit = request_json["limit"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        const messages = {
            "info": ["The process successful"],
        };

        try {
            datadetail = await this.getusercontentsService.boostdetail(postID, startdate, enddate, page, limit);
            lengdetail = datadetail.length;
            lengviews = datadetail[0].summary.length;
            startboost = datadetail[0].data[0].start;
            endboost = datadetail[0].data[0].end;

        } catch (e) {
            datadetail = null;
            lengdetail = 0;
            lengviews = 0;
        }
        if (lengdetail > 0) {

            var dataquery = null;
            dataquery = datadetail;
            var data = [];
            let pict: String[] = [];
            var dataage = null;
            var lengage = null;
            var sumage = null;
            var objcoun = {};
            var dataSum = [];

            var datagender = null;
            var lenggender = null;
            var sumgender = null;
            var objcoungender = {};
            var dataSumgender = [];

            var datawilayah = null;
            var lengwilayah = null;
            var sumwilayah = null;
            var objcounwilayah = {};
            var dataSumwilayah = [];
            var arrdataview = [];
            var like = 0;
            var comment = 0;
            datasummary = datadetail[0].summary;


            dtstart = startboost.substring(0, 10);
            dtend = endboost.substring(0, 10);
            var date1 = new Date(startdate);
            var date2 = new Date(enddate);

            //calculate time difference  
            var time_difference = date2.getTime() - date1.getTime();

            //calculate days difference by dividing total milliseconds in a day  
            var resultTime = time_difference / (1000 * 60 * 60 * 24);
            console.log(resultTime);

            try {
                datakomentar = await this.disquslogsService.komentar(postID, dtstart, dtend);
            } catch (e) {
                datakomentar = [];
            }
            try {
                datacountlike = await this.contenteventsService.countLikeBoost(postID, dtstart, dtend);
            } catch (e) {
                datacountlike = null;
            }

            if (datacountlike.length === 0) {
                like = 0;
            } else {
                like = datacountlike[0].count;
            }

            try {
                comment = datakomentar.length;
            } catch (e) {
                comment = 0;
            }


            if (resultTime > 0) {
                for (var i = 0; i < resultTime + 1; i++) {
                    var dt = new Date(startdate);
                    dt.setDate(dt.getDate() + i);
                    var splitdt = dt.toISOString();
                    var dts = splitdt.split('T');
                    var stdt = dts[0].toString();
                    var count = 0;
                    for (var j = 0; j < lengviews; j++) {
                        if (datasummary[j].date == stdt) {
                            count = datasummary[j].jangkauan;
                            break;
                        }
                    }
                    arrdataview.push({
                        'date': stdt,
                        'count': count
                    });

                }

            }

            try {
                dataage = datadetail[0].age;
                if (dataage[0]._id == "other" && dataage[0].count == 1) {
                    lengage = 0;
                } else {
                    lengage = dataage.length;
                }

            } catch (e) {
                lengage = 0;
            }
            if (lengage > 0) {

                for (let i = 0; i < lengage; i++) {
                    sumage += dataage[i].count;

                }

            } else {
                sumage = 0;
            }

            if (lengage > 0) {

                for (let i = 0; i < lengage; i++) {
                    let count = dataage[i].count;
                    let id = dataage[i]._id;

                    let persen = count * 100 / sumage;
                    objcoun = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSum.push(objcoun);
                }

            } else {
                dataSum = [];
            }

            try {
                datagender = datadetail[0].gender;
                if (datagender[0]._id == "OTHER" && datagender[0].count == 1) {
                    lenggender = 0;
                } else {
                    lenggender = datagender.length;
                }
            } catch (e) {
                lenggender = 0;
            }
            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    sumgender += datagender[i].count;

                }

            } else {
                sumgender = 0;
            }

            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    let count = datagender[i].count;
                    let id = datagender[i]._id;
                    let idgender = null;
                    if (id == null) {
                        idgender = "OTHER";
                    } else {
                        idgender = id;
                    }


                    let persen = count * 100 / sumgender;
                    objcoungender = {
                        _id: idgender,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumgender.push(objcoungender);
                }

            } else {
                dataSumgender = [];
            }

            try {
                datawilayah = datadetail[0].wilayah;
                lengwilayah = datawilayah.length;
            } catch (e) {
                lengwilayah = 0;
            }
            if (lengwilayah > 0) {

                for (let i = 0; i < lengwilayah; i++) {
                    sumwilayah += datawilayah[i].count;

                }

            } else {
                sumwilayah = 0;
            }

            if (lengwilayah > 0) {

                for (let i = 0; i < lengwilayah; i++) {
                    let count = datawilayah[i].count;
                    let id = datawilayah[i]._id;

                    let persen = count * 100 / sumwilayah;
                    objcounwilayah = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumwilayah.push(objcounwilayah);
                }

            } else {
                dataSumwilayah = [];
            }

            let datadet = await this.getusercontentsService.getapsaraContenBoostDetail(dataquery, dataSum, dataSumgender, dataSumwilayah, arrdataview, sumage, like, comment, datakomentar);
            data.push(datadet[0]);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, data, messages };
        }

        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, data: [], messages };
        }

    }

    // @Post('api/getusercontents/searchdatanew/detailtag')
    // @UseGuards(JwtAuthGuard)
    // async detailtagsearchnew(@Req() request: Request): Promise<any> {


    //     var keys = null;
    //     var skip = 0;
    //     var limit = 0;

    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var dataLike = null;
    //     var listpict = null;
    //     var listvid = null;
    //     var listdiary = null;
    //     // var listuser = null;
    //     // var listtag = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];
    //     listpict = request_json["listpict"];
    //     listvid = request_json["listvid"];
    //     listdiary = request_json["listdiary"];


    //     const messages = {
    //         "info": ["The process successful"],
    //     };


    //     var user = [];
    //     var arrpict = [];
    //     var arrvid = [];
    //     var arrdiary = [];
    //     var picts = [];

    //     var vid = [];
    //     var diary = [];
    //     var tags = [];
    //     var lengpict = null;
    //     var lengdiary = null;
    //     var lengvid = null;
    //     var lenguser = null;
    //     var datatag = null;

    //     try {
    //         datasearch = await this.tagCountService.detailsearchcontenNew(keys, email, skip, limit, listpict, listvid, listdiary);
    //         tags = datasearch[0].tag;

    //     } catch (e) {
    //         datasearch = null;
    //         tags = [];
    //     }

    //     if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
    //         tags = [];
    //     }


    //     try {
    //         arrpict = datasearch[0].pict;
    //         lengpict = arrpict.length;

    //     } catch (e) {
    //         arrpict = [];
    //         lengpict = 0;

    //     }
    //     try {
    //         arrvid = datasearch[0].vid;
    //         lengvid = arrvid.length;

    //     } catch (e) {
    //         arrvid = [];
    //         lengvid = 0;

    //     }

    //     try {
    //         arrdiary = datasearch[0].diary;
    //         lengdiary = arrdiary.length;

    //     } catch (e) {
    //         arrdiary = [];
    //         lengdiary = 0;

    //     }

    //     if (lenguser > 0 && user[0].email !== undefined) {
    //         user = datasearch[0].user;
    //     } else {
    //         user = [];
    //     }

    //     if (lengpict > 0) {

    //         if (arrpict[0]._id !== undefined) {

    //             for (let i = 0; i < lengpict; i++) {
    //                 let datapicture = await this.getusercontentsService.getapsara(arrpict, i);
    //                 picts.push(datapicture[i])

    //             }

    //         } else {
    //             picts = [];
    //         }


    //     } else {
    //         picts = [];
    //     }

    //     if (lengvid > 0) {

    //         if (arrvid[0]._id !== undefined) {
    //             for (let i = 0; i < lengvid; i++) {
    //                 let datavid = await this.getusercontentsService.getapsara(arrvid, i);
    //                 vid.push(datavid[i])

    //             }
    //         } else {
    //             vid = [];
    //         }

    //     } else {
    //         vid = [];
    //     }

    //     if (lengdiary > 0) {

    //         if (arrdiary[0]._id !== undefined) {
    //             for (let i = 0; i < lengdiary; i++) {
    //                 let datadiary = await this.getusercontentsService.getapsara(arrdiary, i);
    //                 diary.push(datadiary[i])

    //             }
    //         }
    //         else {
    //             diary = [];
    //         }
    //     } else {
    //         diary = [];
    //     }

    //     data = [{

    //         picts, vid, diary, tags
    //     }];


    //     return { response_code: 202, data, messages };
    // }


    // @Post('api/getusercontents/searchdatanew/detailinterest')
    // @UseGuards(JwtAuthGuard)
    // async detailinterestsearchnew(@Req() request: Request): Promise<any> {


    //     var keys = null;
    //     var skip = 0;
    //     var limit = 0;

    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var dataLike = null;
    //     var listpict = null;
    //     var listvid = null;
    //     var listdiary = null;
    //     // var listuser = null;
    //     // var listtag = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];
    //     listpict = request_json["listpict"];
    //     listvid = request_json["listvid"];
    //     listdiary = request_json["listdiary"];


    //     const messages = {
    //         "info": ["The process successful"],
    //     };


    //     var user = [];
    //     var arrpict = [];
    //     var arrvid = [];
    //     var arrdiary = [];
    //     var picts = [];

    //     var vid = [];
    //     var diary = [];
    //     var interests = [];
    //     var lengpict = null;
    //     var lengdiary = null;
    //     var lengvid = null;
    //     var lenguser = null;
    //     var datatag = null;

    //     try {
    //         datasearch = await this.interestCountService.detailinterestcontenNew(keys, email, skip, limit, listpict, listvid, listdiary);
    //         interests = datasearch[0].interest;

    //     } catch (e) {
    //         datasearch = null;
    //         interests = [];
    //     }

    //     if (interests == undefined || interests.length == 0 || interests[0].interestNameId == undefined) {
    //         interests = [];
    //     }


    //     try {
    //         arrpict = datasearch[0].pict;
    //         lengpict = arrpict.length;

    //     } catch (e) {
    //         arrpict = [];
    //         lengpict = 0;

    //     }
    //     try {
    //         arrvid = datasearch[0].vid;
    //         lengvid = arrvid.length;

    //     } catch (e) {
    //         arrvid = [];
    //         lengvid = 0;

    //     }

    //     try {
    //         arrdiary = datasearch[0].diary;
    //         lengdiary = arrdiary.length;

    //     } catch (e) {
    //         arrdiary = [];
    //         lengdiary = 0;

    //     }

    //     if (lenguser > 0 && user[0].email !== undefined) {
    //         user = datasearch[0].user;
    //     } else {
    //         user = [];
    //     }

    //     if (lengpict > 0) {

    //         if (arrpict[0]._id !== undefined) {

    //             for (let i = 0; i < lengpict; i++) {
    //                 let datapicture = await this.getusercontentsService.getapsara(arrpict, i);
    //                 picts.push(datapicture[i])

    //             }

    //         } else {
    //             picts = [];
    //         }


    //     } else {
    //         picts = [];
    //     }

    //     if (lengvid > 0) {

    //         if (arrvid[0]._id !== undefined) {
    //             for (let i = 0; i < lengvid; i++) {
    //                 let datavid = await this.getusercontentsService.getapsara(arrvid, i);
    //                 vid.push(datavid[i])

    //             }
    //         } else {
    //             vid = [];
    //         }

    //     } else {
    //         vid = [];
    //     }

    //     if (lengdiary > 0) {

    //         if (arrdiary[0]._id !== undefined) {
    //             for (let i = 0; i < lengdiary; i++) {
    //                 let datadiary = await this.getusercontentsService.getapsara(arrdiary, i);
    //                 diary.push(datadiary[i])

    //             }
    //         }
    //         else {
    //             diary = [];
    //         }
    //     } else {
    //         diary = [];
    //     }

    //     data = [{

    //         picts, vid, diary, interests
    //     }];


    //     return { response_code: 202, data, messages };
    // }

    @UseGuards(JwtAuthGuard)
    @Post('api/getusercontents/database')
    async finddata2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var totalpage = 0;
        var totalallrow = 0;
        var totalsearch = 0;
        var total = 0;
        var username = null;
        var kepemilikan = [];
        var statusjual = [];
        var data = [];
        var description = null;
        var postType = [];
        var kategori = [];
        var startmount = null;
        var endmount = null;
        var descending = null;
        var iduser = null;
        var buy = null;
        var reported = null;
        var popular = null;
        var hashtag = null;
        var userid = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        username = request_json["username"];
        description = request_json["description"];
        kepemilikan = request_json["kepemilikan"];
        statusjual = request_json["statusjual"];
        postType = request_json["postType"];
        kategori = request_json["kategori"];
        startmount = request_json["startmount"];
        endmount = request_json["endmount"];
        descending = request_json["descending"];
        buy = request_json["buy"];
        reported = request_json["reported"];
        popular = request_json["popular"];
        hashtag = request_json["hashtag"];
        if (request_json["limit"] !== undefined) {
            iduser = request_json["iduser"];
            userid = mongoose.Types.ObjectId(iduser);
        }
        var query = null;
        var datasearch = null;
        var dataall = null;

        if (iduser !== undefined) {
            try {
                query = await this.getusercontentsService.databasenew2(buy, reported, userid, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
                data = query;
            } catch (e) {
                query = null;
                data = [];
            }
        } else {
            try {
                query = await this.getusercontentsService.databasenew2(buy, reported, undefined, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
                data = query;
            } catch (e) {
                query = null;
                data = [];
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);


        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }

    //existing
    // @Post('api/getusercontents/searchdatanew')
    // @UseGuards(JwtAuthGuard)
    // async contentsearchnew2(@Req() request: Request): Promise<any> {


    //     var keys = null;
    //     var skip = 0;
    //     var limit = 0;

    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var dataLike = null;
    //     var listpict = null;
    //     var listvid = null;
    //     var listdiary = null;
    //     var listuser = null;
    //     var listtag = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];
    //     listpict = request_json["listpict"];
    //     listvid = request_json["listvid"];
    //     listdiary = request_json["listdiary"];
    //     listuser = request_json["listuser"];
    //     listtag = request_json["listtag"];

    //     const messages = {
    //         "info": ["The process successful"],
    //     };


    //     var user = [];
    //     var arrpict = [];
    //     var arrvid = [];
    //     var arrdiary = [];
    //     var picts = [];

    //     var vid = [];
    //     var diary = [];
    //     var tags = [];
    //     var lengpict = null;
    //     var lengdiary = null;
    //     var lengvid = null;
    //     var lenguser = null;
    //     var datatag = null;
    //     var apsaraId = null;
    //     var apsaraThumbId = null;
    //     var uploadSource = null;
    //     try {
    //         datasearch = await this.postsService.finddatasearchcontenNew(keys.toLowerCase(), email, skip, limit, listpict, listvid, listdiary, listuser, listtag);
    //         user = datasearch[0].user;
    //         tags = datasearch[0].tags;

    //     } catch (e) {
    //         datasearch = null;
    //         user = [];
    //         tags = [];
    //     }

    //     if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
    //         tags = [];
    //     }


    //     try {
    //         user = datasearch[0].user;
    //         lenguser = user.length;

    //     } catch (e) {
    //         user = [];
    //         lenguser = 0;

    //     }

    //     try {
    //         arrpict = datasearch[0].pict;
    //         lengpict = arrpict.length;

    //     } catch (e) {
    //         arrpict = [];
    //         lengpict = 0;

    //     }
    //     try {
    //         arrvid = datasearch[0].vid;
    //         lengvid = arrvid.length;

    //     } catch (e) {
    //         arrvid = [];
    //         lengvid = 0;

    //     }

    //     try {
    //         arrdiary = datasearch[0].diary;
    //         lengdiary = arrdiary.length;

    //     } catch (e) {
    //         arrdiary = [];
    //         lengdiary = 0;

    //     }

    //     if (lenguser > 0 && user[0].email !== undefined) {
    //         user = datasearch[0].user;
    //     } else {
    //         user = [];
    //     }

    //     var tempdatapict = [];
    //     // console.log(lengpict);
    //     if (lengpict > 0) {

    //         if (arrpict[0]._id !== undefined) {

    //             for (let i = 0; i < lengpict; i++) {
    //                 uploadSource = arrpict[i].uploadSource;
    //                 try {
    //                     apsaraId = arrpict[i].apsaraId;
    //                 } catch (e) {
    //                     apsaraId = "";
    //                 }
    //                 try {
    //                     apsaraThumbId = arrpict[i].apsaraThumbId;
    //                 } catch (e) {
    //                     apsaraThumbId = "";
    //                 }

    //                 if (apsaraId !== undefined && apsaraThumbId !== undefined) {
    //                     tempdatapict.push(arrpict[i].apsaraThumbId);

    //                 }
    //                 else if (apsaraId !== undefined && apsaraThumbId === undefined) {
    //                     tempdatapict.push(arrpict[i].apsaraId);

    //                 }
    //                 else if (apsaraId === undefined && apsaraThumbId !== undefined) {
    //                     tempdatapict.push(arrpict[i].apsaraThumbId);

    //                 }
    //             }

    //             // console.log(tempdatapict);
    //             var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //             var gettempresultpictapsara = resultpictapsara.ImageInfo;
    //             for (var i = 0; i < lengpict; i++) {
    //                 //var checkpictketemu = false;

    //                 uploadSource = arrpict[i].uploadSource;


    //                 if (uploadSource == "OSS") {
    //                     //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

    //                 } else {


    //                     if (gettempresultpictapsara.length > 0) {
    //                         for (var j = 0; j < gettempresultpictapsara.length; j++) {

    //                             if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {
    //                                 // checkpictketemu = true;
    //                                 arrpict[i].media =
    //                                 {
    //                                     "ImageInfo": [gettempresultpictapsara[j]]
    //                                 }

    //                                 arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                             }
    //                             else if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraId) {

    //                                 arrpict[i].media =
    //                                 {
    //                                     "ImageInfo": [gettempresultpictapsara[j]]
    //                                 }

    //                                 arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;

    //                             }
    //                         }
    //                     }
    //                 }



    //                 picts.push(arrpict[i]);
    //             }
    //         } else {
    //             picts = [];
    //         }


    //     } else {
    //         picts = [];
    //     }

    //     var tempdatavid = [];
    //     // console.log(lengvid);
    //     if (lengvid > 0) {

    //         if (arrvid[0]._id !== undefined) {

    //             for (let i = 0; i < lengvid; i++) {
    //                 if (arrvid[i].isApsara == true) {
    //                     tempdatavid.push(arrvid[i].apsaraId);
    //                 }
    //             }

    //             // console.log(tempdatavid);
    //             var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
    //             var gettempresultvidapsara = resultvidapsara.VideoList;
    //             for (var i = 0; i < lengvid; i++) {
    //                 var checkvidketemu = false;
    //                 for (var j = 0; j < gettempresultvidapsara.length; j++) {
    //                     if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
    //                         checkvidketemu = true;
    //                         arrvid[i].media =
    //                         {
    //                             "VideoList": [gettempresultvidapsara[j]]
    //                         }
    //                         arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkvidketemu == false) {
    //                     arrvid[i].apsaraId = "";
    //                     arrvid[i].isApsara = false;
    //                     arrvid[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 vid.push(arrvid[i]);
    //             }
    //         } else {
    //             vid = [];
    //         }


    //     } else {
    //         vid = [];
    //     }

    //     var tempdatadiary = [];
    //     // console.log(lengdiary);
    //     if (lengdiary > 0) {

    //         if (arrdiary[0]._id !== undefined) {

    //             for (let i = 0; i < lengdiary; i++) {
    //                 if (arrdiary[i].isApsara == true) {
    //                     tempdatadiary.push(arrdiary[i].apsaraId);
    //                 }
    //             }

    //             // console.log(tempdatavid);
    //             var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
    //             var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
    //             for (var i = 0; i < lengdiary; i++) {
    //                 var checkdiaryketemu = false;
    //                 for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
    //                     if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
    //                         checkdiaryketemu = true;
    //                         arrdiary[i].media =
    //                         {
    //                             "VideoList": [gettempresultdiaryapsara[j]]
    //                         }
    //                         arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkdiaryketemu == false) {
    //                     arrdiary[i].apsaraId = "";
    //                     arrdiary[i].isApsara = false;
    //                     arrdiary[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 diary.push(arrdiary[i]);
    //             }
    //         } else {
    //             diary = [];
    //         }


    //     } else {
    //         diary = [];
    //     }

    //     data = [{

    //         user, picts, vid, diary, tags
    //     }];


    //     return { response_code: 202, data, messages };
    // }

    // @Post('api/getusercontents/searchdatanew')
    // @UseGuards(JwtAuthGuard)
    // async contentsearchnew2(@Req() request: Request, @Headers() headers): Promise<any> {
    //     var timestamps_start = await this.utilsService.getDateTimeString();
    //     var fullurl = request.get("Host") + request.originalUrl;
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;

    //     var keys = null;
    //     var skip = 0;
    //     var limit = 0;

    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var dataLike = null;
    //     var listpict = null;
    //     var listvid = null;
    //     var listdiary = null;
    //     var listuser = null;
    //     var listtag = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];
    //     listpict = request_json["listpict"];
    //     listvid = request_json["listvid"];
    //     listdiary = request_json["listdiary"];
    //     listuser = request_json["listuser"];
    //     listtag = request_json["listtag"];

    //     const messages = {
    //         "info": ["The process successful"],
    //     };


    //     var user = [];
    //     var arrpict = [];
    //     var arrvid = [];
    //     var arrdiary = [];
    //     var picts = [];

    //     var vid = [];
    //     var diary = [];
    //     var tags = [];
    //     var lengpict = null;
    //     var lengdiary = null;
    //     var lengvid = null;
    //     var lenguser = null;
    //     var datatag = null;
    //     var apsaraId = null;
    //     var apsaraThumbId = null;
    //     var uploadSource = null;
    //     try {
    //         datasearch = await this.postsService.finddatasearchcontenNewv2(keys.toLowerCase(), email, skip, limit, listpict, listvid, listdiary, listuser, listtag);
    //         user = datasearch[0].user;
    //         tags = datasearch[0].tags;

    //     } catch (e) {
    //         datasearch = null;
    //         user = [];
    //         tags = [];
    //     }

    //     if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
    //         tags = [];
    //     }


    //     try {
    //         user = datasearch[0].user;
    //         lenguser = user.length;

    //     } catch (e) {
    //         user = [];
    //         lenguser = 0;

    //     }

    //     try {
    //         arrpict = datasearch[0].pict;
    //         lengpict = arrpict.length;

    //     } catch (e) {
    //         arrpict = [];
    //         lengpict = 0;

    //     }
    //     try {
    //         arrvid = datasearch[0].vid;
    //         lengvid = arrvid.length;

    //     } catch (e) {
    //         arrvid = [];
    //         lengvid = 0;

    //     }

    //     try {
    //         arrdiary = datasearch[0].diary;
    //         lengdiary = arrdiary.length;

    //     } catch (e) {
    //         arrdiary = [];
    //         lengdiary = 0;

    //     }

    //     if (lenguser > 0 && user[0].email !== undefined) {
    //         user = datasearch[0].user;
    //     } else {
    //         user = [];
    //     }

    //     var tempdatapict = [];
    //     var temporipict = [];
    //     // console.log(lengpict);
    //     if (lengpict > 0) {

    //         if (arrpict[0]._id !== undefined) {

    //             for (let i = 0; i < lengpict; i++) {
    //                 uploadSource = arrpict[i].uploadSource;
    //                 try {
    //                     apsaraId = arrpict[i].apsaraId;
    //                 } catch (e) {
    //                     apsaraId = "";
    //                 }
    //                 try {
    //                     apsaraThumbId = arrpict[i].apsaraThumbId;
    //                 } catch (e) {
    //                     apsaraThumbId = "";
    //                 }

    //                 if (apsaraThumbId !== undefined) {
    //                     tempdatapict.push(arrpict[i].apsaraThumbId);

    //                 }
    //                 if (apsaraId !== undefined) {
    //                     temporipict.push(arrpict[i].apsaraId);

    //                 }

    //             }

    //             // console.log(tempdatapict);


    //             var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //             var gettempresultpictapsara = resultpictapsara.ImageInfo;
    //             var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
    //             var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
    //             for (var i = 0; i < lengpict; i++) {
    //                 //var checkpictketemu = false;

    //                 uploadSource = arrpict[i].uploadSource;


    //                 if (uploadSource == "OSS") {
    //                     //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

    //                 } else {


    //                     if (gettempresultpictapsara.length > 0) {
    //                         for (let j = 0; j < gettempresultpictapsara.length; j++) {

    //                             if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


    //                                 arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                             }

    //                         }
    //                     }

    //                     if (gettempresultpictapsaraori.length > 0) {
    //                         for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


    //                             if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

    //                                 arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

    //                             }
    //                         }
    //                     }
    //                 }



    //                 picts.push(arrpict[i]);
    //             }
    //         } else {
    //             picts = [];
    //         }


    //     } else {
    //         picts = [];
    //     }

    //     var tempdatavid = [];
    //     // console.log(lengvid);
    //     if (lengvid > 0) {

    //         if (arrvid[0]._id !== undefined) {

    //             for (let i = 0; i < lengvid; i++) {
    //                 if (arrvid[i].isApsara == true) {
    //                     tempdatavid.push(arrvid[i].apsaraId);
    //                 }
    //             }

    //             // console.log(tempdatavid);
    //             var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
    //             var gettempresultvidapsara = resultvidapsara.VideoList;
    //             for (var i = 0; i < lengvid; i++) {
    //                 var checkvidketemu = false;
    //                 for (var j = 0; j < gettempresultvidapsara.length; j++) {
    //                     if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
    //                         checkvidketemu = true;
    //                         arrvid[i].media =
    //                         {
    //                             "VideoList": [gettempresultvidapsara[j]]
    //                         }
    //                         arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkvidketemu == false) {
    //                     arrvid[i].apsaraId = "";
    //                     arrvid[i].isApsara = false;
    //                     arrvid[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 vid.push(arrvid[i]);
    //             }
    //         } else {
    //             vid = [];
    //         }


    //     } else {
    //         vid = [];
    //     }

    //     var tempdatadiary = [];
    //     // console.log(lengdiary);
    //     if (lengdiary > 0) {

    //         if (arrdiary[0]._id !== undefined) {

    //             for (let i = 0; i < lengdiary; i++) {
    //                 if (arrdiary[i].isApsara == true) {
    //                     tempdatadiary.push(arrdiary[i].apsaraId);
    //                 }
    //             }

    //             // console.log(tempdatavid);
    //             var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
    //             var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
    //             for (var i = 0; i < lengdiary; i++) {
    //                 var checkdiaryketemu = false;
    //                 for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
    //                     if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
    //                         checkdiaryketemu = true;
    //                         arrdiary[i].media =
    //                         {
    //                             "VideoList": [gettempresultdiaryapsara[j]]
    //                         }
    //                         arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkdiaryketemu == false) {
    //                     arrdiary[i].apsaraId = "";
    //                     arrdiary[i].isApsara = false;
    //                     arrdiary[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 diary.push(arrdiary[i]);
    //             }
    //         } else {
    //             diary = [];
    //         }


    //     } else {
    //         diary = [];
    //     }

    //     data = [{

    //         user, picts, vid, diary, tags
    //     }];

    //     var timestamps_end = await this.utilsService.getDateTimeString();
    //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //     return { response_code: 202, data, messages };
    // }
    // @Post('api/getusercontents/searchdatanew/v2')
    // @UseGuards(JwtAuthGuard)
    // async contentsearchnew(@Req() request: Request, @Headers() headers): Promise<any> {
    //     var timestamps_start = await this.utilsService.getDateTimeString();
    //     var fullurl = request.get("Host") + request.originalUrl;
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;

    //     var keys = null;
    //     var skip = 0;
    //     var limit = 0;

    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var dataLike = null;
    //     var listpict = null;
    //     var listvid = null;
    //     var listdiary = null;
    //     var listuser = null;
    //     var listtag = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];
    //     listpict = request_json["listpict"];
    //     listvid = request_json["listvid"];
    //     listdiary = request_json["listdiary"];
    //     listuser = request_json["listuser"];
    //     listtag = request_json["listtag"];
    //     const messages = {
    //         "info": ["The process successful"],
    //     };


    //     var user = [];
    //     var arrpict = [];
    //     var arrvid = [];
    //     var arrdiary = [];
    //     var picts = [];

    //     var vid = [];
    //     var diary = [];
    //     var tags = [];
    //     var lengpict = null;
    //     var lengdiary = null;
    //     var lengvid = null;
    //     var lenguser = null;
    //     var datatag = null;
    //     var apsaraId = null;
    //     var apsaraThumbId = null;
    //     var uploadSource = null;
    //     try {
    //         datasearch = await this.postsService.finddatasearchcontenNew2(keys.toLowerCase(), email, skip, limit, listpict, listvid, listdiary, listuser, listtag);
    //         user = datasearch[0].user;
    //         tags = datasearch[0].tags;

    //     } catch (e) {
    //         datasearch = null;
    //         user = [];
    //         tags = [];
    //     }

    //     if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
    //         tags = [];
    //     }


    //     try {
    //         user = datasearch[0].user;
    //         lenguser = user.length;

    //     } catch (e) {
    //         user = [];
    //         lenguser = 0;

    //     }

    //     try {
    //         arrpict = datasearch[0].pict;
    //         lengpict = arrpict.length;

    //     } catch (e) {
    //         arrpict = [];
    //         lengpict = 0;

    //     }
    //     try {
    //         arrvid = datasearch[0].vid;
    //         lengvid = arrvid.length;

    //     } catch (e) {
    //         arrvid = [];
    //         lengvid = 0;

    //     }

    //     try {
    //         arrdiary = datasearch[0].diary;
    //         lengdiary = arrdiary.length;

    //     } catch (e) {
    //         arrdiary = [];
    //         lengdiary = 0;

    //     }

    //     if (lenguser > 0 && user[0].email !== undefined) {
    //         user = datasearch[0].user;
    //     } else {
    //         user = [];
    //     }

    //     var tempdatapict = [];
    //     var temporipict = [];
    //     // console.log(lengpict);
    //     if (lengpict > 0) {

    //         if (arrpict[0]._id !== undefined) {

    //             for (let i = 0; i < lengpict; i++) {
    //                 uploadSource = arrpict[i].uploadSource;
    //                 try {
    //                     apsaraId = arrpict[i].apsaraId;
    //                 } catch (e) {
    //                     apsaraId = "";
    //                 }
    //                 try {
    //                     apsaraThumbId = arrpict[i].apsaraThumbId;
    //                 } catch (e) {
    //                     apsaraThumbId = "";
    //                 }

    //                 if (apsaraThumbId !== undefined) {
    //                     tempdatapict.push(arrpict[i].apsaraThumbId);

    //                 }
    //                 if (apsaraId !== undefined) {
    //                     temporipict.push(arrpict[i].apsaraId);

    //                 }

    //             }

    //             // console.log(tempdatapict);


    //             var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //             var gettempresultpictapsara = resultpictapsara.ImageInfo;
    //             var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
    //             var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
    //             for (var i = 0; i < lengpict; i++) {
    //                 //var checkpictketemu = false;

    //                 uploadSource = arrpict[i].uploadSource;


    //                 if (uploadSource == "OSS") {
    //                     //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

    //                 } else {


    //                     if (gettempresultpictapsara.length > 0) {
    //                         for (let j = 0; j < gettempresultpictapsara.length; j++) {

    //                             if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


    //                                 arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                             }

    //                         }
    //                     }

    //                     if (gettempresultpictapsaraori.length > 0) {
    //                         for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


    //                             if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

    //                                 arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

    //                             }
    //                         }
    //                     }
    //                 }



    //                 picts.push(arrpict[i]);
    //             }
    //         } else {
    //             picts = [];
    //         }


    //     } else {
    //         picts = [];
    //     }

    //     var tempdatavid = [];
    //     // console.log(lengvid);
    //     if (lengvid > 0) {

    //         if (arrvid[0]._id !== undefined) {

    //             for (let i = 0; i < lengvid; i++) {
    //                 if (arrvid[i].isApsara == true) {
    //                     tempdatavid.push(arrvid[i].apsaraId);
    //                 }
    //             }

    //             // console.log(tempdatavid);
    //             var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
    //             var gettempresultvidapsara = resultvidapsara.VideoList;
    //             for (var i = 0; i < lengvid; i++) {
    //                 var checkvidketemu = false;
    //                 for (var j = 0; j < gettempresultvidapsara.length; j++) {
    //                     if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
    //                         checkvidketemu = true;
    //                         arrvid[i].media =
    //                         {
    //                             "VideoList": [gettempresultvidapsara[j]]
    //                         }
    //                         arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkvidketemu == false) {
    //                     arrvid[i].apsaraId = "";
    //                     arrvid[i].isApsara = false;
    //                     arrvid[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 vid.push(arrvid[i]);
    //             }
    //         } else {
    //             vid = [];
    //         }


    //     } else {
    //         vid = [];
    //     }

    //     var tempdatadiary = [];
    //     // console.log(lengdiary);
    //     if (lengdiary > 0) {

    //         if (arrdiary[0]._id !== undefined) {

    //             for (let i = 0; i < lengdiary; i++) {
    //                 if (arrdiary[i].isApsara == true) {
    //                     tempdatadiary.push(arrdiary[i].apsaraId);
    //                 }
    //             }

    //             // console.log(tempdatavid);
    //             var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
    //             var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
    //             for (var i = 0; i < lengdiary; i++) {
    //                 var checkdiaryketemu = false;
    //                 for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
    //                     if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
    //                         checkdiaryketemu = true;
    //                         arrdiary[i].media =
    //                         {
    //                             "VideoList": [gettempresultdiaryapsara[j]]
    //                         }
    //                         arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkdiaryketemu == false) {
    //                     arrdiary[i].apsaraId = "";
    //                     arrdiary[i].isApsara = false;
    //                     arrdiary[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 diary.push(arrdiary[i]);
    //             }
    //         } else {
    //             diary = [];
    //         }


    //     } else {
    //         diary = [];
    //     }

    //     data = [{

    //         user, picts, vid, diary, tags
    //     }];

    //     var timestamps_end = await this.utilsService.getDateTimeString();
    //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //     return { response_code: 202, data, messages };
    // }
    //test
    @Post('api/getusercontents/searchdatanew/detailinterest')
    @UseGuards(JwtAuthGuard)
    async detailinterestsearchnew2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        // var listuser = null;
        // var listtag = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        listdiary = request_json["listdiary"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var interests = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;

        try {
            datasearch = await this.getusercontentsService.detailinterestcontenNew(keys, email, skip, limit, listpict, listvid, listdiary);
            interests = datasearch[0].interest;

        } catch (e) {
            datasearch = null;
            interests = [];
        }

        if (interests == undefined || interests.length == 0 || interests[0].interestNameId == undefined) {
            interests = [];
        }


        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].video;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        var tempdatapict = [];
        var temporipict = [];
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraThumbId !== undefined) {
                        tempdatapict.push(arrpict[i].apsaraThumbId);

                    }
                    if (apsaraId !== undefined) {
                        temporipict.push(arrpict[i].apsaraId);

                    }

                }

                // console.log(tempdatapict);


                var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                var gettempresultpictapsara = resultpictapsara.ImageInfo;
                var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
                var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                for (var i = 0; i < lengpict; i++) {
                    //var checkpictketemu = false;

                    uploadSource = arrpict[i].uploadSource;


                    if (uploadSource == "OSS") {
                        //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                    } else {


                        if (gettempresultpictapsara.length > 0) {
                            for (let j = 0; j < gettempresultpictapsara.length; j++) {

                                if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                                }

                            }
                        }

                        if (gettempresultpictapsaraori.length > 0) {
                            for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                                if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                                    arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                                }
                            }
                        }
                    }



                    picts.push(arrpict[i]);
                }
            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        var tempdatadiary = [];
        // console.log(lengdiary);
        if (lengdiary > 0) {

            if (arrdiary[0]._id !== undefined) {

                for (let i = 0; i < lengdiary; i++) {
                    if (arrdiary[i].isApsara == true) {
                        tempdatadiary.push(arrdiary[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
                var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
                for (var i = 0; i < lengdiary; i++) {
                    var checkdiaryketemu = false;
                    for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
                        if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
                            checkdiaryketemu = true;
                            arrdiary[i].media =
                            {
                                "VideoList": [gettempresultdiaryapsara[j]]
                            }

                            arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
                        }
                    }

                    if (checkdiaryketemu == false) {
                        arrdiary[i].apsaraId = "";
                        arrdiary[i].isApsara = false;
                        arrdiary[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    diary.push(arrdiary[i]);
                }
            } else {
                diary = [];
            }


        } else {
            diary = [];
        }

        data = [{

            picts, vid, diary, interests
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/searchdatanew/detailinterest/v2')
    @UseGuards(JwtAuthGuard)
    async detailinterestsearchnewv2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        // var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        // var listuser = null;
        // var listtag = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        listdiary = request_json["listdiary"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var interests = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;

        try {
            datasearch = await this.getusercontentsService.detailinterestcontenNew2(keys, email, skip, limit, listpict, listvid, listdiary);
            interests = datasearch[0].interest;

        } catch (e) {
            datasearch = null;
            interests = [];
        }

        if (interests == undefined || interests.length == 0 || interests[0].interestNameId == undefined) {
            interests = [];
        }


        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].video;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        var tempdatapict = [];
        var temporipict = [];
        var tempapsaraId_result = null;
        var tempapsaraThumbId_result = null;
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];
        var resultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    //uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(arrpict[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(arrpict[i].apsaraThumbId);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;

                for (let i = 0; i < lengpict; i++) {

                    var checkpictketemu = false;
                    // uploadSource = arrpict[i].uploadSource;
                    var dataUpsaraThum = (arrpict[i].apsaraThumbId != undefined);
                    var dataUpsara = (arrpict[i].apsaraId != undefined);

                    if (arrpict[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == arrpict[i].apsaraId) {
                                arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == arrpict[i].apsaraThumbId) {
                                arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }
                    picts.push(arrpict[i]);
                }

                // console.log(tempdatapict);


                // var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // var gettempresultpictapsara = resultpictapsara.ImageInfo;
                // var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
                // var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                // for (var i = 0; i < lengpict; i++) {
                //     //var checkpictketemu = false;

                //     uploadSource = arrpict[i].uploadSource;


                //     if (uploadSource == "OSS") {
                //         //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                //     } else {


                //         if (gettempresultpictapsara.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsara.length; j++) {

                //                 if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                //                     arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                //                 }

                //             }
                //         }

                //         if (gettempresultpictapsaraori.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                //                 if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                //                     arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                //                 }
                //             }
                //         }
                //     }



                //     picts.push(arrpict[i]);
                // }


            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        var tempdatadiary = [];
        // console.log(lengdiary);
        if (lengdiary > 0) {

            if (arrdiary[0]._id !== undefined) {

                for (let i = 0; i < lengdiary; i++) {
                    if (arrdiary[i].isApsara == true) {
                        tempdatadiary.push(arrdiary[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
                var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
                for (var i = 0; i < lengdiary; i++) {
                    var checkdiaryketemu = false;
                    for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
                        if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
                            checkdiaryketemu = true;
                            arrdiary[i].media =
                            {
                                "VideoList": [gettempresultdiaryapsara[j]]
                            }

                            arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
                        }
                    }

                    if (checkdiaryketemu == false) {
                        arrdiary[i].apsaraId = "";
                        arrdiary[i].isApsara = false;
                        arrdiary[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    diary.push(arrdiary[i]);
                }
            } else {
                diary = [];
            }


        } else {
            diary = [];
        }

        data = [{

            picts, vid, diary, interests
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/searchdatanew/detailtag')
    @UseGuards(JwtAuthGuard)
    async detailtagsearchnew2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        // var listuser = null;
        // var listtag = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        listdiary = request_json["listdiary"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var tags = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;

        try {
            datasearch = await this.tagCountService.detailsearchcontenNew(keys, email, skip, limit, listpict, listvid, listdiary);
            tags = datasearch[0].tag;

        } catch (e) {
            datasearch = null;
            tags = [];
        }

        if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
            tags = [];
        }


        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].vid;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        var tempdatapict = [];
        var temporipict = [];
        var tempapsaraId_result = null;
        var tempapsaraThumbId_result = null;
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];
        var resultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    //uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(arrpict[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(arrpict[i].apsaraThumbId);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;

                for (let i = 0; i < lengpict; i++) {

                    var checkpictketemu = false;
                    // uploadSource = arrpict[i].uploadSource;
                    var dataUpsaraThum = (arrpict[i].apsaraThumbId != undefined);
                    var dataUpsara = (arrpict[i].apsaraId != undefined);

                    if (arrpict[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == arrpict[i].apsaraId) {
                                arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == arrpict[i].apsaraThumbId) {
                                arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }
                    picts.push(arrpict[i]);
                }

                // console.log(tempdatapict);


                // var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // var gettempresultpictapsara = resultpictapsara.ImageInfo;
                // var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
                // var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                // for (var i = 0; i < lengpict; i++) {
                //     //var checkpictketemu = false;

                //     uploadSource = arrpict[i].uploadSource;


                //     if (uploadSource == "OSS") {
                //         //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                //     } else {


                //         if (gettempresultpictapsara.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsara.length; j++) {

                //                 if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                //                     arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                //                 }

                //             }
                //         }

                //         if (gettempresultpictapsaraori.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                //                 if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                //                     arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                //                 }
                //             }
                //         }
                //     }



                //     picts.push(arrpict[i]);
                // }


            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        var tempdatadiary = [];
        // console.log(lengdiary);
        if (lengdiary > 0) {

            if (arrdiary[0]._id !== undefined) {

                for (let i = 0; i < lengdiary; i++) {
                    if (arrdiary[i].isApsara == true) {
                        tempdatadiary.push(arrdiary[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
                var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
                for (var i = 0; i < lengdiary; i++) {
                    var checkdiaryketemu = false;
                    for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
                        if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
                            checkdiaryketemu = true;
                            arrdiary[i].media =
                            {
                                "VideoList": [gettempresultdiaryapsara[j]]
                            }
                            arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
                        }
                    }

                    if (checkdiaryketemu == false) {
                        arrdiary[i].apsaraId = "";
                        arrdiary[i].isApsara = false;
                        arrdiary[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    diary.push(arrdiary[i]);
                }
            } else {
                diary = [];
            }


        } else {
            diary = [];
        }

        data = [{

            picts, vid, diary, tags
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/searchdatanew/detailtag/v2')
    @UseGuards(JwtAuthGuard)
    async detailtagsearchnewv2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        // var listuser = null;
        // var listtag = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        listdiary = request_json["listdiary"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var tags = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;

        try {
            datasearch = await this.tagCountService.detailsearchcontenNew2(keys, email, skip, limit, listpict, listvid, listdiary);
            tags = datasearch[0].tag;

        } catch (e) {
            datasearch = null;
            tags = [];
        }

        if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
            tags = [];
        }


        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].vid;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        var tempdatapict = [];
        var temporipict = [];
        var tempapsaraId_result = null;
        var tempapsaraThumbId_result = null;
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];
        var resultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    //uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(arrpict[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(arrpict[i].apsaraThumbId);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;

                for (let i = 0; i < lengpict; i++) {

                    var checkpictketemu = false;
                    // uploadSource = arrpict[i].uploadSource;
                    var dataUpsaraThum = (arrpict[i].apsaraThumbId != undefined);
                    var dataUpsara = (arrpict[i].apsaraId != undefined);

                    if (arrpict[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == arrpict[i].apsaraId) {
                                arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == arrpict[i].apsaraThumbId) {
                                arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }
                    picts.push(arrpict[i]);
                }

                // console.log(tempdatapict);


                // var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // var gettempresultpictapsara = resultpictapsara.ImageInfo;
                // var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
                // var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                // for (var i = 0; i < lengpict; i++) {
                //     //var checkpictketemu = false;

                //     uploadSource = arrpict[i].uploadSource;


                //     if (uploadSource == "OSS") {
                //         //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                //     } else {


                //         if (gettempresultpictapsara.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsara.length; j++) {

                //                 if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                //                     arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                //                 }

                //             }
                //         }

                //         if (gettempresultpictapsaraori.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                //                 if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                //                     arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                //                 }
                //             }
                //         }
                //     }



                //     picts.push(arrpict[i]);
                // }


            } else {
                picts = [];
            }


        } else {
            picts = [];
        }
        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        var tempdatadiary = [];
        // console.log(lengdiary);
        if (lengdiary > 0) {

            if (arrdiary[0]._id !== undefined) {

                for (let i = 0; i < lengdiary; i++) {
                    if (arrdiary[i].isApsara == true) {
                        tempdatadiary.push(arrdiary[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
                var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
                for (var i = 0; i < lengdiary; i++) {
                    var checkdiaryketemu = false;
                    for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
                        if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
                            checkdiaryketemu = true;
                            arrdiary[i].media =
                            {
                                "VideoList": [gettempresultdiaryapsara[j]]
                            }
                            arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
                        }
                    }

                    if (checkdiaryketemu == false) {
                        arrdiary[i].apsaraId = "";
                        arrdiary[i].isApsara = false;
                        arrdiary[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    diary.push(arrdiary[i]);
                }
            } else {
                diary = [];
            }


        } else {
            diary = [];
        }

        data = [{

            picts, vid, diary, tags
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/searchdatanew/newdetailtag')
    @UseGuards(JwtAuthGuard)
    async detailtagsearchnewIndex(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        // var listuser = null;
        // var listtag = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        // listdiary = request_json["listdiary"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var tags = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;

        try {
            datasearch = await this.tagCountService.detailsearchcontenNew3(keys, email, skip, limit, listpict, listvid, listdiary);
            tags = datasearch[0].tag;

        } catch (e) {
            datasearch = null;
            tags = [];
        }

        if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
            tags = [];
        }


        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].vid;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        var tempdatapict = [];
        var temporipict = [];
        var tempapsaraId_result = null;
        var tempapsaraThumbId_result = null;
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];
        var resultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    //uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(arrpict[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(arrpict[i].apsaraThumbId);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;

                for (let i = 0; i < lengpict; i++) {

                    var checkpictketemu = false;
                    // uploadSource = arrpict[i].uploadSource;
                    var dataUpsaraThum = (arrpict[i].apsaraThumbId != undefined);
                    var dataUpsara = (arrpict[i].apsaraId != undefined);

                    if (arrpict[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == arrpict[i].apsaraId) {
                                arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == arrpict[i].apsaraThumbId) {
                                arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }
                    picts.push(arrpict[i]);
                }

                // console.log(tempdatapict);


                // var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // var gettempresultpictapsara = resultpictapsara.ImageInfo;
                // var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
                // var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                // for (var i = 0; i < lengpict; i++) {
                //     //var checkpictketemu = false;

                //     uploadSource = arrpict[i].uploadSource;


                //     if (uploadSource == "OSS") {
                //         //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                //     } else {


                //         if (gettempresultpictapsara.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsara.length; j++) {

                //                 if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                //                     arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                //                 }

                //             }
                //         }

                //         if (gettempresultpictapsaraori.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                //                 if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                //                     arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                //                 }
                //             }
                //         }
                //     }



                //     picts.push(arrpict[i]);
                // }


            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        // var tempdatadiary = [];
        // // console.log(lengdiary);
        // if (lengdiary > 0) {

        //     if (arrdiary[0]._id !== undefined) {

        //         for (let i = 0; i < lengdiary; i++) {
        //             if (arrdiary[i].isApsara == true) {
        //                 tempdatadiary.push(arrdiary[i].apsaraId);
        //             }
        //         }

        //         // console.log(tempdatavid);
        //         var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
        //         var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
        //         for (var i = 0; i < lengdiary; i++) {
        //             var checkdiaryketemu = false;
        //             for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
        //                 if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
        //                     checkdiaryketemu = true;
        //                     arrdiary[i].media =
        //                     {
        //                         "VideoList": [gettempresultdiaryapsara[j]]
        //                     }
        //                     arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
        //                 }
        //             }

        //             if (checkdiaryketemu == false) {
        //                 arrdiary[i].apsaraId = "";
        //                 arrdiary[i].isApsara = false;
        //                 arrdiary[i].media =
        //                 {
        //                     "VideoList": []
        //                 };
        //             }
        //             diary.push(arrdiary[i]);
        //         }
        //     } else {
        //         diary = [];
        //     }


        // } else {
        //     diary = [];
        // }

        data = [{

            picts, vid, tags
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/searchdatanew/newdetailtag/v2')
    @UseGuards(JwtAuthGuard)
    async detailtagsearchnewDETAIL(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        // var listuser = null;
        // var listtag = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        // listdiary = request_json["listdiary"];


        const messages = {
            "info": ["The process successful"],
        };


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var tags = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;

        try {
            datasearch = await this.tagCountService.detailsearchcontenNew4(keys, email, skip, limit, listpict, listvid, listdiary);
            tags = datasearch[0].tag;

        } catch (e) {
            datasearch = null;
            tags = [];
        }

        if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
            tags = [];
        }


        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].vid;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        var tempdatapict = [];
        var temporipict = [];
        var tempapsaraId_result = null;
        var tempapsaraThumbId_result = null;
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];
        var resultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    //uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(arrpict[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(arrpict[i].apsaraThumbId);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;

                for (let i = 0; i < lengpict; i++) {

                    var checkpictketemu = false;
                    // uploadSource = arrpict[i].uploadSource;
                    var dataUpsaraThum = (arrpict[i].apsaraThumbId != undefined);
                    var dataUpsara = (arrpict[i].apsaraId != undefined);

                    if (arrpict[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == arrpict[i].apsaraId) {
                                arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == arrpict[i].apsaraThumbId) {
                                arrpict[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    arrpict[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }
                    picts.push(arrpict[i]);
                }

                // console.log(tempdatapict);


                // var resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // var gettempresultpictapsara = resultpictapsara.ImageInfo;
                // var resultpictapsaraOri = await this.postContentService.getImageApsara(temporipict);
                // var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                // for (var i = 0; i < lengpict; i++) {
                //     //var checkpictketemu = false;

                //     uploadSource = arrpict[i].uploadSource;


                //     if (uploadSource == "OSS") {
                //         //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                //     } else {


                //         if (gettempresultpictapsara.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsara.length; j++) {

                //                 if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                //                     arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                //                 }

                //             }
                //         }

                //         if (gettempresultpictapsaraori.length > 0) {
                //             for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                //                 if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                //                     arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                //                 }
                //             }
                //         }
                //     }



                //     picts.push(arrpict[i]);
                // }


            } else {
                picts = [];
            }


        } else {
            picts = [];
        }
        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.postContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        // var tempdatadiary = [];
        // // console.log(lengdiary);
        // if (lengdiary > 0) {

        //     if (arrdiary[0]._id !== undefined) {

        //         for (let i = 0; i < lengdiary; i++) {
        //             if (arrdiary[i].isApsara == true) {
        //                 tempdatadiary.push(arrdiary[i].apsaraId);
        //             }
        //         }

        //         // console.log(tempdatavid);
        //         var resultdiaryapsara = await this.postContentService.getVideoApsara(tempdatadiary);
        //         var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
        //         for (var i = 0; i < lengdiary; i++) {
        //             var checkdiaryketemu = false;
        //             for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
        //                 if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
        //                     checkdiaryketemu = true;
        //                     arrdiary[i].media =
        //                     {
        //                         "VideoList": [gettempresultdiaryapsara[j]]
        //                     }
        //                     arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
        //                 }
        //             }

        //             if (checkdiaryketemu == false) {
        //                 arrdiary[i].apsaraId = "";
        //                 arrdiary[i].isApsara = false;
        //                 arrdiary[i].media =
        //                 {
        //                     "VideoList": []
        //                 };
        //             }
        //             diary.push(arrdiary[i]);
        //         }
        //     } else {
        //         diary = [];
        //     }


        // } else {
        //     diary = [];
        // }

        data = [{

            picts, vid, tags
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }


    async sendInteractiveFCM(email: string, postID: string, titlein: string, bodyin: string) {


        var posts = await this.postsService.findid(postID);
        var post_type = "";
        if (await this.utilsService.ceckData(posts)) {
            post_type = posts.postType.toString();

            await this.utilsService.sendFcmMassal(email, titlein, bodyin, "GENERAL", "ACCEPT", postID, post_type)
        }

    }
    // @Post('api/posts/getuserposts/my')
    // @UseInterceptors(FileInterceptor('postContent'))
    // @UseGuards(JwtAuthGuard)
    // async contentlandingpagemy(@Body() body, @Headers('x-auth-user') email: string): Promise<any> {

    //     var pageNumber = null;
    //     var pageRow = null;
    //     var postType = null;
    //     var data = null;
    //     var datasearch = null;
    //     var emailreceiver = null;
    //     if (body.pageNumber !== undefined) {
    //         pageNumber = body.pageNumber;
    //     }

    //     if (body.pageRow !== undefined) {
    //         pageRow = body.pageRow;
    //     }
    //     if (body.postType !== undefined) {
    //         postType = body.postType;
    //     }


    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     var picts = [];
    //     var lengpict = null;

    //     try {

    //         data = await this.postsService.landingpageMy2(email, postType, parseInt(pageNumber), parseInt(pageRow), email);
    //         lengpict = data.length;

    //     } catch (e) {
    //         data = null;
    //         lengpict = 0;

    //     }

    //     var tempapsaraId = [];
    //     var tempapsaraThumbId = [];
    //     var tempdatapict = [];

    //     var tempdatapict = [];

    //     var boosted = null;
    //     var boostCount = null;
    //     var version = null;
    //     var uploadSource = null;
    //     var apsaraId = null;
    //     var apsaraThumbId = null;
    //     var mediaType = null;
    //     var postID = null;
    //     var gettempresultpictapsara = null;
    //     // console.log(lengpict);
    //     if (lengpict > 0) {
    //         var tempapsaraId_result = null;
    //         var tempapsaraThumbId_result = null;

    //         var resultpictapsara = null;
    //         version = data[0].version;
    //         // console.log(tempdatapict);
    //         if (postType == "pict") {
    //             for (let i = 0; i < lengpict; i++) {
    //                 uploadSource = data[i].uploadSource;
    //                 try {
    //                     apsaraId = data[i].apsaraId;
    //                 } catch (e) {
    //                     apsaraId = "";
    //                 }
    //                 try {
    //                     apsaraThumbId = data[i].apsaraThumbId;
    //                 } catch (e) {
    //                     apsaraThumbId = "";
    //                 }

    //                 if (apsaraId != "") {
    //                     tempapsaraId.push(data[i].apsaraId);
    //                 }

    //                 if (apsaraId != "") {
    //                     tempapsaraThumbId.push(data[i].apsaraThumbId);
    //                 }
    //             }
    //             console.log("");
    //             tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
    //             tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

    //             let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
    //             let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
    //             // for (let i = 0; i < lengpict; i++) {

    //             //     uploadSource = data[i].uploadSource;
    //             //     try {
    //             //         apsaraId = data[i].apsaraId;
    //             //     } catch (e) {
    //             //         apsaraId = "";
    //             //     }
    //             //     try {
    //             //         apsaraThumbId = data[i].apsaraThumbId;
    //             //     } catch (e) {
    //             //         apsaraThumbId = "";
    //             //     }

    //             //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
    //             //         tempdatapict.push(data[i].apsaraThumbId);
    //             //         // tempdatapict.push(data[i].apsaraId);

    //             //     }
    //             //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
    //             //         tempdatapict.push(data[i].apsaraId);

    //             //     }
    //             //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
    //             //         tempdatapict.push(data[i].apsaraThumbId);

    //             //     }
    //             // }
    //             // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //             // let gettempresultpictapsara = resultpictapsara.ImageInfo;
    //             for (let i = 0; i < lengpict; i++) {
    //                 emailreceiver = data[i].email;
    //                 boosted = data[i].boosted;
    //                 boostCount = data[i].boostCount;
    //                 var checkpictketemu = false;
    //                 uploadSource = data[i].uploadSource;
    //                 var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
    //                 var dataUpsara = (data[i].apsaraId != undefined);

    //                 if (data[i].isApsara) {
    //                     for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
    //                         if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
    //                             data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                             if (!dataUpsaraThum) {
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                             }
    //                         }
    //                     }
    //                     for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
    //                         if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
    //                             data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
    //                             if (!dataUpsara) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 // emailreceiver = data[i].email;
    //                 // boosted = data[i].boosted;
    //                 // boostCount = data[i].boostCount;
    //                 // var checkpictketemu = false;
    //                 // uploadSource = data[i].uploadSource;
    //                 // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
    //                 // var dataUpsara = (data[i].apsaraId != undefined);

    //                 // if (data[i].isApsara) {
    //                 //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

    //                 //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
    //                 //             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                 //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             if (!dataUpsara) {
    //                 //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             // checkpictketemu = true;
    //                 //             data[i].media =
    //                 //             {
    //                 //                 "ImageInfo": [gettempresultpictapsara[j]]
    //                 //             }

    //                 //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                 //         }
    //                 //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
    //                 //             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                 //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             if (!dataUpsaraThum) {
    //                 //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             checkpictketemu = true;
    //                 //             data[i].media =
    //                 //             {
    //                 //                 "ImageInfo": [gettempresultpictapsara[j]]
    //                 //             }

    //                 //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

    //                 //         }
    //                 //     }
    //                 // } else {
    //                 //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
    //                 // }




    //                 if (boosted !== null || boosted.length > 0) {
    //                     console.log("boosted: " + data[i].postID);
    //                     this.postsService.updateBoostViewer(data[i].postID, email);
    //                     //pd.boostJangkauan = this.countBoosted(obj, email);
    //                     if (boosted.length > 0) {
    //                         if (boosted[0] != undefined) {
    //                             boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //                             boosted = boosted;
    //                             await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //                         } else {
    //                             boostCount = 0;
    //                             boosted = [];
    //                         }
    //                     } else {
    //                         boostCount = 0;
    //                         boosted = [];
    //                     }
    //                 } else {
    //                     boostCount = 0;
    //                     boosted = [];
    //                 }
    //                 //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

    //                 picts.push(data[i]);
    //             }

    //         } else {
    //             for (let i = 0; i < lengpict; i++) {
    //                 //ini buat produksion
    //                 // postType = data[i].postType;
    //                 // if (postType === "diary") {
    //                 //     data[i].saleAmount = 0;
    //                 // }
    //                 mediaType = data[i].mediaType;


    //                 if (data[i].isApsara == true) {
    //                     tempdatapict.push(data[i].apsaraId);
    //                 } else {
    //                     if (mediaType == "image" || mediaType == "images") {
    //                         data[i].mediaEndpoint = "/pict/" + data[i].postID;
    //                     } else {
    //                         data[i].mediaEndpoint = "/stream/" + data[i].postID;

    //                     }
    //                 }
    //             }

    //             if (mediaType == "image" || mediaType == "images") {
    //                 resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //                 gettempresultpictapsara = resultpictapsara.ImageInfo;

    //             } else {
    //                 resultpictapsara = await this.postContentService.getVideoApsara(tempdatapict);
    //                 gettempresultpictapsara = resultpictapsara.VideoList;
    //             }

    //             for (let i = 0; i < lengpict; i++) {
    //                 emailreceiver = data[i].email;
    //                 boostCount = data[i].boostCount;
    //                 boosted = data[i].boosted;
    //                 var checkpictketemu = false;
    //                 for (var j = 0; j < gettempresultpictapsara.length; j++) {
    //                     if (mediaType == "image" || mediaType == "images") {
    //                         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
    //                             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             if (!dataUpsara) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             // checkpictketemu = true;
    //                             data[i].media =
    //                             {
    //                                 "ImageInfo": [gettempresultpictapsara[j]]
    //                             }

    //                             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                         }
    //                         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
    //                             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             if (!dataUpsaraThum) {
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             checkpictketemu = true;
    //                             data[i].media =
    //                             {
    //                                 "ImageInfo": [gettempresultpictapsara[j]]
    //                             }

    //                             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

    //                         }
    //                     } else {
    //                         if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
    //                             checkpictketemu = true;
    //                             data[i].media =
    //                             {
    //                                 "VideoList": [gettempresultpictapsara[j]]
    //                             }

    //                             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
    //                         }
    //                     }
    //                 }

    //                 if (checkpictketemu == false) {
    //                     data[i].apsaraId = "";
    //                     data[i].isApsara = false;
    //                     data[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 if (boosted !== null || boosted.length > 0) {
    //                     console.log("boosted: " + data[i].postID);
    //                     this.postsService.updateBoostViewer(data[i].postID, email);
    //                     //pd.boostJangkauan = this.countBoosted(obj, email);
    //                     if (boosted.length > 0) {
    //                         if (boosted[0] != undefined) {
    //                             boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //                             boosted = boosted;

    //                             await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //                         } else {
    //                             boostCount = 0;
    //                             boosted = [];
    //                         }
    //                     } else {
    //                         boostCount = 0;
    //                         boosted = [];
    //                     }
    //                 } else {
    //                     boostCount = 0;
    //                     boosted = [];
    //                 }
    //                 // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


    //                 picts.push(data[i]);
    //             }
    //         }
    //     } else {
    //         picts = [];
    //         version = "";
    //     }
    //     return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    // }


    // @Post('api/posts/getuserposts/byprofile')
    // @UseInterceptors(FileInterceptor('postContent'))
    // @UseGuards(JwtAuthGuard)
    // async contentbyprofile(@Body() body, @Headers('x-auth-user') emailLogin: string): Promise<any> {

    //     var pageNumber = null;
    //     var pageRow = null;
    //     var postType = null;
    //     var data = null;
    //     var datasearch = null;
    //     var emailreceiver = null;
    //     var email = null;

    //     if (body.pageNumber !== undefined) {
    //         pageNumber = body.pageNumber;
    //     }

    //     if (body.pageRow !== undefined) {
    //         pageRow = body.pageRow;
    //     }
    //     if (body.postType !== undefined) {
    //         postType = body.postType;
    //     }
    //     if (body.email !== undefined) {
    //         email = body.email;
    //     }

    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     var picts = [];
    //     var lengpict = null;

    //     try {

    //         data = await this.postsService.landingpageMy2(email, postType, parseInt(pageNumber), parseInt(pageRow), emailLogin);
    //         lengpict = data.length;
    //         console.log("data", data);
    //     } catch (e) {
    //         data = null;
    //         lengpict = 0;

    //     }


    //     //CECK FOLLOWING
    //     var getFollowing = false;
    //     var ceck_data_FOLLOW = await this.contenteventsService.ceckData(String(emailLogin), "FOLLOWING", "ACCEPT", "", email, "", true);
    //     if (await this.utilsService.ceckData(ceck_data_FOLLOW)) {
    //         getFollowing = true;
    //     }
    //     if (data != null) {
    //         data.forEach(v => { v.following = getFollowing; });
    //     }

    //     var tempapsaraId = [];
    //     var tempapsaraThumbId = [];
    //     var tempdatapict = [];

    //     var tempdatapict = [];

    //     var boosted = null;
    //     var boostCount = null;
    //     var version = null;
    //     var uploadSource = null;
    //     var apsaraId = null;
    //     var apsaraThumbId = null;
    //     var mediaType = null;
    //     var postID = null;
    //     var gettempresultpictapsara = null;
    //     // console.log(lengpict);
    //     if (lengpict > 0) {
    //         var tempapsaraId_result = null;
    //         var tempapsaraThumbId_result = null;

    //         var resultpictapsara = null;
    //         version = data[0].version;
    //         // console.log(tempdatapict);
    //         if (postType == "pict") {

    //             for (let i = 0; i < lengpict; i++) {
    //                 uploadSource = data[i].uploadSource;
    //                 try {
    //                     apsaraId = data[i].apsaraId;
    //                 } catch (e) {
    //                     apsaraId = "";
    //                 }
    //                 try {
    //                     apsaraThumbId = data[i].apsaraThumbId;
    //                 } catch (e) {
    //                     apsaraThumbId = "";
    //                 }

    //                 if (apsaraId != "") {
    //                     tempapsaraId.push(data[i].apsaraId);
    //                 }

    //                 if (apsaraId != "") {
    //                     tempapsaraThumbId.push(data[i].apsaraThumbId);
    //                 }
    //             }
    //             console.log("");
    //             tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
    //             tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

    //             let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
    //             let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
    //             // for (let i = 0; i < lengpict; i++) {

    //             //     uploadSource = data[i].uploadSource;
    //             //     try {
    //             //         apsaraId = data[i].apsaraId;
    //             //     } catch (e) {
    //             //         apsaraId = "";
    //             //     }
    //             //     try {
    //             //         apsaraThumbId = data[i].apsaraThumbId;
    //             //     } catch (e) {
    //             //         apsaraThumbId = "";
    //             //     }

    //             //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
    //             //         tempdatapict.push(data[i].apsaraThumbId);
    //             //         // tempdatapict.push(data[i].apsaraId);

    //             //     }
    //             //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
    //             //         tempdatapict.push(data[i].apsaraId);

    //             //     }
    //             //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
    //             //         tempdatapict.push(data[i].apsaraThumbId);

    //             //     }
    //             // }
    //             // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //             // let gettempresultpictapsara = resultpictapsara.ImageInfo;
    //             for (let i = 0; i < lengpict; i++) {
    //                 emailreceiver = data[i].email;
    //                 boosted = data[i].boosted;
    //                 boostCount = data[i].boostCount;
    //                 var checkpictketemu = false;
    //                 uploadSource = data[i].uploadSource;
    //                 var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
    //                 var dataUpsara = (data[i].apsaraId != undefined);

    //                 if (data[i].isApsara) {
    //                     for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
    //                         if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
    //                             data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                             if (!dataUpsaraThum) {
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                             }
    //                         }
    //                     }
    //                     for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
    //                         if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
    //                             data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
    //                             if (!dataUpsara) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 // emailreceiver = data[i].email;
    //                 // boosted = data[i].boosted;
    //                 // boostCount = data[i].boostCount;
    //                 // var checkpictketemu = false;
    //                 // uploadSource = data[i].uploadSource;
    //                 // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
    //                 // var dataUpsara = (data[i].apsaraId != undefined);

    //                 // if (data[i].isApsara) {
    //                 //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

    //                 //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
    //                 //             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                 //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             if (!dataUpsara) {
    //                 //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             // checkpictketemu = true;
    //                 //             data[i].media =
    //                 //             {
    //                 //                 "ImageInfo": [gettempresultpictapsara[j]]
    //                 //             }

    //                 //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                 //         }
    //                 //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
    //                 //             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                 //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             if (!dataUpsaraThum) {
    //                 //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             checkpictketemu = true;
    //                 //             data[i].media =
    //                 //             {
    //                 //                 "ImageInfo": [gettempresultpictapsara[j]]
    //                 //             }

    //                 //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

    //                 //         }
    //                 //     }
    //                 // } else {
    //                 //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
    //                 // }




    //                 if (boosted !== null || boosted.length > 0) {
    //                     console.log("boosted: " + data[i].postID);
    //                     this.postsService.updateBoostViewer(data[i].postID, email);
    //                     //pd.boostJangkauan = this.countBoosted(obj, email);
    //                     if (boosted.length > 0) {
    //                         if (boosted[0] != undefined) {
    //                             boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //                             boosted = boosted;
    //                             await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //                         } else {
    //                             boostCount = 0;
    //                             boosted = [];
    //                         }
    //                     } else {
    //                         boostCount = 0;
    //                         boosted = [];
    //                     }
    //                 } else {
    //                     boostCount = 0;
    //                     boosted = [];
    //                 }
    //                 //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

    //                 picts.push(data[i]);
    //             }

    //         } else {
    //             for (let i = 0; i < lengpict; i++) {
    //                 //ini buat produksion
    //                 // postType = data[i].postType;
    //                 // if (postType === "diary") {
    //                 //     data[i].saleAmount = 0;
    //                 // }
    //                 mediaType = data[i].mediaType;

    //                 if (data[i].isApsara == true) {
    //                     tempdatapict.push(data[i].apsaraId);
    //                 } else {
    //                     if (mediaType == "image" || mediaType == "images") {
    //                         data[i].mediaEndpoint = "/pict/" + data[i].postID;
    //                     } else {
    //                         data[i].mediaEndpoint = "/stream/" + data[i].postID;

    //                     }
    //                 }
    //             }

    //             if (mediaType == "image" || mediaType == "images") {
    //                 resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //                 gettempresultpictapsara = resultpictapsara.ImageInfo;

    //             } else {
    //                 resultpictapsara = await this.postContentService.getVideoApsara(tempdatapict);
    //                 gettempresultpictapsara = resultpictapsara.VideoList;
    //             }

    //             for (let i = 0; i < lengpict; i++) {
    //                 emailreceiver = data[i].email;
    //                 boostCount = data[i].boostCount;
    //                 boosted = data[i].boosted;
    //                 var checkpictketemu = false;
    //                 for (var j = 0; j < gettempresultpictapsara.length; j++) {
    //                     if (mediaType == "image" || mediaType == "images") {
    //                         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
    //                             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             if (!dataUpsara) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             // checkpictketemu = true;
    //                             data[i].media =
    //                             {
    //                                 "ImageInfo": [gettempresultpictapsara[j]]
    //                             }

    //                             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                         }
    //                         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
    //                             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             if (!dataUpsaraThum) {
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                             }
    //                             checkpictketemu = true;
    //                             data[i].media =
    //                             {
    //                                 "ImageInfo": [gettempresultpictapsara[j]]
    //                             }

    //                             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

    //                         }
    //                     } else {
    //                         if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
    //                             checkpictketemu = true;
    //                             data[i].media =
    //                             {
    //                                 "VideoList": [gettempresultpictapsara[j]]
    //                             }

    //                             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
    //                         }
    //                     }
    //                 }

    //                 if (checkpictketemu == false) {
    //                     data[i].apsaraId = "";
    //                     data[i].isApsara = false;
    //                     data[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 if (boosted !== null || boosted.length > 0) {
    //                     console.log("boosted: " + data[i].postID);
    //                     this.postsService.updateBoostViewer(data[i].postID, email);
    //                     //pd.boostJangkauan = this.countBoosted(obj, email);
    //                     if (boosted.length > 0) {
    //                         if (boosted[0] != undefined) {
    //                             boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //                             boosted = boosted;

    //                             await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //                         } else {
    //                             boostCount = 0;
    //                             boosted = [];
    //                         }
    //                     } else {
    //                         boostCount = 0;
    //                         boosted = [];
    //                     }
    //                 } else {
    //                     boostCount = 0;
    //                     boosted = [];
    //                 }
    //                 // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


    //                 picts.push(data[i]);
    //             }
    //         }
    //     } else {
    //         picts = [];
    //         version = "";
    //     }


    //     return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    // }

    async testSend(limit: number, postID: string, titlein: string, bodyin: string, type: string, emailuser: any[]) {
        var email = null;
        var datacount = null;
        var totalall = 0;

        if (type != undefined && type == "ALL") {
            try {
                datacount = await this.userbasicsService.getcount();
                totalall = datacount[0].totalpost / limit;
            } catch (e) {
                datacount = null;
                totalall = 0;
            }
            var totalpage = 0;
            var tpage2 = (totalall).toFixed(0);
            var tpage = (totalall % limit);
            if (tpage > 0 && tpage < 5) {
                totalpage = parseInt(tpage2) + 1;

            } else {
                totalpage = parseInt(tpage2);
            }

            console.log(totalpage);

            for (let x = 0; x < totalpage; x++) {
                var data = await this.userbasicsService.getuser(x, limit);
                for (var i = 0; i < data.length; i++) {
                    email = data[i].email;
                    console.log('data ke-' + i);
                    try {
                        console.log(i);
                        //await this.friendlistService.create(data[i]);

                        this.sendInteractiveFCM(email, postID, titlein, bodyin);
                    }
                    catch (e) {
                        //await this.friendlistService.update(data[i]._id, data[i]);
                    }
                }
            }
        }
        else if (type != undefined && type == "OPTION") {
            if (emailuser !== undefined && emailuser.length > 0) {


                for (var i = 0; i < emailuser.length; i++) {
                    email = emailuser[i];
                    console.log('data ke-' + i);
                    try {
                        console.log(i);
                        //await this.friendlistService.create(data[i]);

                        this.sendInteractiveFCM(email, postID, titlein, bodyin);
                    }
                    catch (e) {
                        //await this.friendlistService.update(data[i]._id, data[i]);
                    }
                }

            }
        }


    }

    // @Post('api/getusercontents/landingpage')
    // @UseGuards(JwtAuthGuard)
    // async contentlandingpage(@Req() request: Request, @Headers() headers): Promise<any> {
    //     var timestamps_start = await this.utilsService.getDateTimeString();
    //     var fullurl = request.get("Host") + request.originalUrl;
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;

    //     var skip = 0;
    //     var limit = 0;
    //     var type = null;
    //     var email = null;
    //     var data = null;
    //     var datasearch = null;
    //     var emailreceiver = null;


    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }
    //     limit = request_json["limit"];
    //     // if (request_json["limit"] !== undefined) {
    //     //     limit = request_json["limit"];
    //     // } else {
    //     //     throw new BadRequestException("Unabled to proceed");
    //     // }
    //     if (request_json["type"] !== undefined) {
    //         type = request_json["type"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }
    //     if (request_json["email"] !== undefined) {
    //         email = request_json["email"];
    //     } else {
    //         var timestamps_end = await this.utilsService.getDateTimeString();
    //         this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     var picts = [];
    //     var lengpict = null;


    //     try {
    //         // data = await this.postsService.landingpage(email, type, skip, limit);
    //         data = await this.postsService.landingpage5(email, type, skip, limit);
    //         lengpict = data.length;

    //     } catch (e) {
    //         data = null;
    //         lengpict = 0;

    //     }
    //     var tempapsaraId = [];
    //     var tempapsaraThumbId = [];
    //     var tempdatapict = [];

    //     var boosted = null;
    //     var boostCount = null;
    //     var version = null;
    //     var uploadSource = null;
    //     var apsaraId = null;
    //     var apsaraThumbId = null;
    //     var isApsara = null;
    //     var postType = null;
    //     // console.log(lengpict);
    //     if (lengpict > 0) {
    //         var resultpictapsara = null;
    //         version = data[0].version;
    //         var tempapsaraId_result = null;
    //         var tempapsaraThumbId_result = null;

    //         // console.log(tempdatapict);
    //         // if (type == "pict") {

    //         //     for (let i = 0; i < lengpict; i++) {

    //         //         uploadSource = data[i].uploadSource;
    //         //         isApsara = data[i].isApsara;
    //         //         try {
    //         //             apsaraId = data[i].apsaraId;
    //         //         } catch (e) {
    //         //             apsaraId = "";
    //         //         }
    //         //         try {
    //         //             apsaraThumbId = data[i].apsaraThumbId;
    //         //         } catch (e) {
    //         //             apsaraThumbId = "";
    //         //         }

    //         //         if (apsaraId !== undefined && apsaraThumbId !== undefined) {
    //         //             tempdatapict.push(data[i].apsaraId);

    //         //         }
    //         //         else if (apsaraId !== undefined && apsaraThumbId === undefined) {
    //         //             tempdatapict.push(data[i].apsaraId);

    //         //         }
    //         //         else if (apsaraId === undefined && apsaraThumbId !== undefined) {
    //         //             tempdatapict.push(data[i].apsaraThumbId);

    //         //         }
    //         //     }
    //         //     resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //         //     let gettempresultpictapsara = resultpictapsara.ImageInfo;
    //         //     for (let i = 0; i < lengpict; i++) {
    //         //         emailreceiver = data[i].email;
    //         //         boosted = data[i].boosted;
    //         //         boostCount = data[i].boostCount;
    //         //         var checkpictketemu = false;
    //         //         uploadSource = data[i].uploadSource;


    //         //         if (isApsara !== undefined && isApsara == false) {
    //         //             data[i].mediaThumbEndpoint = data[i].mediaEndpoint;

    //         //         } else {

    //         //             for (var j = 0; j < gettempresultpictapsara.length; j++) {

    //         //                 if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
    //         //                     // checkpictketemu = true;
    //         //                     data[i].media =
    //         //                     {
    //         //                         "ImageInfo": [gettempresultpictapsara[j]]
    //         //                     }

    //         //                     data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //         //                     data[i].mediaEndpoint = gettempresultpictapsara[j].URL;



    //         //                 }
    //         //                 else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
    //         //                     checkpictketemu = true;
    //         //                     data[i].media =
    //         //                     {
    //         //                         "ImageInfo": [gettempresultpictapsara[j]]
    //         //                     }

    //         //                     data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //         //                     data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

    //         //                 }
    //         //             }
    //         //         }




    //         //         if (boosted !== null || boosted.length > 0) {
    //         //             console.log("boosted: " + data[i].postID);
    //         //             this.postsService.updateBoostViewer(data[i].postID, email);
    //         //             //pd.boostJangkauan = this.countBoosted(obj, email);
    //         //             if (boosted.length > 0) {
    //         //                 if (boosted[0] != undefined) {
    //         //                     boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //         //                     boosted = boosted;
    //         //                     await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //         //                 } else {
    //         //                     boostCount = 0;
    //         //                     boosted = [];
    //         //                 }
    //         //             } else {
    //         //                 boostCount = 0;
    //         //                 boosted = [];
    //         //             }
    //         //         } else {
    //         //             boostCount = 0;
    //         //             boosted = [];
    //         //         }
    //         //         //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

    //         //         picts.push(data[i]);
    //         //     }

    //         // } 
    //         if (type == "pict") {
    //             for (let i = 0; i < lengpict; i++) {
    //                 uploadSource = data[i].uploadSource;
    //                 try {
    //                     apsaraId = data[i].apsaraId;
    //                 } catch (e) {
    //                     apsaraId = "";
    //                 }
    //                 try {
    //                     apsaraThumbId = data[i].apsaraThumbId;
    //                 } catch (e) {
    //                     apsaraThumbId = "";
    //                 }

    //                 if (apsaraId != "") {
    //                     tempapsaraId.push(data[i].apsaraId);
    //                 }

    //                 if (apsaraId != "") {
    //                     tempapsaraThumbId.push(data[i].apsaraThumbId);
    //                 }
    //             }
    //             console.log("");
    //             tempapsaraId_result = await this.postContentService.getImageApsara(tempapsaraId);
    //             tempapsaraThumbId_result = await this.postContentService.getImageApsara(tempapsaraThumbId);

    //             let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
    //             let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
    //             // for (let i = 0; i < lengpict; i++) {

    //             //     uploadSource = data[i].uploadSource;
    //             //     try {
    //             //         apsaraId = data[i].apsaraId;
    //             //     } catch (e) {
    //             //         apsaraId = "";
    //             //     }
    //             //     try {
    //             //         apsaraThumbId = data[i].apsaraThumbId;
    //             //     } catch (e) {
    //             //         apsaraThumbId = "";
    //             //     }

    //             //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
    //             //         tempdatapict.push(data[i].apsaraThumbId);
    //             //         // tempdatapict.push(data[i].apsaraId);

    //             //     }
    //             //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
    //             //         tempdatapict.push(data[i].apsaraId);

    //             //     }
    //             //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
    //             //         tempdatapict.push(data[i].apsaraThumbId);

    //             //     }
    //             // }
    //             // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
    //             // let gettempresultpictapsara = resultpictapsara.ImageInfo;
    //             for (let i = 0; i < lengpict; i++) {
    //                 emailreceiver = data[i].email;
    //                 boosted = data[i].boosted;
    //                 boostCount = data[i].boostCount;
    //                 var checkpictketemu = false;
    //                 uploadSource = data[i].uploadSource;
    //                 var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
    //                 var dataUpsara = (data[i].apsaraId != undefined);

    //                 if (data[i].isApsara) {
    //                     for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
    //                         if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
    //                             data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                             if (!dataUpsara) {
    //                                 data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                                 data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
    //                             }
    //                         }
    //                     }
    //                     // for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
    //                     //     if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
    //                     //         data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
    //                     //         if (!dataUpsara) {
    //                     //             data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
    //                     //         }
    //                     //     }
    //                     // }
    //                 } else {
    //                     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;

    //                 }
    //                 // emailreceiver = data[i].email;
    //                 // boosted = data[i].boosted;
    //                 // boostCount = data[i].boostCount;
    //                 // var checkpictketemu = false;
    //                 // uploadSource = data[i].uploadSource;
    //                 // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
    //                 // var dataUpsara = (data[i].apsaraId != undefined);

    //                 // if (data[i].isApsara) {
    //                 //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

    //                 //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
    //                 //             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                 //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             if (!dataUpsara) {
    //                 //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             // checkpictketemu = true;
    //                 //             data[i].media =
    //                 //             {
    //                 //                 "ImageInfo": [gettempresultpictapsara[j]]
    //                 //             }

    //                 //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



    //                 //         }
    //                 //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
    //                 //             if (data[i].apsaraThumbId == data[i].apsaraId) {
    //                 //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             if (!dataUpsaraThum) {
    //                 //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
    //                 //             }
    //                 //             checkpictketemu = true;
    //                 //             data[i].media =
    //                 //             {
    //                 //                 "ImageInfo": [gettempresultpictapsara[j]]
    //                 //             }

    //                 //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

    //                 //         }
    //                 //     }
    //                 // } else {
    //                 //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
    //                 // }




    //                 if (boosted !== null || boosted.length > 0) {
    //                     console.log("boosted: " + data[i].postID);
    //                     this.postsService.updateBoostViewer(data[i].postID, email);
    //                     //pd.boostJangkauan = this.countBoosted(obj, email);
    //                     if (boosted.length > 0) {
    //                         if (boosted[0] != undefined) {
    //                             boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //                             boosted = boosted;
    //                             await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //                         } else {
    //                             boostCount = 0;
    //                             boosted = [];
    //                         }
    //                     } else {
    //                         boostCount = 0;
    //                         boosted = [];
    //                     }
    //                 } else {
    //                     boostCount = 0;
    //                     boosted = [];
    //                 }
    //                 //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

    //                 picts.push(data[i]);
    //             }

    //         }
    //         else {
    //             for (let i = 0; i < lengpict; i++) {
    //                 //ini buat produksion
    //                 // postType = data[i].postType;
    //                 // if (postType === "diary") {
    //                 //     data[i].saleAmount = 0;
    //                 // }

    //                 if (data[i].isApsara == true) {
    //                     tempdatapict.push(data[i].apsaraId);
    //                 }
    //             }
    //             resultpictapsara = await this.postContentService.getVideoApsara(tempdatapict);
    //             let gettempresultpictapsara = resultpictapsara.VideoList;
    //             for (let i = 0; i < lengpict; i++) {
    //                 emailreceiver = data[i].email;
    //                 boostCount = data[i].boostCount;
    //                 boosted = data[i].boosted;
    //                 var checkpictketemu = false;
    //                 for (var j = 0; j < gettempresultpictapsara.length; j++) {
    //                     if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
    //                         checkpictketemu = true;
    //                         data[i].media =
    //                         {
    //                             "VideoList": [gettempresultpictapsara[j]]
    //                         }

    //                         data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
    //                     }
    //                 }

    //                 if (checkpictketemu == false) {
    //                     data[i].apsaraId = "";
    //                     data[i].isApsara = false;
    //                     data[i].media =
    //                     {
    //                         "VideoList": []
    //                     };
    //                 }
    //                 if (boosted !== null || boosted.length > 0) {
    //                     console.log("boosted: " + data[i].postID);
    //                     this.postsService.updateBoostViewer(data[i].postID, email);
    //                     //pd.boostJangkauan = this.countBoosted(obj, email);
    //                     if (boosted.length > 0) {
    //                         if (boosted[0] != undefined) {
    //                             boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
    //                             boosted = boosted;

    //                             await this.postsService.updateBoostCount(data[i].postID, boostCount + 1);
    //                         } else {
    //                             boostCount = 0;
    //                             boosted = [];
    //                         }
    //                     } else {
    //                         boostCount = 0;
    //                         boosted = [];
    //                     }
    //                 } else {
    //                     boostCount = 0;
    //                     boosted = [];
    //                 }
    //                 // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


    //                 picts.push(data[i]);
    //             }
    //         }
    //     } else {
    //         picts = [];
    //         version = "";
    //     }

    //     var timestamps_end = await this.utilsService.getDateTimeString();
    //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    //     return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    // }

    @Post('api/getusercontents/sendnotif')
    @UseGuards(JwtAuthGuard)
    async sendmasal(@Req() request: Request, @Headers() headers): Promise<any> {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var page = 0;
        var limit = 0;
        var title = null;
        var body = null;
        var emailuser = null;
        var data = null;
        var postID = null;
        var emailreceiver = null;
        var type = null;


        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["title"] !== undefined) {
            title = request_json["title"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["body"] !== undefined) {
            body = request_json["body"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        type = request_json["type"];
        emailuser = request_json["emailuser"];
        const messages = {
            "info": ["The process successful"],
        };

        this.testSend(200, postID, title, body, type, emailuser);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages };
    }

    // @UseGuards(JwtAuthGuard)
    // //@Get('api/getusercontents/musiccard')
    // @Get('api/musiccard/')
    // async getMusicCard(@Headers() headers) {
    //     const data = await this.getusercontentsService.getmusicCard();

    //     //CREATE ARRAY APSARA THUMNAIL
    //     let thumnail_data_artist: string[] = [];
    //     for (let i = 0; i < data[0].artistPopuler.length; i++) {
    //         let data_item = data[0].artistPopuler[i];
    //         if (data_item._id.apsaraThumnail != undefined && data_item._id.apsaraThumnail != "" && data_item._id.apsaraThumnail != null) {
    //             thumnail_data_artist.push(data_item._id.apsaraThumnail.toString());
    //         }
    //     }
    //     let thumnail_data_music: string[] = [];
    //     for (let i = 0; i < data[0].musicPopuler.length; i++) {
    //         let data_item = data[0].musicPopuler[i];
    //         if (data_item._id.apsaraThumnail != undefined && data_item._id.apsaraThumnail != "" && data_item._id.apsaraThumnail != null) {
    //             thumnail_data_music.push(data_item._id.apsaraThumnail.toString());
    //         }
    //     }

    //     //GET DATA APSARA THUMNAIL
    //     var dataApsaraThumnail_artist = await this.mediamusicService.getImageApsara(thumnail_data_artist);
    //     var dataApsaraThumnail_music = await this.mediamusicService.getImageApsara(thumnail_data_music);

    //     var data_artist = await Promise.all(data[0].artistPopuler.map(async (item, index) => {
    //         //APSARA THUMNAIL
    //         var apsaraThumnailUrl = null
    //         if (item._id.apsaraThumnail != undefined && item._id.apsaraThumnail != "" && item._id.apsaraThumnail != null) {
    //             apsaraThumnailUrl = dataApsaraThumnail_artist.ImageInfo.find(x => x.ImageId == item._id.apsaraThumnail).URL;
    //         }

    //         return {
    //             _id: {
    //                 artistName: item._id.artistName,
    //                 apsaraMusic: item._id.apsaraMusic,
    //                 apsaraThumnail: item._id.apsaraThumnail,
    //                 apsaraThumnailUrl: apsaraThumnailUrl
    //             }
    //         };
    //     }));

    //     var data_music = await Promise.all(data[0].musicPopuler.map(async (item, index) => {
    //         //APSARA THUMNAIL
    //         var apsaraThumnailUrl = null
    //         if (item._id.apsaraThumnail != undefined && item._id.apsaraThumnail != "" && item._id.apsaraThumnail != null) {
    //             apsaraThumnailUrl = dataApsaraThumnail_music.ImageInfo.find(x => x.ImageId == item._id.apsaraThumnail).URL;
    //         }

    //         return {
    //             _id: {
    //                 musicTitle: item._id.musicTitle,
    //                 apsaraMusic: item._id.apsaraMusic,
    //                 apsaraThumnail: item._id.apsaraThumnail,
    //                 apsaraThumnailUrl: apsaraThumnailUrl
    //             }
    //         };
    //     }));

    //     data[0].artistPopuler = data_artist;
    //     data[0].musicPopuler = data_music;


    //     var Response = {
    //         response_code: 202,
    //         data: data,
    //         messages: {
    //             info: [
    //                 "Retrieved music card succesfully"
    //             ]
    //         }
    //     }
    //     return Response;
    // }

    @UseGuards(JwtAuthGuard)
    //@Get('api/getusercontents/musiccard')
    @Get('api/musiccard/')
    async getMusicCard(@Headers() headers) {
        const data = await this.getusercontentsService.getmusicCard();

        //CREATE ARRAY APSARA THUMNAIL
        let thumnail_data_artist: string[] = [];
        for (let i = 0; i < data[0].artistPopuler.length; i++) {
            let data_item = data[0].artistPopuler[i];
            if (data_item._id.apsaraThumnail != undefined && data_item._id.apsaraThumnail != "" && data_item._id.apsaraThumnail != null) {
                thumnail_data_artist.push(data_item._id.apsaraThumnail.toString());
            }
        }
        let thumnail_data_music: string[] = [];
        for (let i = 0; i < data[0].musicPopuler.length; i++) {
            let data_item = data[0].musicPopuler[i];
            if (data_item._id.apsaraThumnail != undefined && data_item._id.apsaraThumnail != "" && data_item._id.apsaraThumnail != null) {
                thumnail_data_music.push(data_item._id.apsaraThumnail.toString());
            }
        }

        //GET DATA APSARA THUMNAIL
        var dataApsaraThumnail_artist = await this.mediamusicService.getImageApsara(thumnail_data_artist);
        var dataApsaraThumnail_music = await this.mediamusicService.getImageApsara(thumnail_data_music);

        var data_artist = await Promise.all(data[0].artistPopuler.map(async (item, index) => {
            //APSARA THUMNAIL
            var apsaraThumnailUrl = null
            if (item._id.apsaraThumnail != undefined && item._id.apsaraThumnail != "" && item._id.apsaraThumnail != null) {
                apsaraThumnailUrl = dataApsaraThumnail_artist.ImageInfo.find(x => x.ImageId == item._id.apsaraThumnail).URL;
            }

            return {
                _id: {
                    artistName: item._id.artistName,
                    apsaraMusic: item._id.apsaraMusic,
                    apsaraThumnail: item._id.apsaraThumnail,
                    apsaraThumnailUrl: apsaraThumnailUrl
                }
            };
        }));

        var data_music = await Promise.all(data[0].musicPopuler.map(async (item, index) => {
            //APSARA THUMNAIL
            var apsaraThumnailUrl = null
            if (item._id.apsaraThumnail != undefined && item._id.apsaraThumnail != "" && item._id.apsaraThumnail != null) {
                apsaraThumnailUrl = dataApsaraThumnail_music.ImageInfo.find(x => x.ImageId == item._id.apsaraThumnail).URL;
            }

            return {
                _id: {
                    musicTitle: item._id.musicTitle,
                    apsaraMusic: item._id.apsaraMusic,
                    apsaraThumnail: item._id.apsaraThumnail,
                    apsaraThumnailUrl: apsaraThumnailUrl
                }
            };
        }));

        data[0].artistPopuler = data_artist;
        data[0].musicPopuler = data_music;


        var Response = {
            response_code: 202,
            data: data,
            messages: {
                info: [
                    "Retrieved music card succesfully"
                ]
            }
        }
        return Response;
    }

}