import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFiles, Res, BadRequestException, HttpStatus, Headers, Head, NotAcceptableException } from '@nestjs/common';
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
import { UserbasicsService } from '../userbasics/userbasics.service';
import { notifChallenge } from './schemas/notifChallenge.schema';
import { notifChallengeService } from './notifChallenge.service';
import { UserbadgeService } from '../userbadge/userbadge.service';
import { Userbadge } from '../userbadge/schemas/userbadge.schema';
import { LanguagesService } from '../../infra/languages/languages.service';
import { session } from 'passport';
import { LogapisService } from '../logapis/logapis.service';
import { Postchallenge } from '../postchallenge/schemas/postchallenge.schema';
import { PostchallengeService } from '../postchallenge/postchallenge.service';
import { NotificationsService } from "src/content/notifications/notifications.service";
import { Settings2Service } from '../settings2/settings2.service';
import { NewpostsService } from 'src/content/newposts/newposts.service';
import { Newposts } from 'src/content/newposts/schemas/newposts.schema';
import { Long } from 'mongodb';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import { NewPost2Service } from 'src/content/new_post2/new_post2.service';
import { newPosts2 } from 'src/content/new_post2/schemas/newPost.schema';

@Controller('api/challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService,
    private readonly osservices: OssService,
    private readonly util: UtilsService,
    private readonly badge: BadgeService,
    private readonly subchallenge: subChallengeService,
    private readonly userchallengeSS: UserchallengesService,
    private readonly notifChallengeService: notifChallengeService,
    private readonly userbadgeService: UserbadgeService,
    private readonly logapiSS: LogapisService,
    private readonly languagesService: LanguagesService,
    private readonly postchallengeService: PostchallengeService,
    private readonly NotificationsService: NotificationsService,
    private readonly BadgeService: BadgeService,
    private readonly userbasicsSS: UserbasicsService,
    private readonly UserbasicnewService: UserbasicnewService,
    private readonly settings2SS: Settings2Service,
    private readonly postSS: NewpostsService,
    private readonly post2SS: NewPost2Service
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount: 1 }, { name: 'popUpnotif', maxCount: 1 }, { name: 'badge_profile_1', maxCount: 1 }, { name: 'badge_general_1', maxCount: 1 }, { name: 'badge_profile_2', maxCount: 1 }, { name: 'badge_general_2', maxCount: 1 }, { name: 'badge_profile_3', maxCount: 1 }, { name: 'badge_general_3', maxCount: 1 },]))
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
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge';
    var request_json = JSON.parse(JSON.stringify(request.body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    if (files.bannerBoard == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed. banner board image is required");
    }

    if (files.bannerSearch == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed. banner search image is required");
    }

    if (files.popUpnotif == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

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
    insertdata.jumlahSiklusdurasi = Number(request_json['jumlahSiklusdurasi']);
    var convertagain = new Date(request_json['startTime']);
    convertagain.setHours(convertagain.getHours() + 7);
    var convertdatastart = convertagain.toISOString().split("T")[1];
    insertdata.startTime = convertdatastart.split(".")[0];
    // convertagain.setSeconds(convertagain.getSeconds() - 1);
    // var convertlagi = convertagain.toISOString().split("T")[1];
    // insertdata.endTime = convertlagi.split(".")[0];
    insertdata.endTime = insertdata.startTime;
    insertdata.tampilStatusPengguna = request_json['tampilStatusPengguna'];
    insertdata.objectChallenge = request_json['objectChallenge'];

    if (request_json['statusChallenge'] == 'PUBLISH') {
      var getdata = await this.challengeService.findAll(null, request_json['jenisChallenge'], null, null, null, ["SEDANG BERJALAN", "AKAN DATANG"], null, true, null, null);
      if ((request_json['jenisChallenge'] == '647055de0435000059003462' && getdata.length >= 3) || (request_json['jenisChallenge'] == '64706cbfd3d174ff4989b167' && getdata.length >= 5)) {
        if (request_json['jenisChallenge'] == '647055de0435000059003462') {
          throw new NotAcceptableException("Challenge Utama yang sudah aktif telah memenuhi batas maksimal (Maksimal: 3 challenge aktif)")
        }
        else {
          throw new NotAcceptableException("Challenge Lainnya yang sudah aktif telah memenuhi batas maksimal (Maksimal: 5 challenge aktif)")
        }
      }
      else {
        insertdata.statusChallenge = request_json['statusChallenge'];
      }
    }
    else {
      insertdata.statusChallenge = request_json['statusChallenge'];
    }

    // insertdata.statusChallenge = request_json['statusChallenge'];

    // return res.status(HttpStatus.OK).json({
    //   response_code: 202,
    //   statuschallenge : insertdata.statusChallenge
    // });

    var arraymetrik = [];
    let setmetrik = {};
    if (request_json['pilihanMetrik'] == 'akun') {
      var setreferal = null;
      var setikuti = null;

      setreferal = (request_json["akun_referal"] == undefined && request_json["akun_referal"] == null ? 0 : Number(request_json['akun_referal']));
      setikuti = (request_json["akun_ikuti"] == undefined && request_json["akun_ikuti"] == null ? 0 : Number(request_json['akun_ikuti']));

      if (setreferal == 0 && setikuti == 0) {
        var timestamps_end = await this.util.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed, referral score or following score is required");
      }

      setmetrik = {
        "Aktivitas": true,
        "Interaksi": false,
        "InteraksiKonten": [],
        "AktivitasAkun": [
          {
            "Referal": setreferal,
            "Ikuti": setikuti
          }
        ]
      }
    }
    else {
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
        "suka": [
          {
            "HyppeVid": Number(request_json['konten_hyppevid_likepost']),
            "HyppePic": Number(request_json['konten_hyppepic_likepost']),
            "HyppeDiary": Number(request_json['konten_hyppediary_likepost'])
          }
        ],
        "tonton": [
          {
            "HyppeVid": Number(request_json['konten_hyppevid_viewpost']),
            "HyppeDiary": Number(request_json['konten_hyppediary_viewpost'])
          }
        ],
      }

      if (insertdata.objectChallenge == 'KONTEN') {
        setinteraksikonten['buatKonten'] = [];
      }
      else {
        setinteraksikonten['buatKonten'] = [
          {
            "HyppeVid": Number(request_json['konten_hyppevid_createpost']),
            "HyppePic": Number(request_json['konten_hyppepic_createpost']),
            "HyppeDiary": Number(request_json['konten_hyppediary_createpost'])
          }
        ];
      }

      if (request_json["konten_tagar"] != null && request_json["konten_tagar"] != undefined) {
        setinteraksikonten['tagar'] = request_json['konten_tagar'];
      }

      setmetrik = {
        "Aktivitas": false,
        "Interaksi": true,
        "AktivitasAkun": [],
        "InteraksiKonten": [setinteraksikonten]
      }
    }

    arraymetrik.push(setmetrik);
    insertdata.metrik = arraymetrik;

    var setpesertafield = {};
    setpesertafield["caraGabung"] = request_json['caraGabung'].toUpperCase();
    var cekgabung = setpesertafield["caraGabung"];
    var datatipeAkun = request_json['tipeAkun'];
    var konversitipeAkun = datatipeAkun.toString().split(",");

    if (cekgabung == "DENGAN UNDANGAN") {
      setpesertafield["tipeAkunTerverikasi"] = 'NO';
    }
    else {
      if (konversitipeAkun.length == 2) {
        setpesertafield["tipeAkunTerverikasi"] = 'ALL';
      }
      else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TERVERIFIKASI') {
        setpesertafield["tipeAkunTerverikasi"] = 'YES';
      }
      else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TIDAKTERVERIFIKASI') {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }
      else {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }
    }

    var datajeniskelamin = request_json['jenis_kelamin'];
    var konversikelamin = (cekgabung == "SEMUA PENGGUNA" ? datajeniskelamin.toString() : "");
    konversikelamin.split(",");
    var tempkelamindata = null;
    var setjeniskelamin = {};
    var listkelamin = new Map();
    listkelamin.set('L', 'LAKI-LAKI');
    listkelamin.set('P', 'PEREMPUAN');
    listkelamin.set('O', 'OTHER');

    for (let [key, value] of listkelamin) {
      var searchkelamin = konversikelamin.includes(key);
      if (searchkelamin == true) {
        setjeniskelamin[value] = 'YES';
      }
      else {
        setjeniskelamin[value] = 'NO';
      }
    }

    setpesertafield["jenisKelamin"] = [setjeniskelamin];

    var datalokasi = request_json['lokasi'];
    var konversilokasi = (cekgabung == "SEMUA PENGGUNA" ? ((datalokasi != '' && datalokasi != null && datalokasi != undefined) ? datalokasi.toString().split(",") : []) : []);
    var templokasidata = null;
    var setlokasi = [];
    if (konversilokasi.length != 0) {
      var mongoose = require('mongoose');
      for (var i = 0; i < konversilokasi.length; i++) {
        templokasidata = new mongoose.Types.ObjectId(konversilokasi[i].toString());
        setlokasi.push(templokasidata);
      }
    }

    setpesertafield["lokasiPengguna"] = setlokasi;

    var dataumur = request_json['rentangumur'];
    var konversiumur = (cekgabung == "SEMUA PENGGUNA" ? dataumur.toString() : "");
    konversiumur.split(",");
    var listumur = ["<14", "14-28", "29-43", "44<", "LAINNYA"];
    var setumur = {};
    var mongoose = require('mongoose');
    for (var i = 0; i < listumur.length; i++) {
      var searchumur = konversiumur.includes(listumur[i]);
      if (searchumur == true) {
        setumur[listumur[i]] = 'YES';
      }
      else {
        setumur[listumur[i]] = 'NO';
      }
    }

    setpesertafield['rentangUmur'] = [setumur];

    insertdata.peserta = [setpesertafield];

    var setleaderboard = {};
    if (request_json['leaderboard_tampilbadge_dileaderboard'] == 'true' || request_json['leaderboard_tampilbadge_dileaderboard'] == true) {
      setleaderboard['tampilBadge'] = true;
    }
    else {
      setleaderboard['tampilBadge'] = false;
    }

    setleaderboard['Height'] = (request_json["leaderboard_Height"] == undefined && request_json["leaderboard_Height"] == null ? 0 : Number(request_json['leaderboard_Height']));
    setleaderboard['Width'] = (request_json["leaderboard_Width"] == undefined && request_json["leaderboard_Width"] == null ? 0 : Number(request_json['leaderboard_Width']));
    setleaderboard['maxSize'] = (request_json["leaderboard_maxSize"] == undefined && request_json["leaderboard_maxSize"] == null ? 0 : Number(request_json['leaderboard_maxSize']));
    setleaderboard['minSize'] = (request_json["leaderboard_minSize"] == undefined && request_json["leaderboard_minSize"] == null ? 0 : Number(request_json['leaderboard_minSize']));
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
    if (request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah_tampilbadge'] == true) {
      setketentuanhadiah['badgePemenang'] = true;

      setketentuanhadiah['Height'] = (request_json["ketentuanhadiah_Height"] == undefined && request_json["ketentuanhadiah_Height"] == null ? 0 : Number(request_json['ketentuanhadiah_Height']));
      setketentuanhadiah['Width'] = (request_json["ketentuanhadiah_Width"] == undefined && request_json["ketentuanhadiah_Width"] == null ? 0 : Number(request_json['ketentuanhadiah_Width']));
      setketentuanhadiah['maxSize'] = (request_json["ketentuanhadiah_maxSize"] == undefined && request_json["ketentuanhadiah_maxSize"] == null ? 0 : Number(request_json['ketentuanhadiah_maxSize']));
      setketentuanhadiah['minSize'] = (request_json["ketentuanhadiah_minSize"] == undefined && request_json["ketentuanhadiah_minSize"] == null ? 0 : Number(request_json['ketentuanhadiah_minSize']));
      setketentuanhadiah['formatFile'] = request_json['ketentuanhadiah_formatFile'];
      var listjuara = request_json['listbadge'];
      if (listjuara == null || listjuara == undefined || listjuara == '') {
        var timestamps_end = await this.util.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("unable to proceed. badge list required");
      }
      var konversilistjuara = listjuara.toString().split(",");
      var mongoose = require('mongoose');
      var setjuara = {};
      var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
      var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
      for (var i = 0; i < konversilistjuara.length; i++) {
        var tambahsatu = i + 1;
        var settype = 'juara' + tambahsatu.toString();
        var convertid = null;

        if (konversilistjuara[i].toString() == 'new') {
          var getbadgeprofile = listbadgeprofile[i];
          var getbadgegeneral = listbadgegeneral[i];

          var insertnewbadge = new CreateBadgeDto();
          insertnewbadge.name = insertdata.nameChallenge + "_" + settype;
          insertnewbadge.type = settype;

          var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
          var getbadgeid = resultbadge._id;
          // var getbadgeid = insertnewbadge.name;
          convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
        }
        else {
          convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
        }
        setjuara[settype] = convertid;
      }
      setketentuanhadiah['badge'] = [setjuara];
    }
    else {
      setketentuanhadiah['badgePemenang'] = false;
      setketentuanhadiah['Height'] = null;
      setketentuanhadiah['Width'] = null;
      setketentuanhadiah['maxSize'] = null;
      setketentuanhadiah['minSize'] = null;
      setketentuanhadiah['formatFile'] = null;
      setketentuanhadiah['badge'] = [];
    }

    insertdata.ketentuanHadiah = [setketentuanhadiah];

    var setbannersearch = {};

    setbannersearch['Height'] = (request_json["bannersearch_Height"] == undefined && request_json["bannersearch_Height"] == null ? 0 : Number(request_json['bannersearch_Height']));
    setbannersearch['Width'] = (request_json["bannersearch_Width"] == undefined && request_json["bannersearch_Width"] == null ? 0 : Number(request_json['bannersearch_Width']));
    setbannersearch['maxSize'] = (request_json["bannersearch_maxSize"] == undefined && request_json["bannersearch_maxSize"] == null ? 0 : Number(request_json['bannersearch_maxSize']));
    setbannersearch['minSize'] = (request_json["bannersearch_minSize"] == undefined && request_json["bannersearch_minSize"] == null ? 0 : Number(request_json['bannersearch_minSize']));
    setbannersearch['formatFile'] = request_json['bannersearch_formatFile'];
    var ektensisearch = request_json['bannersearch_formatFile'];
    var insertsearch = files.bannerSearch[0];
    var path = "images/challenge/" + insertdata._id + "_bannerSearch" + "." + ektensisearch;
    var result = await this.osservices.uploadFile(insertsearch, path);
    setbannersearch['image'] = result.url;
    // setbannersearch['image'] = path;

    insertdata.bannerSearch = [setbannersearch];

    var setpopup = {};
    setpopup['Height'] = (request_json["popup_Height"] == undefined && request_json["popup_Height"] == null ? 0 : Number(request_json['popup_Height']));
    setpopup['Width'] = (request_json["popup_Width"] == undefined && request_json["popup_Width"] == null ? 0 : Number(request_json['popup_Width']));
    setpopup['maxSize'] = (request_json["popup_maxSize"] == undefined && request_json["popup_maxSize"] == null ? 0 : Number(request_json['popup_maxSize']));
    setpopup['minSize'] = (request_json["popup_minSize"] == undefined && request_json["popup_minSize"] == null ? 0 : Number(request_json['popup_minSize']));
    setpopup['formatFile'] = request_json['popup_formatFile'];
    var ektensipopup = request_json['popup_formatFile'];
    var insertpopup = files.popUpnotif[0];
    var path = "images/challenge/" + insertdata._id + "_popup" + "." + ektensipopup;
    var result = await this.osservices.uploadFile(insertpopup, path);
    setpopup['image'] = result.url;
    // setpopup['image'] = path;

    insertdata.popUp = [setpopup];

    if (request_json['hadiah_set_hadiahpemenang'] == 'true' || request_json['hadiah_set_hadiahpemenang'] == true) {
      var sethadiah = {};
      var settemphadiah = {};
      if (request_json['hadiah_jenispemenang'] == 'RANKING') {
        settemphadiah["currency"] = request_json['hadiah_currency'].toUpperCase();
        var getlistjuara = request_json['hadiah_juara'];
        var konversijuara = getlistjuara.toString().split(",");
        for (var i = 0; i < konversijuara.length; i++) {
          var temploop = i + 1;
          var stringnama = 'juara' + temploop.toString();
          settemphadiah[stringnama] = Number(konversijuara[i]);
        }

        sethadiah = {
          "typeHadiah": "RANKING",
          "ranking": [settemphadiah]
        };
      }
      else {
        settemphadiah['pointPrice'] = request_json['point_price'];
        settemphadiah['pointPriceMax'] = request_json['point_price_max'];

        sethadiah = {
          "typeHadiah": "POINT",
          "point": [settemphadiah]
        };
      }

      insertdata.hadiahPemenang = [sethadiah];
    }
    else {
      insertdata.hadiahPemenang = [];
    }

    var setnotifikasi = {};
    var listnotifikasipush = ['akanDatang', 'challengeDimulai', 'updateLeaderboard', 'challengeAkanBerakhir', 'challengeBerakhir', 'untukPemenang'];
    var listvariable = ['include', 'title', 'titleEN', 'description', 'descriptionEN', 'unit', 'aturWaktu'];
    for (var i = 0; i < listnotifikasipush.length; i++) {
      var tempnotifikasi = {};
      var getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_include';
      if (request_json[getvarname] != undefined && request_json[getvarname] != null && request_json[getvarname] == 'YES') {
        for (var j = 0; j < listvariable.length; j++) {
          getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
          if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
            var convertdata = request_json[getvarname].split(",");
            var inputdatatoarray = [];
            for (var k = 0; k < convertdata.length; k++) {
              inputdatatoarray.push(parseInt(convertdata[k]));
            }

            tempnotifikasi[listvariable[j]] = inputdatatoarray;
          }
          else if (listvariable[j] == 'aturWaktu') {
            if (listnotifikasipush[i] != 'challengeDimulai') {
              tempnotifikasi[listvariable[j]] = parseInt(request_json[getvarname]);
            }
          }
          else {
            tempnotifikasi[listvariable[j]] = request_json[getvarname];
          }
        }
      }
      else {
        for (var j = 0; j < listvariable.length; j++) {
          getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
          if (listvariable[j] == 'include') {
            tempnotifikasi[listvariable[j]] = 'NO';
          }
          else if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
            tempnotifikasi[listvariable[j]] = [];
          }
          else if (listvariable[j] == 'aturWaktu') {
            if (listnotifikasipush[i] != 'challengeDimulai') {
              tempnotifikasi[listvariable[j]] = 0;
            }
          }
          else {
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

    try {
      await this.challengeService.create(insertdata);

      var checkpartisipan = request_json['list_partisipan_challenge'];
      var checkjoinchallenge = request_json['caraGabung'];
      var checkstatusChallenge = request_json['statusChallenge'];
      if (checkstatusChallenge != 'NONACTIVE') {
        if (checkjoinchallenge == 'DENGAN UNDANGAN' && checkpartisipan != null && checkpartisipan != undefined) {
          this.insertchildofchallenge(insertdata, request_json['list_partisipan_challenge']);
        }
        else {
          this.insertchildofchallenge(insertdata, null);
        }
      }

      // console.log(JSON.stringify(listsubchallenge));

      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": insertdata,
        "message": messages
      });
    }
    catch (e) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('v2')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount: 1 }, { name: 'popUpnotif', maxCount: 1 }, { name: 'badge_profile_1', maxCount: 1 }, { name: 'badge_general_1', maxCount: 1 }, { name: 'badge_profile_2', maxCount: 1 }, { name: 'badge_general_2', maxCount: 1 }, { name: 'badge_profile_3', maxCount: 1 }, { name: 'badge_general_3', maxCount: 1 },]))
  async create2(
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
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/v2';
    var request_json = JSON.parse(JSON.stringify(request.body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    if (files.bannerBoard == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed. banner board image is required");
    }

    if (files.bannerSearch == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed. banner search image is required");
    }

    if (files.popUpnotif == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

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
    insertdata.jumlahSiklusdurasi = Number(request_json['jumlahSiklusdurasi']);
    var convertagain = new Date(request_json['startTime']);
    convertagain.setHours(convertagain.getHours() + 7);
    var convertdatastart = convertagain.toISOString().split("T")[1];
    insertdata.startTime = convertdatastart.split(".")[0];
    // convertagain.setSeconds(convertagain.getSeconds() - 1);
    // var convertlagi = convertagain.toISOString().split("T")[1];
    // insertdata.endTime = convertlagi.split(".")[0];
    insertdata.endTime = insertdata.startTime;
    insertdata.tampilStatusPengguna = request_json['tampilStatusPengguna'];
    insertdata.objectChallenge = request_json['objectChallenge'];

    if (request_json['statusChallenge'] == 'PUBLISH') {
      var getdata = await this.challengeService.findAll(null, request_json['jenisChallenge'], null, null, null, ["SEDANG BERJALAN", "AKAN DATANG"], null, true, null, null);
      if ((request_json['jenisChallenge'] == '647055de0435000059003462' && getdata.length >= 3) || (request_json['jenisChallenge'] == '64706cbfd3d174ff4989b167' && getdata.length >= 5)) {
        if (request_json['jenisChallenge'] == '647055de0435000059003462') {
          throw new NotAcceptableException("Challenge Utama yang sudah aktif telah memenuhi batas maksimal (Maksimal: 3 challenge aktif)")
        }
        else {
          throw new NotAcceptableException("Challenge Lainnya yang sudah aktif telah memenuhi batas maksimal (Maksimal: 5 challenge aktif)")
        }
      }
      else {
        insertdata.statusChallenge = request_json['statusChallenge'];
      }
    }
    else {
      insertdata.statusChallenge = request_json['statusChallenge'];
    }

    // insertdata.statusChallenge = request_json['statusChallenge'];

    // return res.status(HttpStatus.OK).json({
    //   response_code: 202,
    //   statuschallenge : insertdata.statusChallenge
    // });

    var arraymetrik = [];
    let setmetrik = {};
    if (request_json['pilihanMetrik'] == 'akun') {
      var setreferal = null;
      var setikuti = null;

      setreferal = (request_json["akun_referal"] == undefined && request_json["akun_referal"] == null ? 0 : Number(request_json['akun_referal']));
      setikuti = (request_json["akun_ikuti"] == undefined && request_json["akun_ikuti"] == null ? 0 : Number(request_json['akun_ikuti']));

      if (setreferal == 0 && setikuti == 0) {
        var timestamps_end = await this.util.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed, referral score or following score is required");
      }

      setmetrik = {
        "Aktivitas": true,
        "Interaksi": false,
        "InteraksiKonten": [],
        "AktivitasAkun": [
          {
            "Referal": setreferal,
            "Ikuti": setikuti
          }
        ]
      }
    }
    else {
      if (request_json["konten_hyppevid_createpost"] == undefined && request_json["konten_hyppevid_createpost"] == null) {
        request_json['konten_hyppevid_createpost'] = 0;
      }

      if (request_json["konten_hyppepic_createpost"] == undefined && request_json["konten_hyppepic_createpost"] == null) {
        request_json['konten_hyppepic_createpost'] = 0;
      }

      // if (request_json["konten_hyppediary_createpost"] == undefined && request_json["konten_hyppediary_createpost"] == null) {
      //   request_json['konten_hyppediary_createpost'] = 0;
      // }

      if (request_json["konten_hyppevid_likepost"] == undefined && request_json["konten_hyppevid_likepost"] == null) {
        request_json['konten_hyppevid_likepost'] = 0;
      }

      if (request_json["konten_hyppepic_likepost"] == undefined && request_json["konten_hyppepic_likepost"] == null) {
        request_json['konten_hyppepic_likepost'] = 0;
      }

      // if (request_json["konten_hyppediary_likepost"] == undefined && request_json["konten_hyppediary_likepost"] == null) {
      //   request_json['konten_hyppediary_likepost'] = 0;
      // }

      if (request_json["konten_hyppevid_viewpost"] == undefined && request_json["konten_hyppevid_viewpost"] == null) {
        request_json['konten_hyppevid_viewpost'] = 0;
      }

      // if (request_json["konten_hyppediary_viewpost"] == undefined && request_json["konten_hyppediary_viewpost"] == null) {
      //   request_json['konten_hyppediary_viewpost'] = 0;
      // }

      var setinteraksikonten = {
        "suka": [
          {
            "HyppeVid": Number(request_json['konten_hyppevid_likepost']),
            "HyppePic": Number(request_json['konten_hyppepic_likepost']),
            // "HyppeDiary": Number(request_json['konten_hyppediary_likepost'])
          }
        ],
        "tonton": [
          {
            "HyppeVid": Number(request_json['konten_hyppevid_viewpost']),
            // "HyppeDiary": Number(request_json['konten_hyppediary_viewpost'])
          }
        ],
      }

      if (insertdata.objectChallenge == 'KONTEN') {
        setinteraksikonten['buatKonten'] = [];
      }
      else {
        setinteraksikonten['buatKonten'] = [
          {
            "HyppeVid": Number(request_json['konten_hyppevid_createpost']),
            "HyppePic": Number(request_json['konten_hyppepic_createpost']),
            // "HyppeDiary": Number(request_json['konten_hyppediary_createpost'])
          }
        ];
      }

      if (request_json["konten_tagar"] != null && request_json["konten_tagar"] != undefined) {
        setinteraksikonten['tagar'] = request_json['konten_tagar'];
      }

      setmetrik = {
        "Aktivitas": false,
        "Interaksi": true,
        "AktivitasAkun": [],
        "InteraksiKonten": [setinteraksikonten]
      }
    }

    arraymetrik.push(setmetrik);
    insertdata.metrik = arraymetrik;

    var setpesertafield = {};
    setpesertafield["caraGabung"] = request_json['caraGabung'].toUpperCase();
    var cekgabung = setpesertafield["caraGabung"];
    var datatipeAkun = request_json['tipeAkun'];
    var konversitipeAkun = datatipeAkun.toString().split(",");

    if (cekgabung == "DENGAN UNDANGAN") {
      setpesertafield["tipeAkunTerverikasi"] = 'NO';
    }
    else {
      if (konversitipeAkun.length == 2) {
        setpesertafield["tipeAkunTerverikasi"] = 'ALL';
      }
      else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TERVERIFIKASI') {
        setpesertafield["tipeAkunTerverikasi"] = 'YES';
      }
      else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TIDAKTERVERIFIKASI') {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }
      else {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }
    }

    var datajeniskelamin = request_json['jenis_kelamin'];
    var konversikelamin = (cekgabung == "SEMUA PENGGUNA" ? datajeniskelamin.toString() : "");
    konversikelamin.split(",");
    var tempkelamindata = null;
    var setjeniskelamin = {};
    var listkelamin = new Map();
    listkelamin.set('L', 'LAKI-LAKI');
    listkelamin.set('P', 'PEREMPUAN');
    listkelamin.set('O', 'OTHER');

    for (let [key, value] of listkelamin) {
      var searchkelamin = konversikelamin.includes(key);
      if (searchkelamin == true) {
        setjeniskelamin[value] = 'YES';
      }
      else {
        setjeniskelamin[value] = 'NO';
      }
    }

    setpesertafield["jenisKelamin"] = [setjeniskelamin];

    var datalokasi = request_json['lokasi'];
    var konversilokasi = (cekgabung == "SEMUA PENGGUNA" ? ((datalokasi != '' && datalokasi != null && datalokasi != undefined) ? datalokasi.toString().split(",") : []) : []);
    var templokasidata = null;
    var setlokasi = [];
    if (konversilokasi.length != 0) {
      var mongoose = require('mongoose');
      for (var i = 0; i < konversilokasi.length; i++) {
        templokasidata = new mongoose.Types.ObjectId(konversilokasi[i].toString());
        setlokasi.push(templokasidata);
      }
    }

    setpesertafield["lokasiPengguna"] = setlokasi;

    var dataumur = request_json['rentangumur'];
    var konversiumur = (cekgabung == "SEMUA PENGGUNA" ? dataumur.toString() : "");
    konversiumur.split(",");
    var listumur = ["<14", "14-28", "29-43", "44<", "LAINNYA"];
    var setumur = {};
    var mongoose = require('mongoose');
    for (var i = 0; i < listumur.length; i++) {
      var searchumur = konversiumur.includes(listumur[i]);
      if (searchumur == true) {
        setumur[listumur[i]] = 'YES';
      }
      else {
        setumur[listumur[i]] = 'NO';
      }
    }

    setpesertafield['rentangUmur'] = [setumur];

    insertdata.peserta = [setpesertafield];

    var setleaderboard = {};
    if (request_json['leaderboard_tampilbadge_dileaderboard'] == 'true' || request_json['leaderboard_tampilbadge_dileaderboard'] == true) {
      setleaderboard['tampilBadge'] = true;
    }
    else {
      setleaderboard['tampilBadge'] = false;
    }

    setleaderboard['Height'] = (request_json["leaderboard_Height"] == undefined && request_json["leaderboard_Height"] == null ? 0 : Number(request_json['leaderboard_Height']));
    setleaderboard['Width'] = (request_json["leaderboard_Width"] == undefined && request_json["leaderboard_Width"] == null ? 0 : Number(request_json['leaderboard_Width']));
    setleaderboard['maxSize'] = (request_json["leaderboard_maxSize"] == undefined && request_json["leaderboard_maxSize"] == null ? 0 : Number(request_json['leaderboard_maxSize']));
    setleaderboard['minSize'] = (request_json["leaderboard_minSize"] == undefined && request_json["leaderboard_minSize"] == null ? 0 : Number(request_json['leaderboard_minSize']));
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
    if (request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah_tampilbadge'] == true) {
      setketentuanhadiah['badgePemenang'] = true;

      setketentuanhadiah['Height'] = (request_json["ketentuanhadiah_Height"] == undefined && request_json["ketentuanhadiah_Height"] == null ? 0 : Number(request_json['ketentuanhadiah_Height']));
      setketentuanhadiah['Width'] = (request_json["ketentuanhadiah_Width"] == undefined && request_json["ketentuanhadiah_Width"] == null ? 0 : Number(request_json['ketentuanhadiah_Width']));
      setketentuanhadiah['maxSize'] = (request_json["ketentuanhadiah_maxSize"] == undefined && request_json["ketentuanhadiah_maxSize"] == null ? 0 : Number(request_json['ketentuanhadiah_maxSize']));
      setketentuanhadiah['minSize'] = (request_json["ketentuanhadiah_minSize"] == undefined && request_json["ketentuanhadiah_minSize"] == null ? 0 : Number(request_json['ketentuanhadiah_minSize']));
      setketentuanhadiah['formatFile'] = request_json['ketentuanhadiah_formatFile'];
      var listjuara = request_json['listbadge'];
      if (listjuara == null || listjuara == undefined || listjuara == '') {
        var timestamps_end = await this.util.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("unable to proceed. badge list required");
      }
      var konversilistjuara = listjuara.toString().split(",");
      var mongoose = require('mongoose');
      var setjuara = {};
      var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
      var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
      for (var i = 0; i < konversilistjuara.length; i++) {
        var tambahsatu = i + 1;
        var settype = 'juara' + tambahsatu.toString();
        var convertid = null;

        if (konversilistjuara[i].toString() == 'new') {
          var getbadgeprofile = listbadgeprofile[i];
          var getbadgegeneral = listbadgegeneral[i];

          var insertnewbadge = new CreateBadgeDto();
          insertnewbadge.name = insertdata.nameChallenge + "_" + settype;
          insertnewbadge.type = settype;

          var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
          var getbadgeid = resultbadge._id;
          // var getbadgeid = insertnewbadge.name;
          convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
        }
        else {
          convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
        }
        setjuara[settype] = convertid;
      }
      setketentuanhadiah['badge'] = [setjuara];
    }
    else {
      setketentuanhadiah['badgePemenang'] = false;
      setketentuanhadiah['Height'] = null;
      setketentuanhadiah['Width'] = null;
      setketentuanhadiah['maxSize'] = null;
      setketentuanhadiah['minSize'] = null;
      setketentuanhadiah['formatFile'] = null;
      setketentuanhadiah['badge'] = [];
    }

    insertdata.ketentuanHadiah = [setketentuanhadiah];

    var setbannersearch = {};

    setbannersearch['Height'] = (request_json["bannersearch_Height"] == undefined && request_json["bannersearch_Height"] == null ? 0 : Number(request_json['bannersearch_Height']));
    setbannersearch['Width'] = (request_json["bannersearch_Width"] == undefined && request_json["bannersearch_Width"] == null ? 0 : Number(request_json['bannersearch_Width']));
    setbannersearch['maxSize'] = (request_json["bannersearch_maxSize"] == undefined && request_json["bannersearch_maxSize"] == null ? 0 : Number(request_json['bannersearch_maxSize']));
    setbannersearch['minSize'] = (request_json["bannersearch_minSize"] == undefined && request_json["bannersearch_minSize"] == null ? 0 : Number(request_json['bannersearch_minSize']));
    setbannersearch['formatFile'] = request_json['bannersearch_formatFile'];
    var ektensisearch = request_json['bannersearch_formatFile'];
    var insertsearch = files.bannerSearch[0];
    var path = "images/challenge/" + insertdata._id + "_bannerSearch" + "." + ektensisearch;
    var result = await this.osservices.uploadFile(insertsearch, path);
    setbannersearch['image'] = result.url;
    // setbannersearch['image'] = path;

    insertdata.bannerSearch = [setbannersearch];

    var setpopup = {};
    setpopup['Height'] = (request_json["popup_Height"] == undefined && request_json["popup_Height"] == null ? 0 : Number(request_json['popup_Height']));
    setpopup['Width'] = (request_json["popup_Width"] == undefined && request_json["popup_Width"] == null ? 0 : Number(request_json['popup_Width']));
    setpopup['maxSize'] = (request_json["popup_maxSize"] == undefined && request_json["popup_maxSize"] == null ? 0 : Number(request_json['popup_maxSize']));
    setpopup['minSize'] = (request_json["popup_minSize"] == undefined && request_json["popup_minSize"] == null ? 0 : Number(request_json['popup_minSize']));
    setpopup['formatFile'] = request_json['popup_formatFile'];
    var ektensipopup = request_json['popup_formatFile'];
    var insertpopup = files.popUpnotif[0];
    var path = "images/challenge/" + insertdata._id + "_popup" + "." + ektensipopup;
    var result = await this.osservices.uploadFile(insertpopup, path);
    setpopup['image'] = result.url;
    // setpopup['image'] = path;

    insertdata.popUp = [setpopup];

    if (request_json['hadiah_set_hadiahpemenang'] == 'true' || request_json['hadiah_set_hadiahpemenang'] == true) {
      var sethadiah = {};
      var settemphadiah = {};
      if (request_json['hadiah_jenispemenang'] == 'RANKING') {
        settemphadiah["currency"] = request_json['hadiah_currency'].toUpperCase();
        var getlistjuara = request_json['hadiah_juara'];
        var konversijuara = getlistjuara.toString().split(",");
        for (var i = 0; i < konversijuara.length; i++) {
          var temploop = i + 1;
          var stringnama = 'juara' + temploop.toString();
          settemphadiah[stringnama] = Number(konversijuara[i]);
        }

        sethadiah = {
          "typeHadiah": "RANKING",
          "ranking": [settemphadiah]
        };
      }
      else {
        settemphadiah['pointPrice'] = request_json['point_price'];
        settemphadiah['pointPriceMax'] = request_json['point_price_max'];

        sethadiah = {
          "typeHadiah": "POINT",
          "point": [settemphadiah]
        };
      }

      insertdata.hadiahPemenang = [sethadiah];
    }
    else {
      insertdata.hadiahPemenang = [];
    }

    var setnotifikasi = {};
    var listnotifikasipush = ['akanDatang', 'challengeDimulai', 'updateLeaderboard', 'challengeAkanBerakhir', 'challengeBerakhir', 'untukPemenang'];
    var listvariable = ['include', 'title', 'titleEN', 'description', 'descriptionEN', 'unit', 'aturWaktu'];
    for (var i = 0; i < listnotifikasipush.length; i++) {
      var tempnotifikasi = {};
      var getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_include';
      if (request_json[getvarname] != undefined && request_json[getvarname] != null && request_json[getvarname] == 'YES') {
        for (var j = 0; j < listvariable.length; j++) {
          getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
          if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
            var convertdata = request_json[getvarname].split(",");
            var inputdatatoarray = [];
            for (var k = 0; k < convertdata.length; k++) {
              inputdatatoarray.push(parseInt(convertdata[k]));
            }

            tempnotifikasi[listvariable[j]] = inputdatatoarray;
          }
          else if (listvariable[j] == 'aturWaktu') {
            if (listnotifikasipush[i] != 'challengeDimulai') {
              tempnotifikasi[listvariable[j]] = parseInt(request_json[getvarname]);
            }
          }
          else {
            tempnotifikasi[listvariable[j]] = request_json[getvarname];
          }
        }
      }
      else {
        for (var j = 0; j < listvariable.length; j++) {
          getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
          if (listvariable[j] == 'include') {
            tempnotifikasi[listvariable[j]] = 'NO';
          }
          else if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
            tempnotifikasi[listvariable[j]] = [];
          }
          else if (listvariable[j] == 'aturWaktu') {
            if (listnotifikasipush[i] != 'challengeDimulai') {
              tempnotifikasi[listvariable[j]] = 0;
            }
          }
          else {
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

    try {
      await this.challengeService.create(insertdata);

      var checkpartisipan = request_json['list_partisipan_challenge'];
      var checkjoinchallenge = request_json['caraGabung'];
      var checkstatusChallenge = request_json['statusChallenge'];
      if (checkstatusChallenge != 'NONACTIVE') {
        if (checkjoinchallenge == 'DENGAN UNDANGAN' && checkpartisipan != null && checkpartisipan != undefined) {
          this.insertchildofchallenge2(insertdata, request_json['list_partisipan_challenge']);
        }
        else {
          this.insertchildofchallenge2(insertdata, null);
        }
      }

      // console.log(JSON.stringify(listsubchallenge));

      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": insertdata,
        "message": messages
      });
    }
    catch (e) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing')
  async findAll(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/list';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

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
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, sort ascending field is required");
    }

    if (request_json["page"] !== undefined) {
      page = Number(request_json["page"]);
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["limit"] !== undefined) {
      limit = Number(request_json["limit"]);
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    var data = await this.challengeService.findAll(nameChallenge, menuChallenge, startdate, enddate, objectChallenge, statusChallenge, caraGabung, ascending, page, limit);
    var totaldata = await this.challengeService.findAll(nameChallenge, menuChallenge, startdate, enddate, objectChallenge, statusChallenge, caraGabung, null, null, null);

    this.checknonactivechallenge();

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      total: totaldata.length,
      messages: messages,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/' + id;
    var email = null;
    try {
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      email = auth.email;
    }
    catch (e) {
      //kosong aja
    }

    var data = await this.challengeService.detailchallenge(id);
    var getmetrik = data.metrik[0].InteraksiKonten[0];
    data.metrik[0].InteraksiKonten[0] = {
      "suka": [
          {
              "HyppeVid": getmetrik.suka[0].HyppeVid,
              "HyppePic": getmetrik.suka[0].HyppePic,
          }
      ],
      "tonton": [
          {
              "HyppeVid": getmetrik.tonton[0].HyppeVid,
              "HyppePic": getmetrik.tonton[0].HyppePic,
          }
      ],
      "buatKonten": [
          {
            "HyppeVid": getmetrik.buatKonten[0].HyppeVid,
            "HyppePic": getmetrik.buatKonten[0].HyppePic,
          }
      ]
  };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return data;
    // return this.challengeService.detailchallenge(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('duplicate/:id')
  async duplikatdata(@Param('id') id: string, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/duplicate/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

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
    insertdata.jumlahSiklusdurasi = data.jumlahSiklusdurasi;
    // insertdata.startTime = data.startTime;
    // insertdata.endTime = data.endTime;
    // insertdata.startChallenge = data.startChallenge;
    // insertdata.endChallenge = data.endChallenge;
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

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
      response_code: 202,
      data: insertdata,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount: 1 }, { name: 'popUpnotif', maxCount: 1 }, { name: 'badge_profile_1', maxCount: 1 }, { name: 'badge_general_1', maxCount: 1 }, { name: 'badge_profile_2', maxCount: 1 }, { name: 'badge_general_2', maxCount: 1 }, { name: 'badge_profile_3', maxCount: 1 }, { name: 'badge_general_3', maxCount: 1 },]))
  async update(
    @Param('id') id: string,
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
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/update/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));
    var getdata = await this.challengeService.findOne(id);

    if (request_json['statusChallenge'] == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, status challenge field is required");
    }

    if (request_json['statusChallenge'] == 'PUBLISH') {
      var setjenischallenge = null;
      if (request_json['jenisChallenge'] == null) {
        setjenischallenge = getdata["jenisChallenge"].toString();
      }
      else {
        setjenischallenge = request_json['jenisChallenge'];
      }
    }

    if (getdata["statusChallenge"] == 'DRAFT') {

      if (request_json['statusChallenge'] == 'PUBLISH') {
        var cekdata = await this.challengeService.findAll(null, setjenischallenge, null, null, null, ["SEDANG BERJALAN", "AKAN DATANG"], null, true, null, null);
        if ((request_json['jenisChallenge'] == '647055de0435000059003462' && cekdata.length >= 3) || (request_json['jenisChallenge'] == '64706cbfd3d174ff4989b167' && cekdata.length >= 5)) {
          if (request_json['jenisChallenge'] == '647055de0435000059003462') {
            throw new NotAcceptableException("Challenge Utama yang sudah aktif telah memenuhi batas maksimal (Maksimal: 3 challenge aktif)")
          }
          else {
            throw new NotAcceptableException("Challenge Lainnya yang sudah aktif telah memenuhi batas maksimal (Maksimal: 5 challenge aktif)")
          }
        }
      }

      // var insertdata = new CreateChallengeDto();
      var insertdata = getdata;
      // var mongo = require('mongoose');
      // insertdata._id = new mongo.Types.ObjectId(id);

      insertdata.nameChallenge = request_json['nameChallenge'];
      var importlib = require('mongoose');
      insertdata.jenisChallenge = importlib.Types.ObjectId(request_json['jenisChallenge']);
      insertdata.description = request_json['description'];
      insertdata.updatedAt = await this.util.getDateTimeString();
      insertdata.startChallenge = request_json['startChallenge'];
      insertdata.endChallenge = request_json['endChallenge'];
      insertdata.durasi = Number(request_json['durasi']);
      insertdata.jumlahSiklusdurasi = Number(request_json['jumlahSiklusdurasi']);
      var convertagain = new Date(request_json['startTime']);
      convertagain.setHours(convertagain.getHours() + 7);
      var convertdatastart = convertagain.toISOString().split("T")[1];
      insertdata.startTime = convertdatastart.split(".")[0];
      // convertagain.setSeconds(convertagain.getSeconds() - 1);
      // var convertlagi = convertagain.toISOString().split("T")[1];
      insertdata.endTime = insertdata.startTime;
      insertdata.tampilStatusPengguna = request_json['tampilStatusPengguna'];
      insertdata.objectChallenge = request_json['objectChallenge'];
      insertdata.statusChallenge = request_json['statusChallenge'];

      var arraymetrik = [];
      let setmetrik = {};
      if (request_json['pilihanMetrik'] == 'akun') {
        var setreferal = null;
        var setikuti = null;

        setreferal = (request_json["akun_referal"] == undefined && request_json["akun_referal"] == null ? 0 : Number(request_json['akun_referal']));
        setikuti = (request_json["akun_ikuti"] == undefined && request_json["akun_ikuti"] == null ? 0 : Number(request_json['akun_ikuti']));

        if (setreferal == 0 && setikuti == 0) {
          var timestamps_end = await this.util.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

          throw new BadRequestException("Unabled to proceed, referral score or following score is required");
        }

        setmetrik = {
          "Aktivitas": true,
          "Interaksi": false,
          "InteraksiKonten": [],
          "AktivitasAkun": [
            {
              "Referal": setreferal,
              "Ikuti": setikuti
            }
          ]
        }
      }
      else {
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
          "suka": [
            {
              "HyppeVid": Number(request_json['konten_hyppevid_likepost']),
              "HyppePic": Number(request_json['konten_hyppepic_likepost']),
              "HyppeDiary": Number(request_json['konten_hyppediary_likepost'])
            }
          ],
          "tonton": [
            {
              "HyppeVid": Number(request_json['konten_hyppevid_viewpost']),
              "HyppeDiary": Number(request_json['konten_hyppediary_viewpost'])
            }
          ],
        }

        if (insertdata.objectChallenge == 'KONTEN') {
          setinteraksikonten['buatKonten'] = [];
        }
        else {
          setinteraksikonten['buatKonten'] = [
            {
              "HyppeVid": Number(request_json['konten_hyppevid_createpost']),
              "HyppePic": Number(request_json['konten_hyppepic_createpost']),
              "HyppeDiary": Number(request_json['konten_hyppediary_createpost'])
            }
          ];
        }

        if (request_json["konten_tagar"] != null && request_json["konten_tagar"] != undefined) {
          setinteraksikonten['tagar'] = request_json['konten_tagar'];
        }

        setmetrik = {
          "Aktivitas": false,
          "Interaksi": true,
          "AktivitasAkun": [],
          "InteraksiKonten": [setinteraksikonten]
        }
      }

      arraymetrik.push(setmetrik);
      insertdata.metrik = arraymetrik;

      var setpesertafield = {};
      setpesertafield["caraGabung"] = request_json['caraGabung'].toUpperCase();
      var cekgabung = setpesertafield["caraGabung"];
      var datatipeAkun = request_json['tipeAkun'];
      var konversitipeAkun = datatipeAkun.toString().split(",");

      if (cekgabung == "DENGAN UNDANGAN") {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }
      else {
        if (konversitipeAkun.length == 2) {
          setpesertafield["tipeAkunTerverikasi"] = 'ALL';
        }
        else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TERVERIFIKASI') {
          setpesertafield["tipeAkunTerverikasi"] = 'YES';
        }
        else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TIDAKTERVERIFIKASI') {
          setpesertafield["tipeAkunTerverikasi"] = 'NO';
        }
        else {
          setpesertafield["tipeAkunTerverikasi"] = 'NO';
        }
      }

      var datajeniskelamin = request_json['jenis_kelamin'];
      var konversikelamin = (cekgabung == "SEMUA PENGGUNA" ? datajeniskelamin.toString() : "");
      konversikelamin.split(",");
      var tempkelamindata = null;
      var setjeniskelamin = {};
      var listkelamin = new Map();
      listkelamin.set('L', 'LAKI-LAKI');
      listkelamin.set('P', 'PEREMPUAN');
      listkelamin.set('O', 'OTHER');

      for (let [key, value] of listkelamin) {
        var searchkelamin = konversikelamin.includes(key);
        if (searchkelamin == true) {
          setjeniskelamin[value] = 'YES';
        }
        else {
          setjeniskelamin[value] = 'NO';
        }
      }

      setpesertafield["jenisKelamin"] = [setjeniskelamin];

      var datalokasi = request_json['lokasi'];
      var konversilokasi = (cekgabung == "SEMUA PENGGUNA" ? ((datalokasi != '' && datalokasi != null && datalokasi != undefined) ? datalokasi.toString().split(",") : []) : []);
      var templokasidata = null;
      var setlokasi = [];
      if (konversilokasi.length != 0) {
        var mongoose = require('mongoose');
        for (var i = 0; i < konversilokasi.length; i++) {
          templokasidata = new mongoose.Types.ObjectId(konversilokasi[i].toString());
          setlokasi.push(templokasidata);
        }
      }

      setpesertafield["lokasiPengguna"] = setlokasi;

      var dataumur = request_json['rentangumur'];
      var konversiumur = (cekgabung == "SEMUA PENGGUNA" ? dataumur.toString() : "");
      konversiumur.split(",");
      var listumur = ["<14", "14-28", "29-43", "44<", "LAINNYA"];
      var setumur = {};
      var mongoose = require('mongoose');
      for (var i = 0; i < listumur.length; i++) {
        var searchumur = konversiumur.includes(listumur[i]);
        if (searchumur == true) {
          setumur[listumur[i]] = 'YES';
        }
        else {
          setumur[listumur[i]] = 'NO';
        }
      }

      setpesertafield['rentangUmur'] = [setumur];

      insertdata.peserta = [setpesertafield];

      var setleaderboard = {};
      if (request_json['leaderboard_tampilbadge_dileaderboard'] == 'true' || request_json['leaderboard_tampilbadge_dileaderboard'] == true) {
        setleaderboard['tampilBadge'] = true;
      }
      else {
        setleaderboard['tampilBadge'] = false;
      }

      setleaderboard['Height'] = (request_json["leaderboard_Height"] == undefined && request_json["leaderboard_Height"] == null ? 0 : Number(request_json['leaderboard_Height']));
      setleaderboard['Width'] = (request_json["leaderboard_Width"] == undefined && request_json["leaderboard_Width"] == null ? 0 : Number(request_json['leaderboard_Width']));
      setleaderboard['maxSize'] = (request_json["leaderboard_maxSize"] == undefined && request_json["leaderboard_maxSize"] == null ? 0 : Number(request_json['leaderboard_maxSize']));
      setleaderboard['minSize'] = (request_json["leaderboard_minSize"] == undefined && request_json["leaderboard_minSize"] == null ? 0 : Number(request_json['leaderboard_minSize']));
      setleaderboard['warnaBackground'] = request_json['leaderboard_warnaBackground'];
      setleaderboard['formatFile'] = request_json['leaderboard_formatFile'];

      if (files.bannerBoard != undefined) {
        var ektensileaderboard = request_json['leaderboard_formatFile'];
        var insertbanner = files.bannerBoard[0];
        var path = "images/challenge/" + insertdata._id + "_bannerLeaderboard" + "." + ektensileaderboard;
        var result = await this.osservices.uploadFile(insertbanner, path);
        setleaderboard['bannerLeaderboard'] = result.url;
        // setleaderboard['bannerLeaderboard'] = path;
      }
      else {
        setleaderboard['bannerLeaderboard'] = getdata["leaderBoard"][0]["bannerLeaderboard"];
      }

      insertdata.leaderBoard = [setleaderboard];

      var setketentuanhadiah = {};
      // if(request_json['ketentuanhadiah_tampilbadge'] == true)
      if (request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah_tampilbadge'] == true) {
        setketentuanhadiah['badgePemenang'] = true;

        setketentuanhadiah['Height'] = (request_json["ketentuanhadiah_Height"] == undefined && request_json["ketentuanhadiah_Height"] == null ? 0 : Number(request_json['ketentuanhadiah_Height']));
        setketentuanhadiah['Width'] = (request_json["ketentuanhadiah_Width"] == undefined && request_json["ketentuanhadiah_Width"] == null ? 0 : Number(request_json['ketentuanhadiah_Width']));
        setketentuanhadiah['maxSize'] = (request_json["ketentuanhadiah_maxSize"] == undefined && request_json["ketentuanhadiah_maxSize"] == null ? 0 : Number(request_json['ketentuanhadiah_maxSize']));
        setketentuanhadiah['minSize'] = (request_json["ketentuanhadiah_minSize"] == undefined && request_json["ketentuanhadiah_minSize"] == null ? 0 : Number(request_json['ketentuanhadiah_minSize']));
        setketentuanhadiah['formatFile'] = request_json['ketentuanhadiah_formatFile'];
        var listjuara = request_json['listbadge'];
        if (listjuara == null || listjuara == undefined || listjuara == '') {
          var timestamps_end = await this.util.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

          throw new BadRequestException("unable to proceed. badge list required");
        }
        var konversilistjuara = listjuara.toString().split(",");
        var mongoose = require('mongoose');
        var setjuara = {};
        var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
        var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
        for (var i = 0; i < konversilistjuara.length; i++) {
          var tambahsatu = i + 1;
          var settype = 'juara' + tambahsatu.toString();
          var convertid = null;

          if (konversilistjuara[i].toString() == 'new') {
            var getbadgeprofile = listbadgeprofile[i];
            var getbadgegeneral = listbadgegeneral[i];

            var insertnewbadge = new CreateBadgeDto();
            insertnewbadge.name = insertdata.nameChallenge + "_" + settype;
            insertnewbadge.type = settype;

            var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
            var getbadgeid = resultbadge._id;
            // var getbadgeid = insertnewbadge.name;
            convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
          }
          else {
            convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
          }
          setjuara[settype] = convertid;
        }
        setketentuanhadiah['badge'] = [setjuara];
      }
      else {
        setketentuanhadiah['badgePemenang'] = false;
        setketentuanhadiah['Height'] = null;
        setketentuanhadiah['Width'] = null;
        setketentuanhadiah['maxSize'] = null;
        setketentuanhadiah['minSize'] = null;
        setketentuanhadiah['formatFile'] = null;
        setketentuanhadiah['badge'] = [];
      }

      insertdata.ketentuanHadiah = [setketentuanhadiah];

      var setbannersearch = {};

      setbannersearch['Height'] = (request_json["bannersearch_Height"] == undefined && request_json["bannersearch_Height"] == null ? 0 : Number(request_json['bannersearch_Height']));
      setbannersearch['Width'] = (request_json["bannersearch_Width"] == undefined && request_json["bannersearch_Width"] == null ? 0 : Number(request_json['bannersearch_Width']));
      setbannersearch['maxSize'] = (request_json["bannersearch_maxSize"] == undefined && request_json["bannersearch_maxSize"] == null ? 0 : Number(request_json['bannersearch_maxSize']));
      setbannersearch['minSize'] = (request_json["bannersearch_minSize"] == undefined && request_json["bannersearch_minSize"] == null ? 0 : Number(request_json['bannersearch_minSize']));
      setbannersearch['formatFile'] = request_json['bannersearch_formatFile'];
      var ektensisearch = request_json['bannersearch_formatFile'];

      if (files.bannerSearch != undefined) {
        var insertsearch = files.bannerSearch[0];
        var path = "images/challenge/" + insertdata._id + "_bannerSearch" + "." + ektensisearch;
        var result = await this.osservices.uploadFile(insertsearch, path);
        setbannersearch['image'] = result.url;
        // setbannersearch['image'] = path;
      }
      else {
        setbannersearch['image'] = getdata["bannerSearch"][0]["image"];
      }

      insertdata.bannerSearch = [setbannersearch];

      var setpopup = {};
      setpopup['Height'] = (request_json["popup_Height"] == undefined && request_json["popup_Height"] == null ? 0 : Number(request_json['popup_Height']));
      setpopup['Width'] = (request_json["popup_Width"] == undefined && request_json["popup_Width"] == null ? 0 : Number(request_json['popup_Width']));
      setpopup['maxSize'] = (request_json["popup_maxSize"] == undefined && request_json["popup_maxSize"] == null ? 0 : Number(request_json['popup_maxSize']));
      setpopup['minSize'] = (request_json["popup_minSize"] == undefined && request_json["popup_minSize"] == null ? 0 : Number(request_json['popup_minSize']));
      setpopup['formatFile'] = request_json['popup_formatFile'];
      var ektensipopup = request_json['popup_formatFile'];
      if (files.popUpnotif != undefined) {
        var insertpopup = files.popUpnotif[0];
        var path = "images/challenge/" + insertdata._id + "_popup" + "." + ektensipopup;
        var result = await this.osservices.uploadFile(insertpopup, path);
        setpopup['image'] = result.url;
        // setpopup['image'] = path;
      }
      else {
        setpopup['image'] = getdata["popUp"][0]["image"];
      }

      insertdata.popUp = [setpopup];

      if (request_json['hadiah_set_hadiahpemenang'] == 'true' || request_json['hadiah_set_hadiahpemenang'] == true) {
        var sethadiah = {};
        var settemphadiah = {};
        if (request_json['hadiah_jenispemenang'] == 'RANKING') {
          settemphadiah["currency"] = request_json['hadiah_currency'].toUpperCase();
          var getlistjuara = request_json['hadiah_juara'];
          var konversijuara = getlistjuara.toString().split(",");
          for (var i = 0; i < konversijuara.length; i++) {
            var temploop = i + 1;
            var stringnama = 'juara' + temploop.toString();
            settemphadiah[stringnama] = Number(konversijuara[i]);
          }

          sethadiah = {
            "typeHadiah": "RANKING",
            "ranking": [settemphadiah]
          };
        }
        else {
          settemphadiah['pointPrice'] = request_json['point_price'];
          settemphadiah['pointPriceMax'] = request_json['point_price_max'];

          sethadiah = {
            "typeHadiah": "POINT",
            "point": [settemphadiah]
          };
        }

        insertdata.hadiahPemenang = [sethadiah];
      }
      else {
        insertdata.hadiahPemenang = [];
      }

      var setnotifikasi = {};
      var listnotifikasipush = ['akanDatang', 'challengeDimulai', 'updateLeaderboard', 'challengeAkanBerakhir', 'challengeBerakhir', 'untukPemenang'];
      var listvariable = ['include', 'title', 'titleEN', 'description', 'descriptionEN', 'unit', 'aturWaktu'];
      for (var i = 0; i < listnotifikasipush.length; i++) {
        var tempnotifikasi = {};
        var getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_include';
        if (request_json[getvarname] != undefined && request_json[getvarname] != null && request_json[getvarname] == 'YES') {
          for (var j = 0; j < listvariable.length; j++) {
            getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
            if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
              var convertdata = request_json[getvarname].split(",");
              var inputdatatoarray = [];
              for (var k = 0; k < convertdata.length; k++) {
                inputdatatoarray.push(parseInt(convertdata[k]));
              }

              tempnotifikasi[listvariable[j]] = inputdatatoarray;
            }
            else if (listvariable[j] == 'aturWaktu') {
              if (listnotifikasipush[i] != 'challengeDimulai') {
                tempnotifikasi[listvariable[j]] = parseInt(request_json[getvarname]);
              }
            }
            else {
              tempnotifikasi[listvariable[j]] = request_json[getvarname];
            }
          }
        }
        else {
          for (var j = 0; j < listvariable.length; j++) {
            getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
            if (listvariable[j] == 'include') {
              tempnotifikasi[listvariable[j]] = 'NO';
            }
            else if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
              tempnotifikasi[listvariable[j]] = [];
            }
            else if (listvariable[j] == 'aturWaktu') {
              if (listnotifikasipush[i] != 'challengeDimulai') {
                tempnotifikasi[listvariable[j]] = 0;
              }
            }
            else {
              tempnotifikasi[listvariable[j]] = null;
            }
          }
        }

        setnotifikasi[listnotifikasipush[i]] = [
          tempnotifikasi
        ];
      }

      insertdata.notifikasiPush = [setnotifikasi];


      var checkpartisipan = request_json['list_partisipan_challenge'];
      var checkjoinchallenge = request_json['caraGabung'];
      var checkstatusChallenge = request_json['statusChallenge'];
      if (checkstatusChallenge != 'NONACTIVE') {
        if (checkjoinchallenge == 'DENGAN UNDANGAN' && checkpartisipan != null && checkpartisipan != undefined) {
          this.insertchildofchallenge(insertdata, request_json['list_partisipan_challenge']);
        }
        else {
          this.insertchildofchallenge(insertdata, null);
        }
      }

      await this.challengeService.update(id, insertdata);
    }
    else {
      if (files.bannerBoard != undefined) {
        var insertbanner = files.bannerBoard[0];
        var path = "images/challenge/" + id + "_bannerLeaderboard" + "." + getdata["leaderBoard"][0]["formatFile"];
        // var path = "images/challenge/" + getoriginalname;
        var result = await this.osservices.uploadFile(insertbanner, path);
        // setleaderboard['bannerLeaderboard'] = result.url;
        getdata["leaderBoard"][0]["bannerLeaderboard"] = result.url;
      }

      if (files.bannerSearch != undefined) {
        var insertbannersearch = files.bannerSearch[0];
        var path = "images/challenge/" + id + "_bannerSearch" + "." + getdata["bannerSearch"][0]["formatFile"];
        // var path = "images/challenge/" + getoriginalname;
        var result = await this.osservices.uploadFile(insertbannersearch, path);
        // setleaderboard['image'] = result.url;
        getdata["bannerSearch"][0]["image"] = result.url;
      }

      if (files.popUpnotif != undefined) {
        var insertpopup = files.popUpnotif[0];
        var path = "images/challenge/" + id + "_popup" + "." + getdata["popUp"][0]["formatFile"];
        // var path = "images/challenge/" + getoriginalname;
        var result = await this.osservices.uploadFile(insertpopup, path);
        // setleaderboard['image'] = result.url;
        getdata["popUp"][0]["image"] = result.url;
      }

      if (request_json['description'] != undefined) {
        getdata["description"] = request_json['description'];
      }

      if (request_json['leaderboard_warnaBackground'] != undefined) {
        getdata["leaderBoard"][0]["warnaBackground"] = request_json['leaderboard_warnaBackground'];
      }

      if (request_json['listbadge'] != undefined) {
        var listjuara = request_json['listbadge'];
        var konversilistjuara = listjuara.toString().split(",");
        var mongoose = require('mongoose');
        var setjuara = {};
        var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
        var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
        for (var i = 0; i < konversilistjuara.length; i++) {
          var tambahsatu = i + 1;
          var settype = 'juara' + tambahsatu.toString();
          var convertid = null;

          if (konversilistjuara[i].toString() == 'new') {
            var getbadgeprofile = listbadgeprofile[i];
            var getbadgegeneral = listbadgegeneral[i];

            var insertnewbadge = new CreateBadgeDto();
            insertnewbadge.name = getdata.nameChallenge + "_" + settype;
            insertnewbadge.type = settype;

            var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
            var getbadgeid = resultbadge._id;
            // var getbadgeid = insertnewbadge.name;
            convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
          }
          else {
            convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
          }
          setjuara[settype] = convertid;
        }

        getdata['ketentuanHadiah'][0]['badge'] = [setjuara];
      }

      getdata["statusChallenge"] = request_json["statusChallenge"];
      getdata['updatedAt'] = await this.util.getDateTimeString();
      await this.challengeService.update(id, getdata);
    }


    const messages = {
      "info": ["The process successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    try {

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": getdata,
        "message": messages
      });
    }
    catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update/:id/v2')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'bannerBoard', maxCount: 1 }, { name: 'bannerSearch', maxCount: 1 }, { name: 'popUpnotif', maxCount: 1 }, { name: 'badge_profile_1', maxCount: 1 }, { name: 'badge_general_1', maxCount: 1 }, { name: 'badge_profile_2', maxCount: 1 }, { name: 'badge_general_2', maxCount: 1 }, { name: 'badge_profile_3', maxCount: 1 }, { name: 'badge_general_3', maxCount: 1 },]))
  async update2(
    @Param('id') id: string,
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
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/update/' + id + '/v2';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));
    var getdata = await this.challengeService.findOne(id);

    if (request_json['statusChallenge'] == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, status challenge field is required");
    }

    if (request_json['statusChallenge'] == 'PUBLISH') {
      var setjenischallenge = null;
      if (request_json['jenisChallenge'] == null) {
        setjenischallenge = getdata["jenisChallenge"].toString();
      }
      else {
        setjenischallenge = request_json['jenisChallenge'];
      }
    }

    if (getdata["statusChallenge"] == 'DRAFT') {

      if (request_json['statusChallenge'] == 'PUBLISH') {
        var cekdata = await this.challengeService.findAll(null, setjenischallenge, null, null, null, ["SEDANG BERJALAN", "AKAN DATANG"], null, true, null, null);
        if ((request_json['jenisChallenge'] == '647055de0435000059003462' && cekdata.length >= 3) || (request_json['jenisChallenge'] == '64706cbfd3d174ff4989b167' && cekdata.length >= 5)) {
          if (request_json['jenisChallenge'] == '647055de0435000059003462') {
            throw new NotAcceptableException("Challenge Utama yang sudah aktif telah memenuhi batas maksimal (Maksimal: 3 challenge aktif)")
          }
          else {
            throw new NotAcceptableException("Challenge Lainnya yang sudah aktif telah memenuhi batas maksimal (Maksimal: 5 challenge aktif)")
          }
        }
      }

      // var insertdata = new CreateChallengeDto();
      var insertdata = getdata;
      // var mongo = require('mongoose');
      // insertdata._id = new mongo.Types.ObjectId(id);

      insertdata.nameChallenge = request_json['nameChallenge'];
      var importlib = require('mongoose');
      insertdata.jenisChallenge = importlib.Types.ObjectId(request_json['jenisChallenge']);
      insertdata.description = request_json['description'];
      insertdata.updatedAt = await this.util.getDateTimeString();
      insertdata.startChallenge = request_json['startChallenge'];
      insertdata.endChallenge = request_json['endChallenge'];
      insertdata.durasi = Number(request_json['durasi']);
      insertdata.jumlahSiklusdurasi = Number(request_json['jumlahSiklusdurasi']);
      var convertagain = new Date(request_json['startTime']);
      convertagain.setHours(convertagain.getHours() + 7);
      var convertdatastart = convertagain.toISOString().split("T")[1];
      insertdata.startTime = convertdatastart.split(".")[0];
      // convertagain.setSeconds(convertagain.getSeconds() - 1);
      // var convertlagi = convertagain.toISOString().split("T")[1];
      insertdata.endTime = insertdata.startTime;
      insertdata.tampilStatusPengguna = request_json['tampilStatusPengguna'];
      insertdata.objectChallenge = request_json['objectChallenge'];
      insertdata.statusChallenge = request_json['statusChallenge'];

      var arraymetrik = [];
      let setmetrik = {};
      if (request_json['pilihanMetrik'] == 'akun') {
        var setreferal = null;
        var setikuti = null;

        setreferal = (request_json["akun_referal"] == undefined && request_json["akun_referal"] == null ? 0 : Number(request_json['akun_referal']));
        setikuti = (request_json["akun_ikuti"] == undefined && request_json["akun_ikuti"] == null ? 0 : Number(request_json['akun_ikuti']));

        if (setreferal == 0 && setikuti == 0) {
          var timestamps_end = await this.util.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

          throw new BadRequestException("Unabled to proceed, referral score or following score is required");
        }

        setmetrik = {
          "Aktivitas": true,
          "Interaksi": false,
          "InteraksiKonten": [],
          "AktivitasAkun": [
            {
              "Referal": setreferal,
              "Ikuti": setikuti
            }
          ]
        }
      }
      else {
        if (request_json["konten_hyppevid_createpost"] == undefined && request_json["konten_hyppevid_createpost"] == null) {
          request_json['konten_hyppevid_createpost'] = 0;
        }

        if (request_json["konten_hyppepic_createpost"] == undefined && request_json["konten_hyppepic_createpost"] == null) {
          request_json['konten_hyppepic_createpost'] = 0;
        }

        // if (request_json["konten_hyppediary_createpost"] == undefined && request_json["konten_hyppediary_createpost"] == null) {
        //   request_json['konten_hyppediary_createpost'] = 0;
        // }

        if (request_json["konten_hyppevid_likepost"] == undefined && request_json["konten_hyppevid_likepost"] == null) {
          request_json['konten_hyppevid_likepost'] = 0;
        }

        if (request_json["konten_hyppepic_likepost"] == undefined && request_json["konten_hyppepic_likepost"] == null) {
          request_json['konten_hyppepic_likepost'] = 0;
        }

        // if (request_json["konten_hyppediary_likepost"] == undefined && request_json["konten_hyppediary_likepost"] == null) {
        //   request_json['konten_hyppediary_likepost'] = 0;
        // }

        if (request_json["konten_hyppevid_viewpost"] == undefined && request_json["konten_hyppevid_viewpost"] == null) {
          request_json['konten_hyppevid_viewpost'] = 0;
        }

        // if (request_json["konten_hyppediary_viewpost"] == undefined && request_json["konten_hyppediary_viewpost"] == null) {
        //   request_json['konten_hyppediary_viewpost'] = 0;
        // }

        var setinteraksikonten = {
          "suka": [
            {
              "HyppeVid": Number(request_json['konten_hyppevid_likepost']),
              "HyppePic": Number(request_json['konten_hyppepic_likepost']),
              //"HyppeDiary": Number(request_json['konten_hyppediary_likepost'])
            }
          ],
          "tonton": [
            {
              "HyppeVid": Number(request_json['konten_hyppevid_viewpost']),
              //"HyppeDiary": Number(request_json['konten_hyppediary_viewpost'])
            }
          ],
        }

        if (insertdata.objectChallenge == 'KONTEN') {
          setinteraksikonten['buatKonten'] = [];
        }
        else {
          setinteraksikonten['buatKonten'] = [
            {
              "HyppeVid": Number(request_json['konten_hyppevid_createpost']),
              "HyppePic": Number(request_json['konten_hyppepic_createpost']),
              //"HyppeDiary": Number(request_json['konten_hyppediary_createpost'])
            }
          ];
        }

        if (request_json["konten_tagar"] != null && request_json["konten_tagar"] != undefined) {
          setinteraksikonten['tagar'] = request_json['konten_tagar'];
        }

        setmetrik = {
          "Aktivitas": false,
          "Interaksi": true,
          "AktivitasAkun": [],
          "InteraksiKonten": [setinteraksikonten]
        }
      }

      arraymetrik.push(setmetrik);
      insertdata.metrik = arraymetrik;

      var setpesertafield = {};
      setpesertafield["caraGabung"] = request_json['caraGabung'].toUpperCase();
      var cekgabung = setpesertafield["caraGabung"];
      var datatipeAkun = request_json['tipeAkun'];
      var konversitipeAkun = datatipeAkun.toString().split(",");

      if (cekgabung == "DENGAN UNDANGAN") {
        setpesertafield["tipeAkunTerverikasi"] = 'NO';
      }
      else {
        if (konversitipeAkun.length == 2) {
          setpesertafield["tipeAkunTerverikasi"] = 'ALL';
        }
        else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TERVERIFIKASI') {
          setpesertafield["tipeAkunTerverikasi"] = 'YES';
        }
        else if (konversitipeAkun.length == 1 && konversitipeAkun[0] == 'TIDAKTERVERIFIKASI') {
          setpesertafield["tipeAkunTerverikasi"] = 'NO';
        }
        else {
          setpesertafield["tipeAkunTerverikasi"] = 'NO';
        }
      }

      var datajeniskelamin = request_json['jenis_kelamin'];
      var konversikelamin = (cekgabung == "SEMUA PENGGUNA" ? datajeniskelamin.toString() : "");
      konversikelamin.split(",");
      var tempkelamindata = null;
      var setjeniskelamin = {};
      var listkelamin = new Map();
      listkelamin.set('L', 'LAKI-LAKI');
      listkelamin.set('P', 'PEREMPUAN');
      listkelamin.set('O', 'OTHER');

      for (let [key, value] of listkelamin) {
        var searchkelamin = konversikelamin.includes(key);
        if (searchkelamin == true) {
          setjeniskelamin[value] = 'YES';
        }
        else {
          setjeniskelamin[value] = 'NO';
        }
      }

      setpesertafield["jenisKelamin"] = [setjeniskelamin];

      var datalokasi = request_json['lokasi'];
      var konversilokasi = (cekgabung == "SEMUA PENGGUNA" ? ((datalokasi != '' && datalokasi != null && datalokasi != undefined) ? datalokasi.toString().split(",") : []) : []);
      var templokasidata = null;
      var setlokasi = [];
      if (konversilokasi.length != 0) {
        var mongoose = require('mongoose');
        for (var i = 0; i < konversilokasi.length; i++) {
          templokasidata = new mongoose.Types.ObjectId(konversilokasi[i].toString());
          setlokasi.push(templokasidata);
        }
      }

      setpesertafield["lokasiPengguna"] = setlokasi;

      var dataumur = request_json['rentangumur'];
      var konversiumur = (cekgabung == "SEMUA PENGGUNA" ? dataumur.toString() : "");
      konversiumur.split(",");
      var listumur = ["<14", "14-28", "29-43", "44<", "LAINNYA"];
      var setumur = {};
      var mongoose = require('mongoose');
      for (var i = 0; i < listumur.length; i++) {
        var searchumur = konversiumur.includes(listumur[i]);
        if (searchumur == true) {
          setumur[listumur[i]] = 'YES';
        }
        else {
          setumur[listumur[i]] = 'NO';
        }
      }

      setpesertafield['rentangUmur'] = [setumur];

      insertdata.peserta = [setpesertafield];

      var setleaderboard = {};
      if (request_json['leaderboard_tampilbadge_dileaderboard'] == 'true' || request_json['leaderboard_tampilbadge_dileaderboard'] == true) {
        setleaderboard['tampilBadge'] = true;
      }
      else {
        setleaderboard['tampilBadge'] = false;
      }

      setleaderboard['Height'] = (request_json["leaderboard_Height"] == undefined && request_json["leaderboard_Height"] == null ? 0 : Number(request_json['leaderboard_Height']));
      setleaderboard['Width'] = (request_json["leaderboard_Width"] == undefined && request_json["leaderboard_Width"] == null ? 0 : Number(request_json['leaderboard_Width']));
      setleaderboard['maxSize'] = (request_json["leaderboard_maxSize"] == undefined && request_json["leaderboard_maxSize"] == null ? 0 : Number(request_json['leaderboard_maxSize']));
      setleaderboard['minSize'] = (request_json["leaderboard_minSize"] == undefined && request_json["leaderboard_minSize"] == null ? 0 : Number(request_json['leaderboard_minSize']));
      setleaderboard['warnaBackground'] = request_json['leaderboard_warnaBackground'];
      setleaderboard['formatFile'] = request_json['leaderboard_formatFile'];

      if (files.bannerBoard != undefined) {
        var ektensileaderboard = request_json['leaderboard_formatFile'];
        var insertbanner = files.bannerBoard[0];
        var path = "images/challenge/" + insertdata._id + "_bannerLeaderboard" + "." + ektensileaderboard;
        var result = await this.osservices.uploadFile(insertbanner, path);
        setleaderboard['bannerLeaderboard'] = result.url;
        // setleaderboard['bannerLeaderboard'] = path;
      }
      else {
        setleaderboard['bannerLeaderboard'] = getdata["leaderBoard"][0]["bannerLeaderboard"];
      }

      insertdata.leaderBoard = [setleaderboard];

      var setketentuanhadiah = {};
      // if(request_json['ketentuanhadiah_tampilbadge'] == true)
      if (request_json['ketentuanhadiah_tampilbadge'] == 'true' || request_json['ketentuanhadiah_tampilbadge'] == true) {
        setketentuanhadiah['badgePemenang'] = true;

        setketentuanhadiah['Height'] = (request_json["ketentuanhadiah_Height"] == undefined && request_json["ketentuanhadiah_Height"] == null ? 0 : Number(request_json['ketentuanhadiah_Height']));
        setketentuanhadiah['Width'] = (request_json["ketentuanhadiah_Width"] == undefined && request_json["ketentuanhadiah_Width"] == null ? 0 : Number(request_json['ketentuanhadiah_Width']));
        setketentuanhadiah['maxSize'] = (request_json["ketentuanhadiah_maxSize"] == undefined && request_json["ketentuanhadiah_maxSize"] == null ? 0 : Number(request_json['ketentuanhadiah_maxSize']));
        setketentuanhadiah['minSize'] = (request_json["ketentuanhadiah_minSize"] == undefined && request_json["ketentuanhadiah_minSize"] == null ? 0 : Number(request_json['ketentuanhadiah_minSize']));
        setketentuanhadiah['formatFile'] = request_json['ketentuanhadiah_formatFile'];
        var listjuara = request_json['listbadge'];
        if (listjuara == null || listjuara == undefined || listjuara == '') {
          var timestamps_end = await this.util.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

          throw new BadRequestException("unable to proceed. badge list required");
        }
        var konversilistjuara = listjuara.toString().split(",");
        var mongoose = require('mongoose');
        var setjuara = {};
        var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
        var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
        for (var i = 0; i < konversilistjuara.length; i++) {
          var tambahsatu = i + 1;
          var settype = 'juara' + tambahsatu.toString();
          var convertid = null;

          if (konversilistjuara[i].toString() == 'new') {
            var getbadgeprofile = listbadgeprofile[i];
            var getbadgegeneral = listbadgegeneral[i];

            var insertnewbadge = new CreateBadgeDto();
            insertnewbadge.name = insertdata.nameChallenge + "_" + settype;
            insertnewbadge.type = settype;

            var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
            var getbadgeid = resultbadge._id;
            // var getbadgeid = insertnewbadge.name;
            convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
          }
          else {
            convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
          }
          setjuara[settype] = convertid;
        }
        setketentuanhadiah['badge'] = [setjuara];
      }
      else {
        setketentuanhadiah['badgePemenang'] = false;
        setketentuanhadiah['Height'] = null;
        setketentuanhadiah['Width'] = null;
        setketentuanhadiah['maxSize'] = null;
        setketentuanhadiah['minSize'] = null;
        setketentuanhadiah['formatFile'] = null;
        setketentuanhadiah['badge'] = [];
      }

      insertdata.ketentuanHadiah = [setketentuanhadiah];

      var setbannersearch = {};

      setbannersearch['Height'] = (request_json["bannersearch_Height"] == undefined && request_json["bannersearch_Height"] == null ? 0 : Number(request_json['bannersearch_Height']));
      setbannersearch['Width'] = (request_json["bannersearch_Width"] == undefined && request_json["bannersearch_Width"] == null ? 0 : Number(request_json['bannersearch_Width']));
      setbannersearch['maxSize'] = (request_json["bannersearch_maxSize"] == undefined && request_json["bannersearch_maxSize"] == null ? 0 : Number(request_json['bannersearch_maxSize']));
      setbannersearch['minSize'] = (request_json["bannersearch_minSize"] == undefined && request_json["bannersearch_minSize"] == null ? 0 : Number(request_json['bannersearch_minSize']));
      setbannersearch['formatFile'] = request_json['bannersearch_formatFile'];
      var ektensisearch = request_json['bannersearch_formatFile'];

      if (files.bannerSearch != undefined) {
        var insertsearch = files.bannerSearch[0];
        var path = "images/challenge/" + insertdata._id + "_bannerSearch" + "." + ektensisearch;
        var result = await this.osservices.uploadFile(insertsearch, path);
        setbannersearch['image'] = result.url;
        // setbannersearch['image'] = path;
      }
      else {
        setbannersearch['image'] = getdata["bannerSearch"][0]["image"];
      }

      insertdata.bannerSearch = [setbannersearch];

      var setpopup = {};
      setpopup['Height'] = (request_json["popup_Height"] == undefined && request_json["popup_Height"] == null ? 0 : Number(request_json['popup_Height']));
      setpopup['Width'] = (request_json["popup_Width"] == undefined && request_json["popup_Width"] == null ? 0 : Number(request_json['popup_Width']));
      setpopup['maxSize'] = (request_json["popup_maxSize"] == undefined && request_json["popup_maxSize"] == null ? 0 : Number(request_json['popup_maxSize']));
      setpopup['minSize'] = (request_json["popup_minSize"] == undefined && request_json["popup_minSize"] == null ? 0 : Number(request_json['popup_minSize']));
      setpopup['formatFile'] = request_json['popup_formatFile'];
      var ektensipopup = request_json['popup_formatFile'];
      if (files.popUpnotif != undefined) {
        var insertpopup = files.popUpnotif[0];
        var path = "images/challenge/" + insertdata._id + "_popup" + "." + ektensipopup;
        var result = await this.osservices.uploadFile(insertpopup, path);
        setpopup['image'] = result.url;
        // setpopup['image'] = path;
      }
      else {
        setpopup['image'] = getdata["popUp"][0]["image"];
      }

      insertdata.popUp = [setpopup];

      if (request_json['hadiah_set_hadiahpemenang'] == 'true' || request_json['hadiah_set_hadiahpemenang'] == true) {
        var sethadiah = {};
        var settemphadiah = {};
        if (request_json['hadiah_jenispemenang'] == 'RANKING') {
          settemphadiah["currency"] = request_json['hadiah_currency'].toUpperCase();
          var getlistjuara = request_json['hadiah_juara'];
          var konversijuara = getlistjuara.toString().split(",");
          for (var i = 0; i < konversijuara.length; i++) {
            var temploop = i + 1;
            var stringnama = 'juara' + temploop.toString();
            settemphadiah[stringnama] = Number(konversijuara[i]);
          }

          sethadiah = {
            "typeHadiah": "RANKING",
            "ranking": [settemphadiah]
          };
        }
        else {
          settemphadiah['pointPrice'] = request_json['point_price'];
          settemphadiah['pointPriceMax'] = request_json['point_price_max'];

          sethadiah = {
            "typeHadiah": "POINT",
            "point": [settemphadiah]
          };
        }

        insertdata.hadiahPemenang = [sethadiah];
      }
      else {
        insertdata.hadiahPemenang = [];
      }

      var setnotifikasi = {};
      var listnotifikasipush = ['akanDatang', 'challengeDimulai', 'updateLeaderboard', 'challengeAkanBerakhir', 'challengeBerakhir', 'untukPemenang'];
      var listvariable = ['include', 'title', 'titleEN', 'description', 'descriptionEN', 'unit', 'aturWaktu'];
      for (var i = 0; i < listnotifikasipush.length; i++) {
        var tempnotifikasi = {};
        var getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_include';
        if (request_json[getvarname] != undefined && request_json[getvarname] != null && request_json[getvarname] == 'YES') {
          for (var j = 0; j < listvariable.length; j++) {
            getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
            if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
              var convertdata = request_json[getvarname].split(",");
              var inputdatatoarray = [];
              for (var k = 0; k < convertdata.length; k++) {
                inputdatatoarray.push(parseInt(convertdata[k]));
              }

              tempnotifikasi[listvariable[j]] = inputdatatoarray;
            }
            else if (listvariable[j] == 'aturWaktu') {
              if (listnotifikasipush[i] != 'challengeDimulai') {
                tempnotifikasi[listvariable[j]] = parseInt(request_json[getvarname]);
              }
            }
            else {
              tempnotifikasi[listvariable[j]] = request_json[getvarname];
            }
          }
        }
        else {
          for (var j = 0; j < listvariable.length; j++) {
            getvarname = 'notifikasiPush_' + listnotifikasipush[i] + '_' + listvariable[j];
            if (listvariable[j] == 'include') {
              tempnotifikasi[listvariable[j]] = 'NO';
            }
            else if (getvarname == 'notifikasiPush_updateLeaderboard_aturWaktu') {
              tempnotifikasi[listvariable[j]] = [];
            }
            else if (listvariable[j] == 'aturWaktu') {
              if (listnotifikasipush[i] != 'challengeDimulai') {
                tempnotifikasi[listvariable[j]] = 0;
              }
            }
            else {
              tempnotifikasi[listvariable[j]] = null;
            }
          }
        }

        setnotifikasi[listnotifikasipush[i]] = [
          tempnotifikasi
        ];
      }

      insertdata.notifikasiPush = [setnotifikasi];


      var checkpartisipan = request_json['list_partisipan_challenge'];
      var checkjoinchallenge = request_json['caraGabung'];
      var checkstatusChallenge = request_json['statusChallenge'];
      if (checkstatusChallenge != 'NONACTIVE') {
        if (checkjoinchallenge == 'DENGAN UNDANGAN' && checkpartisipan != null && checkpartisipan != undefined) {
          this.insertchildofchallenge2(insertdata, request_json['list_partisipan_challenge']);
        }
        else {
          this.insertchildofchallenge2(insertdata, null);
        }
      }

      await this.challengeService.update(id, insertdata);
    }
    else {
      if (files.bannerBoard != undefined) {
        var insertbanner = files.bannerBoard[0];
        var path = "images/challenge/" + id + "_bannerLeaderboard" + "." + getdata["leaderBoard"][0]["formatFile"];
        // var path = "images/challenge/" + getoriginalname;
        var result = await this.osservices.uploadFile(insertbanner, path);
        // setleaderboard['bannerLeaderboard'] = result.url;
        getdata["leaderBoard"][0]["bannerLeaderboard"] = result.url;
      }

      if (files.bannerSearch != undefined) {
        var insertbannersearch = files.bannerSearch[0];
        var path = "images/challenge/" + id + "_bannerSearch" + "." + getdata["bannerSearch"][0]["formatFile"];
        // var path = "images/challenge/" + getoriginalname;
        var result = await this.osservices.uploadFile(insertbannersearch, path);
        // setleaderboard['image'] = result.url;
        getdata["bannerSearch"][0]["image"] = result.url;
      }

      if (files.popUpnotif != undefined) {
        var insertpopup = files.popUpnotif[0];
        var path = "images/challenge/" + id + "_popup" + "." + getdata["popUp"][0]["formatFile"];
        // var path = "images/challenge/" + getoriginalname;
        var result = await this.osservices.uploadFile(insertpopup, path);
        // setleaderboard['image'] = result.url;
        getdata["popUp"][0]["image"] = result.url;
      }

      if (request_json['description'] != undefined) {
        getdata["description"] = request_json['description'];
      }

      if (request_json['leaderboard_warnaBackground'] != undefined) {
        getdata["leaderBoard"][0]["warnaBackground"] = request_json['leaderboard_warnaBackground'];
      }

      if (request_json['listbadge'] != undefined) {
        var listjuara = request_json['listbadge'];
        var konversilistjuara = listjuara.toString().split(",");
        var mongoose = require('mongoose');
        var setjuara = {};
        var listbadgeprofile = [files.badge_profile_1, files.badge_profile_2, files.badge_profile_3];
        var listbadgegeneral = [files.badge_general_1, files.badge_general_2, files.badge_general_3];
        for (var i = 0; i < konversilistjuara.length; i++) {
          var tambahsatu = i + 1;
          var settype = 'juara' + tambahsatu.toString();
          var convertid = null;

          if (konversilistjuara[i].toString() == 'new') {
            var getbadgeprofile = listbadgeprofile[i];
            var getbadgegeneral = listbadgegeneral[i];

            var insertnewbadge = new CreateBadgeDto();
            insertnewbadge.name = getdata.nameChallenge + "_" + settype;
            insertnewbadge.type = settype;

            var resultbadge = await this.badge.create(getbadgegeneral, getbadgeprofile, insertnewbadge);
            var getbadgeid = resultbadge._id;
            // var getbadgeid = insertnewbadge.name;
            convertid = new mongoose.Types.ObjectId(getbadgeid.toString());
          }
          else {
            convertid = new mongoose.Types.ObjectId(konversilistjuara[i].toString());
          }
          setjuara[settype] = convertid;
        }

        getdata['ketentuanHadiah'][0]['badge'] = [setjuara];
      }

      getdata["statusChallenge"] = request_json["statusChallenge"];
      getdata['updatedAt'] = await this.util.getDateTimeString();
      await this.challengeService.update(id, getdata);
    }


    const messages = {
      "info": ["The process successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    try {

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": getdata,
        "message": messages
      });
    }
    catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('subchallenge/disactivate/:id')
  async setnonactive(
    @Param('id') id: string,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/subchallenge/disactivate/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var setupdatedata = new CreateSubChallengeDto();
    setupdatedata.isActive = false;

    const messages = {
      "info": ["The process successful"],
    };

    await this.subchallenge.update(id, setupdatedata);

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
      response_code: 202,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('setstatuschallenge/:id')
  async updatechallengedata(
    @Param('id') id: string,
    @Req() request: Request,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/setstatuschallenge/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));

    var statusChallenge = request_json['statusChallenge'];

    var getdata = await this.challengeService.findOne(id);

    // var mongo = require('mongoose');
    // setupdatedata._id = new mongo.Types.ObjectId(id);

    if (statusChallenge == 'PUBLISH') {
      var setjenischallenge = getdata["jenisChallenge"].toString();
      var cekdata = await this.challengeService.findAll(null, setjenischallenge, null, null, null, ["SEDANG BERJALAN", "AKAN DATANG"], null, true, null, null);
      if ((setjenischallenge == '647055de0435000059003462' && cekdata.length >= 3) || (setjenischallenge == '64706cbfd3d174ff4989b167' && cekdata.length >= 5)) {
        if (setjenischallenge == '647055de0435000059003462') {
          throw new NotAcceptableException("Challenge Utama yang sudah aktif telah memenuhi batas maksimal (Maksimal: 3 challenge aktif)")
        }
        else {
          throw new NotAcceptableException("Challenge Lainnya yang sudah aktif telah memenuhi batas maksimal (Maksimal: 5 challenge aktif)")
        }
      }
    }

    getdata.statusChallenge = statusChallenge;
    getdata.updatedAt = await this.util.getDateTimeString();

    const messages = {
      "info": ["The process successful"],
    };

    await this.challengeService.update(id, getdata);
    if (statusChallenge == "PUBLISH") {
      var checkjoinchallenge = getdata.peserta[0].caraGabung;
      var checkpartisipan = getdata.listParticipant;
      if (checkjoinchallenge == 'DENGAN UNDANGAN' && checkpartisipan != null && checkpartisipan != undefined && checkpartisipan.length != 0) {
        this.insertchildofchallenge2(getdata, checkpartisipan);
      }
      else {
        this.insertchildofchallenge2(getdata, null);
      }
    }
    else if (statusChallenge == "NONACTIVE" || statusChallenge == "NONEACTIVE") {
      this.hapuschallenge(getdata._id.toString());
    }

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing/bannerlandingpage')
  async listingbanner(
    @Req() request: Request,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listing/bannerlandingpage';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var targetbanner = null;
    var page = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    var jenischallenge = null;

    if (request_json["target"] !== undefined) {
      targetbanner = request_json['target'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, filter target banner field is required");
    }

    if (request_json["page"] !== undefined) {
      page = request_json['page'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["jenischallenge"] !== undefined) {
      jenischallenge = request_json['jenischallenge'];
    }

    const messages = {
      "info": ["The process successful"],
    };

    var data = await this.challengeService.findlistingBanner(targetbanner, jenischallenge, page);

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengeService.remove(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Post('allchallenge')
  async showallchallenge(
    @Req() request: Request,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/allchallenge';

    var iduser = null;
    var page = null;
    var limit = null;
    var jenischallenge = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, iduser field is required");
    }

    if (request_json["page"] !== undefined) {
      page = request_json['page'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json['limit'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    if (request_json["jenischallenge"] !== undefined) {
      jenischallenge = request_json['jenischallenge'];
    }

    var data = await this.challengeService.checkallchallenge(iduser, jenischallenge, page, limit);

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('allchallenge/v2')
  async showallchallengev2(
    @Req() request: Request,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/allchallenge/v2';

    var iduser = null;
    var page = null;
    var limit = null;
    var jenischallenge = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, iduser field is required");
    }

    if (request_json["page"] !== undefined) {
      page = request_json['page'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json['limit'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    if (request_json["jenischallenge"] !== undefined) {
      jenischallenge = request_json['jenischallenge'];
    }

    var data = await this.challengeService.checkallchallengev2(iduser, jenischallenge, page, limit);

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('leaderboard')
  async listingleaderboard(
    @Req() request: Request,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/leaderboard';

    var challengeId = null;
    var userId = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["challengeId"] !== undefined) {
      challengeId = request_json['challengeId'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, userId, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["userId"] !== undefined) {
      userId = request_json['userId'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, userId, null, request_json);

      throw new BadRequestException("Unabled to proceed, user id field is required");
    }

    var data = await this.subchallenge.listingleaderboard(challengeId, userId);

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, userId, null, request_json);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('leaderboard/v2')
  async listingleaderboardv2(
    @Req() request: Request,
    @Headers() headers
  ) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/leaderboard/v2';

    var challengeId = null;
    var userId = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["challengeId"] !== undefined) {
      challengeId = request_json['challengeId'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, userId, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["userId"] !== undefined) {
      userId = request_json['userId'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, userId, null, request_json);

      throw new BadRequestException("Unabled to proceed, user id field is required");
    }

    var data = await this.subchallenge.listingleaderboardv2(challengeId, userId);

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, userId, null, request_json);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('listuserwilayah/:id')
  async listuserwilayah(@Param('id') id: string, @Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listuserwilayah/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var challengeId = id;

    // var data = await this.subchallenge.getwilayahpengguna(challengeId);
    var data = await this.userchallengeSS.wilayahpengguna(challengeId);

    // for (var i = 0; i < data.length; i++) {
    //   var setarray = [];
    //   var getarray = data[i].userChallenge_data;
    //   for (var j = 0; j < getarray.length; j++) {
    //     var setobject = {};
    //     setobject["_id"] = getarray[j]._id;
    //     var getangka = getarray[j].persentase;
    //     setobject["persentase"] = parseFloat(getangka.toFixed(2));

    //     setarray.push(setobject);
    //   }

    //   data[i].userChallenge_data = setarray;
    // }

    var setarray = [];
    for (var j = 0; j < data.length; j++) {
      var setobject = {};
      setobject["_id"] = data[j]._id;
      var getangka = data[j].persentase;
      setobject["persentase"] = parseFloat(getangka.toFixed(2));

      setarray.push(setobject);
    }

    data = setarray;

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('listuserwilayah/v2/:id')
  async listuserwilayahv2(@Param('id') id: string, @Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listuserwilayah/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var challengeId = id;

    var data = await this.userchallengeSS.wilayahpenggunav2(challengeId);

    var setarray = [];
    for (var j = 0; j < data.length; j++) {
      var setobject = {};
      setobject["_id"] = data[j]._id;
      var getangka = data[j].persentase;
      setobject["persentase"] = parseFloat(getangka.toFixed(2));

      setarray.push(setobject);
    }

    data = setarray;

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
      response_code: 202,
      data: data,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async joinChallenge(@Res() res, @Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/join';
    var mongo = require('mongoose');

    var request_json = JSON.parse(JSON.stringify(request.body));
    var getsubid = request_json['idChallenge'];
    var getuserid = request_json['idUser'];
    var uscall = null;
    var statuskick = null;
    var botmode = false;

    if (getsubid == null || getsubid == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge id field is required");
    }

    if (getuserid == null || getuserid == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

      throw new BadRequestException("Unabled to proceed, user id field is required");
    }

    var getuserbasic = await this.userbasicsSS.findbyid(getuserid);
    if (getuserbasic == null) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

      throw new NotAcceptableException("Unabled to proceed, user data not found");
    }

    var parentdata = await this.challengeService.detailchallenge(getsubid);
    var getsubdata = await this.subchallenge.subchallengedetailwithlastrank(getsubid);
    var checkpernahdikick = await this.userchallengeSS.checkUserjoinchallenge(getsubid, getuserid);
    if (checkpernahdikick.length == 0) {
      statuskick = false;
    }
    else {
      if (checkpernahdikick[0].isActive == true) {
        throw new NotAcceptableException("Unabled to proceed, user already join challenge");
      }
      else {
        statuskick = true;
      }
    }

    var botdata = await this.settings2SS.findOne("6583fb37cf00baae6d0d344c");
    if (await this.util.ceckData(botdata)) {
      botmode = true;
    }

    var listjoin = [];
    var firstdata = null;
    for (var i = 0; i < getsubdata.length; i++) {
      var getdatenow = await this.util.getDateTimeString();
      var convertnow = new Date(getdatenow);

      var getfromdb = new Date(getsubdata[i].endDatetime);

      var datediff = getfromdb.getTime() - convertnow.getTime();
      if (datediff >= 0) {
        var createdata = new Userchallenges();
        createdata.isBot = false;
        createdata.maxScore = 0;
        createdata.maxDate = timestamps_start.split(" ")[0];
        var setscore = 0;
        if (botmode == true) {
          var getdetailvalue = JSON.parse(JSON.stringify(botdata.value));

          var checkuser = getdetailvalue.find(objs => objs.idSubChallenge.toString() === getsubdata[i]._id.toString());
          if (checkuser != undefined) {
            var listuserarr = checkuser.detail;
            var getuser = listuserarr.find(objschar => objschar.iduser.toString() === getuserid);
            if (getuser != undefined) {
              createdata.isBot = true;
              setscore = getuser.scoreAwal;

              if (parentdata.objectChallenge == "KONTEN") {
                var getbotpost = await this.postSS.findByPostId(getuser.postid);
                var tambah = Number(getbotpost.likes.toString()) + Number(getuser.likeAwal);
                var updatepost = new Newposts();
                updatepost.likes = Long.fromNumber(tambah);

                await this.postSS.updateByPostId(getbotpost._id.toString(), updatepost);
              }
            }
          }
        }

        createdata._id = mongo.Types.ObjectId();
        createdata.idChallenge = new mongo.Types.ObjectId(getsubid);
        createdata.idUser = new mongo.Types.ObjectId(getuserid);
        createdata.idSubChallenge = new mongo.Types.ObjectId(getsubdata[i]._id);
        createdata.isActive = true;
        createdata.score = setscore;
        createdata.ranking = getsubdata[i].lastrank;
        createdata.startDatetime = getsubdata[i].startDatetime;
        createdata.endDatetime = getsubdata[i].endDatetime;
        createdata.objectChallenge = parentdata.objectChallenge;
        createdata.createdAt = await this.util.getDateTimeString();
        createdata.updatedAt = await this.util.getDateTimeString();
        createdata.activity = [];
        createdata.history = [];

        listjoin.push(createdata);
        await this.userchallengeSS.create(createdata);


        if (firstdata == null) {
          firstdata = new Userchallenges();
          firstdata._id = createdata._id;
          firstdata.idChallenge = createdata.idChallenge;
          firstdata.idUser = createdata.idUser;
          firstdata.idSubChallenge = createdata.idSubChallenge;
          firstdata.isActive = createdata.isActive;
          firstdata.score = createdata.score;
          firstdata.ranking = createdata.ranking;
          firstdata.startDatetime = createdata.startDatetime;
          firstdata.endDatetime = createdata.endDatetime;
          firstdata.objectChallenge = createdata.objectChallenge;
          firstdata.createdAt = createdata.createdAt;
          firstdata.updatedAt = createdata.updatedAt;
          firstdata.activity = createdata.activity;
          firstdata.history = createdata.history;
          firstdata.session = getsubdata[i].session;
        }
      }
    }

    const messages = {
      "info": ["The create successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, request_json['idUser'], null, request_json);

    if (firstdata != null && parentdata.objectChallenge == "KONTEN" && statuskick == false) {
      this.beforejoinchallenge(getuserbasic, firstdata);
    }

    if (listjoin.length != 0) {
      this.insertuserintonotifchallenge(listjoin);
    }
    return res.status(HttpStatus.OK).json({
      response_code: 202,
      "data": listjoin,
      "message": messages
    });
    // var checkdata = await this.userchallengeSS.checkUserjoinchallenge(getsubid, getuserid);
    // if (checkdata.length == 1) {
    //   var languages_json = JSON.parse(JSON.stringify(getuserbasic.languages));

    //   var timestamps_end = await this.util.getDateTimeString();
    //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

    //   if (languages_json.$id == '6152481690f7b2293d0bf653') {
    //     if (checkdata[0].isActive == true) {
    //       throw new BadRequestException("user already registered");
    //     }
    //     else {
    //       throw new BadRequestException("you have been kicked out of this challenge");
    //     }
    //   }
    //   else {
    //     if (checkdata[0].isActive == true) {
    //       throw new BadRequestException("pengguna telah melakukan pendaftaran");
    //     }
    //     else {
    //       throw new BadRequestException("anda sudah dikeluarkan dari challenge");
    //     }
    //   }
    // }
    // else {

    // }
  }

  //tinggal query before join
  @UseGuards(JwtAuthGuard)
  @Post('join/v2')
  async joinChallenge2(@Res() res, @Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/join/v2';
    var mongo = require('mongoose');

    var request_json = JSON.parse(JSON.stringify(request.body));
    var getsubid = request_json['idChallenge'];
    var getuserid = request_json['idUser'];
    var uscall = null;
    var statuskick = null;
    var botmode = false;
    var response = null;

    if (getsubid == null || getsubid == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge id field is required");
    }

    if (getuserid == null || getuserid == undefined) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

      throw new BadRequestException("Unabled to proceed, user id field is required");
    }

    var getuserbasic = await this.UserbasicnewService.findOne(getuserid);
    if (getuserbasic == null) {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

      throw new NotAcceptableException("Unabled to proceed, user data not found");
    }

    var parentdata = await this.challengeService.detailchallenge(getsubid);
    var getsubdata = await this.subchallenge.subchallengedetailwithlastrank(getsubid);
    var checkpernahdikick = await this.userchallengeSS.checkUserjoinchallenge(getsubid, getuserid);
    if (checkpernahdikick.length == 0) {
      statuskick = false;
    }
    else {
      if (checkpernahdikick[0].isActive == true) {
        throw new NotAcceptableException("Unabled to proceed, user already join challenge");
      }
      else {
        statuskick = true;
      }
    }

    var botdata = await this.settings2SS.findOne("6583fb37cf00baae6d0d344c");
    if (await this.util.ceckData(botdata)) {
      botmode = true;
    }

    var listjoin = [];
    var firstdata = null;
    for (var i = 0; i < getsubdata.length; i++) {
      var getdatenow = await this.util.getDateTimeString();
      var convertnow = new Date(getdatenow);

      var getfromdb = new Date(getsubdata[i].endDatetime);

      var datediff = getfromdb.getTime() - convertnow.getTime();
      if (datediff >= 0) {
        var createdata = new Userchallenges();
        createdata.isBot = false;
        createdata.maxScore = 0;
        createdata.maxDate = timestamps_start.split(" ")[0];
        var setscore = 0;
        if (botmode == true) {
          var getdetailvalue = JSON.parse(JSON.stringify(botdata.value));

          var checkuser = getdetailvalue.find(objs => objs.idSubChallenge.toString() === getsubdata[i]._id.toString());
          if (checkuser != undefined) {
            var listuserarr = checkuser.detail;
            var getuser = listuserarr.find(objschar => objschar.iduser.toString() === getuserid);
            if (getuser != undefined) {
              createdata.isBot = true;
              setscore = getuser.scoreAwal;

              if (parentdata.objectChallenge == "KONTEN") {
                var getbotpost = await this.post2SS.findByPostId(getuser.postid);
                var tambah = Number(getbotpost.likes.toString()) + Number(getuser.likeAwal);
                var updatepost = new newPosts2();
                updatepost.likes = Long.fromNumber(tambah);

                await this.post2SS.updateByPostId(getbotpost._id.toString(), updatepost);
              }
            }
          }
        }

        createdata._id = mongo.Types.ObjectId();
        createdata.idChallenge = new mongo.Types.ObjectId(getsubid);
        createdata.idUser = new mongo.Types.ObjectId(getuserid);
        createdata.idSubChallenge = new mongo.Types.ObjectId(getsubdata[i]._id);
        createdata.isActive = true;
        createdata.score = setscore;
        createdata.ranking = getsubdata[i].lastrank;
        createdata.startDatetime = getsubdata[i].startDatetime;
        createdata.endDatetime = getsubdata[i].endDatetime;
        createdata.objectChallenge = parentdata.objectChallenge;
        createdata.createdAt = await this.util.getDateTimeString();
        createdata.updatedAt = await this.util.getDateTimeString();
        createdata.activity = [];
        createdata.history = [];

        listjoin.push(createdata);
        await this.userchallengeSS.create(createdata);


        if (firstdata == null) {
          firstdata = new Userchallenges();
          firstdata._id = createdata._id;
          firstdata.idChallenge = createdata.idChallenge;
          firstdata.idUser = createdata.idUser;
          firstdata.idSubChallenge = createdata.idSubChallenge;
          firstdata.isActive = createdata.isActive;
          firstdata.score = createdata.score;
          firstdata.ranking = createdata.ranking;
          firstdata.startDatetime = createdata.startDatetime;
          firstdata.endDatetime = createdata.endDatetime;
          firstdata.objectChallenge = createdata.objectChallenge;
          firstdata.createdAt = createdata.createdAt;
          firstdata.updatedAt = createdata.updatedAt;
          firstdata.activity = createdata.activity;
          firstdata.history = createdata.history;
          firstdata.session = getsubdata[i].session;
        }
      }
    }

    const messages = {
      "info": ["The create successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, request_json['idUser'], null, request_json);
    if (firstdata != null && parentdata.objectChallenge == "KONTEN" && statuskick == false) {
      this.beforejoinchallenge2(getuserbasic, firstdata);
    }

    if (listjoin.length != 0) {
      this.insertuserintonotifchallenge2(listjoin);

      response = await this.userchallengeSS.userChallengebyUser(getuserid, getsubid);
    }
    return res.status(HttpStatus.OK).json({
      response_code: 202,
      "data": response,
      "message": messages
    });
    // var checkdata = await this.userchallengeSS.checkUserjoinchallenge(getsubid, getuserid);
    // if (checkdata.length == 1) {
    //   var languages_json = JSON.parse(JSON.stringify(getuserbasic.languages));

    //   var timestamps_end = await this.util.getDateTimeString();
    //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, getuserid, null, request_json);

    //   if (languages_json.$id == '6152481690f7b2293d0bf653') {
    //     if (checkdata[0].isActive == true) {
    //       throw new BadRequestException("user already registered");
    //     }
    //     else {
    //       throw new BadRequestException("you have been kicked out of this challenge");
    //     }
    //   }
    //   else {
    //     if (checkdata[0].isActive == true) {
    //       throw new BadRequestException("pengguna telah melakukan pendaftaran");
    //     }
    //     else {
    //       throw new BadRequestException("anda sudah dikeluarkan dari challenge");
    //     }
    //   }
    // }
    // else {

    // }
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.challengeService.remove(id);
  // }

  async insertchildofchallenge(parentdata, participant) {
    if (participant != null) {
      var timestamp_start = await this.util.getDateTimeString();
      // console.log(timestamp_start);
      var setparticipantchallenge = [];
      if (participant == "ALL") {
        var totaldata = await this.userbasicsSS.getcount();
        var setpagination = parseInt(totaldata[0].totalpost) / 200;
        var ceksisa = (parseInt(totaldata[0].totalpost) % 200);
        if (ceksisa > 0 && ceksisa < 5) {
          setpagination = setpagination + 1;
        }

        for (var looppagination = 0; looppagination < setpagination; looppagination++) {
          var getalluserbasic = await this.userbasicsSS.getuser(looppagination, 200);

          for (var loopuser = 0; loopuser < getalluserbasic.length; loopuser++) {
            setparticipantchallenge.push(getalluserbasic[loopuser]._id.toString());
          }
        }
      }
      else {
        var partisipan = participant;
        if (typeof (partisipan) != "string") {
          var temp = "";
          for (var loopP = 0; loopP < partisipan.length; loopP++) {
            var getpartisipan = partisipan[loopP].toString();
            temp = temp + getpartisipan + ((loopP == partisipan.length - 1) ? "" : ",");
          }

          partisipan = temp;
        }
        setparticipantchallenge = partisipan.toString().split(",");
      }

      var tempparticipant = [];
      for (var loopparticipant = 0; loopparticipant < setparticipantchallenge.length; loopparticipant++) {
        var importlibpart = require('mongoose');
        var setparticipantid = importlibpart.Types.ObjectId(setparticipantchallenge[loopparticipant]);
        tempparticipant.push(setparticipantid);
      }

      var timestamp_end = await this.util.getDateTimeString();
      // console.log(timestamp_end);
      parentdata.listParticipant = tempparticipant;
    }
    else {
      parentdata.listParticipant = [];
    }

    var konvertstring = parentdata._id;
    await this.challengeService.update(konvertstring.toString(), parentdata);

    if (parentdata.statusChallenge == "PUBLISH") {
      var satuanhari = parentdata.durasi;
      // if (parentdata.jenisDurasi == 'WEEK') {
      //   satuanhari = parentdata.durasi * 7;
      // }
      // else {
      //   satuanhari = parentdata.durasi;
      // }

      var listtanggal = [];
      var getvalue = parentdata.startChallenge;
      var temptanggal = new Date(getvalue.split(" ")[0] + " " + parentdata.startTime);
      temptanggal.setHours(temptanggal.getHours() + 7);
      var getvalue = parentdata.endChallenge;
      var endtanggal = new Date(getvalue.split(" ")[0] + " " + parentdata.startTime);
      endtanggal.setHours(endtanggal.getHours() + 7);

      // if (satuanhari == 0) {
      //   endtanggal.setDate(endtanggal.getDate() + 1);
      // }

      for (var i = 0; i < parentdata.jumlahSiklusdurasi; i++) {
        var pecahdata = temptanggal.toISOString().split("T");
        var startdatetime = pecahdata[0] + " " + parentdata.startTime;

        temptanggal.setDate(temptanggal.getDate() + satuanhari);

        var pecahdata = temptanggal.toISOString().split("T");
        var enddatetime = pecahdata[0] + " " + parentdata.startTime;

        temptanggal = new Date(temptanggal);

        var datediff = endtanggal.getTime() - temptanggal.getTime();

        if (datediff >= 0) {
          listtanggal.push([startdatetime, enddatetime]);
        }
      }

      for (var i = 0; i < listtanggal.length; i++) {
        var insertsub = new CreateSubChallengeDto();
        var mongoose = require('mongoose');
        insertsub._id = new mongoose.Types.ObjectId();
        insertsub.startDatetime = listtanggal[i][0];
        insertsub.endDatetime = listtanggal[i][1];
        insertsub.isActive = true;
        insertsub.challengeId = parentdata._id;
        insertsub.session = i + 1;
        await this.subchallenge.create(insertsub);
      }

      this.notifchallenge(parentdata._id.toString());
    }
  }

  async insertchildofchallenge2(parentdata, participant) {
    if (participant != null) {
      var timestamp_start = await this.util.getDateTimeString();
      // console.log(timestamp_start);
      var setparticipantchallenge = [];
      if (participant == "ALL") {
        var totaldata = await this.UserbasicnewService.getcount();
        var setpagination = parseInt(totaldata[0].totalpost) / 200;
        var ceksisa = (parseInt(totaldata[0].totalpost) % 200);
        if (ceksisa > 0 && ceksisa < 5) {
          setpagination = setpagination + 1;
        }

        for (var looppagination = 0; looppagination < setpagination; looppagination++) {
          var getalluserbasic = await this.UserbasicnewService.getuser(looppagination, 200);

          for (var loopuser = 0; loopuser < getalluserbasic.length; loopuser++) {
            setparticipantchallenge.push(getalluserbasic[loopuser]._id.toString());
          }
        }
      }
      else {
        var partisipan = participant;
        if (typeof (partisipan) != "string") {
          var temp = "";
          for (var loopP = 0; loopP < partisipan.length; loopP++) {
            var getpartisipan = partisipan[loopP].toString();
            temp = temp + getpartisipan + ((loopP == partisipan.length - 1) ? "" : ",");
          }

          partisipan = temp;
        }
        setparticipantchallenge = partisipan.toString().split(",");
      }

      var tempparticipant = [];
      for (var loopparticipant = 0; loopparticipant < setparticipantchallenge.length; loopparticipant++) {
        var importlibpart = require('mongoose');
        var setparticipantid = importlibpart.Types.ObjectId(setparticipantchallenge[loopparticipant]);
        tempparticipant.push(setparticipantid);
      }

      var timestamp_end = await this.util.getDateTimeString();
      // console.log(timestamp_end);
      parentdata.listParticipant = tempparticipant;
    }
    else {
      parentdata.listParticipant = [];
    }

    var konvertstring = parentdata._id;
    await this.challengeService.update(konvertstring.toString(), parentdata);

    if (parentdata.statusChallenge == "PUBLISH") {
      var satuanhari = parentdata.durasi;
      // if (parentdata.jenisDurasi == 'WEEK') {
      //   satuanhari = parentdata.durasi * 7;
      // }
      // else {
      //   satuanhari = parentdata.durasi;
      // }

      var listtanggal = [];
      var getvalue = parentdata.startChallenge;
      var temptanggal = new Date(getvalue.split(" ")[0] + " " + parentdata.startTime);
      temptanggal.setHours(temptanggal.getHours() + 7);
      var getvalue = parentdata.endChallenge;
      var endtanggal = new Date(getvalue.split(" ")[0] + " " + parentdata.startTime);
      endtanggal.setHours(endtanggal.getHours() + 7);

      // if (satuanhari == 0) {
      //   endtanggal.setDate(endtanggal.getDate() + 1);
      // }

      for (var i = 0; i < parentdata.jumlahSiklusdurasi; i++) {
        var pecahdata = temptanggal.toISOString().split("T");
        var startdatetime = pecahdata[0] + " " + parentdata.startTime;

        temptanggal.setDate(temptanggal.getDate() + satuanhari);

        var pecahdata = temptanggal.toISOString().split("T");
        var enddatetime = pecahdata[0] + " " + parentdata.startTime;

        temptanggal = new Date(temptanggal);

        var datediff = endtanggal.getTime() - temptanggal.getTime();

        if (datediff >= 0) {
          listtanggal.push([startdatetime, enddatetime]);
        }
      }

      for (var i = 0; i < listtanggal.length; i++) {
        var insertsub = new CreateSubChallengeDto();
        var mongoose = require('mongoose');
        insertsub._id = new mongoose.Types.ObjectId();
        insertsub.startDatetime = listtanggal[i][0];
        insertsub.endDatetime = listtanggal[i][1];
        insertsub.isActive = true;
        insertsub.challengeId = parentdata._id;
        insertsub.session = i + 1;
        await this.subchallenge.create(insertsub);
      }

      this.notifchallenge2(parentdata._id.toString());
    }
  }



  @UseGuards(JwtAuthGuard)
  @Post('listing/userchallenge')
  async listinguserchallenge(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listing/userchallenge';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var challengeid = null;
    var pilihansession = null;
    var jeniskelamin = null;
    var jenisakun = null;
    var username = null;
    var startage = null;
    var endage = null;
    var sorting = null;
    var limit = null;
    var page = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["challengeId"] !== undefined) {
      challengeid = request_json['challengeId'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["ascending"] !== undefined) {
      sorting = request_json['ascending'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json['limit'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    if (request_json["page"] !== undefined) {
      page = request_json['page'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["pilihansession"] !== undefined) {
      pilihansession = request_json['pilihansession'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, set session field is required");
    }

    if (request_json["username"] !== undefined) {
      username = request_json['username'];
    }

    if (request_json["jeniskelamin"] !== undefined) {
      jeniskelamin = request_json['jeniskelamin'];
    }

    if (request_json["jenisakun"] !== undefined) {
      jenisakun = request_json['jenisakun'];
    }

    if (request_json["startage"] !== undefined && request_json["endage"] !== undefined) {
      startage = request_json['startage'];
      endage = request_json['endage'];
    }

    var data = await this.subchallenge.listinguserchallenge(challengeid, pilihansession, jenisakun, username, startage, endage, jeniskelamin, sorting, limit, page);
    // var totaldata = await this.subchallenge.listinguserchallenge(challengeid, pilihansession, jenisakun, username, startage, endage, jeniskelamin, sorting, null, null);

    const messages = {
      "info": ["The create successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing/userchallenge/v2')
  async listinguserchallenge2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listing/userchallenge/v2';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var challengeid = null;
    var pilihansession = null;
    var jeniskelamin = null;
    var jenisakun = null;
    var username = null;
    var startage = null;
    var endage = null;
    var sorting = null;
    var limit = null;
    var page = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["challengeId"] !== undefined) {
      challengeid = request_json['challengeId'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }

    if (request_json["ascending"] !== undefined) {
      sorting = request_json['ascending'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json['limit'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    if (request_json["page"] !== undefined) {
      page = request_json['page'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["pilihansession"] !== undefined) {
      pilihansession = request_json['pilihansession'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, set session field is required");
    }

    if (request_json["username"] !== undefined) {
      username = request_json['username'];
    }

    if (request_json["jeniskelamin"] !== undefined) {
      jeniskelamin = request_json['jeniskelamin'];
    }

    if (request_json["jenisakun"] !== undefined) {
      jenisakun = request_json['jenisakun'];
    }

    if (request_json["startage"] !== undefined && request_json["endage"] !== undefined) {
      startage = request_json['startage'];
      endage = request_json['endage'];
    }

    var data = await this.subchallenge.listinguserchallenge2(challengeid, pilihansession, jenisakun, username, startage, endage, jeniskelamin, sorting, limit, page);
    var totaldata = await this.subchallenge.listinguserchallenge2(challengeid, pilihansession, jenisakun, username, startage, endage, jeniskelamin, sorting, null, null);

    const messages = {
      "info": ["The create successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "totaldata": totaldata.length,
      "message": messages
    }
  }


  // @UseGuards(JwtAuthGuard)
  // @Post('listleaderboard')
  // async listleaderboaard(@Req() request: Request, @Headers() headers) {
  //   var timestamps_start = await this.util.getDateTimeString();
  //   var fullurl = headers.host + '/api/challenge/listleaderboard';
  //   var token = headers['x-auth-token'];
  //   var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  //   var email = auth.email;

  //   var idchallenge = null;
  //   var iduser = null;
  //   var status = null;
  //   var session = null;
  //   var datasession = null;
  //   var data = null;
  //   var totalSession = null;
  //   var request_json = JSON.parse(JSON.stringify(request.body));

  //   if (request_json["idchallenge"] !== undefined) {
  //     idchallenge = request_json['idchallenge'];
  //   } else {
  //     var timestamps_end = await this.util.getDateTimeString();
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

  //     throw new BadRequestException("Unabled to proceed, challenge field is required");
  //   }

  //   if (request_json["iduser"] !== undefined) {
  //     iduser = request_json['iduser'];
  //   } else {
  //     var timestamps_end = await this.util.getDateTimeString();
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

  //     throw new BadRequestException("Unabled to proceed, ascending field is required");
  //   }
  //   status = request_json['status'];
  //   session = request_json['session'];


  //   try {
  //     data = await this.subchallenge.getListUserChallengeNew2(idchallenge, iduser, status, session);
  //   } catch (e) {
  //     data = [];
  //   }
  //   if (data !== null && data.length > 0) {
  //     try {
  //       datasession = await this.subchallenge.getcount(idchallenge);
  //     } catch (e) {
  //       datasession = [];
  //     }
  //     if (datasession !== null && datasession.length > 0) {
  //       totalSession = datasession[0].totalSession;
  //     } else {
  //       totalSession = 0;
  //     }
  //     data[0].totalSession = totalSession;

  //   }

  //   const messages = {
  //     "info": ["The proses successful"],
  //   };

  //   var timestamps_end = await this.util.getDateTimeString();
  //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

  //   return {
  //     response_code: 202,
  //     "data": data,
  //     "message": messages
  //   }
  // }


  @UseGuards(JwtAuthGuard)
  @Post('listbadgebyuser')
  async listbadgebyuser(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listbadgebyuser';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var iduser = null;
    var page = null;
    var limit = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));


    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    page = request_json['page'];
    limit = request_json['limit'];
    try {
      data = await this.userbadgeService.getBadgeByuser(iduser, page, limit);
    } catch (e) {
      data = [];
    }


    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "page": page,
      "limit": limit,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listbadgebyuser/v2')
  async listbadgebyuserv2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listbadgebyuser/v2';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var iduser = null;
    var page = null;
    var limit = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));


    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    page = request_json['page'];
    limit = request_json['limit'];
    try {
      data = await this.userbadgeService.getBadgeByuserV2(iduser, page, limit);
    } catch (e) {
      data = [];
    }


    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "page": page,
      "limit": limit,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listbadgeuserdetail')
  async listbadgeuserdetail(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listbadgeuserdetail';

    var iduser = null;
    var page = null;
    var limit = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));


    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    page = request_json['page'];
    limit = request_json['limit'];
    try {
      data = await this.userbadgeService.getBadgeUserCollection(iduser, page, limit);
    } catch (e) {
      data = [];
    }


    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "page": page,
      "limit": limit,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('listbadgeuserdetail/v2')
  async listbadgeuserdetailv2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/listbadgeuserdetail/v2';

    var iduser = null;
    var page = null;
    var limit = null;
    var datasession = null;
    var data = null;
    var totalSession = null;
    var request_json = JSON.parse(JSON.stringify(request.body));


    if (request_json["iduser"] !== undefined) {
      iduser = request_json['iduser'];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    page = request_json['page'];
    limit = request_json['limit'];
    try {
      data = await this.userbadgeService.getBadgeUserCollectionV2(iduser, page, limit);
    } catch (e) {
      data = [];
    }


    const messages = {
      "info": ["The proses successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

    return {
      response_code: 202,
      "data": data,
      "page": page,
      "limit": limit,
      "message": messages
    }
  }


  @Post('notif')
  async notif(@Req() request: Request) {
    var challengeid = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["challengeId"] !== undefined) {
      challengeid = request_json['challengeId'];
    } else {
      throw new BadRequestException("Unabled to proceed, challenge field is required");
    }
    this.notifchallenge(challengeid);

    const messages = {
      "info": ["The proses successful"],
    };

    return {
      response_code: 202,
      "message": messages
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('badgechoice')
  async badgechoice(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/badgechoice';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var iduserbadge = null;
    var datauserbadge = null;
    var iduser = null;
    var badgeProfile1 = null;
    var badgeOther1 = null;
    var endDatetime1 = null
    var isActive1 = null;
    var startDatetime1 = null;
    var userBadge = [];
    var obj = null;
    var objnew = null;
    var idUserBadge1 = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var createdAt = splitdate[0];
    var arrUserbadge = [];
    var databasicbadge = null;
    var userBadge2 = [];

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["iduserbadge"] !== undefined) {
      iduserbadge = request_json["iduserbadge"];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, iduserbadge field is required");
    }

    try {
      datauserbadge = await this.userbadgeService.getBadgeIduserbadge(iduserbadge);
    } catch (e) {
      datauserbadge = null;
    }

    if (datauserbadge !== null && datauserbadge.length > 0) {
      idUserBadge1 = datauserbadge[0]._id;
      iduser = datauserbadge[0].userId;
      startDatetime1 = datauserbadge[0].startDatetime;
      endDatetime1 = datauserbadge[0].endDatetime;
      badgeProfile1 = datauserbadge[0].badge_data[0].badgeProfile;
      badgeOther1 = datauserbadge[0].badge_data[0].badgeOther;
      isActive1 = datauserbadge[0].isActive;

      try {
        var checkdata = datauserbadge[0].userBadge;
        if (checkdata == null) {
          userBadge = [];
        }
        else {
          userBadge = datauserbadge[0].userBadge;
        }
      } catch (e) {
        userBadge = [];
      }
      obj = {
        "idUserBadge": new mongoose.Types.ObjectId(iduserbadge),
        "badgeProfile": badgeProfile1,
        "badgeOther": badgeOther1,
        "endDatetime": endDatetime1,
        "isActive": isActive1,
        "startDatetime": startDatetime1,
        "createdAt": createdAt
      };

      if (userBadge.length == 0) {
        userBadge.push(obj);
        await this.userbasicsSS.updateuser(iduser.toString(), userBadge);
      }

      else if (userBadge.length > 0) {
        userBadge.push(obj);
        await this.userbasicsSS.updateuser(iduser.toString(), userBadge);


        try {
          databasicbadge = await this.userbasicsSS.findbyid(iduser.toString());
        } catch (e) {
          databasicbadge = null;
        }

        if (databasicbadge !== null) {

          try {
            userBadge2 = databasicbadge.userBadge;
          } catch (e) {
            userBadge2 = [];
          }

          for (let i = 0; i < userBadge2.length; i++) {
            let max = userBadge2.length - 1;
            let idUserBadge = userBadge2[i].idUserBadge;
            let startDatetime = userBadge2[i].startDatetime;
            let endDatetime = userBadge2[i].endDatetime;
            let badgeProfile = userBadge2[i].badgeProfile;
            let badgeOther = userBadge2[i].badgeOther;
            let isActive = null;

            if (i == max) {

              isActive = true


            }
            else {

              isActive = false

            }
            objnew = {
              "idUserBadge": new mongoose.Types.ObjectId(idUserBadge),
              "badgeProfile": badgeProfile,
              "badgeOther": badgeOther,
              "endDatetime": endDatetime,
              "isActive": isActive,
              "startDatetime": startDatetime,
              "createdAt": createdAt
            };
            arrUserbadge.push(objnew);



          }
          await this.userbasicsSS.updateuser(iduser.toString(), arrUserbadge);

        }
      }

    }

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('badgechoice/v2')
  async badgechoicev2(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.util.getDateTimeString();
    var fullurl = headers.host + '/api/challenge/badgechoice/v2';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var iduserbadge = null;
    var datauserbadge = null;
    var iduser = null;
    var badgeProfile1 = null;
    var badgeOther1 = null;
    var endDatetime1 = null
    var isActive1 = null;
    var startDatetime1 = null;
    var userBadge = [];
    var obj = null;
    var objnew = null;
    var idUserBadge1 = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var createdAt = splitdate[0];
    var arrUserbadge = [];
    var databasicbadge = null;
    var userBadge2 = [];

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["iduserbadge"] !== undefined) {
      iduserbadge = request_json["iduserbadge"];
    } else {
      var timestamps_end = await this.util.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unable to proceed, iduserbadge field is required");
    }

    try {
      datauserbadge = await this.userbadgeService.getBadgeIduserbadgeV2(iduserbadge);
    } catch (e) {
      datauserbadge = null;
    }

    if (datauserbadge !== null && datauserbadge.length > 0) {
      idUserBadge1 = datauserbadge[0]._id;
      iduser = datauserbadge[0].userId;
      startDatetime1 = datauserbadge[0].startDatetime;
      endDatetime1 = datauserbadge[0].endDatetime;
      badgeProfile1 = datauserbadge[0].badge_data[0].badgeProfile;
      badgeOther1 = datauserbadge[0].badge_data[0].badgeOther;
      isActive1 = datauserbadge[0].isActive;

      try {
        var checkdata = datauserbadge[0].userBadge;
        if (checkdata == null) {
          userBadge = [];
        }
        else {
          userBadge = datauserbadge[0].userBadge;
        }
      } catch (e) {
        userBadge = [];
      }
      obj = {
        "idUserBadge": new mongoose.Types.ObjectId(iduserbadge),
        "badgeProfile": badgeProfile1,
        "badgeOther": badgeOther1,
        "endDatetime": endDatetime1,
        "isActive": isActive1,
        "startDatetime": startDatetime1,
        "createdAt": createdAt
      };

      if (userBadge.length == 0) {
        userBadge.push(obj);
        await this.UserbasicnewService.updateUserBadge(iduser.toString(), userBadge);
      }

      else if (userBadge.length > 0) {
        userBadge.push(obj);
        await this.UserbasicnewService.updateUserBadge(iduser.toString(), userBadge);


        try {
          databasicbadge = await this.UserbasicnewService.findOne(iduser.toString());
        } catch (e) {
          databasicbadge = null;
        }

        if (databasicbadge !== null) {

          try {
            userBadge2 = databasicbadge.userBadge;
          } catch (e) {
            userBadge2 = [];
          }

          for (let i = 0; i < userBadge2.length; i++) {
            let max = userBadge2.length - 1;
            let idUserBadge = userBadge2[i].idUserBadge;
            let startDatetime = userBadge2[i].startDatetime;
            let endDatetime = userBadge2[i].endDatetime;
            let badgeProfile = userBadge2[i].badgeProfile;
            let badgeOther = userBadge2[i].badgeOther;
            let isActive = null;

            if (i == max) {

              isActive = true

            }
            else {

              isActive = false

            }
            objnew = {
              "idUserBadge": new mongoose.Types.ObjectId(idUserBadge),
              "badgeProfile": badgeProfile,
              "badgeOther": badgeOther,
              "endDatetime": endDatetime,
              "isActive": isActive,
              "startDatetime": startDatetime,
              "createdAt": createdAt
            };
            arrUserbadge.push(objnew);

          }
          await this.UserbasicnewService.updateUserBadge(iduser.toString(), arrUserbadge);

        }
      }

    }

    const messages = {
      "info": ["The process was successful"],
    };

    var timestamps_end = await this.util.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      messages: messages,
    };
  }

  async userbadge() {
    var datachallengejuara = null;
    var status = null;
    var idsubchallenge = null;
    var idchallenge = null;
    var session = null;
    var startDatetime = null;
    var endDatetime = null;
    var userjuara = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];
    var datasubchalange = null;
    var idBadge = null;
    var idsub = null;
    try {
      datasubchalange = await this.subchallenge.findsub();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null) {

      for (let x = 0; x < datasubchalange.length; x++) {
        idsub = datasubchalange[x]._id.toString();
        try {
          datachallengejuara = await this.subchallenge.getjuara2(idsub);
        } catch (e) {
          datachallengejuara = null;
        }

        if (datachallengejuara !== null && datachallengejuara.length > 0) {
          for (let i = 0; i < datachallengejuara.length; i++) {
            status = datachallengejuara[i].status;
            idsubchallenge = datachallengejuara[i]._id;
            idchallenge = datachallengejuara[i].challengeId;
            session = datachallengejuara[i].session;
            startDatetime = datachallengejuara[i].startDatetime;
            endDatetime = datachallengejuara[i].endDatetime;
            userjuara = datachallengejuara[i].getlastrank;
            let lengtjuara = userjuara.length;
            let end = new Date(endDatetime);
            end.setHours(dt.getHours() + 12); // timestamp
            end = new Date(end);
            let getseminngu = new Date(new Date(end).setDate(new Date(end).getDate() + 7));
            let strdateseminggu = getseminngu.toISOString();
            var repdatesm = strdateseminggu.replace('T', ' ');
            var splitdatesm = repdatesm.split('.');
            var timedatesm = splitdatesm[0];
            if (lengtjuara > 0) {
              for (let x = 0; x < lengtjuara; x++) {

                let iduser = userjuara[x].idUser;
                let ranking = userjuara[x].ranking;
                let score = userjuara[x].score;
                let lastRank = userjuara[x].lastRank;

                try {
                  idBadge = userjuara[x].idBadge;
                } catch (e) {
                  idBadge = null;
                }
                let idSubChallenges = userjuara[x].idSubChallenge;
                let databadge = null;
                try {
                  databadge = await this.userbadgeService.getUserbadge(iduser.toString(), idSubChallenges.toString());
                } catch (e) {
                  databadge = null;
                }

                if (databadge == null && databadge == undefined) {
                  if (status == "BERAKHIR") {

                    if (idBadge !== null && idBadge !== undefined) {
                      let Userbadge_ = new Userbadge();
                      Userbadge_.SubChallengeId = idSubChallenges;
                      Userbadge_.idBadge = idBadge;
                      Userbadge_.createdAt = timedate;
                      Userbadge_.isActive = true;
                      Userbadge_.userId = iduser;
                      Userbadge_.session = session;
                      Userbadge_.startDatetime = endDatetime;
                      Userbadge_.endDatetime = timedatesm;

                      await this.userbadgeService.create(Userbadge_);

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


  async updateUserbadge() {
    var idsubchallenge = null;
    var idchallenge = null;
    var session = null;
    var startDatetime = null;
    var endDatetime = null;
    var isActive = null;
    var status = null;
    var idUser = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];
    var datachallengejuara = null;
    var getlastrank = null;
    var databadge = null;
    var datasubchalange = null;
    var idSubChallenge2 = null;
    var idusbadge = null;
    var idsub = null;
    try {
      datasubchalange = await this.subchallenge.findsub();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null) {
      for (let x = 0; x < datasubchalange.length; x++) {
        idsub = datasubchalange[x]._id.toString();
        try {
          datachallengejuara = await this.subchallenge.getjuara2(idsub);
        } catch (e) {
          datachallengejuara = null;
        }
        if (datachallengejuara !== null && datachallengejuara.length > 0) {
          for (let i = 0; i < datachallengejuara.length; i++) {
            status = datachallengejuara[i].status;
            idsubchallenge = datachallengejuara[i]._id;
            idchallenge = datachallengejuara[i].challengeId;
            getlastrank = datachallengejuara[i].getlastrank;
            session = datachallengejuara[i].session;
            startDatetime = datachallengejuara[i].startDatetime;
            endDatetime = datachallengejuara[i].endDatetime;
            isActive = datachallengejuara[i].isActive;
            let end = new Date(endDatetime);
            end.setHours(dt.getHours() + 12); // timestamp
            end = new Date(end);
            let getseminngu = new Date(new Date(end).setDate(new Date(end).getDate() + 7));
            let strdateseminggu = getseminngu.toISOString();
            var repdatesm = strdateseminggu.replace('T', ' ');
            var splitdatesm = repdatesm.split('.');
            var timedatesm = splitdatesm[0];
            if (timedate >= timedatesm) {

              // if (getlastrank !== null && getlastrank.length > 0) {
              //   for (let y = 0; y < getlastrank.length; y++) {
              //     idUser = getlastrank[y].idUser;
              //     idSubChallenge2 = getlastrank[y].idSubChallenge;

              //     databadge = await this.userbadgeService.getUserbadge(idUser.toString(), idSubChallenge2.toString());

              //     if (databadge !== null) {
              //       idusbadge = databadge._id;
              //       try {
              //         await this.userbadgeService.updateNonactive(idusbadge.toString());
              //         console.log("iduser: " + idUser.toString() + " berhasil update " + idusbadge.toString());
              //       } catch (e) {
              //         console.log("iduser: " + idUser.toString() + " gagal update " + idusbadge.toString());
              //       }


              //     }


              //   }
              // }

              if (isActive == true) {
                let CreateSubChallengeDto_ = new CreateSubChallengeDto();
                CreateSubChallengeDto_.isActive = false;
                await this.subchallenge.update(idsubchallenge.toString(), CreateSubChallengeDto_);

              }

            }

          }
        }
      }

    }




  }
  // @UseGuards(JwtAuthGuard)
  // @Post('listleaderboard2')
  // async listleaderboaard2(@Req() request: Request, @Headers() headers) {
  //   var timestamps_start = await this.util.getDateTimeString();
  //   var fullurl = headers.host + '/api/challenge/listleaderboard2';

  //   var idchallenge = null;
  //   var iduser = null;
  //   var status = null;
  //   var session = null;
  //   var datasession = null;
  //   var data = null;
  //   var totalSession = null;
  //   var request_json = JSON.parse(JSON.stringify(request.body));

  //   if (request_json["idchallenge"] !== undefined) {
  //     idchallenge = request_json['idchallenge'];
  //   } else {
  //     var timestamps_end = await this.util.getDateTimeString();
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

  //     throw new BadRequestException("Unabled to proceed, challenge field is required");
  //   }

  //   if (request_json["iduser"] !== undefined) {
  //     iduser = request_json['iduser'];
  //   } else {
  //     var timestamps_end = await this.util.getDateTimeString();
  //     this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

  //     throw new BadRequestException("Unabled to proceed, ascending field is required");
  //   }
  //   status = request_json['status'];
  //   session = request_json['session'];


  //   try {
  //     data = await this.subchallenge.getListUserChallengekeduaNew2(idchallenge, iduser, status, session);
  //   } catch (e) {
  //     data = [];
  //   }
  //   if (data !== null && data.length > 0) {
  //     try {
  //       datasession = await this.subchallenge.getcount(idchallenge);
  //     } catch (e) {
  //       datasession = [];
  //     }
  //     if (datasession !== null && datasession.length > 0) {
  //       totalSession = datasession[0].totalSession;
  //     } else {
  //       totalSession = 0;
  //     }
  //     data[0].totalSession = totalSession;

  //   }

  //   const messages = {
  //     "info": ["The proses successful"],
  //   };

  //   var timestamps_end = await this.util.getDateTimeString();
  //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, iduser, null, request_json);

  //   return {
  //     response_code: 202,
  //     "data": data,
  //     "message": messages
  //   }
  // }

  // async notifchallenge(idChallenge: string) {
  //   const mongoose = require('mongoose');
  //   var ObjectId = require('mongodb').ObjectId;

  //   var dt = new Date(Date.now());
  //   dt.setHours(dt.getHours() + 7); // timestamp
  //   dt = new Date(dt);

  //   var strdate = dt.toISOString();
  //   var repdate = strdate.replace('T', ' ');
  //   var splitdate = repdate.split('.');
  //   var timedatenow = splitdate[0];
  //   var lengchal = null;
  //   var datauserchall = null;
  //   var datachallenge = null;
  //   var datasubchallenge = null;
  //   var idsubchallenge = null;
  //   var notifikasiPush = null;
  //   var includeAkandatang = null;
  //   var titleAkandatang = null;
  //   var titleAkandatangEN = null;
  //   var descriptionAkandatang = null;
  //   var descriptionAkandatangEN = null;
  //   var unitAkandatang = null;
  //   var aturWaktuAkandatang = null;

  //   var includechallengeDimulai = null;
  //   var titlechallengeDimulai = null;
  //   var titlechallengeDimulaiEN = null;
  //   var descriptionchallengeDimulai = null;
  //   var descriptionchallengeDimulaiEN = null;
  //   var unitchallengeDimulai = null;
  //   var aturWaktuchallengeDimulai = null;

  //   var includeupdateLeaderboard = null;
  //   var titleupdateLeaderboard = null;
  //   var titleupdateLeaderboardEN = null;
  //   var descriptionupdateLeaderboard = null;
  //   var descriptionupdateLeaderboardEN = null;
  //   var unitupdateLeaderboard = null;
  //   var aturWaktuupdateLeaderboard = null;

  //   var includechallengeAkanBerakhir = null;
  //   var titlechallengeAkanBerakhir = null;
  //   var titlechallengeAkanBerakhirEN = null;
  //   var descriptionchallengeAkanBerakhir = null;
  //   var descriptionchallengeAkanBerakhirEN = null;
  //   var unitchallengeAkanBerakhir = null;
  //   var aturWaktuchallengeAkanBerakhir = null;

  //   var includeuntukPemenang = null;
  //   var titleuntukPemenang = null;
  //   var titleuntukPemenangEN = null;
  //   var descriptionuntukPemenang = null;
  //   var descriptionuntukPemenangEN = null;
  //   var unituntukPemenang = null;
  //   var aturWaktuuntukPemenang = null;

  //   var includechallengeBerakhir = null;
  //   var titlechallengeBerakhir = null;
  //   var titlechallengeBerakhirEN = null;
  //   var descriptionchallengeBerakhir = null;
  //   var descriptionchallengeBerakhirEN = null;
  //   var unitchallengeBerakhir = null;
  //   var aturWaktuchallengeBerakhir = null;

  //   var startTime = null;
  //   var endTime = null;
  //   var session = null;
  //   var nameChallenge = null;
  //   var userID = null;


  //   try {
  //     datauserchall = await this.userchallengeSS.listUserChallenge(idChallenge);
  //   } catch (e) {
  //     datauserchall = null;
  //   }

  //   if (datauserchall !== null && datauserchall.length > 0) {

  //     for (let i = 0; i < datauserchall.length; i++) {

  //       idsubchallenge = datauserchall[i].idSubChallenge;
  //       notifikasiPush = datauserchall[i].notifikasiPush;
  //       startTime = datauserchall[i].startDatetime;
  //       endTime = datauserchall[i].endDatetime;
  //       session = datauserchall[i].session;
  //       nameChallenge = datauserchall[i].nameChallenge;
  //       userID = datauserchall[i].userID;

  //       if (notifikasiPush !== undefined && notifikasiPush.length > 0) {
  //         let dataAkandatang = null;
  //         let datachallengeDimulai = null;
  //         let dataupdateLeaderboard = null;
  //         let datachallengeAkanBerakhir = null;
  //         let datachallengeBerakhir = null;
  //         let datauntukPemenang = null;

  //         try {
  //           dataAkandatang = notifikasiPush[0].akanDatang;
  //         } catch (e) {
  //           dataAkandatang = [];
  //         }
  //         if (dataAkandatang.length > 0) {
  //           includeAkandatang = dataAkandatang[0].include;
  //           titleAkandatang = dataAkandatang[0].title;
  //           titleAkandatangEN = dataAkandatang[0].titleEN;
  //           descriptionAkandatang = dataAkandatang[0].description;
  //           descriptionAkandatangEN = dataAkandatang[0].descriptionEN;
  //           unitAkandatang = dataAkandatang[0].unit;
  //           aturWaktuAkandatang = dataAkandatang[0].aturWaktu;
  //           let dt = new Date(startTime);
  //           dt.setHours(dt.getHours() + (7 + aturWaktuAkandatang)); // timestamp
  //           dt = new Date(dt);
  //           let strdate = dt.toISOString();
  //           let repdate = strdate.replace('T', ' ');
  //           let splitdate = repdate.split('.');
  //           let timedate = splitdate[0];

  //           if (includeAkandatang == "YES") {
  //             let arrdata = [];
  //             if (userID !== undefined && userID.length > 0) {

  //               for (let x = 0; x < userID.length; x++) {

  //                 let objintr = {
  //                   "idUser": userID[x].idUser,
  //                   "email": userID[x].email,
  //                   "username": userID[x].username,
  //                   "ranking": userID[x].ranking,
  //                   "title": titleAkandatang,
  //                   "titleEN": titleAkandatangEN,
  //                   "notification": descriptionAkandatang,
  //                   "notificationEN": descriptionAkandatangEN
  //                 };
  //                 arrdata.push(objintr);
  //               }
  //             }
  //             let notifChallenge_ = new notifChallenge();
  //             notifChallenge_.challengeID = mongoose.Types.ObjectId(idChallenge);
  //             notifChallenge_.datetime = timedate;
  //             notifChallenge_.subChallengeID = mongoose.Types.ObjectId(idsubchallenge);
  //             notifChallenge_.isSend = false;
  //             notifChallenge_.session = session;
  //             notifChallenge_.title = titleAkandatang;
  //             notifChallenge_.description = descriptionAkandatang;
  //             notifChallenge_.nameChallenge = nameChallenge;
  //             notifChallenge_.type = "akanDatang";
  //             notifChallenge_.userID = arrdata;
  //             notifChallenge_.createdAt = timedatenow;
  //             await this.notifChallengeService.create(notifChallenge_);
  //           }


  //         }


  //         try {
  //           datachallengeDimulai = notifikasiPush[0].challengeDimulai;
  //         } catch (e) {
  //           datachallengeDimulai = [];
  //         }
  //         if (datachallengeDimulai.length > 0) {
  //           includechallengeDimulai = datachallengeDimulai[0].include;
  //           titlechallengeDimulai = datachallengeDimulai[0].title;
  //           titlechallengeDimulaiEN = datachallengeDimulai[0].titleEN;
  //           descriptionchallengeDimulai = datachallengeDimulai[0].description;
  //           descriptionchallengeDimulaiEN = datachallengeDimulai[0].descriptionEN;
  //           unitchallengeDimulai = datachallengeDimulai[0].unit;
  //           aturWaktuchallengeDimulai = datachallengeDimulai[0].aturWaktu;
  //           let timedate = startTime;

  //           if (includechallengeDimulai == "YES") {
  //             let arrdata = [];
  //             if (userID !== undefined && userID.length > 0) {

  //               for (let x = 0; x < userID.length; x++) {

  //                 let objintr = {
  //                   "idUser": userID[x].idUser,
  //                   "email": userID[x].email,
  //                   "username": userID[x].username,
  //                   "ranking": userID[x].ranking,
  //                   "title": titlechallengeDimulai,
  //                   "titleEN": titlechallengeDimulaiEN,
  //                   "notification": descriptionchallengeDimulai,
  //                   "notificationEN": descriptionchallengeDimulaiEN
  //                 };
  //                 arrdata.push(objintr);
  //               }
  //             }
  //             let notifChallenge_ = new notifChallenge();

  //             notifChallenge_.challengeID = mongoose.Types.ObjectId(idChallenge);
  //             notifChallenge_.datetime = timedate;
  //             notifChallenge_.subChallengeID = mongoose.Types.ObjectId(idsubchallenge);
  //             notifChallenge_.isSend = false;
  //             notifChallenge_.session = session;
  //             notifChallenge_.title = titlechallengeDimulai;
  //             notifChallenge_.description = descriptionchallengeDimulai;
  //             notifChallenge_.nameChallenge = nameChallenge;
  //             notifChallenge_.type = "challengeDimulai";
  //             notifChallenge_.userID = arrdata;
  //             notifChallenge_.createdAt = timedatenow;
  //             await this.notifChallengeService.create(notifChallenge_);
  //           }
  //         }

  //         try {
  //           dataupdateLeaderboard = notifikasiPush[0].updateLeaderboard;
  //         } catch (e) {
  //           dataupdateLeaderboard = [];
  //         }
  //         if (dataupdateLeaderboard.length > 0) {
  //           includeupdateLeaderboard = dataupdateLeaderboard[0].include;
  //           titleupdateLeaderboard = dataupdateLeaderboard[0].title;
  //           titleupdateLeaderboardEN = dataupdateLeaderboard[0].titleEN;
  //           descriptionupdateLeaderboard = dataupdateLeaderboard[0].description;
  //           descriptionupdateLeaderboardEN = dataupdateLeaderboard[0].descriptionEN;
  //           unitupdateLeaderboard = dataupdateLeaderboard[0].unit;
  //           aturWaktuupdateLeaderboard = dataupdateLeaderboard[0].aturWaktu;

  //           let lengtime = aturWaktuupdateLeaderboard.length;
  //           if (includeupdateLeaderboard == "YES") {
  //             let arrdata = [];
  //             for (let i = 0; i < lengtime; i++) {
  //               let dt = new Date(startTime);
  //               dt.setHours(dt.getHours() + (7 + aturWaktuupdateLeaderboard[i])); // timestamp
  //               dt = new Date(dt);
  //               let strdate = dt.toISOString();
  //               let repdate = strdate.replace('T', ' ');
  //               let splitdate = repdate.split('.');
  //               let timedate = splitdate[0];



  //               if (userID !== undefined && userID.length > 0) {

  //                 for (let x = 0; x < userID.length; x++) {
  //                   let ket1 = descriptionupdateLeaderboard.replace("$username", userID[x].username);
  //                   let ket2 = ket1.replace("$ranking", userID[x].ranking);
  //                   var ket3 = ket2.replace("$title", titleupdateLeaderboard);

  //                   let ket1EN = descriptionupdateLeaderboardEN.replace("$username", userID[x].username);
  //                   let ket2EN = ket1EN.replace("$ranking", userID[x].ranking);
  //                   var ket3EN = ket2EN.replace("$title", titleupdateLeaderboardEN);
  //                   let objintr = {
  //                     "idUser": userID[x].idUser,
  //                     "email": userID[x].email,
  //                     "username": userID[x].username,
  //                     "ranking": userID[x].ranking,
  //                     "title": titleupdateLeaderboard,
  //                     "titleEN": titleupdateLeaderboardEN,
  //                     "notification": ket3,
  //                     "notificationEN": ket3EN
  //                   };
  //                   arrdata.push(objintr);
  //                 }
  //               }

  //               let notifChallenge_ = new notifChallenge();

  //               notifChallenge_.challengeID = mongoose.Types.ObjectId(idChallenge);
  //               notifChallenge_.datetime = timedate;
  //               notifChallenge_.subChallengeID = mongoose.Types.ObjectId(idsubchallenge);
  //               notifChallenge_.isSend = false;
  //               notifChallenge_.session = session;
  //               notifChallenge_.title = titleupdateLeaderboard;
  //               notifChallenge_.description = ket3;
  //               notifChallenge_.nameChallenge = nameChallenge;
  //               notifChallenge_.type = "updateLeaderboard";
  //               notifChallenge_.userID = arrdata;
  //               notifChallenge_.createdAt = timedatenow;
  //               await this.notifChallengeService.create(notifChallenge_);

  //             }
  //           }
  //         }

  //         try {
  //           datachallengeAkanBerakhir = notifikasiPush[0].challengeAkanBerakhir;
  //         } catch (e) {
  //           datachallengeAkanBerakhir = [];
  //         }
  //         if (datachallengeAkanBerakhir.length > 0) {
  //           includechallengeAkanBerakhir = datachallengeAkanBerakhir[0].include;
  //           titlechallengeAkanBerakhir = datachallengeAkanBerakhir[0].title;
  //           titlechallengeAkanBerakhirEN = datachallengeAkanBerakhir[0].titleEN;
  //           descriptionchallengeAkanBerakhir = datachallengeAkanBerakhir[0].description;
  //           descriptionchallengeAkanBerakhirEN = datachallengeAkanBerakhir[0].descriptionEN;
  //           unitchallengeAkanBerakhir = datachallengeAkanBerakhir[0].unit;
  //           aturWaktuchallengeAkanBerakhir = datachallengeAkanBerakhir[0].aturWaktu;

  //           let dt = new Date(endTime);
  //           dt.setHours(dt.getHours() + (7 + aturWaktuchallengeAkanBerakhir)); // timestamp
  //           dt = new Date(dt);
  //           let strdate = dt.toISOString();
  //           let repdate = strdate.replace('T', ' ');
  //           let splitdate = repdate.split('.');
  //           let timedate = splitdate[0];

  //           if (includechallengeAkanBerakhir == "YES") {
  //             let arrdata = [];
  //             if (userID !== undefined && userID.length > 0) {

  //               for (let x = 0; x < userID.length; x++) {

  //                 let objintr = {
  //                   "idUser": userID[x].idUser,
  //                   "email": userID[x].email,
  //                   "username": userID[x].username,
  //                   "ranking": userID[x].ranking,
  //                   "title": titlechallengeAkanBerakhir,
  //                   "titleEN": titlechallengeAkanBerakhirEN,
  //                   "notification": descriptionchallengeAkanBerakhir,
  //                   "notificationEN": descriptionchallengeAkanBerakhirEN
  //                 };
  //                 arrdata.push(objintr);
  //               }
  //             }
  //             let notifChallenge_ = new notifChallenge();

  //             notifChallenge_.challengeID = mongoose.Types.ObjectId(idChallenge);
  //             notifChallenge_.datetime = timedate;
  //             notifChallenge_.subChallengeID = mongoose.Types.ObjectId(idsubchallenge);
  //             notifChallenge_.isSend = false;
  //             notifChallenge_.session = session;
  //             notifChallenge_.title = titlechallengeAkanBerakhir;
  //             notifChallenge_.description = descriptionchallengeAkanBerakhir;
  //             notifChallenge_.nameChallenge = nameChallenge;
  //             notifChallenge_.type = "challengeAkanBerakhir";
  //             notifChallenge_.userID = arrdata;
  //             notifChallenge_.createdAt = timedatenow;
  //             await this.notifChallengeService.create(notifChallenge_);
  //           }
  //         }

  //         try {
  //           datachallengeBerakhir = notifikasiPush[0].challengeBerakhir;
  //         } catch (e) {
  //           datachallengeBerakhir = [];
  //         }
  //         if (datachallengeBerakhir.length > 0) {
  //           includechallengeBerakhir = datachallengeBerakhir[0].include;
  //           titlechallengeBerakhir = datachallengeBerakhir[0].title;
  //           titlechallengeBerakhirEN = datachallengeBerakhir[0].titleEN;
  //           descriptionchallengeBerakhir = datachallengeBerakhir[0].description;
  //           descriptionchallengeBerakhirEN = datachallengeBerakhir[0].descriptionEN;
  //           unitchallengeBerakhir = datachallengeBerakhir[0].unit;
  //           aturWaktuchallengeBerakhir = datachallengeBerakhir[0].aturWaktu;

  //           let dt = new Date(endTime);
  //           dt.setHours(dt.getHours() + (7 + aturWaktuchallengeBerakhir)); // timestamp
  //           dt = new Date(dt);
  //           let strdate = dt.toISOString();
  //           let repdate = strdate.replace('T', ' ');
  //           let splitdate = repdate.split('.');
  //           let timedate = splitdate[0];

  //           if (includechallengeBerakhir == "YES") {
  //             let arrdata = [];
  //             if (userID !== undefined && userID.length > 0) {

  //               for (let x = 0; x < userID.length; x++) {

  //                 let objintr = {
  //                   "idUser": userID[x].idUser,
  //                   "email": userID[x].email,
  //                   "username": userID[x].username,
  //                   "ranking": userID[x].ranking,
  //                   "title": titlechallengeBerakhir,
  //                   "titleEN": titlechallengeBerakhirEN,
  //                   "notification": descriptionchallengeBerakhir,
  //                   "notificationEN": descriptionchallengeBerakhirEN
  //                 };
  //                 arrdata.push(objintr);
  //               }
  //             }
  //             let notifChallenge_ = new notifChallenge();

  //             notifChallenge_.challengeID = mongoose.Types.ObjectId(idChallenge);
  //             notifChallenge_.datetime = timedate;
  //             notifChallenge_.subChallengeID = mongoose.Types.ObjectId(idsubchallenge);
  //             notifChallenge_.isSend = false;
  //             notifChallenge_.session = session;
  //             notifChallenge_.title = titlechallengeBerakhir;
  //             notifChallenge_.description = descriptionchallengeBerakhir;
  //             notifChallenge_.nameChallenge = nameChallenge;
  //             notifChallenge_.type = "challengeBerakhir";
  //             notifChallenge_.userID = arrdata;
  //             notifChallenge_.createdAt = timedatenow;
  //             await this.notifChallengeService.create(notifChallenge_);
  //           }
  //         }


  //         try {
  //           datauntukPemenang = notifikasiPush[0].untukPemenang;
  //         } catch (e) {
  //           datauntukPemenang = [];
  //         }
  //         if (datauntukPemenang.length > 0) {
  //           includeuntukPemenang = datauntukPemenang[0].include;
  //           titleuntukPemenang = datauntukPemenang[0].title;
  //           titleuntukPemenangEN = datauntukPemenang[0].titleEN;
  //           descriptionuntukPemenang = datauntukPemenang[0].description;
  //           descriptionuntukPemenangEN = datauntukPemenang[0].descriptionEN;
  //           unituntukPemenang = datauntukPemenang[0].unit;
  //           aturWaktuuntukPemenang = datauntukPemenang[0].aturWaktu;

  //           let dt = new Date(endTime);
  //           dt.setHours(dt.getHours() + (7 + aturWaktuuntukPemenang)); // timestamp
  //           dt = new Date(dt);
  //           let strdate = dt.toISOString();
  //           let repdate = strdate.replace('T', ' ');
  //           let splitdate = repdate.split('.');
  //           let timedate = splitdate[0];

  //           if (includeuntukPemenang == "YES") {
  //             let arrdata = [];
  //             if (userID !== undefined && userID.length > 0) {

  //               for (let x = 0; x < userID.length; x++) {

  //                 let ket1 = descriptionuntukPemenang.replace("$username", userID[x].username);
  //                 let ket2 = ket1.replace("$ranking", userID[x].ranking);
  //                 var ket3 = ket2.replace("$title", titleuntukPemenang);


  //                 let ket1EN = descriptionuntukPemenangEN.replace("$username", userID[x].username);
  //                 let ket2EN = ket1EN.replace("$ranking", userID[x].ranking);
  //                 var ket3EN = ket2EN.replace("$title", titleuntukPemenangEN);

  //                 let objintr = {
  //                   "idUser": userID[x].idUser,
  //                   "email": userID[x].email,
  //                   "username": userID[x].username,
  //                   "ranking": userID[x].ranking,
  //                   "title": titleuntukPemenang,
  //                   "titleEN": titleuntukPemenangEN,
  //                   "notification": ket3,
  //                   "notificationEN": ket3EN
  //                 }
  //                 arrdata.push(objintr);
  //               }
  //             }
  //             let notifChallenge_ = new notifChallenge();

  //             notifChallenge_.challengeID = mongoose.Types.ObjectId(idChallenge);
  //             notifChallenge_.datetime = timedate;
  //             notifChallenge_.subChallengeID = mongoose.Types.ObjectId(idsubchallenge);
  //             notifChallenge_.isSend = false;
  //             notifChallenge_.session = session;
  //             notifChallenge_.title = titleuntukPemenang;
  //             notifChallenge_.description = ket3;
  //             notifChallenge_.nameChallenge = nameChallenge;
  //             notifChallenge_.type = "untukPemenang";
  //             notifChallenge_.userID = userID;
  //             notifChallenge_.createdAt = timedatenow;
  //             await this.notifChallengeService.create(notifChallenge_);
  //           }
  //         }

  //       } else {
  //         console.log(notifikasiPush)
  //       }

  //     }

  //   }

  // }

  async notifchallenge(idChallenge: string) {
    var mongo = require('mongoose');
    var konvertid = new mongo.Types.ObjectId(idChallenge);
    var listpartisipan = null;
    var subchallenge = null;
    var pushnotifikasi = null;

    try {
      var detail = await this.challengeService.findOne(idChallenge);
      subchallenge = await this.subchallenge.findbyid(idChallenge);
      pushnotifikasi = detail.notifikasiPush[0];
      if (detail.peserta[0].caraGabung == "DENGAN UNDANGAN") {
        listpartisipan = detail.listParticipant;
        var result = await this.userbasicsSS.findInbyid(listpartisipan);
      }
      else {
        listpartisipan = null;
      }
    } catch (e) {
      listpartisipan = null;
    }

    var insertdatamany = [];
    for (var loopsub = 0; loopsub < subchallenge.length; loopsub++) {
      console.log("loop sub challenge " + subchallenge[loopsub]._id);
      for (const keyPush in pushnotifikasi) {
        var getkey = keyPush;
        var getdata = pushnotifikasi[getkey];
        var getdata = getdata[0];
        if (getdata.include == "YES") {
          // console.log(getkey);
          if (getkey == "akanDatang" || getkey == "challengeDimulai") {
            let dt = null;
            dt = new Date(subchallenge[loopsub].startDatetime);
            if (getkey == "akanDatang") {
              dt.setHours(dt.getHours() + 7 + getdata.aturWaktu); // timestamp
            }
            else {
              dt.setHours(dt.getHours() + 7); // timestamp
            }
            dt = new Date(dt);
            let strdate = dt.toISOString();
            let repdate = strdate.replace('T', ' ');
            let splitdate = repdate.split('.');
            let timedate = splitdate[0];

            var setinsertpartisipan = [];
            if (listpartisipan != null && listpartisipan.length != 0) {
              for (var j = 0; j < result.length; j++) {
                var setnotif = {};
                setnotif['idUser'] = result[j]._id;
                setnotif['email'] = result[j].email;
                setnotif['username'] = result[j].username;
                setnotif['ranking'] = 0;
                var gettitle = getdata.title;
                var converttitle = null;
                try {
                  var cariusername = gettitle.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  converttitle = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  converttitle = gettitle;
                }
                var gettitleEN = getdata.titleEN;
                var converttitleEN = null;
                try {
                  var cariusername = gettitleEN.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  converttitleEN = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  converttitleEN = gettitleEN;
                }
                var getdesc = getdata.description;
                var convertdesc = null;
                try {
                  var cariusername = getdesc.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  convertdesc = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  convertdesc = getdesc;
                }
                var getdescEN = getdata.descriptionEN;
                var convertdescEN = null;
                try {
                  var cariusername = getdescEN.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  convertdescEN = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  convertdescEN = getdescEN;
                }
                setnotif['title'] = converttitle;
                setnotif['titleEN'] = converttitleEN;
                setnotif['notification'] = convertdesc;
                setnotif['notificationEN'] = convertdescEN;
                // setnotif['title'] = getdata.title;
                // setnotif['titleEN'] = getdata.titleEN;
                // setnotif['notification'] = getdata.description;
                // setnotif['notificationEN'] = getdata.descriptionEN;
                setinsertpartisipan.push(setnotif);
              }
            }
            else {
              var setnotif = {};
              setnotif['idUser'] = "SEMUA PENGGUNA";
              setnotif['email'] = "SEMUA PENGGUNA";
              setnotif['username'] = "SEMUA PENGGUNA";
              setnotif['ranking'] = 0;
              var gettitle = getdata.title;
              var converttitle = null;
              try {
                var caribadge = gettitle.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                converttitle = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                converttitle = gettitle;
              }
              var gettitleEN = getdata.titleEN;
              var converttitleEN = null;
              try {
                var caribadge = gettitleEN.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                converttitleEN = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                converttitleEN = gettitleEN;
              }
              var getdesc = getdata.description;
              var convertdesc = null;
              try {
                var caribadge = getdesc.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                convertdesc = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                convertdesc = getdesc;
              }
              var getdescEN = getdata.descriptionEN;
              var convertdescEN = null;
              try {
                var caribadge = getdescEN.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                convertdescEN = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                convertdescEN = getdescEN;
              }
              setnotif['title'] = converttitle;
              setnotif['titleEN'] = converttitleEN;
              setnotif['notification'] = convertdesc;
              setnotif['notificationEN'] = convertdescEN;
              // setnotif['title'] = getdata.title;
              // setnotif['titleEN'] = getdata.titleEN;
              // setnotif['notification'] = getdata.description;
              // setnotif['notificationEN'] = getdata.descriptionEN;
              setinsertpartisipan.push(setnotif);
            }

            var setdata = new notifChallenge();
            setdata._id = mongo.Types.ObjectId();
            setdata.challengeID = subchallenge[loopsub].challengeId;
            setdata.subChallengeID = subchallenge[loopsub]._id;
            setdata.title = getdata.title;
            setdata.description = getdata.description;
            setdata.type = getkey;
            setdata.userID = setinsertpartisipan;
            setdata.session = subchallenge[loopsub].session;
            setdata.isSend = false;
            setdata.nameChallenge = detail.nameChallenge;
            setdata.datetime = timedate;
            if (listpartisipan == null || listpartisipan.length == 0) {
              setdata.all = 1;
            }
            setdata.createdAt = await this.util.getDateTimeString();
            // console.log(setdata);
            insertdatamany.push(setdata);
            try {
              await this.notifChallengeService.create(setdata);
            }
            catch (e) {
              console.log(e);
            }

            if (getkey == "challengeDimulai" && listpartisipan != null && listpartisipan.length != 0 && loopsub == 0) {
              var setinsertpartisipan = [];
              for (var j = 0; j < result.length; j++) {
                var setnotif = {};
                var titleID = 'Undangan challenge ' + detail.nameChallenge;
                var titleEN = detail.nameChallenge + " Challenge Invitation";
                var bodyID = 'Hai ' + result[j].username + ', kamu telah diundang untuk mengikuti challenge ' + detail.nameChallenge + '. Klik di sini!';
                var bodyEN = 'Hi ' + result[j].username + ', you have been invited to participate in The ' + detail.nameChallenge + ' challenge. Click here!';
                setnotif['idUser'] = result[j]._id;
                setnotif['email'] = result[j].email;
                setnotif['username'] = result[j].username;
                setnotif['title'] = titleID;
                setnotif['titleEN'] = titleEN;
                setnotif['notification'] = bodyID;
                setnotif['notificationEN'] = bodyEN;
                setnotif['ranking'] = 0;
                setinsertpartisipan.push(setnotif);
              }
              var setdata = new notifChallenge();
              setdata._id = mongo.Types.ObjectId();
              setdata.challengeID = subchallenge[loopsub].challengeId;
              setdata.subChallengeID = subchallenge[loopsub]._id;
              setdata.title = getdata.title;
              setdata.description = getdata.description;
              setdata.type = getkey;
              setdata.userID = setinsertpartisipan;
              setdata.session = subchallenge[loopsub].session;
              setdata.isSend = false;
              setdata.nameChallenge = detail.nameChallenge;
              setdata.datetime = subchallenge[loopsub].startDatetime;
              setdata.createdAt = await this.util.getDateTimeString();
              // console.log(setdata);
              insertdatamany.push(setdata);

              try {
                await this.notifChallengeService.create(setdata);
              }
              catch (e) {
                console.log(e);
              }
            }
          }
        }
      };
    }
  }

  async notifchallenge2(idChallenge: string) {
    var mongo = require('mongoose');
    var konvertid = new mongo.Types.ObjectId(idChallenge);
    var listpartisipan = null;
    var subchallenge = null;
    var pushnotifikasi = null;

    try {
      var detail = await this.challengeService.findOne(idChallenge);
      subchallenge = await this.subchallenge.findbyid(idChallenge);
      pushnotifikasi = detail.notifikasiPush[0];
      if (detail.peserta[0].caraGabung == "DENGAN UNDANGAN") {
        listpartisipan = detail.listParticipant;
        var result = await this.UserbasicnewService.findInbyid(listpartisipan);
      }
      else {
        listpartisipan = null;
      }
    } catch (e) {
      listpartisipan = null;
    }

    var insertdatamany = [];
    for (var loopsub = 0; loopsub < subchallenge.length; loopsub++) {
      console.log("loop sub challenge " + subchallenge[loopsub]._id);
      for (const keyPush in pushnotifikasi) {
        var getkey = keyPush;
        var getdata = pushnotifikasi[getkey];
        var getdata = getdata[0];
        if (getdata.include == "YES") {
          // console.log(getkey);
          if (getkey == "akanDatang" || getkey == "challengeDimulai") {
            let dt = null;
            dt = new Date(subchallenge[loopsub].startDatetime);
            if (getkey == "akanDatang") {
              dt.setHours(dt.getHours() + 7 + getdata.aturWaktu); // timestamp
            }
            else {
              dt.setHours(dt.getHours() + 7); // timestamp
            }
            dt = new Date(dt);
            let strdate = dt.toISOString();
            let repdate = strdate.replace('T', ' ');
            let splitdate = repdate.split('.');
            let timedate = splitdate[0];

            var setinsertpartisipan = [];
            if (listpartisipan != null && listpartisipan.length != 0) {
              for (var j = 0; j < result.length; j++) {
                var setnotif = {};
                setnotif['idUser'] = result[j]._id;
                setnotif['email'] = result[j].email;
                setnotif['username'] = result[j].username;
                setnotif['ranking'] = 0;
                var gettitle = getdata.title;
                var converttitle = null;
                try {
                  var cariusername = gettitle.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  converttitle = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  converttitle = gettitle;
                }
                var gettitleEN = getdata.titleEN;
                var converttitleEN = null;
                try {
                  var cariusername = gettitleEN.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  converttitleEN = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  converttitleEN = gettitleEN;
                }
                var getdesc = getdata.description;
                var convertdesc = null;
                try {
                  var cariusername = getdesc.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  convertdesc = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  convertdesc = getdesc;
                }
                var getdescEN = getdata.descriptionEN;
                var convertdescEN = null;
                try {
                  var cariusername = getdescEN.replaceAll("$username", result[j].username);
                  var ranking = cariusername.replaceAll("$ranking", "");
                  var badge = ranking.replaceAll("$badge", "");
                  convertdescEN = badge.replaceAll("$title", detail.nameChallenge);
                }
                catch (e) {
                  convertdescEN = getdescEN;
                }
                setnotif['title'] = converttitle;
                setnotif['titleEN'] = converttitleEN;
                setnotif['notification'] = convertdesc;
                setnotif['notificationEN'] = convertdescEN;
                // setnotif['title'] = getdata.title;
                // setnotif['titleEN'] = getdata.titleEN;
                // setnotif['notification'] = getdata.description;
                // setnotif['notificationEN'] = getdata.descriptionEN;
                setinsertpartisipan.push(setnotif);
              }
            }
            else {
              var setnotif = {};
              setnotif['idUser'] = "SEMUA PENGGUNA";
              setnotif['email'] = "SEMUA PENGGUNA";
              setnotif['username'] = "SEMUA PENGGUNA";
              setnotif['ranking'] = 0;
              var gettitle = getdata.title;
              var converttitle = null;
              try {
                var caribadge = gettitle.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                converttitle = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                converttitle = gettitle;
              }
              var gettitleEN = getdata.titleEN;
              var converttitleEN = null;
              try {
                var caribadge = gettitleEN.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                converttitleEN = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                converttitleEN = gettitleEN;
              }
              var getdesc = getdata.description;
              var convertdesc = null;
              try {
                var caribadge = getdesc.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                convertdesc = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                convertdesc = getdesc;
              }
              var getdescEN = getdata.descriptionEN;
              var convertdescEN = null;
              try {
                var caribadge = getdescEN.replaceAll("$title", detail.nameChallenge);
                var ranking = caribadge.replaceAll("$ranking", "");
                convertdescEN = ranking.replaceAll("$badge", "");
              }
              catch (e) {
                convertdescEN = getdescEN;
              }
              setnotif['title'] = converttitle;
              setnotif['titleEN'] = converttitleEN;
              setnotif['notification'] = convertdesc;
              setnotif['notificationEN'] = convertdescEN;
              // setnotif['title'] = getdata.title;
              // setnotif['titleEN'] = getdata.titleEN;
              // setnotif['notification'] = getdata.description;
              // setnotif['notificationEN'] = getdata.descriptionEN;
              setinsertpartisipan.push(setnotif);
            }

            var setdata = new notifChallenge();
            setdata._id = mongo.Types.ObjectId();
            setdata.challengeID = subchallenge[loopsub].challengeId;
            setdata.subChallengeID = subchallenge[loopsub]._id;
            setdata.title = getdata.title;
            setdata.description = getdata.description;
            setdata.type = getkey;
            setdata.userID = setinsertpartisipan;
            setdata.session = subchallenge[loopsub].session;
            setdata.isSend = false;
            setdata.nameChallenge = detail.nameChallenge;
            setdata.datetime = timedate;
            if (listpartisipan == null || listpartisipan.length == 0) {
              setdata.all = 1;
            }
            setdata.createdAt = await this.util.getDateTimeString();
            // console.log(setdata);
            insertdatamany.push(setdata);
            try {
              await this.notifChallengeService.create(setdata);
            }
            catch (e) {
              console.log(e);
            }

            if (getkey == "challengeDimulai" && listpartisipan != null && listpartisipan.length != 0 && loopsub == 0) {
              var setinsertpartisipan = [];
              for (var j = 0; j < result.length; j++) {
                var setnotif = {};
                var titleID = 'Undangan challenge ' + detail.nameChallenge;
                var titleEN = detail.nameChallenge + " Challenge Invitation";
                var bodyID = 'Hai ' + result[j].username + ', kamu telah diundang untuk mengikuti challenge ' + detail.nameChallenge + '. Klik di sini!';
                var bodyEN = 'Hi ' + result[j].username + ', you have been invited to participate in The ' + detail.nameChallenge + ' challenge. Click here!';
                setnotif['idUser'] = result[j]._id;
                setnotif['email'] = result[j].email;
                setnotif['username'] = result[j].username;
                setnotif['title'] = titleID;
                setnotif['titleEN'] = titleEN;
                setnotif['notification'] = bodyID;
                setnotif['notificationEN'] = bodyEN;
                setnotif['ranking'] = 0;
                setinsertpartisipan.push(setnotif);
              }
              var setdata = new notifChallenge();
              setdata._id = mongo.Types.ObjectId();
              setdata.challengeID = subchallenge[loopsub].challengeId;
              setdata.subChallengeID = subchallenge[loopsub]._id;
              setdata.title = getdata.title;
              setdata.description = getdata.description;
              setdata.type = getkey;
              setdata.userID = setinsertpartisipan;
              setdata.session = subchallenge[loopsub].session;
              setdata.isSend = false;
              setdata.nameChallenge = detail.nameChallenge;
              setdata.datetime = subchallenge[loopsub].startDatetime;
              setdata.createdAt = await this.util.getDateTimeString();
              // console.log(setdata);
              insertdatamany.push(setdata);

              try {
                await this.notifChallengeService.create(setdata);
              }
              catch (e) {
                console.log(e);
              }
            }
          }
        }
      };
    }
  }

  async insertuserintonotifchallenge(listjoin: any[]) {
    var targetlist = ['updateLeaderboard', 'challengeAkanBerakhir', 'challengeBerakhir', 'untukPemenang'];
    if (listjoin.length != 0) {
      var getuserbasic = listjoin[0].idUser;
      var getchallenge = listjoin[0].idChallenge;
      var basicdata = await this.userbasicsSS.getUserDetails(getuserbasic);
      var subdata = await this.subchallenge.findChild(getchallenge.toString());
      var detailchallenge = await this.challengeService.findOne(getchallenge.toString());
      var pushnotifikasi = detailchallenge.notifikasiPush[0];
      var listnotif = await this.notifChallengeService.findChild(getchallenge.toString());

      for (var i = 0; i < targetlist.length; i++) {
        var checkexist = false;
        for (var j = 0; j < listnotif.length; j++) {
          if (listnotif[j].type == targetlist[i]) {
            checkexist = true;
          }
        }

        if (checkexist == false) {
          if (pushnotifikasi[targetlist[i]][0].include == "YES") {
            var mongo = require('mongoose');
            var timenow = await this.util.getDateTimeString();
            var getpushnotif = pushnotifikasi[targetlist[i]];
            var aturWaktu = getpushnotif[0].aturWaktu;
            for (var loopsub = 0; loopsub < subdata.length; loopsub++) {
              var insertdata = new notifChallenge();
              insertdata.challengeID = subdata[loopsub].challengeId;
              insertdata.subChallengeID = new mongo.Types.ObjectId(subdata[loopsub]._id);
              insertdata.createdAt = timenow;
              insertdata.isSend = false;
              insertdata.title = getpushnotif[0].title;
              insertdata.description = getpushnotif[0].description;
              insertdata.userID = [];
              insertdata.session = subdata[loopsub].session;
              insertdata.nameChallenge = detailchallenge.nameChallenge;
              insertdata.type = targetlist[i];

              if (targetlist[i] == 'updateLeaderboard') {
                for (var loopleaderboard = 0; loopleaderboard < aturWaktu.length; loopleaderboard++) {
                  insertdata._id = new mongo.Types.ObjectId();
                  let dt = new Date(subdata[loopsub].startDatetime);
                  dt.setHours(dt.getHours() + 7 + aturWaktu[loopleaderboard]); // timestamp
                  dt = new Date(dt);
                  let strdate = dt.toISOString();
                  let repdate = strdate.replace('T', ' ');
                  let splitdate = repdate.split('.');
                  let timedate = splitdate[0];
                  insertdata.datetime = timedate;
                  await this.notifChallengeService.create(insertdata);
                }
              }
              else {
                insertdata._id = new mongo.Types.ObjectId();
                let dt = new Date(subdata[loopsub].endDatetime);
                dt.setHours(dt.getHours() + 7 + aturWaktu); // timestamp
                dt = new Date(dt);
                let strdate = dt.toISOString();
                let repdate = strdate.replace('T', ' ');
                let splitdate = repdate.split('.');
                let timedate = splitdate[0];
                insertdata.datetime = timedate;
                await this.notifChallengeService.create(insertdata);
              }
            }
          }
        }
      }

      var listnotif = await this.notifChallengeService.findChild(getchallenge.toString());

      console.log(listnotif);

      for (var i = 0; i < listjoin.length; i++) {
        for (var j = 0; j < listnotif.length; j++) {
          if (listnotif[j].type != "akanDatang" && listnotif[j].type != "challengeDimulai") {
            if (listnotif[j].subChallengeID.toString() == listjoin[i].idSubChallenge.toString()) {
              // console.log(listnotif[j]);
              var listuser = listnotif[j].userID;
              var typenotif = listnotif[j].type;
              var getnotifdata = detailchallenge.notifikasiPush[0][typenotif];
              console.log(getnotifdata);
              var setobject = {};
              setobject['idUser'] = getuserbasic;
              setobject['email'] = basicdata[0].email;
              setobject['username'] = basicdata[0].username;
              setobject['ranking'] = listjoin[i].ranking;
              var gettitle = getnotifdata[0].title;
              var converttitle = null;
              try {
                var cariusername = gettitle.replaceAll("$username", basicdata[0].username);
                converttitle = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                converttitle = gettitle;
              }
              var gettitleEN = getnotifdata[0].titleEN;
              var converttitleEN = null;
              try {
                var cariusername = gettitleEN.replaceAll("$username", basicdata[0].username);
                converttitleEN = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                converttitleEN = gettitleEN;
              }
              var getdesc = getnotifdata[0].description;
              var convertdesc = null;
              try {
                var cariusername = getdesc.replaceAll("$username", basicdata[0].username);
                convertdesc = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                convertdesc = getdesc;
              }
              var getdescEN = getnotifdata[0].descriptionEN;
              var convertdescEN = null;
              try {
                var cariusername = getdescEN.replaceAll("$username", basicdata[0].username);
                convertdescEN = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                convertdescEN = getdescEN;
              }
              setobject['title'] = converttitle;
              setobject['titleEN'] = converttitleEN;
              setobject['notification'] = convertdesc;
              setobject['notificationEN'] = convertdescEN;
              listuser.push(setobject);

              var updatedata = new notifChallenge();
              updatedata.userID = listuser;
              // console.log(listuser);

              await this.notifChallengeService.update(listnotif[j]._id.toString(), updatedata);
            }
          }
        }
      }
    }
  }

  async insertuserintonotifchallenge2(listjoin: any[]) {
    var targetlist = ['updateLeaderboard', 'challengeAkanBerakhir', 'challengeBerakhir', 'untukPemenang'];
    if (listjoin.length != 0) {
      var getuserbasic = listjoin[0].idUser;
      var getchallenge = listjoin[0].idChallenge;
      var basicdata = await this.UserbasicnewService.findOne(getuserbasic.toString());
      var subdata = await this.subchallenge.findChild(getchallenge.toString());
      var detailchallenge = await this.challengeService.findOne(getchallenge.toString());
      var pushnotifikasi = detailchallenge.notifikasiPush[0];
      var listnotif = await this.notifChallengeService.findChild(getchallenge.toString());

      for (var i = 0; i < targetlist.length; i++) {
        var checkexist = false;
        for (var j = 0; j < listnotif.length; j++) {
          if (listnotif[j].type == targetlist[i]) {
            checkexist = true;
          }
        }

        if (checkexist == false) {
          if (pushnotifikasi[targetlist[i]][0].include == "YES") {
            var mongo = require('mongoose');
            var timenow = await this.util.getDateTimeString();
            var getpushnotif = pushnotifikasi[targetlist[i]];
            var aturWaktu = getpushnotif[0].aturWaktu;
            for (var loopsub = 0; loopsub < subdata.length; loopsub++) {
              var insertdata = new notifChallenge();
              insertdata.challengeID = subdata[loopsub].challengeId;
              insertdata.subChallengeID = new mongo.Types.ObjectId(subdata[loopsub]._id);
              insertdata.createdAt = timenow;
              insertdata.isSend = false;
              insertdata.title = getpushnotif[0].title;
              insertdata.description = getpushnotif[0].description;
              insertdata.userID = [];
              insertdata.session = subdata[loopsub].session;
              insertdata.nameChallenge = detailchallenge.nameChallenge;
              insertdata.type = targetlist[i];

              if (targetlist[i] == 'updateLeaderboard') {
                for (var loopleaderboard = 0; loopleaderboard < aturWaktu.length; loopleaderboard++) {
                  insertdata._id = new mongo.Types.ObjectId();
                  let dt = new Date(subdata[loopsub].startDatetime);
                  dt.setHours(dt.getHours() + 7 + aturWaktu[loopleaderboard]); // timestamp
                  dt = new Date(dt);
                  let strdate = dt.toISOString();
                  let repdate = strdate.replace('T', ' ');
                  let splitdate = repdate.split('.');
                  let timedate = splitdate[0];
                  insertdata.datetime = timedate;
                  await this.notifChallengeService.create(insertdata);
                }
              }
              else {
                insertdata._id = new mongo.Types.ObjectId();
                let dt = new Date(subdata[loopsub].endDatetime);
                dt.setHours(dt.getHours() + 7 + aturWaktu); // timestamp
                dt = new Date(dt);
                let strdate = dt.toISOString();
                let repdate = strdate.replace('T', ' ');
                let splitdate = repdate.split('.');
                let timedate = splitdate[0];
                insertdata.datetime = timedate;
                await this.notifChallengeService.create(insertdata);
              }
            }
          }
        }
      }

      var listnotif = await this.notifChallengeService.findChild(getchallenge.toString());

      console.log(listnotif);

      for (var i = 0; i < listjoin.length; i++) {
        for (var j = 0; j < listnotif.length; j++) {
          if (listnotif[j].type != "akanDatang" && listnotif[j].type != "challengeDimulai") {
            if (listnotif[j].subChallengeID.toString() == listjoin[i].idSubChallenge.toString()) {
              // console.log(listnotif[j]);
              var listuser = listnotif[j].userID;
              var typenotif = listnotif[j].type;
              var getnotifdata = detailchallenge.notifikasiPush[0][typenotif];
              console.log(getnotifdata);
              var setobject = {};
              setobject['idUser'] = getuserbasic;
              setobject['email'] = basicdata.email;
              setobject['username'] = basicdata.username;
              setobject['ranking'] = listjoin[i].ranking;
              var gettitle = getnotifdata[0].title;
              var converttitle = null;
              try {
                var cariusername = gettitle.replaceAll("$username", basicdata.username);
                converttitle = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                converttitle = gettitle;
              }
              var gettitleEN = getnotifdata[0].titleEN;
              var converttitleEN = null;
              try {
                var cariusername = gettitleEN.replaceAll("$username", basicdata.username);
                converttitleEN = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                converttitleEN = gettitleEN;
              }
              var getdesc = getnotifdata[0].description;
              var convertdesc = null;
              try {
                var cariusername = getdesc.replaceAll("$username", basicdata.username);
                convertdesc = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                convertdesc = getdesc;
              }
              var getdescEN = getnotifdata[0].descriptionEN;
              var convertdescEN = null;
              try {
                var cariusername = getdescEN.replaceAll("$username", basicdata.username);
                convertdescEN = cariusername.replaceAll("$title", detailchallenge.nameChallenge);
              }
              catch (e) {
                convertdescEN = getdescEN;
              }
              setobject['title'] = converttitle;
              setobject['titleEN'] = converttitleEN;
              setobject['notification'] = convertdesc;
              setobject['notificationEN'] = convertdescEN;
              listuser.push(setobject);

              var updatedata = new notifChallenge();
              updatedata.userID = listuser;
              // console.log(listuser);

              await this.notifChallengeService.update(listnotif[j]._id.toString(), updatedata);
            }
          }
        }
      }
    }
  }

  async checknonactivechallenge() {
    var data = await this.challengeService.find();
    var panjangdata = data.length;

    for (var i = 0; i < data.length; i++) {
      var getdata = data[i];
      if (getdata.statusChallenge == 'DRAFT') {
        var getdate = getdata.endChallenge + " " + getdata.endTime;
        var convertold = new Date(getdate);
        var getnow = await this.util.getDateTimeString();
        var convertnow = new Date(getnow);

        var datenow = convertold.getTime() - convertnow.getTime();
        if (datenow < 0) {
          var mongo = require('mongoose');
          var konvertid = new mongo.Types.ObjectId(getdata._id);
          var updatedata = getdata;
          updatedata.statusChallenge = 'NONACTIVE';
          await this.challengeService.update(konvertid, updatedata);
        }
      }
    }
  }

  // async sendNotifeChallenge() {

  //   var datanotif = null;
  //   var email = null;
  //   var body = null;
  //   var bodyEN = null;
  //   var title = null;
  //   var titleEN = null;
  //   //var timenow = null;
  //   var datetime = null;
  //   var challengeID = null;
  //   var typeChallenge = null;
  //   var databasic = null;
  //   var id = null;
  //   var type = null;
  //   var languages = null;
  //   var idlanguages = null;
  //   var datalanguage = null;
  //   var langIso = null;
  //   var datapemenang = null;
  //   var getlastrank = null;
  //   try {
  //     datanotif = await this.notifChallengeService.listnotifchallenge();
  //   } catch (e) {
  //     datanotif = null;
  //   }
  //   // timenow = new Date(Date.now());
  //   if (datanotif !== null && datanotif.length > 0) {

  //     for (let i = 0; i < datanotif.length; i++) {
  //       id = datanotif[i]._id;
  //       challengeID = datanotif[i].challengeID;
  //       email = datanotif[i].email;
  //       title = datanotif[i].title;
  //       titleEN = datanotif[i].titleEN;
  //       body = datanotif[i].notification;
  //       bodyEN = datanotif[i].notificationEN;
  //       datetime = datanotif[i].datetime;
  //       type = datanotif[i].type;
  //       typeChallenge = datanotif[i].typeChallenge;

  //       try {
  //         databasic = await this.userbasicsSS.findOne(email);
  //       } catch (e) {
  //         databasic = null;
  //       }

  //       if (databasic !== null) {
  //         try {
  //           languages = databasic.languages;
  //           idlanguages = languages.oid.toString();
  //           datalanguage = await this.languagesService.findOne(idlanguages)
  //           langIso = datalanguage.langIso;

  //           console.log(idlanguages)
  //         } catch (e) {
  //           languages = null;
  //           idlanguages = "";
  //           datalanguage = null;
  //           langIso = "";
  //         }

  //       }

  //       // if (timenow == new Date(datetime)) {

  //       if (type == "untukPemenang") {
  //         try {
  //           datapemenang = await this.subchallenge.getpemenang(challengeID.toString());
  //         } catch (e) {
  //           datapemenang = null;
  //         }
  //         if (datapemenang !== null && datapemenang.length > 0) {

  //           try {
  //             getlastrank = datapemenang[0].getlastrank;
  //           } catch (e) {
  //             getlastrank = null;
  //           }
  //           if (getlastrank !== null && getlastrank.length > 0) {
  //             for (let x = 0; x < getlastrank.length; x++) {
  //               let emailmenang = getlastrank[x].email

  //               if (langIso == "id") {
  //                 await this.util.sendNotifChallenge(emailmenang, title, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge);
  //                 await this.notifChallengeService.updateStatussend(id.toString(), email);
  //               } else {
  //                 await this.util.sendNotifChallenge(emailmenang, titleEN, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge);
  //                 await this.notifChallengeService.updateStatussend(id.toString(), email);
  //               }


  //             }

  //           }

  //         }


  //       } else {

  //         if (langIso == "id") {
  //           await this.util.sendNotifChallenge(email, title, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge);
  //           await this.notifChallengeService.updateStatussend(id.toString(), email);
  //         } else {
  //           await this.util.sendNotifChallenge(email, titleEN, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge);
  //           await this.notifChallengeService.updateStatussend(id.toString(), email);
  //         }

  //       }

  //       //}

  //     }

  //   }

  // }

  @UseGuards(JwtAuthGuard)
  @Post('join/currentstatus')
  async cekjoinchallengeuser(@Req() request, @Headers() header) {
    var iduser = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json['idUser'] == null || request_json['idUser'] == undefined) {
      throw new BadRequestException("Unable to proceed, idUser field is required");
    }
    iduser = request_json['idUser'];

    var result = await this.userchallengeSS.checkuserstatusjoin(iduser);
    if (result == null) {
      result = {
        join_status: false
      };
    }

    return {
      response_code: 202,
      data: result
    }
  }

  async beforejoinchallenge2(emailuser: any, subchallenge: any) {
    var data = await this.subchallenge.getlistinsertpostchallenge2(emailuser.email.toString(), subchallenge.idSubChallenge.toString());

    if (data.length != 0) {
      var mongo = require('mongoose');
      var totalScore = subchallenge.score;
      var setinsertactivity = [];
      for (var i = 0; i < data.length; i++) {
        totalScore = totalScore + data[i].totalScore;
        var insertdata = new Postchallenge();

        insertdata._id = new mongo.Types.ObjectId();
        insertdata.postID = data[i]._id;
        insertdata.createdAt = await this.util.getDateTimeString();
        insertdata.idChallenge = new mongo.Types.ObjectId(subchallenge.idChallenge);
        insertdata.idSubChallenge = new mongo.Types.ObjectId(subchallenge.idSubChallenge);
        insertdata.session = subchallenge.session;
        insertdata.startDatetime = subchallenge.startDatetime;
        insertdata.endDatetime = subchallenge.endDatetime;
        insertdata.updatedAt = await this.util.getDateTimeString();
        insertdata.idUser = new mongo.Types.ObjectId(emailuser._id);
        insertdata.score = data[i].totalScore;
        insertdata.postType = data[i].postType;

        setinsertactivity.push(
          {
            "type": "posts",
            "id": data[i]._id,
            "desc": "POST"
          }
        );

        if (data[i].contentEventList.length != 0) {
          var datacontentevent = data[i].contentEventList;
          for (var loopactivity = 0; loopactivity < datacontentevent.length; loopactivity++) {
            setinsertactivity.push(
              {
                "type": "contentevents",
                "id": datacontentevent[loopactivity].contentEventID,
                "desc": datacontentevent[loopactivity].eventType
              }
            );
          }
        }

        await this.postchallengeService.create(insertdata);
      }

      var updatedata = new Userchallenges();
      updatedata.score = totalScore;
      updatedata.activity = setinsertactivity;
      await this.userchallengeSS.update(subchallenge._id, updatedata);
    }
  }

  async beforejoinchallenge(emailuser: any, subchallenge: any) {
    var data = await this.subchallenge.getlistinsertpostchallenge(emailuser.email.toString(), subchallenge.idSubChallenge.toString());

    if (data.length != 0) {
      var mongo = require('mongoose');
      var totalScore = subchallenge.score;
      var setinsertactivity = [];
      for (var i = 0; i < data.length; i++) {
        totalScore = totalScore + data[i].totalScore;
        var insertdata = new Postchallenge();

        insertdata._id = new mongo.Types.ObjectId();
        insertdata.postID = data[i]._id;
        insertdata.createdAt = await this.util.getDateTimeString();
        insertdata.idChallenge = new mongo.Types.ObjectId(subchallenge.idChallenge);
        insertdata.idSubChallenge = new mongo.Types.ObjectId(subchallenge.idSubChallenge);
        insertdata.session = subchallenge.session;
        insertdata.startDatetime = subchallenge.startDatetime;
        insertdata.endDatetime = subchallenge.endDatetime;
        insertdata.updatedAt = await this.util.getDateTimeString();
        insertdata.idUser = new mongo.Types.ObjectId(emailuser._id);
        insertdata.score = data[i].totalScore;
        insertdata.postType = data[i].postType;

        setinsertactivity.push(
          {
            "type": "posts",
            "id": data[i]._id,
            "desc": "POST"
          }
        );

        if (data[i].contentEventList.length != 0) {
          var datacontentevent = data[i].contentEventList;
          for (var loopactivity = 0; loopactivity < datacontentevent.length; loopactivity++) {
            setinsertactivity.push(
              {
                "type": "contentevents",
                "id": datacontentevent[loopactivity].contentEventID,
                "desc": datacontentevent[loopactivity].eventType
              }
            );
          }
        }

        // console.log(insertdata);
        await this.postchallengeService.create(insertdata);
      }

      var updatedata = new Userchallenges();
      updatedata.score = totalScore;
      updatedata.activity = setinsertactivity;
      await this.userchallengeSS.update(subchallenge._id, updatedata);
    }
  }

  async sendnotifmasalchallenge(notifid: string, title: string, titleEN: string, bodyin: any, bodyeng: any, challengeid: string, type: string) {
    var mongo = require('mongoose');
    var limit = 100;
    var totalall = null;

    var gettotaluser = await this.userbasicsSS.getcount();
    try {
      totalall = gettotaluser[0].totalpost / limit;
    } catch (e) {
      gettotaluser = null;
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

    for (let i = 0; i < totalpage; i++) {
      var data = await this.userbasicsSS.getuser(i, limit);
      for (var j = 0; j < data.length; j++) {
        var language = data[i].languages;
        if (language.id == new mongo.Types.ObjectId("613bc5daf9438a7564ca798a")) {
          await this.util.sendNotifChallenge("", data[i].email.toString(), title, bodyin, bodyeng, "CHALLENGE", "ACCEPT", challengeid, type, "", "");
        } else {
          await this.util.sendNotifChallenge("", data[i].email.toString(), titleEN, bodyin, bodyeng, "CHALLENGE", "ACCEPT", challengeid, type, "", "");
        }
      }
    }

    await this.notifChallengeService.updateStatussend(notifid);
  }

  @Post('userbadge')
  async userbadges() {
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp

    dt = new Date(dt);
    var td = dt;
    td.setSeconds(dt.getSeconds() + 1);
    td = new Date(td);
    var strdate = td.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];
    //this.sendNotifeChallenge();
    //  this.updateUserbadge();

    const messages = {
      "info": ["The proses successful"],
    };

    return {
      response_code: 202,
      "message": timedate
    }
  }

  async updateBadgeex() {

    var idUser = null;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var strdate = dt.toISOString();
    var repdate = strdate.replace('T', ' ');
    var splitdate = repdate.split('.');
    var timedate = splitdate[0];

    var datasubchalange = null;

    var idusbadge = null;

    try {
      datasubchalange = await this.userbadgeService.getUserbadgeExpired();

    } catch (e) {
      datasubchalange = null;
    }

    if (datasubchalange !== null) {
      for (let x = 0; x < datasubchalange.length; x++) {
        try {
          idusbadge = datasubchalange[x]._id.toString();
        } catch (e) {
          idusbadge = null;
        }

        if (idusbadge !== null && idusbadge !== undefined) {
          try {
            await this.userbadgeService.updateNonactive(idusbadge.toString());
            console.log("iduser: " + idUser.toString() + " berhasil update " + idusbadge.toString());
          } catch (e) {
            console.log("iduser: " + idUser.toString() + " gagal update " + idusbadge.toString());
          }
        }
      }

    }


  }

  @UseGuards(JwtAuthGuard)
  @Post('user/delete')
  async delete(@Res() res, @Req() request: Request, @Headers() headers) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var idchallenge = request_json['idChallenge'];
    var email = request_json['email'];
    var idadmin = request_json['idAdmin'];
    var reason = request_json['reason'];

    if (idchallenge == null && idchallenge == undefined) {
      throw new BadRequestException("Unabled to proceed, challenge id field is required");
    }

    if (email == null && email == undefined) {
      throw new BadRequestException("Unabled to proceed, user id field is required");
    }

    if (idadmin == null && idadmin == undefined) {
      throw new BadRequestException("Unabled to proceed, admin id field is required");
    }

    if (reason == null && reason == undefined) {
      throw new BadRequestException("Unabled to proceed, reason field is required");
    }

    var exileUser = await this.userbasicsSS.findOne(email);
    var admin = await this.userbasicsSS.findbyid(idadmin);

    var getuserchallenge = await this.userchallengeSS.findByChallengeandUser(idchallenge, exileUser._id.toString());

    if (getuserchallenge.length != 0) {
      var insertid = [];
      var getarray = getuserchallenge[0].rejectRemark;
      if (getarray == null || getarray == undefined) {
        getarray = [];
      }
      var insertreject = {};
      insertreject['idAdmin'] = idadmin;
      insertreject['time'] = await this.util.getDateTimeString();
      insertreject['emailAdmin'] = admin.email;

      var insertstring = reason;
      var getdetail = await this.challengeService.findOne(idchallenge);
      if (getdetail.objectChallenge == "KONTEN") {
        var getdata = await this.postchallengeService.findByUserandChallenge(idchallenge, exileUser._id.toString());
        if (getdata.length != 0) {
          insertstring = insertstring + " total score per post before kick :";
          for (var looppostchallenge = 0; looppostchallenge < getdata.length; looppostchallenge++) {
            insertstring = insertstring + " postID (" + getdata[looppostchallenge].postID + ") = " + getdata[looppostchallenge].score + (looppostchallenge == getdata.length - 1 ? "." : ",");

            await this.postchallengeService.updateByUSer(getdata[looppostchallenge]._id, getdata[looppostchallenge].idSubChallenge, getdata[looppostchallenge].idChallenge, getdata[looppostchallenge].postID);
          }

        }
      }

      insertreject['remark'] = insertstring;
      getarray.push(insertreject);

      var updatedata = new Userchallenges();
      updatedata.isActive = false;
      updatedata.ranking = null;
      updatedata.rejectRemark = getarray;
      updatedata.updatedAt = await this.util.getDateTimeString();

      for (var i = 0; i < getuserchallenge.length; i++) {
        insertid.push(getuserchallenge[i]._id.toString());
      }

      try {
        await this.userchallengeSS.delete(insertid, exileUser._id.toString(), updatedata);

        this.deleteDataviaBelakang(exileUser, idchallenge, reason);

        const messages = {
          "info": ["The create successful"],
        };

        res.status(HttpStatus.OK).json({
          response_code: 202,
          "message": messages
        });
      }
      catch (e) {
        console.log(e);
      }
    }
    else {
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": "data not found"
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/delete/v2')
  async delete2(@Res() res, @Req() request: Request, @Headers() headers) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var idchallenge = request_json['idChallenge'];
    var email = request_json['email'];
    var idadmin = request_json['idAdmin'];
    var reason = request_json['reason'];

    if (idchallenge == null && idchallenge == undefined) {
      throw new BadRequestException("Unabled to proceed, challenge id field is required");
    }

    if (email == null && email == undefined) {
      throw new BadRequestException("Unabled to proceed, user id field is required");
    }

    if (idadmin == null && idadmin == undefined) {
      throw new BadRequestException("Unabled to proceed, admin id field is required");
    }

    if (reason == null && reason == undefined) {
      throw new BadRequestException("Unabled to proceed, reason field is required");
    }

    var exileUser = await this.UserbasicnewService.findbyemail(email);
    var admin = await this.UserbasicnewService.findOne(idadmin);

    var getuserchallenge = await this.userchallengeSS.findByChallengeandUser(idchallenge, exileUser._id.toString());

    if (getuserchallenge.length != 0) {
      var insertid = [];
      var getarray = getuserchallenge[0].rejectRemark;
      if (getarray == null || getarray == undefined) {
        getarray = [];
      }
      var insertreject = {};
      insertreject['idAdmin'] = idadmin;
      insertreject['time'] = await this.util.getDateTimeString();
      insertreject['emailAdmin'] = admin.email;

      var insertstring = reason;
      var getdetail = await this.challengeService.findOne(idchallenge);
      if (getdetail.objectChallenge == "KONTEN") {
        var getdata = await this.postchallengeService.findByUserandChallenge(idchallenge, exileUser._id.toString());
        if (getdata.length != 0) {
          insertstring = insertstring + " total score per post before kick :";
          for (var looppostchallenge = 0; looppostchallenge < getdata.length; looppostchallenge++) {
            insertstring = insertstring + " postID (" + getdata[looppostchallenge].postID + ") = " + getdata[looppostchallenge].score + (looppostchallenge == getdata.length - 1 ? "." : ",");

            await this.postchallengeService.updateByUSer(getdata[looppostchallenge]._id, getdata[looppostchallenge].idSubChallenge, getdata[looppostchallenge].idChallenge, getdata[looppostchallenge].postID);
          }

        }
      }

      insertreject['remark'] = insertstring;
      getarray.push(insertreject);

      var updatedata = new Userchallenges();
      updatedata.isActive = false;
      updatedata.ranking = null;
      updatedata.rejectRemark = getarray;
      updatedata.updatedAt = await this.util.getDateTimeString();

      for (var i = 0; i < getuserchallenge.length; i++) {
        insertid.push(getuserchallenge[i]._id.toString());
      }

      try {
        await this.userchallengeSS.delete(insertid, exileUser._id.toString(), updatedata);

        this.deleteDataviaBelakang(exileUser, idchallenge, reason);

        const messages = {
          "info": ["The create successful"],
        };

        res.status(HttpStatus.OK).json({
          response_code: 202,
          "message": messages
        });
      }
      catch (e) {
        console.log(e);
      }
    }
    else {
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": "data not found"
      });
    }
  }

  async deleteDataviaBelakang(userdata: any, idchallenge: string, alasan: string) {
    var detail = await this.challengeService.detailchallenge(idchallenge);
    var mongo = require('mongoose');
    var language = JSON.parse(JSON.stringify(userdata.languages));
    var title = null;
    var bodyin = "Yah! Kamu telah dikeluarkan dari challenge karena melanggar aturan komunitas Hyppe. Alasan Pengeluaran: " + alasan;
    // var bodyin = "Yah! Kamu telah dikeluarkan dari challenge karena melanggar aturan komunitas Hyppe. Alasan Pengeluaran: " + alasan;
    // var bodyeng = "Oh no! You have been kicked out of the challenge for violating Hyppe's community guideline. Violation reason: " + alasan;
    title = "Diskualifikasi dari challenge " + detail.nameChallenge;
    // if (language.$id.toString() == "613bc5daf9438a7564ca798a") {
    //   title = "Diskualifikasi dari challenge " + detail.nameChallenge;
    // } else {
    //   title = "You have been disqualified from the " + detail.nameChallenge;
    // }

    await this.util.sendNotifChallenge("REMOVE", userdata.email.toString(), title, bodyin, bodyin, "CHALLENGE", "ACCEPT", idchallenge, "REMOVE PARTICIPANT", "", "");

    var listnotif = await this.notifChallengeService.findChild(idchallenge);
    for (var i = 0; i < listnotif.length; i++) {
      var temparray = [];
      var getuserid = listnotif[i].userID;
      for (var j = 0; j < getuserid.length; j++) {
        var getlistuser = getuserid[j];
        if (getlistuser.email != userdata.email) {
          temparray.push(getlistuser);
        }
      }

      var updatedata = new notifChallenge();
      updatedata.userID = temparray;

      await this.notifChallengeService.update(listnotif[i]._id.toString(), updatedata);
    }

    var subdata = await this.subchallenge.findbyid(idchallenge);
    var timenow = await this.util.getDateTimeString();

    for (var i = 0; i < subdata.length; i++) {
      var getsubdata = subdata[i]._id;
      var listuserchallenge = await this.userchallengeSS.datauserchallbyidchall(idchallenge, getsubdata);
      for (var j = 0; j < listuserchallenge.length; j++) {
        var updaterank = j + 1;
        await this.userchallengeSS.updateRangking(listuserchallenge[j]._id.toString(), updaterank, timenow);
      }
    }

  }

  async hapuschallenge(idchallenge: string) {
    var dummydate = new Date();
    var convert = dummydate.toISOString();
    var resultdummy = convert.split("T")[0] + " 00:00:00";
    var subdata = await this.subchallenge.findChild(idchallenge);
    if (subdata.length != 0) {
      for (var loopsub = 0; loopsub < subdata.length; loopsub++) {
        var userchallenge = await this.userchallengeSS.datauserchallbyidchall(idchallenge, subdata[loopsub]._id.toString());
        if (userchallenge.length != 0) {
          for (var loopchild = 0; loopchild < userchallenge.length; loopchild++) {
            var updateuser = new Userchallenges();
            updateuser.isActive = false;
            updateuser.updatedAt = await this.util.getDateTimeString();

            await this.userchallengeSS.update(userchallenge[loopchild]._id.toString(), updateuser);
          }
        }

        var updatedata = new subChallenge();
        updatedata.isActive = false;

        await this.subchallenge.updateNonactive(subdata[loopsub]._id.toString());
      }
    }

    var notifdata = await this.notifChallengeService.findChild(idchallenge);
    for (var loopnotif = 0; loopnotif < notifdata.length; loopnotif++) {
      var getdata = notifdata[loopnotif];
      var updatenotif = new notifChallenge();
      updatenotif.isSend = true;

      await this.notifChallengeService.update(getdata._id.toString(), updatenotif);
    }
  }

  async sendNotifeChallenge() {

    var datanotif = null;
    var email = null;
    var body = null;
    var bodyEN = null;
    var title = null;
    var titleEN = null;
    //var timenow = null;
    var datetime = null;
    var challengeID = null;
    var typeChallenge = null;
    var databasic = null;
    var id = null;
    var type = null;
    var languages = null;
    var idlanguages = null;
    var datalanguage = null;
    var langIso = null;
    var datapemenang = null;
    var getlastrank = null;
    var username = null;
    var ranking = null;
    var idUser = null;
    var databadge = null;
    var session = null;
    var subChallengeID = null;
    var titleAsli = null;
    var description = null;
    var all = null;
    var datanotifbyid = null;
    try {
      datanotif = await this.notifChallengeService.listnotifchallenge();
    } catch (e) {
      datanotif = null;
    }
    // timenow = new Date(Date.now());
    if (datanotif !== null && datanotif.length > 0) {

      for (let i = 0; i < datanotif.length; i++) {
        id = datanotif[i]._id;

        if (id.toString() == "652ff285884d9ebb5fc69428") {
          try {
            datanotifbyid = await this.notifChallengeService.listnotifchallengeByid("652ff285884d9ebb5fc69428");
          } catch (e) {
            datanotifbyid = null;
          }

          if (datanotifbyid !== null && datanotifbyid.length > 0) {
            for (let y = 0; y < datanotifbyid.length; y++) {

              challengeID = datanotif[y].challengeID;
              titleAsli = datanotif[y].titleAsli;
              email = datanotif[y].email;
              description = datanotif[y].description;
              username = datanotif[y].username;
              idUser = datanotif[y].idUser;
              ranking = datanotif[y].ranking;
              title = datanotif[y].title;
              titleEN = datanotif[y].titleEN;
              body = datanotif[y].notification;
              bodyEN = datanotif[y].notificationEN;
              datetime = datanotif[y].datetime;
              type = datanotif[y].type;
              subChallengeID = datanotif[y].subChallengeID;
              typeChallenge = datanotif[y].typeChallenge;
              session = datanotif[y].session;
              all = datanotif[y].all;
              // if (all !== undefined && all == 1) {
              //   this.sendnotifmasalchallenge(challengeID.toString(), subChallengeID.toString(), 100);
              // } 
              // else {
              try {
                databasic = await this.userbasicsSS.findOne(email);
              } catch (e) {
                databasic = null;
              }

              if (databasic !== null) {
                try {
                  languages = databasic.languages;
                  idlanguages = languages.oid.toString();
                  datalanguage = await this.languagesService.findOne(idlanguages)
                  langIso = datalanguage.langIso;

                  console.log(idlanguages)
                } catch (e) {
                  languages = null;
                  idlanguages = "";
                  datalanguage = null;
                  langIso = "";
                }

              }


              if (type == "untukPemenang") {

                let datasub = null;

                try {
                  datasub = await this.subchallenge.findOneByChallenge(subChallengeID.toString(), challengeID.toString(),);
                } catch (e) {
                  datasub = null;
                }

                if (datasub !== null) {
                  let endDatetime = null;
                  var dt = new Date(Date.now());
                  dt.setHours(dt.getHours() + 7); // timestamp
                  dt = new Date(dt);
                  try {
                    endDatetime = new Date(datasub.endDatetime);
                    endDatetime.setHours(endDatetime.getHours() + 7); // timestamp
                    endDatetime = new Date(endDatetime);
                  } catch (e) {
                    endDatetime = null;
                  }

                  if (dt > endDatetime) {
                    try {
                      datapemenang = await this.subchallenge.getpemenang(challengeID.toString(), subChallengeID.toString());
                    } catch (e) {
                      datapemenang = null;
                    }
                    if (datapemenang !== null && datapemenang.length > 0) {

                      try {
                        getlastrank = datapemenang[0].getlastrank;
                      } catch (e) {
                        getlastrank = null;
                      }
                      if (getlastrank !== null && getlastrank.length > 0) {
                        for (let x = 0; x < getlastrank.length; x++) {
                          let emailmenang = getlastrank[x].email
                          let idBadge = null;
                          let nameBadges = null;
                          let userid = getlastrank[x].idUser

                          try {
                            idBadge = getlastrank[x].idBadge;
                          } catch (e) {
                            idBadge = null;
                          }
                          let databadge = null;
                          try {
                            databadge = await this.userbadgeService.getUserbadge(userid.toString(), subChallengeID.toString());
                          } catch (e) {
                            databadge = null;
                          }

                          if (databadge == null) {


                            if (idBadge !== "") {

                              let dt = new Date(Date.now());
                              dt.setHours(dt.getHours() + 7); // timestamp
                              dt = new Date(dt);

                              let strdate = dt.toISOString();
                              let repdate = strdate.replace('T', ' ');
                              let splitdate = repdate.split('.');
                              let timedate = splitdate[0];

                              let end = new Date(endDatetime);
                              end.setHours(dt.getHours() + 12); // timestamp
                              end = new Date(end);
                              let getseminngu = new Date(new Date(end).setDate(new Date(end).getDate() + 7));
                              let strdateseminggu = getseminngu.toISOString();
                              var repdatesm = strdateseminggu.replace('T', ' ');
                              var splitdatesm = repdatesm.split('.');
                              var timedatesm = splitdatesm[0];

                              let Userbadge_ = new Userbadge();
                              Userbadge_.SubChallengeId = subChallengeID;
                              Userbadge_.idBadge = idBadge;
                              Userbadge_.createdAt = timedate;
                              Userbadge_.isActive = true;
                              Userbadge_.userId = userid;
                              Userbadge_.session = session;
                              Userbadge_.startDatetime = datasub.endDatetime;
                              Userbadge_.endDatetime = timedatesm;

                              await this.userbadgeService.create(Userbadge_);

                            }

                          }

                          let rank = null;
                          try {
                            rank = getlastrank[x].ranking;
                          } catch (e) {
                            rank = 0;
                          }

                          if (idBadge !== null && idBadge !== "") {
                            try {
                              databadge = await this.BadgeService.findByid(idBadge.toString());
                            } catch (e) {
                              databadge = null;
                            }
                            if (databadge !== null && databadge !== undefined) {
                              nameBadges = databadge.name;

                            } else {
                              nameBadges = "NO BADGE"
                            }
                          } else {
                            nameBadges = "NO BADGE"
                          }


                          let ket2 = null;
                          let ket3 = null;
                          let ket2EN = null;
                          let ket3EN = null;
                          let title1 = null;
                          let title2 = null;
                          let titleEN1 = null;
                          let titleEN2 = null;
                          try {
                            ket2 = body.replace("$badge", nameBadges);
                          } catch (e) {
                            ket2 = body;
                          }
                          try {
                            ket3 = ket2.replace("$ranking", rank);
                          } catch (e) {
                            ket3 = ket2;
                          }
                          try {
                            ket2EN = bodyEN.replace("$badge", nameBadges);
                          } catch (e) {
                            ket2EN = bodyEN;
                          }
                          try {
                            ket3EN = ket2EN.replace("$ranking", rank);
                          } catch (e) {
                            ket3EN = ket2EN;
                          }
                          try {
                            title1 = title.replace("$ranking", rank);
                          } catch (e) {
                            title1 = title;
                          }
                          try {
                            title2 = title1.replace("$badge", nameBadges);
                          } catch (e) {
                            title2 = title1;
                          }
                          try {
                            titleEN1 = titleEN.replace("$ranking", rank);
                          } catch (e) {
                            titleEN1 = titleEN;
                          }
                          try {
                            titleEN2 = titleEN1.replace("$badge", nameBadges);
                          } catch (e) {
                            titleEN2 = titleEN1;
                          }
                          let datanotifchall = null;
                          try {

                            datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                          } catch (e) {
                            datanotifchall = null;
                          }

                          if (datanotifchall !== null) {
                            console.log("==data sudah ada==")
                          } else {
                            if (langIso == "id") {
                              if (email == emailmenang) {

                                await this.util.sendNotifChallenge("PEMENANG", email, title2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);
                                // await this.notifChallengeService.updateStatussend(id.toString());


                              }

                            } else {
                              if (email == emailmenang) {
                                await this.util.sendNotifChallenge("PEMENANG", email, titleEN2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);
                                // await this.notifChallengeService.updateStatussend(id.toString());
                              }
                            }
                            await this.notifChallengeService.updateStatussend(id.toString());
                          }


                        }

                      }

                    }
                  }
                }


              }
              else if (type == "updateLeaderboard") {

                var datauserchall = null;
                let rank = null;
                let rankup = null;
                let ket2 = null;
                let ket3 = null;
                let ket2EN = null;
                let ket3EN = null;
                let title1 = null;
                let title2 = null;
                let titleEN1 = null;
                let titleEN2 = null;
                let datachallenges = null;
                let badge = null;
                let nameBadges = null;
                try {
                  datauserchall = await this.userchallengeSS.findByChallengeandUser2(challengeID.toString(), idUser.toString(), subChallengeID.toString());
                } catch (e) {
                  datauserchall = null;
                }

                try {
                  datachallenges = await this.challengeService.findOne(challengeID.toString());
                } catch (e) {
                  datachallenges = null;
                }

                if (datachallenges !== null) {

                  try {
                    badge = datachallenges.ketentuanHadiah[0].badge[0].juara1;
                  } catch (e) {
                    badge = null;
                  }

                  if (badge !== null && badge !== "") {
                    try {
                      databadge = await this.BadgeService.findByid(badge.toString());
                    } catch (e) {
                      databadge = null;
                    }
                    if (databadge !== null && databadge !== undefined) {
                      nameBadges = databadge.name;

                    } else {
                      nameBadges = "NO BADGE"
                    }
                  } else {
                    nameBadges = "NO BADGE"
                  }

                }

                if (datauserchall !== null && datauserchall !== undefined) {
                  try {
                    rank = datauserchall.ranking;
                  } catch (e) {
                    rank = 0;
                  }

                }
                if (rank !== 0 && rank > 1) {
                  rankup = rank - 1;
                } else {
                  rankup = 0;
                }

                if (rank == 1) {
                  try {
                    ket2 = body.replace("$ranking", rank);
                  } catch (e) {
                    ket2 = body;
                  }
                  try {
                    ket3 = ket2.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3 = ket2;
                  }

                  try {
                    ket2EN = bodyEN.replace("$ranking", rank);
                  } catch (e) {
                    ket2EN = bodyEN;
                  }
                  try {
                    ket3EN = ket2EN.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3EN = ket2EN;
                  }
                } else {
                  try {
                    ket2 = body.replace("$ranking", rankup);
                  } catch (e) {
                    ket2 = body;
                  }
                  try {
                    ket3 = ket2.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3 = ket2;
                  }

                  try {
                    ket2EN = bodyEN.replace("$ranking", rankup);
                  } catch (e) {
                    ket2EN = bodyEN;
                  }
                  try {
                    ket3EN = ket2EN.replace("$badge", nameBadges);
                  } catch (e) {
                    ket3EN = ket2EN;
                  }
                }

                try {
                  title1 = title.replace("$ranking", rank);
                } catch (e) {
                  title1 = title;
                }
                try {
                  title2 = title1.replace("$badge", nameBadges);
                } catch (e) {
                  title2 = title1;
                }
                try {
                  titleEN1 = titleEN.replace("$ranking", rank);
                } catch (e) {
                  titleEN1 = titleEN;
                }
                try {
                  titleEN2 = titleEN1.replace("$badge", nameBadges);
                } catch (e) {
                  titleEN2 = titleEN1;
                }
                if (rank > 1) {

                  let datanotifchall = null;
                  try {

                    datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                  } catch (e) {
                    datanotifchall = null;
                  }

                  if (datanotifchall !== null) {
                    console.log("==data sudah ada==")
                  } else {
                    if (langIso == "id") {
                      await this.util.sendNotifChallenge("", email, title2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);
                      //await this.notifChallengeService.updateStatussend(id.toString());
                    } else {
                      await this.util.sendNotifChallenge("", email, titleEN2, ket3, ket3EN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);
                      //await this.notifChallengeService.updateStatussend(id.toString());
                    }
                    await this.notifChallengeService.updateStatussend(id.toString());
                  }
                }


              }
              else if (type == "challengeBerakhir") {
                let datanotifchall = null;
                try {

                  datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                } catch (e) {
                  datanotifchall = null;
                }

                if (datanotifchall !== null) {
                  console.log("==data sudah ada==")
                } else {
                  if (langIso == "id") {
                    await this.util.sendNotifChallenge("BERAKHIR", email, title, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);
                    // await this.notifChallengeService.updateStatussend(id.toString());
                  } else {
                    await this.util.sendNotifChallenge("BERAKHIR", email, titleEN, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, session.toString(), datetime);
                    // await this.notifChallengeService.updateStatussend(id.toString());
                  }
                  await this.notifChallengeService.updateStatussend(id.toString());
                }
              }
              else {
                let datanotifchall = null;
                try {

                  datanotifchall = await this.NotificationsService.findNotifchallenge(email, "CHALLENGE", challengeID, datetime);
                } catch (e) {
                  datanotifchall = null;
                }

                if (datanotifchall !== null) {
                  console.log("==data sudah ada==")
                } else {
                  if (langIso == "id") {
                    await this.util.sendNotifChallenge("", email, title, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);
                    //await this.notifChallengeService.updateStatussend(id.toString());
                  } else {
                    await this.util.sendNotifChallenge("", email, titleEN, body, bodyEN, "CHALLENGE", "ACCEPT", challengeID, typeChallenge, "", datetime);
                    // await this.notifChallengeService.updateStatussend(id.toString());
                  }
                  await this.notifChallengeService.updateStatussend(id.toString());
                }

              }

            }

          }
        }



        //   }

        //}

      }

    }

  }
}
