import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { UserbasicnewService } from './userbasicnew.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userbasicnew } from './schemas/userbasicnew.schema';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/')
export class UserbasicnewController {
    constructor(
        private readonly UserbasicnewService: UserbasicnewService,
        private readonly logapiSS: LogapisService
    ) { }

    @Post('userauths/useractivebychart/v2')
    @UseGuards(JwtAuthGuard)
    async getUserActiveChartBasedDate(@Req() request: Request, @Headers() headers): Promise<any> {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/userauths/useractivebychart/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = null;
        var date = null;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["date"] !== undefined) {
            date = request_json["date"];
        } else {
            var setdate = new Date();
            var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        var tempdata = await this.UserbasicnewService.getUserActiveByDate(date);
        var getdata = [];
        try {
            getdata = tempdata[0].resultdata;
        }
        catch (e) {
            getdata = [];
        }

        var startdate = new Date(date);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var end = new Date().toISOString().split("T")[0];
        var array = [];

        //kalo lama, berarti error disini!!
        while (tempdate != end) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            //console.log(tempdate);

            let obj = getdata.find(objs => objs._id === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                obj =
                {
                    _id: tempdate,
                    totaldata: 0
                }
            }

            array.push(obj);
        }

        data =
        {
            data: array,
            total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
        }

        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages, data };
    }

    @Post('getuserprofiles/search/v2')
    //@FormDataRequest()
    @UseGuards(JwtAuthGuard)
    async finduser(@Req() request: Request, @Headers() headers): Promise<any> {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/getuserprofiles/search/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var username = null;
        var skip = 0;
        var limit = 0;
        var data = null;

        const messages = {
            "info": ["The process successful"],
        };

        if (request_json["username"] !== undefined) {
            username = request_json["username"];
        } else {
            var setdate = new Date();
            var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var setdate = new Date();
            var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var setdate = new Date();
            var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        data = await this.UserbasicnewService.regexfindUser(username, skip, limit);

        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
        return { response_code: 202, data, skip, limit, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('userbasics/newuser/v2')
    async countPostsesiactiv(@Req() request, @Headers() headers): Promise<Object> {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;

        var datasesi = [];

        var startdate = null;
        var enddate = null;
        const messages = {
            "info": ["The process successful"],
        };
        var request_json = JSON.parse(JSON.stringify(request.body));
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        var date1 = new Date(startdate);
        var date2 = new Date(enddate);

        //calculate time difference  
        var time_difference = date2.getTime() - date1.getTime();

        //calculate days difference by dividing total milliseconds in a day  
        var resultTime = time_difference / (1000 * 60 * 60 * 24);
        console.log(resultTime);
        try {
            datasesi = await this.UserbasicnewService.userNew(startdate, enddate);
        } catch (e) {
            datasesi = [];
        }

        var data = [];
        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var count = 0;
                for (var j = 0; j < datasesi.length; j++) {
                    if (datasesi[j].date == stdt) {
                        count = datasesi[j].count;
                        break;
                    }
                }
                data.push({
                    'date': stdt,
                    'count': count
                });

            }

        }

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('userbasics/demografis/v2')
    async countPostareas(@Req() request, @Headers() headers): Promise<any> {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;

        var data = [];

        var startdate = null;
        var enddate = null;
        var wilayah = [];
        var dataSumwilayah = [];
        var gender = [];
        var lengwilayah = 0;
        var sumwilayah = 0;
        const messages = {
            "info": ["The process successful"],
        };
        var request_json = JSON.parse(JSON.stringify(request.body));
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        try {
            data = await this.UserbasicnewService.demografis(startdate, enddate);
            wilayah = data[0].wilayah;
            lengwilayah = wilayah.length;
            gender = data[0].gender;
            var hasEmptyGender = gender.findIndex(x => x.gender == "");
            if (hasEmptyGender > -1) {
                var hasOtherGender = gender.findIndex(x => x.gender == "Other");
                if (hasOtherGender > -1) {
                    gender[hasOtherGender].count += gender[hasEmptyGender].count;
                    gender = gender.filter(x => x.gender != "");
                } else {
                    gender[hasEmptyGender].gender = "Other"
                }
                data[0].gender = gender;
            }
        } catch (e) {
            data = [];
            wilayah = [];
            lengwilayah = 0;
            gender = [];
        }


        if (lengwilayah > 0) {

            for (let i = 0; i < lengwilayah; i++) {
                sumwilayah += wilayah[i].count;

            }

        } else {
            sumwilayah = 0;
        }

        if (lengwilayah > 0) {

            for (let i = 0; i < lengwilayah; i++) {
                let count = wilayah[i].count;
                let state = null;
                let stateName = wilayah[i].stateName;

                if (stateName == null) {
                    state = "Other";
                } else {
                    state = stateName;
                }

                let persen = count * 100 / sumwilayah;
                let objcounwilayah = {
                    stateName: state,
                    count: count,
                    persen: persen.toFixed(2)
                }
                dataSumwilayah.push(objcounwilayah);
            }

        } else {
            dataSumwilayah = [];
        }

        data[0].wilayah = dataSumwilayah;

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('getguestprofiles')
    async profileguest(@Req() request: Request, @Headers() headers): Promise<any> {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/getguestprofiles';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var username = null;
        var gender = null;
        var startage = null;
        var endage = null;
        var jenis = null;
        var data = null;
        var page = null;
        var lokasi = null;
        var countrow = null;
        var startdate = null;
        var enddate = null;
        var startlogin = null;
        var endlogin = null;
        var limit = null;
        var datafilter = null;
        var totalfilter = 0;
        var descending = null;
        var os = null;
        var viewsgte = null;
        var viewslte = null;
        var likesgte = null;
        var likeslte = null;
        var sharesgte = null;
        var shareslte = null;
        const messages = {
            "info": ["The process was successful"],
        };

        startage = request_json["startage"];
        endage = request_json["endage"];
        username = request_json["username"];
        gender = request_json["gender"];
        jenis = request_json["jenis"];
        lokasi = request_json["lokasi"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        startlogin = request_json["startlogin"];
        endlogin = request_json["endlogin"];
        descending = request_json["descending"];
        os = request_json["os"];
        viewsgte = request_json["viewsgte"];
        viewslte = request_json["viewslte"];
        likesgte = request_json["likesgte"];
        likeslte = request_json["likeslte"];
        sharesgte = request_json["sharesgte"];
        shareslte = request_json["shareslte"];
        var allrow = 0;
        var totalallrow = 0;
        var totalrow = 0;
        var totalpage = 0;
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unable to proceed");
        }
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unable to proceed");
        }

        try {
            data = await this.UserbasicnewService.filterguest(username, lokasi, startdate, enddate, startlogin, endlogin, page, limit, descending, os, viewsgte, viewslte, likesgte, likeslte, sharesgte, shareslte);
            totalrow = data.length;
        } catch (e) {
            data = [];
            totalrow = 0;
        }

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, page, limit, totalrow, totalallrow, totalfilter, totalpage, messages };


    }

    @UseGuards(JwtAuthGuard)
    @Post('getuserhyppe/v2')
    async userhyppe3(
        @Headers() headers,
        @Req() req) {

        var date = new Date();
        var convert_timestamps_start = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = convert_timestamps_start.substring(0, convert_timestamps_start.lastIndexOf('.'));
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var request_json = JSON.parse(JSON.stringify(req.body));
        var startdate = request_json['startdate'];
        var enddate = request_json['enddate'];
        var skip = request_json['skip'];
        var limit = request_json['limit'];
        var search = request_json['search'];
        var jabatan = request_json['jabatan'];
        var divisi = request_json['divisi'];
        var groupId = request_json['groupId'];
        var ascending = request_json['ascending'];
        var status = request_json['status'];

        if (startdate == null || startdate == undefined || enddate == null || enddate == undefined) {
            startdate = null;
            enddate = null;
        }

        if (skip == null || skip == undefined) {
            var date = new Date();
            var convert_timestamps_start = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = convert_timestamps_start.substring(0, convert_timestamps_start.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed, skip field is required");
        }
        if (limit == null || limit == undefined) {
            var date = new Date();
            var convert_timestamps_start = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = convert_timestamps_start.substring(0, convert_timestamps_start.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed, limit field is required");
        }
        if (ascending == null || ascending == undefined) {
            var date = new Date();
            var convert_timestamps_start = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = convert_timestamps_start.substring(0, convert_timestamps_start.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed, ascending field is required");
        }

        var data = await this.UserbasicnewService.getUserHyppe3(search, startdate, enddate, jabatan, divisi, status, skip, limit, ascending);
        //var totalRow = (await this.getuserprofilesService.countUserHyppe(searchemail, search)).length;

        var date = new Date();
        var convert_timestamps_start = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = convert_timestamps_start.substring(0, convert_timestamps_start.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return {
            response_code: 202, data: data, skip: skip, limit: limit, messages: {
                "info": [
                    "successfully"
                ]
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('streamsharelist')
    async getStreamShareList(@Req() request: Request, @Headers() headers): Promise<any> {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/streamsharelist';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var username = null;
        var pageNumber = null;
        var pageRow = null;
        var data = [];
        var messages = {
            "info": ["The process was successful"],
        };

        if (request_json["username"] !== undefined) {
            username = request_json["username"];
        }

        if (request_json["pageNumber"] !== undefined) {
            pageNumber = request_json["pageNumber"];
        } else {
            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unable to proceed, pageNumber is undefined");
        }
        if (request_json["pageRow"] !== undefined) {
            pageRow = request_json["pageRow"];
        } else {
            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unable to proceed, pageRow is undefined");
        }

        try {
            data = await this.UserbasicnewService.getStreamShareList(username, email, (pageNumber * pageRow), pageRow);
        } catch (e) {
            messages.info = [e.message];
        }

        return {
            response_code: 202,
            data: data,
            messages
        }
    }

    @Post('transactions/historys/app')
    @UseGuards(JwtAuthGuard)
    async historyTransaksi(@Req() request, @Headers() headers)
    {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/transactions/historys';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var namaproduk = null;
        var tipetransaksi = null;
        var startdate = null;        
        var enddate = null;
        var skip = null;
        var limit = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if(request_json.startdate != null && request_json.startdate != undefined && request_json.enddate != null && request_json.enddate != undefined)
        {
            startdate = request_json.startdate;   
            enddate = request_json.enddate;   
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var setdate = new Date();
            var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        // if (request_json["limit"] !== undefined) {
        //     limit = request_json["limit"];
        // } else {
        //     var timestamps_end = await this.utilsService.getDateTimeString();
        //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, request_json);

        //     throw new BadRequestException("Unabled to proceed");
        // }

        var data = await this.UserbasicnewService.transaksiHistory2(email, namaproduk, startdate, enddate, tipetransaksi, true, skip);

        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return {
            response_code:202,
            data:data,
            messages:
            {
                "info": ["The process successful"],
            }
        }
    }

    @Post('transactions/historys/business')
    @UseGuards(JwtAuthGuard)
    async historyTransaksi2(@Req() request, @Headers() headers)
    {
        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/transactions/historys';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var namaproduk = null;
        var startdate = null;        
        var enddate = null;
        var tipetransaksi = null;
        var skip = null;
        var limit = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json.namaproduk != null && request_json.namaproduk != undefined)
        {
            namaproduk = request_json.namaproduk;   
        }

        if(request_json.startdate != null && request_json.startdate != undefined && request_json.enddate != null && request_json.enddate != undefined)
        {
            startdate = request_json.startdate;   
            enddate = request_json.enddate;   
        }

        if(request_json.type != null && request_json.type != undefined)
        {
            tipetransaksi = request_json.type;   
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            var setdate = new Date();
            var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        // if (request_json["limit"] !== undefined) {
        //     limit = request_json["limit"];
        // } else {
        //     var timestamps_end = await this.utilsService.getDateTimeString();
        //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, request_json);

        //     throw new BadRequestException("Unabled to proceed");
        // }

        var data = await this.UserbasicnewService.transaksiHistory2(email, namaproduk, startdate, enddate, tipetransaksi, false, skip);

        var setdate = new Date();
        var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return {
            response_code:202,
            data:data,
            messages:
            {
                "info": ["The process successful"],
            }
        }
    }
}
