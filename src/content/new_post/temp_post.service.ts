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
import { NewPostService } from './new_post.service';

@Injectable()
export class TempPOSTService {
  private readonly logger = new Logger(TempPOSTService.name);

  constructor(
    @InjectModel(tempposts.name, 'SERVER_FULL')
    private readonly loaddata: Model<temppostsDocument>,
    private readonly postContentService: PostContentService,
    private readonly newPostService: NewPostService,
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
        var mongo = require('mongoose');
        var getpost = await this.newPostService.findOne(CreatePostsDto.postID.toString());
        console.log(getpost);
        var getcreator = await this.basic2SS.findBymail(getpost.email.toString());
        var insertdata = new tempposts;
        insertdata = JSON.parse(JSON.stringify(getpost));
        insertdata.tag2 = [];
        insertdata.userProfile = { "$ref": "userbasics", "$id": new mongoose.Types.ObjectId(getcreator._id.toString()), "$db": "hyppe_trans_db" };
        if(getpost.musicId != null && getpost.musicId != undefined)
        {
            insertdata.musicId = new mongo.Types.ObjectId(getpost.musicId.toString());   
        }
        if(getpost.category.length != 0)
        {
            insertdata.category = getpost.category;
        }

        if(CreatePostsDto.tagPeople != null && CreatePostsDto.tagPeople != undefined)
        {
            if(CreatePostsDto.tagPeople.length != 0)
            {
                var getlistuser = CreatePostsDto.tagPeople;
                var dummyuser = [];
                var dummytag2 = [];

                for(var i = 0; i < getlistuser.length; i++)
                {
                    dummyuser.push(getlistuser[i].username);
                    dummytag2.push(
                        {
                            username:getlistuser[i].username
                        }
                    );
                }

                insertdata.tagPeople = dummyuser;
                insertdata.tag2 = dummytag2;
            }
        }

        insertdata.contentModeration = getpost.contentModeration;
        insertdata.contentModerationDate = getpost.contentModerationDate;
        insertdata.contentModerationResponse = getpost.contentModerationResponse;
        insertdata.moderationReason = getpost.moderationReason;
        insertdata.reportedStatus = getpost.reportedStatus;

        // console.log(CreatePostsDto);
        result = await this.loaddata.create(insertdata);
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
      var ptag2 = [];
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
            ptag2.push(
                {
                    _id: tp._id,
                    username: tp.username
                }
            );
          }
        }
      }
      post.tagPeople = pcats;
      post.tag2 = ptag2;
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

  async landingPagebaru(email:string, type:string, skip:number, limit:number)
  {
    var pipeline = [];

    pipeline.push(
      {
          '$set': {
              timeStart: {
                  '$concat': [
                      {
                          '$dateToString': {
                              format: '%Y-%m-%d',
                              date: new Date()
                          }
                      },
                      ' ',
                      {
                          '$arrayElemAt': ['$boosted.boostSession.timeStart', 0]
                      }
                  ]
              }
          }
      },
      {
          '$set': {
              timeEnd: {
                  '$concat': [
                      {
                          '$dateToString': {
                              format: '%Y-%m-%d',
                              date: new Date()
                          }
                      },
                      ' ',
                      {
                          '$arrayElemAt': ['$boosted.boostSession.timeEnd', 0]
                      }
                  ]
              }
          }
      },
      {
          '$set': {
              testDate: {
                  '$dateToString': {
                      format: '%Y-%m-%d %H:%M:%S',
                      date: {
                          '$add': [new Date(), 25200000]
                      }
                  }
              }
          }
      },
    );

    if(type == "pict")
    {
      pipeline.push(
        {
            '$match': {
                '$or': [
                    {
                        '$and': [
                            {
                                '$expr': {
                                    '$gte': ['$createdAt', '2022-01-09 00:57:28']
                                }
                            },
                            {
                                reportedStatus: {
                                    '$ne': 'OWNED'
                                }
                            },
                            {
                                visibility: 'PUBLIC'
                            },
                            {
                                active: true
                            },
                            {
                                postType: "pict"
                            },
                            {
                                '$expr': {
                                    '$lte': [
                                        {
                                            '$arrayElemAt': ['$boosted.boostSession.start', 0]
                                        },
                                        '$testDate'
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$gt': [
                                        {
                                            '$arrayElemAt': ['$boosted.boostSession.end', 0]
                                        },
                                        '$testDate'
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$lte': ['$timeStart', '$testDate']
                                }
                            },
                            {
                                '$expr': {
                                    '$gt': ['$timeEnd', '$testDate']
                                }
                            },
                            {
                                timeStart: {
                                    '$ne': null
                                }
                            },
                            {
                                timeEnd: {
                                    '$ne': null
                                }
                            },
                            {
                                '$or': [
                                    {
                                        reportedUser: {
                                            '$elemMatch': {
                                                email: email,
                                                active: false
                                            }
                                        }
                                    },
                                    {
                                        'reportedUser.email': {
                                            '$not': {
                                                '$regex': email
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                '$or': [
                                    {
                                        'boosted.boostViewer': {
                                            '$elemMatch': {
                                                email: email,
                                                isLast: true,
                                                timeEnd: {
                                                    '$lte': {
                                                        '$add': [new Date(), 25200000]
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        '$and': [
                                            {
                                                'boosted.boostViewer.email': {
                                                    '$ne': email
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        '$and': [
                            {
                                reportedStatus: {
                                    '$ne': 'OWNED'
                                }
                            },
                            {
                                visibility: 'PUBLIC'
                            },
                            {
                                active: true
                            },
                            {
                              postType: "pict"
                            },
                            {
                                timeStart: null
                            },
                            {
                                '$or': [
                                    {
                                        reportedUser: {
                                            '$elemMatch': {
                                                email: email,
                                                active: false
                                            }
                                        }
                                    },
                                    {
                                        'reportedUser.email': {
                                            '$not': {
                                                '$regex': email
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
      );
    }
    else if(type == "vid")
    {
      pipeline.push(
        {
            '$match': {
                '$or': [
                    {
                        '$and': [
                            {
                                '$expr': {
                                    '$gte': ['$createdAt', '2022-01-09 00:57:28']
                                }
                            },
                            {
                                reportedStatus: {
                                    '$ne': 'OWNED'
                                }
                            },
                            {
                                visibility: 'PUBLIC'
                            },
                            {
                                active: true
                            },
                            {
                                postType: {
                                    '$in': ['vid', 'diary']
                                }
                            },
                            {
                                '$expr': {
                                    '$lte': [
                                        {
                                            '$arrayElemAt': ['$boosted.boostSession.start', 0]
                                        },
                                        '$testDate'
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$gt': [
                                        {
                                            '$arrayElemAt': ['$boosted.boostSession.end', 0]
                                        },
                                        '$testDate'
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$lte': ['$timeStart', '$testDate']
                                }
                            },
                            {
                                '$expr': {
                                    '$gt': ['$timeEnd', '$testDate']
                                }
                            },
                            {
                                timeStart: {
                                    '$ne': null
                                }
                            },
                            {
                                timeEnd: {
                                    '$ne': null
                                }
                            },
                            {
                                '$or': [
                                    {
                                        reportedUser: {
                                            '$elemMatch': {
                                                email: email,
                                                active: false
                                            }
                                        }
                                    },
                                    {
                                        'reportedUser.email': {
                                            '$not': {
                                                '$regex': email
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                '$or': [
                                    {
                                        'boosted.boostViewer': {
                                            '$elemMatch': {
                                                email: email,
                                                isLast: true,
                                                timeEnd: {
                                                    '$lte': {
                                                        '$add': [new Date(), 25200000]
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        '$and': [
                                            {
                                                'boosted.boostViewer.email': {
                                                    '$ne': email
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        '$and': [
                            {
                                reportedStatus: {
                                    '$ne': 'OWNED'
                                }
                            },
                            {
                                visibility: 'PUBLIC'
                            },
                            {
                                active: true
                            },
                            {
                                postType: {
                                    '$in': ['vid', 'diary']
                                }
                            },
                            {
                                timeStart: null
                            },
                            {
                                '$or': [
                                    {
                                        reportedUser: {
                                            '$elemMatch': {
                                                email: email,
                                                active: false
                                            }
                                        }
                                    },
                                    {
                                        'reportedUser.email': {
                                            '$not': {
                                                '$regex': email
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
      );
    }

    pipeline.push(
      {
          '$set': {
              selfContents: {
                  '$cond': {
                      if : {
                          '$and': [
                              {
                                  '$eq': ['$email', email]
                              },
                              {
                                  '$gt': [
                                      '$createdAt',
                                      {
                                          '$dateToString': {
                                              format: '%Y-%m-%d %H:%M:%S',
                                              date: {
                                                  '$add': [new Date(), - 30600000]
                                              }
                                          }
                                      }
                                  ]
                              }
                          ]
                      },
                      then: 1,
                      else : 0
                  }
              }
          }
      },
      {
          '$set': {
              kancuts: {
                  '$concatArrays': ['$viewer', [email]]
              }
          }
      },
      {
          '$set': {
              tagPeople: "$tag2"
          }
      },
      {
          '$set': {
              mailViewer: {
                  '$filter': {
                      input: '$kancuts',
                      cond: {
                          '$eq': ['$$this', email]
                      }
                  }
              }
          }
      },
      {
          '$set': {
              dodolCount: {
                  '$filter': {
                      input: '$kancuts',
                      cond: {
                          '$eq': ['$$this', email]
                      }
                  }
              }
          }
      },
      {
          '$set': {
              viewerCounts: {
                  '$cond': {
                      if : {
                          '$isArray': '$dodolCount'
                      },
                      then: {
                          '$size': '$dodolCount'
                      },
                      else : 1
                  }
              }
          }
      },
      {
          '$sort': {
              viewerCounts: 1,
              selfContents: - 1,
              isBoost: - 1,
              createdAt: - 1
          }
      },
      {
          '$skip': (limit * skip)
      },
      {
          '$limit': limit
      },
      {
          '$lookup': {
              from: 'disquslogs',
              let: {
                  localID: '$postID'
              },
              as: 'comment',
              pipeline: [
                  {
                      '$match': {
                          '$and': [
                              {
                                  '$expr': {
                                      '$eq': ['$postID', '$$localID']
                                  }
                              },
                              {
                                  active: {
                                      '$ne': false
                                  }
                              }
                          ]
                      }
                  },
                  {
                      '$lookup': {
                          from: 'newUserBasics',
                          as: 'userComment',
                          let: {
                              localID: '$sender'
                          },
                          pipeline: [
                              {
                                  '$match': {
                                      '$expr': {
                                          '$eq': ['$email', '$$localID']
                                      }
                                  }
                              },
                              {
                                  '$project': {
                                      username: 1
                                  }
                              }
                          ]
                      }
                  },
                  {
                      '$unwind': {
                          path: '$userComment'
                      }
                  },
                  {
                      '$sort': {
                          createdAt: - 1
                      }
                  }
              ]
          }
      },
      {
          '$lookup': {
              from: 'friend_list',
              as: 'friend',
              let: {
                  localID: '$email',
                  user: email
              },
              pipeline: [
                  {
                      '$match': {
                          '$or': [
                              {
                                  '$and': [
                                      {
                                          '$expr': {
                                              '$eq': ['$email', '$$localID']
                                          }
                                      },
                                      {
                                          'friendlist.email': email
                                      }
                                  ]
                              },
                              {
                                  '$and': [
                                      {
                                          email: email
                                      },
                                      {
                                          '$expr': {
                                              '$eq': ['$friendlist.email', '$$localID']
                                          }
                                      }
                                  ]
                              }
                          ]
                      }
                  },
                  {
                      '$project': {
                          email: 1,
                          friend: {
                              '$cond': {
                                  if : {
                                      '$gt': [{
                                          '$size': '$friendlist'
                                      }, 0]
                                  },
                                  then: 1,
                                  else : 0
                              }
                          }
                      }
                  }
              ]
          }
      },
      {
          '$lookup': {
              from: 'newUserBasics',
              as: 'userBasic',
              let: {
                  localID: '$email'
              },
              pipeline: [
                  {
                      '$match': {
                          '$expr': {
                              '$eq': ['$email', '$$localID']
                          }
                      }
                  }
              ]
          }
      },
      {
          '$lookup': {
              from: 'newUserBasics',
              as: 'userInt',
              let: {
                  localID: email,
                  int: '$category'
              },
              pipeline: [
                  {
                      '$match': {
                          '$and': [
                              {
                                  '$expr': {
                                      '$eq': ['$email', '$$localID']
                                  }
                              }
                          ]
                      }
                  },
                  {
                      '$project': {
                          userInterests: '$userInterests.$id'
                      }
                  }
              ]
          }
      },
      {
          '$set': {
              categoryInt: '$category.$id'
          }
      },
      {
          '$set': {
              intScore: {
                  '$filter': {
                      input: {
                          '$arrayElemAt': ['$userInt.userInterests', 0]
                      },
                      as: 'nonok',
                      cond: {
                          '$in': ['$$nonok', '$categoryInt']
                      }
                  }
              }
          }
      },
      {
          '$lookup': {
              from: 'mediamusic',
              as: 'music',
              let: {
                  localID: '$musicId'
              },
              pipeline: [
                  {
                      '$match': {
                          '$expr': {
                              '$eq': ['$_id', '$$localID']
                          }
                      }
                  },
                  {
                      '$project': {
                          _id: 1,
                          musicTitle: 1,
                          artistName: 1,
                          albumName: 1,
                          apsaraMusic: 1,
                          apsaraThumnail: 1,
                          genre: '$genre.name',
                          theme: '$theme.name',
                          mood: '$mood.name'
                      }
                  },
                  {
                      '$unwind': {
                          path: '$genre',
                          preserveNullAndEmptyArrays: true
                      }
                  },
                  {
                      '$unwind': {
                          path: '$theme',
                          preserveNullAndEmptyArrays: true
                      }
                  },
                  {
                      '$unwind': {
                          path: '$mood',
                          preserveNullAndEmptyArrays: true
                      }
                  }
              ]
          }
      },
      //{
      //  '$lookup': {
      //    from: 'newUserBasics',
      //    as: 'userTag',
      //    let: { localID: { '$ifNull': [ '$tagPeople', [] ] } },
      //    pipeline: [
      //      {
      //        '$match': {
      //          '$or': [
      //            { '$expr': { '$in': [ '$_id', '$$localID' ] } },
      //            { '$expr': { '$in': [ '$_idAuth', '$$localID.$id' ] } }
      //          ]
      //        }
      //      },
      //      { '$project': { _id: 1, username: 1 } }
      //    ]
      //  }
      //},
      {
          '$lookup': {
              from: 'settings',
              as: 'setting',
              pipeline: [
                  {
                      '$match': {
                          '$or': [
                              {
                                  _id: new ObjectId("62bbdb4ba7520000050077a7")
                              },
                              {
                                  _id: new ObjectId("64d06e5c451e0000bd006c62")
                              },
                              {
                                  _id: new ObjectId("645da79c295b0000520048c2")
                              },
                              {
                                  _id: new ObjectId("64e5a637227b0000d00057b8")
                              }
                          ]
                      }
                  }
              ]
          }
      },
      {
          '$set': {
              tutor: {
                  '$ifNull': [{
                      '$arrayElemAt': ['$userBasic.tutor', 0]
                  }, []]
              }
          }
      },
      {
          '$project': {
              _id: 1,
              version: {
                  '$arrayElemAt': ['$setting.value', 0]
              },
              versionIos: {
                  '$arrayElemAt': ['$setting.value', 1]
              },
              limitLandingpage: {
                  '$arrayElemAt': ['$setting.value', 2]
              },
              postID: 1,
              musicTitle: {
                  '$arrayElemAt': ['$music.musicTitle', 0]
              },
              artistName: {
                  '$arrayElemAt': ['$music.artistName', 0]
              },
              albumName: {
                  '$arrayElemAt': ['$music.albumName', 0]
              },
              apsaraMusic: {
                  '$arrayElemAt': ['$music.apsaraMusic', 0]
              },
              apsaraThumnail: {
                  '$arrayElemAt': ['$music.apsaraThumnail', 0]
              },
              genre: {
                  '$arrayElemAt': ['$music.genre', 0]
              },
              theme: {
                  '$arrayElemAt': ['$music.theme', 0]
              },
              mood: {
                  '$arrayElemAt': ['$music.mood', 0]
              },
              tagPeople: '$tagPeople',
              mediaType: 1,
              postType: 1,
              description: 1,
              active: 1,
              createdAt: 1,
              updatedAt: 1,
              expiration: 1,
              visibility: 1,
              location: 1,
              tags: 1,
              allowComments: 1,
              isSafe: 1,
              isOwned: 1,
              certified: 1,
              saleAmount: 1,
              saleLike: 1,
              saleView: 1,
              isShared: 1,
              likes: 1,
              views: 1,
              shares: 1,
              userView: 1,
              userLike: 1,
              stiker: 1,
              uploadSource: {
                  '$arrayElemAt': ['$uploadSource.uploadSource', 0]
              },
              comments: {
                  '$cond': {
                      if : {
                          '$eq': ['$comment', []]
                      },
                      then: 0,
                      else : {
                          '$size': '$comment'
                      }
                  }
              },
              email: 1,
              viewer: 1,
              viewerCount: 1,
              oldDate: '$oldDate',
              selfContent: 1,
              official: {
                  '$cond': {
                      if : {
                          '$eq': ['$email', 'hyppers@hyppe.id']
                      },
                      then: 1,
                      else : 0
                  }
              },
              music: {
                  '$arrayElemAt': ['$music', 0]
              },
              isLike: {
                  '$cond': {
                      if : {
                          '$eq': ['$userLike', 'hyppers@hyppe.id']
                      },
                      then: true,
                      else : false
                  }
              },
              comment: '$comment',
              interest: '$categoryInt',
              friends: {
                  '$arrayElemAt': ['$friend.friend', 0]
              },
              following: {
                  '$cond': {
                      if : {
                          '$eq': ['$userBasic.follower', []]
                      },
                      then: false,
                      else : {
                          '$cond': {
                              if : {
                                  '$in': [
                                      email,
                                      {
                                          '$arrayElemAt': ['$userBasic.follower', 0]
                                      }
                                  ]
                              },
                              then: true,
                              else : false
                          }
                      }
                  }
              },
              insight: {
                  likes: '$likes',
                  views: {
                      '$ifNull': [{
                          '$size': '$userView'
                      }, 0]
                  },
                  shares: '$shares',
                  comments: '$comments'
              },
              userProfile: '$userProfile',
              contentMedias: '$contentMedias',
              cats: '$categories',
              tagDescription: '$tagDescription',
              metadata: '$metadata',
              boostDate: '$boostDate',
              end: '$boosted.boostSession.end',
              start: '$boosted.boostSession.start',
              isBoost: '$isBoost',
              boostViewer: '$boostViewer',
              boostCount: '$boostCount',
              boosted: {
                  '$cond': {
                      if : {
                          '$gt': [
                              {
                                  '$dateToString': {
                                      format: '%Y-%m-%d %H:%M:%S',
                                      date: {
                                          '$add': [new Date(), 25200000]
                                      }
                                  }
                              },
                              '$boosted.boostSession.end'
                          ]
                      },
                      then: '$ilang',
                      else : '$boosted'
                  }
              },
              contentModeration: '$contentModeration',
              reportedStatus: '$reportedStatus',
              reportedUserCount: '$reportedUserCount',
              contentModerationResponse: '$contentModerationResponse',
              reportedUser: '$reportedUser',
              timeStart: '$timeStart',
              timeEnd: '$timeEnd',
              apsaraId: {
                  '$arrayElemAt': ['$mediaSource.apsaraId', 0]
              },
              isApsara: {
                  '$arrayElemAt': ['$mediaSource.apsara', 0]
              },
              apsaraThumbId: {
                  '$arrayElemAt': ['$mediaSource.apsaraThumbId', 0]
              },
              mediaEndpoint: {
                  '$ifNull': [
                      {
                          '$arrayElemAt': ['$mediaSource.mediaEndpoint', 0]
                      },
                      {
                          '$cond': {
                              if : {
                                  '$eq': ['$postType', 'pict']
                              },
                              then: {
                                  '$concat': ['/pict/', '$postID']
                              },
                              else : {
                                  '$concat': ['/stream/', '$postID']
                              }
                          }
                      }
                  ]
              },
              mediaUri: {
                  '$arrayElemAt': ['$mediaSource.mediaUri', 0]
              },
              mediaThumbEndpoint: {
                  '$ifNull': [
                      {
                          '$arrayElemAt': ['$mediaSource.mediaThumbEndpoint', 0]
                      },
                      {
                          '$cond': {
                              if : {
                                  '$eq': ['$postType', 'pict']
                              },
                              then: {
                                  '$concat': ['/pict/', '$postID']
                              },
                              else : {
                                  '$concat': ['/thumb/', '$postID']
                              }
                          }
                      }
                  ]
              },
              mediaThumbUri: {
                  '$arrayElemAt': ['$mediaSource.mediaThumbUri', 0]
              },
              fullName: {
                  '$arrayElemAt': ['$userBasic.fullName', 0]
              },
              username: {
                  '$arrayElemAt': ['$userBasic.username', 0]
              },
              avatar: {
                  mediaBasePath: {
                      '$arrayElemAt': ['$userBasic.mediaBasePath', 0]
                  },
                  mediaUri: {
                      '$arrayElemAt': ['$userBasic.mediaUri', 0]
                  },
                  originalName: {
                      '$arrayElemAt': ['$userBasic.originalName', 0]
                  },
                  fsSourceUri: {
                      '$arrayElemAt': ['$userBasic.fsSourceUri', 0]
                  },
                  fsSourceName: {
                      '$arrayElemAt': ['$userBasic.fsSourceName', 0]
                  },
                  fsTargetUri: {
                      '$arrayElemAt': ['$userBasic.fsTargetUri', 0]
                  },
                  mediaType: {
                      '$arrayElemAt': ['$userBasic.mediaType', 0]
                  },
                  mediaEndpoint: {
                      '$arrayElemAt': ['$userBasic.mediaEndpoint', 0]
                  }
              },
              privacy: {
                  isCelebrity: {
                      '$arrayElemAt': ['$userBasic.isCelebrity', 0]
                  },
                  isIdVerified: {
                      '$arrayElemAt': ['$userBasic.isIdVerified', 0]
                  },
                  isPrivate: {
                      '$arrayElemAt': ['$userBasic.isPrivate', 0]
                  },
                  isFollowPrivate: {
                      '$arrayElemAt': ['$userBasic.isFollowPrivate', 0]
                  },
                  isPostPrivate: {
                      '$arrayElemAt': ['$userBasic.isPostPrivate', 0]
                  }
              },
              verified: {
                  '$arrayElemAt': ['$userBasic.fullName', 0]
              },
              urluserBadge: {
                  '$ifNull': [
                      {
                          '$filter': {
                              input: {
                                  '$arrayElemAt': ['$userBasic.userBadge', 0]
                              },
                              as: 'listbadge',
                              cond: {
                                  '$and': [
                                      {
                                          '$eq': ['$$listbadge.isActive', true]
                                      },
                                      {
                                          '$lte': [
                                              {
                                                  '$dateToString': {
                                                      format: '%Y-%m-%d %H:%M:%S',
                                                      date: {
                                                          '$add': [new Date(), 25200000]
                                                      }
                                                  }
                                              },
                                              '$$listbadge.endDatetime'
                                          ]
                                      }
                                  ]
                              }
                          }
                      },
                      null
                  ]
              },
              mailViewer: '$mailViewer',
              userInterested: {
                  '$arrayElemAt': ['$userInt.userInterests', 0]
              },
              tutorial: {
                  '$map': {
                      input: {
                          '$range': [0, {
                              '$size': '$tutor'
                          }]
                      },
                      as: 'idx',
                      in: {
                          '$mergeObjects': [
                              {
                                  '$arrayElemAt': ['$tutor', '$$idx']
                              },
                              {
                                  '$arrayElemAt': [
                                      {
                                          '$arrayElemAt': ['$setting.value', 3]
                                      },
                                      '$$idx'
                                  ]
                              }
                          ]
                      }
                  }
              },
              intScore: {
                  '$size': '$intScore'
              },
              isLiked: {
                  '$ifNull': ['$isLike', false]
              }
          }
      },
      {
          '$sort': {
              official: - 1,
              selfContent: - 1,
              isBoost: - 1,
              createdAt: - 1,
              likes: - 1,
              comments: - 1,
              views: - 1,
              intScore: - 1,
              friend: - 1,
              following: - 1,
              verified: - 1
          }
      }
    );

    // var util = require('util');
    // console.log(util.inspect(pipeline, { showHidden:false, depth:null }));

    var data = await this.loaddata.aggregate(pipeline);
    return data;
  }
}