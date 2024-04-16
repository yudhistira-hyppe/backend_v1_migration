import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { tempposts, temppostsDocument } from './schemas/tempPost.schema';
import { PostContentService } from '../posts/postcontent.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateNewPostDTO, PostResponseApps, PostData, Avatar, Metadata, TagPeople, Cat, Privacy, GetcontenteventsDto, CreatePostResponse, Messages } from './dto/create-newPost.dto';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { GetusercontentsService } from 'src/trans/getusercontents/getusercontents.service';
import { PostchallengeService } from 'src/trans/postchallenge/postchallenge.service';
import { UserchallengesService } from 'src/trans/userchallenges/userchallenges.service';
import { Userchallenges } from 'src/trans/userchallenges/schemas/userchallenges.schema';
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { pipeline } from 'stream';
import { CreateUserplaylistDto } from 'src/trans/userplaylist/dto/create-userplaylist.dto';

@Injectable()
export class TempPOSTService {
  private readonly logger = new Logger(TempPOSTService.name);

  constructor(
    @InjectModel(tempposts.name, 'SERVER_FULL')
    private readonly loaddata: Model<temppostsDocument>,
    private readonly postContentService: PostContentService,
    private readonly utilService: UtilsService,
    private readonly logapiSS: LogapisService,
    private readonly errorHandler: ErrorHandler,
    private readonly basic2SS: UserbasicnewService,
    private readonly contentEventService: ContenteventsService,
    private readonly musicSS: MediamusicService,
    private readonly loadApsara: GetusercontentsService,
    private readonly postchallengeService: PostchallengeService,
    private readonly userchallengesService: UserchallengesService,
    private readonly utilsService: UtilsService,
    private readonly disquslogsService: DisquslogsService,
    private readonly disqusService: DisqusService,
  ) { }

  async create(CreatePostsDto: tempposts): Promise<tempposts> {
    const createPostsDto = await this.loaddata.create(CreatePostsDto);
    return createPostsDto;
  }

  async duplicatedata(CreatePostsDto: tempposts, id: string, target: string) {
    let result = null;
    if (target == 'create') {
      result = await this.loaddata.create(CreatePostsDto);
    }
    else {
      let result = await this.loaddata.findByIdAndUpdate(id, CreatePostsDto, { new: true });

      if (!result) {
        throw new Error('Data is not found!');
      }
    }
  }

  async findByPostId(postID: string): Promise<tempposts> {
    return this.loaddata.findOne({ postID: postID }).exec();
  }

  async updateByPostId(body: any, headers: any, data_userbasics: Userbasicnew) {
    let findData = await this.findByPostId(body.postID);
    if (findData) {
      let result = await this.updatePost(body, headers, data_userbasics);
      return result;
    } else {
      let res = new CreatePostResponse();
      res.response_code = 204;
      let msg = new Messages();
      msg.info = ["Post ID not found in tempPosts, skipping update"];
      res.messages = msg;
      res.data = {};
      return res;
    }
  }

  async updatePost(body: any, headers: any, data_userbasics: Userbasicnew): Promise<CreatePostResponse> {
    this.logger.log('updateTempPost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    // var token = headers['x-auth-token'];
    // var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    // var profile = await this.basic2SS.findBymail(auth.email);
    // if (profile == undefined) {
    //   let msg = new Messages();
    //   msg.info = ["Email unknown"];
    //   res.messages = msg;
    //   return res;
    // }

    // let opost = await this.findByPostId(body.postID);

    if (body.certified && body.certified == "true") {
      if (data_userbasics.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }



    let post = await this.buildUpdatePost(body, headers);
    let apost = await this.loaddata.create(post);

    // if (body.certified && body.certified == true) {
    //   console.log("post cert: " + opost.certified);
    //   if (opost.certified == undefined || opost.certified == false) {
    //     console.log(body.certified)
    //     console.log("---------------------------------------------------XXX 3---------------------------------------------------")
    //     this.generateCertificate(String(post.postID), 'id', apost, data_userbasics);
    //   }
    // }

    // let cm = post.contentMedias[0];

    // let updatePl = new CreateUserplaylistDto();
    // updatePl.userPostId = Object(data_userbasics._id.toString());
    // updatePl.mediaId = Object(cm.oid);
    // updatePl.postType = apost.postType;
    //this.postService.updateGenerateUserPlaylist_(updatePl);

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process was successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);

    return res;
  }

  private async buildUpdatePost(body: any, headers: any) {
    this.logger.log('buildPost >>> start');
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.basic2SS.findBymail(auth.email);
    this.logger.log('buildPost >>> profile: ' + profile.email);

    let post = await this.findByPostId(body.postID);
    post.updatedAt = await this.utilService.getDateTimeString();
    // let isShared = null;

    if (body.description != undefined) {
      post.description = body.description;
    }

    if (body.isShared != undefined) {
      post.isShared = body.isShared;
    } else {
      post.isShared = true;
    }

    if (body.tags != undefined && (String(body.tags).length > 0)) {
      var obj = body.tags;
      //var tgs = obj.split(",");
      post.tags = obj;
    }



    if (body.visibility != undefined) {
      post.visibility = body.visibility;
    } else {
      post.visibility = 'PUBLIC';
    }

    if (body.location != undefined) {
      post.location = body.location;
    }

    if (body.lat != undefined) {
      post.lat = body.lat;
    }

    if (body.lon != undefined) {
      post.lon = body.lon;
    }

    if (body.saleAmount != undefined) {
      post.saleAmount = body.saleAmount;
    } else {
      post.saleAmount = null;
    }

    if (body.saleLike != undefined) {
      post.saleLike = body.saleLike;
    } else {
      post.saleLike = false;
    }

    if (body.saleView != undefined) {
      post.saleView = body.saleView;
    } else {
      post.saleView = false;
    }

    if (body.allowComments != undefined) {
      post.allowComments = body.allowComments;
    } else {
      post.allowComments = true;
    }

    if (body.isSafe != undefined) {
      post.isSafe = body.isSafe;
    } else {
      post.isSafe = false;
    }

    if (body.isOwned != undefined) {
      post.isOwned = body.isOwned;
    } else {
      post.isOwned = false;
    }

    if (body.active != undefined) {
      post.active = body.active;
    }


    if (body.cats != undefined && body.cats.length > 1) {
      var obj = body.cats;
      var cats = obj.split(",");

      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        // var cat = await this.interestService.findByName(tmp);
        if (tmp != undefined) {
          var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(tmp), "$db": "hyppe_infra_db" };
          pcats.push(objintr);
        }
      }
      post.category = pcats;
    }

    // if (body.tagPeople != undefined && body.tagPeople.length > 1) {
    //   var obj = body.tagPeople;
    //   var cats = obj.split(",");
    //   var pcats = [];
    //   for (var i = 0; i < cats.length; i++) {
    //     var tmp = cats[i];
    //     var tp = await this.userAuthService.findOneUsername(tmp);
    //     if (await this.utilService.ceckData(tp)) {
    //       if (tp != undefined) {
    //         var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
    //         pcats.push(objintr);
    //       }
    //     }
    //   }
    //   post.tagPeople = pcats;
    // }

    if (body.tagPeople != undefined && body.tagPeople.length > 1) {
      var obj = body.tagPeople;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.basic2SS.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp.username != undefined) {
            // var objintr_ = new mongoose.Types.ObjectId(tp._id);
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(body.postID);
            console.log(post.postType.toString());
            // this.utilService.sendFcmV2(tp.email.toString(), post.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID, post.postType.toString());
            pcats.push(tp.username);
          }
        }
      }
      post.tagPeople = pcats;
    }

    // if (body.tagDescription != undefined && body.tagDescription.length > 0) {
    //   var obj = body.tagDescription;
    //   var cats = obj.split(",");
    //   var pcats = [];
    //   for (var i = 0; i < cats.length; i++) {
    //     var tmp = cats[i];
    //     var tp = await this.userAuthService.findOneUsername(tmp);
    //     if (await this.utilService.ceckData(tp)) {
    //       if (tp != undefined) {
    //         var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
    //         pcats.push(objintrx);
    //       }
    //     }
    //   }
    //   post.tagDescription = pcats;
    // }

    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      var obj = body.tagDescription;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.basic2SS.findOneUsername(tmp);
        if (await this.utilService.ceckData(tp)) {
          if (tp != undefined || tp != null) {
            var objintrx = new mongoose.Types.ObjectId(tp._id);
            let em = String(tp.username);
            let bodyi = em + ' Menandai kamu di ';
            let bodye = em + ' Tagged you in ';
            if (post.postType == 'pict') {
              bodyi = bodyi + ' HyppePic';
              bodye = bodye + ' HyppePic';
            } else if (post.postType == 'vid') {
              bodyi = bodyi + ' HyppeVideo';
              bodye = bodye + ' HyppeVideo';
            } else if (post.postType == 'diary') {
              bodyi = bodyi + ' HyppeDiary';
              bodye = bodye + ' HyppeDiary';
            } else if (post.postType == 'story') {
              bodyi = bodyi + ' HyppeStory';
              bodye = bodye + ' HyppeStory';
            }
            console.log(tp.email.toString());
            console.log(body.postID);
            console.log(post.postType.toString());
            // this.utilService.sendFcmV2(tp.email.toString(), auth.email.toString(), 'REACTION', 'ACCEPT', "POST_TAG", body.postID, post.postType.toString())
            pcats.push(objintrx);
          }
        }
      }
      post.tagDescription = pcats;
    }

    if (body.certified != undefined) {
      post.certified = <boolean>body.certified;
    } else {
      post.certified = false;
    }

    return post;
  }

  async updateView(email: string, email_target: string, postID: string) {
    var getdata = await this.loaddata.findOne({ postID: postID }).exec();
    var setinput = {};
    setinput['$inc'] = {
        views: 1
    };
    var setCEViewer = getdata.userView;
    setCEViewer.push(email_target);
    setinput["$set"] = {
        "userView": setCEViewer
    }

    this.loaddata.updateOne(
        {
            email: email,
            postID: postID,
        },
        setinput,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        },
    );
}

async updateLike(email: string, email_target: string, postID: string) {
    var getdata = await this.loaddata.findOne({ postID: postID }).exec();
    var setinput = {};
    setinput['$inc'] = {
        likes: 1
    };
    var setCELike = getdata.userLike;
    setCELike.push(email_target);
    setinput["$set"] = {
        "userLike": setCELike
    }

    this.loaddata.updateOne(
        {
            email: email,
            postID: postID,
        },
        setinput,
        function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        },
    );
}
}