import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { CreateNotificationsDto, Messages, NotifResponseApps } from './dto/create-notifications.dto';
import { Notifications, NotificationsDocument } from './schemas/notifications.schema';
import { first, pipe, skip } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notifications.name, 'SERVER_FULL')
    private readonly NotificationsModel: Model<NotificationsDocument>,

    private userService: UserbasicsService,
  ) { }

  async create(
    CreateNotificationsDto: CreateNotificationsDto,
  ): Promise<Notifications> {
    const createNotificationsDto = await this.NotificationsModel.create(
      CreateNotificationsDto,
    );
    return createNotificationsDto;
  }

  async findAll(): Promise<Notifications[]> {
    return this.NotificationsModel.find().exec();
  }

  async findlatest(email: string, skip: number, limit: number): Promise<object> {
    const query = await this.NotificationsModel.aggregate([
      { $match: { email: email } },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          notificationID: 1,
          email: 1,
          eventType: 1,
          event: 1,
          mate: 1,
          senderOrReceiverInfo: 1,
          title: 1,
          body: {
            $replaceAll: {
              input: "$body",
              find: "HyppeDiary",
              replacement: "HyppeVid"
            }
          },
          active: 1,
          flowIsDone: 1,
          createdAt: 1,
          updatedAt: 1,
          contentEventID: 1,
          postID: 1,
          postType: {
            $replaceAll: {
              input: "$postType",
              find: "HyppeDiary",
              replacement: "HyppeVid"
            }
          },
          devices: 1,
          actionButtons: 1
        }
      }
    ]);
    return query;
  }

  async findbusinesslatest(email: string, skip: number, limit: number): Promise<object> {
    const query = await this.NotificationsModel.aggregate([
      {
        "$match":
        {
          "$and":
            [
              {
                email: email
              },
              {
                deviceType: "WEB"
              }
              // {
              //   eventType:"TRANSACTION"
              // }
            ]
        }
      },
      { "$sort": { createdAt: -1 }, },
      { "$skip": skip },
      { "$limit": limit },
    ]);
    return query;
  }


  //    async findOne(id: string): Promise<Notifications> {
  //     return this.NotificationsModel.findOne({ _id: id }).exec();
  //   }
  async findOne(email: string): Promise<Notifications> {
    return this.NotificationsModel.findOne({ email: email }).exec();
  }

  async findCriteria(email: string, eventType: string, mate: string): Promise<Notifications> {
    return this.NotificationsModel.findOne({ email: email, eventType: eventType, mate: mate }).exec();
  }
  async findNotifchallenge(email: string, eventType: string, postID: string, time: string): Promise<Notifications> {
    return this.NotificationsModel.findOne({ email: email, eventType: eventType, postID: postID, sendNotifChallenge: time }).exec();
  }
  async updateNotifiaction(email: string, eventType: string, mate: string, currentDate: string) {
    this.NotificationsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        mate: mate,
      },
      { createdAt: currentDate },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async delete(id: string) {
    const deletedCat = await this.NotificationsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async getNotification(body: any, headers: any): Promise<NotifResponseApps> {
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == null) {
      let res = new NotifResponseApps();
      let msg = new Messages;
      msg.info = ["User tidak tedaftar"];
      res.messages = msg;
      res.response_code = 204;
      return res;
    }

    let res = new NotifResponseApps();
    let msg = new Messages;

    let dns: CreateNotificationsDto[] = [];
    let q = await this.getNotificationQuery(body, profile);
    for (let i = 0; i < q.length; i++) {
      let notif = q[i];
      let dn = <CreateNotificationsDto>notif;
      dns.push(dn);
    }

    res.data = dns;
    res.messages = msg;
    res.response_code = 202;
    return res;
  }

  async getNotificationAll() {
    const query = await this.NotificationsModel.aggregate([
      { $match: { email: "ikanhiu@getnada.com", eventType: "FOLLOWER" } },
      {
        $group: {
          _id: {
            eventType: "$eventType",
            email: "$email",
            event: "$event",
            mate: "$mate",
            senderOrReceiverInfo: "$senderOrReceiverInfo",
            title: "$title",
            body: "$body",
            bodyId: "$bodyId",
            active: "$active",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            contentEventID: "$contentEventID"
          },
        }
      },
      {
        $project: {
          _id: 0,
          eventType: "$_id.eventType",
          email: "$_id.email",
          event: "$_id.event",
          mate: "$_id.mate",
          senderOrReceiverInfo: "$_id.senderOrReceiverInfo",
          title: "$_id.title",
          body: "$_id.body",
          bodyId: "$_id.bodyId",
          active: "$_id.active",
          createdAt: "$_id.createdAt",
          updatedAt: "$_id.updatedAt",
          contentEventID: "$_id.contentEventID"
        }
      },
    ]);
    return query;
  }

  private async getNotificationQuery(body: any, profile: Userbasic): Promise<Notifications[]> {
    let query = this.NotificationsModel.find();
    query.where('email', profile.email);

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.eventType != undefined) {
      if (body.eventType == "GENERAL") {
        query.where('eventType', { $in: ['VERIFICATIONID', 'SUPPORTFILE', 'TRANSACTION', 'POST', 'ADS VIEW', 'BOOST_CONTENT', 'BOOST_BUY', 'CONTENT', 'ADS CLICK', 'BANK', 'CONTENTMOD', 'KYC'] });
      } else {
        query.where('eventType', body.eventType);
      }
    }

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
    query.sort({ 'createdAt': -1 });
    return await query.exec();
  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }

  async getNotification2(email: string, eventType: string, skip: number, limit: number,) {
    var pipeline = [];

    if (eventType && eventType !== undefined && eventType !== null && eventType !== "GENERAL") {
      pipeline.push(
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    "email": email

                  },
                  {
                    "eventType": eventType,

                  },
                  {
                    "active": true
                  },

                ]
              },

            ]
          },

        },
      );
    }
    else if (eventType && eventType !== undefined && eventType !== null && eventType === "GENERAL") {
      pipeline.push(
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    "email": email

                  },
                  {
                    "eventType": { $in: ['VERIFICATIONID', 'SUPPORTFILE', 'TRANSACTION', 'POST', 'ADS VIEW', 'BOOST_CONTENT', 'BOOST_BUY', 'CONTENT', 'ADS CLICK', 'BANK', 'CONTENTMOD', 'KYC', 'GENERAL'] },

                  },
                  {
                    "active": true
                  },

                ]
              },

            ]
          },

        },
      );
    }
    else {
      pipeline.push(
        {
          $match:
          {
            $or: [
              {
                $and: [
                  {
                    "email": email

                  },

                  {
                    "active": true
                  },

                ]
              },

            ]
          },

        },
      );
    }

    pipeline.push(

      {
        $lookup: {
          from: 'posts',
          localField: 'postID',
          foreignField: 'postID',
          as: 'post',

        },

      },
      {
        $unwind: {
          path: "$post",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'postID',
          foreignField: 'postID',
          as: 'pict',

        },

      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'postID',
          foreignField: 'postID',
          as: 'vid',

        },

      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'postID',
          foreignField: 'postID',
          as: 'diary',

        },

      },
      {
        $lookup: {
          from: 'mediastories',
          localField: 'postID',
          foreignField: 'postID',
          as: 'story',

        },

      },
      {
        $lookup: {
          from: 'templates',
          localField: 'templateID',
          foreignField: '_id',
          as: 'template_data',

        },

      },
      {
        $unwind: {
          path: "$post",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$pict",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$vid",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$diary",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$story",
          preserveNullAndEmptyArrays: true
        }
      },
      // {
      //   $lookup: {
      //     from: 'userauths',
      //     localField: 'senderOrReceiverInfo.username',
      //     foreignField: 'username',
      //     as: 'userNameSender',

      //   },

      // },
      // {
      //   $unwind: {
      //     path: "$userNameSender",
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'mate',
          foreignField: 'email',
          as: 'userSender',

        },

      },
      {
        $unwind: {
          path: "$userSender",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: - 1
        }
      },
      {
        $skip: (skip * limit)
      },
      {
        $limit: limit
      },
      {
        $project: {
          active: 1,
          body: 1,
          bodyId: 1,
          contentEventID: 1,
          createdAt: 1,
          email: 1,
          event: 1,
          eventType: 1,
          flowIsDone: 1,
          mate: 1,
          postType: "$post.postType",
          mediaTypeStory: '$story.mediaType',
          notificationID: 1,
          actionButtons: 1,
          postID: 1,
          titleEN: {
            "$arrayElemAt": ["$template_data.subject", 0]
          },
          senderOrReceiverInfo:
          {
            fullName: "$senderOrReceiverInfo.fullName",
            username: "$senderOrReceiverInfo.username",
            avatar: {
              mediaEndpoint: { $concat: ["/profilepict/", '$userSender.profilePict.$id'] }
            }
          },
          urluserBadge:
          {
            "$ifNull":
              [
                {
                  "$filter":
                  {
                    input: "$userSender.userBadge",
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
          title: 1,
          updatedAt: 1,

          content: {
            uploadSource: "$pict.uploadSource",
            apsaraId:
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: "$pict.apsaraId",
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: "$vid.apsaraId",
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: "$diary.apsaraId",
                        else: '$story.apsaraId'
                      }
                    },

                  }
                },

              }
            },
            apsaraThumbId:
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: "$pict.apsaraThumbId",
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: "$vid.apsaraThumbId",
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: "$diary.apsaraThumbId",
                        else: '$story.apsaraThumbId'
                      }
                    },

                  }
                },

              }
            },
            isApsara:
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: "$pict.apsara",
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: "$vid.apsara",
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: "$diary.apsara",
                        else: '$story.apsara'
                      }
                    },

                  }
                },

              }
            },
            mediaEndpoint: //"/pict/fbbac412 - 2a03 - 989a - 8855 - fe949890e9f9",
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: {
                  $concat: ["/thumb/", "$postID",]
                },
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: {
                      $concat: ["/thumb/", "$postID",]
                    },
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: {
                          $concat: ["/thumb/", "$postID",]
                        },
                        else: {


                          $cond: {
                            if: {
                              $eq: ['$story.mediaType', 'video']
                            },
                            then: {
                              $concat: ["/thumb/", "$postID",]
                            },
                            else: {
                              $concat: ["/pict/", "$postID",]
                            }
                          },

                        }
                      },

                    }
                  }
                },

              }
            },
            mediaThumName:
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: "$pict.mediaThumName",
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: "$vid.mediaThumName",
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: "$diary.mediaThumName",
                        else: '$story.mediaThumName'
                      }
                    },

                  }
                },

              }
            },
            mediaThumBasePath:
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: "$pict.mediaThumBasePath",
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: "$vid.mediaThumBasePath",
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: "$diary.mediaThumBasePath",
                        else: '$story.mediaThumBasePath'
                      }
                    },

                  }
                },

              }
            },
            mediaThumUri:
            {
              $cond: {
                if: {
                  $eq: ['$post.postType', 'pict']
                },
                then: "$pict.mediaThumUri",
                else:
                {
                  $cond: {
                    if: {
                      $eq: ['$post.postType', 'vid']
                    },
                    then: "$vid.mediaThumUri",
                    else:
                    {
                      $cond: {
                        if: {
                          $eq: ['$post.postType', 'diary']
                        },
                        then: "$diary.mediaThumUri",
                        else: '$story.mediaThumUri'
                      }
                    },

                  }
                },

              }
            },


          }
        }
      },
      {
        $set: {
          tester: {
            $ifNull: ['$content.isApsara', "dodol"]
          }
        }
      },
      {
        $project: {
          active: 1,
          body: 1,
          bodyId: 1,
          contentEventID: 1,
          createdAt: 1,
          email: 1,
          event: 1,
          eventType: 1,
          flowIsDone: 1,
          mate: 1,
          postType: 1,
          mediaTypeStory: 1,
          notificationID: 1,
          actionButtons: 1,
          postID: 1,
          senderOrReceiverInfo: 1,
          title: 1,
          titleEN: 1,
          updatedAt: 1,
          urluserBadge:
          {
            "$ifNull":
              [
                {
                  "$arrayElemAt": ["$urluserBadge", 0]
                },
                null
              ]
          },
          content:
          {
            $cond: {
              if: {
                $eq: ["$tester", "dodol"],
              },
              then: "$kancutTaslim",
              else: "$content"
            }
          },
        }
      }
    );
    console.log(JSON.stringify(pipeline));
    var query = await this.NotificationsModel.aggregate(pipeline);
    return query;
  }

  async listingtargetaudiens(id: string, fullname: string, jeniskelamin: any[], startage: number, endage: number, lokasi: any[], jenisakun: any[], statuskirim: any[], ascending: boolean, page: number, limit: number) {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(id);

    var pipeline = [];
    pipeline.push(
      {
        "$match":
        {
          "$expr":
          {
            "$eq":
              [
                "$templateID", konvertid
              ]
          }
        },
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          createdAt: 1,
          status:
          {
            "$filter":
            {
              input: "$statusDevices",
              as: "list",
              cond:
              {
                "$eq":
                  [
                    "$$list.status",
                    "SEND"
                  ]
              },
              limit: 1
            }
          },
        }
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          createdAt: 1,
          status:
          {
            "$cond":
            {
              if:
              {
                "$eq":
                  [
                    {
                      "$size": "$status"
                    },
                    0
                  ]
              },
              then: "NOTSEND",
              else: "SEND"
            }
          },
        }
      },
      {
        "$lookup":
        {
          from: "userbasics",
          as: "basic_data",
          let:
          {
            email_fk: "$email"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$eq":
                      [
                        "$email", "$$email_fk"
                      ]
                  }
                }
              },
              {
                "$project":
                {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  userAuth: "$userAuth.$id",
                  cities: "$cities.$id",
                  state: "$states.$id",
                  profilePict: "$profilePict.$id",
                  jenis:
                  {
                    $cond:
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$isIdVerified",
                            true
                          ]
                      },
                      then: "PREMIUM",
                      else: "BASIC"
                    },
                  },
                  age:
                  {
                    "$toInt":
                    {
                      $cond:
                      {
                        if:
                        {
                          $and: ['$dob', {
                            $ne: ["$dob", ""]
                          }]
                        },
                        then:
                        {
                          $toInt: {
                            $divide: [{
                              $subtract: [new Date(), {
                                $toDate: "$dob"
                              }]
                            }, (365 * 24 * 60 * 60 * 1000)]
                          }
                        },
                        else: 0
                      }
                    }
                  },
                  gender:
                  {
                    "$switch":
                    {
                      branches:
                        [
                          {
                            case: {
                              $eq: ['$gender', 'FEMALE']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', ' FEMALE']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Perempuan']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Wanita']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'MALE']
                            },
                            then: 'L',

                          },
                          {
                            case: {
                              $eq: ['$gender', ' MALE']
                            },
                            then: 'L',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Laki-laki']
                            },
                            then: 'L',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Pria']
                            },
                            then: 'L',

                          },
                        ],
                      default: "O",
                    }
                  },
                },
              },
              {
                $lookup:
                {
                  from: 'userauths',
                  localField: 'email',
                  foreignField: 'email',
                  as: 'auth_data',
                }
              },
              {
                $lookup:
                {
                  from: 'areas',
                  localField: 'state',
                  foreignField: '_id',
                  as: 'state_data',
                }
              },
              {
                $lookup:
                {
                  from: 'cities',
                  localField: 'cities',
                  foreignField: '_id',
                  as: 'city_data',
                }
              },
              {
                $lookup:
                {
                  from: 'mediaprofilepicts',
                  localField: 'profilePict',
                  foreignField: '_id',
                  as: 'profilePict_data',
                }
              },
              {
                "$addFields": {

                  concat: '/profilepict',
                  pict:
                  {
                    "$replaceOne":
                    {
                      input:
                      {
                        "$arrayElemAt":
                          [
                            "$profilePict_data.mediaUri", 0
                          ]
                      },
                      find: "_0001.jpeg",
                      replacement: ""
                    }
                  },

                },
              },
              {
                "$project":
                {
                  _id: 0,
                  fullName: 1,
                  email: 1,
                  username:
                  {
                    "$arrayElemAt":
                      [
                        "$auth_data.username", 0
                      ]
                  },
                  avatar:
                  {
                    mediaBasePath:
                    {
                      "$arrayElemAt":
                        [
                          "$profilePict_data.mediaBasePath", 0
                        ]
                    },
                    mediaUri:
                    {
                      "$arrayElemAt":
                        [
                          '$profilePict_data.mediaUri', 0
                        ]
                    },
                    mediaType:
                    {
                      "$arrayElemAt":
                        [
                          '$profilePict_data.mediaType', 0
                        ]
                    },
                    mediaEndpoint:
                    {
                      $concat:
                        [
                          "$concat",
                          "/",
                          {
                            "$arrayElemAt":
                              [
                                "$profilePict_data.mediaID", 0
                              ]
                          },
                        ]
                    },
                  },
                  jenis: 1,
                  age: 1,
                  gender: 1,
                  state:
                  {
                    "$ifNull":
                      [
                        {
                          "$arrayElemAt":
                            [
                              "$state_data.stateName", 0
                            ]
                        },
                        null
                      ]
                  },
                  city:
                  {
                    "$ifNull":
                      [
                        {
                          "$arrayElemAt":
                            [
                              "$city_data.cityName", 0
                            ]
                        },
                        null
                      ]
                  },
                }
              }
            ]
        }
      },
      {
        "$unwind":
        {
          path: "$basic_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          status: 1,
          createdAt: 1,
          fullName: "$basic_data.fullName",
          username: "$basic_data.username",
          avatar: "$basic_data.avatar",
          jenis: "$basic_data.jenis",
          age: "$basic_data.age",
          gender: "$basic_data.gender",
          state: "$basic_data.state",
          city: "$basic_data.city"
        }
      }
    );

    var firstmatch = [];
    if (fullname != null) {
      firstmatch.push(
        {
          "fullName":
          {
            "$regex": fullname,
            "$options": "i"
          }
        }
      );
    }

    if (jeniskelamin != null) {
      firstmatch.push(
        {
          "gender":
          {
            "$in": jeniskelamin
          }
        }
      );
    }

    if (startage != null) {
      firstmatch.push(
        {
          "age":
          {
            "$gte": startage
          }
        },
        {
          "age":
          {
            "$lte": endage
          }
        }
      )
    }

    if (lokasi != null) {
      firstmatch.push(
        {
          "state":
          {
            "$in": lokasi
          }
        }
      );
    }

    if (jenisakun != null) {
      firstmatch.push(
        {
          "jenis":
          {
            "$in": jenisakun
          }
        }
      );
    }

    if (statuskirim != null) {
      firstmatch.push(
        {
          "status":
          {
            "$in": statuskirim
          }
        }
      );
    }

    if (firstmatch.length != 0) {
      pipeline.push(
        {
          "$match":
          {
            "$and": firstmatch
          }
        }
      );
    }

    if (ascending != null) {
      var setsorting = null;
      if (ascending == true) {
        setsorting = 1;
      }
      else {
        setsorting = -1;
      }

      pipeline.push(
        {
          "$sort":
          {
            "fullName": setsorting
          }
        }
      );
    }

    if (page > 0) {
      pipeline.push(
        {
          "$skip": (page * limit)
        }
      );
    }

    if (limit > 0) {
      pipeline.push(
        {
          "$limit": limit
        }
      );
    }

    var query = await this.NotificationsModel.aggregate(pipeline);

    return query;
  }

  async listingtargetaudiensv2(id: string, fullname: string, jeniskelamin: any[], startage: number, endage: number, lokasi: any[], jenisakun: any[], statuskirim: any[], ascending: boolean, page: number, limit: number) {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(id);

    var pipeline = [];
    pipeline.push(
      {
        "$match":
        {
          "$expr":
          {
            "$eq":
              [
                "$templateID", konvertid
              ]
          }
        },
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          createdAt: 1,
          status:
          {
            "$filter":
            {
              input: "$statusDevices",
              as: "list",
              cond:
              {
                "$eq":
                  [
                    "$$list.status",
                    "SEND"
                  ]
              },
              limit: 1
            }
          },
        }
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          createdAt: 1,
          status:
          {
            "$cond":
            {
              if:
              {
                "$eq":
                  [
                    {
                      "$size": "$status"
                    },
                    0
                  ]
              },
              then: "NOTSEND",
              else: "SEND"
            }
          },
        }
      },
      {
        "$lookup":
        {
          from: "newUserBasics",
          as: "basic_data",
          let:
          {
            email_fk: "$email"
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$eq":
                      [
                        "$email", "$$email_fk"
                      ]
                  }
                }
              },
              {
                "$project":
                {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  username: 1,
                  cities: "$cities.$id",
                  state: "$states.$id",
                  jenis:
                  {
                    $cond:
                    {
                      if:
                      {
                        "$eq":
                          [
                            "$isIdVerified",
                            true
                          ]
                      },
                      then: "PREMIUM",
                      else: "BASIC"
                    },
                  },
                  age:
                  {
                    "$toInt":
                    {
                      $cond:
                      {
                        if:
                        {
                          $and: ['$dob', {
                            $ne: ["$dob", ""]
                          }]
                        },
                        then:
                        {
                          $toInt: {
                            $divide: [{
                              $subtract: [new Date(), {
                                $toDate: "$dob"
                              }]
                            }, (365 * 24 * 60 * 60 * 1000)]
                          }
                        },
                        else: 0
                      }
                    }
                  },
                  gender:
                  {
                    "$switch":
                    {
                      branches:
                        [
                          {
                            case: {
                              $eq: ['$gender', 'FEMALE']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', ' FEMALE']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Perempuan']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Wanita']
                            },
                            then: 'P',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'MALE']
                            },
                            then: 'L',

                          },
                          {
                            case: {
                              $eq: ['$gender', ' MALE']
                            },
                            then: 'L',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Laki-laki']
                            },
                            then: 'L',

                          },
                          {
                            case: {
                              $eq: ['$gender', 'Pria']
                            },
                            then: 'L',

                          },
                        ],
                      default: "O",
                    }
                  },
                  mediaBasePath: 1,
                  mediaUri: 1,
                  mediaType: 1,
                  mediaEndpoint: 1,
                },
              },
              {
                $lookup:
                {
                  from: 'areas',
                  localField: 'state',
                  foreignField: '_id',
                  as: 'state_data',
                }
              },
              {
                $lookup:
                {
                  from: 'cities',
                  localField: 'cities',
                  foreignField: '_id',
                  as: 'city_data',
                }
              },
              {
                "$project":
                {
                  _id: 0,
                  fullName: 1,
                  email: 1,
                  username: 1,
                  avatar:
                  {
                    mediaBasePath: "$mediaBasePath",
                    mediaUri: "$mediaUri",
                    mediaType: "$mediaType",
                    mediaEndpoint: "$mediaEndpoint",
                  },
                  jenis: 1,
                  age: 1,
                  gender: 1,
                  state:
                  {
                    "$ifNull":
                      [
                        {
                          "$arrayElemAt":
                            [
                              "$state_data.stateName", 0
                            ]
                        },
                        null
                      ]
                  },
                  city:
                  {
                    "$ifNull":
                      [
                        {
                          "$arrayElemAt":
                            [
                              "$city_data.cityName", 0
                            ]
                        },
                        null
                      ]
                  },
                }
              }
            ]
        }
      },
      {
        "$unwind":
        {
          path: "$basic_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$project":
        {
          _id: 1,
          email: 1,
          status: 1,
          createdAt: 1,
          fullName: "$basic_data.fullName",
          username: "$basic_data.username",
          avatar: "$basic_data.avatar",
          jenis: "$basic_data.jenis",
          age: "$basic_data.age",
          gender: "$basic_data.gender",
          state: "$basic_data.state",
          city: "$basic_data.city"
        }
      }
    );

    var firstmatch = [];
    if (fullname != null) {
      firstmatch.push(
        {
          "fullName":
          {
            "$regex": fullname,
            "$options": "i"
          }
        }
      );
    }

    if (jeniskelamin != null) {
      firstmatch.push(
        {
          "gender":
          {
            "$in": jeniskelamin
          }
        }
      );
    }

    if (startage != null) {
      firstmatch.push(
        {
          "age":
          {
            "$gte": startage
          }
        },
        {
          "age":
          {
            "$lte": endage
          }
        }
      )
    }

    if (lokasi != null) {
      firstmatch.push(
        {
          "state":
          {
            "$in": lokasi
          }
        }
      );
    }

    if (jenisakun != null) {
      firstmatch.push(
        {
          "jenis":
          {
            "$in": jenisakun
          }
        }
      );
    }

    if (statuskirim != null) {
      firstmatch.push(
        {
          "status":
          {
            "$in": statuskirim
          }
        }
      );
    }

    if (firstmatch.length != 0) {
      pipeline.push(
        {
          "$match":
          {
            "$and": firstmatch
          }
        }
      );
    }

    if (ascending != null) {
      var setsorting = null;
      if (ascending == true) {
        setsorting = 1;
      }
      else {
        setsorting = -1;
      }

      pipeline.push(
        {
          "$sort":
          {
            "fullName": setsorting
          }
        }
      );
    }

    if (page > 0) {
      pipeline.push(
        {
          "$skip": (page * limit)
        }
      );
    }

    if (limit > 0) {
      pipeline.push(
        {
          "$limit": limit
        }
      );
    }

    var query = await this.NotificationsModel.aggregate(pipeline);

    return query;
  }
}
