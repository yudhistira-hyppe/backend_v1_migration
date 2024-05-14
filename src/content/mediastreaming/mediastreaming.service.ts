import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Mediastreaming, MediastreamingDocument } from './schema/mediastreaming.schema';
import { MediastreamingDto, RequestSoctDto } from './dto/mediastreaming.dto';
import { UtilsService } from 'src/utils/utils.service';
import { HttpService } from '@nestjs/axios';
import { TransactionsV2Service } from 'src/trans/transactionsv2/transactionsv2.service';
import { MonetizationService } from './monetization/monetization.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
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

  async getDataListAgora(userId: string, email: string, arrayId: mongoose.Types.ObjectId[], pageNumber: number, pageSize: number) {
    let skip_ = (pageNumber > 0) ? (pageNumber * pageSize) : pageNumber;
    let limit_ = pageSize;
    //const ID_SETTING_JENIS_REPORT = this.configService.get("ID_SETTING_JENIS_REPORT");
    const DataList = await this.MediastreamingModel.aggregate(
      [
        {
          $set: {
            idStream: arrayId,
            dataUser: new mongoose.Types.ObjectId(userId)
          },

        },
        {
          $match: {
            $and: [
              {
                $expr: { $in: ['$_id', '$idStream'] }
              },
              { "kick.userId": { $ne: '$dataUser' } }
            ]
          },
        },
        // {
        //   "$lookup": {
        //     from: "settings",
        //     as: "dataSettings",
        //     let: {
        //       id: new mongoose.Types.ObjectId(ID_SETTING_JENIS_REPORT.toString()),
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr:
        //           {
        //             $eq: ["$_id", "$$id"]
        //           },
        //         }
        //       }
        //     ]
        //   }
        // },
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

  async findOneStreaming(_id: string): Promise<Mediastreaming> {
    const data = await this.MediastreamingModel.findOne({ _id: new mongoose.Types.ObjectId(_id) });
    return data;
  }

  async findOneStreamingView(_id: string): Promise<Mediastreaming[]> {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
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
    const data = await this.MediastreamingModel.find({
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
    const data = await this.MediastreamingModel.find({
      _id: new mongoose.Types.ObjectId(_id),
      view: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userID), status: true }
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
      }
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

  async transactionGift(idStream: string, idUser: string, idGift: string, idDiscond: any) {
    const getDataGift = await this.monetizationService.findOne(idGift);
    const getDataStream = await this.findById(idStream);
    let amount = 0;
    let disconCoin = 0;
    let totalAmount = 0;
    let voucher = [];
    let detail = [];
    let dataDetail = {};
    dataDetail["id"] = new mongoose.Types.ObjectId(idGift);
    dataDetail["category"] = "LIVE";
    dataDetail["typeData"] = "gift";
    dataDetail["amount"] = getDataGift.amount;
    if (idDiscond != undefined) {
      const getDataDiscond = await this.monetizationService.findOne(idDiscond);
      voucher.push(idDiscond);
      disconCoin = getDataDiscond.amount;
    } 
    amount = getDataGift.amount;
    totalAmount = getDataGift.amount - disconCoin;
    dataDetail["discountCoin"] = disconCoin;
    dataDetail["totalAmount"] = totalAmount
    detail.push(dataDetail);
    
    const data = await this.transactionsV2Service.insertTransaction("APP", "GF", "LIVE", Number(getDataGift.amount), Number(disconCoin), 0, 0, getDataStream.userId.toString(), idUser, voucher, detail,"SUCCESS")
    if (data) {
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

  async broadcastFCMLive(Userbasicnew_: Userbasicnew, title: String){
    const dataFollower = Userbasicnew_.follower;
    const emailUser = Userbasicnew_.email;
    if (dataFollower.length>0){
      for (let k=0; k < Userbasicnew_.follower.length;k++){
        await this.utilsService.sendFcmV2(Userbasicnew_.follower[k].toString(), emailUser.toString(), 'NOTIFY_LIVE', 'LIVE', 'LIVE_START', null, null, null, title.toString());
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
}
