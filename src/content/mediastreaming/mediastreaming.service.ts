import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Mediastreaming, MediastreamingDocument } from './schema/mediastreaming.schema';
import { MediastreamingDto, RequestConsoleStream, RequestSoctDto } from './dto/mediastreaming.dto';
import { UtilsService } from 'src/utils/utils.service';
import { HttpService } from '@nestjs/axios';
import { TransactionsV2Service } from 'src/trans/transactionsv2/transactionsv2.service';
import { MonetizationService } from './monetization/monetization.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { Status } from '../../paymentgateway/oypg/dto/OyDTO';
import { pipeline } from 'stream';
@Injectable()
export class MediastreamingService {
  private readonly logger = new Logger(MediastreamingService.name);
  
  constructor(
    @InjectModel(Mediastreaming.name, 'SERVER_FULL')
    private readonly MediastreamingModel: Model<MediastreamingDocument>,
    private readonly utilsService: UtilsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly monetizationService: MonetizationService,
    private readonly transactionsV2Service: TransactionsV2Service,
    private readonly userbasicnewService: UserbasicnewService,
  ) {}

  async createStreaming(MediastreamingDto_: MediastreamingDto): Promise<Mediastreaming> {
    const DataSave = await this.MediastreamingModel.create(MediastreamingDto_);
    return DataSave;
  }

  async findById(id: string): Promise<Mediastreaming> {
    return this.MediastreamingModel.findOne({ _id: new mongoose.Types.ObjectId(id) }).exec();
  }

  async getDataListAgoraBackup(userId: string, email: string, arrayId: mongoose.Types.ObjectId[], pageNumber: number, pageSize: number) {
    let skip_ = (pageNumber > 0) ? (pageNumber * pageSize) : pageNumber;
    let limit_ = pageSize;
    //const ID_SETTING_JENIS_REPORT = this.configService.get("ID_SETTING_JENIS_REPORT");
    const DataList = await this.MediastreamingModel.aggregate(
      [
        {
          $set: {
            idStream: arrayId
          },

        },
        {
          $match: {
            $and: [
              {
                $expr: { $in: ['$_id', '$idStream'] }
              },
              { "kick.userId": { $ne: new mongoose.Types.ObjectId(userId) } }
            ]
          },
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "user",
            let: {
              email: email,
              userID: "$userId"
            },
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      $expr:
                      {
                        $eq: ["$email", "$$email"]
                      },

                    },
                    {
                      $expr:
                      {
                        $eq: ["$_id", "$$userID"]
                      },

                    },

                  ]
                },

              }
            ]
          }
        },
        {
          $set: {
            userLogin: {
              $filter: {
                input: "$user",
                as: "users",
                cond: {
                  $eq: ["$$users.email", email]
                }
              }
            },

          }
        },
        {
          $set: {
            userStream: {
              $filter: {
                input: "$user",
                as: "users",
                cond: {
                  $ne: ["$$users.email", email]
                }
              }
            },
          }
        },
        {
          $set: {
            interestLogin: {
              $arrayElemAt: ["$userLogin.userInterests.$id", 0]
            }
          }
        },
        {
          $set: {
            interesStream: {
              $arrayElemAt: ["$userStream.userInterests.$id", 0]
            }
          }
        },
        {
          $set: {
            ints: {
              $concatArrays: [{
                $arrayElemAt: ["$userStream.userInterests.$id", 0]
              }, {
                $arrayElemAt: ["$userLogin.userInterests.$id", 0]
              }]
            }
          }
        },
        {
          $set: {
            interest: {
              $subtract: [
                {
                  $size: "$ints"
                },
                {
                  $size: {
                    $setUnion: [
                      "$ints",
                      []
                    ]
                  }
                }
              ]
            }
          }
        },
        {
          $set: {
            views: {
              $filter: {
                input: "$view",
                as: "views",
                cond: {
                  $eq: ["$$views.status", true]
                }
              }
            },

          }
        },
        {
          $set: {
            totalView:
            {
              $size: "$views"
            }
          }
        },
        {
          $set: {
            totalLike:
            {
              $size: "$like"
            }
          }
        },
        {
          $set: {
            follower: {
              $arrayElemAt: ["$userStream.follower", 0]
            },

          }
        },
        {
          $set: {
            following: {
              $arrayElemAt: ["$userStream.following", 0]
            },

          }
        },
        {
          $set: {
            friend: {
              $arrayElemAt: ["$userStream.friend", 0]
            },

          }
        },
        {
          $set: {
            totalFollower:
            {
              $size: "$follower"
            }
          }
        },
        {
          $set: {
            totalFriend:
            {
              $size: "$friend"
            }
          }
        },
        {
          $set: {
            totalFollowing:
            {
              $size: "$following"
            }
          }
        },
        {
          $sort: {
            totalFriend: -1,
            totalFollowing: -1,
            interest: -1,
            totalView: -1,
            totalLike: -1,
            totalFollower: -1,
            startLive: -1,

          }
        },
        {
          $skip: skip_
        },
        {
          $limit: limit_
        },
        {
          $project: {
            _id: 1,
            title: 1,
            userId: 1,
            tokenAgora: 1,
            expireTime: 1,
            startLive: 1,
            status: 1,
            urlStream: 1,
            urlIngest: 1,
            createAt: 1,
            interest: 1,
            totalView: 1,
            totalLike: 1,
            totalFollower: 1,
            totalFriend: 1,
            totalFollowing: 1, 
            // settingsRemackReport:
            // {
            //   $arrayElemAt: ["$dataSettings.value", 0]
            // },
            fullName:
            {
              $arrayElemAt: ["$userStream.fullName", 0]
            },
            username:
            {
              $arrayElemAt: ["$userStream.username", 0]
            },
            email:
            {
              $arrayElemAt: ["$userStream.email", 0]
            },
            //avatar: 1,
            avatar: {
              "mediaBasePath": {
                $arrayElemAt: ["$userStream.mediaBasePath", 0]
              },
              "mediaUri": {
                $arrayElemAt: ["$userStream.mediaUri", 0]
              },
              "mediaType": {
                $arrayElemAt: ["$userStream.mediaType", 0]
              },
              "mediaEndpoint": {
                $arrayElemAt: ["$userStream.mediaEndpoint", 0]
              },
            }
          }
        },
      ]
    );
    return DataList;
  }

  async getDataListAgora(userId: string, email: string, arrayId: mongoose.Types.ObjectId[], pageNumber: number, pageSize: number) {
    let skip_ = (pageNumber > 0) ? (pageNumber * pageSize) : pageNumber;
    let limit_ = pageSize;
    //const ID_SETTING_JENIS_REPORT = this.configService.get("ID_SETTING_JENIS_REPORT");
    const DataList = await this.MediastreamingModel.aggregate(
      [
        {
          $set: {
            idStream: arrayId
          },

        },
        {
          $match: {
            $and: [
              {
                $expr: {
                  $in: ['$_id', '$idStream']
                }
              },
              { "kick.userId": { $ne: new mongoose.Types.ObjectId(userId) } }
            ]
          },
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "user",
            let: {
              email: email,
              userID: "$userId"
            },
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      $expr:
                      {
                        $eq: ["$email", "$$email"]
                      },

                    },
                    {
                      $expr:
                      {
                        $eq: ["$_id", "$$userID"]
                      },

                    },

                  ]
                },

              }
            ]
          }
        },
        {
          $set: {
            userLogin: {
              $filter: {
                input: "$user",
                as: "users",
                cond: {
                  $eq: ["$$users.email", email,]
                }
              }
            },

          }
        },
        {
          $set: {
            userStream: {
              $filter: {
                input: "$user",
                as: "users",
                cond: {
                  $ne: ["$$users.email", email,]
                }
              }
            },

          }
        },
        {
          $set: {
            interestLogin: {
              $arrayElemAt: ["$userLogin.userInterests.$id", 0]
            }
          }
        },
        {
          $set: {
            interesStream: {
              $arrayElemAt: ["$userStream.userInterests.$id", 0]
            }
          }
        },
        {
          $set: {
            ints: {
              $concatArrays: [{
                $arrayElemAt: ["$userStream.userInterests.$id", 0]
              }, {
                $arrayElemAt: ["$userLogin.userInterests.$id", 0]
              }]
            }
          }
        },
        {
          $set: {
            interest: {
              $subtract: [
                {
                  $size: { $ifNull: ["$ints", []] }
                },
                {
                  $size: {
                    $setUnion: [
                      "$ints",
                      []
                    ]
                  }
                }
              ]
            }
          }
        },
        {
          $set: {
            views: {
              $filter: {
                input: "$view",
                as: "views",
                cond: {
                  $eq: ["$$views.status", true]
                }
              }
            },

          }
        },
        {
          $set: {
            totalView:
            {
              $size: { $ifNull: ["$views", []] }
            }
          }
        },
        {
          $set: {
            totalLike:
            {
              $size: { $ifNull: ["$like", []] }
            }
          }
        },
        {
          $set: {
            follower: {
              $arrayElemAt: ["$userStream.follower", 0]
            },

          }
        },
        {
          $set: {
            following: {
              $arrayElemAt: ["$userStream.following", 0]
            },

          }
        },
        {
          $set: {
            friend: {
              $arrayElemAt: ["$userStream.friend", 0]
            },

          }
        },
        {
          $set: {
            totalFollower:
            {
              $size: { $ifNull: ["$follower", []] }
            }
          }
        },
        {
          $set: {
            isFollower:
            {
              $cond:
              {
                if: {
                  $eq: ["$follower", []]
                },
                then: 0,
                else:
                {
                  $cond:
                  {
                    if: {
                      $in: [email, "$follower"]
                    },
                    then: 1,
                    else: 0
                  }
                },

              }
            },

          }
        },
        {
          $set: {
            isIdVerified:
            {
              $cond:
              {
                if: {
                  $eq: ["$isIdVerified", []]
                },
                then: 0,
                else:
                {
                  $cond:
                  {
                    if: {
                      $eq: ["$isIdVerifiedm", true]
                    },
                    then: 1,
                    else: 0
                  }
                },

              }
            },

          }
        },
        {
          $set: {
            totalFriend:
            {
              $size: { $ifNull: ["$friend", []] }
            }
          }
        },
        {
          $set: {
            totalShare:
            {
              $size: { $ifNull: ["$share", []] }
            }
          }
        },
        {
          $set: {
            gift:
            {
              $ifNull: ['$gift', []]
            }
          }
        },
        {
          $set: {
            totalGift:
            {
              $size: "$gift"
            }
          }
        },
        {
          $set: {
            totalFollowing:
            {
              $size: { $ifNull: ["$following", []] }
            }
          }
        },
        {
          "$lookup": {
            from: "friend_list",
            as: "friend",
            let: {
              localID: {
                $arrayElemAt: ["$userStream.email", 0]
              },

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
                          "friendlist": {
                            $elemMatch: {
                              email: email
                            }
                          }
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$email', email]
                          }
                        },
                        {
                          friendlist: {
                            $elemMatch: {
                              email: "$$localID"
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                $project: {
                  friend:
                  {
                    $cond: {
                      if: {
                        $gt: [{
                          $size: '$friendlist'
                        }, 0]
                      },
                      then: 3,
                      else: 0
                    }
                  },

                }
              },

            ]
          },

        },
        {
          $sort: {
            startLive: - 1,
            friend: - 1,
            isFollower: - 1,
            isIdVerified: - 1,
            //totalFriend: - 1,
            //totalFollowing: - 1,
            //interest: - 1,
            totalLike: - 1,
            totalView: - 1,
            totalShare: - 1,
            totalGift: - 1,
            //totalFollower: - 1,
            //startLive: - 1,
          }
        },
        //{
        //    $skip: 0
        //},
        //{
        //    $limit: 100
        //},
        {
          $project: {
            friend: 1,
            gift: 1,
            isIdVerified: 1,
            isFollower: 1,
            totalShare: 1,
            totalGift: 1,
            _id: 1,
            title: 1,
            userId: 1,
            tokenAgora: 1,
            expireTime: 1,
            startLive: 1,
            status: 1,
            urlStream: 1,
            urlIngest: 1,
            createAt: 1,
            interest: 1,
            totalView: 1,
            totalLike: 1,
            totalFollower: 1,
            totalFriend: 1,
            totalFollowing: 1,
            // settingsRemackReport:
            // {
            //   $arrayElemAt: ["$dataSettings.value", 0]
            // },
            fullName:
            {
              $arrayElemAt: ["$userStream.fullName", 0]
            },
            username:
            {
              $arrayElemAt: ["$userStream.username", 0]
            },
            email:
            {
              $arrayElemAt: ["$userStream.email", 0]
            },
            //avatar: 1,
            avatar: {
              "mediaBasePath": {
                $arrayElemAt: ["$userStream.mediaBasePath", 0]
              },
              "mediaUri": {
                $arrayElemAt: ["$userStream.mediaUri", 0]
              },
              "mediaType": {
                $arrayElemAt: ["$userStream.mediaType", 0]
              },
              "mediaEndpoint": {
                $arrayElemAt: ["$userStream.mediaEndpoint", 0]
              },

            }
          }
        },
      ]
    );
    return DataList;
  }

  async getDataList(email: string, arrayId: mongoose.Types.ObjectId[], pageNumber: number, pageSize: number){
    let skip_ = (pageNumber > 0) ? (pageNumber * pageSize) : pageNumber;
    let limit_ = pageSize;
    const DataList = await this.MediastreamingModel.aggregate(
      [
        {
          $set: {
            idStream: arrayId
          },

        },
        {
          $match: {
            $expr: {
              $in: ['$_id', '$idStream']
            }
          },
        },
        {
          "$lookup": {
            from: "newUserBasics",
            as: "user",
            let: {
              email: email,
              userID: "$userId"
            },
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      $expr:
                      {
                        $eq: ["$email", "$$email"]
                      },

                    },
                    {
                      $expr:
                      {
                        $eq: ["$_id", "$$userID"]
                      },

                    },

                  ]
                },

              }
            ]
          }
        },
        {
          $set: {
            userLogin: {
              $filter: {
                input: "$user",
                as: "users",
                cond: {
                  $eq: ["$$users.email", email]
                }
              }
            },

          }
        },
        {
          $set: {
            userStream: {
              $filter: {
                input: "$user",
                as: "users",
                cond: {
                  $ne: ["$$users.email", email]
                }
              }
            },
          }
        },
        // {
        //   "$lookup": {
        //     from: "mediaprofilepicts",
        //     as: "avatars",
        //     let: {
        //       localID: { $arrayElemAt: ["$userStream.profilePict.$id", 0] }
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
        // {
        //   "$lookup": {
        //     from: "insights",
        //     as: "follower",
        //     let: {
        //       email: { $arrayElemAt: ["$userStream.email", 0] }
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $or: [
        //             {
        //               $expr:
        //               {
        //                 $eq: ["$email", "$$email"]
        //               },

        //             },

        //           ]
        //         },

        //       },
        //       {
        //         $project: {
        //           followers: 1
        //         }
        //       }
        //     ]
        //   }
        // },
        // {
        //   "$lookup": {
        //     from: "userauths",
        //     as: "name",
        //     let: {
        //       email: { $arrayElemAt: ["$userStream.email", 0] }
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $or: [
        //             {
        //               $expr:
        //               {
        //                 $eq: ["$email", "$$email"]
        //               },

        //             },

        //           ]
        //         },

        //       },
        //       {
        //         $project: {
        //           username: 1
        //         }
        //       }
        //     ]
        //   }
        // },
        // {
        //   "$lookup": {
        //     from: "friend_list",
        //     as: "friend",
        //     let: {
        //       userStream: {
        //         $arrayElemAt: ['$userStream.email', 0]
        //       },
        //       userLogin: {
        //         $arrayElemAt: ["$userLogin.email", 0]
        //       },

        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $or: [
        //             {
        //               $and: [
        //                 {
        //                   $expr: {
        //                     $eq: ['$email', '$$userStream']
        //                   }
        //                 },
        //                 {
        //                   friendlist: {
        //                     $elemMatch: {
        //                       email: email
        //                     }
        //                   }
        //                 },

        //               ]
        //             },
        //             {
        //               $and: [
        //                 {
        //                   friendlist: {
        //                     $elemMatch: {
        //                       email: '$$userStream'
        //                     }
        //                   }
        //                 },
        //                 {
        //                   $expr: {
        //                     $eq: ['$email', 'ilhamarahman97@gmail.com']
        //                   }
        //                 },

        //               ]
        //             }
        //           ]
        //         }
        //       },
        //       {
        //         $project: {
        //           email: 1,
        //           friend:
        //           {
        //             $cond: {
        //               if: {
        //                 $gt: [{
        //                   $size: '$friendlist'
        //                 }, 0]
        //               },
        //               then: 1,
        //               else: 0
        //             }
        //           },

        //         }
        //       },

        //     ]
        //   },

        // },
        // {
        //   "$lookup": {
        //     from: "contentevents",
        //     as: "following",
        //     let: {
        //       localID: {
        //         $arrayElemAt: ['$userStream.email', 0]
        //       },
        //       user: {
        //         $arrayElemAt: ["$userLogin.email", 0]
        //       },

        //     },
        //     pipeline: [
        //       {
        //         $match:
        //         {
        //           $and: [
        //             {
        //               $expr: {
        //                 $eq: ['$senderParty', '$$localID']
        //               }
        //             },
        //             {
        //               $expr: {
        //                 $eq: ['$email', '$$user']
        //               }
        //             },
        //             {
        //               "eventType": "FOLLOWING",

        //             },
        //             {
        //               "event": "ACCEPT"
        //             },
        //             {
        //               "active": true
        //             },

        //           ]
        //         }
        //       },
        //       {
        //         $project: {
        //           senderParty: 1,
        //           following:
        //           {
        //             $cond: {
        //               if: {
        //                 $gt: [{
        //                   $strLenCP: "$email"
        //                 }, 0]
        //               },
        //               then: true,
        //               else: false
        //             }
        //           },

        //         }
        //       }
        //     ]
        //   },
        // },
        {
          $set: {
            interestLogin: {
              $arrayElemAt: ["$userLogin.userInterests.$id", 0]
            }
          }
        },
        {
          $set: {
            interesStream: {
              $arrayElemAt: ["$userStream.userInterests.$id", 0]
            }
          }
        },
        {
          $set: {
            ints: {
              $concatArrays: [{
                $arrayElemAt: ["$userStream.userInterests.$id", 0]
              }, {
                $arrayElemAt: ["$userLogin.userInterests.$id", 0]
              }]
            }
          }
        },
        {
          $set: {
            interest: {
              $subtract: [
                {
                  $size: "$ints"
                },
                {
                  $size: {
                    $setUnion: [
                      "$ints",
                      []
                    ]
                  }
                }
              ]
            }
          }
        },
        {
          $set: {
            views: {
              $filter: {
                input: "$view",
                as: "views",
                cond: {
                  $eq: ["$$views.status", true]
                }
              }
            },

          }
        },
        {
          $set: {
            totalView:
            {
              $size: "$views"
            }
          }
        },
        {
          $set: {
            totalLike:
            {
              $size: "$like"
            }
          }
        },
        {
          $set: {
            follower: {
              $arrayElemAt: ["$userStream.follower", 0]
            },

          }
        },
        {
          $set: {
            following: {
              $arrayElemAt: ["$userStream.following", 0]
            },

          }
        },
        {
          $set: {
            friend: {
              $arrayElemAt: ["$userStream.friend", 0]
            },

          }
        },
        {
          $set: {
            totalFollower:
            {
              $size: "$follower"
            }
          }
        },
        {
          $set: {
            totalFriend:
            {
              $size: "$friend"
            }
          }
        },
        {
          $set: {
            totalFollowing:
            {
              $size: "$following"
            }
          }
        },
        {
          $sort: {
            totalFriend: -1,
            totalFollowing: -1,
            interest: -1,
            totalView: -1,
            totalLike: -1,
            totalFollower: -1,
            startLive: -1,
          }
        },
        {
          $skip: skip_
        },
        {
          $limit: limit_
        },
        {
          $project: {
            _id: 1,
            title: 1,
            userId: 1,
            expireTime: 1,
            startLive: 1,
            status: 1,
            urlStream: 1,
            urlIngest: 1,
            createAt: 1,
            interest: 1,
            totalView: 1,
            totalLike: 1,
            totalFollower: 1,
            totalFriend: 1,
            totalFollowing: 1,
            fullName:
            {
              $arrayElemAt: ["$userStream.fullName", 0]
            },
            username:
            {
              $arrayElemAt: ["$userStream.username", 0]
            },
            email:
            {
              $arrayElemAt: ["$userStream.email", 0]
            },
            //avatar: 1,
            avatar: {
              "mediaBasePath": {
                $arrayElemAt: ["$userStream.mediaBasePath", 0]
              },
              "mediaUri": {
                $arrayElemAt: ["$userStream.mediaUri", 0]
              },
              "mediaType": {
                $arrayElemAt: ["$userStream.mediaType", 0]
              },
              "mediaEndpoint": {
                $arrayElemAt: ["$userStream.mediaEndpoint", 0]
              },
            }
          }
        },
      ]
    );
    return DataList;
  }

  async findOneStreaming2(_id: string): Promise<Mediastreaming> {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        $unwind:
        {
          path: "$comment",
          includeArrayIndex: "updateAt_index"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$comment.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",

                }
              }
            },
          ],
        }
      },
      {
        "$project": {
          "_id": 1,
          "title": 1,
          "url": 1,
          "textUrl": 1,
          "userId": 1,
          "expireTime": 1,
          "startLive": 1,
          "endLive": 1,
          "status": 1,
          "view": 1,
          "like": 1,
          "comment": 1,
          "share": 1,
          "shareCount": 1,
          "follower": 1,
          "gift": 1,
          "urlStream": 1,
          "urlIngest": 1,
          "feedBack": 1,
          "createAt": 1,
          "feedback": 1,
          "pause": 1,
          "pauseDate": 1,
          "kick": 1,
          "commentDisabled": 1,
          "tokenAgora": 1,
          "report": 1,
          "dateBanned": 1,
          "banned": 1,
          "income": 1,
          "userIdComment": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
          "idComment": "$comment.idComment",

        }
      },
      {
        $group: {
          _id: "$_id",
          title: {
            $first: '$title'
          },
          url: {
            $first: '$url'
          },
          textUrl: {
            $first: '$textUrl'
          },
          userId: {
            $first: '$userId'
          },
          expireTime: {
            $first: '$expireTime'
          },
          startLive: {
            $first: '$startLive'
          },
          endLive: {
            $first: '$endLive'
          },
          status: {
            $first: '$status'
          },
          view: {
            $first: '$view'
          },
          like: {
            $first: '$like'
          },
          share: {
            $first: '$share'
          },
          shareCount: {
            $first: '$shareCount'
          },
          follower: {
            $first: '$follower'
          },
          gift: {
            $first: '$gift'
          },
          urlStream: {
            $first: '$urlStream'
          },
          urlIngest: {
            $first: '$urlIngest'
          },
          feedBack: {
            $first: '$feedBack'
          },
          feedback: {
            $first: '$feedback'
          },
          createAt: {
            $first: '$createAt'
          },
          pause: {
            $first: '$pause'
          },
          pauseDate: {
            $first: '$pauseDate'
          },
          commentDisabled: {
            $first: '$commentDisabled'
          },
          kick: {
            $first: '$kick'
          },
          tokenAgora: {
            $first: '$tokenAgora'
          },
          report: {
            $first: '$report'
          },
          banned: {
            $first: '$banned'
          },
          dateBanned: {
            $first: '$dateBanned'
          },
          income: {
            $first: '$income'
          },
          comment: {
            $push: {
              "userId": "$userIdComment",
              "email": "$email",
              "fullName": "$fullName",
              "username": "$username",
              "avatar": "$avatar",
              "messages": "$messages",
              "idComment": "$idComment",

            }
          }
        }
      }
    ];
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data[0];
    // const data = await this.MediastreamingModel.findOne({ _id: new mongoose.Types.ObjectId(_id) });
    // return data;
  }

  async findOneStreaming4(_id: string): Promise<Mediastreaming> {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        $unwind:
        {
          path: "$comment",
          preserveNullAndEmptyArrays: true,
          includeArrayIndex: "updateAt_index"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$comment.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },

          ],

        }
      },
      {
        "$project": {
          "_id": 1,
          "title": 1,
          "url": 1,
          "textUrl": 1,
          "userId": 1,
          "expireTime": 1,
          "startLive": 1,
          "endLive": 1,
          "status": 1,
          "view": 1,
          "like": 1,
          "comment": 1,
          "share": 1,
          "shareCount": 1,
          "follower": 1,
          "gift": 1,
          "urlStream": 1,
          "urlIngest": 1,
          "feedBack": 1,
          "createAt": 1,
          "feedback": 1,
          "pause": 1,
          "pauseDate": 1,
          "kick": 1,
          "commentDisabled": 1,
          "tokenAgora": 1,
          "report": 1,
          "dateBanned": 1,
          "banned": 1,
          "income": 1,
          "userIdComment": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
          "idComment": "$comment.idComment",

        }
      },
      {
        $group: {
          _id: "$_id",
          title: {
            $first: '$title'
          },
          url: {
            $first: '$url'
          },
          textUrl: {
            $first: '$textUrl'
          },
          userId: {
            $first: '$userId'
          },
          expireTime: {
            $first: '$expireTime'
          },
          startLive: {
            $first: '$startLive'
          },
          endLive: {
            $first: '$endLive'
          },
          status: {
            $first: '$status'
          },
          view: {
            $first: '$view'
          },
          like: {
            $first: '$like'
          },
          share: {
            $first: '$share'
          },
          shareCount: {
            $first: '$shareCount'
          },
          follower: {
            $first: '$follower'
          },
          gift: {
            $first: '$gift'
          },
          urlStream: {
            $first: '$urlStream'
          },
          urlIngest: {
            $first: '$urlIngest'
          },
          feedBack: {
            $first: '$feedBack'
          },
          feedback: {
            $first: '$feedback'
          },
          createAt: {
            $first: '$createAt'
          },
          pause: {
            $first: '$pause'
          },
          pauseDate: {
            $first: '$pauseDate'
          },
          commentDisabled: {
            $first: '$commentDisabled'
          },
          kick: {
            $first: '$kick'
          },
          tokenAgora: {
            $first: '$tokenAgora'
          },
          report: {
            $first: '$report'
          },
          banned: {
            $first: '$banned'
          },
          dateBanned: {
            $first: '$dateBanned'
          },
          income: {
            $first: '$income'
          },
          comment:
          {
            $push: {
              "userId": "$userIdComment",
              "email": "$email",
              "fullName": "$fullName",
              "username": "$username",
              "avatar": "$avatar",
              "messages": "$messages",
              "idComment": "$idComment",

            }
          }
        }
      },
      {
        "$project": {
          "_id": 1,
          "title": 1,
          "url": 1,
          "textUrl": 1,
          "userId": 1,
          "expireTime": 1,
          "startLive": 1,
          "endLive": 1,
          "status": 1,
          "view": 1,
          "like": 1,
          "share": 1,
          "shareCount": 1,
          "follower": 1,
          "gift": 1,
          "urlStream": 1,
          "urlIngest": 1,
          "feedBack": 1,
          "createAt": 1,
          "feedback": 1,
          "pause": 1,
          "pauseDate": 1,
          "kick": 1,
          "commentDisabled": 1,
          "tokenAgora": 1,
          "report": 1,
          "dateBanned": 1,
          "banned": 1,
          "income": 1,
          "comment": {
            $cond: {
              if: {
                "$ne": ["$comment.idComment", []]
              },
              then: "$comment",
              else: []
            }
          },
        }
      }
    ];
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data[0];
  }

  async findOneStreaming3(_id: string): Promise<Mediastreaming> {
    const data = await this.MediastreamingModel.findOne({ _id: new mongoose.Types.ObjectId(_id) });
    return data;
  }

  async findOneStreaming(_id: string): Promise<Mediastreaming> {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        $unwind:
        {
          path: "$comment",
          preserveNullAndEmptyArrays: true,
          includeArrayIndex: "updateAt_index"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$comment.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },

          ],
        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
          "idComment": "$comment.idComment",
        }
      },
    ];
    console.log(JSON.stringify(paramaggregate));
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data[0];
    // const data = await this.MediastreamingModel.findOne({ _id: new mongoose.Types.ObjectId(_id) });
    // return data;
  }

  async findOneStreamingView(_id: string) {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        $set: {
          view_unique: { "$setUnion": ["$view.userId", []] }
        }
      },
      {
        $project: {
          view: {
            $filter: {
              input: '$view',
              as: 'item',
              cond: {
                $eq: ["$$item.status", true]
              }
            }
          },
          view_unique: 1
        }
      },
    ];
    console.log(JSON.stringify(paramaggregate));
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async findOneStreamingPinned(_id: string): Promise<Mediastreaming[]> {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        $project: {
          comment: {
            $filter: {
              input: '$comment',
              as: 'item',
              cond: {
                $eq: ["$$item.pinned", true]
              }
            }
          }
        }
      },
      {
        $unwind:
        {
          path: "$comment",
          includeArrayIndex: "updateAt_index"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$comment.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },

          ],
        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
          "idComment": "$comment.idComment",
        }
      },
    ];
    console.log(JSON.stringify(paramaggregate));
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async updateStreaming(_id: string, MediastreamingDto_: MediastreamingDto) {
    const data = await this.MediastreamingModel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id) },
      MediastreamingDto_,
      { new: true });
    return data;
  }

  async findFollower(_id: string, userID: string) {
    const data = await this.MediastreamingModel.findOne({
      _id: new mongoose.Types.ObjectId(_id),
      follower: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userID), status: true }
      }
    });
    return data;
  }

  async updateFollower(_id: string, userId: string, status: boolean, statusUpdate: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id),
      "follower.userId": new mongoose.Types.ObjectId(userId),
      "follower.status": status
    },
      {
        $set: { "follower.$.status": statusUpdate, "follower.$.updateAt": updateAt }
      });
    console.log(data)
    return data;
  }

  async findView(_id: string, userID: string){
    const data = await this.MediastreamingModel.findOne({
      _id: new mongoose.Types.ObjectId(_id),
      view: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userID), status: true }
      }
    });
    return data;
  }

  async findKick(_id: string, userID: string) {
    const data = await this.MediastreamingModel.findOne({
      _id: new mongoose.Types.ObjectId(_id),
      kick: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userID) }
      }
    });
    return data;
  }

  async findReport(_id: string, userID: string) {
    const data = await this.MediastreamingModel.findOne({
      _id: new mongoose.Types.ObjectId(_id),
      report: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userID) }
      }
    });
    return data;
  }

  async getDataComment(_id: string) {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),

        }
      },
      {
        $unwind:
        {
          path: "$comment",
          includeArrayIndex: "updateAt_index",

        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$comment.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },
            // {
            //   "$lookup": {
            //     from: "userauths",
            //     as: "data_userauths",
            //     let: {
            //       localID: '$userAuth'
            //     },
            //     pipeline: [
            //       {
            //         $match:
            //         {
            //           $expr: {
            //             $eq: ['$_id', '$$localID']
            //           }
            //         }
            //       },
            //       {
            //         $project: {
            //           email: 1,
            //           username: 1
            //         }
            //       }
            //     ],

            //   }
            // },
            // {
            //   "$lookup": {
            //     from: "mediaprofilepicts",
            //     as: "data_mediaprofilepicts",
            //     let: {
            //       localID: '$profilePict'
            //     },
            //     pipeline: [
            //       {
            //         $match:
            //         {
            //           $expr: {
            //             $eq: ['$_id', '$$localID']
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
            // {
            //   $project: {
            //     fullName: 1,
            //     email: 1,
            //     username: 1,
            //     // userAuth: {
            //     //   "$let": {
            //     //     "vars": {
            //     //       "tmp": {
            //     //         "$arrayElemAt": ["$data_userauths", 0]
            //     //       }
            //     //     },
            //     //     "in": "$$tmp._id"
            //     //   }
            //     // },
            //     // username: {
            //     //   "$let": {
            //     //     "vars": {
            //     //       "tmp": {
            //     //         "$arrayElemAt": ["$data_userauths", 0]
            //     //       }
            //     //     },
            //     //     "in": "$$tmp.username"
            //     //   }
            //     // },
            //     avatar: {
            //       "mediaBasePath": "$mediaBasePath",
            //       "mediaUri": "$mediaUri",
            //       "mediaType": "$mediaType",
            //       "mediaEndpoint": "$mediaEndpoint",
            //     }
            //   }
            // },

          ],
        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          // "userAuth": {
          //   "$let": {
          //     "vars": {
          //       "tmp": {
          //         "$arrayElemAt": ["$data_userbasics", 0]
          //       }
          //     },
          //     "in": "$$tmp.userAuth"
          //   }
          // },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
          "idComment": "$comment.idComment",
        }
      },
    ];
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async getDataCommentPinned(_id: string) {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),

        }
      },
      {
        $unwind:
        {
          path: "$comment",
          includeArrayIndex: "updateAt_index",

        }
      },
      {
        $match: {
          "comment.pinned": true,
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$commentPinned.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },
            // {
            //   "$lookup": {
            //     from: "userauths",
            //     as: "data_userauths",
            //     let: {
            //       localID: '$userAuth'
            //     },
            //     pipeline: [
            //       {
            //         $match:
            //         {
            //           $expr: {
            //             $eq: ['$_id', '$$localID']
            //           }
            //         }
            //       },
            //       {
            //         $project: {
            //           email: 1,
            //           username: 1
            //         }
            //       }
            //     ],

            //   }
            // },
            // {
            //   "$lookup": {
            //     from: "mediaprofilepicts",
            //     as: "data_mediaprofilepicts",
            //     let: {
            //       localID: '$profilePict'
            //     },
            //     pipeline: [
            //       {
            //         $match:
            //         {
            //           $expr: {
            //             $eq: ['$_id', '$$localID']
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
            // {
            //   $project: {
            //     fullName: 1,
            //     email: 1,
            //     username: 1,
            //     // userAuth: {
            //     //   "$let": {
            //     //     "vars": {
            //     //       "tmp": {
            //     //         "$arrayElemAt": ["$data_userauths", 0]
            //     //       }
            //     //     },
            //     //     "in": "$$tmp._id"
            //     //   }
            //     // },
            //     // username: {
            //     //   "$let": {
            //     //     "vars": {
            //     //       "tmp": {
            //     //         "$arrayElemAt": ["$data_userauths", 0]
            //     //       }
            //     //     },
            //     //     "in": "$$tmp.username"
            //     //   }
            //     // },
            //     avatar: {
            //       "mediaBasePath": "$mediaBasePath",
            //       "mediaUri": "$mediaUri",
            //       "mediaType": "$mediaType",
            //       "mediaEndpoint": "$mediaEndpoint",
            //     }
            //   }
            // },

          ],
        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          // "userAuth": {
          //   "$let": {
          //     "vars": {
          //       "tmp": {
          //         "$arrayElemAt": ["$data_userbasics", 0]
          //       }
          //     },
          //     "in": "$$tmp.userAuth"
          //   }
          // },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
        }
      },
    ];
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async getDataEndLive(id: string){
    const data = await this.MediastreamingModel.aggregate([
      {
        "$match": {
          "_id": new mongoose.Types.ObjectId(id)
        }
      },
      {
        $set: {
          view_active: {
            $filter: {
              input: "$view",
              as: "view",
              cond: {
                $eq: ["$$view.status", true]
              }
            }
          },
        }
      },
      {
        $set: {
          comment_active: {
            $filter: {
              input: "$comment",
              as: "comment",
              cond: {
                $eq: ["$$comment.commentType", "MESSAGGES"]
              }
            }
          },
        }
      },
      {
        $set: {
          follower_active: {
            $filter: {
              input: "$follower",
              as: "follower",
              cond: {
                $eq: ["$$follower.status", true]
              }
            }
          },

        }
      },
      {
        $set: {
          view_unique: { "$setUnion": ["$view.userId", []] }
        }
      },
      {
        $set: {
          gift_unique: { "$setUnion": ["$gift.userId", []] }
        }
      }
    ]);
    return data;
  }

  async getViewCountUnic(_id: string){
    const data = await this.MediastreamingModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        "$project": {
          "userId": 1,
          "view": { "$setUnion": ["$view.userId", []] }
        }
      },
      {
        $unwind:
        {
          path: "$view"
        }
      },
    ]);
    return data;
  }

  async getDataViewUnic(_id: string, page: number, limit: number) {
    let page_ = (page > 0) ? (page * limit) : page;
    let limit_ = (page > 0) ? ((page + 1) * limit) : limit;
    console.log(limit_);
    console.log(page_);
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        "$project": {
          "userId":1,
          "view": { "$setUnion": ["$view.userId", []] } 
        }
      },
      {
        $unwind:
        {
          path: "$view"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics_streamer",
          let: {
            localID: "$userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                follower: 1,
                following: 1,
                income: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },
          ],
        }
      },
      { "$limit": limit_ },
      { "$skip": page_ },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$view"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                follower: 1,
                following: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: 1,
                follower: 1,
                following: 1,
              }
            },
          ],
        }
      },
      {
        $addFields: {
          follower_view: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.follower"
            }
          },
        }
      },
      {
        $addFields: {
          userStream: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics_streamer", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
        }
      },
      {
        $addFields: {
          userView: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
        }
      },
      {
        "$project": {
          // userview: "$userView",
          //userstream: "$userStream",
          // follower_view: "$follower_view",
          // asd: {
          //   $filter: {
          //     input: "$follower_view",
          //     as: "num",
          //     cond: {
          //       "$eq":
          //         [
          //           "$$num",
          //           "$userStream"
          //         ]
          //     }
          //   }
          // },
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          following:
          {
            $cond:
            {
              if: {
                $eq: ["$follower_view", []]
              },
              then: false,
              else:
              {
                $cond:
                {
                  if: {
                    $gt: [{
                      $size: {
                        $filter: {
                          input: "$follower_view",
                          as: "num",
                          cond: {
                            "$eq":
                              [
                                "$$num",
                                "$userStream"
                              ]
                          }
                        }
                      }
                    }, 0] },
                  then: true,
                  else: false
                }
              },
            }
          }, 
        }
      },
    ];
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async getDataView(_id: string, page: number, limit: number){
    let page_ = (page > 0) ? (page * limit) : page;
    let limit_ = (page > 0) ? ((page + 1) * limit) : limit;
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        "$project": {
          "view": {
            "$filter": {
              "input": "$view",
              "as": "view",
              "cond": {
                "$and": [
                  {
                    "$eq": ["$$view.status", true]
                  }
                ]
              }
            }
          }
        }
      },
      {
        "$project": {
          "view": {
            $sortArray:
            {
              input: "$view",
              sortBy: { "createAt": -1 }
            }
          }
        }
      },
      {
        $unwind:
        {
          path: "$view",
          includeArrayIndex: "updateAt_index",

        }
      },
      { "$limit": limit_ },
      { "$skip": page_ },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$view.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                follower: 1,
                following: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",
                }
              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                follower: 1,
                following: 1,
                avatar: 1
              }
            },
          ],
        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          // "userAuth": {
          //   "$let": {
          //     "vars": {
          //       "tmp": {
          //         "$arrayElemAt": ["$data_userbasics", 0]
          //       }
          //     },
          //     "in": "$$tmp.userAuth"
          //   }
          // },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
        }
      },
    ];
    console.log(JSON.stringify(paramaggregate));
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async getDataGift(_id: string, page: number, limit: number) {
    const data = await this.MediastreamingModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        "$project": {
          "_id": 1,
          "gift": {
            $sortArray:
            {
              input: "$gift",
              sortBy: { "createAt": 1 }
            }
          }
        }
      },
      {
        $unwind:
        {
          path: "$gift"
        }
      },
      {
        "$project": {
          "_id": 1,
          "gift": 1,
          "giftCreate": "$gift.createAt"
        }
      },
      {
        $lookup:
        {
          from: "monetize",
          localField: "gift.idGift",
          foreignField: "_id",
          as: "data_gift"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$gift.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                follower: 1,
                following: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",

                }
              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: 1,
                follower: 1,
                following: 1,
              }
            },

          ],

        }
      },
      {
        "$project": {
          "giftCreate": 1,
          "giftId": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "name": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.name"
            }
          },
          "thumbnail": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.thumbnail"
            }
          },
          "animation": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.animation"
            }
          },
          "typeGift": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.typeGift"
            }
          },
          "userId": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },

        }
      },
      {
        "$group": {
          "_id": {
            "userId": "$userId",
            "giftId": "$giftId",

          },
          "count": {
            "$sum": 1
          },
          data: {
            $push: '$$ROOT'
          }
        }
      },
      {
        $sort: {
          'data.giftCreate': 1
        }
      },
      {
        $project: {
          "count": 1,
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "giftId": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.giftId"
            }
          },
          "name": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.name"
            }
          },
          "thumbnail": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.thumbnail"
            }
          },
          "typeGift": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.typeGift"
            }
          },
          "userId": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.userId"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
        }
      },
    ]);
    return data;
  }

  async updateView(_id: string, userId: string, statusSearch: boolean, statusUpdate: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(_id),
      "view": { "$elemMatch": { "userId": new mongoose.Types.ObjectId(userId), "status": statusSearch } }
    }, 
    {
      $set: { "view.$.status": statusUpdate, "view.$.updateAt": updateAt }
    },
    );
    return data;
  } 

  async updateComment(_id: string, userId: string, messages: string, pinned: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(_id),
      "comment": { "$elemMatch": { "userId": new mongoose.Types.ObjectId(userId), "messages": messages } }
    },
      {
        $set: { "comment.$.pinned": pinned, "comment.$.updateAt": updateAt }
      },
    );
    return data;
  }

  async updateManyCommentPinned(_id: string, pinned: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.updateMany(
      {
        _id: new mongoose.Types.ObjectId(_id),
        "comment": { "$elemMatch": { "pinned": true } }
      },
      {
        $set: { "comment.$.pinned": pinned, "comment.$.updateAt": updateAt }
      }
    );
    return data;
  }

  async updateManyByUserId(userId: string) {
    const currentDate = await this.utilsService.getDateTimeString();
    const data = await this.MediastreamingModel.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId), 
      },
      {
        $set: { status: false, endLive: currentDate }
      }
    );
    return data;
  }

  async updateCommentPinned(_id: string, idComment: string, pinned: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(_id),
      "comment": { "$elemMatch": { "idComment": new mongoose.Types.ObjectId(idComment) } }
    },
      {
        $set: { "comment.$.pinned": pinned, "comment.$.updateAt": updateAt }
      },
    );
    return data;
  }

  async updateCommentDelete(_id: string, idComment: string, status: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(_id),
      "comment": { "$elemMatch": { "idComment": new mongoose.Types.ObjectId(idComment) } }
    },
      {
        $set: { "comment.$.status": status, "comment.$.updateAt": updateAt }
      },
    );
    return data;
  }

  async insertView(_id: string, view: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    }, 
    {
      $push: {
        "view": view
      }
    });
    return data;
  }

  async insertKick(_id: string, kick: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "kick": kick
        }
      });
    return data;
  }

  async insertFollower(_id: string, follower: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "follower": follower
        }
      });
    return data;
  }

  async insertComment(_id: string, comment: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "comment": comment
        }
      });
    return data;
  }

  async insertReport(_id: string, report: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        "banned":false,
        $push: {
          "report": report
        }
      });
    return data;
  }

  async insertGift(_id: string, gift: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "gift": gift
        }
      });
    return data;
  }

  async updateIncome(_id: string, income: number) {
    this.MediastreamingModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(_id),
      },
      { $inc: { income: income } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateShare(_id: string, share: number) {
    this.MediastreamingModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(_id),
      },
      { $inc: { shareCount: share } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async transactionGift(idStream: string, idUser: string, idGift: string, idDiscond: any, dataComment: any) {
    const getDataGift = await this.monetizationService.findOne(idGift);
    const getDataStream = await this.findById(idStream);
    let amount = 0;
    let disconCoin = 0;
    let totalAmount = 0;
    let voucher = [];
    let detail = [];
    let dataDetail = {};
    dataDetail["id"] = new mongoose.Types.ObjectId(idGift);
    dataDetail["idStream"] = new mongoose.Types.ObjectId(idStream);
    dataDetail["category"] = "LIVE";
    dataDetail["typeData"] = "gift";
    dataDetail["amount"] = getDataGift.price;
    if (idDiscond != undefined) {
      const getDataDiscond = await this.monetizationService.findOne(idDiscond);
      voucher.push(idDiscond);
      disconCoin = getDataDiscond.amount;
    } 
    amount = getDataGift.price;
    totalAmount = getDataGift.price - disconCoin;
    dataDetail["discountCoin"] = disconCoin;
    dataDetail["totalAmount"] = totalAmount
    detail.push(dataDetail);
    
    const data = await this.transactionsV2Service.insertTransaction("APP", "GF", "LIVE", Number(getDataGift.price), Number(disconCoin), 0, 0, idUser, getDataStream.userId.toString(), voucher, detail,"SUCCESS")

    if (data != false) {
      await this.insertGift(idStream.toString(), dataComment);
      this.monetizationService.updateStock(getDataGift._id.toString(), 1, true);
      let coinProfitSharingGF = 0;
      let totalIncome = 0;
      const ID_SETTING_PROFIT_SHARING_GIFT = this.configService.get("ID_SETTING_PROFIT_SHARING_GIFT");
      const GET_ID_SETTING_PROFIT_SHARING_GIFT = await this.utilsService.getSetting_Mixed_Data(ID_SETTING_PROFIT_SHARING_GIFT);
      if (await this.utilsService.ceckData(GET_ID_SETTING_PROFIT_SHARING_GIFT)) {
        if (GET_ID_SETTING_PROFIT_SHARING_GIFT.typedata.toString() == "persen") {
          coinProfitSharingGF = amount * (Number(GET_ID_SETTING_PROFIT_SHARING_GIFT.value) / 100);
        }
        if (GET_ID_SETTING_PROFIT_SHARING_GIFT.typedata.toString() == "number") {
          coinProfitSharingGF = amount - Number(GET_ID_SETTING_PROFIT_SHARING_GIFT.value);
        }
      }
      totalIncome = amount - coinProfitSharingGF;
      this.updateIncome(idStream, totalIncome);
    }
  }

  async broadcastFCMLive(Userbasicnew_: Userbasicnew, title: string, streamId: string){
    const dataFollower = Userbasicnew_.follower;
    const emailUser = Userbasicnew_.email;
    if (dataFollower.length>0){
      for (let k=0; k < Userbasicnew_.follower.length;k++){
        await this.utilsService.sendFcmV2(Userbasicnew_.follower[k].toString(), emailUser.toString(), 'NOTIFY_LIVE', 'LIVE', 'LIVE_START', streamId, "streaming", null, title.toString());
      }
    }
  }

  async insertCommentPinned(_id: string, comment: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "commentPinned": comment
        }
      });
    return data;
  }

  async insertLike(_id: string, like: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "like": { $each: like }
        }
      });
    return data;
  }

  async generateUrl(streamId: string, expireTime: number): Promise<any>{
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    //Get KEY_STREAM_LIVE
    const GET_KEY_STREAM_LIVE = this.configService.get("KEY_STREAM_LIVE");
    const KEY_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_STREAM_LIVE);

    //Get URL_INGEST_LIVE
    const GET_URL_INGEST_LIVE = this.configService.get("URL_INGEST_LIVE");
    const URL_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_INGEST_LIVE);

    //Get KEY_INGEST_LIVE
    const GET_KEY_INGEST_LIVE = this.configService.get("KEY_INGEST_LIVE");
    const KEY_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_INGEST_LIVE);

    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    const urlStream = await this.generateStream(URL_STREAM_LIVE.toString(), KEY_STREAM_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    const urlIngest = await this.generateIngest(URL_INGEST_LIVE.toString(), KEY_INGEST_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    return {
      urlStream: urlStream,
      urlIngest: urlIngest
    }
  }

  async generateStream(pullDomain: String, pullKey: String, appName: String, streamName: String, expireTime: number): Promise<String>{
    let rtmpUrl: String = "";
    if (pullKey == "") {
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName;
    } else {
      //let rtmpToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pullKey;
      //let rtmpToMd5: String = "/" + appName + "/" + streamName + ".m3u8-" + expireTime.toString() + "-0-0-" + pullKey;
      let rtmpToMd5: String = "/" + appName + "/" + streamName + ".flv-" + expireTime.toString() + "-0-0-" + pullKey;
      let rtmpAuthKey: String = await this._md5_(rtmpToMd5);
      //rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + rtmpAuthKey;
      //rtmpUrl = "http://" + pullDomain + "/" + appName + "/" + streamName + ".m3u8" + "?auth_key=" + expireTime.toString() + "-0-0-" + rtmpAuthKey;
      rtmpUrl = "http://" + pullDomain + "/" + appName + "/" + streamName + ".flv" + "?auth_key=" + expireTime.toString() + "-0-0-" + rtmpAuthKey;
    }
    
    return rtmpUrl;
  }

  async generateIngest(pushDomain: String, pushKey: String, appName: String, streamName: String, expireTime: number): Promise<String> {
    let pushUrl: String = "";
    if (pushKey == "") {
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName;
    } else {
      let stringToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pushKey;
      let authKey: String = await this._md5_(stringToMd5);
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + authKey;
    }
    return pushUrl;
  }

  async generateStreamTest(pullDomain: String, pullKey: String, appName: String, streamName: String, expireTime: number): Promise<String> {
    let rtmpUrl: String = "";
    if (pullKey == "") {
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName;
    } else {
      let rtmpToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pullKey;
      let rtmpAuthKey: String = await this._md5_(rtmpToMd5);
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + rtmpAuthKey;
    }
    return rtmpUrl;
  }

  async generateIngestTest(pushDomain: String, pushKey: String, appName: String, streamName: String, expireTime: number): Promise<String> {
    let pushUrl: String = "";
    if (pushKey == "") {
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName;
    } else {
      let stringToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pushKey;
      let authKey: String = await this._md5_(stringToMd5);
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + authKey;
    }
    console.log(pushUrl)
    return pushUrl;
  }

  async generateUrlTest(streamId: string, expireTime: number): Promise<any> {
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    //Get KEY_STREAM_LIVE
    const GET_KEY_STREAM_LIVE = this.configService.get("KEY_STREAM_LIVE");
    const KEY_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_STREAM_LIVE);

    //Get URL_INGEST_LIVE
    const GET_URL_INGEST_LIVE = this.configService.get("URL_INGEST_LIVE");
    const URL_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_INGEST_LIVE);

    //Get KEY_INGEST_LIVE
    const GET_KEY_INGEST_LIVE = this.configService.get("KEY_INGEST_LIVE");
    const KEY_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_INGEST_LIVE);

    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    const urlStream = await this.generateStreamTest(URL_STREAM_LIVE.toString(), KEY_STREAM_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    const urlIngest = await this.generateIngestTest(URL_INGEST_LIVE.toString(), KEY_INGEST_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    console.log({
      urlStream: urlStream,
      urlIngest: urlIngest
    })
    return {
      urlStream: urlStream,
      urlIngest: urlIngest
    }
  }

  async _md5_(param: String){
    if (param == null || param.length === 0) {
      return null;
    }
    try {
      const md5 = require('crypto').createHash('md5');
      md5.update(param);
      const result = md5.digest('hex');
      return result;
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  async md5_(param: String) {
    if (param == null || param.length === 0) {
      return null;
    }
    let digest;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(param.toString());
      const hashBuffer = await require('crypto').subtle.digest('MD5', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      digest = hashHex;
    } catch (error) {
      console.error(error);
      return "";
    }
    return digest;
  }

  async socketRequest(RequestSoctDto_: RequestSoctDto) {
    let config = { headers: { "Content-Type": "application/json" } };
    const res = await this.httpService.post(this.configService.get("URL_CHALLENGE") + "api/send/socket", RequestSoctDto_, config).toPromise();
    const data = res.data;
    return data;
  }

  async StreamRefreshUserWarning() {
    let getDataUser = await this.userbasicnewService.getUserStreamWrning();
    if (getDataUser.length > 0) {
      for (let i = 0; i < getDataUser.length; i++) {
        let dataUser = getDataUser[i];
        let streamWarning = dataUser.streamWarning;
        // streamWarning.sort(function (a, b) {
        //   return Date.parse(b.createAt) - Date.parse(a.createAt);
        // })
        let currentDate = new Date();
        let firstReport = streamWarning[0].createAt;
        let firstReportToDate = new Date(firstReport);
        let firstReportToDate_ = new Date(firstReportToDate.getTime() - (firstReportToDate.getTimezoneOffset() * 60000)).toISOString();
        let firstReportToDate_Date = new Date(firstReportToDate_);

        //GET ID SETTING REFRESH MAX REPORT
        const ID_SETTING_REFRESH_MAX_REPORT = this.configService.get("ID_SETTING_REFRESH_MAX_REPORT");
        const GET_ID_SETTING_REFRESH_MAX_REPORT = await this.utilsService.getSetting_Mixed(ID_SETTING_REFRESH_MAX_REPORT);

        if (GET_ID_SETTING_REFRESH_MAX_REPORT != undefined) {
          const hoursToAdd = Number(GET_ID_SETTING_REFRESH_MAX_REPORT) * 60 * 60 * 1000;
          firstReportToDate_Date.setTime(firstReportToDate_Date.getTime() + hoursToAdd);
        }
        if (currentDate.getTime() > firstReportToDate_Date.getTime()) {
          let Userbasicnew_ = new Userbasicnew();
          Userbasicnew_.streamWarning = [];
          //UPDATE DATA USER STREAM
          await await this.userbasicnewService.update2(dataUser._id.toString(), Userbasicnew_);
        }
      }
    }
  }

  async StreamAppeal() {
    let getDataUser = await this.userbasicnewService.getUserStreamBanned();
    if (getDataUser.length > 0) {
      for (let i = 0; i < getDataUser.length; i++) {
        let dataUser = getDataUser[i];
        let streamBanding = dataUser.streamBanding;
        let streamBandingFilter = streamBanding.filter((bd) => {
          return bd.status == true;
        });
        let objIndex = streamBanding.findIndex(obj => obj.status == true);
        let currentDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
        let firstBanding = streamBandingFilter[0].createAt;
        let firstBandingToDate = new Date(firstBanding);
        let firstBandingDateTime_ = new Date(firstBandingToDate.getTime() - (firstBandingToDate.getTimezoneOffset() * 60000)).toISOString();
        let firstBandingDateTime_Date = new Date(firstBandingDateTime_);

        //GET ID SETTING REFRESH MAX REPORT
        const ID_SETTING_APPEAL_AUTO_APPROVE = this.configService.get("ID_SETTING_APPEAL_AUTO_APPROVE");
        const GET_ID_SETTING_APPEAL_AUTO_APPROVE = await this.utilsService.getSetting_Mixed(ID_SETTING_APPEAL_AUTO_APPROVE);

        if (GET_ID_SETTING_APPEAL_AUTO_APPROVE != undefined) {
          const dayToAdd = Number(GET_ID_SETTING_APPEAL_AUTO_APPROVE);
          firstBandingDateTime_Date.setDate(firstBandingDateTime_Date.getDate() + dayToAdd);
          if (currentDate.getTime() >= firstBandingDateTime_Date.getTime()) {
            streamBanding[objIndex].notes = "AUTO APPROVE BY SYSTEM";
            streamBanding[objIndex].status = false;
            streamBanding[objIndex].approve = true;
            let Userbasicnew_ = new Userbasicnew();
            Userbasicnew_.streamWarning = [];
            Userbasicnew_.streamBanned = false;
            Userbasicnew_.streamBanding = streamBanding;
            //UPDATE DATA USER STREAM
            await await this.userbasicnewService.update2(dataUser._id.toString(), Userbasicnew_);
          }
        }
      }
    }
  }

  async updateDataStream(
    streamID: string,
    status: boolean,): Promise<any> {
    return await this.transactionsV2Service.updateDataStream(streamID, status);
  }

  async updateDataStreamSpecificUser(
    streamID: string,
    status: boolean,
    email: string,
    view: number,): Promise<any> {
    return await this.transactionsV2Service.updateDataStreamSpecificUser(streamID, status, email, view);
  }

  async dashboard(RequestConsoleStream_: RequestConsoleStream): Promise<any> {
    let pipeline = [];
    let $match = {};
    let $expr = {};
    let $and = [];

    //----------------START DATE----------------
    var start_date = null;
    if (RequestConsoleStream_.livePeriodeStart != undefined) {
      start_date = new Date(RequestConsoleStream_.livePeriodeStart.toString());
    }

    //----------------END DATE----------------
    var end_date = null;
    if (RequestConsoleStream_.livePeriodeEnd != undefined) {
      end_date = new Date(RequestConsoleStream_.livePeriodeEnd.toString());
      end_date = new Date(end_date.setDate(end_date.getDate() + 1));
    }

    if (start_date!=null){
      $and.push({
        $gte: ["$startLive", start_date.toISOString()]
      })
    }

    if (end_date != null) {
      $and.push({
        $gte: ["$startLive", start_date.toISOString()]
      })
    }

    if (start_date != null || end_date != null){
      $expr["$and"] = $and;
      $match["$expr"] = $expr;
      pipeline.push({ $match });
    }

    pipeline.push(
      {
        $set: {
          "viewCount": {
            $size: "$view"
          },

        }
      },
      {
        $set: {
          "dateLive": {
            $substr:
              [
                "$startLive",
                0,
                10
              ]
          },

        }
      },
      {
        $lookup:
        {
          from: "newUserBasics",
          as: "userbasics_data",
          let:
          {
            userId: "$userId"
          },
          pipeline:
            [
              {
                $match:
                {
                  $expr:
                  {
                    $eq:
                      [
                        "$_id",
                        "$$userId"
                      ]
                  }
                },

              },
              {
                $project:
                {
                  _id: 1,
                  email: 1,
                  fullName: 1,
                  username: 1,
                  statesName: 1,
                  avatar: {
                    "mediaBasePath": "$mediaBasePath",
                    "mediaUri": "$mediaUri",
                    "mediaType": "$mediaType",
                    "mediaEndpoint": "$mediaEndpoint",

                  }
                }
              }
            ]
        }
      },
      {
        $set: {
          "lokasi": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userbasics_data", 0]
                }
              },
              "in": "$$tmp.statesName"
            }
          }
        }
      },
      {
        $facet:
        {
          stremer: [
            {
              $group: {
                _id: "$userId",
                count: {
                  $sum: "$viewCount"
                }
              }
            }
          ],
          viewer: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: "$viewCount"
                }
              }
            }
          ],
          sesi: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: 1
                }
              }
            }
          ],
          dateStream: [
            {
              $group: {
                _id: "$dateLive",
                streamer: {
                  $sum: 1
                },
                viewer: {
                  $sum: "$viewCount"
                }
              }
            },
            {
              $project: {
                "dateLive": "$_id",
                "streamer": 1,
                "viewer": 1
              }
            }
          ],
          sesiStream: [
            {
              $group: {
                _id: {
                  "userId": "$userId",
                  "dateLive": "$dateLive",

                },
                streamer: {
                  $sum: 1
                },
                viewer: {
                  $sum: "$viewCount"
                }
              }
            },
            {
              $project: {
                "dateLive": "$_id.dateLive",
                "streamer": 1,
                "viewer": 1
              }
            }
          ],
          lokasiStreamer: [
            {
              $group: {
                _id: "$lokasi",
                streamer: {
                  $sum: 1
                },

              }
            }
          ],
          lokasiViewer: [
            {
              '$unwind': '$view'
            },
            {
              $group: {
                _id: "$view.lokasi",
                viewer: {
                  $sum: 1
                },

              }
            }
          ],
          feedbackStreamer: [
            {
              $group: {
                _id: "$feedBack",
                feedbackText: {
                  $push: {
                    "userId": {
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp._id"
                      }
                    },
                    "email": {
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp.email"
                      }
                    },
                    "fullName": {
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp.fullName"
                      }
                    },
                    "username": {
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp.username"
                      }
                    },
                    "avatar": {
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp.avatar"
                      }
                    },
                    "feedbackText": "$feedbackText",

                  }
                },
              }
            },
            {
              $project: {
                "feedback": "$_id",
                "feedbackText": 1,
              }
            }
          ],

        }
      },
      {
        $project: {
          stremer: {
            $size: "$stremer"
          },
          viewer: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$viewer", 0]
                }
              },
              "in": "$$tmp.count"
            }
          },
          sesi: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$sesi", 0]
                }
              },
              "in": "$$tmp.count"
            }
          },
          statistics: "$dateStream",
          totalSesi: "$sesiStream",
          lokasiStreamer: "$lokasiStreamer",
          lokasiViewer: "$lokasiViewer",
          feedbackStreamer: "$feedbackStreamer"
        }
      })

    let query = await this.MediastreamingModel.aggregate(pipeline);
    return query;
  }

  async database(RequestConsoleStream_: RequestConsoleStream) {
    let pipeline = [];
    let $match = {};
    //let $expr = {};
    let $and = [];
    let $sort = {};

    pipeline.push(
      {
        $set: {
          views: { $ifNull: ["$views", []] }
        }
      },
      {
        $set: {
          gift: { $ifNull: ["$gift", []] }
        }
      },
      {
        $set: {
          totalView:
          {
            $size: "$views"
          }
        }
      },
      {
        $set: {
          totalGift:
          {
            $size: "$gift"
          }
        }
      },);

    //FILTER LIVE DESC
    if (RequestConsoleStream_.liveDesc != undefined) {
      $and.push({
        title: {
          $regex: RequestConsoleStream_.liveDesc.toString(),
          $options: "i"
        }
      });
    }

    //FILTER LIVE ID
    if (RequestConsoleStream_.liveId != undefined) {
      $and.push({
        _id: new mongoose.Types.ObjectId(RequestConsoleStream_.liveId.toString())
      });
    }

    //FILTER START END LIVE
    if (RequestConsoleStream_.livePeriodeStart != undefined || RequestConsoleStream_.livePeriodeEnd != undefined) {
      let startLive = {};
      //----------------START DATE----------------
      var start_date = null;
      if (RequestConsoleStream_.livePeriodeStart != undefined) {
        start_date = new Date(RequestConsoleStream_.livePeriodeStart.toString());
      }

      //----------------END DATE----------------
      var end_date = null;
      if (RequestConsoleStream_.livePeriodeEnd != undefined) {
        end_date = new Date(RequestConsoleStream_.livePeriodeEnd.toString());
        end_date = new Date(end_date.setDate(end_date.getDate() + 1));
      }

      if (start_date != null) {
        // $and.push({
        //   $gte: ["$startLive", start_date.toISOString()]
        // })
        startLive["$gte"] = start_date.toISOString().replace('T', ' ').replace('.000Z', '');
      }

      if (end_date != null) {
        startLive["$lte"] = end_date.toISOString().replace('T', ' ').replace('.000Z', '');
      }
      $and.push({
        startLive
      })
    }

    //FILTER DURASI
    if (RequestConsoleStream_.liveDurasi != undefined) {
      if (RequestConsoleStream_.liveDurasi.length > 0) {
        var liveDurasiFilter = [];
        //show_smaller_than_20
        if (RequestConsoleStream_.liveDurasi.includes("show_smaller_than_20")) {
          liveDurasiFilter.push({
            durasi: {
              $gt: 0, $lt: 14
            }
          })
        }
        //show_20_smaller_than_40
        if (RequestConsoleStream_.liveDurasi.includes("show_20_smaller_than_40")) {
          liveDurasiFilter.push({
            durasi: {
              $gt: 20, $lt: 40
            }
          })
        }
        //show_40_smaller_than_60
        if (RequestConsoleStream_.liveDurasi.includes("show_40_smaller_than_60")) {
          liveDurasiFilter.push({
            durasi: {
              $gt: 40, $lt: 60
            }
          })
        }
        $and.push({
          $or: liveDurasiFilter
        });
      }
    }

    //FILTER VIEW
    if (RequestConsoleStream_.liveView != undefined) {
      if (RequestConsoleStream_.liveView.length > 0) {
        var liveViewFilter = [];
        //show_smaller_than_100
        if (RequestConsoleStream_.liveView.includes("show_smaller_than_100")) {
          liveViewFilter.push({
            totalView: {
              $gt: 0, $lt: 100
            }
          })
        }
        //show_100_smaller_than_200
        if (RequestConsoleStream_.liveView.includes("show_100_smaller_than_200")) {
          liveViewFilter.push({
            totalView: {
              $gt: 100, $lt: 200
            }
          })
        }
        //show_200_smaller_than_400
        if (RequestConsoleStream_.liveView.includes("show_200_smaller_than_400")) {
          liveViewFilter.push({
            totalView: {
              $gt: 200, $lt: 400
            }
          })
        }
        //show_greater_than_400
        if (RequestConsoleStream_.liveView.includes("show_greater_than_400")) {
          liveViewFilter.push({
            totalView: {
              $gt: 400
            }
          })
        }
        $and.push({
          $or: liveViewFilter
        });
      }
    }

    //FILTER GIFT
    if (RequestConsoleStream_.liveGift != undefined) {
      if (RequestConsoleStream_.liveGift.length > 0) {
        var liveGiftFilter = [];
        //show_smaller_than_10
        if (RequestConsoleStream_.liveGift.includes("show_smaller_than_10")) {
          liveGiftFilter.push({
            totalGift: {
              $gt: 0, $lt: 10
            }
          })
        }
        //show_10_smaller_than_50
        if (RequestConsoleStream_.liveGift.includes("show_10_smaller_than_50")) {
          liveGiftFilter.push({
            totalGift: {
              $gt: 10, $lt: 50
            }
          })
        }
        //show_greater_than_50
        if (RequestConsoleStream_.liveGift.includes("show_greater_than_50")) {
          liveGiftFilter.push({
            totalGift: {
              $gt: 50
            }
          })
        }
        $and.push({
          $or: liveGiftFilter
        });
      }
    }

    //FILTER STATUS
    if (RequestConsoleStream_.status != undefined) {
      if (RequestConsoleStream_.status.length > 0) {
        var liveStatusFilter = [];
        //BERLANGSUNG
        if (RequestConsoleStream_.status.includes("BERLANGSUNG")) {
          liveStatusFilter.push({
            statusText: "ONGOING"
          })
        }
        //SELESAI
        if (RequestConsoleStream_.status.includes("SELESAI")) {
          liveStatusFilter.push({
            statusText: "FINISHED"
          })
        }
        //DIHENTIKAN
        if (RequestConsoleStream_.status.includes("DIHENTIKAN")) {
          liveStatusFilter.push({
            statusText: "STOPPED"
          })
        }
        $and.push({
          $or: liveStatusFilter
        });
      }
    }

    if ($and.length > 0) {
      $match["$and"] = $and;
      pipeline.push({ $match });
    }

    //LIMIT
    if (RequestConsoleStream_.limit != undefined) {
      pipeline.push({
        "$limit": RequestConsoleStream_.limit
      });
    } else{
      RequestConsoleStream_.limit = 1;
    }

    //SKIP
    if (RequestConsoleStream_.page != undefined){
      pipeline.push({
        "$skip": (RequestConsoleStream_.limit * RequestConsoleStream_.page)
      });
    }

    //SORT
    if (RequestConsoleStream_.sortField!=undefined) {
      let fieldSort = RequestConsoleStream_.sortField.toString();
      if (RequestConsoleStream_.sort != undefined) {
        if (RequestConsoleStream_.sort == "ASC") {
          $sort[fieldSort] = 1;
        } else if (RequestConsoleStream_.sort == "DESC") {
          $sort[fieldSort] = -1;
        } else {
          $sort[fieldSort] = -1;
        }
      } else {
        $sort[fieldSort] = -1;
      }
    }else{
      if (RequestConsoleStream_.sort != undefined) {
        if (RequestConsoleStream_.sort == "ASC") {
          $sort['createAt'] = 1;
        } else if (RequestConsoleStream_.sort == "DESC") {
          $sort['createAt'] = -1;
        } else {
          $sort['createAt'] = -1;
        }
      } else {
        $sort['createAt'] = -1;
      }
    }
    pipeline.push({
      "$sort": $sort
    }); 
    
    pipeline.push(
      {
        $lookup:
        {
          from: "newUserBasics",
          as: "userbasicsStreamer",
          let:
          {
            userId: "$userId"
          },
          pipeline:
            [
              {
                $match:
                {
                  $expr:
                  {
                    $eq:
                      [
                        "$_id",
                        "$$userId"
                      ]
                  }
                },

              },
              {
                $project:
                {
                  _id: 1,
                  email: 1,
                  fullName: 1,
                  username: 1,
                  statesName: 1,
                  avatar: {
                    "mediaBasePath": "$mediaBasePath",
                    "mediaUri": "$mediaUri",
                    "mediaType": "$mediaType",
                    "mediaEndpoint": "$mediaEndpoint",

                  }
                }
              }
            ]
        }
      },);

    let query = await this.MediastreamingModel.aggregate(pipeline);
    return query;

  }

  async databaseDetail(id: string) {
    let pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup:
        {
          from: "newUserBasics",
          as: "userbasicsStreamer",
          let:
          {
            userId: "$userId"
          },
          pipeline:
            [
              {
                $match:
                {
                  $expr:
                  {
                    $eq:
                      [
                        "$_id",
                        "$$userId"
                      ]
                  }
                },
              },
              {
                $set: {
                  following: { $ifNull: ["$following", []] }
                }
              },
              {
                $set: {
                  follower: { $ifNull: ["$follower", []] }
                }
              },
              {
                $set: {
                  friend: { $ifNull: ["$friend", []] }
                }
              },
              {
                $project:
                {
                  _id: 1,
                  fullName: 1,
                  username: 1,
                  avatar: {
                    "mediaBasePath": "$mediaBasePath",
                    "mediaUri": "$mediaUri",
                    "mediaType": "$mediaType",
                    "mediaEndpoint": "$mediaEndpoint",

                  },
                  email: 1,
                  following: {
                    $size: "$following"
                  }, 
                  follower: {
                    $size: "$follower"
                  }, 
                  friend: {
                    $size: "$friend"
                  },
                  gender: {
                    "$switch": {
                      "branches": [{
                        "case": {
                          "$or": [{
                            "$eq": ["$gender", "Male"]
                          }, {
                            "$eq": ["$gender", "Laki-laki"]
                          }, {
                            "$eq": ["$gender", "MALE"]
                          }]
                        },
                        "then": "Laki-laki"
                      }, {
                        "case": {
                          "$or": [{
                            "$eq": ["$gender", " Perempuan"]
                          }, {
                            "$eq": ["$gender", "Perempuan"]
                          }, {
                            "$eq": ["$gender", "PEREMPUAN"]
                          }, {
                            "$eq": ["$gender", "FEMALE"]
                          }, {
                            "$eq": ["$gender", " FEMALE"]
                          }]
                        },
                        "then": "Perempuan"
                      }],
                      "default": "Lainnya"
                    }
                  },
                  joinDate: "$createdAt",
                  statesName: 1,
                }
              }
            ]
        }
      },
      {
        $set: {
          view_unique: { "$setUnion": ["$view.userId", []] }
        }
      },
      {
        $set: {
          comment_active: {
            $filter: {
              input: "$comment",
              as: "comment",
              cond: {
                $eq: ["$$comment.commentType", "MESSAGGES"]
              }
            }
          },
        }
      },
      {
        $set: {
          views: { $ifNull: ["$views", []] }
        }
      },
      {
        $set: {
          gift: { $ifNull: ["$gift", []] }
        }
      },
      {
        $set: {
          follower: { $ifNull: ["$follower", []] }
        }
      },
      {
        $set: {
          totalView:
          {
            $size: "$views"
          }
        }
      },
      {
        $set: {
          totalGift:
          {
            $size: "$gift"
          }
        }
      },
      {
        $facet:
        {
          userStreamer: [
              {
                $project:{
                  userStreamer: {
                    "$arrayElemAt": ["$userbasicsStreamer", 0]
                  },
                  liveId: "$_id",
                  title: 1,
                  startLive: 1,
                  durasi: 1,
                  tautan: "$textUrl",
                  feedBack: 1,
                  feedbackText: 1, 
                  newFollowers:{
                    $size: "$follower"
                  },
                  totalLike: {
                    $size: "$like"
                  },
                  totalView: {
                    $size: "$view_unique"
                  },
                  totalGift: {
                    $size: "$gift"
                  },
                  totalComment: {
                    $size: "$comment_active"
                  },
                  totalShare: {
                    $size: "$share"
                  },
                  income: 1,
                  report: {
                    $size: "$report"
                  },
                }
              }
          ],
          lokasiViewer: [
            {
              '$unwind': '$view'
            },
            {
              $group: {
                _id: "$view.lokasi",
                viewer: {
                  $sum: 1
                },

              }
            }
          ],
          reportDetail: [
            {
              '$unwind': '$report'
            },
            {
              $group: {
                _id: "$report.messages",
                report: {
                  $sum: 1
                },

              }
            }
          ],
        }
      },
      {
        $project:{
          userStreamer: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.userStreamer"
            }
          },
          liveId: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.liveId"
            }
          },
          title: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.title"
            }
          },
          startLive: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.startLive"
            }
          },
          durasi: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.durasi"
            }
          },
          tautan: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.tautan"
            }
          },
          feedBack: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.feedBack"
            }
          },
          feedbackText: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.feedbackText"
            }
          },
          newFollowers: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.newFollowers"
            }
          },
          totalLike: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.totalLike"
            }
          },
          totalComment: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.totalComment"
            }
          },
          totalView: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.totalView"
            }
          }, 
          totalGift: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.totalGift"
            }
          },
          income: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.income"
            }
          }, 
          totalShare: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.totalShare"
            }
          },
          report: {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$userStreamer", 0]
                }
              },
              "in": "$$tmp.report"
            }
          }, 
          lokasiViewer: 1,
          reportDetail: 1, 
        }
      }
    ];
    let query = await this.MediastreamingModel.aggregate(pipeline);
    return query;
  }

  async databaseDetailGift(_id: string, page: number, limit: number) {
    const data = await this.MediastreamingModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        "$project": {
          "_id": 1,
          "gift": {
            $sortArray:
            {
              input: "$gift",
              sortBy: { "createAt": 1 }
            }
          }
        }
      },
      {
        $unwind:
        {
          path: "$gift"
        }
      },
      {
        "$project": {
          "_id": 1,
          "gift": 1,
          "giftCreate": "$gift.createAt"
        }
      },
      {
        $lookup:
        {
          from: "monetize",
          localField: "gift.idGift",
          foreignField: "_id",
          as: "data_gift"
        }
      },
      {
        "$lookup": {
          from: "newUserBasics",
          as: "data_userbasics",
          let: {
            localID: "$gift.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                follower: 1,
                following: 1,
                avatar: {
                  "mediaBasePath": "$mediaBasePath",
                  "mediaUri": "$mediaUri",
                  "mediaType": "$mediaType",
                  "mediaEndpoint": "$mediaEndpoint",

                }
              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: 1,
                follower: 1,
                following: 1,
              }
            },

          ],

        }
      },
      {
        "$project": {
          "giftCreate": 1,
          "giftId": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "name": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.name"
            }
          },
          "thumbnail": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.thumbnail"
            }
          },
          "animation": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.animation"
            }
          },
          "typeGift": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_gift", 0]
                }
              },
              "in": "$$tmp.typeGift"
            }
          },
          "userId": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },

        }
      },
    ]);
    return data;
  }
}
