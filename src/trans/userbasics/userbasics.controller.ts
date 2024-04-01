import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Req, Request, Query, Headers, HttpCode, BadRequestException } from '@nestjs/common';
import { UserbasicsService } from './userbasics.service';
import { CreateUserbasicDto, mingrionRun } from './dto/create-userbasic.dto';
import { Userbasic } from './schemas/userbasic.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';
import { FriendListDto } from 'src/content/friend_list/dto/create-friend_list.dto';
import { FriendListService } from 'src/content/friend_list/friend_list.service';
import { LogapisService } from '../logapis/logapis.service';
import { LogMigrationsService } from '../logmigrations/logmigrations.service';
import { LogMigrations } from '../logmigrations/schema/logmigrations.schema';
import mongoose from 'mongoose';

@Controller('api/userbasics')
export class UserbasicsController {
  constructor(private readonly userbasicsService: UserbasicsService,
    private readonly friendlistService: FriendListService,
    private readonly logMigrationsService: LogMigrationsService,
    private readonly logapiSS: LogapisService) { }

  @Post()
  async create(@Body() CreateUserbasicDto: CreateUserbasicDto) {
    await this.userbasicsService.create(CreateUserbasicDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Userbasic[]> {
    return this.userbasicsService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Userbasic> {
  //   return this.userbasicsService.findOne(id);
  // }
  @UseGuards(JwtAuthGuard)
  @Get(':email')
  async findOne(@Res() res, @Param('email') email: string): Promise<Userbasic> {


    const messagesEror = {
      "info": ["Todo is not found!"],
    };


    const messages = {
      "info": ["The process successful"],
    };

    try {
      let data = await this.userbasicsService.findOne(email);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }

  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userbasicsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractiveyear')
  async countUserActiveGroupByMonth(
    @Body('year') year: number,
  ): Promise<Object> {
    return this.userbasicsService.UserActiveLastYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivebeforetoday')
  async countAllUserActiveDay(@Body('day') day: number): Promise<Object> {
    return this.userbasicsService.UserActiveDay(day);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('userage')
  async userage(): Promise<Object> {
    return this.userbasicsService.UserAge();
  }


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Res() res, @Param('id') id: string, @Body() createUserbasicDto: CreateUserbasicDto) {

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.userbasicsService.update(id, createUserbasicDto);
      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('v2/interest?')
  async getinterest(@Request() req, @Headers('x-auth-token') auth: string, @Res() res, @Query('langIso') langIso: string, @Query('pageNumber') pageNumber: number, @Query('pageRow') pageRow: number, @Query('search') search: string): Promise<Userbasic> {
    //console.log(auth);
    var reqdata = req.user;
    var email = reqdata.email;
    const messagesEror = {
      "info": ["Todo is not found!"],
    };


    const messages = {
      "info": ["Interests retrieved"],
    };

    var pgnumber = parseInt(pageNumber.toString());
    var pgrow = parseInt(pageRow.toString());
    try {
      let data = await this.userbasicsService.getinterest(email, langIso, pgnumber, pgrow, search);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "total": pgrow.toString(),
        "data": data,
        "message": messages,
        "page": pgnumber.toString()
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": e.toString()
      });
    }

  }

  //@UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('kyc/list')
  async getkyc(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('search') search: string,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Headers('x-auth-token') auth: string) {
    var startDate_ = null;
    var endDate_ = null;
    var search_ = "";
    var skip_ = null;
    var limit_ = null;
    if (startDate != undefined && startDate != "") {
      startDate_ = startDate;
    }
    if (endDate != undefined && endDate != "") {
      endDate_ = endDate;
    }
    if (search != undefined && search != "") {
      search_ = search;
    }
    if (skip != undefined) {
      skip_ = skip;
    }
    if (limit != undefined) {
      limit_ = limit;
    }
    var data = await this.userbasicsService.kycList(startDate_, endDate_, search_, skip_, limit_);
    var totalRow = (await this.userbasicsService.kycList(startDate_, endDate_, search_, null, null)).length;
    return {
      response_code: 202, data: data, totalRow: totalRow, skip: skip, limit: limit, messages: {}
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('newuser')
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
      datasesi = await this.userbasicsService.userNew(startdate, enddate);
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
  @Post('demografis')
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
    var lengwilayah = 0;
    var sumwilayah = 0;
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];

    try {
      data = await this.userbasicsService.demografis(startdate, enddate);
      wilayah = data[0].wilayah;
      lengwilayah = wilayah.length;
    } catch (e) {
      data = [];
      wilayah = [];
      lengwilayah = 0;
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

  @Post('insertfriendcollection')
  @UseGuards(JwtAuthGuard)
  async createNewFriendCollection(@Req() request: Request): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var page = null;
    var limit = null;
    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    this.test(page, limit);

    const messages = {
      "info": ["The process successful"],
    };

    return { response_code: 202, messages }
  }


  async test(page: number, limit: number) {

    var datacount = null;
    var totalall = 0;
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
      var data = await this.userbasicsService.getfriendListdata(x, limit);
      for (var i = 0; i < data.length; i++) {
        console.log('data ke-' + i);
        try {
          console.log(i);
          await this.friendlistService.create(data[i]);
        }
        catch (e) {
          await this.friendlistService.update(data[i]._id, data[i]);
        }
      }
    }




  }

  @Post('migration')
  async runMigrationDBNewUserBasic(@Body() mingrionRun_: mingrionRun){
    let LogMigrations_ = new LogMigrations();
    let _id = new mongoose.Types.ObjectId();
    LogMigrations_._id = _id;
    LogMigrations_.limit = mingrionRun_.limit;
    LogMigrations_.limitstop = mingrionRun_.limitstop;
    LogMigrations_.skip = mingrionRun_.skip;
    LogMigrations_.startAt = (await this.userbasicsService.getDate()).dateString;
    LogMigrations_.type = "USER";
    LogMigrations_.status = "RUNNING";
    this.logMigrationsService.create(LogMigrations_);
    this.userbasicsService.migrationRun(mingrionRun_, _id.toString());
    return { response_code: 202, messages: "Success" };
  }
}