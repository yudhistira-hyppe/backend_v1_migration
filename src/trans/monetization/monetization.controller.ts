import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Res, Logger, UploadedFile, UseInterceptors, BadRequestException, Header, NotAcceptableException, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express/multer';
import { MonetizationService } from './monetization.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';
import { Monetize } from './schemas/monetization.schema';
import { TemplatesRepoService } from 'src/infra/templates_repo/templates_repo.service';
import { PostContentService } from 'src/content/posts/postcontent.service';
import { OssContentPictService } from 'src/content/posts/osscontentpict.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { ErrorHandler } from 'src/utils/error.handler';
const sharp = require('sharp');

@Controller('api/monetization')
export class MonetizationController {
  constructor(
    private readonly monetizationService: MonetizationService,
    private readonly utilService: UtilsService,
    private readonly LogAPISS: LogapisService,
    private readonly repoSS: TemplatesRepoService,
    private readonly basic2SS: UserbasicnewService,
    private readonly postContentService: PostContentService,
    private readonly ossContentPictService: OssContentPictService,
    private readonly error: ErrorHandler
  ) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.monetizationService.detailOneV2(id);
  }

  @Get('/summary/:id')
  async detailfindOne(@Param('id') id: string) {
    return this.monetizationService.detailOne(id);
  }

  @Get()
  async index() {
    return this.monetizationService.find();
  }

  @Post("/create")
  @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('coinThumb'))
  // async create(@UploadedFile() file: Express.Multer.File, @Headers() headers, @Body() body) {
  @UseInterceptors(FileFieldsInterceptor([{ name: 'coinThumb', maxCount: 1 }, { name: 'giftThumb', maxCount: 1 }, { name: 'giftAnimation', maxCount: 1 }, { name: 'discThumb', maxCount: 1 }]))
  async create(@UploadedFiles() file: {
    coinThumb?: Express.Multer.File[]
    giftThumb?: Express.Multer.File[]
    giftAnimation?: Express.Multer.File[]
    discThumb?: Express.Multer.File[]
  }, @Headers() headers, @Body() body) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/create";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    let type = body.type;
    let toLog = body;
    if (file.coinThumb && file.coinThumb.length > 0) body.isUploadIcon = true;
    delete toLog['coinThumb'];
    let data;

    // if (type == 'COIN') {
    //   data = await this.monetizationService.createCoin(file.coinThumb[0], body);
    // }
    // else if (type == 'CREDIT') {
    //   data = await this.monetizationService.createCredit(headers, body);
    // }
    // else if (type == 'GIFT') {
    //   var uploadanimation = null;
    //   try
    //   {
    //     uploadanimation = file.giftAnimation[0]
    //   }
    //   catch(e)
    //   {
    //     uploadanimation = null;
    //   }

    //   data = await this.monetizationService.createGift(headers, file.giftThumb[0], uploadanimation, body);
    // }
    // else if(type == 'DISCOUNT')
    // {
    //   data = await this.monetizationService.createDiscount(headers, file.discThumb[0], body); 
    // }

    switch (type) {
      case 'COIN':
        data = await this.monetizationService.createCoin(body, file.coinThumb ? file.coinThumb[0] : undefined);
        break;
      case 'CREDIT':
        data = await this.monetizationService.createCredit(headers, body);
        break;
      case 'GIFT':
        var uploadanimation = null;
        try {
          uploadanimation = file.giftAnimation[0]
        } catch (e) {
          uploadanimation = null;
        }
        data = await this.monetizationService.createGift(headers, file.giftThumb[0], uploadanimation, body);
        break;
      case 'DISCOUNT':
        data = await this.monetizationService.createDiscount(headers, file.discThumb[0], body);
        break;
      default:
        throw new BadRequestException("type must be 'COIN', 'CREDIT', 'GIFT', or 'DISCOUNT'");
    }


    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, toLog);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/thumbnail")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('coinThumb'))
  async uploadthumbnail(@UploadedFile() file: Express.Multer.File, @Headers() headers, @Body() body) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/thumbnail";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    let toLog = body;
    delete toLog['coinThumb'];

    let image_information = await sharp(file.buffer).metadata();
    let extension = image_information.format;
    let path_file = "images/coin/default.jpg";

    let file_upload = await this.postContentService.generate_upload_noresize(file, extension);

    await this.ossContentPictService.uploadFileBuffer(file_upload, path_file);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, toLog);

    return {
      response_code: 202,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Get('/thumbnail/thumbnail')
  async defaultThumbURL(@Res() res) {
    var defaulturl = 'images/coin/default.jpg';

    var data2 = await this.ossContentPictService.readFile(defaulturl);
    res.set("Content-Type", "image/jpeg");
    res.send(data2);
  }

  @Post("/list")
  async listAllCoins(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilService.getDateTimeString();
    var url = headers.host + "/api/monetization/list";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    const types = ["COIN", "CREDIT", "GIFT", "DISCOUNT"];

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json.page == undefined || request_json.page == null) { throw new BadRequestException("Missing field page (number)"); }
    if (request_json.limit == undefined || request_json.limit == null) { throw new BadRequestException("Missing field: limit (number)"); }
    if (request_json.descending == undefined || request_json.descending == null) { throw new BadRequestException("Missing field: descending (boolean)"); }
    if (request_json.type == undefined || !request_json.type) { throw new BadRequestException("Missing field: type (string 'COIN'/'CREDIT'/'GIFT'/'DISCOUNT')"); }
    // if (request_json.type !== "COIN" && request_json.type !== "CREDIT" && request_json.type !== "GIFT" && request_json.type !== 'DISCOUNT') { throw new BadRequestException("type must be 'COIN' or 'CREDIT' or 'GIFT' or 'DISCOUNT'"); }
    if (types.indexOf(request_json.type) < 0) { throw new BadRequestException("type must be 'COIN', 'CREDIT', 'GIFT', or 'DISCOUNT'"); }
    let skip = (request_json.page >= 0 ? request_json.page : 0) * request_json.limit;
    var data = await this.monetizationService.listAllCoin(skip, request_json.limit, request_json.descending, request_json.type, request_json.name, request_json.from, request_json.to, request_json.stock_gte, request_json.stock_lte, request_json.status, request_json.audiens, request_json.tipegift, request_json.jenisProduk);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/deactivate")
  @UseGuards(JwtAuthGuard)
  async deactivate(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/deactivate";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));

    let data = this.monetizationService.deactivate(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/activate")
  @UseGuards(JwtAuthGuard)
  async activate(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/activate";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));
    let data = this.monetizationService.activate(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post('status/:id')
  @UseGuards(JwtAuthGuard)
  async changeStatus(@Param() id: string, @Req() req, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = req.get('Host') + req.originalUrl;
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(req.body));

    var data = await this.monetizationService.findOne(id);
    if (data != null) {
      var setupdatedata = new Monetize();
      setupdatedata.status = request_json.status;

      await this.monetizationService.updateOne(id, setupdatedata);

      let timestamps_end = await this.utilService.getDateTimeString();
      this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

      if (data.type == "CREDIT") {
        if (data.audiens == "EXCLUSIVE" && data.isSend == false) {
          this.sendNotifAudiens(data);
        }
      }

      return {
        response_code: 202,
        message: {
          "info": ["The process was successful"],
        }
      }
    }
    else {
      throw new NotAcceptableException("Data not found");
    }
  }

  @Post("/delete")
  @UseGuards(JwtAuthGuard)
  async delete(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/delete";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));

    let data = this.monetizationService.delete(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/listActive")
  @UseGuards(JwtAuthGuard)
  async listActive(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/listActive";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    const types = ["COIN", "GIFT"];
    const typesGift = ["CLASSIC", "DELUXE"];
    let skip = null;
    let limit = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json.page != undefined && request_json.page != null) { skip = (request_json.page >= 0 ? request_json.page : 0) * request_json.limit; }
    if (request_json.limit != undefined && request_json.limit != null) { limit = request_json.limit; }
    if (request_json.type == undefined || !request_json.type) { throw new BadRequestException("Missing field: type (string 'COIN'/'GIFT')"); }
    if (types.indexOf(request_json.type) < 0) { throw new BadRequestException("type must be 'COIN' or 'GIFT'"); }
    if (request_json.type == "GIFT" && (request_json.typeGift == undefined || !request_json.typeGift)) { throw new BadRequestException("Missing field: typeGift (string 'CLASSIC'/'DELUXE')"); }
    if (request_json.typeGift && typesGift.indexOf(request_json.typeGift) < 0) { throw new BadRequestException("typeGift must be 'CLASSIC' or 'DELUXE'"); }

    let data = await this.monetizationService.listActiveItems(skip, limit, request_json.type, request_json.typeGift);
    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/list/discount")
  @UseGuards(JwtAuthGuard)
  async listDiscountUser(@Req() request: Request, @Headers() headers) {
    var data = null;
    var timestamps_start = await this.utilService.getDateTimeString();
    var url = headers.host + "/api/monetization/list/discount";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var page = null;
    var limit = null;
    var productType = null;
    var transaction_amount = 0;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json.page != null && request_json.page != undefined) {
      page = parseInt(request_json.page);
    }

    if (request_json.limit != null && request_json.limit != undefined) {
      limit = parseInt(request_json.limit);
    }

    if (request_json.productType != null && request_json.productType != undefined) {
      productType = request_json.productType;
    }

    if (request_json.totalFee != null && request_json.totalFee != undefined) {
      transaction_amount = request_json.totalFee;
    }

    var getuserdata = await this.basic2SS.findBymail(email);

    data = await this.monetizationService.listDiscount(getuserdata._id.toString(), page, limit, productType, transaction_amount);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("usage-user/:id")
  @UseGuards(JwtAuthGuard)
  async listusageuser(@Param() id:string, @Req() request: Request, @Headers() headers) {
    var data = null;
    var timestamps_start = await this.utilService.getDateTimeString();
    var url = headers.host + "/api/monetization/"+ id +"/discount";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var page = null;
    var limit = null;
    var username = null;
    var transactionid = null;
    var startdate = null;
    var enddate = null;
    var status = null;
    var tipeKurs = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if(request_json.kurs_type == null || request_json.kurs_type == undefined)
    {
      await this.error.generateBadRequestException("kurs_type field must required");
    }
    else
    {
      tipeKurs = request_json.kurs_type;
    }

    if(request_json.page == null || request_json.page == undefined)
    {
      await this.error.generateBadRequestException("page field must required");
    }
    else
    {
      page = request_json.page;
    }

    if(request_json.limit == null || request_json.limit == undefined)
    {
      await this.error.generateBadRequestException("limit field must required");
    }
    else
    {
      limit = request_json.limit;
    }

    if(request_json.username != null && request_json.username != undefined)
    {
      username = request_json.username; 
    }

    if(request_json.transaction_name != null && request_json.transaction_name != undefined)
    {
      transactionid = request_json.transaction_name; 
    }

    if(request_json.startdate != null && request_json.startdate != undefined && request_json.enddate != null && request_json.enddate != undefined)
    {
      startdate = request_json.startdate; 
      enddate = request_json.enddate; 
    }

    if(request_json.using_discount != null && request_json.using_discount != undefined)
    {
      status = request_json.using_discount; 
    }

    var data = null;
    if(tipeKurs == "PUBLIC")
    {
      data = await this.monetizationService.discount_usage_general(id, username, transactionid, startdate, enddate, page, limit);
    }
    else if(tipeKurs == "SPECIAL")
    {
      data = await this.monetizationService.discount_usage_special(id, username, transactionid, startdate, enddate, page, limit);
    }
    else
    {
      await this.error.generateBadRequestException("kurs_type value not found");
    }

    var timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  async sendNotifAudiens(data: any) {

    var templatedata = await this.repoSS.findOne("65e932f8c87900009e001bc2");
    let userdata = data.audiens_user;
    var setpagination = parseInt(userdata.length) / 2;
    var ceksisa = (parseInt(userdata.length) % 2);
    if (ceksisa > 0 && ceksisa < 5) {
      setpagination = setpagination + 1;
    }

    for (var looppagination = 0; looppagination < setpagination; looppagination++) {
      var getalluserbasic = await this.basic2SS.findInbyid(userdata.slice((looppagination * 2), ((looppagination + 1) * 2)));

      for (var loopuser = 0; loopuser < getalluserbasic.length; loopuser++) {
        var titleEN = templatedata.subject.replace("$paket", data.name);
        var titleID = templatedata.subject_id.replace("$paket", data.name);
        var bodyEN = templatedata.body_detail.replace("$paket", data.name);
        var bodyID = templatedata.body_detail_id.replace("$paket", data.name);
        await this.utilService.sendFcmPushNotif(getalluserbasic[loopuser].email, titleID, bodyID, titleEN, bodyEN, templatedata.category.toString(), templatedata.type.toString(), "", data.redirectUrl);
      }
    }

    var updatedata = new Monetize();
    updatedata.isSend = true;
    updatedata.updatedAt = await this.utilService.getDateTimeString();
    await this.monetizationService.updateOne(data._id.toString(), updatedata);
  }
}
