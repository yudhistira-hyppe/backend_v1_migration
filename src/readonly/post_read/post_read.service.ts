import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PostsRead, PostsReadDocument } from './schema/post_read.schema';
import { SettingsReadService } from '../setting_read/setting_read.service';


@Injectable()
export class PostsReadService {
  private readonly logger = new Logger(PostsReadService.name);

  constructor(
    @InjectModel(PostsRead.name, 'SERVER_FULL')
    private readonly PostsReadModel: Model<PostsReadDocument>,
    private readonly settingsReadService: SettingsReadService,
  ) { }

  async updateBoostCount(id: string, countBoost: number) {
    let data = await this.PostsReadModel.updateOne({ "_id": id },
      {
        $set: {
          "boostCount": countBoost,
        },

      });
    return data;
  }
  async updateBoostViewer(id: string, email: string) {
    this.PostsReadModel.findOne({ _id: id }).exec().then((ps) => {
      console.log("post boost: " + ps.postID);
      let bs = ps.boosted;
      if (bs != undefined) {
        for (let i = 0; i < bs.length; i++) {
          let bbs = bs[i];
          if (bbs.boostSession != undefined) {
            let bootSession = bbs.boostSession;
            let today = new Date().getTime();
            let st = new Date(String(bootSession.start)).getTime();
            let ed = new Date(String(bootSession.end)).getTime();

            if (st <= today && ed >= today) {
              let interval = Number(bbs.boostInterval.value);
              interval = interval * 60 * 1000;
              let a = (today - st);
              console.log("today: " + a + " interval: " + interval);
              let c = Math.ceil(a / interval);
              console.log("round today: " + c);
              let d = st + (interval * c);

              //let ted = d + (7 * 3600 * 1000);
              let ted = d;

              let td = new Date(ted);
              let stoday = new Date(td.getTime() - (td.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
              stoday = stoday.substring(0, 19);
              console.log(st + " " + d + " " + ted + " " + stoday);

              let tdx = new Date(today);
              let xtoday = new Date(tdx.getTime() - (tdx.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
              xtoday = xtoday.substring(0, 19);

              let bv: any[] = bbs.boostViewer;
              if (bv != undefined) {
                if (bv.length > 0) {
                  for (let x = 0; x < bv.length; x++) {
                    let bbv = bv[x];
                    if (String(bbv.email) == email) {
                      if (bbv.isLast == true) {
                        bbv.isLast = false;
                      }
                    }
                  }

                  let o = {
                    email: email,
                    createAt: xtoday,
                    timeEnd: stoday,
                    isLast: true
                  };

                  bv.push(o);
                } else {
                  let o = {
                    email: email,
                    createAt: xtoday,
                    timeEnd: stoday,
                    isLast: true
                  };

                  bv.push(o);
                }
              }
            }
          }

        }

        console.log(JSON.stringify(bs));

        this.PostsReadModel.updateOne(
          {
            "_id": id,
          },
          {
            $set: {
              "boosted": bs
            }
          },
          function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              console.log(docs);
            }
          }
        );
      }

    });
  }


  async landingpageMy2(email: string, type: string, skip: number, limit: number, emaillogin: string) {
    var pipeline = [];


    if (type == "pict") {

      if (email != emaillogin) {
        pipeline.push({
          $sort: {
            createdAt: - 1,

          }
        },

          {
            $match:
            {
              $and: [

                {
                  "active": true
                },
                {
                  "postType": "pict"
                },
                // {
                //   $expr: {
                //     $gt: ["$boosted.boostSession.end", "$testDate",]
                //   }
                // },
                {
                  email: email
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },


              ]
            }
          },);

      } else {
        pipeline.push({
          $sort: {
            createdAt: - 1,

          }
        },

          {
            $match:
            {
              $and: [

                {
                  "active": true
                },
                {
                  "postType": "pict"
                },
                // {
                //   $expr: {
                //     $gt: ["$boosted.boostSession.end", "$testDate",]
                //   }
                // },
                {
                  email: email
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },);
      }

      pipeline.push(

        {
          $skip: ((skip - 1) * limit)
        },
        {
          $limit: limit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediapicts",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/pict/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1
                }
              }
            ],

          }
        },

        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },

          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },

        },

      );


    }
    else if (type == "vid") {
      if (email != emaillogin) {

        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:36:58"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "vid"
                },
                // {
                //   $expr: {
                //     $gt: ["$boosted.boostSession.end", "$testDate",]
                //   }
                // },
                {
                  email: email
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },
        );

      } else {
        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:36:58"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "vid"
                },
                // {
                //   $expr: {
                //     $gt: ["$boosted.boostSession.end", "$testDate",]
                //   }
                // },
                {
                  email: email
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },
        );

      }

      pipeline.push(


        {
          $skip: ((skip - 1) * limit)
        },
        {
          $limit: limit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediavideos",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1
                }
              }
            ],

          }
        },

        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },

            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },
        },

      );
    }
    else if (type == "diary") {

      if (email != emaillogin) {
        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:57:28"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "diary"
                },
                // {
                //   $expr: {
                //     $gt: ["$boosted.boostSession.end", "$testDate",]
                //   }
                // },
                {
                  email: email
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },);

      } else {
        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:57:28"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "diary"
                },
                // {
                //   $expr: {
                //     $gt: ["$boosted.boostSession.end", "$testDate",]
                //   }
                // },
                {
                  email: email
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },);
      }
      pipeline.push(

        {
          $skip: ((skip - 1) * limit)
        },
        {
          $limit: limit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediadiaries",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1
                }
              }
            ],

          }
        },

        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "stiker":
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },

            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            "stiker": 1,
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },
        },


      );
    }
    else if (type == "story") {

      if (email != emaillogin) {
        pipeline.push(
          {
            "$set": {
              "settimeStart":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), - 61200000] // 1 hari 61200000
                  }
                }
              },

            },

          },
          {
            "$set": {
              "settimeEnd":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), 25200000]
                  }
                }
              }
            }
          },
          {
            "$match":
            {
              $and: [
                {
                  "$expr":
                  {
                    "$eq": ["$postType", "story"]
                  }
                },
                {
                  "reportedStatus": {
                    "$ne": "OWNED"
                  }
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "email": email
                },
                {
                  "$expr":
                  {
                    "$gte": ["$createdAt", '$settimeStart']
                  },

                },
                {
                  "$expr":
                  {
                    "$lte": ["$createdAt", '$settimeEnd']
                  }
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },

              ]
            },

          },);

      } else {
        pipeline.push(
          {
            "$set": {
              "settimeStart":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), - 61200000] // 1 hari 61200000
                  }
                }
              },

            },

          },
          {
            "$set": {
              "settimeEnd":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), 25200000]
                  }
                }
              }
            }
          },
          {
            "$match":
            {
              $and: [
                {
                  "$expr":
                  {
                    "$eq": ["$postType", "story"]
                  }
                },
                {
                  "reportedStatus": {
                    "$ne": "OWNED"
                  }
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "email": emaillogin
                },
                {
                  "$expr":
                  {
                    "$gte": ["$createdAt", '$settimeStart']
                  },

                },
                {
                  "$expr":
                  {
                    "$lte": ["$createdAt", '$settimeEnd']
                  }
                },


              ]
            },

          },);

      }
      pipeline.push(

        // {
        //   $skip: ((skip - 1) * limit)
        // },
        // {
        //   $limit: limit
        // },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediastories",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1
                }
              }
            ],

          }
        },

        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isView",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "VIEW"
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isViewed:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            viewed:
            {
              $filter: {
                input: "$isView",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "stiker":
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },

            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            isView: {
              $arrayElemAt: ["$viewed.isViewed", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            "stiker": 1,
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            isViewed: {
              $ifNull: ["$isView", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },
        },


      );
    }
    console.log(JSON.stringify(pipeline))
    var query = await this.PostsReadModel.aggregate(pipeline);
    return query;
  }

  async landingpageMy2V2(email: string, type: string, skip: number, limit: number, emaillogin: string) {
    var pipeline = [];


    if (type == "pict") {

      if (email != emaillogin) {
        pipeline.push({
          $sort: {
            createdAt: - 1,

          }
        },

          {
            $match:
            {
              $and: [

                {
                  "active": true
                },
                {
                  "postType": "pict"
                },
                {
                  email: email
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },


              ]
            }
          },);

      } else {
        pipeline.push({
          $sort: {
            createdAt: - 1,

          }
        },

          {
            $match:
            {
              $and: [

                {
                  "active": true
                },
                {
                  "postType": "pict"
                },
                {
                  email: email
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },);
      }

      pipeline.push(

        {
          $unwind: "$mediaSource"
        },
        {
          $skip: ((skip - 1) * limit)
        },
        {
          $limit: limit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        // {
        //   "$lookup": {
        //     from: "mediapicts",
        //     as: "media",
        //     let: {
        //       localID: '$postID'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $expr: {
        //             $in: ['$postID', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "isApsara": "$apsara",
        //           "apsaraId": 1,
        //           "apsaraThumbId": 1,
        //           "mediaUri": 1,
        //           "postID": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/pict/", "$postID"]
        //           },
        //           "mediaThumbEndpoint": {
        //             "$concat": ["/thumb/", "$postID"]
        //           },
        //           "mediaThumbUri": "$mediaThumb",
        //           "mediaType": 1,
        //           "uploadSource": 1,
        //           "mediaThumUri": 1
        //         }
        //       }
        //     ],

        //   },

        // },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  username: 1
                }
              }
            ],

          }
        },

        // {
        //   "$lookup": {
        //     from: "userauths",
        //     as: "username",
        //     let: {
        //       localID: '$email'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$email', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           email: 1,
        //           "username": 1
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "username": 1,
                  "mediaType": 1,
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaEndpoint": 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },

          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   $unwind: {
        //     path: "$uName",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   "$lookup": {
        //     from: "mediaprofilepicts",
        //     as: "avatar",
        //     let: {
        //       localID: '$kosong'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $expr: {
        //             $eq: ['$mediaID', "$$localID"]
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "mediaBasePath": 1,
        //           "mediaUri": 1,
        //           "originalName": 1,
        //           "fsSourceUri": 1,
        //           "fsSourceName": 1,
        //           "fsTargetUri": 1,
        //           "mediaType": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/profilepict/", "$mediaID"]
        //           }
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        // {
        //   $unwind: {
        //     path: "$avatar",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$all.mediaSource.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            // "uploadSource":
            // {
            //   $arrayElemAt: ["$media.uploadSource", "$index"]
            // },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId":
            {
              $arrayElemAt: ["$all.mediaSource.apsaraId", "$index"]
            },
            "isApsara":
            {
              $arrayElemAt: ["$all.mediaSource.apsara", "$index"]
            },
            // "apsaraThumbId": "$mediaPost.apsaraThumbId",
            // "mediaEndpoint": "$all.mediaSource.mediaEndpoint",
            "mediaUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaUri", "$index"]
            },
            // "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaEndpoint": {
              "$concat": ["/pict/", "$postID"]
            },
            "mediaThumbEndpoint": {
              "$concat": ["/thumb/", "$postID"]
            },
            "mediaThumbUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaThumb", "$index"]
            },
            "fullName": "$user.fullName",
            "username": "$user.username",
            "avatar": {
              "mediaType": "$user.mediaType",
              "mediaBasePath": "$user.mediaBasePath",
              "mediaUri": "$user.mediaUri",
              "originalName": "$user.originalName",
              "fsSourceUri": "$user.fsSourceUri",
              "fsSourceName": "$user.fsSourceName",
              "fsTargetUri": "$user.fsTargetUri",
              "mediaEndpoint": "$user.mediaEndpoint",
            },
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            // "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            // "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            // "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },

        },

      );


    }
    else if (type == "vid") {
      if (email != emaillogin) {

        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:36:58"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "vid"
                },
                {
                  email: email
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },
        );

      } else {
        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:36:58"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "vid"
                },
                {
                  email: email
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },
        );

      }

      pipeline.push(

        {
          $unwind: "$mediaSource"
        },
        {
          $skip: ((skip - 1) * limit)
        },
        {
          $limit: limit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        // {
        //   "$lookup": {
        //     from: "mediavideos",
        //     as: "media",
        //     let: {
        //       localID: '$postID'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$postID', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "isApsara": "$apsara",
        //           "apsaraId": 1,
        //           "apsaraThumbId": 1,
        //           "mediaUri": 1,
        //           "postID": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/stream/", "$postID"]
        //           },
        //           "mediaThumbEndpoint": {
        //             "$concat": ["/thumb/", "$postID"]
        //           },
        //           "mediaThumbUri": "$mediaThumb",
        //           "mediaType": 1,
        //           "uploadSource": 1,
        //           "mediaThumUri": 1
        //         }
        //       }
        //     ],

        //   },

        // },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  username: 1
                }
              }
            ],

          }
        },

        // {
        //   "$lookup": {
        //     from: "userauths",
        //     as: "username",
        //     let: {
        //       localID: '$email'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$email', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           email: 1,
        //           "username": 1
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "username": 1,
                  "mediaType": 1,
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaEndpoint": 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   $unwind: {
        //     path: "$uName",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   "$lookup": {
        //     from: "mediaprofilepicts",
        //     as: "avatar",
        //     let: {
        //       localID: '$kosong'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $expr: {
        //             $eq: ['$mediaID', "$$localID"]
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "mediaBasePath": 1,
        //           "mediaUri": 1,
        //           "originalName": 1,
        //           "fsSourceUri": 1,
        //           "fsSourceName": 1,
        //           "fsTargetUri": 1,
        //           "mediaType": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/profilepict/", "$mediaID"]
        //           }
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        // {
        //   $unwind: {
        //     path: "$avatar",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$all.mediaSource.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            // "uploadSource":
            // {
            //   $arrayElemAt: ["$media.uploadSource", "$index"]
            // },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },

            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId":
            {
              $arrayElemAt: ["$all.mediaSource.apsaraId", "$index"]
            },
            "isApsara":
            {
              $arrayElemAt: ["$all.mediaSource.apsara", "$index"]
            },
            // "apsaraThumbId": "$mediaPost.apsaraThumbId",
            // "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaUri", "$index"]
            },
            // "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaThumb", "$index"]
            },
            "mediaEndpoint": {
              "$concat": ["/stream/", "$postID"]
            },
            "mediaThumbEndpoint": {
              "$concat": ["/thumb/", "$postID"]
            },
            "fullName": "$user.fullName",
            "username": "$user.username",
            "avatar": {
              "mediaType": "$user.mediaType",
              "mediaBasePath": "$user.mediaBasePath",
              "mediaUri": "$user.mediaUri",
              "originalName": "$user.originalName",
              "fsSourceUri": "$user.fsSourceUri",
              "fsSourceName": "$user.fsSourceName",
              "fsTargetUri": "$user.fsTargetUri",
              "mediaEndpoint": "$user.mediaEndpoint",
            },
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            // "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            // "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            // "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },
        },

      );
    }
    else if (type == "diary") {

      if (email != emaillogin) {
        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:57:28"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "diary"
                },
                {
                  email: email
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },);

      } else {
        pipeline.push({
          $sort: {
            createdAt: - 1,
          }
        },
          {
            $match:
            {
              $and: [
                {
                  $expr: {
                    $gte: ["$createdAt", "2022-01-09 00:57:28"]
                  }
                },
                {
                  "active": true
                },
                {
                  "postType": "diary"
                },
                {
                  email: email
                },
                {
                  $or: [
                    {
                      "reportedUser": {
                        "$elemMatch": {
                          "email": emaillogin,
                          "active": false,

                        }
                      }
                    },
                    {
                      "reportedUser.email": {
                        $not: {
                          $regex: emaillogin
                        }
                      }
                    },

                  ]
                },
              ]
            }
          },);
      }
      pipeline.push(

        {
          $unwind: "$mediaSource"
        },
        {
          $skip: ((skip - 1) * limit)
        },
        {
          $limit: limit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        // {
        //   "$lookup": {
        //     from: "mediadiaries",
        //     as: "media",
        //     let: {
        //       localID: '$postID'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$postID', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "isApsara": "$apsara",
        //           "apsaraId": 1,
        //           "apsaraThumbId": 1,
        //           "mediaUri": 1,
        //           "postID": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/stream/", "$postID"]
        //           },
        //           "mediaThumbEndpoint": {
        //             "$concat": ["/thumb/", "$postID"]
        //           },
        //           "mediaThumbUri": "$mediaThumb",
        //           "mediaType": 1,
        //           "uploadSource": 1,
        //           "mediaThumUri": 1
        //         }
        //       }
        //     ],

        //   },

        // },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  username: 1
                }
              }
            ],

          }
        },

        // {
        //   "$lookup": {
        //     from: "userauths",
        //     as: "username",
        //     let: {
        //       localID: '$email'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$email', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           email: 1,
        //           "username": 1
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "username": 1,
                  "mediaType": 1,
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaEndpoint": 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   "$lookup": {
        //     from: "mediaprofilepicts",
        //     as: "avatar",
        //     let: {
        //       localID: '$kosong'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $expr: {
        //             $eq: ['$mediaID', "$$localID"]
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "mediaBasePath": 1,
        //           "mediaUri": 1,
        //           "originalName": 1,
        //           "fsSourceUri": 1,
        //           "fsSourceName": 1,
        //           "fsTargetUri": 1,
        //           "mediaType": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/profilepict/", "$mediaID"]
        //           }
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        // {
        //   $unwind: {
        //     path: "$avatar",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$all.mediaSource.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "stiker":
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            // "uploadSource":
            // {
            //   $arrayElemAt: ["$media.uploadSource", "$index"]
            // },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },

            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId":
            {
              $arrayElemAt: ["$all.mediaSource.apsaraId", "$index"]
            },
            "isApsara":
            {
              $arrayElemAt: ["$all.mediaSource.apsara", "$index"]
            },
            // "apsaraThumbId": "$mediaPost.apsaraThumbId",
            // "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaUri", "$index"]
            },
            // "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaThumb", "$index"]
            },
            "mediaEndpoint": {
              "$concat": ["/stream/", "$postID"]
            },
            "mediaThumbEndpoint": {
              "$concat": ["/thumb/", "$postID"]
            },
            "fullName": "$user.fullName",
            "username": "$user.username",
            "avatar": {
              "mediaType": "$user.mediaType",
              "mediaBasePath": "$user.mediaBasePath",
              "mediaUri": "$user.mediaUri",
              "originalName": "$user.originalName",
              "fsSourceUri": "$user.fsSourceUri",
              "fsSourceName": "$user.fsSourceName",
              "fsTargetUri": "$user.fsTargetUri",
              "mediaEndpoint": "$user.mediaEndpoint",
            },
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            "stiker": 1,
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            // "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            // "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            // "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },
        },


      );
    }
    else if (type == "story") {

      if (email != emaillogin) {
        pipeline.push(
          {
            "$set": {
              "settimeStart":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), - 61200000] // 1 hari 61200000
                  }
                }
              },

            },

          },
          {
            "$set": {
              "settimeEnd":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), 25200000]
                  }
                }
              }
            }
          },
          {
            "$match":
            {
              $and: [
                {
                  "$expr":
                  {
                    "$eq": ["$postType", "story"]
                  }
                },
                {
                  "reportedStatus": {
                    "$ne": "OWNED"
                  }
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "email": email
                },
                {
                  "$expr":
                  {
                    "$gte": ["$createdAt", '$settimeStart']
                  },

                },
                {
                  "$expr":
                  {
                    "$lte": ["$createdAt", '$settimeEnd']
                  }
                },
                {
                  "reportedStatus": {
                    $ne: "OWNED"
                  }
                },

              ]
            },

          },);

      } else {
        pipeline.push(
          {
            "$set": {
              "settimeStart":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), - 61200000] // 1 hari 61200000
                  }
                }
              },

            },

          },
          {
            "$set": {
              "settimeEnd":
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), 25200000]
                  }
                }
              }
            }
          },
          {
            "$match":
            {
              $and: [
                {
                  "$expr":
                  {
                    "$eq": ["$postType", "story"]
                  }
                },
                {
                  "reportedStatus": {
                    "$ne": "OWNED"
                  }
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "email": emaillogin
                },
                {
                  "$expr":
                  {
                    "$gte": ["$createdAt", '$settimeStart']
                  },

                },
                {
                  "$expr":
                  {
                    "$lte": ["$createdAt", '$settimeEnd']
                  }
                },


              ]
            },

          },);

      }
      pipeline.push(

        {
          $unwind: "$mediaSource"
        },
        // {
        //   $skip: ((skip - 1) * limit)
        // },
        // {
        //   $limit: limit
        // },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        // {
        //   "$lookup": {
        //     from: "mediastories",
        //     as: "media",
        //     let: {
        //       localID: '$postID'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$postID', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "isApsara": "$apsara",
        //           "apsaraId": 1,
        //           "apsaraThumbId": 1,
        //           "mediaUri": 1,
        //           "postID": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/stream/", "$postID"]
        //           },
        //           "mediaThumbEndpoint": {
        //             "$concat": ["/thumb/", "$postID"]
        //           },
        //           "mediaThumbUri": "$mediaThumb",
        //           "mediaType": 1,
        //           "uploadSource": 1,
        //           "mediaThumUri": 1
        //         }
        //       }
        //     ],

        //   },

        // },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  username: 1
                }
              }
            ],

          }
        },

        // {
        //   "$lookup": {
        //     from: "userauths",
        //     as: "username",
        //     let: {
        //       localID: '$email'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {


        //           $expr: {
        //             $in: ['$email', '$$localID']
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           email: 1,
        //           "username": 1
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "username": 1,
                  "mediaType": 1,
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaEndpoint": 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isView",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "VIEW"
                    },
                    {
                      "email": emaillogin,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isViewed:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        // {
        //   $set:
        //   {
        //     uName:
        //     {
        //       $filter: {
        //         input: "$username",
        //         as: "nonok",
        //         cond: {
        //           $eq: ["$$nonok.email", {
        //             $arrayElemAt: ["$all.email", "$index"]
        //           },]
        //         }
        //       }
        //     },

        //   }
        // },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   "$lookup": {
        //     from: "mediaprofilepicts",
        //     as: "avatar",
        //     let: {
        //       localID: '$kosong'
        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $expr: {
        //             $eq: ['$mediaID', "$$localID"]
        //           }
        //         }
        //       },
        //       {
        //         $project: {
        //           "mediaBasePath": 1,
        //           "mediaUri": 1,
        //           "originalName": 1,
        //           "fsSourceUri": 1,
        //           "fsSourceName": 1,
        //           "fsTargetUri": 1,
        //           "mediaType": 1,
        //           "mediaEndpoint": {
        //             "$concat": ["/profilepict/", "$mediaID"]
        //           }
        //         }
        //       }
        //     ],

        //   }
        // },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        // {
        //   $unwind: {
        //     path: "$avatar",
        //     preserveNullAndEmptyArrays: true
        //   }
        // },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            viewed:
            {
              $filter: {
                input: "$isView",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "stiker":
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "apsaraMusicThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$all.mediaSource.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            // "uploadSource":
            // {
            //   $arrayElemAt: ["$media.uploadSource", "$index"]
            // },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },

            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            isView: {
              $arrayElemAt: ["$viewed.isViewed", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId":
            {
              $arrayElemAt: ["$all.mediaSource.apsaraId", "$index"]
            },
            "isApsara":
            {
              $arrayElemAt: ["$all.mediaSource.apsara", "$index"]
            },
            // "apsaraThumbId": "$mediaPost.apsaraThumbId",
            // "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaUri", "$index"]
            },
            // "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri":
            {
              $arrayElemAt: ["$all.mediaSource.mediaThumb", "$index"]
            },
            "mediaEndpoint": {
              "$concat": ["/stream/", "$postID"]
            },
            "mediaThumbEndpoint": {
              "$concat": ["/thumb/", "$postID"]
            },
            "fullName": "$user.fullName",
            "username": "$user.username",
            "avatar": {
              "mediaType": "$user.mediaType",
              "mediaBasePath": "$user.mediaBasePath",
              "mediaUri": "$user.mediaUri",
              "originalName": "$user.originalName",
              "fsSourceUri": "$user.fsSourceUri",
              "fsSourceName": "$user.fsSourceName",
              "fsTargetUri": "$user.fsTargetUri",
              "mediaEndpoint": "$user.mediaEndpoint",
            },
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$userBasic.urluserBadge", 0
                      ]
                  },
                  []
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            "stiker": 1,
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            isViewed: {
              $ifNull: ["$isView", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "apsaraMusicThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            // "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            // "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            // "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },
        },


      );
    }
    console.log(JSON.stringify(pipeline))
    var query = await this.PostsReadModel.aggregate(pipeline);
    return query;
  }

  async landingpage5(email: string, type: string, skip: number, limit: number) {
    var pipeline = [];
    var dataseting = null;
    var sortObject = null;
    var value = 0;
    var idsetting = "64d06e5c451e0000bd006c62";
    var valuelimit = 0;

    try {
      dataseting = await this.settingsReadService.findOne(idsetting);
      valuelimit = dataseting._doc.value;
    } catch (e) {
      valuelimit = 0;
    }

    var x = (2 * valuelimit);

    if (skip >= x) {
      skip = skip + 1;
    }

    if (type == "pict") {
      try {
        dataseting = await this.settingsReadService.findOneByJenis("PictLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(
        {
          $set: {
            postStart: "2022-10-18 04:51:36"
          }
        },
        {
          $match: {
            $expr: {
              $gte: ["$createdAt", "$postStart"]
            }
          }
        },
        {
          $sort: {
            createdAt: - 1,

          }
        },
        {
          "$unwind": {
            "path": "$boosted",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$unwind": {
            "path": "$boosted.boostSession",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeStart"
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeEnd"
              ]
            }
          }
        },
        {
          $set: {
            lastTime: {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " 08:00:00"
              ]
            }
          }
        },
        {
          $set: {
            timeEnd:
            {
              $cond: {
                if: {
                  $lt: ["$timeEnd", "$lastTime"]
                },
                then: {
                  "$concat": [
                    {
                      "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date":
                        {
                          $dateAdd:
                          {
                            startDate: new Date(),
                            unit: "day",
                            amount: 1
                          }
                        }
                      }
                    },
                    " ",
                    "$boosted.boostSession.timeEnd"
                  ]
                },
                else: "$timeEnd"
              }
            },

          },

        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $set: {
            oldDate:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 30600000]
                }
              }
            }
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", "$oldDate"]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    $expr: {
                      $lte: ["$boosted.boostSession.start", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$boosted.boostSession.end", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: -1,
          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediapicts",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/pict/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  tutor: {
                    $ifNull: ["$tutor", [
                      {
                        "key": "protection",
                        "status": true
                      },
                      {
                        "key": "sell",
                        "status": true
                      },
                      {
                        "key": "interest",
                        "status": true
                      },
                      {
                        "key": "ownership",
                        "status": true
                      },
                      {
                        "key": "boost",
                        "status": true
                      },
                      {
                        "key": "transaction",
                        "status": true
                      },
                      {
                        "key": "idRefferal",
                        "status": true
                      },
                      {
                        "key": "shareRefferal",
                        "status": true
                      },
                      {
                        "key": "codeRefferal",
                        "status": true
                      }
                    ]]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": email,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },

          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set: {
            tutorNew:
            {
              $cond: {
                if: {
                  $eq: ["$userInterest.tutor", []]
                },
                then: [
                  {
                    "key": "protection",
                    "status": true
                  },
                  {
                    "key": "sell",
                    "status": true
                  },
                  {
                    "key": "interest",
                    "status": true
                  },
                  {
                    "key": "ownership",
                    "status": true
                  },
                  {
                    "key": "boost",
                    "status": true
                  },
                  {
                    "key": "transaction",
                    "status": true
                  },
                  {
                    "key": "idRefferal",
                    "status": true
                  },
                  {
                    "key": "shareRefferal",
                    "status": true
                  },
                  {
                    "key": "codeRefferal",
                    "status": true
                  }
                ],
                else: "$userInterest.tutor"
              }
            },
          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            viewerCount:
            {
              $size:
              {
                $arrayElemAt: ["$all.mailViewer", "$index"]
              },

            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            tutor: "$tutorNew",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$user.urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge: 1
          },

        },

      );

      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }
    else if (type == "vid") {

      try {
        dataseting = await this.settingsReadService.findOneByJenis("VidLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(


        {
          "$unwind": {
            "path": "$boosted",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$unwind": {
            "path": "$boosted.boostSession",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeStart"
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeEnd"
              ]
            }
          }
        },
        {
          $set: {
            lastTime: {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " 08:00:00"
              ]
            }
          }
        },
        {
          $set: {
            timeEnd:
            {
              $cond: {
                if: {
                  $lt: ["$timeEnd", "$lastTime"]
                },
                then: {
                  "$concat": [
                    {
                      "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date":
                        {
                          $dateAdd:
                          {
                            startDate: new Date(),
                            unit: "day",
                            amount: 1
                          }
                        }
                      }
                    },
                    " ",
                    "$boosted.boostSession.timeEnd"
                  ]
                },
                else: "$timeEnd"
              }
            },

          },

        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $set: {
            oldDate:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 30600000]
                }
              }
            }
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", "$oldDate"]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                //{
                //		$subtract: [
                //				{
                //						$size: "$dodolCount"
                //				},
                //				1
                //		]
                //},
                else: 1
              }
            },

          }
        },
        {
          $sort: {
            createdAt: - 1,

          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:36:58"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "vid"
                  },
                  {
                    $expr: {
                      $lte: ["$boosted.boostSession.start", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$boosted.boostSession.end", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "vid"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediavideos",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  tutor: {
                    $ifNull: ["$tutor", [
                      {
                        "key": "protection",
                        "status": true
                      },
                      {
                        "key": "sell",
                        "status": true
                      },
                      {
                        "key": "interest",
                        "status": true
                      },
                      {
                        "key": "ownership",
                        "status": true
                      },
                      {
                        "key": "boost",
                        "status": true
                      },
                      {
                        "key": "transaction",
                        "status": true
                      },
                      {
                        "key": "idRefferal",
                        "status": true
                      },
                      {
                        "key": "shareRefferal",
                        "status": true
                      },
                      {
                        "key": "codeRefferal",
                        "status": true
                      }
                    ]]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": email,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },

          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set: {
            tutorNew:
            {
              $cond: {
                if: {
                  $eq: ["$userInterest.tutor", []]
                },
                then: [
                  {
                    "key": "protection",
                    "status": true
                  },
                  {
                    "key": "sell",
                    "status": true
                  },
                  {
                    "key": "interest",
                    "status": true
                  },
                  {
                    "key": "ownership",
                    "status": true
                  },
                  {
                    "key": "boost",
                    "status": true
                  },
                  {
                    "key": "transaction",
                    "status": true
                  },
                  {
                    "key": "idRefferal",
                    "status": true
                  },
                  {
                    "key": "shareRefferal",
                    "status": true
                  },
                  {
                    "key": "codeRefferal",
                    "status": true
                  }
                ],
                else: "$userInterest.tutor"
              }
            },
          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            viewerCount:
            {
              $size:
              {
                $arrayElemAt: ["$all.mailViewer", "$index"]
              },

            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            tutor: "$tutorNew",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$user.urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge: 1
          },

        },
      );

      pipeline.push(
        {
          $sort: sortObject
        },
      );
    } else if (type == "diary") {
      try {
        dataseting = await this.settingsReadService.findOneByJenis("DiaryLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(

        {
          "$unwind": {
            "path": "$boosted",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$unwind": {
            "path": "$boosted.boostSession",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeStart"
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeEnd"
              ]
            }
          }
        },
        {
          $set: {
            lastTime: {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " 08:00:00"
              ]
            }
          }
        },
        {
          $set: {
            timeEnd:
            {
              $cond: {
                if: {
                  $lt: ["$timeEnd", "$lastTime"]
                },
                then: {
                  "$concat": [
                    {
                      "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date":
                        {
                          $dateAdd:
                          {
                            startDate: new Date(),
                            unit: "day",
                            amount: 1
                          }
                        }
                      }
                    },
                    " ",
                    "$boosted.boostSession.timeEnd"
                  ]
                },
                else: "$timeEnd"
              }
            },

          },

        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $set: {
            oldDate:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 30600000]
                }
              }
            }
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", "$oldDate"]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                //{
                //		$subtract: [
                //				{
                //						$size: "$dodolCount"
                //				},
                //				1
                //		]
                //},
                else: 1
              }
            },

          }
        },

        {
          $sort: {
            createdAt: - 1,

          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:57:28"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    $expr: {
                      $lte: ["$boosted.boostSession.start", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$boosted.boostSession.end", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediadiaries",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  tutor: {
                    $ifNull: ["$tutor", [
                      {
                        "key": "protection",
                        "status": true
                      },
                      {
                        "key": "sell",
                        "status": true
                      },
                      {
                        "key": "interest",
                        "status": true
                      },
                      {
                        "key": "ownership",
                        "status": true
                      },
                      {
                        "key": "boost",
                        "status": true
                      },
                      {
                        "key": "transaction",
                        "status": true
                      },
                      {
                        "key": "idRefferal",
                        "status": true
                      },
                      {
                        "key": "shareRefferal",
                        "status": true
                      },
                      {
                        "key": "codeRefferal",
                        "status": true
                      }
                    ]]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": email,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },

          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set: {
            tutorNew:
            {
              $cond: {
                if: {
                  $eq: ["$userInterest.tutor", []]
                },
                then: [
                  {
                    "key": "protection",
                    "status": true
                  },
                  {
                    "key": "sell",
                    "status": true
                  },
                  {
                    "key": "interest",
                    "status": true
                  },
                  {
                    "key": "ownership",
                    "status": true
                  },
                  {
                    "key": "boost",
                    "status": true
                  },
                  {
                    "key": "transaction",
                    "status": true
                  },
                  {
                    "key": "idRefferal",
                    "status": true
                  },
                  {
                    "key": "shareRefferal",
                    "status": true
                  },
                  {
                    "key": "codeRefferal",
                    "status": true
                  }
                ],
                else: "$userInterest.tutor"
              }
            },
          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            stiker:
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            viewerCount:
            {
              $size:
              {
                $arrayElemAt: ["$all.mailViewer", "$index"]
              },

            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            tutor: "$tutorNew",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$user.urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            stiker: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge: 1
          },

        },
      );
      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }

    console.log(JSON.stringify(pipeline));
    var query = await this.PostsReadModel.aggregate(pipeline);
    return query;
  }

  async landingpage6(email: string, type: string, skip: number, limit: number) {
    var pipeline = [];
    var dataseting = null;
    var sortObject = null;
    var value = 0;
    var idsetting = "64d06e5c451e0000bd006c62";
    var valuelimit = 0;

    try {
      dataseting = await this.settingsReadService.findOne(idsetting);
      valuelimit = dataseting._doc.value;
    } catch (e) {
      valuelimit = 0;
    }

    var x = (2 * valuelimit);

    if (skip >= x) {
      skip = skip + 1;
    }

    if (type == "pict") {
      try {
        dataseting = await this.settingsReadService.findOneByJenis("PictLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(
        {
          $set: {
            postStart: "2022-10-18 04:51:36"
          }
        },
        {
          $match: {
            $expr: {
              $gte: ["$createdAt", "$postStart"]
            }
          }
        },
        {
          $sort: {
            createdAt: - 1,

          }
        },
        {
          "$unwind": {
            "path": "$boosted",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$unwind": {
            "path": "$boosted.boostSession",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeStart"
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                "$boosted.boostSession.timeEnd"
              ]
            }
          }
        },
        {
          $set: {
            lastTime: {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " 08:00:00"
              ]
            }
          }
        },
        {
          $set: {
            timeEnd:
            {
              $cond: {
                if: {
                  $lt: ["$timeEnd", "$lastTime"]
                },
                then: {
                  "$concat": [
                    {
                      "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date":
                        {
                          $dateAdd:
                          {
                            startDate: new Date(),
                            unit: "day",
                            amount: 1
                          }
                        }
                      }
                    },
                    " ",
                    "$boosted.boostSession.timeEnd"
                  ]
                },
                else: "$timeEnd"
              }
            },

          },

        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $set: {
            oldDate:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 30600000]
                }
              }
            }
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", "$oldDate"]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    $expr: {
                      $lte: ["$boosted.boostSession.start", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$boosted.boostSession.end", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: -1,
          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediapicts",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/pict/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],

          },

        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {

                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },

                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  tutor: {
                    $ifNull: ["$tutor", [
                      {
                        "key": "protection",
                        "status": true
                      },
                      {
                        "key": "sell",
                        "status": true
                      },
                      {
                        "key": "interest",
                        "status": true
                      },
                      {
                        "key": "ownership",
                        "status": true
                      },
                      {
                        "key": "boost",
                        "status": true
                      },
                      {
                        "key": "transaction",
                        "status": true
                      },
                      {
                        "key": "idRefferal",
                        "status": true
                      },
                      {
                        "key": "shareRefferal",
                        "status": true
                      },
                      {
                        "key": "codeRefferal",
                        "status": true
                      }
                    ]]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {


                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive", true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",

                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": email,

                    },

                  ]
                },

              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },

                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,

                    },

                  ]
                }
              }
            ]
          },

        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },

          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },

          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },

          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },

          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },

              }
            },

          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],

          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },

          }
        },
        {
          $set: {
            tutorNew:
            {
              $cond: {
                if: {
                  $eq: ["$userInterest.tutor", []]
                },
                then: [
                  {
                    "key": "protection",
                    "status": true
                  },
                  {
                    "key": "sell",
                    "status": true
                  },
                  {
                    "key": "interest",
                    "status": true
                  },
                  {
                    "key": "ownership",
                    "status": true
                  },
                  {
                    "key": "boost",
                    "status": true
                  },
                  {
                    "key": "transaction",
                    "status": true
                  },
                  {
                    "key": "idRefferal",
                    "status": true
                  },
                  {
                    "key": "shareRefferal",
                    "status": true
                  },
                  {
                    "key": "codeRefferal",
                    "status": true
                  }
                ],
                else: "$userInterest.tutor"
              }
            },
          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            viewerCount:
            {
              $size:
              {
                $arrayElemAt: ["$all.mailViewer", "$index"]
              },

            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },

            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",

            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            tutor: "$tutorNew",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$user.urluserBadge", 0
                      ]
                  },
                  null
                ],
            }
          },

        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge: 1
          },

        },

      );

      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }
    else if (type == "vid") {

      try {
        dataseting = await this.settingsReadService.findOneByJenis("VidLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(

        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeStart", 0]
                }
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeEnd", 0]
                }
              ]
            }
          }
        },
        {
          $sort: {
            createdAt: - 1,

          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:57:28"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "vid"
                  },
                  {
                    $expr: {
                      $lte: ["$boosted.boostSession.start", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$boosted.boostSession.end", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "vid"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        }, {
        $set: {
          lastTime: {
            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": new Date()
                }
              },
              " 08:00:00"
            ]
          }
        }
      },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $set: {
            oldDate:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 30600000]
                }
              }
            }
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", "$oldDate"]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediavideos",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  //
                  //
                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],
            //
          },
          //
        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {
                  //
                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },
                      //
                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },
                      //
                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  tutor: {
                    $ifNull: ["$tutor", [
                      {
                        "key": "protection",
                        "status": true
                      },
                      {
                        "key": "sell",
                        "status": true
                      },
                      {
                        "key": "interest",
                        "status": true
                      },
                      {
                        "key": "ownership",
                        "status": true
                      },
                      {
                        "key": "boost",
                        "status": true
                      },
                      {
                        "key": "transaction",
                        "status": true
                      },
                      {
                        "key": "idRefferal",
                        "status": true
                      },
                      {
                        "key": "shareRefferal",
                        "status": true
                      },
                      {
                        "key": "codeRefferal",
                        "status": true
                      }
                    ]]
                  }
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  //
                  //
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive",
                                        true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",
                  //
                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',
              //
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": email,
                      //
                    },
                    //
                  ]
                },
                //
              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },
                  //
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,
                      //
                    },
                    //
                  ]
                }
              }
            ]
          },
          //
        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
            //
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },
            //
          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },
            //
          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },
            //
          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },
                //
              }
            },
            //
          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],
            //
          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set: {
            tutorNew:
            {
              $cond: {
                if: {
                  $eq: ["$userInterest.tutor", []]
                },
                then: [
                  {
                    "key": "protection",
                    "status": true
                  },
                  {
                    "key": "sell",
                    "status": true
                  },
                  {
                    "key": "interest",
                    "status": true
                  },
                  {
                    "key": "ownership",
                    "status": true
                  },
                  {
                    "key": "boost",
                    "status": true
                  },
                  {
                    "key": "transaction",
                    "status": true
                  },
                  {
                    "key": "idRefferal",
                    "status": true
                  },
                  {
                    "key": "shareRefferal",
                    "status": true
                  },
                  {
                    "key": "codeRefferal",
                    "status": true
                  }
                ],
                else: "$userInterest.tutor"
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            stiker:
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            viewerCount:
            {
              $size:
              {
                $arrayElemAt: ["$all.mailViewer", "$index"]
              },
              //
            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },
              //
            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",
              //
            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            tutor: "$tutorNew",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$user.urluserBadge",
                        0
                      ]
                  },
                  null
                ],

            }
          },
          //
        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },
                    //
                  ]
                }
              },
              //
            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            stiker: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge: 1
          },
          //
        },

      );

      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }
    else if (type == "diary") {
      try {
        dataseting = await this.settingsReadService.findOneByJenis("DiaryLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(

        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeStart", 0]
                }
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeEnd", 0]
                }
              ]
            }
          }
        },
        {
          $sort: {
            createdAt: - 1,

          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:57:28"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    $expr: {
                      $lte: ["$boosted.boostSession.start", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$boosted.boostSession.end", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        }, {
        $set: {
          lastTime: {
            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": new Date()
                }
              },
              " 08:00:00"
            ]
          }
        }
      },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $set: {
            oldDate:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), - 30600000]
                }
              }
            }
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", "$oldDate"]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },

        {
          $group: {
            _id: "$postType",
            postID: {
              $push: "$postID"
            },
            all: {
              $push: "$$ROOT"
            },
            email: {
              $push: "$email"
            },
            categories: {
              $push: "$category.$id"
            },
            tagPeople: {
              $push: '$tagPeople.$id'
            },
            mailViewer: {
              $push: '$mailViewer'
            },
            musicId: {
              $push: '$musicId'
            },
            oldDate: {
              $push: '$oldDate'
            },
            testDate: {
              $push: '$testDate'
            },
            selfContents: {
              $push: '$selfContents'
            },
            userProfile: {
              $push: '$userProfile'
            },

          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },
                    // {
                    //   "sequenceNumber": 0
                    // },
                  ]
                }
              },
              {
                "$lookup": {
                  from: "userauths",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },
              // {
              //   $limit: 2
              // },
              {
                $group: {
                  _id: "$postID",
                  komentar: {
                    $push: "$$ROOT"
                  }
                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $in: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "contentevents",
            as: "following",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$senderParty', '$$localID']
                      }
                    },
                    {
                      "email": email
                    },
                    {
                      "eventType": "FOLLOWING",

                    },
                    {
                      "event": "ACCEPT"
                    },
                    {
                      "active": true
                    },

                  ]
                }
              },
              {
                $project: {
                  senderParty: 1,
                  following:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $strLenCP: "$email"
                        }, 0]
                      },
                      then: true,
                      else: false
                    }
                  },

                }
              }
            ]
          },

        },
        {
          "$lookup": {
            from: "mediadiaries",
            as: "media",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  //
                  //
                  $expr: {
                    $in: ['$postID', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "isApsara": "$apsara",
                  "apsaraId": 1,
                  "apsaraThumbId": 1,
                  "mediaUri": 1,
                  "postID": 1,
                  "mediaEndpoint": {
                    "$concat": ["/stream/", "$postID"]
                  },
                  "mediaThumbEndpoint": {
                    "$concat": ["/thumb/", "$postID"]
                  },
                  "mediaThumbUri": "$mediaThumb",
                  "mediaType": 1,
                  "uploadSource": 1,
                  "mediaThumUri": 1
                }
              }
            ],
            //
          },
          //
        },
        {
          $addFields: {
            category: {
              "$reduce": {
                "input": "$categories",
                "initialValue": [],
                "in": {
                  "$concatArrays": [
                    "$$this",
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$lookup": {
            from: "interests_repo",
            as: "cats",
            let: {
              localID: '$category'
            },
            pipeline: [
              {
                $match: {
                  //
                  $expr: {
                    $and: [
                      {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      },
                      //
                    ]
                  }
                }
              },
              {
                $project: {
                  "interestName": 1,
                  "langIso": 1,
                  "icon": 1,
                  "createdAt": 1,
                  "updatedAt": 1
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userInterest",
            let: {
              localID: email
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$email", "$$localID"]
                      },
                      //
                    ]
                  }
                }
              },
              {
                $project: {
                  userInterests: "$userInterests.$id",
                  email: 1,
                  tutor: {
                    $ifNull: ["$tutor", [
                      {
                        "key": "protection",
                        "status": true
                      },
                      {
                        "key": "sell",
                        "status": true
                      },
                      {
                        "key": "interest",
                        "status": true
                      },
                      {
                        "key": "ownership",
                        "status": true
                      },
                      {
                        "key": "boost",
                        "status": true
                      },
                      {
                        "key": "transaction",
                        "status": true
                      },
                      {
                        "key": "idRefferal",
                        "status": true
                      },
                      {
                        "key": "shareRefferal",
                        "status": true
                      },
                      {
                        "key": "codeRefferal",
                        "status": true
                      }
                    ]]
                  }
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "username",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  //
                  //
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  email: 1,
                  "username": 1
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userbasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$email', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "fullName": 1,
                  "profilePict": 1,
                  "isCelebrity": 1,
                  "isIdVerified": 1,
                  "isPrivate": 1,
                  "isFollowPrivate": 1,
                  "isPostPrivate": 1,
                  email: 1,
                  "urluserBadge":
                  {
                    "$ifNull":
                      [
                        {
                          "$filter":
                          {
                            input: "$userBadge",
                            as: "listbadge",
                            cond:
                            {
                              "$and":
                                [
                                  {
                                    "$eq":
                                      [
                                        "$$listbadge.isActive",
                                        true
                                      ]
                                  },
                                  {
                                    "$lte": [
                                      {
                                        "$dateToString": {
                                          "format": "%Y-%m-%d %H:%M:%S",
                                          "date": {
                                            "$add": [
                                              new Date(),
                                              25200000
                                            ]
                                          }
                                        }
                                      },
                                      "$$listbadge.endDatetime"
                                    ]
                                  }
                                ]
                            }
                          }
                        },
                        []
                      ]
                  },

                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",
                  //
                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "contentevents",
            as: "isLike",
            let: {
              picts: '$postID',
              //
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$picts']
                      }
                    },
                    {
                      "eventType": "LIKE"
                    },
                    {
                      "event": "DONE"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": email,
                      //
                    },
                    //
                  ]
                },
                //
              },
              {
                $set: {
                  kancut: {
                    $ifNull: ["email", "kosong"]
                  }
                }
              },
              {
                $project: {
                  "email": 1,
                  "postID": 1,
                  isLiked:
                  {
                    $cond: {
                      if: {
                        $eq: ["$kancut", "kosong"]
                      },
                      then: false,
                      else: true
                    }
                  },
                  //
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "disquslogs",
            as: "countLogs",
            let: {
              localID: '$postID'
            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": true,
                      //
                    },
                    //
                  ]
                }
              }
            ]
          },
          //
        },
        {
          $unwind: {
            path: "$postID"
          }
        },
        {
          $unwind: {
            path: "$userInterest",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            index: {
              $indexOfArray: ["$all.postID", "$postID"]
            }
          }
        },
        {
          $set: {
            indexComment:
            {
              $indexOfArray: ["$comment._id", {
                $arrayElemAt: ["$all.postID", "$index"]
              },]
            },
            //
          }
        },
        {
          $set: {
            ded:
            {
              $cond: {
                if: {
                  $gte: ["$indexComment", 0]
                },
                then:
                {
                  $arrayElemAt: ["$comment.komentar", "$indexComment"]
                },
                else: []
              }
            },
            //
          }
        },
        {
          $set:
          {
            user:
            {
              $filter: {
                input: "$userBasic",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            followings:
            {
              $filter: {
                input: "$following",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.senderParty", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            uName:
            {
              $filter: {
                input: "$username",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            friendster:
            {
              $filter: {
                input: "$friend",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.email", {
                    $arrayElemAt: ["$all.email", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set:
          {
            mediaPost:
            {
              $filter: {
                input: "$media",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$uName",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$mediaPost",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set: {
            kosong: {
              $ifNull: ['$user.profilePict.$id', "kancut"]
            }
          }
        },
        {
          $set: {
            cekMusic:
            {
              $arrayElemAt: ["$all", "$index"]
            },
            //
          }
        },
        {
          $set: {
            musicOk: {
              $ifNull: ["$cekMusic.musicId", "kampret"]
            },
            //
          }
        },
        {
          $set: {
            musicNih:
            {
              $cond: {
                if: {
                  $eq: ["$musicOk", "kampret"]
                },
                then: "$ilang",
                else:
                {
                  $filter: {
                    input: "$music",
                    as: "song",
                    cond: {
                      $eq: ["$$song._id", "$cekMusic.musicId"]
                    }
                  }
                },
                //
              }
            },
            //
          }
        },
        {
          $unwind: {
            path: "$musicNih",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$lookup": {
            from: "mediaprofilepicts",
            as: "avatar",
            let: {
              localID: '$kosong'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$mediaID', "$$localID"]
                  }
                }
              },
              {
                $project: {
                  "mediaBasePath": 1,
                  "mediaUri": 1,
                  "originalName": 1,
                  "fsSourceUri": 1,
                  "fsSourceName": 1,
                  "fsTargetUri": 1,
                  "mediaType": 1,
                  "mediaEndpoint": {
                    "$concat": ["/profilepict/", "$mediaID"]
                  }
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "userauths",
            as: "userTag",
            let: {
              localID:
              {
                $arrayElemAt: ['$tagPeople', "$index"]
              }
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $in: ['$_id', {
                      $ifNull: ['$$localID', []]
                    }]
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],
            //
          }
        },
        {
          $unwind: {
            path: "$avatar",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $set:
          {
            liked:
            {
              $filter: {
                input: "$isLike",
                as: "nonok",
                cond: {
                  $eq: ["$$nonok.postID", {
                    $arrayElemAt: ["$all.postID", "$index"]
                  },]
                }
              }
            },
            //
          }
        },
        {
          $set: {
            tutorNew:
            {
              $cond: {
                if: {
                  $eq: ["$userInterest.tutor", []]
                },
                then: [
                  {
                    "key": "protection",
                    "status": true
                  },
                  {
                    "key": "sell",
                    "status": true
                  },
                  {
                    "key": "interest",
                    "status": true
                  },
                  {
                    "key": "ownership",
                    "status": true
                  },
                  {
                    "key": "boost",
                    "status": true
                  },
                  {
                    "key": "transaction",
                    "status": true
                  },
                  {
                    "key": "idRefferal",
                    "status": true
                  },
                  {
                    "key": "shareRefferal",
                    "status": true
                  },
                  {
                    "key": "codeRefferal",
                    "status": true
                  }
                ],
                else: "$userInterest.tutor"
              }
            },

          }
        },
        {
          $project: {
            test1:
            {
              $arrayElemAt: ["$mailViewer", "$index"]
            },
            test2:
            {
              $arrayElemAt: ["$all.kancuts", "$index"]
            },
            _id:
            {
              $arrayElemAt: ["$all.postID", "$index"]
            },
            stiker:
            {
              $arrayElemAt: ["$all.stiker", "$index"]
            },
            musicTitle: "$musicNih.musicTitle",
            "postID": 1,
            "artistName": "$musicNih.artistName",
            "albumName": "$musicNih.albumName",
            "apsaraMusic": "$musicNih.apsaraMusic",
            "apsaraThumnail": "$musicNih.apsaraThumnail",
            "genre": "$musicNih.genre",
            "theme": "$musicNih.theme",
            "mood": "$musicNih.mood",
            "testDate":
            {
              $arrayElemAt: ["$testDate", 0]
            },
            "tagPeople":
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.tagPeople", "$index"]
                    },
                    []
                  ]
                },
                then: [],
                else: "$userTag"
                //
                //  $arrayElemAt: ["$userTag.username", "$index"]
                //}
              }
            },
            "mediaType":
            {
              $arrayElemAt: ["$media.mediaType", "$index"]
            },
            "postType":
            {
              $arrayElemAt: ["$all.postType", "$index"]
            },
            "description":
            {
              $arrayElemAt: ["$all.description", "$index"]
            },
            "active":
            {
              $arrayElemAt: ["$all.active", "$index"]
            },
            "createdAt":
            {
              $arrayElemAt: ["$all.createdAt", "$index"]
            },
            "updatedAt":
            {
              $arrayElemAt: ["$all.updatedAt", "$index"]
            },
            "expiration":
            {
              $arrayElemAt: ["$all.expiration", "$index"]
            },
            "visibility":
            {
              $arrayElemAt: ["$all.visibility", "$index"]
            },
            "location":
            {
              $arrayElemAt: ["$all.location", "$index"]
            },
            "tags":
            {
              $arrayElemAt: ["$all.tags", "$index"]
            },
            "allowComments":
            {
              $arrayElemAt: ["$all.allowComments", "$index"]
            },
            "isSafe": {
              $arrayElemAt: ["$all.isSafe", "$index"]
            },
            "isOwned":
            {
              $arrayElemAt: ["$all.isOwned", "$index"]
            },
            "certified":
            {
              $arrayElemAt: ["$all.certified", "$index"]
            },
            "saleAmount":
            {
              $arrayElemAt: ["$all.saleAmount", "$index"]
            },
            "saleLike":
            {
              $arrayElemAt: ["$all.saleLike", "$index"]
            },
            "saleView":
            {
              $arrayElemAt: ["$all.saleView", "$index"]
            },
            "isShared":
            {
              $arrayElemAt: ["$all.isShared", "$index"]
            },
            "likes":
            {
              $arrayElemAt: ["$all.likes", "$index"]
            },
            "views":
            {
              $arrayElemAt: ["$all.views", "$index"]
            },
            "shares":
            {
              $arrayElemAt: ["$all.shares", "$index"]
            },
            "uploadSource":
            {
              $arrayElemAt: ["$media.uploadSource", "$index"]
            },
            comments:
            {
              $size: "$ded"
            },
            email:
            {
              $arrayElemAt: ["$all.email", "$index"]
            },
            viewer:
            {
              $arrayElemAt: ["$all.viewer", "$index"]
            },
            viewerCount:
            {
              $size:
              {
                $arrayElemAt: ["$all.mailViewer", "$index"]
              },
              //
            },
            oldDate:
            {
              $arrayElemAt: ["$oldDate", 0]
            },
            selfContents:
            {
              $arrayElemAt: ["$selfContents", "$index"]
            },
            selfContent:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    }
                    ,
                    email
                  ]
                },
                then: 1,
                else: 0
              }
            },
            official:
            {
              $cond: {
                if: {
                  $eq: [
                    {
                      $arrayElemAt: ["$all.email", "$index"]
                    },
                    "hyppers@hyppe.id"
                  ]
                },
                then: 1,
                else: 0
              }
            },
            musik: "$musicNih",
            isLike: {
              $arrayElemAt: ["$liked.isLiked", 0]
            },
            comment:
            {
              $filter: {
                input: "$ded",
                as: "stud",
                cond: {
                  $eq: [
                    "$$stud.sequenceNumber",
                    0
                  ]
                }
              }
            },
            interest: {
              $filter: {
                input: "$category",
                as: "stud",
                cond: {
                  $in: [
                    "$$stud",
                    {
                      $ifNull: ["$userInterest.userInterests", []]
                    }
                  ]
                }
              }
            },
            friends: {
              $arrayElemAt: ["$friendster.friend", 0]
            },
            "following": {
              $arrayElemAt: ["$followings.following", 0]
            },
            "insight":
            {
              "likes":
              {
                $arrayElemAt: ["$all.likes", "$index"]
              },
              "views":
              {
                $arrayElemAt: ["$all.views", "$index"]
              },
              "shares":
              {
                $arrayElemAt: ["$all.shares", "$index"]
              },
              "comments":
              {
                $arrayElemAt: ["$all.comments", "$index"]
              },
              //
            },
            "userProfile":
            {
              $arrayElemAt: ["$all.userProfile", "$index"]
            },
            "contentMedias":
            {
              $arrayElemAt: ["$all.contentMedias", "$index"]
            },
            "cats":
            {
              $filter: {
                input: "$cats",
                as: "nonok",
                cond: {
                  $in: ["$$nonok._id", {
                    $ifNull: [
                      {
                        $arrayElemAt: ["$categories", "$index"]
                      },
                      []
                    ]
                  },]
                }
              }
            },
            "tagDescription":
            {
              $arrayElemAt: ["$all.tagDescription", "$index"]
            },
            "metadata":
            {
              $arrayElemAt: ["$all.metadata", "$index"]
            },
            "boostDate":
            {
              $arrayElemAt: ["$all.boostDate", "$index"]
            },
            "end":
            {
              $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
            },
            "start":
            {
              $arrayElemAt: ["$all.boosted.boostSession.start", "$index"]
            },
            "isBoost": {
              $ifNull: [
                {
                  $arrayElemAt: ["$all.isBoost", "$index"]
                },
                ,
                0
              ]
            },
            "boostViewer":
            {
              $arrayElemAt: ["$all.boostViewer", "$index"]
            },
            "boostCount":
            {
              $arrayElemAt: ["$all.boostCount", "$index"]
            },
            "boosted":
              [{
                $cond: {
                  if: {
                    $gt: [{
                      "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                          $add: [new Date(), 25200000]
                        }
                      }
                    }, {
                      $arrayElemAt: ["$all.boosted.boostSession.end", "$index"]
                    },]
                  },
                  then: "$ilang",
                  else:
                  {
                    $arrayElemAt: ["$all.boosted", "$index"]
                  }
                }
              }],
            "contentModeration":
            {
              $arrayElemAt: ["$all.contentModeration", "$index"]
            },
            "reportedStatus":
            {
              $arrayElemAt: ["$all.reportedStatus", "$index"]
            },
            "reportedUserCount":
            {
              $arrayElemAt: ["$all.reportedUserCount", "$index"]
            },
            "contentModerationResponse":
            {
              $arrayElemAt: ["$all.contentModerationResponse", "$index"]
            },
            "reportedUser":
            {
              $arrayElemAt: ["$all.reportedUser", "$index"]
            },
            "timeStart":
            {
              $arrayElemAt: ["$all.timeStart", "$index"]
            },
            "timeEnd":
            {
              $arrayElemAt: ["$all.timeEnd", "$index"]
            },
            "apsaraId": "$mediaPost.apsaraId",
            "isApsara": "$mediaPost.isApsara",
            "apsaraThumbId": "$mediaPost.apsaraThumbId",
            "mediaEndpoint": "$mediaPost.mediaEndpoint",
            "mediaUri": "$mediaPost.mediaUri",
            "mediaThumbEndpoint": "$mediaPost.mediaThumbEndpoint",
            "mediaThumbUri": "$mediaPost.mediaThumbUri",
            "fullName": "$user.fullName",
            "username": "$uName.username",
            "avatar": "$avatar",
            "privacy": {
              "isCelebrity": "$user.isCelebrity",
              "isIdVerified": "$user.isIdVerified",
              "isPrivate": "$user.isPrivate",
              "isFollowPrivate": "$user.isFollowPrivate",
              "isPostPrivate": "$user.isPostPrivate",
              //
            },
            "verified": "$user.fullName",
            mailViewer:
            {
              $arrayElemAt: ["$all.mailViewer", "$index"]
            },
            userInterested: "$userInterest.userInterests",
            tutor: "$tutorNew",
            urluserBadge:
            {
              "$ifNull":
                [
                  {
                    "$arrayElemAt":
                      [
                        "$user.urluserBadge",
                        0
                      ]
                  },
                  null
                ],

            }
          },
          //
        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },
                    //
                  ]
                }
              },
              //
            ]
          }
        },
        {
          $project: {
            mailViewer: 1,
            viewerCount: 1,
            viewer: 1,
            stiker: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            oldDate: 1,
            selfContents: 1,
            official: 1,
            selfContent: 1,
            music: "$musik",
            isLiked: {
              $ifNull: ["$isLike", false]
            },
            comment:
            {
              $cond: {
                if: {
                  $eq: ["$comment", [
                    null
                  ]]
                },
                then: [],
                else: "$comment"
              }
            },
            intScore:
            {
              $cond: {
                if: {
                  $isArray: "$interest"
                },
                then:
                {
                  $size: "$interest"
                },
                else: 0
              }
            },
            "verified": 1,
            "friend": 1,
            "following": 1,
            "musicTitle": 1,
            "postID": 1,
            "artistName": 1,
            "albumName": 1,
            "apsaraMusic": 1,
            "apsaraThumnail": 1,
            "genre": 1,
            "theme": 1,
            "mood": 1,
            "testDate": 1,
            "musicId": 1,
            "tagPeople": 1,
            "mediaType": 1,
            "email": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "comments": 1,
            "insight": 1,
            "userProfile": 1,
            "contentMedias": 1,
            "cats": "$cats",
            "tagDescription": 1,
            "metadata": 1,
            "boostDate": 1,
            "end": 1,
            "start": 1,
            "isBoost": 1,
            "boostViewer": 1,
            "boostCount": 1,
            "uploadSource": 1,
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    $size: "$boosted.boostSession"
                  }, 0]
                },
                else: [],
                then: '$boosted'
              }
            },
            "contentModeration": 1,
            "reportedStatus": 1,
            "reportedUserCount": 1,
            "contentModerationResponse": 1,
            "reportedUser": 1,
            "timeStart": 1,
            "timeEnd": 1,
            "isApsara": 1,
            "apsaraId": 1,
            "apsaraThumbId": 1,
            "mediaEndpoint": 1,
            "mediaUri": 1,
            "mediaThumbEndpoint": 1,
            "mediaThumbUri": 1,
            "fullName": 1,
            "username": 1,
            "avatar": 1,
            "statusCB": 1,
            "privacy": 1,
            "mediaThumUri": 1,
            category: 1,
            userInterested: 1,
            urluserBadge: 1
          },
          //
        },
      );
      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }

    console.log(JSON.stringify(pipeline));
    var query = await this.PostsReadModel.aggregate(pipeline);
    return query;
  }


  async landingpage7(email: string, type: string, skip: number, limit: number) {
    var pipeline = [];
    var dataseting = null;
    var sortObject = null;
    var value = 0;
    var idsetting = "64d06e5c451e0000bd006c62";
    var valuelimit = 0;

    try {
      dataseting = await this.settingsReadService.findOne(idsetting);
      valuelimit = dataseting._doc.value;
    } catch (e) {
      valuelimit = 0;
    }

    var x = (2 * valuelimit);

    if (skip >= x) {
      skip = skip + 1;
    }

    if (type == "pict") {
      try {
        dataseting = await this.settingsReadService.findOneByJenis("PictLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeStart", 0]
                }
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeEnd", 0]
                }
              ]
            }
          }
        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:57:28"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    $expr: {
                      $lte: [{ $arrayElemAt: ["$boosted.boostSession.start", 0] }, "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: [{ $arrayElemAt: ["$boosted.boostSession.end", 0] }, "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", {
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), - 30600000]
                          }
                        }
                      }]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $eq: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$email', '$$localID']
                  }
                }
              },

            ],
            //
          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInt",
            let: {
              localID: email,
              int: "$category",

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$email', '$$localID']
                      }
                    },

                  ]
                },

              },
              {
                $project: {
                  userInterests: "$userInterests.$id",

                }
              }
            ],
            //
          }
        },
        {
          $set: {
            categoryInt: { $ifNull: ["$category.$id", []] }
          }
        },
        {
          $set: {
            intScore:
            {
              $filter: {
                input: {
                  $arrayElemAt: ["$userInt.userInterests", 0]
                },
                as: "nonok",
                cond: {
                  $in: ["$$nonok", "$categoryInt"]
                }
              }
            },

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",
                  //
                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            //
          }
        },

        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID: { $ifNull: ['$tagPeople', []] }
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $expr: {
                        $in: ['$_id', "$$localID"]
                      }
                    },
                    {
                      $expr: {
                        $in: ['$_idAuth', "$$localID.$id"]
                      }
                    },

                  ]
                },

              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        //   {
        //     "$lookup": {
        //         from: "newUserBasics",
        //         as: "userTag",
        //         let: {
        //             localID: '$tagPeople'
        //         },
        //         pipeline: [
        //             {
        //                 $match: 
        //                 {
        //                     $or: [
        //                         {
        //                             $expr: {
        //                                 $eq: ['$_id', "$$localID"]
        //                             }
        //                         },
        //                         {
        //                             $expr: {
        //                                 $eq: ['$_idAuth', "$$localID.$id"]
        //                             }
        //                         },

        //                     ]
        //                 },

        //             },
        //             {
        //                 $project: {
        //                     "_id": 1,
        //                     "username": 1
        //                 }
        //             }
        //         ],

        //     }
        // },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $set: {
            tutor:
            {
              $ifNull: [
                {
                  $arrayElemAt: ["$userBasic.tutor", 0]
                },
                []
              ],
            },
          }
        },
        {
          $project: {
            _id: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            "postID": 1,
            musicTitle: {
              $arrayElemAt: ["$music.musicTitle", 0]
            },
            "artistName": {
              $arrayElemAt: ["$music.artistName", 0]
            },
            "albumName": {
              $arrayElemAt: ["$music.albumName", 0]
            },
            "apsaraMusic": {
              $arrayElemAt: ["$music.apsaraMusic", 0]
            },
            "apsaraThumnail": {
              $arrayElemAt: ["$music.apsaraThumnail", 0]
            },
            "genre": {
              $arrayElemAt: ["$music.genre", 0]
            },
            "theme": {
              $arrayElemAt: ["$music.theme", 0]
            },
            "mood": {
              $arrayElemAt: ["$music.mood", 0]
            },
            "tagPeople": "$userTag",
            "mediaType": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "userView": 1,
            "userLike": 1,
            "stiker": 1,
            "uploadSource": {
              $arrayElemAt: ["$uploadSource.uploadSource", 0]
            },
            comments: {
              $cond: {
                if: {
                  $eq: ["$comment", []]
                },
                then: 0,
                else: {
                  $size: "$comment"
                }
              }
            },
            email: 1,
            viewer: 1,
            viewerCount: 1,
            oldDate: "$oldDate",
            selfContent: 1,
            official:
            {
              $cond: {
                if: {
                  $eq: ["$email", "hyppers@hyppe.id"]
                },
                then: 1,
                else: 0
              }
            },
            "music": {
              $arrayElemAt: ["$music", 0]
            },
            isLike:
            {
              $cond: {
                if: {
                  $eq: ["$userLike", "hyppers@hyppe.id"]
                },
                then: true,
                else: false
              }
            },
            comment: "$comment",
            interest: "$categoryInt",
            friends: {
              $arrayElemAt: ["$friend.friend", 0]
            },
            "following":
            {
              $cond:
              {
                if: {
                  $eq: ["$userBasic.follower", []]
                },
                then: false,
                else:
                {
                  $cond:
                  {
                    if: {
                      $in: [email, { $arrayElemAt: ["$userBasic.follower", 0] }]
                    },
                    then: true,
                    else: false
                  }
                },

              }
            },
            "insight":
            {
              "likes": "$likes",
              "views":
              {
                "$ifNull":
                  [
                    {
                      "$size": "$userView"
                    },
                    0
                  ]
              },
              "shares": "$shares",
              "comments": "$comments",

            },
            "userProfile": "$userProfile",
            "contentMedias": "$contentMedias",
            "cats": "$categories",
            "tagDescription": "$tagDescription",
            "metadata": "$metadata",
            "boostDate": "$boostDate",
            "end": "$boosted.boostSession.end",
            "start": "$boosted.boostSession.start",
            "isBoost": "$isBoost",
            "boostViewer": "$boostViewer",
            "boostCount": "$boostCount",
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), 25200000]
                      }
                    }
                  }, "$boosted.boostSession.end"]
                },
                then: "$ilang",
                else: "$boosted",

              }
            },
            "contentModeration": "$contentModeration",
            "reportedStatus": "$reportedStatus",
            "reportedUserCount": "$reportedUserCount",
            "contentModerationResponse": "$contentModerationResponse",
            "reportedUser": "$reportedUser",
            "timeStart": "$timeStart",
            "timeEnd": "$timeEnd",
            "apsaraId": {
              $arrayElemAt: ["$mediaSource.apsaraId", 0]
            },
            "isApsara": {
              $arrayElemAt: ["$mediaSource.apsara", 0]
            },
            "apsaraThumbId": {
              $arrayElemAt: ["$mediaSource.apsaraThumbId", 0]
            },
            //               "mediaEndpoint": {
            //                   $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
            //               },
            mediaEndpoint:
            {
              "$ifNull":
                [
                  {
                    $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
                  },
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$postType",
                            "pict"
                          ]
                      },
                      then:
                      {
                        "$concat":
                          [
                            "/pict/",
                            "$postID"
                          ]
                      },
                      else:
                      {
                        "$concat":
                          [
                            "/stream/",
                            "$postID"
                          ]
                      }
                    }
                  }
                ]
            },
            "mediaUri": {
              $arrayElemAt: ["$mediaSource.mediaUri", 0]
            },
            //             "mediaThumbEndpoint": {
            //                 $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
            //             },
            mediaThumbEndpoint:
            {
              "$ifNull":
                [
                  {
                    $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
                  },
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$postType",
                            "pict"
                          ]
                      },
                      then:
                      {
                        "$concat":
                          [
                            "/pict/",
                            "$postID"
                          ]
                      },
                      else:
                      {
                        "$concat":
                          [
                            "/thumb/",
                            "$postID"
                          ]
                      }
                    }
                  }
                ]
            },
            "mediaThumbUri": {
              $arrayElemAt: ["$mediaSource.mediaThumbUri", 0]
            },
            "fullName": {
              $arrayElemAt: ["$userBasic.fullName", 0]
            },
            "username": {
              $arrayElemAt: ["$userBasic.username", 0]
            },
            "avatar":
            {
              "mediaBasePath": { $arrayElemAt: ["$userBasic.mediaBasePath", 0] },
              "mediaUri": { $arrayElemAt: ["$userBasic.mediaUri", 0] },
              "originalName": { $arrayElemAt: ["$userBasic.originalName", 0] },
              "fsSourceUri": { $arrayElemAt: ["$userBasic.fsSourceUri", 0] },
              "fsSourceName": { $arrayElemAt: ["$userBasic.fsSourceName", 0] },
              "fsTargetUri": { $arrayElemAt: ["$userBasic.fsTargetUri", 0] },
              "mediaType": { $arrayElemAt: ["$userBasic.mediaType", 0] },
              "mediaEndpoint": { $arrayElemAt: ["$userBasic.mediaEndpoint", 0] },
            },
            "privacy": {
              "isCelebrity": {
                $arrayElemAt: ["$userBasic.isCelebrity", 0]
              },
              "isIdVerified": {
                $arrayElemAt: ["$userBasic.isIdVerified", 0]
              },
              "isPrivate": {
                $arrayElemAt: ["$userBasic.isPrivate", 0]
              },
              "isFollowPrivate": {
                $arrayElemAt: ["$userBasic.isFollowPrivate", 0]
              },
              "isPostPrivate": {
                $arrayElemAt: ["$userBasic.isPostPrivate", 0]
              },

            },
            "verified": {
              $arrayElemAt: ["$userBasic.fullName", 0]
            },
            "urluserBadge":
            {
              "$ifNull":
                [
                  {
                    "$filter":
                    {
                      input: {
                        $arrayElemAt: ["$userBasic.userBadge", 0]
                      },
                      as: "listbadge",
                      cond:
                      {
                        "$and":
                          [
                            {
                              "$eq":
                                [
                                  "$$listbadge.isActive",
                                  true
                                ]
                            },
                            {
                              "$lte": [
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add": [
                                        new Date(),
                                        25200000
                                      ]
                                    }
                                  }
                                },
                                "$$listbadge.endDatetime"
                              ]
                            }
                          ]
                      }
                    }
                  },
                  null
                ]
            },
            mailViewer: "$mailViewer",
            userInterested: {
              $arrayElemAt: ["$userInt.userInterests", 0]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            intScore: {
              $size: "$intScore"
            },
            isLiked: {
              $ifNull: ["$isLike", false]
            },

          }
        },
      );
      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }
    else if (type == "vid") {

      try {
        dataseting = await this.settingsReadService.findOneByJenis("VidLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      // pipeline.push(
      //   {
      //     "$set": {
      //       "timeStart": {
      //         "$concat": [
      //           {
      //             "$dateToString": {
      //               "format": "%Y-%m-%d",
      //               "date": new Date()
      //             }
      //           },
      //           " ",
      //           {
      //             $arrayElemAt: ["$boosted.boostSession.timeStart", 0]
      //           }
      //         ]
      //       }
      //     }
      //   },
      //   {
      //     "$set": {
      //       "timeEnd": {
      //         "$concat": [
      //           {
      //             "$dateToString": {
      //               "format": "%Y-%m-%d",
      //               "date": new Date()
      //             }
      //           },
      //           " ",
      //           {
      //             $arrayElemAt: ["$boosted.boostSession.timeEnd", 0]
      //           }
      //         ]
      //       }
      //     }
      //   },
      //   {
      //     $set: {

      //       "testDate":
      //       {
      //         "$dateToString": {
      //           "format": "%Y-%m-%d %H:%M:%S",
      //           "date": {
      //             $add: [new Date(), 25200000]
      //           }
      //         }
      //       }
      //     }
      //   },
      //   {
      //     $match:
      //     {
      //       $or: [
      //         {
      //           $and: [
      //             {
      //               $expr: {
      //                 $gte: ["$createdAt", "2022-01-09 00:57:28"]
      //               }
      //             },
      //             {
      //               "reportedStatus": {
      //                 $ne: "OWNED"
      //               }
      //             },
      //             {
      //               "visibility": "PUBLIC"
      //             },
      //             {
      //               "active": true
      //             },
      //             {
      //               "postType": "vid"
      //             },
      //             {
      //               $expr: {
      //                 $lte: [{ $arrayElemAt: ["$boosted.boostSession.start", 0] }, "$testDate",]
      //               }
      //             },
      //             {
      //               $expr: {
      //                 $gt: [{ $arrayElemAt: ["$boosted.boostSession.end", 0] }, "$testDate",]
      //               }
      //             },
      //             {
      //               $expr: {
      //                 $lte: ["$timeStart", "$testDate",]
      //               }
      //             },
      //             {
      //               $expr: {
      //                 $gt: ["$timeEnd", "$testDate",]
      //               }
      //             },
      //             {
      //               "timeStart": {
      //                 $ne: null
      //               }
      //             },
      //             {
      //               "timeEnd": {
      //                 $ne: null
      //               }
      //             },
      //             {
      //               $or: [
      //                 {
      //                   "reportedUser": {
      //                     "$elemMatch": {
      //                       "email": email,
      //                       "active": false,

      //                     }
      //                   }
      //                 },
      //                 {
      //                   "reportedUser.email": {
      //                     $not: {
      //                       $regex: email
      //                     }
      //                   }
      //                 },

      //               ]
      //             },
      //             {
      //               $or: [
      //                 {
      //                   "boosted.boostViewer": {
      //                     "$elemMatch": {
      //                       "email": email,
      //                       "isLast": true,
      //                       "timeEnd": {
      //                         $lte: {
      //                           $add: [new Date(), 25200000]
      //                         }
      //                       }
      //                     }
      //                   }
      //                 },
      //                 {
      //                   $and: [
      //                     {
      //                       "boosted.boostViewer.email": {
      //                         $ne: email
      //                       }
      //                     },

      //                   ]
      //                 }
      //               ]
      //             }
      //           ]
      //         },
      //         {
      //           $and: [
      //             {
      //               "reportedStatus": {
      //                 $ne: "OWNED"
      //               }
      //             },
      //             {
      //               "visibility": "PUBLIC"
      //             },
      //             {
      //               "active": true
      //             },
      //             {
      //               "postType": "vid"
      //             },
      //             {
      //               "timeStart": null
      //             },
      //             {
      //               $or: [
      //                 {
      //                   "reportedUser": {
      //                     "$elemMatch": {
      //                       "email": email,
      //                       "active": false,

      //                     }
      //                   }
      //                 },
      //                 {
      //                   "reportedUser.email": {
      //                     $not: {
      //                       $regex: email,

      //                     }
      //                   }
      //                 },

      //               ]
      //             },

      //           ]
      //         },

      //       ]
      //     }
      //   },
      //   {
      //     $set: {
      //       selfContents:
      //       {
      //         $cond: {
      //           if: {
      //             $and: [
      //               {
      //                 $eq: ["$email", email]
      //               },
      //               {
      //                 $gt: ["$createdAt", {
      //                   "$dateToString": {
      //                     "format": "%Y-%m-%d %H:%M:%S",
      //                     "date": {
      //                       $add: [new Date(), - 30600000]
      //                     }
      //                   }
      //                 }]
      //               }
      //             ]
      //           },
      //           then: 1,
      //           else: 0
      //         }
      //       },

      //     }
      //   },
      //   {
      //     $set: {
      //       kancuts:
      //       {
      //         $concatArrays: [
      //           '$viewer',
      //           [email]
      //         ]
      //       },

      //     }
      //   },
      //   {
      //     $set: {
      //       mailViewer: {
      //         $filter: {
      //           input: "$kancuts",
      //           cond: {
      //             $eq: ["$$this", email]
      //           }
      //         }
      //       },

      //     }
      //   },
      //   {
      //     $set: {
      //       dodolCount: {
      //         $filter: {
      //           input: "$kancuts",
      //           cond: {
      //             $eq: ["$$this", email]
      //           }
      //         }
      //       },

      //     }
      //   },
      //   {
      //     $set: {
      //       viewerCounts:
      //       {
      //         $cond: {
      //           if: {
      //             $isArray: "$dodolCount"
      //           },
      //           then:
      //           {
      //             $size: "$dodolCount"
      //           },
      //           else: 1
      //         }
      //       },

      //     }
      //   },
      //   {
      //     $sort: {
      //       viewerCounts: 1,
      //       selfContents: - 1,
      //       isBoost: - 1,
      //       createdAt: - 1,

      //     }
      //   },
      //   {
      //     $skip: skip
      //   },
      //   {
      //     $limit: valuelimit
      //   },
      //   {
      //     "$lookup": {
      //       from: "disquslogs",
      //       let: {
      //         localID: '$postID',

      //       },
      //       as: "comment",
      //       pipeline: [
      //         {
      //           $match:
      //           {
      //             $and: [
      //               {
      //                 $expr: {
      //                   $eq: ['$postID', '$$localID']
      //                 }
      //               },
      //               {
      //                 "active": {
      //                   $ne: false
      //                 }
      //               },

      //             ]
      //           }
      //         },
      //         {
      //           "$lookup": {
      //             from: "newUserBasics",
      //             as: "userComment",
      //             let: {
      //               localID: '$sender'
      //             },
      //             pipeline: [
      //               {
      //                 $match:
      //                 {
      //                   $expr: {
      //                     $eq: ['$email', '$$localID']
      //                   }
      //                 }
      //               },
      //               {
      //                 $project: {
      //                   "username": 1
      //                 }
      //               }
      //             ],

      //           }
      //         },
      //         {
      //           $unwind: {
      //             path: "$userComment"
      //           }
      //         },
      //         {
      //           $sort: {
      //             createdAt: - 1
      //           }
      //         },

      //       ]
      //     },

      //   },
      //   {
      //     "$lookup": {
      //       from: "friend_list",
      //       as: "friend",
      //       let: {
      //         localID: '$email',
      //         user: email
      //       },
      //       pipeline: [
      //         {
      //           $match:
      //           {
      //             $or: [
      //               {
      //                 $and: [
      //                   {
      //                     $expr: {
      //                       $eq: ['$email', '$$localID']
      //                     }
      //                   },
      //                   {
      //                     "friendlist.email": email
      //                   }
      //                 ]
      //               },
      //               {
      //                 $and: [
      //                   {
      //                     "email": email
      //                   },
      //                   {
      //                     $expr: {
      //                       $eq: ['$friendlist.email', '$$localID']
      //                     }
      //                   },

      //                 ]
      //               }
      //             ]
      //           }
      //         },
      //         {
      //           $project: {
      //             email: 1,
      //             friend:
      //             {
      //               $cond: {
      //                 if: {
      //                   $gt: [{
      //                     $size: '$friendlist'
      //                   }, 0]
      //                 },
      //                 then: 1,
      //                 else: 0
      //               }
      //             },

      //           }
      //         },

      //       ]
      //     },

      //   },
      //   {
      //     "$lookup": {
      //       from: "newUserBasics",
      //       as: "userBasic",
      //       let: {
      //         localID: '$email'
      //       },
      //       pipeline: [
      //         {
      //           $match:
      //           {
      //             $expr: {
      //               $eq: ['$email', '$$localID']
      //             }
      //           }
      //         },

      //       ],
      //       //
      //     }
      //   },
      //   {
      //     "$lookup": {
      //       from: "newUserBasics",
      //       as: "userInt",
      //       let: {
      //         localID: email,
      //         int: "$category",

      //       },
      //       pipeline: [
      //         {
      //           $match:
      //           {
      //             $and: [
      //               {
      //                 $expr: {
      //                   $eq: ['$email', '$$localID']
      //                 }
      //               },

      //             ]
      //           },

      //         },
      //         {
      //           $project: {
      //             userInterests: "$userInterests.$id",

      //           }
      //         }
      //       ],
      //       //
      //     }
      //   },
      //   //     {
      //   //         $set: {
      //   //             categoryInt: {$ifNull:["$category.$id",[]]}
      //   //         }
      //   //     },
      //   {
      //     $set: {
      //       categoryInt: "$category.$id"
      //     }
      //   },
      //   {
      //     $set: {
      //       intScore:
      //       {
      //         $filter: {
      //           input: {
      //             $arrayElemAt: ["$userInt.userInterests", 0]
      //           },
      //           as: "nonok",
      //           cond: {
      //             $in: ["$$nonok", "$categoryInt"]
      //           }
      //         }
      //       },

      //     }
      //   },
      //   {
      //     "$lookup": {
      //       from: "mediamusic",
      //       as: "music",
      //       let: {
      //         localID: '$musicId'
      //       },
      //       pipeline: [
      //         {
      //           $match:
      //           {
      //             $expr: {
      //               $eq: ['$_id', '$$localID']
      //             }
      //           }
      //         },
      //         {
      //           $project: {
      //             "_id": 1,
      //             "musicTitle": 1,
      //             "artistName": 1,
      //             "albumName": 1,
      //             "apsaraMusic": 1,
      //             "apsaraThumnail": 1,
      //             "genre": "$genre.name",
      //             "theme": "$theme.name",
      //             "mood": "$mood.name",
      //             //
      //           }
      //         },
      //         {
      //           $unwind: {
      //             path: "$genre",
      //             preserveNullAndEmptyArrays: true
      //           }
      //         },
      //         {
      //           $unwind: {
      //             path: "$theme",
      //             preserveNullAndEmptyArrays: true
      //           }
      //         },
      //         {
      //           $unwind: {
      //             path: "$mood",
      //             preserveNullAndEmptyArrays: true
      //           }
      //         }
      //       ],
      //       //
      //     }
      //   },
      //   {
      //     "$lookup": {
      //       from: "newUserBasics",
      //       as: "userTag",
      //       let: {
      //         localID: { $ifNull: ['$tagPeople', []] }
      //       },
      //       pipeline: [
      //         {
      //           $match:
      //           {
      //             $or: [
      //               {
      //                 $expr: {
      //                   $in: ['$_id', "$$localID"]
      //                 }
      //               },
      //               {
      //                 $expr: {
      //                   $in: ['$_idAuth', "$$localID.$id"]
      //                 }
      //               },

      //             ]
      //           },

      //         },
      //         {
      //           $project: {
      //             "_id": 1,
      //             "username": 1
      //           }
      //         }
      //       ],

      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: "settings",
      //       as: "setting",
      //       pipeline: [
      //         {
      //           $match: {
      //             $or: [
      //               {
      //                 "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
      //               },
      //               {
      //                 "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
      //               },
      //               {
      //                 "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
      //               },
      //               {
      //                 "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
      //               },

      //             ]
      //           }
      //         },

      //       ]
      //     }
      //   },
      //   {
      //     $set: {
      //       tutor:
      //       {
      //         $ifNull: [
      //           {
      //             $arrayElemAt: ["$userBasic.tutor", 0]
      //           },
      //           []
      //         ],
      //       },
      //     }
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       version: {
      //         $arrayElemAt: ["$setting.value", 0]
      //       },
      //       versionIos: {
      //         $arrayElemAt: ["$setting.value", 1]
      //       },
      //       limitLandingpage: {
      //         $arrayElemAt: ["$setting.value", 2]
      //       },
      //       "postID": 1,
      //       musicTitle: {
      //         $arrayElemAt: ["$music.musicTitle", 0]
      //       },
      //       "artistName": {
      //         $arrayElemAt: ["$music.artistName", 0]
      //       },
      //       "albumName": {
      //         $arrayElemAt: ["$music.albumName", 0]
      //       },
      //       "apsaraMusic": {
      //         $arrayElemAt: ["$music.apsaraMusic", 0]
      //       },
      //       "apsaraThumnail": {
      //         $arrayElemAt: ["$music.apsaraThumnail", 0]
      //       },
      //       "genre": {
      //         $arrayElemAt: ["$music.genre", 0]
      //       },
      //       "theme": {
      //         $arrayElemAt: ["$music.theme", 0]
      //       },
      //       "mood": {
      //         $arrayElemAt: ["$music.mood", 0]
      //       },
      //       "tagPeople": "$userTag",
      //       "mediaType": 1,
      //       "postType": 1,
      //       "description": 1,
      //       "active": 1,
      //       "createdAt": 1,
      //       "updatedAt": 1,
      //       "expiration": 1,
      //       "visibility": 1,
      //       "location": 1,
      //       "tags": 1,
      //       "allowComments": 1,
      //       "isSafe": 1,
      //       "isOwned": 1,
      //       "certified": 1,
      //       "saleAmount": 1,
      //       "saleLike": 1,
      //       "saleView": 1,
      //       "isShared": 1,
      //       "likes": 1,
      //       "views": 1,
      //       "shares": 1,
      //       "userView": 1,
      //       "userLike": 1,
      //       "stiker": 1,
      //       "uploadSource": {
      //         $arrayElemAt: ["$uploadSource.uploadSource", 0]
      //       },
      //       comments: {
      //         $cond: {
      //           if: {
      //             $eq: ["$comment", []]
      //           },
      //           then: 0,
      //           else: {
      //             $size: "$comment"
      //           }
      //         }
      //       },
      //       email: 1,
      //       viewer: 1,
      //       viewerCount: 1,
      //       oldDate: "$oldDate",
      //       selfContent: 1,
      //       official:
      //       {
      //         $cond: {
      //           if: {
      //             $eq: ["$email", "hyppers@hyppe.id"]
      //           },
      //           then: 1,
      //           else: 0
      //         }
      //       },
      //       "music": {
      //         $arrayElemAt: ["$music", 0]
      //       },
      //       isLike:
      //       {
      //         $cond: {
      //           if: {
      //             $eq: ["$userLike", "hyppers@hyppe.id"]
      //           },
      //           then: true,
      //           else: false
      //         }
      //       },
      //       comment: "$comment",
      //       interest: "$categoryInt",
      //       friends: {
      //         $arrayElemAt: ["$friend.friend", 0]
      //       },
      //       "following":
      //       {
      //         $cond:
      //         {
      //           if: {
      //             $eq: ["$userBasic.follower", []]
      //           },
      //           then: false,
      //           else:
      //           {
      //             $cond:
      //             {
      //               if: {
      //                 $in: [email, { $arrayElemAt: ["$userBasic.follower", 0] }]
      //               },
      //               then: true,
      //               else: false
      //             }
      //           },

      //         }
      //       },
      //       "insight":
      //       {
      //         "likes": "$likes",
      //         "views":
      //         {
      //           "$ifNull":
      //             [
      //               {
      //                 "$size": "$userView"
      //               },
      //               0
      //             ]
      //         },
      //         "shares": "$shares",
      //         "comments": "$comments",

      //       },
      //       "userProfile": "$userProfile",
      //       "contentMedias": "$contentMedias",
      //       "cats": "$categories",
      //       "tagDescription": "$tagDescription",
      //       "metadata": "$metadata",
      //       "boostDate": "$boostDate",
      //       "end": "$boosted.boostSession.end",
      //       "start": "$boosted.boostSession.start",
      //       "isBoost": "$isBoost",
      //       "boostViewer": "$boostViewer",
      //       "boostCount": "$boostCount",
      //       "boosted":
      //       {
      //         $cond: {
      //           if: {
      //             $gt: [{
      //               "$dateToString": {
      //                 "format": "%Y-%m-%d %H:%M:%S",
      //                 "date": {
      //                   $add: [new Date(), 25200000]
      //                 }
      //               }
      //             }, "$boosted.boostSession.end"]
      //           },
      //           then: "$ilang",
      //           else: "$boosted",

      //         }
      //       },
      //       "contentModeration": "$contentModeration",
      //       "reportedStatus": "$reportedStatus",
      //       "reportedUserCount": "$reportedUserCount",
      //       "contentModerationResponse": "$contentModerationResponse",
      //       "reportedUser": "$reportedUser",
      //       "timeStart": "$timeStart",
      //       "timeEnd": "$timeEnd",
      //       "apsaraId": {
      //         $arrayElemAt: ["$mediaSource.apsaraId", 0]
      //       },
      //       "isApsara": {
      //         $arrayElemAt: ["$mediaSource.apsara", 0]
      //       },
      //       "apsaraThumbId": {
      //         $arrayElemAt: ["$mediaSource.apsaraThumbId", 0]
      //       },
      //       //               "mediaEndpoint": {
      //       //                   $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
      //       //               },
      //       mediaEndpoint:
      //       {
      //         "$ifNull":
      //           [
      //             {
      //               $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
      //             },
      //             {
      //               "$cond":
      //               {
      //                 if:
      //                 {
      //                   "$eq":
      //                     [
      //                       "$postType",
      //                       "pict"
      //                     ]
      //                 },
      //                 then:
      //                 {
      //                   "$concat":
      //                     [
      //                       "/pict/",
      //                       "$postID"
      //                     ]
      //                 },
      //                 else:
      //                 {
      //                   "$concat":
      //                     [
      //                       "/stream/",
      //                       "$postID"
      //                     ]
      //                 }
      //               }
      //             }
      //           ]
      //       },
      //       "mediaUri": {
      //         $arrayElemAt: ["$mediaSource.mediaUri", 0]
      //       },
      //       //             "mediaThumbEndpoint": {
      //       //                 $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
      //       //             },
      //       mediaThumbEndpoint:
      //       {
      //         "$ifNull":
      //           [
      //             {
      //               $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
      //             },
      //             {
      //               "$cond":
      //               {
      //                 if:
      //                 {
      //                   "$eq":
      //                     [
      //                       "$postType",
      //                       "pict"
      //                     ]
      //                 },
      //                 then:
      //                 {
      //                   "$concat":
      //                     [
      //                       "/pict/",
      //                       "$postID"
      //                     ]
      //                 },
      //                 else:
      //                 {
      //                   "$concat":
      //                     [
      //                       "/thumb/",
      //                       "$postID"
      //                     ]
      //                 }
      //               }
      //             }
      //           ]
      //       },
      //       "mediaThumbUri": {
      //         $arrayElemAt: ["$mediaSource.mediaThumbUri", 0]
      //       },
      //       "fullName": {
      //         $arrayElemAt: ["$userBasic.fullName", 0]
      //       },
      //       "username": {
      //         $arrayElemAt: ["$userBasic.username", 0]
      //       },
      //       "avatar":
      //       {
      //         "mediaBasePath": { $arrayElemAt: ["$userBasic.mediaBasePath", 0] },
      //         "mediaUri": { $arrayElemAt: ["$userBasic.mediaUri", 0] },
      //         "originalName": { $arrayElemAt: ["$userBasic.originalName", 0] },
      //         "fsSourceUri": { $arrayElemAt: ["$userBasic.fsSourceUri", 0] },
      //         "fsSourceName": { $arrayElemAt: ["$userBasic.fsSourceName", 0] },
      //         "fsTargetUri": { $arrayElemAt: ["$userBasic.fsTargetUri", 0] },
      //         "mediaType": { $arrayElemAt: ["$userBasic.mediaType", 0] },
      //         "mediaEndpoint": { $arrayElemAt: ["$userBasic.mediaEndpoint", 0] },
      //       },
      //       "privacy": {
      //         "isCelebrity": {
      //           $arrayElemAt: ["$userBasic.isCelebrity", 0]
      //         },
      //         "isIdVerified": {
      //           $arrayElemAt: ["$userBasic.isIdVerified", 0]
      //         },
      //         "isPrivate": {
      //           $arrayElemAt: ["$userBasic.isPrivate", 0]
      //         },
      //         "isFollowPrivate": {
      //           $arrayElemAt: ["$userBasic.isFollowPrivate", 0]
      //         },
      //         "isPostPrivate": {
      //           $arrayElemAt: ["$userBasic.isPostPrivate", 0]
      //         },

      //       },
      //       "verified": {
      //         $arrayElemAt: ["$userBasic.fullName", 0]
      //       },
      //       "urluserBadge":
      //       {
      //         "$ifNull":
      //           [
      //             {
      //               "$filter":
      //               {
      //                 input: {
      //                   $arrayElemAt: ["$userBasic.userBadge", 0]
      //                 },
      //                 as: "listbadge",
      //                 cond:
      //                 {
      //                   "$and":
      //                     [
      //                       {
      //                         "$eq":
      //                           [
      //                             "$$listbadge.isActive",
      //                             true
      //                           ]
      //                       },
      //                       {
      //                         "$lte": [
      //                           {
      //                             "$dateToString": {
      //                               "format": "%Y-%m-%d %H:%M:%S",
      //                               "date": {
      //                                 "$add": [
      //                                   new Date(),
      //                                   25200000
      //                                 ]
      //                               }
      //                             }
      //                           },
      //                           "$$listbadge.endDatetime"
      //                         ]
      //                       }
      //                     ]
      //                 }
      //               }
      //             },
      //             null
      //           ]
      //       },
      //       mailViewer: "$mailViewer",
      //       userInterested: {
      //         $arrayElemAt: ["$userInt.userInterests", 0]
      //       },
      //       tutorial: {
      //         $map: {
      //           input: {
      //             $range: [
      //               0,
      //               {
      //                 $size: "$tutor"
      //               }
      //             ]
      //           },
      //           as: "idx",
      //           in: {
      //             $mergeObjects: [
      //               {
      //                 $arrayElemAt: [
      //                   "$tutor",
      //                   "$$idx"
      //                 ]
      //               },
      //               {
      //                 $arrayElemAt: [
      //                   {
      //                     $arrayElemAt: ["$setting.value", 3]
      //                   },
      //                   "$$idx"
      //                 ]
      //               }
      //             ]
      //           }
      //         }
      //       },
      //       intScore: {
      //         $size: "$intScore"
      //       },
      //       isLiked: {
      //         $ifNull: ["$isLike", false]
      //       },

      //     }
      //   },
      // );
      pipeline.push(
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeStart", 0]
                }
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeEnd", 0]
                }
              ]
            }
          }
        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:57:28"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": {
                      $in: ["vid", "diary"]
                    }
                  },
                  {
                    $expr: {
                      $lte: [{ $arrayElemAt: ["$boosted.boostSession.start", 0] }, "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: [{ $arrayElemAt: ["$boosted.boostSession.end", 0] }, "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": {
                      $in: ["vid", "diary"]
                    }
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", {
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), - 30600000]
                          }
                        }
                      }]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $eq: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$email', '$$localID']
                  }
                }
              },

            ],
            //
          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInt",
            let: {
              localID: email,
              int: "$category",

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$email', '$$localID']
                      }
                    },

                  ]
                },

              },
              {
                $project: {
                  userInterests: "$userInterests.$id",

                }
              }
            ],
            //
          }
        },
        //     {
        //         $set: {
        //             categoryInt: {$ifNull:["$category.$id",[]]}
        //         }
        //     },
        {
          $set: {
            categoryInt: "$category.$id"
          }
        },
        {
          $set: {
            intScore:
            {
              $filter: {
                input: {
                  $arrayElemAt: ["$userInt.userInterests", 0]
                },
                as: "nonok",
                cond: {
                  $in: ["$$nonok", "$categoryInt"]
                }
              }
            },

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",
                  //
                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID: { $ifNull: ['$tagPeople', []] }
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $expr: {
                        $in: ['$_id', "$$localID"]
                      }
                    },
                    {
                      $expr: {
                        $in: ['$_idAuth', "$$localID.$id"]
                      }
                    },

                  ]
                },

              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $set: {
            tutor:
            {
              $ifNull: [
                {
                  $arrayElemAt: ["$userBasic.tutor", 0]
                },
                []
              ],
            },
          }
        },
        {
          $project: {
            _id: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            "postID": 1,
            musicTitle: {
              $arrayElemAt: ["$music.musicTitle", 0]
            },
            "artistName": {
              $arrayElemAt: ["$music.artistName", 0]
            },
            "albumName": {
              $arrayElemAt: ["$music.albumName", 0]
            },
            "apsaraMusic": {
              $arrayElemAt: ["$music.apsaraMusic", 0]
            },
            "apsaraThumnail": {
              $arrayElemAt: ["$music.apsaraThumnail", 0]
            },
            "genre": {
              $arrayElemAt: ["$music.genre", 0]
            },
            "theme": {
              $arrayElemAt: ["$music.theme", 0]
            },
            "mood": {
              $arrayElemAt: ["$music.mood", 0]
            },
            "tagPeople": "$userTag",
            "mediaType": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "userView": 1,
            "userLike": 1,
            "stiker": 1,
            "uploadSource": {
              $arrayElemAt: ["$uploadSource.uploadSource", 0]
            },
            comments: {
              $cond: {
                if: {
                  $eq: ["$comment", []]
                },
                then: 0,
                else: {
                  $size: "$comment"
                }
              }
            },
            email: 1,
            viewer: 1,
            viewerCount: 1,
            oldDate: "$oldDate",
            selfContent: 1,
            official:
            {
              $cond: {
                if: {
                  $eq: ["$email", "hyppers@hyppe.id"]
                },
                then: 1,
                else: 0
              }
            },
            "music": {
              $arrayElemAt: ["$music", 0]
            },
            isLike:
            {
              $cond: {
                if: {
                  $eq: ["$userLike", "hyppers@hyppe.id"]
                },
                then: true,
                else: false
              }
            },
            comment: "$comment",
            interest: "$categoryInt",
            friends: {
              $arrayElemAt: ["$friend.friend", 0]
            },
            "following":
            {
              $cond:
              {
                if: {
                  $eq: ["$userBasic.follower", []]
                },
                then: false,
                else:
                {
                  $cond:
                  {
                    if: {
                      $in: [email, { $arrayElemAt: ["$userBasic.follower", 0] }]
                    },
                    then: true,
                    else: false
                  }
                },

              }
            },
            "insight":
            {
              "likes": "$likes",
              "views":
              {
                "$ifNull":
                  [
                    {
                      "$size": "$userView"
                    },
                    0
                  ]
              },
              "shares": "$shares",
              "comments": "$comments",

            },
            "userProfile": "$userProfile",
            "contentMedias": "$contentMedias",
            "cats": "$categories",
            "tagDescription": "$tagDescription",
            "metadata": "$metadata",
            "boostDate": "$boostDate",
            "end": "$boosted.boostSession.end",
            "start": "$boosted.boostSession.start",
            "isBoost": "$isBoost",
            "boostViewer": "$boostViewer",
            "boostCount": "$boostCount",
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), 25200000]
                      }
                    }
                  }, "$boosted.boostSession.end"]
                },
                then: "$ilang",
                else: "$boosted",

              }
            },
            "contentModeration": "$contentModeration",
            "reportedStatus": "$reportedStatus",
            "reportedUserCount": "$reportedUserCount",
            "contentModerationResponse": "$contentModerationResponse",
            "reportedUser": "$reportedUser",
            "timeStart": "$timeStart",
            "timeEnd": "$timeEnd",
            "apsaraId": {
              $arrayElemAt: ["$mediaSource.apsaraId", 0]
            },
            "isApsara": {
              $arrayElemAt: ["$mediaSource.apsara", 0]
            },
            "apsaraThumbId": {
              $arrayElemAt: ["$mediaSource.apsaraThumbId", 0]
            },
            //               "mediaEndpoint": {
            //                   $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
            //               },
            mediaEndpoint:
            {
              "$ifNull":
                [
                  {
                    $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
                  },
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$postType",
                            "pict"
                          ]
                      },
                      then:
                      {
                        "$concat":
                          [
                            "/pict/",
                            "$postID"
                          ]
                      },
                      else:
                      {
                        "$concat":
                          [
                            "/stream/",
                            "$postID"
                          ]
                      }
                    }
                  }
                ]
            },
            "mediaUri": {
              $arrayElemAt: ["$mediaSource.mediaUri", 0]
            },
            //             "mediaThumbEndpoint": {
            //                 $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
            //             },
            mediaThumbEndpoint:
            {
              "$ifNull":
                [
                  {
                    $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
                  },
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$postType",
                            "pict"
                          ]
                      },
                      then:
                      {
                        "$concat":
                          [
                            "/pict/",
                            "$postID"
                          ]
                      },
                      else:
                      {
                        "$concat":
                          [
                            "/thumb/",
                            "$postID"
                          ]
                      }
                    }
                  }
                ]
            },
            "mediaThumbUri": {
              $arrayElemAt: ["$mediaSource.mediaThumbUri", 0]
            },
            "fullName": {
              $arrayElemAt: ["$userBasic.fullName", 0]
            },
            "username": {
              $arrayElemAt: ["$userBasic.username", 0]
            },
            "avatar":
            {
              "mediaBasePath": { $arrayElemAt: ["$userBasic.mediaBasePath", 0] },
              "mediaUri": { $arrayElemAt: ["$userBasic.mediaUri", 0] },
              "originalName": { $arrayElemAt: ["$userBasic.originalName", 0] },
              "fsSourceUri": { $arrayElemAt: ["$userBasic.fsSourceUri", 0] },
              "fsSourceName": { $arrayElemAt: ["$userBasic.fsSourceName", 0] },
              "fsTargetUri": { $arrayElemAt: ["$userBasic.fsTargetUri", 0] },
              "mediaType": { $arrayElemAt: ["$userBasic.mediaType", 0] },
              "mediaEndpoint": { $arrayElemAt: ["$userBasic.mediaEndpoint", 0] },
            },
            "privacy": {
              "isCelebrity": {
                $arrayElemAt: ["$userBasic.isCelebrity", 0]
              },
              "isIdVerified": {
                $arrayElemAt: ["$userBasic.isIdVerified", 0]
              },
              "isPrivate": {
                $arrayElemAt: ["$userBasic.isPrivate", 0]
              },
              "isFollowPrivate": {
                $arrayElemAt: ["$userBasic.isFollowPrivate", 0]
              },
              "isPostPrivate": {
                $arrayElemAt: ["$userBasic.isPostPrivate", 0]
              },

            },
            "verified": {
              $arrayElemAt: ["$userBasic.fullName", 0]
            },
            "urluserBadge":
            {
              "$ifNull":
                [
                  {
                    "$filter":
                    {
                      input: {
                        $arrayElemAt: ["$userBasic.userBadge", 0]
                      },
                      as: "listbadge",
                      cond:
                      {
                        "$and":
                          [
                            {
                              "$eq":
                                [
                                  "$$listbadge.isActive",
                                  true
                                ]
                            },
                            {
                              "$lte": [
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add": [
                                        new Date(),
                                        25200000
                                      ]
                                    }
                                  }
                                },
                                "$$listbadge.endDatetime"
                              ]
                            }
                          ]
                      }
                    }
                  },
                  null
                ]
            },
            mailViewer: "$mailViewer",
            userInterested: {
              $arrayElemAt: ["$userInt.userInterests", 0]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            intScore: {
              $size: "$intScore"
            },
            isLiked: {
              $ifNull: ["$isLike", false]
            },

          }
        },
      );
      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }
    else if (type == "diary") {
      try {
        dataseting = await this.settingsReadService.findOneByJenis("DiaryLandingPage");
        sortObject = dataseting.sortObject;
        value = dataseting.value;
      } catch (e) {
        dataseting = null;
        sortObject = {};
        value = 0;
      }

      pipeline.push(
        {
          "$set": {
            "timeStart": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeStart", 0]
                }
              ]
            }
          }
        },
        {
          "$set": {
            "timeEnd": {
              "$concat": [
                {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": new Date()
                  }
                },
                " ",
                {
                  $arrayElemAt: ["$boosted.boostSession.timeEnd", 0]
                }
              ]
            }
          }
        },
        {
          $set: {

            "testDate":
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), 25200000]
                }
              }
            }
          }
        },
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gte: ["$createdAt", "2022-01-09 00:57:28"]
                    }
                  },
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    $expr: {
                      $lte: [{ $arrayElemAt: ["$boosted.boostSession.start", 0] }, "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: [{ $arrayElemAt: ["$boosted.boostSession.end", 0] }, "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $lte: ["$timeStart", "$testDate",]
                    }
                  },
                  {
                    $expr: {
                      $gt: ["$timeEnd", "$testDate",]
                    }
                  },
                  {
                    "timeStart": {
                      $ne: null
                    }
                  },
                  {
                    "timeEnd": {
                      $ne: null
                    }
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email
                          }
                        }
                      },

                    ]
                  },
                  {
                    $or: [
                      {
                        "boosted.boostViewer": {
                          "$elemMatch": {
                            "email": email,
                            "isLast": true,
                            "timeEnd": {
                              $lte: {
                                $add: [new Date(), 25200000]
                              }
                            }
                          }
                        }
                      },
                      {
                        $and: [
                          {
                            "boosted.boostViewer.email": {
                              $ne: email
                            }
                          },

                        ]
                      }
                    ]
                  }
                ]
              },
              {
                $and: [
                  {
                    "reportedStatus": {
                      $ne: "OWNED"
                    }
                  },
                  {
                    "visibility": "PUBLIC"
                  },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    "timeStart": null
                  },
                  {
                    $or: [
                      {
                        "reportedUser": {
                          "$elemMatch": {
                            "email": email,
                            "active": false,

                          }
                        }
                      },
                      {
                        "reportedUser.email": {
                          $not: {
                            $regex: email,

                          }
                        }
                      },

                    ]
                  },

                ]
              },

            ]
          }
        },
        {
          $set: {
            selfContents:
            {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: ["$email", email]
                    },
                    {
                      $gt: ["$createdAt", {
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), - 30600000]
                          }
                        }
                      }]
                    }
                  ]
                },
                then: 1,
                else: 0
              }
            },

          }
        },
        {
          $set: {
            kancuts:
            {
              $concatArrays: [
                '$viewer',
                [email]
              ]
            },

          }
        },
        {
          $set: {
            mailViewer: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            dodolCount: {
              $filter: {
                input: "$kancuts",
                cond: {
                  $eq: ["$$this", email]
                }
              }
            },

          }
        },
        {
          $set: {
            viewerCounts:
            {
              $cond: {
                if: {
                  $isArray: "$dodolCount"
                },
                then:
                {
                  $size: "$dodolCount"
                },
                else: 1
              }
            },

          }
        },
        {
          $sort: {
            viewerCounts: 1,
            selfContents: - 1,
            isBoost: - 1,
            createdAt: - 1,

          }
        },
        {
          $skip: skip
        },
        {
          $limit: valuelimit
        },
        {
          "$lookup": {
            from: "disquslogs",
            let: {
              localID: '$postID',

            },
            as: "comment",
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$postID', '$$localID']
                      }
                    },
                    {
                      "active": {
                        $ne: false
                      }
                    },

                  ]
                }
              },
              {
                "$lookup": {
                  from: "newUserBasics",
                  as: "userComment",
                  let: {
                    localID: '$sender'
                  },
                  pipeline: [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$email', '$$localID']
                        }
                      }
                    },
                    {
                      $project: {
                        "username": 1
                      }
                    }
                  ],

                }
              },
              {
                $unwind: {
                  path: "$userComment"
                }
              },
              {
                $sort: {
                  createdAt: - 1
                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: '$email',
              user: email
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$email', '$$localID']
                          }
                        },
                        {
                          "friendlist.email": email
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          "email": email
                        },
                        {
                          $expr: {
                            $eq: ['$friendlist.email', '$$localID']
                          }
                        },

                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  email: 1,
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 1,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userBasic",
            let: {
              localID: '$email'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$email', '$$localID']
                  }
                }
              },

            ],
            //
          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userInt",
            let: {
              localID: email,
              int: "$category",

            },
            pipeline: [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {
                        $eq: ['$email', '$$localID']
                      }
                    },

                  ]
                },

              },
              {
                $project: {
                  userInterests: "$userInterests.$id",

                }
              }
            ],
            //
          }
        },
        //     {
        //         $set: {
        //             categoryInt: {$ifNull:["$category.$id",[]]}
        //         }
        //     },
        {
          $set: {
            categoryInt: "$category.$id"
          }
        },
        {
          $set: {
            intScore:
            {
              $filter: {
                input: {
                  $arrayElemAt: ["$userInt.userInterests", 0]
                },
                as: "nonok",
                cond: {
                  $in: ["$$nonok", "$categoryInt"]
                }
              }
            },

          }
        },
        {
          "$lookup": {
            from: "mediamusic",
            as: "music",
            let: {
              localID: '$musicId'
            },
            pipeline: [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$_id', '$$localID']
                  }
                }
              },
              {
                $project: {
                  "_id": 1,
                  "musicTitle": 1,
                  "artistName": 1,
                  "albumName": 1,
                  "apsaraMusic": 1,
                  "apsaraThumnail": 1,
                  "genre": "$genre.name",
                  "theme": "$theme.name",
                  "mood": "$mood.name",
                  //
                }
              },
              {
                $unwind: {
                  path: "$genre",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$theme",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$mood",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            //
          }
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "userTag",
            let: {
              localID: { $ifNull: ['$tagPeople', []] }
            },
            pipeline: [
              {
                $match:
                {
                  $or: [
                    {
                      $expr: {
                        $in: ['$_id', "$$localID"]
                      }
                    },
                    {
                      $expr: {
                        $in: ['$_idAuth', "$$localID.$id"]
                      }
                    },

                  ]
                },

              },
              {
                $project: {
                  "_id": 1,
                  "username": 1
                }
              }
            ],

          }
        },
        {
          $lookup: {
            from: "settings",
            as: "setting",
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      "_id": new mongoose.Types.ObjectId("62bbdb4ba7520000050077a7")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64d06e5c451e0000bd006c62")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("645da79c295b0000520048c2")
                    },
                    {
                      "_id": new mongoose.Types.ObjectId("64e5a637227b0000d00057b8")
                    },

                  ]
                }
              },

            ]
          }
        },
        {
          $set: {
            tutor:
            {
              $ifNull: [
                {
                  $arrayElemAt: ["$userBasic.tutor", 0]
                },
                []
              ],
            },
          }
        },
        {
          $project: {
            _id: 1,
            version: {
              $arrayElemAt: ["$setting.value", 0]
            },
            versionIos: {
              $arrayElemAt: ["$setting.value", 1]
            },
            limitLandingpage: {
              $arrayElemAt: ["$setting.value", 2]
            },
            "postID": 1,
            musicTitle: {
              $arrayElemAt: ["$music.musicTitle", 0]
            },
            "artistName": {
              $arrayElemAt: ["$music.artistName", 0]
            },
            "albumName": {
              $arrayElemAt: ["$music.albumName", 0]
            },
            "apsaraMusic": {
              $arrayElemAt: ["$music.apsaraMusic", 0]
            },
            "apsaraThumnail": {
              $arrayElemAt: ["$music.apsaraThumnail", 0]
            },
            "genre": {
              $arrayElemAt: ["$music.genre", 0]
            },
            "theme": {
              $arrayElemAt: ["$music.theme", 0]
            },
            "mood": {
              $arrayElemAt: ["$music.mood", 0]
            },
            "tagPeople": "$userTag",
            "mediaType": 1,
            "postType": 1,
            "description": 1,
            "active": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "expiration": 1,
            "visibility": 1,
            "location": 1,
            "tags": 1,
            "allowComments": 1,
            "isSafe": 1,
            "isOwned": 1,
            "certified": 1,
            "saleAmount": 1,
            "saleLike": 1,
            "saleView": 1,
            "isShared": 1,
            "likes": 1,
            "views": 1,
            "shares": 1,
            "userView": 1,
            "userLike": 1,
            "stiker": 1,
            "uploadSource": {
              $arrayElemAt: ["$uploadSource.uploadSource", 0]
            },
            comments: {
              $cond: {
                if: {
                  $eq: ["$comment", []]
                },
                then: 0,
                else: {
                  $size: "$comment"
                }
              }
            },
            email: 1,
            viewer: 1,
            viewerCount: 1,
            oldDate: "$oldDate",
            selfContent: 1,
            official:
            {
              $cond: {
                if: {
                  $eq: ["$email", "hyppers@hyppe.id"]
                },
                then: 1,
                else: 0
              }
            },
            "music": {
              $arrayElemAt: ["$music", 0]
            },
            isLike:
            {
              $cond: {
                if: {
                  $eq: ["$userLike", "hyppers@hyppe.id"]
                },
                then: true,
                else: false
              }
            },
            comment: "$comment",
            interest: "$categoryInt",
            friends: {
              $arrayElemAt: ["$friend.friend", 0]
            },
            "following":
            {
              $cond:
              {
                if: {
                  $eq: ["$userBasic.follower", []]
                },
                then: false,
                else:
                {
                  $cond:
                  {
                    if: {
                      $in: [email, { $arrayElemAt: ["$userBasic.follower", 0] }]
                    },
                    then: true,
                    else: false
                  }
                },

              }
            },
            "insight":
            {
              "likes": "$likes",
              "views":
              {
                "$ifNull":
                  [
                    {
                      "$size": "$userView"
                    },
                    0
                  ]
              },
              "shares": "$shares",
              "comments": "$comments",

            },
            "userProfile": "$userProfile",
            "contentMedias": "$contentMedias",
            "cats": "$categories",
            "tagDescription": "$tagDescription",
            "metadata": "$metadata",
            "boostDate": "$boostDate",
            "end": "$boosted.boostSession.end",
            "start": "$boosted.boostSession.start",
            "isBoost": "$isBoost",
            "boostViewer": "$boostViewer",
            "boostCount": "$boostCount",
            "boosted":
            {
              $cond: {
                if: {
                  $gt: [{
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), 25200000]
                      }
                    }
                  }, "$boosted.boostSession.end"]
                },
                then: "$ilang",
                else: "$boosted",

              }
            },
            "contentModeration": "$contentModeration",
            "reportedStatus": "$reportedStatus",
            "reportedUserCount": "$reportedUserCount",
            "contentModerationResponse": "$contentModerationResponse",
            "reportedUser": "$reportedUser",
            "timeStart": "$timeStart",
            "timeEnd": "$timeEnd",
            "apsaraId": {
              $arrayElemAt: ["$mediaSource.apsaraId", 0]
            },
            "isApsara": {
              $arrayElemAt: ["$mediaSource.apsara", 0]
            },
            "apsaraThumbId": {
              $arrayElemAt: ["$mediaSource.apsaraThumbId", 0]
            },
            //               "mediaEndpoint": {
            //                   $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
            //               },
            mediaEndpoint:
            {
              "$ifNull":
                [
                  {
                    $arrayElemAt: ["$mediaSource.mediaEndpoint", 0]
                  },
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$postType",
                            "pict"
                          ]
                      },
                      then:
                      {
                        "$concat":
                          [
                            "/pict/",
                            "$postID"
                          ]
                      },
                      else:
                      {
                        "$concat":
                          [
                            "/stream/",
                            "$postID"
                          ]
                      }
                    }
                  }
                ]
            },
            "mediaUri": {
              $arrayElemAt: ["$mediaSource.mediaUri", 0]
            },
            //             "mediaThumbEndpoint": {
            //                 $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
            //             },
            mediaThumbEndpoint:
            {
              "$ifNull":
                [
                  {
                    $arrayElemAt: ["$mediaSource.mediaThumbEndpoint", 0]
                  },
                  {
                    "$cond":
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$postType",
                            "pict"
                          ]
                      },
                      then:
                      {
                        "$concat":
                          [
                            "/pict/",
                            "$postID"
                          ]
                      },
                      else:
                      {
                        "$concat":
                          [
                            "/thumb/",
                            "$postID"
                          ]
                      }
                    }
                  }
                ]
            },
            "mediaThumbUri": {
              $arrayElemAt: ["$mediaSource.mediaThumbUri", 0]
            },
            "fullName": {
              $arrayElemAt: ["$userBasic.fullName", 0]
            },
            "username": {
              $arrayElemAt: ["$userBasic.username", 0]
            },
            "avatar":
            {
              "mediaBasePath": { $arrayElemAt: ["$userBasic.mediaBasePath", 0] },
              "mediaUri": { $arrayElemAt: ["$userBasic.mediaUri", 0] },
              "originalName": { $arrayElemAt: ["$userBasic.originalName", 0] },
              "fsSourceUri": { $arrayElemAt: ["$userBasic.fsSourceUri", 0] },
              "fsSourceName": { $arrayElemAt: ["$userBasic.fsSourceName", 0] },
              "fsTargetUri": { $arrayElemAt: ["$userBasic.fsTargetUri", 0] },
              "mediaType": { $arrayElemAt: ["$userBasic.mediaType", 0] },
              "mediaEndpoint": { $arrayElemAt: ["$userBasic.mediaEndpoint", 0] },
            },
            "privacy": {
              "isCelebrity": {
                $arrayElemAt: ["$userBasic.isCelebrity", 0]
              },
              "isIdVerified": {
                $arrayElemAt: ["$userBasic.isIdVerified", 0]
              },
              "isPrivate": {
                $arrayElemAt: ["$userBasic.isPrivate", 0]
              },
              "isFollowPrivate": {
                $arrayElemAt: ["$userBasic.isFollowPrivate", 0]
              },
              "isPostPrivate": {
                $arrayElemAt: ["$userBasic.isPostPrivate", 0]
              },

            },
            "verified": {
              $arrayElemAt: ["$userBasic.fullName", 0]
            },
            "urluserBadge":
            {
              "$ifNull":
                [
                  {
                    "$filter":
                    {
                      input: {
                        $arrayElemAt: ["$userBasic.userBadge", 0]
                      },
                      as: "listbadge",
                      cond:
                      {
                        "$and":
                          [
                            {
                              "$eq":
                                [
                                  "$$listbadge.isActive",
                                  true
                                ]
                            },
                            {
                              "$lte": [
                                {
                                  "$dateToString": {
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "date": {
                                      "$add": [
                                        new Date(),
                                        25200000
                                      ]
                                    }
                                  }
                                },
                                "$$listbadge.endDatetime"
                              ]
                            }
                          ]
                      }
                    }
                  },
                  null
                ]
            },
            mailViewer: "$mailViewer",
            userInterested: {
              $arrayElemAt: ["$userInt.userInterests", 0]
            },
            tutorial: {
              $map: {
                input: {
                  $range: [
                    0,
                    {
                      $size: "$tutor"
                    }
                  ]
                },
                as: "idx",
                in: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$tutor",
                        "$$idx"
                      ]
                    },
                    {
                      $arrayElemAt: [
                        {
                          $arrayElemAt: ["$setting.value", 3]
                        },
                        "$$idx"
                      ]
                    }
                  ]
                }
              }
            },
            intScore: {
              $size: "$intScore"
            },
            isLiked: {
              $ifNull: ["$isLike", false]
            },

          }
        },
      );
      pipeline.push(
        {
          $sort: sortObject
        },
      );
    }

    // console.log(JSON.stringify(pipeline));
    var query = await this.PostsReadModel.aggregate(pipeline);
    return query;
  }
}
