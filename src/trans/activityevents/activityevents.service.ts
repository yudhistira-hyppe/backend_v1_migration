import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateActivityeventsDto } from './dto/create-activityevents.dto';
import { Activityevents, ActivityeventsDocument } from './schemas/activityevents.schema';
@Injectable()
export class ActivityeventsService {
  constructor(
    @InjectModel(Activityevents.name, 'SERVER_FULL')
    private readonly activityeventsModel: Model<ActivityeventsDocument>,
  ) { }

  async create(
    CreateActivityeventsDto: CreateActivityeventsDto,
  ): Promise<Activityevents> {
    const createActivityeventsDto = await this.activityeventsModel.create(
      CreateActivityeventsDto,
    );
    return createActivityeventsDto;
  }

  async findAll(): Promise<Activityevents[]> {
    return this.activityeventsModel.find().exec();
  }

  async findevent(email: string): Promise<Object> {
    return this.activityeventsModel
      .find({
        'payload.email': email,
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();
  }

  async findOne(id: string): Promise<Activityevents> {
    return this.activityeventsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.activityeventsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async LogActivitas(year: number): Promise<Object> {
    var currentTime = new Date();
    var year_param = 0;
    if (year != undefined) {
      year_param = year;
    } else {
      year_param = currentTime.getFullYear();
    }
    const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var GetCount = this.activityeventsModel
      .aggregate([
        {
          $sort: { createdAt: 1 },
        },
        {
          $project: {
            activityType_repo: '$activityType',
            createdAt_repo: '$createdAt',
            month_repo: { $toInt: { $substrCP: ['$createdAt', 5, 2] } },
            month_name_repo: {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: [
                    { $toInt: { $substrCP: ['$createdAt', 5, 2] } },
                    1,
                  ],
                },
              ],
            },
            YearcreatedAt_repo: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
            year_param_repo: { $toInt: year_param.toString() },
          },
        },
        {
          $group: {
            _id: {
              month_group: '$month_repo',
              activityType_group: '$activityType_repo',
            },
            activityType_Count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.month_group',
            log: {
              $push: {
                activityType: '$_id.activityType_group',
                count: '$activityType_Count',
              },
            },
            count: { $sum: '$activityType_Count' },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            month_name: {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: ['$_id', 1],
                },
              ],
            },
            log: '$log',
          },
        },
        // {
        //   $group: {
        //     _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
        //     count: { $sum: 1 },
        //   },
        // },
      ])
      .exec();
    return GetCount;
  }

  async findParent(
    email: string,
    login_device: string,
    activityType: string,
    flowIsDone_: boolean,
  ): Promise<Object> {
    return this.activityeventsModel
      .find({
        'payload.email': email,
        'payload.login_device': login_device,
        activityType: activityType,
        parentActivityEventID: { $eq: null },
        flowIsDone: flowIsDone_,
      })
      .exec();
  }

  async findParentWitoutDevice(
    email: string,
    activityType: string,
    flowIsDone_: boolean,
  ): Promise<Object> {
    return this.activityeventsModel
      .find({
        'payload.email': email,
        activityType: activityType,
        parentActivityEventID: { $eq: null },
        flowIsDone: flowIsDone_,
      })
      .exec();
  }

  async findbyactivityEventID(
    email: string,
    activityEventID: string,
    activityType: string,
    flowIsDone_: boolean,
  ): Promise<Object> {
    return this.activityeventsModel
      .find({
        'payload.email': email,
        activityType: activityType,
        activityEventID: activityEventID,
        flowIsDone: flowIsDone_,
      })
      .exec();
  }

  async updateFlowDone(parentActivityEventID: string) {
    this.activityeventsModel.updateMany(
      {
        parentActivityEventID: parentActivityEventID,
      },
      {
        flowIsDone: true,
      }, function (err, docs) {
        if (err) {
        } else {
        }
      }
    );
    this.activityeventsModel.updateOne(
      {
        activityEventID: parentActivityEventID,
      },
      {
        flowIsDone: true,
      },
      function (err, docs) {
        if (err) {
        } else {
        }
      },
    );
  }

  async update(param: Object, data: Object) {
    this.activityeventsModel.updateOne(param, data, function (err, docs) {
      if (err) {
      } else {
      }
    });
  }

  async findevents() {
    const query = await this.activityeventsModel.aggregate([
      {
        "$group": {
          "_id": "$payload.email",
          "timeAt": {
            "$last": "$createdAt"
          },
          "event": {
            "$last": "$event"
          },
          "eventipe": {
            "$last": "$event"
          },
          "email": {
            "$last": "$payload.email"
          }
        }
      },
      {
        "$match": {
          "event": "AWAKE"
        }
      }

    ]);

    return query;

  }

  async filteruser(username: string, regender: any[], jenis: any[], lokasi: [], startage: number, endage: number, startdate: string, enddate: string, startlogin: string, endlogin: string, page: number, limit: number, descending: any, type: string, statuscreator: any[]) {

    var arrlokasi = [];
    var idlokasi = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lenglokasi = null;
    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    try {
      lenglokasi = lokasi.length;
    } catch (e) {
      lenglokasi = 0;
    }
    if (lenglokasi > 0) {

      for (let i = 0; i < lenglokasi; i++) {
        let idkat = lokasi[i];
        idlokasi = mongoose.Types.ObjectId(idkat);
        arrlokasi.push(idlokasi);
      }
    }

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var dt = dateend.substring(0, 10);
    try {
      var currentdatelogin = new Date(new Date(endlogin).setDate(new Date(endlogin).getDate() + 1));

      var dateendlogin = currentdatelogin.toISOString();
    } catch (e) {
      dateendlogin = "";
    }
    var dtlogin = dateendlogin.substring(0, 10);
    var pipeline = [];

    if (type != undefined && type == "ALL") {


    } else {
      pipeline.push({
        $match:
        {
          "event": "LOGIN"
        }
      },);
    }

    pipeline.push(

      {
        $group: {
          _id: "$payload.email",
          createAt: {
            $last: "$createdAt"
          }
        }
      },
      {
        $project: {
          createdAt: "$createAt",
          email: "$_id",
        }
      },
      {
        $sort: {
          "createdAt": - 1
        }
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'email',
          foreignField: 'email',
          as: 'user',

        },

      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'user.profilePict.$id',
          foreignField: '_id',
          as: 'avatar',

        },

      },
      {
        $lookup: {
          from: 'countries',
          localField: 'user.countries.$id',
          foreignField: '_id',
          as: 'countries',

        },

      },
      {
        $lookup: {
          from: 'cities',
          localField: 'user.cities.$id',
          foreignField: '_id',
          as: 'cities',

        },

      },
      {
        $lookup: {
          from: 'areas',
          localField: 'user.states.$id',
          foreignField: '_id',
          as: 'areas_data',

        },

      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'email',
          foreignField: 'email',
          as: 'userName',

        },

      },
      {
        $set: {
          age: {
            $cond: {
              if: {
                $and: [{ $arrayElemAt: ["$user.dob", 0] }, {
                  $ne: [{ $arrayElemAt: ["$user.dob", 0] }, ""]
                }]
              },
              then: {
                $toInt: {
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: { $arrayElemAt: ["$user.dob", 0] }
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }
              },
              else: 0
            }
          },
        }
      },
      {
        $project: {
          iduser: { $arrayElemAt: ["$user._id", 0] },
          jenis: {
            $cond: {
              if: {

                $eq: [{
                  $arrayElemAt: ["$user.isIdVerified", 0]
                }, true]
              },
              then: "PREMIUM",
              else: "BASIC"
            },

          },
          age: 1,
          email: 1,
          createdAt: { $arrayElemAt: ["$user.createdAt", 0] },
          fullName: { $arrayElemAt: ["$user.fullName", 0] },
          gender: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, ' FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Perempuan']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Wanita']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, ' MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Laki-laki']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Pria']
                  },
                  then: 'MALE',

                },

              ],
              default: "OTHER",

            },

          },
          creator: {
            "$ifNull":
              [
                { $arrayElemAt: ["$user.creator", 0] },
                false
              ]
          },
          username: {
            $arrayElemAt: ["$userName.username", 0]
          },
          role: {
            $arrayElemAt: ["$userName.roles", 0]
          },
          countries: {
            $arrayElemAt: ["$countries.country", 0]
          },
          cities: {
            $arrayElemAt: ["$cities.cityName", 0]
          },
          areas: {
            $arrayElemAt: ["$areas_data.stateName", 0]
          },
          areasId: {
            $arrayElemAt: ["$areas_data._id", 0]
          },
          avatar: {
            mediaBasePath: {
              $arrayElemAt: ['$avatar.mediaBasePath', 0]
            },
            mediaUri: {
              $arrayElemAt: ['$avatar.mediaUri', 0]
            },
            mediaType: {
              $arrayElemAt: ['$avatar.mediaType', 0]
            },
            // mediaEndpoint:
            // {
            //   $concat: [
            //     '/profilepict/',
            //     {
            //       $replaceOne: {
            //         input: {
            //           $arrayElemAt: ["$avatar.mediaUri", 0]
            //         },
            //         find: "_0001.jpeg",
            //         replacement: ""
            //       }
            //     },

            //   ]
            // },
            mediaEndpoint: {
              "$concat": ["/profilepict/", {
                $arrayElemAt: ['$avatar.mediaID', 0]
              },]
            },
          },
          lastlogin: "$createdAt",
          urluserBadge:
          {
            "$ifNull":
              [
                {
                  "$filter":
                  {
                    input:
                    {
                      $arrayElemAt:
                        [
                          "$user.userBadge", 0
                        ]
                    },
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
      },
      {
        $project: {
          iduser: 1,
          jenis: 1,
          age: 1,
          email: 1,
          createdAt: 1,
          fullName: 1,
          gender: 1,
          username: 1,
          creator: 1,
          role: 1,
          countries: 1,
          cities: 1,
          areas: 1,
          areasId: 1,
          avatar: 1,
          lastlogin: 1,
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
              ]
          },
        }
      },
      {
        $sort: {
          lastlogin: order
        }
      },
    );

    if (username && username !== undefined) {

      pipeline.push({
        $match: {
          $or: [
            {
              username: {
                $regex: username,
                $options: 'i'
              },

            },
            {
              email: {
                $regex: username,
                $options: 'i'
              },

            },
          ]
        }
      });

    }

    if (regender && regender !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              gender: {
                $in: regender
              }
            },

          ]
        }
      },);
    }

    if (startage && startage !== undefined) {
      pipeline.push({ $match: { age: { $gt: startage } } });
    }
    if (endage && endage !== undefined) {
      pipeline.push({ $match: { age: { $lt: endage } } });
    }

    if (startdate && startdate !== undefined) {
      var convertstart = startdate.split(" ")[0];
      pipeline.push({ $match: { createdAt: { $gte: convertstart } } });
    }
    if (enddate && enddate !== undefined) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
        var dateend = currentdate.toISOString().split("T")[0];
      } catch (e) {
        dateend = enddate.substring(0, 10);
      }
      pipeline.push({ $match: { createdAt: { $lt: dateend } } });
    }

    if (jenis && jenis !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              jenis: {
                $in: jenis
              }
            },

          ]
        }
      },);
    }

    if (statuscreator && statuscreator !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              creator: {
                $in: statuscreator
              }
            },

          ]
        }
      },);
    }

    if (lokasi && lokasi !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              areasId: {
                $in: arrlokasi
              }
            },

          ]
        }
      },);
    }

    if (startlogin && startlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $gte: startlogin } } });
    }
    if (endlogin && endlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $lte: dtlogin } } });
    }

    if (type != undefined && type == "ALL") {


    } else {
      if (page > 0) {
        pipeline.push({ $skip: (page * limit) });
      }
      if (limit > 0) {
        pipeline.push({ $limit: limit });
      }
    }

    let query = await this.activityeventsModel.aggregate(pipeline);

    return query;

  }

  async filteruser2(username: string, regender: any[], jenis: any[], lokasi: [], startage: number, endage: number, startdate: string, enddate: string, startlogin: string, endlogin: string, page: number, limit: number, descending: any, type: string, listcreator: any[]) {

    var arrlokasi = [];
    var idlokasi = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lenglokasi = null;
    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    try {
      lenglokasi = lokasi.length;
    } catch (e) {
      lenglokasi = 0;
    }
    if (lenglokasi > 0) {

      for (let i = 0; i < lenglokasi; i++) {
        let idkat = lokasi[i];
        idlokasi = mongoose.Types.ObjectId(idkat);
        arrlokasi.push(idlokasi);
      }
    }

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var dt = dateend.substring(0, 10);
    try {
      var currentdatelogin = new Date(new Date(endlogin).setDate(new Date(endlogin).getDate() + 1));

      var dateendlogin = currentdatelogin.toISOString();
    } catch (e) {
      dateendlogin = "";
    }
    var dtlogin = dateendlogin.substring(0, 10);
    var pipeline = [];

    if (type != undefined && type == "ALL") {


    } else {
      pipeline.push({
        $match:
        {
          "$or":
            [
              {
                "event": "LOGIN"
              },
              {
                "event": "LOGIN_GUEST"
              }
            ]
        }
      },);
    }

    pipeline.push(

      {
        $group: {
          _id: "$payload.email",
          createAt: {
            $last: "$createdAt"
          }
        }
      },
      {
        $project: {
          createdAt: "$createAt",
          email: "$_id",
        }
      },
      {
        $sort: {
          "createdAt": - 1
        }
      },
      {
        '$lookup':
        {
          from: 'newUserBasics',
          localField: 'email',
          foreignField: 'email',
          as: 'user'
        }
      },
      {
        '$set': {
          age: {
            '$cond': {
              if: {
                '$and':
                  [
                    {
                      '$arrayElemAt':
                        [
                          '$user.dob', 0
                        ]
                    },
                    {
                      '$ne':
                        [
                          {
                            '$arrayElemAt':
                              [
                                '$user.dob', 0
                              ]
                          },
                          ''
                        ]
                    }
                  ]
              },
              then: {
                '$toInt': {
                  '$divide':
                    [
                      {
                        '$subtract':
                          [
                            new Date(),
                            {
                              '$toDate':
                              {
                                '$arrayElemAt':
                                  [
                                    '$user.dob', 0
                                  ]
                              }
                            }
                          ]
                      },
                      31536000000
                    ]
                }
              },
              else: 0
            }
          }
        }
      },
      {
        '$project':
        {
          iduser:
          {
            '$arrayElemAt':
              [
                '$user._id', 0
              ]
          },
          jenis:
          {
            "$switch":
            {
              branches:
                [
                  {
                    case:
                    {
                      "$eq":
                        [
                          {
                            "$arrayElemAt":
                              [
                                "$user.guestMode", 0
                              ]
                          },
                          true
                        ]
                    },
                    then: "GUEST"
                  },
                  {
                    case:
                    {
                      '$eq':
                        [
                          {
                            '$arrayElemAt':
                              [
                                '$user.isIdVerified', 0
                              ]
                          },
                          true
                        ]
                    },
                    then: "PREMIUM"
                  },
                ],
              default: "BASIC"
            }
          },
          age: 1,
          email: 1,
          createdAt:
          {
            '$arrayElemAt':
              [
                '$user.createdAt', 0
              ]
          },
          fullName:
          {
            '$arrayElemAt':
              [
                '$user.fullName', 0
              ]
          },
          gender:
          {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, ' FEMALE']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Perempuan']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Wanita']
                  },
                  then: 'FEMALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, ' MALE']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Laki-laki']
                  },
                  then: 'MALE',

                },
                {
                  case: {
                    $eq: [{ $arrayElemAt: ["$user.gender", 0] }, 'Pria']
                  },
                  then: 'MALE',

                },

              ],
              default: "OTHER",

            },
          },
          username:
          {
            '$arrayElemAt':
              [
                '$user.username', 0
              ]
          },
          role:
          {
            '$arrayElemAt':
              [
                '$user.roles', 0
              ]
          },
          countries:
          {
            '$arrayElemAt':
              [
                '$user.countriesName', 0
              ]
          },
          cities:
          {
            '$arrayElemAt':
              [
                '$user.citiesName', 0
              ]
          },
          areas:
          {
            '$arrayElemAt':
              [
                '$user.statesName', 0
              ]
          },
          areasId:
          {
            '$arrayElemAt':
              [
                '$user.states.$id', 0
              ]
          },
          avatar:
          {
            mediaBasePath:
            {
              "$ifNull":
                [
                  { '$arrayElemAt': ['$user.mediaBasePath', 0] },
                  null
                ]
            },
            mediaUri:
            {
              "$ifNull":
                [
                  { '$arrayElemAt': ['$user.mediaUri', 0] },
                  null
                ]
            },
            mediaType:
            {
              "$ifNull":
                [
                  { '$arrayElemAt': ['$user.mediaType', 0] },
                  null
                ]
            },
            mediaEndpoint:
            {
              "$ifNull":
                [
                  { '$arrayElemAt': ['$user.mediaEndpoint', 0] },
                  null
                ]
            },
          },
          lastlogin: '$createdAt',
          creator:
          {
            "$arrayElemAt":
              [
                "$user.creator", 0
              ]
          },
          urluserBadge:
          {
            '$ifNull':
              [
                {
                  '$filter':
                  {
                    input: { '$arrayElemAt': ['$user.userBadge', 0] },
                    as: 'listbadge',
                    cond:
                    {
                      '$and':
                        [
                          {
                            '$eq':
                              [
                                '$$listbadge.isActive', true
                              ]
                          },
                          {
                            '$lte':
                              [
                                {
                                  '$dateToString':
                                  {
                                    format: '%Y-%m-%d %H:%M:%S',
                                    date:
                                    {
                                      '$add':
                                        [
                                          new Date(), 25200000
                                        ]
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
                []
              ]
          }
        }
      },
      {
        '$project':
        {
          iduser: 1,
          jenis: 1,
          age: 1,
          email: 1,
          createdAt: 1,
          fullName: 1,
          gender: 1,
          username: 1,
          role: 1,
          countries: 1,
          cities: 1,
          areas: 1,
          areasId: 1,
          avatar: 1,
          lastlogin: 1,
          creator:
          {
            "$ifNull":
              [
                "$creator",
                false
              ]
          },
          urluserBadge:
          {
            '$ifNull':
              [
                {
                  '$arrayElemAt':
                    [
                      '$urluserBadge', 0
                    ]
                },
                null
              ]
          }
        }
      },
      {
        $sort: {
          lastlogin: order
        }
      },
    );

    if (username && username !== undefined) {

      pipeline.push({
        $match: {
          $or: [
            {
              username: {
                $regex: username,
                $options: 'i'
              },
            },
            {
              email: {
                $regex: username,
                $options: 'i'
              },
            }
          ]

        }
      },);

    }

    if (listcreator && listcreator !== undefined) {

      pipeline.push({
        $match: {
          creator: {
            "$in": listcreator
          },

        }
      },);

    }

    if (regender && regender !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              gender: {
                $in: regender
              }
            },

          ]
        }
      },);
    }

    if (startage && startage !== undefined) {
      pipeline.push({ $match: { age: { $gt: startage } } });
    }
    if (endage && endage !== undefined) {
      pipeline.push({ $match: { age: { $lt: endage } } });
    }

    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { $lte: dt } } });
    }

    if (jenis && jenis !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              jenis: {
                $in: jenis
              }
            },

          ]
        }
      },);
    }

    if (lokasi && lokasi !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              areasId: {
                $in: arrlokasi
              }
            },

          ]
        }
      },);
    }

    if (startlogin && startlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $gte: startlogin } } });
    }
    if (endlogin && endlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $lte: dtlogin } } });
    }

    if (type != undefined && type == "ALL") {


    } else {
      if (page > 0) {
        pipeline.push({ $skip: (page * limit) });
      }
      if (limit > 0) {
        pipeline.push({ $limit: limit });
      }
    }

    let query = await this.activityeventsModel.aggregate(pipeline);

    return query;

  }

  async sesipengguna(startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dt = "";
    }
    var query = await this.activityeventsModel.aggregate([
      {
        $project: {
          event: 1,
          createdAt: 1,
          email: "$payload.email"
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                {
                  event: "AWAKE",

                },
                {
                  createdAt:
                  {
                    $gte: startdate,
                    $lte: dt
                  }
                }
              ]
            },
          ]
        }
      },
      {
        $group: {
          _id: {
            tgl: {
              $substrCP: ['$createdAt', 0, 10]
            },
            dt: '$email',

          },

        },

      },
      {
        $project:
        {
          _id: "$kusnur",
          tgl: "$_id.tgl",
          email: "$_id.dt",

        }
      },
      {
        $sort: {
          tgl: 1
        }
      },
      {
        $group:
        {
          _id: "$tgl",
          count:
          {
            $sum: 1
          },
        }
      },
      {
        "$project":
        {
          "_id": 0,
          "date": "$_id",
          "count": 1
        }
      },
      {
        "$sort":
        {
          "date": 1
        }
      }
    ]);
    return query;
  }

  async sesitamu(startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dt = "";
    }
    var query = await this.activityeventsModel.aggregate([
      {
        $project: {
          event: 1,
          createdAt: 1,
          email: /@hyppe.id/i
        }
      },
      {
        $match: {
          $or: [
            {
              $and: [
                {
                  event: "AWAKE",

                },
                {
                  createdAt:
                  {
                    $gte: startdate,
                    $lte: dt
                  }
                }
              ]
            },
          ]
        }
      },
      {
        $group: {
          _id: {
            tgl: {
              $substrCP: ['$createdAt', 0, 10]
            },
            dt: '$email',

          },

        },

      },
      {
        $project:
        {
          _id: "$kusnur",
          tgl: "$_id.tgl",
          email: "$_id.dt",

        }
      },
      {
        $sort: {
          tgl: 1
        }
      },
      {
        $group:
        {
          _id: "$tgl",
          count:
          {
            $sum: 1
          },
        }
      },
      {
        "$project":
        {
          "_id": 0,
          "date": "$_id",
          "count": 1
        }
      },
      {
        "$sort":
        {
          "date": 1
        }
      }
    ]);
    return query;
  }



}
