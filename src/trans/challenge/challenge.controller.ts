import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFiles, Res, BadRequestException, HttpStatus } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Challenge } from './schemas/challenge.schema';
import { subChallengeService } from './subChallenge.service';
import { CreateSubChallengeDto } from './dto/create-subchallenge.dto';
import { subChallenge } from './schemas/subchallenge.schema';
import { OssService } from 'src/stream/oss/oss.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { BadgeService } from '../badge/badge.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import mongoose, { mongo } from 'mongoose';
import { UserchallengesService } from '../userchallenges/userchallenges.service';
import { Userchallenges } from '../userchallenges/schemas/userchallenges.schema';
import { CreateBadgeDto } from '../badge/dto/create-badge.dto';

@Controller('api/challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService,
    private readonly osservices: OssService,
    private readonly util: UtilsService,
    private readonly badge: BadgeService,
    private readonly subchallenge: subChallengeService,
    private readonly userchallengeSS: UserchallengesService,) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount:1 }, { name: 'popUpnotif', maxCount:1 }, { name: 'badge_profile_1', maxCount:1 }, { name: 'badge_general_1', maxCount:1 }, { name: 'badge_profile_2', maxCount:1 }, { name: 'badge_general_2', maxCount:1 }, { name: 'badge_profile_3', maxCount:1 }, { name: 'badge_general_3', maxCount:1 }, ]))
    async create(
      @UploadedFiles() files: { 
        bannerBoard?: Express.Multer.File[]
        bannerSearch?: Express.Multer.File[]
        popUpnotif?: Express.Multer.File[],
        badge_profile_1: Express.Multer.File[],      
        badge_general_1: Express.Multer.File[],      
        badge_profile_2: Express.Multer.File[],      
        badge_general_2: Express.Multer.File[],      
        badge_profile_3: Express.Multer.File[],      
        badge_general_3: Express.Multer.File[],      
      },
      @Req() request: Request,
      @Res() res,
    ) {
      var request_json = JSON.parse(JSON.stringify(request.body));
  
      if(files.bannerBoard == undefined)
      {
        throw new BadRequestException("Unabled to proceed. banner board image is required");
      }
  
      if(files.bannerSearch == undefined)
      {
        throw new BadRequestException("Unabled to proceed. banner search image is required");
      }
  
      if(files.popUpnotif == undefined)
      {
        throw new BadRequestException("Unabled to proceed. pop up notification image is required");
      }
  
      var mongoose = require('mongoose');
      var insertdata = new CreateChallengeDto();
      insertdata._id = new mongoose.Types.ObjectId();
      
      insertdata.nameChallenge = request_json['nameChallenge'];
      var importlib = require('mongoose');
      insertdata.jenisChallenge = importlib.Types.ObjectId(request_json['jenisChallenge']);
      insertdata.description = request_json['description'];
      insertdata.createdAt = await this.util.getDateTimeString();
      insertdata.updatedAt = await this.util.getDateTimeString();
      insertdata.startChallenge = request_json['startChallenge'];
      insertdata.endChallenge = request_json['endChallenge'];
      insertdata.durasi = Number(request_json['durasi']);
      insertdata.jenisDurasi = request_json['jenisDurasi'];
      insertdata.startTime = request_json['startTime'];
      var dummytime = await this.util.getDateTimeString();
      var convert = dummytime.split(" ")[0] + " " + request_json['startTime'];
      var convertagain = new Date(convert);
      convertagain.setHours(convertagain.getHours() + 7);
      convertagain.setSeconds(convertagain.getSeconds() - 1);
      var convertlagi = convertagain.toISOString().split("T")[1];
      insertdata.endTime = convertlagi.split(".")[0];
      insertdata.tampilStatusPengguna = request_json['tampilStatusPengguna'];
      insertdata.objectChallenge = request_json['objectChallenge'];
      insertdata.statusChallenge = request_json['statusChallenge'];
    
      var arraymetrik = [];
      let setmetrik = {};
      if(request_json['pilihanMetrik'] == 'akun')
      {
        var setreferal = null;
        var setikuti = null;
  
        if (request_json["akun_referal"] !== undefined) {
          setreferal = Number(request_json['akun_referal']);
        }
  
        if (request_json["akun_ikuti"] !== undefined) {
          setikuti = Number(request_json['akun_ikuti']);
        }
  
        if(setreferal == null && setikuti == null)
        {
          throw new BadRequestException("Unabled to proceed, referral score or following score is required");
        }
  
        setmetrik = {
          "Aktivitas": true,
          "Interaksi": false,
          "InteraksiKonten": [ ],
          "AktivitasAkun": [
              {
                "Referal": setreferal,
                "Ikuti": setikuti
              }
          ]
        }
      }
      else
      {
        if (request_json["konten_tagar"] == undefined) {
          request_json['konten_tagar'] = null;
        }
  
        if (request_json["konten_hyppevid_createpost"] == undefined && request_json["konten_hyppevid_createpost"] == null) {
          request_json['konten_hyppevid_createpost'] = 0;
        }
  
        if (request_json["konten_hyppepic_createpost"] == undefined && request_json["konten_hyppepic_createpost"] == null) {
          request_json['konten_hyppepic_createpost'] = 0;
        }
  
        if (request_json["konten_hyppediary_createpost"] == undefined && request_json["konten_hyppediary_createpost"] == null) {
          request_json['konten_hyppediary_createpost'] = 0;
        }
  
        if (request_json["konten_hyppevid_likepost"] == undefined && request_json["konten_hyppevid_likepost"] == null) {
          request_json['konten_hyppevid_likepost'] = 0;
        }
  
        if (request_json["konten_hyppepic_likepost"] == undefined && request_json["konten_hyppepic_likepost"] == null) {
          request_json['konten_hyppepic_likepost'] = 0;
        }
  
        if (request_json["konten_hyppediary_likepost"] == undefined && request_json["konten_hyppediary_likepost"] == null) {
          request_json['konten_hyppediary_likepost'] = 0;
        }
  
        if (request_json["konten_hyppevid_viewpost"] == undefined && request_json["konten_hyppevid_viewpost"] == null) {
          request_json['konten_hyppevid_viewpost'] = 0;
        }
  
        if (request_json["konten_hyppediary_viewpost"] == undefined && request_json["konten_hyppediary_viewpost"] == null) {
          request_json['konten_hyppediary_viewpost'] = 0;
        }

        var setinteraksikonten = {
          "tagar": request_json['konten_tagar'],
          "suka": [
            {
              "HyppeVid":Number(request_json['konten_hyppevid_likepost']),
              "HyppePic":Number(request_json['konten_hyppepic_likepost']),
              "HyppeDiary":Number(request_json['konten_hyppediary_likepost'])
            }
          ],
          "tonton": [
            {
              "HyppeVid":Number(request_json['konten_hyppevid_viewpost']),
              "HyppeDiary":Number(request_json['konten_hyppediary_viewpost'])
            }
          ],
        }

        if(insertdata.objectChallenge == 'KONTEN')
        {
          setinteraksikonten['buatKonten'] = [];
        }
        else
        {
          setinteraksikonten['buatKonten'] = [
            {
              "HyppeVid":Number(request_json['konten_hyppevid_createpost']),
              "HyppePic":Number(request_json['konten_hyppepic_createpost']),
              "HyppeDiary":Number(request_json['konten_hyppediary_createpost'])
            }
          ];
        }
        
        setmetrik = {
          "Aktivitas": false,
          "Interaksi": true,
          "AktivitasAkun": [ ],
          "InteraksiKonten": setinteraksikonten
        }
      }
  
      arraymetrik.push(setmetrik);
      insertdata.metrik = arraymetrik;
  
      var setpesertafield = {};
      var datatipeAkun = request_json['tipeAkun'];
      var konversitipeAkun = datatipeAkun.toString().split(",");
      
      if(konversitipeAkun.length == 2)
      {
        setpesertafield["tipeAkunTerverikasi"] = 'ALL';
      }
      else if(konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TERVERIFIKASI')
      {
        setpesertafield["tipeAkunTerverikasi"] = 'YES';
      }
      else if(konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TIDAKTERVERIFIKASI')
      {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }

      setpesertafield["caraGabung"] = request_json['caraGabung'].toUpperCase();
  
      var datajeniskelamin = request_json['jenis_kelamin'];
      var konversikelamin = datajeniskelamin.toString();
      konversikelamin.split(",");
      var tempkelamindata = null;
      var setjeniskelamin = {};
      var listkelamin = new Map();
      listkelamin.set('L' ,'LAKI-LAKI');
      listkelamin.set('P' ,'PEREMPUAN');
      listkelamin.set('O' ,'OTHER');

      for (let [key, value] of listkelamin) 
      {
          var searchkelamin = konversikelamin.includes(key);
          if(searchkelamin == true)
          {
            setjeniskelamin[value] = 'YES';
          }
          else
          {
            setjeniskelamin[value] = 'NO';
          }
      }
  
      setpesertafield["jenisKelamin"] = [setjeniskelamin];
  
      var datalokasi = request_json['lokasi'];
      var konversilokasi = datalokasi.toString().split(",");
      var templokasidata = null;
      var setlokasi = [];
      var mongoose = require('mongoose');
      for(var i = 0; i < konversilokasi.length; i++)
      {
        templokasidata = new mongoose.Types.ObjectId(konversilokasi[i].toString());
        setlokasi.push(templokasidata);
      }
  
      setpesertafield["lokasiPengguna"] = setlokasi;
  
      var dataumur = request_json['rentangumur'];
      var konversiumur = dataumur.toString();
      konversiumur.split(",");
      var listumur = ["<14","14-28","29-43","44<"];
      var setumur = {};
      var mongoose = require('mongoose');
      for(var i = 0; i < listumur.length; i++)
      {
        var searchumur = konversiumur.includes(listumur[i]);
        if(searchumur == true)
        {
          setumur[listumur[i]] = 'YES';
        }
        else
        {
          setumur[listumur[i]] = 'NO';
        }
      }
  
      setpesertafield['rentangUmur'] = [setumur];
  
      insertdata.peserta = [setpesertafield];
  
      var setleaderboard = {};
      setleaderboard['tampilBadge'] = request_json['leaderboard_tampilbadge_dileaderboard'];
      setleaderboard['Height'] = Number(request_json['leaderboard_Height']);
      setleaderboard['Weight'] = Number(request_json['leaderboard_Weight']);
      setleaderboard['maxSize'] = Number(request_json['leaderboard_maxSize']);
      setleaderboard['minSize'] = Number(request_json['leaderboard_minSize']);
      setleaderboard['warnaBackground'] = request_json['leaderboard_warnaBackground'];
      setleaderboard['formatFile'] = request_json['leaderboard_formatFile'];
      var ektensileaderboard = request_json['leaderboard_formatFile'];
      var insertbanner = files.bannerBoard[0];
      var path = "images/challenge/" + insertdata._id + "_bannerLeaderboard" + "." + ektensileaderboard;
      var result = await this.osservices.uploadFile(insertbanner, path);
      setleaderboard['bannerLeaderboard'] = result.url;
      // setleaderboard['bannerLeaderboard'] = path;
  
      insertdata.leaderBoard = [setleaderboard];
  
      var setketentuanhadiah = {};
      // if(request_json['ketentuanhadiah_tampilbadge'] == true)
      if(request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah_tampilbadge'] == true)
      {
        setketentuanhadiah['badgePemenang'] = true;
        setketentuanhadiah['Height'] = Number(request_json['ketentuanhadiah_Height']);
        setketentuanhadiah['Weight'] = Number(request_json['ketentuanhadiah_Weight']);
        setketentuanhadiah['maxSize'] = Number(request_json['ketentuanhadiah_maxSize']);
        setketentuanhadiah['minSize'] = Number(request_json['ketentuanhadiah_minSize']);
        setketentuanhadiah['formatFile'] = request_json['ketentuanhadiah_formatFile'];
        var listjuara = request_json['listbadge'];
        var konversilistjuara = listjuara.toString().split(",");
        var mongoose = require('mongoose');
        var setjuara = {};
        var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
        var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
        for(var i = 0; i < konversilistjuara.length; i++)
        {
          var tambahsatu = i + 1;
          var settype = 'juara' + tambahsatu.toString();
          var convertid = null;

          if(konversilistjuara[i].toString() == 'new')
          {
            var getbadgeprofile = listbadgeprofile[i];
            var getbadgegeneral = listbadgegeneral[i];

            var insertnewbadge = new CreateBadgeDto();
            insertnewbadge.name = insertdata.nameChallenge + "_" + settype;
            insertnewbadge.type = settype;
            
            var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
            var getbadgeid = resultbadge._id;
            convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
          }
          else
          {
            convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
          }
          setjuara[settype] = convertid;
        }
        setketentuanhadiah['badge'] = [setjuara];
      }
      else
      {
        setketentuanhadiah['badgePemenang'] = false;
        setketentuanhadiah['Height'] = null;
        setketentuanhadiah['Weight'] = null;
        setketentuanhadiah['maxSize'] = null;
        setketentuanhadiah['minSize'] = null;
        setketentuanhadiah['formatFile'] = null;
        setketentuanhadiah['badge'] = [];
      }
  
      insertdata.ketentuanHadiah = [setketentuanhadiah];
  
      var setbannersearch = {};
      setbannersearch['Height'] = Number(request_json['bannersearch_Height']);
      setbannersearch['Weight'] = Number(request_json['bannersearch_Weight']);
      setbannersearch['maxSize'] = Number(request_json['bannersearch_maxSize']);
      setbannersearch['minSize'] = Number(request_json['bannersearch_minSize']);
      setbannersearch['formatFile'] = request_json['bannersearch_formatFile'];
      var ektensisearch = request_json['bannersearch_formatFile'];
      var insertsearch = files.bannerSearch[0];
      var path = "images/challenge/" + insertdata._id + "_bannerSearch" + "." + ektensisearch;
      var result = await this.osservices.uploadFile(insertsearch, path);
      setbannersearch['image'] = result.url;
      // setbannersearch['image'] = path;
      
      insertdata.bannerSearch = [setbannersearch];
  
      var setpopup = {};
      setpopup['Height'] = Number(request_json['popup_Height']);
      setpopup['Weight'] = Number(request_json['popup_Weight']);
      setpopup['maxSize'] = Number(request_json['popup_maxSize']);
      setpopup['minSize'] = Number(request_json['popup_minSize']);
      setpopup['formatFile'] = request_json['popup_formatFile'];
      var ektensipopup = request_json['popup_formatFile'];
      var insertpopup = files.popUpnotif[0];
      var path = "images/challenge/" + insertdata._id + "_popup" + "." + ektensipopup;
      var result = await this.osservices.uploadFile(insertpopup, path);
      setpopup['image'] = result.url;
      // setpopup['image'] = path;
      
      insertdata.popUp = [setpopup];
  
      if(request_json['hadiah_set_hadiahpemenang'] == 'true' || request_json['hadiah_set_hadiahpemenang'] == true)
      {
        var sethadiah = {};
  
        sethadiah["currency"] = request_json['hadiah_currency'].toUpperCase();
        var getlistjuara = request_json['hadiah_juara'];
        var konversijuara = getlistjuara.toString().split(",");
        for(var i = 0; i < konversijuara.length; i++)
        {
          var temploop = i + 1;
          var stringnama = 'juara' + temploop.toString();
          sethadiah[stringnama] = Number(konversijuara[i]);
        }
  
        insertdata.hadiahPemenang = [sethadiah];
      }
      else
      {
        insertdata.hadiahPemenang = [];
      }
  
      var setnotifikasi = {};
      var listnotifikasipush = ['akanDatang', 'challengeDimulai', 'updateLeaderboard', 'challengeAkanBerakhir', 'untukPemenang'];
      var listvariable = ['include', 'title', 'description', 'unit', 'aturWaktu'];
      for(var i = 0; i < listnotifikasipush.length; i++)
      {
        var tempnotifikasi = {};
        var getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_include';
        if(request_json[getvarname] != undefined && request_json[getvarname] != null)
        {
          for(var j = 0; j < listvariable.length; j++)
          {
            getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
            tempnotifikasi[listvariable[j]] = request_json[getvarname];
          }
        }
        else
        {
          for(var j = 0; j < listvariable.length; j++)
          {
            if(listvariable[j] == 'include')
            {
              tempnotifikasi[listvariable[j]] = 'NO';
            }
            else
            {
              tempnotifikasi[listvariable[j]] = null;
            }
          }
        }
  
        setnotifikasi[listnotifikasipush[i]] = [
          tempnotifikasi
        ];
      }
  
      insertdata.notifikasiPush = [setnotifikasi];
  
      const messages = {
        "info": ["The process successful"],
      };
  
      const messagesEror = {
        "info": ["Todo is not found!"],
      };
  
      try
      {
        await this.challengeService.create(insertdata);

        var checkpartisipan = request_json['list_partisipan_challenge'];
        var checkjoinchallenge = request_json['caraGabung']; 
        if(checkjoinchallenge == 'DENGAN UNDANGAN' && checkpartisipan != null && checkpartisipan != undefined)
        {
          this.insertchildofchallenge(insertdata, request_json['list_partisipan_challenge']);
        }
        else
        {
          this.insertchildofchallenge(insertdata, null);
        }

        // console.log(JSON.stringify(listsubchallenge));
        
        return res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": insertdata,
            "message": messages
        });
      }
      catch(e)
      {
        return res.status(HttpStatus.BAD_REQUEST).json({
          "message": messagesEror
        });
      }
    }

    @UseGuards(JwtAuthGuard)
    @Post('listing')
    async findAll(@Req() request: Request) {
      var menuChallenge = null;
      var nameChallenge = null;
      var startdate = null;
      var enddate = null;
      var objectChallenge = null;
      var caraGabung = null;
      var statusChallenge = null;
      var ascending = null;
      var page = null;
      var limit = null;
  
      var request_json = JSON.parse(JSON.stringify(request.body));
  
      if (request_json["nameChallenge"] !== undefined) {
        nameChallenge = request_json["nameChallenge"];
      }

      if (request_json["menuChallenge"] !== undefined) {
        menuChallenge = request_json["menuChallenge"];
      }
  
      if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
      }
  
      if (request_json["objectChallenge"] !== undefined) {
        objectChallenge = request_json["objectChallenge"];
      }
  
      if (request_json["statusChallenge"] !== undefined) {
        statusChallenge = request_json["statusChallenge"];
      }
      
      if (request_json["caraGabung"] !== undefined) {
        caraGabung = request_json["caraGabung"];
      }
  
      if (request_json["ascending"] !== undefined) {
        ascending = request_json["ascending"];
      } else {
        throw new BadRequestException("Unabled to proceed, sort ascending field is required");
      }

      if (request_json["page"] !== undefined) {
        page = Number(request_json["page"]);
      } else {
          throw new BadRequestException("Unabled to proceed, page field is required");
      }
  
      if (request_json["limit"] !== undefined) {
          limit = Number(request_json["limit"]);
      } else {
          throw new BadRequestException("Unabled to proceed, limit field is required");
      }
  
      var data = await this.challengeService.findAll(nameChallenge, menuChallenge, startdate, enddate, objectChallenge, statusChallenge, caraGabung, ascending, page, limit);
      var totaldata = await this.challengeService.findAll(nameChallenge, menuChallenge, startdate, enddate, objectChallenge, statusChallenge, caraGabung, null, null, null);
      
      const messages = {
        "info": ["The process successful"],
      };
  
      return {
          response_code: 202,
          data:data,
          total:totaldata.length,
          messages: messages,
      };
    }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.challengeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('duplicate/:id')
  async duplikatdata(@Param('id') id: string) {
    var data = await this.challengeService.findOne(id);

    var mongoose = require('mongoose');
    var insertdata = new CreateChallengeDto();
    insertdata._id = new mongoose.Types.ObjectId();
    insertdata.nameChallenge = "copy_" + data.nameChallenge;
    insertdata.jenisChallenge = data.jenisChallenge;
    insertdata.description = data.description;
    insertdata.createdAt = await this.util.getDateTimeString();
    insertdata.updatedAt = await this.util.getDateTimeString();
    insertdata.durasi = data.durasi;
    insertdata.startChallenge = data.startChallenge;
    insertdata.endChallenge = data.endChallenge;
    insertdata.tampilStatusPengguna = data.tampilStatusPengguna;
    insertdata.objectChallenge = data.objectChallenge;
    insertdata.metrik = data.metrik;
    insertdata.peserta = data.peserta;
    insertdata.leaderBoard = data.leaderBoard;
    insertdata.ketentuanHadiah = data.ketentuanHadiah;
    insertdata.hadiahPemenang = data.hadiahPemenang;
    insertdata.bannerSearch = data.bannerSearch;
    insertdata.popUp = data.popUp;
    insertdata.notifikasiPush = data.notifikasiPush;
    insertdata.statusChallenge = 'DRAFT';

    await this.challengeService.create(insertdata);

    const messages = {
      "info": ["The process successful"],
    };

    return {
      response_code: 202,
      data:insertdata,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount:1 }, { name: 'popUpnotif', maxCount:1 }]))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { 
      bannerBoard?: Express.Multer.File[]
      bannerSearch?: Express.Multer.File[]
      popUpnotif?: Express.Multer.File[]      
    },
    @Req() request: Request,
    @Res() res,
  ) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var getdata = await this.challengeService.findOne(id);
    
    if(files.bannerBoard != undefined)
    {
      var getoldname = getdata["leaderBoard"][0]["bannerLeaderboard"];
      getoldname.split("/");
      var getoriginalname = getoldname.splice(-1);
      var insertbanner = files.bannerBoard[0];
      var path = "images/challenge/" + id + "_bannerLeaderboard" + "." + getdata["leaderBoard"][0]["formatFile"];
      // var path = "images/challenge/" + getoriginalname;
      var result = await this.osservices.uploadFile(insertbanner, path);
      // setleaderboard['bannerLeaderboard'] = result.url;
      getdata["leaderBoard"][0]["bannerLeaderboard"] = result.url; 
    }

    if(files.bannerSearch != undefined)
    {
      var getoldname = getdata["bannerSearch"][0]["image"].split("/");
      console.log(getoldname);
      var getoriginalname = getoldname.splice(-1);
      var insertbannersearch = files.bannerSearch[0];
      var path = "images/challenge/" + id + "_bannerSearch" + "." + getdata["bannerSearch"][0]["formatFile"];
      // var path = "images/challenge/" + getoriginalname;
      var result = await this.osservices.uploadFile(insertbannersearch, path);
      // setleaderboard['image'] = result.url;
      getdata["bannerSearch"][0]["image"] = result.url;
    }

    if(files.popUpnotif != undefined)
    {
      var getoldname = getdata["popUp"][0]["image"];
      getoldname.split("/");
      var getoriginalname = getoldname.splice(-1);
      var insertpopup = files.popUpnotif[0];
      var path = "images/challenge/" + id + "_popup" + "." + getdata["popUp"][0]["formatFile"];
      // var path = "images/challenge/" + getoriginalname;
      var result = await this.osservices.uploadFile(insertpopup, path);
      // setleaderboard['image'] = result.url;
      getdata["popUp"][0]["image"] = result.url;
    }

    if(request_json['description'] != undefined)
    {
      getdata["description"] = request_json['description'];
    }

    if(request_json['statusChallenge'] != undefined)
    {
      getdata["statusChallenge"] = request_json["statusChallenge"];
    }

    getdata['updatedAt'] = await this.util.getDateTimeString();

    const messages = {
      "info": ["The process successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try
    {
      // var resultdata = insertdata;
      await this.challengeService.update(id, getdata);
      
      return res.status(HttpStatus.OK).json({
          response_code: 202,
          "data": getdata,
          "message": messages
      });
    }
    catch(e)
    {
      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('subchallenge/disactivate/:id')
  async setnonactive(
    @Param('id') id: string,
  )
  {
    var setupdatedata = new CreateSubChallengeDto();
    setupdatedata.isActive = false;
  
    const messages = {
      "info": ["The process successful"],
    };

    await this.subchallenge.update(id, setupdatedata);

    return {
      response_code: 202,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing/bannerlandingpage')
  async listingbanner(
    @Req() request: Request
  )
  {
    var targetbanner = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    targetbanner = request_json['target'];

    const messages = {
      "info": ["The process successful"],
    };

    var data = await this.challengeService.findlistingBanner(targetbanner);

    return {
      response_code: 202,
      data:data,
      messages: messages,
    };
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengeService.remove(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async joinChallenge(@Res() res, @Req() request: Request) {
      
      var request_json = JSON.parse(JSON.stringify(request.body));
      var getsubid = request_json['idChallenge'];

      var getsubdata = await this.subchallenge.findbyid(getsubid);

      var listjoin = [];
      for(var i = 0; i < getsubdata.length; i++)
      {
        var getdatenow = await this.util.getDateTimeString();
        var convertnow = new Date(getdatenow);

        var getfromdb = new Date(getsubdata[i].endDatetime);

        var datediff = getfromdb.getTime() - convertnow.getTime();
        if(datediff >= 0)
        {
          var createdata = new Userchallenges();
          var mongo = require('mongoose');
          createdata._id = mongo.Types.ObjectId();
          createdata.idChallenge = new mongo.Types.ObjectId(request_json['idChallenge']);
          createdata.idUser = new mongo.Types.ObjectId(request_json['idUser']);
          createdata.idSubChallenge = new mongo.Types.ObjectId(getsubdata[i]._id);
          createdata.isActive = true;
          createdata.startDatetime = getsubdata[i].startDatetime;
          createdata.endDatetime = getsubdata[i].endDatetime;
          createdata.createdAt = await this.util.getDateTimeString();
          createdata.updatedAt = await this.util.getDateTimeString();
          createdata.activity = [];
          createdata.history = [];

          await this.userchallengeSS.create(createdata);
          listjoin.push(createdata);
        }
      }
      
      const messages = {
          "info": ["The create successful"],
      };

      const messagesEror = {
          "info": ["Todo is not found!"],
      };

      return res.status(HttpStatus.OK).json({
          response_code: 202,
          "data": listjoin,
          "message": messages
      });
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengeService.remove(id);
  // }

  async insertchildofchallenge(parentdata, partisipan)
  {
    var satuanhari = null;
    if(parentdata.jenisDurasi == 'WEEK')
    {
      satuanhari = parentdata.durasi * 7;
    }
    else
    {
      satuanhari = parentdata.durasi;
    }

    var listtanggal = []; 
    var getvalue = parentdata.startChallenge;
    var temptanggal = new Date(getvalue.split(" ")[0] + " " + parentdata.startTime);
    temptanggal.setHours(temptanggal.getHours() + 7);
    var getvalue = parentdata.endChallenge;
    var endtanggal = new Date(getvalue.split(" ")[0] + " " + parentdata.startTime);
    endtanggal.setHours(endtanggal.getHours() + 7);
    endtanggal.setSeconds(endtanggal.getSeconds() - 1);
    var datediff = endtanggal.getTime() - temptanggal.getTime();
    while(datediff >= 0)
    {
      var pecahdata = temptanggal.toISOString().split("T");
      var startdatetime = pecahdata[0] + " " + pecahdata[1].split(".")[0];
      
      //untuk endtime
      temptanggal.setDate(temptanggal.getDate() + satuanhari);
      temptanggal.setSeconds(temptanggal.getSeconds() - 1);
      
      var pecahdata = temptanggal.toISOString().split("T");
      var enddatetime = pecahdata[0] + " " + pecahdata[1].split(".")[0];

      //restore time
      temptanggal.setSeconds(temptanggal.getSeconds() + 1);
      temptanggal = new Date(temptanggal);
      
      datediff = endtanggal.getTime() - temptanggal.getTime();
      listtanggal.push([startdatetime, enddatetime]);
    }

    var challengeviainvite = false;
    if(partisipan != null && partisipan != undefined)
    {
      var getuserpartisipan = partisipan.toString().split(",");
      challengeviainvite = true;
    }

    var listsubchallenge = [];
    for(var i = 0; i < listtanggal.length; i++)
    {
      var insertsub = new CreateSubChallengeDto();
      var mongoose = require('mongoose');
      insertsub._id = new mongoose.Types.ObjectId();
      insertsub.startDatetime = listtanggal[i][0];
      insertsub.endDatetime = listtanggal[i][1];
      insertsub.isActive = true;
      insertsub.challengeId = parentdata._id;
      insertsub.session = i + 1;
      await this.subchallenge.create(insertsub); 

      // console.log(insertsub);
      // console.log(getuserpartisipan);

      var checkpartisipan = [];
      if(challengeviainvite == true)
      {
        for(var j = 0; j < getuserpartisipan.length; j++)
        {
            var insertuserchallenge = new Userchallenges();
            insertuserchallenge._id = new mongoose.Types.ObjectId();
            insertuserchallenge.idChallenge = new mongoose.Types.ObjectId(parentdata._id);
            insertuserchallenge.idUser = new mongoose.Types.ObjectId(getuserpartisipan[j]);
            insertuserchallenge.idSubChallenge = new mongoose.Types.ObjectId(insertsub._id);
            insertuserchallenge.startDatetime = insertsub.startDatetime;
            insertuserchallenge.endDatetime = insertsub.endDatetime;
            insertuserchallenge.isActive = true;
            insertuserchallenge.createdAt = await this.util.getDateTimeString();
            insertuserchallenge.updatedAt = await this.util.getDateTimeString();
            insertuserchallenge.activity = [];
            insertuserchallenge.history = [];

            await this.userchallengeSS.create(insertuserchallenge);

            checkpartisipan.push(insertuserchallenge);
        }
      }

      listsubchallenge.push([insertsub, checkpartisipan]);
    }

    // console.log(JSON.stringify(listsubchallenge));
  }
}