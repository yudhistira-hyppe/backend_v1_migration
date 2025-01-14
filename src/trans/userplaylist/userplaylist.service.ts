import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { UtilsService } from '../../utils/utils.service';
import { Userbasic } from '../userbasics/schemas/userbasic.schema';
import { CreateUserplaylistDto, V3PlayList } from './dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument, VPlay, VPlayDocument } from './schemas/userplaylist.schema';

@Injectable()
export class UserplaylistService {

  private readonly logger = new Logger(UserplaylistService.name);

  constructor(
    @InjectModel(Userplaylist.name, 'SERVER_FULL')
    private readonly userplaylistModel: Model<UserplaylistDocument>,
    @InjectModel(VPlay.name, 'SERVER_FULL')
    private readonly vPlayModel: Model<VPlayDocument>,

    private utilService: UtilsService,
  ) { }

  async create(CreateUserplaylistDto_: CreateUserplaylistDto): Promise<Userplaylist> {
    const _createUserbasicDto_ = await this.userplaylistModel.create(
      CreateUserplaylistDto_,
    );
    return _createUserbasicDto_;
  }

  async findAll(): Promise<Userplaylist[]> {
    return this.userplaylistModel.find().exec();
  }

  async findid(id: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ _id: id }).exec();
  }

  async findbyid(id: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async findOne(email: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ email: email }).exec();
  }

  async findData(_id_user: string, _id_userpost: string, mediaId: string) {
    return this.userplaylistModel.find(
      {
        userId: new Types.ObjectId(_id_user),
        userPostId: new Types.ObjectId(_id_userpost),
        mediaId: mediaId
      }).exec();
  }

  async updateOne(_id: string, CreateUserplaylistDto_: CreateUserplaylistDto) {
    return await this.userplaylistModel.updateOne(
      { _id: new Types.ObjectId(_id) },
      CreateUserplaylistDto_,
      function (err, docs) {
        if (err) {
          console.log("Updated Error : ", err)
        } else {
          console.log("Updated Docs : ", docs);
        }
      }).clone().exec();
  }

  async findOnedata(userId_: string, userPostId_: string, mediaId_: string): Promise<Userplaylist[]> {
    const _query_ = await this.userplaylistModel.find(
      { userId: new Types.ObjectId(userId_), userPostId: new Types.ObjectId(userPostId_), mediaId: mediaId_ }
    ).exec();
    return _query_;
  }

  async findOneUsername(username: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ username: username }).exec();
  }

  async findOneAndUpdate(CreateUserplaylistDto_old: CreateUserplaylistDto, CreateUserplaylistDto_new: CreateUserplaylistDto) {
    return await this.userplaylistModel.updateOne(CreateUserplaylistDto_old, { $set: CreateUserplaylistDto_new }, function (err, docs) {
      if (err) {
        console.log("Updated Error : ", err)
      } else {
        console.log("Updated Docs : ", docs);
      }
    }).clone().exec();
  }

  async findOneAndUpdate_(CreateUserplaylistDto_: CreateUserplaylistDto) {
    return await this.userplaylistModel.updateOne(CreateUserplaylistDto_, { $set: CreateUserplaylistDto_ }, function (err, docs) {
      if (err) {
        console.log("Updated Error : ", err)
      } else {
        console.log("Updated Docs : ", docs);
      }
    }).clone().exec();
  }

  async delete(id: string) {
    const deletedCat = await this.userplaylistModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  public async doGetUserPostPlaylist(body: any, headers: any, whoami: Userbasic): Promise<String[]> {
    this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(body));
    let query = this.userplaylistModel.find();
    if (body.visibility != undefined) {
      if (body.visibility == 'PRIVATE') {
        query.where('userId', whoami._id);
        query.where('userPostId', whoami._id);
      } else {
        query.where('type', body.visibility);
      }

    }

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('isHidden', false);
    }

    if (body.withExp != undefined && (body.withExp == 'true' || body.withExp == true)) {
      this.logger.log("doGetUserPost >>> today: " + this.utilService.now());
      query.where('expiration').gte(this.utilService.generateExpirationFromToday(1));
    }

    if (body.endDate != undefined) {
      if (body.startDate != undefined) {
        query.where('createAt').gte(body.startDate);
        query.where('createAt').lte(body.endDate);
      } else {
        query.where('createAt').lte(body.endDate);
      }
    }

    query.where('userId', whoami._id);

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'createAt': -1 });
    let res = await query.exec();

    let pids: String[] = [];
    for (let x = 0; x < res.length; x++) {
      let tmp = res[x];
      let pid = tmp.postID;
      pids.push(pid);
    }
    //this.logger.log('doGetUserPostPlaylist >>> end: ' + JSON.stringify(pids));
    return pids;

  }

  public async doGetUserPostVPlaylist(body: any, headers: any, whoami: Userbasic): Promise<VPlay[]> {
    this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(body));
    let query = this.vPlayModel.find();
    if (body.visibility != undefined) {
      if (body.visibility == 'PRIVATE') {
        query.where('userId', whoami._id);
        query.where('userPostId', whoami._id);
      } else {
        query.where('type', body.visibility);
      }

    }

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    query.where('isHidden', false);
    query.where('isWatched', false);

    if (body.withExp != undefined && (body.withExp == 'true' || body.withExp == true)) {
      this.logger.log("doGetUserPost >>> today: " + this.utilService.now());
      query.where('expiration').gte(this.utilService.generateExpirationFromToday(1));
    }

    if (body.endDate != undefined) {
      if (body.startDate != undefined) {
        query.where('createAt').gte(body.startDate);
        query.where('createAt').lte(body.endDate);
      } else {
        query.where('createAt').lte(body.endDate);
      }
    }


    query.where('userId', whoami._id);

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'createAt': -1 });
    return await query.exec();

  }

  public async doGetUserPostPlaylistV2(body: any, headers: any, whoami: Userbasic): Promise<Userplaylist[]> {
    this.logger.log('doGetUserPostPlaylistV2 >>> start: ' + JSON.stringify(body));
    let query = this.userplaylistModel.find();
    if (body.visibility != undefined) {
      //
      //if (body.visibility == 'PRIVATE') {
      //  query.where('userId', whoami._id);
      //  query.where('userPostId', whoami._id);
      //} else {
      //  query.where('type', body.visibility);
      //}

      if (body.visibility == 'PRIVATE') {
        this.logger.log('doGetUserPostPlaylistV2 >>> private: ' + whoami._id);
        query.where('userId', Object(whoami._id));
        query.where('userPostId', Object(whoami._id));
      } else if (body.visibility == 'PUBLIC') {
        query.where('PUBLIC', true);
      } else if (body.visibility == 'FRIEND') {
        query.where('FRIEND', true);
      } else if (body.visibility == 'FOLLOWING') {
        query.where('FOLLOWING', true);
      } else if (body.visibility == 'FOLLOWER') {
        query.where('FOLLOWER', true);
      }

    }

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.postType != undefined) {
      query.where('postType', String(body.postType));
    } else {
      query.where('postType').ne('advertise');
    }

    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('isHidden', false);
    }

    if (body.withExp != undefined && (body.withExp == 'true' || body.withExp == true)) {
      this.logger.log("doGetUserPost >>> today: " + this.utilService.now());
      query.where('expiration').gte(this.utilService.generateExpirationFromToday(1));
    }

    if (body.endDate != undefined) {
      if (body.startDate != undefined) {
        query.where('createAt').gte(body.startDate);
        query.where('createAt').lte(body.endDate);
      } else {
        query.where('createAt').lte(body.endDate);
      }
    }


    query.where('userId', whoami._id);

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'createAt': -1 });
    return await query.exec();

  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }

  public async dataView(): Promise<VPlay[]> {
    return this.vPlayModel.find();
  }

  // async generateUserPlaylist(CreateUserplaylistDto_: CreateUserplaylistDto){
  //   if (CreateUserplaylistDto_.userPostId == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param userPostId is required',
  //     );
  //   }
  //   if (CreateUserplaylistDto_.mediaId == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param mediaId is required',
  //     );
  //   }
  //   if (CreateUserplaylistDto_.postType == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, param postType is required',
  //     );
  //   }

  //   var userPostId = CreateUserplaylistDto_.userPostId;
  //   var mediaId = CreateUserplaylistDto_.mediaId;
  //   var postType = CreateUserplaylistDto_.postType;

  //   var current_date = await this.utilsService.getDateTimeString();
  //   var data_userbasic_all = await this.userbasicsService.findAll();
  //   var data_media = null;

  //   if (postType =="vid"){
  //     data_media = await this.mediavideosService.findOne(mediaId.toString());
  //   } else if (postType == "pict") {
  //     data_media = await this.mediapictsService.findOne(mediaId.toString());
  //   } else if (postType == "diary") {
  //     data_media = await this.mediadiariesService.findOne(mediaId.toString());
  //   } else if (postType == "story") {
  //     data_media = await this.mediastoriesService.findOne(mediaId.toString());
  //   }

  //   if (!(await this.utilsService.ceckData(data_media))) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, data_media not found',
  //     );
  //   }

  //   var data_userbasic = await this.userbasicsService.findbyid(userPostId.toString());
  //   var data_post = await this.postsService.findid(data_media.postID);

  //   if (!(await this.utilsService.ceckData(data_userbasic))) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, data_userbasic not found',
  //     );
  //   }

  //   if (!(await this.utilsService.ceckData(data_post))) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed, data_post not found',
  //     );
  //   }

  //   data_userbasic_all.forEach(async element => {
  //     var post_array_interest = data_post.category;
  //     var user_array_interest = element.userInterests;

  //     var post_array_interest_toString = null;
  //     var post_array_interest_string = null;
  //     var user_array_interest_toString = null;
  //     var user_array_interest_string = null;

  //     var compare_interest = null;
  //     var Count_compare_interest = 0;

  //     if (post_array_interest.length > 0) {
  //       post_array_interest_toString = post_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
  //       post_array_interest_string = JSON.parse("[" + post_array_interest_toString + "]");
  //     }
  //     if (user_array_interest.length > 0) {
  //       user_array_interest_toString = user_array_interest.map(function (item) {
  //         if ((JSON.parse(JSON.stringify(item)) != null)) {
  //           return '"' + JSON.parse(JSON.stringify(item)).$id + '"'
  //         }
  //       }).join(",");
  //       user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");
  //     }
  //     if (post_array_interest_string != null && user_array_interest_string != null) {
  //       compare_interest = post_array_interest_string.filter(function (obj) {
  //         return user_array_interest_string.indexOf(obj) !== -1;
  //       });
  //     }

  //     //Compare Get Interes
  //     if (compare_interest != null) {
  //       Count_compare_interest = compare_interest.length;
  //     }

  //     var type = null;
  //     var ceckFriendFollowingFollower = await this.contenteventsService.ceckFriendFollowingFollower(data_userbasic.email.toString(), element.email.toString());
  //     if (await this.utilsService.ceckData(ceckFriendFollowingFollower)) {
  //       if (ceckFriendFollowingFollower.length == 2) {
  //         type = "FRIEND";
  //       }else{
  //         if (ceckFriendFollowingFollower[0].email == data_userbasic.email.toString()) {
  //           type = "FOLLOWER";
  //         } else {
  //           if (ceckFriendFollowingFollower[0].email == element.email.toString()) {
  //             type = "FOLLOWING";
  //           } else {
  //             type = "PUBLIC";
  //           }
  //         }
  //       }
  //     }else{
  //       type = "PUBLIC";
  //     }

  //     var interest_db = [];
  //     if (Count_compare_interest > 0) {
  //       for (var i = 0; i < Count_compare_interest; i++) {
  //         var objintr = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(compare_interest[i]), "$db": "hyppe_infra_db" }
  //         interest_db.push(objintr)
  //       }
  //     }
  //     var CreateUserplaylistDto_ = new CreateUserplaylistDto();
  //     CreateUserplaylistDto_.userId = Object(element._id);
  //     CreateUserplaylistDto_.interestId = interest_db;
  //     CreateUserplaylistDto_.interestIdCount = Count_compare_interest;
  //     CreateUserplaylistDto_.userPostId = Object(data_userbasic._id);
  //     CreateUserplaylistDto_.postType = postType;
  //     CreateUserplaylistDto_.mediaId = mediaId.toString();
  //     CreateUserplaylistDto_.type = type;
  //     CreateUserplaylistDto_.createAt = current_date;
  //     CreateUserplaylistDto_.updatedAt = current_date;
  //     CreateUserplaylistDto_.isWatched = false;
  //     CreateUserplaylistDto_.isHidden = false;

  //     // const userId = element._id.toString();
  //     // const userIdPost = data_userbasic._id.toString();
  //     // const mediaId_ = mediaId.toString();
  //     //var ceckDataUser_ = await this.userplaylistModel.findOne({ userId: new Types.ObjectId(userId), userPostId: new Types.ObjectId(userIdPost), mediaId: mediaId_ }).clone().exec();

  //     var ceckDataUser_ = await this.userplaylistModel.find(
  //       { 
  //         userId: new Types.ObjectId(element._id.toString()), 
  //         userPostId: new Types.ObjectId(data_userbasic._id.toString()), 
  //         mediaId: mediaId.toString() 
  //       }).exec();

  //     if (await this.utilsService.ceckData(ceckDataUser_)){
  //       await this.userplaylistModel.updateOne(
  //         { _id: new Types.ObjectId(ceckDataUser_[0]._id.toString()) }, 
  //         CreateUserplaylistDto_, 
  //         function (err, docs) {
  //           if (err) {
  //             console.log(err)
  //           }else {
  //             console.log("Updated Docs : ", docs);
  //           }
  //         }).clone().exec();
  //     } else {
  //       CreateUserplaylistDto_._id = new mongoose.Types.ObjectId();
  //       await this.userplaylistModel.create(CreateUserplaylistDto_);
  //     }
  //   });
  // }
}